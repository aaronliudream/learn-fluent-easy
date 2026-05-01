// Browser-side client for the Qwen-Omni Realtime WebSocket endpoint, talking
// through our `qwen-realtime-proxy` edge function (which holds the API key).
//
// Flow:
//  1. Open WS → wait for `session.created`
//  2. Send `session.update` with our system prompt, voice, VAD config
//  3. Capture mic audio → resample to 16 kHz mono Int16 PCM → Base64 → send
//     `input_audio_buffer.append` events continuously.
//  4. Receive:
//      - response.audio.delta (Base64 PCM 24 kHz mono Int16) → enqueue for playback
//      - response.audio_transcript.delta / .done → assistant text
//      - conversation.item.input_audio_transcription.completed → user text

export type QwenEventHandler = (evt: any) => void;

export type QwenSessionConfig = {
  instructions: string;
  voice: string;            // e.g. "Cherry" / "Ethan"
  inputSampleRate: number;  // 16000 — fixed by the model
  outputSampleRate: number; // 24000 — what the model emits
};

// Map our 6 OpenAI voice IDs to Qwen voices. Qwen voices are different
// names; we pick the closest character match.
export const QWEN_VOICE_MAP: Record<string, string> = {
  nova: "Cherry",     // bright young female
  shimmer: "Cherry",
  alloy: "Ethan",     // neutral male
  echo: "Ethan",
  onyx: "Serena",     // mature
  fable: "Chelsie",   // warm storyteller
};

const PROXY_URL = (() => {
  const projectRef = (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) || "";
  // Edge function WSS URL.
  return `wss://${projectRef}.functions.supabase.co/qwen-realtime-proxy`;
})();

// ────────────────────────────────────────────────────────────────────────────
// PCM helpers
// ────────────────────────────────────────────────────────────────────────────

/** Convert a Float32Array (-1..1) to Int16Array little-endian PCM. */
function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** Linear-resample Float32 mono buffer from inRate Hz → outRate Hz. */
function resampleMono(input: Float32Array, inRate: number, outRate: number): Float32Array {
  if (inRate === outRate) return input;
  const ratio = inRate / outRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio;
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, input.length - 1);
    const t = idx - lo;
    out[i] = input[lo] * (1 - t) + input[hi] * t;
  }
  return out;
}

/** Encode an ArrayBuffer / TypedArray's bytes as Base64 (binary-safe). */
export function bytesToBase64(buf: ArrayBufferLike): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[]);
  }
  return btoa(s);
}

/** Decode Base64 → Int16Array (little-endian PCM). */
export function base64ToInt16(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
}

// ────────────────────────────────────────────────────────────────────────────
// PCM playback queue (sequential AudioBuffer scheduling)
// ────────────────────────────────────────────────────────────────────────────

export class PcmPlayer {
  private ctx: AudioContext;
  private nextStart = 0;
  private sampleRate: number;
  private gainNode: GainNode;
  public onActiveChange?: (active: boolean) => void;
  private activeSources = 0;

  constructor(ctx: AudioContext, sampleRate: number) {
    this.ctx = ctx;
    this.sampleRate = sampleRate;
    this.gainNode = ctx.createGain();
    this.gainNode.connect(ctx.destination);
  }

  /** Queue a PCM Int16 chunk for playback at the next available time. */
  enqueue(int16: Int16Array) {
    if (int16.length === 0) return;
    const float = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float[i] = int16[i] / 0x8000;
    const buf = this.ctx.createBuffer(1, float.length, this.sampleRate);
    buf.getChannelData(0).set(float);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.gainNode);
    const now = this.ctx.currentTime;
    const startAt = Math.max(this.nextStart, now);
    src.start(startAt);
    this.nextStart = startAt + buf.duration;
    this.activeSources++;
    if (this.activeSources === 1) this.onActiveChange?.(true);
    src.onended = () => {
      this.activeSources = Math.max(0, this.activeSources - 1);
      if (this.activeSources === 0) this.onActiveChange?.(false);
    };
  }

  /** Flush the queue (e.g. when the model is interrupted). */
  reset() {
    this.nextStart = this.ctx.currentTime;
  }

  close() {
    try { this.gainNode.disconnect(); } catch { /* noop */ }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Main session class
// ────────────────────────────────────────────────────────────────────────────

export class QwenRealtimeSession {
  private ws: WebSocket | null = null;
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null; // fallback
  private player: PcmPlayer | null = null;
  private cfg: QwenSessionConfig;
  private onEvent: QwenEventHandler;
  private onSpeakingChange: (speaking: boolean) => void;
  private onConnected: () => void;
  private onError: (msg: string) => void;
  private muted = false;
  private closed = false;
  private pendingSends: string[] = [];

  constructor(opts: {
    cfg: QwenSessionConfig;
    onEvent: QwenEventHandler;
    onSpeakingChange: (speaking: boolean) => void;
    onConnected: () => void;
    onError: (msg: string) => void;
  }) {
    this.cfg = opts.cfg;
    this.onEvent = opts.onEvent;
    this.onSpeakingChange = opts.onSpeakingChange;
    this.onConnected = opts.onConnected;
    this.onError = opts.onError;
  }

  setMuted(m: boolean) { this.muted = m; }

  async start(stream: MediaStream) {
    this.mediaStream = stream;

    // Audio context — Safari needs explicit sampleRate. Pick 48000 (most
    // browsers default) and resample down to 16 kHz before sending.
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
    this.audioCtx = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    this.player = new PcmPlayer(ctx, this.cfg.outputSampleRate);
    this.player.onActiveChange = (a) => this.onSpeakingChange(a);

    // Open WS.
    this.ws = new WebSocket(`${PROXY_URL}?model=qwen3-omni-flash-realtime`);
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => {
      // Send session config.
      this.send({
        event_id: cryptoId(),
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          voice: this.cfg.voice,
          input_audio_format: "pcm",
          output_audio_format: "pcm",
          instructions: this.cfg.instructions,
          input_audio_transcription: { model: "gummy-realtime-v1" },
          turn_detection: {
            type: "server_vad",
            // Match the calmer settings we use for OpenAI to avoid "AI cuts in".
            threshold: 0.78,
            silence_duration_ms: 1400,
          },
        },
      });
      // Ask the model to greet first.
      this.send({
        event_id: cryptoId(),
        type: "response.create",
        response: { modalities: ["text", "audio"] },
      });
      this.onConnected();
    };

    this.ws.onmessage = (e) => this.handleServerEvent(e.data);
    this.ws.onerror = (e) => {
      console.error("[qwen] ws error", e);
      this.onError("Connection error");
    };
    this.ws.onclose = () => { /* dialog handles teardown */ };

    // Hook up mic capture with AudioWorklet (preferred) or ScriptProcessor (fallback).
    this.sourceNode = ctx.createMediaStreamSource(stream);
    await this.attachCapture(ctx);
  }

  private async attachCapture(ctx: AudioContext) {
    const inRate = ctx.sampleRate; // typically 48000
    const outRate = this.cfg.inputSampleRate; // 16000

    // Try AudioWorklet path first. Falls back to ScriptProcessor if loading
    // fails (e.g. blob CSP).
    try {
      const workletCode = `
        class Capture extends AudioWorkletProcessor {
          process(inputs) {
            const ch = inputs[0]?.[0];
            if (ch && ch.length) {
              this.port.postMessage(ch.slice(0));
            }
            return true;
          }
        }
        registerProcessor('capture', Capture);
      `;
      const url = URL.createObjectURL(new Blob([workletCode], { type: "application/javascript" }));
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(ctx, "capture");
      node.port.onmessage = (e: MessageEvent) => this.onCaptureChunk(e.data as Float32Array, inRate, outRate);
      this.sourceNode!.connect(node);
      // Worklet must be in the graph; route to a muted gain so it actually runs.
      const sink = ctx.createGain();
      sink.gain.value = 0;
      node.connect(sink).connect(ctx.destination);
      this.workletNode = node;
    } catch (err) {
      console.warn("[qwen] AudioWorklet failed, falling back to ScriptProcessor", err);
      const node = ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        this.onCaptureChunk(new Float32Array(data), inRate, outRate);
      };
      this.sourceNode!.connect(node);
      const sink = ctx.createGain();
      sink.gain.value = 0;
      node.connect(sink).connect(ctx.destination);
      this.scriptNode = node;
    }
  }

  private onCaptureChunk(chunk: Float32Array, inRate: number, outRate: number) {
    if (this.muted || this.closed) return;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const resampled = resampleMono(chunk, inRate, outRate);
    const int16 = floatToInt16(resampled);
    const b64 = bytesToBase64(int16.buffer);
    this.send({ event_id: cryptoId(), type: "input_audio_buffer.append", audio: b64 });
  }

  private handleServerEvent(raw: any) {
    let evt: any;
    try {
      evt = typeof raw === "string" ? JSON.parse(raw) : JSON.parse(new TextDecoder().decode(raw));
    } catch (e) {
      console.error("[qwen] bad event", e, raw);
      return;
    }

    // Audio chunk → enqueue for playback.
    if (evt.type === "response.audio.delta" && typeof evt.delta === "string") {
      try {
        const pcm = base64ToInt16(evt.delta);
        this.player?.enqueue(pcm);
      } catch (e) { console.error("[qwen] audio decode err", e); }
    }

    // Interrupt — flush playback queue.
    if (evt.type === "response.cancelled" || evt.type === "input_audio_buffer.speech_started") {
      // Don't drop the current playback on speech_started — Qwen's semantic
      // VAD will only trigger response.cancelled if a real interruption.
    }

    // Forward all events to the dialog so it can update transcript.
    this.onEvent(evt);

    if (evt.type === "error") {
      const msg = evt.error?.message || "Qwen error";
      console.error("[qwen] server error", evt);
      this.onError(msg);
    }
  }

  private send(payload: any) {
    const text = JSON.stringify(payload);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(text); } catch (e) { console.error("[qwen] send err", e); }
    } else {
      this.pendingSends.push(text);
    }
  }

  close() {
    this.closed = true;
    try { this.workletNode?.disconnect(); } catch { /* noop */ }
    try { this.scriptNode?.disconnect(); } catch { /* noop */ }
    try { this.sourceNode?.disconnect(); } catch { /* noop */ }
    try { this.player?.close(); } catch { /* noop */ }
    try { this.ws?.close(); } catch { /* noop */ }
    try { this.audioCtx?.close(); } catch { /* noop */ }
    try { this.mediaStream?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
  }
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "id_" + Math.random().toString(36).slice(2);
}
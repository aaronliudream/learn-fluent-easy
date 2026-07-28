import { prefetchTTS, prefetchTTSBatchKid, speak, speakKid, stopSpeaking, KID_VOICE_ID } from "@/lib/speak";
import { JUNIOR_SPEAK_SPEED } from "./speakSpeeds";
import { splitDialogue, type DialogueSegment } from "./dialogueSplit";

/**
 * 单元通关听力题的**分角色朗读**。
 *
 * 为什么要有它：这批题里 2/3 是对话（"W: … M: …"）。原来整段丢给 hubSpeak，
 * 结果一男一女被同一把嗓子读完。这里按说话人切句、逐句换音色播。
 *
 * ⚠️ 预热与播放**必须走同一套派生**（下面的 `dialogueVoiceOf`），这是小学 C2 与
 * junior WriteStage 都栽过的地方：两边各算一次 voice/speed，差一点就热了一批没人播的 key。
 * 所以本文件只暴露 `speakDialogue` / `prefetchDialogue` 两个入口，组件不要自己拼。
 */

/** 男声。女声沿用 hub 既有音色（KID_VOICE_ID = el:lily），不新增。 */
export const MALE_VOICE = "echo";

/** 听力题恒 0.8（与 hubListen 档一致）。 */
export const DIALOGUE_SPEED = JUNIOR_SPEAK_SPEED.listen;

/**
 * 轮次之间的停顿。取 350ms 的理由：
 * 真人对话换人的自然间隙约 200–500ms；再短会像抢话、听不出换人，再长会显得卡顿。
 * `speakSequence` 的默认 80ms 是给同一个人连读句子用的，换角色偏短。
 */
export const DIALOGUE_GAP_MS = 350;

/** 每一段该用哪个音色/速度 —— 预热与播放的**唯一**来源。 */
export function dialogueVoiceOf(seg: DialogueSegment): { voiceId: string; speed: number } {
  return {
    voiceId: seg.gender === "male" ? MALE_VOICE : KID_VOICE_ID,
    speed: DIALOGUE_SPEED,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 按说话人逐句朗读。不可安全切分（返回 null）时**不播**——这类题本来就不该进抽题池，
 * 真出现说明取数侧漏过滤了，此时宁可静默也不要用错音色读出来。
 */
export async function speakDialogue(raw: string, grade?: number): Promise<void> {
  const segs = splitDialogue(raw);
  if (!segs) return;
  stopSpeaking();
  for (let i = 0; i < segs.length; i++) {
    const { voiceId, speed } = dialogueVoiceOf(segs[i]);
    // 女声走 speakKid（内部就是 KID_VOICE_ID），男声走 speak 指定 voiceId；
    // 两条路最终都进 speak() → fetchTTS，key 的算法完全一样。
    if (voiceId === KID_VOICE_ID) await speakKid(segs[i].text, { grade, speed });
    else await speak(segs[i].text, { voiceId, speed });
    if (i < segs.length - 1) await sleep(DIALOGUE_GAP_MS);
  }
}

/**
 * 预热：与 `speakDialogue` 逐段同 voice/speed。
 * 女声批量走 prefetchTTSBatchKid，男声逐条 prefetchTTS —— 两者最终算的 key 与播放一致。
 */
export function prefetchDialogue(raws: string[], grade?: number): void {
  const female: string[] = [];
  for (const raw of raws) {
    const segs = splitDialogue(raw);
    if (!segs) continue;
    for (const seg of segs) {
      const { voiceId, speed } = dialogueVoiceOf(seg);
      if (voiceId === KID_VOICE_ID) female.push(seg.text);
      else prefetchTTS(seg.text, { voiceId, speed });
    }
  }
  if (female.length) prefetchTTSBatchKid(female, { grade, speed: DIALOGUE_SPEED });
}

/**
 * 听力播放兜底守门人。
 *
 * 背景：`speakFromUrl` 曾经**永不 reject 也不返回成败**，而听力专区写的是
 *   `if (audio_url) speakFromUrl(...) else speak(transcript)`
 * 二选一 —— URL 一旦死掉就是**彻底没声、且没有任何报错**。
 * 初中 473 条 + 高中 636 条听力全靠这个 URL（审计当时实测 636/636 存活，
 * 但链路本身没有兜底，只要哪天掉一条就是静音）。
 *
 * 现在 `speakFromUrl` 返回"是否真的播出来了"，这里钉住三件事：
 *   ① URL 播成 → 不重复走 TTS
 *   ② URL 播不成 → 回落 speak(transcript)
 *   ③ 两条都没得播 → 明确返回 none（不假装播过）
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: Array<{ api: string; arg: string }> = [];
let urlPlays = true;

vi.mock('@/lib/speak', () => ({
  speakFromUrl: (url: string) => { calls.push({ api: 'speakFromUrl', arg: url }); return Promise.resolve(urlPlays); },
  speak: (text: string) => { calls.push({ api: 'speak', arg: text }); return Promise.resolve(); },
}));

const { playListeningAudio } = await import('./playListeningAudio');

const ROW = { audio_url: 'https://audio.example/dead.mp3', transcript: 'Welcome to the listening test.' };

beforeEach(() => { calls.length = 0; urlPlays = true; vi.spyOn(console, 'warn').mockImplementation(() => {}); });

describe('预生成 MP3 能播', () => {
  it('走 URL，不重复合成 TTS', async () => {
    urlPlays = true;
    await expect(playListeningAudio(ROW)).resolves.toBe('url');
    expect(calls.map((c) => c.api)).toEqual(['speakFromUrl']);
  });
});

describe('URL 播不出来 → 回落 TTS（这条以前是彻底没声）', () => {
  it('失效 URL：先试 URL，再用 transcript 走 TTS', async () => {
    urlPlays = false;
    await expect(playListeningAudio(ROW)).resolves.toBe('tts');
    expect(calls).toEqual([
      { api: 'speakFromUrl', arg: ROW.audio_url },
      { api: 'speak', arg: ROW.transcript },
    ]);
  });

  it('回落时留痕（console.warn），不静默', async () => {
    urlPlays = false;
    const spy = vi.spyOn(console, 'warn');
    await playListeningAudio(ROW);
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0][0])).toContain('回落 TTS');
  });

  it('失效 URL 且没有 transcript → none（不假装播过）', async () => {
    urlPlays = false;
    await expect(playListeningAudio({ audio_url: ROW.audio_url, transcript: null })).resolves.toBe('none');
    expect(calls.map((c) => c.api)).toEqual(['speakFromUrl']);
  });
});

describe('本来就没有 URL', () => {
  it('直接走 TTS', async () => {
    await expect(playListeningAudio({ audio_url: null, transcript: 'Hello.' })).resolves.toBe('tts');
    expect(calls).toEqual([{ api: 'speak', arg: 'Hello.' }]);
  });

  it('两条都没有 → none，且一次播放调用都不发', async () => {
    await expect(playListeningAudio({ audio_url: null, transcript: '' })).resolves.toBe('none');
    await expect(playListeningAudio(null)).resolves.toBe('none');
    expect(calls).toHaveLength(0);
  });
});

describe('调用点锚点：页面确实用了兜底函数', () => {
  it('JuniorListeningPlay 不再直接二选一调 speakFromUrl', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.resolve(__dirname, '../../pages/JuniorListeningPlay.tsx'), 'utf8');
    expect(src).toContain('playListeningAudio(e)');
    expect(src).not.toMatch(/speakFromUrl\(e\.audio_url\)/);
  });

  it('ListenWordStage 的 .catch(done) 死代码已去掉，改成按返回值回落', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.resolve(__dirname, '../../components/primaryHub/ListenWordStage.tsx'), 'utf8');
    expect(src).not.toContain('speakFromUrl(audioUrl).then(done).catch(done)');
    expect(src).toMatch(/speakFromUrl\(audioUrl\)\.then\(\(played\)/);
  });

  it('speakFromUrl 的返回类型是 Promise<boolean>（失败可感知）', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.resolve(__dirname, '../speak.ts'), 'utf8');
    expect(src).toMatch(/export const speakFromUrl = \(url: string\): Promise<boolean>/);
  });
});

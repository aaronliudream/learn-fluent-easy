-- ============================================================================
-- 删除一个损坏的 TTS 缓存对象，让 tts edge 下次自动重新合成
-- 背景：小学音频审计 Phase A / 修复 Phase B1.2（docs/audio/AUDIO_AUDIT_REPORT.md §2.1 C1-7）
-- 需要 service_role 权限，CC 侧只有 anon key，删不了 —— 因此交给 Aaron 跑。
--
-- 【为什么判定它损坏】（当次实测，非凭大小猜测）
--   对象：tts-audio / b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3
--   内容：闯关题 fc_g5v1_lcw_02 的朗读词 "funny"（el:lily @ 1.0）
--   HTTP：200 audio/mpeg，Content-Length = 1920
--   逐帧解析 MPEG 帧头：仅 5 帧、总时长 0.120 秒（MPEG2 / 24000Hz / 128kbps）
--   对照同参数的 "ruler"：85 帧、2.040 秒、32640 字节
--   → 1920 字节不是"短词正常体积"，是被截断的近乎空的音频。孩子听到的是"没声音"，
--     但 HTTP 层一切正常，前端 play() 也会"成功"，属于查不出来的哑火。
--   → 该题是五年级闯关「听音选词」第 2 题，每题展示后 250ms 自动播放，必然命中。
--
-- 【删除后会发生什么】
--   tts edge（supabase/functions/tts/index.ts:325 existsInStorage）发现对象不存在
--   → 走合成路径重新生成并 upsert 回同一路径 → 下一个用户即恢复正常。
--   不需要改任何代码、不需要改 schema。
--
-- ⚠️ 跑完还要做一步：CDN 回源缓存
--   上传时带的是 Cache-Control: public, max-age=31536000, immutable（edge :107），
--   audio.bigmooneducation.com 很可能仍握着旧的 1920 字节副本。
--   跑完 SQL 后请在 Cloudflare 控制台对下面这条 URL 做一次 Purge：
--   https://audio.bigmooneducation.com/b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3
--   （不 purge 的话，重新合成的好音频要等 CDN 过期才生效。）
--
-- 【替代做法】Supabase Dashboard → Storage → tts-audio → 进 b1/ 目录 → 删除该文件。
--   走 UI 会同时清理底层对象，比只删元数据行更干净；SQL 版是给批量/自动化留的口子。
-- ============================================================================

BEGIN;

-- 删除前计数（预期 1）
SELECT count(*) AS before_cnt
FROM storage.objects
WHERE bucket_id = 'tts-audio'
  AND name = 'b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3';

DELETE FROM storage.objects
WHERE bucket_id = 'tts-audio'
  AND name = 'b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3';

-- 删除后计数（预期 0）
SELECT count(*) AS after_cnt
FROM storage.objects
WHERE bucket_id = 'tts-audio'
  AND name = 'b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3';

COMMIT;

-- 验收（跑完 + purge 后，任意浏览器/终端）：
--   curl -sI https://audio.bigmooneducation.com/b1/b13ea61fcc29dc2ddf1a18c8050a85c0287bf6a2009f9978a51b35a5eb8b6ff2.mp3
--   第一次可能 400（对象已删、还没人触发合成）；进一次五年级闯关「听音选词」后再查，
--   应为 200 且 Content-Length 明显大于 8000（同类单词正常在 1.5 万~3 万字节）。

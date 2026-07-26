-- ============================================================================
-- 清理 B2 冷路径验证留下的探针对象（可选，纯卫生问题，不影响任何功能）
-- 背景：docs/audio/PHASE_B2_ALIGNMENT_LOG.md Step 3
--   为了验证 tts edge 冷路径（对象不存在 → 真合成 → 立刻可播），
--   用一次性文本 "b2 alignment probe alpha pre-deploy-a" 触发了一次真实合成，
--   于是桶里多了一个没人会播的对象（78720 字节 / 4.92 秒）。
--   它不属于任何教学内容，删掉即可；不删也只是占 77KB。
-- 需要 service_role 权限，CC 侧只有 anon key，故交给 Aaron。
--
-- 另：若 B1.2 的 funny 损坏对象尚未处理，见
--   SQLAA/2026-07-25-删除损坏TTS对象-funny.sql（那条是必须做的，这条是可选的）
-- ============================================================================

BEGIN;

-- 删除前计数（预期 1）
SELECT count(*) AS before_cnt
FROM storage.objects
WHERE bucket_id = 'tts-audio'
  AND name = '86/8651f647cc88fdef5532f8107716d69302a2df6913a084beb0277e0b819a5f76.mp3';

DELETE FROM storage.objects
WHERE bucket_id = 'tts-audio'
  AND name = '86/8651f647cc88fdef5532f8107716d69302a2df6913a084beb0277e0b819a5f76.mp3';

-- 删除后计数（预期 0）
SELECT count(*) AS after_cnt
FROM storage.objects
WHERE bucket_id = 'tts-audio'
  AND name = '86/8651f647cc88fdef5532f8107716d69302a2df6913a084beb0277e0b819a5f76.mp3';

COMMIT;

-- 不需要 purge CDN：这个 URL 除了验证脚本没人访问过，缓存里有没有都无所谓。

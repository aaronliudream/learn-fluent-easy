# 高中人教版必修词表灌库报告

- **来源 PDF**: `C:\Users\willi\OneDrive\Desktop\英语教材\导入CURSOR\高中人教版`
- **教材**: 必修第一册 / 第二册 / 第三册（仅课标词 **DIN-Medium** 黑体）
- **目标表**: `public.gaokao_vocab`（`stage='senior'`，`year_band` 1=高一 … 3=高三）
- **策略**: **追加**（`ON CONFLICT (word, stage) DO NOTHING`），标签 `pep_compulsory` 便于回滚

## 提取统计

| 册别 | 附录页码 (PDF) | 原始提取 | 合并后入库 |
|------|----------------|----------|------------|
| 必修第一册 (B1) | 125–131 | 258 | 199 |
| 必修第二册 (B2) | 114–120 | 262 | 217 |
| 必修第三册 (B3) | 116–123 | 277 | 236 |
| **合计** | | **797** | **652** |

- 跨册重复（保留先出现的册）: 0
- 因小学/初中词表已存在而跳过: **145**

## 产物

| 文件 | 说明 |
|------|------|
| `docs/vocab/senior_pep_ingest_ready.csv` | 灌库用 652 行 |
| `docs/vocab/scripts/extract_senior_pep.py` | PDF 提取脚本 |
| `scripts/generate_senior_pep_ingest_migration.py` | 生成 migration |
| `supabase/migrations/20260518140000_senior_pep_gaokao_vocab_ingest.sql` | 追加灌库 |
| `supabase/migrations/20260518140000_senior_pep_gaokao_vocab_ingest_rollback.sql` | 按标签回滚 |

## 灌库步骤（Supabase）

```bash
# 在项目根目录
supabase db push
# 或在 Supabase SQL Editor 中执行 migration 文件全文
```

执行后可在 SQL Editor 验证：

```sql
SELECT year_band, COUNT(*) 
FROM public.gaokao_vocab 
WHERE tags @> '["pep_compulsory"]'::jsonb 
GROUP BY year_band ORDER BY year_band;
```

## 字段说明

- `year_band` / `gaokao_level`: 1=高一（必修一）, 2=高二, 3=高三
- `freq_rank`: 10001+ 序号（与既有高考词频排序区分）
- `primary_gloss`: 取自释义第一个中文分句（前端展示用）

## 与学习中心 / 家长中心数据一致

灌库后前端已统一词汇统计口径（`src/lib/stageVocabStats.ts`）：

- **分母**：`gaokao_vocab` 实时 `COUNT`（`stage='senior'`）
- **分子**：`unified_mastery` 中 `stage=senior` & `module=vocab`，且 `item_id` 属于词表
- **掌握**：`state='master'`（与 GPS 学习中心一致）
- 家长成就条、ContinueCard、`/dashboard` 与 `/learning-center` 共用同一套计算

## 已知限制

- 音标来自 PDF 私有区编码，部分词条音标为空或需后续人工校对
- 同一词条多词性行在 `meaning_cn` 中可能合并；`primary_gloss` 已取首条中文释义

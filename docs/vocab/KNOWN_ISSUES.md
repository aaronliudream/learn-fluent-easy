# Junior vocab — known issues

- 7B/8B 已人工定版。
- 7A/8A/9 来自 PDF 文字层抽取；2026-05-19 已自动清洗 651 条释义（IPA/页码/英文残留），但**尚未逐单元人工核对**。
- 运行 `python scripts/audit_junior_textlayer.py` 生成 `junior_textlayer_audit_report.md` 跟踪剩余质量问题。
- 7A 词数 397（含 SU1–SU3 过渡单元），是否与教材 Appendix 完全一致仍待 PDF 对照复核。
- 7A/8A/9 的 `source_page` 仍为文字层页码占位（117/132/170），不如 7B/8B 的 `p.N` 精确。
- **掌握度**：`JuniorVocab` 日常练习已并行写入 `junior_word_mastery`（见 `src/lib/juniorWordMastery.ts`）。

# Senior vocab — known issues

- 必修 B1–B3 已提取并 append 至 `gaokao_vocab`（`pep_compulsory` 标签）。
- **选修 / 选择性必修** PDF 尚未放入 `高中人教版` 目录，提取脚本 `extract_senior_pep.py` 暂仅支持必修三册。

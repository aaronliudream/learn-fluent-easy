#!/usr/bin/env python3
"""Parse Suzhou middle-school English exam docx -> JSON for TS generation."""
from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

FILES: dict[int, Path] = {
    2019: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2019年苏州市中考英语试卷.docx"),
    2020: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2020_英语试卷.docx"),
    2021: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2021年苏州市初中模拟英语试卷.docx"),
    2023: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2023苏州中考英语试卷.docx"),
    2024: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2024苏州中考英语试题及答案.docx"),
}

OUT_DIR = Path(__file__).parent / "suzhou-extract"

PART_HEADERS = [
    (re.compile(r"第一部分"), "part1"),
    (re.compile(r"第二部分"), "part2"),
    (re.compile(r"第三部分"), "part3"),
    (re.compile(r"第四部分"), "part4"),
    (re.compile(r"第五部分"), "part5"),
    (re.compile(r"第六部分"), "part6"),
    (re.compile(r"第七部分"), "part7"),
    (re.compile(r"第八部分"), "part8"),
]

MCQ_LINE = re.compile(
    r"^(\d{1,2})\.\s*(.*)$"
)
MCQ_OPTION = re.compile(
    r"^(\d{1,2})\.\s*(?:([A-D])\.\s*)?(.+?)\s+([A-D])\.\s*(.+?)\s+([A-D])\.\s*(.+?)\s+([A-D])\.\s*(.+)$"
)
MCQ_OPTION_SINGLE = re.compile(r"^([A-D])\.\s*(.+)$")
CLOZE_BLANK = re.compile(r"__\s*(\d{1,2})\s*__|▲")
RESTORE_BLANK = re.compile(r"__\s*(\d{1,2})\s*__")
PASSAGE_BLANK = re.compile(r"__\s*(\d{1,2})\s*__|▲")
ANSWER_KEY_START = re.compile(r"参考答案|答案与解析")
ANSWER_LINE = re.compile(r"^(\d{1,2})\.\s*(.+)$")
ANSWER_SECTION = re.compile(r"^第[一二三四五六七八]部分")


def para_text(p: ET.Element) -> str:
    parts: list[str] = []
    for child in p.iter():
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        if tag == "t" and child.text:
            parts.append(child.text)
        elif tag == "tab":
            parts.append("\t")
        elif tag == "br":
            parts.append("\n")
    return "".join(parts).strip()


def cell_texts(tbl: ET.Element) -> list[str]:
    texts: list[str] = []
    for p in tbl.findall(".//w:p", NS):
        t = para_text(p)
        if t:
            texts.append(t)
    return texts


def docx_blocks(path: Path) -> list[tuple[str, str]]:
    """Return ordered blocks: ('p', text) or ('tbl', joined_cell_text)."""
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    body = root.find("w:body", NS)
    blocks: list[tuple[str, str]] = []
    for child in body:
        tag = child.tag.split("}")[-1]
        if tag == "p":
            t = para_text(child)
            if t:
                blocks.append(("p", t))
        elif tag == "tbl":
            cells = cell_texts(child)
            if cells:
                blocks.append(("tbl", "\n".join(cells)))
    return blocks


def all_lines(path: Path) -> list[str]:
    lines: list[str] = []
    for kind, text in docx_blocks(path):
        if kind == "tbl":
            for part in text.split("\n"):
                part = part.strip()
                if part:
                    lines.append(part)
        else:
            for part in text.split("\n"):
                part = part.strip()
                if part:
                    lines.append(part)
    return lines


def detect_format(lines: list[str]) -> str:
    text = "\n".join(lines[:40])
    if "单项填空" in text:
        return "legacy8"
    if "完形填空" in text:
        return "modern7"
    return "unknown"


def parse_answer_key(lines: list[str]) -> dict[int, str]:
    answers: dict[int, str] = {}
    in_key = False
    for line in lines:
        if ANSWER_KEY_START.search(line):
            in_key = True
            continue
        if not in_key:
            continue
        if line.startswith("Title:") or line.startswith("After reading"):
            break
        # compact answers: "1. B    2. C    3. A"
        for num_s, ans in re.findall(r"(\d{1,2})\.\s*([^0-9\n]+?)(?=\s+\d{1,2}\.\s*|$)", line):
            answers[int(num_s)] = ans.strip().rstrip("/").strip()
        m = ANSWER_LINE.match(line)
        if m and not ANSWER_SECTION.match(line):
            num, ans = int(m.group(1)), m.group(2).strip()
            if num <= 60:
                answers[num] = ans
    return answers


def parse_mcq_options_from_lines(lines: list[str], qnum: int) -> tuple[str, dict[str, str]] | None:
    """Find question qnum stem + ABCD options in following lines."""
    stem = ""
    opts: dict[str, str] = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(rf"^{qnum}\.\s*(.*)$", line)
        if m:
            rest = m.group(1).strip()
            # all 4 on one line
            om = MCQ_OPTION.match(line)
            if om:
                first_letter = om.group(2)
                first_text = om.group(3).strip()
                if first_letter:
                    opts[first_letter] = first_text
                    pairs = [(om.group(4), om.group(5)), (om.group(6), om.group(7)), (om.group(8), om.group(9))]
                else:
                    # "11. A. bad B. hot ..." where A is in group 4
                    pairs = [(om.group(4), om.group(5)), (om.group(6), om.group(7)), (om.group(8), om.group(9))]
                    if re.match(r"^[A-D]\.", first_text):
                        sm = MCQ_OPTION_SINGLE.match(first_text)
                        if sm:
                            opts[sm.group(1)] = sm.group(2).strip()
                            pairs = pairs
                    else:
                        stem = first_text
                for letter, text in pairs:
                    if letter and text:
                        opts[letter.strip()] = text.strip()
                return stem, opts
            if rest and not MCQ_OPTION_SINGLE.match(rest):
                stem = rest
            elif rest:
                sm = MCQ_OPTION_SINGLE.match(rest)
                if sm:
                    opts[sm.group(1)] = sm.group(2).strip()
            j = i + 1
            while j < len(lines) and len(opts) < 4:
                nxt = lines[j]
                if re.match(r"^\d+\.", nxt) and not nxt.startswith(f"{qnum}."):
                    break
                om2 = MCQ_OPTION.match(nxt)
                if om2 and int(om2.group(1)) == qnum:
                    first_letter = om2.group(2)
                    first_text = om2.group(3).strip()
                    if first_letter:
                        opts[first_letter] = first_text
                    pairs = [(om2.group(4), om2.group(5)), (om2.group(6), om2.group(7)), (om2.group(8), om2.group(9))]
                    for letter, text in pairs:
                        if letter and text:
                            opts[letter.strip()] = text.strip()
                    j += 1
                    continue
                for part in re.split(r"\s{2,}|\t", nxt):
                    part = part.strip()
                    sm = MCQ_OPTION_SINGLE.match(part)
                    if sm:
                        opts[sm.group(1)] = sm.group(2).strip()
                if not opts:
                    combined = MCQ_OPTION.match(nxt)
                    if combined and int(combined.group(1)) == qnum:
                        first_letter = combined.group(2)
                        if first_letter:
                            opts[first_letter] = combined.group(3).strip()
                        for letter, text in [
                            (combined.group(4), combined.group(5)),
                            (combined.group(6), combined.group(7)),
                            (combined.group(8), combined.group(9)),
                        ]:
                            if letter and text:
                                opts[letter.strip()] = text.strip()
                j += 1
            if len(opts) >= 4:
                return stem, opts
            return stem or f"Question {qnum}", opts
        i += 1
    return None


def extract_section(lines: list[str], start_pat: str, end_pats: list[str]) -> list[str]:
    start = None
    for i, line in enumerate(lines):
        if start_pat in line:
            start = i + 1
            break
    if start is None:
        return []
    end = len(lines)
    for i in range(start, len(lines)):
        for ep in end_pats:
            if ep in lines[i] and i > start:
                end = i
                break
        if end < len(lines):
            break
    return lines[start:end]


def normalize_passage_blanks(text: str) -> str:
    text = re.sub(r"__\s*(\d{1,2})\s*__", r"__\1__", text)
    text = re.sub(r"▲", lambda m: "__BLANK__", text)
    return text


def parse_restore_options(section_lines: list[str]) -> dict[str, str]:
    opts: dict[str, str] = {}
    in_opts = False
    for line in section_lines:
        if line.startswith("选项") or line.startswith("选项："):
            in_opts = True
            continue
        if in_opts:
            m = re.match(r"^([A-G])\.\s*(.+)$", line)
            if m:
                opts[m.group(1)] = m.group(2).strip()
            elif re.match(r"^第", line):
                break
    return opts


def parse_word_bank(section_lines: list[str]) -> list[str]:
    for i, line in enumerate(section_lines):
        if "方框" in line or "选词填空" in line:
            # next lines before passage often have words
            bank: list[str] = []
            for j in range(i + 1, min(i + 8, len(section_lines))):
                if re.search(r"__\d+__", section_lines[j]) or re.match(r"^\d+\.", section_lines[j]):
                    break
                words = re.findall(r"[a-zA-Z][a-zA-Z\s\-']+", section_lines[j])
                if words and len(section_lines[j]) < 120:
                    bank.extend(w.strip() for w in re.split(r"[\s/、]+", section_lines[j]) if w.strip() and w.strip().isascii())
            if bank:
                return bank
    # inline brackets
    for line in section_lines:
        m = re.search(r"[【\[]([^\]】]+)[\]】]", line)
        if m:
            return [w.strip() for w in re.split(r"[,，/\s]+", m.group(1)) if w.strip()]
    return []


def basic_explanation(qnum: int, answer: str, section: str) -> str:
    return f"第 {qnum} 题考查{section}相关知识点。正确答案：{answer}。"


def build_exam(year: int, path: Path) -> dict[str, Any]:
    lines = all_lines(path)
    fmt = detect_format(lines)
    answers = parse_answer_key(lines)
    # trim answer key from content lines
    content_end = len(lines)
    for i, line in enumerate(lines):
        if ANSWER_KEY_START.search(line):
            content_end = i
            break
    content = lines[:content_end]

    exam: dict[str, Any] = {
        "id": f"suzhou-{year}",
        "year": year,
        "format": fmt,
        "title": "",
        "passages": {},
        "resources": {},
        "questions": [],
        "reading_blocks": [],
    }

    for line in content[:5]:
        if "苏州" in line and ("试卷" in line or "考试" in line):
            exam["title"] = line.replace("英", "英语").replace("  语", "试卷").strip()
            break
    if not exam["title"]:
        exam["title"] = f"{year} 年苏州市初中学业水平考试英语试卷"

    questions: list[dict[str, Any]] = []

    if fmt == "modern7":
        # Part1 cloze 1-10
        cloze_sec = extract_section(content, "第一部分", ["第二部分"])
        cloze_passage_lines = []
        cloze_q_start = None
        for i, line in enumerate(cloze_sec):
            if re.match(r"^1\.\s*[A-D]\.", line) or (re.match(r"^1\.", line) and "A." in line):
                cloze_q_start = i
                break
            if "__" in line or "When " in line or "The " in line or line[0].isupper():
                cloze_passage_lines.append(line)
        cloze_text = normalize_passage_blanks("\n\n".join(cloze_passage_lines))
        cloze_text = re.sub(r"__BLANK__", "__N__", cloze_text)
        for n in range(1, 11):
            cloze_text = cloze_text.replace(f"__{n}__", f"__{n}__")
        exam["passages"]["cloze"] = cloze_text

        for n in range(1, 11):
            parsed = parse_mcq_options_from_lines(cloze_sec[cloze_q_start:] if cloze_q_start else cloze_sec, n)
            ans = answers.get(n, "")
            if parsed:
                stem, opts = parsed
            else:
                stem, opts = "", {}
            questions.append({
                "id": f"q{n}", "type": "multiple_choice", "section": "cloze",
                "stem": stem, "options": opts, "answer": ans[:1].upper() if len(ans)==1 else ans,
                "explanation": basic_explanation(n, ans, "完形填空"),
                "knowledge_point": "完形填空",
            })

        # Reading 11-25
        read_sec = extract_section(content, "第二部分", ["第三部分"])
        passage_labels = ["A", "B", "C", "D"]
        current_label = None
        passage_buf: list[str] = []
        read_blocks = []
        if fmt == "modern7":
            if year >= 2022:
                read_blocks = [
                    {"label": "A", "from": 11, "to": 13, "kind": "passage", "passageKey": "reading_A"},
                    {"label": "B", "from": 14, "to": 17, "kind": "passage", "passageKey": "reading_B"},
                    {"label": "C", "from": 18, "to": 21, "kind": "passage", "passageKey": "reading_C"},
                    {"label": "D", "from": 22, "to": 25, "kind": "passage", "passageKey": "reading_D"},
                ]
            else:
                read_blocks = [
                    {"label": "A", "from": 11, "to": 13, "kind": "passage", "passageKey": "reading_A"},
                    {"label": "B", "from": 14, "to": 17, "kind": "passage", "passageKey": "reading_B"},
                    {"label": "C", "from": 18, "to": 21, "kind": "passage", "passageKey": "reading_C"},
                    {"label": "D", "from": 22, "to": 25, "kind": "passage", "passageKey": "reading_D"},
                ]
        exam["reading_blocks"] = read_blocks

        # split reading by passage headers A/B/C/D alone on line
        passages_text: dict[str, list[str]] = {(b.get("passageKey") or f"reading_{b['label']}"): [] for b in read_blocks}
        q_stems: dict[int, str] = {}
        pi = 0
        for line in read_sec:
            if line in passage_labels:
                current_label = line
                pi = passage_labels.index(line)
                continue
            if re.match(r"^1[1-9]\.|^2[0-5]\.", line):
                m = re.match(r"^(\d{1,2})\.\s*(.*)$", line)
                if m:
                    q_stems[int(m.group(1))] = m.group(2).strip()
                continue
            if current_label is not None:
                key = read_blocks[pi].get("passageKey") or f"reading_{read_blocks[pi]['label']}"
                passages_text[key].append(line)

        for b in read_blocks:
            pk = b.get("passageKey") or f"reading_{b['label']}"
            exam["passages"][pk] = "\n\n".join(passages_text[pk])

        for n in range(11, 26):
            parsed = parse_mcq_options_from_lines(read_sec, n)
            ans = answers.get(n, "")
            stem = q_stems.get(n, "")
            opts = {}
            if parsed:
                stem, opts = parsed
            if not opts and stem:
                # options might only be in answer doc - leave empty, fill from tables later
                pass
            questions.append({
                "id": f"q{n}", "type": "multiple_choice", "section": "reading",
                "stem": stem or f"Question {n}",
                "options": opts,
                "answer": ans[:1].upper() if len(ans)==1 else ans,
                "explanation": basic_explanation(n, ans, "阅读理解"),
                "knowledge_point": "阅读理解",
            })

        # Restore 26-30
        restore_sec = extract_section(content, "第三部分", ["第四部分"])
        restore_lines = [l for l in restore_sec if not l.startswith("选项")]
        restore_passage = []
        for line in restore_lines:
            if re.match(r"^[A-G]\.", line):
                break
            if not re.match(r"^2[6-9]\.|^30\.", line):
                restore_passage.append(line)
        exam["passages"]["restore"] = normalize_passage_blanks("\n\n".join(restore_passage))
        restore_opts = parse_restore_options(restore_sec)
        if not restore_opts:
            for line in restore_sec:
                m = re.match(r"^([A-G])\.\s*(.+)$", line)
                if m:
                    restore_opts[m.group(1)] = m.group(2).strip()
        exam["resources"]["restore_options"] = restore_opts
        for n in range(26, 31):
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "letter_choice", "section": "restore",
                "stem": "", "answer": ans[:1].upper() if ans else "",
                "explanation": basic_explanation(n, ans, "信息还原"),
                "knowledge_point": "信息还原",
            })

        # Vocab 31-38, bank 39-43
        vocab_sec = extract_section(content, "第四部分", ["第五部分"])
        vocab_lines = [l for l in vocab_sec if re.match(r"^3[1-8]\.", l) or ("(" in l and re.match(r"^3[1-8]", l))]
        for n in range(31, 39):
            stem = ""
            for line in vocab_sec:
                m = re.match(rf"^{n}\.\s*(.+)$", line)
                if m:
                    stem = m.group(1).strip()
                    break
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "fill_blank", "section": "vocab_fill",
                "stem": stem, "answer": ans,
                "explanation": basic_explanation(n, ans, "词汇运用"),
                "knowledge_point": "词汇运用",
            })

        bank_lines = []
        bank_started = False
        for line in vocab_sec:
            if "选词填空" in line or "第二节" in line:
                bank_started = True
                continue
            if bank_started:
                if re.match(r"^3[89]\.|^4[0-3]\.", line):
                    break
                bank_lines.append(line)
        bank = parse_word_bank(vocab_sec)
        if bank:
            exam["resources"]["word_bank"] = bank

        # vocab bank passage
        bank_passage = []
        for line in vocab_sec:
            if "__39__" in line or "__39__" in line.replace(" ", "") or re.search(r"__\s*39\s*__", line):
                idx = vocab_sec.index(line)
                bank_passage = vocab_sec[idx:]
                break
            if re.search(r"__39__|__ 39 __", line):
                idx = vocab_sec.index(line)
                bank_passage = vocab_sec[idx:]
                break
        if not bank_passage:
            for i, line in enumerate(vocab_sec):
                if re.search(r"__\s*39\s*__", line):
                    bank_passage = vocab_sec[i:]
                    break
        bank_passage = [l for l in bank_passage if not re.match(r"^4[4-9]\.", l)][:6]
        if bank_passage:
            exam["passages"]["vocab_bank"] = normalize_passage_blanks("\n\n".join(bank_passage))

        for n in range(39, 44):
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "fill_blank", "section": "vocab_bank",
                "stem": "", "answer": ans,
                "explanation": basic_explanation(n, ans, "选词填空"),
                "knowledge_point": "选词填空",
            })

        # Passage fill 44-53
        pf_sec = extract_section(content, "第五部分", ["第六部分"])
        pf_lines = []
        for line in pf_sec:
            if re.search(r"__\s*44\s*__|__44__", line) or (pf_lines and not re.match(r"^第", line)):
                pf_lines.append(line)
            elif re.search(r"__\d+__", line):
                pf_lines.append(line)
            elif not pf_lines and (line[0].isupper() or "Dancing" in line or "When " in line):
                pf_lines.append(line)
        # grab from first title line
        start_i = 0
        for i, line in enumerate(pf_sec):
            if re.search(r"__\s*44\s*__", line) or "__44__" in line.replace(" ", ""):
                start_i = max(0, i - 2)
                pf_lines = pf_sec[start_i:]
                break
        pf_text_lines = []
        for line in pf_lines:
            if re.match(r"^第", line):
                break
            pf_text_lines.append(line)
        exam["passages"]["passage_fill"] = normalize_passage_blanks("\n\n".join(pf_text_lines))

        for n in range(44, 54):
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "fill_blank", "section": "passage_fill",
                "stem": "", "answer": ans,
                "explanation": basic_explanation(n, ans, "短文填空"),
                "knowledge_point": "短文填空",
            })

        # Response 54-56
        resp_sec = extract_section(content, "第六部分", ["第七部分"])
        resp_lines = [l for l in resp_sec if not re.match(r"^5[4-6]\.", l)]
        exam["passages"]["response"] = "\n\n".join(resp_lines)
        for n in range(54, 57):
            stem = ""
            for line in resp_sec:
                m = re.match(rf"^{n}\.\s*(.+)$", line)
                if m:
                    stem = m.group(1).strip()
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "short_answer", "section": "response",
                "stem": stem, "answer": ans,
                "explanation": basic_explanation(n, ans, "阅读表达"),
                "knowledge_point": "阅读表达",
            })

        # Writing 57
        write_sec = extract_section(content, "第七部分", ["参考答案", "英语试题"])
        writing_prompt = "\n".join(write_sec)
        exam["resources"]["writing_prompt"] = {"body": writing_prompt}
        ans57 = answers.get(57, "（略）")
        questions.append({
            "id": "q57", "type": "essay", "section": "writing",
            "stem": writing_prompt[:500], "answer": ans57,
            "explanation": "书面表达需结合题目要求完成作文，注意要点齐全、语言准确。",
            "knowledge_point": "书面表达",
        })

    elif fmt == "legacy8":
        # Grammar 1-10
        g_sec = extract_section(content, "第一部分", ["第二部分"])
        for n in range(1, 11):
            parsed = parse_mcq_options_from_lines(g_sec, n)
            ans = answers.get(n, "")
            stem, opts = parsed if parsed else ("", {})
            questions.append({
                "id": f"q{n}", "type": "multiple_choice", "section": "grammar",
                "stem": stem, "options": opts,
                "answer": ans[:1].upper() if len(ans)==1 else ans,
                "explanation": basic_explanation(n, ans, "单项填空"),
                "knowledge_point": "单项填空",
            })

        # Cloze 11-20
        c_sec = extract_section(content, "第二部分", ["第三部分"])
        cloze_lines = []
        for line in c_sec:
            if re.match(r"^11\.\s*[A-D]\.", line):
                break
            cloze_lines.append(line)
        exam["passages"]["cloze"] = normalize_passage_blanks("\n\n".join(cloze_lines))
        for n in range(11, 21):
            parsed = parse_mcq_options_from_lines(c_sec, n)
            ans = answers.get(n, "")
            stem, opts = parsed if parsed else ("", {})
            questions.append({
                "id": f"q{n}", "type": "multiple_choice", "section": "cloze",
                "stem": stem, "options": opts,
                "answer": ans[:1].upper() if len(ans)==1 else ans,
                "explanation": basic_explanation(n, ans, "完形填空"),
                "knowledge_point": "完形填空",
            })

        # Reading 21-32 (3 per passage)
        r_sec = extract_section(content, "第三部分", ["第四部分"])
        exam["reading_blocks"] = [
            {"label": "A", "from": 21, "to": 23, "kind": "passage", "passageKey": "reading_A"},
            {"label": "B", "from": 24, "to": 26, "kind": "passage", "passageKey": "reading_B"},
            {"label": "C", "from": 27, "to": 29, "kind": "passage", "passageKey": "reading_C"},
            {"label": "D", "from": 30, "to": 32, "kind": "passage", "passageKey": "reading_D"},
        ]
        labels = ["A", "B", "C", "D"]
        cur = None
        passages: dict[str, list[str]] = {f"reading_{x}": [] for x in labels}
        q_stems = {}
        for line in r_sec:
            if line in labels:
                cur = line
                continue
            m = re.match(r"^(\d{1,2})\.\s*(.*)$", line)
            if m and 21 <= int(m.group(1)) <= 32:
                q_stems[int(m.group(1))] = m.group(2).strip()
                continue
            if cur:
                passages[f"reading_{cur}"].append(line)
        for k, v in passages.items():
            exam["passages"][k] = "\n\n".join(v)
        for n in range(21, 33):
            parsed = parse_mcq_options_from_lines(r_sec, n)
            ans = answers.get(n, "")
            stem, opts = (parsed if parsed else (q_stems.get(n, ""), {}))
            questions.append({
                "id": f"q{n}", "type": "multiple_choice", "section": "reading",
                "stem": stem or f"Question {n}", "options": opts,
                "answer": ans[:1].upper() if len(ans)==1 else ans,
                "explanation": basic_explanation(n, ans, "阅读理解"),
                "knowledge_point": "阅读理解",
            })

        # Restore 33-37
        rest_sec = extract_section(content, "第四部分", ["第五部分"])
        exam["passages"]["restore"] = normalize_passage_blanks("\n\n".join(
            [l for l in rest_sec if not re.match(r"^[A-G]\.", l) and not l.startswith("选项")]
        ))
        exam["resources"]["restore_options"] = parse_restore_options(rest_sec)
        for n in range(33, 38):
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "letter_choice", "section": "restore",
                "stem": "", "answer": ans[:1].upper() if ans else "",
                "explanation": basic_explanation(n, ans, "信息还原"),
                "knowledge_point": "信息还原",
            })

        # Vocab 38-47
        v_sec = extract_section(content, "第五部分", ["第六部分"])
        for n in range(38, 48):
            stem = ""
            for line in v_sec:
                m = re.match(rf"^{n}\.\s*(.+)$", line)
                if m:
                    stem = m.group(1).strip()
                    break
            ans = answers.get(n, "")
            section = "vocab_fill"
            questions.append({
                "id": f"q{n}", "type": "fill_blank", "section": section,
                "stem": stem, "answer": ans,
                "explanation": basic_explanation(n, ans, "词汇检测"),
                "knowledge_point": "词汇检测",
            })

        # Part 6 - translation or passage fill
        p6 = extract_section(content, "第六部分", ["第七部分"])
        if "翻译" in "".join(content):
            for n in range(48, 53):
                stem = ""
                for line in p6:
                    m = re.match(rf"^{n}\.\s*(.+)$", line)
                    if m:
                        stem = m.group(1).strip()
                ans = answers.get(n, "")
                questions.append({
                    "id": f"q{n}", "type": "short_answer", "section": "translation",
                    "stem": stem, "answer": ans,
                    "explanation": basic_explanation(n, ans, "句子翻译"),
                    "knowledge_point": "句子翻译",
                })
        else:
            # 2021: passage fill 48-57 in part 6/7
            pf_sec = p6
            pf2 = extract_section(content, "第六部分", ["第七部分", "第八部分"])
            combined = pf2
            for i, line in enumerate(combined):
                if re.search(r"__\s*48\s*__", line):
                    exam["passages"]["passage_fill"] = normalize_passage_blanks("\n\n".join(combined[max(0,i-1):]))
                    break
            for n in range(48, 58):
                ans = answers.get(n, "")
                questions.append({
                    "id": f"q{n}", "type": "fill_blank", "section": "passage_fill",
                    "stem": "", "answer": ans,
                    "explanation": basic_explanation(n, ans, "短文填空"),
                    "knowledge_point": "短文填空",
                })

        # Response + writing - detect question numbers
        if "翻译" in "\n".join(content):
            resp_sec = extract_section(content, "第七部分", ["第八部分"])
            resp_start = 53
            write_part = "第八部分"
        else:
            resp_sec = extract_section(content, "第七部分", ["第八部分"])
            resp_start = 58 if year == 2021 else 53
            write_part = "第八部分"

        resp_lines = [l for l in resp_sec if not re.match(rf"^{resp_start}\.|^{resp_start+1}\.|^{resp_start+2}\.", l)]
        if resp_lines:
            exam["passages"]["response"] = "\n\n".join(resp_lines)
        for i, n in enumerate(range(resp_start, resp_start + 3)):
            stem = ""
            for line in resp_sec:
                m = re.match(rf"^{n}\.\s*(.+)$", line)
                if m:
                    stem = m.group(1).strip()
            ans = answers.get(n, "")
            questions.append({
                "id": f"q{n}", "type": "short_answer", "section": "response",
                "stem": stem, "answer": ans,
                "explanation": basic_explanation(n, ans, "阅读表达"),
                "knowledge_point": "阅读表达",
            })

        w_sec = extract_section(content, write_part, ["参考答案", "英语试题"])
        w_num = resp_start + 3
        exam["resources"]["writing_prompt"] = {"body": "\n".join(w_sec)}
        questions.append({
            "id": f"q{w_num}", "type": "essay", "section": "writing",
            "stem": "\n".join(w_sec)[:800],
            "answer": answers.get(w_num, "（略）"),
            "explanation": "书面表达需结合题目要求完成作文。",
            "knowledge_point": "书面表达",
        })

    exam["questions"] = questions
    return exam


def main():
    OUT_DIR.mkdir(exist_ok=True)
    for year, path in FILES.items():
        if not path.exists():
            print(f"skip missing {year}")
            continue
        exam = build_exam(year, path)
        out = OUT_DIR / f"suzhou-{year}.json"
        out.write_text(json.dumps(exam, ensure_ascii=False, indent=2), encoding="utf-8")
        qcount = len(exam["questions"])
        ans_count = sum(1 for q in exam["questions"] if q.get("answer"))
        mcq_missing = sum(1 for q in exam["questions"] if q["type"]=="multiple_choice" and not q.get("options"))
        print(f"{year}: {qcount} questions, {ans_count} answers, {mcq_missing} mcq missing options -> {out}")


if __name__ == "__main__":
    main()

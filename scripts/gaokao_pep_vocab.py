#!/usr/bin/env python3
"""Parse 人教版高中 PEP appendix: Words and Expressions in Each Unit."""
from __future__ import annotations

import re
from typing import TypedDict

# Romanized pinyin / PDF header garbage (not textbook headwords)
VOCAB_BLACKLIST = frozenset(
    w.lower()
    for w in (
        "PUTONG",
        "GAOZHONG",
        "JIAOKESHU",
        "YINGYU",
        "ENGLISH",
        "WORKBOOK",
        "REGISTRATION",
        "LISTENING",
        "SPEAKING",
        "READING",
        "WRITING",
        "UNIT",
        "WELCOME",
        "PEOPLE",
        "COMPLETE",
        "TABLE",
        "HELLO",
        "EVERYONE",
        "LISTEN",
        "CONVERSATION",
        "NATIONALITY",
        "EMAIL",
        "GRADE",
        "MEETS",
        "FEMALE",
        "SARAH",
        "DISCOVERING",
        "APPENDICES",
        "CONTENTS",
        "THEME",
        "PRONUNCIATION",
        "STRUCTURE",
        "PROJECT",
        "VIDEO",
        "TIME",
        "NOTES",
        "GRAMMAR",
        "APPENDIX",
        "PAGE",
        "TEENAGE",
        "LIFE",
        "TRAVELLING",
        "AROUND",
        "SPORTS",
        "FITNESS",
        "NATURAL",
        "DISASTERS",
        "LANGUAGES",
        "WORLD",
    )
)

# Tokens that look like PDF corruption
GARBAGE_RE = re.compile(
    r"^(i+nd+d+|.*::\d+.*|[\d:]+$|.*\u00b7.*北京.*)$",
    re.I,
)

UNIT_HEADER_RE = re.compile(
    r"(?:^|\s)(Welcome Unit|Unit\s+(\d+))(?:\s+|$)",
    re.I,
)

# headword /phonetic/ gloss (may repeat on one line)
ENTRY_RE = re.compile(
    r"(?<![A-Za-z/])"
    r"([a-zA-Z][a-zA-Z0-9' \-]*(?:\s+(?:to|on|up|for|of|in|at|with|from|into|out))?"
    r"(?:\s+[a-zA-Z0-9' \-]+)*)"
    r"\s+/[^/\n]{1,80}/"
    r"\s*"
    r"([^/\n]+?)"
    r"(?=\s+[a-zA-Z][a-zA-Z0-9' \-]+\s+/[^/\n]{1,80}/|\s*Unit\s+\d+|\s*Welcome Unit|$)",
)

# Phrases without phonetic: "take notes 记笔记"
PHRASE_RE = re.compile(
    r"(?<![A-Za-z/])"
    r"((?:[a-z][a-z0-9' \-]*\s+){0,5}[a-z][a-z0-9' \-]*)"
    r"\s+([\u4e00-\u9fff（][^\n]{2,60})",
)

POS_PREFIX_RE = re.compile(
    r"^(?:n\.|v\.|vt\.|vi\.|adj\.|adv\.|prep\.|conj\.|abbr\.|modal|aux\.|det\.|pron\.)\s*",
    re.I,
)

POS_GLOSS_LINE_RE = re.compile(
    r"^(?:n\.|vt\.|vi\.|adj\.|adv\.|prep\.|abbr\.)\s*(.+)$",
    re.I,
)


class UnitWord(TypedDict):
    word: str
    meaning_cn: str
    pep_unit: str


def _unit_label(header: str, num: str | None) -> str:
    if header.lower().startswith("welcome"):
        return "Welcome Unit"
    if num:
        return f"Unit {num}"
    return header.strip()


def _clean_gloss(raw: str) -> str:
    g = raw.strip()
    g = re.sub(r"\s+", " ", g)
    g = re.sub(r"\s+\d{1,3}\s*$", "", g)

    # Prefer noun sense when PDF packs vi./n. on one line (e.g. exchange)
    n_match = re.search(
        r"(?:^|[\s;；])n\.\s*([^;]+?)(?:;|vt\.|vi\.|adv\.|adj\.|prep\.|make |what |leave |$)",
        g,
    )
    if n_match and re.search(r"[\u4e00-\u9fff]", n_match.group(1)):
        g = n_match.group(1).strip()
    else:
        for pos in ("vt.", "vi.", "adj.", "adv.", "prep.", "abbr."):
            m = re.search(
                rf"(?:^|[\s;；]){re.escape(pos)}\s*([^;]+?)(?:;|n\.|vt\.|vi\.|adj\.|adv\.|$)",
                g,
            )
            if m and re.search(r"[\u4e00-\u9fff]", m.group(1)):
                g = m.group(1).strip()
                break

    g = POS_PREFIX_RE.sub("", g)
    g = re.sub(r"^&\s*", "", g)
    # Strip trailing English-only tail (next headword fragment)
    g = re.sub(r"\s+make\s+an\s+impression.*$", "", g, flags=re.I)
    g = re.sub(r"\s+what\s+if.*$", "", g, flags=re.I)
    g = re.sub(r"\s+be\s+responsible\s+for.*$", "", g, flags=re.I)
    g = re.sub(r"\s+leave\s+\.\.\.\s+alone.*$", "", g, flags=re.I)
    g = re.sub(r"\s+concentrate\s+on.*$", "", g, flags=re.I)

    cn_parts = re.findall(r"[\u4e00-\u9fff][\u4e00-\u9fff；、…·]*", g)
    if cn_parts:
        g = cn_parts[0]
    if "（" in g:
        g = g.split("（")[0].strip()
    g = g.split("；")[0].split(";")[0].strip()
    return g[:48] if g else ""


def _normalize_word(word: str) -> str:
    w = word.strip()
    w = re.sub(r"\s+", " ", w)
    if w.lower() in ("p.m.", "a.m."):
        return w.lower()
    if " " in w or "…" in w or "(" in w:
        return w.lower()
    if w.isupper() and len(w) <= 5:
        return w  # FIFA, CE
    return w[0].upper() + w[1:].lower() if w.islower() else w


def is_valid_headword(word: str) -> bool:
    w = word.strip()
    if not w or len(w) < 2:
        return False
    if GARBAGE_RE.match(w):
        return False
    if w.lower() in VOCAB_BLACKLIST:
        return False
    # ALLCAPS romanization from Chinese cover (PUTONG, GAOZHONG)
    letters = re.sub(r"[^A-Za-z]", "", w)
    if letters and letters.isupper() and len(letters) >= 5 and " " not in w:
        return False
    if re.search(r"\d{3,}", w):
        return False
    if not re.search(r"[a-zA-Z]", w):
        return False
    return True


def extract_appendix_section(full_text: str) -> str:
    """Return text between per-unit word list and alphabetical Vocabulary."""
    start_m = re.search(
        r"Words and Expressions in Each Unit",
        full_text,
        re.I,
    )
    if not start_m:
        return ""
    chunk = full_text[start_m.start() :]
    end_m = re.search(
        r"\nAppendices\s*\n\s*Vocabulary\s*\n\s*词汇表",
        chunk,
        re.I,
    )
    if not end_m:
        end_m = re.search(r"\nVocabulary\s*\n\s*词汇表", chunk, re.I)
    if end_m:
        chunk = chunk[: end_m.start()]
    return chunk


def parse_unit_vocab(section_text: str) -> dict[str, list[UnitWord]]:
    """Parse appendix into {pep_unit: [{word, meaning_cn, pep_unit}, ...]}."""
    by_unit: dict[str, list[UnitWord]] = {}
    current = "Welcome Unit"
    seen: dict[str, set[str]] = {current: set()}
    pending: tuple[str, str] | None = None  # (word, unit)

    def add(word: str, gloss: str, unit: str) -> None:
        nonlocal pending
        w = _normalize_word(word)
        if not is_valid_headword(w):
            pending = None
            return
        g = _clean_gloss(gloss)
        if not g or not re.search(r"[\u4e00-\u9fff]", g):
            pending = (w, unit)
            return
        pending = None
        key = w.lower()
        if key in seen.setdefault(unit, set()):
            return
        seen[unit].add(key)
        by_unit.setdefault(unit, []).append(
            {"word": w, "meaning_cn": g, "pep_unit": unit}
        )

    for raw_line in section_text.splitlines():
        line = raw_line.strip()
        if not line or re.match(r"^\d{1,3}$", line):
            continue
        if line.startswith("注：") or "课标词" in line:
            continue
        if line.startswith("Words and Expressions"):
            continue
        if "各单元生词" in line:
            continue

        for m in UNIT_HEADER_RE.finditer(line):
            current = _unit_label(m.group(1), m.group(2))
            seen.setdefault(current, set())
            pending = None

        if pending and not ENTRY_RE.search(line):
            pos_m = POS_GLOSS_LINE_RE.match(line)
            if pos_m and re.search(r"[\u4e00-\u9fff]", pos_m.group(1)):
                add(pending[0], pos_m.group(1), pending[1])
                pending = None
                continue

        # Process line after stripping unit header prefix
        work = UNIT_HEADER_RE.sub(" ", line).strip()

        for em in ENTRY_RE.finditer(work):
            add(em.group(1), em.group(2), current)

        # Phrases without IPA (only when line has no phonetic slash pair)
        if "/" not in work or work.count("/") < 2:
            for pm in PHRASE_RE.finditer(work):
                add(pm.group(1), pm.group(2), current)

    return by_unit


def hub_unit_label(book_unit_key: str) -> str:
    """Map pep_unit_map key to appendix unit label."""
    if book_unit_key == "WU":
        return "Welcome Unit"
    if book_unit_key.startswith("U") and book_unit_key[1:].isdigit():
        return f"Unit {book_unit_key[1:]}"
    return book_unit_key


def pick_hub_vocab(
    unit_words: list[UnitWord],
    *,
    limit: int = 16,
) -> list[dict]:
    """Format for gaokaoHub vocabulary array."""
    out: list[dict] = []
    for item in unit_words:
        w = item["word"]
        if not is_valid_headword(w):
            continue
        cn = item["meaning_cn"]
        out.append({"en": w, "cn": cn, "emoji": "📘"})
        if len(out) >= limit:
            break
    return out

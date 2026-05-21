#!/usr/bin/env python3
"""Extract table data from 2023 Suzhou exam docx."""
import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
path = Path(r"c:\Users\willi\OneDrive\Desktop\中考\2023苏州中考英语试卷.docx")

with zipfile.ZipFile(path) as z:
    root = ET.fromstring(z.read("word/document.xml"))

tables = []
for ti, tbl in enumerate(root.findall(".//w:tbl", NS)):
    cells = []
    for p in tbl.findall(".//w:p", NS):
        t = "".join(x.text or "" for x in p.findall(".//w:t", NS)).strip()
        if t:
            cells.append(t)
    tables.append({"index": ti, "cells": cells})

# Parse cloze grid (table 0)
cloze = {}
cells = tables[0]["cells"]
for i in range(5, len(cells), 5):
    chunk = cells[i : i + 5]
    if len(chunk) == 5 and chunk[0].isdigit():
        n = int(chunk[0])
        cloze[n] = {"A": chunk[1], "B": chunk[2], "C": chunk[3], "D": chunk[4]}

# Reading option tables 1-15 -> q11-q25
reading = {}
for ti in range(1, 16):
    cells = tables[ti]["cells"]
    opts = {}
    for c in cells:
        if len(c) >= 3 and c[1] == "." and c[0] in "ABCD":
            opts[c[0]] = c[2:].strip()
    reading[10 + ti] = opts

out = {"cloze_options": cloze, "reading_options": reading, "word_bank": tables[16]["cells"]}
Path(__file__).parent.joinpath("suzhou-extract/2023-table-data.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("cloze", len(cloze), "reading", len(reading))

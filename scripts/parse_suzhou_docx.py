#!/usr/bin/env python3
"""Extract plain text from Suzhou exam docx files for inspection/parsing."""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

FILES = {
    2019: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2019年苏州市中考英语试卷.docx"),
    2020: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2020_英语试卷.docx"),
    2021: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2021年苏州市初中模拟英语试卷.docx"),
    2023: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2023苏州中考英语试卷.docx"),
    2024: Path(r"c:\Users\willi\OneDrive\Desktop\中考\2024苏州中考英语试题及答案.docx"),
}


def para_text(p):
    parts = []
    for t in p.findall(".//w:t", NS):
        if t.text:
            parts.append(t.text)
    for el in p.findall(".//w:tab", NS):
        parts.append("\t")
    for el in p.findall(".//w:br", NS):
        parts.append("\n")
    return "".join(parts)


def docx_lines(path: Path):
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    body = root.find("w:body", NS)
    lines = []
    for p in body.findall("w:p", NS):
        t = para_text(p).strip()
        if t:
            lines.append(t)
    return lines


def main():
    out_dir = Path(__file__).parent / "suzhou-extract"
    out_dir.mkdir(exist_ok=True)
    for year, path in FILES.items():
        if not path.exists():
            print(f"MISSING {year}: {path}")
            continue
        lines = docx_lines(path)
        text = "\n".join(lines)
        out = out_dir / f"suzhou-{year}.txt"
        out.write_text(text, encoding="utf-8")
        print(f"{year}: {len(lines)} paragraphs -> {out}")
        # quick stats
        mcq = len(re.findall(r"^\d+\.\s", text, re.M))
        print(f"  numbered lines ~{mcq}")


if __name__ == "__main__":
    main()

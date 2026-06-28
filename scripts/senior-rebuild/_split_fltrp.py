import os, re
base = "scripts/senior-rebuild"
BOOKS = [f"fltrp-{v}" for v in ["required1","required2","required3","elective1","elective2","elective3","elective4"]]
PAGE_RE = re.compile(r"^===== PAGE (\d+) =====$")
UNIT_START = 9   # u1 opener page
STRIDE = 12      # each unit spans 12 pages

for book in BOOKS:
    full = os.path.join(base, book, "_raw", "full.txt")
    if not os.path.exists(full):
        print("skip", book); continue
    text = open(full, encoding="utf-8").read()
    pages = {}
    cur_no, cur = None, []
    for line in text.splitlines():
        m = PAGE_RE.match(line)
        if m:
            if cur_no is not None:
                pages[cur_no] = "\n".join(cur)
            cur_no, cur = int(m.group(1)), []
        else:
            cur.append(line)
    if cur_no is not None:
        pages[cur_no] = "\n".join(cur)
    maxpg = max(pages)

    d = os.path.join(base, book, "_raw")
    # contiguous unit slices
    summ = []
    for u in range(1, 7):
        start = UNIT_START + STRIDE * (u - 1)
        end = start + STRIDE - 1
        body = "\n".join(f"===== PAGE {p} =====\n{pages[p]}" for p in range(start, end + 1) if p in pages)
        open(os.path.join(d, f"u{u}_unit.txt"), "w", encoding="utf-8").write(body)
        summ.append(f"u{u}:{start}-{end}")
    # wordlist: from the page containing the 词汇表 note to the end
    wl_start = None
    for p in sorted(pages):
        if "词汇表" in pages[p] or "Vocabulary" == pages[p].strip().split("\n")[0].strip():
            wl_start = p; break
    if wl_start is None:
        wl_start = max(UNIT_START + STRIDE * 6, maxpg - 25)
    wl = "\n".join(f"===== PAGE {p} =====\n{pages[p]}" for p in range(wl_start, maxpg + 1) if p in pages)
    open(os.path.join(d, "wordlist.txt"), "w", encoding="utf-8").write(wl)
    print(book, " ".join(summ), f"| wordlist:{wl_start}-{maxpg}({len(wl)//1024}KB)")

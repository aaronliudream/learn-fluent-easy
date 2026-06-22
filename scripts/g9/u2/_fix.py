# -*- coding: utf-8 -*-
p = r"C:\Projects\learn-fluent-easy\scripts\g9\u2\_build_content.py"
b = open(p, "rb").read().replace(b"\x00", b"")
text = b.decode("utf-8")
lines = text.split("\n")
for i, l in enumerate(lines):
    if 'split(" ") if False' in l:
        indent = l[:len(l) - len(l.lstrip())]
        lines[i] = indent + '("What did the grandparents give the children?","Red packets with money.",["Books and pens.","New clothes.","Toy cars."]),'
        print("fixed line", i + 1)
open(p, "w", encoding="utf-8").write("\n".join(lines))
print("done")

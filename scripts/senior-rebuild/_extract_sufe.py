import fitz, os, sys
SRC = r"C:/Users/willi/OneDrive/Desktop/英语教材/高中英语教材/上外"
JOBS = {
  "sufe-required3":  "普通高中教科书·英语必修 第三册.pdf",
  "sufe-elective1":  "普通高中教科书·英语选择性必修 第一册.pdf",
  "sufe-elective2":  "普通高中教科书·英语选择性必修 第二册.pdf",
  "sufe-elective3":  "普通高中教科书·英语选择性必修 第三册.pdf",
  "sufe-elective4":  "普通高中教科书·英语选择性必修 第四册.pdf",
}
base = "scripts/senior-rebuild"
for vol, pdf in JOBS.items():
    d = os.path.join(base, vol, "_raw")
    os.makedirs(d, exist_ok=True)
    doc = fitz.open(os.path.join(SRC, pdf))
    parts = []
    for i, pg in enumerate(doc, 1):
        parts.append(f"===== PAGE {i} =====\n{pg.get_text()}")
    open(os.path.join(d, "full.txt"), "w", encoding="utf-8").write("\n".join(parts))
    print(f"{vol}: {len(doc)} pages -> {d}/full.txt")

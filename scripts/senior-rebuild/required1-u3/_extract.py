import pdfplumber
pdf=pdfplumber.open(r"C:\Users\willi\OneDrive\Desktop\英语教材\高中英语教材\人教版\普通高中教科书·英语必修 第一册.pdf")
# 找 U3 标题页(正文首行含 UNIT 3 / SPORTS)
start=None
for i in range(40,60):
    t=(pdf.pages[i].extract_text() or "")
    if t.strip().upper().startswith("UNIT 3") or "SPORTS AND FITNESS" in t.upper()[:80]:
        start=i;break
start=start or 41
content=[("\n===== PAGE %d =====\n"%i)+(pdf.pages[i].extract_text() or "") for i in range(start,min(start+12,len(pdf.pages)))]
open("scripts/senior-rebuild/required1-u3/_raw/u3_content.txt","w",encoding="utf-8").write("\n".join(content))
open("scripts/senior-rebuild/required1-u3/_raw/_loc.txt","w",encoding="utf-8").write("U3 start p%d"%start)

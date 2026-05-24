from pathlib import Path

dst = Path(__file__).resolve().parents[1] / "src" / "pages" / "gaokaoHub"
src = Path(__file__).resolve().parents[1] / "src" / "pages" / "juniorHub"

for jf in src.glob("Junior*.tsx"):
    text = jf.read_text(encoding="utf-8")
    text = text.replace("JuniorHub", "GaokaoHub")
    text = text.replace("juniorHub", "gaokaoHub")
    text = text.replace("useJuniorHub", "useGaokaoHub")
    text = text.replace("JuniorHubProvider", "GaokaoHubProvider")
    text = text.replace("resolveJuniorHubGrade", "resolveGaokaoHubGrade")
    text = text.replace("/junior/hub", "/gaokao/hub")
    text = text.replace("返回初中专区", "返回高中专区")
    text = text.replace('to="/junior"', 'to="/gaokao"')
    text = text.replace("/junior/grammar/", "/gaokao/grammar/")
    out = dst / jf.name.replace("Junior", "Gaokao")
    out.write_text(text, encoding="utf-8")
    print("wrote", out.name)

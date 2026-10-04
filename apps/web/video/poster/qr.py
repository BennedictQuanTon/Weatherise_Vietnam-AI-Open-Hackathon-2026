# Writes the poster QR codes (live demo + GitHub) as SVG next to poster.html.
#   python video/poster/qr.py      (needs: pip install segno)
# Error correction M keeps the modules large enough to scan from a screen or a small print (GitHub link: 37×37 instead of 49×49 at H).
from pathlib import Path

import segno

HERE = Path(__file__).parent
LINKS = {
    "qr-demo.svg": "https://weatherise-vietnam-ai-open-hackatho.vercel.app",
    "qr-github.svg": "https://github.com/BennedictQuanTon/Weatherise_Vietnam-AI-Open-Hackathon-2026",
}

for name, url in LINKS.items():
    # border=0: poster.html adds the white quiet zone around each code
    segno.make(url, error="m", boost_error=False).save(HERE / name, kind="svg", scale=10, border=0, dark="#101010", light=None, xmldecl=False, svgns=True)
    print(f"{name} → {url}")

"""Descarcă subseturile latin + latin-ext ale fonturilor, self-hosted."""

import os
import re
import urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
OUT = "/home/serbaan/programming/anul_1/extra/MN_site/public/fonts"

# doar subseturile de care avem nevoie: latin de bază și latin-ext (ș, ț cu virgulă)
WANTED = {
    "U+0000-00FF": "latin",
    "U+0100-02BA": "latin-ext",
}

FAMILIES = [
    ("Nunito Sans", "nunito-sans", "Nunito+Sans:wght@400..800"),
    ("JetBrains Mono", "jetbrains-mono", "JetBrains+Mono:wght@400..700"),
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return r.read()


blocks = []
for family, slug, query in FAMILIES:
    css = fetch(f"https://fonts.googleapis.com/css2?family={query}&display=swap").decode()
    for face in re.findall(r"@font-face\s*\{(.*?)\}", css, re.S):
        rng = re.search(r"unicode-range:\s*([^;]+);", face)
        src = re.search(r"src:\s*url\((\S+?)\)", face)
        weight = re.search(r"font-weight:\s*([^;]+);", face)
        style = re.search(r"font-style:\s*([^;]+);", face)
        if not rng or not src:
            continue
        subset = next((v for k, v in WANTED.items() if rng.group(1).startswith(k)), None)
        if subset is None:
            continue
        name = f"{slug}-{subset}.woff2"
        path = os.path.join(OUT, name)
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(fetch(src.group(1)))
        blocks.append(
            "@font-face {\n"
            f"  font-family: '{family}';\n"
            f"  font-style: {style.group(1).strip() if style else 'normal'};\n"
            f"  font-weight: {weight.group(1).strip() if weight else '400'};\n"
            "  font-display: swap;\n"
            f"  src: url('/fonts/{name}') format('woff2');\n"
            f"  unicode-range: {rng.group(1).strip()};\n"
            "}"
        )

print("\n\n".join(blocks))
print("\n/* fișiere:", sorted(os.listdir(OUT)), "*/")

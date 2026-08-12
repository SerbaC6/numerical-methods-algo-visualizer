"""Contrast WCAG pentru perechile text/fundal din design system."""


def lum(hexc):
    hexc = hexc.lstrip("#")
    ch = [int(hexc[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    ch = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in ch]
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]


def raport(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


PERECHI = [
    # (descriere, text, fundal, prag)
    ("întunecat: text principal / fundal", "#EEF3FB", "#262B40", 4.5),
    ("întunecat: text principal / suprafață", "#EEF3FB", "#2C444C", 4.5),
    ("întunecat: text slab (cer) / fundal", "#A8C4EC", "#262B40", 4.5),
    ("întunecat: text slab (cer) / suprafață", "#A8C4EC", "#2C444C", 4.5),
    ("întunecat: safir ca TEXT / fundal (interzis)", "#0474C4", "#262B40", 4.5),
    ("întunecat: alb pe buton safir", "#FFFFFF", "#0474C4", 4.5),
    ("întunecat: succes / fundal", "#4ADE80", "#262B40", 4.5),
    ("întunecat: atenție / fundal", "#FBBF24", "#262B40", 4.5),
    ("întunecat: eroare / fundal", "#F87171", "#262B40", 4.5),
    ("întunecat: inel focus (cer) / fundal", "#A8C4EC", "#262B40", 3.0),
    ("luminos: text principal / fundal", "#262B40", "#F7F9FD", 4.5),
    ("luminos: text principal / suprafață", "#262B40", "#FFFFFF", 4.5),
    ("luminos: text slab / fundal", "#4A5A6B", "#F7F9FD", 4.5),
    ("luminos: accent (adânc) / fundal", "#06457F", "#F7F9FD", 4.5),
    ("luminos: alb pe buton accent adânc", "#FFFFFF", "#06457F", 4.5),
    ("luminos: succes / fundal", "#15803D", "#F7F9FD", 4.5),
    ("luminos: atenție / fundal", "#A16207", "#F7F9FD", 4.5),
    ("luminos: eroare / fundal", "#B91C1C", "#F7F9FD", 4.5),
]

for desc, fg, bg, prag in PERECHI:
    r = raport(fg, bg)
    stare = "OK " if r >= prag else "PICĂ"
    print(f"{stare} {r:5.2f}:1  (prag {prag})  {desc}")

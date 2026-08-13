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
    ("întunecat: pivot ca inel / suprafață", "#FF7A5C", "#2C444C", 3.0),
    ("întunecat: pivot ca cifră / fundal", "#FF7A5C", "#262B40", 4.5),
    ("întunecat: noapte pe umplere pivot", "#262B40", "#FF7A5C", 4.5),
    ("întunecat: ALB pe umplere pivot (interzis)", "#FFFFFF", "#FF7A5C", 4.5),
    ("întunecat: inel focus (cer) / fundal", "#A8C4EC", "#262B40", 3.0),
    # Intervalul e element grafic, nu text: pragul e 3:1 (WCAG 1.4.11).
    ("întunecat: interval (turcoaz) / fundal", "#4CA49C", "#262B40", 3.0),
    ("întunecat: interval (turcoaz) / suprafață", "#4CA49C", "#2C444C", 3.0),
    # Treapta următoare spre fundal, respinsă: culoarea e domolită cât se poate,
    # dar sub 3:1 paranteza redevine invizibilă — bugul de la care s-a pornit.
    ("întunecat: interval prea domol (interzis)", "#3C837D", "#2C444C", 3.0),
    # Față de curbă și de iterația curentă, intervalul se desprinde prin NUANȚĂ,
    # nu prin luminanță (chihlimbar/safir e chiar 1,03:1) — și e în regulă:
    # albastru↔portocaliu și albastru↔violet rămân distincte la daltonismul
    # roșu-verde, iar formele sunt oricum diferite (paranteză vs. linie).
    # Un prag de luminanță aici n-ar măsura nimic real, deci nu se pune.
    ("luminos: text principal / fundal", "#262B40", "#F7F9FD", 4.5),
    ("luminos: text principal / suprafață", "#262B40", "#FFFFFF", 4.5),
    ("luminos: text slab / fundal", "#4A5A6B", "#F7F9FD", 4.5),
    ("luminos: accent (adânc) / fundal", "#06457F", "#F7F9FD", 4.5),
    ("luminos: accent-text (safir) / fundal", "#0474C4", "#F7F9FD", 4.5),
    ("luminos: accent-text (safir) / suprafață", "#0474C4", "#FFFFFF", 4.5),
    ("luminos: estompat ca TEXT / fundal (interzis)", "#5379AE", "#F7F9FD", 4.5),
    ("luminos: inel focus (adânc) / fundal", "#06457F", "#F7F9FD", 3.0),
    ("luminos: alb pe buton accent adânc", "#FFFFFF", "#06457F", 4.5),
    ("luminos: succes / fundal", "#15803D", "#F7F9FD", 4.5),
    ("luminos: atenție / fundal", "#A16207", "#F7F9FD", 4.5),
    ("luminos: eroare / fundal", "#B91C1C", "#F7F9FD", 4.5),
    ("luminos: pivot ca inel / suprafață", "#C43314", "#FFFFFF", 3.0),
    ("luminos: pivot ca cifră / fundal", "#C43314", "#F7F9FD", 4.5),
    ("luminos: alb pe umplere pivot", "#FFFFFF", "#C43314", 4.5),
    ("luminos: NOAPTE pe umplere pivot (interzis)", "#262B40", "#C43314", 4.5),
    # ── Etichetele scrise pe grafic („x₀", „a₀") ─────────────────────────────
    # Sunt TEXT, deci pragul e 4,5:1, nu 3:1 ca la elementele grafice. De aceea
    # au tokeni proprii (`--viz-*-eticheta`) și nu refolosesc culoarea de desen.
    # Fiecare se verifică pe amândouă fundalurile pe care poate cădea un grafic.
    ("întunecat: eticheta curent / suprafață", "#6FBAF0", "#2C444C", 4.5),
    ("întunecat: eticheta curent / fundal", "#6FBAF0", "#262B40", 4.5),
    ("întunecat: eticheta anterior / suprafață", "#9CB4D6", "#2C444C", 4.5),
    ("întunecat: eticheta anterior / fundal", "#9CB4D6", "#262B40", 4.5),
    ("întunecat: eticheta interval / suprafață", "#5FBDB3", "#2C444C", 4.5),
    ("întunecat: eticheta interval / fundal", "#5FBDB3", "#262B40", 4.5),
    ("întunecat: eticheta funcție / suprafață", "#A8C4EC", "#2C444C", 4.5),
    ("întunecat: eticheta soluție / suprafață", "#4ADE80", "#2C444C", 4.5),
    ("întunecat: eticheta pivot / suprafață", "#FF8E74", "#2C444C", 4.5),
    ("luminos: eticheta curent / suprafață", "#0474C4", "#FFFFFF", 4.5),
    ("luminos: eticheta curent / fundal", "#0474C4", "#F7F9FD", 4.5),
    ("luminos: eticheta anterior / suprafață", "#4A6E9E", "#FFFFFF", 4.5),
    ("luminos: eticheta anterior / fundal", "#4A6E9E", "#F7F9FD", 4.5),
    ("luminos: eticheta interval / suprafață", "#A05E20", "#FFFFFF", 4.5),
    ("luminos: eticheta interval / fundal", "#A05E20", "#F7F9FD", 4.5),
    ("luminos: eticheta funcție / suprafață", "#06457F", "#FFFFFF", 4.5),
    ("luminos: eticheta soluție / suprafață", "#15803D", "#FFFFFF", 4.5),
    ("luminos: eticheta pivot / suprafață", "#C43314", "#FFFFFF", 4.5),
    # Greșeala pe care tokenii ăștia o previn: culoarea de DESEN folosită ca text.
    ("întunecat: safir ca etichetă (interzis)", "#0474C4", "#2C444C", 4.5),
    ("întunecat: turcoaz de desen ca etichetă (interzis)", "#4CA49C", "#2C444C", 4.5),
    ("luminos: interval (chihlimbar) / fundal", "#BE7434", "#F7F9FD", 3.0),
    ("luminos: interval (chihlimbar) / suprafață", "#BE7434", "#FFFFFF", 3.0),
    # Banda din MatrixGrid e chihlimbarul la 20% peste alb (#F2E3D6): trebuie să
    # rămână limpede sub cifra închisă și să nu se confunde cu celula-pivot.
    ("luminos: text principal / bandă interval 20%", "#262B40", "#F2E3D6", 4.5),
    ("luminos: pivot plin / bandă interval 20%", "#C43314", "#F2E3D6", 3.0),
]

for desc, fg, bg, prag in PERECHI:
    r = raport(fg, bg)
    stare = "OK " if r >= prag else "PICĂ"
    print(f"{stare} {r:5.2f}:1  (prag {prag})  {desc}")

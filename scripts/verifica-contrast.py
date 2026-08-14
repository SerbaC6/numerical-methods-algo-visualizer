"""Contrast WCAG pentru perechile text/fundal din design system.

Suprafața temei întunecate e #33415F — valoarea randată de
`color-mix(in oklab, var(--color-noapte) 70%, var(--color-estompat))` din
`src/index.css`. Nu e ardezia (#2C444C): aceea stă pe hue 195, adică
albastru-verde, și făcea fiecare card să pară verde. Dacă amestecul din CSS se
schimbă, se schimbă și hexul de aici — altfel scriptul verifică altceva decât
se vede pe ecran.
"""


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
    ("întunecat: text principal / suprafață", "#EEF3FB", "#33415F", 4.5),
    ("întunecat: text slab (cer) / fundal", "#A8C4EC", "#262B40", 4.5),
    ("întunecat: text slab (cer) / suprafață", "#A8C4EC", "#33415F", 4.5),
    ("întunecat: safir ca TEXT / fundal (interzis)", "#0474C4", "#262B40", 4.5),
    ("întunecat: alb pe buton safir", "#FFFFFF", "#0474C4", 4.5),
    ("întunecat: succes / fundal", "#F2F5FA", "#262B40", 4.5),
    ("întunecat: atenție / fundal", "#FBBF24", "#262B40", 4.5),
    ("întunecat: eroare / fundal", "#F87171", "#262B40", 4.5),
    ("întunecat: pivot ca inel / suprafață", "#FF7A5C", "#33415F", 3.0),
    ("întunecat: pivot ca cifră / fundal", "#FF7A5C", "#262B40", 4.5),
    ("întunecat: noapte pe umplere pivot", "#262B40", "#FF7A5C", 4.5),
    ("întunecat: ALB pe umplere pivot (interzis)", "#FFFFFF", "#FF7A5C", 4.5),
    ("întunecat: inel focus (cer) / fundal", "#A8C4EC", "#262B40", 3.0),
    # Intervalul e element grafic, nu text: pragul e 3:1 (WCAG 1.4.11).
    ("întunecat: interval (portocaliu) / fundal", "#F97B06", "#262B40", 3.0),
    ("întunecat: interval (portocaliu) / suprafață", "#F97B06", "#33415F", 3.0),
    # Treapta următoare spre fundal, respinsă: culoarea e domolită cât se poate,
    # dar sub 3:1 paranteza redevine invizibilă — bugul de la care s-a pornit.
    ("întunecat: interval prea domol (interzis)", "#D96A05", "#33415F", 3.0),
    # Banda din MatrixGrid pe temă închisă: portocaliul la 20% peste suprafață
    # dă #5B4D4D. Aceleași două verificări ca pe tema deschisă, mai jos.
    ("întunecat: text principal / bandă interval 20%", "#EEF3FB", "#5B4D4D", 4.5),
    ("întunecat: pivot plin / bandă interval 20%", "#FF7A5C", "#5B4D4D", 3.0),
    # Față de curbă și de iterația curentă, intervalul se desprinde prin NUANȚĂ,
    # nu prin luminanță (chihlimbar/safir e chiar 1,03:1) — și e în regulă:
    # albastru↔portocaliu rămâne distinct la daltonismul roșu-verde, iar formele
    # sunt oricum diferite (paranteză vs. linie).
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
    ("întunecat: eticheta curent / suprafață", "#6FBAF0", "#33415F", 4.5),
    ("întunecat: eticheta curent / fundal", "#6FBAF0", "#262B40", 4.5),
    ("întunecat: eticheta anterior / suprafață", "#9CB4D6", "#33415F", 4.5),
    ("întunecat: eticheta anterior / fundal", "#9CB4D6", "#262B40", 4.5),
    ("întunecat: eticheta interval / suprafață", "#FA983D", "#33415F", 4.5),
    ("întunecat: eticheta interval / fundal", "#FA983D", "#262B40", 4.5),
    ("întunecat: eticheta funcție / suprafață", "#A8C4EC", "#33415F", 4.5),
    ("întunecat: eticheta soluție / suprafață", "#F2F5FA", "#33415F", 4.5),
    ("întunecat: eticheta soluție / fundal", "#F2F5FA", "#262B40", 4.5),
    ("întunecat: eticheta pivot / suprafață", "#FF8E74", "#33415F", 4.5),
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
    ("întunecat: safir ca etichetă (interzis)", "#0474C4", "#33415F", 4.5),
    ("întunecat: portocaliul de desen ca etichetă (interzis)", "#F97B06", "#33415F", 4.5),
    ("luminos: interval (chihlimbar) / fundal", "#BE7434", "#F7F9FD", 3.0),
    ("luminos: interval (chihlimbar) / suprafață", "#BE7434", "#FFFFFF", 3.0),
    # ── Suprafața văii din scena 3D (pagina 7) ───────────────────────────────
    # Valea e **fundal**, nu subiect: peste ea se desenează traseul, săgeata și
    # punctele, iar sub ea stau podeaua și curbele de nivel — harta din care se
    # citește unghiul dintre doi pași. De aceea opacitatea e 16–38 % pe amândouă
    # temele, nu 60–100 % ca la început.
    #
    # Ce se vede PESTE vale (tema luminoasă, unde valea e închisă):
    ("luminos: săgeata pasului / valea la 38%", "#BE7434", "#A0B8CE", 1.5),
    # Ce se vede PRIN vale (tema întunecată, unde valea e deschisă): curba de
    # nivel curentă, portocalie, pe podea. La 100 % opacitate ieșea 1,00:1 —
    # adică dispărea complet.
    ("întunecat: curba curentă prin valea la 16%", "#E98A34", "#4A5B7B", 2.5),
    ("întunecat: curba curentă prin valea la 38%", "#DA9760", "#617497", 1.8),
    # Vechile valori, ținute ca teste care TREBUIE să pice.
    ("luminos: valea la 60% — înghite liniile (interzis)", "#BE7434", "#6A8FB2", 1.5),
    ("întunecat: curba prin valea opacă (interzis)", "#A8C4EC", "#A8C4EC", 1.8),
    # ── Liniile de pe podea ──────────────────────────────────────────────────
    # `--viz-grila` a urcat de la 20–22 % la 65 %: la 20 % grila și curbele de
    # nivel ieșeau la 1,41:1 și 1,49:1 chiar desenate la opacitate 1, fiindcă
    # tokenul însuși era aproape transparent.
    ("luminos: grila podelei / suprafață", "#76858B", "#FFFFFF", 3.0),
    ("întunecat: grila podelei / suprafață", "#7F96BB", "#33415F", 3.0),
    # Vechile valori, ținute ca teste care TREBUIE să pice.
    ("luminos: grila la 20% — invizibilă (interzis)", "#D5DADB", "#FFFFFF", 3.0),
    ("întunecat: grila la 22% — invizibilă (interzis)", "#4D5E7E", "#33415F", 3.0),
    # Banda din MatrixGrid e chihlimbarul la 20% peste alb (#F2E3D6): trebuie să
    # rămână limpede sub cifra închisă și să nu se confunde cu celula-pivot.
    ("luminos: text principal / bandă interval 20%", "#262B40", "#F2E3D6", 4.5),
    ("luminos: pivot plin / bandă interval 20%", "#C43314", "#F2E3D6", 3.0),
    # ── Graful din clipul paginii 9 ──────────────────────────────────────────
    # Conturul nodului și muchia sunt elemente grafice (prag 3:1), desenate cu
    # `--viz-functie` peste suprafața cardului.
    ("luminos: contur de nod (funcție) / suprafață", "#06457F", "#FFFFFF", 3.0),
    ("întunecat: contur de nod (funcție) / suprafață", "#A8C4EC", "#33415F", 3.0),
    # De ce graful NU se desenează cu safir: ca element grafic pe suprafața temei
    # întunecate, safirul rămâne sub prag. Test care TREBUIE să pice — dacă trece
    # vreodată, s-a schimbat suprafața, nu regula.
    ("întunecat: safir ca muchie de graf (interzis)", "#0474C4", "#33415F", 3.0),
    # Celula plină din clip: safirul la 16 % peste suprafață, cu cifra peste ea.
    # Compus (oklab): #DBE9F7 pe temă luminoasă, #32496E pe cea întunecată.
    ("luminos: text principal / celulă plină din clip", "#262B40", "#DBE9F7", 4.5),
    ("întunecat: text principal / celulă plină din clip", "#EEF3FB", "#32496E", 4.5),
]

for desc, fg, bg, prag in PERECHI:
    r = raport(fg, bg)
    stare = "OK " if r >= prag else "PICĂ"
    print(f"{stare} {r:5.2f}:1  (prag {prag})  {desc}")

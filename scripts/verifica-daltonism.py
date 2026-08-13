"""Cât de bine se separă culorile de vizualizare pentru cine are daltonism.

Simulare Viénot-Brettel-Mollon (1999) pentru protanopie și deuteranopie, plus
distanța CIE76 (ΔE) în Lab între culoarea candidată și fiecare vecin din desen.
Se rulează manual, cu Python 3 pur; nu face parte din build.

Regulile de paletă din CLAUDE.md invocă daltonismul în mai multe locuri (roșul
pivotului vs. eroare, intervalul vs. curbă și soluție) — aici se verifică, nu se
presupune. **Numărul care contează e `min`**: cea mai mică distanță din cele trei
viziuni. Sub ~20, cele două culori devin greu de deosebit pentru cineva.

Așa a picat un violet (#9B85D8) care arăta perfect pe ecran: pentru un protanop
ajungea la ΔE 10,9 față de safirul iterației curente. L-a înlocuit turcoazul, care
stă la minimum 25 față de toți vecinii.

Verificări de sănătate ale simulării, dacă modifici matricile: roșul pur trebuie
să iasă oliv, verdele pur galben, iar albastrul pur să rămână albastru.
"""

import math


def srgb_liniar(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb(h):
    h = h.lstrip("#")
    return [int(h[i : i + 2], 16) for i in (0, 2, 4)]


def rgb_xyz(rgb):
    r, g, b = (srgb_liniar(c) for c in rgb)
    return (
        0.4124 * r + 0.3576 * g + 0.1805 * b,
        0.2126 * r + 0.7152 * g + 0.0722 * b,
        0.0193 * r + 0.1192 * g + 0.9505 * b,
    )


def xyz_lab(xyz):
    # D65
    x, y, z = xyz[0] / 0.95047, xyz[1], xyz[2] / 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116

    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def lab(h):
    return xyz_lab(rgb_xyz(hex_rgb(h)))


def delta_e(a, b):
    la, lb = lab(a), lab(b)
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(la, lb)))


# Matricile Viénot-Brettel-Mollon (1999), forma publicată care lucrează direct
# pe sRGB **liniar** — proiecția dicromată e deja compusă cu RGB↔LMS. Aplicarea
# matricilor LMS brute pe RGB liniar ar da cifre fără sens.
MATRICI = {
    "protanopie": [
        [0.11238, 0.88762, 0.00000],
        [0.11238, 0.88762, 0.00000],
        [0.00401, -0.00401, 1.00000],
    ],
    "deuteranopie": [
        [0.29275, 0.70725, 0.00000],
        [0.29275, 0.70725, 0.00000],
        [-0.02234, 0.02234, 1.00000],
    ],
}


def simuleaza(h, tip):
    r, g, b = (srgb_liniar(c) for c in hex_rgb(h))
    m = MATRICI[tip]
    lms = [
        m[0][0] * r + m[0][1] * g + m[0][2] * b,
        m[1][0] * r + m[1][1] * g + m[1][2] * b,
        m[2][0] * r + m[2][1] * g + m[2][2] * b,
    ]

    def inapoi(c):
        c = max(0.0, min(1.0, c))
        c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
        return round(c * 255)

    return "#%02X%02X%02X" % tuple(inapoi(c) for c in lms)


FIXE = {
    "curbă (cer)": "#A8C4EC",
    "iterația curentă (safir)": "#0474C4",
    "iterații anterioare": "#5379AE",
    # Pivotul nu apare în același desen cu intervalul plin sau cu soluția — în
    # grafic nu există pivot, iar în matrice intervalul e doar fundal la 20%. E
    # ținut aici fiindcă intervalul pe temă întunecată e acum tot cald, deci
    # relația trebuie să rămână măsurată, nu presupusă. Pragul real pentru
    # perechea aceea e contrastul dintre bandă și celula-pivot, din
    # scripts/verifica-contrast.py.
    "pivotul (coral)": "#FF7A5C",
}

# Cele două roluri care nu pot fi albastre se verifică fiecare față de restul
# desenului **și unul față de altul** — apar împreună pe același grafic.
INTERVAL, SOLUTIE = "#F97B06", "#F2F5FA"

GRUPE = {
    "INTERVAL (tema întunecată)": (
        {**FIXE, "soluția (alb)": SOLUTIE},
        {
            "în uz  #F97B06": INTERVAL,
            "turcoaz, înlocuit  #4CA49C": "#4CA49C",
            "violet, respins  #9B85D8": "#9B85D8",
            "turcoaz rece, respins  #48A3B5": "#48A3B5",
        },
    ),
    "SOLUȚIA (tema întunecată)": (
        {**FIXE, "intervalul (portocaliu)": INTERVAL},
        {
            "în uz  #F2F5FA": SOLUTIE,
            # Verdele de dinainte trecea față de desen, dar nu față de pivot:
            # verdele și coralul devin amândouă gălbui la deuteranopie.
            "verde, înlocuit  #4ADE80": "#4ADE80",
            "cyan, respins  #13D3EC": "#13D3EC",
            "violet, respins  #A871F4": "#A871F4",
        },
    ),
}

print("Distanță CIE76 (ΔE) față de vecinii din desen. Sub ~20 = greu de separat.\n")
for grup, (vecini, candidati) in GRUPE.items():
    print(f"### {grup}\n")
    for nume, culoare in candidati.items():
        print(nume)
        for et, vecin in vecini.items():
            normal = delta_e(culoare, vecin)
            prot = delta_e(simuleaza(culoare, "protanopie"), simuleaza(vecin, "protanopie"))
            deut = delta_e(simuleaza(culoare, "deuteranopie"), simuleaza(vecin, "deuteranopie"))
            cel_mai_prost = min(normal, prot, deut)
            semn = "  <-- risc" if cel_mai_prost < 20 else ""
            print(
                f"   {et:26s} normal {normal:5.1f}   protan {prot:5.1f}   deutan {deut:5.1f}"
                f"   min {cel_mai_prost:5.1f}{semn}"
            )
        print()

# ── Perechi care apar lipite în același desen ────────────────────────────────
#
# Nu sunt candidați pentru un rol nou, ci relații între roluri **existente**,
# care au ajuns să se atingă pe ecran. Se măsoară ca să nu se presupună.
#
# Triunghiul pantei (rol `curent`) se desenează peste dreapta de construcție
# (rol `anterior`), amândouă punctate. Măsurătoarea de mai jos arată că nuanța
# **nu** e un semnal suficient acolo: paleta e monocromă pe albastru, iar cele
# două roluri stau la ΔE 17, sub pragul de 20 — și asta chiar la vedere
# normală, nu doar la daltonism. Separarea reală vine din formă (triunghi cu
# unghi drept și etichetă vs. dreaptă care traversează tot cadrul) și din
# faptul că triunghiul poartă valoarea scrisă lângă el.
#
# Dacă vreodată se decide o culoare proprie pentru pantă, ea intră aici ca
# grupă, nu ca pereche.
PERECHI_LIPITE = {
    "triunghiul pantei (curent) / dreapta de construcție (anterior)": ("#0474C4", "#5379AE"),
}

print("### Perechi care se ating în același desen\n")
for eticheta, (a, b) in PERECHI_LIPITE.items():
    normal = delta_e(a, b)
    prot = delta_e(simuleaza(a, "protanopie"), simuleaza(b, "protanopie"))
    deut = delta_e(simuleaza(a, "deuteranopie"), simuleaza(b, "deuteranopie"))
    cel_mai_prost = min(normal, prot, deut)
    print(f"{eticheta}")
    print(
        f"   normal {normal:5.1f}   protan {prot:5.1f}   deutan {deut:5.1f}"
        f"   min {cel_mai_prost:5.1f}"
        f"{'   <-- separate prin formă, nu prin culoare' if cel_mai_prost < 20 else ''}"
    )
    print()

# Vizualizator de Metode Numerice

Site static, în limba română, în care studenții pot **vedea** și **se pot juca** cu metodele numerice:
o pagină-cuprins cu toate metodele și, pentru fiecare, o pagină cu explicație vizuală, un briefing scurt
și o interfață interactivă în care schimbi formula și parametrii, iar imaginea se schimbă odată cu ei.

- Viziunea proiectului: [`Plan.md`](./Plan.md)
- Planul de execuție, pe faze și cu checkbox-uri: [`Progress.md`](./Progress.md)

**Fără autentificare, fără cookies, fără tracking.** Site 100% static, servit pe HTTPS de pe GitHub Pages.

---

## Design

### Paletă — „Sapphire nightfall whisper"

> Valuri reci de ocean: albastruri de la deschis și aerisit până la adânc și misterios.
> Gradientul dă dimensiune și profunzime interfeței.

| Culoare                                                                 | Hex       | Rol în interfață                                                    |
| ----------------------------------------------------------------------- | --------- | ------------------------------------------------------------------- |
| ![#0474C4](https://placehold.co/16/0474C4/0474C4.png) Safir             | `#0474C4` | Accent principal — butoane primare, linia funcției, elementul activ |
| ![#5379AE](https://placehold.co/16/5379AE/5379AE.png) Albastru estompat | `#5379AE` | Accent secundar — iterații anterioare, elemente inactive, borduri   |
| ![#2C444C](https://placehold.co/16/2C444C/2C444C.png) Gri-verzui închis | `#2C444C` | Suprafețe — carduri, panouri de control, fundal tabel               |
| ![#A8C4EC](https://placehold.co/16/A8C4EC/A8C4EC.png) Albastru deschis  | `#A8C4EC` | Text pe fundal închis, accent luminos, grilă/etichete de axe        |
| ![#06457F](https://placehold.co/16/06457F/06457F.png) Albastru adânc    | `#06457F` | Accent apăsat — hover/active, umbre colorate, fundal de secțiune    |
| ![#262B40](https://placehold.co/16/262B40/262B40.png) Bleumarin închis  | `#262B40` | Fundalul temei întunecate (temă implicită)                          |

**Reguli de folosire**

- Tema implicită este cea **întunecată**: fundal `#262B40`, suprafețe `#2C444C`, text `#A8C4EC` / alb.
- Pe fundal închis, accentul de text este `#A8C4EC` (contrast ~8,5:1 față de `#262B40`), **nu** `#0474C4`
  (doar ~2,9:1 — prea slab pentru text; folosește-l ca umplere, nu ca text).
- Pe fundal deschis, `#0474C4` merge ca text și link (~4,8:1 față de alb — trece AA).
- În vizualizări, gradientul are un rol semantic: `#0474C4` = iterația curentă, `#5379AE` = iterații anterioare
  (estompate), `#A8C4EC` = grilă și adnotări, `#06457F` = interval/zonă evidențiată.
- Culorile pentru stări (succes / atenție / eroare) se derivă separat — paleta e monocromă pe albastru
  și nu poate purta singură sensul de „eroare".

Aceleași valori se folosesc și în scenele Manim (`manim/theme.py`), ca vizualurile pre-randate
să nu se bată cap în cap cu interfața.

### Tipografie

**Nunito Sans** — titluri și text. Sans-serif rotunjit, prietenos, lizibil la dimensiuni mici;
se potrivește tonului didactic al site-ului.

**JetBrains Mono** — formule, valori de parametri, tabele de iterații. Ales pentru cifrele
tabulare (coloanele se compară pe verticală) și pentru că distinge clar `0/O` și `1/l/I`.

- Grosimi folosite: 400 (text), 600 (subtitluri/UI), 700–800 (titluri).
- Ambele se **auto-găzduiesc** în `public/fonts` (fără CDN — nu facem cereri către domenii
  externe), ca variable fonts, subset latin + latin-ext.
- Diacriticele românești sunt verificate: Ș/ș/Ț/ț există la codepoint-urile cu **virgulă**
  (U+0218–U+021B), nu doar cu sedilă.

Detaliile complete (tokens, mișcare, componente, responsivitate, accesibilitate) sunt în
[`docs/design-system.md`](./docs/design-system.md). Ce am împrumutat de la alte site-uri și ce am
evitat: [`docs/referinte.md`](./docs/referinte.md).

---

## Cum rulezi local

Ai nevoie de **Node 22+** (vezi `.nvmrc`) și, pentru vizualuri, de **Python 3.12+**.

```bash
npm install
npm run dev        # server de dezvoltare → http://localhost:5173/numerical-methods-algo-visualizer/
npm run build      # build de producție în dist/
npm run preview    # verifică build-ul local
npm run lint       # oxlint + verificare formatare
npm run lint:fix   # repară ce se poate repara automat
npm run typecheck  # doar TypeScript
```

> Testele (`npm run test`) se adaugă în Faza 4, odată cu motorul de algoritmi.

### Structura

```
cursuri_MN/        materia predată — SINGURA sursă pentru formule și definiții
src/algorithms/    implementările numerice, fără JSX
src/components/    ui/ (shadcn), viz/ (grafic + controale), content/ (text), layout/
src/content/       textele în română, separate de cod
src/hooks/         hook-uri proprii (ex. tema)
src/lib/           utilitare: formatare, parser de expresii, matematică
src/pages/         paginile de rutare
src/styles/        @font-face și stiluri care nu sunt tokens
public/fonts/      fonturile auto-găzduite
public/media/      vizualurile Manim randate (mp4 + poster)
manim/             scenele Python
scripts/           întreținere: descărcare fonturi, verificare contrast
docs/              documentație de lucru
```

> **Conținutul site-ului vine exclusiv din `cursuri_MN/`.** Formulele, definițiile și notațiile
> se copiază de acolo, nu din alte surse. Maparea curs → pagină e în [`Plan.md`](./Plan.md).

### Vizualurile Manim

Scenele Manim se randează **offline**, local — niciodată în browser. Rezultatele (mp4 + poster)
ajung în `public/media/<slug>/` și sunt servite ca fișiere statice.

```bash
cd manim
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python render.py            # randează toate scenele
```

Partea interactivă (slidere, grafic live, tabel de iterații) e făcută în React, nu în Manim.

---

## Stack

- **React 19 + Vite 8 + TypeScript** (mod strict, alias `@/` → `src/`)
- **Tailwind v4 + shadcn/ui** — tokens definiți în `src/index.css`, cu punte către numele
  standard shadcn, ca să meargă și componente din Magic UI / Aceternity UI fără modificări
- **oxlint + Prettier** pentru lint și formatare
- **Manim (Python)** pentru vizualurile explicative pre-randate
- **GitHub Pages** pentru găzduire, cu deploy automat din `main`

## Cum lucrăm

**Până la primul deploy reușit: un singur branch, `main`, cu commit-uri directe. Fără PR-uri.**
Scopul e să iterăm repede până site-ul e efectiv live.

**După primul deploy** trecem pe regimul normal: branch protection pe `main`, orice schimbare
prin PR, CI verde obligatoriu. Convenția de branch-uri și template-urile de issue/PR se
stabilesc atunci — vezi pașii marcați cu 🔒 în Faza 1 din [`Progress.md`](./Progress.md).

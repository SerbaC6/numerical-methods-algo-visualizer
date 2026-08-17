# numerical-methods-visualizer

Site static, în limba română, în care studenții pot **vedea** și **se pot juca** cu metodele
numerice: o pagină-cuprins cu cele 18 pagini tematice și, pentru fiecare, un clip explicativ, teoria
pe scurt și o interfață interactivă în care schimbi funcția și parametrii, iar desenul se schimbă
odată cu ei.

**Live: <https://serbac6.github.io/numerical-methods-visualizer/>**

- Viziunea proiectului: [`Plan.md`](./Plan.md)
- Planul de execuție, pe faze și cu checkbox-uri: [`Progress.md`](./Progress.md)
- Regulile de lucru (limbă, conținut, paletă, granițe): [`CLAUDE.md`](./CLAUDE.md)

**Fără autentificare, fără cookies, fără tracking.** Site 100% static, servit pe HTTPS de pe GitHub
Pages. Fonturile sunt auto-găzduite, deci nu pleacă nicio cerere către domenii externe — singura
excepție e pagina `fft`, unde secțiunea „Vizual" e un clip găzduit de YouTube, și nici acolo nu se
încarcă nimic până când vizitatorul nu apasă pe redare. Singura scriere în `localStorage` e
preferința de temă (`mn-tema`).

---

## Design

### Paletă — „Sapphire nightfall whisper"

> Valuri reci de ocean: albastruri de la deschis și aerisit până la adânc și misterios.

Șase culori de interfață, atât. Nuanțele intermediare se **derivă** cu `color-mix(in oklab, …)`, nu
se adaugă culori noi.

| Culoare                                                                 | Hex       | Rol în interfață                                                    |
| ----------------------------------------------------------------------- | --------- | ------------------------------------------------------------------- |
| ![#0474C4](https://placehold.co/16/0474C4/0474C4.png) Safir             | `#0474C4` | Accent principal — butoane primare, linia funcției, elementul activ |
| ![#5379AE](https://placehold.co/16/5379AE/5379AE.png) Albastru estompat | `#5379AE` | Accent secundar — iterații anterioare, elemente inactive, borduri   |
| ![#2C444C](https://placehold.co/16/2C444C/2C444C.png) Ardezie           | `#2C444C` | Suprafețe pe tema luminoasă; grila din grafice                      |
| ![#A8C4EC](https://placehold.co/16/A8C4EC/A8C4EC.png) Cer               | `#A8C4EC` | Text pe fundal închis, grilă și etichete de axe                     |
| ![#06457F](https://placehold.co/16/06457F/06457F.png) Albastru adânc    | `#06457F` | Accent apăsat — hover/active, umpluturi, inel de focus              |
| ![#262B40](https://placehold.co/16/262B40/262B40.png) Noapte            | `#262B40` | Baza temei întunecate — fundalul și suprafețele se derivă din ea    |

**Reguli de folosire**

- Tema implicită este cea **luminoasă**: fundal `#F7F9FD`, suprafețe albe, text `#262B40`. Tema
  întunecată e la un clic distanță; fundalul ei (`#101320`) și suprafețele (`#242C41`, `#2A334B`)
  se derivă din noapte, deci rămân albastre, nu gri. Orice componentă nouă se verifică în ambele.
- Pe fundal deschis, accentul de **text** e safirul `#0474C4` (4,63:1 — trece AA), **nu** albastrul
  estompat (4,23:1). `#06457F` e pentru umpluturi, butoane și inelul de focus (9,20:1).
- Pe fundal închis, accentul de **text** e `#A8C4EC` (10,36:1); safirul dă doar 3,79:1 — umplere,
  niciodată text.
- Culorile pentru stări (succes / atenție / eroare) se derivă separat: paleta e monocromă pe
  albastru și nu poate purta singură sensul de „eroare".

### Culorile din desene

Vizualizările nu scriu culori direct: iau **roluri** din [`src/lib/viz-roles.ts`](./src/lib/viz-roles.ts),
de unde își ia culorile și legenda — deci legenda nu poate ajunge să contrazică desenul.

| Rol        | Ce înseamnă                                        |
| ---------- | -------------------------------------------------- |
| `functie`  | curba funcției                                     |
| `curent`   | iterația curentă                                   |
| `anterior` | iterațiile anterioare                              |
| `grila`    | grilă și adnotări                                  |
| `interval` | zona evidențiată (și linia activă dintr-o matrice) |
| `solutie`  | soluția                                            |
| `pivot`    | pivotul                                            |

Trei dintre ele nu pot fi albastre și au culoare proprie, aprobată explicit: **pivotul**
(`#C43314` / `#FF7A5C`), **intervalul** (`#BE7434` / `#F97B06`) și **soluția** (`#15803D` /
`#F2F5FA`). Fiecare rol are și o a doua valoare, `--viz-*-eticheta`, folosită exclusiv pentru
textul scris pe desen: pragul WCAG e 3:1 pentru un element grafic, dar 4,5:1 pentru literă.

Culorile se iau cu `culoareRol()` și `culoareEticheta()`, niciodată scrise de mână. La orice
schimbare de culoare se rulează `scripts/verifica-contrast.py` **și** `scripts/verifica-daltonism.py`:
prima măsoară contrastul față de fundal, a doua separarea dintre culorile care apar în **același**
desen, la protanopie și deuteranopie.

### Tipografie

**Nunito Sans** — titluri și text. Sans-serif rotunjit, prietenos, lizibil la dimensiuni mici; se
potrivește tonului didactic al site-ului.

**JetBrains Mono** — formule, valori de parametri, tabele de iterații. Ales pentru cifrele tabulare
(coloanele se compară pe verticală) și pentru că distinge clar `0/O` și `1/l/I`.

- Grosimi folosite: 400 (text), 600 (subtitluri/UI), 700–800 (titluri).
- Ambele se **auto-găzduiesc** în `public/fonts/`, ca variable fonts, subset latin + latin-ext.
- Diacriticele românești sunt verificate: Ș/ș/Ț/ț există la codepoint-urile cu **virgulă**
  (U+0218–U+021B), nu doar cu sedilă.
- Fonturile **nu** conțin exponenții și indicii folosiți în notație (`⁽ ⁾ ⁰ ᵏ ₁ ₂`), de aceea
  matematica din proză trece prin componenta `Mate`, nu se scrie ca text obișnuit.

Tokenii trăiesc într-un singur loc, [`src/index.css`](./src/index.css), în trei straturi: `@theme`
(culorile brute, tipografie, mișcare) → roluri semantice pe `:root`/`.light` și `.dark` →
`@theme inline`, care le expune ca utilitare Tailwind. Peste ele există o punte către numele
standard shadcn (`--background`, `--primary`, `--muted`…), ca să poți lipi componente din shadcn /
Magic UI / Aceternity fără să le rescrii.

Detaliile complete (tokens, mișcare, componente, responsivitate, accesibilitate) sunt în
[`docs/design-system.md`](./docs/design-system.md); în dezvoltare există și pagina live
`/design-system`. Ce am împrumutat de la alte site-uri și ce am evitat:
[`docs/referinte.md`](./docs/referinte.md).

---

## Cum rulezi local

Ai nevoie de **Node 22+** (vezi `.nvmrc`); scripturile de întreținere cer **Python 3.12+**.

```bash
npm install
npm run dev        # server de dezvoltare → http://localhost:5173/numerical-methods-visualizer/
npm run build      # build de producție în dist/
npm run preview    # verifică build-ul local
npm run lint       # oxlint + verificare formatare
npm run lint:fix   # repară ce se poate repara automat
npm run typecheck  # doar TypeScript
```

Atenție la `base` din `vite.config.ts`: site-ul se servește dintr-un subdirector, deci și local
adresa conține `/numerical-methods-visualizer/`.

### Verificări care nu sunt în build

Se rulează manual, când atingi partea pe care o acoperă:

```bash
bash scripts/verificare-algoritmi/ruleaza.sh   # verifică numeric algoritmii din src/, pe modulele reale
python3 scripts/verifica-contrast.py           # contrast WCAG, ambele teme
python3 scripts/verifica-daltonism.py          # separarea culorilor de vizualizare la daltonism
python3 scripts/descarca-fonturi.py            # reîmprospătează subseturile din public/fonts/
```

Verificările numerice compară rezultatele cu exemplele din `cursuri_MN/` și rulează **codul livrat**,
nu o reimplementare. Testele de UI (`npm run test`) încă nu există.

### Structura

```
cursuri_MN/        materia predată — SINGURA sursă pentru formule și definiții
src/algorithms/    implementările numerice, fără JSX; registry.ts = lista paginilor
src/components/
  ui/              shadcn/ui copiat în repo, re-colorat pe paletă
  viz/             aparatul de desen: Plot + straturi, MatrixGrid, Clip, controale
  content/         clipurile și interfețele fiecărei pagini
  layout/          antet, subsol, shell-ul aplicației
src/content/       textele în română, un fișier per slug, separate de cod
src/hooks/         hook-uri proprii (tema, dimensiune, derulare, camera 3D)
src/lib/           matematica desenului: scară, eșantionare, curbe de nivel, proiecție 3D,
                   mișcare, roluri de culoare, parser de expresii
src/pages/         paginile de rutare
src/styles/        @font-face
public/fonts/      fonturile auto-găzduite
animatii-sursa/    animațiile web din care s-au portat clipuri; nu intră în build
scripts/           întreținere: fonturi, contrast, daltonism, verificarea algoritmilor
docs/              documentație de lucru și erata cursurilor
```

> **Conținutul site-ului vine exclusiv din `cursuri_MN/`.** Formulele, definițiile, notațiile și
> exemplele se iau de acolo, nu din memorie și nu din alte surse. Maparea curs → pagină e în
> [`Plan.md`](./Plan.md). Unde cursul însuși greșește, formula nu ajunge pe site și diferența se
> notează în [`docs/erata-cursuri.md`](./docs/erata-cursuri.md), cu verificarea numerică care a
> prins-o.

---

## Cum e construită o pagină de metodă

Trei secțiuni, fiecare cu unealta ei — împărțirea e fixată și nu se renegociază per pagină:

| Secțiune            | Unealta                                     | La ce e bună                                                          |
| ------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| **Vizual**          | clip scris în cod (`Clip`, pe ceas propriu) | „despre ce e vorba", în treizeci de secunde, înainte de orice formulă |
| **Teorie pe scurt** | `TeorieScurta` + `FormulaBlock`             | formulele, legenda literelor, ce n-ar spune formula singură           |
| **Interactiv**      | `motion` + straturile `Plot` / `MatrixGrid` | „ce se întâmplă dacă schimb eu asta"                                  |

Clipurile se scriu **în cod**, nu se randează offline: culorile vin din `viz-roles.ts`, deci se văd
corect în ambele teme; cifrele vin din `src/algorithms/`, deci desenul și textul nu se pot
contrazice; textul rămâne text, deci se citește cu cititorul de ecran; iar `prefers-reduced-motion`
e respectat cu adevărat.

Matematica stă în `src/algorithms/` și nu conține JSX — fiecare metodă exportă `meta`, `params` și
`run(params)`, și produce `steps[]`, fiecare pas cu explicația lui. Piesele din `src/components/viz/`
primesc pașii gata calculați și **nu conțin matematică**. Expresiile scrise de utilizator nu se
evaluează niciodată cu `eval`.

Nu toate paginile au toate cele trei secțiuni: unde o piesă lipsește **prin decizie**, lipsește de
tot — fără schelet și fără text de așteptare. Ce urmează se ține exclusiv în `Progress.md`, niciodată
în interfață.

---

## Stack

- **React 19 + Vite 8 + TypeScript** — mod strict, `noUncheckedIndexedAccess`, alias `@/` → `src/`
- **Tailwind v4 + shadcn/ui** — tokens în `src/index.css`, cu punte către numele standard shadcn
- **motion** pentru animație (geometria SVG); CSS pentru culori — granița e în
  [`src/components/viz/README.md`](./src/components/viz/README.md)
- **KaTeX** pentru formule, cu `\htmlId` ca să se poată lega formula de desen
- **react-router** pentru rutare
- **oxlint + Prettier** (100 de coloane, ghilimele duble, `prettier-plugin-tailwindcss`)
- **GitHub Pages** pentru găzduire, cu deploy din `main`

---

## Cum contribui

Două workflow-uri se ocupă de tot ce vine după `git push`:

- **`.github/workflows/ci.yml`** — lint, verificare de tipuri, teste (când vor exista) și build, la
  fiecare push în `main` și la fiecare pull request.
- **`.github/workflows/deploy.yml`** — build și publicare pe GitHub Pages, la fiecare push în `main`.
  `base` se ia din numele repo-ului (`actions/configure-pages`), deci o redenumire a repo-ului nu
  cere și o modificare în `vite.config.ts`.

Înainte de commit, rulează local ce rulează și CI-ul: `npm run lint && npm run typecheck && npm run build`.

### Convenția de commit-uri

[Conventional Commits](https://www.conventionalcommits.org/), cu **descrierea în română, cu
diacritice** — ca tot restul proiectului:

```
<tip>(<domeniu>): <ce s-a schimbat, la timpul prezent, fără punct final>
```

Tipurile folosite: `feat`, `fix`, `docs`, `refactor`, `style`, `perf`, `test`, `chore`.
Domeniul e partea atinsă — `pagina 17`, `antet`, `culori`, `viz`, `clipuri`, `public` — și poate
lipsi când schimbarea e transversală.

```
feat(pagina 17): cuadraturi adaptive și Gaussiene, cu graficul în centru
fix(antet): sigla stă la aceeași distanță de margine ca butonul de temă
docs(culori): rolurile `--viz-*` se împart între interfețe și clipuri
```

Nu scrie în mesaj de ce era greșit înainte, ci ce e adevărat după: mesajul se citește peste un an,
lângă `git blame`, de cineva care nu ține minte discuția.

### Regimul de branch-uri

**Până la primul deploy reușit: un singur branch, `main`, cu commit-uri directe.** După aceea
se trece pe branch protection și pull request-uri obligatorii, cu CI verde ca să se poată face merge.

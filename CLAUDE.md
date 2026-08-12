# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Limba

Tot ce ajunge la utilizator — UI, texte, comentarii în cod, commit-uri, documentație — se scrie
**în română, cu diacritice** (Ș/ș/Ț/ț cu virgulă, U+0218–U+021B). Identificatorii din cod sunt tot
în română (`verificaExpresie`, `--fundal`, `VITEZE`); numele shadcn/ui rămân în engleză.

## Înainte de orice sesiune de lucru

Citește **[`Plan.md`](./Plan.md)** (viziunea, cele 14 pagini și ce trebuie să conțină fiecare) și
**[`Progress.md`](./Progress.md)** (fazele, checkbox-urile, deciziile deschise). Progress.md se
actualizează la finalul fiecărei sesiuni — bifezi ce ai terminat.

## Comenzi

```bash
npm install
npm run dev        # http://localhost:5173/numerical-methods-algo-visualizer/ (atenție la base path)
npm run build      # tsc -b && vite build → dist/
npm run preview
npm run typecheck  # tsc -b --noEmit
npm run lint       # oxlint + prettier --check
npm run lint:fix
```

Testele nu există încă; se introduc în Faza 4, odată cu `src/algorithms/`.

Manim (offline, local — niciodată în browser):

```bash
cd manim && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && python render.py
```

Scripturile din `scripts/` (`descarca-fonturi.py`, `verifica-contrast.py`) se rulează manual, cu
Python 3 pur, și nu fac parte din build.

## Regula de conținut (nenegociabilă)

**Formulele, definițiile, notațiile și exemplele vin exclusiv din `cursuri_MN/`** (12 fișiere de
curs + 21 de capturi în `cursuri_MN/poze/`). Nimic din memorie, nimic din alte surse. Înainte să
scrii o pagină, citește întâi cursul-sursă indicat în tabelul din Faza 7 din `Progress.md`.
Inspirația pentru animații și interfețe poate veni de oriunde — formulele nu.

Fiecare interfață interactivă trebuie să aibă legendă și explicație a modului de funcționare, și să
facă paralela explicită formulă ↔ animație (ce parte din formulă corespunde cărui element vizual).

## Arhitectură

Site 100% static, fără auth, fără cookies, fără tracking, fără cereri către domenii externe (de
aceea fonturile sunt auto-găzduite în `public/fonts/`). Singura scriere în `localStorage` e
preferința de temă (`mn-tema`). Deploy pe GitHub Pages ca _project page_ — de aici `base` din
`vite.config.ts`; dacă se trece pe domeniu propriu, `base` devine `/`.

Separarea de bază, care ține tot proiectul:

- `src/algorithms/` — matematica, **fără JSX**. Fiecare metodă exportă `meta`, `params`, `run(params)`
  și produce `steps[]`, fiecare pas cu explicația lui de o propoziție. `registry.ts` e sursa unică
  de adevăr pentru ce metode există pe site. Testabil complet independent de UI.
- `src/components/viz/` — aparatul interactiv (`ControlPanel`, `PlaybackBar`, `IterationTable`,
  `FormulaBlock`, `NumberInput`, `ExpressionInput`). **Nu conțin matematică** — primesc `steps[]`
  gata calculați.
- `src/content/` — textele în română (briefing, instrucțiuni, capcane), un fișier per slug, ca să
  se poată corecta fără să atingi logica.
- `src/components/ui/` — shadcn/ui copiat în repo; e cod al proiectului, se poate modifica, dar
  re-colorează-l pe paletă. Exclus din lint în `.oxlintrc.json`.
- `src/lib/`, `src/hooks/`, `src/pages/`, `src/styles/`, `public/media/` (Manim randat), `manim/`.

Evaluarea expresiilor utilizatorului: **niciodată `eval`**. `src/lib/expresii.ts` face doar
validare de suprafață; parserul adevărat vine în Faza 4.

## Design system

### Paleta — „Sapphire nightfall whisper" (DECISĂ, închisă)

> **NICIODATĂ nu folosi altă culoare în afara acestei liste.** Nu inventa culori, nu „completa"
> paleta, nu împrumuta culori din exemple de pe net, din shadcn, din Magic UI sau din Tailwind
> (`slate-800`, `blue-500` etc. sunt interzise). Singura excepție deja existentă sunt stările
> succes/atenție/eroare, definite explicit în `src/index.css`.
>
> Dacă o componentă sau o vizualizare pare că are nevoie de o culoare nouă: **oprește-te și
> întreabă-mă**. Nu adăuga culoarea și nu explica după aceea — decizia de culoare e a mea, nu a ta.
> Doar dacă îți spun eu explicit „folosește culoarea X" intră ceva nou în paletă, și atunci intră
> ca token în `src/index.css` și se oglindește în `manim/theme.py`, nu scris direct în componentă.

Șase culori, atât. Dacă ai nevoie de o nuanță intermediară, **derivă** din cele de mai jos cu
`color-mix(in oklab, …)`, cum se face deja în `src/index.css` — asta nu e culoare nouă.

| Hex       | Token              | Rol                                                               |
| --------- | ------------------ | ----------------------------------------------------------------- |
| `#0474C4` | `--color-safir`    | accent principal — buton primar, linia funcției, iterația curentă |
| `#5379AE` | `--color-estompat` | accent secundar — iterații anterioare, elemente inactive, borduri |
| `#2C444C` | `--color-ardezie`  | suprafețe — carduri, panouri de control, fundal de tabel          |
| `#A8C4EC` | `--color-cer`      | text pe fundal închis, grilă și etichete de axe                   |
| `#06457F` | `--color-adanc`    | accent apăsat — hover/active, interval evidențiat                 |
| `#262B40` | `--color-noapte`   | fundalul temei întunecate (tema implicită)                        |

**Tipografie:** **Nunito Sans** pentru titluri și text, **JetBrains Mono** pentru formule, valori
de parametri și tabele de iterații (cifre tabulare, distinge `0/O` și `1/l/I`). Ambele
auto-găzduite în `public/fonts/`, fără CDN.

### Cum se folosesc

Tokenii trăiesc într-un singur loc: `src/index.css`, în trei straturi —
`@theme` (culorile brute de mai sus, tipografie, mișcare, umbre) → roluri semantice pe
`:root, .dark` și `.light` → `@theme inline` care le expune ca utilitare Tailwind. Peste ele există
o **punte către numele standard shadcn** (`--background`, `--primary`, `--muted`…), ca să poți lipi
componente din shadcn/Magic UI/Aceternity fără să le rescrii.

Scrie întotdeauna rolul semantic (`bg-suprafata`, `text-text-slab`, `--viz-curent`), nu hexul brut.

- Tema implicită e cea **întunecată**; `:root` conține deja valorile închise, ca pagina să nu
  pâlpâie înainte să ruleze JS-ul (`initTheme()` din `src/hooks/use-theme.ts`, apelat în `main.tsx`).
  Există și temă deschisă (`.light`) — orice componentă nouă se verifică în ambele.
- Culorile de vizualizare au rol semantic fix: `--viz-curent` = iterația curentă,
  `--viz-anterior` = iterații anterioare, `--viz-functie` = curba, `--viz-grila` = grilă/adnotări,
  `--viz-interval` = zona evidențiată. Aceleași valori se oglindesc în `manim/theme.py`, ca
  vizualurile pre-randate să nu se bată cap în cap cu interfața.
- Paleta e monocromă pe albastru, deci nu poate purta singură sensul de „eroare": stările
  (succes/atenție/eroare) sunt derivate separat, în afara paletei.
- `#0474C4` nu se folosește ca text pe fundal închis (~2,9:1) — pe închis, accentul de text e
  `#A8C4EC` (~8,5:1). Pe fundal deschis, `#0474C4` trece AA (~4,8:1) ca text și link.
  Verifică cu `scripts/verifica-contrast.py`.
- Mișcarea are trei trepte: `--duration-rapid` / `-mediu` / `-lent`. Detaliile complete:
  [`docs/design-system.md`](./docs/design-system.md).

Mobilul nu e opțional: fiecare vizualizare și fiecare set de controale trebuie să se comporte
corect în portret și peisaj.

## Convenții

- TypeScript strict, cu `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`,
  `verbatimModuleSyntax` și `erasableSyntaxOnly` — fără `enum`/`namespace`, importurile de tipuri
  se scriu `import type`.
- Alias `@/` → `src/`.
- Prettier: 100 de coloane, ghilimele duble, `prettier-plugin-tailwindcss` (ordinea claselor se
  rezolvă automat — nu o rearanja manual).
- Node 22+ (`.nvmrc`), Python 3.12+ pentru vizualuri.

## Git

**Până la primul deploy reușit: doar `main`, commit-uri directe, fără PR-uri.** După primul deploy
se trece pe branch protection + PR-uri obligatorii (pașii marcați cu 🔒 în Faza 1 din `Progress.md`).

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

### Corectitudinea matematică — zero greșeli, fără excepții

**Nimic din ce ajunge sub ochii utilizatorului nu are voie să fie greșit matematic.** Nici o
formulă, nici un semn, nici un indice, nici un rezultat intermediar, nici o propoziție care descrie
un pas. Nu există „aproximativ corect" și nu există greșeală acceptabilă fiindcă e „doar o
demonstrație" sau „doar în galerie". Site-ul e material de învățat: un student care memorează o
formulă greșită de aici o duce mai departe la examen.

Asta se aplică la **tot** — formule, exemple numerice, etichete, explicații de pas, texte de
legendă, comentarii din cod, rezumate pentru cititorul de ecran.

**Nu ai voie să scrii matematică din memorie.** Deschizi fișierul din `cursuri_MN/` și îl citești
înainte, de fiecare dată, chiar dacă „știi" rezultatul.

Înainte să declari gata orice piesă cu conținut matematic:

1. **Verifică față de sursă.** Fiecare formulă și fiecare exemplu se compară cu cursul, nu cu
   intuiția. Dacă cursul dă un exemplu rezolvat, folosește-l pe acela.
2. **Verifică numeric, separat.** Rulează calculul independent de aplicație (un script scurt) și
   compară cifră cu cifră cu ce e în curs. Nu te baza pe faptul că pare corect pe ecran.
3. **Verifică semnele și indicii.** Aici apar cele mai multe greșeli: `−(−2)` scris ca `−2`, indici
   0-based afișați ca 1-based, `µ` calculat înainte sau după transformare, minus tipografic
   confundat cu cratimă.
4. **Verifică cazurile-limită** cerute de metodă: pivot nul, împărțire la zero, divergență,
   interval greșit. Dacă metoda eșuează, textul trebuie să spună corect **de ce**.
5. **Verifică coerența** dintre formulă, desen, tabel și propoziție. Toate patru descriu același
   pas; dacă una spune altceva, e greșeală, chiar dacă fiecare în parte pare corectă.

Dacă nu poți verifica ceva — nu îl scrii. Spui că nu ai putut verifica și te oprești acolo. **Un
gol declarat e acceptabil; o afirmație matematică negarantată, nu.**

Când notația intuitivă cerută pentru interfață diferă de cea din curs (de ex. `L₁`/`C₁` în loc de
`E₁`/`x₁`), se schimbă **doar numele**, niciodată cifrele sau operațiile — iar diferența se notează
în cod, ca să se poată pune notația din curs alături pe pagina reală.

## Stările de progres nu ajung niciodată în interfață

**Pe site nu apare nicio etichetă de stare: „în lucru", „în curând", „urmează", „TODO", „beta",
„work in progress" sau orice altă formulă care spune vizitatorului că ceva nu e gata.** Fără
badge-uri de progres, fără secțiuni „ce urmează", fără note de scuze. Regula ține și de anunțuri:
nu promitem în interfață pagini sau funcții viitoare.

Ce nu e gata are două variante, ambele tăcute:

- **lipsește din interfață** — nu adaugi linkul, nu adaugi rândul; sau
- **stă ca placeholder neutru** — un `Skeleton`, un card gol, un spațiu rezervat, fără text care
  să explice că lipsește ceva.

Evidența a ce urmează se ține **exclusiv în `Progress.md`**. Acolo scrii tot: ce e schelet, ce
pagini vin, ce s-a amânat. În `src/` — nimic.

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
> (`slate-800`, `blue-500` etc. sunt interzise). Excepțiile deja aprobate, toate definite explicit
> în `src/index.css`, sunt stările succes/atenție/eroare și cele două culori de vizualizare care
> nu pot fi albastre: `--viz-solutie` (verde) și `--viz-pivot` (vermillion, vezi mai jos).
>
> Dacă o componentă sau o vizualizare pare că are nevoie de o culoare nouă: **oprește-te și
> întreabă-mă**. Nu adăuga culoarea și nu explica după aceea — decizia de culoare e a mea, nu a ta.
> Doar dacă îți spun eu explicit „folosește culoarea X" intră ceva nou în paletă, și atunci intră
> ca token în `src/index.css` și se oglindește în `manim/theme.py`, nu scris direct în componentă.

Șase culori de interfață, atât. Dacă ai nevoie de o nuanță intermediară, **derivă** din cele de mai jos cu
`color-mix(in oklab, …)`, cum se face deja în `src/index.css` — asta nu e culoare nouă.

| Hex       | Token              | Rol                                                               |
| --------- | ------------------ | ----------------------------------------------------------------- |
| `#0474C4` | `--color-safir`    | accent principal — buton primar, linia funcției, iterația curentă |
| `#5379AE` | `--color-estompat` | accent secundar — iterații anterioare, elemente inactive, borduri |
| `#2C444C` | `--color-ardezie`  | suprafețe — carduri, panouri de control, fundal de tabel          |
| `#A8C4EC` | `--color-cer`      | text pe fundal închis, grilă și etichete de axe                   |
| `#06457F` | `--color-adanc`    | accent apăsat — hover/active, interval evidențiat                 |
| `#262B40` | `--color-noapte`   | fundalul temei întunecate (tema implicită)                        |

#### Vermillionul pivotului — `--viz-pivot` (aprobat explicit)

`#C43314` pe tema luminoasă, `#FF7A5C` pe cea întunecată. **Nu e a șaptea culoare de interfață**:
nu se folosește niciodată pentru butoane, text, suprafețe sau borduri de UI. E un **rol de
vizualizare**, exact ca `--viz-solutie`, care e verde din același motiv — paleta e monocromă pe
albastru și nu poate purta singură anumite sensuri.

Există fiindcă pivotul e elementul cel mai important dintr-o eliminare și trebuie să sară în ochi
peste toate albastrurile. O a treia nuanță de albastru l-ar fi îngropat într-un degrade.

> **Pe grilă, roșul înseamnă exclusiv „pivot".** Erorile reale — pivot nul, împărțire la zero,
> divergență — **nu colorează celule**; se scriu ca text în `Callout`. Motivul e măsurat, nu
> estetic: `--viz-pivot` și `--eroare` au luminanțe aproape egale (raport ~1,0), deci s-ar
> distinge doar prin nuanță și s-ar confunda pentru cine are daltonism roșu-verde.

Cifra de pe o celulă umplută cu vermillion își schimbă culoarea între teme: **albă** pe `#C43314`
(5,48:1), **`#262B40`** pe `#FF7A5C` (5,45:1). Inversul pică sub prag în ambele cazuri, iar
`scripts/verifica-contrast.py` are ambele greșeli ca teste care trebuie să pice.

Când se scrie `manim/theme.py` (Faza 5), tokenul se oglindește și acolo.

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
  `--viz-interval` = zona evidențiată (și linia activă dintr-o matrice), `--viz-solutie` = soluția,
  `--viz-pivot` = pivotul. Sursa unică e `src/lib/viz-roles.ts`, de unde își ia și `Legend`
  culorile — deci legenda nu poate ajunge să contrazică desenul. Aceleași valori se oglindesc în
  `manim/theme.py`, ca vizualurile pre-randate să nu se bată cap în cap cu interfața.
- Paleta e monocromă pe albastru, deci nu poate purta singură sensul de „eroare": stările
  (succes/atenție/eroare) sunt derivate separat, în afara paletei.
- `#0474C4` nu se folosește ca text pe fundal închis (~2,9:1) — pe închis, accentul de text e
  `#A8C4EC` (~8,5:1). Pe fundal deschis, `#0474C4` trece AA (~4,8:1) ca text și link.
  Verifică cu `scripts/verifica-contrast.py`.
- Mișcarea are trei trepte: `--duration-rapid` / `-mediu` / `-lent`. Detaliile complete:
  [`docs/design-system.md`](./docs/design-system.md).

Mobilul nu e opțional: fiecare vizualizare și fiecare set de controale trebuie să se comporte
corect în portret și peisaj.

## TODO — animații și interfețe grafice

Ordinea de lucru pentru partea vizuală, **de la cel mai ușor la cel mai greu**. Dificultatea nu e
dată de matematică, ci de **primitiva de desen** pe care o cere pagina: cât timp o pagină
refolosește o primitivă deja construită, e ieftină; când cere una nouă, aceea e munca reală.

Referințele vizuale (ce împrumutăm și ce evităm de la fiecare site analizat) stau în
[`docs/referinte.md`](./docs/referinte.md) — se citește **înainte** de a începe o etapă, nu după.

Regulile care se aplică la fiecare punct de mai jos, fără excepție:

- culorile vin din `src/lib/viz-roles.ts` (`--viz-*`), niciodată scrise direct în componentă;
- fiecare interfață primește **legendă** (`Legend`) + **mod de folosire** în 3–5 pași;
- fiecare interfață face **paralela explicită formulă ↔ desen** (ce parte din formulă e ce
  element vizual), prin `FormulaBlock` cu `\htmlId`;
- matematica stă în `src/algorithms/`, desenul primește `steps[]` gata calculați;
- verificat în ambele teme, în portret și în peisaj, cu `prefers-reduced-motion`.

### Etapa 0 — primitivele de bază (blochează tot restul)

- [x] **`StepExplanation`** — propoziția care spune ce se întâmplă la pasul curent, lângă desen.
      Cea mai ieftină piesă și cea mai des folosită: intră pe toate cele 14 pagini.
- [x] **`MatrixGrid`** — matricea desenată, cu stări per celulă (normală, evidențiată, deja
      calculată, pivot, zero). Fără sistem de coordonate, doar grilă + tranziții.
      Necesară pe paginile **1, 3, 4, 7, 8, 13**.
- [x] **`Plot`** — axe, grilă, etichete, scalare automată, eșantionarea funcției, `ResizeObserver`,
      zoom/pan. Cea mai grea piesă de fundație și cea de care atârnă opt pagini
      (**5, 6, 9, 10, 11, 12, 13, 14**). **SVG scris de mână**, fără bibliotecă de charting —
      Recharts/visx/D3 sunt gândite pentru date de business și încurcă exact ce ne trebuie (o
      tangentă care apare la pasul 3, un interval care se strânge), plus 40–100 KB. Se compune din
      straturi cu nume (`PlotCurba`, `PlotPunct`, `PlotInterval`, `PlotArie`, `PlotDreapta`), iar
      matematica lui stă în `src/lib/plot-scara.ts` și `plot-esantionare.ts`, verificată numeric.

### Etapa 1 — pagini ușoare (refolosesc primitivele de mai sus)

- [ ] **Pagina 5 — `ecuatii-neliniare`** (puncte fixe, bisecție, Newton, secantă). `Plot` + marker
      de punct, dreaptă tangentă/secantă, interval care se strânge. Interfețe interactive, nu
      animații. E pagina-pilot naturală: cea mai mică distanță între formulă și desen.
- [ ] **Pagina 12 — `derivare-si-integrare`** (Newton-Cotes, trapeze, Simpson). `Plot` + arii
      colorate sub curbă. Primitivă nouă: poligon/arie umplută. Fără stare iterativă complicată.
- [ ] **Pagina 1 — `factorizari-lu`** (Cramer, LU, Doolittle, Crout, Cholesky). `MatrixGrid` +
      umplere celulă cu celulă, plus spargerea matricei în două. **Fără input manual de valori**
      (cerință din `Plan.md`).
- [ ] **Pagina 3 — `eliminare-gaussiana`** (pivotări, Thomas). `MatrixGrid` + operații pe linii.
      Primitivă nouă: linia care se mută, se schimbă cu alta și se scalează.
- [ ] **Pagina 9 — `interpolare-polinomiala`** (Lagrange, Neville, Runge, spline). `Plot` + puncte
      pe care utilizatorul le trage cu mouse-ul. Primitivă nouă: punct interactiv (drag).

### Etapa 2 — pagini medii (cer o primitivă nouă fiecare)

- [ ] **Pagina 4 — `metode-iterative`** (Jacobi, Gauss-Seidel, SOR). `MatrixGrid` + al doilea desen,
      de convergență (eroarea pe iterații). Două vizualizări sincronizate pe același `steps[]`.
- [ ] **Pagina 13 — `romberg-si-cuadraturi`**. `MatrixGrid` triunghiular pentru Romberg + `Plot`
      pentru cuadraturi adaptive și Gaussiene. Dificultatea e că pagina cere ambele primitive.
- [ ] **Pagina 14 — `ecuatii-diferentiale`** (Cauchy, Euler, Runge-Kutta). `Plot` + **câmp de
      direcții** — primitivă nouă: multe segmente scurte orientate, desenate eficient.
- [ ] **Pagina 2 — `norme-si-ortogonalitate`** (norme, Householder, Givens, Gram-Schmidt).
      Primitive noi: vector cu vârf de săgeată, reflexie și rotație interactivă, plus **jocul**
      de Gram-Schmidt (inspirație: PerfectlyNormal, dar cu pași mult mai clari).

### Etapa 3 — pagini grele (primitive scumpe, de atacat la final)

- [ ] **Pagina 7 — `metodele-puterii`** (puterea, puterea inversă, Rayleigh, deflație, PageRank).
      `MatrixGrid` + vector care converge la direcția proprie + **graf cu noduri și muchii**
      pentru PageRank. Trei feluri de desen pe o singură pagină.
- [ ] **Pagina 8 — `qr-si-dvs`**. `MatrixGrid` pentru iterațiile QR + interpretarea geometrică a
      DVS: **cerc unitate → elipsă**, primitivă nouă care trebuie legată de valorile singulare.
- [ ] **Pagina 10 — `curbe-bezier`** (Bézier, de Casteljau, 2D **și 3D**). Interpolarea de Casteljau
      e ușoară în 2D; comutatorul 2D/3D cerut în `Plan.md` înseamnă **proiecție 3D scrisă de mână**
      plus rotirea scenei — de departe cea mai mare bucată de cod nou.
- [ ] **Pagina 6 — `metode-de-gradient`** (gradient descendent și conjugat, „valea"). Primitivă
      nouă: **curbe de nivel** (isolinii) peste o funcție de două variabile, plus traseul care
      coboară. Întâi animații explicative, apoi interfața de aprofundare.
- [ ] **Pagina 11 — `cmmp-si-fft`**. CMMP e ușor (`Plot` + dreapta de aproximare, refolosește tot).
      **FFT e cel mai greu vizual din site**: plan complex, rădăcini ale unității și schema
      recursivă („fluture"). De lăsat ultimul, indiferent de ordinea din care se lucrează.

### Decizii de luat înainte de Etapa 0

- [x] ~~`MatrixGrid` cere stări de celulă care nu există în `viz-roles.ts`~~ → **rezolvat**: s-a
      adăugat un singur rol nou, `pivot`, cu vermillionul aprobat explicit (vezi secțiunea de
      paletă). Restul stărilor refolosesc roluri existente — linia activă e `--viz-interval`, iar
      zerourile produse se estompează, fără culoare proprie.
- [ ] Decizia despre `motion`: e deja în bundle prin `TextFlippingBoard` din hero. Ori se asumă și
      se folosește și pentru animațiile de pe paginile de metodă, ori se taie din hero și rămânem
      pe CSS. De hotărât **înainte** de prima pagină, nu după.

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

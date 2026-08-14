# Progress — Vizualizator de Metode Numerice

Documentul de lucru al proiectului. Sursa viziunii: [`Plan.md`](./Plan.md).
Se actualizează la **fiecare** sesiune de lucru: bifezi ce ai terminat.

> **Sursa de adevăr pentru conținut: [`cursuri_MN/`](./cursuri_MN)** — 12 fișiere de curs
> (`.md`) plus 21 de capturi în `cursuri_MN/poze/`. Formulele, definițiile, notațiile și
> exemplele de pe site vin **exclusiv** de acolo; aceea e materia predată. Inspirația pentru
> animații și interfețe poate veni de oriunde, dar **formulele nu se schimbă**.
> Maparea curs → pagină e în [`Plan.md`](./Plan.md#material-sursa-folderul-cursuri_mn).

**Decizii deschise:**

- [x] ~~**Lista celor ~15 metode numerice**~~ → ~~**14 pagini tematice**~~ → **19 pagini tematice**
      (cinci metode care stăteau la coada altei pagini au primit pagină proprie), stabilite în
      [`Plan.md`](./Plan.md), secțiunea „Lista Algoritmi"; detaliate în tabelul din Faza 7
- [x] ~~Fonturi și temă~~ → paleta **„Sapphire nightfall whisper"** + **Nunito Sans** (vezi [`README.md`](./README.md#design))
- [x] ~~Font monospace pentru formule și tabele numerice~~ → **JetBrains Mono** (cifre tabulare,
      distinge `0/O` și `1/l/I`), self-hosted lângă Nunito Sans
- [ ] Domeniu: `github.io` sau domeniu propriu
- [ ] Unde stau fișierele Manim: în repo sau în GitHub Releases
- [ ] MDX pentru conținut sau fișiere TypeScript simple
- [ ] `HashRouter` vs. `BrowserRouter` + `404.html`

**Ordinea fazelor și dependențele:**

```
Faza 0 ──> Faza 1 ──> Faza 2 ──> Faza 3 ──┐
                          │               ├──> Faza 6 ──> Faza 7 ──> Faza 8 ──> Faza 9 ──> Faza 10
                          └──> Faza 4 ────┤
                               Faza 5 ────┘   (Faza 5 poate merge în paralel cu 3–4)
```

---

## Faza 0 — Fundație și tooling ✅

**Obiectiv:** un proiect React care pornește local, cu lint și formatare puse la punct.

- [x] Inițializare proiect
  - [x] Vite + React 19 + TypeScript (scaffold `react-ts`, Vite 8)
  - [x] `npm install` și verificare `npm run dev` — pagina se deschide pe `/numerical-methods-algo-visualizer/`
  - [x] Fixare versiune Node în `.nvmrc` (22) + câmpul `engines` din `package.json`
  - [x] Curățare boilerplate Vite (logo-uri, `App.css`, `src/assets`)
- [x] Structura de foldere
  - [x] `src/pages/` — pagini de rutare
  - [x] `src/components/ui/` — componente generice (shadcn)
  - [x] `src/components/viz/` — componente de vizualizare
  - [x] `src/components/layout/`
  - [x] `src/algorithms/` — implementările numerice, fără JSX
  - [x] `src/content/` — texte în română, separate de cod
  - [x] `src/lib/` — utilitare (are deja `cn()` în `utils.ts`)
  - [x] `src/hooks/`
  - [x] `public/media/`, `public/fonts/`
  - [x] `manim/` + `manim/scenes/` — scene Python (izolat de aplicație)
  - [x] `docs/`
  - [x] Fișier `README` scurt în fiecare folder care nu e evident
- [x] `.gitignore`
  - [x] `node_modules/`, `dist/`, `.vite/`, `coverage/`
  - [x] `.env*`, `*.local`
  - [x] `manim/media/`, `__pycache__/`, `.venv/`
  - [x] `.DS_Store`, `Thumbs.db`
  - [ ] Verificare: `git status` e curat și după o randare Manim (de reverificat în Faza 5)
- [x] Calitatea codului
  - [x] ~~ESLint~~ → **oxlint** (noul default al scaffold-ului Vite, mult mai rapid; `.oxlintrc.json` cu plugin react/typescript, `src/components/ui` exclus fiind cod copiat)
  - [x] Prettier + `.prettierrc.json` + `prettier-plugin-tailwindcss` (sortează clasele)
  - [x] `.editorconfig` (LF, 2 spații, UTF-8, newline la final; 4 spații pentru Python)
  - [x] Scripturi `npm`: `dev`, `build`, `preview`, `lint`, `lint:fix`, `format`, `typecheck` — `test` se adaugă în Faza 4
  - [x] TypeScript strict (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`)
  - [x] Path alias `@/` în `tsconfig.app.json` + `vite.config.ts`
- [x] Librăria de componente
  - [x] Ales: **shadcn/ui** (new-york) — cod copiat în proiect, nu dependență; se poate re-colora liber. Magic UI și Aceternity UI se așază peste el, aceeași abordare.
  - [x] Tailwind v4 prin `@tailwindcss/vite` (fără `tailwind.config.js` — tokens direct în `src/index.css`)
  - [x] Paleta „Sapphire nightfall whisper" + rolurile de vizualizare, ca variabile CSS
  - [x] Punte de tokens către numele standard shadcn (`--background`, `--primary`, …), ca să meargă și componentele împrumutate
  - [x] Button, Card, Slider adăugate și verificate în pagina de smoke test
  - [x] Licențe: shadcn/ui, Radix, Tailwind, oxlint, Vite — toate MIT
- [x] `README.md` actualizat
  - [x] Ce este proiectul, pentru cine, în română
  - [x] Cerințe (Node 22+, Python 3.12+ pentru Manim)
  - [x] Cum rulezi local, cum faci build, cum randezi scenele Manim
  - [x] Structura folderelor
  - [x] Secțiunea Design (paletă + tipografie)
  - [ ] Cum contribui (link la convenția de commit-uri — se scrie în Faza 1)

**Gata când:** `npm run dev`, `npm run build` și `npm run lint` trec fără erori pe o mașină curată, iar `git status` e curat. ✅ _(build: 250 KB JS / 79 KB gzip — de urmărit față de bugetul din Faza 9)_

---

## Faza 1 — Git, GitHub, CI și deployment

**Obiectiv:** orice merge în `main` ajunge automat live, pe HTTPS.

> ### ⚠️ Regim de lucru până la primul deploy reușit
>
> **Un singur branch — `main`. Commit-uri directe. Fără PR-uri, fără branch protection.**
> Până când site-ul nu e efectiv live, ceremonia de PR-uri doar încetinește; iterăm rapid direct pe `main`.
>
> **După primul deploy reușit** trecem pe regimul normal: branch protection pe `main`,
> orice schimbare prin PR, CI verde obligatoriu. Task-urile marcate cu 🔒 mai jos
> se activează abia atunci.

- [ ] Repo GitHub
  - [ ] Creare repo (public), push `main`
  - [ ] Descriere + topics (`numerical-methods`, `education`, `react`, `manim`, `romanian`)
  - [ ] Licență aleasă și adăugată (`LICENSE`)
  - [ ] 🔒 Branch protection pe `main`: PR obligatoriu, CI verde obligatoriu — **după primul deploy**
- [ ] Convenții de lucru
  - [ ] Convenție de commit-uri (Conventional Commits), documentată în README
  - [ ] Etichete: `algoritm`, `bug`, `design`, `conținut`, `infra`, `good first issue`
  - [ ] Milestones: `MVP`, `Toate metodele`, `Lansare`
  - [ ] Acces Claude la repo pentru commit-uri și issues (conform `Plan.md`)
  - [ ] 🔒 Convenție de branch-uri: `feat/`, `fix/`, `alg/<nume-metoda>`, `docs/`, `design/` — **după primul deploy**
  - [ ] 🔒 Template de issue: „Algoritm nou", „Bug", „Îmbunătățire design", „Conținut/text"
  - [ ] 🔒 Template de PR: ce s-a schimbat, screenshot mobil + desktop, checklist
- [ ] CI (GitHub Actions)
  - [ ] Workflow `ci.yml`: install → lint → typecheck → test → build, pe push în `main` (și pe PR-uri, când vor exista)
  - [ ] Cache pentru npm
  - [ ] CI pică intenționat o dată (test stricat) ca să confirmi că e funcțional
- [ ] Deployment GitHub Pages
  - [ ] Decide: project page (`/nume-repo/`) vs. user page — afectează `base` din `vite.config.ts`
  - [ ] Setare `base` corect și verificare că asset-urile se încarcă în `npm run preview`
  - [ ] Workflow `deploy.yml` (`upload-pages-artifact` + `deploy-pages`)
  - [ ] Activare Pages din setările repo-ului, sursa = GitHub Actions
  - [ ] Fișier `.nojekyll` în `public/`
  - [ ] `404.html` pentru rutele client-side (sau `HashRouter` — vezi Faza 3)
- [ ] HTTPS / SSL
  - [ ] „Enforce HTTPS" activat în setările Pages
  - [ ] (Opțional) domeniu custom: `CNAME` + DNS + așteptare certificat
  - [ ] Verificare în browser: lacăt, fără conținut mixt (mixed content)
- [ ] Test end-to-end de livrare
  - [ ] Un commit banal pe `main` → build automat → schimbarea e vizibilă live
  - [ ] Notează în README URL-ul live
- [ ] 🔒 **După primul deploy reușit** — trecerea pe regimul normal de lucru
  - [ ] Activare branch protection pe `main`
  - [ ] Convenție de branch-uri + template-uri de issue și PR
  - [ ] Actualizare secțiunea „Contribuții" din README

**Gata când:** site-ul „hello world" e live pe HTTPS. _(Blocarea PR-urilor pe CI roșu vine în pasul 🔒, după deploy.)_

---

## Faza 2 — Design system _(în lucru — nevalidat vizual)_

**Obiectiv:** o limbă vizuală coerentă înainte să construim pagini.

> ⚠️ **Debifată intenționat.** Prima pagină reală (Faza 3) a arătat că design system-ul e doar o
> bază de lucru, nu un rezultat validat: singurul lucru care exista era galeria de componente,
> iar aceasta nu ține loc de site. Ce ține de estetică și de rezultatul vizual se re-evaluează pe
> măsură ce apar paginile. Rămân bifate doar faptele verificabile (fonturi, tokens, contrast
> măsurat). Tema implicită a devenit cea **luminoasă** (Faza 3).

> Rezultatul e documentat în [`docs/design-system.md`](./docs/design-system.md) (tokens, mișcare,
> componente, responsivitate, accesibilitate) și [`docs/referinte.md`](./docs/referinte.md)
> (ce împrumutăm, ce evităm). Pagina vie: `src/pages/DesignSystem.tsx`.

- [x] Cercetare și referințe
  - [x] Analiză [visualgo.net](https://visualgo.net/en) — ce funcționează la controale și playback
  - [x] Analiză [csvistool.com](https://csvistool.com/) — layout și claritate
  - [x] Analiză [dsavisualizer.in](https://www.dsavisualizer.in/) — structura paginii de algoritm
  - [x] Analiză [Numerical Methods Visualizer (engineersuniverse.com)](https://engineersuniverse.com/webapps/numerical-methods-visualizer) — **cel mai apropiat de noi ca subiect**: acoperă doar bisecție, Newton-Raphson, sume Riemann și trapeze; luăm de la el afișarea erorii absolute + relative și presetările, evităm textul lung dinaintea vizualizării
  - [x] ~~Caută 3–5 site-uri suplimentare de referință (estetică, animații)~~ → **adăugate**: [3Blue1Brown](https://www.3blue1brown.com) (mișcare — și motorul e chiar Manim-ul nostru), [Desmos](https://www.desmos.com/calculator) (modelul pentru `Plot`), [Observable](https://observablehq.com) (reactivitate + straturi de desen). Plus [PerfectlyNormal](https://math345-games.github.io/PerfectlyNormal/), pentru jocul de Gram-Schmidt de pe pagina 2. Analiza în `docs/referinte.md`, care are acum 8 site-uri și 11 reguli
  - [x] Documentează în `docs/referinte.md`: ce împrumutăm, ce evităm
- [x] Identitate vizuală — **decisă**: paleta „Sapphire nightfall whisper" + Nunito Sans (detalii în [`README.md`](./README.md#design))
  - [x] Nunito Sans pentru titluri și text, grosimile 400 / 600 / 700–800
  - [x] ~~Alegere font monospace~~ → **JetBrains Mono** (cifre tabulare, distinge `0/O` și `1/l/I`)
  - [x] Verificare diacritice românești: ambele fonturi au Ș/ș/Ț/ț la codepoint-urile **cu virgulă** (U+0218–U+021B), plus Ă/Â/Î — verificat cu fontTools pe fișierele descărcate
  - [x] Self-hosting fonturi în `public/fonts`, subset latin + latin-ext, variable fonts, ~102 KB total (fără CDN; verificat că build-ul nu referă niciun domeniu extern)
  - [x] Tema implicită: **luminoasă**, fundal `#F7F9FD`; cea întunecată (`#262B40`) din comutator
- [x] Design tokens
  - [x] Culorile paletei ca tokens: `#0474C4` accent primar, `#5379AE` accent secundar, `#2C444C` suprafață, `#A8C4EC` text/accent luminos, `#06457F` accent apăsat, `#262B40` fundal închis
  - [x] Culori pentru stări (succes/atenție/eroare) — derivate separat, plus variantele de fundal
  - [x] Culori dedicate vizualizării: `--viz-curent`, `--viz-anterior`, `--viz-grila`, `--viz-interval`, `--viz-functie`, `--viz-solutie` — aceleași tokens se folosesc și în scenele Manim
  - [x] Temă întunecată + temă luminoasă, ambele definite explicit; comutator cu preferința în `localStorage` (cheia `mn-tema` — singurul lucru scris în browser)
  - [x] Scală tipografică fluidă, spațieri, radius, umbre (`shadow-jos/mediu/sus`)
  - [x] Definire ca variabile CSS + mapare Tailwind v4 (`@theme` în `src/index.css`, fără `tailwind.config`)
  - [x] Verificare contrast WCAG AA pe toate perechile text/fundal — `python3 scripts/verifica-contrast.py`, toate trec în ambele teme
  - [x] Regulă de contrast: pe fundal închis, textul-accent e `#A8C4EC` (**7,84:1** măsurat față de `#262B40`), **nu** `#0474C4` (**2,86:1** — doar umplere, niciodată text). Simetric, pe fundal deschis textul-accent e `#0474C4` (**4,63:1** față de `#F7F9FD`), **nu** `#5379AE` (**4,23:1**). Ambele perechi interzise au rămas în script, ca teste de regresie
- [x] Componente de bază (shadcn + adaptare la temă)
  - [x] Button (primar, secundar, contur, ghost, link, iconiță)
  - [x] Card
  - [x] Slider (cu etichetă de valoare)
  - [x] Input numeric — `NumberInput`, cu validare și eroare legată prin `aria-describedby`
  - [x] Input pentru expresii matematice — `ExpressionInput`, font mono, validare la tastare, exemple cu un clic
  - [x] Select / Tabs / Accordion
  - [x] Tooltip + Popover
  - [x] Badge (dificultate, capitol, stări)
  - [x] Skeleton / stare de încărcare
- [ ] Componente specifice proiectului (deocamdată doar shell vizual; logica vine în Faza 4)
  - [x] `AlgorithmCard` — card pentru pagina de cuprins: titlu + descriere + „Deschide". Fără etichete de stare (vezi regula din `CLAUDE.md`)
  - [x] `ControlPanel` — grup de parametri, responsiv, cu „Resetează"
  - [x] `PlaybackBar` — play/pauză, pas înainte, pas înapoi, reset, viteză, poziție
  - [x] `IterationTable` — antet lipit, scroll pe mobil, rând curent evidențiat, clic = sari la pas
  - [x] `FormulaBlock` — KaTeX încărcat **la cerere** (~78 KB gzip, chunk separat, nu intră în bundle-ul inițial), cu evidențierea părților din formulă prin `\htmlId`
  - [x] `Callout` — „de știut", „de reținut", „atenție", „capcană"
- [ ] Mișcare și micro-interacțiuni („stil Gemini")
  - [x] Definire durate și easing standard: 150 / 250 / 400 ms, `ease-standard` implicit
  - [x] Reguli: ce se animează și ce nu (vezi `docs/design-system.md`, §4)
  - [x] ~~Alegere lib de animație~~ → **niciuna deocamdată**: CSS + `tw-animate-css` acoperă tot. Framer Motion (~34 KB gzip) se ia în calcul doar dacă o pagină chiar cere layout animations
  - [x] ~~Alege 2–3 efecte [Magic UI](https://magicui.design)~~ → **alese** (vezi `Plan.md`,
        secțiunea Design). Rămâne integrarea:
    - [ ] [`particles`](https://magicui.design/docs/components/particles) — fundal pentru hero-ul
          din pagina de cuprins. **Zero dependențe noi** (canvas). De re-colorat: implicit e
          `#ffffff`, la noi trebuie legat de temă (`--color-cer` pe închis, `--color-estompat`
          pe deschis)
    - [ ] [`animated-beam`](https://magicui.design/docs/components/animated-beam) — fascicul între
          două elemente. **Aduce `motion`** (framer-motion, ~34 KB gzip) — vezi decizia de mai jos
    - [ ] [`animated-theme-toggler`](https://magicui.design/docs/components/animated-theme-toggler) —
          înlocuiește `ThemeToggle`-ul actual. Singura dependență e `lucide-react`, deja în proiect.
          **Atenție:** folosește View Transitions API și scrie direct pe `<html>` — trebuie legat de
          `use-theme.ts`, altfel avem două surse de adevăr pentru temă
  - [ ] **Decizia despre biblioteca de animație se redeschide:** `animated-beam` aduce `motion`, deci
        „deocamdată niciuna" nu mai ține dacă îl integrăm. De hotărât: ori îl păstrăm și acceptăm
        `motion` în bundle (și atunci merită folosit și pentru tranzițiile de pagină), ori îl tăiem
        și rămânem pe CSS. `particles` și `animated-theme-toggler` nu ridică problema asta
  - [ ] Comanda de instalare din `Plan.md` e cu `pnpm`; proiectul e pe **npm** →
        `npx shadcn@latest add @magicui/particles`. Componentele aterizează în `src/components/ui`,
        care e exclus din lint — după copiere, re-colorează-le pe paletă înainte de folosire
  - [x] Regulă scrisă: efectele împrumutate se re-colorează pe paleta proiectului înainte de folosire
  - [x] Regulă: efectele decorative stau pe pagina de cuprins și pe hero; pe paginile de algoritm animația e a graficului, nu a decorului
  - [x] Respectare `prefers-reduced-motion`: animațiile sunt scrise cu `motion-safe:`, plus tăierea globală a duratelor din `index.css`
  - [x] Stări hover/focus/active consistente; inel de focus `#A8C4EC` peste tot
- [ ] Responsivitate
  - [x] Breakpoint-uri definite și documentate (cele Tailwind, cu ce se schimbă la fiecare)
  - [x] Toate controalele ≥ 44px țintă de atingere (utilitarul `.tinta-atingere`)
  - [x] Regulă: pe mobil graficul deasupra, controalele dedesubt; pe desktop, alături
  - [x] Tabelele mari fac scroll orizontal propriu (`.scroll-tabel`), nu împing pagina
- [x] Pagină internă cu toate componentele la un loc — `src/pages/DesignSystem.tsx`, pe ruta `/design-system`, doar în dev (mutată acolo în Faza 3)

### Piesele care duc matematica pe ecran — **lipsesc**

> Design system-ul are tot ambalajul (butoane, tabel, playback, callout-uri, carduri), dar niciuna
> dintre piesele din care se desenează efectiv o metodă. Din cauza asta nu se poate începe nicio
> pagină de conținut: nu e o scăpare de stil, e blocajul principal al proiectului.

- [x] `Legend` — legenda de culori **plus** modul de folosire în 3–5 pași, în aceeași componentă
      (`Plan.md` le cere pe amândouă, deci nu se poate uita una). Culorile vin din
      `src/lib/viz-roles.ts` — sursa unică pentru rolurile `--viz-*`, aceleași și în Manim — deci
      legenda nu poate ajunge să contrazică desenul. Fiecare element are formă (linie, linie
      punctată, punct, zonă, celulă) și text, nu doar culoare. Verificat în ambele teme
- [x] `StepExplanation` — propoziția care spune ce se întâmplă la pasul curent, lângă animație
      (împrumutată de la visualgo, dar textul descrie formula, nu pseudocod). Primește propoziția
      gata compusă, nu `steps[]`. `explicatie` e `ReactNode`, ca să poată purta notație inline.
      Regiunea `aria-live` e stabilă, iar anunțurile se sting în derulare automată — la 4× ar fi
      inutilizabile la cititorul de ecran. Bandă de accent în `--viz-curent`, aceeași culoare ca
      iterația curentă din desen. Demonstrație live în `/design-system`, legată de `PlaybackBar`
- [x] `MatrixGrid` — matricea desenată, cu stări per celulă (`normala`, `curent`, `calculat`,
      `pivot`, `zero`), plus linie/coloană activă și separator pentru matricea extinsă `[A|b]`
      (notație din `curs4`, §4.3). Necesară pe paginile **1, 3, 4, 5, 8, 9, 10, 17**. Desenează **o
      singură** matrice — compunerea `A = L·U` e treaba paginii. `valori` acceptă `null` pentru
      celule care încă nu există (L la LU, jumătatea goală la Romberg): un zero calculat și o
      celulă necompletată sunt lucruri diferite. Culoarea nu e singurul semnal — pivotul e singura
      celulă plină. Accesibilitate: `<caption>` cu rezumat care spune unde e pivotul și pe ce linie
      se lucrează, plus starea fiecărei celule rostită ca text ascuns („pivot, 2")
- [x] `Plot` — axe, curbă, puncte, interval, tangentă, adnotări. Necesară pe paginile
      **6, 7, 11, 12, 13, 14, 15, 16, 18, 19**. Se compune din **straturi cu nume** (`PlotCurba`,
      `PlotPunct`, `PlotInterval`, `PlotArie`, `PlotDreapta`), fiecare luându-și scara din context
      — deci o pagină poate adăuga un strat propriu fără să atingă `Plot`. Domeniul îl dă pagina,
      graficul nu-l ghicește: altfel straturile ar trebui să se înregistreze într-un efect, adică
      o a doua randare la fiecare pas. Dimensiunea vine din `ResizeObserver`, nu dintr-un `viewBox`
      scalat, ca etichetele să nu se micșoreze pe telefon. Marginea din stânga se calculează din
      lățimea chiar a etichetelor. Explorare: tragere, pinch, roată cu Ctrl, butoane și tastatură
- [x] ~~**Decizie de luat înainte de `Plot`:** SVG scris de mână vs. bibliotecă de charting~~ →
      **SVG de mână**, cum era recomandarea. Nicio dependență nouă; `Plot` + cele cinci straturi
      ocupă ~600 de linii, față de 40–100 KB cât ar fi adus o bibliotecă gândită pentru date de
      business
- [ ] Aceleași stări vizuale trebuie să arate la fel în `MatrixGrid` (web) și în scenele Manim —
      tokens-urile `--viz-*` sunt deja comune, dar nu s-a desenat încă nimic în Manim

**Rămâne de făcut la o revenire:**

- [x] ~~3–5 site-uri suplimentare de referință pentru estetică și animații~~ → gata (vezi mai sus)
- [ ] integrarea celor trei componente Magic UI
- [x] ~~decizia despre `motion`~~ → **se asumă** (vezi „Decizii de luat înainte de Etapa 0" din
      [`CLAUDE.md`](./CLAUDE.md)). Puse deja: `MotionConfig reducedMotion="user"` în `main.tsx` și
      `src/lib/miscare.ts` ca sursă unică pentru durate, cu gardă de desincronizare în dezvoltare
- [x] ~~trecerea pieselor din `src/components/viz/` de pe tranziții CSS pe `motion`~~ → gata:
      `PlotInterval` și `PlotPunct` mută geometria cu `motion`, culorile rămân pe CSS. Granița e
      scrisă în [`src/components/viz/README.md`](./src/components/viz/README.md)
- [x] ~~piesele din Etapa 0~~ → **toate gata**: `Legend`, `StepExplanation`, `MatrixGrid`, `Plot`.
      Urmează Etapa 1 din TODO-ul de animații din [`CLAUDE.md`](./CLAUDE.md), care începe cu
      pagina 6 (ecuații neliniare)
- [ ] `--viz-pivot` **și `--viz-interval`** trebuie oglindite în `manim/theme.py` când se scrie
      fișierul (Faza 5), altfel clipurile randate folosesc alt roșu și alt interval decât interfața.
      Atenție: `--viz-interval` are **nuanțe diferite pe cele două teme** (`#BE7434` pe luminoasă,
      `#4CA49C` pe întunecată), deci oglindirea cere ambele valori, nu una singură
- [ ] **Matematica graficului e verificată, dar nu automat.** `src/lib/plot-scara.ts` și
      `plot-esantionare.ts` au fost testate rulând module compilate cu esbuild, în afara aplicației:
      repere (pas din 1/2/5/10, etichetă = valoare desenată, densitate adaptivă, cazuri
      degenerate), eșantionare (`tan`, `1/x`, `√x`, pantă mare care **nu** trebuie ruptă),
      tăierea dreptei la cadru (verificată pe tangenta la `x²−2`, care taie axa exact în 1,5) și
      zoom (ancora rămâne fixă, 200 de zoom-uri nu ajung la zero sau infinit). **Verificările au
      fost manuale, deci pot regresa** — sunt primii candidați pentru Vitest, în Faza 4
- [ ] test cu cititor de ecran și pe un telefon real (Faza 9)

**Gata când:** paginile reale ale site-ului arată coerent în ambele teme, pe telefon și pe desktop —
nu doar galeria de componente.

---

## Faza 3 — Shell-ul aplicației _(în lucru)_

**Obiectiv:** navigație completă și pagina de cuprins funcțională, chiar dacă algoritmii lipsesc.

> Făcut: `HashRouter` + rutele, layout-ul (`SiteLayout`, `Header`, `Footer`, `Container`,
> `PageHeader`, `Logo`), registrul paginilor, cuprinsul pe trei secțiuni, căutarea din
> header, scheletul paginii de algoritm și 404. Tema implicită a trecut pe **luminoasă**.
> Rămân: meniul mobil, TOC, `/despre` și `/contact`, manifest, verificările de conformitate.

- [x] Rutare
  - [x] Instalare `react-router`
  - [x] Decizie: **`HashRouter`** — sigur pe Pages, fără `404.html`
  - [x] Rute: `/`, `/algoritm/:slug`, `*` (404) + `/design-system`, doar în dev. `/despre` și `/contact` — mai încolo
  - [x] Scroll to top la schimbarea rutei
  - [x] Lazy loading pe rute (`React.lazy` + `Suspense`)
- [ ] Layout
  - [x] Header: siglă, **căutarea în toate metodele** (`CautareMetode`, combobox cu listă derulantă, funcționează de pe orice pagină) și comutatorul de temă. Fără link „Cuprins" — cuprinsul stă pe pagina principală, iar sigla duce înapoi la ea. Pe mobil dispare wordmark-ul, ca să încapă câmpul
  - [ ] Meniu mobil (drawer), închidere la navigare, blocare scroll în fundal
  - [x] Footer: siglă, o propoziție despre site, an și „construit cu React și Manim". ~~Coloana „Urmează" (Despre, Contact, marcate „în curând")~~ → **scoasă**: nicio stare de progres în interfață. `/despre` și `/contact` apar în footer abia când există
  - [x] Breadcrumb pe paginile de algoritm
  - [x] Container cu lățime maximă și spațieri consistente
- [x] Pagina principală (cuprins)
  - [x] Hero: titlul și paragraful în stânga, panoul split-flap în dreapta. ~~Pe toată înălțimea ecranului (`min-h-[calc(100svh-7rem)]`)~~ → **înălțimea o dă conținutul** (~520 px), ca primele carduri să înceapă imediat sub el. ~~Eyebrow-ul „Metode numerice · 14 pagini interactive”~~ → scos
  - [x] Panou split-flap în hero (`TextFlippingBoard`, din registry-ul Aceternity): 16 coloane × 4 rânduri, 5 mesaje care se rotesc din 5 în 5 secunde, rotire rapidă (`duration={0.6}`). Adaptat: culori doar din paletă (panoul e întunecat în ambele teme), alfabet cu Ă/Â/Î/Ș/Ț, `prefers-reduced-motion` → literele apar fără rotire, textul întreg într-un `sr-only`. **Costă `motion` (~41 kB gzip)**, încărcat amânat (`lazy`), deci nu ține în loc textul din hero — de reevaluat față de bugetul din Faza 9
  - [x] ~~Cuprins pe pagina principală (bandă cu pastile → arbore cu toate paginile → arbore doar cu secțiunile, în hero)~~ → **scos de tot**: navigarea se face din căutarea din header și din cardurile de mai jos. Titlurile de secțiune au rămas cu `id` (`sectiune-…`) și `scroll-mt-24`, deci o eventuală revenire la scurtături e ieftină
  - [x] Registru central de algoritmi (`src/algorithms/registry.ts`) — sursa unică de adevăr
  - [x] ~~Grilă grupată pe capitole~~ → ~~o singură grilă~~ → **trei secțiuni**: „Metode liniare", „Metode neliniare", „Interpolare, integrare și ODE". Cele 5 capitole rămân (supratitlul paginii de metodă), dar se grupează în secțiuni prin `CAPITOLE[…].sectiune`
  - [x] ~~Căutare instant în cuprins~~ → **căutarea a urcat în header**, ca listă derulantă care duce direct pe pagina metodei (`src/lib/cautare.ts` + `CautareMetode`); caută în titlu, descriere, metode și capitol, fără diacritice
  - [x] ~~Filtre: capitol~~ → **scoase**: cu trei secțiuni vizibile pe pagină, filtrele nu mai aveau ce filtra. Filtrul pe dificultate — abandonat
  - [x] ~~Stare „în lucru" pe carduri~~ → **scoasă**, odată cu numărul paginii, eticheta capitolului, dificultatea și pastilele metodelor: cardul e doar titlu + descriere + „Deschide"
  - [x] La fel pe pagina de metodă: ~~Callout-ul „Pagină în lucru" cu cursul-sursă~~ → **scos**; rămân doar `Skeleton`-urile, ca placeholder tăcut. Cursul-sursă se citește din `registry.ts` și din tabelul Fazei 7
  - [x] Stare goală pentru căutare fără rezultate (acum în lista derulantă)
- [ ] TOC (cuprins)
  - [ ] TOC lateral pe paginile de algoritm, cu evidențierea secțiunii curente
  - [ ] Pe mobil: TOC colapsabil în partea de sus
  - [ ] Ancore stabile pe secțiuni (linkuri partajabile)
- [ ] Pagini statice
  - [ ] `/despre` — scopul proiectului, cum se folosește, credite
  - [ ] `/contact` — fără backend: `mailto:` sau formular terț fără cookies; spune clar ce se întâmplă cu mesajul
  - [x] `404` — mesaj prietenos + link către cuprins (`src/pages/NotFound.tsx`, rutat pe `*`, verificat)
- [ ] Branding
  - [x] Logo placeholder (SVG, funcționează pe ambele teme)
  - [ ] Favicon + `apple-touch-icon`
  - [ ] `manifest.webmanifest` cu nume și culori
- [ ] Conformitate (verificare explicită, conform `Plan.md`)
  - [ ] Fără autentificare nicăieri
  - [ ] Fără cookies — DevTools → Application → Cookies: gol
  - [ ] Fără analytics/tracking terț
  - [ ] Fără `localStorage` cu date personale (doar preferința de temă, documentată)
  - [ ] Fără cereri către domenii externe (tab Network gol după încărcare)

**Gata când:** poți naviga tot site-ul pe telefon și pe desktop, cuprinsul afișează toate metodele, iar tab-ul Cookies e gol.

---

## Faza 4 — Motorul de algoritmi

**Obiectiv:** un nucleu reutilizabil, testat, peste care fiecare metodă e doar o implementare mică.

- [ ] Contract comun
  - [ ] Tip `AlgorithmMeta`: `slug`, `nume`, `capitol`, `dificultate`, `descriereScurtă`, `prerechizite`
  - [ ] Tip `ParamSpec`: nume, tip (număr/expresie/matrice/selecție), min/max/pas, valoare implicită, validare
  - [ ] Tip `Step`: index, valori, ce se evidențiază vizual, explicație într-o propoziție
  - [ ] Tip `AlgorithmResult`: `steps[]`, `status` (convergent/divergent/limită atinsă), `soluție`, `eroareFinală`
  - [ ] Interfață `run(params): AlgorithmResult` — pură, sincronă, fără efecte, ușor de testat
  - [ ] Registrul din Faza 3 tipizat pe aceste tipuri
- [ ] Parser de expresii
  - [ ] Alegere lib (mathjs vs. parser propriu mic) — cântărește mărimea bundle-ului
  - [ ] Suport: `sin cos tan exp ln log sqrt abs pi e`, puteri, paranteze
  - [ ] Validare la tastare + mesaj de eroare **în română**, specific („paranteză neînchisă", „funcție necunoscută: `sn`")
  - [ ] Protecție: fără `eval`, limită de lungime, limită de evaluări
  - [ ] Derivată — simbolică dacă e disponibilă, altfel numerică (pentru Newton)
  - [ ] Teste pe expresii valide și invalide
- [ ] Utilitare numerice (`src/lib/`)
  - [ ] Formatare numere: cifre semnificative, notație științifică, aliniere în tabel
  - [ ] Criterii de oprire: toleranță absolută/relativă, număr maxim de iterații
  - [ ] Detectare divergență / NaN / Inf, cu mesaj clar în interfață
  - [ ] Operații pe matrice: înmulțire, pivotare, normă, verificare diagonal-dominanță
  - [ ] Eșantionare de funcție pentru desen (tratarea discontinuităților și asimptotelor)
- [ ] Playback
  - [ ] Hook `useAlgorithmPlayback(steps)`: index curent, play/pauză, pas ±1, reset, viteză
  - [ ] Bazat pe `requestAnimationFrame`, oprit când tab-ul e ascuns
  - [ ] Scurtături de tastatură: `space`, `←`, `→`, `r`
  - [ ] Legare la `PlaybackBar` și la `IterationTable` (rândul curent se evidențiază și intră în vizor)
- [ ] Componente de plot (`src/components/viz/`)
  - [ ] Decizie: SVG (accesibil, ușor de stilizat) vs. Canvas (rapid) — probabil SVG, cu Canvas unde e nevoie
  - [ ] `PlotCanvas`: sistem de coordonate, scalare automată, axe, grilă, etichete
  - [ ] Desenare curbă din funcția utilizatorului
  - [ ] Straturi de markeri: punct curent, puncte anterioare estompate, interval, tangentă/secantă
  - [ ] Zoom + pan (mouse, roată, pinch pe mobil)
  - [ ] Buton „încadrează totul" (reset la vedere)
  - [ ] Redimensionare la schimbarea containerului (`ResizeObserver`)
  - [ ] Performanță: 60fps pe telefon de gamă medie
- [ ] Testare
  - [ ] Setup Vitest + Testing Library
  - [ ] Teste pe utilitarele numerice
  - [ ] Teste pe parser
  - [ ] Șablon de test per algoritm: valori de referință cunoscute, caz divergent, caz la limită
  - [ ] Rulare teste în CI, prag minim de acoperire pe `src/algorithms` și `src/lib`

**Gata când:** un algoritm de test rulează prin motor, se desenează, se derulează pas cu pas și are teste verzi.

---

## Faza 5 — Pipeline Manim _(poate merge în paralel cu Fazele 3–4)_

**Obiectiv:** clipuri explicative pre-randate, cu aceeași estetică cu restul site-ului. Manim rulează **offline**, la build local — niciodată în browser.

> **Unde intră.** Clipurile Manim umplu **exclusiv secțiunea „Vizual"** a unei pagini de algoritm.
> Secțiunea „Interactiv" se face cu `motion` și cu straturile `Plot`/`MatrixGrid` — niciodată cu un
> clip. Împărțirea și motivele sunt în [`CLAUDE.md`](./CLAUDE.md), §„Manim sau `motion`".
>
> **Pagina 6 nu primește clip** (vezi coloana Manim din tabelul Fazei 7): bisecția se înțelege
> trăgând de capetele intervalului. Acolo secțiunea „Vizual" lipsește cu totul din pagină.

- [ ] Mediu Python
  - [ ] `manim/` cu `.venv`, `requirements.txt` (versiuni fixate)
  - [ ] Verificare dependențe de sistem (ffmpeg, cairo, LaTeX dacă folosim `Tex`)
  - [ ] `manim/README.md`: instalare pas cu pas, comenzi de randare
  - [ ] Randare de test a unei scene demo
- [ ] Șablon și temă
  - [ ] `manim/theme.py` — paleta „Sapphire nightfall whisper" și Nunito Sans, importate de toate scenele (aceleași valori ca în `tailwind.config`)
  - [ ] Scenă de bază cu titlu, fundal pe temă și ritm standard
  - [ ] Toate textele din scene **în română**, cu diacritice verificate în randare
  - [ ] Convenție de nume: `<slug-algoritm>_<variantă>.mp4`
- [ ] Randare și export
  - [ ] Script `manim/render.py` (sau `Makefile`): randează toate scenele într-o comandă
  - [ ] Rezoluții: 1080p desktop + variantă sigură pentru mobil
  - [ ] Export `mp4` (h264) + `webm` opțional + `poster.jpg` (primul cadru)
  - [ ] Compresie și verificare mărime — țintă sub ~2 MB per clip
  - [ ] Copiere automată în `public/media/<slug>/`
  - [ ] Decizie: fișierele intră în repo sau în GitHub Releases/CDN (dacă repo-ul crește prea mult → Releases)
- [ ] Integrare în site
  - [ ] Componentă `<ManimHero>`: `poster`, `preload="none"`, lazy load la intrarea în vizor
  - [ ] Fără sunet: `muted`, `playsInline`, `loop` unde are sens
  - [ ] Controale vizibile (play/pauză) — nu doar autoplay
  - [ ] `prefers-reduced-motion`: afișează doar poster-ul static
  - [ ] Fallback: dacă lipsește clipul, se arată imaginea statică + text descriptiv
  - [ ] Text alternativ / descriere pentru accesibilitate

**Gata când:** un clip Manim se randează cu o comandă, ajunge în `public/media/` și se afișează corect pe o pagină, inclusiv pe conexiune lentă.

---

## Faza 6 — Template-ul paginii de algoritm

**Obiectiv:** o structură fixă, dusă până la capăt pe o metodă-pilot, pe care apoi o repetăm.

- [ ] Structura paginii (ordine fixă, conform `Plan.md`)
  1. [ ] **Hero vizual** — clipul Manim, imediat, fără text lung înainte
  2. [ ] **Briefing** — maximum un paragraf despre ce face metoda
  3. [ ] **Formula de bază** — afișată clar, cu notațiile explicate
  4. [ ] **Instrucțiuni de folosire** — cum te joci cu interfața de mai jos, 3–5 pași
  5. [ ] **Interfața interactivă** — parametri + grafic care se schimbă odată cu formula
  6. [ ] **Tabelul de iterații** — sincronizat cu playback-ul
  7. [ ] **Capcane și limitări** — când metoda eșuează sau se comportă ciudat
  8. [ ] **Vezi și** — metode înrudite, pentru comparație
- [ ] Implementare
  - [ ] Componentă `AlgorithmPage` care primește totul din registru + fișierul de conținut
  - [ ] Conținutul textual separat, în `src/content/<slug>.ts` (sau `.mdx` dacă alegem MDX)
  - [ ] Legare parametri → `run()` → `steps` → grafic + tabel, cu recalculare la orice schimbare
  - [ ] Debounce pe input-ul de expresie, ca să nu recalculeze la fiecare tastă
  - [ ] Stare de eroare elegantă: parametri invalizi nu strică pagina
  - [ ] Buton „resetează la valorile implicite"
  - [ ] Buton „exemplu interesant" — preîncarcă un set de parametri didactic
- [ ] Pagina-pilot
  - [ ] Alege prima metodă (una cu vizual simplu)
  - [ ] Du-o până la capăt: cod, text, Manim, interactiv, mobil
  - [ ] Review de design pe pilot înainte de a replica structura
  - [ ] Verificare pe telefon real (nu doar DevTools)
  - [ ] Verificare cu tastatura și contrast
  - [ ] Congelează template-ul și documentează-l în `docs/template-algoritm.md`

**Gata când:** pagina-pilot e live și un student o poate folosi fără explicații suplimentare.

---

## Faza 7 — Implementarea metodelor numerice

**Obiectiv:** 19 pagini tematice, fiecare la calitatea paginii-pilot.

### Lista paginilor _(sursa: `Plan.md`, secțiunea „Lista Algoritmi")_

Fiecare pagină grupează metodele înrudite, ca să se poată face paralele între ele —
împărțirea vine din `Plan.md`, nu una metodă = una pagină. Coloana „Curs" spune din ce
fișier din `cursuri_MN/` se ia conținutul.

Coloana **Manim** e clipul din secțiunea „Vizual"; coloana **Interactiv** e interfața cu `motion`.
`n/a` înseamnă că pagina **nu primește** clip, prin decizie — nu că e de făcut mai târziu.

| Nr. | Pagină (metode)                               | Slug                               | Curs sursă   | Vizual       | Implem. | Manim | Text | Interactiv | Mobil | Gata |
| --- | --------------------------------------------- | ---------------------------------- | ------------ | ------------ | ------- | ----- | ---- | ---------- | ----- | ---- |
| 1   | Cramer, LU, Doolittle, Crout, Cholesky        | `factorizari-lu`                   | curs2, curs4 | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 2   | Norme, Householder, Givens, Gram-Schmidt      | `norme-si-ortogonalitate`          | curs3, curs2 | axă + joc    | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 3   | Eliminare gaussiană și pivotări               | `eliminare-gaussiana`              | curs4        | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 4   | Algoritmul Thomas (sisteme tridiagonale)      | `algoritmul-thomas`                | curs4        | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 5   | Jacobi, Gauss-Seidel, SOR                     | `metode-iterative`                 | curs5        | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 6   | Puncte fixe, bisecție, Newton, secantă        | `ecuatii-neliniare`                | curs6, curs5 | interval     | [x]     | n/a   | [x]  | [x]        | [~]   | [ ]  |
| 7   | Gradient descendent, gradient conjugat        | `metode-de-gradient`               | curs6, curs5 | vale 1D + 3D | [x]     | n/a   | [x]  | [x]        | [x]   | [ ]  |
| 8   | Metodele puterii, Rayleigh, deflație          | `metodele-puterii`                 | curs7        | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 9   | Algoritmul PageRank                           | `pagerank`                         | curs7        | matrice+graf | [x]     | n/a   | [x]  | [ ]        | [~]   | [ ]  |
| 10  | QR și DVS                                     | `qr-si-dvs`                        | curs8, curs3 | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 11  | Lagrange, Neville, funcția Runge, spline      | `interpolare-polinomiala`          | curs09       | grafic       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 12  | Curbe Bézier, algoritmul de Casteljau (2D/3D) | `curbe-bezier`                     | curs09       | canvas       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 13  | Aproximare CMMP și funcții raționale          | `cmmp`                             | curs10       | grafic       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 14  | Transformata Fourier rapidă (FFT)             | `fft`                              | curs10       | plan complex | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 15  | Derivare numerică                             | `derivare-numerica`                | curs11       | grafic       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 16  | Newton-Cotes: trapeze și Simpson              | `newton-cotes`                     | curs11       | grafic       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 17  | Extrapolare Richardson și integrare Romberg   | `romberg`                          | curs12       | matrice      | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 18  | Cuadraturi adaptive și cuadraturi Gaussiene   | `cuadraturi-adaptive-si-gaussiene` | curs12       | grafic       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 19  | ODE: problema Cauchy, Euler, Runge-Kutta      | `ecuatii-diferentiale`             | curs13       | grafic       | [ ]     | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |

### Pagina 6 — `ecuatii-neliniare`, ce e gata și ce nu

Prima pagină cu interfață interactivă completă. Ce există:

- **Patru algoritmi** în `src/algorithms/ecuatii-neliniare/` — bisecție, puncte fixe, tangentă
  (Newton), secantă — scriși după Algorithm 1–3 din curs6, fiecare cu explicația pasului **și**
  formula pasului cu numerele puse în ea (`latexPas`, cu `\htmlId` pe partea care se aprinde).
  Ambele stau în algoritm, nu în UI, ca să nu se poată desincroniza de cifre.
- **Șapte funcții** din curs6 (`src/algorithms/functii.ts`), cu derivata analitică. Rădăcinile
  sunt calculate cu `mpmath`, nu scrise din memorie — două scrise din memorie la prima încercare
  erau greșite și le-a prins verificarea.
- **Verificare numerică rulabilă**: `bash scripts/verificare-algoritmi/ruleaza.sh` rulează
  modulele **reale** din `src/`, nu reimplementări. Acoperă convergența pe toate funcțiile,
  ordinul pătratic al lui Newton, ambele condiții de eșec din curs, exemplul cu numărul de aur și
  refuzul funcțiilor fără `g` dat de curs.
- **Tangenta și secanta au exemplul lor.** Pe intervalul din curs termină în patru pași, cu primul
  deja pe soluție — nu se vede nici construcția, nici de ce ar fi mai bune decât înjumătățirea.
  Acum pornesc din `ln(x) − 2`, din 18: prima tangentă aruncă punctul tocmai în 1,97, apoi el urcă
  înapoi prin 4,58 și 6,77 până se așază în e². Alegerea e măsurată, nu din ochi
  (`scripts/verificare-algoritmi/alegere-pornire.ts`), și ține de **două** lucruri: destui pași
  vizibili **și** `|f|` sub câteva zeci, ca să nu iasă curba din scara desenabilă. Exponențiala
  pornită de la fel de departe dă mai mulți pași, dar urcă la 2000 și devine o cârjă lipită de axă.
- **`PlotTaietura`** — locul în care dreapta taie axa, marcat pe axă. E chiar rezultatul pasului
  la tangentă și la secantă, și până acum nu se vedea deloc.
- **`PlotPanta`** — triunghiul care arată **unde e panta**. Catetele nu sunt alese ca să arate
  bine, sunt chiar mărimile din formulă: la secantă `xₙ₋₁ − xₙ₋₂` pe orizontală și
  `f(xₙ₋₁) − f(xₙ₋₂)` pe verticală, adică exact părțile aprinse în `FormulaBlock`; la tangentă,
  saltul făcut pe orizontală și `f(xₙ₋₁)` pe verticală, al căror raport rescris dă chiar
  `xₙ = xₙ₋₁ − f/f′`. Fără el, panta era doar un număr din propoziția de sub grafic.
- **Secanta arată toate cele trei puncte** — `xₙ₋₂`, `xₙ₋₁`, `xₙ`. Punctul cel mai vechi se desena,
  dar fără nume, iar o secantă cu un singur punct etichetat se citește ca o tangentă.
- **Fără redare automată** pe pagina asta (`faraRedare` pe `PlaybackBar`): salturile tangentei
  venite unul după altul nu se prind, iar butonul de redare doar te ispitea să te uiți la un film.
- **Lupa care urmărește metoda** (`src/lib/plot-urmarire.ts` + `use-domeniu-animat.ts`): fără ea,
  după opt înjumătățiri banda intervalului avea sub trei pixeli și animația părea oprită. Cadrul
  stă pe loc cât timp banda se vede — asta arată **că** intervalul se strânge — și se apropie o
  treaptă de patru ori când coboară sub 14% din ecran. Graficul rămâne și explorabil cu mâna.
- Puncte fixe **refuză** funcțiile pentru care cursul nu dă forma `x = g(x)`, iar interfața nici
  nu le lasă alese pe metoda aceea.

Ce **nu** e verificat încă:

- [ ] **Portretul pe telefon, cu ochiul.** Structural nu deversează nimic la 360px (măsurat), dar
      breakpoint-urile n-au putut fi testate: managerul de ferestre de pe Linux a ignorat
      redimensionarea browserului. De verificat pe un dispozitiv real sau din DevTools.
- [ ] `prefers-reduced-motion` pe interfața asta — codul îl respectă prin `MotionConfig` și prin
      `useDomeniuAnimat`, dar n-a fost văzut rulând cu setarea pornită.

- [x] ~~Completează tabelul~~ — cele 19 pagini sunt fixate din `Plan.md`
- [ ] Stabilește ordinea de implementare (vezi „Ordinea sugerată" mai jos)
- [ ] Deschide câte un issue GitHub pentru fiecare pagină, cu checklist-ul de mai jos
- [ ] Pentru fiecare pagină: citește **întâi** cursul sursă din `cursuri_MN/`, apoi scrie
      textul și formulele — nimic din memorie, nimic din alte surse

### Pagina 7 — `metode-de-gradient`, ce e gata și ce nu

Prima pagină cu secțiunea „Vizual" completă. Clipul e **scris în cod**, nu randat cu Manim (vezi
excepția din `CLAUDE.md`): a pornit de la o animație web gata făcută (`Coborare pe gradient.html`,
un bundle cu motor propriu) și s-a portat în proiect ca desen pe ceas propriu.

Ce există:

- **Motorul de clip**, felia strict necesară din motorul original: `src/lib/compozitie.ts` (curbe,
  `animeaza()`, `repere()` — funcții pure) plus `Clip`, `Subtitrari` și `PlaybackClip` din
  `src/components/viz/`. Bundle-ul original **nu** a intrat în proiect: aducea React UMD, Babel
  standalone (3 MB) și fonturile încă o dată.
- **Scena** `src/components/content/AnimatieCoborarePeGradient.tsx`, cu matematica separată în
  `src/algorithms/metode-de-gradient/peisaj-1d.ts`. Culorile vin din `viz-roles.ts`, deci clipul se
  vede corect în ambele teme — originalul era pe fundal alb, cu hexuri scrise de mână.
- **O greșeală matematică prinsă la port.** Cu înclinarea din original (`0,02·x²`), eticheta „minim
  global" era **falsă**: valea din stânga stătea la `f ≈ 0,589`, dar `f(−8,5) = 0,289` cobora sub
  ea chiar în cadru. Cu `0,04·x²` valea din stânga (`x ≈ −2,847`, `f = 0,755`) e minimul global
  adevărat pe toată axa. Verificat pe `[−20, 20]`, împreună cu ambele rulări.
- **Sub clip stă doar playerul.** Legenda de culori și panoul cu formula plus valorile lui `k`,
  `x^(k)` și `f′(x^(k))` au existat și au fost scoase, la cerere: secțiunea „Vizual" e o
  introducere narativă, iar aparatul explicativ o încărca. Paralela formulă ↔ desen a rămas **în**
  clip — subtitrările spun `x^(k+1) = x^(k) + α·r^(k)` și `r^(k) = −f′(x^(k))`, iar săgeata din
  desen e etichetată `α·r^(k)`. Regula despre legendă din `CLAUDE.md` rămâne valabilă pentru
  interfețele **interactive**; dacă vreodată clipul capătă comenzi care schimbă parametrii, legenda
  trebuie să revină.
- **Teoria** (`src/content/metode-de-gradient.tsx`) din curs6 §4 și curs5 §8, verificată numeric pe
  un sistem SPD 2×2: pașii descrescători converg, iar gradientul conjugat dă soluția exactă în
  `n = 2` pași, cu `⟨v^(1), A·v^(2)⟩ = 0`.
- **Două roluri de culoare lărgite**, amândouă aprobate explicit: `--viz-pivot` poartă și „punctul
  în care iterația se blochează", `--viz-interval` poartă și „ce se arată acum peste desen".
  Scrise în `viz-roles.ts` și în `CLAUDE.md`; scripturile de contrast și daltonism trec.

**Interfața interactivă — valea în 3D.** A doua interfață completă de pe site, după pagina 6, și
prima cu desen tridimensional. Ce s-a construit:

- **Primitiva 3D**, scrisă de mână în SVG, fără nicio bibliotecă: `src/lib/proiectie-3d.ts` (cameră
  **ortografică** azimut/elevație, ordinea pictorului, umbrire) și `src/lib/curbe-de-nivel.ts`
  (eigen 2×2 în formă închisă, elipsele de nivel **exacte**). Amândouă verificate numeric înaintea
  oricărei componente — vezi mai jos de ce nu e o formalitate.
- **`Scena3D`** și cele șase straturi ale ei (`Podea3D`, `Suprafata3D`, `CurbeDeNivel3D`,
  `Traiectorie3D`, `Sageata3D`, `Eticheta3D`) — a treia familie de piese vizuale, lângă `Plot` (o
  stare) și `Clip` (un film): aici desenul e funcție de **unghiul de privire**, iar unghiul îl ține
  utilizatorul cu degetul.
- **Doi algoritmi** în `src/algorithms/metode-de-gradient/`, după Algorithm 4 din curs6 §4.1 și
  schema din curs5 §8.6. Un singur tip de pas pentru amândouă notațiile: `directie` și `pas` joacă
  același rol în desen, iar α/r⁽ᵏ⁾ vs. t_k/v⁽ᵏ⁾/s_k trăiesc doar în `latexPas` și `explicatie`.
- **Trei rezultate măsurate care au schimbat arhitectura**, toate în
  `scripts/verificare-algoritmi/`:
  1. **Sortarea pictorului după adâncimea centrului celulei e greșită** — 102 din 4 800 de raze, 2,1 %.
     Corectă e sortarea după **proiecția orizontală** a centrului: 0 din 4 800. Sub proiecție
     ortografică toate razele au aceeași direcție orizontală, deci înălțimea n-are niciun cuvânt în
     ordine. Varianta greșită e ținută în script ca test **care trebuie să pice**, ca să nu fie pusă
     înapoi ca „reparare".
  2. **Unghiul drept al zigzagului nu supraviețuiește camerei oblice**: 90° real se citește 55° la
     elevație 28° și 90,000° abia la 90°. De aici butonul „Privește de sus" — nu e un al doilea mod,
     e capătul aceleiași manete.
  3. **Scara pe x₁ și x₂ trebuie să fie izotropă.** Normalizată pe fiecare axă separat, cutia se
     forfecă și unghiul citit variază între 58° și 130°, după azimut — desenul ar afirma pe rând că
     e ascuțit sau obtuz.
- **Elipse analitice, nu marching squares.** A fiind SPD, mulțimile de nivel sunt exact elipse;
  `f(p) = c` se verifică la 2,49·10⁻¹² pe 97 000 de puncte. În plus, se poate cere curba **prin
  `x⁽ᵏ⁾`** dintr-o singură evaluare — și aia e chiar explicația zigzagului.
- **Cifrele metodei**, verificate pe modulele reale: coborârea face 16 pași pe sistemul din curs, cu
  `|cos(r⁽ᵏ⁾, r⁽ᵏ⁺¹⁾)| ≤ 6,7·10⁻¹⁶` la fiecare pas; gradientul conjugat termină în exact 2, cu
  reziduu nul și `⟨v⁽¹⁾, A·v⁽²⟩ = 0` exact. Se verifică și că **α e chiar minimul pe direcție**
  (`|g′(α)| ≤ 1,1·10⁻¹⁰`), adică formula, nu doar codul care o rulează.
- **Zero culori noi.** Relieful suprafeței vine din opacitatea unui singur rol (`--viz-functie`),
  între 45 % și 100 %, cu lumina lipită de cameră.

**Ce a mai primit interfața** (plan executat integral, cinci commit-uri):

- **Podeaua se vede de sus.** `opacitateSuprafata()` stinge mesh-ul pe ultimele 25 de grade, cu
  smoothstep, și la 90° suprafața dispare cu totul — acolo scena chiar **devine** figura de curbe de
  nivel din curs, pe care mesh-ul aproape opac o acoperea. Sub 0,02 nu se mai randează nimic, deci
  la privirea de sus dispar și ~1 000 de `<path>`. Curbele de nivel se taie acum la **rama podelei**
  (`idTaierePodea`, patrulaterul proiectat — exact, fiindcă proiecția e liniară), nu la marginea
  SVG-ului, pe care o depășeau.
- **Trei sisteme gata alese** (`src/algorithms/metode-de-gradient/sisteme.ts`), cu cifrele măsurate
  pe modulele reale, nu alese din ochi: vale rotundă (κ = 1 — coborârea termină într-un pas, ca și
  conjugatul), valea din curs (κ = 1,9387 — 16 și 2, rămâne cea implicită) și vale alungită (κ = 10,
  semiaxe 1:3,16 — 36 și 2). `b` și `x⁽⁰⁾` sunt aceleași la toate trei, ca singurul lucru schimbat
  să fie forma văii. Toleranța ultimului e 10⁻⁴, nu 10⁻⁸: la 10⁻⁸ ar fi cerut 68 de pași.
- **Lupa scenei** (`urmarestePatrat` + `cadru.ts`): cadrul se apropie pe trepte când pasul devine
  prea mic, cu aceeași treaptă pe amândouă axele — două trepte diferite ar forfeca cutia, iar sub
  scară neizotropă un unghi de 90° se citește între 58° și 130°. Podeaua a primit **numerele
  capetelor**; fără ele apropierea n-ar fi vizibilă deloc, o pătratică arătând la fel la orice
  scară.
- **Paralela dintre metode**: un comutator aprinde drumul întreg al celeilalte metode, punctat și
  plat pe podea (`TraseuReferinta3D`). Zero culori noi — e rolul `anterior`, deosebit prin formă.
- **Scena la mărimea ei** (762×526 măsurat, față de ~360 înainte) și perechea de contrast a
  suprafeței, care **a picat la prima măsurare**: vezi mai jos.

Două lucruri prinse de verificări, amândouă de reținut:

1. **Conturul văii era sub prag.** Lumina fiind lipită de cameră, fețele cele mai umbrite sunt cele
   razante — adică chiar silueta văii pe fundalul cardului. La opacitatea de bază de 45 % ieșea
   2,39:1 (luminoasă) și 2,41:1 (întunecată), sub 3:1 cât cere WCAG 1.4.11 unui element grafic. Baza
   a urcat la 60 % → 3,40:1 și 3,13:1; valorile de 45 % au rămas în `verifica-contrast.py` ca teste
   care trebuie să pice.
2. **Panoul de parametri e o grilă cu două coloane implicite**, create de `sm:col-span-2` de pe
   rândul matricei. Un rând nou care nu le cere explicit iese din panou, cu textul tăiat — exact ce
   a pățit comutatorul de comparație până la măsurare.

Ce **nu** e verificat încă:

- [ ] **Verificare cu ochiul pe telefon real** — portretul și peisajul au fost măsurate în browser
      la 390 px, dar nu văzute pe un dispozitiv. La scena 3D se adaugă și performanța la tragere
      (~1000 de `<path>` la 60 Hz), care se decide cu profiler, nu din raționament.
- [ ] **Tema întunecată, cu ochiul, pe scena 3D** — contrastul e măsurat pe amândouă temele, dar
      desenul n-a fost văzut pe cea întunecată. Tot acolo rămâne întrebarea deschisă din plan: dacă
      punctatul estompat al metodei de referință se confundă cu umbra metodei curente, **se
      întreabă** înainte să se atingă paleta.
- [ ] **Captura de ecran a scenei nu se poate face de pe mașina de lucru.** Cu scena întreagă în
      cadru, `Page.captureScreenshot` din CDP dă timeout la 30 s — și dă la fel și pe commit-uri
      dinaintea acestei sesiuni, deci nu e o regresie. Pagina rămâne vie (arborele de
      accesibilitate și JS-ul răspund), doar rasterizarea celor ~1 000 de `<path>` nu se termină la
      timp. Verificările vizuale de aici s-au făcut pe bucăți și prin măsurători din DOM.

### Pagina 9 — `pagerank`, ce e gata și ce nu

Ce există:

- **Matematica**, în `src/algorithms/pagerank/` (`tipuri.ts`, `retea.ts`, `putere.ts`,
  `descriere.ts`): construcția `A → S → M = Sᵀ → G` și algoritmul din curs7 §10, literă cu literă
  (normalizarea cu norma 2 în buclă, norma 1 abia la linia 10). Clasamentul tratează **egalitățile**:
  `P1` și `P4` primesc amândouă locul 3.
- **Verificarea numerică**, `scripts/verificare-algoritmi/pagerank.ts`, pe modulele reale: coloanele
  lui `M` și `G` însumează 1, iar `(I − G)v = 0` rezolvat independent prin eliminare dă
  `v = (1429, 2109, 2687, 1429)/7654`, adică exact ce scoate metoda puterii în 44 de iterații la
  `tol = 1e-6`. Viteza măsurată pe șirul erorilor (media geometrică 0,737) se potrivește cu
  `|λ₂|/|λ₁| = 0,7361`, iar convergența **oscilează** — șase iterații în care eroarea crește — deci
  niciun text nu promite scădere la fiecare pas.
- **Erata**, `docs/erata-cursuri.md`: matricea `M` tipărită în exemplul cursului nu e normalizarea
  după link-urile de **ieșire**, cum cere tot cursul, ci după cele care intră — iar clasamentul
  diferă (`P3, P1, P2, P4` tipărit vs. `P3, P2, P1 = P4` corect). Diferența e ținută ca **test care
  trebuie să pice**, ca să nu fie „reparată" înapoi.
- **Geometria grafului**, `src/lib/graf-orientat.ts` (noduri pe cerc, muchii Bézier cu îndoire
  perpendiculară, vârf de săgeată tăiat la conturul nodului), cu verificarea ei în
  `scripts/verificare-algoritmi/graf-orientat.ts`: capetele stau pe contur la sub 0,05 px, perechea
  reciprocă `P1 ↔ P3` se desparte pe toată lungimea, iar porțiunea desenată cade pe curba întreagă.
- **Teoria**, `src/content/pagerank.tsx`, din curs7 §10: matricea stocastică, `M·R = R`, matricea
  Google și metoda puterii, plus de ce apare transpusa.
- **Clipul**, `src/components/content/AnimatiaMatriceiPageRank.tsx` — a treia excepție de la regula
  Manim (după paginile 6 și 7), din același motiv: animația a venit gata făcută ca animație web
  (`Matricea PageRank.html`) și s-a portat pe `Clip`. Toate cifrele vin din
  `src/algorithms/pagerank/`, culorile din `viz-roles.ts` (deci merge în ambele teme, spre deosebire
  de originalul pe fundal alb), iar scena matricei a fost **rescrisă pe linii plus transpunere**, ca
  să spună aceeași poveste ca teoria de sub ea. `d` e fixat la 0,85: un clip nu primește parametrii
  utilizatorului.

Ce **nu** e făcut, prin decizie:

- **Secțiunea „Interactiv" nu există.** A fost construită (graf interactiv, comutarea link-urilor
  din matricea `A`, slider pentru `d`) și **scoasă la cerere**, cu tot cu piesele ei: `Graf`,
  `GrafMuchii`, `GrafNoduri`, `graf-context`, `RetauaDePagini`, `InterfataPageRank` și extinderea de
  celule apăsabile din `MatrixGrid`. Pe pagină rămâne scheletul neutru, fără nicio etichetă de
  stare. `src/lib/graf-orientat.ts` a rămas — îl folosește clipul.

Ce **nu** e verificat încă:

- [ ] **Verificare cu ochiul pe telefon real** — ca la paginile 6 și 7, portretul și peisajul n-au
      fost văzute pe un dispozitiv.

### Checklist-template per metodă _(copiază-l pentru fiecare)_

<details>
<summary><b>Metoda: ____________</b></summary>

- [ ] **1. Definire**
  - [ ] Intrare în registru: slug, nume, capitol, dificultate, prerechizite
  - [ ] Formula de bază scrisă și verificată
  - [ ] Parametrii și domeniile lor valide
  - [ ] Ce trebuie să „vadă" studentul — o propoziție de intenție didactică
- [ ] **2. Implementare**
  - [ ] `src/algorithms/<slug>.ts` cu `run()` conform contractului
  - [ ] Fiecare `Step` conține și explicația de o propoziție
  - [ ] Tratare cazuri limită: divergență, împărțire la zero, interval greșit, limită de iterații
  - [ ] Teste unitare: caz clasic cu rezultat cunoscut, caz divergent, caz la limită
- [ ] **3. Text (în română)**
  - [ ] Briefing — maximum un paragraf
  - [ ] Instrucțiuni de folosire — 3–5 pași
  - [ ] Capcane și limitări
  - [ ] Recitire pentru diacritice și ton consecvent
- [ ] **4. Interactiv**
  - [ ] Controale pentru toți parametrii, cu valori implicite bune
  - [ ] Vizualizarea se actualizează când se schimbă formula sau parametrii
  - [ ] Tabelul de iterații sincronizat cu playback-ul
  - [ ] Cel puțin un preset „exemplu interesant" + un preset care eșuează (didactic)
- [ ] **5. Manim**
  - [ ] Scenă în `manim/scenes/<slug>.py`
  - [ ] Randare + optimizare + poster
  - [ ] Integrare în pagină și verificare pe conexiune lentă
- [ ] **6. Verificare finală**
  - [ ] Mobil: portret și peisaj
  - [ ] Tastatură + focus vizibil
  - [ ] Contrast în ambele teme
  - [ ] Fără erori în consolă
  - [ ] Corectitudine matematică verificată față de o sursă externă (curs / calcul manual)
- [ ] **7. Livrare**
  - [ ] PR cu screenshot mobil + desktop
  - [ ] Review, merge, bifare în tabelul de mai sus

</details>

**Ordinea sugerată:** întâi metodele cu vizual simplu (rădăcini de ecuații, integrare numerică), apoi sistemele liniare (vizual mai greu — matrice, convergență), apoi ecuațiile diferențiale.

**Gata când:** toate rândurile din tabel sunt bifate și fiecare pagină are conținut, nu schelet.

---

## Faza 8 — SEO, fișiere statice, conformitate

**Obiectiv:** site-ul e găsibil și corect indexat.

- [ ] `robots.txt` în `public/` — permite indexarea, indică sitemap-ul
- [ ] `sitemap.xml`
  - [ ] Generat automat la build din registrul de algoritmi (nu scris de mână)
  - [ ] Include toate rutele, cu `lastmod`
  - [ ] Verificat cu un validator
- [ ] Meta tags
  - [ ] `<html lang="ro">`
  - [ ] Titlu și descriere unice per pagină
  - [ ] Open Graph + Twitter cards, cu imagine de preview per algoritm (sau una generică)
  - [ ] URL canonic
- [ ] Date structurate (opțional): `schema.org/LearningResource` pe paginile de algoritm
- [ ] Pagină de credite/licențe: fonturi, librării, Manim, surse bibliografice
- [ ] Verificare că nu se încarcă nimic de pe domenii terțe

**Gata când:** `sitemap.xml` și `robots.txt` sunt live și valide, iar fiecare pagină are titlu și descriere proprii.

---

## Faza 9 — Calitate, performanță, accesibilitate

**Obiectiv:** rapid și utilizabil pe telefonul unui student, nu doar pe laptopul dezvoltatorului.

- [ ] Performanță
  - [ ] Lighthouse mobil pe pagina principală și pe o pagină de algoritm
  - [ ] Buget: JS inițial sub ~200 KB gzip, LCP sub 2.5s pe 4G simulat
  - [ ] Analiză bundle (`rollup-plugin-visualizer`), eliminare dependențe grase
  - [ ] Code splitting per rută, verificat în tab-ul Network
  - [ ] Fonturi: `font-display: swap`, preload doar pentru fontul principal
  - [ ] Video Manim: lazy, niciodată descărcat înainte de a fi vizibil
  - [ ] Animațiile de plot nu blochează firul principal
- [ ] Accesibilitate
  - [ ] Navigare completă cu tastatura, inclusiv sliderele și graficul
  - [ ] Focus vizibil peste tot, ordine logică de tab
  - [ ] Etichete și `aria-label` pe toate controalele
  - [ ] Test cu cititor de ecran pe o pagină de algoritm
  - [ ] Rezumat textual al vizualizării pentru cine nu vede graficul
  - [ ] Contrast AA verificat automat (axe / Lighthouse) în ambele teme
  - [ ] `prefers-reduced-motion` respectat, inclusiv de playback
- [ ] Robustețe
  - [ ] Testare pe Chrome, Firefox, Safari (inclusiv iOS)
  - [ ] Testare pe telefon real: atingeri, pinch-zoom pe grafic, rotire ecran
  - [ ] Testare pe ecran mic (360px) și pe ecran mare (1440px+)
  - [ ] Error boundary: o eroare într-o vizualizare nu dărâmă pagina
  - [ ] Fără erori sau avertismente în consolă pe niciun ecran

**Gata când:** Lighthouse mobil ≥ 90 la performanță și accesibilitate pe pagina principală și pe o pagină de algoritm.

---

## Faza 10 — Lansare și după

- [ ] Pre-lansare
  - [ ] Verificare linkuri moarte pe build-ul final
  - [ ] Toate media-urile Manim există și se încarcă
  - [ ] Fără text placeholder rămas („Lorem", „TODO", „de completat")
  - [ ] Recitire finală a tuturor textelor românești
  - [ ] Verificare finală: fără cookies, fără auth, fără cereri externe
  - [ ] Testare pe conexiune lentă (throttling 3G)
- [ ] Lansare
  - [ ] Deploy final din `main`
  - [ ] Verificare HTTPS și certificat
  - [ ] Tag `v1.0.0` + release notes
  - [ ] Anunț către colegi/profesor/studenți
- [ ] După lansare
  - [ ] Colectare feedback (issues GitHub + pagina de contact)
  - [ ] Triere feedback în issues, prioritizare
  - [ ] Backlog de idei:
    - [ ] Comparare între două metode pe același grafic
    - [ ] Export PNG/SVG al graficului
    - [ ] Mod „quiz" — ghicește următoarea iterație
    - [ ] Partajare stare prin URL (parametrii în query string)
    - [ ] Metode suplimentare peste cele 15

---

## Riscuri

| Risc                                              | Impact                                        | Cum îl reducem                                                               |
| ------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| Fișierele Manim umflă repo-ul                     | Clonare lentă, limite Pages                   | Compresie agresivă, mutare în Releases dacă depășim ~100 MB                  |
| Parsarea expresiilor introduse de utilizator      | Erori, blocaje, cod nesigur                   | Librărie testată, fără `eval`, limită de evaluări, validare la tastare       |
| Animațiile lagg-uiesc pe telefon                  | Site inutilizabil exact pentru publicul-țintă | Buget de performanță, testare pe device real de la Faza 6                    |
| Cele 15 metode devin repetitive și se abandonează | Site incomplet                                | Template congelat după pilot, un issue per metodă, ordine de la ușor la greu |
| Manim consumă mult timp per metodă                | Întârzieri                                    | Scene scurte (10–20s), șablon comun, fallback imagine statică acceptabil     |

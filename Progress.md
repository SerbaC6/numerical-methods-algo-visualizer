# Progress — Vizualizator de Metode Numerice

Documentul de lucru al proiectului. Sursa viziunii: [`Plan.md`](./Plan.md).
Se actualizează la **fiecare** sesiune de lucru: bifezi ce ai terminat.

**Decizii deschise:**

- [ ] **Lista celor ~15 metode numerice** — de completat în `Plan.md` și în tabelul din Faza 7
- [ ] Fonturi și temă (decizie a utilizatorului, conform `Plan.md`)
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

## Faza 0 — Fundație și tooling

**Obiectiv:** un proiect React care pornește local, cu lint și formatare puse la punct.

- [ ] Inițializare proiect
  - [ ] `npm create vite@latest . -- --template react-ts` (TypeScript, pentru siguranță la algoritmi)
  - [ ] `npm install` și verificare `npm run dev` — pagina default se deschide
  - [ ] Fixare versiune Node în `.nvmrc` + câmpul `engines` din `package.json`
  - [ ] Curățare boilerplate Vite (logo-uri, CSS default, `App.css`)
- [ ] Structura de foldere
  - [ ] `src/pages/` — pagini de rutare
  - [ ] `src/components/ui/` — componente generice (shadcn)
  - [ ] `src/components/viz/` — componente de vizualizare
  - [ ] `src/algorithms/` — implementările numerice, fără JSX
  - [ ] `src/content/` — texte în română, separate de cod
  - [ ] `src/lib/` — utilitare (formatare, parser, matematică)
  - [ ] `src/hooks/`
  - [ ] `public/media/` — video/poster Manim
  - [ ] `manim/` — scene Python (izolat de aplicație)
  - [ ] Fișier `README` scurt în fiecare folder care nu e evident
- [ ] `.gitignore`
  - [ ] `node_modules/`, `dist/`, `.vite/`, `coverage/`
  - [ ] `.env*`, `*.local`
  - [ ] `manim/media/` (randări intermediare), `__pycache__/`, `.venv/`
  - [ ] `.DS_Store`, `Thumbs.db`
  - [ ] Verificare: `git status` e curat după un build + o randare Manim
- [ ] Calitatea codului
  - [ ] ESLint (config recomandat + react-hooks + import order)
  - [ ] Prettier + `.prettierrc`, integrare cu ESLint (fără reguli în conflict)
  - [ ] `.editorconfig` (LF, 2 spații, UTF-8, newline la final)
  - [ ] Scripturi `npm`: `dev`, `build`, `preview`, `lint`, `lint:fix`, `format`, `test`
  - [ ] Verificare TypeScript strict (`strict: true`, `noUncheckedIndexedAccess`)
  - [ ] Path aliases (`@/`) în `tsconfig` + `vite.config`
- [ ] Librăria de componente
  - [ ] Cercetare opțiuni gratuite (shadcn/ui, Radix, Headless UI, Park UI) — notează alegerea și motivul
  - [ ] Instalare Tailwind + configurare
  - [ ] Init shadcn/ui, adăugare 2–3 componente de test (Button, Card, Slider)
  - [ ] Smoke test: componentele se randează și arată corect în dev
  - [ ] Verificare licențe (MIT/Apache) pentru tot ce s-a adăugat
- [ ] `README.md` actualizat
  - [ ] Ce este proiectul, pentru cine, în română
  - [ ] Cerințe (Node, Python pentru Manim)
  - [ ] Cum rulezi local, cum faci build, cum randezi scenele Manim
  - [ ] Structura folderelor pe scurt
  - [ ] Cum contribui (link la convenția de commit-uri din Faza 1)

**Gata când:** `npm run dev`, `npm run build` și `npm run lint` trec fără erori pe o mașină curată, iar `git status` e curat.

---

## Faza 1 — Git, GitHub, CI și deployment

**Obiectiv:** orice merge în `main` ajunge automat live, pe HTTPS.

- [ ] Repo GitHub
  - [ ] Creare repo (public), push `main`
  - [ ] Descriere + topics (`numerical-methods`, `education`, `react`, `manim`, `romanian`)
  - [ ] Licență aleasă și adăugată (`LICENSE`)
  - [ ] Branch protection pe `main`: PR obligatoriu, CI verde obligatoriu
- [ ] Convenții de lucru
  - [ ] Convenție de branch-uri: `feat/`, `fix/`, `alg/<nume-metoda>`, `docs/`, `design/`
  - [ ] Convenție de commit-uri (Conventional Commits), documentată în README
  - [ ] Template de issue: „Algoritm nou", „Bug", „Îmbunătățire design", „Conținut/text"
  - [ ] Template de PR: ce s-a schimbat, screenshot mobil + desktop, checklist
  - [ ] Etichete: `algoritm`, `bug`, `design`, `conținut`, `infra`, `good first issue`
  - [ ] Milestones: `MVP`, `Toate metodele`, `Lansare`
  - [ ] Acces Claude la repo pentru commit-uri, PR-uri și issues (conform `Plan.md`)
- [ ] CI (GitHub Actions)
  - [ ] Workflow `ci.yml`: install → lint → typecheck → test → build, pe PR și pe `main`
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

**Gata când:** site-ul „hello world" e live pe HTTPS, iar PR-urile sunt blocate dacă CI pică.

---

## Faza 2 — Design system

**Obiectiv:** o limbă vizuală coerentă înainte să construim pagini.

- [ ] Cercetare și referințe
  - [ ] Analiză [visualgo.net](https://visualgo.net/en) — ce funcționează la controale și playback
  - [ ] Analiză [csvistool.com](https://csvistool.com/) — layout și claritate
  - [ ] Analiză [dsavisualizer.in](https://www.dsavisualizer.in/) — structura paginii de algoritm
  - [ ] Caută 3–5 site-uri suplimentare de referință (estetică, animații)
  - [ ] Documentează în `docs/referinte.md`: ce împrumutăm, ce evităm
- [ ] Identitate vizuală (decizie a utilizatorului, conform `Plan.md`)
  - [ ] Alegere font pentru titluri + font pentru text
  - [ ] Alegere font monospace pentru formule/tabele numerice
  - [ ] Verificare suport diacritice românești (ă â î ș ț) în toate fonturile
  - [ ] Self-hosting fonturi în `public/fonts` (fără CDN — evităm cereri externe)
  - [ ] Alegere temă (paletă, „mood": academic / ludic / minimal)
- [ ] Design tokens
  - [ ] Culori: fundal, suprafață, text, accent, stări (succes/atenție/eroare)
  - [ ] Culori dedicate vizualizării: funcție, iterație curentă, iterații anterioare, soluție, interval
  - [ ] Temă întunecată + temă luminoasă, ambele definite explicit
  - [ ] Scală tipografică, spațieri, radius, umbre
  - [ ] Definire ca variabile CSS + mapare în `tailwind.config`
  - [ ] Verificare contrast WCAG AA pe toate perechile text/fundal
- [ ] Componente de bază (shadcn + adaptare la temă)
  - [ ] Button (primar, secundar, ghost, iconiță)
  - [ ] Card
  - [ ] Slider (cu etichetă de valoare — esențial pentru parametri)
  - [ ] Input numeric (cu validare și mesaj de eroare)
  - [ ] Input pentru expresii matematice (font mono, feedback de validare)
  - [ ] Select / Tabs / Accordion
  - [ ] Tooltip + Popover (explicații scurte în context)
  - [ ] Badge (dificultate, capitol)
  - [ ] Skeleton / stare de încărcare
- [ ] Componente specifice proiectului (deocamdată doar shell vizual; logica vine în Faza 4)
  - [ ] `AlgorithmCard` — card pentru pagina de cuprins
  - [ ] `ControlPanel` — grup de parametri, responsiv
  - [ ] `PlaybackBar` — play/pauză, pas înainte, pas înapoi, reset, viteză
  - [ ] `IterationTable` — tabel de iterații, scroll pe mobil, evidențiere rând curent
  - [ ] `FormulaBlock` — afișare formulă (KaTeX; verifică impactul pe bundle)
  - [ ] `Callout` — „atenție", „capcană", „de reținut"
- [ ] Mișcare și micro-interacțiuni („stil Gemini")
  - [ ] Definire durate și easing standard (ex. 150/250/400ms)
  - [ ] Reguli: ce se animează și ce nu
  - [ ] Alegere lib de animație (Framer Motion / CSS pur) + justificare de mărime
  - [ ] Respectare `prefers-reduced-motion` peste tot, testat
  - [ ] Stări hover/focus/active consistente
- [ ] Responsivitate
  - [ ] Breakpoint-uri definite și documentate
  - [ ] Toate controalele ≥ 44px țintă de atingere
  - [ ] Regulă: pe mobil graficul deasupra, controalele dedesubt; pe desktop, alături
  - [ ] Tabelele mari fac scroll orizontal propriu, nu împing pagina
- [ ] Pagină internă `/design-system` (doar în dev) cu toate componentele la un loc

**Gata când:** pagina `/design-system` arată toate componentele, în ambele teme, corect pe telefon și pe desktop.

---

## Faza 3 — Shell-ul aplicației

**Obiectiv:** navigație completă și pagina de cuprins funcțională, chiar dacă algoritmii lipsesc.

- [ ] Rutare
  - [ ] Instalare `react-router`
  - [ ] Decizie: `HashRouter` (sigur pe Pages) vs. `BrowserRouter` + `404.html`
  - [ ] Rute: `/`, `/algoritm/:slug`, `/despre`, `/contact`, `*` (404)
  - [ ] Scroll to top la schimbarea rutei
  - [ ] Lazy loading pe rute (`React.lazy` + `Suspense`)
- [ ] Layout
  - [ ] Header: logo, navigație, comutator temă, buton căutare
  - [ ] Meniu mobil (drawer), închidere la navigare, blocare scroll în fundal
  - [ ] Footer: linkuri, an, licență, „construit cu Manim + React"
  - [ ] Breadcrumb pe paginile de algoritm
  - [ ] Container cu lățime maximă și spațieri consistente
- [ ] Pagina principală (cuprins)
  - [ ] Hero scurt: ce e site-ul, pentru cine, în 2 propoziții
  - [ ] Registru central de algoritmi (`src/algorithms/registry.ts`) — sursa unică de adevăr
  - [ ] Grilă de `AlgorithmCard`, grupată pe capitole
  - [ ] Căutare instant după nume (fără backend)
  - [ ] Filtre: capitol, dificultate
  - [ ] Stare „în curând" pentru metodele neimplementate (afișate, dar dezactivate)
  - [ ] Stare goală pentru căutare fără rezultate
- [ ] TOC (cuprins)
  - [ ] TOC lateral pe paginile de algoritm, cu evidențierea secțiunii curente
  - [ ] Pe mobil: TOC colapsabil în partea de sus
  - [ ] Ancore stabile pe secțiuni (linkuri partajabile)
- [ ] Pagini statice
  - [ ] `/despre` — scopul proiectului, cum se folosește, credite
  - [ ] `/contact` — fără backend: `mailto:` sau formular terț fără cookies; spune clar ce se întâmplă cu mesajul
  - [ ] `404` — mesaj prietenos + link către cuprins
- [ ] Branding
  - [ ] Logo placeholder (SVG, funcționează pe ambele teme)
  - [ ] Favicon + `apple-touch-icon`
  - [ ] `manifest.webmanifest` cu nume și culori
- [ ] Conformitate (verificare explicită, conform `Plan.md`)
  - [ ] Fără autentificare nicăieri
  - [ ] Fără cookies — DevTools → Application → Cookies: gol
  - [ ] Fără analytics/tracking terț
  - [ ] Fără `localStorage` cu date personale (doar preferința de temă, documentată)
  - [ ] Fără cereri către domenii externe (tab Network gol după încărcare)

**Gata când:** poți naviga tot site-ul pe telefon și pe desktop, cuprinsul afișează metodele (fie și „în curând"), iar tab-ul Cookies e gol.

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

## Faza 5 — Pipeline Manim *(poate merge în paralel cu Fazele 3–4)*

**Obiectiv:** clipuri explicative pre-randate, cu aceeași estetică cu restul site-ului. Manim rulează **offline**, la build local — niciodată în browser.

- [ ] Mediu Python
  - [ ] `manim/` cu `.venv`, `requirements.txt` (versiuni fixate)
  - [ ] Verificare dependențe de sistem (ffmpeg, cairo, LaTeX dacă folosim `Tex`)
  - [ ] `manim/README.md`: instalare pas cu pas, comenzi de randare
  - [ ] Randare de test a unei scene demo
- [ ] Șablon și temă
  - [ ] `manim/theme.py` — culorile și fonturile site-ului, importate de toate scenele
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

**Obiectiv:** ~15 metode, fiecare la calitatea paginii-pilot.

### Lista metodelor *(de completat — vezi `Plan.md`, secțiunea „Lista Algoritmi")*

| Nr. | Metodă | Capitol | Implementare | Manim | Text | Interactiv | Mobil | Gata |
|-----|--------|---------|--------------|-------|------|------------|-------|------|
| 1   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 2   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 3   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 4   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 5   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 6   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 7   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 8   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 9   |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 10  |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 11  |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 12  |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 13  |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 14  |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |
| 15  |        |         | [ ]          | [ ]   | [ ]  | [ ]        | [ ]   | [ ]  |

- [ ] Completează tabelul cu cele ~15 metode alese
- [ ] Grupează-le pe capitole și stabilește ordinea de implementare
- [ ] Deschide câte un issue GitHub pentru fiecare metodă, cu checklist-ul de mai jos

### Checklist-template per metodă *(copiază-l pentru fiecare)*

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
  - [ ] Scoatere din starea „în curând" pe pagina de cuprins

</details>

**Ordinea sugerată:** întâi metodele cu vizual simplu (rădăcini de ecuații, integrare numerică), apoi sistemele liniare (vizual mai greu — matrice, convergență), apoi ecuațiile diferențiale.

**Gata când:** toate rândurile din tabel sunt bifate și nicio metodă nu mai e „în curând".

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

| Risc | Impact | Cum îl reducem |
|------|--------|----------------|
| Fișierele Manim umflă repo-ul | Clonare lentă, limite Pages | Compresie agresivă, mutare în Releases dacă depășim ~100 MB |
| Parsarea expresiilor introduse de utilizator | Erori, blocaje, cod nesigur | Librărie testată, fără `eval`, limită de evaluări, validare la tastare |
| Animațiile lagg-uiesc pe telefon | Site inutilizabil exact pentru publicul-țintă | Buget de performanță, testare pe device real de la Faza 6 |
| Cele 15 metode devin repetitive și se abandonează | Site incomplet | Template congelat după pilot, un issue per metodă, ordine de la ușor la greu |
| Manim consumă mult timp per metodă | Întârzieri | Scene scurte (10–20s), șablon comun, fallback imagine statică acceptabil |

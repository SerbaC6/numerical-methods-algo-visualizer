# Referințe — ce împrumutăm, ce evităm

Analiză făcută în Faza 2, înainte să fixăm design system-ul. Scopul nu e să copiem un site,
ci să nu reinventăm decizii deja rezolvate bine de alții.

---

## [engineersuniverse.com — Numerical Methods Visualizer](https://engineersuniverse.com/webapps/numerical-methods-visualizer)

**Cel mai apropiat de noi ca subiect.** Acoperă puțin: bisecție, Newton-Raphson, sume Riemann
(stânga / dreapta / mijloc) și formula trapezelor. Interfața are funcții presetate, butoane
Step/Play, ajustarea intervalului `[a, b]` sau a lui `x₀`, un cursor pentru numărul de
subintervale, grafic, tabel de iterații și afișarea erorii absolute și relative.

**Împrumutăm:**

- afișarea erorii absolute **și** relative lângă valoarea curentă — studentul vede imediat cât de
  bună e aproximarea, nu doar unde a ajuns;
- funcții presetate ca punct de plecare — nimeni nu vrea să tasteze o expresie ca să vadă ceva;
- perechea grafic + tabel de iterații, sincronizate.

**Evităm:**

- textul lung înainte de vizualizare — la noi teoria e maximum un paragraf, animația vine prima;
- doar 3 funcții presetate și niciun câmp liber — noi avem `ExpressionInput`;
- lipsa comparației între metode pe același grafic — la noi paginile grupează metode înrudite
  tocmai ca să se poată face paralela (Jacobi vs. Gauss-Seidel vs. SOR, pe aceeași matrice);
- Newton fără să spună de unde vine `f'(x)`.

---

## [visualgo.net](https://visualgo.net/en)

Referința pentru **playback**. Bară de tip player: „go to beginning", „previous frame", „pause",
„play", „next frame", „go to end", plus selector de viteză și salt de ±7 cadre. Are un panou de
pseudocod care se poate ascunde, cu **linia curentă evidențiată** sincron cu animația, și un panou
de stare care descrie pasul curent în cuvinte.

**Împrumutăm:**

- bara de playback completă (`PlaybackBar`: reset, pas înapoi, play/pauză, pas înainte, viteză,
  poziție) — modelul de media player e deja cunoscut de toată lumea;
- **evidențierea liniei curente sincron cu animația.** La noi asta nu e pseudocod, ci **formula**:
  `FormulaBlock` primește id-uri `\htmlId{...}` și le aprinde pe cele active. Exact cerința din
  `Plan.md` — să se vadă unde e `l21` în formulă când animația calculează `l21`;
- explicația pasului curent, într-o propoziție, lângă animație (câmpul `explicație` din tipul
  `Step`, Faza 4).

**Evităm:**

- densitatea de controale și de moduri (e-Lecture, quiz, login) — noi n-avem conturi și nici nu
  vrem un panou de comandă;
- pseudocodul ca panou permanent — publicul nostru vrea legătura formulă ↔ desen, nu cod.

---

## [dsavisualizer.in](https://www.dsavisualizer.in/visualizer/searching/binarysearch)

Referința pentru **structura paginii** și pentru **legendă**. Fiecare stare are o culoare cu
înțeles fix: elementul din mijloc, intervalul activ, ce s-a eliminat, ce s-a găsit. Pagina merge
vertical: vizualizare → controale → cod → explicații pe secțiuni scurte.

**Împrumutăm:**

- **legenda de culori, obligatorie la fiecare interfață interactivă** (cerință explicită din
  `Plan.md`) — la noi rolurile sunt deja tokens: `--viz-curent`, `--viz-anterior`, `--viz-interval`,
  `--viz-solutie`, `--viz-grila`;
- stivuirea verticală pe mobil: graficul sus, controalele dedesubt;
- butonul „aleatoriu / resetează", ca să poți încerca alt caz fără să gândești.

**Evităm:**

- selectorul de limbaj de programare — nu suntem un site de cod;
- secțiunile lungi de teorie de sub vizualizare.

---

## [csvistool.com](https://csvistool.com/)

Layout curat, o singură vizualizare pe ecran, fără decor. Confirmă regula pe care o adoptăm:
**pe pagina de algoritm, singurul lucru care se mișcă e graficul.** Efectele decorative
(Magic UI, Aceternity) stau pe pagina de cuprins și pe hero, nicăieri altundeva.

---

## [PerfectlyNormal](https://math345-games.github.io/PerfectlyNormal/) (citat în `Plan.md`)

Model pentru jocul de Gram-Schmidt de pe pagina 2. Ideea de reținut: ortogonalizarea devine un
**joc cu pași**, nu o formulă. La noi pașii trebuie să fie mai puțini și mai explicit numerotați
decât acolo, cu formula alături la fiecare pas.

---

## [3Blue1Brown](https://www.3blue1brown.com)

Referința pentru **mișcare și pentru desenul matematic**. Legătura nu e doar estetică: **Manim e
motorul lui Grant Sanderson**, exact cel pe care îl folosim în Faza 5. Deci ce se vede acolo nu e
un ideal îndepărtat, e ce poate produce unealta pe care o avem deja în `manim/`.

Site-ul e organizat pe „lecții" grupate pe domenii (algebră liniară, analiză, ecuații
diferențiale, rețele neuronale), fiecare cu video plus text — nu e o galerie de clipuri, e un
material didactic.

**Împrumutăm:**

- **Transformarea, nu tăietura.** Un obiect se _preface_ în altul, nu dispare ca să apară altceva
  în loc. În Manim asta e `Transform`. Aplicat direct la noi: matricea care se desface în `L` și
  `U` (pagina 1), linia care se scade din alta (pagina 3), cercul unitate care devine elipsă
  (pagina 8). Continuitatea vizuală e cea care explică, nu textul de sub desen.
- **O idee nouă pe cadru**, cu o pauză după ea. Ritmul lui 3b1b e lent intenționat: desenul stă pe
  ecran după ce s-a terminat mișcarea. Scenele noastre sunt de 10–20s — cu atât mai mult contează
  să nu înghesuim trei idei în ele.
- **Partea din formulă se aprinde odată cu partea din desen.** Tehnica vine de aici; noi o avem
  deja ca cerință în `Plan.md` și ca mecanism în `FormulaBlock` (`\htmlId`). 3b1b e dovada că
  funcționează didactic, nu doar decorativ.
- **Camera dirijează atenția**: se apropie de zona care contează, nu se plimbă ca efect.

**Evităm:**

- **Paleta lui.** Albastru-galben-verde pe negru e semnătura lui 3b1b și **nu intră la noi** —
  avem „Sapphire nightfall whisper", închisă. Împrumutăm gramatica mișcării, nu culorile.
- **Formatul pasiv.** 3b1b e video liniar, de 20 de minute, în care privești. Site-ul nostru e
  interactiv: clipul Manim e hero-ul de sus, dar lucrul principal e interfața cu care se joacă
  studentul. Un clip lung ar înlocui exact ce vrem să facem.
- Densitatea de idei pe minut — la el funcționează pentru că poți da înapoi; la noi, o animație
  care cere replay e o animație ratată.

---

## [Desmos](https://www.desmos.com/calculator)

Referința pentru **`Plot`**, primitiva noastră cea mai grea. E cel mai bine rezolvat grafic
matematic interactiv de pe web, și rezolvă exact problemele pe care le vom avea.

**Împrumutăm:**

- **Imediatețea**: curba se redesenează în timp ce tragi de cursor, fără buton „calculează".
  Regulă pentru noi: orice schimbare de parametru se vede instant (cu `debounce` doar pe câmpul de
  expresie, cât să nu recalculeze la fiecare tastă).
- **Cursorul care poate fi animat** — Desmos pune un buton de play pe fiecare parametru și îl
  plimbă între capete. E o idee mai bună decât un simplu slider pentru „ce se întâmplă când crește
  `n`" (numărul de subintervale, pagina 12; `ω` la SOR, pagina 4).
- **Punctele care se trag cu mouse-ul** — exact interacțiunea de pe pagina 9 (mută nodul de
  interpolare, vezi cum se zbate polinomul Lagrange; de aici se ajunge natural la Runge).
- **Axele rămân lizibile la orice scară**: densitatea etichetelor se adaptează, iar pasul grilei
  merge pe 1 / 2 / 5 / 10. E o specificație concretă pentru `Plot`, nu o impresie.
- **Accesibilitatea graficului** — Desmos e cel mai bun din clasă: graficul se explorează cu
  tastatura și e descris în cuvinte pentru cititorul de ecran. Faza 9 ne cere „rezumat textual al
  vizualizării"; modelul e aici.

**Evităm:**

- **Interfața de calculator.** La Desmos, lista de expresii _este_ produsul. La noi, pagina are un
  set fix de parametri didactici, ales de noi; nu construim un teren de joacă gol, ci arătăm o
  metodă anume.
- Cantitatea de crom din jurul graficului (tastatură matematică, meniuri, moduri) — noi păstrăm
  ecranul curat, conform regulii luate de la csvistool.

---

## [Observable](https://observablehq.com)

Referința pentru **reactivitate** și pentru **cum se organizează un desen din straturi**. Azi
înseamnă Notebooks 2.0 (notebook-uri reactive în browser), plus bibliotecile lor: Observable Plot,
Observable Inputs și D3.

**Împrumutăm:**

- **Modelul reactiv**: schimbi o intrare, se recalculează automat tot ce depinde de ea. E exact
  lanțul pe care l-am ales deja în Faza 4 — `params → run() → steps[] → grafic + tabel`. Observable
  confirmă arhitectura, nu o schimbă.
- **Vocabularul de „marks" din Observable Plot**: `point`, `line`, `area`, `rule`. Merită copiat ca
  _structură_ în `Plot`-ul nostru: straturi cu nume clare (punct, curbă, arie, tangentă, interval),
  compuse peste aceleași axe — nu un morman de proprietăți pe o componentă uriașă. Asta ne dă și
  reutilizarea între paginile 5, 9, 12, 14, care desenează lucruri diferite pe aceeași bază.
- **Observable Inputs**: controale cu valori implicite gândite, nu goale. Se leagă de regula deja
  luată de la engineersuniverse — presetări, ca studentul să vadă ceva fără să tasteze nimic.

**Evităm:**

- **Dependența.** Luăm ideile, nu bibliotecile: decizia rămâne **SVG scris de mână** (vezi TODO-ul
  din `CLAUDE.md`). D3/Plot ar aduce 40–100 KB și sunt gândite pentru date, nu pentru „o tangentă
  care apare la pasul 3". În plus, nimic încărcat de pe domenii externe — regulă de arhitectură.
- **Codul la vedere.** Notebook-ul arată cod pentru că publicul lui scrie cod. Publicul nostru vrea
  formula; codul nu apare pe site.
- Estetica de data-journalism (grafice de business, tabele de date) — nu e subiectul nostru.

---

## Ce iese din analiză, ca reguli

1. **Animația prima, textul al doilea.** Teoria: maximum un paragraf.
2. **Bara de playback e aceeași peste tot.** Un student învață controalele o dată.
3. **Formula e „pseudocodul" nostru** și se evidențiază sincron cu animația.
4. **Fiecare interfață interactivă are legendă** și o instrucțiune de folosire în 3–5 pași.
5. **Culorile au înțeles fix**, aceleași în web și în scenele Manim (aceleași tokens `--viz-*`).
6. **Pe mobil: grafic sus, controale jos.** Pe desktop: alături.
7. **Se transformă, nu se taie.** Un obiect se preface în altul; nu dispare ca să apară altul în
   locul lui. Valabil și în Manim (`Transform`), și în SVG-ul din browser.
8. **O idee nouă pe cadru**, cu o pauză după ea. Dacă o animație cere replay ca s-o înțelegi,
   e de refăcut.
9. **Fără buton „calculează".** Orice schimbare de parametru se vede instant; `debounce` doar pe
   câmpul de expresie.
10. **`Plot` se compune din straturi cu nume** (punct, curbă, arie, tangentă, interval), nu dintr-o
    componentă cu treizeci de proprietăți.
11. **Ideile se împrumută, bibliotecile nu.** Nicio dependență nouă de desen, nimic de pe domenii
    externe. Și **niciodată paleta altcuiva** — nici a lui 3b1b.

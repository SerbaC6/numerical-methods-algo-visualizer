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

## Ce iese din analiză, ca reguli

1. **Animația prima, textul al doilea.** Teoria: maximum un paragraf.
2. **Bara de playback e aceeași peste tot.** Un student învață controalele o dată.
3. **Formula e „pseudocodul" nostru** și se evidențiază sincron cu animația.
4. **Fiecare interfață interactivă are legendă** și o instrucțiune de folosire în 3–5 pași.
5. **Culorile au înțeles fix**, aceleași în web și în scenele Manim (aceleași tokens `--viz-*`).
6. **Pe mobil: grafic sus, controale jos.** Pe desktop: alături.

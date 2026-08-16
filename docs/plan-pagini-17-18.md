# Plan — pagina 17 (cuadraturi adaptive și Gaussiene) și pagina 18 (ODE)

Planul cerut în `imbunatatiri.md`, ultimele două secțiuni. Sursele sunt
`cursuri_MN/romberg-cuadraturi-gaussiene_curs12.md` (pagina 17) și
`cursuri_MN/ode-runge-kutta_curs13.md` (pagina 18). Cifrele din plan sunt deja verificate numeric
(vezi §„Verificări făcute pentru plan"); ce nu e verificat e marcat ca atare.

---

## Pagina 17 — `cuadraturi-adaptive-si-gaussiene`

### Ce are și ce nu are pagina

Cererea: **doar teorie și interactiv**. Deci în `registry.ts` intrarea primește `clip: false`, iar
secțiunea „Vizual" lipsește complet — fără schelet, fără text de așteptare.

Interactivul e **piesa centrală a paginii**: un `Plot` mare, aerisit, cu două sloturi separate —
unul pentru cuadraturi adaptive, unul pentru cuadraturi Gaussiene. Graficul reproduce tipul din
capturi (`16-59-05`, `16-59-53`, `17-00-00`, `17-00-04`): curbă albastră, arie umplută sub ea,
nodurile marcate pe axă, capetele scrise `a` și `b`. **Pe grafic nu se scriu formule** — formulele
stau în teorie și în panoul de sub grafic, nu peste desen.

### Structura interactivului

Două taburi pe același cadru, ca la pagina 3 și pagina 8 (`Tabs` + `ControlPanel` + `Plot`):

**Tab 1 — Simpson adaptiv.** Utilizatorul alege funcția (dropdown, ca la pagina 15) și toleranța
`ε`. Desenul arată:

- curba și aria, ca în capturi;
- **panourile pe care s-a oprit recursia**, fiecare cu parabola lui Simpson desenată peste bucata
  de curbă — se vede că panourile sunt înghesuite unde funcția se mișcă și late unde e plată;
- sub axă, o **bandă de subdiviziune**: fiecare nivel al recursiei e un rând de segmente, tăiate
  în două acolo unde testul `|S(a,b) − S(a,c) − S(c,b)| ≥ 15ε` a picat. Asta e primitiva nouă a
  paginii — arborele desenat ca benzi suprapuse, nu ca pădure de linii verticale, altfel la ε mic
  desenul devine ilizibil;
- panoul curent evidențiat cu `--viz-interval`, exact ca la pagina 16.

Pasul curent se derulează cu `PlaybackBar`: un pas = o decizie de împărțire, cu propoziția ei în
`StepExplanation` („pe [0; 0,25] cele două estimări diferă cu 3,1·10⁻³, peste 15ε, deci intervalul
se taie la mijloc").

**Tab 2 — cuadraturi Gaussiene.** Parametri: funcția, intervalul `[a, b]`, numărul de noduri
`n = 1…5`. Desenul arată:

- nodurile **echidistante** ale lui Newton-Cotes și nodurile **Gaussiene**, pe aceeași axă, cu o
  tranziție `motion` de la unele la altele când se apasă comutatorul — asta e ideea din capturile
  `17-00-00` (noduri fixe la capete) și `17-00-04` (noduri alese optim), și tot ea e ce trebuie
  văzut din pagină;
- înălțimile `f(xᵢ)` ca segmente verticale, cu grosimea proporțională cu ponderea `cᵢ`, ca să se
  vadă că nodurile din mijloc cântăresc mai mult;
- aria exactă și aria aproximată suprapuse, cu eroarea scrisă în panou, nu pe desen.

### Exemplele — de ce contează metodele (cerința explicită din `imbunatatiri.md`)

Cinci funcții în dropdown, fiecare aleasă ca să arate un lucru și numai unul. Toate cifrele de mai
jos sunt măsurate, nu estimate:

| Funcția                              | Ce arată                                                                                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e⁻³ˣ·sin 4x` pe `[0; 4]`            | **Cazul care justifică adaptivul.** La `ε = 10⁻⁶`, recursia se oprește cu 24 de panouri: 8 stau în `[0; 0,5]`, unde funcția oscilează, și doar 4 în `[2; 4]`, unde e practic plată.          |
| aceeași, comparată cu Simpson compus | Adaptivul atinge eroarea `1,9·10⁻⁷` cu 24 de panouri; Simpson compus cu pas uniform are nevoie de `N = 128` ca să ajungă la `2,4·10⁻⁷`. Aceeași precizie, de câteva ori mai puține evaluări. |
| `x³ − 2x` pe `[0; 2]`                | **Cazul care justifică Gauss.** Cu 3 puncte echidistante, trapezele greșesc cu `1,0`; Gauss cu **2** noduri dă exact — gradul de valabilitate `2n − 1 = 3`.                                  |
| `eˣ` pe `[0; 1]`                     | Gauss cu 2 noduri (`3,9·10⁻⁴`) bate Simpson cu 3 noduri (`5,8·10⁻⁴`); cu 3 noduri, Gauss coboară la `8,2·10⁻⁷`.                                                                              |
| `sin x` pe `[0; π]`                  | Diferența cea mai mare: Simpson pe 3 puncte greșește cu `9,4·10⁻²`, Gauss pe 3 noduri cu `1,4·10⁻³`.                                                                                         |
| `1/x` pe `[1; 2]`                    | Funcție netedă, dar cu variație mare la stânga: adaptivul își pune panourile spre `x = 1`, iar Gauss cu 5 noduri ajunge la `2,3·10⁻⁸`.                                                       |

Ce trebuie să rămână cititorului, spus prin desen și cifre, nu prin paragraf: **adaptivul pune
efortul unde e nevoie de el; Gauss cumpără două grade de exactitate cu același număr de evaluări.**

### Teoria pe scurt (structura secțiunilor)

Toate formulele din curs 12, verificate față de fișier. Banda-țintă de proză e ~23 de cuvinte per
formulă (etalonul `ecuatii-neliniare`), maxim ~30.

1. **Ce e o cuadratură adaptivă** — estimarea erorii din două aplicări ale lui Simpson:
   `S(a,b)` vs. `S(a,c) + S(c,b)`, factorul 1/15, testul `< 15ε`, împărțirea recursivă cu `ε/2` pe
   fiecare jumătate.
2. **Cuadraturi Gaussiene: nodurile nu mai sunt date** — `∫f ≈ Σcᵢf(xᵢ)` cu `2n` necunoscute,
   gradul de valabilitate `2n − 1`, condiția de ortogonalitate a lui `π(x) = ∏(x − xᵢ)`.
3. **Polinoamele Legendre monice** — `P₀…P₄` din curs, rădăcinile lor ca noduri, coeficienții `cᵢ`.
4. **Schimbarea intervalului** — `t = (2x − a − b)/(b − a)` și formula transportată pe `[a, b]`.
5. **Celelalte familii, în revistă** — Cebâșev, Laguerre, Hermite, Gauss-Radau: fiecare cu ponderea
   `w(x)` și intervalul ei, o propoziție fiecare. Fără dezvoltări.

Extrapolarea Richardson și Romberg **rămân în afara paginii**: `Plan.md` le-a scos la trecerea de
la 20 la 18 pagini, iar pagina are deja două metode de dus.

### Fișiere

- `src/algorithms/cuadraturi/adaptiv.ts` — recursia Simpson, cu `steps[]`: fiecare pas e un nod al
  arborelui, cu `[a, b]`, cele trei estimări, testul și decizia.
- `src/algorithms/cuadraturi/gaussiene.ts` — nodurile și ponderile Legendre pentru `n = 1…5`
  (calculate din polinoamele monice din curs, nu copiate din tabel), schimbarea de interval, gradul
  de exactitate măsurat pe monoame.
- `src/algorithms/cuadraturi/functii.ts` — cele șase funcții de mai sus, cu primitivele lor
  analitice (integrala exactă trebuie să fie exactă, altfel toate erorile din pagină sunt măsurate
  față de un număr greșit).
- `src/components/content/InterfataCuadraturi.tsx` — cele două taburi.
- `src/components/viz/PlotSubdiviziune.tsx` — primitiva nouă (banda de recursie).
- `src/content/cuadraturi-adaptive-si-gaussiene.tsx` — teoria.
- `scripts/verificare-algoritmi/cuadraturi.ts` — verificarea numerică.
- Înregistrări: `src/content/index.ts`, `PIESE_PAGINA` din `src/pages/PaginaAlgoritm.tsx`,
  `gata: true` + `clip: false` în `registry.ts`.

Se refolosesc: `Plot`, `PlotCurba`, `PlotArie`, `PlotPunct`, `PlotVerticala`, `ControlPanel`,
`NumberInput`, `PlaybackBar`, `StepExplanation`, `Legend`, `FormulaBlock`.

### Ce se verifică numeric înainte de „gata"

- primitivele analitice ale celor șase funcții, derivate simbolic și comparate cu integrarea fină;
- estimarea de eroare a adaptivului chiar mărginește eroarea reală, la `ε` între `10⁻³` și `10⁻⁹`;
- nodurile Gaussiene sunt rădăcinile polinoamelor Legendre monice din curs, la `10⁻¹²`;
- gradul de valabilitate măsurat pe monoame: `n` noduri integrează exact `1, x, …, x^(2n−1)` și
  greșesc pe `x^2n`;
- schimbarea de interval nu strică exactitatea: același test pe `[a, b]` oarecare.

---

## Pagina 18 — `ecuatii-diferentiale`

### Ce are și ce nu are pagina

Cererea: **doar animație și teorie**. Deci `interactiv: false` în `registry.ts`, iar secțiunea
„Interactiv" lipsește complet. Clipul e scris în cod (`AnimatiaEcuatiilorDiferentiale`), cu ceas
propriu, ca la celelalte 11 clipuri.

Accentul, cerut explicit: **importanța ODE → Euler → restul metodelor în revistă**, cu ceva mai
mult spațiu pentru RK4. Clipul e mijloc de înțelegere vizuală, nu tablă de formule: pe ecran ajunge
strictul necesar.

### Clipul, moment cu moment

Șase momente, fără numerotare pe ecran (regula din CLAUDE.md).

1. **Albia** — o pantă e desenată în fiecare punct al planului, ca un câmp de segmente scurte.
   Nu se scrie nicio formulă: se vede doar că prin fiecare punct trece o direcție. Metafora cerută:
   albia unui râu — malurile spun încotro curge apa, oriunde ai turna-o.
2. **Un punct și o albie fac o curbă** — se pune un punct `(t₀, y₀)`, iar din el curge o curbă care
   urmează direcțiile. Se mută punctul de pornire: altă curbă, aceeași albie. Aici intră, într-o
   propoziție, ce e problema Cauchy: ecuația dă panta, condiția inițială alege curba.
3. **Euler: mergi pe tangentă cât ține pasul** — din `(t₀, y₀)` pleacă un segment de pantă
   `f(t₀, y₀)`, lung `h`; la capăt se ia panta nouă și se pleacă din nou. Se arată abaterea față de
   curba adevărată ca o distanță care crește pas cu pas.
4. **Pasul mai mic, drumul mai aproape** — aceeași construcție cu `h` din ce în ce mai mic, în
   suprapunere. Măsurat: la înjumătățirea pasului, eroarea lui Euler se înjumătățește și ea.
5. **De ce greșește Euler și cum se repară** — panta se ia doar la începutul pasului, deci în
   curbură se pierde. Punctul de mijloc ia panta din mijlocul pasului; Euler modificat face media
   dintre panta de la început și cea de la capăt. Două segmente pe ecran, una lângă alta, cu
   distanța rămasă față de curbă.
6. **RK4: patru sondaje, o singură medie** — `k₁` la început, `k₂` și `k₃` la mijloc, `k₄` la
   capăt, apoi pasul făcut cu media ponderată `(k₁ + 2k₂ + 2k₃ + k₄)/6`. Cele patru sonde se
   desenează ca săgeți scurte, apoi se topesc într-una singură. Se închide cu comparația măsurată
   pe același pas.

Exemplul desenat, fix: `y′ = y − t² + 1`, `y(0) = 0,5`, pe `[0; 2]`, cu soluția exactă
`y(t) = (t + 1)² − ½eᵗ`. Are exact ce trebuie pentru clip: soluția se curbează vizibil, deci
abaterea lui Euler se vede cu ochiul liber, iar câmpul de direcții nu e nici plat, nici haotic.
Cursul nu dă un exemplu rezolvat, deci exemplul e ales aici și verificat numeric separat.

Cifrele de închidere (măsurate, la `h = 0,1` pe `[0; 2]`, eroarea în `t = 2`): Euler `2,4·10⁻¹`,
Euler modificat `1,9·10⁻²`, punctul de mijloc `3,7·10⁻³`, RK4 `7,0·10⁻⁶`. La înjumătățirea pasului,
eroarea lui Euler scade de ~2 ori, iar a lui RK4 de ~16 — ordinul 1 față de ordinul 4, arătat ca
raport, nu enunțat.

### Primitiva nouă

`PlotCampDirectii` — multe segmente scurte orientate, desenate ca un singur `<path>` cu comenzi
`M`/`l`, nu ca sute de elemente `<line>`, ca să nu se împotmolească pe mobil. Densitatea scade
automat sub o lățime dată. E singura piesă nouă a paginii; restul e `Plot` + `PlotCurba` +
`PlotDreapta` + `PlotPunct`, toate existente.

### Teoria pe scurt (structura secțiunilor)

1. **Problema Cauchy** — `y′ = f(t, y)`, `y(a) = α`; ecuația dă panta în fiecare punct, condiția
   inițială alege curba.
2. **Când există și e unică soluția** — condiția Lipschitz, criteriul practic `|∂f/∂y| ≤ L`, teorema
   de existență și unicitate. Problema bine pusă, într-o propoziție.
3. **Metoda lui Euler** (secțiunea cea mai lungă) — Taylor cu restul de ordin 2, `wᵢ₊₁ = wᵢ +
h·f(tᵢ, wᵢ)`, ce se aruncă și cât costă. Aici se spune și de ce e importantă: cere un singur
   punct de pornire și o singură evaluare pe pas.
4. **Metode Taylor** — în revistă: ordin mai mare, dar cu prețul derivatelor lui `f`.
5. **Runge-Kutta** — ideea care le leagă: aceeași precizie ca Taylor, fără nicio derivată. Ordin și
   rang. Ordin 2: punctul de mijloc și Euler modificat (cu Heun și Euler-Cauchy ca particularizări
   ale lui `u₁`, o propoziție).
6. **RK4** (a doua secțiune ca greutate) — cele patru `kᵢ` și media lor ponderată; de ce e cea
   folosită în mod uzual.
7. **Metode multipas, în revistă** — forma generală, explicit vs. implicit, Adams-Bashforth și
   Adams-Moulton cu câte o formulă (doi pași), fără tabelul complet de coeficienți.

### Fișiere

- `src/algorithms/ecuatii-diferentiale/metode.ts` — Euler, punct de mijloc, Euler modificat, RK4,
  fiecare cu `steps[]` (panta folosită, `k`-urile, `wᵢ`, eroarea față de exact).
- `src/algorithms/ecuatii-diferentiale/camp-directii.ts` — eșantionarea câmpului.
- `src/components/viz/PlotCampDirectii.tsx` — primitiva nouă.
- `src/components/content/AnimatiaEcuatiilorDiferentiale.tsx` — clipul.
- `src/content/ecuatii-diferentiale.tsx` — teoria.
- `scripts/verificare-algoritmi/ecuatii-diferentiale.ts` — verificarea numerică.
- Înregistrări: `src/content/index.ts`, `PIESE_PAGINA`, `gata: true` + `interactiv: false`.

### Ce se verifică numeric înainte de „gata"

- soluția analitică `(t + 1)² − ½eᵗ` chiar rezolvă `y′ = y − t² + 1` cu `y(0) = 0,5` (se verifică
  derivata simbolic și numeric);
- **ordinul fiecărei metode, măsurat ca pantă** la înjumătățirea pasului: ≈1 la Euler, ≈2 la punctul
  de mijloc și Euler modificat, ≈4 la RK4;
- punctul de mijloc coincide cu RK de rang 2 și `u₁ = ½` din curs, iar Euler modificat cu `u₁ = 1`,
  la `0` diferență;
- primii patru pași Euler cu `h = 0,5`, cifră cu cifră, față de calculul de mână.

---

## Ordinea de lucru propusă

Pagina 18 prima, pagina 17 a doua. Motivul e primitiva: câmpul de direcții e o piesă mică și
independentă, în timp ce banda de subdiviziune a paginii 17 trebuie desenată împreună cu recursia
care o produce. În plus, pagina 18 e listată ca „mediu" în registru, iar 17 ca „greu".

Pe fiecare pagină, ordinea internă rămâne cea de până acum: întâi `src/algorithms/` + scriptul de
verificare, apoi teoria din `src/content/`, apoi partea vizuală.

---

## Imaginea de referință pentru albie

Niciuna dintre cele 21 de capturi din `cursuri_MN/poze/` nu e despre ecuații diferențiale, iar
cursul 13 n-are figuri. Referința a venit separat și stă în
[`docs/inspiratie/ode-camp-de-directii.png`](./inspiratie/ode-camp-de-directii.png): câmp de pante
desenat peste tot planul, câteva soluții palide în fundal, una singură aprinsă și punctul ei de
pornire marcat. Primele două momente ale clipului o reproduc, cu culorile paletei: câmpul e grila,
curbele din fundal sunt estompate, soluția aleasă e curba, iar punctul de pornire e marcajul de
soluție.

## Verificări făcute pentru plan

Cifrele din tabelele de mai sus au fost calculate separat de aplicație, cu implementări scrise de la
zero (Simpson adaptiv recursiv, Gauss-Legendre cu `n = 1…5`, Euler / punct de mijloc / Euler
modificat / RK4). Ele intră în cod doar după ce sunt reproduse de scripturile din
`scripts/verificare-algoritmi/`, pe modulele reale ale proiectului — cum s-a procedat la pagina 16.

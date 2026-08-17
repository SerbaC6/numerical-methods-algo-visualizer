# Pagina 11 — textul „Teorie pe scurt" pentru interpolarea polinomială

## Context

`extra/MN_site` are 19 pagini de metodă; două au deja text scris — pagina 6
(`src/content/ecuatii-neliniare.tsx`) și pagina 7 (`src/content/metode-de-gradient.tsx`).
Pagina 11, `interpolare-polinomiala` (Lagrange, Neville, funcția Runge, spline), există în
registru dar n-are conținut: `getContinut()` întoarce `undefined`, iar secțiunea „Teorie pe scurt"
desenează un `Skeleton` tăcut.

Ce se face acum: **doar textul** — coloana „Text" din tabelul Fazei 7 din `Progress.md`.
Interfața interactivă (punctul care se trage cu mouse-ul) și clipul rămân pentru sesiuni
următoare, iar scheletele lor rămân tăcute, fără nicio etichetă de „în lucru".

Fonturile, alinierea și ierarhia **nu se ating**: `TeorieScurta` le impune deja. Un fișier care
respectă tipul `ContinutPagina` primește automat același model ca paginile 6 și 7 — formula la
1,4/1,5rem în caseta cu chenar, legenda literelor sub o linie de despărțire, simbolurile
aliniate la dreapta cu `font-mono`, esența cu bară de accent pe stânga. Nu se scrie CSS nou și
nu se atinge nicio componentă.

Sursa unică admisă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`.

## Ce s-a verificat deja (numeric, separat de aplicație)

Rulat pe fracții exacte / NumPy înainte de a scrie planul:

- **Lagrange ≡ Neville**, pe toate cele trei formulări din curs (σ-generală, `Q_{i,j}`, forma din
  laborator `P_ij`) plus codul OCTAVE — rezultate identice, exact, în patru puncte de test.
- **Diferențele divizate**: recurența și forma explicită coincid; forma Newton a polinomului dă
  exact același polinom ca Lagrange.
- **Newton–Gregory 1, 2 și 3** reproduc Lagrange la 12 zecimale; `F_k[x₀…x_k] = Δᵏf₀/(k!hᵏ)` ✓.
- **Runge pe [−1, 1], noduri echidistante**: 5 puncte → max|P| = 1,0000, eroare 0,4384;
  **11 puncte → max|P| = 1,9590 în x ≈ −0,940, eroare 1,9157** (funcția are maximul 1) — exact
  afirmația din curs. Spline cubic natural pe **aceleași** 11 puncte: eroare **0,02197**.
- **Spline**: liniarul interpolează; cubicul Hermite în bază Bernstein respectă valorile _și_
  derivatele în noduri; C² natural verifică racordarea C⁰/C¹/C² și `c₀ = c_n = 0`; tensionatul dă
  `s′ = f′` la capete; forma alternativă a lui `b_i` din curs coincide cu cea principală.

**Patru locuri din curs9 nu se verifică** (detalii în secțiunea de erată mai jos). Toate patru sunt
pași intermediari de derivare care oricum n-ar fi ajuns pe pagină — concluziile lor, da.

## Ce se scrie

### Fișier nou: `src/content/interpolare-polinomiala.tsx`

Aceeași formă ca `metode-de-gradient.tsx`: doc-comment cu sursa și verificarea numerică, apoi
`export const continutInterpolarePolinomiala: ContinutPagina`. Cinci carduri, în ordinea arcului
cerut de `Plan.md` (Lagrange → Neville → eroare → Runge → spline).

**`intro`** — problema comună: o funcție cunoscută doar în `n+1` puncte (suportul interpolării) se
înlocuiește cu un polinom care trece prin ele. Weierstrass (§1) spune că _există_ un polinom care
rămâne în banda `f ± ε`; ce urmează sunt căi diferite spre același polinom de interpolare — și, la
final, motivul pentru care uneori nu-l vrei. Atenție la formulare: Weierstrass nu garantează că
**polinomul de interpolare** converge — exact distincția pe care o sparge Runge.

| #   | Card                          | Sursă      | Blocuri                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Interpolarea Lagrange         | §2         | `l_k(x) = Π_{i≠k}(x−x_i)/(x_k−x_i)`; teorema `P_n(x) = Σ f(x_k)·Π…`, cu unicitatea polinomului de grad ≤ n și O(n³) pentru coeficienți                                                                                                                                                             |
| 2   | Metoda Neville                | §3         | inițializarea `P_ii(x) = f(x_i)` + recurența din laborator `P_ij = [(x−x_j)/(x_i−x_j)]P_{i,j−1} + [(x_i−x)/(x_i−x_j)]P_{i+1,j}`; text: ponderile se adună la 1, deci pasul e o interpolare liniară între două rezultate parțiale; schema triunghiulară urcă de la grad 0 la `P_{0n}`               |
| 3   | Diferențe divizate și eroarea | §4, §5, §6 | definiția recursivă `F_p`; forma explicită `Σ f(x_k)/Π(x_k−x_i)`; forma Newton a lui `P_n` + restul `R_n`; teorema erorii `f(x) = P(x) + f⁽ⁿ⁺¹⁾(ξ)/(n+1)!·(x−x₀)…(x−x_n)`; **text: propoziția despre Newton–Gregory** — pe noduri echidistante `F_k = Δᵏf₀/(k!hᵏ)`, de unde formulele Newton 1/2/3 |
| 4   | Fenomenul Runge               | §8         | `f(x) = 1/(1+25x²)` pe `[−1, 1]`; text: 5 puncte echidistante → oscilații moderate, 11 puncte → amplitudini care depășesc valorile funcției (vârf măsurat ≈ 1,96 la x ≈ −0,94, cu f ≤ 1). Concluzia cursului: creșterea gradului nu îmbunătățește neapărat aproximarea                             |
| 5   | Interpolarea spline           | §9–§12     | șase blocuri, mai jos                                                                                                                                                                                                                                                                              |

**Cardul 5, cele trei trepte** (decizia luată: un singur card, fără matricea tridiagonală desenată):

1. _text_ — ce e un spline (§9): funcție definită local pe subintervale, de obicei polinoame de
   grad 3; noduri echidistante → uniform; de interpolare vs. de aproximare.
2. _formulă_ — treapta liniară (§10): `a_i = [f(x_{i+1})−f(x_i)]/(x_{i+1}−x_i)`,
   `b_i = [x_{i+1}f(x_i) − x_i f(x_{i+1})]/(x_{i+1}−x_i)`. Explicație: condițiile sunt interpolarea
   plus continuitatea în nodurile interioare — deci curba n-are rupturi, dar are **colțuri**;
   derivata sare de la un subinterval la altul. **Nu se scrie „de clasă C¹"** (vezi erata).
3. _formulă_ — cubicul Hermite în bază Bernstein (§11):
   `s_i(t) = y_i(1−t)³ + (3y_i + h_i y′_i)t(1−t)² + (3y_{i+1} − h_i y′_{i+1})t²(1−t) + y_{i+1}t³`,
   cu `t = (x − x_i)/h_i`, `h_i = x_{i+1} − x_i`. Aici cade **propoziția despre Hermite**: se cer și
   derivatele în noduri, iar baza Bernstein `(1−t)³, 3t(1−t)², 3t²(1−t), t³` reduce volumul de
   calcul — aceleași polinoame revin la curbele Bézier (pagina 12).
4. _formulă_ — cubicul C² (§12): `s_i(x) = a_i + b_i(x−x_i) + c_i(x−x_i)² + d_i(x−x_i)³`, cu
   numărătoarea condițiilor: `n+1` de interpolare + `3n−3` de racordare = `4n−2`, față de `4n`
   necunoscute.
5. _formulă_ — recurența centrală:
   `h_{i−1}c_{i−1} + 2(h_{i−1}+h_i)c_i + h_i c_{i+1} = 3(a_{i+1}−a_i)/h_i − 3(a_i−a_{i−1})/h_{i−1}`.
   Explicație: un **sistem tridiagonal** în `c_i` — o propoziție, fără matricea desenată.
6. _formulă_ — restul coeficienților din `c_i`: `a_i = f(x_i)`, `d_i = (c_{i+1}−c_i)/(3h_i)`,
   `b_i = (a_{i+1}−a_i)/h_i − (h_i/3)(2c_i + c_{i+1})`. Explicație: cele două condiții care lipsesc
   se aleg — **natural** (`c₀ = c_n = 0`) sau **tensionat** (`s′` egală cu `f′` la capete).

**`incheiere`** — închide arcul cu cifrele verificate: pe aceleași 11 puncte echidistante din
`[−1, 1]`, polinomul de grad 10 ratează funcția Runge cu ≈ 1,92 (mai mult decât valoarea ei
maximă), în timp ce spline-ul cubic natural rămâne sub 0,022. Interpolarea pe porțiuni nu e un
compromis, e răspunsul.

### `src/content/index.ts`

Import + o linie în `CONTINUT`: `"interpolare-polinomiala": continutInterpolarePolinomiala`.
Atât — `PaginaAlgoritm` ia conținutul prin `getContinut(pagina.slug)` și îl dă lui `TeorieScurta`,
fără nicio modificare în pagină.

### `docs/erata-cursuri.md` — patru intrări noi (curs9)

Regula proiectului: formula greșită nu ajunge pe site și **nici nu se corectează tăcut**.

1. **§2 — multiplicatorii Lagrange.** Cursul scrie
   `l_k(x) = c_k(x − x1)…(x − x_{k−1})(x − x_{k+1})…(x − xn)` — produsul pornește de la `x1`, deși
   `c_k` pornește de la `x0`. Forma închisă de mai jos (`Π_{i≠k}`) e corectă și e singura care
   ajunge pe pagină.
2. **§4 — „Identitatea lui Newton".** Liniile intermediare n-au produsul acumulat în dreapta:
   cursul scrie `(x−x0)(x−x1)·F2[x,x0,x1] = F1[x,x0] − F1[x0,x1]`, dar relația adevărată e
   `(x−x1)·F2[x,x0,x1] = F1[x,x0] − F1[x0,x1]`. Măsurat pe `f(x) = x⁵`, noduri `{0,1,3,4}`, `x = 7/3`:
   stânga cursului `16240/243`, dreapta `2320/81`, raport exact `7/3 = x − x₀`. **Rezultatul final
   pe care cursul îl deduce — forma Newton plus restul `R_n` — e exact**, verificat pe fracții
   (`f(x) = P_n(x) + R_n(x)`, egalitate exactă). Pe site ajunge doar rezultatul.
3. **§7 — derivata multiplicatorului Lagrange.** Cursul dă `l′_k(x) = Π_{i≠k} 1/(x_k − x_i)`.
   Fals. Valoarea corectă în nod e `l′_k(x_k) = Σ_{j≠k} 1/(x_k − x_j)`. Tabel de verificare pe
   patru seturi de noduri — de reținut că primul set (`{0,1,3,4}`, k=1) dă **1/6 din amândouă
   formulele**, adică o coincidență care ascunde eroarea; `{0,1,2,5}`, k=2 → corect `7/6`, formula
   din curs `−1/6`. Hermite n-are card pe pagină, deci formula n-ar fi ajuns oricum pe site.
4. **§10 — eticheta „SPLINE de clasă C1 — polinoame liniare".** Condițiile de racordare enumerate
   chiar acolo cer doar `p_i(x_{i+1}) = p_{i+1}(x_{i+1})`, adică **C⁰**; pantele `a_i` diferă între
   subintervale, deci derivata e discontinuă în nodurile interioare. Pe pagină se scriu
   **condițiile**, nu eticheta.

### `Progress.md`

Bifat `[x]` pe coloana **Text** a rândului 11 din tabelul Fazei 7, plus o secțiune scurtă
„Pagina 11 — ce e gata și ce nu" în stilul celei existente pentru pagina 6: textul e scris și
verificat, interfața interactivă și clipul nu.

## Ce NU se face

- Nicio componentă nouă, niciun CSS, nicio culoare — `TeorieScurta` și `FormulaBlock` acoperă tot.
- Fără secțiune „cum se folosește", fără rezumat sub titlu, fără etichete de progres (CLAUDE.md).
- Fără `src/algorithms/interpolare-polinomiala/` — vine odată cu interfața interactivă.
- Fără carduri pentru Newton–Gregory și Hermite: câte o propoziție, în cardul 3 respectiv 5.

## Verificare

1. **Numeric, înainte de a scrie**: script de unică folosință în scratchpad (`verif_curs9.py`), care
   reface toate punctele din secțiunea „Ce s-a verificat deja" plus cele patru din erată. Nu se
   păstrează în repo — precedentul e `verif_curs6.py` din intrarea existentă de erată. Fiecare cifră
   care ajunge în text (1,96 / −0,94 / 0,022) se ia din ieșirea lui, nu se rescrie din memorie.
2. **Cuvânt cu cuvânt față de curs**: fiecare `latex` se compară cu blocul corespunzător din
   `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, cu atenție la indici (`i−j` vs `i+1`,
   `h_{i−1}` vs `h_i`) și la minusul tipografic. Câmpul `sursa` primește secțiunea exactă („curs 9,
   §3") — nu se afișează, dar e urma care face reverificarea posibilă.
3. `npm run typecheck` și `npm run lint` — verde. (`prettier --check` prinde și formatarea.)
4. `npm run dev` → `http://localhost:5173/numerical-methods-visualizer/algoritm/interpolare-polinomiala`:
   - toate formulele randează (KaTeX rulează cu `throwOnError: true`, deci o formulă stricată apare
     roșu, ca „Formulă invalidă" — semnal clar, nu tăcere);
   - secțiunile „Vizual" și „Interactiv" rămân schelete tăcute, fără text de așteptare;
   - comparat vizual cu `/algoritm/metode-de-gradient`: aceeași mărime de formulă, aceeași legendă
     „CE ÎNSEAMNĂ LITERELE", aceleași margini — dacă diferă ceva, e greșeală în date, nu în CSS.
5. **Ambele teme** (comutatorul din header) și **portret + peisaj** — formulele lungi (recurența
   spline, restul `R_n`) trebuie să deruleze orizontal în caseta lor, nu să lățească pagina.
6. Console curată: fără avertismente KaTeX în afara celui pentru `htmlExtension`, care e tăcut
   oricum din `FormulaBlock`.

# Erată — locuri din `cursuri_MN/` care nu se verifică

Regula proiectului e că **formulele vin exclusiv din curs**. Regula care o depășește în prioritate
e că **nimic greșit matematic nu ajunge sub ochii utilizatorului**. Când cele două intră în
conflict — adică atunci când o formulă din curs nu trece verificarea numerică — se procedează așa:

1. formula **nu** se pune pe site și **nu** se „corectează" tăcut;
2. dacă se poate păstra concluzia pe altă cale verificabilă, se păstrează concluzia;
3. cazul se scrie aici, cu verificarea numerică care l-a prins.

Fișierul ăsta există ca să nu se „repare la loc": cine deschide cursul peste trei luni și vede că
site-ul spune altceva trebuie să găsească aici de ce.

---

## curs7, §10 — matricea stocastică din exemplul PageRank

**Cursul cere trei lucruri deodată**, în paragraful „Construcția matricei":

1. element nenul pentru `Pi → Pj`;
2. **fiecare coloană însumează 1**;
3. **se normalizează după numărul de link-uri de ieșire**.

Primele două se verifică pe matricea tipărită. **A treia nu.** Pentru exemplul cursului
(`P1→{P2,P3}`, `P2→{P3}`, `P3→{P1,P4}`, `P4→{P2}`), matricea `M` tipărită împarte fiecare coloană la
numărul de link-uri care **intră** în pagina aceea, nu care ies din ea: e chiar `A` normalizată pe
coloane. Cea cerută de regula scrisă e transpusa lui `A` normalizat pe **linii** — link-urile de
ieșire ale unei pagini stau pe linia ei în `A`.

|                     | `M` tipărit în curs       | `M` după regula scrisă (link-uri de ieșire) |
| ------------------- | ------------------------- | ------------------------------------------- |
| linia 1             | `0  ½  ½  0`              | `0  0  ½  0`                                |
| linia 2             | `0  0  ½  0`              | `½  0  0  1`                                |
| linia 3             | `1  0  0  1`              | `½  1  0  0`                                |
| linia 4             | `0  ½  0  0`              | `0  0  ½  0`                                |
| PageRank (`d=0,85`) | `.2878 .2020 .3869 .1233` | `.1867 .2755 .3511 .1867`                   |
| clasament           | P3, P1, P2, P4            | **P3, P2, P1 = P4**                         |

**Nu e o diferență cosmetică: se schimbă clasamentul.** Cu matricea tipărită, `P1` iese a doua; cu
cea construită după regula scrisă, `P1` și `P4` sunt egale **exact** și împart locul 3.

**Verificare.** `(I − G)v = 0` cu `Σvᵢ = 1` și `d = 17/20`, rezolvat pe fracții, independent de
iterație, dă `v = (1429, 2109, 2687, 1429)/7654`, cu `G·v = v` exact. Metoda puterii de pe pagină
ajunge la aceleași cifre în 44 de iterații la `tol = 10⁻⁶`. Ambele drumuri, plus cifrele matricei
tipărite din tabelul de mai sus, sunt teste în `scripts/verificare-algoritmi/pagerank.ts`; testul
care ține erata pe loc e cel care cere ca matricea tipărită să **difere** de cea construită — dacă
cineva „repară" construcția înapoi la cifrele din curs, verificarea pică.

**Ce s-a pus pe site.** Regula scrisă a cursului, aplicată pas cu pas: `A` pe linii → împărțirea
fiecărei linii la numărul ei de link-uri → transpunerea → `G = d·M + ((1−d)/N)·ONES(N)`.
Transpunerea e chiar pasul care mută cerința „sumă 1" de pe linii pe coloane, deci se arată ca atare,
nu se ascunde. **Concluzia cursului rămâne neatinsă**: PageRank-ul e vectorul propriu al lui `G`
pentru `λ = 1`, care e și valoare proprie dominantă, deci se obține cu metoda puterii. Doar cifrele
exemplului sunt recalculate.

---

## curs6, §3.2 — derivata a doua a funcției de iterație a lui Newton

**Cursul scrie:**

```
g'(x)  = f(x)·f''(x) / (f'(x))²
g''(x) = 2·f''(x)/f'(x)
```

Prima e corectă. **A doua nu.**

**Verificare.** Pentru `f(x) = x² − 2`, funcția de iterație a lui Newton este
`g(x) = x − f(x)/f'(x) = x/2 + 1/x`. Derivata a doua a acestei funcții, calculată prin diferență
centrată, se compară cu cele două candidate:

| x   | g″ numeric | formula din curs, `2f″/f′` | `2/x³`       |
| --- | ---------- | -------------------------- | ------------ |
| 1,5 | 0,592593   | 1,333333                   | **0,592593** |
| 2   | 0,250000   | 1,000000                   | **0,250000** |
| 3   | 0,074074   | 0,666667                   | **0,074074** |
| √2  | 0,707107   | 1,414214                   | **0,707107** |

Formula din curs dă de patru ori valoarea reală în x = 2. Derivata a doua a lui `x/2 + 1/x` este
`2/x³`, ceea ce numericul confirmă pe toate cifrele.

Forma generală corectă, evaluată **în rădăcină** (unde `f(s) = 0`), este `g″(s) = f″(s)/f′(s)`:
la `s = √2` dă `2/(2√2) = 0,707107`, exact valoarea măsurată.

**Ce s-a pus pe site.** `g'(x)` da, cu tot cu observația `g′(s) = 0`. `g''(x)` nu apare deloc.
**Concluzia cursului — ordinul de convergență 2 pentru Newton-Raphson — rămâne**, fiindcă ea decurge
din `g′(s) = 0`: primul termen nenul din dezvoltarea Taylor devine cel cu `εₙ²`, iar exponentul lui
dă ordinul. Am confirmat-o și empiric pe `x² − 2` pornind din 2: ordinul estimat pe pași succesivi
iese 2,45 → 2,17 → 2,08, adică tinde la 2.

Scriptul de verificare: `scratchpad/verif_curs6.py` din sesiunea de lucru (nu e păstrat în repo,
fiind un calcul de unică folosință; tabelul de mai sus e rezultatul lui).

---

## curs6, §2.3 — tabelul comparativ de iterații

**Cursul dă**, pentru toleranță `10⁻¹⁵`:

| Funcție       | Bisecție | Secantă | Tangentă |
| ------------- | -------- | ------- | -------- |
| 0,25·eˣ − 2   | 48       | 7       | 7        |
| 3·cos(x) − 4x | 50       | 7       | 5        |
| x² − 2        | 49       | 7       | 6        |
| ln(x) − 2     | 46       | 6       | 4        |
| x² + √x − 6   | 48       | 7       | 5        |

Convenția de pornire e scrisă în curs: pentru o rădăcină `c`, metodele cu două valori inițiale
pornesc din `[[c], [c]+1]`, cele cu una din `[c]+1`. Cu ea, tabelul se poate testa — și se împarte
în trei cazuri diferite, care nu trebuie confundate.

**Secanta se reproduce exact, pe toate cele cinci rânduri:** 7, 7, 7, 6, 7. Modulul din
`src/algorithms/ecuatii-neliniare/secanta.ts` dă aceleași cifre, rulat cu Algorithm 3 și
`|xₙ − xₙ₋₁| < tol`. E verificarea cea mai puternică disponibilă pentru pagina 6, fiindcă nu compară
cu intuiția, ci cu cifre tipărite. Se rulează cu `scripts/verificare-algoritmi/tabelul-din-curs.ts`.

**Bisecția diferă din cauza criteriului de oprire.** Cursul enumeră mai multe criterii la §1.1, iar
Algorithm 1 îl folosește pe `|f(c)| > tol`. Noi am ales `b − a < tol` — primul din listă și singurul
care se poate garanta dinainte, prin `|pₙ − p| < (b−a)/2ⁿ`. Pe un interval de lungime 1 acesta dă
invariabil `⌈log₂(1/10⁻¹⁵)⌉ = 50` de pași, indiferent de funcție; criteriul pe `|f(c)|` depinde de
cât de abruptă e funcția în rădăcină, de-aia cifrele din tabel variază. Transcriind Algorithm 1
literal iese 49/51/50/**46**/51 — se potrivește exact pe `ln(x) − 2`, ceea ce confirmă că acela a
fost criteriul folosit; restul rămân decalate cu 1–3, cel mai probabil fiindcă pseudocodul testează
`|f(c)|` **înainte** ca `c` să fie calculat (linia 1 folosește un `c` neinițializat).

**Tangenta are o abatere care nu ține de criteriu.** Aici cursul se contrazice pe sine: transcriind
Algorithm 2 literal, cu chiar criteriul lui `|x − xprev| < tol`, ies 7, 5, 6, **5**, **6** — pe când
tabelul de alături spune 7, 5, 6, **4**, **5**. Primele trei rânduri se potrivesc; ultimele două nu,
și nu din cauza noastră: modulul nostru dă exact ce dă transcrierea literală. Verificarea din
`tabelul-din-curs.ts` compară deci tangenta cu **algoritmul**, nu cu tabelul, și scrie diferența pe
ecran ca să nu fie luată drept regresie.

**Ce s-a pus pe site.** Nu cifrele exacte, ci ordinul lor de mărime și concluzia, care sunt robuste
la criteriu: bisecția are nevoie de ordinul a 50 de iterații acolo unde secanta și tangenta termină
în 4–7. Concluzia calitativă a cursului — tangenta e mai rapidă decât secanta — se verifică pe toate
cele cinci funcții și e testată ca atare. Dacă vreodată vrem tabelul exact pe pagină, întâi trebuie
stabilit criteriul de oprire și recalculat, nu copiat.

---

## curs8, §7 — valorile singulare ale unei matrice simetrice

**Cursul scrie**, la cazul particular din construcția matricei `S`: dacă `A` este simetrică, atunci
`A = Aᵀ`, deci `A² = Aᵀ·A`, „și prin urmare **valorile singulare sunt chiar valorile proprii**".

Primele două egalități sunt corecte; concluzia nu ține când o valoare proprie e **negativă**.
Valorile proprii ale lui `Aᵀ·A = A²` sunt pătratele valorilor proprii ale lui `A`, iar valoarea
singulară e rădăcina **pozitivă** a fiecăruia — adică modulul, nu valoarea proprie.

**Verificare.** Pentru `A = [[1, 2], [2, 1]]`, simetrică:

| mărime           | valori    |
| ---------------- | --------- |
| valori proprii   | `−1`, `3` |
| valori singulare | `3`, `1`  |

`Aᵀ·A = A² = [[5, 4], [4, 5]]`, cu valorile proprii `9` și `1`; rădăcinile pozitive sunt `3` și `1`.
Definiția cursului însuși (`Sᵢᵢ ≥ 0`, §6) exclude `−1` ca valoare singulară, deci contradicția e
internă. Cazul cel mai scurt e `A = [−1]`: valoare proprie `−1`, valoare singulară `1`.

**Ce s-a pus pe site.** Concluzia corectă, care iese pe același drum: `sᵢ = |λᵢ|`, plus observația
că pentru o matrice simetrică cu valori proprii pozitive cele două liste coincid — adică exact
situația în care afirmația cursului e adevărată. Restul construcției (`A = U S Vᵀ`, `D = S²`,
`uᵢ = (1/sᵢ)·A·vᵢ`, completarea prin Gram-Schmidt) se verifică și rămâne neatinsă: pe
`A = [[3,1],[1,3],[1,1]]`, valorile proprii ale lui `AᵀA` ies `18` și `4`, coloanele `uᵢ` ies
ortonormate, iar `‖A − U S Vᵀ‖ ≈ 1·10⁻¹⁵`.

---

## curs2, §5.3 — prima linie a lui `U` la Doolittle

**Cursul scrie**, în lista de formule generale ale metodei Doolittle:

```
u_i1 = a_i1,   i = 1..n
l_i1 = a_i1 / u_11,   i = 2..n
```

Prima linie e greșită: indicii sunt inversați. `u_i1` e **coloana** întâi a lui `U`, iar `U` e
superior triunghiulară — `u_21` și `u_31` trebuie să fie 0, nu `a_21` și `a_31`. Corect e
`u_1i = a_1i`: prima **linie** a lui `U` copiază prima linie a lui `A`.

Cel mai probabil e o copiere din tiparul metodei Crout de deasupra (§5.2), unde `l_i1 = a_i1` chiar
e o coloană și e corect așa.

**Contradicție internă, în aceeași secțiune.** Sistemul 3×3 scris de curs cu două rânduri mai sus
dă exact forma corectă: `u11 = a11`, `u12 = a12`, `u13 = a13` — prima linie. La fel scrie și
curs4 §6.2: `u_1i = a_1i, i = 1 : n`.

**Verificare.** Pe `A = [[1,2,3],[2,8,11],[3,22,42]]`, aplicând algoritmul Doolittle în cele două
citiri:

| citirea                       | `U`                          | `U` superior triunghiulară? | `L·U = A`? |
| ----------------------------- | ---------------------------- | --------------------------- | ---------- |
| `u_1i = a_1i` (corectă)       | `[[1,2,3],[0,4,5],[0,0,13]]` | da                          | **da**     |
| `u_i1 = a_i1` (cum e tipărit) | `[[1,2,3],[2,4,5],[3,0,13]]` | **nu**                      | **nu**     |

Cu varianta tipărită, produsul iese `[[1,2,3],[4,8,11],[14,22,42]]` — prima coloană e stricată încă
de la al doilea element.

**Ce s-a pus pe site.** Forma corectă, `u_1i = a_1i`, care e și cea din curs4 §6.2 — deci nu e o
„corectură" a noastră, ci celălalt loc din aceleași cursuri unde formula e scrisă bine. Restul
formulelor Doolittle (`l_ij` cu `1/u_jj`, `u_ij` fără împărțire), plus Crout și Cholesky, se verifică
și rămân neatinse. **Concluzia cursului rămâne neatinsă**: Doolittle e factorizarea cu `l_ii = 1`,
iar exemplul de pe pagina 1 e chiar ea, cu `L = [[1,0,0],[2,1,0],[3,4,1]]` și
`U = [[1,2,3],[0,4,5],[0,0,13]]`, `Ly = b` dând `y = (6,9,13)` și `Ux = y` dând `x = (1,1,1)`.

---

## curs8, §4 — deplasarea numărată de două ori

**Cursul scrie**, în aceeași secțiune, două lucruri care nu pot fi adevărate deodată:

```
A^(i) − σI = Q^(i) R^(i)
A^(i+1)    = R^(i) Q^(i) + σI
```

și, câteva rânduri mai jos: „**Atenție:** valoarea proprie finală se obține adunând **suma tuturor
deplasărilor** aplicate până în acel moment (`λ ≈ a + Σσi`)."

Fiecare, luată singură, e corectă — dar ele descriu **două convenții diferite**, iar a doua
presupune că `σI` **nu** a fost readăugat. Cu formula tipărită, care îl readaugă la fiecare pas,
deplasarea e deja înapoi în matrice; mai adunând-o o dată, se numără de două ori.

**Verificare.** Matricea simetrică tridiagonală `a = (4, 3, 2, 1)`, `b = (1; 0,5; 0,25)`, cu
valorile proprii `0,932366`, `1,764540`, `2,657942`, `4,645152`. Se rulează QR cu deplasare, cu
`σi` luat din `E^(i)` exact ca în curs, până când `|bn| < 10⁻¹³` — trei pași în ambele variante:

| varianta                     | `an`               | `Σσi`    | `an + Σσi`         |
| ---------------------------- | ------------------ | -------- | ------------------ |
| cu `+ σI` (formula tipărită) | **0,932366034738** | 2,805715 | 3,738081           |
| fără `+ σI`                  | ≈ 0                | 0,932366 | **0,932366034738** |

Pe prima linie, `an` e **exact** o valoare proprie, iar `an + Σσi = 3,738081` nu e nimic — nu e
valoare proprie a matricei și nici măcar între două dintre ele într-un fel util. Pe a doua,
corecția cerută de curs e chiar ce lipsește. Contradicția e deci internă, nu o greșeală de calcul:
regula scrisă aparține variantei pe care formula de deasupra n-o folosește.

**Ce s-a pus pe site.** Varianta care decurge din formula tipărită, fiindcă formula e cea pe care o
citește studentul și cea care intră mai târziu în cod: `σI` se readaugă la fiecare pas, deci când
`bn` ajunge ≈ 0, cifra `an` **se citește direct** ca valoare proprie. Regula `λ ≈ a + Σσi` nu apare
pe pagină, în nicio formă. **Concluzia cursului rămâne neatinsă** — deplasarea schimbă raportul de
convergență din `|λj+1/λj|` în `|(λj+1 − σ)/(λj − σ)|` și accelerează metoda: pe aceeași matrice,
`|bn| < 10⁻¹²` cere **41** de pași fără deplasare și **3** cu deplasare.

Scriptul de verificare: `scratchpad/verifica_qr.py` din sesiunea de lucru (calcul de unică
folosință, ca la curs6 §3.2; tabelul de mai sus e rezultatul lui). Când pagina 10 primește modulul
din `src/algorithms/`, verificarea se mută în `scripts/verificare-algoritmi/`, pe cod real.

---

## curs4, §5.2 — „pivotarea parțială nu permută pe exemplul de mai sus"

**Cursul scrie**, ca observație la Algorithm 2 (pivotare parțială):

> „această metodă **încă nu rezolvă** eroarea din sistemul exemplu de mai sus — nu se efectuează
> nicio permutare."

Sistemul la care trimite „mai sus" e cel din §5.1:

```
[0.001  1] [x1]   [1]
[1      1] [x2] = [2]
```

**Afirmația nu se verifică.** Pivotarea parțială alege, pe coloana 1, elementul cel mai mare în
modul: `|1| > |0,001|`, deci **permută** liniile — și tocmai permutarea aceea repară exemplul.

**Verificare**, în chiar aritmetica cerută de curs (trei zecimale, cu trunchiere):

| varianta                      | `x*`             | eroare relativă `‖x − x*‖/‖x‖` |
| ----------------------------- | ---------------- | ------------------------------ |
| fără pivotare (cum e în curs) | `(2; 0,998)`     | **70,6 %**                     |
| cu pivotare parțială          | `(1,002; 0,998)` | **0,1 %**                      |

Soluția reală e `(1,001; 0,999)`. Prima linie reproduce exact cifrele tipărite în curs (`µ = 1000`,
`a₂₂ = −999`, termen liber `−998`, `x₂ = 0,998`, `x₁ = 2`, eroare ≈ 71 %), deci aritmetica simulată
e cea potrivită; a doua arată că permutarea chiar are loc și că eroarea scade de trei ordine de
mărime.

Cel mai probabil observația a alunecat de la exemplul **următor**, din §5.3
(`[1 10000; 1 0.0001]`), unde ea e adevărată: acolo ambele elemente din prima coloană sunt `1`,
pivotarea parțială nu are ce permuta, și abia pivotul **scalat** repară — exact motivul pentru care
cursul introduce GPPS.

**Ce s-a pus pe site.** Motivul corect al fiecărei metode: pivotarea parțială rezolvă exemplul din
§5.1, iar pivotul scalat există pentru cazul în care pivotarea parțială **nu** are ce alege, fiindcă
elementele coloanei sunt egale ca mărime, dar liniile lor au ordine de mărime diferite. **Concluzia
cursului rămâne neatinsă** — pivotarea parțială nu e suficientă în toate cazurile —, doar exemplul
pe care se sprijină e celălalt.

Testele care țin erata pe loc sunt în `scripts/verificare-algoritmi/eliminare-gaussiana.ts`: se cere
explicit ca pivotarea parțială să **permute** pe sistemul din §5.1 și să **nu** permute pe cel din
§5.3. Dacă cineva „repară" alegerea înapoi la litera observației, verificarea pică.
---

## curs5, §5.1 — „ori converg amândouă, ori niciuna"

**Cursul scrie**, în comparația Jacobi vs. Gauss-Seidel, două afirmații fără nicio ipoteză în jurul
lor:

> - **Teorema Stein-Rosenberg**: metodele Jacobi și Gauss-Seidel ori sunt ambele convergente, ori
>   niciuna nu este convergentă.
> - Atunci când converg, Gauss-Seidel converge mai rapid decât Jacobi: `ρ(GS) < ρ(J) < 1`.

Teorema Stein-Rosenberg **cere ca matricea de iterație Jacobi să aibă toate elementele nenegative**
— adică, pentru o matrice cu diagonala pozitivă, ca elementele din afara diagonalei să fie ≤ 0.
Scrisă fără ipoteza aia, afirmația e falsă, iar contraexemplul stă **în același curs**: problema 4
din §10.

**Verificare**, pe sistemul din problema 4 (`2x + y + z = 4`, `x + 2y + z = 4`, `x + y + 2z = 4`,
cu soluția `(1, 1, 1)`), pornind din `x⁰ = 0`, la toleranța `10⁻⁸`:

| metodă       | `ρ(G)`      | ce face                                                 |
| ------------ | ----------- | ------------------------------------------------------- |
| Jacobi       | **1 exact** | oscilează la nesfârșit între `(0, 0, 0)` și `(2, 2, 2)` |
| Gauss-Seidel | 0,353553    | ajunge la `(1, 1, 1)` în **20** de iterații             |

Matricea are elementele din afara diagonalei **pozitive**, deci `G_J = D⁻¹(L + U)` are elemente
negative și ipoteza teoremei nu e îndeplinită. Valorile proprii ale lui `G_J` sunt `−1`, `½`, `½`:
raza spectrală e exact 1, deci nici nu converge, nici nu diverge — se blochează. A doua afirmație
cade odată cu prima: `ρ(J) = 1`, deci nu e `< 1`.

Oscilația nu e un accident numeric, ci se citește din vectorul propriu: eroarea de pornire
`x⁰ − x* = −(1, 1, 1)` stă **exact** pe direcția proprie a valorii `−1`, deci fiecare iterație o
înmulțește cu `−1` și n-o micșorează niciodată.

**Ce s-a pus pe site.** Afirmația din §5.1 nu apare, în nicio formă. Ce apare e ce se verifică:
Gauss-Seidel folosește valorile deja calculate, iar pe sistemele pe care **amândouă** converg asta
îl face mai rapid (pe problema 3 din §10: `ρ(J) = 0,6072` și 33 de iterații, față de `ρ(GS) = 0,4082`
și 23). Sistemul din problema 4 e chiar unul dintre cele două exemple gata alese ale paginii, tocmai
ca diferența să se poată vedea, nu doar citi.

Verificarea e ținută ca **test care trebuie să pice** dacă cineva „repară" afirmația:
`scripts/verificare-algoritmi/metode-iterative.ts`, secțiunea 7.

---

## curs5, §6 — pseudocodul SOR nu e metoda SOR

**Cursul scrie**, în aceeași secțiune, formula pe componente:

```
x_i^(k+1) = x_i^(k) + ω·R_i^(k)/a_ii
R_i^(k)   = b_i − Σ_{j<i} a_ij·x_j^(k+1) − Σ_{j≥i} a_ij·x_j^(k)
```

și forma matriceală care decurge din ea, `x = (D − ωL)⁻¹[(1−ω)D + ωU]·x + ω(D − ωL)⁻¹b`. Amândouă
relaxează **fiecare componentă pe rând**, iar valoarea relaxată intră imediat în linia următoare.

**Algorithm 3, din aceeași secțiune, face altceva**: baleiază întâi cu formula Gauss-Seidel curată
(linia 5), și abia după ce baleiajul s-a terminat aplică relaxarea, **o singură dată, pe tot
vectorul**:

```
5:     x[j] ← ( b[j] − Σ_{k≠j} A[j,k]·x[k] ) / A[j,j]
7:     x ← ω·x + (1 − ω)·xprev
```

**Verificare.** Pe sistemul din problema 3 (§10), pornind din `x⁰ = (0,3; −0,7; 1,1)`, o singură
iterație:

| ω    | formula din §6 (= forma matriceală) | Algorithm 3                   |
| ---- | ----------------------------------- | ----------------------------- |
| 0,8  | `(−0,2280; 0,0456; −0,40656)`       | `(−0,2280; 0,0720; −0,51200)` |
| 1,0  | `(−0,3600; 0,2650; −0,91500)`       | `(−0,3600; 0,2650; −0,91500)` |
| 1,25 | `(−0,5250; 0,5578; −1,63242)`       | `(−0,5250; 0,5063; −1,41875)` |

Prima componentă coincide întotdeauna — pentru `i = 1` nu există nimic „la stânga" de relaxat —, iar
la `ω = 1` coincid toate, fiindcă atunci amândouă sunt Gauss-Seidel. Pentru orice alt `ω`, de la a
doua componentă încolo cele două se despart: adevăratul SOR trimite mai departe valoarea
**relaxată**, pseudocodul trimite valoarea Gauss-Seidel nerelaxată și abia la final amestecă.

**Ce s-a pus pe site.** Formula din §6, adică cea care se potrivește cu forma matriceală și cu
matricea de iterație `G = (D − ωL)⁻¹[(1−ω)D + ωU]`. Motivul e că altfel pagina s-ar contrazice
singură: raza spectrală afișată se calculează din `G`, iar dacă iterația desenată ar fi cea din
Algorithm 3, numărul afișat n-ar mai descrie ce se vede pe ecran. Pseudocodul nu apare pe pagină în
nicio formă.

Verificarea e ținută ca **test care trebuie să pice**:
`scripts/verificare-algoritmi/metode-iterative.ts`, secțiunea 7.

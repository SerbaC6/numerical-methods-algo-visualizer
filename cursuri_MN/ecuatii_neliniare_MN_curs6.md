# Metode Numerice (CS-UPB) — Ecuații neliniare și sisteme de ecuații neliniare

Conținut consolidat din: slide-urile de curs "Ecuatii neliniare" + suportul de laborator "Soluția ecuației neliniare f(x)=0. Analiza convergenței. Lucrul cu polinoame în MATLAB. Rezolvarea sistemelor de ecuații neliniare". Informația repetată în ambele surse apare o singură dată.

## Obiectivele laboratorului

Studentul va fi capabil să:
- determine aproximativ soluțiile unei ecuații neliniare;
- rezolve iterativ un sistem de ecuații neliniare;
- aplice metoda gradientului descendent și conjugat;
- lucreze în MATLAB cu polinoame.

---

## 1. Metode bazate pe interval

### 1.1 Metoda bisecției

Dacă `f(x) = 0`, se pune problema localizării zerourilor acestei ecuații. Se presupune că f este continuă pe un interval [a, b], cu `f(a)·f(b) < 0`. Considerăm că avem un zero unic p în [a, b], cu f(p) = 0.

Metoda împarte intervalul în două jumătăți și alege subintervalul pentru care funcția își schimbă semnul la capete, adică intervalul care conține zeroul. Concret: se evaluează funcția în mijlocul intervalului, `c = (a+b)/2`; dacă `f(c)·f(b) < 0` rădăcina se află în (c, b) și acolo se continuă căutarea; dacă `f(c)·f(a) < 0` rădăcina se află în (a, c). Se continuă până când intervalul devine foarte mic.

**Criterii de oprire:**
- când intervalul a devenit mai mic decât o toleranță, `b − a < tol`, și deci zeroul este `p = (a+b)/2`;
- când `f(p) = 0` sau `|f(p)| < ε`;
- toleranța relativă: `ε = |(x_new − x_old)/x_new|`; când `ε < tol` algoritmul se termină, iar x_new este considerată valoarea calculată a rădăcinii;
- alte criterii.

**Avantaje / dezavantaje:**
- **Dezavantaj**: convergență slabă — numărul de pași N devine destul de mare până când soluția de la pasul N se apropie de soluția ecuației, adică până când `|p − p_N|` devine mic.
- **Avantaj**: în orice situație converge către soluție (aplicarea repetată duce mereu la o estimare mai precisă a rădăcinii).

**Teoremă.** Dacă f este continuă pe [a, b] și `f(a)·f(b) < 0`, metoda bisecției generează un șir p_n care aproximează un zero p al lui f, cu:
```
|p_n − p| < (b − a)/2^n,    n ≥ 1
```

**Numărul de iterații** necesar pentru o eroare acceptată `tol`:
```
(b − a)/2^n ≤ tol  ⟹  (b − a)/tol ≤ 2^n  ⟹  n ≥ log2( (b − a)/tol )
```
Algoritmul poate fi gândit ca o căutare binară a rădăcinii într-un vector cu `(b−a)/tol` elemente, de unde și complexitatea.

```
Algorithm 1: Metoda Bisecției
1: while |f(c)| > tol do
2:     c ← (a + b)/2
3:     if f(a)·f(c) < 0 then
4:         b ← c
5:     else
6:         a ← c
7:     end if
8: end while
```

### 1.2 Puncte fixe (o variabilă)

Teoria punctelor fixe: 1900, Luitzen Egbertus Jan Brouwer (1881–1966), matematician olandez.

- Un **punct fix** p pentru o funcție g este acel punct pentru care `g(p) = p`.
- Dacă `f(p) = 0` (p este zero pentru f), atunci putem defini o funcție g care are punct fix în p: `g(x) = x − f(x)`, sau mai general `g(x) = x + a·f(x)`.
- Invers, dacă p este punct fix pentru g, atunci funcția `f(x) = x − g(x)` are zero în p.

**Teoreme de existență și unicitate:**
- Dacă g este continuă pe [a, b] și `g(x) ∈ [a, b]` pentru orice x, atunci g are **cel puțin un** punct fix în [a, b].
- Mai mult, dacă există g'(x) pe (a, b) și există k < 1 astfel încât `|g'(x)| < k` pentru orice x, atunci g are un **unic** punct fix în [a, b].

**Teorema de convergență.** Dacă g este continuă pe [a, b], `g(x) ∈ [a, b]` pentru orice x, și dacă există g'(x) pe (a, b) și `0 < k < 1` astfel încât `|g'(x)| < k` pentru orice x, atunci pentru orice p₀ șirul `p_n = g(p_{n−1})` converge către unicul punct fix p din [a, b].

Ca să aproximăm un punct fix, pornim de la o aproximare inițială p₀ și construim șirul `p_n = g(p_{n−1})`, n ≥ 1. Dacă p_n converge și g este continuă pe [a, b], atunci:
```
p = lim_{n→∞} p_n = lim_{n→∞} g(p_{n−1}) = g( lim_{n→∞} p_{n−1} ) = g(p)
```

Condiția de contracție pe [a, b] (legătura cu teorema Banach din laboratorul anterior): funcția trebuie să fie continuă pe [a, b] și pentru orice c ∈ [a, b] să fie satisfăcută inegalitatea `|f'(c)| < 1`.

**Exemplu.** Vrem soluția pozitivă a ecuației `x² − x − 1 = 0`. Transformăm în formă de punct fix:
```
x² − x − 1 = 0  ⟹  x = sqrt(x + 1)
```
Derivata: `(sqrt(x+1))' = 1/(2·sqrt(x+1))`, care este mai mică decât 1 pentru orice x ≥ 0. Deci iterația `x^(k+1) = sqrt(x^(k) + 1)` converge către soluția pozitivă (numărul de aur).

---

## 2. Metode care nu se bazează pe un interval

Este suficientă cunoașterea unei valori inițiale x_i, folosită pentru estimarea valorii următoare x_{i+1}. Aceste metode, spre deosebire de primele, **pot fi convergente sau divergente**. Atunci când converg, convergența este mult mai rapidă decât la metodele bazate pe interval.

### 2.1 Metoda tangentei (Newton-Raphson)

Isaac Newton (1642–1727), fizician și matematician englez; Joseph Raphson (1648–1715), matematician englez.

**Interpretare geometrică**: se pornește cu o valoare de început x_i și se duce o tangentă la curbă în punctul de coordonate `[x_i, f(x_i)]`. Punctul de intersecție al tangentei cu Ox se consideră x_{i+1}.

**Derivarea.** Fie f continuă și derivabilă pe [a, b], fie p₀ o aproximare a lui p astfel încât `f'(p₀) ≠ 0` și `|p − p₀|` să fie mic. Considerăm primul polinom Taylor (Brook Taylor, 1685–1731) extins după p₀ și evaluat în p:
```
f(p) = f(p₀) + (p − p₀)·f'(p₀) + ((p − p₀)²/2)·f''(ξ(p))
```
cu ξ(p) între p și p₀. Cum f(p) = 0:
```
0 = f(p₀) + (p − p₀)·f'(p₀) + ((p − p₀)²/2)·f''(ξ(p))
```
Iar pentru că `(p − p₀)²` este aproximativ 0:
```
0 ≈ f(p₀) + (p − p₀)·f'(p₀)
```
de unde rescriem:
```
p ≈ p₀ − f(p₀)/f'(p₀) ≡ p₁
```
ceea ce ne oferă **pasul recurenței**:
```
p_n = p_{n−1} − f(p_{n−1})/f'(p_{n−1}),    n ≥ 1
```
(echivalent, în notația de laborator: `x_{i+1} = x_i − f(x_i)/f'(x_i)`)

**Condiții de eșec:**
- nu converge dacă la un anumit pas `f'(p_n) = 0` (pericol de a ajunge într-un punct extrem sau în apropierea unuia);
- nu converge dacă p₀ nu este ales aproape de p, astfel încât termenul `(p − p₀)²` să poată fi neglijat.

**Teoremă de convergență.** Fie `f ∈ C²[a, b]`. Dacă p ∈ (a, b) cu f(p) = 0 și `f'(p) ≠ 0`, atunci există `δ > 0` astfel încât metoda generează un șir p_n (n ≥ 1) care converge la p pentru orice aproximație inițială `p₀ ∈ [p − δ, p + δ]`.

**Demonstrația convergenței pătratice.** Definim eroarea `e_k = x_k − x*`, deci `x_k = e_k + x*`. Aplicând Teorema lui Taylor pentru `x = x_k` și `h = −e_k`:
```
0 = f(x*) = f(x_k) + (x* − x_k)·f'(x_k) + (1/2)·f''(ξ_k)·(x* − x_k)²
```
Presupunem `f'(x*) ≠ 0` și împărțim la f'(x_k):
```
f(x_k)/f'(x_k) + (x* − x_k) = −(1/2)·(f''(ξ_k)/f'(x_k))·(x* − x_k)²
```
Din definiția metodei lui Newton ajungem la:
```
e_{k+1} = −(1/2)·(f''(ξ_k)/f'(x_k))·e_k²
```
Rata de convergență este cel puțin pătratică dacă atât f' cât și f'' sunt continue, iar eroarea după primul pas este mai mică decât 1. Practic, la fiecare iterație **numărul de zecimale corect calculate se dublează**.

```
Algorithm 2: Metoda Newton
1: i ← 1
2: while i ≤ max_iter do
3:     xprev ← x
4:     x ← x − f(x)/f'(x)
5:     if |x − xprev| < tol then
6:         break
7:     end if
8:     i ← i + 1
9: end while
```

### 2.2 Metoda secantei

De multe ori nu putem calcula derivata funcției, deci tangenta se aproximează prin **secanta** care trece prin două puncte apropiate:
```
f'(p_{n−1}) = lim_{x→p_{n−1}} ( f(x) − f(p_{n−1}) ) / ( x − p_{n−1} )
```
și dacă p_{n−2} este apropiat de p_{n−1}:
```
f'(p_{n−1}) ≈ ( f(p_{n−2}) − f(p_{n−1}) ) / ( p_{n−2} − p_{n−1} )
            = ( f(p_{n−1}) − f(p_{n−2}) ) / ( p_{n−1} − p_{n−2} )
```
Înlocuind în recurența Newton-Raphson obținem:
```
p_n = p_{n−1} − f(p_{n−1})·(p_{n−1} − p_{n−2}) / ( f(p_{n−1}) − f(p_{n−2}) )
```

```
Algorithm 3: Metoda Secantei
1: i ← 1
2: while i ≤ max_iter do
3:     x ← x1 − f(x1)·(x1 − x0)/( f(x1) − f(x0) )
4:     if |x − x1| < tol then
5:         break
6:     end if
7:     x0 ← x1
8:     x1 ← x
9:     i ← i + 1
10: end while
```

### 2.3 Comparație experimentală (viteza de convergență)

Număr de iterații pentru a aproxima rădăcina, cu toleranță `10⁻¹⁵`. Ca valori inițiale, pentru o rădăcină c, s-au ales fie `[[c], [c]+1]` pentru metodele cu două valori inițiale, fie `[c]+1` pentru cele cu o singură valoare inițială ([c] = partea întreagă).

| Funcție | Bisecție | Secantă | Tangentă |
|---|---|---|---|
| 0.25·e^x − 2 | 48 | 7 | 7 |
| 3·cos(x) − 4x | 50 | 7 | 5 |
| x² − 2 | 49 | 7 | 6 |
| ln(x) − 2 | 46 | 6 | 4 |
| x² + sqrt(x) − 6 | 48 | 7 | 5 |

Se observă creșterea în eficiență de la metoda bisecției la următoarele două, care au de departe cel mai mic număr de iterații. Între tangentă și secantă, prima se dovedește mai rapidă, datorită formulelor exacte ale derivatelor.

---

## 3. Ordinul de convergență

Fie x_n un șir care converge către s; `ε_n = |s − x_n|` și `ε_{n+1} = |s − x_{n+1}|` erorile la pașii n și n+1. Dacă există A și R > 0 astfel încât:
```
lim_{n→∞} |s − x_{n+1}| / |s − x_n|^R  =  lim_{n→∞} |ε_{n+1}| / |ε_n|^R  =  A
```
atunci x_n converge către s cu **ordinul de convergență R**. A se numește **constanta erorii asimptotice**.

### 3.1 Deducerea din seria Taylor

Dacă `x_{i+1} = g(x_i)` este o metodă iterativă care soluționează ecuația `x = g(x)`, iar s este soluția exactă și x_n soluția aproximativă la pasul n, atunci dacă `s + ε_n = x_n` (ε_n fiind eroarea la pasul n) și considerăm g derivabilă de multe ori:
```
x_{n+1} = g(x_n) = g(s + ε_n) = g(s) + ε_n·g'(s) + (1/2)·ε_n²·g''(s) + ...
```
Cum `ε_{n+1} = x_{n+1} − s` și `g(s) = s`, avem:
```
ε_{n+1} = ε_n·g'(s) + (1/2)·ε_n²·g''(s) + ...
```
**Exponentul lui ε_n din primul termen diferit de zero este ordinul de convergență** al metodei iterative `x_n = g(x_{n−1})`.

### 3.2 Ordinul de convergență pentru Newton-Raphson

Pentru Newton-Raphson, `g(x) = x − f(x)/f'(x)`, deci:
```
g'(x) = f(x)·f''(x) / (f'(x))²
g''(x) = 2·f''(x)/f'(x)
```
Deci `g'(s) = 0` deoarece f(s) = 0; atunci din dezvoltarea în serie Taylor rămâne:
```
ε_{n+1} = (1/2)·ε_n²·g''(s) + ...
```
De unde rezultă că **metoda Newton-Raphson are ordinul de convergență 2**.

### 3.3 Indexul de eficiență

Fie p ordinul de convergență și d numărul de evaluări de funcții la fiecare pas. Definim **indexul de eficiență** al unei metode iterative ca:
```
ρ = p^(1/d)
```
O metodă de ordin `p = 2^n` se consideră **optimă** din punct de vedere al indexului de eficiență dacă are maximum n+1 evaluări de funcții.
(Ref.: H.T. Kung, J.F. Traub, *Optimal order of one-point and multipoint iterations*, J. Assoc. Comput. Mach., 21 (1974), pp. 643–651.)

---

## 4. Metoda Gradientului Descendent și a Gradientului Conjugat

Pentru sisteme de forma `Ax = b`, dacă matricea A este pozitiv semidefinită și simetrică, putem utiliza atât metoda pașilor descrescători, cât și metoda gradientului conjugat pentru a ajunge la soluția x.

Ambele metode se formulează ca probleme de optimizare în care ne dorim minimul funcției:
```
f(x) = (1/2)·xᵀAx − bᵀx
```
Gradientul este `∇f(x) = Ax − b`, deci soluția sistemului `Ax = b` este echivalentă cu minimizarea funcției f(x).

### 4.1 Gradientul Descendent (pași descrescători)

Gradientul ne oferă direcția de creștere maximă a funcției. Pentru un vector v cu ||v|| = 1, direcția de creștere maximă este dată de θ = 0:
```
⟨∇f(x), v⟩ = ||∇f(x)||·||v||·cos(θ) = ||∇f(x)||·cos(θ)
```
Deci pentru direcția de scădere maximă trebuie să ne deplasăm în direcția opusă gradientului. Notăm cu `r^(k) = b − A·x^(k)` **reziduul**, care este chiar direcția de scădere maximă, fiind egal cu `−∇f(x^(k))`. La fiecare pas:
```
x^(k+1) = x^(k) + α·r^(k)
```

**Alegerea pasului optim α (line search)** — minimizăm `g(α) = f(x^(k) + α·r^(k))`:
```
g(α)  = (1/2)(x^(k) + αr^(k))ᵀA(x^(k) + αr^(k)) − bᵀ(x^(k) + αr^(k))
g'(α) = r^(k)ᵀA(x^(k) + αr^(k)) − bᵀr^(k)
      = r^(k)ᵀA·x^(k) + α·r^(k)ᵀA·r^(k) − bᵀr^(k)
      = r^(k)ᵀ(A·x^(k) − b) + α·r^(k)ᵀA·r^(k)
      = −r^(k)ᵀr^(k) + α·r^(k)ᵀA·r^(k)

g'(α) = 0  ≡  α = (r^(k)ᵀ r^(k)) / (r^(k)ᵀ A r^(k))
```

Pentru a nu calcula de fiecare dată `r^(k) = b − A·x^(k)`, se poate înmulți ecuația `x^(k) = x^(k−1) + α·r^(k−1)` la stânga cu −A, de unde:
```
r^(k+1) = r^(k) − α·A·r^(k)
```

```
Algorithm 4: Metoda Gradientului Descendent
1: r ← b
2: x ← 0
3: i ← 1
4: while i ≤ max_iter do
5:     if ||r|| < tol then break end if
6:     ar ← A·r
7:     α ← (rᵀr)/(rᵀ·ar)
8:     x ← x + α·r
9:     r ← r − α·ar
10:    i ← i + 1
11: end while
```

Figura 1 din laborator arată traiectoria în zig-zag pe curbele de nivel — fiecare direcție de căutare este ortogonală cu cea anterioară, de unde convergența lentă.

### 4.2 Metoda Gradientului Conjugat

O metodă mult mai eficientă, având proprietatea de a converge garantat după cel mult n iterații. Ideea este de a construi un set de direcții de căutare **conjugate** între ele în raport cu matricea A. Spre deosebire de gradientul descendent (unde fiecare direcție este ortogonală cu cea anterioară), aici direcțiile sunt **A-conjugate**:
```
p^(i)ᵀ·A·p^(j) = 0,    pentru i ≠ j
```
Această proprietate asigură că soluția exactă este atinsă în cel mult n pași pentru un sistem de dimensiune n, în cazul în care nu există erori numerice.

Algoritmul începe similar cu gradientul descendent, însă în loc să ne deplasăm în direcția dată de gradient, construim un nou vector p^(k) conjugat cu toate cele anterioare (Gram-Schmidt):
```
p^(k) = r^(k) + Σ_{i=0}^{k−1} β^(i)·p^(i)
```
Procesul Gram-Schmidt complet nu este eficient, dar se dovedește că este suficient să calculăm doar pe β^(k) pentru a obține direcții conjugate.

**Subspații Krylov.** Subspațiul de dimensiune k este:
```
K_k = span{ r^(0), A·r^(0), A²·r^(0), ..., A^(k−1)·r^(0) }
```
Dacă A este inversabilă, atunci folosind teorema Cayley-Hamilton toți vectorii din K_k sunt liniar independenți. Se observă că r^(0) și p^(k) progresează în același subspațiu Krylov. La pasul k, vectorul r avansează în K_k; scăzând din el proiecția pe vectorii p calculați anterior din K_{k−1}, rămânem doar cu componenta corespunzătoare lui β_k. (Analogie: algoritmul Gram-Schmidt modificat — la fiecare iterație scădem din toți vectorii proiecțiile lor pe vectorul curent.)

Coeficientul β:
```
β^(k) = − ( r^(k)ᵀ·A·p^(k−1) ) / ( p^(k−1)ᵀ·A·p^(k−1) )
```
iar după prelucrare se ajunge la forma simplă:
```
β^(k) = ( r^(k)ᵀ·r^(k) ) / ( r^(k−1)ᵀ·r^(k−1) )
```

```
Algorithm 5: Metoda Gradientului Conjugat
1: r ← b
2: p ← r
3: x ← 0
4: i ← 1
5: while i ≤ max_iter do
6:     ap  ← A·p
7:     pap ← pᵀ·ap
8:     rr  ← rᵀ·r
9:     α ← rr/pap
10:    x ← x + α·p
11:    r ← r − α·ap
12:    if ||r|| < tol then break end if
13:    β ← (rᵀr)/rr
14:    p ← r + β·p
15:    i ← i + 1
16: end while
```

Figura 2 din laborator compară traiectoriile celor două metode pe aceleași curbe de nivel: gradientul descendent face mai mulți pași în zig-zag, gradientul conjugat ajunge la soluție în doi pași (pentru n = 2).

---

## 5. Sisteme de ecuații neliniare

Un sistem neliniar de ecuații se prezintă astfel:
```
f1(x1, x2, ..., xn) = 0
f2(x1, x2, ..., xn) = 0
...
fn(x1, x2, ..., xn) = 0
```
sau `F(x) = 0`, unde:
```
F(x1, ..., xn) = ( f1(x1,...,xn), f2(x1,...,xn), ..., fn(x1,...,xn) )ᵀ
```

f_i sunt funcții cunoscute de n variabile, presupuse continue împreună cu derivatele lor parțiale până la un ordin convenabil (de obicei până la ordinul doi). Se urmărește găsirea soluțiilor reale ale sistemului într-un anumit domeniu de interes, în care se consideră valabile proprietățile de continuitate impuse funcțiilor f_i și derivatelor lor.

Rezolvarea sistemului este un proces iterativ în care se pornește de la o aproximație inițială pe care algoritmul o va îmbunătăți până ce se va îndeplini o condiție de convergență. **În acest caz localizarea apriori a soluției nu mai este posibilă** (nu există o metodă analoagă metodei înjumătățirii intervalelor).

### 5.1 Puncte fixe pentru funcții de mai multe variabile

Putem transforma sistemul de ecuații neliniare într-un sistem de tip punct fix:
```
x1 = g1(x1, x2, ..., xn)
x2 = g2(x1, x2, ..., xn)
...
xn = gn(x1, x2, ..., xn)
```
Pentru ca funcțiile g_i să fie contracții avem nevoie ca **gradienții lor să aibă normă mai mică decât 1** pe domeniul ales.

O funcție `G: Rⁿ → Rⁿ` are un punct fix p dacă `G(p) = p`.

**Teoremă (continuitate).** Fie `f: D ⊂ Rⁿ → R` și x₀ ∈ D. Dacă toate derivatele parțiale ale lui f există și mai există constantele `δ > 0` și `K > 0` astfel încât, pentru orice x cu `|x − x₀| < δ`, x ∈ D, avem `|∂f(x)/∂x_j| ≤ K` pentru j = 1, ..., n — atunci f este continuă în x₀.

**Teoremă (existența punctului fix).** Fie `D = {(x1, ..., xn)ᵀ | a_i ≤ x_i ≤ b_i, i = 1, ..., n}` pentru o colecție de constante a1,...,an și b1,...,bn. Dacă `G: D ⊂ Rⁿ → Rⁿ` este o funcție continuă cu proprietatea că `G(x) ∈ D` pentru orice x ∈ D, atunci G are un punct fix în D.

**Teoremă (convergență și eroare).** Mai mult, dacă toate funcțiile componente ale lui G au derivate parțiale continue și există o constantă K < 1 cu:
```
| ∂g_i(x)/∂x_j | ≤ K/n
```
atunci șirul x_k definit prin `x_k = G(x_{k−1})`, pornind de la un x₀ inițial din D, este convergent către un unic punct fix p din D, iar:
```
||x^(k) − p||∞ ≤ ( K^k / (1 − K) )·|| x^(1) − x^(0) ||∞
```

### 5.2 Metoda Newton pentru sisteme

Pentru simplificarea notației, considerăm `F = (f1, f2, ..., fn)ᵀ` și `x = (x1, ..., xn)`. Sistemul se rescrie ca `F(x) = 0`. Notăm cu x^(k) estimarea la pasul k a soluției x*, deci F(x*) = 0.

Se rescrie sistemul sub forma de punct fix:
```
G(x) = x − J(x)⁻¹·F(x)
```
unde J(x) este **matricea Jacobiană** (a apărut prima oară în 1815, fiind folosită de Augustin-Louis Cauchy (1789–1857), matematician francez, dar în 1841 Jacobi a scris despre ea și despre proprietățile sale):
```
        [ ∂f1/∂x1(x)  ∂f1/∂x2(x)  ...  ∂f1/∂xn(x) ]
J(x) =  [ ∂f2/∂x1(x)  ∂f2/∂x2(x)  ...  ∂f2/∂xn(x) ]
        [     ...          ...     ...      ...    ]
        [ ∂fn/∂x1(x)  ∂fn/∂x2(x)  ...  ∂fn/∂xn(x) ]
```

De unde **recurența metodei**:
```
x^(k) = G(x^(k−1)) = x^(k−1) − J(x^(k−1))⁻¹·F(x^(k−1)),    k = 0, 1, 2, ...
```

**Observație practică (importantă).** De obicei se **evită calculul inversei lui J**: se găsește un vector y astfel încât
```
J·y = −F
```
și apoi soluția este dată de suma dintre y și x de la pasul anterior. Cu alte cuvinte, la fiecare pas avem de soluționat un SEL în y, unde matricea coeficienților este J, iar vectorul termenilor liberi este −F.

**Condiții.** Dacă matricea J este neinversabilă, atunci pasul este nedefinit. Presupunem că J(x*) este inversabilă, iar continuitatea lui J asigură că J(x^(k)) este inversabilă pentru orice x^(k) suficient de apropiat de x*. Condiția de oprire la iterația k, `||x* − x^(k)|| < tol`, se poate arăta că revine la `||x^(k) − x^(k−1)|| < tol`.

---

## 6. Polinoame

### 6.1 Rădăcinile polinoamelor

Fie p un polinom de grad n, `p(x) = a_n·xⁿ + a_{n−1}·x^{n−1} + ... + a1·x + a0`, cu `a_n ≠ 0`. Conform teoremei fundamentale a algebrei, p are n rădăcini reale sau complexe (numărând și multiplicitățile). Dacă toți coeficienții a_i sunt reali, rădăcinile complexe apar conjugate (de forma c + id și c − id).

**Regula semnelor a lui Descartes.** Fie v numărul variațiilor de semn ale coeficienților `a_n, a_{n−1}, ..., a1, a0`, ignorând coeficienții nuli, și n_p numărul de rădăcini pozitive. Atunci:
1. `n_p ≤ v`;
2. `v − n_p` este un număr par.

Analog, numărul de rădăcini reale negative ale lui p(x) se obține folosind numărul de schimbări de semn ale coeficienților polinomului `p(−x)`. Pentru determinarea efectivă a rădăcinilor se pot aplica metodele descrise anterior, dacă nu se cunoaște localizarea rădăcinilor pe intervale.

### 6.2 Lucrul cu polinoame în MATLAB

Un polinom este reprezentat prin coeficienții săi, **în ordine descrescătoare**. Vectorul `p = [-2, -1, 0, 1, 2]` reprezintă polinomul `−2x⁴ − x³ + x + 2`.

Funcții:
- `polyval(p, x)` — calculează p(x);
- `conv(p, q)` — calculează convoluția celor două polinoame (le înmulțește);
- `polyder(p)` — calculează derivata polinomului;
- `polyint(p)` — calculează integrala polinomului.

---

## 7. Probleme (laborator)

1. Să se determine tipul rădăcinilor (reale pozitive/negative, complexe) ale polinomului `p(x) = 3x⁶ + x⁴ − 2x³ − 5`.
2. Să se rezolve următorul sistem prin puncte fixe:
```
x/2 + (1/4)·ln(1 + y) = 2
y/4 + (1/10)·arctan(x) = 2
```
3. Să se scrie în MATLAB un program care rezolvă un sistem de ecuații neliniare prin metoda Newton. Ca intrare se consideră: un vector coloană care reprezintă x^(0), un pointer (handler) la o funcție care evaluează F într-un vector generic x, un pointer la o funcție care calculează Jacobiana într-un vector generic x, și o toleranță dată ε. Metoda se oprește atunci când `||x^(k) − x^(k−1)|| < ε` și returnează vectorul soluție x* și numărul de iterații n necesare.

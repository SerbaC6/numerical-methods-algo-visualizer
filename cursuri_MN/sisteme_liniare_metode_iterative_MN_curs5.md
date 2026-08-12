# Metode Numerice (CS-UPB) — Sisteme de ecuații liniare. Metode iterative

Conținut consolidat din: slide-urile de curs "Metode Iterative/Aproximative pt. SEL" (MN Primăvara 2015) + suportul de laborator "Metode iterative pentru rezolvarea sistemelor de ecuații liniare: Jacobi, Gauss-Seidel, Suprarelaxare" (2025). Informația repetată în ambele surse apare o singură dată.

## Obiectivul laboratorului

Studentul va fi capabil să rezolve sisteme de ecuații liniare utilizând metode iterative.

---

## 1. Motivație și idee generală

Metodele exacte de rezolvare a SEL au complexitate O(n³) și aplicabilitate limitată la sisteme de ordin relativ mic. Pentru sisteme de dimensiuni mai mari se utilizează **metode iterative**, cu complexitate O(n²). Acestea folosesc relații de recurență care, prin aplicare repetată, furnizează aproximații cu precizie controlată ale soluției.

- Un sistem liniar mare `Ax = b` este indicat să fie rezolvat prin metode iterative atunci când matricea coeficienților A este **dominant diagonală**.
- Metodele iterative pornesc de la o soluție inițială aleasă x⁰ și generează o altă soluție x¹, mai bună, bazându-se pe reducerea diferenței dintre soluția x_k de la pasul k și soluția x_{k−1} de la pasul anterior.
- Procedura se repetă până converge către soluția reală. Metoda este convergentă dacă la fiecare pas se apropie mai mult de soluția reală a sistemului.
- Aceste metode **nu converg pentru toate SEL**. O condiție suficientă (dar nu necesară) pentru convergență este diagonal-dominanța matricei coeficienților, pentru orice vector soluție ales inițial.

Metode prezentate: **Jacobi**, **Gauss-Seidel**, **Successive Over-Relaxation (SOR)**, **Gradientul Conjugat**.

### 1.1 Condiția de oprire

Procedura se repetă până se atinge un anumit criteriu de convergență. Dacă metoda produce, la un moment dat, o modificare nesemnificativă a vectorului soluție, metoda trebuie oprită. De asemenea, metoda se oprește dacă o mărime a modificării (relative sau absolute) a vectorului soluție este mai mică decât un criteriu de convergență specificat.

În laborator se folosesc două condiții combinate:
- **toleranța** (ε / tol) — nu se continuă execuția dacă "diferența" soluțiilor a două iterații consecutive nu este semnificativă;
- **numărul maxim de iterații** (Niter / max_iter) — garantează că algoritmul se încheie, indiferent dacă alegerea inițială pentru x⁰ a fost bună sau nu.

---

## 2. Metode iterative pentru funcții (introducere prin puncte fixe)

Ideea de metodă iterativă pornește de la cazul mai simplu al funcțiilor.

**Exemplu: numărul de aur.** Începem cu orice număr real pozitiv x și calculăm:
```
x^(k+1) = sqrt(1 + x^(k))
```
La un moment dat `|x^(k+1) − x^(k)| < ε`, deci `x^(k+1) ≈ x^(k)`:
```
x = sqrt(1 + x)
x² = 1 + x
x² − x − 1 = 0
x = (1 ± sqrt(5))/2
φ = (1 + sqrt(5))/2 ≈ 1.618033988749895
```
Soluția este dată de intersecția a două funcții: `f(x) = x` și `g(x) = sqrt(1 + x)` (Figura 1 din laborator — punctul de intersecție al celor două grafice este soluția).

### 2.1 Puncte fixe

**Definiție.** Fie f : M → M o funcție continuă și un spațiu metric (M, d). f este o **contracție** dacă există un număr real k ∈ [0, 1) astfel încât:
```
d(f(x), f(y)) ≤ k·d(x, y),   ∀x, y ∈ M
```
Cel mai mic k pentru care relația este adevărată se numește **constantă Lipschitz**. Pentru că k < 1, putem spune despre f că este continuă.

**Teorema lui Banach.** Dacă f : M → M este o contracție pe un spațiu metric complet (M, d), atunci există un unic punct fix x* ∈ M pentru care f(x*) = x*.

Pe R, cu `d(x, y) = |x − y|`:
```
|f(x) − f(y)| ≤ k|x − y|
|f(x) − f(y)| / |x − y| ≤ k
|(f(x) − f(y))/(x − y)| ≤ k
```
Din teorema lui Lagrange știm că există c ∈ (a, b) astfel încât `|f'(c)| ≤ k`.

**Concluzie:** iterația `x^(k+1) = f(x^(k))` converge către un punct fix x* dacă `|f'(c)| < 1` pentru orice c ∈ (a, b).

**Exemplu.** Fie `f(x) = sqrt(1 + x)`:
```
f'(x) = (1/2)(1 + x)^(−1/2) = 1/(2·sqrt(1 + x))
```
Pentru orice x ∈ R, x ≥ 0, avem |f'(x)| < 1, deci funcția este o contracție pe R+ și are un punct fix unic.

---

## 3. Forma generală a metodelor iterative

Putem rescrie `Ax = b` ca `x = (I − A)x + b`, adică `x = Tx + b`:
```
x_{k+1} = (I − A)x_k + b
```

Mai general, descompunem `A = M − N`:
```
(M − N)x = b
Mx = Nx + b
x = M⁻¹Nx + M⁻¹b
```
deci `M·x_{k+1} = N·x_k + b`, iar sistemul `Mz = r` este mai ușor de rezolvat decât `Ax = b`.

Notăm `G = M⁻¹N` (**matricea de iterație**) și `c = M⁻¹b` (**vectorul de iterație**), deci `T(x) = Gx + c`, iar formula generală este:
```
x^(k) = G·x^(k−1) + c
```

### 3.1 Convergența

Folosind teorema de punct fix: transformarea liniară T : Rⁿ → Rⁿ este o contracție dacă "derivata" transformării este mai mică decât 1. T fiind vectorială, derivata se calculează prin matricea Jacobiană — care este chiar matricea G. Deci pentru convergență avem nevoie ca **raza spectrală a lui G să fie subunitară**.

Se vede și din analiza erorii:
```
x − x^(k) = (Gx + c) − (Gx^(k−1) + c) = G(x − x^(k−1))
e^(k) = G^k · e^(0)
```
Pentru convergență: `lim_{k→∞} e^(k) = 0 ≡ lim_{k→∞} G^k = 0`.

Formularea din curs: convergența este dată de valorile proprii ale lui
```
M⁻¹N = I − M⁻¹A
```
adică metoda converge dacă valorile proprii ale matricei de iterație M⁻¹N sunt mai mici ca 1; cu cât sunt mai mici, cu atât converge mai repede.

### 3.2 Partiționarea matricei A

Pentru alegerea lui M și N, partiționăm A punând în evidență o matrice diagonală D, o matrice strict inferior triunghiulară L și una strict superior triunghiulară U:
```
A = D − L − U
```
Exemplu 3×3:
```
A = [a11 a12 a13;      D = [a11          ;
     a21 a22 a23;            a22         ;
     a31 a32 a33]                    a33 ]

L = [            ;      U = [    −a12 −a13;
     −a21        ;                    −a23;
     −a31 −a32   ]                        ]
```
Diferența dintre metodele următoare constă în modul în care se asociază aceste matrice.

**Tabel de sinteză:**

| Metodă | M | N | G | c |
|---|---|---|---|---|
| Jacobi | D | L + U | `D⁻¹(L + U)` | `D⁻¹b` |
| Gauss-Seidel | D − L | U | `(D − L)⁻¹U` | `(D − L)⁻¹b` |
| SOR | D − ωL | (1−ω)D + ωU | `(D − ωL)⁻¹[(1−ω)D + ωU]` | `ω(D − ωL)⁻¹b` |

Pentru SOR, descompunerea este `A = ω(D − L − U) = (D − ωL) − [(1−ω)D + ωU]`.

---

## 4. Metoda Jacobi

Carl Gustav Jacob Jacobi (1804–1851), matematician german.

Rescriem sistemul `Ax = b` în forma:
```
Σ_{j=1}^{n} a_ij·x_j = b_i,     i = 1, 2, ..., n
```
Metoda consideră la fiecare pas elementul necunoscut x_i asociat elementului diagonal de la respectivul pas, deci:
```
x_i = (1/a_ii)·( b_i − Σ_{j=1}^{i−1} a_ij·x_j − Σ_{j=i+1}^{n} a_ij·x_j ),     i = 1, ..., n
```

Considerând x⁰ soluția inițială, îl calculăm pe x¹_i în funcție de x⁰:
```
x_i^(1) = (1/a_ii)·( b_i − Σ_{j=1}^{i−1} a_ij·x_j^(0) − Σ_{j=i+1}^{n} a_ij·x_j^(0) )
```
și, general, pentru un pas oarecare k:
```
x_i^(k+1) = (1/a_ii)·( b_i − Σ_{j=1}^{i−1} a_ij·x_j^(k) − Σ_{j=i+1}^{n} a_ij·x_j^(k) )
```
echivalent, mai compact:
```
x_i^(p+1) = ( b_i − Σ_{j≠i} a_ij·x_j^(p) ) / a_ii
```

Adunând și scăzând `a_ii·x_i^(k)` obținem forma incrementală:
```
x_i^(k+1) = x_i^(k) + (1/a_ii)·( b_i − Σ_{j=1}^{n} a_ij·x_j^(k) )
```
sau, cu **restul** ecuației i:
```
x_i^(k+1) = x_i^(k) + R_i^(k)/a_ii
R_i^(k) = b_i − Σ_{j=1}^{n} a_ij·x_j^(k)
```

Forma matriceală (pas de iterație):
```
x^(k+1) = D⁻¹[ (L + U)·x^(k) + b ]
```
Pentru că M = D este diagonală, inversa sa este foarte ușor de calculat.

```
Algorithm 1: Metoda Jacobi
1: D ← diag(diag(A))          // matricea diagonală
2: L ← −tril(A, −1)           // matricea inferior triunghiulară
3: U ← −triu(A, 1)            // matricea superior triunghiulară
4: G ← D⁻¹(L + U)             // matricea de iterație
5: c ← D⁻¹b                   // vectorul de iterație
6: x ← zeros(length(b), 1)
7: i ← 1
8: while i ≤ max_iter do
9:     xprev ← x
10:    x ← G·x + c
11:    if ||x − xprev|| < tol then
12:        break
13:    end if
14:    i ← i + 1
15: end while
```

---

## 5. Metoda Gauss-Seidel

Johann Carl Friedrich Gauss (1777–1855), matematician și fizician german; Philipp Ludwig von Seidel (1821–1896), matematician german.

Dacă la Jacobi toate valorile vectorului x^(k+1) se calculau în funcție de x^(k), aici valorile lui x^(k+1) se calculează în funcție de cele care au fost **calculate deja în pasul respectiv** și de cele rămase din pasul precedent:
```
x_i^(k+1) = (1/a_ii)·( b_i − Σ_{j=1}^{i−1} a_ij·x_j^(k+1) − Σ_{j=i+1}^{n} a_ij·x_j^(k) )
```

Cu resturi, rescriem:
```
x_i^(k+1) = x_i^(k) + R_i^(k)/a_ii
R_i^(k) = b_i − Σ_{j=1}^{i−1} a_ij·x_j^(k+1) − Σ_{j=i}^{n} a_ij·x_j^(k)
```

Forma matriceală:
```
x^(k+1) = (D − L)⁻¹·( U·x^(k) + b )
```
Aici M = D − L este inferior triunghiulară, iar inversa nu mai este așa ușor de calculat.

```
Algorithm 2: Metoda Gauss-Seidel
1: x ← zeros(length(b), 1)
2: for i = 1 to max_iter do
3:     xprev ← x
4:     for j = 1 to length(x) do
5:         x[j] ← ( b[j] − Σ_{k≠j} A[j,k]·x[k] ) / A[j,j]
6:     end for
7:     if ||x − xprev|| < tol then
8:         break
9:     end if
10: end for
```
(Actualizarea "in-place" a lui x în bucla interioară este exact ce face ca metoda să fie Gauss-Seidel și nu Jacobi.)

### 5.1 Comparație Jacobi vs. Gauss-Seidel

- Condiție suficientă dar **nu necesară** pentru convergența ambelor: A diagonal dominantă.
- **Teorema Stein-Rosenberg**: metodele Jacobi și Gauss-Seidel ori sunt ambele convergente, ori niciuna nu este convergentă.
- Atunci când converg, Gauss-Seidel converge mai rapid decât Jacobi: `ρ(GS) < ρ(J) < 1`.

---

## 6. Successive Over-Relaxation (SOR)

SOR – 1950: David M. Young Jr. (1923–2008), matematician și calculatorist american, și H. Frankel; dar și mai înainte Lewis Fry Richardson (1881–1953) — matematician, fizician, meteorolog și psiholog englez — și Richard Vynne Southwell (1888–1970), matematician englez (mecanică aplicată).

Se înmulțește restul R_i^(k) cu un factor ω (de aici numele de **metode de relaxare**):
```
x_i^(k+1) = x_i^(k) + ω·R_i^(k)/a_ii
R_i^(k) = b_i − Σ_{j=1}^{i−1} a_ij·x_j^(k+1) − Σ_{j=i}^{n} a_ij·x_j^(k)
```

Formularea echivalentă din laborator — dacă notăm cu GS formula pentru `x_i^(p+1)` de la Gauss-Seidel:
```
x_i^(p+1) = (1 − ω)·x_i^(p) + ω·GS
```

Derivarea descompunerii:
```
A = M − N
A = M − ωM − N + ωM
A = (1 − ω)M − (N − ωM)
A = M(ω) − N(ω)
```
de unde `A = ω(D − L − U) = (D − ωL) − [(1−ω)D + ωU]`, deci:
```
x^(k) = (D − ωL)⁻¹·[ (1−ω)D + ωU ]·x^(k−1) + ω(D − ωL)⁻¹·b
```

### 6.1 Alegerea lui ω

- **ω = 1** ⟹ SOR = Gauss-Seidel.
- **1 < ω < 2** — sistemul este *over-relaxed*; de obicei se folosește la SEL.
- **ω < 1** — sistemul este *under-relaxed*; se folosește la SEL atunci când Gauss-Seidel se depărtează de soluție, dar de obicei se folosește la Sisteme de Ecuații Neliniare.
- **ω ≥ 2** — metoda este divergentă.
- Dacă A este simetrică și pozitiv definită, atunci pentru **ω ∈ (0, 2)** metoda SOR converge.

Factorul ω nu perturbă soluția, deoarece la finalul procesului de iterație restul R_i^(k) este aproape 0, deci înmulțit cu ceva rămâne tot aproximativ 0.

**Problema metodei** rămâne selecția lui ω optim, astfel încât metoda să conveargă mai repede. Nu există metode de selectare pentru ω optim, deci nu are rost să folosim o astfel de metodă punctual, ci doar dacă avem de calculat mai multe soluții pentru mai mulți vectori b (având aceeași matrice a coeficienților). După câteva alegeri ale lui ω, testând convergența, alegem ω optim și îl folosim pentru restul de SEL (restul de vectori b).

```
Algorithm 3: Metoda SOR
1: x ← zeros(length(b), 1)
2: for i = 1 to max_iter do
3:     xprev ← x
4:     for j = 1 to length(x) do
5:         x[j] ← ( b[j] − Σ_{k≠j} A[j,k]·x[k] ) / A[j,j]
6:     end for
7:     x ← ω·x + (1 − ω)·xprev        // aplicăm relaxarea
8:     if ||x − xprev|| < tol then
9:         break
10:    end if
11: end for
```

---

## 7. Acuratețea și convergența metodelor iterative

Metodele iterative sunt **mai puțin vulnerabile la erorile de rotunjire** deoarece: 1. sistemul este dominant diagonal; 2. de obicei sistemul este sparse; 3. fiecare iterație nu este afectată de erorile de rotunjire de la precedenta iterație.

Terminologie:
- **acuratețea** se referă la numărul de zecimale obținut/dorit în calcule;
- **convergența** se referă la pasul de iterație când acuratețea a fost atinsă.

Acuratețea este măsurată raportat la eroarea metodei, specificată în două feluri:
```
EroareaAbsolută = ValoareaAproximativă − ValoareaExactă
EroareaRelativă = EroareaAbsolută / ValoareaExactă
```

Pentru că nu se cunoaște valoarea exactă a soluției, eroarea este măsurată la fiecare pas ca diferența dintre ce s-a obținut la respectivul pas față de precedentul. Criterii de convergență practicate:

**Eroare absolută:**
```
|(Δx_i)_max| ≤ ε        (normă infinit)
Σ_{i=1}^{n} |Δx_i| ≤ ε   (normă 1)
[ Σ_{i=1}^{n} (Δx_i)² ]^(1/2) ≤ ε   (normă 2)
```

**Eroare relativă:**
```
|(Δx_max)/x_i| ≤ ε
Σ_{i=1}^{n} |Δx_i / x_i| ≤ ε
[ Σ_{i=1}^{n} (Δx_i / x_i)² ]^(1/2) ≤ ε
```

---

## 8. Metoda Gradientului Conjugat

Magnus Rudolph Hestenes (1906–1991), matematician american, și Eduard L. Stiefel (1907–1998), matematician elvețian.

### 8.1 Preliminarii

Reținem produsul scalar `⟨x, y⟩ = xᵀy` și proprietățile sale.

O matrice este **pozitiv definită (SPD)** dacă `xᵀAx > 0` pentru orice x diferit de 0, adică `⟨x, Ax⟩ = xᵀAx > 0`.

**Rezultat fundamental:** x* este soluție pentru sistemul SPD `Ax = b` dacă și numai dacă x* minimizează
```
g(x) = ⟨x, Ax⟩ − 2⟨x, b⟩
```
Echivalent, se dorește x care minimizează
```
φ(x) = (1/2)·xᵀAx − bᵀx
```

### 8.2 Direcție de căutare și pas

Fie x o soluție aproximativă inițială pentru `Ax* = b` și v ≠ 0 o **direcție de căutare** (adică în ce parte mă deplasez față de x pentru căutarea soluției). Considerăm `r = b − Ax` **vectorul reziduu** și:
```
t = ⟨v, b − Ax⟩/⟨v, Av⟩ = ⟨v, r⟩/⟨v, Av⟩
```
Dacă r ≠ 0 și r, v nu sunt ortogonali, atunci `g(x + tv) < g(x)`, ceea ce înseamnă că `x + tv` este mai aproape de x* decât x. De aici deducem metoda.

Fie x⁰ o aproximație inițială a lui x* și v¹ o direcție de căutare inițială; atunci pentru k = 1, 2, ... calculăm:
```
t_k = ⟨v^(k), b − A·x^(k−1)⟩ / ⟨v^(k), A·v^(k)⟩
x^(k) = x^(k−1) + t_k·v^(k)
```
și alegem noua direcție de căutare v^(k+1).

### 8.3 Metoda pașilor descrescători (steepest descent)

Pentru alegerea direcției v^(k+1), considerăm funcția:
```
g(x1, ..., xn) = ⟨x, Ax⟩ − 2⟨x, b⟩ = Σ_{i=1}^{n} Σ_{j=1}^{n} a_ij·x_i·x_j − 2·Σ_{i=1}^{n} x_i·b_i
```
Direcția de căutare, în sensul în care vreau ca g(x) să descrească cu fiecare pas, este dată de `−∇g(x)`.

Cum `∂g/∂x_k (x) = 2·Σ_{i=1}^{n} a_ki·x_i − 2b_k`, atunci:
```
∇g(x) = ( ∂g/∂x1, ∂g/∂x2, ..., ∂g/∂xn )ᵀ = 2(Ax − b) = −2r
```
deci direcția este dată de vectorul reziduu r:
```
v^(k+1) = r^(k) = b − A·x^(k)
```
Pentru această alegere metoda poartă numele de **metoda pașilor descrescători**.

Deși metoda cu pași descrescători este bună pentru sisteme de ecuații neliniare sau pentru probleme de optimizare, în cazul SEL nu se folosește deoarece are **convergență slabă**.

### 8.4 Direcții conjugate (A-ortogonalitate)

O alternativă pentru alegerea direcțiilor de căutare ar fi ca vectorii `{v^(1), ..., v^(n)}` să satisfacă **A-ortogonalitatea**:
```
⟨v^(i), A·v^(j)⟩ = 0,     i ≠ j
```
Atunci:
```
t_k = ⟨v^(k), b − A·x^(k−1)⟩ / ⟨v^(k), A·v^(k)⟩ = ⟨v^(k), r^(k−1)⟩ / ⟨v^(k), A·v^(k)⟩
x^(k) = x^(k−1) + t_k·v^(k)
```
Dacă v^(k) sunt astfel aleși, iar A este SPD, atunci `A·x^(n) = b`, adică **se atinge soluția exactă după exact n pași**.

Această alegere a vectorilor direcții de căutare se numește **metoda direcției conjugate**. Între vectorii reziduu și vectorii direcție avem ortogonalitate: pentru orice k = 1, ..., n avem `⟨r^(k), v^(j)⟩ = 0` pentru orice j = 1, ..., k.

### 8.5 Derivarea metodei gradientului conjugat

Metoda Gradientului Conjugat alege direcțiile de căutare astfel încât **vectorii reziduu să fie ortogonali între ei**. Procedăm astfel:

Să spunem că am ajuns la pasul k, deci v¹, ..., v^(k−1) și x⁰, ..., x^(k−1) au fost calculați astfel:
```
x^(k−1) = x^(k−2) + t_{k−1}·v^(k−1)
unde  ⟨v^(i), A·v^(j)⟩ = 0  și  ⟨r^(i), r^(j)⟩ = 0,  i ≠ j
```
Dacă x^(k−1) verifică Ax = b, ne oprim; dacă nu, atunci `r^(k−1) = b − A·x^(k−1) ≠ 0`.

Știm că `⟨r^(k−1), v^(i)⟩ = 0` pentru i = 1, ..., k−1 și ne folosim de r^(k−1) pentru a obține vectorul direcție v^(k):
```
v^(k) = r^(k−1) + s_{k−1}·v^(k−1)
A·v^(k) = A·r^(k−1) + s_{k−1}·A·v^(k−1)
⟨v^(k−1), A·v^(k)⟩ = ⟨v^(k−1), A·r^(k−1)⟩ + s_{k−1}·⟨v^(k−1), A·v^(k−1)⟩
```
Vrem ca ultima să fie 0, deci rezultă:
```
s_{k−1} = − ⟨v^(k−1), A·r^(k−1)⟩ / ⟨v^(k−1), A·v^(k−1)⟩
```

Deci îl avem pe v^(k); trecem la t_k:
```
t_k = ⟨v^(k), r^(k−1)⟩/⟨v^(k), A·v^(k)⟩
    = ⟨r^(k−1) + s_{k−1}·v^(k−1), r^(k−1)⟩ / ⟨v^(k), A·v^(k)⟩
    = ⟨r^(k−1), r^(k−1)⟩/⟨v^(k), A·v^(k)⟩ + s_{k−1}·⟨v^(k−1), r^(k−1)⟩/⟨v^(k), A·v^(k)⟩
```
dar `⟨v^(k−1), r^(k−1)⟩ = 0`, atunci:
```
t_k = ⟨r^(k−1), r^(k−1)⟩ / ⟨v^(k), A·v^(k)⟩
x^(k) = x^(k−1) + t_k·v^(k)
```

Mai departe, din `A·x^(k) − b = A·x^(k−1) − b + t_k·A·v^(k)` rezultă:
```
r^(k) = r^(k−1) − t_k·A·v^(k)
⟨r^(k−1), r^(k)⟩ = ⟨r^(k−1), r^(k−1)⟩ − t_k·⟨A·v^(k), r^(k)⟩ = −t_k·⟨r^(k), A·v^(k)⟩
```
și, înlocuind t_k, obținem `⟨r^(k−1), r^(k−1)⟩ = t_k·⟨v^(k), A·v^(k)⟩`, de unde:
```
s_k = − ⟨v^(k), A·r^(k)⟩/⟨v^(k), A·v^(k)⟩
    = − ⟨r^(k), A·v^(k)⟩/⟨v^(k), A·v^(k)⟩
    = (1/t_k)·⟨r^(k), r^(k)⟩ / ( (1/t_k)·⟨r^(k−1), r^(k−1)⟩ )
    = ⟨r^(k), r^(k)⟩ / ⟨r^(k−1), r^(k−1)⟩
```

### 8.6 Algoritmul pe scurt

```
r^(0) = b − A·x^(0);    v^(1) = r^(0);

Pentru k = 1, 2, ..., n:
    t_k   = ⟨r^(k−1), r^(k−1)⟩ / ⟨v^(k), A·v^(k)⟩
    x^(k) = x^(k−1) + t_k·v^(k)
    r^(k) = r^(k−1) − t_k·A·v^(k)
    s_k   = ⟨r^(k), r^(k)⟩ / ⟨r^(k−1), r^(k−1)⟩
    v^(k+1) = r^(k) + s_k·v^(k)
```

---

## 9. Precondiționare

Dacă matricea A este **rău condiționată**, atunci metoda iterativă este supusă la erori de rotunjire. Metoda nu se aplică direct matricei A, ci unei alte matrici, tot SPD, dar cu un număr de condiționare mai mic. Precondiționarea înlocuiește sistemul inițial cu un altul, care are aceeași soluție, dar condiții mai bune pentru convergență.

Ca să păstrăm proprietatea de SPD, înmulțim în ambele părți sistemul cu o matrice C⁻¹ nesingulară. Considerăm:
```
Ã = C⁻¹·A·(C⁻¹)ᵀ
```
și sperăm că are un număr de condiționare mai mic decât A.

Noul sistem va fi `Ã·x̃ = b̃`, cu `x̃ = Cᵀx` și `b̃ = C⁻¹b`:
```
Ã·x̃ = (C⁻¹·A·C⁻ᵀ)(Cᵀx) = C⁻¹·A·x
```
Rezolvăm sistemul pentru x̃ și apoi, înmulțind cu `C⁻ᵀ ≡ (C⁻¹)ᵀ`, obținem x.

**Comparație grafică (curs)**: graficul erorii în funcție de numărul de iterații pentru Jacobi, Gauss-Seidel, SOR, CG și PCG(IC0) arată că Jacobi/Gauss-Seidel/SOR au nevoie de ordinul miilor de iterații, în timp ce CG și mai ales CG precondiționat converg în zeci de iterații.

---

## 10. Probleme (laborator)

1. Să se implementeze în MATLAB funcțiile pentru metodele iterative Jacobi, Gauss-Seidel și SOR.
2. Desenați grafic, pentru fiecare metodă, evoluția erorii în funcție de numărul de iterații. Testați parametri diferiți pentru ω în metoda SOR.
3. Folosiți metoda Jacobi pentru a aproxima soluția sistemului:
```
10x1 − 5x2 +  x3 = 1
  x1 + 4x2 + 3x3 = 4
 4x1 − 3x2 − 9x3 = 6
```
4. Fie sistemul liniar:
```
2x +  y +  z = 4
 x + 2y +  z = 4
 x +  y + 2z = 4
```
Stabiliți convergența metodelor Jacobi și Gauss-Seidel și razele spectrale corespunzătoare. În caz de convergență, calculați soluția iterativă după trei pași. Alegeți voi aproximația inițială.

---

*Echipa MN CS-UPB 2015 — Profesori: Pantelimon George Popescu (Seria CA), Florin Pop (Seriile CB, CC). Laborator: Facultatea de Automatică și Calculatoare, Politehnica București, 2025.*

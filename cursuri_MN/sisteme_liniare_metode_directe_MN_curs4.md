# Metode Numerice (CS-UPB) — Sisteme de ecuații liniare. Metode directe

Conținut consolidat din: slide-urile de curs "Sisteme de ecuații lineare / Metode Directe" (MN Primăvara 2015) + suportul de laborator "Eliminare Gaussiană cu pivotare totală și scalare. Algoritmul Thomas pentru rezolvarea sistemului 3-diagonal" (2025). Informația repetată în ambele surse apare o singură dată.

## Obiectivele laboratorului

Studentul va fi capabil să:
- transforme o matrice nesingulară într-o matrice superior sau inferior triunghiulară folosind una dintre metodele de eliminare gaussiană prezentate;
- implementeze algoritmii de eliminare gaussiană prezentați;
- implementeze algoritmul Thomas.

---

## 1. Formularea problemei

Un sistem liniar:
```
a11·x1 + a12·x2 + ... + a1n·xn = b1
a21·x1 + a22·x2 + ... + a2n·xn = b2
...
an1·x1 + an2·x2 + ... + ann·xn = bn
```

se reprezintă matricial ca `Ax = b`, cu
```
A = [a11 a12 ... a1n; a21 a22 ... a2n; ...; an1 an2 ... ann]
x = [x1; x2; ...; xn]
b = [b1; b2; ...; bn]
```

### 1.1 Clasificarea metodelor

- **Exacte** — metodele care furnizează soluția exactă a sistemelor dacă se neglijează erorile de rotunjire.
- **Aproximative / Iterative** — metodele care construiesc un șir x_k convergent către soluția exactă x (Jacobi, Gauss-Seidel).

Dintre metodele exacte ne ocupăm de cele **Directe**: inversare de matrici, eliminare Gauss, Gauss-Jordan, Cholesky, Crout, Doolittle, algoritmul Thomas.

### 1.2 Metode directe — caracterizare

- Teoretic oferă soluția exactă a unui sistem într-un număr finit de pași. În practică soluția va fi contaminată de efectul erorii de rotunjire implicate în aritmetica folosită.
- Reduc sistemul, prin transformări de echivalență, la un sistem particular care se rezolvă prin mijloace elementare.
- Se bazează pe rezultatul: **dacă A și T sunt matrici nesingulare, atunci x este soluție pentru sistemul Ax = b dacă și numai dacă x este soluție pentru sistemul TAx = Tb.**

Eliminarea Gaussiană (engl. *row reduction*) este un algoritm fundamental în algebra liniară; poate fi folosit pentru rezolvarea sistemelor liniare, găsirea rangului unei matrice, inversarea unei matrice sau calcularea determinantului.

---

## 2. Regula lui Cramer (și de ce nu se folosește)

Gabriel Cramer (1704–1752), regula publicată în 1750; Colin Maclaurin publicase ceva asemănător pentru cazuri speciale în 1748.

Soluția sistemului Ax = b este dată de:
```
xj = det(A^j) / det(A),   j = 1, ..., n
```
unde `A^j` este matricea obținută prin înlocuirea coloanei j din A cu vectorul b.

**Cost**: numărul de înmulțiri și împărțiri necesar pentru calculul determinanților este `N = (n−1)(n+1)!`. Pentru un sistem relativ mic, n = 10, avem N = 360.000.000 de operații — enorm. Regula lui Cramer este extrem de ineficientă, ca și toate metodele bazate pe calculul determinanților.

(Comparativ: determinantul prin definiție se calculează în O(n!) operații, iar eliminarea Gaussiană are complexitate O(n³).)

---

## 3. Operații elementare și matrici elementare

### 3.1 Cele trei operații fundamentale

Un sistem de ecuații liniare nu se schimbă dacă efectuăm:
1. **Scalare** — orice rând (ecuație) poate fi înmulțit cu o constantă nenulă: `aE_i → E_i`;
2. **Pivotare / permutare** — ordinea rândurilor (ecuațiilor) poate fi interschimbată: `E_j ↔ E_i`;
3. **Eliminare** — orice rând poate fi înlocuit cu o combinație ponderată, liniară, între acel rând și orice alt rând: `E_i − aE_j → E_i`.

Dacă adăugăm și permutarea coloanelor, soluția sistemului se schimbă doar prin aceste permutări, ușor de inversat (se schimbă ordinea necunoscutelor). Obiectivul este aducerea matricei la **forma eșalon** sau **forma eșalon redusă**.

### 3.2 Forma eșalon

Pentru fiecare linie, prima valoare diferită de zero se numește **coeficient principal** sau **pivot**. Dacă doi pivoți se găsesc pe aceeași coloană, putem mereu să facem pe unul dintre ei 0. Folosim apoi permutări pentru a aranja liniile astfel încât pivotul unei linii să fie la dreapta pivotului liniei anterioare. Toate liniile pline de 0 ajung jos. Exemplu de matrice în formă eșalon:
```
[0 1 2 3;
 0 0 4 5;
 0 0 0 0;
 0 0 0 0]
```

O matrice este în **formă eșalon redusă** dacă toți pivoții sunt 1 (obținut prin scalare) și toate celelalte elemente de pe coloana unui pivot sunt 0 (obținut prin adunarea unei linii scalate la altă linie).

### 3.3 Matrici elementare

O matrice elementară se obține din matricea identitate prin efectuarea unei operații elementare cu liniile.

**Matricea de permutare** `P_ij` — interschimbă liniile i și j.
```
Construire:  P = eye(n);  P(i,i) = P(j,j) = 0;  P(i,j) = P(j,i) = 1
Proprietăți: P = P⁻¹ = Pᵀ ⟹ P ortogonală
             det P = −1 ⟹ det(PA) = −det A
```

**Matricea de scalare** `S_i(α)` — înmulțește linia i cu scalarul α.
```
Construire:  S = eye(n);  S(i,i) = α
Proprietăți: D_i(m)⁻¹ = D_i(1/m)
             det S = α ⟹ det(SA) = α·det A
```

**Matricea de adunare** `E_ij(α)` — adună linia i la linia j înmulțită cu scalarul α.
```
Construire:  E = eye(n);  E(i,j) = α
Proprietăți: E_ij(α)⁻¹ = E_ij(−α)
             det E = 1 ⟹ det(EA) = det A
```

### 3.4 Calcularea determinantului

Pentru o matrice triunghiulară U: `det U = Π_{i=1}^{n} u_ii`. Deci:
```
det A = det U / Π_{i=1}^{n} det T_i
```

---

## 4. Eliminarea Gaussiană

Johann Carl Friedrich Gauss (30 aprilie 1777 – 23 februarie 1855), matematician german (anecdota: suma 1–100).

**Note istorice:**
- O tehnică similară eliminării gaussiene a apărut prima oară în timpul dinastiei Han din China, în textul *Nouă capitole despre Arta Matematică*.
- Joseph Louis Lagrange (1736–1813) a descris o tehnică similară în 1778, pentru cazul în care valoarea fiecărei ecuații este 0.

### 4.1 Principiul: eliminare + substituție înapoi

- **Eliminarea**: x_1 este obținut din E_1, în funcție de x_2, x_3, ..., x_n, și apoi este introdus în toate ecuațiile rămase E_2, E_3, ..., E_n. Procesul se repetă de n−1 ori până se obține o ecuație doar în x_n, care se rezolvă.
- **Substituția înapoi**: în momentul în care îl cunosc pe x_n, din ultima ecuație (care implică termenii x_n și x_{n−1}) îl pot obține pe x_{n−1} ș.a.m.d.

### 4.2 Rezultatul teoretic (curs)

Dacă matricile `A_p = [a_ij], 1 ≤ i,j ≤ p` sunt nesingulare pentru p = 1, ..., n, atunci există T nesingulară, inferior triunghiulară, astfel încât `TA = U` este superior triunghiulară.

Matricea T se alege ca `T = T_{n−1}·...·T_2·T_1`, cu
```
T_p = I_n − t_p · e_pᵀ
```
unde I_n este matricea unitate, e_p este coloana p a lui I_n, iar t_p este un vector coloană numit **vector Gauss**:
```
t_p = [0 ... 0  t_{p+1,p} ... t_{np}]ᵀ
```

Componentele necunoscute se deduc din condiția ca, aplicând transformarea T_p unui vector x, să îi lase identice primele p componente și pe celelalte să le facă 0:

```
T_p·x = (I_n − t_p e_pᵀ)x = x − t_p(e_pᵀx) = x − t_p·x_p

(T_p · x)_i = { x_i,                 i ≤ p
              { x_i − t_ip·x_p,      i > p
```
Impunând condiția ca pentru i > p elementele să fie 0:
```
t_ip = x_i / x_p,    i = p+1 : n
```
deci vectorul Gauss este:
```
t_p = [0 ... 0   x_{p+1}/x_p   ...   x_n/x_p]ᵀ
```

Aplicând transformarea T_p unui vector oarecare y:
```
T_p·y = (I_n − t_p e_pᵀ)y = y − t_p(e_pᵀ y) = y − t_p·y_p

(T_p · y)_i = { y_i,                       i ≤ p
              { y_i − (x_i/x_p)·y_p,       i > p
```

**Scenariul metodei**: considerăm matricea sistemului A pătratică; ca vector x luăm coloana p a matricei A, iar ca vector y luăm pe rând coloanele j ale matricei A situate la dreapta coloanei p. Se aplică algoritmul pentru p = 1, ..., n. Se obține, după aplicarea transformării `T = T_{n−1}...T_2T_1` asupra lui A, o matrice superior triunghiulară, i.e. `TA = U`.

### 4.3 Exemplu

```
[1  3  1  9;        [1   3   1   9;        [1   3   1   9;
 1  1 −1  1;   →     0  −2  −2  −8;   →     0  −2  −2  −8;
 3 11  8 35]         0   2   5   8]         0   0   3   0]
```

### 4.4 Algoritm (gândirea în MATLAB)

1. Folosesc un p ca să mă plimb pe coloane, până când p este egal cu numărul de linii sau de coloane.
2. Pivotul meu va fi `a_pp`.
3. Iau restul de elemente de pe coloană folosind un index i și calculez `µ_ip = a_ip / a_pp`. Acești coeficienți îi pun în matricea T: `T(i,p) = −µ_ip`.
4. Calculez produsul `T·A` și continui cu următoarea coloană.

```
Algorithm 1: Eliminare Gaussiană
1: [m, n] ← dimensiunea matricei A
2: maxP ← min(m, n)                 // numărul de operații de eliminare
3: for p = 1 to maxP do
4:     T ← I_m                      // inițializăm matricea de transformare
5:     µ ← A(p+1:m, p)/A(p, p)      // calculăm coeficienții
6:     T(p+1:m, p) ← −µ             // actualizăm transformarea
7:     A ← T · A                    // aplicăm transformarea
8: end for
```

**Observații:**
- Nu este nevoie să aducem matricea la forma eșalon redusă pentru a rezolva un sistem; trebuie doar să fie triunghiulară. În cod, A este **matricea extinsă** a sistemului. Mai mult, am introduce erori de calcul în plus din cauza efectuării mai multor operații.
- Dacă pivotul selectat este 0, algoritmul "crapă". Pentru asta se introduce pivotarea.

### 4.5 Contorizarea operațiilor

- **Eliminare simplă**: `* sau /` → `(2n³ + 3n² − 5n)/6`; `+ sau −` → `(n³ − n)/3`
- **Substituție înapoi**: `* sau /` → `(n² + n)/2`; `+ sau −` → `(n² − n)/2`

---

## 5. Pivotare

Metoda de eliminare gaussiană **pică** dacă pe diagonala principală găsește 0; de asemenea, metoda poate produce chiar ea însăși zerouri pe diagonala principală și iarăși pică. Din acest motiv se practică pivotarea.

Pivotarea constă în folosirea permutărilor și a scalării pentru a alege cel mai bun pivot. Eliminarea Gauss poate fi aplicată pe orice matrice, deci discuția se bazează pe **analiză numerică**.

### 5.1 De ce este pivotarea importantă?

Fie un calculator cu aritmetică în virgulă mobilă, cu 3 zecimale, cu trunchiere. Fie sistemul:
```
[0.001  1;      [x1;     [1;
 1      1]   ·   x2]  =   2]

µ = 1/0.001 = 1000
```
Sistemul devine:
```
[0.001   1;     [x1;     [1;
 0    −999]  ·   x2]  =  −998]
```
Soluțiile: `x2 = −998/−999 = 0.998` și `x1 = (1 − 0.998)/0.001 = 2`.

Comparăm soluția găsită `x* = [2; 0.998]` cu soluția reală `x = [1.001; 0.999]`:
```
||x − x*|| = ||[−0.999; 0.001]|| = 0.999
||x||      = ||[1.001; 0.999]||  = sqrt(2)
||x − x*||/||x|| = 0.999/sqrt(2) = 0.71
```
Eroarea relativă este de aproximativ **71%** — foarte mare! Dacă am calcula reziduul, am vedea că el este totuși mic, dar pe noi ne interesează soluția.

Strategii: **GPP** (pivotare parțială), **GPPS** (pivotare parțială cu pivot scalat), **GPT** (pivotare totală).

### 5.2 Pivotare parțială — GPP

Are loc numai prin **permutarea liniilor**. La pasul p se aduce în locul pivotului cel mai mare element (în modul) din coloană, de sub acesta. (Formularea din curs: se fac aranjamente între rânduri/ecuații, înainte de fiecare pas, astfel încât elementul maxim să fie pus pe diagonală.)

Algoritmul e identic cu G, doar că înaintea calculării coeficienților µ_ip se face permutarea liniilor.

```
Algorithm 2: Eliminare Gaussiană cu pivotare parțială
1: [m, n] ← dimensiunea matricei A
2: maxP ← min(m, n)
3: for p = 1 to maxP do
4:     [ , idx] ← max(|A(p:m, p)|)   // linia cu valoarea absolută maximă în coloana p
5:     idx ← idx + p − 1
6:     P ← I_m
7:     Interschimbă liniile p și idx din P
8:     A ← P · A
9:     T ← I_m
10:    µ ← A(p+1:m, p)/A(p, p)
11:    T(p+1:m, p) ← −µ
12:    A ← T · A
13: end for
```

**Observație**: această metodă **încă nu rezolvă** eroarea din sistemul exemplu de mai sus — nu se efectuează nicio permutare. Totuși, în general este suficientă pentru a face erorile rezonabile. Dacă pivotul ajunge să fie 0, atunci matricea este singulară.

Exemplu de aranjare (curs):
```
Pivotare parțială:  [1 1 1; 1 1 2; 2 2 3] → [2 2 3; 1 1 2; 1 1 1]
```

### 5.3 Pivotare parțială cu pivot scalat — GPPS

Metoda de eliminare gaussiană produce erori mari de rotunjire dacă ordinul coeficienților dintr-o ecuație este semnificativ diferit; din acest motiv se practică **scalarea**. Scalarea este un pas intermediar prin care se alege elementul pivot: se împart elementele din coloana p (la pasul p) cu cel mai mare număr din linia respectivă și se alege ca pivot elementul al cărui raport este mai mare.

Definim la început un factor de scalare pentru fiecare linie i:
```
s_i = max_{j=p:n} {|a_ij|}     sau     s_i = Σ_{j=p}^{n} |a_ij|
```
Dacă `s_i = 0` atunci matricea este singulară.

La fiecare pas p căutăm întregul i_p astfel încât:
```
|a_{i_p, p}| / s_{i_p} = max_{i=p:n} ( |a_ip| / s_i )
```

**Exemplu**: pentru sistemul `[1 10000; 1 0.0001]·[x; y] = [10000; 1]`, folosind GPP nu am interschimba liniile, dar avem exact aceeași problemă de stabilitate numerică. În consecință interschimbăm liniile, pentru că 1 este foarte mic **relativ la** 10000.

```
Algorithm 3: Eliminare Gaussiană cu pivotare parțială cu pivot scalat
1: [m, n] ← size of A
2: maxP ← min(m, n)
3: for p = 1 to maxP do
4:     s_factors ← max(|A(p:m, p:n−1)|, row-wise)   // factorii de scalare
5:     fractions ← A(p:m, p)/s_factors
6:     [ , idx] ← max(|fractions|)                  // linia cu pivotul scalat maxim
7:     idx ← idx + p − 1
8:     P ← I_m
9:     Interschimbă liniile p și idx din P
10:    A ← P · A
11:    T ← I_m
12:    µ ← A(p+1:m, p)/A(p, p)
13:    T(p+1:m, p) ← −µ
14:    A ← T · A
15: end for
```

### 5.4 Pivotare totală — GPT

Cea mai bună stabilitate numerică se obține atunci când pivotul este cel mai mare element în modul **din toată submatricea rămasă**. (Formularea din curs: se fac aranjamente între rânduri și coloane — ecuații și valori — înainte de fiecare pas, astfel încât elementul maxim de pe rând și coloană să fie pus pe diagonală.)

Totuși, în practică nu se folosește, deoarece la fiecare iterație trebuie parcursă toată submatricea — costurile sunt mai mari decât beneficiile.

Pentru că acum permutăm și coloanele, trebuie să **ținem minte aceste permutări** (se schimbă ordinea necunoscutelor). Pentru ele folosim tot o matrice P, dar o aplicăm **la dreapta**.

Exemplu de aranjare (curs):
```
Pivotare totală:  [1 1 1; 1 1 2; 2 2 3] → [2 2 3; 1 1 2; 1 1 1] → [3 2 2; 2 1 1; 1 1 1]
```

```
Algorithm 4: Eliminare Gaussiană cu pivotare totală
1: [m, n] ← size of A
2: maxP ← min(m, n)
3: PR ← I_n                                    // matricea de permutare a coloanelor
4: for p = 1 to maxP do
5:     [ , idx] ← max(|A(p:m, p:n−1)|)          // elementul cu valoarea absolută maximă
6:     (row, col) ← index of max element
7:     row ← row + p − 1
8:     col ← col + p − 1
9:     P ← I_n
10:    Interschimbă coloanele p și col din P
11:    PR ← PR · P                              // actualizăm matricea de permutare
12:    A ← A · P
13:    P ← I_m
14:    Interschimbă liniile p și row din P
15:    A ← P · A
16:    T ← I_m
17:    µ ← A(p+1:m, p)/A(p, p)
18:    T(p+1:m, p) ← −µ
19:    A ← T · A
20: end for
```

Pentru că A este matricea extinsă, trebuie să avem grijă cu indicii.

---

## 6. Factorizarea LU

Prin aplicarea matricilor elementare și ajungând la forma eșalon, obținem o matrice superior triunghiulară:
```
T_n T_{n−1} ... T_1 A = U
A = T_1⁻¹ T_2⁻¹ ... T_n⁻¹ U
A = LU,   L = T_1⁻¹ T_2⁻¹ ... T_n⁻¹
```
unde L este inferior triunghiulară, iar U superior triunghiulară.

**Utilitate**: pentru a soluționa `Ax = b` cu A = LU, reducem problema la două sisteme ușor de rezolvat. Notăm `y = Ux`, deci avem doi pași:
- **Pas 1**: rezolvă sistemul inferior triunghiular `Ly = b` pentru y;
- **Pas 2**: rezolvă sistemul superior triunghiular `Ux = y` pentru x.

### 6.1 Crout

```
l_i1 = a_i1;                                      i = 1 : n
u_1j = a_1j / l_11;                               j = 2 : n
l_ij = a_ij − Σ_{k=1}^{j−1} l_ik·u_kj;            i ≥ j
u_ij = (1/l_ii)·( a_ij − Σ_{k=1}^{i−1} l_ik·u_kj );  i < j
```

### 6.2 Doolittle

```
u_1i = a_1i;                                      i = 1 : n
l_i1 = a_i1 / u_11;                               i = 2 : n
l_ij = (1/u_jj)·( a_ij − Σ_{k=1}^{j−1} l_ik·u_kj );  i > j
u_ij = a_ij − Σ_{k=1}^{i−1} l_ik·u_kj
```

### 6.3 Cholesky

```
l_ii = sqrt( a_ii − Σ_{k=1}^{i−1} l_ik² );        i = 1 : n
l_ij = ( a_ij − Σ_{k=1}^{j−1} l_ik·l_jk ) / l_jj;  j = 1 : i−1
```

---

## 7. Eliminarea Gauss-Jordan

Wilhelm Jordan (1842–1899), geodez german.

- Este o variație a metodei de eliminare gaussiană în care **atât** elementele de sub diagonala principală, **cât și** cele de deasupra diagonalei principale sunt reduse la 0.
- De obicei rândurile sunt scalate pentru a se obține matricea unitate.

```
- normalizare:  A_pj = A_pj / A_pp,        p = 1 : n,  j = p : 2n
- reducere:     A_ij = A_ij − A_ip·A_pj,   p = 1 : n,  i = 1 : n,  j = p : 2n
```

**Inversarea matricei**: dacă înlocuim vectorul b cu matricea I_n, atunci aplicând metoda Gauss-Jordan cu scalare vom obține în stânga matricea I_n, iar în dreapta inversa matricei A, adică A⁻¹.

---

## 8. Rezolvarea sistemelor liniare particulare

### 8.1 A superior triunghiulară — substituție înapoi

```
x_i = ( b_i − Σ_{j=i+1}^{n} A_ij·x_j ) / A_ii,     i = n : −1 : 1
```
(dacă i = n, suma este 0)

Numărul total de operații (+, −, /, *):
```
Σ_{i=n}^{1} [ 2(n − (i+1) + 1) − 1 + 1 + 1 ] = n²
```
Complexitatea este **O(n²)**.

### 8.2 A inferior triunghiulară — substituție înainte

```
x_i = ( b_i − Σ_{j=1}^{i−1} A_ij·x_j ) / A_ii,     i = 1 : n
```

---

## 9. Algoritmul Thomas (sistem tridiagonal)

Llewellyn Hilleth Thomas (1903–1992), fizician și matematician englez.

Un sistem tridiagonal are ecuații de forma:
```
a_i·x_{i−1} + b_i·x_i + c_i·x_{i+1} = d_i,     a_0 = 0,  c_n = 0
```
Forma matriceală:
```
[b1 c1  0            ]   [x1]   [d1]
[a2 b2 c2            ]   [x2]   [d2]
[   a3 b3  ...       ] · [x3] = [d3]
[        ...  c_{n−1}]   [..]   [..]
[ 0        a_n   b_n ]   [xn]   [dn]
```

Un astfel de sistem este un caz special al eliminării Gaussiene și poate fi rezolvat în doar **O(n)** operații. Astfel de matrici apar în special la calculul spline-urilor cubice.

### 9.1 Derivarea

Fie primele 2 ecuații:
```
b1·x1 + c1·x2 = d1
a2·x1 + b2·x2 + c2·x3 = d2
```
Facem primul pas din eliminarea gaussiană, cu `µ = a2/b1`:
```
b1·x1 + c1·x2 = d1
(b2 − µ·c1)·x2 + c2·x3 = d2 − µ·d1
```
Necunoscuta x1 a fost eliminată și am rămas cu o ecuație similară cu prima. Procedeul se continuă până la final, deci definim coeficienții recursiv (coeficienții primei ecuații nu se modifică):
```
µ   = a_i / b_{i−1}
b_i = b_i − µ·c_{i−1}
d_i = d_i − µ·d_{i−1}
```

**Pas 2 — substituție înapoi** (rezolvarea sistemului bidiagonal):
```
x_n = d_n / b_n
x_i = ( d_i − c_i·x_{i+1} ) / b_i,     i = n−1 : −1 : 1
```

```
Algorithm 5: Algoritmul Thomas
1: n ← length(d)
2: x ← zeros(n, 1)
   // Eliminare înainte
3: for i = 2 to n do
4:     µ ← a[i]/b[i−1]
5:     b[i] ← b[i] − µ·c[i−1]
6:     d[i] ← d[i] − µ·d[i−1]
7: end for
   // Substituție înapoi
8: x[n] ← d[n]/b[n]
9: for i = n−1 down to 1 do
10:    x[i] ← (d[i] − c[i]·x[i+1]) / b[i]
11: end for
```

Algoritmul în MATLAB se construiește folosind 4 vectori corespunzători coeficienților (a, b, c) și termenilor liberi (d).

### 9.2 Analiză numerică. Dominanță diagonală

Este suficient să analizăm ecuația:
```
b'_i = b_i − (a_i·c_{i−1}) / b_{i−1}
```
Dacă `|b_{i−1}|` este foarte mic, erorile se pot amplifica atunci când îl calculăm pe µ. În consecință ne-am dori ca `|b_i| > |c_i|` și `|b_i| > |a_i|`.

O matrice care satisface aceste condiții se numește **diagonal dominantă**: elementele de pe diagonala principală sunt mai mari decât suma elementelor de pe linie, mai exact în cazul nostru:
```
|b_i| ≥ |a_i| + |c_i|
```

---

## 10. Cod MATLAB — SEL (x = A\b)

```matlab
function b = gee_its_short(A, b)
n = size(A, 1);
for k = 1:n
    [x i] = max(abs(A(k:n,k)));
    i = i + k - 1;
    A([k i],:) = A([i k],:);
    b([k i],:) = b([i k],:);
    A(k+1:n,k) = A(k+1:n,k) / A(k,k);
    A(k+1:n,k+1:n) = A(k+1:n,k+1:n) - A(k+1:n,k) * A(k,k+1:n);
    b(k+1:n,:) = b(k+1:n,:) - A(k+1:n,k) * b(k,:);
end
for k = n:-1:1
    b(k,:) = b(k,:) / A(k,k);
    b(1:k-1,:) = b(1:k-1,:) - A(1:k-1,k) * b(k,:);
end
```

---

## 11. Probleme (laborator)

1. Construiți o variantă modificată pentru algoritmul lui Thomas care să lucreze cu matricea (structură penta-diagonală cu 0-uri intercalate):
```
[b1  0  c1  0                          ]
[ 0 b2   0 c2                          ]
[a3  0  b3  0 c3                       ]
[      ...  ... ...  ...   ...          ]
[            a_{n−2}  0  b_{n−2}  0  c_{n−2}]
[                     a_{n−1}  0  b_{n−1}  0]
[                              0  a_n  0  b_n]
```
2. Fie sistemul:
```
 1.5·x1 − 2.1·x2 = 8.3
−7.6·x1 + 3.11·x2 = 6.7
```
Rezolvați sistemul folosind eliminare GPP, GPPS, GPT.

---

## 12. Bibliografie

- Joe D. Hoffman, *Numerical Methods for Engineers and Scientists*, 2nd edition, Marcel Dekker, 2001.
- Jaan Kiusalaas, *Numerical Methods in Engineering*, 2nd edition, Cambridge University Press, 2010.
- Rao V. Dukkipati, *Numerical Methods*, New Age International (P) Ltd., Publishers, 2010.
- Richard L. Burden, J. Douglas Faires, *Numerical Analysis*, 9th edition, Brooks/Cole, Cengage Learning, 2011.

*Echipa MN CS-UPB 2015 — Profesori: Pantelimon George Popescu (Seria CA), Florin Pop (Seriile CB, CC). Laborator: Facultatea de Automatică și Calculatoare, Politehnica București, 2025.*

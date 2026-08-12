# Metode Numerice CS-UPB — Matrici, Factorizări LU, Norme, Valori proprii

Sursă: Curs 2 „Despre Matrici" (MN Primăvara 2015, CS-UPB) + Laborator 2 „Operații cu matrice în MATLAB. Rezolvarea eficientă a sistemelor de ecuații liniare. Factorizări LU. Inversarea matricelor prin partiționare" (2025).
Conținutul comun celor două documente (în special factorizările LU: Crout, Doolittle, Cholesky) apare o singură dată, unificat.

---

## 1. Matrici și vectori

O **matrice** este un bloc dreptunghiular de elemente, unde nu doar valoarea unui element este importantă, ci și poziția lui:

A = [a_ij], i = 1..n, j = 1..m

**Vectorii** sunt un caz special de matrici, cu o singură coloană sau un singur rând:
- vector coloană: x = [x_i], i = 1..n
- vector linie: y = [y_j], j = 1..n

---

## 2. Tipuri de matrici

### 2.1 După formă / structura zerourilor
- **Pătratică**: n = m.
- **Diagonală (D)**: are elemente doar pe diagonala principală, în rest 0. (I_n ∈ D)
- **Superior triunghiulară (U)**: elemente nule sub diagonala principală.
- **Inferior triunghiulară (L)**: elemente nule deasupra diagonalei principale.
- **Superior/inferior unitriunghiulară**: triunghiulară cu toate elementele de pe diagonală egale cu 1.
- **Tridiagonală**: nenule doar pe diagonala principală și pe cele două diagonale adiacente.
- **Matrice bandă**: nenule doar pe o bandă de diagonale în jurul diagonalei principale.
- **Bloc diagonală**: A = diag(A_11, ..., A_kk), se scrie și ca sumă directă A = A_11 ⊕ A_22 ⊕ ... ⊕ A_kk = ⊕_{i=1}^k A_ii.
- **Bloc triunghiulară superioară**: blocuri A_11..A_kk pe diagonală, blocuri arbitrare (★) deasupra, 0 dedesubt.
- **Matrice de permutare**: are exact un singur 1 pe fiecare linie și coloană, în rest 0.

Proprietăți bloc diagonale:
- det(⊕_{i=1}^k A_ii) = ∏_{i=1}^k det A_ii
- (A ⊕ B)^(-1) = A^(-1) ⊕ B^(-1)
- adj(A ⊕ B) = (det B) adj A ⊕ (det A) adj B

### 2.2 Operatori de bază
- **Transpusa** A^T: rândurile devin coloane și invers.
  - (A^T)^T = A
  - (AB)^T = B^T A^T
- **Conjugata** Ā: toate numerele complexe sunt conjugate; conj(AB) = Ā · B̄.
- **Conjugata transpusă** (adjuncta / hermitica adjunctă): A* = (Ā)^T
  - (AB)* = B* A*

### 2.3 După proprietăți algebrice
- **Inversă**: A^(-1) A = I_n = A A^(-1)
- **Simetrică**: A^T = A
- **Skew-simetrică (antisimetrică)**: A^T = −A
- **Ortogonală**: A^T A = I_n
- **Hermitică**: A* = A
- **Skew-hermitică**: A* = −A
- **Unitară**: A* A = I_n
- **Normală**: A A* = A* A
- **Involuție**: A² = I_n, adică A = A^(-1)
- **Nilpotentă**: A^k = 0 pentru un k natural
- **Proiecție (idempotentă)**: A² = A
- **Proiecție hermitică**: A* = A și A² = A
- **Coninvoluție**: A Ā = I_n
- **Semipozitiv definită (pozitivă)**: ∀x, x* A x ≥ 0
- **Pozitiv definită (strict pozitivă)**: ∀x ≠ 0, x* A x > 0 (în C^n; în R^n se folosește x^T)
- (analog se definesc negativ-definită / negativ-semidefinită, cu semnul „<")

### 2.4 Matrici clasice (cu nume)
- **Circulantă**: fiecare rând este o deplasare ciclică a rândului precedent.
- **Toeplitz** (Otto Toeplitz, 1881–1940, mat. german): a_ij = a_(j−i) — constantă pe diagonale.
- **Hankel** (Hermann Hankel, 1839–1873, mat. german): a_ij = a_(i+j−2) — constantă pe antidiagonale.
- **Hessenberg** (Karl Adolf Hessenberg, 1904–1959, mat. și inginer german): superioară sau inferioară — triunghiulară plus o subdiagonală/supradiagonală.
- **Vandermonde** (Alexandre-Théophile Vandermonde, 1735–1796, mat., muzician și chimist francez): a_ij = x_i^(j−1);
  det A = ∏_{i>j} (x_i − x_j)
- **Cauchy** (Augustin-Louis Cauchy, 1789–1857, mat. francez): elemente de tipul [(a_i + b_j)^(-1)]_{i,j=1..n}, cu a_i + b_j ≠ 0;
  det A = ∏_{1≤i<j≤n} (a_j − a_i)(b_j − b_i) / ∏_{1≤i,j≤n} (a_i + b_j)
- **Hilbert** (David Hilbert, 1862–1943, mat. german): caz particular de Cauchy cu a_i = i și b_j = j − 1;
  det H_n = (1!2!···(n−1)!)^4 / (1!2!···(2n−1)!)

---

## 3. Urmă, determinant, rang

### 3.1 Urma
tr(A) = Σ a_ii (suma elementelor diagonalei principale)
- tr(A A*) = tr(A* A)
- tr(A A*) = 0 ⇔ A = 0

### 3.2 Determinantul
Expansiunea **Laplace** (Pierre-Simon de Laplace, 1749–1827, mat. francez) după minori, pe linia i, respectiv coloana j:

det(A) = Σ_k (−1)^(i+k) a_ik det(A_ik) = Σ_k (−1)^(k+j) a_kj det(A_kj)

unde A_ij este matricea (n−1)×(n−1) obținută prin suprimarea liniei i și coloanei j.

Proprietăți:
- det(AB) = det A · det B
- det(A^T) = det A
- det(A*) = conj(det A)

### 3.3 Rangul
Rangul matricei A_{m,n} este numărul maxim k de rânduri (coloane) liniar independente.
- rang A ≤ min{m, n}
- rang A* = rang Ā = rang A^T = rang A
- |rang A − rang B| ≤ rang(A + B) ≤ rang A + rang B
- Dacă A ∈ M_n(F): det A ≠ 0 ⇔ rang A = n

---

## 4. De ce NU regula lui Cramer (complexitate)

Pentru un sistem Ax = b de n ecuații cu n necunoscute, det(A) ≠ 0, regula lui Cramer cere calculul a n + 1 determinanți (înlocuind pe rând coloane din A cu b).

Calculul unui determinant de ordin n prin dezvoltare Laplace necesită n determinanți de ordin n−1, deci în total:

n · (n−1) · (n−2) · ... · 1 = n!

⇒ complexitate **O(n!)** — inutilizabilă practic. Metodele studiate mai departe sunt de ordinul **O(n³)**.

---

## 5. Factorizarea LU

**A = LU**, unde L este inferior triunghiulară și U superior triunghiulară.

Utilitatea: pentru a rezolva Ax = b cu A = LU, notăm y = Ux și rezolvăm două sisteme triunghiulare, fiecare în O(n²):
1. **Pas 1**: sistemul inferior triunghiular **Ly = b** → y
2. **Pas 2**: sistemul superior triunghiular **Ux = y** → x

Deci algoritmul are doi pași mari: (1) descompunerea lui A în L și U; (2) rezolvarea celor două sisteme triunghiulare.

Descompunerea directă ar da un sistem cu n² ecuații și n² + n necunoscute; „scăpăm" de necunoscutele în plus fixând diagonala uneia dintre matrici (Crout, Doolittle) sau impunând U = L* (Cholesky).

### 5.1 Condiții de existență (teorie)
- Fie A cu rang A = k. Atunci A = LU dacă pentru orice i ∈ {1,...,k} submatricea principală A[{1,...,i}] este nesingulară. Mai mult, oricare dintre factorii L sau U poate fi ales cu diagonala plină de 1.
- Dacă rang A = n, atunci A este nesingulară, la fel și toate submatricile ei principale, deci A = LU cu L și U nesingulare.
- A = LU cu **L nesingular** ⇔ pentru orice i ∈ {1,...,n−1}, rândul A[{i+1},{1,...,i}] se poate scrie ca o combinație liniară a rândurilor din submatricea principală A[{1,...,i}] (proprietatea de incluziune a rândurilor).
- A = LU cu **U nesingular** ⇔ pentru orice j ∈ {1,...,n−1}, coloana A[{1,...,j},{j+1}] se poate scrie ca o combinație liniară a coloanelor submatricei principale A[{1,...,j}] (proprietatea de incluziune a coloanelor).
- A = LU ⇔ A[{1,...,j}] nesingulară pentru orice j = 1..n.
- A = LDU ⇔ A[{1,...,j}] nesingulară pentru orice j = 1..n, cu
  D = diag(d_1, ..., d_n), d_1 = a_11, d_i = det A[{1,...,i}] / det A[{1,...,i−1}], i = 2..n.
  L, D, U sunt unic determinate, iar L și U au 1 pe diagonală.
- Pentru **orice** matrice A există o matrice de permutare P, o matrice unitriunghiulară inferioară L și o superior triunghiulară U astfel încât A = PLU (cu L având 1 pe diagonală), sau A = LUP (cu U având 1 pe diagonală), sau A = LPU (P este unic dacă A este nesingulară, doar pentru LPU).
- Pentru orice matrice **nesingulară** A există o unică matrice de permutare P, o unică matrice diagonală nesingulară D, o matrice unitriunghiulară inferioară L și una superioară U astfel încât A = LPDU.

Denumiri:
- **Crout**: u_ii = 1 (diagonala lui U plină de 1)
- **Doolittle**: l_ii = 1 (diagonala lui L plină de 1)
- **Cholesky**: L = U^T pentru A simetrică ⇒ A = LL^T

### 5.2 Metoda Crout

Presupune u_ii = 1. Pentru o matrice 3×3, sistemul de ecuații este:

```
l11 = a11              l11·u12 = a12                     l11·u13 = a13
l21 = a21              l21·u12 + l22 = a22               l21·u13 + l22·u23 = a23
l31 = a31              l31·u12 + l32 = a32               l31·u13 + l32·u23 + l33 = a33
```

Formule generale (curs):
```
l_i1 = a_i1,                                    i = 1..n
u_1j = a_1j / l_11,                             j = 2..n
l_ij = a_ij − Σ_{k=1}^{j−1} l_ik·u_kj,          i ≥ j
u_ij = (1/l_ii)·( a_ij − Σ_{k=1}^{i−1} l_ik·u_kj ),  i < j
```

Idee de algoritm (MATLAB): folosim un indice p cu care „ne plimbăm" pe coloane; pentru fiecare coloană avem două seturi de ecuații — din primele p−1 calculăm u_ip, din restul calculăm l_ip.

**Algorithm 1 — Crout**
```
n ← numărul de linii al matricei A
L ← matricea 0 de dimensiune n×n
U ← matricea identitate de dimensiune n×n
for p = 1 to n do
    for i = 1 to p-1 do
        U(i,p) ← ( A(i,p) − L(i,1:i)·U(1:i,p) ) / L(i,i)
    end for
    for i = p to n do
        L(i,p) ← A(i,p) − L(i,1:i)·U(1:i,p)
    end for
end for
```

### 5.3 Metoda Doolittle

Presupune l_ii = 1. Pentru o matrice 3×3:

```
u11 = a11              u12 = a12                         u13 = a13
l21·u11 = a21          l21·u12 + u22 = a22               l21·u13 + u23 = a23
l31·u11 = a31          l31·u12 + l32·u22 = a32           l31·u13 + l32·u23 + u33 = a33
```

Formule generale (curs):
```
u_i1 = a_i1,                                    i = 1..n
l_i1 = a_i1 / u_11,                             i = 2..n
l_ij = (1/u_jj)·( a_ij − Σ_{k=1}^{j−1} l_ik·u_kj ),  i > j
u_ij = a_ij − Σ_{k=1}^{i−1} l_ik·u_kj
```

Idee de algoritm: același indice p pe coloane; din primele p ecuații calculăm u_ip (i = 1..p), din restul l_ip (i = p+1..n).

**Algorithm 2 — Doolittle**
```
n ← numărul de linii al matricei A
L ← matricea identitate de dimensiune n×n
U ← matricea 0 de dimensiune n×n
for p = 1 to n do
    for i = 1 to p do
        U(i,p) ← A(i,p) − L(i,1:i)·U(1:i,p)
    end for
    for i = p+1 to n do
        L(i,p) ← ( A(i,p) − L(i,1:i)·U(1:i,p) ) / U(p,p)
    end for
end for
```

### 5.4 Metoda Cholesky

(André-Louis Cholesky, 1875–1918, ofițer militar francez, implicat în geodezie la începutul anilor 1900.)

Matricea U este setată ca transpusa (sau hermitica) lui L: **A = LL\*** (real: A = LL^T).
Este un caz particular al factorizării LDL^T pentru o matrice simetrică, cu D = I_n.

**Teoremă**: dacă A este simetrică n×n pozitiv definită, atunci A se poate factoriza LL^T cu L unic.

Descompunerea se aplică doar pe matrice simetrice, pozitiv-semidefinite. Pentru sisteme consistente (soluție unică, A inversabilă), A este pozitiv-definită.

*Demonstrație*: A = LL* ⇒ A* = LL* ⇒ A = A* (simetrică/hermitică).
Pentru x ∈ C^n\{0}: x*Ax = x*LL*x = (L*x)*(L*x) ≥ 0, deci A e semipozitiv definită.
Dacă A este inversabilă, atunci și L* este inversabilă, iar egalitatea cu 0 se obține doar pentru x = 0 ⇒ A este pozitiv-definită.

Algoritmul eșuează dacă matricea nu este pozitiv-definită (se ajunge la împărțire la 0 sau la radical dintr-un număr negativ), deci **nu e necesară verificarea prealabilă** a condiției.

Pentru o matrice 3×3:
```
l11²  = a11                l11·l21 = a12                   l11·l31 = a13
l11·l21 = a21              l21² + l22² = a22               l21·l31 + l22·l32 = a23
l11·l31 = a31              l21·l31 + l22·l32 = a32         l31² + l32² + l33² = a33
```

Formule (curs):
```
l_ii = sqrt( a_ii − Σ_{k=1}^{i−1} l_ik² ),      i = 1..n
l_ij = ( a_ij − Σ_{k=1}^{j−1} l_ik·l_jk ) / l_jj,   j = 1..i−1
```

Observații pentru implementare:
1. Indicele p „se plimbă" pe coloane, indicele i pe linii.
2. Două tipuri de ecuații:
   - i = p: l_pp = sqrt( a_pp − Σ_j l_pj² )
   - i ≠ p: l_ip = ( a_ip − Σ_j l_pj·l_ij ) / l_pp
3. Pentru că A este simetrică, se poate ignora partea de deasupra diagonalei principale.
4. Cele două sume sunt echivalente când p = i.

**Algorithm 3 — Cholesky**
```
n ← numărul de linii al matricei A
L ← matricea 0 de dimensiune n×n
for p = 1 to n do
    for i = p to n do
        s ← L(p,1:p) · L(i,1:p)^T
        if i = p then
            L(p,p) ← sqrt( A(p,p) − s )
        else
            L(i,p) ← ( A(i,p) − s ) / L(p,p)
        end if
    end for
end for
```

### 5.5 Cod MATLAB de referință (built-in)
```matlab
[L,U] = lu(A)
L = chol(A,'lower')
R = chol(A,'upper')
```

---

## 6. Rezolvarea sistemelor triunghiulare

### 6.1 Sistem superior triunghiular — substituție înapoi
```
a11·x1 + a12·x2 + ... + a1n·xn = b1
         a22·x2 + ... + a2n·xn = b2
                            ...
                     ann·xn = bn
```
Formula:
x_i = ( b_i − Σ_{j=i+1}^{n} a_ij·x_j ) / a_ii,   pentru i = n, n−1, ..., 1

**Algorithm 4 — Substituție înapoi**
```
n ← numărul de linii al matricei A
x ← vector plin de 0 de dimensiune n
for i = n to 1 step -1 do
    x(i) ← ( b(i) − A(i,(i+1):n)·x((i+1):n) ) / A(i,i)
end for
```

### 6.2 Sistem inferior triunghiular — substituție înainte
```
a11·x1 = b1
a21·x1 + a22·x2 = b2
                        ...
an1·x1 + ... + ann·xn = bn
```
Formula:
x_i = ( b_i − Σ_{j=1}^{i−1} a_ij·x_j ) / a_ii,   pentru i = 1, 2, ..., n

**Algorithm 5 — Substituție înainte**
```
n ← numărul de linii al matricei A
x ← vector plin de 0 de dimensiune n
for i = 1 to n do
    x(i) ← ( b(i) − A(i,1:(i−1))·x(1:(i−1)) ) / A(i,i)
end for
```

---

## 7. Inversarea matricelor prin partiționare

Partiționarea simplifică operațiile cu matrice; dacă partiționăm bine, operațiile pe blocuri se pot paraleliza, scăzând timpul de execuție.

### 7.1 Matrice bloc
Exemplu: A = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]] împărțită în 4 blocuri 2×2:
```
A11 = [1 2; 5 6]      A12 = [3 4; 7 8]
A21 = [9 10; 13 14]   A22 = [11 12; 15 16]
```

Pentru matrice conforme, adunarea și înmulțirea se fac pe blocuri:
```
A + B = [A11+B11  A12+B12 ;
         A21+B21  A22+B22]

AB    = [A11B11+A12B21   A11B12+A12B22 ;
         A21B11+A22B21   A21B12+A22B22]
```

### 7.2 Complementul lui Schur
Apare când aplicăm eliminarea Gaussiană pe o matrice bloc. Fie M = [A B; C D].

```
[ I      0 ] [A B]   [A      B          ]
[-CA^-1  I ] [C D] = [0  D − C A^-1 B  ]

[A B] [ I        0 ]   [A − B D^-1 C   B]
[C D] [-D^-1 C   I ] = [0              D]
```

Definiții:
- M/A := D − C A^(-1) B, dacă A inversabilă
- M/D := A − B D^(-1) C, dacă D inversabilă

(Referință: J. Schur, *Über Potenzreihen, die im Innern des Einheitskreises beschränkt sind*, Journal für die reine und angewandte Mathematik, 147:205–232, 1917.)

### 7.3 Calcularea inversei
Continuând eliminarea Gaussiană:
```
[I  -B(M/A)^-1] [A   0     ]   [A   0    ]
[0     I      ] [0  (M/A)  ] = [0  (M/A) ]

[A^-1   0        ] [A   0    ]   [I 0]
[0     (M/A)^-1  ] [0  (M/A) ] = [0 I]
```

Dacă A și M/A sunt inversabile:
```
M^-1 = [ A^-1 + A^-1 B (M/A)^-1 C A^-1     −A^-1 B (M/A)^-1 ]
       [ −(M/A)^-1 C A^-1                   (M/A)^-1        ]
```

Dacă D și M/D sunt inversabile:
```
M^-1 = [ (M/D)^-1                     −(M/D)^-1 B D^-1                  ]
       [ −D^-1 C (M/D)^-1              D^-1 + D^-1 C (M/D)^-1 B D^-1    ]
```

Dacă atât A cât și D sunt inversabile, egalând cele două expresii, se ajunge la factorizarea:
```
M^-1 = [ (M/D)^-1   0        ] [ I        −B D^-1 ]
       [ 0         (M/A)^-1  ] [ −C A^-1   I      ]
```

---

## 8. Vectori și valori proprii

Fie A ∈ C^(n×n). Un număr λ ∈ C se numește **valoare proprie** a lui A dacă există un vector nenul x ∈ C^n, numit **vector propriu** asociat valorii proprii λ, astfel încât:

**Ax = λx**

Sistemul admite soluții nenule dacă și numai dacă:

**p(λ) = det(λI_n − A) = 0**

unde p este **polinomul caracteristic** (polinom monic), iar ecuația se numește **ecuație caracteristică**. Zerourile lui p sunt valorile proprii ale lui A.

### 8.1 Spectru și rază spectrală
- **Spectrul**: λ(A) = {λ_1, λ_2, ..., λ_n}
- **Raza spectrală**: ρ(A) = max_{λ ∈ λ(A)} |λ|
- Σ_{i=1}^n λ_i = Σ_{i=1}^n A(i,i) = tr(A)
- ∏_{i=1}^n λ_i = det(A)
- Dacă A este m×n și B este n×m cu m ≤ n, atunci cele n valori proprii ale lui BA sunt cele m valori proprii ale lui AB alături de încă n−m zerouri.

### 8.2 Localizarea valorilor proprii — cercurile lui Gershgorin
(Semyon Aranovich Gershgorin, 1901–1933, mat. belarus; rezultat din 1931.)

λ(A) ⊂ ∪_{i=1}^n D_i,   unde   D_i = { z ∈ C : |z − a_ii| ≤ Σ_{j≠i} |a_ij| }

D_i sunt cercurile lui Gershgorin.

### 8.3 Matrici pozitiv definite (caracterizări)
A este semipozitiv definită dacă și numai dacă:
1. A = A* (hermitică) și are toate valorile proprii nenegative;
2. A = A* și toți minorii principali (determinanți din submatricile principale) sunt nenegativi;
3. există B a.î. A = B*B; A este pozitiv definită dacă și numai dacă B este inversabilă;
4. există T superior triunghiulară (se poate considera și cu diagonala cu elemente nenegative) a.î. A = T*T; dacă A este pozitiv definită, T este unic (**Cholesky**); A este pozitiv definită dacă și numai dacă T este nesingulară;
5. există B semipozitiv definită, unică, a.î. A = B².

### 8.4 Transformări de asemănare
Matricile A și B sunt **asemenea** dacă există T nesingulară astfel încât **B = T A T^(-1)**.
- Dacă T este ortogonală (unitară), A și B sunt asemenea ortogonal (unitar).
- Dacă A și B sunt asemenea, atunci λ(A) = λ(B); iar dacă x este vector propriu pentru A asociat unei valori proprii, atunci Tx este vector propriu pentru B, asociat aceleiași valori proprii.

**Diagonalizare**:
- Dacă A este asemenea cu o matrice diagonală, spunem că A este **diagonalizabilă**.
- Dacă A are n valori proprii distincte, atunci A este diagonalizabilă.
- Fie B suma directă a blocurilor B_1, ..., B_d (B = B_1 ⊕ ... ⊕ B_d). B este diagonalizabilă ⇔ toate B_i sunt diagonalizabile.

**Multiplicități**:
- Dacă x este vector propriu pentru A asociat lui λ_i, atunci și αx este vector propriu ⇒ vectorii proprii nu sunt unici, ci au direcție unică. Mulțimea vectorilor proprii asociați lui λ_i formează un subspațiu liniar E_i, iar dim(E_i) reprezintă **multiplicitatea geometrică** (MG) a valorii proprii λ_i.
- **Multiplicitatea algebrică** (MA) n_i este dată de multiplicitatea lui λ_i ca zero al polinomului caracteristic p. Suma multiplicităților algebrice este egală cu gradul polinomului.
- Dacă dim(E_i) = n_i pentru orice i, atunci există X nesingulară astfel încât X^(-1) A X = Λ = diag(λ_1, ..., λ_n).
- Dacă A are n vectori proprii liniar independenți, există X nesingulară cu X^(-1) A X = Λ = diag(λ_1, ..., λ_n), unde X are drept coloane vectorii proprii liniar independenți ai lui A.
- Dacă A are toate valorile proprii distincte, există X nesingulară cu X^(-1) A X = Λ.

### 8.5 Forma Jordan
(Marie Ennemond Camille Jordan, 1838–1922, mat. francez.)

În cazul general, pentru orice matrice A există X nesingulară astfel încât:

X^(-1) A X = diag(J_1, J_2, ..., J_q),   J = J_{n1}(λ_1) ⊕ J_{n2}(λ_2) ⊕ ... ⊕ J_{nq}(λ_q)

unde J_i este un bloc Jordan asociat lui λ_i (λ_i pe diagonală, 1 pe supradiagonală) având multiplicitatea algebrică n_i.

Proprietăți:
- Două matrici în formă Jordan sunt asemenea ⇔ au aceleași blocuri pe diagonala principală, nu neapărat în aceeași ordine.
- Pentru orice A există S complexă, simetrică și nesingulară astfel încât A^T = S A S^(-1).
- MG a unei valori proprii = numărul de blocuri Jordan corespunzătoare valorii proprii.
- MA a unei valori proprii = suma totală a dimensiunilor tuturor blocurilor Jordan asociate valorii proprii.
- **MG ≤ MA** pentru o anumită valoare proprie.
- Orice bloc Jordan satisface: J_k(λ) = λI_k + J_k(0), cu J_k(0)^k = 0. Deci o matrice J se poate scrie J = D + N, cu D diagonală și N nilpotentă. Prin urmare, pentru A = S J_A S^(-1):
  A = S(D + N)S^(-1) = S D S^(-1) + S N S^(-1) = A_D + A_N,
  adică A este suma a două matrici, una diagonalizabilă și una nilpotentă.
- În cazul general, cea mai simplă formă obținută prin transformări de asemănare este forma Jordan. **Atenție**: structura Jordan (numărul și dimensiunile blocurilor) este foarte sensibilă la perturbațiile numerice ale elementelor matricei; din acest motiv, calculul numeric al formei canonice Jordan este dificil și **nu este recomandat** pentru calculul valorilor proprii într-o aritmetică aproximativă.

### 8.6 Forma Schur
(Issai Schur, 1875–1941, mat. german, născut în Belarus.)

Pentru orice matrice A există T astfel încât A = T^(-1) U T, unde U este superior triunghiulară. Vectorii coloană ai matricei T reprezintă o bază pentru spațiul C^n și pot înlocui vectorii proprii ai matricei A.

**Consecință (complex)**: pentru orice A există Q unitară astfel încât Q^H A Q = S, unde S este superior triunghiulară și conține pe diagonala principală valorile proprii ale lui A.

**Consecință (real)**: pentru orice A există Q ortogonală astfel încât Q^T A Q = S, unde S este cvasi-superior triunghiulară și conține pe diagonala principală valorile proprii ale lui A; S_ii sunt matrici pătratice de ordin 1 sau 2, cu λ(A) = λ(S) = ∪_i λ(S_ii).

---

## 9. Norme

### 9.1 Norme vectoriale
O normă vectorială ‖·‖ : R^n → R^+ , x → ‖x‖, cu proprietățile:
1. ‖x‖ ≥ 0
2. ‖x‖ = 0 ⇒ x = 0
3. ‖x + y‖ ≤ ‖x‖ + ‖y‖ (inegalitatea triunghiului)
4. ‖α·x‖ = |α|·‖x‖, ∀α ∈ C

**Norma Hölder** (Otto Ludwig Hölder, 1859–1937, mat. german) este norma generală:
‖x‖_p = ( Σ_{i=1}^n |x_i|^p )^(1/p)

Particularizări:
- p = 1: ‖x‖_1 = Σ |x_i|  — **norma Napoleon** (Manhattan)
- p = 2: ‖x‖_2 = sqrt( Σ |x_i|² ) — **norma Euclid**
- p = ∞: ‖x‖_∞ = max_i |x_i|

Alte proprietăți (echivalența normelor):
- ‖x‖_2 ≤ ‖x‖_1 ≤ √n · ‖x‖_2
- ‖x‖_∞ ≤ ‖x‖_1 ≤ n · ‖x‖_∞
- ‖x‖_∞ ≤ ‖x‖_2 ≤ √n · ‖x‖_∞

### 9.2 Norme matriciale
Se definesc asemănător, cu proprietățile:
1. ‖A‖ ≥ 0
2. ‖A‖ = 0 ⇒ A = 0
3. ‖A + B‖ ≤ ‖A‖ + ‖B‖
4. ‖α·A‖ = |α|·‖A‖
5. ‖A·B‖ ≤ ‖A‖·‖B‖ — ultima proprietate se referă la **norme consistente**.

Exemple:
- **Frobenius/Euclid**: ‖A‖_F = sqrt( Σ_i Σ_j |a_ij|² )
- **Norme subordonate**: ‖A‖_p = sup_{x≠0} ‖A·x‖_p / ‖x‖_p ;  ‖A‖_pq = sup_{x≠0} ‖A·x‖_p / ‖x‖_q
- Altele:
  - ‖A‖_1 = max_j Σ_i |a_ij|  (max suma pe coloane)
  - ‖A‖_∞ = max_i Σ_j |a_ij|  (max suma pe linii)
  - ‖A‖_2 = sqrt( ρ(A A^T) ) = σ_1(A)  (norma spectrală)

Alte proprietăți:
- ‖A‖_2 ≤ ‖A‖_F ≤ √n · ‖A‖_2
- (1/√n)·‖A‖_∞ ≤ ‖A‖_2 ≤ √m · ‖A‖_∞
- (1/√m)·‖A‖_1 ≤ ‖A‖_F ≤ √n · ‖A‖_1
- |λ| ≤ ρ(A) ≤ ‖A‖  (deoarece AX = λX, unde X = [x x ... x])

---

## 10. Matrici rău condiționate și numărul de condiționare

### 10.1 Definiții
Un sistem Ax = b este **rău condiționat** atunci când, pentru mici perturbații ale lui A și b, apar mari perturbații în vectorul soluție. Invers, sistemul este **bine condiționat** când pentru mici perturbații ale lui A și b apar mici perturbații ale soluției.

Rău-condiționarea nu este o problemă când folosim precizie aritmetică infinită, dar devine o problemă cu precizie finită, deoarece erorile de rotunjire modifică elementele din A și b; la modificări mari ale soluției spunem că sistemul este rău condiționat.

### 10.2 Exemplu de sistem rău condiționat
```
x1 + x2 = 2
x1 + 1.0001·x2 = 2.0001      cu soluția x1 = 1, x2 = 1
```
Modificând coeficientul a_22 din 1.0001 în 0.9999:
```
x1 + x2 = 2
x1 + 0.9999·x2 = 2.0001      cu noua soluție x1 = 3, x2 = −1
```

### 10.3 Cum verificăm (metode euristice)
- calculăm A^(-1) și apoi A·A^(-1) și comparăm cu I_n; dacă rezultatele diferă mult, avem probabil o matrice rău condiționată;
- la fel dacă calculăm (A^(-1))^(-1) și comparăm cu A;
- dacă elementele lui A și b s-au modificat ușor, iar soluția sistemului s-a schimbat drastic, avem probabil un sistem rău condiționat;
- se mai consideră că o matrice este rău condiționată dacă modulul determinantului său este mic.

**Niciuna dintre aceste metode nu este sigură.** Cea mai sigură metodă este calcularea **Numărului de Condiționare**.

### 10.4 Numărul de condiționare (pentru SEL)
Este o măsură a senzitivității unui sistem la mici modificări ale oricărui parametru.

Pentru Ax = b avem ‖b‖ ≤ ‖A‖·‖x‖.
Dacă modificăm vectorul b cu δb, se produce o modificare δx a soluției:
A(x + δx) = b + δb ⇒ A·δx = δb ⇒ δx = A^(-1)·δb ⇒ ‖δx‖ ≤ ‖A^(-1)‖·‖δb‖.

Comparând cele două inegalități: ‖b‖·‖δx‖ ≤ ‖A‖·‖A^(-1)‖·‖x‖·‖δb‖, adică:

**‖δx‖ / ‖x‖ ≤ ‖A‖·‖A^(-1)‖ · ‖δb‖/‖b‖ = C(A) · ‖δb‖/‖b‖**

unde numărul de condiționare este:

**C(A) = ‖A‖ · ‖A^(-1)‖**

Analog, pentru o modificare a lui A cu δA:

**‖δx‖ / ‖x + δx‖ ≤ C(A) · ‖δA‖/‖A‖**

Interpretare: dacă C(A) este un număr cu o singură zecimală (mic), matricea A este bine condiționată; dacă C(A) este un număr mare, A este rău condiționată.

---

## 11. Probleme de laborator

1. Pentru matricea de mai jos, determinați matricele L și U folosind **metoda Crout**:
```
[ 1   2   3 ]
[ 2   8  11 ]
[ 3  22  42 ]
```
2. Pentru matricea de la exercițiul anterior aplicați factorizarea **Doolittle**.
3. Pentru matricea A aplicați factorizarea **Cholesky**:
```
[ 4   2   1 ]
[ 2   6  -2 ]
[ 1  -2   5 ]
```
4. Scrieți două funcții în MATLAB care să rezolve un sistem de ecuații superior triunghiular, respectiv inferior triunghiular. Prototipuri:
```matlab
function x = superior(U, b)
function x = inferior(U, b)
```
5. Scrieți o funcție în MATLAB pentru fiecare din cele 3 descompuneri studiate (Crout, Doolittle, Cholesky).
6. Calculați inversa pentru matricea:
```
[ 4  0  0  0 ]
[ 0  0  2  0 ]
[ 0  1  2  0 ]
[ 1  0  0  1 ]
```

### Obiectivele laboratorului
În urma parcurgerii laboratorului, studentul va fi capabil să:
- factorizeze o matrice folosind una dintre metodele LU: Crout, Doolittle, Cholesky;
- rezolve recursiv un sistem triunghiular.

---

## 12. Bibliografie

- Joe D. Hoffman, *Numerical Methods for Engineers and Scientists*, 2nd edition, Marcel Dekker, 2001.
- Roger A. Horn, Charles R. Johnson, *Matrix Analysis*, 2nd edition, Cambridge, 2012.
- J. Schur, *Über Potenzreihen, die im Innern des Einheitskreises beschränkt sind*, Journal für die reine und angewandte Mathematik, 147:205–232, 1917.

---

### Notă privind elementele repetitive eliminate
Din PDF-uri s-au omis, fiind repetate pe fiecare slide/pagină: antetul de dată „3/26/2015", subsolul „MN Primăvara 2015 CS-UPB", logourile, titlurile repetate de slide („Tipuri de matrici", „Vectori si Valori proprii", „Norme", „Despre Norme", „Factorizarea LU"), lista echipei de profesori/asistenți, precum și subsolul de laborator „Facultatea de Automatică și Calculatoare, Politehnica București — Pagina X din 8" și cuprinsul cu numere de pagină. Definițiile factorizărilor Crout/Doolittle/Cholesky apăreau în ambele documente și au fost unificate în secțiunea 5.

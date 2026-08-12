# Metode Numerice (CS-UPB) — Ortogonalitate

Conținut consolidat din: slide-urile de curs "Transformari ortogonale / Polinoame ortogonale" (MN Primavara 2015) + suportul de laborator "Ortogonalitate. Transformări și proiecții ortogonale. Polinoame ortogonale" (2025). Informația repetată în ambele surse apare o singură dată.

## Obiectivele laboratorului

Studentul va fi capabil să:
- definească noțiunile de vectori ortogonali și matrice ortogonală;
- aplice metode de transformare ortogonală: Householder și Givens;
- implementeze procesul Gram-Schmidt;
- folosească polinoame ortogonale în aproximarea funcțiilor.

---

## 1. Norme

Fie V spațiu vectorial peste corpul K. O normă este o funcție `||·||: V → R` cu proprietățile, pentru orice x, y ∈ V și α ∈ K:
- `||x|| ≥ 0` și `||x|| = 0 ⇔ x = 0` (pozitiv definită);
- `||αx|| = |α|·||x||`;
- `||x + y|| ≤ ||x|| + ||y||` (inegalitatea triunghiului).

### 1.1 Norme vectoriale
- **Valoarea absolută** — normă pe R sau C. Numerele complexe formează un spațiu unidimensional peste C și bidimensional peste R.
- **Distanța Manhattan**: `||x||₁ := Σᵢ |xᵢ|`
- **Norma euclidiană**: `||x||₂ := sqrt(x₁² + x₂² + ... + xₙ²)`. Pentru complexe, C se identifică cu R².
- **Norma infinit**: `||x||∞ := maxᵢ |xᵢ|`
- **Norma p**: `||x||ₚ := (Σᵢ |xᵢ|^p)^(1/p)`. Toate normele de mai sus sunt cazuri particulare ale normei p.

### 1.2 Norme matriceale

Multe norme matriceale sunt **submultiplicative**: `||AB|| ≤ ||A||·||B||`.

**Norma p matriceală** (indusă de norma p a vectorilor):
`||A||ₚ := max_{x≠0} ||Ax||ₚ / ||x||ₚ = max_{||x||=1} ||Ax||ₚ`

- **p = 1**: `||A||₁ := max_j Σᵢ |aᵢⱼ|` — suma maximă a valorilor absolute **pe coloane**.
- **p = 2 (norma spectrală)**: `||A||₂ := sqrt(λmax(A*A))` — rădăcina pătrată a celei mai mari valori proprii a lui A*A; egală cu cea mai mare valoare singulară a lui A.
  - *Demonstrație*: fie B = A*A. B este simetrică, deci din teorema spectrală avem o bază ortonormată de vectori proprii vᵢ cu valori proprii λᵢ. Fie v = Σᵢ αᵢvᵢ cu ||v|| = 1. Atunci
    `||Av||₂² = ⟨Av, Av⟩ = ⟨v, A*Av⟩ = ⟨Σαᵢvᵢ, Σαᵢλᵢvᵢ⟩ = Σᵢ λᵢαᵢ²`.
    Cu constrângerea ||v|| = 1 ⟹ Σᵢ αᵢ² = 1 ⟹ ||A||₂ = λmax(B). ∎
- **p = ∞**: `||A||∞ := maxᵢ Σⱼ |aᵢⱼ|` — suma maximă a valorilor absolute **pe rânduri**.
- **Norma Frobenius**: `||A||_F := sqrt(Σᵢⱼ |aᵢⱼ|²) = sqrt(trace(A*A))`

Pentru orice normă matriceală submultiplicativă:
`ρ(A) ≤ ||A^k||^(1/k)`, iar `lim_{k→∞} ||A^k||^(1/k) = ρ(A)`

- *Demonstrație*: fie λ valoarea proprie cea mai mare a lui A și v un vector propriu asociat. Atunci `||A|| ≥ ||Av||/||v|| (∀v) = ||λv||/||v|| = |λ| ⟹ ρ(A) ≤ ||A||`. ∎

**Interpretare**: normele matriceale induse de vectori măsoară cât de mult se dilată un vector când i se aplică o transformare liniară.

**Exemple grafice din laborator** (aplicare pe cercul vectorilor unitate):
- Figura 1: vectorii unitate (cerc de rază 1).
- Figura 2: transformarea `A1 = [3 2; 1 4]` — cercul devine o elipsă (dilatare, matrice neortogonală).
- Figura 3: transformarea `A2 = [cos(π/7) −sin(π/7); sin(π/7) cos(π/7)]` — toți vectorii sunt rotiți cu π/7, nimic altceva nu se modifică; norma rămâne aceeași, deci graficele coincid (matrice ortogonală).
- Figura 4: `A3 = 2·A2` — matrice neortogonală, cercul se dilată la rază 2.

---

## 2. Produs scalar

Produsul scalar pe un spațiu vectorial V peste F este o funcție `⟨·,·⟩: V × V → F` cu proprietățile, pentru orice x, y, z ∈ V și α ∈ F:
- `⟨x, y⟩ = conj(⟨y, x⟩)` (conjugare simetrică);
- `⟨αx + βy, z⟩ = α⟨x, z⟩ + β⟨y, z⟩` (liniaritate);
- `⟨x, x⟩ ≥ 0` și `⟨x, x⟩ = 0 ⇔ x = 0` (pozitivitate).

Consecințe:
- `⟨x, αy + βz⟩ = conj(α)⟨x, y⟩ + conj(β)⟨x, z⟩`;
- `⟨x + y, x + y⟩ = ⟨x, x⟩ + 2·Re(⟨x, y⟩) + ⟨y, y⟩`;
- inegalitatea Cauchy-Schwarz: `|⟨x, y⟩| ≤ ||x||₂·||y||₂`.

Orice produs scalar induce o normă: `||x|| = sqrt(⟨x, x⟩)`.

Într-un spațiu euclidian, `⟨x, y⟩ = xᵀy` (în notația de curs, **produsul euclidian** pentru x, y ∈ Cⁿ este `⟨x, y⟩ = y*x`). Norma euclidiană a unui vector complex x este valoarea reală `||x||₂ = sqrt(⟨x, x⟩)`.

### 2.1 Proiecții

**Teoremă.** `⟨x, y⟩ = uᵀv = ||u||·||v||·cos(θ)`, unde θ este unghiul dintre cei doi vectori.

*Demonstrație*: fie r = u − v. Din teorema cosinusului:
```
||r||² = ||u||² + ||v||² − 2||u||||v||cos(θ)
||u − v||² − ||u||² − ||v||² = −2||u||||v||cos(θ)
−2 Σᵢ uᵢvᵢ = −2||u||||v||cos(θ)
Σᵢ uᵢvᵢ = ||u||||v||cos(θ)   ∎
```

Proiecția lui x pe y (notată x_y) se construiește astfel:
- norma proiecției este `||x||cos(θ)`;
- direcția este dată de normalizarea lui y: `y/||y||`.

**Operatorul de proiecție**:
```
proj_y x = (||x||cos(θ)/||y||)·y = (||y||||x||cos(θ)/||y||²)·y = (⟨x,y⟩/⟨y,y⟩)·y
```

*Interpretare geometrică a produsului scalar*: produsul dintre norma proiecției pe un vector și norma vectorului pe care se proiectează.

---

## 3. Vectori ortogonali. Matrice unitară/ortogonală

Doi vectori x, y ∈ Rⁿ sunt **ortogonali** dacă `xᵀy = 0` (direcții perpendiculare). Dacă în plus `||x||₂ = ||y||₂ = 1`, sunt **ortonormați**.

Generalizat: vectorii v1, ..., vn sunt ortogonali dacă `vᵢᵀvⱼ = 0` pentru orice i ≠ j; sunt ortonormali dacă în plus `vᵢᵀvᵢ = 1` pentru orice i.

- Orice listă de vectori ortonormali este liniar independentă.
- Orice listă de vectori ortogonali, diferiți de vectorul zero, este liniar independentă.
- O bază se numește ortogonală / ortonormată dacă vectorii ei sunt ortogonali / ortonormați.

O matrice A ∈ C^{n×n} se numește **unitară** dacă `A*A = AA* = Iₙ` (A* = conjugata transpusă). Dacă A este reală, se numește **ortogonală**: `AᵀA = AAᵀ = Iₙ`. Sunt folosite intens în descompunerea QR și în descompunerea valorilor singulare (SVD).

**Proprietăți ale unei matrice unitare/ortogonale H (sau A):**
- coloanele (rândurile) formează o bază ortonormată a spațiului Cⁿ / Rⁿ;
- norma vectorilor coloană (rând) este 1;
- `A⁻¹ = A*` (în real: `H⁻¹ = Hᵀ`);
- este normală: `A*A = AA*`;
- valorile proprii se află pe cercul unitate;
- vectorii proprii sunt ortogonali;
- `det(A) = ±1`;
- `||A||₂ = 1` (norma euclidiană subordonată este 1);
- conservă produsul scalar: `(Ax)*(Ay) = x*A*Ay = x*y`;
- conservă norma euclidiană a unui vector: `||Hx||₂ = ||x||₂`;
- conservă norma euclidiană (Frobenius) a unei matrice: `||H·A||_F = ||A||_F`;
- dacă U, V sunt unitare (ortogonale în R), atunci și UV este unitară (ortogonală în R).

**Interpretare geometrică**: matricile ortogonale sunt rotații, reflexii, permutări, identități sau combinații ale acestora.

---

## 4. Procesul Gram-Schmidt

Din orice listă de vectori liniar independenți S se poate obține o listă de vectori ortonormali cu **același span**:
`span(S) = { Σ_{i=1..k} λᵢvᵢ | k ∈ N, vᵢ ∈ S, λᵢ ∈ K }`

Procesul se poate face în multe moduri, dar există un proces sistematizat: **Gram-Schmidt** (Jørgen Pedersen Gram, 1850–1916, matematician danez; Erhard Schmidt, 1876–1959, matematician german).

Dacă v1, ..., vn sunt liniar independenți, GS produce o listă ortonormată z1, ..., zn (echivalent q1, ..., qn) cu `span{v1,...,vk} = span{z1,...,zk}` pentru orice k = 1..n:

```
y1 = v1;                                z1 = y1/||y1||
y2 = v2 − ⟨v2, z1⟩z1;                   z2 = y2/||y2||
...
yk = vk − ⟨vk, z_{k−1}⟩z_{k−1} − ⟨vk, z_{k−2}⟩z_{k−2} − ... − ⟨vk, z1⟩z1
zk = yk/||yk||
```

Formulare echivalentă (laborator): `u1 = v1`, `q1 = u1/||u1||`, iar pentru fiecare vk se elimină componentele paralele față de vectorii ortonormați anteriori:
`uk = vk − Σ_{i=1}^{k−1} (⟨vk, qi⟩/⟨qi, qi⟩)·qi`, apoi `qk = uk/||uk||`.

**Legătura cu QR**: dacă Z = [z1 ... zn] și X = [x1 ... xn], procesul GS produce factorizarea `X = ZR`, unde R este nesingulară și superior triunghiulară. Aplicarea GS pe vectorii coloană ai unei matrice produce descompunerea QR.

Dacă x1,...,xk sunt deja ortonormali și x1,...,xk,x_{k+1},...,xn sunt liniar independenți, GS obține x1,...,xk,z_{k+1},...,zn ortonormali (nu strică prefixul deja ortonormat).

### 4.1 Stabilitatea numerică

În practică, Gram-Schmidt clasic este **numeric instabil** din cauza erorilor de rotunjire: scăderile succesive din calculul lui uk introduc erori de precizie, iar vectorii rezultați nu mai sunt exact ortogonali.

Soluția (**Gram-Schmidt modificat**) este ortogonalizarea "pe rând", ortogonalizând și erorile. Pornind de la v1, ..., vn:
- scădem din toți vectorii vᵢ componentele paralele pe v1 ⟹ v1, v2⁽¹⁾, ..., vn⁽¹⁾;
- toți fiind ortogonali pe v1, continuăm scăzând componentele paralele pe v2⁽¹⁾ ⟹ v1, v2⁽¹⁾, v3⁽²⁾, ..., vn⁽²⁾;
- se continuă procesul pentru toți vectorii.

```
Algorithm 3: Algoritmul Gram-Schmidt modificat
1: [ , n] ← dimensiunea matricei A
2: R ← matricea 0 de dimensiune n × n
3: Q ← A
4: Q(:,1) ← A(:,1)/norm(A(:,1))
5: R(1,:) ← Q(:,1)ᵀ · A
6: for i = 1, n−1 do
7:     for j = i+1, n do
8:         Q(:,j) ← Q(:,j) − (Q(:,j)ᵀ · Q(:,i)) · Q(:,i)
9:     end for
10:    Q(:,i+1) ← Q(:,i+1)/norm(Q(:,i+1))
11:    R(i+1,:) ← Q(:,i+1)ᵀ · A
12: end for
```

---

## 5. Transformări ortogonale. Descompunerea QR

**Definiție.** Fie T : V → V o transformare liniară. T este ortogonală ⟺ `⟨T(x), T(y)⟩ = ⟨x, y⟩`.

**Utilitate**: în cazul sistemelor liniare putem aplica o serie de transformări ortogonale pentru a introduce 0-uri în matricea sistemului. La final, aflarea soluției se reduce la rezolvarea unui sistem triunghiular. Matricea are forma `A = QR`, cu Q ortogonală și R superior triunghiulară:

`Ax = b ⟺ QRx = b ⟺ Rx = Q*b`

Ne dorim să aducem vectori de la forma `[x; y]` la forma `[x'; 0]`. Aplicăm o serie de transformări ortogonale pentru a aduce A la R:

```
Qn ... Q2 Q1 A = R
A = Q1* Q2* ... Qn* R  ⟹  Q = Q1 Q2 ... Qn
```

Echivalent, în notația de curs: `Hn...H2H1A = R_H` sau `Gn...G2G1A = R_G`, unde matricile Hᵢ, Gᵢ sunt ortogonale, deci inversele lor sunt transpusele. Înmulțind cu inversele la stânga:

```
A = (Hn...H2H1)⁻¹ R_H   sau   A = (Gn...G2G1)⁻¹ R_G
echivalent
A = (H1)⁻ᵀ(H2)⁻ᵀ...(Hn)⁻ᵀ R_H   sau   A = (G1)⁻ᵀ(G2)⁻ᵀ...(Gn)⁻ᵀ R_G
```

Notând produsul inverselor transformatelor cu Q: `A = Q_H R_H` sau `A = Q_G R_G`, unde Q sunt ortogonale și R superior triunghiulare. **Deci transformările ortogonale pot fi privite și ca factorizări QR.**

---

## 6. Reflexii. Transformarea Householder

(Alston Scott Householder, 1904–1993, matematician american)

**Definiție (curs).** Fie w ∈ Rⁿ cu `wᵀw = 1`. Matricea n×n `H = Iₙ − 2wwᵀ` se numește transformare Householder (matrice Householder). Pentru a evita condiția wᵀw = 1 se poate alege `H = Iₙ − 2wwᵀ/(wᵀw)`.

**Proprietăți:**
- H este simetrică și ortogonală (unitară și hermitică);
- H are valorile proprii 1 și −1 — de fapt o singură valoare proprie −1 (prima) și restul 1;
- `det(H) = −1`;
- orice vector real x poate fi transformat de o matrice Householder reală în orice vector real y, cu `||x|| = ||y||` (norma euclidiană).

### 6.1 Derivarea reflectorului (laborator)

Căutăm o transformare P astfel încât `Pv = ||v||e`, unde e este un vector din baza canonică. Pentru reflexie alegem un vector d care dă *direcția de reflexie*, cu `||d||₂ = 1`:

```
v' = −proj_d(v) = −(⟨v,d⟩/⟨d,d⟩)d
v' = −v*d·d = −d d* v  ⟹
Pv = v + 2v' = v − 2dd*v
P = I − 2dd*
```

Dacă d nu are norma 1, forma generală a reflectorului Householder prin normalizare este:
`P = I − 2·(d dᵀ)/(dᵀd)`

**Afirmație.** P este ortogonală.
*Demonstrație*: `PᵀP = (I − 2dd*)*(I − 2dd*) = I − 2dd* − 2dd* + 4dd*dd* = I − 4dd* + 4dd* = I`. ∎

### 6.2 Cum găsim d pentru a introduce 0-uri

Cum P este ortogonală, `||Pv||₂ = ||v||₂`, deci ne dorim `Pv = ±||v||₂e1`:
```
v + d = Pv
v + d = ±||v||₂e1
d = −v ± ||v||₂e1   (semnul lui d nu contează) ⟹ d = v ± ||v||₂e1
```

**Plus sau minus?** Analiză numerică: este bine ca Pv și v să fie *depărtate*. Dacă v este deja foarte aproape de axe, e posibil ca Pv să ajungă chiar mai departe; dacă v și reflexia sa sunt depărtate, eroarea poate fi neglijabilă. Ne dorim ca `||v − α||v||₂e1||₂` să fie maximă, α = ±1 (caz real):

```
||v − α||v||₂e1||² = (v − α||v||₂e1)ᵀ(v − α||v||₂e1)
                   = vᵀv − 2α||v||₂ vᵀe1 + α²||v||₂² e1ᵀe1
                   = vᵀv − 2α||v||₂ v1 + ||v||₂²
```
Cum vᵀv și ||v||₂² sunt constante, maximizăm −α||v||₂v1, adică −αv1. Cum α ∈ {−1, +1}, rezultă `α = −sign(v1)`.

**Concluzie:** `d = v + sign(v1)·||v||₂·e1`

**Experiment (Figura 5 din laborator).** Grafic al `||A − QR||₂/||A||₂` pe 1000 de teste (1000 de puncte). În fiecare test s-a generat o matrice 3×3 aleatorie, cu prima coloană înlocuită cu `[1 δ 0]ᵀ`, unde δ ia 17 valori între 10⁻¹⁶ și 1 [2]. Albastru = semnul ales ca mai sus, roșu = semnul opus. Se observă că eroarea relativă este, în medie, mai mică atunci când alegem semnul bine.

### 6.3 Anulare catastrofală

Având precizie limitată în calculul numeric, diferența a două aproximări ale unor numere foarte apropiate poate duce la o aproximare foarte rea.

*Demonstrație*: fie aproximările x̄ și ȳ, cu erorile relative ϵx = (x−x̄)/x și ϵy = (y−ȳ)/y:
```
x̄ = x(1 + ϵx)
ȳ = y(1 + ϵy)
x̄ − ȳ = x(1+ϵx) − y(1+ϵy) = x − y + xϵx − yϵy
       = x − y + (x−y)ϵxy,  unde ϵxy = (xϵx − yϵy)/(x − y)
       = (x − y)(1 + ϵxy)
```
Numitorul lui ϵxy este foarte mic dacă x ≈ y, deci eroarea devine foarte mare. ∎

### 6.4 "Umplerea" cu 0-uri a vectorului d

Putem umple vectorul d cu 0-uri în locurile unde nu vrem ca vectorii să fie afectați. De exemplu, în 3 dimensiuni, dacă vrem 0 **doar** pe poziția 3:

```
d = [0;  v2 + sign(v2)||v'||₂;  v3]      cu v' = [v2; v3]
sau
d = [v1 + sign(v1)||v'||₂;  0;  v3]      cu v' = [v1; v3]
```

### 6.5 Exemplu QR cu Householder

Fie `A1 = [2 4 5; 1 −1 1; 2 1 −1]`. Vrem Q ortogonală și R superior triunghiulară cu A = QR.

**Iterația 1** — 0-uri pe pozițiile (2,1) și (3,1):
```
v = [2; 1; 2],  ||v||₂ = 3,  d = [2 + sign(2)*3; 1; 2] = [5; 1; 2],  ||d||₂² = 30

H1 = I3 − 2(ddᵀ)/(dᵀd) = I3 − (1/15)[5;1;2][5 1 2]
   = I3 − (1/15)[25 5 10; 5 1 2; 10 2 4]
   = (1/15)[−10 −5 −10; −5 14 −2; −10 −2 11]

A2 = H1·A1 = [−3 −3 −3; 0 −12/5 −3/5; 0 −9/5 −21/5]
```

**Iterația 2** — 0 pe poziția (3,2):
```
v = [−12/5; −9/5],  ||v||₂ = 3
d = [0; −12/5 + sign(−12/5)*3; −9/5] = [0; −27/5; −9/5] = −(9/5)[0; 3; 1],  ||d||₂² = 162/5

H2 = I3 − 2(ddᵀ)/(dᵀd) = I3 − (1/5)[0 0 0; 0 9 3; 0 3 1]
   = (1/5)[1 0 0; 0 −4 −3; 0 −3 4]

A3 = H2·A2 = [−3 −3 −3; 0 3 3; 0 0 −3]
```

A3 este matricea R, iar `Q = H1ᵀH2ᵀ = H1H2` este matricea ortogonală.

```
Algorithm 1: Descompunerea QR cu Householder
1: [m, n] ← dimensiunea matricei A
2: Q ← matricea identitate de dimensiune m × m
3: for i = 1, min(m−1, n) do
4:     v ← vector plin de 0 de dimensiune m
5:     v(i:m) ← A(i:m, i)
6:     v(i) ← v(i) + sign(v(i)) × norm(v)
7:     v ← v/norm(v)
8:     H ← I − 2 × (v · vᵀ)
9:     Q ← H · Q
10:    A ← H · A
11: end for
```

### 6.6 Householder pentru triangularizare și tridiagonalizare (curs)

**Triangularizare.** Fie A o matrice m×n; atunci există H m×m ortogonală astfel încât `HA = R`, unde R este m×n superior triunghiulară. Formulele pe pas p:

```
Hp = Iₙ − 2·(vp vpᵀ)/(vpᵀ vp)
vp = [0 ... 0  v_pp ... v_mp]ᵀ
σp = sign(a_pp)·sqrt(Σ_{i=p}^{m} a_ip²)
v_pp = a_pp + σp,   v_ip = a_ip pentru i > p
A_{p+1} = Hp·Ap,  A1 = A
HA = Hn...H2H1A
```

**Tridiagonalizarea unei matrice simetrice A.** Metoda constă, la fiecare pas, în a găsi matricea Hk care face zero sub a doua diagonală. Inițial se caută H1 astfel încât A2 = H1·A·H1 să aibă zero în prima coloană de la linia 3 în jos; pentru că înmulțim cu H1 și la dreapta, se obține 0 și pe prima linie de la coloana 3.

Pentru k = 1, 2, ..., n−2:
```
α = −sgn(a_{k+1,k}^{(k)}) · ( Σ_{j=k+1}^{n} (a_{jk}^{(k)})² )^{1/2}
r = ( (1/2)α² − (1/2)α·a_{k+1,k}^{(k)} )^{1/2}
w1^{(k)} = w2^{(k)} = ... = wk^{(k)} = 0
w_{k+1}^{(k)} = (a_{k+1,k}^{(k)} − α)/(2r)
wj^{(k)} = a_{jk}^{(k)}/(2r),   j = k+2, k+3, ..., n
P^{(k)} = I − 2 w^{(k)}(w^{(k)})ᵀ
A^{(k+1)} = P^{(k)} A^{(k)} P^{(k)}
```
Se continuă până când A = A_{n−1} devine tridiagonală:
`A^{(n−1)} = P^{(n−2)}P^{(n−3)}...P^{(1)} A P^{(1)}...P^{(n−3)}P^{(n−2)}`

---

## 7. Rotații Givens

(James Wallace Givens, 1910–1993)

**Definiție (curs).** O matrice G care diferă de matricea unitate în cel mult patru elemente, de forma `gii = gjj = cos θ` și `gij = −gji = sin θ`, pentru un anume θ și i ≠ j, se numește **matrice de rotație** (matrice de rotație plană).

- `GA` diferă de A doar pe rândurile i și j;
- `AG` diferă de A doar pe coloanele i și j;
- orice matrice de rotație G este ortogonală, pentru orice pereche i < j și orice θ ∈ [0, 2π);
- `G(θ, i, j)⁻¹ = G(−θ, i, j)`.

### 7.1 Justificare prin numere complexe (laborator)

Orice număr complex a + bi se identifică cu vectorul `[a; b] ∈ R²`. Înmulțirea cu un alt complex c + di este echivalentă cu înmulțirea vectorului cu matricea `[c −d; d c]`.

Știind că `(cos α + i sin α)(cos β + i sin β) = cos(α+β) + i sin(α+β)` și că orice complex se scrie `r(cos β + i sin β)`, deducem că înmulțirea cu `[cos θ −sin θ; sin θ cos θ]` rotește vectorii cu unghiul θ în sens trigonometric. Această matrice este ortogonală:
`[cos θ sin θ; −sin θ cos θ]·[cos θ −sin θ; sin θ cos θ] = I`
Cum `−sin θ = sin(−θ)`, prima matrice este o rotație cu −θ.

### 7.2 Calculul lui c și s

Ca și la Householder, vrem `[x; y] → [x'; 0]`. Fiind transformare ortogonală, norma se păstrează, deci `x' = sqrt(x² + y²)`. Nu avem nevoie de unghi, ci doar de cos și sin:

```
[cos θ −sin θ; sin θ cos θ]·[x; y] = [x cos θ − y sin θ; y cos θ + x sin θ] = [sqrt(x²+y²); 0]
⟹ cos θ = x/sqrt(x²+y²),   sin θ = −y/sqrt(x²+y²)
```

Formularea echivalentă din curs: pentru ca `GA_ji = 0`, din `ga_ji = a_ii·sin θ_ji + a_ji·cos θ_ji = 0` rezultă `tg θ_ji = −a_ji/a_ii`, `ρ = sqrt(a_ii² + a_ji²)`, `cos θ_ij = a_ii/ρ`, `sin θ_ij = −a_ji/ρ`.

### 7.3 Matricea Givens pentru dimensiuni mari

Vrem G astfel încât `G·[a ... x ... y ... z]ᵀ = [a ... x' ... 0 ... z]ᵀ`.

G seamănă foarte mult cu matricea identitate: este identitate mai puțin elementele `G(i,i) = G(j,j) = c`, `G(i,j) = s`, `G(j,i) = −s`, unde i și j sunt pozițiile pe care se găsesc y, respectiv x. Deci **i indică mereu poziția elementului din vector pe care vrem să îl facem 0**. Regulă bună la descompunerea QR: (i, j) să fie fix poziția elementului din matrice pe care vrem să îl anulăm.

Forma generală (structura Gi,j = G(θ,i,j) pentru i<j): identitate, cu cos θ pe pozițiile (i,i) și (j,j), −sin θ pe (i,j) și sin θ pe (j,i).

**Diferență față de Householder**: la fiecare pas se elimină elementele de sub diagonala principală aplicând câte o transformare Givens (matrice diferită de fiecare dată) **pentru fiecare element**; la Householder aplicăm o transformare și eliminăm toate elementele de sub pivot.

`G = (G_{n−1,n} · G_{n−2,n} · G_{n−2,n−1}) ... (G_{1n} · G_{1,n−1} ... G_{12})`, grupate ca G_{n−1}, G_{n−2}, ..., G_1.

### 7.4 Exemplu QR cu Givens

Fie `A1 = [0 1 2; 3 2 0; 4 1 5]`.

**0 pe poziția (3,1):**
```
(i,j) = (3,1), x = 0, y = 4, r = sqrt(0² + 4²) = 4, c = x/r = 0, s = −y/r = −1
G1 = [0 0 1; 0 1 0; −1 0 0]
A2 = G1·A1 = [4 1 5; 3 2 0; 0 −1 −2]
```

**0 pe poziția (2,1):**
```
(i,j) = (2,1), x = 4, y = 3, r = 5, c = 4/5, s = −3/5
G2 = [4/5 3/5 0; −3/5 4/5 0; 0 0 1]
A3 = G2·A2 = [5 2 4; 0 1 0; 0 −1 −2]
```

**0 pe poziția (3,2):**
```
(i,j) = (3,2), x = 1, y = −1, r = sqrt(2), c = sqrt(2)/2, s = sqrt(2)/2
G3 = [1 0 0; 0 sqrt(2)/2 −sqrt(2)/2; 0 sqrt(2)/2 sqrt(2)/2]
A4 = G3·A3 = [5 2 4; 0 sqrt(2) 0; 0 0 −sqrt(2)]
```

Deci `R = A4` și `Q = G1ᵀG2ᵀG3ᵀ`.

**Observație (Householder vs. Givens).** Față de Householder, s-au folosit mai multe matrici. În medie, numărul de reflexii este egal cu numărul de coloane, iar numărul de rotații este cu un ordin de mărime mai mare, mai ales dacă matricea inițială nu este pătratică.

**Avantajul rotațiilor Givens**: sunt mult mai paralelizabile. O rotație G(i,j) afectează doar liniile i și j ale matricei, deci mai multe rotații se pot calcula în paralel. **Regulă**: Householder pentru matrici dense, Givens pentru matrici rare.

```
Algorithm 2: Descompunerea QR cu Givens
1: [m, n] ← dimensiunea matricei A
2: Q ← matricea identitate de dimensiune m × m
3: for i = 1, n do
4:     for j = m, i+1 do
5:         if A(j,i) ≠ 0 then
6:             G ← matricea identitate de dimensiune m × m
7:             r ← norm([A(j,i); A(i,i)])
8:             G(j,i) ← −A(j,i)/r
9:             G(i,j) ← −G(j,i)
10:            G(i,i) ← G(j,j) ← A(i,i)/r
11:            Q ← G · Q
12:            A ← G · A
13:        end if
14:    end for
15: end for
16: Q ← Qᵀ
```

### 7.5 Householder despre Givens (notă istorică din curs)

Din articolul *"Unitary Triangularization of a Nonsymmetric Matrix"*, Alston S. Householder, Oak Ridge National Laboratory:

O metodă pentru inversarea unei matrice nesimetrice, datorată lui J. W. Givens, era în uz la Oak Ridge și s-a dovedit foarte stabilă numeric, dar necesita un număr destul de mare de operații aritmetice, incluzând circa n(n−1)/2 radicali. Forma triunghiulară se obținea printr-o secvență de n(n−1)/2 rotații plane, al căror produs este o matrice ortogonală. Fiecare rotație necesită extragerea unui radical.

Scopul notei lui Householder este că același rezultat se poate obține cu mai puține operații aritmetice — în particular, pentru inversarea unei matrice pătratice de ordin n sunt necesari cel mult 2(n−1) radicali în loc de n(n−1)/2. Pentru n > 4, aceasta reprezintă o economie de (n−4)(n−1)/4 radicali.

După cel mult n−1 pași, matricea A este triangularizată: `U = U_{n−1}U_{n−2}...U_1`, `UA = R`.

Dacă matricea `A = (a1, a2, ..., an)` este scalată inițial astfel încât `||aᵢ|| ≤ 1` pentru fiecare i, atunci toate elementele rămân în interval pe tot parcursul triangularizării, deoarece o transformare unitară lasă norma euclidiană invariantă. Astfel nu apar probleme de scalare în triangularizarea propriu-zisă; în plus, când se formează R⁻¹, dacă se aplică o scalare similară prin înmulțire cu matricile Uᵢ pentru a forma A⁻¹, doar la formarea lui R⁻¹ poate fi necesară o scalare intermediară.

---

## 8. Polinoame ortogonale

Dacă vᵢ este un șir de vectori liniar independenți, atunci există un șir de vectori uᵢ ortonormați cu `span{vᵢ} = span{uᵢ}` (construiți de exemplu cu GS). La fel se întâmplă și la polinoame: înlocuim șirul vᵢ cu polinoamele `{1, x, x², ..., xⁿ}`, din care obținem un șir de polinoame ortogonale `{p0, p1, ..., pn}`.

Polinoamele definesc un spațiu vectorial (baza `1, x, x², ..., xⁿ` generează orice polinom), căruia îi putem atașa un produs scalar. Când vorbim de ortogonalitate ne referim mereu la **un anumit produs scalar**. Pe cât la vectori produsul scalar era o sumă a produselor componentelor, analog aici este integrala:

```
⟨g, h⟩ = ∫_a^b g(x)h(x)w(x) dx        (caz continuu)
⟨g, h⟩ = Σ_{i=1}^{n} g(xᵢ)h(xᵢ)w(xᵢ)  (caz discret)
```

`w(x)` este o funcție pozitivă, numită **funcție de pondere**. O familie de polinoame ortogonale se definește **în mod unic** în raport cu intervalul de definiție [a, b] și funcția pondere w(x). În funcție de polinoamele pe care vrem să le obținem, alegem funcția de pondere.

### 8.1 Relații de recurență

Anumite produse scalare satisfac relația de simetrie `⟨xf, g⟩ = ⟨f, xg⟩`; în acest caz șirul polinoamelor ortogonale se deduce din relațiile:

```
p0(x) = 1
p1(x) = x − α0
p_{k+1}(x) = (x − αk)pk(x) − βk·p_{k−1}(x),      k = 1 : n−1

αk = ⟨x·pk, pk⟩ / ||pk||²,      k = 0 : n−1
βk = ||pk||² / ||p_{k−1}||²,     k = 1 : n−1
```

Pentru un polinom `pn(x) = a_nn·xⁿ + a_{n−1,n}·x^{n−1} + a_0n` care este **ortonormat**, avem relația:

```
(a_nn/a_{n+1,n+1})·p_{n+1}(x) + ( a_{n−1,n}/a_nn − a_{n,n+1}/a_{n+1,n+1} − x )·pn(x) + (a_{n−1,n−1}/a_nn)·p_{n−1}(x) = 0
```

iar dacă este doar **ortogonal**:

```
(a_nn/a_{n+1,n+1})·p_{n+1}(x) + ( a_{n−1,n}/a_nn − a_{n,n+1}/a_{n+1,n+1} − x )·pn(x) + (a_{n−1,n−1}/a_nn)·(||pn||²/||p_{n−1}||²)·p_{n−1}(x) = 0
```

### 8.2 Polinoame des utilizate

| Familie | Recurență | Inițializare |
|---|---|---|
| Cebâșev (Chebyshev) | `T_{n+1} − 2x·T_n + T_{n−1} = 0` | `T0 = 1, T1 = x` |
| Legendre | `(n+1)L_{n+1} − (2n+1)x·L_n + n·L_{n−1} = 0` | `L0 = 1, L1 = x` |
| Laguerre | `G_{n+1} − (2n+1−x)G_n + n²G_{n−1} = 0` | `G0 = 1, G1 = 1 − x` |
| Hermite | `H_{n+1} − 2x·H_n + 2n·H_{n−1} = 0` | `H0 = 1, H1 = 2x` |

Autori: Pafnuty Lvovich Chebyshev (1821–1894, mat. rus); Adrien-Marie Legendre (1752–1833, mat. francez); Edmond Nicolas Laguerre (1834–1886, mat. francez); Charles Hermite (1822–1901, mat. francez).

**Interval și pondere:**
- **Legendre**: `w(x) = 1`, `[a,b] = [−1, 1]`
- **Laguerre**: `w(x) = e^{−x}`, `[a,b] = (0, ∞)`
- **Hermite**: `w(x) = e^{−x²}`, `[a,b] = (−∞, ∞)`
- **Chebyshev**: `w(x) = 1/sqrt(1 − x²)`, `[a,b] = (−1, 1)`

### 8.3 Proprietăți ale polinoamelor ortogonale

- Rădăcini reale distincte situate în [a, b];
- Mențin proprietatea de ortogonalitate cu orice polinom (neortogonal) de grad mai mic;
- Rădăcinile polinomului Pn determină intervalele de separare a zerourilor pentru polinomul P_{n+1};
- Minimul integralei `∫_a^b w(x)·qn²(x) dx` pentru orice polinom de grad n este realizat de polinomul ortogonal Pn(x), definit în mod unic în raport cu intervalul [a, b] și ponderea w(x).

### 8.4 Obținerea polinoamelor Legendre prin Gram-Schmidt

Aplicăm GS pe baza polinomială, cu `w(x) = 1` și `[a,b] = [−1,1]`. Notăm baza cu `eᵢ = xⁱ`:

```
pᵢ(x) = eᵢ(x) − Σ_{j=0}^{i−1} (⟨eᵢ, pⱼ⟩/⟨pⱼ, pⱼ⟩)·pⱼ(x)
```

Pentru normalizare, impunem `p(1) = 1`: `p(x) ← p(x)/p(1)`.

Cod MATLAB:
```matlab
a0 = [0, 0, 0, 1];
p0 = a0;

a1 = [0, 0, 1, 0];
p1 = a1 - p0 * (polydot(a1, p0) / polydot(p0, p0));
p1 = p1 / polyval(p1, 1);

a2 = [0, 1, 0, 0];
p2 = a2 - p0 * (polydot(a2, p0) / polydot(p0, p0)) ...
        - p1 * (polydot(a2, p1) / polydot(p1, p1));
p2 = p2 / polyval(p2, 1);

a3 = [1, 0, 0, 0];
p3 = a3 - p0 * (polydot(a3, p0) / polydot(p0, p0)) ...
        - p1 * (polydot(a3, p1) / polydot(p1, p1)) ...
        - p2 * (polydot(a3, p2) / polydot(p2, p2));
p3 = p3 / polyval(p3, 1);

x = linspace(-1, 1, 100);
hold on;
ylim([-1.05, 1.05]);
plot(x, polyval(p0, x), '-');
plot(x, polyval(p1, x), '-');
plot(x, polyval(p2, x), '-');
plot(x, polyval(p3, x), '-');
hold off;
```

Polinoamele rezultate:
```
p0 = 1
p1 = x
p2 = (3/2)x² − 1/2
p3 = (5/2)x³ − (3/2)x
```

### 8.5 Aproximarea funcțiilor

Polinoamele ortogonale sunt folosite pentru rezolvarea ecuațiilor diferențiale, în analiza numerică, în teoria aproximării, în teoria probabilistică ș.a. Putem folosi operatorul de proiecție pentru a aproxima orice funcție — o proiectăm pe baza polinoamelor ortogonale:

```
p(x) = Σ_{i=0}^{n} pᵢ(x)·(⟨f, pᵢ⟩/⟨pᵢ, pᵢ⟩)
```

Figura 7 din laborator: aproximarea `sin(2x)` cu primele 4 polinoame Legendre.

Astfel am efectuat aproximarea **în sens CMMP** (cele mai mici pătrate): proiecția ne oferă polinomul p(x) care minimizează eroarea `||f − p||₂²`.

---

## 9. Probleme (laborator)

1. Script MATLAB pentru descompunerea QR a unei matrice folosind reflexii Householder.
2. Script MATLAB pentru descompunerea QR a unei matrice folosind rotații Givens.
3. Demonstrați că matricea Householder este simetrică.
4. Aduceți o matrice 3×3 Householder la forma diagonală folosind rotații Givens.
5. Să se determine descompunerea QR pentru matricea `A = [3 1 −2; 1 3 1; −2 1 3]` folosind transformarea Givens.
6. Demonstrați că cea mai bună aproximare în sens CMMP a unei funcții f(x) pe un subspațiu este unică și este dată de proiecția lui f(x) pe subspațiu.

Exerciții propuse la curs: exemplu Householder (triunghiular) și exemplu Givens — "alegeți ce vreți voi".

---

## 10. Bibliografie

- Richard L. Burden, J. Douglas Faires, *Numerical Analysis*, 9th edition, Brooks/Cole, Cengage Learning, 2011.
- Roger A. Horn, Charles R. Johnson, *Matrix Analysis*, 2nd edition, Cambridge, 2013.
- Valeriu Iorga, Boris Jora, *Metode Numerice*, Editura Albastră, 2005.
- [1] MIT. *Orthogonal polynomials*. 18.06 Linear Algebra, 2017.
- [2] Michael L. Overton, Pinze Yu. *On the choice of sign defining Householder transformations*, 2023.

*Echipa MN CS-UPB 2015 — Profesori: Pantelimon George Popescu (Seria CA), Florin Pop (Seriile CB, CC). Laborator: Facultatea de Automatică și Calculatoare, Politehnica București, 2025.*

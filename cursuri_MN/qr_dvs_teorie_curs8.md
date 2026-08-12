# Metoda QR și Descompunerea Valorilor Singulare (DVS/SVD)

Curs + laborator, Metode Numerice, CS-UPB. Document de teorie consolidat (fără probleme, bibliografie sau date organizatorice).

---

## 1. Metoda QR — idee generală

**Algoritmul QR** este o metodă matricială de reducere folosită pentru calculul **simultan** al tuturor valorilor proprii ale unei matrice simetrice. Este considerat unul dintre „top 10 Computational Algorithms".

**De ce QR și nu metodele puterii?** Din cauza creșterii rapide a erorii acumulate, metodele puterii nu se folosesc pentru calcularea *tuturor* valorilor proprii ale unei matrice. QR determină simultan toate valorile proprii ale unei matrice simetrice tridiagonale.

**Preprocesare:** aplicăm QR unei matrici **simetrice tridiagonale**. Dacă matricea nu este în formă tridiagonală, aplicăm mai întâi **metoda Householder** și o aducem la o formă asemenea tridiagonală (transformarea păstrează spectrul).

### Forma simetrică tridiagonală

```
A = [ a1  b2   0   ...      0   ]
    [ b2  a2   b3  ...      .   ]
    [ 0   b3   a3  ...      0   ]
    [ .        ...  b_{n−1} a_{n−1}  bn ]
    [ 0   ...   0    bn     an  ]
```

### Observația de bază

Dacă `b2 = 0`, atunci `a1` este valoare proprie a lui `A`. Dacă `bn = 0`, atunci `an` este valoare proprie a lui `A`.

Metoda QR se bazează pe această observație: la fiecare pas **descrește progresiv `b2` și `bn`**, până devin aproximativ 0.

### Descompunerea problemei

Dacă există `bj = 0` cu `2 < j < n`, problema se reduce la două probleme mai mici, aplicând QR separat pentru:

**(a)** matricea de dimensiune `j − 1`:

```
[ a1  b2  0  ...  0 ]
[ b2  a2  b3 ...  . ]
[ 0   b3  a3 ...  0 ]
[ .       ... b_{j−1} ]
[ 0  ...  0  b_{j−1}  a_{j−1} ]
```

**(b)** matricea de dimensiune `n − j + 1`:

```
[ aj      b_{j+1}  0   ...  0 ]
[ b_{j+1} a_{j+1}  b_{j+2} ...  . ]
[ 0       b_{j+2}  a_{j+2} ...  0 ]
[ .              ...        bn ]
[ 0       ...      0   bn   an ]
```

### Iterația QR (când toți `bj ≠ 0`)

Se formează pas cu pas un șir de matrici `A = A^{(1)}, A^{(2)}, A^{(3)}, ...`:

1. `A^{(1)} = A` este factorizată ca `A^{(1)} = Q^{(1)} R^{(1)}`, unde `Q^{(1)}` este ortogonală și `R^{(1)}` superior triunghiulară;
2. `A^{(2)} = R^{(1)} Q^{(1)}`, ...

În general, `A^{(i)} = Q^{(i)} R^{(i)}` și `A^{(i+1)} = R^{(i)} Q^{(i)}`.

Cum `Q^{(i)}` este ortogonală, avem `R^{(i)} = Q^{(i)T} A^{(i)}`, deci:

```
A^{(i+1)} = R^{(i)} Q^{(i)} = Q^{(i)T} A^{(i)} Q^{(i)}
```

Aceasta este o **transformare de asemănare ortogonală**, ceea ce garantează că:

- `A^{(i+1)}` este simetrică;
- `A^{(i+1)}` are aceleași valori proprii ca `A^{(i)}`, deci (prin inducție, pornind de la `A^{(1)} = A`) aceleași valori proprii ca `A`;
- `A^{(i+1)}` rămâne tridiagonală (asigurat de modul în care definim `R^{(i)}` și `Q^{(i)}`).

Prin inducție, `A^{(i+1)}` devine matrice **diagonală, cu valorile proprii pe diagonală**.

---

## 2. Matrice de rotație

Pentru a construi `Q^{(i)}` și `R^{(i)}` este necesară noțiunea de **matrice de rotație** (rotație Givens).

O matrice de rotație `P` diferă de matricea identitate în cel mult **patru elemente**:

```
p_ii = p_jj = cosΘ
p_ij = −p_ji = sinΘ        pentru un Θ și i ≠ j
```

Proprietăți:

- Orice matrice de rotație `P` este **ortogonală**, pentru că definiția implică `P P^T = I`.
- Produsul `A P` diferă de `A` doar prin valorile din **coloanele** `i` și `j`.
- Produsul `P A` diferă de `A` doar prin valorile din **liniile** `i` și `j`.
- Pentru orice `i ≠ j`, unghiul `Θ` poate fi ales astfel încât elementul `(P A)_ij` să se anuleze.

---

## 3. Construcția matricelor Q și R

Pentru a obține matricea superior triunghiulară `R^{(1)}` sunt necesare mai multe matrice de rotație aplicate asupra lui `A`:

```
R^{(1)} = Pn P_{n−1} ... P2 A^{(1)}
```

### Primul pas: `P2`

```
p11 = p22 = cosΘ2 ,   p12 = −p21 = sinΘ2
```

unde

```
sinΘ2 = b2 / sqrt(b2² + a1²)
cosΘ2 = a1 / sqrt(b2² + a1²)
```

Verificare — elementul din poziția (2,1) al matricei `A2^{(1)} = P2 A^{(1)}`:

```
(−sinΘ2)·a1 + (cosΘ2)·b2 = −b2·a1/sqrt(b2²+a1²) + a1·b2/sqrt(b2²+a1²) = 0
```

Înmulțirea lui `P2` cu `A^{(1)}` modifică liniile 1 și 2, însă, `A^{(1)}` fiind tridiagonală, doar elementul de indice **(1,3)** poate deveni diferit de 0 în `A2^{(1)}`.

### Pasul general

Matricea `Pk` este aleasă astfel încât elementul de indice `(k, k−1)` din `Ak^{(1)} = Pk · A_{k−1}^{(1)}` să fie 0. Efectul secundar: elementul de indice `(k−1, k+1)` devine diferit de 0.

### Rezultatul

După construirea tuturor matricelor de rotație `P2, P3, ..., Pn`:

```
R^{(1)} = An^{(1)} = Pn P_{n−1} ... P2 A
Q^{(1)} = P2^T P3^T ... Pn^T
```

Verificare a factorizării:

```
Q^{(1)} R^{(1)} = (P2^T P3^T ... Pn^T)(Pn ... P3 P2) A^{(1)} = A^{(1)}
```

Verificare a ortogonalității lui `Q^{(1)}`:

```
Q^{(1)T} Q^{(1)} = (P2^T P3^T ... Pn^T)^T (P2^T P3^T ... Pn^T)
                 = (Pn ... P3 P2)(P2^T P3^T ... Pn^T) = I
```

---

## 4. Accelerarea convergenței — QR cu deplasare explicită

### Rata de convergență fără deplasare

Dacă `|λ1| > |λ2| > ... > |λn|` (module distincte), rata de convergență a elementului `b_{j+1}^{(i+1)}` către 0 în matricea `A^{(i+1)}` este direct proporțională cu raportul

```
|λ_{j+1} / λj|
```

Aceasta determină cât de repede converge `a_j^{(i+1)}` către valoarea proprie corespunzătoare `λj`. Deci **dacă raportul `|λ_{j+1}/λj|` este aproape de 1, metoda converge slab**.

### Deplasarea (shift)

Pentru a grăbi convergența se folosește o **metodă de deplasare**: se alege o constantă `σ` apropiată de una dintre valorile proprii, iar la fiecare pas factorizarea QR se modifică în:

```
A^{(i)} − σI = Q^{(i)} R^{(i)}
```

și se consideră:

```
A^{(i+1)} = R^{(i)} Q^{(i)} + σI
```

Cu această modificare, raportul care dictează convergența devine:

```
|(λ_{j+1} − σ) / (λj − σ)|
```

Deci pentru `σ` **aproape de `λ_{j+1}` dar departe de `λj`** avem asigurată convergență rapidă pentru `a_j^{(i+1)}` către `λj`.

### Procedeul complet

La fiecare pas se alege un alt `σ`, astfel încât `bn^{(i+1)}` să convergă la 0 mai repede decât oricare alt `bj^{(i+1)}` (pentru `j < n`). Atunci când `bn^{(i+1)} ≈ 0`, putem considera `an^{(i+1)} ≈ λn`.

La pasul următor considerăm matricea simplificată, **fără ultima linie și ultima coloană**, și repetăm procedeul până îl aproximăm pe `λ_{n−1}`. Repetăm până obținem o aproximație pentru fiecare valoare proprie.

**Atenție:** valoarea proprie finală se obține adunând **suma tuturor deplasărilor** aplicate până în acel moment (`λ ≈ a + Σ σi`).

### Alegerea lui σ

La pasul `i`, `σi` este valoarea proprie **cea mai apropiată de `an^{(i)}`** a matricei `2×2`:

```
E^{(i)} = [ a_{n−1}^{(i)}   bn^{(i)}   ]
          [ bn^{(i)}        an^{(i)}   ]
```

---

## 5. Metoda QR pentru matrici nesimetrice

Dacă `A` este nesimetrică, matricea este redusă prin metoda **Householder** la **forma Hessenberg superioară** (Karl Hessenberg, 1904–1959, inginer german), adică de genul:

```
[ a11  a12  a13  ...  a_{1(n−1)}  a_{1n} ]
[ a21  a22  a23  ...  a_{2(n−1)}  a_{2n} ]
[  0   a32  a33  ...  a_{3(n−1)}  a_{3n} ]
[  0    0   a43  ...  a_{4(n−1)}  a_{4n} ]
[  0    0    0   ...      ...      ...   ]
[  0    0    0   a_{(n−1)(n−2)}  a_{(n−1)(n−1)}  a_{(n−1)n} ]
[  0    0    0        0          a_{n(n−1)}      a_{nn}     ]
```

(o matrice superior triunghiulară plus o subdiagonală nenulă)

### Deplasarea QR dublă

Diferența față de cazul simetric, mai complicată, constă în faptul că **pot apărea valori proprii distincte de același modul**. Se folosește metoda de **deplasare QR dublă**:

```
H^{(1)} − σ1 I = Q^{(1)} R^{(1)} ,     H^{(2)} = R^{(1)} Q^{(1)} + σ1 I
H^{(2)} − σ2 I = Q^{(2)} R^{(2)} ,     H^{(3)} = R^{(2)} Q^{(2)} + σ2 I
```

unde `σ1` și `σ2` sunt numere complex conjugate, iar `H1, H2, H3, ...` sunt matrici **reale** Hessenberg superioare.

---

## 6. Descompunerea Valorilor Singulare (DVS / SVD)

### Definiție

Factorizarea

```
A = U S V^T
```

unde:
- `A` este o matrice `m×n`;
- `S` este o matrice `m×n` ale cărei singure elemente diferite de 0 sunt pe prima diagonală;
- `U` este o matrice **ortogonală** `m×m`;
- `V` este o matrice **ortogonală** `n×n`;

poartă numele de **DVS**. De obicei `m > n`, sau `m ≫ n`. În plus, `S_ii ≥ 0`.

Deși tehnica de factorizare datează de pe la finele secolului 19, ea a început să fie folosită efectiv odată cu dezvoltarea algoritmilor eficienți care o implementează.

Schematic:

```
   A        =        U         ·        S        ·      V^T
(m×n)             (m×m)              (m×n)            (n×n)
```

### Noțiuni preliminare: rang și nucleu

Pentru factorizarea în sens DVS considerăm matricile pătrate `A A^T` (`m×m`) și `A^T A` (`n×n`).

- **Rank(A)** = numărul liniilor liniar independente din `A`.
- **Null(A)** = cel mai mare set de vectori `v` din `R^n` liniar independenți pentru care `A v = 0`.
- Dacă `A` este pătratică `n×n`, atunci `A` este inversabilă **dacă și numai dacă** `Null(A) = 0` și `Rank(A) = n`.
- Numărul de linii liniar independente dintr-o matrice `m×n` este egal cu numărul de coloane liniar independente din acea matrice.

### Proprietăți fundamentale

Fie `A` o matrice `m×n`, atunci:

- `A^T A` și `A A^T` sunt **simetrice**;
- `Null(A) = Null(A^T A)`;
- `Rank(A) = Rank(A^T A)`;
- Valorile proprii pentru `A^T A` și `A A^T` sunt **reale și nenegative**;
- Valorile proprii diferite de 0 pentru `A^T A` și `A A^T` sunt **aceleași`.

---

## 7. Construcția matricei S

Fie `s_i²` valorile proprii ale matricei simetrice `n×n` `A^T A`, pe care le ordonăm astfel:

```
s1² ≥ s2² ≥ ... ≥ sk² > s_{k+1} = ... = sn = 0
```

**Valorile pozitive ale radicalului valorilor proprii ale matricei `A^T A` poartă numele de valori singulare pentru `A`.**

```
S = [ s1   0   ...  0  ]
    [ 0    s2  ...  .  ]
    [ .    ...  0   sn ]
    [ 0   ...  ...  0  ]
    [ .              . ]
    [ 0   ...  ...  0  ]
```

(matrice `m×n`, cu valorile singulare pe diagonală și restul liniilor zero)

**Caz particular:** dacă `A` este simetrică, atunci `A = A^T`, deci `A² = A^T A`, și prin urmare **valorile singulare sunt chiar valorile proprii**.

---

## 8. Construcția matricei V

Pentru orice matrice `M` simetrică avem `M = V D V^T`, unde `D` este o matrice diagonală ce conține valorile proprii ale lui `M`, iar `V` este ortogonală, având drept coloane vectorii proprii ai lui `M`, de normă euclidiană 1.

Cum `A^T A` este simetrică, avem:

```
A^T A = V D V^T
```

Cum vectorii proprii pot fi aleși oricum (ca direcție/semn), înseamnă că avem **mai multe variante posibile pentru `V`** (matrice `n×n`).

Iar pentru că valorile proprii ale lui `A^T A` sunt nenegative, avem:

```
D = S²
```

---

## 9. Construcția matricei U

Considerăm valorile singulare nenule `s1 ≥ s2 ≥ ... ≥ sk > 0` și coloanele corespunzătoare din `V`, adică `v1, v2, ..., vk`, pentru care definim:

```
u_i = (1/s_i) · A v_i ,    i = 1...k
```

Folosim acești vectori ca **primele k coloane din `U`**. Cum `U` este `m×m`, ne mai lipsesc `m − k` vectori, pe care îi alegem astfel încât matricea să fie ortogonală (deci coloanele liniar independente).

### Algoritmul Gram-Schmidt

Alegerea coloanelor rămase se face prin algoritmul **Gram-Schmidt** (Jørgen Pedersen Gram, 1850–1916, matematician danez; Erhard Schmidt, 1876–1959, matematician german).

Proiecția:

```
proj_u(v) = (⟨u, v⟩ / ⟨u, u⟩) · u
```

Procedeul:

```
u1 = v1                                              e1 = u1 / ||u1||
u2 = v2 − proj_{u1}(v2)                              e2 = u2 / ||u2||
u3 = v3 − proj_{u1}(v3) − proj_{u2}(v3)              e3 = u3 / ||u3||
u4 = v4 − proj_{u1}(v4) − proj_{u2}(v4) − proj_{u3}(v4)   e4 = u4 / ||u4||
...
uk = vk − Σ_{j=1}^{k−1} proj_{uj}(vk)                ek = uk / ||uk||
```

Vectorii `e_i` (normalizați) formează baza ortonormată căutată.

---

## 10. Rezumat: pașii algoritmului DVS

1. Se calculează `A^T A` (simetrică `n×n`).
2. Se determină valorile proprii `s_i²` ale lui `A^T A` și se ordonează descrescător → **valorile singulare** `s_i = sqrt(s_i²)` formează `S`.
3. Vectorii proprii ortonormați ai lui `A^T A` formează coloanele lui **`V`** (`A^T A = V D V^T`, `D = S²`).
4. Primele `k` coloane ale lui **`U`** se obțin din `u_i = (1/s_i)·A v_i`; restul de `m − k` coloane se completează prin **Gram-Schmidt** pentru a obține o matrice ortogonală.
5. Rezultat: `A = U S V^T`.

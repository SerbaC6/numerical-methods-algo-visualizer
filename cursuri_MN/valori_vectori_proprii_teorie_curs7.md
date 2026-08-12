# Valori proprii și vectori proprii — metodele puterii, puterea inversă, deflație

Curs + laborator, Metode Numerice, CS-UPB. Document de teorie consolidat (fără probleme, bibliografie sau date organizatorice).

---

## 1. Noțiuni de bază

Pentru o matrice pătratică `A ∈ C^{n×n}`, un număr complex `λ ∈ C` este **valoare proprie** dacă există un vector nenul `x ∈ C^n` (**vector propriu**) astfel încât:

```
A x = λ x
```

Mulțimea tuturor valorilor proprii se numește **spectrul** matricei:

```
λ(A) = { λ1, λ2, ..., λn }
```

Două proprietăți importante:

- `Σ_{i=1..n} λi = tr(A)` — suma valorilor proprii este urma matricei (suma elementelor de pe diagonală).
- `Π_{i=1..n} λi = det(A)` — produsul valorilor proprii este determinantul.

Teoretic, valorile proprii se determină ca rădăcini ale **polinomului caracteristic**:

```
p(λ) = det(λ I_n − A)
```

În practică însă se folosesc **metode numerice iterative**, nu rezolvarea polinomului.

### Unicitatea vectorilor proprii

Dacă `x` este vector propriu pentru `A` asociat lui `λi`, atunci și `a·x` (orice scalar `a ≠ 0`) este vector propriu. Cu alte cuvinte, vectorii proprii **nu sunt unici, ci au direcție unică**.

Mulțimea vectorilor proprii asociați unei valori proprii `λi` formează un **subspațiu liniar `E_i`**, iar `dim(E_i)` reprezintă **multiplicitatea geometrică** a lui `λi`.

**Multiplicitatea algebrică** `n_i` este multiplicitatea lui `λi` ca zero (rădăcină) al polinomului caracteristic `p`. Suma multiplicităților algebrice este egală cu gradul polinomului.

Dacă `dim(E_i) = n_i` pentru orice `i`, atunci matricea este diagonalizabilă: există `X` nesingulară astfel încât

```
X^{-1} A X = Λ = diag(λ1, λ2, ..., λn)
```

---

## 2. Transformări de asemănare

Două matrice `A, B ∈ C^{n×n}` sunt **asemenea** dacă există `T` nesingulară astfel încât:

```
B = T^{-1} A T      (echivalent: A = T B T^{-1})
```

Proprietăți:

- Dacă `T` este ortogonală (unitară), atunci `A` și `B` sunt asemenea ortogonal (unitar).
- Două matrice asemenea au **același spectru**: `λ(A) = λ(B)`.
- Dacă `x` este vector propriu pentru `A` asociat unei valori proprii, atunci `Tx` este vector propriu pentru `B`, asociat aceleiași valori proprii.

**Demonstrație (același spectru).** Fie `B = T^{-1} A T` și `λ` valoare proprie a lui `B`, cu `Bx = λx`. Atunci `T^{-1} A T x = λ x`, deci `A(Tx) = λ(Tx)`, adică `λ` este valoare proprie și pentru `A`. ∎

**Motivația asemănării:** simplificarea operațiilor prin schimbare de bază. De exemplu, pentru a roti un vector din `R^2` în jurul altui vector, se poate schimba întâi baza astfel încât vectorul de rotație să devină un vector standard (adus pe axa x), se aplică rotația, apoi se revine la baza inițială.

---

## 3. Forma Jordan

Orice matrice complexă `A` este similară unei matrice bloc-diagonale:

```
J = diag(J1, J2, ..., Jk)
```

Fiecare bloc `Ji` se numește **bloc Jordan** și are forma:

```
Ji =  [ λi  1   0  ...  0 ]
      [ 0   λi  1  ...  0 ]
      [ ...              ]
      [ 0   0  ...  λi  1 ]
      [ 0   0  ...  0   λi]
```

---

## 4. Forma Schur

**Issai Schur** (1875–1941), matematician german născut în Belarus; rezultat din 1909.

**Enunț general:** pentru orice matrice `A` există `T` nesingulară astfel încât `A = T U T^{-1}`, unde `U` este **superior triunghiulară** cu valorile proprii ale lui `A` pe diagonală. Vectorii coloană ai matricei `T` formează o bază pentru spațiul `C^n` și pot înlocui vectorii proprii ai matricei `A`.

**Consecință (caz complex):** pentru orice matrice `A` există `Q` **unitară** astfel încât

```
Q^H A Q = S
```

unde `S` este superior triunghiulară și conține pe diagonala principală valorile proprii ale lui `A`.

**Consecință (caz real):** pentru orice matrice `A` există `Q` **ortogonală** astfel încât

```
Q^T A Q = S
```

unde `S` este **cvasi-superior triunghiulară**:

```
S = [ S11  S12  ...  S1q ]
    [  0   S22  ...  S2q ]
    [           ...      ]
    [  0    0   ...  Sqq ]
```

Blocurile `S_ii` sunt matrice pătratice de ordin 1 sau 2, iar `λ(A) = ∪_{i=1..q} λ(S_ii)`.

### Demonstrația constructivă

**CAZ 1 — valoare proprie reală.** Fie `λ1` valoare proprie reală și `x1`, cu `||x1|| = 1`, un vector propriu asociat. Considerăm matricea ortogonală

```
Q1 = [ x1  Y ],   Y ∈ R^{n×(n−1)}
```

Din `x1^T Y = 0` și ținând cont de `A x1 = λ1 x1`, rezultă:

```
x1^T A x1 = λ1 x1^T x1 = λ1 ,   Y^T A x1 = λ1 Y^T x1 = 0
```

Se obține deci matricea:

```
A1 = Q1^T A Q1 = [ λ1   x1^T A Y ] = [ λ1   g1^T ]
                 [ 0    Y^T A Y  ]   [ 0     B   ]
```

**CAZ 2 — valori proprii complex conjugate.** Fie `λ_{1,2} = α ± iβ`, cu `β ≠ 0`, pentru care avem vectorii proprii asociați `x_{1,2} = u ± iv`, cu `u, v` liniar independenți. Din relația

```
A(u ± iv) = (α ± iβ)(u ± iv)
```

rezultă:

```
A · [u v] = [u v] · [  α   β ]
                    [ −β   α ]
```

Fie `y1, y2` o bază a spațiului generat de vectorii liniar independenți `u` și `v`, iar `Z ∈ R^{n×(n−2)}` o completare astfel încât matricea `Q1 = [Y Z]` să fie ortogonală. Dacă scriem `u` și `v` în raport cu baza aleasă:

```
u = t11 y1 + t21 y2 ,   v = t12 y1 + t22 y2
```

avem `[u v] = Y T` și deci

```
A Y = Y T · [  α   β ] · T^{-1} = Y S11
            [ −β   α ]
```

Cum `Y^T A Y = S11` și `Z^T A Y = 0`, rezultă:

```
A1 = Q1^T A Q1 = [ S11   Y^T A Z ] = [ S11   G ]
                 [  0    Z^T A Z ]   [  0    B ]
```

**Concluzie.** În ambele cazuri procedeul se poate aplica recursiv matricei `B`, până când `S` devine cvasi-superior triunghiulară, conținând în blocurile `S_ii` valorile proprii ale lui `A`.

Observație interesantă: în cazul complex (cazul 2), deși avem valori proprii complexe conjugate, **nu lucrăm efectiv cu numere complexe, ci doar cu numere reale**.

Această tehnică, care transformă o matrice într-o formă asemenea cu forma Schur, este de fapt o **metodă de calcul pentru valori proprii**. Dar pentru a funcționa avem nevoie de o metodă prin care să calculăm aproximativ vectori proprii fără a cunoaște valoarea proprie asociată. De aici întrebarea: care este cea mai bună aproximație a valorii proprii când avem un vector propriu aproximativ?

---

## 5. Câtul Rayleigh

**John Strutt, 3rd Baron Rayleigh** (1842–1919), fizician englez, a descoperit Argonul (Ar), pentru care a luat premiul Nobel în 1904.

Dacă `x` este un vector propriu aproximativ pentru `A`, cea mai bună aproximare a valorii proprii este `μ` obținut ca soluție în sensul celor mai mici pătrate a sistemului:

```
x μ = A x
```

adică acel `μ` care minimizează:

```
r(μ) = || A x − μ x ||_2
```

Numărul

```
μ = (x^T A x) / (x^T x)
```

reprezintă **câtul Rayleigh** asociat perechii `(A, x)`.

Dacă aplicăm construcția formei Schur considerând un vector propriu aproximativ `x1` și valoarea câtului Rayleigh ca cea mai bună aproximație pentru valoarea proprie asociată, avem:

```
A1 = Q1^T A Q1 = [ μ   g1^T ]
                 [ h    B   ]
```

unde `h = Y^T A x1` trebuie să fie mic, adică de normă euclidiană mică.

---

## 6. Metoda puterii directe

### Ipoteze

Presupunem `|λ1| > |λ2| ≥ ... ≥ |λn|`, adică **cel puțin una dintre valorile proprii este strict mai mare în modul** (valoare proprie dominantă), iar `{v_i}` este șirul liniar independent al vectorilor proprii asociați. Dacă șirul vectorilor proprii nu este liniar independent, metoda poate funcționa, dar succesul nu este garantat.

Vectorul inițial `y^{(0)}` trebuie să aibă **componentă nenulă pe direcția lui `x1`**.

### Formularea de bază (normalizare cu norma 2)

```
1. y_0 = y,  cu ||y|| = 1
2. pentru k = 1, 2, ...
     2.1  z = A y^{(k−1)}
     2.2  y^{(k)} = z / ||z||_2
     2.3  λ^{(k)} = y^{(k)T} A y^{(k)}
```

Atunci `y^{(∞)} → x1`.

Viteza de convergență este cu atât mai mare cu cât `|λi / λ1|` este mai mic; **rata de convergență este dată de `|λ2| / |λ1|`**, iar convergența este rapidă dacă `|λ2| ≪ |λ1|`.

În principiu nu este necesară construcția explicită a șirului `λ^{(k)}`, deoarece `λ1` poate fi obținut la final din:

```
λ1 = (y^{(∞)})^H A y^{(∞)} = x1^H A x1
```

### Utilizări

- Determinarea celei mai mari valori proprii **în modul**.
- Ușor modificat, algoritmul poate determina orice valoare proprie.
- La fiecare pas se poate determina și vectorul propriu asociat; de multe ori metoda puterii se folosește tocmai pentru a determina un vector propriu asociat unei valori proprii deja obținute prin altă metodă.

### De ce este necesară scalarea

Orice vector `x` din `R^n` se poate scrie în funcție de `{v_i}`:

```
x = Σ_{j=1..n} βj v^{(j)}
```

Înmulțind ecuația la stânga cu `A, A^2, ..., A^k`:

```
A^k x = λ1^k Σ_{j=1..n} βj (λj/λ1)^k v^{(j)}
```

Și deci `lim_{k→∞} A^k x = lim_{k→∞} λ1^k β1 v^{(1)}`, ceea ce implică faptul că `A^k x` converge la 0 dacă `|λ1| < 1` și altfel diverge. Ca să ne asigurăm că limita este finită și diferită de zero, **scalăm puterile `A^k`**.

### Varianta cu normă infinit

Considerăm primul vector de pornire cu norma infinit (maximul după `i` din `|x_i|`) egală cu 1, și fie `x_{p0}` prima poziție din `x^{(0)}` egală cu 1:

```
x^{(0)}_{p0} = 1 = ||x^{(0)}||_∞
```

Fie `y^{(1)} = A x^{(0)}` și definim:

```
μ^{(1)} = y^{(1)}_{p0} / x^{(1)}_{p0}
        = [ β1 λ1 v^{(1)}_{p0} + Σ_{j=2..n} βj λj v^{(j)}_{p0} ] / [ β1 v^{(1)}_{p0} + Σ_{j=2..n} βj v^{(j)}_{p0} ]
        = λ1 · [ β1 v^{(1)}_{p0} + Σ_{j=2..n} βj (λj/λ1) v^{(j)}_{p0} ] / [ β1 v^{(1)}_{p0} + Σ_{j=2..n} βj v^{(j)}_{p0} ]
```

Fie `p1` cel mai mic întreg pentru care `|y^{(1)}_{p1}| = ||y^{(1)}||_∞`. Atunci

```
x^{(1)} = (1 / y^{(1)}_{p1}) · y^{(1)} = (1 / y^{(1)}_{p1}) · A x^{(0)}
```

de unde `x^{(1)}_{p1} = 1 = ||x^{(1)}||_∞`.

În aceeași manieră definim șirurile de vectori `x_i`, `y_i` și șirul de scalari `μ_i`:

```
y^{(m)} = A x^{(m−1)}

μ^{(m)} = y^{(m)}_{p_{m−1}}
        = λ1 · [ β1 v^{(1)}_{p_{m−1}} + Σ_{j=2..n} (λj/λ1)^m βj v^{(j)}_{p_{m−1}} ]
              / [ β1 v^{(1)}_{p_{m−1}} + Σ_{j=2..n} (λj/λ1)^{m−1} βj v^{(j)}_{p_{m−1}} ]

x^{(m)} = y^{(m)} / y^{(m)}_{p_m} = A^m x^{(0)} / Π_{k=1..m} y^{(k)}_{p_k}
```

unde la fiecare pas `p_m` este cel mai mic întreg pentru care `|y^{(m)}_{p_m}| = ||y^{(m)}||_∞`.

**Concluzie:** șirul de scalari `μ_i` tinde către `λ1`, iar `x_i` tinde către un vector propriu asociat lui `λ1`, având norma infinit egală cu 1.

### Demonstrația convergenței

Fie `P^{-1} A P = J`, unde `J` este matricea Jordan corespunzătoare lui `A`. Fie `y^{(0)} = α1 p1 + α2 p2 + ... + αn pn`, unde `α1 ≠ 0` și `p_i` sunt coloanele matricei `P`.

```
y^{(k)} = A y^{(k−1)} / ||A y^{(k−1)}||
        = A^k y^{(0)} / ||A^k y^{(0)}||
        = P^{-1} J^k Σ_i αi e_i / || P^{-1} J^k Σ_i αi e_i ||
```

Dând factor comun forțat pe `λ1` la numărător și numitor și trecând la limita `k → ∞`, ajungem la `y^{(k)} → v1`.

Mai simplu, dacă `A` este diagonalizabilă și `b^{(0)}` este o combinație liniară a vectorilor proprii:

```
b^{(k)} = A^k b^{(0)} = A^k Σ_{i=1..n} αi vi
        = Σ_{i=1..n} αi A^k vi = Σ_{i=1..n} αi λi^k vi
        = α1 λ1^k ( v1 + Σ_{i=2..n} (αi/α1)(λi^k/λ1^k) vi )

b^{(k)} → α1 λ1^k v1 ∎
```

### Algoritm (metoda puterii directe)

```
1: v ← vectorul inițial normalizat
2: for i = 1 to max_iter do
3:     vprev ← v
4:     v ← A · v
5:     v ← v / ||v||
6:     if ||v − vprev|| < tol then break
7: end for
8: λ ← v^T A v
```

---

## 7. Metoda puterii inverse

Se aplică metoda puterii pentru matricea `B = A^{-1}`, respectiv, cu deplasare, pentru

```
B = (A − μI)^{-1}
```

Valorile proprii ale lui `A^{-1}` sunt inversele valorilor proprii ale lui `A`, deci **cea mai mică valoare proprie a lui `A` corespunde celei mai mari valori proprii a lui `B`**.

Dacă `q` (respectiv `μ`) este diferit de `λi` pentru orice `i = 1..n`, atunci valorile proprii ale matricei `(A − qI)^{-1}` sunt:

```
1/(λ1 − q),  1/(λ2 − q),  ...,  1/(λn − q)
```

și au **aceiași vectori proprii asociați**. Dacă `μ` se află în apropierea uneia dintre valorile proprii ale lui `A`, iterația va converge către vectorul propriu asociat lui `λj`, cu `|λj − μ|` minim.

Aplicând metoda puterii pentru `(A − qI)^{-1}` obținem:

```
y^{(m)} = (A − qI)^{-1} x^{(m−1)}

μ^{(m)} = y^{(m)}_{p_{m−1}} / x^{(m−1)}_{p_{m−1}}
        = Σ_{j=1..n} βj (1/(λj − q)^m) v^{(j)}_{p_{m−1}}
          / Σ_{j=1..n} βj (1/(λj − q)^{m−1}) v^{(j)}_{p_{m−1}}

x^{(m)} = y^{(m)} / y^{(m)}_{p_m}
```

Șirul `μ_i` converge către `1/(λk − q)`, unde

```
1/|λk − q| = max_{1 ≤ i ≤ n} 1/|λi − q|
```

iar `λk ≈ q + 1/μ^{(m)}` este valoarea proprie a lui `A` cea mai apropiată de `q`.

Deci, în funcție de `k`:

```
μ^{(m)} = (1/(λk − q)) · [ βk v^{(k)}_{p_{m−1}} + Σ_{j≠k} βj ((λk−q)/(λj−q))^m v^{(j)}_{p_{m−1}} ]
                        / [ βk v^{(k)}_{p_{m−1}} + Σ_{j≠k} βj ((λk−q)/(λj−q))^{m−1} v^{(j)}_{p_{m−1}} ]
```

Apoi `y^{(m)}` se obține rezolvând sistemul liniar de ecuații:

```
(A − qI) y^{(m)} = x^{(m−1)}
```

(nu se inversează efectiv matricea).

**Alegerea lui `q`** este cheia problemei: se pot folosi **cercurile lui Gershgorin**, sau, de obicei, dacă `x^{(0)}` este un vector propriu aproximativ inițial, se ia câtul Rayleigh:

```
q = (x^{(0)H} A x^{(0)}) / (x^{(0)H} x^{(0)})
```

### Algoritm (puterea inversă, fără deplasare)

```
1: v ← vectorul inițial normalizat
2: for i = 1 to max_iter do
3:     vprev ← v
4:     rezolvă A · v = vprev pentru v
5:     v ← v / ||v||
6:     if ||v − vprev|| < tol then break
7: end for
8: λ ← v^T A v
```

### Algoritm (puterea inversă cu deplasare)

```
1: v ← vectorul inițial normalizat
2: for i = 1 to max_iter do
3:     vprev ← v
4:     rezolvă (A − μI) · v = vprev pentru v
5:     v ← v / ||v||
6:     if ||v − vprev|| < tol then break
7: end for
8: λ ← v^T A v
```

---

## 8. Iterarea câtului Rayleigh (puterea inversă cu deplasare variabilă)

Proprietăți deosebite de convergență se obțin când `μ` este modificat de la o iterație la alta, folosind aproximația curentă. Se aplică matricelor hermitice (simetrice).

Pentru o aproximație curentă `x^{(k)}` a vectorului propriu se calculează câtul Rayleigh:

```
ρ^{(k)} = (x^{(k)T} A x^{(k)}) / (x^{(k)T} x^{(k)})
```

care este o estimare a valorii proprii asociate lui `x^{(k)}`. La pasul următor se folosește `μ = ρ^{(k)}` ca nouă deplasare. Deci la fiecare iterație:

```
y^{(k)} = (A − ρ^{(k)} I)^{-1} x^{(k)}      ⇔   (A − ρ^{(k)} I) y^{(k)} = x^{(k)}
x^{(k+1)} = y^{(k)} / ||y^{(k)}||
```

Repetând procedeul, vectorul și valoarea proprie estimate converg rapid către cele reale asociate lui `λj`. Strategia este extrem de utilă când avem deja un indiciu despre poziția unei valori proprii, întrucât viteza de convergență devine foarte mare după ce `ρ^{(k)}` se apropie suficient de `λj`. În practică, iterarea câtului Rayleigh este folosită pe scară largă în algoritmi de diagonalizare numerică și este adesea componenta centrală în metode avansate de calcul al valorilor proprii.

### Algoritm

```
1: v ← v / ||v||
2: for i = 1 to max_iter do
3:     vprev ← v
4:     μ ← v^T A v
5:     rezolvă (A − μI) v = vprev pentru v
6:     v ← v / ||v||
7:     if ||v − vprev|| < tol then break
8: end for
9: λ ← v^T A v
```

---

## 9. Deflația

**Ideea.** După ce am aproximat valoarea proprie dominantă a unei matrice `A` (prin metoda puterii, puterea inversă sau altă metodă), construim o matrice `B` care are **aceleași valori proprii ca `A`, cu o singură diferență: în locul valorii proprii dominante, `B` are valoarea proprie 0**. Noii matrice `B` îi putem aplica din nou metodele puterii pentru a găsi următoarea valoare proprie dominantă. Tehnicile de construcție a unei astfel de matrice `B` se numesc **tehnici de deflație**.

### Rezultatul de bază

Fie `λ1, λ2, ..., λn` valorile proprii ale lui `A`, cu vectorii proprii asociați `v^{(1)}, v^{(2)}, ..., v^{(n)}`, iar prima valoare proprie având multiplicitatea 1. Fie `x` un vector cu `x^T v^{(1)} = 1`. Atunci matricea

```
B = A − λ1 v^{(1)} x^T
```

are valorile proprii

```
σ(B) = { 0, λ2, λ3, ..., λn }
```

cu vectorii proprii `v^{(1)}, w^{(2)}, w^{(3)}, ..., w^{(n)}`, unde există relația:

```
v^{(i)} = (λi − λ1) w^{(i)} + λ1 (x^T v^{(i)}) v^{(1)} ,   i = 2, 3, ..., n
```

Există multe modalități de alegere a vectorului `x`.

### Deflația Wielandt

**Helmut Wielandt** (1910–2001), care în timpul celui de-al Doilea Război Mondial a lucrat în cercetare pentru meteorologie, criptografie și aerodinamică, unde apăreau probleme de vibrație ce cereau estimarea valorilor proprii asociate cu ecuații diferențiale și matrici.

Alegerea vectorului `x` se face astfel:

```
x = (1 / (λ1 v^{(1)}_i)) · (a_{i1}, a_{i2}, ..., a_{in})^T
```

adică `x` este linia `i` din `A`, împărțită la `λ1 v^{(1)}_i`, unde `v^{(1)}_i` este o componentă diferită de zero din `v^{(1)}`.

Se observă că:

```
x^T v^{(1)} = (1/(λ1 v^{(1)}_i)) · (a_{i1}, ..., a_{in}) · (v^{(1)}_1, ..., v^{(1)}_n)^T
            = (1/(λ1 v^{(1)}_i)) · Σ_{j=1..n} a_{ij} v^{(1)}_j = 1
```

deoarece `A v^{(1)} = λ1 v^{(1)}`, care este echivalent cu `Σ_{j=1..n} a_{ij} v^{(1)}_j = λ1 v^{(1)}_i`.

Deci `x` respectă ipoteza. Mai mult, **linia `i` din `B` (corespunzătoare valorii proprii dominante) devine 0**, iar coloana `i` din `B` nu afectează cu nimic calculul vectorului propriu `w` din `Bw = λw`, care trebuie să aibă 0 pe poziția `i`.

### Reducerea dimensiunii

Dacă eliminăm linia `i` și coloana `i` din matricea `B`, obținem o matrice `B'` de dimensiune `(n−1) × (n−1)` cu valorile proprii `λ2, λ3, ..., λn`.

Acum, dacă `|λ2| > |λ3|`, putem aplica din nou metodele puterii pe `B'` pentru a obține următoarea valoare proprie dominantă. Vectorul propriu asociat lui `λ2` va fi `w^{(2)'}`, la care adăugăm un 0 între pozițiile `i−1` și `i`, apoi calculăm `v^{(2)}` cu relația de mai sus.

### Algoritm (MP cu deflație)

```
1: eigarray ← vector de zerouri de lungime n
2: while size(A, 1) > 0 do
3:     v ← vector de 1 de lungime size(A, 1)
4:     v ← v / ||v||
5:     v ← vector obținut din metoda puterii
6:     λ ← v^T A v
7:     eigarray[size(A,1)] ← λ
8:     y ← A_{1,:} / (λ · v_1)
9:     A ← A − λ · (v · y)
10:    A ← A_{2:end, 2:end}
11: end while
```

### Este forma Schur o deflație?

Și la Schur obținem o matrice cu un ordin mai mică, care are valorile proprii mai puțin cea dominantă. Diferența este că noua matrice obținută (din care extragem matricea cu un ordin mai mică) **nu are valoarea proprie 0 în locul valorii proprii dominante, ci chiar valoarea proprie dominantă**.

Cu alte cuvinte, construcția de la Schur este o **metodă de sine stătătoare** pentru calculul valorilor proprii, **nu** o tehnică de deflație care pregătește un nou mediu propice pentru a se putea aplica din nou metode de genul metodelor puterii, care aproximează valoarea proprie dominantă.

---

## 10. Aplicație: algoritmul PageRank

Matricea Google este un exemplu faimos de **matrice stocastică**, folosită în algoritmul PageRank. Fiecare pagină web este un nod, iar link-urile către alte pagini definesc o probabilitate de tranziție de la o pagină la alta.

### Construcția matricei

Fie `n` pagini web `P1, ..., Pn`. Dacă pagina `Pi` are link-uri către paginile `Pj`, probabilitatea de a sări din `Pi` în `Pj` este un element nenul în matrice. Pentru ca matricea să fie stocastică (fiecare coloană însumează 1), se normalizează după numărul de link-uri de ieșire.

**Exemplu cu N = 4 pagini:**

```
P1 → {P2, P3},  P2 → {P3},  P3 → {P1, P4},  P4 → {P2}
```

Matricea de adiacență (pe linii):

```
A = [ 0 1 1 0 ]
    [ 0 0 1 0 ]
    [ 1 0 0 1 ]
    [ 0 1 0 0 ]
```

Matricea stocastică `M` (fiecare coloană normalizată la 1):

```
M = [ 0    1/2  1/2  0 ]
    [ 0    0    1/2  0 ]
    [ 1    0    0    1 ]
    [ 0    1/2  0    0 ]
```

### Calculul PageRank

PageRank-ul este o distribuție de probabilitate care indică importanța fiecărei pagini și rămâne neschimbat indiferent de ce face utilizatorul, deci satisface:

```
M R = R
```

Există însă șansa ca utilizatorul să nu continue click-urile. Fie `d` probabilitatea de a continua navigarea și `1 − d` probabilitatea de a sări la o pagină aleatorie. Definim **matricea Google**:

```
G = d·M + ((1 − d)/N) · ONES(N)
```

PageRank-ul este vectorul propriu asociat lui `λ = 1` al matricei `G`. Cum `λ = 1` este și valoare proprie dominantă, **se poate aplica metoda puterii**.

### Deflația în PageRank

Dacă anumite pagini sunt „izolate" sau formează sub-componente, se pot crea blocuri separate pentru care vectorul propriu asociat lui `λ = 1` se calculează ușor, după care aceste blocuri pot fi deflate pentru a reduce dimensiunea problemei și, implicit, efortul de calcul.

### Algoritm

```
1: n ← numărul de linii ale lui M
2: v ← 1_n
3: G ← d·M + ((1−d)/n)·1_{n×n}
4: while true do
5:     vprev ← v
6:     v ← G · v
7:     v ← v / ||v||
8:     if ||v − vprev|| < tol then break
9: end while
10: v ← v / ||v||_1
```

---

## 11. Obiective de învățare

În urma parcurgerii acestui material, studentul trebuie să poată:

- utiliza metoda puterii directe și metoda puterii inverse pentru a determina valorile și vectorii proprii ai unei matrice;
- aplica metoda deflației pentru a determina valorile și vectorii proprii ai unei matrice;
- aplica proprietățile valorilor și vectorilor proprii în rezolvarea unor probleme.

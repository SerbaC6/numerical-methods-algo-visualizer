# Interpolare polinomială, funcții spline și curbe Bézier

Curs + laborator, Metode Numerice, CS-UPB. Document de teorie consolidat (fără probleme, bibliografie sau date organizatorice).

---

## 1. Problema interpolării

O funcție `f: [a,b] → R` este cunoscută într-un set finit de puncte `x0, x1, ..., xn` (numite **suportul interpolării**) prin valorile:

```
f0 = f(x0), f1 = f(x1), ..., fn = f(xn)
```

Ne propunem să aproximăm această funcție printr-un polinom:

```
Pn(x) = an x^n + a_{n−1} x^{n−1} + ... + a1 x + a0
```

### Teorema lui Weierstrass

(Karl Theodor Wilhelm Weierstrass, 1815–1897, mat. german)

Rezultatul care ne permite să aproximăm printr-un polinom:

> Fie `f: [a,b] → R` o funcție (continuă). Pentru orice `ε > 0` există un polinom `P(x)` astfel încât
> ```
> |f(x) − P(x)| < ε      pentru orice x din [a,b]
> ```

Grafic: `P(x)` rămâne în „banda" delimitată de `y = f(x) + ε` și `y = f(x) − ε`.

---

## 2. Interpolarea Lagrange

(Joseph-Louis Lagrange, 1736–1813)

### Construcția multiplicatorilor

Fie

```
l_k(x) = c_k (x − x1)...(x − x_{k−1})(x − x_{k+1})...(x − xn)
```

cu condiția `l_k(x_k) = 1`. Atunci:

```
c_k = 1 / [ (x_k − x0)...(x_k − x_{k−1})(x_k − x_{k+1})...(x_k − xn) ]
```

și deci rezultă:

```
l_k(x) = Π_{i=0, i≠k}^{n}  (x − x_i) / (x_k − x_i)
```

Polinoamele `l_k(x)` se numesc **multiplicatori Lagrange**.

### Teorema

> Dacă `x0, x1, ..., xn` sunt `n+1` puncte distincte în care o funcție `f` este cunoscută, atunci există un **polinom unic** de grad cel mult `n`, `P(x)`, care satisface `P(x_i) = f(x_i)` și are forma:
> ```
> Pn(x) = Σ_{k=0}^{n} f(x_k) · Π_{i=0, i≠k}^{n} (x − x_i)/(x_k − x_i)
> ```

Polinomul poartă numele de **polinom de interpolare Lagrange**.

### Calculul coeficienților

Coeficienții polinomului de interpolare Lagrange pot fi calculați prin adunarea a `n+1` polinoame de gradul `n`, obținute prin dezvoltarea produselor din formula de mai sus.

În scopul reducerii numărului de operații se procedează astfel: se consideră `P(x0, x1, ..., xn; x) = P_{01...n}(x)` și se împarte pe rând cu `(x − x_k)`, iar coeficienții polinoamelor astfel obținute, ponderați cu `f(x_k)`, se adună între ei. Complexitate: **O(n³)**.

### Forma matricială (evaluare eficientă într-un punct `a`)

Formă vectorizată, relativ eficientă în MATLAB/OCTAVE. Se construiesc matricele:

```
V = [ 1        a − x1   ...  a − x1 ]
    [ a − x2   1        ...  a − x2 ]
    [ ...      ...      ...  ...    ]
    [ a − xn   a − xn   ...  1      ]

U = [ 1        x2 − x1  ...  xn − x1 ]
    [ x1 − x2  1        ...  xn − x2 ]
    [ ...      ...      ...  ...     ]
    [ x1 − xn  x2 − xn  ...  1       ]
```

Atunci:

```
L = [l1 l2 ... ln] = prod(V) ./ prod(U)
```

și valoarea polinomului în `a` este:

```
b = Σ_{i=1}^{n} l_i · y_i = (prod(V) ./ prod(U)) * y
```

Construcția vectorizată a matricelor:

```
U = diag(x)*ones(n) − ones(n)*diag(x) + eye(n)
V = (a − diag(x)) .* ~eye(n) + eye(n)
```

---

## 3. Metoda Neville

(Eric Harold Neville, 1889–1961, mat. englez)

Polinomul de interpolare de grad `n` poate fi calculat **prin recurență**, folosind polinoame de interpolare de grad mai mic.

### Formularea generală (curs)

Dacă notăm `σ = {i1, i2, ..., ip}` și `Pσ` polinomul de interpolare ce trece prin punctele `(x_{i1}, y_{i1}), (x_{i2}, y_{i2}), ..., (x_{ip}, y_{ip})`, atunci polinomul de interpolare pentru ansamblul extins `σ + j + k = σ ∪ {j, k}` se definește astfel:

```
P_{σ+j+k}(x) = [ (x − x_j)·P_{σ+k}(x) − (x − x_k)·P_{σ+j}(x) ] / (x_k − x_j)
```

Se observă că `P_{σ+j+k}(x_i) = y_i` pentru orice `i` din `σ+j+k`.

Metoda Neville consideră concret:

```
Q_{i,j}(x) = [ (x − x_{i−j})·Q_{i,j−1}(x) − (x − x_i)·Q_{i−1,j−1}(x) ] / (x_i − x_{i−j})
```

unde `Q_ij = P_{i−j,...,i}` și trece prin punctele `(x_{i−j}, y_{i−j}), ..., (x_i, y_i)`.

### Formularea din laborator

Se folosește notația `P_ij(x)` pentru polinomul de interpolare de grad `j − i` care trece prin punctele `(x_l, f(x_l))`, `l = i, i+1, ..., j`. Relația de recurență:

```
P_ij(x) = [(x − x_j)/(x_i − x_j)] · P_{i,j−1}(x) + [(x_i − x)/(x_i − x_j)] · P_{i+1,j}(x),   0 ≤ i < j ≤ n
```

cu inițializarea:

```
P_ii(x) = f(x_i),   i = 0 : n
```

### Schema iterativă

În prima iterație se construiesc polinoame de grad 0 (`P_ii`). În următoarea iterație, orice două polinoame de grad 0 alăturate, `P_ii` și `P_{i+1,i+1}`, formează un polinom de grad 1, `P_{i,i+1}`. Procesul continuă până se obține `P_{0,n}`, care trece prin toate cele `n+1` puncte.

Pentru `n = 3`:

```
P00 = f(x0)
            ↘
              P01
            ↗     ↘
P11 = f(x1)         P02
            ↘     ↗     ↘
              P12          P03
            ↗     ↘     ↗
P22 = f(x2)         P13
            ↘     ↗
              P23
            ↗
P33 = f(x3)
```

### Implementare (OCTAVE)

```octave
function yi = Neville(x, y, xi)
  n = length(x);
  for k = 1 : n-1
    for i = 1 : n-k
      raport = (xi - x(k+i)) / (x(i) - x(k+i));
      y(i) = raport*y(i) + (1-raport)*y(i+1);
    endfor
  endfor
  yi = y(1);
endfunction
```

---

## 4. Diferențe divizate

### Definiție

```
F0[x0] = f(x0)

F1[x0, x1] = (F0[x0] − F0[x1]) / (x0 − x1)

Fp[x0, ..., xp] = (F_{p−1}[x0, ..., x_{p−1}] − F_{p−1}[x1, ..., xp]) / (x0 − xp)
```

Forma explicită (se deduce prin inducție):

```
Fp[x0, ..., xp] = Σ_{k=0}^{p} f(x_k)/π'(x_k) = Σ_{k=0}^{p} f(x_k) / Π_{i=0, i≠k}^{p} (x_k − x_i)
```

### Cazul punctelor confundate (derivate)

```
F1[x1, x1] = lim_{x0→x1} F1[x0, x1] = lim_{x0→x1} (f(x0) − f(x1))/(x0 − x1) = f'(x1)

F_{p−1}[x1, x1, ..., x1]  (de p ori)  = f^{(p−1)}(x1)
```

care se deduce tot prin inducție.

### Identitatea lui Newton

(Isaac Newton, 1642–1727)

Stabilește o altă formă pentru polinomul de interpolare Lagrange, care **pune în evidență expresia erorii**:

```
(x − x0) · F1[x, x0] = f(x) − f(x0)

(x − x0)(x − x1) · F2[x, x0, x1] = F1[x, x0] − F1[x0, x1]

(x − x0)(x − x1)(x − x2) · F3[x, x0, x1, x2] = F2[x, x0, x1] − F2[x0, x1, x2]

...

(x − x0)...(x − x_{n−1})(x − x_n) · F_{n+1}[x, x0, ..., x_n] = F_n[x, x0, ..., x_{n−1}] − F_n[x0, x1, ..., x_n]
```

Sumând toate egalitățile obținem:

```
f(x) = f(x0) + (x − x0)·F1[x0, x1] + (x − x0)(x − x1)·F2[x0, x1, x2] + ...
     + (x − x0)...(x − x_{n−1})·F_n[x0, ..., x_n]
     + (x − x0)...(x − x_n)·F_{n+1}[x, x0, ..., x_n]
```

Notând cu `Pn(x)` prima parte:

```
f(x) = Pn(x) + Rn(x)
Rn(x) = (x − x0)...(x − x_n) · F_{n+1}[x, x0, ..., x_n]
```

### Deducerea erorii

Polinomul `Rn(x)` are `n+1` rădăcini, `R'n(x)` va avea `n` rădăcini, ș.a.m.d., deci `R^{(n)}_n(x)` va avea o rădăcină.

Dar `R^{(n)}_n(x) = f^{(n)}(x) − P^{(n)}_n(x)` și știm că:

```
P^{(n)}_n(x) = n! · F_n[x0, x1, ..., x_n]
```

Atunci ecuația

```
f^{(n)}(x) − n!·F_n[x0, x1, ..., x_n] = 0
```

are soluția `ξ`, deci rezultă:

```
F_n[x0, x1, ..., x_n] = f^{(n)}(ξ) / n! ,    ξ ∈ [x0, x_n]
```

Aplicând modulul în expresia restului:

```
|Rn(x)| ≤ |(x − x0)...(x − x_n)| · |f^{(n+1)}(ξ)| / (n+1)!
```

### Teorema erorii de interpolare

> Fie `x0, x1, ..., xn` un set de puncte distincte din `[a,b]` și `f` o funcție de clasă `C^{n+1}` pe `[a,b]`. Atunci pentru orice `x` din `[a,b]` există un `ξ = ξ(x)` între punctele `x0, x1, ..., xn` (deci în `[a,b]`) astfel încât:
> ```
> f(x) = P(x) + [f^{(n+1)}(ξ(x)) / (n+1)!] · (x − x0)(x − x1)...(x − x_n)
> ```
> unde `P(x)` este polinomul Lagrange.

---

## 5. Diferențe finite

Se consideră puncte **echidistante** `x_i = x0 + i·h`.

### Diferențe progresive (înainte)

```
Δf(x_i) = f(x_i + h) − f(x_i) = f(x_{i+1}) − f(x_i)
Δ^k f(x_i) = Δ^{k−1} f(x_{i+1}) − Δ^{k−1} f(x_i)
```

### Diferențe regresive (înapoi)

```
∇f(x_i) = f(x_i) − f(x_i − h) = f(x_i) − f(x_{i−1})
∇^k f(x_i) = ∇^{k−1} f(x_i) − ∇^{k−1} f(x_{i−1})
```

### Diferențe centrate

```
δf(x_i) = f(x_i + h/2) − f(x_i − h/2) = f(x_{i+1/2}) − f(x_{i−1/2})
δ^k f(x_i) = δ^{k−1} f(x_{i+1/2}) − δ^{k−1} f(x_{i−1/2})
```

### Legătura cu diferențele divizate

```
Δ^n f(x_i) = ∇^n f(x_{i+n}) = δ^n f(x_{i+n/2}) = n! · h^n · F_n[x_i ... x_{i+n}]
```

de unde:

```
F_k[x0, x1, ..., x_k] = Δ^k f(x0) / (k! · h^k)
```

---

## 6. Formulele de interpolare Newton (Newton–Gregory)

Fie `f` cunoscută în punctele `(x_i, y_i)`, `i = 0:n`, cu `x_{i+1} = x_i + h`, și vrem să evaluăm `f` într-un punct `x ≠ x_i`.

Vom considera `x ∈ (x0, x1)` sau `x ∈ (x_{n−1}, x_n)`, fără a restrânge generalitatea: dacă `x` se află la mijloc, nu mai consider primele sau ultimele valori unde `f` este cunoscută și reduc problema la unul din cele două cazuri.

### Caz 1 (la început de tablou) → Newton 1

`x = x0 + u·h`, cu `0 < u < 1`. Aplicând identitatea lui Newton cu diferențe divizate exprimate prin diferențe progresive:

```
P1(x0 + u·h) = p1(u) = f(x0) + [(x − x0)/(1!·h)]·Δf(x0) + [(x−x0)(x−x1)/(2!·h²)]·Δ²f(x0)
             + ... + [(x−x0)(x−x1)...(x−x_{n−1})/(n!·h^n)]·Δ^n f(x0)
```

Și pentru că `x − x_k = x − x0 − (x_k − x0) = u·h − k·h = (u − k)h`, rezultă:

```
p1(u) = f0 + (u/1!)·Δf0 + [u(u−1)/2!]·Δ²f0 + ... + [u(u−1)...(u−n+1)/n!]·Δ^n f0
```

De unde, folosind conceptul generalizat de combinări, obținem **formula de interpolare Newton 1**:

```
p1(u) = f0 + C(u,1)·Δf0 + C(u,2)·Δ²f0 + ... + C(u,n)·Δ^n f0
```

### Caz 2 (la sfârșit de tablou) → Newton 2

`x = x_n − u·h`, cu `0 < u < 1`, aplicând identitatea Newton cu diferențe **regresive**:

```
p2(u) = f_n − C(u,1)·∇f_n + C(u,2)·∇²f_n + ... + (−1)^n·C(u,n)·∇^n f_n
```

### Caz 3 → Newton 3

`x = x_n + u·h`, cu `−1 < u < 0`:

```
p3(u) = f_n + C(u,1)·∇f_n + C(u+1,2)·∇²f_n + ... + C(u+n−1, n)·∇^n f_n
```

---

## 7. Interpolarea Hermite

(Charles Hermite, 1822–1901, mat. francez)

La condițiile ca polinomul de interpolare să treacă prin punctele date, `P_{2n+1}(x_i) = f(x_i)`, se mai adaugă și **derivatele**, `P'_{2n+1}(x_i) = f'(x_i)`, `i = 0:n`, de unde rezultă `2n+2` condiții de interpolare. Deci polinomul de interpolare Hermite are gradul `2n+1`:

```
H_{2n+1}(x) = Σ_{j=0}^{n} f(x_j)·H_{n,j}(x) + Σ_{j=0}^{n} f'(x_j)·Ĥ_{n,j}(x)
```

unde

```
H_{n,j}(x) = [1 − 2(x − x_j)·L'_{n,j}(x_j)] · L²_{n,j}(x)
Ĥ_{n,j}(x) = (x − x_j) · L²_{n,j}(x)
```

iar `L_{n,j} = l_j` sunt multiplicatorii Lagrange:

```
l_k(x) = Π_{i=0, i≠k}^{n} (x − x_i)/(x_k − x_i)
```

de unde:

```
l'_k(x) = Π_{i=0, i≠k}^{n} 1/(x_k − x_i)
```

---

## 8. Fenomenul de oscilație (funcția Runge)

Dacă ne propunem să aproximăm funcția

```
f(x) = 1 / (1 + 25x²)
```

numită **funcția lui Carl Runge** (1901), pe intervalul `[-1, 1]` cu puncte echidistante, polinomul de interpolare oscilează puternic la capetele intervalului. Cu 5 puncte echidistante oscilațiile sunt moderate; cu **11 puncte echidistante oscilațiile devin mult mai mari** (amplitudini care depășesc valorile funcției).

**Concluzie:** creșterea gradului polinomului de interpolare nu îmbunătățește neapărat aproximarea — de aici motivația pentru interpolarea pe porțiuni (spline).

---

## 9. Interpolare Spline — noțiuni generale

Curbele în general pot fi reprezentate **explicit, implicit sau parametric** (dependent de coordonate).

Un **SPLINE** este o curbă parametrică definită prin punctele de control. Formal, un SPLINE este o funcție `S: [a,b] → R` definită **local** pe mai multe intervale prin funcțiile `P_i: [x_i, x_{i+1}) → R`, cu `a = x0 < x1 < ... < x_{k−1} = b`, unde:

```
S(x) = P0(x),    a ≤ x < x1
...
S(x) = P_{k−2}(x),  x_{k−2} ≤ x < x_{k−1}
```

De obicei:

- funcțiile `P_i` sunt **polinoame de grad 3**;
- dacă punctele `x_i` sunt echidistante → **SPLINE uniform**;
- funcțiile SPLINE pot fi de **interpolare** (trec prin toate punctele de control) sau de **aproximare** (nu trec prin toate punctele de control).

Adobe și PostScript folosesc SPLINE-uri cu continuitate de clasă C1.

---

## 10. SPLINE de clasă C1 — polinoame liniare

Fie `x0 < x1 < ... < x_n` cu valorile `f(x0), f(x1), ..., f(x_n)`. Considerăm funcții de interpolare liniare, locale pe subintervalele `[x0,x1], [x1,x2], ..., [x_{n−1},x_n]`:

```
p_i(x) = a_i·x + b_i ,   i = 0 : n−1
```

Cei `2n` parametri se determină din:

**Condițiile de interpolare:**
```
p_i(x_i) = f(x_i),   i = 0 : n−1
p_{n−1}(x_n) = f(x_n)
```

**Condițiile de racordare** (continuitate în punctele interioare):
```
p_i(x_{i+1}) = p_{i+1}(x_{i+1}),   i = 0 : n−2
```

Rezultă:

```
a_i = [f(x_{i+1}) − f(x_i)] / (x_{i+1} − x_i)
b_i = [x_{i+1}·f(x_i) − x_i·f(x_{i+1})] / (x_{i+1} − x_i)
```

---

## 11. SPLINE de clasă C1 — polinoame de grad 3 (Hermite)

Aici este necesar să cunoaștem **și valoarea derivatei** funcției în punctele suport: `f'(x0), f'(x1), ..., f'(x_n)`.

### Forma polinomului

```
s_i(x) = a_i + b_i(x − x_i) + c_i(x − x_i)² + d_i(x − x_i)³
```

sau **parametric**, cu schimbarea de variabilă

```
t = (x − x_i)/(x_{i+1} − x_i) = (x − x_i)/h_i ,   h_i = x_{i+1} − x_i
```

```
s_i(t) = a_i + b_i·h_i·t + c_i·h_i²·t² + d_i·h_i³·t³ ,   t ∈ [0,1]
```

### Baza Bernstein

(Sergei Natanovich Bernstein, 1880–1968, mat. rus)

De obicei se folosește baza Bernstein pentru simplificarea volumului de calcul:

```
(1 − t)³ ,  3t(1 − t)² ,  3t²(1 − t) ,  t³ ,    t ∈ [0,1]
```

Deci `s_i` se rescriu astfel:

```
s_i(t) = a'_i(1 − t)³ + 3b'_i·t(1 − t)² + 3c'_i·t²(1 − t) + d'_i·t³ ,   i = 0 : n−1
```

### Condițiile pentru cei 4n coeficienți

**2n+2 condiții de interpolare de tip Hermite:**
```
s_i(x_i) = f(x_i),        i = 0 : n−1
s_{n−1}(x_n) = f(x_n)
s'_i(x_i) = f'(x_i),      i = 0 : n−1
s'_{n−1}(x_n) = f'(x_n)
```

**2n−2 condiții de racordare** (continuitate și derivabilitate în punctele interioare):
```
s_i(x_{i+1}) = s_{i+1}(x_{i+1}),    i = 0 : n−2
s'_i(x_{i+1}) = s'_{i+1}(x_{i+1}),  i = 0 : n−2
```

### Soluția (coeficienții în baza Bernstein)

```
a'_i = f(x_i),                        i = 0 : n−1
b'_i = f(x_i) + (h_i/3)·f'(x_i),      i = 0 : n−1
c'_i = f(x_{i+1}) − (h_i/3)·f'(x_{i+1}),  i = 0 : n−1
d'_i = f(x_{i+1}),                    i = 0 : n−1
```

Forma explicită:

```
s_i(t) = y_i(1 − t)³ + (3y_i + h_i·y'_i)·t(1 − t)² + (3y_{i+1} − h_i·y'_{i+1})·t²(1 − t) + y_{i+1}·t³
```

Forma în variabila `x` se obține prin schimbarea de variabilă `t = (x − x_i)/h_i`.

---

## 12. SPLINE de clasă C2 — polinoame de grad 3

Forma pe fiecare subinterval:

```
s_i(x) = a_i + b_i(x − x_i) + c_i(x − x_i)² + d_i(x − x_i)³ ,   i = 0 : n−1
```

### Condițiile pentru cei 4n coeficienți

**n+1 condiții de interpolare de tip Lagrange** (doar valorile, nu și derivatele):
```
s_i(x_i) = f(x_i),     i = 0 : n−1
s_{n−1}(x_n) = f(x_n)
```

de unde rezultă direct `a_i = f(x_i)`, `i = 0 : n`.

**3n−3 condiții de racordare** (continuitate, derivabilitate și curbură între spline-uri vecine):

- **continuitate de ordin 0** (n−1 condiții):
```
s_i(x_{i+1}) = s_{i+1}(x_{i+1})
a_{i+1} = a_i + b_i·h_i + c_i·h_i² + d_i·h_i³ ,    i = 0 : n−2
a_n ≡ a_{n−1} + b_{n−1}h_{n−1} + c_{n−1}h²_{n−1} + d_{n−1}h³_{n−1}
```

- **continuitate a derivatelor de ordin 1** (n−1 condiții):
```
s'_i(x) = b_i + 2c_i(x − x_i) + 3d_i(x − x_i)²
s'_i(x_{i+1}) = s'_{i+1}(x_{i+1}) ,    i = 0 : n−2
b_{i+1} = b_i + 2c_i·h_i + 3d_i·h_i²
b_n ≡ b_{n−1} + 2c_{n−1}h_{n−1} + 3d_{n−1}h²_{n−1}
```

- **continuitate a derivatelor de ordin 2** (n−1 condiții):
```
s''_i(x) = 2c_i + 6d_i(x − x_i)
s''_i(x_{i+1}) = s''_{i+1}(x_{i+1}) ,   i = 0 : n−2
c_{i+1} = c_i + 3d_i·h_i
c_n ≡ c_{n−1} + 3d_{n−1}h_{n−1}
```

### Nevoia de două condiții suplimentare

Adunând numărul condițiilor de interpolare `(n+1)` cu numărul condițiilor de racordare `(3n−3)` obținem `4n−2` condiții, dar avem `4n` necunoscute — deci mai avem nevoie de **încă două**. În acest context se definesc:

- **SPLINE natural:**
```
s''0(x0) = 0 ,    s''_{n−1}(x_n) = 0
```

- **SPLINE tensionat:**
```
s'0(x0) = f'(x0) ,    s'_{n−1}(x_n) = f'(x_n)
```

### Calculul parametrilor (totul în funcție de `c_i`)

```
a_i = f(x_i),                                     i = 0 : n
d_i = (c_{i+1} − c_i) / (3h_i),                   i = 0 : n−1
b_i = (a_{i+1} − a_i)/h_i − (h_i/3)(2c_i + c_{i+1}),   i = 0 : n−1
```

(echivalent, forma din curs: `b_i = (a_i − a_{i−1})/h_{i−1} + [(c_{i−1} + 2c_i)/3]·h_{i−1}`, `i = 1 : n−1`)

Relația de recurență centrală:

```
h_{i−1}·c_{i−1} + 2(h_{i−1} + h_i)·c_i + h_i·c_{i+1} = 3(a_{i+1} − a_i)/h_i − 3(a_i − a_{i−1})/h_{i−1}
```

Coeficienții `c_i` se obțin rezolvând un **sistem tridiagonal** `Ax = b`.

### Sistemul pentru SPLINE natural

Din condițiile suplimentare:

```
s''0(x0) = 2c0 + 6d0(x0 − x0) = 0  ⇒  c0 = 0
s''_{n−1}(x_n) = 2c_{n−1} + 6d_{n−1}h_{n−1} ≡ 2c_n = 0  ⇒  c_n = 0
```

Sistemul:

```
[ 1        0             0        ...    0        ]   [ c0    ]   [ 0                                      ]
[ h0   2(h0+h1)         h1        ...    0        ]   [ c1    ]   [ 3(a2−a1)/h1 − 3(a1−a0)/h0              ]
[ 0       h1        2(h1+h2)  h2  ...    0        ] · [ ...   ] = [ ...                                    ]
[ ...              h_{n−2}  2(h_{n−2}+h_{n−1})  h_{n−1} ] [c_{n−1}] [ 3(a_n−a_{n−1})/h_{n−1} − 3(a_{n−1}−a_{n−2})/h_{n−2} ]
[ 0        0             0        ...    1        ]   [ c_n   ]   [ 0                                      ]
```

### Sistemul pentru SPLINE tensionat

Din condițiile suplimentare (`s'0(x0) = f'(x0)` și `s'_{n−1}(x_n) = f'(x_n)`):

```
2h0·c0 + h0·c1 = 3(a1 − a0)/h0 − 3f'(x0)
h_{n−1}·c_{n−1} + 2h_{n−1}·c_n = 3f'(x_n) − 3(a_n − a_{n−1})/h_{n−1}
```

Sistemul:

```
[ 2h0      h0            0       ...   0        ]   [ c0    ]   [ 3(a1−a0)/h0 − 3f'(x0)                  ]
[ h0    2(h0+h1)        h1       ...   0        ]   [ c1    ]   [ 3(a2−a1)/h1 − 3(a1−a0)/h0              ]
[ 0        h1       2(h1+h2)  h2 ...   0        ] · [ ...   ] = [ ...                                    ]
[ ...            h_{n−2}  2(h_{n−2}+h_{n−1})  h_{n−1} ] [c_{n−1}] [ 3(a_n−a_{n−1})/h_{n−1} − 3(a_{n−1}−a_{n−2})/h_{n−2} ]
[ 0        0        0    h_{n−1}   2h_{n−1}     ]   [ c_n   ]   [ 3f'(x_n) − 3(a_n−a_{n−1})/h_{n−1}      ]
```

**Observație:** funcția spline `s_n` a fost introdusă doar pentru a ajuta la calcularea funcțiilor `s_i`, `i = 0 : n−1`.

---

## 13. Curbe Hermite

Orice funcție Spline formată din polinoame de grad 3 și care respectă condițiile Hermite se numește **curbă Hermite**.

```
Q(t) = a·t³ + b·t² + c·t + d = [t³  t²  t  1] · [a b c d]^T
Q'(t) = 3a·t² + 2b·t + c = [0  3t²  2t  1] · [a b c]^T  (aliniat corespunzător)
```

Impunem restricțiile:

```
Q(0) = P1 ,  Q(1) = P2    și    Q'(0) = P'1 ,  Q'(1) = P'2
```

Numim **geometrie** sau **vector de control**:

```
G_H = [ P1  P2  P'1  P'2 ]^T
```

Identificând:

```
Q(0) = d           ⇒   a = 2P1 − 2P2 + P'1 + P'2
Q(1) = a + b + c + d   ⇒   b = −3P1 + 3P2 − 2P'1 − P'2
Q'(0) = c          ⇒   c = P'1
Q'(1) = 3a + 2b    ⇒   d = P1
```

Forma matricială:

```
Q(t) = [t³  t²  t  1] · [  2  −2   1   1 ] · [ P1  ]  = T^T · M_H · G_H
                        [ −3   3  −2  −1 ]   [ P2  ]
                        [  0   0   1   0 ]   [ P'1 ]
                        [  1   0   0   0 ]   [ P'2 ]
```

Dezvoltat:

```
Q(t) = (2t³ − 3t² + 1)·P1 + (−2t³ + 3t²)·P2 + (t³ − 2t² + t)·P'1 + (t³ − t²)·P'2
```

Ultima expresie evidențiază contribuția fiecărui punct de control asupra formei curbei, prin intermediul unor **funcții de îmbinare** (*blending functions*): `h00, h10, h01, h11`.

---

## 14. Polinoame Bernstein

```
B^n_i(t) = C(n,i) · t^i · (1 − t)^{n−i} ,   i = 0 : n
```

Sunt generate din dezvoltarea `[t + (1−t)]^n = 1` și au următoarele proprietăți:

- **Nenegativitate:** `B^n_i > 0`, pentru `t ∈ (0,1)`;
- **Partiția unității:** `Σ_{i=0}^{n} B^n_i(t) = 1`;
- **Simetrie:** `B^n_i(t) = B^n_{n−i}(1 − t)`;
- **Maxim unic** în `t = i/n` pe `[0,1]`;
- **Formula de recurență:** `B^n_i(t) = (1 − t)·B^{n−1}_i(t) + t·B^{n−1}_{i−1}(t)`, `i = 0 : n`;
- **Derivare:**
```
d/dt B^n_i(t) = { −n·B^{n−1}_i           , i = 0
                { n·(B^{n−1}_{i−1}(t) − B^{n−1}_i(t)) , 0 < i < n
                { n·B^{n−1}_{i−1}(t)     , i = n
```

---

## 15. Curbe Bézier

Se numesc după **Pierre Étienne Bézier** (1910–1999, inginer francez care folosea aceste curbe pentru modelarea caroseriilor mașinilor Renault), dar se pare că prima descriere a fost făcută de **Paul de Casteljau** (n. 1930, fizician și matematician francez care în 1959, lucrând la Citroën, a produs un algoritm de calcul al unei clase de funcții). De aici și denumirile de curbe De Casteljau sau curbe Bézier.

### Definiție

Fiind dată o mulțime de `n+1` puncte `P0, P1, ..., Pn` (`P0` și `Pn` se numesc **puncte de interpolare**, iar `P1 ... P_{n−1}` **puncte de control**), curba Bézier de grad `n` are forma parametrică:

```
B(t) = Σ_{i=0}^{n} P_i · B_{i,n}(t) ,    t ∈ [0,1]
```

unde `B_{i,n}` sunt polinoamele Bernstein de grad `n`.

Poligonul ce unește cele `n+1` puncte de control se numește **poligon Bézier** și conține în interiorul său curba Bézier.

### Proprietăți

- **Proprietatea punctelor de capăt:** curba începe în `P0` și se termină în `Pn`, adică `B(0) = P0`, `B(1) = Pn`. Spre deosebire de funcțiile spline, curba Bézier **nu trece prin toate punctele** `P0, ..., Pn`, ci doar prin `P0` și `Pn`.
- Curba Bézier este **liniară** numai dacă punctele de control sunt coliniare.
- Curba Bézier este **tangentă** segmentelor `P0P1` și `P_{n−1}P_n`.
- Orice curbă Bézier este conținută complet în **înfășurătoarea convexă** a punctelor de control.
- O curbă Bézier poate fi separată în alte două curbe Bézier.
- **Transformările afine** (translația și rotația) aplicate punctelor de control au același efect cu aplicarea transformării afine asupra curbei.
- Gradul polinomului depinde de numărul punctelor de control; modificarea poziției unui punct de control afectează forma curbei.

### Bézier cubică (4 puncte)

```
B(t) = P0(1−t)³ + 3P1·t(1−t)² + 3P2·t²(1−t) + P3·t³

     = [t³  t²  t  1] · [ −1   3  −3   1 ] · [ P0 ]
                        [  3  −6   3   0 ]   [ P1 ]
                        [ −3   3   0   0 ]   [ P2 ]
                        [  1   0   0   0 ]   [ P3 ]
```

cu `t ∈ [0,1]`. PostScript și GIMP folosesc curbe Bézier cubice pentru reprezentarea literelor.

### Funcțiile de îmbinare

Funcțiile de îmbinare pentru spline-ul Bézier sunt chiar polinoamele Bernstein `B^3_i`:

```
p(t) = [ (1−t)³  3t(1−t)²  3t²(1−t)  t³ ] · [ P0  P1  P2  P3 ]^T
```

Cazuri de grad mic:

```
Liniar:   B1(P0, P1, t) = (1−t)P0 + t·P1 ,                      t ∈ [0,1]
Pătratic: B2(P0, P1, P2, t) = (1−t)²P0 + 2t(1−t)P1 + t²P2 ,     t ∈ [0,1]
```

### Trecerea de la Hermite la Bézier

Spline-urile Bézier folosesc, în locul derivatelor, **două puncte suplimentare de control** care exprimă derivatele în `P0` și `P3`:

```
P'1 = 3(P1 − P0)
P'2 = 3(P3 − P2)
```

Trecerea se face astfel:

```
[ P1  ]   [ 1  0  0  0 ]   [ P0 ]
[ P2  ] = [ 0  0  0  1 ] · [ P1 ]
[ P'1 ]   [−3  3  0  0 ]   [ P2 ]
[ P'2 ]   [ 0  0 −3  3 ]   [ P3 ]

G_Hermite = M_{H←B} · G_Bezier
```

și deci `M_Bezier = M_H · M_{H←B}`.

---

## 16. Algoritmul De Casteljau

Într-o abordare directă, calcularea unui punct de pe o curbă Bézier se face din ecuația parametrică `B(t) = Σ P_i B^n_i(t)`. Această metodă este **ineficientă**, deoarece numerele mici ridicate la puteri mari generează erori mari.

Algoritmul De Casteljau este o modalitate eficientă de calculare a unui punct de pe curbă. Este puțin mai lent, **dar numeric stabil**, și cu ajutorul lui putem obține detalii despre curbă:

- vectorul tangent într-un punct de pe curbă (prin calculul derivatei);
- **divizarea** curbei Bézier în alte curbe Bézier.

### Relația de recurență

```
P^{(0)}_i = P_i ,                                          i = 0 : n
P^{(j)}_i = P^{(j−1)}_i (1 − t0) + P^{(j−1)}_{i+1} · t0 ,   j = 1 : n,  i = 0 : n−j
```

**Interpretare geometrică:** fie `P^{(0)}_i` și `P^{(0)}_{i+1}` două puncte succesive și `P^{(1)}_i` punctul care împarte segmentul `P^{(0)}_i P^{(0)}_{i+1}` în raportul `t/(1−t)`. `P^{(1)}_i` este o combinație liniară a celor două puncte:

```
P^{(1)}_i = (1 − t)·P^{(0)}_i + t·P^{(0)}_{i+1}
```

Se formează astfel poligonul `P^{(1)}_0, P^{(1)}_1, ..., P^{(1)}_{n−1}`. Se aplică relația de recurență noului poligon, obținându-se `P^{(2)}_0, ..., P^{(2)}_{n−2}`. Repetând procesul de `n` ori, se obține un **singur punct** `P^{(n)}_0`, care se află pe curba Bézier.

### Schema pentru n = 3

```
P^{(0)}_0 = P0
              ↘
                P^{(1)}_0
              ↗          ↘
P^{(0)}_1 = P1             P^{(2)}_0
              ↘          ↗          ↘
                P^{(1)}_1             P^{(3)}_0
              ↗          ↘          ↗
P^{(0)}_2 = P2             P^{(2)}_1
              ↘          ↗
                P^{(1)}_2
              ↗
P^{(0)}_3 = P3
```

(Observați similitudinea structurală cu schema Neville — ambele sunt scheme triunghiulare de interpolare liniară repetată.)

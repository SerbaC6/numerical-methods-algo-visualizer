# Aproximare în sensul CMMP, funcții raționale și Transformata Fourier Rapidă (FFT)

Curs + laborator, Metode Numerice, CS-UPB. Document de teorie consolidat (fără probleme, bibliografie sau date organizatorice).

---

## 1. Motivația: de ce aproximare și nu interpolare

Considerăm o funcție liniară pentru care, din cauza **erorilor de măsurare**, liniaritatea s-a pierdut. Ne aflăm în situația în care, dacă am interpola aceste date, am fi nevoiți să suferim consecințele perturbațiilor (polinomul de interpolare ar trece exact prin fiecare punct eronat).

Dacă am aproxima funcția pornind de la aceste date, **fără a impune ca aproximația să treacă prin punctele date**, atunci am fi avantajați.

---

## 2. Aproximarea liniară în sensul CMMP

Ne-ar interesa o dreaptă `a1·x + a0` care să treacă *printre* punctele date și să aproximeze cât mai bine funcția. Dorim ca eroarea

```
E ≡ E2(a0, a1) = Σ_{i=1}^{m} [ y_i − (a1·x_i + a0) ]²
```

să fie cât mai mică. De aici și titulatura de **„în sensul celor mai mici pătrate"** (CMMP).

### Condiția de minim

Se pune condiția ca derivatele parțiale după `a1` și după `a0` ale lui `E` să fie 0:

```
0 = ∂E/∂a0 = ∂/∂a0 Σ_{i=1}^{m} [y_i − a1x_i − a0]² = 2 Σ_{i=1}^{m} (y_i − a1x_i − a0)(−1)

0 = ∂E/∂a1 = ∂/∂a1 Σ_{i=1}^{m} [y_i − (a1x_i + a0)]² = 2 Σ_{i=1}^{m} (y_i − a1x_i − a0)(−x_i)
```

Adică sistemul normal (SEL 2×2):

```
a0·m   + a1·Σ x_i  = Σ y_i
a0·Σ x_i + a1·Σ x_i² = Σ x_i y_i
```

### Soluția

```
a0 = [ (Σ x_i²)(Σ y_i) − (Σ x_i y_i)(Σ x_i) ] / [ m·(Σ x_i²) − (Σ x_i)² ]

a1 = [ m·(Σ x_i y_i) − (Σ x_i)(Σ y_i) ] / [ m·(Σ x_i²) − (Σ x_i)² ]
```

---

## 3. Aproximarea polinomială în sensul CMMP

Pentru o aproximare mai exactă decât cea liniară, în loc de un polinom de grad 1 considerăm un polinom de grad mai mare:

```
Pn(x) = an x^n + a_{n−1} x^{n−1} + ... + a1 x + a0
```

Trebuie să găsim coeficienții `an, ..., a1, a0` pentru care eroarea

```
E = Σ_{i=1}^{m} (y_i − Pn(x_i))² = Σ y_i² − 2 Σ Pn(x_i)y_i + Σ (Pn(x_i))²
```

este minimă. Dezvoltând `Pn`:

```
E = Σ_{i=1}^{m} y_i² − 2 Σ_{i=1}^{m} ( Σ_{j=0}^{n} a_j x_i^j ) y_i + Σ_{i=1}^{m} ( Σ_{j=0}^{n} a_j x_i^j )²

  = Σ_{i=1}^{m} y_i² − 2 Σ_{j=0}^{n} a_j ( Σ_{i=1}^{m} y_i x_i^j ) + Σ_{j=0}^{n} Σ_{k=0}^{n} a_j a_k ( Σ_{i=1}^{m} x_i^{j+k} )
```

### Condiția de minim

Ca și în cazul liniar, derivatele parțiale ale lui `E` după `a_j` trebuie să fie 0, deci pentru fiecare `j = 0, ..., n`:

```
0 = ∂E/∂a_j = −2 Σ_{i=1}^{m} y_i x_i^j + 2 Σ_{k=0}^{n} a_k Σ_{i=1}^{m} x_i^{j+k}
```

De unde avem `n+1` ecuații cu `n+1` necunoscute (coeficienții `a_j`).

### Sistemul normal

```
a0·Σ x_i^0     + a1·Σ x_i^1     + a2·Σ x_i^2     + ... + an·Σ x_i^n     = Σ y_i x_i^0
a0·Σ x_i^1     + a1·Σ x_i^2     + a2·Σ x_i^3     + ... + an·Σ x_i^{n+1} = Σ y_i x_i^1
                                        ...
a0·Σ x_i^n     + a1·Σ x_i^{n+1} + a2·Σ x_i^{n+2} + ... + an·Σ x_i^{2n}  = Σ y_i x_i^n
```

(toate sumele după `i = 1 : m`)

---

## 4. Cadrul general: spații prehilbertiene

Un **spațiu PH** (prehilbertian) este un dublet `(F, u)`, unde `F` este un spațiu vectorial cu scalari din corpul `R` (sau `C`), iar `u` este un **produs scalar** `u: F×F → R` cu proprietățile:

| Proprietate | Relație |
|---|---|
| liniaritate | `⟨f1+f2, f3⟩ = ⟨f1,f3⟩ + ⟨f2,f3⟩`, `⟨c·f1, f2⟩ = c·⟨f1,f2⟩` |
| comutativitate | `⟨f1, f2⟩ = ⟨f2, f1⟩` |
| definire pozitivă | `⟨f, f⟩ ≥ 0` |
| nesingularitate | `⟨f, f⟩ = 0 ⟺ f = 0` |

Fie `G ⊂ F` un subspațiu de **dimensiune finită** (are un număr finit de elemente liniar independente). Norma unui element `f` din `F` se definește:

```
||f|| = sqrt( ⟨f, f⟩ )
```

**Definiție.** Cel mai bun aproximant în sensul celor mai mici pătrate al unui element `f` din `F` în subspațiul `G` este un element `g*` din `G` cu proprietatea:

```
|| f − g* || = min_{g ∈ G} || f − g ||
```

### Teoreme de caracterizare

**T1 (caracterizare).** `g*` din `G` este cel mai bun aproximant al lui `f` din `F` dacă și numai dacă:

```
⟨ f − g*, g ⟩ = 0 ,   ∀ g ∈ G
```

(condiție de **ortogonalitate** a erorii pe subspațiu)

**T2 (unicitate).** Cea mai bună aproximare în sensul CMMP, `g*` din `G`, a lui `f` din `F` este **unică**.

### Sistemul normal general (Gram)

Dacă `u1, u2, ..., un` este o bază din `G`, atunci orice element `g` din `G` se poate scrie `g = Σ c_k u_k`, deci și `g*`:

```
g* = Σ_{k=1}^{n} c*_k u_k
```

Teorema 1 se transformă în:

```
⟨f − g*, g⟩ = ⟨f − g*, Σ_{j=1}^{n} c_j u_j⟩ = Σ_{j=1}^{n} c_j ⟨f − g*, u_j⟩ = 0
⟨f − g*, u_j⟩ = 0 ,           j = 0 : n
⟨g*, u_j⟩ = ⟨f, u_j⟩
Σ_{k=1}^{n} c*_k ⟨u_k, u_j⟩ = ⟨f, u_j⟩ ,     j = 1 : n
```

De unde rezultă sistemul de ecuații:

```
⟨u1,u1⟩·c1 + ⟨u2,u1⟩·c2 + ... + ⟨un,u1⟩·cn = ⟨f,u1⟩
⟨u1,u2⟩·c1 + ⟨u2,u2⟩·c2 + ... + ⟨un,u2⟩·cn = ⟨f,u2⟩
                        ...
⟨u1,un⟩·c1 + ⟨u2,un⟩·c2 + ... + ⟨un,un⟩·cn = ⟨f,un⟩
```

Este un sistem **simetric și rău condiționat**, al cărui determinant poartă numele de **determinant GRAM**. Deoarece rezolvarea sistemului este anevoioasă, se aleg cazuri particulare, adică **diferite baze**.

### Baze ortonormate și coeficienți Fourier

Pentru o bază **ortonormată** sistemul devine **diagonal**, iar coeficienții

```
c*_k = ⟨f, u_k⟩
```

se numesc **coeficienți Fourier** (Jean Baptiste Joseph Fourier, 1768–1830, mat. și fizician francez).

### Calitatea aproximării

Se evaluează prin distanță:

```
||f − g*||² = ⟨f − g*, f − g*⟩ = ⟨f − g*, f⟩ − ⟨f − g*, g*⟩
                                              └────0────┘
            = ⟨f, f⟩ − ⟨g*, f⟩

||f − g*||² = ||f||² − Σ_{k=1}^{n} c*_k ⟨f, u_k⟩
```

Iar dacă baza este ortonormată avem forma simplificată:

```
||f − g*||² = ||f||² − Σ_{k=1}^{n} (c*_k)²
```

---

## 5. Aproximarea CONTINUĂ în sensul CMMP

Se aleg produsul scalar și norma astfel (cu **funcția pondere** `w(x)`):

```
⟨f, g⟩ = ∫_a^b w(x)·f(x)·g(x) dx

||f|| = sqrt( ∫_a^b w(x)·f²(x) dx )
```

Aproximarea continuă în sensul CMMP, `g*`, a lui `f` pe `C([a,b])` este:

```
∫_a^b w(x)·[f(x) − g*(x)]² dx = min_{g ∈ G} ∫_a^b w(x)·[f(x) − g(x)]² dx
```

Dacă avem o bază `u = {u0, u1, ..., un}` pentru `G`, atunci `g = Σ_{k=0}^{n} c_k u_k` și minimul se obține pentru

```
∂E/∂c_i = 0 ,   i = 0 : n
```

Concret, trebuie satisfăcută **condiția de ortogonalitate**:

```
∫_a^b w(x)·[f(x) − g*(x)]·g(x) dx = 0

Σ_{k=1}^{n} c*_k ∫_a^b w(x)·u_k(x)·u_j(x) dx = ∫_a^b w(x)·f(x)·u_j(x) dx ,   j = 1 : n
```

### 5.1 Baza polinomială

Alegem o bază (`|G| = n+1`) polinomială: `u0(x) = 1, u1(x) = x, ..., un(x) = x^n`, ceea ce implică transformarea sistemului normal în:

```
Σ_{k=0}^{n} c*_k ∫_a^b w(x)·x^{k+j} dx = ∫_a^b w(x)·f(x)·x^j dx ,   j = 0 : n
```

Dar această bază **nu este normată**; pentru a o norma folosim algoritmul **Gram-Schmidt** și obținem `v0, v1, ..., vn`, bază ortonormată:

```
w0 = u0                                     v0 = w0 / ||w0||_2
w1 = u1 − ⟨u1, v0⟩·v0                       v1 = w1 / ||w1||_2
...
wm = um − Σ_{p=0}^{m−1} ⟨um, vp⟩·vp         vm = wm / ||wm||_2
```

### 5.2 Aproximarea continuă TRIGONOMETRICĂ

Se referă la alegerea bazei ortogonale cu `2n+1` componente:

```
1/√2 ,  sin(x), cos(x), ... , sin(nx), cos(nx)
```

și funcția pondere `w(x) = 1`. Relațiile de ortogonalitate:

```
(1/π) ∫_0^{2π} u_q(x)·u_r(x) dx = δ_qr = { 0,  q ≠ r
                                          { 1,  q = r
```

Deci sistemul GRAM devine diagonal, iar coeficienții lui `g*` se deduc astfel:

```
a0 = ⟨f, u0⟩ = (1/(π√2)) ∫_0^{2π} f(x) dx

b1 = (1/π) ∫_0^{2π} f(x)·sin x dx          a1 = (1/π) ∫_0^{2π} f(x)·cos x dx

bp = (1/π) ∫_0^{2π} f(x)·sin px dx         ap = (1/π) ∫_0^{2π} f(x)·cos px dx

g* = a0/√2 + Σ_{p=1}^{n} ( ap·cos px + bp·sin px )
```

### 5.3 Aproximarea continuă CEBÂȘEV (Chebyshev)

Se referă la alegerea bazei ca `n+1` polinoame Cebâșev:

```
1/√2 ,  T1(x), T2(x), ... , Tn(x)
```

care sunt ortogonale, și a funcției pondere corespunzătoare:

```
w(x) = 1 / sqrt(1 − x²)
```

Relațiile de ortogonalitate:

```
∫_{−1}^{1} [ T_q(x)·T_r(x) / sqrt(1 − x²) ] dx = { 0,     q ≠ r
                                                 { π/2,  q = r ≠ 0
                                                 { π,    q = r = 0
```

Sistemul GRAM devine iarăși diagonal, deci coeficienții lui `g*` se deduc din:

```
g*_n(x) = a0/√2 + a1·T1(x) + ... + an·Tn(x)

a0 = (1/(π√2)) ∫_{−1}^{1} f(x)/sqrt(1 − x²) dx

ap = (2/π) ∫_{−1}^{1} [ f(x)·Tp(x) / sqrt(1 − x²) ] dx
```

---

## 6. Aproximarea DISCRETĂ în sensul CMMP

Dacă `f` din `F = C([a,b])` este cunoscută în punctele `(x0, f(x0)), ..., (xp, f(xp))`, se dorește aproximarea optimală în sensul CMMP printr-o funcție `g` din `G` (subspațiu din `F`), cunoscută în aceleași puncte prin `(x0, g(x0)), ..., (xp, g(xp))`.

Considerăm `G` generat de baza `u0(x), u1(x), ..., un(x)` din `F`, iar produsul scalar și norma alese astfel:

```
⟨f, g⟩ = Σ_{i=0}^{n} w(x_i)·f(x_i)·g(x_i)

||f|| = sqrt( Σ_{i=0}^{n} w(x_i)·f²(x_i) )
```

Problema rămâne găsirea lui `g*(x) = Σ c*_k u_k(x)`, adică a coeficienților `c*_k`, cu:

```
|| f(x) − g*(x) || = min_{g ∈ G} || f(x) − g(x) ||
```

Un sistem de funcții **ortonormate discret** satisface condițiile:

```
Σ_{i=0}^{n} w(x_i)·u_j(x_i)·u_k(x_i) = 0 ,   pentru j ≠ k,  j,k = 0 : n
Σ_{i=0}^{n} w(x_i)·u_j²(x_i) = 1
```

### Teorema de caracterizare (varianta discretă)

```
Σ_{i=0}^{p} w(x_i)·[f(x_i) − g*(x_i)]·g(x_i) = 0
```

conduce la **sistemul normal diagonal**:

```
Σ_{k=0}^{n} c*_k Σ_{i=0}^{p} w(x_i)·u_k(x_i)·u_j(x_i) = Σ_{i=0}^{p} w(x_i)·f(x_i)·u_j(x_i) ,   j = 0 : n
```

de unde **coeficienții Fourier** devin:

```
c*_k = Σ_{i=0}^{p} w(x_i)·f(x_i)·u_k(x_i) ,     k = 0 : n
```

### 6.1 Bază polinomială (discret)

```
Σ_{k=0}^{n} c*_k Σ_{i=0}^{p} w(x_i)·x_i^{k+j} = Σ_{i=0}^{p} w(x_i)·f(x_i)·x_i^j ,   j = 0 : n
```

### 6.2 Aproximarea discretă TRIGONOMETRICĂ

Alegem baza trigonometrică cu `2n+1` elemente și funcția pondere `w(x) = 1`:

```
1/√2 , sin(x), cos(x), ... , sin(nx), cos(nx)
```

**Suportul de puncte** este dat de punctele echidistante din `[0, 2π]`:

```
x_k = 2π·k/(2n+2) = kπ/(n+1) ,     k = 1 : 2n+2
```

Din relațiile de ortogonalitate:

```
Σ_{k=1}^{2n+2} u_q(x_k)·u_r(x_k) = { 0,     q ≠ r
                                    { n+1,  q = r        ,   q, r = 1 : 2n+2
```

deducem că sistemul GRAM a devenit diagonal, deci coeficienții lui `g*` se deduc din:

```
a0 = (1/(n+1))·⟨f, 1/√2⟩ = (1/(n+1))·(1/√2)·Σ_{k=1}^{2n+2} f( kπ/(n+1) )

b_j = (1/(n+1))·⟨f, sin jx⟩ = (1/(n+1))·Σ_{k=1}^{2n+2} f( kπ/(n+1) )·sin( jkπ/(n+1) )

a_j = (1/(n+1))·⟨f, cos jx⟩ = (1/(n+1))·Σ_{k=1}^{2n+2} f( kπ/(n+1) )·cos( jkπ/(n+1) )

                                                        j = 1 : n
```

### 6.3 Aproximarea discretă CEBÂȘEV

Alegem baza cu `n+1` elemente și funcția pondere `w(x) = 1`:

```
1/√2 , T1(x), ... , Tn(x)
```

**Suportul de puncte** este dat de rădăcinile polinomului `T_{n+1}(x_k) = 0`, adică:

```
x_k = cos( (2k+1)π / (2n+2) ) ,     k = 0 : n
```

Facem schimbarea de variabilă:

```
x = cos θ   ⇒   θ_k = (2k+1)π/(2n+2)
```

și avem:

```
Σ_{k=0}^{n} T_q(x_k)·T_r(x_k) = Σ_{k=0}^{n} cos(qθ_k)·cos(rθ_k) = (1/2) Σ [ cos((q+r)θ_k) + cos((q−r)θ_k) ]
```

Sistemul GRAM este diagonal, deci:

```
g*(x) = a0/√2 + a1·T1(x) + ... + an·Tn(x)

(n+1)/2 · a0 = ⟨f, u0⟩ = (1/√2) Σ_{k=0}^{n} f_k     ⇒   a0 = (√2/(n+1)) Σ_{k=0}^{n} f_k

(n+1)/2 · a_j = ⟨f, u_j⟩ = Σ_{k=0}^{n} f_k·T_j(x_k)  ⇒   a_j = (2/(n+1)) Σ_{k=0}^{n} f_k·T_j(x_k)
```

---

## 7. Aproximarea cu funcții raționale — aproximarea Padé

### Motivația

Dacă la aproximarea polinomială apar oscilații, aici se dorește ca **aceste oscilații să fie uniforme pe tot intervalul**. Se aproximează o funcție `f` prin:

```
r(x) = p(x)/q(x) = (p0 + p1x + ... + pn x^n) / (q0 + q1x + ... + qm x^m)
```

unde `p` este polinom de grad `n`, `q` polinom de grad `m`, cu `m + n = N`.

Ca `r` să fie definită și în 0, se consideră `q0 ≠ 0`, sau mai degrabă **`q0 = 1`**, fără a restrânge generalitatea (dacă nu, se împarte și sus și jos cu `q0` și obținem 1).

### Condiția Padé

(Henri Eugène Padé, 1863–1953, mat. francez)

Avem `N+1` parametri: `q1, q2, ..., qm` și `p0, p1, ..., pn`. Îi alegem impunând condiția:

```
f^{(k)}(0) = r^{(k)}(0) ,     k = 0, 1, ..., N
```

Este de fapt o **extensie a aproximării Taylor pentru funcții raționale**.

### Derivarea

Considerăm diferența:

```
f(x) − r(x) = f(x) − p(x)/q(x) = [ f(x)q(x) − p(x) ] / q(x)
            = [ f(x)·Σ_{i=0}^{m} q_i x^i − Σ_{i=0}^{n} p_i x^i ] / q(x)
```

Considerăm că `f` are o dezvoltare în serie **Maclaurin** (Colin Maclaurin, 1698–1746, mat. scoțian):

```
f(x) = Σ_{i=0}^{∞} a_i x^i
```

Atunci:

```
f(x) − r(x) = [ Σ_{i=0}^{∞} a_i x^i · Σ_{i=0}^{m} q_i x^i − Σ_{i=0}^{n} p_i x^i ] / q(x)
```

Pentru a respecta condiția `f^{(k)}(0) − r^{(k)}(0) = 0`, alegem la numărător ceva care **să nu aibă niciun termen de grad mai mic sau egal cu N**:

```
(a0 + a1x + ...)(1 + q1x + ... + qm x^m) − (p0 + p1x + ... + pn x^n)
```

Notăm:

```
p_{n+1} = p_{n+2} = ... = p_N = 0
q_{m+1} = q_{m+2} = ... = q_N = 0
```

Coeficientul lui `x^k` de la numărător, scris în forma precedentă, va fi:

```
( Σ_{i=0}^{k} a_i q_{k−i} ) − p_k
```

Și atunci aproximația Padé rezultă din soluționarea **sistemului liniar de N+1 ecuații cu N+1 necunoscute**:

```
Σ_{i=0}^{k} a_i q_{k−i} = p_k ,     k = 0, 1, ..., N
```

---

## 8. Transformata Fourier Rapidă (FFT)

### Problema

La aproximarea discretă trigonometrică în sensul CMMP, coeficienții polinomului `g*` se obțineau din:

```
a_k = (1/m) Σ_{j=0}^{2m−1} y_j cos(k x_j) ,     k = 0, 1, ..., m
b_k = (1/m) Σ_{j=0}^{2m−1} y_j sin(k x_j) ,     k = 1, 2, ..., m−1
```

Interpolarea unui set de `2m` puncte folosind tehnica de calcul **directă** necesită aproximativ `(2m)²` operații de înmulțire și `(2m)²` operații de adunare — deci **4m² operații** — motiv pentru care și eroarea obținută la un număr mare de puncte este foarte mare.

Tehnica directă presupune determinarea polinomului de interpolare trigonometrică pentru cele `2m` puncte `(x_j, y_j)`, cu

```
x_j = −π + (j/m)π ,     j = 0, 1, ..., 2m−1
```

folosind formula:

```
Sm(x) = a0 + (a_m·cos mx)/2 + Σ_{k=1}^{m−1} ( a_k cos kx + b_k sin kx )
```

Se dorește obținerea coeficienților mai eficient, prin calculul altor coeficienți.

### Contextul istoric

În 1965, **Cooley** (James William Cooley, n. 1926, mat. american, IBM) și **Tukey** (John Wilder Tukey, 1915–2000, mat. american, Princeton) au publicat în *Mathematics of Computation* articolul „An Algorithm for the Machine Calculation of Complex Fourier Series", unde au arătat că sunt necesare doar **O(m log m)** operații.

Algoritmul poartă numele de **algoritmul Cooley-Tukey** sau **FFT**. Gilbert Strang (n. 1934, mat. american, MathWorks, prof. MIT) despre FFT: „cel mai important algoritm numeric al vieții noastre". Există și alte versiuni de FFT.

Astfel, numărul de operații pentru obținerea polinomului de interpolare trigonometrică devine de ordinul **miilor** când setul de date este de ordinul miilor, spre deosebire de calculul direct, unde numărul de operații este de ordinul **milioanelor**.

### Coeficienții complecși

În locul evaluării directe a constantelor `a_k` și `b_k`, FFT calculează coeficienții complecși `c_k`:

```
(1/m) Σ_{j=0}^{2m−1} c_k e^{ikx}

unde   c_k = Σ_{j=0}^{2m−1} y_j · e^{ikπj/m} ,     k = 0, 1, ..., 2m−1
```

Odată `c_k` determinați, `a_k` și `b_k` se calculează folosind **formula lui Euler**:

```
e^{iz} = cos z + i·sin z
```

În plus, pentru orice `n` întreg:

```
e^{nπi} = cos nπ + i·sin nπ = (−1)^n
```

astfel încât:

```
a_k + i·b_k = [(−1)^k / m] · c_k
```

cu precizarea că atât `b0` cât și `b_m` sunt egale cu 0 și nu contribuie la rezultatul final.

### Pasul de înjumătățire

Presupunând `m = 2^p` (m este putere a lui 2), pentru orice `k = 0, 1, ..., m−1`:

```
c_k + c_{k+m} = Σ_{j=0}^{2m−1} y_j e^{ikπj/m} + Σ_{j=0}^{2m−1} y_j e^{i(k+m)πj/m}
              = Σ_{j=0}^{2m−1} y_j e^{ikπj/m} (1 + e^{πij})
```

Dar:

```
1 + e^{πij} = { 2,  dacă j este par
              { 0,  dacă j este impar
```

ceea ce înseamnă că **doar m termeni** sunt diferiți de 0 și contribuie la rezultat — deci avem doar `m` adunări.

Dacă înlocuim indicele `j` cu `2j`:

```
c_k + c_{k+m} = 2 Σ_{j=0}^{m−1} y_{2j} e^{ikπ(2j)/m}
```

echivalent cu:

```
c_k + c_{k+m} = 2 Σ_{j=0}^{m−1} y_{2j} e^{ikπj/(m/2)}
```

În mod similar, se scrie și diferența:

```
c_k − c_{k+m} = 2 e^{ikπ/m} Σ_{j=0}^{m−1} y_{2j+1} e^{ikπj/(m/2)}
```

Din cele două relații se pot deduce atât `c_k` cât și `c_{k+m}`, adică **toți cei 2m coeficienți**.

### Analiza complexității

În acest moment, de la `4m²` am ajuns la:

```
m·m + m(m+1) = 2m² + m   operații
```

Pentru că `m` este putere a lui 2, putem repeta procesul, spărgând sumele în două, de la `j = 0` până la `m/2 − 1`:

```
2·[ (m/2)·(m/2) + (m/2)·(m/2 + 1) ] = m² + m
(m² + m) + m = m² + 2m
```

Dacă repetăm procesul de `r` ori, numărul de operații complexe se reduce la:

```
m²/2^{r−2} + m·r
```

Procesul este complet când `r = p + 1`, iar numărul de operații devine:

```
(2^p)²/2^{p−1} + m(p+1) = 2m + pm + m = 3m + m·log2(m) = O(m·log2 m)
```

### Structura recursivă (schema practică)

Procesul ia sfârșit după `p + 1` iterații. Practic, pentru `2m` puncte se construiesc succesiv seturi de constante intermediare (`c_k → d_k → e_k → f_k → ...`), fiecare nivel înjumătățind dimensiunea sumelor. Valorile intermediare **depind doar de `m`, nu de setul de puncte** — pentru fiecare `m` există un set unic de constante.

În practică, algoritmul se aplică **invers**: se pornește de la valorile de la ultimul nivel (care sunt simple multiplicări ale lui `y_j` cu factori de fază) și se recombină nivel cu nivel, prin adunări și scăderi de tip „butterfly", până se obțin coeficienții `c_k`.

Ordinul de mărime al câștigului: pentru `2m = 8` puncte, calculul direct al coeficienților `c_0, ..., c_7` necesită **64 înmulțiri/împărțiri și 56 adunări/scăderi**, în timp ce FFT necesită doar **24 înmulțiri/împărțiri și 24 adunări/scăderi**.

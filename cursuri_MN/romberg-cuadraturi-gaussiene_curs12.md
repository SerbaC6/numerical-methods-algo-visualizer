# Extrapolare Richardson. Metoda Romberg. Cuadraturi adaptive. Cuadraturi Gaussiene

Notițe de teorie (Metode Numerice, CS-UPB). Conținutul provine din laboratorul și cursul aferent; părțile comune sunt scrise o singură dată.

## Context (recapitulare)

Ne propunem să calculăm aproximativ valorile $I[f] = \int_a^b f(x)\,dx$ și $D[f] = f^{(p)}(x_0)$, în condițiile:

- funcția $f$ este continuă pe $[a,b]$;
- primitiva $F$ nu este cunoscută;
- funcția $f$ este cunoscută numai prin valorile $f(x_i)$ pe care le ia într-un număr restrâns de puncte $x_i$, $i = 0 : N$.

Definim o metodă aproximativă de integrare astfel:

$$I_N[f] = \sum_{i=0}^{N} A_{iN}\cdot f(x_{iN}).$$

Metoda este **convergentă** dacă $\lim\limits_{N \to \infty} |I[f] - I_N[f]| = 0$.

---

# Extrapolare Richardson

În 1927, L. F. Richardson (Lewis Fry Richardson, 1881–1953, matematician, fizician și meteorolog englez) și J. A. Gaunt au scris un articol despre această extrapolare.

Se dorește aproximarea unei valori $M$ cu o formulă $N_1(h)$ ce depinde de un parametru, de obicei pasul considerat. Eroarea se exprimă astfel:

$$M - N_1(h) = K_1h + K_2h^2 + K_3h^3 + \cdots,$$

pentru o colecție de constante $K_1, K_2, \dots$

Eroarea fiind $O(h)$, și dacă considerăm că nu sunt variații de ordin de mărime între constantele $K_i$, atunci:

$$M - N_1(0.1) \approx 0.1K_1, \quad M - N_1(0.01) \approx 0.01K_1, \quad M - N_1(h) \approx K_1h.$$

Extrapolarea se referă la combinarea acestor aproximări de tipul $O(h)$ pentru a produce formule de aproximare cu eroare de ordin mai mare, $O(h^2)$ etc. Am vrea ceva de genul:

$$M - N_2(h) = \hat K_2 h^2 + \hat K_3 h^3 + \cdots,$$

adică $M - N_2(0.1) \approx 0.01\hat K_2$, $M - N_2(0.01) \approx 0.0001\hat K_2$. Dacă $K_1$ și $\hat K_2$ au același ordin, atunci evident $N_2(h)$ aproximează mai bine decât $N_1(h)$.

## Obținerea formulelor

Pornim de la

$$M = N_1(h) + K_1h + K_2h^2 + K_3h^3 + \cdots,$$

care este valabilă pentru orice $h$ pozitiv, deci și pentru $h/2$:

$$M = N_1\!\left(\frac{h}{2}\right) + K_1\frac{h}{2} + K_2\frac{h^2}{4} + K_3\frac{h^3}{8} + \cdots$$

Scăzând prima relație din dublul celei de-a doua avem:

$$M = N_1\!\left(\frac{h}{2}\right) + \left[N_1\!\left(\frac{h}{2}\right) - N_1(h)\right] + K_2\left(\frac{h^2}{2} - h^2\right) + K_3\left(\frac{h^3}{4} - h^3\right) + \cdots$$

Definim atunci

$$N_2(h) = N_1\!\left(\frac{h}{2}\right) + \left[N_1\!\left(\frac{h}{2}\right) - N_1(h)\right],$$

iar noua formulă $O(h^2)$ va fi

$$M = N_2(h) - \frac{K_2}{2}h^2 - \frac{3K_3}{4}h^3 - \cdots$$

Se repetă procesul și astfel se obțin aproximări mai bune, de ordin $O(h^2)$, $O(h^4)$, $O(h^6)$, ...

---

# Integrare Romberg

Werner Romberg (1909–2003) a obținut rezultatul în 1955.

În metoda compusă a trapezelor eroarea era exprimată astfel ($h = (b-a)/n$, $x_i = a + ih$):

$$\int_a^b f(x)\,dx = \frac{h}{2}\left[f(a) + 2\sum_{j=1}^{n-1} f(x_j) + f(b)\right] - \frac{(b-a)f''(\mu)}{12}h^2.$$

S-a demonstrat că eroarea se mai poate exprima și astfel:

$$\int_a^b f(x)\,dx = \frac{h}{2}\left[f(a) + 2\sum_{j=1}^{n-1} f(x_j) + f(b)\right] + K_1h^2 + K_2h^4 + K_3h^6 + \cdots$$

unde $K_i$ sunt constante și depind numai de $f^{(2i-1)}(a)$ și $f^{(2i-1)}(b)$.

Ținând seama de extrapolarea Richardson, putem îmbunătăți formulele de aproximare prin alegerea lui $h/2$, adică ajungem la $O(h^4)$, $O(h^6)$ etc.

## Schema de calcul

Notăm aproximările integralei pe $[a,b]$ cu $R_{11}, R_{21}, R_{31}, \dots$ pentru 1 punct, 2 puncte, 4 puncte, 8 puncte, ... considerate în suportul interpolării.

Aplicăm extrapolarea și obținem $O(h^4)$, adică $R_{22}, R_{32}, R_{42}$ etc.:

$$R_{k,2} = R_{k,1} + \frac{1}{3}(R_{k,1} - R_{k-1,1}), \quad k = 2,3,\dots$$

Aplicăm din nou extrapolarea și obținem $O(h^6)$, adică $R_{33}, R_{43}, R_{53}$ etc.:

$$R_{k,3} = R_{k,2} + \frac{1}{15}(R_{k,2} - R_{k-1,2}), \quad k = 3,4,\dots$$

În general, aplicând extrapolarea obținem $O(h^{2j})$:

$$R_{k,j} = R_{k,j-1} + \frac{1}{4^{j-1} - 1}(R_{k,j-1} - R_{k-1,j-1}), \quad k = j, j+1, \dots$$

## Formularea matriceală (varianta din laborator)

Se formează matricea:

$$I = \begin{pmatrix}
I_{11} & & & \\
I_{21} & I_{22} & & \\
I_{31} & I_{32} & I_{33} & \\
\vdots & \vdots & \vdots & \ddots \\
I_{N1} & I_{N2} & \cdots & I_{NN}
\end{pmatrix}$$

în care prima coloană $I_{11}, I_{21}, \dots, I_{N1}$ reprezintă estimările integralelor calculate cu formula compusă, considerând $2^0, 2^1, \dots, 2^{N-1}$ intervale.

> Notă: laboratorul descrie prima coloană ca fiind calculată cu **formula compusă Simpson**, în timp ce cursul (și literatura uzuală) folosește **formula compusă a trapezelor**. Relația de recurență de mai jos este cea standard pentru trapeze.

$I_{N1}$ poate fi obținut prin recurență din $I_{N-1,1}$ cu formula:

$$I_{N,1} = \frac{1}{2}\left[I_{N-1,1} + \frac{b-a}{2^{N-1}}\sum_{i=1,\ \Delta i = 2}^{2^N - 1} f\!\left(a + \frac{b-a}{2^N}i\right)\right]$$

Elementele din coloana $j$ se calculează cu relația de recurență:

$$I_{k,j} = \frac{4^{j-1}I_{k,j-1} - I_{k-1,j-1}}{4^{j-1} - 1}, \quad j = 2 : n,\ k = j : n$$

(echivalentă cu forma $R_{k,j}$ de mai sus).

Fiecare coloană converge către $I$, cu atât mai rapid cu cât este situată mai la dreapta. Pentru o coloană $j$, calculul iterativ este oprit în momentul în care

$$|I_{k,j} - I_{k-1,j}| < \varepsilon \cdot |I_{k,j}|.$$

---

# Cuadraturi adaptive

Prezentăm o metodă bazată pe Simpson. Presupunem că vrem să aproximăm $\int_a^b f(x)\,dx$ cu Simpson, cu pasul $h = (b-a)/2$:

$$\int_a^b f(x)\,dx = S(a,b) - \frac{h^5}{90}f^{(4)}(\xi), \qquad S(a,b) = \frac{h}{3}[f(a) + 4f(a+h) + f(b)],$$

cu $\xi$ între $a$ și $b$.

În continuare vrem să scăpăm de termenul $f^{(4)}$ și pentru aceasta folosim Simpson cu pasul $(b-a)/4 = h/2$:

$$\int_a^b f(x)\,dx = \frac{h}{6}\left[f(a) + 4f\!\left(a + \frac{h}{2}\right) + 2f(a+h) + 4f\!\left(a + \frac{3h}{2}\right) + f(b)\right] - \left(\frac{h}{2}\right)^4\frac{(b-a)}{180}f^{(4)}(\tilde\xi),$$

de unde, notând

$$S\!\left(a, \frac{a+b}{2}\right) = \frac{h}{6}\left[f(a) + 4f\!\left(a+\frac{h}{2}\right) + f(a+h)\right], \qquad S\!\left(\frac{a+b}{2}, b\right) = \frac{h}{6}\left[f(a+h) + 4f\!\left(a + \frac{3h}{2}\right) + f(b)\right],$$

avem

$$\int_a^b f(x)\,dx = S\!\left(a, \frac{a+b}{2}\right) + S\!\left(\frac{a+b}{2}, b\right) - \frac{1}{16}\left(\frac{h^5}{90}\right)f^{(4)}(\tilde\xi).$$

Dacă considerăm $f^{(4)}(\tilde\xi) \approx f^{(4)}(\xi)$, obținem:

$$S\!\left(a, \frac{a+b}{2}\right) + S\!\left(\frac{a+b}{2}, b\right) - \frac{1}{16}\left(\frac{h^5}{90}\right)f^{(4)}(\xi) \approx S(a,b) - \frac{h^5}{90}f^{(4)}(\xi),$$

adică

$$\frac{h^5}{90}f^{(4)}(\xi) \approx \frac{16}{15}\left[S(a,b) - S\!\left(a,\frac{a+b}{2}\right) - S\!\left(\frac{a+b}{2},b\right)\right].$$

De unde rezultă:

$$\left|\int_a^b f(x)\,dx - S\!\left(a,\frac{a+b}{2}\right) - S\!\left(\frac{a+b}{2},b\right)\right| \approx \frac{1}{16}\left(\frac{h^5}{90}\right)f^{(4)}(\xi) \approx \frac{1}{15}\left|S(a,b) - S\!\left(a,\frac{a+b}{2}\right) - S\!\left(\frac{a+b}{2},b\right)\right|.$$

Ceea ce înseamnă că am aproximat **de 15 ori mai bine** cu $S\!\left(a,\frac{a+b}{2}\right) + S\!\left(\frac{a+b}{2},b\right)$ decât cu $S(a,b)$.

Deci dacă

$$\left|S(a,b) - S\!\left(a,\frac{a+b}{2}\right) - S\!\left(\frac{a+b}{2},b\right)\right| < 15\varepsilon,$$

ne așteptăm ca

$$\left|\int_a^b f(x)\,dx - S\!\left(a,\frac{a+b}{2}\right) - S\!\left(\frac{a+b}{2},b\right)\right| < \varepsilon,$$

adică faptul că $S\!\left(a,\frac{a+b}{2}\right) + S\!\left(\frac{a+b}{2},b\right)$ aproximează suficient de bine $\int_a^b f(x)\,dx$.

**Algoritmul:** dacă aproximările diferă cu mai mult de $15\varepsilon$, atunci aplicăm regula lui Simpson pe subintervalele $[a, (a+b)/2]$ și $[(a+b)/2, b]$. Apoi folosim aceeași tehnică de estimare a erorii ca să vedem dacă eroarea pe fiecare subinterval este mai mică de $\varepsilon/2$; dacă da, sumăm cele două aproximări și obținem o aproximare a integralei în toleranța $\varepsilon$. Dacă pe un subinterval depășim $\varepsilon/2$, atunci împărțim subintervalul și reaplicăm procedura.

---

# Cuadraturi Gaussiene

## Motivație

La Newton-Cotes, formulele de integrare erau exacte pentru polinoame de grad cel mult $n$, deoarece eroarea se exprimă ca o derivată de ordin $n+1$, iar pentru polinoame de grad cel mult $n$ derivata de ordin $n+1$ este $0$, deci eroarea nu există. Aici ne propunem să extindem gradul de valabilitate al formulelor pentru polinoame de grad mai mare.

La regula trapezului estimăm integralele folosind noduri fixe (capetele intervalului), ceea ce de obicei nu este cea mai bună soluție. Mai bine ar fi ca punctele să fie alese optim: dacă la Newton-Cotes punctele erau **echidistante**, la integrarea Gaussiană punctele $x_i$ sunt **alese optim**.

Punctele $x_i$ și coeficienții $c_i$ sunt aleși astfel încât să se minimizeze eroarea din formula generală de cuadratură:

$$\int_a^b f(x)\,dx \approx \sum_{i=1}^{n} c_i f(x_i).$$

Cu alte cuvinte avem de ales $2n$ necunoscute ($c_i$ și $x_i$), cu singura restricție ca $x_i$ să fie din $[a,b]$. Gradul maxim de valabilitate pentru astfel de formule este $2n-1$, adică pentru polinoame de grad cel mult $2n-1$ formulele de integrare gaussiene sunt exacte.

Echivalent, în notația laboratorului: metodele de tip Newton-Cotes au gradul de valabilitate $N$ (sunt exacte pentru polinoame până la gradul $N$ inclusiv). Dacă în formula aproximativă de integrare

$$\int_a^b f(x)w(x)\,dx \approx \sum_{i=0}^{N} A_{iN}f(x_{iN})$$

se aleg nodurile $x_{iN}$ ca **rădăcini ale unui polinom ortogonal**, definit în mod unic în raport cu $a$, $b$ și funcția pondere $w(x)$, gradul de valabilitate al formulei devine $2N+1$.

Coeficienții $A_{iN}$ se vor determina impunând ca formula să aibă grad de valabilitate $N$ (să fie exactă pentru funcțiile $1, x, \dots, x^N$). Acest fapt conduce la rezolvarea unui sistem de ecuații liniare.

## Determinarea nodurilor prin ortogonalitate

Nodurile $x_i$ sunt determinate din condiția de ortogonalitate a polinomului $\pi(x) = \prod_{i=0}^{N}(x - x_i)$ cu un polinom oarecare de grad mai mic decât cel al lui $\pi$, în particular cu $x^k$:

$$\int_a^b \pi(x)\cdot w(x)\cdot x^k\,dx = 0, \quad k = 0 : n-1.$$

Se obține și rezultatul: dacă integrarea se face prin cuadratură Gaussiană, atunci coeficienții sunt

$$a_i = \int_a^b w(x)\,l_i^2(x)\,dx,$$

în care $l_i$ reprezintă multiplicatorii din formula de interpolare Lagrange.

## Formule pentru polinoamele ortogonale uzuale

**Cebâșev (ordin 1)**

$$\int_{-1}^{1}\frac{f(x)}{\sqrt{1-x^2}}\,dx = \frac{\pi}{N}\sum_{i=0}^{N-1} f\!\left(\cos\frac{(2i+1)\pi}{2N}\right)$$

**Legendre**

$$\int_a^b f(x)\,dx = \sum_{i=0}^{N} A_{iN}f(x_{iN}), \qquad A_{iN} = \frac{2}{\left(1 - x_{iN}^2\right)N^2L_{N-1}^2(x_{iN})}$$

**Laguerre**

$$\int_0^{\infty} e^{-x}f(x)\,dx = \sum_{i=0}^{N} A_{iN}f(x_{iN}), \qquad A_{iN} = \frac{x_{iN}}{(N+1)^2G_{N+1}^2(x_{iN})}$$

**Hermite**

$$\int_0^{\infty} e^{-x^2}f(x)\,dx = \sum_{i=0}^{N} A_{iN}f(x_{iN}), \qquad A_{iN} = \frac{2^{N+1}N!\sqrt{\pi}}{H_{N+1}^2(x_{iN})}$$

## Rezultatul bazat pe polinoamele Legendre monice

Polinoamele Legendre monice:

$$P_0(x) = 1, \quad P_1(x) = x, \quad P_2(x) = x^2 - \frac{1}{3},$$
$$P_3(x) = x^3 - \frac{3}{5}x, \quad P_4(x) = x^4 - \frac{6}{7}x^2 + \frac{3}{35}.$$

Dacă $x_i$ sunt rădăcinile polinomului monic Legendre de grad $n$, $P_n(x)$, iar pentru $i = 1,2,\dots,n$

$$c_i = \int_{-1}^{1}\prod_{\substack{j=1 \\ j \neq i}}^{n}\frac{x - x_j}{x_i - x_j}\,dx,$$

atunci pentru orice polinom $P(x)$ de grad mai mic ca $2n$ avem

$$\int_{-1}^{1} P(x)\,dx = \sum_{i=1}^{n} c_i P(x_i).$$

## Schimbarea intervalului

Dacă la integrarea Gaussiană avem un interval $[a,b]$, atunci trecem în $[-1,1]$ prin transformarea liniară

$$t = \frac{2x - a - b}{b - a} \iff x = \frac{1}{2}[(b-a)t + a + b],$$

și aplicăm integrarea gaussiană astfel:

$$\int_a^b f(x)\,dx = \int_{-1}^{1} f\!\left(\frac{(b-a)t + (b+a)}{2}\right)\frac{(b-a)}{2}\,dt.$$

## Formula Gauss-Radau

Formula de integrare Gauss-Radau are forma

$$\int_{-1}^{1}\frac{f(x)}{\sqrt{1-x^2}}\,dx \approx \sum_{i=0}^{N} a_i f(x_i),$$

este exactă pentru polinoame de grad $\le N$ și utilizează ca abscise $x_i$ zerourile polinomului $T_{N+1}(x) - T_N(x)$.

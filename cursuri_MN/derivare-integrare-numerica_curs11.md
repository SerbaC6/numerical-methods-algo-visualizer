# Derivare numerică. Metode de integrare Newton-Cotes

Notițe de teorie (Metode Numerice, CS-UPB). Conținutul provine din laboratorul de derivare/integrare numerică și din cursul aferent; părțile comune sunt scrise o singură dată.

## Context

Ne propunem să calculăm aproximativ valorile

$$I[f] = \int_a^b f(x)\,dx \qquad \text{și} \qquad D[f] = f^{(p)}(x_0),$$

în condițiile în care:

- funcția $f$ este continuă pe intervalul $[a, b]$;
- primitiva $F$ nu este cunoscută;
- funcția $f$ este cunoscută numai prin valorile $f(x_i)$, într-un număr restrâns de puncte $x_i$, $i = 0 : N$.

---

# Derivare numerică

## Formula two-point (derivare înainte / înapoi)

Derivata funcției $f$ în punctul $x_0$ este definită ca

$$f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h},$$

deci un mod evident de a o aproxima este calculul raportului $\dfrac{f(x_0+h) - f(x_0)}{h}$ pentru valori mici ale lui $h$.

Eroarea se analizează cu polinomul de interpolare Lagrange de grad 1, cunoscând valorile funcției în punctele $x_0$ și $x_1 = x_0 + h$. Considerăm $f \in C^2[a,b]$ și $x_0, x_1 \in [a,b]$:

$$f(x) = P_1(x) + \frac{(x-x_0)(x-x_1)}{2!}f''(\xi(x))$$

$$f(x) = \frac{f(x_0)(x - x_0 - h)}{-h} + \frac{f(x_0+h)(x-x_0)}{h} + \frac{(x-x_0)(x-x_1)}{2}f''(\xi(x)), \quad \xi(x) \in [a,b]$$

Derivând (parte cu parte) se ajunge la:

$$f'(x) = \frac{f(x_0+h) - f(x_0)}{h} + D_x\!\left[\frac{(x-x_0)(x-x_0-h)}{2}f''(\xi(x))\right]$$

$$= \frac{f(x_0+h) - f(x_0)}{h} + \frac{2(x-x_0)-h}{2}f''(\xi(x)) + \frac{(x-x_0)(x-x_0-h)}{2}D_x(f''(\xi(x))).$$

Astfel,

$$f'(x) \approx \frac{f(x_0+h) - f(x_0)}{h},$$

cu eroarea

$$\frac{2(x-x_0)-h}{2}f''(\xi(x)) + \frac{(x-x_0)(x-x_0-h)}{2}D_x(f''(\xi(x))).$$

Pentru $x = x_0$ unul dintre termeni se reduce și formula se simplifică (**two-point formula**):

$$f'(x_0) = \frac{f(x_0+h) - f(x_0)}{h} - \frac{h}{2}f''(\xi), \quad \xi \in [x_0, x_0+h].$$

Formula se numește **derivare înainte** pentru $h > 0$ și **derivare înapoi** pentru $h < 0$.

*Interpretare geometrică*: panta tangentei $f'(x_0)$ este aproximată prin panta secantei care unește punctele de abscisă $x_0$ și $x_0 + h$.

## Formula generală cu $n+1$ puncte

Pentru o formulă mai generală considerăm $n+1$ puncte distincte $\{x_0, x_1, \dots, x_n\}$ și, folosind formula de la interpolarea cu polinom Lagrange, pentru $f$ definită pe $I$ avem:

$$f(x) = \sum_{k=0}^{n} f(x_k)L_k(x) + \frac{(x-x_0)\cdots(x-x_n)}{(n+1)!}f^{(n+1)}(\xi(x)), \quad \xi(x) \in I.$$

Derivând această expresie:

$$f'(x) = \sum_{k=0}^{n} f(x_k)L_k'(x) + D_x\!\left[\frac{(x-x_0)\cdots(x-x_n)}{(n+1)!}\right]f^{(n+1)}(\xi(x)) + \frac{(x-x_0)\cdots(x-x_n)}{(n+1)!}D_x[f^{(n+1)}(\xi(x))].$$

Ultimul termen se reduce pentru $x = x_j$, oricare ar fi $j = 0,1,\dots,n$, adică:

$$f'(x_j) = \sum_{k=0}^{n} f(x_k)L_k'(x_j) + \frac{f^{(n+1)}(\xi(x_j))}{(n+1)!}\prod_{\substack{k=0 \\ k \neq j}}^{n}(x_j - x_k),$$

formulă numită **formula cu $n+1$ puncte**.

## Formulele cu 3 puncte

Particularizând formula cu $n+1$ puncte pentru $x_0$, $x_1 = x_0 + h$, $x_2 = x_0 + 2h$ (polinom Lagrange de grad 2, presupunând că există $f'''$ pe un interval ce conține aceste abscise) obținem:

$$f'(x_0) = \frac{1}{h}\left[-\frac{3}{2}f(x_0) + 2f(x_0+h) - \frac{1}{2}f(x_0+2h)\right] + \frac{h^2}{3}f^{(3)}(\xi_0)$$

$$f'(x_0+h) = \frac{1}{h}\left[-\frac{1}{2}f(x_0) + \frac{1}{2}f(x_0+2h)\right] - \frac{h^2}{6}f^{(3)}(\xi_1)$$

$$f'(x_0+2h) = \frac{1}{h}\left[\frac{1}{2}f(x_0) - 2f(x_0+h) + \frac{3}{2}f(x_0+2h)\right] + \frac{h^2}{3}f^{(3)}(\xi_2)$$

Dacă în prima formulă lăsăm totul la fel, în cea din mijloc înlocuim $x_0 + h$ cu $x_0$, iar în ultima înlocuim $x_0 + 2h$ cu $x_0$, obținem:

$$f'(x_0) = \frac{1}{2h}[-3f(x_0) + 4f(x_0+h) - f(x_0+2h)] + \frac{h^2}{3}f^{(3)}(\xi_0)$$

$$f'(x_0) = \frac{1}{2h}[-f(x_0-h) + f(x_0+h)] - \frac{h^2}{6}f^{(3)}(\xi_1)$$

$$f'(x_0) = \frac{1}{2h}[f(x_0-2h) - 4f(x_0-h) + 3f(x_0)] + \frac{h^2}{3}f^{(3)}(\xi_2)$$

Observând că dacă înlocuim $h$ cu $-h$ avem de fapt doar **două** formule distincte:

**Formula 3 puncte, punct final (three-point endpoint):**

$$f'(x_0) = \frac{1}{2h}[-3f(x_0) + 4f(x_0+h) - f(x_0+2h)] + \frac{h^2}{3}f'''(\xi), \quad \xi \in [x_0, x_0+2h].$$

Este utilă pentru aproximarea derivatei la capătul unui interval (ex: $x_0$), situație ce apare, spre exemplu, la interpolările cu spline-uri cubice tensionate.

**Formula 3 puncte, punct de mijloc (three-point midpoint):**

$$f'(x_0) = \frac{1}{2h}[f(x_0+h) - f(x_0-h)] - \frac{h^2}{6}f'''(\xi), \quad \xi \in [x_0-h, x_0+h].$$

Este recomandată pentru aproximarea derivatei unei funcții într-un punct **interior** unui interval (obținută cu polinomul Lagrange de grad 2 în punctele $x_0 - h$, $x_0$, $x_0 + h$).

Pentru formule de aproximare a derivatelor superioare se procedează absolut similar. Exemplu (derivata a doua în punct de mijloc):

$$f''(x_1) \approx \frac{1}{h^2}[f(x_0) - 2f(x_1) + f(x_2)] - \frac{h^2}{12}f^{(4)}(\xi_2).$$

## Observație: eroarea de rotunjire

În tehnicile de derivare numerică, reducerea pasului $h$ duce la reducerea erorii teoretice, însă cu costul creșterii erorilor de rotunjire. Examinăm formula three-point midpoint:

$$f'(x_0) = \frac{1}{2h}[f(x_0+h) - f(x_0-h)] - \frac{h^2}{6}f'''(\xi).$$

Dacă în evaluările $f(x_0+h)$ și $f(x_0-h)$ apar erorile $e_+$ și $e_-$, notând cu $\tilde f(x_0+h)$ și $\tilde f(x_0-h)$ valorile calculate efectiv, avem:

$$f(x_0+h) = \tilde f(x_0+h) + e_+, \qquad f(x_0-h) = \tilde f(x_0-h) + e_-.$$

Presupunând că erorile $e_+$ și $e_-$ sunt mărginite de $\varepsilon > 0$ și că $f'''$ este mărginită de $M > 0$, eroarea totală a aproximării devine:

$$\left| f'(x_0) - \frac{\tilde f(x_0+h) - \tilde f(x_0-h)}{2h} \right| \le \frac{\varepsilon}{h} + \frac{h^2}{6}M.$$

Pentru a reduce termenul $\frac{h^2}{6}M$ este necesară reducerea lui $h$, care duce însă la creșterea termenului $\frac{\varepsilon}{h}$ (specific erorii de rotunjire), acest termen ajungând să domine calculele.

---

# Integrare numerică

Metoda de bază pentru evaluarea unei integrale definite se numește **cuadratură numerică** și constă în aproximarea integralei definite printr-o sumă:

$$I_N[f] = \sum_{i=0}^{N} A_i f(x_i), \qquad \int_a^b f(x)\,dx \approx \sum_{i=0}^{n} a_i f(x_i).$$

O astfel de metodă este **convergentă** dacă:

$$\lim_{N \to \infty} |I[f] - I_N[f]| = 0.$$

## Deducerea formulei de cuadratură din interpolarea Lagrange

Ținând seama de interpolarea funcției prin polinom Lagrange, exprimăm integrala definită cu tot cu eroare:

$$\int_a^b f(x)\,dx = \int_a^b \sum_{i=0}^{n} f(x_i)L_i(x)\,dx + \int_a^b \prod_{i=0}^{n}(x-x_i)\frac{f^{(n+1)}(\xi(x))}{(n+1)!}\,dx$$

$$= \sum_{i=0}^{n} a_i f(x_i) + \frac{1}{(n+1)!}\int_a^b \prod_{i=0}^{n}(x-x_i)f^{(n+1)}(\xi(x))\,dx,$$

unde $\xi(x) \in [a,b]$ pentru fiecare $x$, iar coeficienții sunt

$$a_i = \int_a^b L_i(x)\,dx, \quad i = 0,1,\dots,n.$$

Eroarea formulei de cuadratură este deci:

$$E(f) = \frac{1}{(n+1)!}\int_a^b \prod_{i=0}^{n}(x-x_i)f^{(n+1)}(\xi(x))\,dx.$$

## Metode Newton-Cotes

Pentru o formulă de integrare aproximativă cu funcție pondere $w(x)$ putem scrie:

$$\int_a^b f(x)w(x)\,dx = \sum_{i=0}^{N} A_i f(x_i) + R_N.$$

În metodele de tip Newton-Cotes, abscisele $x_i$ se aleg **echidistante** în intervalul $[a,b]$:

$$x_i = a + i\frac{(b-a)}{N}, \quad i = 0 : N.$$

Coeficienții $A_i$ se determină impunând ca formula aproximativă să fie exactă ($R_N = 0$) dacă $f$ aparține unei anumite clase de funcții (de exemplu, polinoame de grad $\le N$). Astfel, aproximăm funcția prin polinomul ei de interpolare Lagrange:

$$P_N(x) = \sum_{i=0}^{N} f(x_i)l_i(x), \qquad l_i(x) = \prod_{\substack{j=0 \\ j \neq i}}^{N}\frac{(x-x_j)}{(x_i-x_j)}.$$

În acest fel obținem $A_i = \int_a^b l_i(x)w(x)\,dx$.

Deoarece eroarea polinomului de interpolare respectă

$$|f(x) - P_N(x)| \le \frac{\left|f^{(N+1)}(\xi)\right|}{(N+1)!}\left|(x-x_0)\cdots(x-x_N)\right|, \quad \xi \in [a,b],$$

prin integrare obținem expresia erorii în metodele Newton-Cotes:

$$R_N \le \frac{\left|f^{(N+1)}(\xi)\right|}{(N+1)!}\int_a^b \left|(x-x_0)\cdots(x-x_N)\right| w(x)\,dx.$$

Datorită instabilității interpolării polinomiale se folosesc polinoame de interpolare de **grad mic**.

### Formule închise și deschise

Formulele trapezelor și Simpson fac parte din clasa mai generală Newton-Cotes. Există două tipuri de formule: **deschise** și **închise**. Pentru cele închise, setul de puncte $x_i$ conține și capetele intervalului $a$ și $b$; pentru cele deschise setul de puncte nu conține capetele.

**Formulele Newton-Cotes închise**, $n+1$ puncte, $x_i = x_0 + ih$, $i = 0,1,\dots,n$, $x_0 = a$, $x_n = b$, $h = (b-a)/n$:

$$\int_a^b f(x)\,dx \approx \sum_{i=0}^{n} a_i f(x_i), \qquad a_i = \int_{x_0}^{x_n} L_i(x)\,dx = \int_{x_0}^{x_n}\prod_{\substack{j=0 \\ j \neq i}}^{n}\frac{(x-x_j)}{(x_i-x_j)}\,dx.$$

**Formulele Newton-Cotes deschise**: punctele $x_i = x_0 + ih$, $i = 0,1,\dots,n+1$, $h = (b-a)/(n+2)$, $x_0 = a+h$, $x_n = b-h$, iar cu notațiile $x_{-1} = a$ și $x_{n+1} = b$:

$$\int_a^b f(x)\,dx = \int_{x_{-1}}^{x_{n+1}} f(x)\,dx \approx \sum_{i=0}^{n} a_i f(x_i), \qquad a_i = \int_a^b L_i(x)\,dx.$$

## Formula trapezelor ($N = 1$)

Considerăm $x_0 = a$, $x_1 = b$, $h = b-a$, iar polinomul Lagrange de ordin 1 va fi

$$P_1(x) = \frac{(x-x_1)}{(x_0-x_1)}f(x_0) + \frac{(x-x_0)}{(x_1-x_0)}f(x_1).$$

De unde aproximarea integralei definite:

$$\int_a^b f(x)\,dx = \int_{x_0}^{x_1}\left[\frac{(x-x_1)}{(x_0-x_1)}f(x_0) + \frac{(x-x_0)}{(x_1-x_0)}f(x_1)\right]dx + \frac{1}{2}\int_{x_0}^{x_1} f''(\xi(x))(x-x_0)(x-x_1)\,dx.$$

Deoarece $(x-x_0)(x-x_1)$ nu își schimbă semnul în $[x_0,x_1]$, putem aplica Teorema Mediilor de la integrale:

$$\int_{x_0}^{x_1} f''(\xi(x))(x-x_0)(x-x_1)\,dx = f''(\xi)\int_{x_0}^{x_1}(x-x_0)(x-x_1)\,dx = -\frac{h^3}{6}f''(\xi).$$

Formula se transformă în

$$\int_a^b f(x)\,dx = \left[\frac{(x-x_1)^2}{2(x_0-x_1)}f(x_0) + \frac{(x-x_0)^2}{2(x_1-x_0)}f(x_1)\right]_{x_0}^{x_1} - \frac{h^3}{12}f''(\xi) = \frac{(x_1-x_0)}{2}[f(x_0)+f(x_1)] - \frac{h^3}{12}f''(\xi),$$

iar pentru că $b - a = x_1 - x_0 = h$ obținem **formula trapezelor**:

$$\int_a^b f(x)\,dx = \frac{h}{2}[f(a) + f(b)] - \frac{h^3 f''(\xi)}{12}, \quad h = b-a, \quad x_0 < \xi < x_1.$$

Adică, pentru o funcție cu valori pozitive, aproximăm integrala definită cu aria trapezului format — de aici și titulatura de regula trapezului.

## Formula Simpson ($N = 2$)

Considerăm $x_0 = a$, $x_2 = b$ și $x_1 = x_0 + h$, unde $h = (b-a)/2$. Expresia integralei definite folosind polinomul Lagrange de ordin 2 va fi:

$$\int_a^b f(x)\,dx = \int_{x_0}^{x_2}\left[\frac{(x-x_1)(x-x_2)}{(x_0-x_1)(x_0-x_2)}f(x_0) + \frac{(x-x_0)(x-x_2)}{(x_1-x_0)(x_1-x_2)}f(x_1) + \frac{(x-x_0)(x-x_1)}{(x_2-x_0)(x_2-x_1)}f(x_2)\right]dx$$
$$+ \int_{x_0}^{x_2}\frac{(x-x_0)(x-x_1)(x-x_2)}{6}f^{(3)}(\xi(x))\,dx.$$

O deducere alternativă: considerăm dezvoltarea în serie Taylor cu polinom de ordin 3 în jurul lui $x_1$; atunci pentru orice $x$ din $[x_0,x_2]$ există $\xi(x)$ din $(x_0,x_2)$ astfel încât

$$f(x) = f(x_1) + f'(x_1)(x-x_1) + \frac{f''(x_1)}{2}(x-x_1)^2 + \frac{f'''(x_1)}{6}(x-x_1)^3 + \frac{f^{(4)}(\xi(x))}{24}(x-x_1)^4.$$

Integrând și aplicând teorema mediilor (deoarece $(x-x_1)^4$ este mereu pozitiv), pentru un $\xi_1 \in (x_0,x_2)$:

$$\frac{1}{24}\int_{x_0}^{x_2} f^{(4)}(\xi(x))(x-x_1)^4\,dx = \frac{f^{(4)}(\xi_1)}{120}\left[(x-x_1)^5\right]_{x_0}^{x_2},$$

iar ținând seama de $h = x_2 - x_1 = x_1 - x_0$:

$$\int_{x_0}^{x_2} f(x)\,dx = 2hf(x_1) + \frac{h^3}{3}f''(x_1) + \frac{f^{(4)}(\xi_1)}{60}h^5.$$

Aproximându-l pe $f''(x_1)$ prin formula de derivare de două ori în punct de mijloc și considerând $\xi_1 = \xi_2 = \xi$ (există o teoremă care ne permite acest lucru), obținem **formula Simpson**:

$$\int_a^b f(x)\,dx = \frac{h}{3}\left[f(a) + 4f\!\left(\frac{a+b}{2}\right) + f(b)\right] - \frac{h^5 f^{(4)}(\xi)}{90}, \quad h = \frac{b-a}{2}, \quad x_0 < \xi < x_2.$$

## Formulele Newton-Cotes deschise particularizate

Pentru $n = 0$ — **punctul de mijloc**:

$$\int_{x_{-1}}^{x_1} f(x)\,dx = 2hf(x_0) + \frac{h^3}{3}f''(\xi), \quad x_{-1} < \xi < x_1.$$

Pentru $n = 1$:

$$\int_{x_{-1}}^{x_2} f(x)\,dx = \frac{3h}{2}[f(x_0) + f(x_1)] + \frac{3h^3}{4}f''(\xi), \quad x_{-1} < \xi < x_2.$$

Pentru $n = 2$:

$$\int_{x_{-1}}^{x_3} f(x)\,dx = \frac{4h}{3}[2f(x_0) - f(x_1) + 2f(x_2)] + \frac{14h^3}{45}f^{(4)}(\xi), \quad x_{-1} < \xi < x_3.$$

## Formule compuse

Formulele de mai sus folosesc puține puncte, ceea ce ne determină să aproximăm integrala ca o sumă de integrale calculate pe intervale mai mici:

$$\int_{x_0}^{x_N} f(x)\,dx = \int_{x_0}^{x_1} f(x)\,dx + \dots + \int_{x_{N-1}}^{x_N} f(x)\,dx.$$

### Formula compusă a trapezelor

Împărțim intervalul în $N$ subintervale și aplicăm formula trapezelor:

$$\int_a^b f(x)\,dx \approx \frac{h}{2}\left[f(a) + f(b) + 2\sum_{i=1}^{N-1} f(a+ih)\right], \quad h = \frac{(b-a)}{N}$$

cu eroarea $-\dfrac{b-a}{12}h^2 f''(\mu)$.

### Formula compusă a trapezelor cu punct de mijloc

$$\int_a^b f(x)\,dx = 2h\sum_{j=0}^{n/2} f(x_{2j}) + \frac{b-a}{6}h^2 f''(\mu).$$

### Formula compusă Simpson

Alegem numărul $N$ ca fiind par, împărțim intervalul în $N$ subintervale și aplicăm formula Simpson pe câte o pereche de subintervale consecutive:

$$\int_a^b f(x)\,dx = \sum_{j=1}^{N/2}\int_{x_{2j-2}}^{x_{2j}} f(x)\,dx = \sum_{j=1}^{N/2}\left\{\frac{h}{3}[f(x_{2j-2}) + 4f(x_{2j-1}) + f(x_{2j})] - \frac{h^5}{90}f^{(4)}(\xi_j)\right\},$$

pentru $x_{2j-2} < \xi_j < x_{2j}$.

Ținând seama de faptul că în sumă sunt termeni de genul $f(x_{2j})$, care apar atât în termenul corespunzător intervalului $[x_{2j-2}, x_{2j}]$ cât și în cel corespunzător intervalului $[x_{2j}, x_{2j+2}]$, putem reduce suma astfel:

$$\int_a^b f(x)\,dx = \frac{h}{3}\left[f(x_0) + 2\sum_{j=1}^{(N/2)-1} f(x_{2j}) + 4\sum_{j=1}^{N/2} f(x_{2j-1}) + f(x_N)\right] - \frac{h^5}{90}\sum_{j=1}^{N/2} f^{(4)}(\xi_j),$$

echivalent, în forma uzuală:

$$\int_a^b f(x)\,dx \approx \frac{h}{3}\left[f(a) + f(b) + 4\sum_{i=1}^{N/2} f(x_{2i-1}) + 2\sum_{i=1}^{N/2-1} f(x_{2i})\right], \quad h = \frac{(b-a)}{N},\ x_i = a + ih.$$

Există un rezultat care mărginește eroarea și prezintă forma aproximativă a integrării cu formula compusă Simpson:

$$\int_a^b f(x)\,dx = \frac{h}{3}\left[f(a) + 2\sum_{j=1}^{(N/2)-1} f(x_{2j}) + 4\sum_{j=1}^{N/2} f(x_{2j-1}) + f(b)\right] - \frac{b-a}{180}h^4 f^{(4)}(\mu).$$

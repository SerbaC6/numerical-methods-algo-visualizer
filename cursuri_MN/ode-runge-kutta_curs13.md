# Ecuații diferențiale cu condiții inițiale. Metode Euler, Taylor, Runge-Kutta și multipas

Notițe de teorie (Metode Numerice, CS-UPB). Conținutul provine din laboratorul de metode Runge-Kutta și din cursul de ecuații diferențiale cu condiții inițiale; părțile comune sunt scrise o singură dată.

## Problema Cauchy

Fiind date:

- intervalul $I = [x_0, x_0 + a] \subset \mathbb{R}$;
- funcția continuă $f : I \times \mathbb{R} \to \mathbb{R}$, care asociază fiecărui punct $(x,y)$ din domeniul de definiție un număr real $f(x,y)$;
- ecuația diferențială $y' = f(x,y)$,

**problema diferențială de ordinul 1** constă în determinarea funcției $y : I \to \mathbb{R}$ astfel încât pentru $\forall x \in I$ avem relația

$$y'(x) = f(x, y(x)).$$

**Problema diferențială de ordinul 1 cu condiții inițiale** (numită și **problema Cauchy**) constă în rezolvarea ecuației diferențiale $y'(x) = f(x, y(x))$ știind condiția inițială $y(x_0) = y_0$, $y_0 \in \mathbb{R}$.

În notația din curs:

$$\frac{dy}{dt} = f(t,y), \quad a \le t \le b, \quad y(a) = \alpha.$$

## Condiția Lipschitz

O funcție $f(t,y)$ satisface o **condiție Lipschitz** în variabila $y$ pe o mulțime $D \subset \mathbb{R}^2$ dacă există $L > 0$ astfel încât

$$|f(t,y_1) - f(t,y_2)| \le L|y_1 - y_2|,$$

oricare ar fi $(t,y_1)$ și $(t,y_2)$ din $D$. $L$ se numește **constanta Lipschitz** (Rudolf Otto Sigismund Lipschitz, 1832–1903, matematician german).

Formularea din laborator, echivalentă: $\forall x \in I$, $\forall u, v \in \mathbb{R}^n$, $\exists L > 0$ astfel încât $|f(x,u) - f(x,v)| < L|u-v|$. Această condiție asigură existența și unicitatea soluției problemei Cauchy.

**Mulțime convexă:** $D \subset \mathbb{R}^2$ este convexă dacă oricare ar fi $(t_1,y_1)$ și $(t_2,y_2)$ din $D$, atunci $\big((1-\alpha)t_1 + \alpha t_2,\ (1-\alpha)y_1 + \alpha y_2\big)$ — adică orice punct de pe dreapta care le unește — aparține lui $D$, oricare ar fi $\alpha \in [0,1]$.

**Criteriu practic:** fie $f(t,y)$ definită pe mulțimea convexă $D \subset \mathbb{R}^2$. Dacă există $L > 0$ astfel încât

$$\left|\frac{\partial f}{\partial y}(t,y)\right| \le L$$

oricare ar fi $(t,y)$ din $D$, atunci $f$ satisface condiția Lipschitz pe $D$ în variabila $y$, cu constanta Lipschitz $L$.

**Teoremă de existență și unicitate:** fie $D = \{(t,y) \mid a \le t \le b,\ -\infty < y < \infty\}$, iar funcția $f(t,y)$ continuă pe $D$. Dacă $f$ satisface o condiție Lipschitz pe $D$ în $y$, atunci ecuația diferențială cu condiție inițială $y'(t) = f(t,y)$, $a \le t \le b$, $y(a) = \alpha$, are o unică soluție $y(t)$ pentru $a \le t \le b$.

## Probleme bine puse

O problemă ODE $\dfrac{dy}{dt} = f(t,y)$, $a \le t \le b$, $y(a) = \alpha$, este **„bine pusă”** dacă:

- există o soluție unică $y(t)$;
- există constantele $\varepsilon_0 > 0$ și $k > 0$ astfel încât, pentru orice $\varepsilon$ cu $\varepsilon_0 > \varepsilon > 0$, oricare ar fi funcția continuă $\delta(t)$ cu $|\delta(t)| < \varepsilon$ pentru $t$ din $[a,b]$ și când $|\delta_0| < \varepsilon$, problema perturbată

$$\frac{dz}{dt} = f(t,z) + \delta(t), \quad a \le t \le b, \quad z(a) = \alpha + \delta_0$$

are soluție unică $z(t)$ ce satisface $|z(t) - y(t)| < k\varepsilon$ pentru orice $t$ din $[a,b]$.

În condițiile teoremei de mai sus (D de forma indicată, $f$ continuă și Lipschitz în $y$), problema cu condiție inițială este bine pusă.

---

# Metoda lui Euler

Metoda lui Euler își propune să afle aproximări ale soluției ecuației diferențiale cu condiții inițiale. De obicei se află soluția unei astfel de ecuații într-un set de puncte, numite **mesh points**, din intervalul $[a,b]$, iar soluția într-un punct diferit de cele din rețea se va obține prin interpolare.

Considerăm punctele echidistante $t_i = a + ih$, $i = 0,1,\dots,N$. Folosim Taylor pentru exprimarea soluției:

$$y(t_{i+1}) = y(t_i) + (t_{i+1} - t_i)y'(t_i) + \frac{(t_{i+1}-t_i)^2}{2}y''(\xi_i),$$

pentru $\xi_i$ între $t_i$ și $t_{i+1}$, sau, luând $h = t_{i+1} - t_i$:

$$y(t_{i+1}) = y(t_i) + hy'(t_i) + \frac{h^2}{2}y''(\xi_i).$$

Iar pentru că $y'(t_i)$ este soluție a ecuației diferențiale cu condiții inițiale, avem:

$$y(t_{i+1}) = y(t_i) + hf(t_i, y(t_i)) + \frac{h^2}{2}y''(\xi_i).$$

Metoda Euler construiește $w_i \approx y(t_i)$, renunțând la fiecare pas la rest:

$$w_0 = \alpha, \qquad w_{i+1} = w_i + hf(t_i, w_i), \quad i = 0,1,\dots,N-1.$$

---

# Metode Taylor

Dacă la Euler am folosit Taylor cu $n = 1$, aici ne dorim să sporim convergența prin derivare de ordin superior. Presupunând că soluția $y(t)$ a ecuației $y' = f(t,y)$, $a \le t \le b$, $y(a) = \alpha$, are $(n+1)$ derivate continue, atunci

$$y(t_{i+1}) = y(t_i) + hy'(t_i) + \frac{h^2}{2}y''(t_i) + \cdots + \frac{h^n}{n!}y^{(n)}(t_i) + \frac{h^{n+1}}{(n+1)!}y^{(n+1)}(\xi_i),$$

pentru $\xi_i$ din $(t_i, t_{i+1})$.

Înlocuind $y^{(k)}(t) = f^{(k-1)}(t, y(t))$ în expresie obținem:

$$y(t_{i+1}) = y(t_i) + hf(t_i, y(t_i)) + \frac{h^2}{2}f'(t_i, y(t_i)) + \cdots + \frac{h^n}{n!}f^{(n-1)}(t_i, y(t_i)) + \frac{h^{n+1}}{(n+1)!}f^{(n)}(\xi_i, y(\xi_i)).$$

Ca metodă o vom considera fără restul:

$$w_0 = \alpha, \qquad w_{i+1} = w_i + hT^{(n)}(t_i, w_i), \quad i = 0,1,\dots,N-1,$$

unde

$$T^{(n)}(t_i, w_i) = f(t_i, w_i) + \frac{h}{2}f'(t_i, w_i) + \cdots + \frac{h^{n-1}}{n!}f^{(n-1)}(t_i, w_i).$$

---

# Metode de tip Runge-Kutta

Metoda Runge-Kutta se bazează pe teorema Taylor în două variabile; metodele sunt la fel de bune ca metodele Taylor, dar **scapă de evaluarea derivatelor**.

## Teorema Taylor în două variabile

Dacă $f(t,y)$ și derivatele sale până la ordinul $n+1$ inclusiv sunt continue pe $D = \{(t,y) \mid a \le t \le b,\ c \le y \le d\}$ și fie $(t_0,y_0)$ din $D$, atunci pentru orice $(t,y)$ din $D$ există $\xi$ între $t$ și $t_0$ și $\mu$ între $y$ și $y_0$ astfel încât

$$f(t,y) = P_n(t,y) + R_n(t,y),$$

unde

$$P_n(t,y) = f(t_0,y_0) + \left[(t-t_0)\frac{\partial f}{\partial t}(t_0,y_0) + (y-y_0)\frac{\partial f}{\partial y}(t_0,y_0)\right]$$
$$+ \left[\frac{(t-t_0)^2}{2}\frac{\partial^2 f}{\partial t^2}(t_0,y_0) + (t-t_0)(y-y_0)\frac{\partial^2 f}{\partial t \partial y}(t_0,y_0) + \frac{(y-y_0)^2}{2}\frac{\partial^2 f}{\partial y^2}(t_0,y_0)\right] + \cdots$$
$$+ \left[\frac{1}{n!}\sum_{j=0}^{n}\binom{n}{j}(t-t_0)^{n-j}(y-y_0)^j\frac{\partial^n f}{\partial t^{n-j}\partial y^j}(t_0,y_0)\right],$$

numit **polinomul Taylor de ordin $n$ în două variabile**, iar $R_n$ este restul asociat polinomului:

$$R_n(t,y) = \frac{1}{(n+1)!}\sum_{j=0}^{n+1}\binom{n+1}{j}(t-t_0)^{n+1-j}(y-y_0)^j\frac{\partial^{n+1}f}{\partial t^{n+1-j}\partial y^j}(\xi,\mu).$$

## Cadrul general (formularea din laborator)

Metoda Runge-Kutta este o metodă **cu pași separați**, caracterizată prin faptul că aproximația soluției la pasul următor $i+1$ ține cont doar de informația de la pasul curent $i$:

$$\begin{cases} y_0 = \lambda_h \\ y_{i+1} = y_i + hf_h(x_i, y_i), \quad i = 0,1,\dots \end{cases}$$

cu condițiile de consistență:

$$\lim_{h \to 0}\lambda_h = \lambda; \qquad \lim_{h \to 0}f_h = f.$$

Funcția $f_h(x,y)$ se determină urmând pașii:

- considerăm punctele distincte $x_{ij} = x_{i0} + u_jh$, care împart intervalul $I = [x_i, x_{i+1}]$ în $q$ subintervale, unde $u_j \in [0,1]$, $u_0 = 0$, $u_q = 1$;
- se calculează aproximațiile soluției în punctele introduse $x_{ij}$ folosind relațiile:

$$\begin{cases} y_{i0} = y_i \\ y_{ij} = y_i + h\sum\limits_{l=0}^{j-1} K_{jl}f(x_{il}, y_{il}), \quad j = 1 : q \end{cases}$$

Pentru a determina punctele introduse $x_{ij}$ și constantele $K_{jl}$ se impune condiția ca, în dezvoltarea Taylor a lui $y_{ij}$ după puterile lui $h$, termenii astfel obținuți să coincidă cu cât mai mulți termeni din dezvoltarea Taylor a soluției exacte.

- O metodă Runge-Kutta este de **ordin $p$** dacă în cele două dezvoltări termenii coincid până la $h^p$ inclusiv.
- Numărul subintervalelor $q$ definește **rangul** metodei Runge-Kutta.

**Runge-Kutta de ordin 1 și rang 1:**

$$\begin{cases} y_{i0} = y_i \\ y_{i1} = y_i + hu_1f(x_{i0}, y_{i0}) \end{cases}$$

**Runge-Kutta de ordin 2 și rang 2:**

$$\begin{cases} y_{i0} = y_i \\ y_{i1} = y_i + hu_1f(x_{i0}, y_{i0}) \\ y_{i2} = y_i + h\left(1 - \dfrac{1}{2u_1}\right)f(x_{i0}, y_{i0}) + \dfrac{h}{2u_1}f(x_{i1}, y_{i1}) \end{cases}$$

## Deducerea RK de ordin 2 (formularea din curs)

Ne propunem să găsim coeficienții $a_1$, $\alpha_1$ și $\beta_1$ astfel încât $a_1f(t+\alpha_1, y+\beta_1)$ să aproximeze

$$T^{(2)}(t,y) = f(t,y) + \frac{h}{2}f'(t,y).$$

Pornim de la

$$f'(t,y) = \frac{df}{dt}(t,y) = \frac{\partial f}{\partial t}(t,y) + \frac{\partial f}{\partial y}(t,y)\cdot y'(t),$$

iar cum $y'(t) = f(t,y)$ vom avea

$$T^{(2)}(t,y) = f(t,y) + \frac{h}{2}\frac{\partial f}{\partial t}(t,y) + \frac{h}{2}\frac{\partial f}{\partial y}(t,y)\cdot f(t,y).$$

Folosind polinomul Taylor de grad 1 în $(t,y)$:

$$a_1f(t+\alpha_1, y+\beta_1) = a_1f(t,y) + a_1\alpha_1\frac{\partial f}{\partial t}(t,y) + a_1\beta_1\frac{\partial f}{\partial y}(t,y) + a_1 \cdot R_1(t+\alpha_1, y+\beta_1),$$

cu

$$R_1(t+\alpha_1, y+\beta_1) = \frac{\alpha_1^2}{2}\frac{\partial^2 f}{\partial t^2}(\xi,\mu) + \alpha_1\beta_1\frac{\partial^2 f}{\partial t \partial y}(\xi,\mu) + \frac{\beta_1^2}{2}\frac{\partial^2 f}{\partial y^2}(\xi,\mu),$$

pentru un $\xi$ între $t$ și $t+\alpha_1$ și un $\mu$ între $y$ și $y+\beta_1$. Deci coeficienții vor fi

$$a_1 = 1, \quad \alpha_1 = \frac{h}{2}, \quad \beta_1 = \frac{h}{2}f(t,y),$$

adică

$$T^{(2)}(t,y) = f\!\left(t + \frac{h}{2}, y + \frac{h}{2}f(t,y)\right) - R_1\!\left(t + \frac{h}{2}, y + \frac{h}{2}f(t,y)\right),$$

cu

$$R_1\!\left(t+\frac{h}{2}, y+\frac{h}{2}f(t,y)\right) = \frac{h^2}{8}\frac{\partial^2 f}{\partial t^2}(\xi,\mu) + \frac{h^2}{4}f(t,y)\frac{\partial^2 f}{\partial t \partial y}(\xi,\mu) + \frac{h^2}{8}(f(t,y))^2\frac{\partial^2 f}{\partial y^2}(\xi,\mu).$$

Cu alte cuvinte, în loc să folosim aproximarea $T^{(2)}$ (așa cum făceam la metodele Taylor), vom folosi o formă care **nu implică derivate**, adică metodele RK, cu o eroare $O(h^p)$, unde $p$ este ordinul metodei.

## Metode particulare de ordin 2

**Metoda punctului de mijloc (midpoint):**

$$w_0 = \alpha, \qquad w_{i+1} = w_i + hf\!\left(t_i + \frac{h}{2},\ w_i + \frac{h}{2}f(t_i,w_i)\right)$$

**Metoda Euler modificată:**

$$w_0 = \alpha, \qquad w_{i+1} = w_i + \frac{h}{2}\left[f(t_i,w_i) + f\big(t_{i+1},\ w_i + hf(t_i,w_i)\big)\right]$$

Particularizând valoarea lui $u_1 \in [0,1]$ în schema generală de rang 2 din laborator obținem:

**Metoda tangentei ameliorate** ($u_1 = \frac{1}{2}$) — identică cu metoda punctului de mijloc:

$$\begin{cases} x_{i1} = x_{i0} + u_1h = x_i + \dfrac{h}{2} \\ y_{i1} = y_i + \dfrac{h}{2}f(x_i,y_i) \\ y_{i+1} = y_i + hf(x_{i1}, y_{i1}) \end{cases}$$

**Metoda Heun** ($u_1 = \frac{2}{3}$):

$$\begin{cases} x_{i1} = x_i + \dfrac{2}{3}h \\ y_{i1} = y_i + \dfrac{2}{3}hf(x_i,y_i) \\ y_{i+1} = y_i + \dfrac{h}{4}f(x_i,y_i) + \dfrac{3h}{4}f(x_{i1}, y_{i1}) \end{cases}$$

**Metoda Euler-Cauchy** ($u_1 = 1$) — identică cu metoda Euler modificată:

$$\begin{cases} x_{i1} = x_i + h \\ y_{i1} = y_i + hf(x_i,y_i) \\ y_{i+1} = y_i + \dfrac{h}{2}\left[f(x_i,y_i) + f(x_{i1}, y_{i1})\right] \end{cases}$$

> Notă: laboratorul numește „Heun” varianta de rang 2 cu $u_1 = 2/3$, în timp ce cursul folosește numele „Heun” pentru metoda de ordin 3 de mai jos. Ambele denumiri circulă în literatură.

## RK de ordin 3

Adică o formă prin care îl aproximăm pe $T^{(3)}$, eliminând derivatele; vrem să aflăm parametrii din forma

$$f\big(t + \alpha_1,\ y + \delta_1f(t+\alpha_2,\ y + \delta_2f(t,y))\big)$$

și să rămânem cu o eroare $O(h^3)$. Parametrii se obțin analog cu cazul precedent, iar formula va fi, pentru $i = 0,1,\dots,N-1$:

$$w_0 = \alpha,$$
$$w_{i+1} = w_i + \frac{h}{4}\left(f(t_i,w_i) + 3f\!\left(t_i + \frac{2h}{3},\ w_i + \frac{2h}{3}f\!\left(t_i + \frac{h}{3},\ w_i + \frac{h}{3}f(t_i,w_i)\right)\right)\right)$$

Aceasta este **metoda Heun**, cea mai cunoscută metodă de ordin 3.

## RK de ordin 4

O formă prin care îl aproximăm pe $T^{(4)}$, eliminând derivatele, cu eroare $O(h^4)$. Pentru $i = 0,1,\dots,N-1$:

$$w_0 = \alpha,$$
$$k_1 = hf(t_i, w_i),$$
$$k_2 = hf\!\left(t_i + \frac{h}{2},\ w_i + \frac{1}{2}k_1\right),$$
$$k_3 = hf\!\left(t_i + \frac{h}{2},\ w_i + \frac{1}{2}k_2\right),$$
$$k_4 = hf(t_{i+1},\ w_i + k_3),$$
$$w_{i+1} = w_i + \frac{1}{6}(k_1 + 2k_2 + 2k_3 + k_4).$$

Echivalent, în notația din laborator:

$$y_{i+1} = y_i + \frac{K_1 + 2K_2 + 2K_3 + K_4}{6},$$

unde

$$K_1 = hf(x_i, y_i), \quad K_2 = hf\!\left(x_i + \frac{h}{2}, y_i + \frac{K_1}{2}\right), \quad K_3 = hf\!\left(x_i + \frac{h}{2}, y_i + \frac{K_2}{2}\right), \quad K_4 = hf(x_i + h, y_i + K_3).$$

În mod uzual se utilizează metoda Runge-Kutta de ordin 4.

---

# Metode multipas

O metodă multipas cu $m$ pași pentru soluționarea unei ODE $y' = f(t,y)$, $a \le t \le b$, $y(a) = \alpha$, arată astfel ($m > 1$):

$$w_{i+1} = a_{m-1}w_i + a_{m-2}w_{i-1} + \cdots + a_0w_{i+1-m}$$
$$+ h\big[b_mf(t_{i+1}, w_{i+1}) + b_{m-1}f(t_i, w_i) + \cdots + b_0f(t_{i+1-m}, w_{i+1-m})\big],$$

pentru $i = m-1, m, \dots, N-1$, cu $h = (b-a)/N$, și se dau valorile inițiale

$$w_0 = \alpha, \quad w_1 = \alpha_1, \quad w_2 = \alpha_2, \quad \dots, \quad w_{m-1} = \alpha_{m-1}.$$

Dacă $b_m = 0$ metoda se numește **explicită** (sau deschisă), altfel **implicită** (sau închisă).

## Adams-Bashforth (explicite)

**Doi pași:** $w_0 = \alpha$, $w_1 = \alpha_1$,

$$w_{i+1} = w_i + \frac{h}{2}\left[3f(t_i,w_i) - f(t_{i-1},w_{i-1})\right], \qquad \tau_{i+1}(h) = \frac{5}{12}y'''(\mu_i)h^2$$

**Trei pași:** $w_0 = \alpha$, $w_1 = \alpha_1$, $w_2 = \alpha_2$,

$$w_{i+1} = w_i + \frac{h}{12}\left[23f(t_i,w_i) - 16f(t_{i-1},w_{i-1}) + 5f(t_{i-2},w_{i-2})\right], \qquad \tau_{i+1}(h) = \frac{3}{8}y^{(4)}(\mu_i)h^3$$

**Patru pași:** $w_0 = \alpha$, $w_1 = \alpha_1$, $w_2 = \alpha_2$, $w_3 = \alpha_3$,

$$w_{i+1} = w_i + \frac{h}{24}\left[55f(t_i,w_i) - 59f(t_{i-1},w_{i-1}) + 37f(t_{i-2},w_{i-2}) - 9f(t_{i-3},w_{i-3})\right], \qquad \tau_{i+1}(h) = \frac{251}{720}y^{(5)}(\mu_i)h^4$$

## Adams-Moulton (implicite)

**Doi pași:** $w_0 = \alpha$, $w_1 = \alpha_1$,

$$w_{i+1} = w_i + \frac{h}{12}\left[5f(t_{i+1},w_{i+1}) + 8f(t_i,w_i) - f(t_{i-1},w_{i-1})\right], \qquad \tau_{i+1}(h) = -\frac{1}{24}y^{(4)}(\mu_i)h^3$$

**Trei pași:** $w_0 = \alpha$, $w_1 = \alpha_1$, $w_2 = \alpha_2$,

$$w_{i+1} = w_i + \frac{h}{24}\left[9f(t_{i+1},w_{i+1}) + 19f(t_i,w_i) - 5f(t_{i-1},w_{i-1}) + f(t_{i-2},w_{i-2})\right], \qquad \tau_{i+1}(h) = -\frac{19}{720}y^{(5)}(\mu_i)h^4$$

**Patru pași:** $w_0 = \alpha$, $w_1 = \alpha_1$, $w_2 = \alpha_2$, $w_3 = \alpha_3$,

$$w_{i+1} = w_i + \frac{h}{720}\left[251f(t_{i+1},w_{i+1}) + 646f(t_i,w_i) - 264f(t_{i-1},w_{i-1}) + 106f(t_{i-2},w_{i-2}) - 19f(t_{i-3},w_{i-3})\right],$$
$$\tau_{i+1}(h) = -\frac{3}{160}y^{(6)}(\mu_i)h^5$$

> Notă: coeficienții erorilor de trunchiere $\tau_{i+1}(h)$ pentru variantele cu patru pași (și pentru Adams-Moulton cu trei pași) apar ilizibil / inconsistent în slide-urile scanate; valorile de mai sus sunt cele standard din literatură (Burden & Faires).

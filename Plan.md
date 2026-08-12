# SITE MN

## Ideea centrala a site-ului

Mod prin care studentii sa vada si sa se joace cu algoritmii, sa-i inteleaga vizual si sa incerce sa se joace cu ei.

- La nivel de teorie, un paragraf maxim
- Instructiuni despre folosire, ce e algoritmul acela etc.

## Tooling

- React + Vite
- Sa caut React Components libraries pe gratis:
  - <https://ui.shadcn.com> — componente de baza
  - <https://magicui.design> — componente animate, merge peste shadcn/ui (bun pentru partea de animatii)
  - <https://ui.aceternity.com> — efecte vizuale mai spectaculoase (hero, fundaluri, carduri)
- Setup la Github si apoi acces la Claude la commit-uri si la PR-uri
- Font si tema pentru site pe care sa nu le stie Claude
- Sa cautam cum facem animatiile si chestiile interactive in stil Gemini (sa ne jucam cu Claude Design)
- Daca ai chef chiar ajuta sa cauti site-uri si sa le dai reference ca exemplu pentru Claude sa se inspire

## Claude Specific Instructions

- Library Python Manim
- All in romanian
- No auth
- No cookies
- Static website
- SSL encryption
- Github Pages deployment
- Claude Github issues
- Mobile — make sure interactions and visuals wrap around properly
- `.gitignore`
- `robots.txt`
- `progress.md`
- `sitemap.xml`
- TOC
- contact page
- logo placeholder

## Material sursa: folderul `cursuri_MN/`

Materia predata, transcrisa. **Singura** sursa admisa pentru formule, definitii si notatii.

- `cursuri_MN/*.md` — 12 fisiere de curs/laborator
- `cursuri_MN/poze/` — 21 de capturi din curs (formule, scheme, grafice) folosite ca referinta vizuala

| Fisier                                         | Continut                                                                                    | Pagina site |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| `MN_curs2_lab2_matrici.md`                     | matrici, Cramer si complexitatea lui, LU, sisteme triunghiulare, norme, conditionare        | 1, 2        |
| `curs3_ortogonalitate.md`                      | norme, produs scalar, Gram-Schmidt, QR, Householder, Givens, polinoame ortogonale           | 2           |
| `sisteme_liniare_metode_directe_MN_curs4.md`   | eliminare Gaussiana, pivotare, LU, Gauss-Jordan, Thomas                                     | 1, 3        |
| `sisteme_liniare_metode_iterative_MN_curs5.md` | puncte fixe, Jacobi, Gauss-Seidel, SOR, gradient conjugat, preconditionare                  | 4, 6        |
| `ecuatii_neliniare_MN_curs6.md`                | bisectie, Newton, secanta, ordin de convergenta, gradient descendent/conjugat               | 5, 6        |
| `valori_vectori_proprii_teorie_curs7.md`       | asemanare, Jordan, Schur, Rayleigh, metoda puterii, puterea inversa, deflatie, PageRank     | 7           |
| `qr_dvs_teorie_curs8.md`                       | algoritmul QR, rotatii, QR cu deplasare, DVS/SVD                                            | 8           |
| `interpolare_spline_bezier_teorie_curs09.md`   | Lagrange, Neville, diferente divizate, Newton, Hermite, Runge, spline, Bezier, de Casteljau | 9, 10       |
| `cmmp_rationale_fft_teorie_curs10.md`          | CMMP liniar/polinomial, spatii prehilbertiene, Pade, FFT                                    | 11          |
| `derivare-integrare-numerica_curs11.md`        | derivare numerica, Newton-Cotes, trapeze, Simpson                                           | 12          |
| `romberg-cuadraturi-gaussiene_curs12.md`       | Richardson, Romberg, cuadraturi adaptive, cuadraturi Gaussiene                              | 13          |
| `ode-runge-kutta_curs13.md`                    | problema Cauchy, Lipschitz, Euler, Taylor, Runge-Kutta, metode multipas                     | 14          |

## Lista Algoritmi

> Nota: pentru informatia scrisa pe site si pentru animatii, formule etc., se vor folosi DOAR FISIERELE DIN 'cursuri_MN', nu altceva. Aceea este materia predata, nu putem folosi nimic altceva. De asemenea, pentru fiecare interfata interactiva, realizeaza o legenda si prezinta modul de functionare. Fa constant paralele intre formule si animatii/interfete grafice, astfel incat utilizatorul sa inteleaga de unde vine fiecare lucru. In cazul in care ai nevoie sa te inspiri cu animatiile si interfetele grafice din alte surse, ai voie, doar nu schimba formule sau definitii. Cand e cazul, explica cum se leaga unul de altul conceptele(de exemplu, la puncte fixe -> metoda bisectiei, Newton, secantei)

### Prima pagina: LU, Dolittle, Crout, Cramer.

- Incepem prin a explica putin Cramer interactiv, punem formula acestuia si o explicam printr-o animatie. Punem emfaza pe faptul ca merge greu.
- Apoi, prezentam LU, prin animatie grafica interactiva(NU LASAM UTILIZATORUL SA PUNA VALORILE DE MANA), maxim sa vada spargerea matricei. De asemenea, punem accent pe intelegerea formulei greoaie, prin afisarea relatiei dintre formula si animatie(unde e l11,l21,l22 etc).
- Prezentam, cam in acelasi stil, Crout, Dolittle si Cholesky(punem in text si cum am putea retine diferentele dintre fiecare, de exemplu la Crout punem ca are U, deci elementele de pe diagonala principala a matricii U vor fi 1, la Dolittle ca are L si nu are U, deci elementele de pe diagonala principala a matricii L vor fi 1, iar la Cholesky nu punem nimic legat de retinerea mai usor a formulei).

### A doua pagina: Norme, Givens si Householder

- Incepem prin a explica conceptul de norma, ce este ea, reprezentam grafic anumite norme, atat vectoriale, cat si matriceale.
- Apoi, trecem la Householder, explicam pe o axa algoritmul Householder si facem o interfata interactiva care se schimba daca tragem de ea / punem alte valori pentru variabile si vedem cum se schimba pe axa
- Apoi, trecem la matricea de rotatie, Givens, le explicam grafic si prin interfata interactiva, explicam cum influenteaza aceasta o matrice si la ce e buna, explicam cum se formeaza matricea.
- Apoi, explica Gram-Schmidt, cam cum e aici(https://math345-games.github.io/PerfectlyNormal/), dar mult mai usor sau macar cu pasi mai clari, ca sa inteleaga utilizatorul pasii, folosind un joc interactiv, vizual.

### A treia pagina: Eliminari Gaussiene, Algoritmul Thomas

- Explica, cam la fel cum ai facut la LU, conceptul de eliminare Gaussiana, mai mult vizual(animatie), decat interactiv. Apoi, prezinta fiecare concept, de pivotare partiala, de pivotare partiala cu pivot scalat, de pivotare totala, si la fiecare, dupa animatia aferenta, explica ce are in plus si in minus fata de celelalte.
- Tot in aceeasi natura, explica si Algoritmul Thomas

### A patra pagina: Jacobi, Gauss-Seidel, SOR

- Explica, pe rand, cele 3 metode, Jacobi, Gauss-Seidel si SOR prin animatii, facand paralela intre animatie si formula, apoi prezinta plusurile si minusurile fiecarei metode in parte(lucrand pe matrici, similar cu ce s-a intamplat la LU sau la Eliminari Gaussiene)

### A cincea pagina: puncte fixe, metoda bisectiei, metoda tangentei(Newton), metoda secantei,

- partea de Puncte fixe, metoda bisectiei, Newton, secanta prezinta sub forma de interval, unde alegem, in functie de fiecare metoda, intervalul/modul in care gasim solutia. Vor fi interfete interactive, nu animatii.

### A sasea pagina: Gradientul Descendent si Gradientul Conjugat

- partea de Gradient Descendent si Gradient Conjugat vreau sa fie explicata ca o vale, cu analogii din viata reala despre cele doua concepte, paralele intre acestea, plusurile si minusurile fiecarei metode, etc. De asemenea, fa mai intai animatii explicative pentru cele doua, apoi pentru partea de aprofundare o interfata intercativa.

### A saptea pagina: Metodele Puterii

- explica conceptul de matrici asemenea prin animatii elocvente
- Explica Metoda Puterii, Metoda Puterii Inverse si Iterarea Catului Rayleigh prin animatii pe matrici si explicarea formulelor pe acele matrici
- Apoi, explica Deflatia si cum ne ajuta aceasta, tot prin animatii
- Apoi, fa Algoritmul PageRank, normalizand pe linii atunci cand prezinti matricea Stochastica. Aici, trebuie doar sa faci animatie pentru fiecare pas in parte.

### A opta pagina: QR si DVS

- Prezinta cele doua metode prin animatii pe matrici. Vorbeste si despre Q si R si explica ce sunt. Explica prin animatii importanta matricei ortogonale.

### A noua pagina: Polinomul Lagrange, Polinomul Neville, Functia Runge, Interpolari Spline

- interfete interactive pentru fiecare metoda in parte, sa explici trecerea de la Polinomul Lagrange si Neville la Spline, folosind functia Runge. Vreau sa faci sub forma de axa, prezentarea unei functii pe care utilizatorul sa o introduca, cu un design cat mai usor de inteles. Vreau de asemenea ca animatiile din interfata grafica sa aiba un flow, sa se miste frumos, nu greoi.

### A zecea pagina: Curbe Bezier, Algoritmul lui de Casteljau

- explici importanta curbelor Bezier, faptul ca vin in ajutorul spline-urilor (adica curbelor Hermite) si rezolva efortul computational al acestora cu ajutorul polinoamelor Bernstein. Apoi, prezinta algorimtul lui de Casteljau printr-o interfata grafica, unde vom forma curbe Bezier de toate tipurile (fa un box in care utilizator poate sa aleaga daca realizeaza curbele in plan 2D sau 3D).

### A 11-a pagina: Aproximare CMMP, Fast Fourier Transformation

- explici grafic aproximarea CMMP, cu acea dreapta, pe un grafic oarecare si o functie oarecare. Apoi, vreau sa explici Fast-Fourier Transformation, printr-o animatie.

### A 12-a pagina: Derivarea si Integrarea numerica. Metodele Newton-Cotes.

- atat animatii, cat si interfete grafice pe partea de aprofundare, pentru metodele de derivare si in special pentru metodele de integrare numerica(simpson si trapeze simple/compuse). Vreau sa le faci sub forma de grafic, sub forma unor functii si sa aduci la viata pozele date.

### A 13-a pagina: Integrarea Romberg, Quadraturi Adaptive, Integrare Gaussiana

- animatii pe o matrice Integrarea Romberg, iar Quadraturile Adaptive si Integrarea Gaussiana asemanator cu ce ai facut la a 11-a pagina, interval si functie.

### A 14-a pagina: ODE

- Aici vreau sa explici ODE prin grafic, sa explici cum se leaga de problema Cauchy, sa explici Euler si sa enunti faptul ca e buna deoarece are nevoie de un singur punct de start. Pentru referinta, te poti uita la pozele puse.

## Layout Site

- **Pagina principala**, de cuprins cumva, in care utilizatorul va selecta ce algoritm vrea sa vada
- **Pagina pentru fiecare algoritm**, in care va fi la inceput o chestie vizuala, apoi un scurt Briefing despre algoritm si modul in care functioneaza, apoi o interfata interactiva cu care sa schimbe modul in care este asezat, lucreaza, etc. Cumva, dupa modul in care se schimba formula de baza sa se schimbe si imaginea

**Exemple:**

- <https://visualgo.net/en>
- <https://csvistool.com/>
- <https://www.dsavisualizer.in/visualizer/searching/binarysearch>
- <https://engineersuniverse.com/webapps/numerical-methods-visualizer> — exact subiectul nostru, de vazut ce metode acopera si cum le prezinta

## Design (DECIS)

**Paleta: „Sapphire nightfall whisper"**

| Hex       | Culoare           | Rol                                    |
| --------- | ----------------- | -------------------------------------- |
| `#0474C4` | safir             | accent principal                       |
| `#5379AE` | albastru estompat | accent secundar                        |
| `#2C444C` | gri-verzui inchis | suprafata / neutru                     |
| `#A8C4EC` | albastru deschis  | accent pe fundal inchis, text secundar |
| `#06457F` | albastru adanc    | accent apasat, hover                   |
| `#262B40` | bleumarin inchis  | fundal tema intunecata                 |

- **Font:** Nunito Sans (titluri + text). Mono pentru formule/tabele numerice: de ales separat.

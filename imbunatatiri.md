# Regula generala(pusa in CLAUDE.md, si schimbat ce nu e asa din fiecare pagina):
1. ✅ De acum, cand faci animatii, scoate din titlu acel 01,02,.... pus doar pe o linie. Sterge asta din animatia de la paginile pentru Householder, Jacobi, QR.
2. ✅ Taie paragraful de final din fiecare pagina la capitolul de teorie, ce care incepe cu asta de scris: Ce rămâne, dacă rămâne un singur lucru
3. ✅ Fa scrisul din fiecare animatie, cel de sub titluri, care e scris mic, mult mai mare. Acum trebuie sa te chiorasti ca sa il vezi
4. ✅ Nu mai pune subtitrarile sa fie scrise de jos in sus. Fa-le de sus in jos cand e pop-up nou de text

# De rezolvat la animatii si altele:
- ✅ Fa cumva sa pot schimba din sageti unde sunt pe video
- ✅ Atunci cand ies de pe pagina, clipul si pagina se reiau de la 0. Fa cumva astfel incat sa ramana unde a fost
- ✅ Cand am video ul in fata, fa cumva sa pot da pauza apasand space

# la DVS:
1. ✅ Sterge acest paragraf:
Pașii, în ordine: se calculează AT·A; valorile ei proprii, ordonate descrescător, dau prin radical valorile singulare din S; vectorii proprii ortonormați ai aceleiași matrice sunt coloanele lui V; primele k coloane ale lui U ies din ui = (1/si)·A·vi, iar restul se completează cu direcții ortogonale pe ele. Ce rămâne, dacă rămâne un singur lucru: toată descompunerea unei matrice oarecare se obține din valorile și vectorii proprii ai unei singure matrice simetrice, AT·A.

# la QR:
1. ✅ Refa IN ANIMATIE scrisul din casutele de text, de sub explicarea parametriilor, ar trebui sa ma uit cu lupa ca sa il vad(toate scrisurile pentru explicatie, vreau sa fie mai mari). De asemenea, explica ca P2 vine de la b2, de la modul in care luam rotatia Givens astfel incat sa scapam de elementul b2 de sub diagonala principala(scrie pe scurt, nu incarca prea mult imaginea).
2. ✅ Schimba inapoi in teta din alfa in animatie sinusurile si cosinusurile
3. ✅ Scoate acest text: 
"Aici e toată strategia metodei: nu se caută valorile proprii, ci se strâng spre zero capetele subdiagonalei, b2 și bn, până când cifra de lângă ele devine citibilă ca valoare proprie.
Dacă un bj din mijloc se anulează, cu 2 < j < n, matricea se rupe și problema se sparge în două mai mici — una de dimensiune j − 1 și una de dimensiune n − j + 1 — cărora li se aplică QR separat.", cu tot cu b2 = 0 => .... si ce e scris in acel chenar pe lanaga asta

# la LU:
1. ✅ Rezolva animatia la LU astfel incat sa nu se mai puna partea portocalie cu scris peste matrice(la secunda 9, acest scris:  n + 1 = 4 determinanți, doar pentru n = 3)
2. ✅ (era deja exact în forma cerută) Rescrie aceste paragrafe, astfel:
- Un sistem A·x = b se poate rezolva cu determinanți — și nu se face niciodată așa: costul crește ca n!. Metodele directe merg pe alt drum: descompun A în două matrice triunghiulare, A = L·U, iar sistemul se sparge în două sisteme care se rezolvă prin simplă substituție, fiecare în O(n2).
3. ✅ Sterge aceste paragrafe:
- La n = 10, N = 360.000.000 de operații. Metodele de mai departe sunt de ordinul O(n3): la n = 20, 8.000 de operații față de 2,4·1018 cerute de un singur determinant.
4. ✅ Scoate zona de interactiv

# la Householder si Givnens:
1. ✅ La animatia Householder:
- Fa cumva sa nu mai fie desenul peste titlu
- Cand prezinti prima oara axele +-||v||, nu pune ||v|| pe dreptul direct al axei, nu se vede deloc, pune-l mai sus putin. La fel si la P * v
- Subtitrarile pica peste 

2. ✅ La animatia Givens:
- teta-ul ramane in aer dupa ce dispare v. Rezolva
- nu scrie x impartit la r, y impartit la r. Scrie x / r, y / r
- La cadrul cu matricea, fa o tranzitie de la forma Givens cu cos si sin la valorile numerice aflate anterior
- Scoate partea cu G*A din cadrul mentionat mai sus, cel cu matricea, si pune in loc de "I, cu 4 schimbate" "Matricea identitate, cu 4 elemente schimbate". Jos nu mai pune nimic, la scrisul mic alb
- Cand arati cum functioneaza Givens pe acel exemplu, ia mai bine linia si coloana, tu ai luat 2 linii. De asemenea, incepe cu elementul de pe linia 2, coloana 1. Apoi elem de pe linia 3, coloana 1. Apoi restul

✅ In aceasta pagina vreau animatiile sa se contopeasca cu teoria. Dupa teoria Householder, vreau sa pui animatia pentru Householder, iar dupa teoria Givens, animatia pentru Givens

La nivel de text:
- ✅ Sterge aceste paragrafe:
    - (PTP = I, se verifică în trei rânduri de calcul)
    - Ultima e semnătura unei oglinzi: o rotație are determinantul +1. Tot de aici iese și că P aplicată de două ori nu face nimic — o reflectare a reflectării
    - De ce contează care dintre cele două. Cu semnul celălalt, d = v − ‖v‖·e1 devine o scădere între numere aproape egale exact când v e deja aproape de axă — iar atunci cifrele semnificative se pierd. Pe v = (1; 10−10; 0), alegerea din formulă ține ‖d‖ = 2, iar cea opusă o prăbușește la 10−10: oglinda ajunge să fie definită de zgomot. Regula generală e că v și reflexia lui trebuie să fie depărtate. Prima coloană are norma 3, deci d = (5; 1; 2), iar reflexia o duce în (−3; 0; 0). Amândouă zerourile apar odată — asta e ce deosebește metoda: o transformare pe coloană, nu pe element. La pasul următor, d primește zerouri deasupra poziției de lucru. Nu e un detaliu de implementare: așa liniile de deasupra rămân neatinse, iar zerourile făcute la pasul dinainte nu se strică. Pentru o matrice m×n ajung min(m − 1, n) reflexii. (scoate inclusiv acea matrice)
    - Poziția în matrice se citește simplu: linia care se anulează dă unde stă sin θ. La descompunerea QR, perechea de linii e chiar poziția elementului de anulat — se merge de jos în sus pe fiecare coloană, ca zerourile deja făcute să nu fie atinse.
    - Matricea de la Givens
    - Primul element de anulat e sub un 0 de pe diagonală, deci cos θ = 0 și sin θ = −1: rotația de un sfert de tură care schimbă cele două linii între ele. E cel mai scurt exemplu că rotația nu „calculează" nimic, doar așază.

- ✅ Schimba acest paragraf (Care dintre ele, și când
Aceeași țintă, două socoteli diferite: una ieftină pe matrice pline, cealaltă paralelizabilă și blândă cu zerourile.

Câte transformări. Householder cere una pe coloană, deci de ordinul n. Givens cere una pentru fiecare element de sub diagonală, deci de ordinul n2/2 — un ordin de mărime mai mult, și fiecare cu radicalul ei. Pe matricea 3×3 din exemple: două reflexii față de trei rotații.

Ce câștigă totuși rotația. O rotație atinge exact două linii, deci mai multe rotații care lucrează pe perechi de linii diferite se pot face în același timp. Și, mai important, nu strică zerourile care există deja: pe o matrice rară, unde majoritatea elementelor sunt nule, ea plătește doar pentru cele câteva care nu sunt, în timp ce reflexia amestecă toată coloana.

Regula practică e chiar asta: Householder pentru matrice pline, Givens pentru matrice rare. Restul — ortogonalitatea, păstrarea normei, stabilitatea numerică — e comun; nu de acolo se alege.), tot acest paragraf, cu textul scris ca un Fun Fact: "Regula practică e chiar asta: Householder pentru matrice pline, Givens pentru matrice rare. Restul — ortogonalitatea, păstrarea normei, stabilitatea numerică — e comun; nu de acolo se alege"


La nivel de interfata grafica:
✅ Pe Householder:
- daca maresc cercul la maxim nu se mai vede d
- P * v nu se vede fiindca sta direct pe axa
- pune intr-un chenar fiecare valoare, cat da
(‖v‖ 2,2361
d (4,236; 1,000)
P·v (-2,236; 0)
det(P) −1) le ele ma refer
- "Ce se vede trăgând

Oricât ai muta vectorul, imaginea lui rămâne pe axă, la aceeași distanță de origine ca el — asta înseamnă că transformarea păstrează norma. Când v traversează axa verticală, semnul lui v1 se schimbă și oglinda sare dintr-o parte în alta: e chiar alegerea de semn care ține d departe de zero."
Pune partea asta sub legenda

Pe Givens:
- ✅ verifica daca cercul e ous bine, in cadranul 1 mie imi da cu -, s-ar putea sa fi inversat cercul
  (verificat: cercul e corect, iar minusul e corect — vezi nota de mai jos)


# Jacobi, Gauss-Seidel, SOR:
De scos:
- ✅ Toata interfata grafica
- ✅ La text:
1. partea cu aratarea matricii pe exemplu A, D, L, U
2. Aceeași despărțire, pe un sistem concret. Se verifică dintr-o privire: D − L − U pune fiecare element înapoi de unde a venit, cu semnul lui original.
3. Tot box-ul cu "Când converge și cât de repede"
4. Merită schimbul? De obicei da, și se vede pe cifre. Pe primul sistem al paginii, Jacobi are ρ = 0,6072 și termină în 33 de iterații, iar Gauss-Seidel ρ = 0,4082 și 23. Pe al doilea sistem, diferența nu mai e de viteză, ci de existență: ρ(Jacobi) = 1 exact, deci eroarea nu se micșorează niciodată — vectorul oscilează la nesfârșit —, în timp ce Gauss-Seidel ajunge la soluție în 20 de iterații. Nu e o regulă: există sisteme pe care Jacobi converge și Gauss-Seidel nu.
5. Cât de bun e ω optim nu se poate calcula. Se caută încercând, iar pe cele două sisteme ale paginii răspunsul e chiar diferit ca semn: pe cel dominant diagonal, cel mai bun ω e subunitar — 0,935, adică subrelaxare —, iar suprarelaxarea strică lucrurile până la divergență, pe la ω ≈ 1,47. Pe al doilea, cel mai bun e 1,08, deci suprarelaxare. Câștigul pe sisteme mici e de o iterație-două; el crește cu dimensiunea sistemului, și de aceea metoda se folosește când ai de rezolvat multe sisteme cu aceeași matrice: cauți ω o dată și îl refolosești.
6. Tot box-ul cu "Când se oprește"


De schimbat: 
- ✅ Fa acel tabel cu formule mai spatiat si mai mare, scrie metoda cu M mare
La animatie:
- ✅ Verifica daca matricea din exemplu respecta conditia de dominant diagonala
  (verificat: e cea din curs, §10 problema 3; dominanta e slabă, nu strictă —
  linia 2 are |4| = 1 + 3. Ambele metode converg oricum: ρ = 0,6072 și 0,4082.
  Animația nu afirma nicăieri dominanța, deci nu era nimic greșit pe ecran.)
- ✅ De verificat corectitudinea sagetilor
- ✅ De scris corect si frumos semnele (de exemplu x^(0) are niste spatii in plus)
- ✅ Transforma zecimalele in fractii
- ✅ Schimba subtitrarea "Coloana din stanga nu se schimba tot baleiajul" cu ceva mai consecvent, nu se intelege ce ai vrut sa zici
- ✅ Partea cu "Eroarea se inmulteste cu p la fiecare pas" poti sa o scoti si sa faci mai frumos desenata acea pagina, cam in stilul animatiei de la LU, cand vorbeam de Cramer vs LU
- ✅ la SOR, aeriseste pagina, sunt prea inghesuite acolo, nu prea se intelege nimic. De asemenea, fa si mai frumoasa animatia. Fa un fade-in, fa un efect


# Derivare numerica:
De scos:
- ✅ ANIMATIA TOTAL
- ✅ Graficul acela cu eroarea din Interactiv
LA TEXT: ✅
- Din cele șase formule care ies din calcul rămân doar două distincte: înlocuind h cu −h, celelalte se transformă una într-alta. Pentru derivata a doua se procedează identic și iese f″(x0) ≈ [f(x0−h) − 2f(x0) + f(x0+h)] / h2, cu eroarea −(h2/12)·f(4)(ξ). 
- Toată pagina e despre ce înseamnă „destul de mic" — fiindcă, spre deosebire de ce ne-am aștepta, mai mic nu înseamnă mai bun.
 de la paragraful de inceput
- Tot box-ul cu "de ce nu merge H oricat de mic


DE SCHIMBAT:
- La interactiv:
- ✅ Vreau valorile de la parametrii sa fie in chenare, functiile sa nu fie asa imprastiate, sa le aleg eu dintr-un drop-down
- ✅ Restrange Doua puncte inainte si inapoi doar in doua puncte, simplu. Poti alege ca reprezentare, doua puncte inainte, dar scrie sus doar "Doua puncte"
- ✅ Lucreaza mult pe functii, daca lasam asa nu se intelege nimic, eu nu inteleg nimic din exemplele tale. Vino cu ceva mai bun si care sa arate mai bine diferenta intre ele






1. scoate acel fade-out din josul animatiilor
2. functie de full-screen pentru animatii(atat pe laptop, cat si pe telefon)
3. Scriu mai putin la CG, DVS, QR si PageRank, LU:

La Pagerank: 
- scrie aceste paragrafe, in locul celor existente:
1. Întrebarea din spatele PageRank e "cât de importantă e o pagină web", iar răspunsul e: o valoare din vectorul propriu al rețelei de link-uri. Se pornește de la un navigator care urmează link-uri la întâmplare: importanța unei pagini e proporția din timp pe care el o petrece pe ea pe termen lung.”

- Rescrie acest paragraf:
1. Cursul cere două lucruri deodată: normalizarea după numărul de link-uri de ieșire și coloane care însumează 1. Link-urile de ieșire ale unei pagini stau pe linia ei, deci împărțirea se face pe linii — iar transpunerea e chiar pasul care mută cerința de pe linii pe coloane. Coloana j a lui M spune unde ajunge cine e acum pe pagina j.(acest paragraf fa-l mai mic si mai usor de inteles esenta)

- Sterge aceste paragrafe:
1. Matricea de adiacență a exemplului din curs: P1 → {P2, P3}, P2 → {P3}, P3 → {P1, P4}, P4 → {P2}. Se citește pe linii: linia i spune încotro se poate pleca de pe pagina i.
2. Viteza cu care se așază ponderile e dată de raportul dintre a doua valoare proprie a lui G și prima; pentru d = 0,85 pe exemplul din curs, raportul e ≈ 0,74, iar apropierea nu e monotonă — de la un pas la altul, o pondere poate și să se depărteze.


La Gradienti:
-Rescrie aceste paragrafe:
- Sterge aceste paragrafe:
1. Forma simplă a lui sk e rezultatul unui calcul, nu o simplificare de dragul comodității: pornind de la −⟨v(k), A·r(k)⟩ / ⟨v(k), A·v(k)⟩, se ajunge la raportul pătratelor normelor a două reziduuri consecutive.

La DVS:
- Scrie aceste paragrafe, in locul celor existente:
1. Până aici, valorile proprii au cerut matrice pătratice. DVS ridică cerința: orice matrice, chiar dreptunghiulară, se scrie ca produsul dintre o matrice ortogonală, una diagonală cu numere nenegative și încă una ortogonală.

- Sterge aceste paragrafe:
1. Când A e simetrică, avem A = AT, deci AT·A = A2: valorile proprii ale lui AT·A sunt pătratele valorilor proprii ale lui A, iar valorile singulare sunt modulele lor, si = |λi|. Pentru o matrice simetrică cu valori proprii pozitive, cele două liste coincid pur și simplu — caz luat separat mai jos.
2. Vectorii proprii se pot alege însă cu orice direcție și orice semn, deci V nu e unic: aceeași matrice A are mai multe descompuneri, toate valabile. Egalitatea D = S2 e chiar traducerea faptului că valorile proprii ale lui AT·A sunt nenegative
3. A·vi e direcția în care ajunge vi după înmulțire, iar lungimea ei e chiar si — de aceea împărțirea la si o readuce la 1. Formula funcționează doar pentru valorile singulare nenule; pentru celelalte ar cere împărțire la zero, deci restul de m − k coloane trebuie completat altfel.
4. Toata partea de Gram-Schmidt si Valori Singulare



La QR:
- Scrie aceste paragrafe, in locul celor existente:
1. Metodele puterii scot valorile proprii una câte una, iar eroarea acumulată crește repede — pentru tot spectrul nu se folosesc. Algoritmul QR face invers: lucrează pe matrice întreagă și le obține simultan, tot spectrul dintr-un singur șir de iterații. Prețul e o condiție de pornire: matricea trebuie să fie simetrică și tridiagonală, formă la care o aduce mai întâi metoda Householder.
2. Forma cerută la intrare. O matrice simetrică oarecare ajunge aici prin metoda Householder, printr-o transformare de asemănare
3. Toată iterația e în inversarea ordinii: se descompune A(i) = Q(i)·R(i), iar matricea următoare e produsul acelorași doi factori, luați invers.
4. Rândul care explică de ce funcționează metoda. Q(i) fiind ortogonală, din prima relație iese R(i) = Q(i)T·A(i), deci pasul e o transformare de asemănare ortogonală. De aici trei garanții deodată: A(i+1) rămâne simetrică, rămâne tridiagonală și are exact aceleași valori proprii ca A.
5. De aici se ia deplasarea, alta la fiecare pas: σi e valoarea proprie a acestei matrice de ordinul doi cea mai apropiată de an(i). Alegerea o grăbește pe bn, care ajunge la zero înaintea celorlalte; atunci an e o valoare proprie, se taie ultima linie și ultima coloană, și se reia procedeul pe matricea rămasă, până se epuizează spectrul.

- Rescrie aceste paragrafe:
1. Toata partea de "Matricea de Rotatie" si "Constructia lui Q si R" rescrie-o ca un singur link mic catre pagina care contine Givens, si spune ca asta e mecanismul din spate.

- Sterge aceste paragrafe:
1. Partea de matrici nesimetrice


4. Refa animatia QR astfel:

1. Fa toate simbolurile, numerele, literele din matrice si din animatii, din dreptunghiuri, mai mari
2. In prima parte, fa dreptunghiurile mai mari, astfel incat sa se vada mai frumos si sa curga mai frumos animatia. Delimiteaza b-urile si a-urile mai bine si fa-le mai mari
3. Peste tot, mareste scrisul, in afara de subtitrari
4. cand explici matricea de rotatie, schimba semnul teta cu alfa
5. Partea acea de jos cu teta se alege ca suma sa fie 0 sterge-o
6. Fa scrisul din cadrane sa inceapa cu litere mari
7. Repet, toate simbolurile sa fie mai mari

5. Schimba la interfata interactiva de la Gradient Conjugat si Gradient Descendent "Valea din curs" cu "Vale normala"


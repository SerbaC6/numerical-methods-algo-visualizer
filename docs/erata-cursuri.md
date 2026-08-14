# Erată — locuri din `cursuri_MN/` care nu se verifică

Regula proiectului e că **formulele vin exclusiv din curs**. Regula care o depășește în prioritate
e că **nimic greșit matematic nu ajunge sub ochii utilizatorului**. Când cele două intră în
conflict — adică atunci când o formulă din curs nu trece verificarea numerică — se procedează așa:

1. formula **nu** se pune pe site și **nu** se „corectează" tăcut;
2. dacă se poate păstra concluzia pe altă cale verificabilă, se păstrează concluzia;
3. cazul se scrie aici, cu verificarea numerică care l-a prins.

Fișierul ăsta există ca să nu se „repare la loc": cine deschide cursul peste trei luni și vede că
site-ul spune altceva trebuie să găsească aici de ce.

---

## curs7, §10 — matricea stocastică din exemplul PageRank

**Cursul cere trei lucruri deodată**, în paragraful „Construcția matricei":

1. element nenul pentru `Pi → Pj`;
2. **fiecare coloană însumează 1**;
3. **se normalizează după numărul de link-uri de ieșire**.

Primele două se verifică pe matricea tipărită. **A treia nu.** Pentru exemplul cursului
(`P1→{P2,P3}`, `P2→{P3}`, `P3→{P1,P4}`, `P4→{P2}`), matricea `M` tipărită împarte fiecare coloană la
numărul de link-uri care **intră** în pagina aceea, nu care ies din ea: e chiar `A` normalizată pe
coloane. Cea cerută de regula scrisă e transpusa lui `A` normalizat pe **linii** — link-urile de
ieșire ale unei pagini stau pe linia ei în `A`.

|                     | `M` tipărit în curs       | `M` după regula scrisă (link-uri de ieșire) |
| ------------------- | ------------------------- | ------------------------------------------- |
| linia 1             | `0  ½  ½  0`              | `0  0  ½  0`                                |
| linia 2             | `0  0  ½  0`              | `½  0  0  1`                                |
| linia 3             | `1  0  0  1`              | `½  1  0  0`                                |
| linia 4             | `0  ½  0  0`              | `0  0  ½  0`                                |
| PageRank (`d=0,85`) | `.2878 .2020 .3869 .1233` | `.1867 .2755 .3511 .1867`                   |
| clasament           | P3, P1, P2, P4            | **P3, P2, P1 = P4**                         |

**Nu e o diferență cosmetică: se schimbă clasamentul.** Cu matricea tipărită, `P1` iese a doua; cu
cea construită după regula scrisă, `P1` și `P4` sunt egale **exact** și împart locul 3.

**Verificare.** `(I − G)v = 0` cu `Σvᵢ = 1` și `d = 17/20`, rezolvat pe fracții, independent de
iterație, dă `v = (1429, 2109, 2687, 1429)/7654`, cu `G·v = v` exact. Metoda puterii de pe pagină
ajunge la aceleași cifre în 44 de iterații la `tol = 10⁻⁶`. Ambele drumuri, plus cifrele matricei
tipărite din tabelul de mai sus, sunt teste în `scripts/verificare-algoritmi/pagerank.ts`; testul
care ține erata pe loc e cel care cere ca matricea tipărită să **difere** de cea construită — dacă
cineva „repară" construcția înapoi la cifrele din curs, verificarea pică.

**Ce s-a pus pe site.** Regula scrisă a cursului, aplicată pas cu pas: `A` pe linii → împărțirea
fiecărei linii la numărul ei de link-uri → transpunerea → `G = d·M + ((1−d)/N)·ONES(N)`.
Transpunerea e chiar pasul care mută cerința „sumă 1" de pe linii pe coloane, deci se arată ca atare,
nu se ascunde. **Concluzia cursului rămâne neatinsă**: PageRank-ul e vectorul propriu al lui `G`
pentru `λ = 1`, care e și valoare proprie dominantă, deci se obține cu metoda puterii. Doar cifrele
exemplului sunt recalculate.

---

## curs6, §3.2 — derivata a doua a funcției de iterație a lui Newton

**Cursul scrie:**

```
g'(x)  = f(x)·f''(x) / (f'(x))²
g''(x) = 2·f''(x)/f'(x)
```

Prima e corectă. **A doua nu.**

**Verificare.** Pentru `f(x) = x² − 2`, funcția de iterație a lui Newton este
`g(x) = x − f(x)/f'(x) = x/2 + 1/x`. Derivata a doua a acestei funcții, calculată prin diferență
centrată, se compară cu cele două candidate:

| x   | g″ numeric | formula din curs, `2f″/f′` | `2/x³`       |
| --- | ---------- | -------------------------- | ------------ |
| 1,5 | 0,592593   | 1,333333                   | **0,592593** |
| 2   | 0,250000   | 1,000000                   | **0,250000** |
| 3   | 0,074074   | 0,666667                   | **0,074074** |
| √2  | 0,707107   | 1,414214                   | **0,707107** |

Formula din curs dă de patru ori valoarea reală în x = 2. Derivata a doua a lui `x/2 + 1/x` este
`2/x³`, ceea ce numericul confirmă pe toate cifrele.

Forma generală corectă, evaluată **în rădăcină** (unde `f(s) = 0`), este `g″(s) = f″(s)/f′(s)`:
la `s = √2` dă `2/(2√2) = 0,707107`, exact valoarea măsurată.

**Ce s-a pus pe site.** `g'(x)` da, cu tot cu observația `g′(s) = 0`. `g''(x)` nu apare deloc.
**Concluzia cursului — ordinul de convergență 2 pentru Newton-Raphson — rămâne**, fiindcă ea decurge
din `g′(s) = 0`: primul termen nenul din dezvoltarea Taylor devine cel cu `εₙ²`, iar exponentul lui
dă ordinul. Am confirmat-o și empiric pe `x² − 2` pornind din 2: ordinul estimat pe pași succesivi
iese 2,45 → 2,17 → 2,08, adică tinde la 2.

Scriptul de verificare: `scratchpad/verif_curs6.py` din sesiunea de lucru (nu e păstrat în repo,
fiind un calcul de unică folosință; tabelul de mai sus e rezultatul lui).

---

## curs6, §2.3 — tabelul comparativ de iterații

**Cursul dă**, pentru toleranță `10⁻¹⁵`:

| Funcție       | Bisecție | Secantă | Tangentă |
| ------------- | -------- | ------- | -------- |
| 0,25·eˣ − 2   | 48       | 7       | 7        |
| 3·cos(x) − 4x | 50       | 7       | 5        |
| x² − 2        | 49       | 7       | 6        |
| ln(x) − 2     | 46       | 6       | 4        |
| x² + √x − 6   | 48       | 7       | 5        |

Convenția de pornire e scrisă în curs: pentru o rădăcină `c`, metodele cu două valori inițiale
pornesc din `[[c], [c]+1]`, cele cu una din `[c]+1`. Cu ea, tabelul se poate testa — și se împarte
în trei cazuri diferite, care nu trebuie confundate.

**Secanta se reproduce exact, pe toate cele cinci rânduri:** 7, 7, 7, 6, 7. Modulul din
`src/algorithms/ecuatii-neliniare/secanta.ts` dă aceleași cifre, rulat cu Algorithm 3 și
`|xₙ − xₙ₋₁| < tol`. E verificarea cea mai puternică disponibilă pentru pagina 6, fiindcă nu compară
cu intuiția, ci cu cifre tipărite. Se rulează cu `scripts/verificare-algoritmi/tabelul-din-curs.ts`.

**Bisecția diferă din cauza criteriului de oprire.** Cursul enumeră mai multe criterii la §1.1, iar
Algorithm 1 îl folosește pe `|f(c)| > tol`. Noi am ales `b − a < tol` — primul din listă și singurul
care se poate garanta dinainte, prin `|pₙ − p| < (b−a)/2ⁿ`. Pe un interval de lungime 1 acesta dă
invariabil `⌈log₂(1/10⁻¹⁵)⌉ = 50` de pași, indiferent de funcție; criteriul pe `|f(c)|` depinde de
cât de abruptă e funcția în rădăcină, de-aia cifrele din tabel variază. Transcriind Algorithm 1
literal iese 49/51/50/**46**/51 — se potrivește exact pe `ln(x) − 2`, ceea ce confirmă că acela a
fost criteriul folosit; restul rămân decalate cu 1–3, cel mai probabil fiindcă pseudocodul testează
`|f(c)|` **înainte** ca `c` să fie calculat (linia 1 folosește un `c` neinițializat).

**Tangenta are o abatere care nu ține de criteriu.** Aici cursul se contrazice pe sine: transcriind
Algorithm 2 literal, cu chiar criteriul lui `|x − xprev| < tol`, ies 7, 5, 6, **5**, **6** — pe când
tabelul de alături spune 7, 5, 6, **4**, **5**. Primele trei rânduri se potrivesc; ultimele două nu,
și nu din cauza noastră: modulul nostru dă exact ce dă transcrierea literală. Verificarea din
`tabelul-din-curs.ts` compară deci tangenta cu **algoritmul**, nu cu tabelul, și scrie diferența pe
ecran ca să nu fie luată drept regresie.

**Ce s-a pus pe site.** Nu cifrele exacte, ci ordinul lor de mărime și concluzia, care sunt robuste
la criteriu: bisecția are nevoie de ordinul a 50 de iterații acolo unde secanta și tangenta termină
în 4–7. Concluzia calitativă a cursului — tangenta e mai rapidă decât secanta — se verifică pe toate
cele cinci funcții și e testată ca atare. Dacă vreodată vrem tabelul exact pe pagină, întâi trebuie
stabilit criteriul de oprire și recalculat, nu copiat.

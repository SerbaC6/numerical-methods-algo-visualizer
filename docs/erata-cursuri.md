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

**Nu e o greșeală, dar nu e nici reproductibil.** Rulând independent, cu criteriul de oprire
`b − a < tol` pentru bisecție și `|xₙ − xₙ₋₁| < tol` pentru celelalte două, iese: bisecție 50 la
toate cinci (firesc — pe un interval de lungime 1, `log₂(1/10⁻¹⁵) ≈ 49,8`), secantă 7/7/7/6/7,
tangentă 7/5/6/5/6. Secanta se potrivește; bisecția și tangenta diferă cu 1–4 pași.

Diferența vine din criteriul de oprire, pe care cursul nu-l precizează pentru acel experiment
(Algorithm 1 din §1.1 folosește `|f(c)| > tol`, ceea ce dă alte numere decât `b − a < tol`).

**Ce s-a pus pe site.** Nu cifrele exacte, ci ordinul lor de mărime și concluzia, care sunt robuste
la criteriu: bisecția are nevoie de ordinul a 50 de iterații acolo unde secanta și tangenta termină
în 4–7. Dacă vreodată vrem tabelul exact pe pagină, întâi trebuie stabilit criteriul de oprire și
recalculat, nu copiat.

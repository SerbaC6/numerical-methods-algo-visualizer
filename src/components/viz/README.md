# `src/components/viz`

Aparatul interactiv al unei pagini de algoritm: sistemul de axe, curba funcției, markerii de
iterație, plus controalele care le însoțesc.

| Componentă        | Ce face                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `ControlPanel`    | grupul de parametri, responsiv, cu „Resetează"                   |
| `PlaybackBar`     | reset / pas înapoi / play-pauză / pas înainte / viteză / poziție |
| `IterationTable`  | tabelul de iterații, cu rândul curent sincronizat cu animația    |
| `FormulaBlock`    | formulă KaTeX, cu evidențierea părților sincron cu animația      |
| `NumberInput`     | câmp numeric cu validare și mesaj de eroare                      |
| `ExpressionInput` | câmp pentru `f(x)`, cu validare la tastare și exemple            |
| `Legend`          | legenda de culori + modul de folosire în 3–5 pași                |
| `StepExplanation` | propoziția care descrie pasul curent, lângă desen                |

Nu conțin matematică — primesc `steps[]` gata calculați din `src/algorithms`.
Convențiile de folosire sunt în [`docs/design-system.md`](../../../docs/design-system.md).

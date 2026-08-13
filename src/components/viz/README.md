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
| `MatrixGrid`      | matricea desenată, cu starea fiecărei celule la pasul curent     |
| `Plot`            | sistemul de axe: grilă, repere, zoom și tragere                  |

`Plot` se compune din **straturi cu nume**, nu din proprietăți (regula 10 din
[`docs/referinte.md`](../../../docs/referinte.md)). Fiecare strat își ia scara din context, deci o
pagină poate scrie un strat propriu fără să modifice `Plot`:

| Strat          | Ce desenează                                         | Unde se folosește       |
| -------------- | ---------------------------------------------------- | ----------------------- |
| `PlotCurba`    | curba funcției, ruptă la discontinuități             | peste tot               |
| `PlotPunct`    | punctul de iterație, cu etichetă și proiecție pe axă | peste tot               |
| `PlotInterval` | banda `[a, b]`, cu tranziție când se strânge         | bisecție, cuadraturi    |
| `PlotArie`     | aria dintre un contur și o linie de bază             | trapeze, Simpson        |
| `PlotDreapta`  | tangenta sau secanta, tăiată la marginile cadrului   | Newton, secantă, coarde |

```tsx
<Plot domeniuX={[2, 3]} domeniuY={domeniuY} rezumat="Bisecție pe f(x) = x³ − 2x − 5">
  <PlotInterval de={a} la={b} />
  <PlotCurba segmente={segmente} />
  <PlotPunct x={c} y={f(c)} rol="curent" proiectie eticheta="x₃" />
</Plot>
```

Matematica graficului **nu** stă aici, ci în [`src/lib/plot-scara.ts`](../../lib/plot-scara.ts)
(scară, repere, tăiere la cadru, zoom) și [`plot-esantionare.ts`](../../lib/plot-esantionare.ts)
(eșantionare, rupere la asimptote) — ca să poată fi verificată în afara interfeței.

Nu conțin matematică — primesc `steps[]` gata calculați din `src/algorithms`.
Convențiile de folosire sunt în [`docs/design-system.md`](../../../docs/design-system.md).

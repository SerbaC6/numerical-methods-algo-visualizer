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
| `Clip`            | ceasul unui clip narativ: scene, repere, cadru, mișcare redusă   |
| `PlaybackClip`    | comenzile clipului, pe **timp** (bara pe pași e `PlaybackBar`)   |
| `Subtitrari`      | propoziția de sub desen, cheiată pe ceasul clipului              |

**`Clip` nu e o variantă de `Plot`.** `Plot` desenează o stare — pasul `k` dintr-un `steps[]`, ales
de utilizator. `Clip` desenează un **film**: un singur arbore de elemente, randat ca funcție pură de
timpul autorat `T`, cu scenele declarate într-o listă și coregrafia scrisă față de reperele derivate
din ea (`repere()` din [`src/lib/compozitie.ts`](../../lib/compozitie.ts)). Nimic nu se montează la
granița dintre scene, deci un element poate traversa granița prin interpolare.

Se folosește pentru secțiunea „Vizual" atunci când clipul e scris în cod, nu randat cu Manim — vezi
excepția paginii 7 din `CLAUDE.md`. Un clip **nu** primește parametrii utilizatorului; când e nevoie
de asta, e vorba de interfața interactivă, adică de `Plot`/`MatrixGrid`.

`Plot` se compune din **straturi cu nume**, nu din proprietăți (regula 10 din
[`docs/referinte.md`](../../../docs/referinte.md)). Fiecare strat își ia scara din context, deci o
pagină poate scrie un strat propriu fără să modifice `Plot`:

| Strat          | Ce desenează                                         | Unde se folosește         |
| -------------- | ---------------------------------------------------- | ------------------------- |
| `PlotCurba`    | curba funcției, ruptă la discontinuități             | peste tot                 |
| `PlotPunct`    | punctul de iterație, cu etichetă și proiecție pe axă | peste tot                 |
| `PlotInterval` | banda `[a, b]`, cu tranziție când se strânge         | bisecție, cuadraturi      |
| `PlotArie`     | aria dintre un contur și o linie de bază             | trapeze, Simpson          |
| `PlotDreapta`  | tangenta sau secanta, tăiată la marginile cadrului   | Newton, secantă, coarde   |
| `PlotTaietura` | valoarea pasului marcată pe axă, cu mustață și inel  | Newton, secantă, bisecție |
| `PlotPanta`    | triunghiul care arată de unde vine panta dreptei     | Newton, secantă           |

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

## Unde se termină CSS-ul și unde începe `motion`

Proiectul folosește amândouă, dar **nu la întâmplare**. Granița e după _ce_ se schimbă, nu după
componentă:

| Se schimbă                                    | Cu ce        | De ce                                                                                                                   |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **poziție, formă, geometrie** (`x`, `width`…) | **`motion`** | CSS nu poate anima geometria SVG pe toate browserele — pe Safari banda intervalului sărea, adică exact animația metodei |
| **culoare, opacitate, hover, focus**          | **CSS**      | culorile se animează identic peste tot, iar `transition-colors` e mai ieftin decât un element `motion`                  |

De aceea `PlotPunct`, `PlotInterval`, `PlotDreapta` și `PlotTaietura` sunt scrise cu `motion`
(se mută), iar `MatrixGrid` și
`IterationTable` rămân pe `transition-colors` (își schimbă doar culoarea celulei sau a rândului).
Dacă `MatrixGrid` ajunge vreodată să **mute** linii — la pivotarea cu interschimbare — partea aia
trece pe `motion`, restul rămâne unde e.

Două reguli care nu se încalcă în straturile animate:

- **pozițiile se animează prin transformare (`animate={{ x, y }}`), nu prin atribute de geometrie.**
  Capcană: pe un element SVG, `x` din `animate` înseamnă `translateX`, **nu** atributul `x`. Dacă
  scrii și atributul, și transformarea, cele două se adună. Excepție firească: ce își schimbă
  _lungimea_, nu doar poziția (linia de proiecție din `PlotPunct`), unde se animează `x1`/`y1`/`y2`,
  care sunt atribute obișnuite și n-au ambiguitatea asta.
- **`initial={false}` peste tot.** Fără el, la prima randare fiecare marcaj ar veni alunecând din
  colțul din stânga-sus — un drum care nu înseamnă nimic matematic.

Duratele vin din [`src/lib/miscare.ts`](../../lib/miscare.ts) (`tranzitie()`), niciodată din numere
scrise de mână. `prefers-reduced-motion` e tratat o singură dată, din `MotionConfig` în
`src/main.tsx`.

Nu conțin matematică — primesc `steps[]` gata calculați din `src/algorithms`.
Convențiile de folosire sunt în [`docs/design-system.md`](../../../docs/design-system.md).

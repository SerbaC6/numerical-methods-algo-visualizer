import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 13 — curbe Bézier și algoritmul de Casteljau.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`, §13 (curbe
 * Hermite), §14 (polinoame Bernstein), §15 (curbe Bézier) și §16 (algoritmul De
 * Casteljau).** Nimic scris din memorie.
 *
 * **Verificat numeric, separat de aplicație**, pe modulul real
 * (`src/algorithms/curbe-bezier/bezier.ts`):
 *
 * - de Casteljau și suma `Σ Pᵢ·Bⁿᵢ(t)` dau același punct — abatere maximă
 *   `1,8·10⁻¹⁵` pe 300 de poligoane aleatoare de 3–8 puncte, cu `t` din 0,05 în
 *   0,05;
 * - partiția unității, simetria `Bⁿᵢ(t) = Bⁿₙ₋ᵢ(1−t)`, recurența și maximul unic
 *   în `t = i/n` — toate din §14 — se verifică până la `4,4·10⁻¹⁶`;
 * - `B(0) = P₀`, `B(1) = Pₙ`, iar cubica explicită tipărită în §15 coincide cu
 *   de Casteljau până la `8,9·10⁻¹⁶`;
 * - tangenta în capete e coliniară cu `P₀P₁` și `Pₙ₋₁Pₙ`, iar `B′(0) = 3(P₁−P₀)`
 *   — exact relația Hermite ↔ Bézier din §15.
 */
export const continutCurbeBezier: ContinutPagina = {
  teorie: {
    intro: (
      <>
        O curbă netedă se poate cere în două feluri: spunând prin ce puncte trece{" "}
        <strong>și cu ce pantă</strong>, sau trăgând de câteva puncte până arată bine. Bézier o cere
        în al doilea fel — și tocmai de aceea se desenează cu mâna.
      </>
    ),

    metode: [
      {
        id: "hermite",
        titlu: "De la Hermite la Bézier",
        esenta: (
          <>
            Aceeași cubică, cerută altfel: în loc de două derivate, două puncte de control în plus.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "Q(t) = (2t^3 - 3t^2 + 1)P_1 + (-2t^3 + 3t^2)P_2 + (t^3 - 2t^2 + t)P_1' + (t^3 - t^2)P_2'",
            sursa: "curs 9, §13",
            legenda: [
              { simbol: "P₁, P₂", sens: <>capetele prin care trece curba</> },
              { simbol: "P₁′, P₂′", sens: <>derivatele cerute în cele două capete</> },
              { simbol: "t", sens: <>parametrul, de la 0 la 1</> },
            ],
            explicatie: (
              <>
                Curba Hermite: patru condiții, deci grad 3. Fiecare paranteză e o{" "}
                <strong>funcție de îmbinare</strong> — cât din punctul de lângă ea intră în
                rezultat.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "P_1' = 3(P_1 - P_0), \\qquad P_2' = 3(P_3 - P_2)",
            sursa: "curs 9, §15",
            legenda: [
              { simbol: "P₀ … P₃", sens: <>cele patru puncte ale formei Bézier</> },
              { simbol: "P₁′, P₂′", sens: <>derivatele formei Hermite, scrise cu ele</> },
            ],
            explicatie: (
              <>
                Toată diferența dintre cele două scrieri. O derivată nu se poate trage cu mouse-ul;
                un punct, da.
              </>
            ),
          },
        ],
      },

      {
        id: "bernstein",
        titlu: "Polinoamele Bernstein",
        esenta: <>Ponderile cu care fiecare punct de control trage de curbă, la fiecare t.</>,
        blocuri: [
          {
            tip: "formula",
            latex: "B^n_i(t) = \\binom{n}{i}\\, t^i\\, (1-t)^{n-i}, \\qquad i = 0 : n",
            sursa: "curs 9, §14",
            legenda: [
              { simbol: "n", sens: <>gradul, cu unul mai mic decât numărul de puncte</> },
              { simbol: "i", sens: <>al câtelea punct de control</> },
              { simbol: "C(n,i)", sens: <>coeficientul binomial</> },
            ],
            explicatie: (
              <>
                Ies din dezvoltarea lui <Mate>[t + (1−t)]ⁿ = 1</Mate>, iar <Mate>Bⁿᵢ</Mate> își
                atinge maximul exact în <Mate>t = i/n</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "\\sum_{i=0}^{n} B^n_i(t) = 1, \\qquad B^n_i(t) > 0 \\ \\text{ pe } (0,1)",
            sursa: "curs 9, §14",
            legenda: [
              { simbol: "Σ Bⁿᵢ = 1", sens: <>partiția unității</> },
              { simbol: "Bⁿᵢ > 0", sens: <>nenegativitate pe interiorul intervalului</> },
            ],
            explicatie: (
              <>
                Ponderi pozitive care adună 1: fiecare punct al curbei e o <strong>medie</strong> a
                punctelor de control, deci nu poate ieși din înfășurătoarea lor convexă.
              </>
            ),
          },
        ],
      },

      {
        id: "curba",
        titlu: "Curba Bézier",
        esenta: (
          <>
            Poligonul de control conduce curba: ea pleacă din primul punct, ajunge în ultimul și
            rămâne înăuntru.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "B(t) = \\sum_{i=0}^{n} P_i\\, B_{i,n}(t), \\qquad t \\in [0,1]",
            sursa: "curs 9, §15",
            legenda: [
              { simbol: "Pᵢ", sens: <>punctele care conduc curba</> },
              { simbol: "B(t)", sens: <>punctul de pe curbă la parametrul t</> },
            ],
            explicatie: (
              <>
                Gradul îl dă numărul de puncte, iar mutarea oricăruia schimbă toată curba — nu doar
                o bucată din ea.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "B(0) = P_0 \\qquad B(1) = P_n",
            sursa: "curs 9, §15",
            legenda: [
              { simbol: "P₀, Pₙ", sens: <>puncte de interpolare: curba chiar trece prin ele</> },
              { simbol: "P₁ … Pₙ₋₁", sens: <>puncte de control: curba doar le urmează</> },
            ],
            explicatie: (
              <>
                Spre deosebire de spline, curba trece <strong>doar</strong> prin capete. În ele e
                tangentă la <Mate>P₀P₁</Mate> și la <Mate>Pₙ₋₁Pₙ</Mate>.
              </>
            ),
          },
        ],
      },

      {
        id: "casteljau",
        titlu: "Algoritmul de Casteljau",
        esenta: (
          <>
            Interpolare liniară repetată: din fiecare pereche de puncte iese unul singur, până
            rămâne un punct — cel de pe curbă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "P_i^{(0)} = P_i, \\qquad P_i^{(j)} = (1 - t)\\,P_i^{(j-1)} + t\\,P_{i+1}^{(j-1)}",
            sursa: "curs 9, §16",
            legenda: [
              { simbol: "j", sens: <>al câtelea nivel, de la 1 la n</> },
              { simbol: "Pᵢ⁽ʲ⁾", sens: <>punctul i de pe nivelul j</> },
              { simbol: "P₀⁽ⁿ⁾", sens: <>singurul punct rămas, adică B(t)</> },
            ],
            explicatie: (
              <>
                Fiecare punct nou împarte segmentul dintre două puncte vechi în raportul{" "}
                <Mate>t/(1−t)</Mate>. Un nivel are cu un punct mai puțin decât cel dinaintea lui.
              </>
            ),
          },
          {
            tip: "callout",
            titlu: "De ce nu se calculează suma direct",
            continut: (
              <>
                Suma ridică numere mici la puteri mari, iar erorile cresc odată cu gradul. De
                Casteljau e mai lent, dar <strong>stabil numeric</strong>.
              </>
            ),
          },
        ],
      },
    ],
  },
};

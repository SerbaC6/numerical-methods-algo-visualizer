import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 16 — integrare numerică, metodele Newton-Cotes.
 *
 * **Sursă: `cursuri_MN/derivare-integrare-numerica_curs11.md`**, partea de
 * integrare: cuadratura numerică, deducerea coeficienților din interpolarea
 * Lagrange, nodurile echidistante Newton-Cotes, formulele închise și deschise,
 * formula trapezelor (`N = 1`), formula Simpson (`N = 2`), formulele deschise
 * particularizate și formulele compuse. Partea de derivare a aceluiași curs e
 * pagina 15. Nimic scris din memorie.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/newton-cotes.ts`, pe modulele reale):
 *
 * - primitivele scrise analitic sunt chiar primitivele funcțiilor — altfel
 *   toată pagina ar măsura eroarea față de un număr greșit;
 * - formulele simple ale cursului ies din cele compuse cu un singur panou, la
 *   `0` diferență;
 * - sumele compuse coincid cu formulele închise tipărite în curs, rescrise
 *   independent în script, la `N` între 2 și 50;
 * - gradul de exactitate, măsurat pe monoame: trapezele sunt exacte până la
 *   gradul 1 și greșesc cu `5,07·10⁻¹` pe `x²`; Simpson e exact până la gradul
 *   **3** și greșește cu `5,36·10⁻¹` abia pe `x⁴`;
 * - ordinul erorii, **măsurat ca pantă** la înjumătățirea pasului, nu enunțat:
 *   `2,0002` la trapeze, `4,0012` la Simpson, `2,0003` la punctul de mijloc;
 * - marginile de eroare ale cursului chiar mărginesc eroarea măsurată, la toate
 *   valorile lui `N` încercate;
 * - semnul erorii, dat de convexitate: pe `1/x` în `[1, 2]` trapezele dau
 *   `0,6941218504` față de `ln 2 = 0,6931471806` (peste), iar punctul de mijloc
 *   `0,6926605540` (sub); pe `sin` în `[0, π]` trapezele dau `1,9742` (sub);
 * - capcana `√x` în `[0, 1]`: `f″` e nemărginită în zero, deci marginea nu se
 *   poate calcula deloc, iar ordinul măsurat scade la `1,4892`.
 */
export const continutNewtonCotes: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Când primitiva nu se cunoaște, sau funcția e știută doar prin valorile ei în câteva puncte,
        integrala <Mate>∫ₐᵇ f(x) dx</Mate> se înlocuiește cu o sumă de valori ale lui <Mate>f</Mate>
        , fiecare cu ponderea ei.
      </>
    ),

    metode: [
      {
        id: "cuadratura",
        titlu: "Cuadratura numerică: integrala ca sumă",
        esenta: (
          <>
            Funcția se înlocuiește cu polinomul ei de interpolare, iar acela se integrează exact —
            de acolo ies și ponderile, și termenul de eroare.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "I_N[f] = \\sum_{i=0}^{N} A_i f(x_i), \\qquad A_i = \\int_a^b l_i(x)w(x)\\,dx",
            sursa: "curs 11, cuadratura numerică și metodele Newton-Cotes",
            legenda: [
              { simbol: "xᵢ", sens: <>nodurile: punctele în care se evaluează funcția</> },
              { simbol: "Aᵢ", sens: <>ponderile, integralele multiplicatorilor Lagrange</> },
              { simbol: "lᵢ", sens: <>multiplicatorul Lagrange al nodului i</> },
            ],
            explicatie: (
              <>
                Ponderile nu se aleg: ies din cerința ca formula să fie exactă pe polinoame de grad{" "}
                <Mate>≤ N</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "x_i = a + i\\frac{(b-a)}{N}, \\qquad i = 0 : N",
            sursa: "curs 11, metode Newton-Cotes",
            legenda: [
              { simbol: "N", sens: <>gradul polinomului de interpolare folosit</> },
              { simbol: "(b − a)/N", sens: <>pasul dintre două noduri vecine</> },
            ],
            explicatie: (
              <>
                Asta e tot ce înseamnă „Newton-Cotes": nodurile sunt <strong>echidistante</strong>.
                Restul e alegerea lui <Mate>N</Mate>.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Formulele sunt <strong>închise</strong> dacă nodurile includ capetele <Mate>a</Mate>{" "}
                și <Mate>b</Mate>, și <strong>deschise</strong> dacă nu. Interpolarea polinomială e
                instabilă la grad mare, deci se folosesc doar <Mate>N</Mate> mici.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\int_{x_{-1}}^{x_1} f(x)\\,dx = 2hf(x_0) + \\frac{h^3}{3}f''(\\xi), \\qquad h = \\frac{b-a}{2}",
            sursa: "curs 11, formulele Newton-Cotes deschise particularizate (n = 0)",
            subtitlu: "Cea mai simplă formulă deschisă: punctul de mijloc",
            legenda: [
              { simbol: "x₋₁, x₁", sens: <>capetele intervalului, care nu sunt noduri</> },
              { simbol: "x₀", sens: <>singurul nod, la mijlocul intervalului</> },
            ],
            explicatie: (
              <>
                O singură evaluare, la mijloc: dreptunghiul care iese e mai bun decât ar părea,
                fiindcă ce iese peste curbă de o parte intră sub ea de cealaltă.
              </>
            ),
          },
        ],
      },
      {
        id: "trapeze",
        titlu: "Formula trapezelor (N = 1)",
        esenta: (
          <>
            Cu două noduri, polinomul de interpolare e o dreaptă: curba se înlocuiește cu coarda
            dintre capete, iar aria de sub ea e a unui trapez.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\int_a^b f(x)\\,dx = \\frac{h}{2}\\left[f(a) + f(b)\\right] - \\frac{h^3 f''(\\xi)}{12}, \\qquad h = b-a",
            sursa: "curs 11, formula trapezelor",
            legenda: [
              { simbol: "h", sens: <>lungimea intervalului, aici chiar b − a</> },
              { simbol: "ξ", sens: <>un punct din interval, necunoscut, dar existent</> },
              {
                simbol: "−h³f″(ξ)/12",
                sens: <>eroarea: dispare când f″ e nulă, adică pe drepte</>,
              },
            ],
            explicatie: (
              <>
                Egalitatea e <em>exactă</em>: formula plus termenul ei de eroare. Semnul lui{" "}
                <Mate>f″</Mate> decide încotro se greșește — pe o funcție convexă coarda trece pe
                deasupra curbei, deci suma iese prea mare.
              </>
            ),
          },
        ],
      },
      {
        id: "simpson",
        titlu: "Formula Simpson (N = 2)",
        esenta: (
          <>
            Cu încă un nod, la mijloc, coarda devine parabolă — iar eroarea nu scade cu o treaptă,
            ci cu două.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\int_a^b f(x)\\,dx = \\frac{h}{3}\\left[f(a) + 4f\\!\\left(\\frac{a+b}{2}\\right) + f(b)\\right] - \\frac{h^5 f^{(4)}(\\xi)}{90}, \\qquad h = \\frac{b-a}{2}",
            sursa: "curs 11, formula Simpson",
            legenda: [
              { simbol: "h", sens: <>jumătate din interval, fiindcă nodurile sunt trei</> },
              { simbol: "4f((a+b)/2)", sens: <>nodul din mijloc, cu ponderea cea mai mare</> },
              { simbol: "−h⁵f⁽⁴⁾(ξ)/90", sens: <>eroarea depinde acum de derivata a patra</> },
            ],
            explicatie: (
              <>
                Un nod în plus mută eroarea de la <Mate>f″</Mate> la <Mate>f⁽⁴⁾</Mate>, deci
                parabola nu doar urmărește curba mai bine: ea integrează exact mai mult decât
                desenează.
              </>
            ),
          },
          {
            tip: "callout",
            titlu: "Simpson e exact și pe cubice, deși desenează o parabolă",
            continut: (
              <>
                Termenul de eroare conține <Mate>f⁽⁴⁾</Mate>, iar la un polinom de grad cel mult 3
                aceea e identic nulă. Arcul desenat nu coincide cu curba, dar cât iese peste ea
                într-o jumătate, atât intră sub ea în cealaltă.
              </>
            ),
          },
        ],
      },
      {
        id: "compuse",
        titlu: "Formulele compuse",
        esenta: (
          <>
            Nu se crește <Mate>N</Mate>, ci se taie intervalul în bucăți și se aplică pe fiecare
            aceeași formulă simplă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\int_a^b f(x)\\,dx \\approx \\frac{h}{2}\\left[f(a) + f(b) + 2\\sum_{i=1}^{N-1} f(a+ih)\\right], \\qquad h = \\frac{(b-a)}{N}",
            sursa: "curs 11, formula compusă a trapezelor",
            subtitlu: "Trapeze",
            legenda: [
              { simbol: "N", sens: <>în câte subintervale se taie [a, b]</> },
              { simbol: "2", sens: <>nodurile interioare aparțin la câte două trapeze</> },
            ],
            explicatie: (
              <>
                Eroarea totală e <Mate>−(b − a)h²f″(µ)/12</Mate>: înjumătățirea pasului o împarte la
                patru.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\int_a^b f(x)\\,dx \\approx \\frac{h}{3}\\left[f(a) + f(b) + 4\\sum_{i=1}^{N/2} f(x_{2i-1}) + 2\\sum_{i=1}^{N/2-1} f(x_{2i})\\right]",
            sursa: "curs 11, formula compusă Simpson",
            subtitlu: "Simpson",
            legenda: [
              { simbol: "N", sens: <>număr par: formula se aplică pe perechi de subintervale</> },
              { simbol: "4", sens: <>nodurile impare, mijloacele perechilor</> },
              { simbol: "2", sens: <>nodurile pare din interior, comune la două perechi</> },
            ],
            explicatie: (
              <>
                Eroarea e <Mate>−(b − a)h⁴f⁽⁴⁾(µ)/180</Mate>: același pas înjumătățit împarte acum
                eroarea la șaisprezece.
              </>
            ),
          },
        ],
      },
    ],
  },
};

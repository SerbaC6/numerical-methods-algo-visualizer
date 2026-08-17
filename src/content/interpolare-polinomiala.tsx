import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 12 — interpolare polinomială, funcția Runge și spline-uri.
 *
 * **Sursă: `cursuri_MN/interpolare_spline_bezier_teorie_curs09.md`**, §1
 * (problema interpolării și Weierstrass), §2 (Lagrange), §3 (Neville), §4
 * (diferențe divizate, identitatea lui Newton, teorema erorii), §8 (fenomenul
 * Runge), §9–§12 (spline). Nimic scris din memorie.
 *
 * **Verificat numeric, separat de aplicație**, pe modulele reale din
 * `src/algorithms/interpolare-polinomiala/` (vezi
 * `scripts/verificare-algoritmi/interpolare-polinomiala.ts`) și, înainte de
 * ele, pe fracții exacte în Python:
 *
 * - multiplicatorii Lagrange dau `lₖ(xᵢ) = δᵢₖ` și `Σ lₖ ≡ 1`; polinomul trece
 *   prin toate nodurile, iar pe un polinom de grad ≤ n se reproduce pe sine —
 *   unicitatea din §2;
 * - toate cele trei scrieri ale lui Neville din curs (`P_{σ+j+k}`, `Q_{i,j}`,
 *   forma din laborator) plus codul OCTAVE dau **exact** polinomul Lagrange, pe
 *   fracții, în patru puncte de test;
 * - Runge pe `[−1, 1]`, noduri echidistante: 5 noduri → eroare 0,4384;
 *   **11 noduri → max|P| = 1,9590 în x ≈ −0,940 și eroare 1,9157**, deși funcția
 *   nu trece de 1. Spline cubic natural pe **aceleași** 11 noduri: eroare
 *   **0,02197**;
 * - spline: liniarul interpolează dar are pante diferite între subintervale;
 *   cubicul C² verifică racordarea C⁰/C¹/C² exact (salt 0), `c₀ = cₙ = 0` la cel
 *   natural și `s′ = f′` în capete la cel tensionat; forma alternativă a lui
 *   `bᵢ` tipărită în curs coincide cu cea principală.
 *
 * Patru locuri din curs nu se verifică; sunt scrise în `docs/erata-cursuri.md`,
 * iar pe pagină ajung doar formele corecte.
 */
export const continutInterpolarePolinomiala: ContinutPagina = {
  teorie: {
    intro: (
      <>
        O funcție cunoscută doar în câteva puncte se înlocuiește cu un polinom care trece prin
        toate. Weierstrass garantează că <strong>există</strong> un polinom oricât de aproape de
        funcție; ce urmează sunt drumuri diferite către același polinom de interpolare — și, la
        capăt, motivul pentru care uneori nu el e răspunsul.
      </>
    ),

    metode: [
      {
        id: "lagrange",
        titlu: "Interpolarea Lagrange",
        esenta: (
          <>
            Fiecare nod primește un polinom care valorează 1 în el și 0 în toate celelalte;
            polinomul căutat e suma lor, ponderată cu valorile funcției.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "l_k(x) = \\prod_{\\substack{i=0 \\\\ i \\neq k}}^{n} \\frac{x - x_i}{x_k - x_i}",
            sursa: "curs 9, §2",
            legenda: [
              {
                simbol: "x₀ … xₙ",
                sens: <>suportul interpolării: nodurile în care se cunoaște f</>,
              },
              { simbol: "lₖ", sens: <>multiplicatorul Lagrange al nodului k</> },
              { simbol: "n", sens: <>gradul, cu 1 mai mic decât numărul de noduri</> },
            ],
            explicatie: (
              <>
                Numărătorul se anulează în toate nodurile în afară de <Mate>xₖ</Mate>, iar numitorul
                e ales exact cât să dea <Mate>lₖ(xₖ) = 1</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "P_n(x) = \\sum_{k=0}^{n} f(x_k) \\prod_{\\substack{i=0 \\\\ i \\neq k}}^{n} \\frac{x - x_i}{x_k - x_i}",
            sursa: "curs 9, §2",
            legenda: [
              { simbol: "f(xₖ)", sens: <>valoarea cunoscută în nodul k</> },
              { simbol: "Pₙ", sens: <>polinomul de interpolare, de grad cel mult n</> },
            ],
            explicatie: (
              <>
                Pe <Mate>n + 1</Mate> puncte distincte, polinomul de grad cel mult <Mate>n</Mate>{" "}
                care trece prin ele e <strong>unic</strong> — de aceea orice altă metodă de aici
                încolo îl regăsește pe același.
              </>
            ),
          },
        ],
      },

      {
        id: "neville",
        titlu: "Metoda Neville",
        esenta: (
          <>
            Același polinom, construit prin recurență: două polinoame vecine de grad mai mic se
            amestecă într-unul de grad cu o unitate mai mare.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "P_{ii}(x) = f(x_i), \\qquad P_{ij}(x) = \\frac{x - x_j}{x_i - x_j}\\,P_{i,j-1}(x) + \\frac{x_i - x}{x_i - x_j}\\,P_{i+1,j}(x)",
            sursa: "curs 9, §3",
            legenda: [
              { simbol: "Pᵢⱼ", sens: <>polinomul de grad j − i care trece prin punctele i … j</> },
              { simbol: "Pᵢᵢ", sens: <>polinom de grad 0: chiar valoarea din nodul i</> },
              { simbol: "x", sens: <>punctul în care se evaluează toată schema</> },
            ],
            explicatie: (
              <>
                Cele 2 ponderi se adună la 1, deci pasul e o interpolare liniară între 2 rezultate
                parțiale. Schema urcă de la gradul 0 până la <Mate>P₀ₙ</Mate>.
              </>
            ),
          },
        ],
      },

      {
        id: "runge",
        titlu: "Fenomenul Runge",
        esenta: (
          <>
            Mai multe noduri echidistante nu înseamnă o aproximare mai bună: polinomul începe să
            oscileze exact acolo unde ar trebui să se așeze.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "f(x) = \\frac{1}{1 + 25x^2}, \\qquad x \\in [-1, 1]",
            sursa: "curs 9, §8",
            legenda: [
              { simbol: "f", sens: <>funcția lui Runge: netedă, cu maximul 1 în origine</> },
              { simbol: "[−1, 1]", sens: <>intervalul pe care se așază nodurile echidistante</> },
            ],
            explicatie: (
              <>
                Cu 5 noduri echidistante oscilațiile rămân moderate. Cu 11, polinomul urcă la{" "}
                <Mate>1,96</Mate> lângă capătul din stânga, deși funcția nu trece de <Mate>1</Mate>.
              </>
            ),
          },
          {
            tip: "callout",
            titlu: "De ce nu se rezolvă cu mai multe puncte",
            continut: (
              <>
                Vinovat nu e numărul de puncte, ci faptul că <strong>un singur</strong> polinom
                trebuie să se potrivească pe tot intervalul deodată.
              </>
            ),
          },
        ],
      },

      {
        id: "spline",
        titlu: "Spline: polinoame pe porțiuni",
        esenta: (
          <>
            În loc de un polinom de grad mare pe tot intervalul, câte unul de grad mic pe fiecare
            subinterval, lipite în noduri.
          </>
        ),
        blocuri: [
          {
            tip: "text",
            continut: (
              <>
                Un spline e o funcție definită local, bucată cu bucată, pe subintervalele{" "}
                <Mate>[xᵢ, xᵢ₊₁)</Mate>. De obicei bucățile sunt polinoame de gradul 3, iar dacă
                nodurile sunt echidistante spline-ul se numește uniform.
              </>
            ),
          },
          {
            tip: "formula",
            subtitlu: "Bucăți liniare",
            latex:
              "a_i = \\frac{f(x_{i+1}) - f(x_i)}{x_{i+1} - x_i}, \\qquad b_i = \\frac{x_{i+1}f(x_i) - x_i f(x_{i+1})}{x_{i+1} - x_i}",
            sursa: "curs 9, §10",
            legenda: [
              {
                simbol: "pᵢ(x)",
                sens: (
                  <>
                    dreapta <Mate>aᵢ·x + bᵢ</Mate>, pe subintervalul <Mate>i</Mate>
                  </>
                ),
              },
              { simbol: "aᵢ", sens: <>panta ei, adică raportul dintre creșteri</> },
            ],
            explicatie: (
              <>
                Condițiile sunt interpolarea plus racordarea în nodurile interioare, deci curba
                n-are rupturi — dar are colțuri: panta sare de la o bucată la alta.
              </>
            ),
          },
          {
            tip: "formula",
            subtitlu: "Bucăți cubice, cu derivatele date",
            latex:
              "s_i(t) = y_i(1-t)^3 + (3y_i + h_i y'_i)\\,t(1-t)^2 + (3y_{i+1} - h_i y'_{i+1})\\,t^2(1-t) + y_{i+1}t^3",
            sursa: "curs 9, §11",
            legenda: [
              {
                simbol: "t",
                sens: (
                  <>
                    <Mate>(x − xᵢ)/hᵢ</Mate>, adică poziția în subinterval, de la 0 la 1
                  </>
                ),
              },
              {
                simbol: "hᵢ",
                sens: (
                  <>
                    lungimea subintervalului, <Mate>xᵢ₊₁ − xᵢ</Mate>
                  </>
                ),
              },
              { simbol: "y′ᵢ", sens: <>derivata cerută în nodul i</> },
            ],
            explicatie: (
              <>
                Cele 4 paranteze sunt baza Bernstein — aceleași polinoame care conduc curbele
                Bézier. Prețul e că trebuie cunoscute și derivatele în noduri, nu doar valorile.
              </>
            ),
          },
        ],
      },

      {
        id: "spline-cubic",
        titlu: "Spline cubic cu racordare de ordinul doi",
        esenta: (
          <>
            Bucățile se lipesc atât de bine încât și curbura trece continuu dintr-una în alta — fără
            să fie nevoie de derivatele funcției.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "s_i(x) = a_i + b_i(x - x_i) + c_i(x - x_i)^2 + d_i(x - x_i)^3",
            sursa: "curs 9, §12",
            legenda: [
              { simbol: "aᵢ, bᵢ, cᵢ, dᵢ", sens: <>cei 4 coeficienți ai bucății i</> },
              { simbol: "4n", sens: <>câți coeficienți sunt în total, pe n subintervale</> },
            ],
            explicatie: (
              <>
                Pe <Mate>n</Mate> subintervale sunt <Mate>4n</Mate> coeficienți de aflat, iar tot ce
                urmează sunt condițiile care îi fixează.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "s_i(x_i) = f(x_i), \\quad i = 0 : n-1, \\qquad s_{n-1}(x_n) = f(x_n)",
            sursa: "curs 9, §12, condițiile de interpolare de tip Lagrange",
            subtitlu: "Condițiile de interpolare",
            legenda: [
              { simbol: "sᵢ", sens: <>bucata de cubică de pe subintervalul i</> },
              { simbol: "f(xᵢ)", sens: <>valoarea cunoscută în nodul i</> },
            ],
            explicatie: (
              <>
                Fiecare bucată trece prin nodul ei, iar ultima și prin capătul din dreapta:{" "}
                <Mate>n + 1</Mate> condiții, din care iese direct <Mate>aᵢ = f(xᵢ)</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "s_i(x_{i+1}) = s_{i+1}(x_{i+1}), \\qquad s_i'(x_{i+1}) = s_{i+1}'(x_{i+1}), \\qquad s_i''(x_{i+1}) = s_{i+1}''(x_{i+1})",
            sursa: "curs 9, §12, cele 3n − 3 condiții de racordare",
            subtitlu: "Condițiile de racordare",
            legenda: [
              { simbol: "sᵢ(xᵢ₊₁)", sens: <>valoarea, în nodul dintre două bucăți vecine</> },
              { simbol: "sᵢ′", sens: <>panta, adică derivata întâi</> },
              { simbol: "sᵢ″", sens: <>curbura, adică derivata a doua</> },
            ],
            explicatie: (
              <>
                În fiecare nod interior se potrivesc valoarea, panta și curbura: <Mate>3n − 3</Mate>{" "}
                condiții. Cu cele de interpolare se ajunge la <Mate>4n − 2</Mate>, deci mai lipsesc
                2 — alese la capete: <strong>natural</strong> cere <Mate>s″ = 0</Mate>,{" "}
                <strong>tensionat</strong> cere <Mate>s′ = f′</Mate>.
              </>
            ),
          },
        ],
      },
    ],
  },
};

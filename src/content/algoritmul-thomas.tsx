import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 4 — algoritmul Thomas, pentru sisteme tridiagonale.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`, §9** — forma
 * ecuației și forma matriceală (§9), derivarea recurențelor și substituția
 * înapoi (§9.1, Algorithm 5), dominanța diagonală (§9.2). Nimic scris din
 * memorie.
 *
 * **O redenumire, cifrele neatinse** (regula din CLAUDE.md: se schimbă doar
 * numele): cursul scrie recurențele cu atribuire în loc (`b_i = b_i − µ·c_{i−1}`);
 * pe pagină apar cu săgeată (`bᵢ ← bᵢ − µ·cᵢ₋₁`), ca să se vadă că e o
 * suprascriere, nu o egalitate. Operațiile sunt aceleași.
 *
 * **Verificat numeric, separat de aplicație**, în
 * `scripts/verificare-algoritmi/algoritmul-thomas.ts`: recurențele rescrise
 * direct din curs dau aceiași vectori ca modulul, reziduul `A·x − d` iese 0, iar
 * soluția coincide cu cea dată de eliminarea gaussiană deasă pe aceeași matrice.
 */
export const continutAlgoritmulThomas: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Când matricea sistemului are elemente nenule doar pe trei diagonale, eliminarea gaussiană
        face aproape numai muncă degeaba: zerourile se scad din zerouri. Algoritmul Thomas e aceeași
        eliminare, redusă la ce se schimbă cu adevărat — de aici <Mate>O(n)</Mate> operații în loc
        de <Mate>O(n³)</Mate>. Astfel de sisteme apar în special la spline-urile cubice.
      </>
    ),

    metode: [
      {
        id: "sistem",
        titlu: "Sistemul tridiagonal",
        esenta: (
          <>
            Fiecare ecuație leagă doar trei necunoscute vecine, deci tot sistemul încape în patru
            vectori.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "a_i\\,x_{i-1} + b_i\\,x_i + c_i\\,x_{i+1} = d_i,\\qquad a_1 = 0,\\quad c_n = 0",
            sursa: "curs 4, §9",
            legenda: [
              { simbol: "aᵢ", sens: <>coeficientul de sub diagonală, pe linia i</> },
              { simbol: "bᵢ", sens: <>coeficientul de pe diagonala principală</> },
              { simbol: "cᵢ", sens: <>coeficientul de deasupra diagonalei</> },
              { simbol: "dᵢ", sens: <>termenul liber al ecuației i</> },
            ],
            explicatie: (
              <>
                Prima ecuație nu are vecin deasupra, iar ultima nu are dedesubt: de aceea{" "}
                <Mate>a₁</Mate> și <Mate>cₙ</Mate> sunt 0.
              </>
            ),
          },
        ],
      },
      {
        id: "eliminare-inainte",
        titlu: "Pasul 1 — eliminarea înainte",
        esenta: (
          <>
            Se face un singur pas de eliminare gaussiană pe fiecare linie, iar el atinge doar{" "}
            <Mate>bᵢ</Mate> și <Mate>dᵢ</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\mu = \\frac{a_i}{b_{i-1}},\\qquad b_i \\leftarrow b_i - \\mu\\,c_{i-1},\\qquad d_i \\leftarrow d_i - \\mu\\,d_{i-1}",
            sursa: "curs 4, §9.1",
            legenda: [
              { simbol: "µ", sens: <>cât din linia de deasupra se scade din linia i</> },
              {
                simbol: "bᵢ₋₁",
                sens: <>elementul de pe diagonală al liniei de deasupra, deja recalculat</>,
              },
              {
                simbol: "cᵢ₋₁",
                sens: <>singurul element al liniei de deasupra care intră în bᵢ</>,
              },
            ],
            explicatie: (
              <>
                Scăderea face <Mate>aᵢ</Mate> egal cu 0, iar <Mate>cᵢ</Mate> nu se atinge niciodată:
                linia de deasupra nu are nimic în coloana lui.
              </>
            ),
          },
        ],
      },
      {
        id: "substitutie-inapoi",
        titlu: "Pasul 2 — substituția înapoi",
        esenta: (
          <>Ce rămâne e un sistem bidiagonal: fiecare linie aduce o singură necunoscută nouă.</>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "x_n = \\frac{d_n}{b_n},\\qquad x_i = \\frac{d_i - c_i\\,x_{i+1}}{b_i},\\quad i = n-1 : -1 : 1",
            sursa: "curs 4, §9.1",
            legenda: [
              { simbol: "xₙ", sens: <>ultima necunoscută, singura care se află direct</> },
              { simbol: "xᵢ₊₁", sens: <>necunoscuta aflată la pasul dinainte</> },
            ],
            explicatie: (
              <>
                Ultima ecuație a rămas cu un singur termen, iar de acolo în sus fiecare{" "}
                <Mate>xᵢ</Mate> cere doar valoarea de sub el.
              </>
            ),
          },
        ],
      },
      {
        id: "dominanta-diagonala",
        titlu: "Când e sigur: dominanța diagonală",
        esenta: (
          <>
            Singura împărțire din algoritm e cea la <Mate>bᵢ₋₁</Mate>, deci acolo se decide dacă
            erorile se amplifică.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "|b_i| \\ge |a_i| + |c_i|",
            sursa: "curs 4, §9.2",
            legenda: [
              {
                simbol: "|bᵢ|",
                sens: <>elementul de pe diagonală, în modul</>,
              },
              { simbol: "|aᵢ| + |cᵢ|", sens: <>suma celorlalte elemente de pe linie, în modul</> },
            ],
            explicatie: (
              <>
                O matrice care satisface condiția pe toate liniile se numește diagonal dominantă. Un{" "}
                <Mate>bᵢ₋₁</Mate> foarte mic ar umfla pe <Mate>µ</Mate> și, odată cu el, eroarea.
              </>
            ),
          },
        ],
      },
    ],
  },
};

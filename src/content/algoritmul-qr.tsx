import { Link } from "react-router";

import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 10 — algoritmul QR.
 *
 * **Sursa: `cursuri_MN/qr_dvs_teorie_curs8.md`, §1–§5.** Nimic scris din
 * memorie. §6–§10 (DVS) sunt pagina 11 și nu apar aici.
 *
 * **Ce nu mai e pe pagină.** Secțiunile „Matricea de rotație" (§2) și
 * „Construcția lui Q și R" (§3) au fost scoase, ca teoria să rămână scurtă: în
 * locul lor a rămas un rând care trimite la pagina 2, unde stă oricum Givens,
 * adică mecanismul lor. La fel a plecat și §5, matricile nesimetrice.
 * Verificările numerice de mai jos rămân scrise pentru amândouă, ca reintrarea
 * lor să nu ceară recalcularea de la zero.
 *
 * **Verificat numeric, separat de aplicație**, pe matricea simetrică
 * tridiagonală `a = (4, 3, 2, 1)`, `b = (1; 0,5; 0,25)`, cu valorile proprii
 * `0,932366`, `1,764540`, `2,657942`, `4,645152`. Ce s-a confirmat, afirmație cu
 * afirmație:
 *
 * - rotația din §2 e ortogonală, `P·A` schimbă doar liniile `i`, `j`, iar `A·P`
 *   doar coloanele `i`, `j`;
 * - `P₂` construit cu `sinΘ₂`, `cosΘ₂` din §3 anulează elementul (2,1) exact, iar
 *   singura umplere e la (1,3) — la pasul general, la `(k−1, k+1)`;
 * - `R = Pₙ⋯P₂A` iese superior triunghiulară, `Q = P₂ᵀ⋯Pₙᵀ` ortogonală, `QR = A`;
 * - `A⁽ⁱ⁺¹⁾ = R⁽ⁱ⁾Q⁽ⁱ⁾ = Q⁽ⁱ⁾ᵀA⁽ⁱ⁾Q⁽ⁱ⁾` rămâne simetrică și tridiagonală,
 *   păstrează spectrul și tinde la diagonală;
 * - rata din §4 se măsoară: rapoartele `|b⁽ⁱ⁺¹⁾/b⁽ⁱ⁾|` ies `0,572197`,
 *   `0,663874`, `0,528390`, adică exact `|λⱼ₊₁/λⱼ|` (măsurat la iterația 25 —
 *   după ~30 de pași `bₙ` e la pragul de rotunjire al lui `float64` și raportul
 *   de acolo e zgomot);
 * - deplasarea cu `σ` luat din `E⁽ⁱ⁾` duce `|bₙ| < 10⁻¹²` în **3** pași, față de
 *   **41** fără deplasare;
 * - în cazul nesimetric, iterația păstrează forma Hessenberg și spectrul, iar
 *   perechile complex conjugate chiar apar.
 *
 * **O abatere declarată de la curs.** §4 spune „λ ≈ a + Σσᵢ", dar formula lui de
 * deasupra (`A⁽ⁱ⁺¹⁾ = R⁽ⁱ⁾Q⁽ⁱ⁾ + σI`) readaugă deplasarea la fiecare pas, deci
 * suma s-ar număra de două ori. Pe exemplul de mai sus: `aₙ = 0,932366034738`,
 * adică fix o valoare proprie, în timp ce `aₙ + Σσᵢ = 3,738081` nu e nimic.
 * Pagina spune ce decurge din formula scrisă; cazul e în `docs/erata-cursuri.md`.
 */
export const continutAlgoritmulQr: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Metodele puterii scot valorile proprii <strong>una câte una</strong>, iar eroarea acumulată
        crește repede — pentru tot spectrul nu se folosesc. Algoritmul QR face invers: lucrează pe
        matrice întreagă și le obține <strong>simultan</strong>, tot spectrul dintr-un singur șir de
        iterații. Prețul e o condiție de pornire: matricea trebuie să fie simetrică și tridiagonală,
        formă la care o aduce mai întâi metoda Householder.
      </>
    ),

    metode: [
      {
        id: "forma-tridiagonala",
        titlu: "Forma tridiagonală și observația de la care pornește totul",
        esenta: (
          <>
            Dacă un element de pe subdiagonală e zero, o valoare proprie se citește direct de pe
            diagonală — fără niciun calcul.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "A = \\begin{pmatrix} a_1 & b_2 & & & \\\\ b_2 & a_2 & b_3 & & \\\\ & b_3 & \\ddots & \\ddots & \\\\ & & \\ddots & a_{n-1} & b_n \\\\ & & & b_n & a_n \\end{pmatrix}",
            sursa: "curs 8, §1",
            legenda: [
              { simbol: "a₁…aₙ", sens: <>diagonala principală</> },
              {
                simbol: "b₂…bₙ",
                sens: <>subdiagonala — și supradiagonala, matricea fiind simetrică</>,
              },
              { simbol: "n", sens: <>dimensiunea matricei</> },
            ],
            explicatie: (
              <>
                Forma cerută la intrare. O matrice simetrică oarecare ajunge aici prin metoda
                Householder, printr-o transformare de asemănare.
              </>
            ),
          },
        ],
      },

      {
        id: "iteratia-qr",
        titlu: "Iterația QR",
        esenta: (
          <>
            Se factorizează matricea în <Mate>Q·R</Mate>, se înmulțesc factorii în ordinea inversă,
            și se repetă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "A^{(i)} = Q^{(i)} R^{(i)}, \\qquad A^{(i+1)} = R^{(i)} Q^{(i)}",
            sursa: "curs 8, §1",
            legenda: [
              { simbol: "A⁽ⁱ⁾", sens: <>matricea la iterația i; se pornește de la A⁽¹⁾ = A</> },
              { simbol: "Q⁽ⁱ⁾", sens: <>matrice ortogonală</> },
              { simbol: "R⁽ⁱ⁾", sens: <>matrice superior triunghiulară</> },
            ],
            explicatie: (
              <>
                Toată iterația e în inversarea ordinii: se descompune <Mate>A⁽ⁱ⁾ = Q⁽ⁱ⁾·R⁽ⁱ⁾</Mate>,
                iar matricea următoare e produsul acelorași doi factori, luați invers.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "A^{(i+1)} = R^{(i)} Q^{(i)} = Q^{(i)T} A^{(i)} Q^{(i)}",
            sursa: "curs 8, §1",
            legenda: [{ simbol: "Q⁽ⁱ⁾ᵀ", sens: <>transpusa lui Q⁽ⁱ⁾, egală cu inversa ei</> }],
            explicatie: (
              <>
                Pasul e o <strong>asemănare ortogonală</strong>, iar de aici trei garanții deodată:{" "}
                <Mate>A⁽ⁱ⁺¹⁾</Mate> rămâne simetrică, rămâne tridiagonală și păstrează exact
                valorile proprii ale lui <Mate>A</Mate>.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Factorizarea <Mate>A⁽ⁱ⁾ = Q⁽ⁱ⁾·R⁽ⁱ⁾</Mate> se face din rotații plane, câte una
                pentru fiecare element de pe subdiagonală: mecanismul din spate e cel de la{" "}
                <Link
                  className="text-accent-slab underline underline-offset-4"
                  to="/algoritm/norme-si-ortogonalitate"
                >
                  Givens
                </Link>
                .
              </>
            ),
          },
        ],
      },

      {
        id: "deplasare",
        titlu: "QR cu deplasare",
        esenta: (
          <>
            Viteza nu depinde de matrice, ci de cât de apropiate ca modul sunt două valori proprii
            vecine — iar o deplasare bine aleasă schimbă tocmai raportul ăsta.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "\\left| \\frac{\\lambda_{j+1}}{\\lambda_{j}} \\right|",
            sursa: "curs 8, §4",
            legenda: [
              { simbol: "λⱼ", sens: <>valorile proprii, ordonate descrescător în modul</> },
              { simbol: "bⱼ₊₁", sens: <>elementul de pe subdiagonală care trebuie să ajungă 0</> },
            ],
            explicatie: (
              <>
                Dacă două valori proprii vecine au module apropiate, raportul e aproape de{" "}
                <Mate>1</Mate> și metoda înaintează foarte încet.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "A^{(i)} - \\sigma I = Q^{(i)} R^{(i)}, \\qquad A^{(i+1)} = R^{(i)} Q^{(i)} + \\sigma I",
            sursa: "curs 8, §4",
            legenda: [
              { simbol: "σ", sens: <>deplasarea: o constantă apropiată de o valoare proprie</> },
              { simbol: "I", sens: <>matricea identitate</> },
            ],
            explicatie: (
              <>
                <Mate>σ</Mate> se scade de pe diagonală înainte de factorizare și se adaugă înapoi
                după înmulțire, deci nu rămâne datorie de plătit la final.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "\\left| \\frac{\\lambda_{j+1} - \\sigma}{\\lambda_{j} - \\sigma} \\right|",
            sursa: "curs 8, §4",
            explicatie: (
              <>
                Raportul care dictează convergența, după deplasare. Acum e de ales: <Mate>σ</Mate>{" "}
                aproape de <Mate>λⱼ₊₁</Mate> face numărătorul mic, iar depărtarea de <Mate>λⱼ</Mate>{" "}
                ține numitorul mare — adică exact ce trebuia pentru ca <Mate>aⱼ</Mate> să ajungă
                repede la <Mate>λⱼ</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "E^{(i)} = \\begin{pmatrix} a_{n-1}^{(i)} & b_n^{(i)} \\\\ b_n^{(i)} & a_n^{(i)} \\end{pmatrix}",
            sursa: "curs 8, §4",
            legenda: [
              { simbol: "E⁽ⁱ⁾", sens: <>colțul de jos-dreapta, 2×2, al matricei curente</> },
              { simbol: "σᵢ", sens: <>valoarea proprie a lui E⁽ⁱ⁾ cea mai apropiată de aₙ⁽ⁱ⁾</> },
            ],
            explicatie: (
              <>
                <Mate>σᵢ</Mate> e valoarea proprie a acestei matrice de ordinul doi cea mai
                apropiată de <Mate>aₙ⁽ⁱ⁾</Mate>. Alegerea o grăbește pe <Mate>bₙ</Mate>: când ajunge
                la zero, se taie ultima linie și coloană și se reia pe restul.
              </>
            ),
          },
        ],
      },
    ],
  },
};

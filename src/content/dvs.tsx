import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 11 — descompunerea valorilor singulare (DVS/SVD).
 *
 * **Sursă: `cursuri_MN/qr_dvs_teorie_curs8.md`, §6–§9** (definiția `A = U S Vᵀ`,
 * rangul și nucleul, construcția lui `S`, a lui `V` și a lui `U`). Partea de QR
 * (§1–§5) din același curs ține de pagina 10. Nimic scris din memorie.
 *
 * **Ce nu mai e pe pagină.** Secțiunile despre Gram-Schmidt și despre relația
 * dintre valorile singulare și valorile proprii au fost scoase, ca teoria să
 * rămână scurtă. Odată cu ele a plecat și singurul loc unde pagina atingea
 * greșeala din curs („valorile singulare sunt chiar valorile proprii", falsă
 * când o valoare proprie e negativă); cazul rămâne scris în
 * `docs/erata-cursuri.md`, ca să nu se piardă dacă se rescrie secțiunea.
 *
 * **O redenumire, cifrele neatinse** (regula din CLAUDE.md: se schimbă doar
 * numele):
 *
 * - Cursul scrie ordonarea valorilor proprii ca `s₁² ≥ … ≥ s_k² > s_{k+1} = … = sₙ = 0`,
 *   scăpând pătratul pe coada șirului; pe pagină apare cu pătrat peste tot, fiind
 *   vorba de valorile proprii ale lui `AᵀA`, nu de valorile singulare.
 *
 * **Verificat numeric, separat de aplicație**, pe `A = [[3,1],[1,3],[1,1]]`
 * (3×2): valorile proprii ale lui `AᵀA` ies `18` și `4`, deci `s₁ = √18`,
 * `s₂ = 2`; coloanele `uᵢ = (1/sᵢ)·A·vᵢ` ies ortonormate (`U₁ᵀU₁ = I₂`), a treia
 * coloană completată prin Gram-Schmidt dă `UᵀU = I₃`, iar `‖A − U S Vᵀ‖ ≈ 1·10⁻¹⁵`.
 * `AAᵀ` are valorile proprii `18`, `4` și `0` — aceleași valori nenule ca `AᵀA`,
 * cum cere §6.
 */
export const continutDvs: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Până aici, valorile proprii au cerut matrice pătratice. DVS ridică cerința: <em>orice</em>{" "}
        matrice, chiar dreptunghiulară, se scrie ca produsul dintre o matrice ortogonală, una
        diagonală cu numere nenegative și încă una ortogonală.
      </>
    ),

    metode: [
      {
        id: "definitie",
        titlu: "Factorizarea",
        esenta: (
          <>
            Cele trei matrice au dimensiuni diferite și roluri diferite: două rotesc, cea din mijloc
            întinde.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\underset{(m\\times n)}{A} \\;=\\; \\underset{(m\\times m)}{U}\\;\\underset{(m\\times n)}{S}\\;\\underset{(n\\times n)}{V^{T}}",
            sursa: "curs 8, §6",
            legenda: [
              { simbol: "A", sens: <>matricea de descompus, cu m linii și n coloane</> },
              { simbol: "U", sens: <>matrice ortogonală m×m</> },
              {
                simbol: "S",
                sens: <>matrice m×n cu elemente nenule doar pe prima diagonală</>,
              },
              { simbol: "V", sens: <>matrice ortogonală n×n; în factorizare apare transpusă</> },
            ],
            explicatie: (
              <>
                Singura matrice care nu e pătratică e cea din mijloc: <Mate>S</Mate> preia toată
                diferența de formă dintre m și n, iar <Mate>U</Mate> și <Mate>V</Mate> rămân
                pătratice și ortogonale. Cazul obișnuit e <Mate>m &gt; n</Mate>, adesea{" "}
                <Mate>m ≫ n</Mate> — mai multe măsurători decât necunoscute. Elementele lui{" "}
                <Mate>S</Mate> sunt nenegative: <Mate>Sᵢᵢ ≥ 0</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "rang-nucleu",
        titlu: "Rangul, nucleul și matricea AᵀA",
        esenta: (
          <>
            Descompunerea nu pornește de la <Mate>A</Mate>, ci de la produsele ei pătratice{" "}
            <Mate>Aᵀ·A</Mate> și <Mate>A·Aᵀ</Mate>, care sunt simetrice și păstrează informația care
            contează.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\operatorname{Rank}(A) \\;=\\; \\text{nr. de linii liniar independente},\\qquad \\operatorname{Null}(A) \\;=\\; \\{\\,v \\in \\mathbb{R}^{n} \\;:\\; A\\,v = 0\\,\\}",
            sursa: "curs 8, §6",
            legenda: [
              { simbol: "Rank(A)", sens: <>câte linii ale lui A sunt liniar independente</> },
              {
                simbol: "Null(A)",
                sens: (
                  <>
                    cel mai mare set de vectori liniar independenți duși în 0 de <Mate>A</Mate>
                  </>
                ),
              },
            ],
            explicatie: (
              <>
                Numărul de linii liniar independente e egal cu numărul de coloane liniar
                independente, deci rangul se poate citi de pe oricare dintre ele. Pentru o matrice
                pătratică <Mate>n×n</Mate>, inversabilitatea înseamnă exact <Mate>Null(A) = 0</Mate>{" "}
                și <Mate>Rank(A) = n</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\operatorname{Null}(A) = \\operatorname{Null}(A^{T}A),\\qquad \\operatorname{Rank}(A) = \\operatorname{Rank}(A^{T}A)",
            sursa: "curs 8, §6",
            legenda: [
              { simbol: "AᵀA", sens: <>matrice pătratică n×n, simetrică</> },
              { simbol: "AAᵀ", sens: <>matrice pătratică m×m, tot simetrică</> },
            ],
            explicatie: (
              <>
                Trecerea de la <Mate>A</Mate> la <Mate>Aᵀ·A</Mate> nu pierde nici rangul, nici
                nucleul — de aceea se poate lucra cu matricea pătratică fără să se schimbe problema.
                În plus, valorile proprii ale lui <Mate>Aᵀ·A</Mate> și <Mate>A·Aᵀ</Mate> sunt reale
                și nenegative, iar cele diferite de 0 sunt aceleași pentru amândouă.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-s",
        titlu: "Matricea S — valorile singulare",
        esenta: (
          <>
            Valorile singulare sunt rădăcinile pozitive ale valorilor proprii ale lui{" "}
            <Mate>Aᵀ·A</Mate>, așezate descrescător pe diagonală.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "s_1^{2} \\ge s_2^{2} \\ge \\dots \\ge s_k^{2} > s_{k+1}^{2} = \\dots = s_n^{2} = 0",
            sursa: "curs 8, §7",
            legenda: [
              { simbol: "sᵢ²", sens: <>valorile proprii ale matricei simetrice n×n AᵀA</> },
              {
                simbol: "sᵢ",
                sens: <>valoarea singulară i a lui A: rădăcina pozitivă a lui sᵢ²</>,
              },
              { simbol: "k", sens: <>câte valori proprii sunt strict pozitive</> },
            ],
            explicatie: (
              <>
                Valorile proprii ale lui <Mate>Aᵀ·A</Mate> fiind nenegative, rădăcina se poate lua
                fără grijă, iar ordonarea descrescătoare fixează care valoare singulară e prima.
                Ultimele <Mate>n − k</Mate> sunt nule; <Mate>k</Mate> e numărul de direcții pe care{" "}
                <Mate>A</Mate> chiar le întinde.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "S = \\begin{pmatrix} s_1 & 0 & \\cdots & 0 \\\\ 0 & s_2 & \\cdots & 0 \\\\ \\vdots & & \\ddots & \\vdots \\\\ 0 & \\cdots & & s_n \\\\ 0 & \\cdots & \\cdots & 0 \\\\ \\vdots & & & \\vdots \\\\ 0 & \\cdots & \\cdots & 0 \\end{pmatrix}",
            sursa: "curs 8, §7",
            legenda: [
              {
                simbol: "primele n linii",
                sens: <>valorile singulare, în ordine descrescătoare</>,
              },
              { simbol: "ultimele m − n linii", sens: <>zerouri, ca S să aibă forma lui A</> },
            ],
            explicatie: (
              <>
                <Mate>S</Mate> are exact forma lui <Mate>A</Mate>: <Mate>m×n</Mate>. Valorile
                singulare umplu diagonala de sus, iar restul liniilor sunt zero — ele sunt cele care
                fac trecerea de la <Mate>n</Mate> la <Mate>m</Mate> fără să adauge nimic.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-v",
        titlu: "Matricea V — vectorii proprii ai lui AᵀA",
        esenta: (
          <>
            Fiind simetrică, <Mate>Aᵀ·A</Mate> se diagonalizează cu o matrice ortogonală, iar aceea
            e chiar <Mate>V</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "A^{T}A = V\\,D\\,V^{T},\\qquad D = S^{2}",
            sursa: "curs 8, §8",
            legenda: [
              { simbol: "V", sens: <>coloanele sunt vectorii proprii ai lui AᵀA, de normă 1</> },
              { simbol: "D", sens: <>matricea diagonală n×n cu valorile proprii ale lui AᵀA</> },
              { simbol: "D = S²", sens: <>pe diagonala lui D stau chiar pătratele sᵢ²</> },
            ],
            explicatie: (
              <>
                Orice matrice simetrică <Mate>M</Mate> se scrie <Mate>M = V·D·Vᵀ</Mate>, cu{" "}
                <Mate>D</Mate> diagonală și <Mate>V</Mate> ortogonală, având drept coloane vectorii
                proprii de normă euclidiană 1.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-u",
        titlu: "Matricea U — imaginile direcțiilor lui V",
        esenta: (
          <>
            Primele <Mate>k</Mate> coloane ale lui <Mate>U</Mate> se obțin trecând coloanele lui{" "}
            <Mate>V</Mate> prin <Mate>A</Mate> și împărțind la valoarea singulară.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "u_i = \\frac{1}{s_i}\\,A\\,v_i,\\qquad i = 1,\\dots,k",
            sursa: "curs 8, §9",
            legenda: [
              {
                simbol: "vᵢ",
                sens: <>coloana i din V, corespunzătoare valorii singulare nenule sᵢ</>,
              },
              { simbol: "sᵢ", sens: <>valoare singulară nenulă: s₁ ≥ s₂ ≥ … ≥ s_k &gt; 0</> },
              { simbol: "uᵢ", sens: <>coloana i din U</> },
            ],
          },
        ],
      },
    ],
  },
};

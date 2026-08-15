import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 2 — reflexii Householder și rotații Givens.
 *
 * **Sursă: `cursuri_MN/curs3_ortogonalitate.md`, §5 (transformări ortogonale și
 * QR), §6 (Householder) și §7 (Givens).** Nimic scris din memorie. §1 (norme),
 * §4 (Gram-Schmidt) și §8 (polinoame ortogonale) nu sunt încă pe pagină.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/ortogonalitate.ts`, pe modulele reale):
 *
 * - reflectorul e simetric, ortogonal, cu `det = −1`, iar `H·v` cade pe axă;
 * - exemplul din §6.5 iese element cu element: `d = (5,1,2)`, `H₁`, `A₂`, `A₃`;
 * - rotația e ortogonală și diferă de identitate în cel mult patru elemente;
 * - `Q·R = A` și `QᵀQ = I` la ambele, pe exemplele din curs și pe 200 de
 *   matrice generate aleator (abatere maximă `2·10⁻¹⁵`);
 * - semnul lui `d`: pe `v = (1, 10⁻¹⁰, 0)`, alegerea din curs ține `‖d‖ = 2`,
 *   iar semnul opus o prăbușește la `10⁻¹⁰` — chiar anularea catastrofală.
 *
 * **O abatere declarată de la curs**, în `docs/erata-cursuri.md`: exemplul
 * numeric din §7.4 e greșit de la a doua rotație (`A₃(2,3) = −3`, nu `0`).
 * Formulele și concluzia rămân neatinse; doar aritmetica exemplului diferă.
 */
export const continutNormeSiOrtogonalitate: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Un sistem cu matrice triunghiulară se rezolvă prin substituție, fără efort. Întrebarea e cum
        ajungi la una fără să strici problema pe drum: eliminarea gaussiană o face, dar amplifică
        erorile. Transformările ortogonale nu au defectul ăsta —{" "}
        <strong>păstrează lungimile</strong>, deci nici nu umflă, nici nu sting ce era acolo. Sunt
        două feluri de a construi una: <strong>o oglindă</strong> și <strong>o rotație</strong>.
      </>
    ),

    metode: [
      {
        id: "ortogonale",
        titlu: "De ce ortogonale",
        esenta: (
          <>
            O matrice ortogonală nu schimbă norma niciunui vector. De aceea se poate înmulți cu ea
            de oricâte ori, fără ca erorile să crească.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "Q^{T}Q = I \\quad\\Longleftrightarrow\\quad \\lVert Q\\,x \\rVert_2 = \\lVert x \\rVert_2",
            sursa: "curs 3, §3, §5",
            legenda: [
              { simbol: "Q", sens: <>matrice ortogonală: coloanele ei sunt ortonormate</> },
              { simbol: "‖·‖₂", sens: <>norma euclidiană, lungimea obișnuită</> },
            ],
            explicatie: (
              <>
                Cele două condiții sunt același lucru scris altfel. Consecința practică e că{" "}
                <Mate>Qᵀ = Q⁻¹</Mate>: inversa nu se calculează, se transpune.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "A = Q\\,R",
            sursa: "curs 3, §5",
            legenda: [
              { simbol: "R", sens: <>superior triunghiulară</> },
              { simbol: "Q", sens: <>ortogonală, produsul transformărilor aplicate</> },
            ],
            explicatie: (
              <>
                Scopul amândurora e același: să înmulțească matricea cu transformări ortogonale până
                când sub diagonală rămân zerouri. Ce se adună pe drum, luat invers, e chiar{" "}
                <Mate>Q</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "householder",
        titlu: "Householder — oglinda",
        esenta: (
          <>
            O reflexie față de un plan care trece prin origine. Aleasă bine, ea duce o coloană
            întreagă exact pe axă — deci îi face zerouri dintr-o singură înmulțire.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "P = I - \\frac{2\\,d\\,d^{T}}{d^{T}d}",
            sursa: "curs 3, §6, §6.1",
            legenda: [
              { simbol: "d", sens: <>direcția de reflexie: normala oglinzii, nu oglinda însăși</> },
              { simbol: "ddᵀ", sens: <>matrice, nu număr: coloană ori linie</> },
              { simbol: "dᵀd", sens: <>număr: pătratul lungimii lui d</> },
            ],
            explicatie: (
              <>
                Se citește direct ca reflexie: din <Mate>v</Mate> se scade de{" "}
                <strong>două ori</strong> proiecția lui pe <Mate>d</Mate>. O dată ar duce vectorul{" "}
                <em>în</em> oglindă; de două ori îl trece dincolo. Dacă <Mate>d</Mate> are norma 1,
                împărțirea dispare și rămâne <Mate>P = I − 2ddᵀ</Mate>.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Trei proprietăți care ies din formulă</strong>, nu din memorie:{" "}
                <Mate>P</Mate> e <strong>simetrică</strong>, e <strong>ortogonală</strong> și are{" "}
                <Mate>det(P) = −1</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "d = v + \\operatorname{sign}(v_1)\\,\\lVert v \\rVert_2\\,e_1",
            sursa: "curs 3, §6.2",
            legenda: [
              { simbol: "v", sens: <>coloana care trebuie dusă pe axă</> },
              { simbol: "e₁", sens: <>primul vector din baza canonică: (1, 0, …, 0)</> },
              { simbol: "sign(v₁)", sens: <>semnul primei componente a lui v</> },
            ],
            explicatie: (
              <>
                Norma se păstrează, deci imaginea nu poate cădea decât în <Mate>±‖v‖·e₁</Mate> —
                două ținte, deci două oglinzi posibile. Semnul din formulă o alege pe cea care duce
                vectorul <strong>în partea opusă</strong>.
              </>
            ),
          },
        ],
      },
      {
        id: "givens",
        titlu: "Givens — rotația",
        esenta: (
          <>
            O rotație în planul a două linii, cu unghiul ales cât să ducă un singur element la zero.
            Restul matricei nici nu observă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "G = \\begin{pmatrix} \\ddots & & & \\\\ & \\cos\\theta & \\cdots & -\\sin\\theta \\\\ & \\vdots & \\ddots & \\vdots \\\\ & \\sin\\theta & \\cdots & \\cos\\theta \\\\ & & & \\ddots \\end{pmatrix}",
            sursa: "curs 3, §7, §7.3",
            legenda: [
              { simbol: "θ", sens: <>unghiul rotației</> },
              { simbol: "i, j", sens: <>cele două linii pe care le atinge</> },
              { simbol: "restul", sens: <>identic cu matricea identitate</> },
            ],
            explicatie: (
              <>
                Matricea diferă de identitate în <strong>cel mult patru elemente</strong>. De aceea{" "}
                <Mate>G·A</Mate> schimbă doar liniile <Mate>i</Mate> și <Mate>j</Mate>, iar{" "}
                <Mate>A·G</Mate> doar coloanele corespunzătoare.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\cos\\theta = \\frac{x}{\\sqrt{x^2 + y^2}}, \\qquad \\sin\\theta = \\frac{-y}{\\sqrt{x^2 + y^2}}",
            sursa: "curs 3, §7.2",
            legenda: [
              { simbol: "x", sens: <>elementul de pe diagonală</> },
              { simbol: "y", sens: <>elementul care trebuie să devină zero</> },
              { simbol: "r = √(x² + y²)", sens: <>ce rămâne pe diagonală după rotație</> },
            ],
            explicatie: (
              <>
                <strong>Unghiul nu se calculează niciodată.</strong> Din condiția ca elementul de
                sub diagonală să se anuleze ies direct <Mate>cos θ</Mate> și <Mate>sin θ</Mate>, iar
                ele sunt tot ce trebuie ca să scrii matricea. Nu apare niciun arctangent, doar un
                radical.
              </>
            ),
          },
        ],
      },
      {
        id: "comparatie",
        titlu: "Care dintre ele, și când",
        esenta: (
          <>
            Aceeași țintă, două socoteli diferite: una ieftină pe matrice pline, cealaltă
            paralelizabilă și blândă cu zerourile.
          </>
        ),
        blocuri: [
          {
            tip: "callout",
            titlu: "Regula practică",
            continut: (
              <>
                <strong>Householder pentru matrice pline, Givens pentru matrice rare.</strong>{" "}
                Restul — ortogonalitatea, păstrarea normei, stabilitatea numerică — e comun; nu de
                acolo se alege.
              </>
            ),
          },
        ],
      },
    ],
  },
};

import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 1 — factorizarea LU.
 *
 * **Surse: `cursuri_MN/MN_curs2_lab2_matrici.md` §3.2, §4, §5, §6 și
 * `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md` §2, §6, §8.** Nimic
 * scris din memorie.
 *
 * Două lucruri de știut pentru cine editează:
 *
 * - **Costul lui Cramer apare în ambele cursuri, cu două cifre diferite**, și
 *   amândouă sunt corecte fiindcă numără altceva: curs4 §2 dă numărul total de
 *   înmulțiri și împărțiri pentru toți cei `n + 1` determinanți,
 *   `N = (n−1)(n+1)!` (la `n = 10` ≈ 3,6·10⁸), iar curs2 §4 numără un singur
 *   determinant prin dezvoltare Laplace, `n!`, de unde clasa `O(n!)`. Pagina le
 *   scrie pe amândouă, fiecare cu ce numără.
 * - **`u_i1 = a_i1` din curs2 §5.3 e o scăpare de indici**: la Doolittle prima
 *   linie a lui `U` copiază prima linie a lui `A`, adică `u_1i = a_1i`, exact cum
 *   scrie același curs la §6.2. Pe pagină apare forma corectă. Verificat numeric
 *   pe `A = [[1,2,3],[2,8,11],[3,22,42]]`: Doolittle dă `L = [[1,0,0],[2,1,0],
 *   [3,4,1]]` și `U = [[1,2,3],[0,4,5],[0,0,13]]`, cu `L·U = A` exact, iar
 *   `Ly = b` pentru `b = (6,21,67)` dă `y = (6,9,13)` și `Ux = y` dă `x = (1,1,1)`.
 *   Aceleași cifre sunt și cele desenate în clipul paginii. Cazul e scris în
 *   `docs/erata-cursuri.md`.
 */
export const continutFactorizariLu: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Un sistem <Mate>A·x = b</Mate> se poate rezolva cu determinanți — și nu se face niciodată
        așa: costul crește ca <Mate>n!</Mate>. Metodele directe merg pe alt drum: descompun{" "}
        <Mate>A</Mate> în două matrice triunghiulare, <Mate>A = L·U</Mate>, iar sistemul se sparge
        în două sisteme care se rezolvă prin simplă substituție, fiecare în <Mate>O(n²)</Mate>.
      </>
    ),

    metode: [
      {
        id: "cramer",
        titlu: "Regula lui Cramer și costul ei",
        esenta: (
          <>
            Fiecare necunoscută e un raport de doi determinanți — corect matematic, imposibil
            numeric.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "x_j = \\frac{\\det\\left(A^{j}\\right)}{\\det (A)},\\qquad j = 1,\\dots,n",
            sursa: "curs 4, §2",
            legenda: [
              { simbol: "Aʲ", sens: <>matricea A cu coloana j înlocuită de vectorul b</> },
              { simbol: "det(A)", sens: <>determinantul matricei sistemului, nenul</> },
              { simbol: "n", sens: <>numărul de ecuații și de necunoscute</> },
            ],
            explicatie: (
              <>
                Pentru <Mate>n</Mate> necunoscute se cer <Mate>n + 1</Mate> determinanți: unul al
                lui <Mate>A</Mate> și câte unul pentru fiecare coloană înlocuită.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\det (A) = \\sum_{k} (-1)^{i+k}\\, a_{ik}\\, \\det\\!\\left(A_{ik}\\right) = \\sum_{k} (-1)^{k+j}\\, a_{kj}\\, \\det\\!\\left(A_{kj}\\right)",
            sursa: "curs 2, §3.2",
            legenda: [
              {
                simbol: "Aᵢₖ",
                sens: <>matricea (n−1)×(n−1) rămasă după ștergerea liniei i și a coloanei k</>,
              },
              { simbol: "i", sens: <>linia după care se face dezvoltarea</> },
              { simbol: "j", sens: <>coloana după care se face dezvoltarea</> },
            ],
            explicatie: (
              <>
                Dezvoltarea Laplace: un determinant de ordin <Mate>n</Mate> cere <Mate>n</Mate>{" "}
                determinanți de ordin <Mate>n − 1</Mate>, iar fiecare se sparge la fel.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "n \\cdot (n-1) \\cdot \\ldots \\cdot 1 = n! \\;\\Rightarrow\\; O(n!), \\qquad N = (n-1)(n+1)!",
            sursa: "curs 2, §4; curs 4, §2",
            legenda: [
              { simbol: "n!", sens: <>operațiile cerute de un singur determinant de ordin n</> },
              {
                simbol: "N",
                sens: <>înmulțirile și împărțirile cerute de toți cei n + 1 determinanți</>,
              },
            ],
            explicatie: (
              <>
                La <Mate>n = 10</Mate>, <Mate>N = 360.000.000</Mate> de operații. Metodele de mai
                departe sunt de ordinul <Mate>O(n³)</Mate>: la <Mate>n = 20</Mate>, 8.000 de
                operații față de <Mate>2,4·10¹⁸</Mate> cerute de un singur determinant.
              </>
            ),
          },
        ],
      },
      {
        id: "factorizarea",
        titlu: "Factorizarea A = L·U",
        esenta: (
          <>
            Eliminarea gaussiană aduce <Mate>A</Mate> la o formă superior triunghiulară; matricele
            cu care s-a ajuns acolo, inversate, dau chiar <Mate>L</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "T_n T_{n-1} \\cdots T_1 A = U \\;\\Longrightarrow\\; A = \\underbrace{T_1^{-1} T_2^{-1} \\cdots T_n^{-1}}_{L}\\, U",
            sursa: "curs 4, §6",
            legenda: [
              {
                simbol: "Tₚ",
                sens: <>transformarea care face zerouri sub pivotul de pe coloana p</>,
              },
              { simbol: "L", sens: <>matrice inferior triunghiulară</> },
              { simbol: "U", sens: <>matrice superior triunghiulară</> },
            ],
            explicatie: (
              <>
                Factorizarea nu e altceva decât eliminarea gaussiană, cu pașii ei ținuți minte:{" "}
                <Mate>U</Mate> e rezultatul, <Mate>L</Mate> e drumul.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "A = LU \\iff A[\\{1,\\dots,j\\}] \\text{ nesingulară},\\quad j = 1,\\dots,n",
            sursa: "curs 2, §5.1",
            legenda: [
              {
                simbol: "A[{1,…,j}]",
                sens: <>submatricea principală de ordin j, din primele j linii și j coloane</>,
              },
            ],
            explicatie: (
              <>
                Oricare dintre factorii <Mate>L</Mate> sau <Mate>U</Mate> poate fi ales cu diagonala
                plină de 1. Pentru <em>orice</em> matrice există o permutare care face factorizarea
                posibilă: <Mate>A = P·L·U</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "n^{2}\\ \\text{ecuații},\\qquad n^{2} + n\\ \\text{necunoscute} \\;\\Longrightarrow\\; \\text{o diagonală se fixează}",
            sursa: "curs 2, §5",
            legenda: [
              { simbol: "n²", sens: <>câte elemente are A, deci câte ecuații dă A = L·U</> },
              { simbol: "n² + n", sens: <>câte elemente au împreună L și U</> },
            ],
            explicatie: (
              <>
                Cele <Mate>n</Mate> necunoscute în plus se elimină fixând o diagonală — de aici cele
                trei metode de mai jos: <Mate>lᵢᵢ = 1</Mate> (Doolittle), <Mate>uᵢᵢ = 1</Mate>{" "}
                (Crout) sau <Mate>U = Lᵀ</Mate> (Cholesky).
              </>
            ),
          },
        ],
      },
      {
        id: "doi-pasi",
        titlu: "Cei doi pași: Ly = b, apoi Ux = y",
        esenta: (
          <>
            Cu <Mate>A = L·U</Mate>, notând <Mate>y = U·x</Mate>, sistemul greu devine două sisteme
            triunghiulare.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "A x = b,\\ A = LU,\\ y = Ux \\;\\Longrightarrow\\; \\begin{cases} L y = b \\\\ U x = y \\end{cases}",
            sursa: "curs 4, §6; curs 2, §5",
            legenda: [
              { simbol: "y", sens: <>vectorul intermediar, aflat din primul sistem</> },
              { simbol: "Ly = b", sens: <>sistem inferior triunghiular, rezolvat de sus în jos</> },
              { simbol: "Ux = y", sens: <>sistem superior triunghiular, rezolvat de jos în sus</> },
            ],
          },
          {
            tip: "formula",
            latex:
              "x_i = \\frac{b_i - \\sum_{j=1}^{i-1} A_{ij}\\, x_j}{A_{ii}},\\quad i = 1,\\dots,n \\qquad\\text{(înainte)}",
            sursa: "curs 4, §8.2",
            legenda: [
              {
                simbol: "Aᵢⱼ",
                sens: <>elementul de pe linia i, coloana j al matricei triunghiulare</>,
              },
              { simbol: "Aᵢᵢ", sens: <>elementul de pe diagonală, nenul</> },
            ],
            explicatie: (
              <>
                Substituția înainte, pentru sistemul inferior triunghiular: prima ecuație dă{" "}
                <Mate>x₁</Mate>, a doua îl folosește ca să dea <Mate>x₂</Mate> și tot așa.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "x_i = \\frac{b_i - \\sum_{j=i+1}^{n} A_{ij}\\, x_j}{A_{ii}},\\quad i = n,\\dots,1 \\qquad\\text{(înapoi)}",
            sursa: "curs 4, §8.1",
            legenda: [
              { simbol: "i = n, …, 1", sens: <>se merge de la ultima ecuație către prima</> },
            ],
            explicatie: (
              <>
                Pentru <Mate>i = n</Mate> suma e goală, deci <Mate>xₙ = bₙ / Aₙₙ</Mate>. Fiecare
                substituție costă <Mate>n²</Mate> operații, adică <Mate>O(n²)</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "doolittle",
        titlu: "Doolittle — 1 pe diagonala lui L",
        esenta: (
          <>
            Se fixează <Mate>lᵢᵢ = 1</Mate>, iar prima linie a lui <Mate>U</Mate> e chiar prima
            linie a lui <Mate>A</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "u_{1i} = a_{1i},\\qquad l_{i1} = \\frac{a_{i1}}{u_{11}},\\qquad l_{ii} = 1",
            sursa: "curs 4, §6.2",
            legenda: [
              { simbol: "u₁ᵢ", sens: <>prima linie a lui U, copiată din A</> },
              { simbol: "lᵢ₁", sens: <>prima coloană a lui L</> },
            ],
          },
          {
            tip: "formula",
            latex:
              "u_{ij} = a_{ij} - \\sum_{k=1}^{i-1} l_{ik} u_{kj},\\qquad l_{ij} = \\frac{1}{u_{jj}}\\left( a_{ij} - \\sum_{k=1}^{j-1} l_{ik} u_{kj} \\right),\\ i > j",
            sursa: "curs 4, §6.2",
            legenda: [
              { simbol: "uᵢⱼ", sens: <>elementele lui U, de pe diagonală în sus</> },
              { simbol: "lᵢⱼ", sens: <>elementele lui L, strict sub diagonală</> },
              { simbol: "uⱼⱼ", sens: <>pivotul coloanei j; dacă e 0, metoda se oprește</> },
            ],
            explicatie: (
              <>
                Se calculează coloană cu coloană: din primele <Mate>p</Mate> ecuații ies elementele
                lui <Mate>U</Mate>, din restul cele ale lui <Mate>L</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "crout",
        titlu: "Crout — 1 pe diagonala lui U",
        esenta: (
          <>
            Aceeași descompunere, cu <Mate>uᵢᵢ = 1</Mate>: acum prima coloană a lui <Mate>L</Mate> e
            chiar prima coloană a lui <Mate>A</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "l_{i1} = a_{i1},\\qquad u_{1j} = \\frac{a_{1j}}{l_{11}},\\qquad u_{ii} = 1",
            sursa: "curs 4, §6.1",
            legenda: [
              { simbol: "lᵢ₁", sens: <>prima coloană a lui L, copiată din A</> },
              { simbol: "u₁ⱼ", sens: <>prima linie a lui U</> },
            ],
          },
          {
            tip: "formula",
            latex:
              "l_{ij} = a_{ij} - \\sum_{k=1}^{j-1} l_{ik} u_{kj},\\ i \\ge j,\\qquad u_{ij} = \\frac{1}{l_{ii}}\\left( a_{ij} - \\sum_{k=1}^{i-1} l_{ik} u_{kj} \\right),\\ i < j",
            sursa: "curs 4, §6.1",
            legenda: [
              {
                simbol: "i ≥ j",
                sens: <>partea inferioară, inclusiv diagonala: elementele lui L</>,
              },
              { simbol: "i < j", sens: <>strict deasupra diagonalei: elementele lui U</> },
            ],
          },
        ],
      },
      {
        id: "cholesky",
        titlu: "Cholesky — U este transpusa lui L",
        esenta: (
          <>
            Pentru <Mate>A</Mate> simetrică și pozitiv definită se cere <Mate>A = L·Lᵀ</Mate>, iar{" "}
            <Mate>L</Mate> e unică.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "l_{ii} = \\sqrt{\\,a_{ii} - \\sum_{k=1}^{i-1} l_{ik}^{2}\\,},\\qquad l_{ij} = \\frac{a_{ij} - \\sum_{k=1}^{j-1} l_{ik} l_{jk}}{l_{jj}},\\quad j = 1,\\dots,i-1",
            sursa: "curs 4, §6.3; curs 2, §5.4",
            legenda: [
              { simbol: "lᵢᵢ", sens: <>elementul de pe diagonala lui L</> },
              { simbol: "lᵢⱼ", sens: <>elementele de sub diagonală</> },
              { simbol: "A = L·Lᵀ", sens: <>caz particular al factorizării L·D·Lᵀ, cu D = Iₙ</> },
            ],
            explicatie: (
              <>
                Fiind <Mate>A</Mate> simetrică, partea de deasupra diagonalei se poate ignora.
                Algoritmul eșuează singur dacă matricea nu e pozitiv definită — se ajunge la
                împărțire la 0 sau la radical dintr-un număr negativ — deci condiția nu se verifică
                dinainte.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Ce rămâne, dacă rămâne un singur lucru: <Mate>A = L·U</Mate> se calculează o dată, iar apoi
        fiecare nou vector <Mate>b</Mate> costă doar două substituții, <Mate>O(n²)</Mate>. Cele trei
        metode dau aceeași factorizare și diferă doar prin ce se fixează dinainte:{" "}
        <Mate>lᵢᵢ = 1</Mate>, <Mate>uᵢᵢ = 1</Mate> sau <Mate>U = Lᵀ</Mate>.
      </>
    ),
  },
};

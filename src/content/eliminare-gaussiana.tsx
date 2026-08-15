import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 3 — eliminarea gaussiană și pivotările.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`** — §2 (costul
 * regulii lui Cramer), §3 (operațiile elementare, matricile elementare,
 * determinantul), §4 (eliminarea, vectorul Gauss, Algorithm 1, contorizarea
 * operațiilor), §5 (pivotările: GPP, GPPS, GPT), §8.1 (substituția înapoi).
 * Nimic scris din memorie.
 *
 * **Verificat numeric, separat de aplicație.** Exemplul rezolvat din §4.3 rulează
 * prin modulele reale în `scripts/verificare-algoritmi/eliminare-gaussiana.ts`:
 * rapoartele ies 1, 3 și −1, liniile intermediare se potrivesc cifră cu cifră cu
 * cele tipărite în curs, soluția `(−3, 4, 0)` dă reziduu **nul pe sistemul
 * original**, iar `det A` calculat prin dezvoltare după prima linie iese −6, la
 * fel ca produsul diagonalei lui U.
 *
 * **O abatere declarată.** Cursul afirmă la §5.2 că pivotarea parțială nu
 * permută pe sistemul din §5.1; în realitate permută (`|1| > |0,001|`) și
 * repară exemplul, eroarea scăzând de la 70,6 % la 0,1 %. Pagina dă deci
 * fiecărei metode motivul ei corect; cazul e scris în `docs/erata-cursuri.md`
 * și ținut ca test.
 *
 * **Unde au plecat cele două exemple numerice de pivotare.** Sistemul cu `0,001`
 * (§5.1) și cel cu `10 000` (§5.3) erau scrise aici ca formule; acum sunt
 * presetări în `src/algorithms/eliminare-gaussiana/exemple.ts`, deci se pot
 * rula pas cu pas în secțiunea „Interactiv", pe fiecare dintre cele trei
 * strategii. N-au dispărut și nu s-au schimbat — s-au mutat acolo unde se
 * înțeleg mai bine, iar teoria a rămas cu regulile de selecție, care sunt ce
 * trebuie citit.
 */
export const continutEliminareGaussiana: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Regula lui Cramer cere <Mate>(n−1)(n+1)!</Mate> înmulțiri și împărțiri — 360 de milioane de
        operații pentru zece ecuații. Eliminarea gaussiană costă doar <Mate>n³</Mate>: nu atacă
        sistemul direct, ci îl <strong>schimbă în altul mai simplu</strong>, triunghiular, cu exact
        aceleași soluții.
      </>
    ),

    metode: [
      {
        id: "operatii-elementare",
        titlu: "De ce e voie: cele trei operații",
        esenta: (
          <>
            Un sistem nu-și schimbă soluțiile dacă înmulțești o ecuație cu un număr nenul, dacă
            schimbi două ecuații între ele sau dacă aduni la o ecuație un multiplu al alteia.
          </>
        ),
        blocuri: [
          {
            tip: "text",
            continut: (
              <>
                Cu <Mate>T</Mate> nesingulară, <Mate>A·x = b</Mate> și <Mate>T·A·x = T·b</Mate> au
                aceleași soluții — iar fiecare operație de mai jos e o astfel de înmulțire.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\alpha E_i \\to E_i, \\qquad E_j \\leftrightarrow E_i, \\qquad E_i - \\alpha E_j \\to E_i",
            sursa: "curs 4, §3.1",
            legenda: [
              { simbol: "Eᵢ", sens: <>ecuația i, adică linia i din matricea extinsă</> },
              { simbol: "α", sens: <>un număr nenul</> },
              { simbol: "↔", sens: <>schimbarea a două ecuații între ele</> },
            ],
            explicatie: <>Eliminarea produce zerourile, permutarea alege pivotul.</>,
          },
        ],
      },
      {
        id: "eliminare",
        titlu: "Eliminarea gaussiană",
        esenta: (
          <>
            Se coboară pe diagonală, iar la fiecare pas se scade linia pivotului din toate liniile
            de sub ea, exact cât să apară zerouri pe coloană.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\mu_{ip} = \\frac{a_{ip}}{a_{pp}}, \\qquad L_i \\leftarrow L_i - \\mu_{ip}\\,L_p, \\qquad i = p+1, \\dots, n",
            sursa: "curs 4, §4.4",
            legenda: [
              { simbol: "aₚₚ", sens: <>pivotul: elementul de pe diagonală, la pasul p</> },
              { simbol: "aᵢₚ", sens: <>elementul de sub pivot, cel care trebuie făcut 0</> },
              { simbol: "µᵢₚ", sens: <>de câte ori încape pivotul în elementul de sub el</> },
              { simbol: "Lᵢ", sens: <>linia i din matricea extinsă, cu tot cu termenul liber</> },
            ],
            explicatie: (
              <>
                <Mate>µ</Mate> nu e ales, e impus. Se aplică pe <strong>toată linia</strong>,
                termenul liber inclusiv — de aceea se lucrează pe <Mate>[A|b]</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "T_p = I_n - t_p\\,e_p^{T}, \\qquad t_p = \\begin{pmatrix} 0 & \\cdots & 0 & \\dfrac{x_{p+1}}{x_p} & \\cdots & \\dfrac{x_n}{x_p} \\end{pmatrix}^{T}, \\qquad T\\,A = U",
            sursa: "curs 4, §4.2",
            legenda: [
              { simbol: "Iₙ", sens: <>matricea unitate</> },
              { simbol: "eₚ", sens: <>coloana p a matricei unitate</> },
              {
                simbol: "tₚ",
                sens: <>vectorul Gauss: rapoartele µ ale pasului p, cu semn schimbat</>,
              },
              { simbol: "T", sens: <>produsul tuturor transformărilor: Tₙ₋₁ · … · T₂ · T₁</> },
              { simbol: "U", sens: <>matricea superior triunghiulară obținută la final</> },
            ],
            explicatie: (
              <>
                Aceeași operație pe linii, scrisă ca înmulțire — dar forma matriceală arată ce
                ascunde cea pe linii: la capăt există o singură matrice, cu <Mate>T·A = U</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\left(\\begin{array}{ccc|c} 1 & 3 & 1 & 9 \\\\ 1 & 1 & -1 & 1 \\\\ 3 & 11 & 8 & 35 \\end{array}\\right) \\to \\left(\\begin{array}{ccc|c} 1 & 3 & 1 & 9 \\\\ 0 & -2 & -2 & -8 \\\\ 0 & 2 & 5 & 8 \\end{array}\\right) \\to \\left(\\begin{array}{ccc|c} 1 & 3 & 1 & 9 \\\\ 0 & -2 & -2 & -8 \\\\ 0 & 0 & 3 & 0 \\end{array}\\right)",
            sursa: "curs 4, §4.3",
            explicatie: (
              <>
                Rapoartele sunt <Mate>µ₂₁ = 1</Mate>, <Mate>µ₃₁ = 3</Mate>, <Mate>µ₃₂ = −1</Mate>:
                ultimul e negativ, deci linia pivotului se <strong>adună</strong>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\frac{2n^3 + 3n^2 - 5n}{6} \\;\\text{înmulțiri și împărțiri}, \\qquad \\frac{n^3 - n}{3} \\;\\text{adunări și scăderi}",
            sursa: "curs 4, §4.5",
            explicatie: <>La zece ecuații: 375 de înmulțiri aici, 360 de milioane la Cramer.</>,
          },
        ],
      },
      {
        id: "substitutie-inapoi",
        titlu: "Substituția înapoi",
        esenta: (
          <>
            Ultima ecuație are o singură necunoscută, deci se rezolvă direct; apoi se urcă linie cu
            linie, înlocuind de fiecare dată ce s-a aflat deja.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "x_i = \\frac{b_i - \\sum\\limits_{j=i+1}^{n} a_{ij}\\,x_j}{a_{ii}}, \\qquad i = n, n-1, \\dots, 1",
            sursa: "curs 4, §8.1",
            legenda: [
              { simbol: "aᵢᵢ", sens: <>elementul de pe diagonală al liniei i</> },
              {
                simbol: "Σ",
                sens: <>termenii cu necunoscutele deja aflate, la dreapta diagonalei</>,
              },
              { simbol: "bᵢ", sens: <>termenul liber al liniei i</> },
            ],
            explicatie: (
              <>
                Pentru <Mate>i = n</Mate> suma e vidă, deci <Mate>xₙ = bₙ/aₙₙ</Mate>. Costă doar{" "}
                <Mate>n²</Mate>: scumpă e aducerea la formă triunghiulară, nu rezolvarea.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\det U = \\prod_{i=1}^{n} u_{ii}, \\qquad \\det A = \\frac{\\det U}{\\prod_i \\det T_i}",
            sursa: "curs 4, §3.4",
            legenda: [
              { simbol: "uᵢᵢ", sens: <>elementele de pe diagonala formei triunghiulare</> },
              { simbol: "Tᵢ", sens: <>transformarea aplicată la pasul i</> },
            ],
            explicatie: (
              <>
                Cât timp s-au folosit numai eliminări, <Mate>det A = det U</Mate>; fiecare permutare
                schimbă semnul, deci după pivotare se numără câte au fost.
              </>
            ),
          },
        ],
      },
      {
        id: "pivotare-partiala",
        titlu: "Pivotare parțială",
        esenta: (
          <>
            Înainte de fiecare pas, se aduce în locul pivotului cel mai mare element în modul din
            coloană — atât ca să nu se împartă la zero, cât și ca să nu se împartă la ceva foarte
            mic.
          </>
        ),
        blocuri: [
          {
            tip: "text",
            continut: (
              <>
                Un pivot <Mate>0</Mate> oprește metoda; unul foarte mic e mai periculos, fiindcă dă
                un <Mate>µ</Mate> uriaș, care amplifică erorile de rotunjire.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "|a_{i_p,\\,p}| = \\max_{i = p, \\dots, n} |a_{ip}|, \\qquad L_p \\leftrightarrow L_{i_p}",
            sursa: "curs 4, §5.2",
            legenda: [
              { simbol: "iₚ", sens: <>linia care aduce cel mai mare element pe pivot</> },
              { simbol: "|aᵢₚ|", sens: <>modulul elementului de pe coloana p, în linia i</> },
            ],
            explicatie: (
              <>
                Se caută numai <strong>sub</strong> pivot. Dacă maximul în modul e <Mate>0</Mate>,
                coloana e nulă și matricea e singulară.
              </>
            ),
          },
        ],
      },
      {
        id: "pivot-scalat",
        titlu: "Pivotare parțială cu pivot scalat",
        esenta: (
          <>
            Se compară elementele coloanei nu între ele, ci fiecare cu cel mai mare număr de pe
            linia lui — mare sau mic se judecă relativ la ecuația din care vine.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "s_i = \\max_{j = p, \\dots, n} |a_{ij}|, \\qquad \\frac{|a_{i_p,\\,p}|}{s_{i_p}} = \\max_{i = p, \\dots, n} \\frac{|a_{ip}|}{s_i}",
            sursa: "curs 4, §5.3",
            legenda: [
              {
                simbol: "sᵢ",
                sens: <>factorul de scalare: cel mai mare coeficient de pe linia i</>,
              },
              {
                simbol: "|aᵢₚ|/sᵢ",
                sens: <>cât de mare e candidatul la pivot în propria lui ecuație</>,
              },
            ],
            explicatie: (
              <>
                Dacă <Mate>sᵢ = 0</Mate>, linia e nulă și matricea e singulară. Cursul dă și
                varianta cu sumă, <Mate>sᵢ = Σⱼ |aᵢⱼ|</Mate>, în locul maximului.
              </>
            ),
          },
        ],
      },
      {
        id: "pivotare-totala",
        titlu: "Pivotare totală",
        esenta: (
          <>
            Pivotul e cel mai mare element în modul din toată submatricea rămasă, nu doar din
            coloană — deci se permută și coloane, adică se schimbă ordinea necunoscutelor.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "|a_{rc}| = \\max_{\\substack{i = p, \\dots, n \\\\ j = p, \\dots, n}} |a_{ij}|, \\qquad A \\leftarrow P_{\\text{linii}}\\,A\\,P_{\\text{coloane}}",
            sursa: "curs 4, §5.4",
            legenda: [
              {
                simbol: "(r, c)",
                sens: <>poziția celui mai mare element din submatricea rămasă</>,
              },
              {
                simbol: "P linii",
                sens: <>permutarea care aduce linia r sus; se aplică la stânga</>,
              },
              {
                simbol: "P coloane",
                sens: <>permutarea care aduce coloana c în față; se aplică la dreapta</>,
              },
            ],
            explicatie: (
              <>
                Permutarea de coloane se aplică <strong>la dreapta</strong>, deci amestecă
                necunoscutele, nu ecuațiile — și se rețin în <Mate>PR</Mate>, altfel <Mate>x</Mate>{" "}
                rămâne în altă ordine decât sistemul scris.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Cea mai stabilă dintre cele trei, dar cere parcursă toată submatricea rămasă la
                fiecare pas — de aceea implicita rămâne cea parțială.
              </>
            ),
          },
        ],
      },
    ],
  },
};

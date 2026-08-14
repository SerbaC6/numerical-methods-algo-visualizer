import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 10 — algoritmul QR.
 *
 * **Sursa: `cursuri_MN/qr_dvs_teorie_curs8.md`, §1–§5.** Nimic scris din
 * memorie. §6–§10 (DVS) sunt pagina 11 și nu apar aici.
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
                Householder, printr-o transformare de asemănare — adică una care{" "}
                <strong>nu schimbă valorile proprii</strong>, doar felul în care sunt așezate
                cifrele.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{aligned} b_2 = 0 &\\;\\Longrightarrow\\; a_1 \\text{ este valoare proprie} \\\\ b_n = 0 &\\;\\Longrightarrow\\; a_n \\text{ este valoare proprie} \\end{aligned}",
            sursa: "curs 8, §1",
            explicatie: (
              <>
                Aici e toată strategia metodei: nu se caută valorile proprii, ci se{" "}
                <strong>strâng spre zero</strong> capetele subdiagonalei, <Mate>b₂</Mate> și{" "}
                <Mate>bₙ</Mate>, până când cifra de lângă ele devine citibilă ca valoare proprie.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Dacă un <Mate>bⱼ</Mate> din mijloc se anulează, cu <Mate>{"2 < j < n"}</Mate>,
                matricea se rupe și problema se sparge în două mai mici — una de dimensiune{" "}
                <Mate>j − 1</Mate> și una de dimensiune <Mate>n − j + 1</Mate> — cărora li se aplică
                QR separat.
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
                iar matricea următoare e produsul acelorași doi factori, luați invers. Nimic altceva
                nu se schimbă de la un pas la altul.
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
                Rândul care explică de ce funcționează metoda. <Mate>Q⁽ⁱ⁾</Mate> fiind ortogonală,
                din prima relație iese <Mate>R⁽ⁱ⁾ = Q⁽ⁱ⁾ᵀ·A⁽ⁱ⁾</Mate>, deci pasul e o{" "}
                <strong>transformare de asemănare ortogonală</strong>. De aici trei garanții
                deodată: <Mate>A⁽ⁱ⁺¹⁾</Mate> rămâne simetrică, rămâne tridiagonală și are exact
                aceleași valori proprii ca <Mate>A</Mate>. Prin inducție, șirul tinde la o matrice
                diagonală — iar pe diagonala ei stau valorile proprii căutate.
              </>
            ),
          },
        ],
      },

      {
        id: "matrice-de-rotatie",
        titlu: "Matricea de rotație",
        esenta: (
          <>
            Singura unealtă din care se construiesc <Mate>Q</Mate> și <Mate>R</Mate>: o matrice care
            diferă de identitate în cel mult patru locuri.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "p_{ii} = p_{jj} = \\cos\\Theta, \\qquad p_{ij} = -p_{ji} = \\sin\\Theta, \\qquad i \\neq j",
            sursa: "curs 8, §2",
            legenda: [
              { simbol: "P", sens: <>matricea de rotație; în rest, identică cu identitatea</> },
              { simbol: "Θ", sens: <>unghiul rotației — singurul lucru de ales</> },
              { simbol: "i, j", sens: <>cele două linii (și coloane) pe care le atinge</> },
            ],
            explicatie: (
              <>
                Din definiție ies trei proprietăți. <Mate>P</Mate> e <strong>ortogonală</strong> —{" "}
                <Mate>P·Pᵀ = I</Mate>; produsul <Mate>P·A</Mate> schimbă doar liniile <Mate>i</Mate>{" "}
                și <Mate>j</Mate>, iar <Mate>A·P</Mate> doar coloanele <Mate>i</Mate> și{" "}
                <Mate>j</Mate>. A patra e cea care face algoritmul posibil: pentru orice{" "}
                <Mate>{"i ≠ j"}</Mate>, unghiul <Mate>Θ</Mate> se poate alege astfel încât elementul{" "}
                <Mate>(P·A)ᵢⱼ</Mate> să se anuleze.
              </>
            ),
          },
        ],
      },

      {
        id: "constructia-q-r",
        titlu: "Construcția lui Q și R",
        esenta: (
          <>
            Câte o rotație pentru fiecare element de pe subdiagonală: ce rămâne după toate e{" "}
            <Mate>R</Mate>, iar transpusele lor înmulțite dau <Mate>Q</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\sin\\Theta_2 = \\frac{b_2}{\\sqrt{b_2^2 + a_1^2}}, \\qquad \\cos\\Theta_2 = \\frac{a_1}{\\sqrt{b_2^2 + a_1^2}}",
            sursa: "curs 8, §3",
            legenda: [
              { simbol: "Θ₂", sens: <>unghiul primei rotații, P₂</> },
              { simbol: "a₁, b₂", sens: <>colțul din stânga-sus al matricei curente</> },
            ],
            explicatie: (
              <>
                Prima rotație, aleasă exact cât să stingă elementul de sub <Mate>a₁</Mate>: în{" "}
                <Mate>P₂·A⁽¹⁾</Mate>, elementul din poziția <Mate>(2,1)</Mate> devine{" "}
                <Mate>(−sinΘ₂)·a₁ + (cosΘ₂)·b₂ = 0</Mate>. Înmulțirea atinge liniile 1 și 2, dar
                matricea fiind tridiagonală, singurul element care se poate umple în afara benzii e
                cel din poziția <Mate>(1,3)</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "R^{(1)} = P_n P_{n-1} \\cdots P_2\\, A^{(1)}, \\qquad Q^{(1)} = P_2^{T} P_3^{T} \\cdots P_n^{T}",
            sursa: "curs 8, §3",
            legenda: [
              { simbol: "Pₖ", sens: <>rotația care anulează elementul din poziția (k, k−1)</> },
            ],
            explicatie: (
              <>
                Rotațiile se aplică de la stânga, una pentru fiecare element de pe subdiagonală;
                când se termină, sub diagonală nu mai e nimic, adică rezultatul e chiar{" "}
                <Mate>R⁽¹⁾</Mate>. Amândouă verificările cerute ies din faptul că fiecare{" "}
                <Mate>Pₖ</Mate> e ortogonală: produsul <Mate>Q⁽¹⁾·R⁽¹⁾</Mate> se telescopează înapoi
                la <Mate>A⁽¹⁾</Mate>, iar <Mate>Q⁽¹⁾ᵀ·Q⁽¹⁾ = I</Mate>. Efectul secundar al pasului
                general — elementul <Mate>(k−1, k+1)</Mate> devine nenul — e chiar motivul pentru
                care banda se închide la loc la înmulțirea următoare, iar forma tridiagonală
                supraviețuiește iterației.
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
                Rata cu care <Mate>bⱼ₊₁</Mate> se apropie de zero, și implicit cea cu care{" "}
                <Mate>aⱼ</Mate> se apropie de <Mate>λⱼ</Mate>. Consecința e neplăcută: dacă două
                valori proprii vecine au module apropiate, raportul e aproape de 1 și metoda
                înaintează foarte încet.
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
                Se scade <Mate>σ</Mate> de pe diagonală înainte de factorizare și se adaugă înapoi
                după înmulțire. Fiind readăugată la fiecare pas, deplasarea nu rămâne datorie de
                plătit la final: când <Mate>bₙ</Mate> ajunge ≈ 0, cifra <Mate>aₙ</Mate> se citește
                direct ca <Mate>λₙ</Mate>.
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
                De aici se ia deplasarea, alta la fiecare pas: <Mate>σᵢ</Mate> e valoarea proprie a
                acestei matrice de ordinul doi cea mai apropiată de <Mate>aₙ⁽ⁱ⁾</Mate>. Alegerea o
                grăbește anume pe <Mate>bₙ</Mate>, care ajunge la zero înaintea celorlalte; atunci{" "}
                <Mate>aₙ</Mate> e o valoare proprie, se taie ultima linie și ultima coloană, și se
                reia procedeul pe matricea rămasă, până se epuizează spectrul.
              </>
            ),
          },
        ],
      },

      {
        id: "matrici-nesimetrice",
        titlu: "Matrici nesimetrice",
        esenta: (
          <>
            Fără simetrie, Householder nu mai poate coborî până la tridiagonală; se oprește o
            treaptă mai sus, la forma Hessenberg.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "H = \\begin{pmatrix} a_{11} & a_{12} & \\cdots & a_{1n} \\\\ a_{21} & a_{22} & \\cdots & a_{2n} \\\\ & a_{32} & \\ddots & \\vdots \\\\ & & a_{n,n-1} & a_{nn} \\end{pmatrix}",
            sursa: "curs 8, §5",
            legenda: [
              { simbol: "H", sens: <>forma Hessenberg superioară</> },
              { simbol: "a₂₁, a₃₂, …", sens: <>subdiagonala, singura parte de sub diagonală</> },
            ],
            explicatie: (
              <>
                O matrice superior triunghiulară plus o subdiagonală nenulă. Iterația QR o păstrează
                în formă, exact cum păstra tridiagonala în cazul simetric.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{aligned} H^{(1)} - \\sigma_1 I &= Q^{(1)} R^{(1)}, & H^{(2)} &= R^{(1)} Q^{(1)} + \\sigma_1 I \\\\ H^{(2)} - \\sigma_2 I &= Q^{(2)} R^{(2)}, & H^{(3)} &= R^{(2)} Q^{(2)} + \\sigma_2 I \\end{aligned}",
            sursa: "curs 8, §5",
            legenda: [
              { simbol: "σ₁, σ₂", sens: <>două deplasări, numere complex conjugate</> },
              { simbol: "H⁽¹⁾, H⁽²⁾…", sens: <>matrici reale, Hessenberg superioare</> },
            ],
            explicatie: (
              <>
                Deplasarea QR dublă. Fără simetrie pot apărea valori proprii{" "}
                <strong>distincte, dar de același modul</strong> — perechi complex conjugate —, iar
                pe ele o singură deplasare reală nu are ce separa: raportul rămâne 1. Două deplasări
                complex conjugate, aplicate una după alta, lasă în urmă matrici tot reale.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Ce rămâne, dacă rămâne un singur lucru: QR nu <em>calculează</em> valorile proprii, ci
        schimbă baza de atâtea ori până când ele apar singure pe diagonală. Fiecare pas e o
        asemănare ortogonală, deci spectrul nu se mișcă niciodată — se mișcă doar elementele din
        afara diagonalei, care se sting. Iar deplasarea e ce face diferența dintre o metodă corectă
        și una folosibilă: fără ea, viteza e la mâna raportului <Mate>|λⱼ₊₁/λⱼ|</Mate>, pe care nu-l
        alegi tu; cu ea, raportul devine <Mate>|(λⱼ₊₁ − σ)/(λⱼ − σ)|</Mate>, iar <Mate>σ</Mate> e
        singurul lucru din tot algoritmul pe care îl alegi.
      </>
    ),
  },
};

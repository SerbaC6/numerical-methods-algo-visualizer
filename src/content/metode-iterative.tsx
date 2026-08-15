import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 5 — Jacobi, Gauss-Seidel, SOR.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §1–§7 și
 * §10** (problemele 3 și 4, de unde vin cele două sisteme gata alese). §8–§9
 * (gradientul conjugat și precondiționarea) sunt pagina 7 și nu apar aici.
 * Nimic scris din memorie.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/metode-iterative.ts`, pe modulele reale):
 *
 * - partiționarea `A = D − L − U` și tabelul `M`, `N`, `G`, `c` din §3.2;
 * - iterația pe componente coincide, la toate trei metodele, cu forma
 *   matriceală `x = G·x + c`;
 * - pe problema 3: `ρ(J) = 0,607243` cu 33 de iterații, `ρ(GS) = 0,408248` cu
 *   23, iar `ω` optim iese **subunitar** (0,935), deci suprarelaxarea strică;
 * - pe problema 4: `ρ(J) = 1` exact — Jacobi oscilează între `(0,0,0)` și
 *   `(2,2,2)` —, în timp ce `ρ(GS) = 0,353553` și Gauss-Seidel termină în 20 de
 *   iterații; `ω` optim iese 1,08, deci acolo suprarelaxarea chiar ajută.
 *
 * **Două abateri declarate de la curs**, amândouă în `docs/erata-cursuri.md`:
 *
 * 1. §5.1 spune că Jacobi și Gauss-Seidel converg „ori amândouă, ori niciuna" și
 *    că `ρ(GS) < ρ(J) < 1`. Teorema invocată cere ipoteze pe care matricea nu le
 *    are întotdeauna, iar contraexemplul e chiar problema 4 din același curs.
 *    Pagina nu repetă afirmația; scrie ce se verifică.
 * 2. Algorithm 3 (§6) aplică relaxarea o singură dată, pe tot vectorul, deci nu
 *    e SOR decât pentru `ω = 1`. Pagina implementează formula pe componente din
 *    §6, cea care se potrivește cu forma matriceală.
 */
export const continutMetodeIterative: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Eliminarea gaussiană rezolvă sistemul în <Mate>O(n³)</Mate> operații și dă răspunsul exact,
        dar pentru un sistem mare devine scumpă. Metodele iterative fac altceva: pornesc de la o
        ghicire și o îmbunătățesc, cu <Mate>O(n²)</Mate> operații la fiecare pas, până când vectorul
        nu se mai mișcă. Prețul e că <strong>nu converg pentru orice sistem</strong> — iar toată
        pagina e despre ce anume decide dacă merg sau nu.
      </>
    ),

    metode: [
      {
        id: "forma-generala",
        titlu: "Forma comună a celor trei metode",
        esenta: (
          <>
            Toate trei rup matricea în două bucăți, <Mate>A = M − N</Mate>, și mută una dintre ele
            în dreapta egalului. Ce rămâne e o rețetă care se aplică la nesfârșit.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "A\\,x = b \\;\\Longrightarrow\\; (M - N)\\,x = b \\;\\Longrightarrow\\; M\\,x = N\\,x + b",
            sursa: "curs 5, §3",
            legenda: [
              { simbol: "M", sens: <>partea ușor de inversat: diagonală sau triunghiulară</> },
              { simbol: "N", sens: <>restul, care trece în dreapta</> },
            ],
            explicatie: (
              <>
                Rostul despărțirii e ca <Mate>M</Mate> să fie o matrice pe care o „inversezi" fără
                efort. Sistemul <Mate>M·z = r</Mate> e mult mai ieftin de rezolvat decât{" "}
                <Mate>A·x = b</Mate>, iar diferența asta e tot câștigul metodei.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "x^{(k)} = G\\,x^{(k-1)} + c, \\qquad G = M^{-1}N, \\quad c = M^{-1}b",
            sursa: "curs 5, §3",
            legenda: [
              { simbol: "G", sens: <>matricea de iterație — ea decide totul</> },
              { simbol: "c", sens: <>vectorul de iterație, fix pe tot parcursul</> },
              { simbol: "x⁽ᵏ⁾", sens: <>aproximarea după k pași</> },
            ],
            explicatie: (
              <>
                De aici încolo, sistemul a dispărut: rămâne o singură funcție aplicată din nou și
                din nou. Cele trei metode diferă <em>doar</em> prin ce aleg drept <Mate>M</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "A = D - L - U",
            sursa: "curs 5, §3.2",
            legenda: [
              { simbol: "D", sens: <>diagonala lui A</> },
              { simbol: "L", sens: <>ce e sub diagonală, cu semn schimbat</> },
              { simbol: "U", sens: <>ce e deasupra diagonalei, cu semn schimbat</> },
            ],
            explicatie: (
              <>
                Semnele minus nu sunt o convenție întâmplătoare: cu ele egalitatea e exactă, iar
                cele trei metode se scriu apoi din aceleași trei piese.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{array}{cc}\n" +
              "A = \\begin{pmatrix}2&1&1\\\\1&2&1\\\\1&1&2\\end{pmatrix} & D = \\begin{pmatrix}2&0&0\\\\0&2&0\\\\0&0&2\\end{pmatrix} \\\\[10pt]\n" +
              "L = \\begin{pmatrix}0&0&0\\\\-1&0&0\\\\-1&-1&0\\end{pmatrix} & U = \\begin{pmatrix}0&-1&-1\\\\0&0&-1\\\\0&0&0\\end{pmatrix}\n" +
              "\\end{array}",
            sursa: "curs 5, §3.2 (partiționarea) pe sistemul din §10, problema 4",
            explicatie: (
              <>
                Aceeași despărțire, pe un sistem concret. Se verifică dintr-o privire:{" "}
                <Mate>D − L − U</Mate> pune fiecare element înapoi de unde a venit, cu semnul lui
                original.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{array}{l|c|c}\n\\text{metodă} & M & N \\\\\\hline\n\\text{Jacobi} & D & L + U \\\\\n\\text{Gauss-Seidel} & D - L & U \\\\\n\\text{SOR} & D - \\omega L & (1-\\omega)D + \\omega U\n\\end{array}",
            sursa: "curs 5, §3.2",
            explicatie: (
              <>
                Tot ce urmează pe pagină e cuprins în tabelul ăsta. Restul secțiunilor spun ce
                înseamnă fiecare rând când îl scrii pe linii, cu numere.
              </>
            ),
          },
        ],
      },
      {
        id: "convergenta",
        titlu: "Când converge și cât de repede",
        esenta: (
          <>
            Un singur număr decide: raza spectrală a lui <Mate>G</Mate>. Sub 1 metoda converge,
            peste 1 diverge, iar cât de mult sub 1 spune cât de repede.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "e^{(k)} = x - x^{(k)} = G\\,e^{(k-1)} = G^{k}\\,e^{(0)}",
            sursa: "curs 5, §3.1",
            legenda: [
              { simbol: "e⁽ᵏ⁾", sens: <>eroarea după k pași: cât mai e până la soluție</> },
              { simbol: "e⁽⁰⁾", sens: <>eroarea de pornire, dată de ghicirea inițială</> },
            ],
            explicatie: (
              <>
                Scăzând <Mate>x = G·x + c</Mate> din <Mate>x⁽ᵏ⁾ = G·x⁽ᵏ⁻¹⁾ + c</Mate>, vectorul{" "}
                <Mate>c</Mate> dispare: eroarea nu face altceva decât să fie înmulțită cu{" "}
                <Mate>G</Mate> la fiecare pas. Deci convergența nu depinde nici de <Mate>b</Mate>,
                nici de pornire — doar de <Mate>G</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "\\rho(G) = \\max_i |\\lambda_i(G)| < 1",
            sursa: "curs 5, §3.1",
            legenda: [
              { simbol: "λᵢ(G)", sens: <>valorile proprii ale matricei de iterație</> },
              { simbol: "ρ(G)", sens: <>raza spectrală: cea mai mare dintre ele, în modul</> },
            ],
            explicatie: (
              <>
                Condiția e și necesară, și suficientă: <Mate>Gᵏ → 0</Mate> exact atunci când toate
                valorile proprii sunt subunitare în modul. Practic, <Mate>ρ(G)</Mate> e factorul cu
                care se micșorează eroarea la fiecare pas: cu <Mate>ρ = 0,4</Mate>, după zece pași
                mai rămâne din ea cam a zecea-miia parte, iar cu <Mate>ρ = 0,99</Mate> aceeași
                reducere cere peste 900 de pași.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "|a_{ii}| > \\sum_{j \\neq i} |a_{ij}|, \\qquad i = 1, \\dots, n",
            sursa: "curs 5, §1",
            legenda: [
              { simbol: "aᵢᵢ", sens: <>elementul de pe diagonală al liniei i</> },
              { simbol: "Σ|aᵢⱼ|", sens: <>cât cântăresc, la un loc, ceilalți din linie</> },
            ],
            explicatie: (
              <>
                Dominanța diagonală e o condiție <strong>suficientă, dar nu necesară</strong>: dacă
                e îndeplinită, metodele converg din orice pornire; dacă nu e, ele încă pot să
                conveargă — sau nu. Se verifică dintr-o privire, spre deosebire de <Mate>ρ(G)</Mate>
                , care cere valorile proprii. Inegalitatea e strictă: pe primul sistem al paginii,
                linia a doua stă exact la egalitate, deci condiția nu e îndeplinită — și totuși
                amândouă metodele converg.
              </>
            ),
          },
        ],
      },
      {
        id: "jacobi",
        titlu: "Jacobi",
        esenta: (
          <>
            Fiecare linie e rezolvată pentru necunoscuta ei, folosind pentru toate celelalte
            valorile din iterația precedentă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left( b_i - \\sum_{j \\neq i} a_{ij}\\,x_j^{(k)} \\right), \\qquad i = 1, \\dots, n",
            sursa: "curs 5, §4",
            legenda: [
              { simbol: "xⱼ⁽ᵏ⁾", sens: <>toate valorile vin din iterația trecută</> },
              {
                simbol: "aᵢᵢ",
                sens: <>elementul diagonal — se împarte la el, deci nu poate fi 0</>,
              },
            ],
            explicatie: (
              <>
                Linia <Mate>i</Mate> „răspunde" pentru necunoscuta <Mate>xᵢ</Mate>. Vectorul vechi
                rămâne neatins până la capătul baleiajului, deci ordinea liniilor nu contează deloc
                — toate cele <Mate>n</Mate> componente se pot calcula chiar în același timp.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "x_i^{(k+1)} = x_i^{(k)} + \\frac{R_i^{(k)}}{a_{ii}}, \\qquad R_i^{(k)} = b_i - \\sum_{j=1}^{n} a_{ij}\\,x_j^{(k)}",
            sursa: "curs 5, §4",
            legenda: [
              {
                simbol: "Rᵢ⁽ᵏ⁾",
                sens: <>restul ecuației i: cât îi lipsește ca să fie satisfăcută</>,
              },
            ],
            explicatie: (
              <>
                Aceeași formulă, scrisă ca „valoarea veche plus o corecție" — se obține adunând și
                scăzând <Mate>aᵢᵢ·xᵢ⁽ᵏ⁾</Mate>. Forma asta e cea care se generalizează:{" "}
                <Mate>Rᵢ = 0</Mate> înseamnă că ecuația <Mate>i</Mate> e deja satisfăcută, iar SOR
                nu va face altceva decât să înmulțească corecția cu un factor.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "x^{(k+1)} = D^{-1}\\left[ (L + U)\\,x^{(k)} + b \\right]",
            sursa: "curs 5, §4",
            explicatie: (
              <>
                Forma matriceală: <Mate>M = D</Mate>, deci inversa e imediată — se împarte fiecare
                linie la elementul ei diagonal. Nicio altă alegere de <Mate>M</Mate> nu e mai
                ieftină.
              </>
            ),
          },
        ],
      },
      {
        id: "gauss-seidel",
        titlu: "Gauss-Seidel",
        esenta: (
          <>
            Aceeași formulă, cu o singură schimbare: valorile calculate mai devreme în baleiajul
            curent se folosesc <em>imediat</em>, nu de la iterația următoare.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left( b_i - \\sum_{j<i} a_{ij}\\,x_j^{(k+1)} - \\sum_{j>i} a_{ij}\\,x_j^{(k)} \\right)",
            sursa: "curs 5, §5",
            legenda: [
              { simbol: "xⱼ⁽ᵏ⁺¹⁾", sens: <>la stânga diagonalei: valori scrise chiar acum</> },
              { simbol: "xⱼ⁽ᵏ⁾", sens: <>la dreapta ei: încă valorile din iterația trecută</> },
            ],
            explicatie: (
              <>
                Singura diferență față de Jacobi e indicele din prima sumă, <Mate>k + 1</Mate> în
                loc de <Mate>k</Mate>. În cod nici măcar nu se vede ca o schimbare de formulă: e pur
                și simplu vectorul rescris <strong>pe loc</strong>, fără copie. Consecința e că aici{" "}
                <strong>ordinea liniilor contează</strong>, iar componentele nu se mai pot calcula
                în paralel.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "x^{(k+1)} = (D - L)^{-1}\\left( U\\,x^{(k)} + b \\right)",
            sursa: "curs 5, §5",
            explicatie: (
              <>
                Acum <Mate>M = D − L</Mate> e inferior triunghiulară: inversa nu mai e imediată, dar
                sistemul se rezolvă prin substituție directă, adică tot ieftin. Informația
                suplimentară pe care o folosește fiecare linie e chiar ce se plătește cu pierderea
                paralelismului.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Merită schimbul?</strong> De obicei da, și se vede pe cifre. Pe primul
                sistem al paginii, Jacobi are <Mate>ρ = 0,6072</Mate> și termină în 33 de iterații,
                iar Gauss-Seidel <Mate>ρ = 0,4082</Mate> și 23. Pe al doilea sistem, diferența nu
                mai e de viteză, ci de existență: <Mate>ρ(Jacobi) = 1</Mate> exact, deci eroarea nu
                se micșorează niciodată — vectorul oscilează la nesfârșit —, în timp ce Gauss-Seidel
                ajunge la soluție în 20 de iterații. <strong>Nu e o regulă</strong>: există sisteme
                pe care Jacobi converge și Gauss-Seidel nu.
              </>
            ),
          },
        ],
      },
      {
        id: "sor",
        titlu: "Suprarelaxare — SOR",
        esenta: (
          <>
            Gauss-Seidel calculează o corecție; SOR o înmulțește cu <Mate>ω</Mate> înainte de a o
            adăuga. Atât.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "x_i^{(k+1)} = x_i^{(k)} + \\omega\\,\\frac{R_i^{(k)}}{a_{ii}}, \\qquad R_i^{(k)} = b_i - \\sum_{j<i} a_{ij}\\,x_j^{(k+1)} - \\sum_{j \\ge i} a_{ij}\\,x_j^{(k)}",
            sursa: "curs 5, §6",
            legenda: [
              { simbol: "ω", sens: <>factorul de relaxare: cât din corecție se aplică</> },
              { simbol: "Rᵢ⁽ᵏ⁾", sens: <>restul, calculat exact ca la Gauss-Seidel</> },
            ],
            explicatie: (
              <>
                Restul e cel de la Gauss-Seidel, cu valorile proaspete la stânga diagonalei.
                Noutatea e doar <Mate>ω</Mate>: peste 1 sare mai departe decât ar cere corecția, sub
                1 se oprește înainte.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "x_i^{(k+1)} = (1 - \\omega)\\,x_i^{(k)} + \\omega\\,x_i^{\\text{GS}}",
            sursa: "curs 5, §6",
            legenda: [{ simbol: "xᵢ^GS", sens: <>ce ar fi scris Gauss-Seidel pe poziția asta</> }],
            explicatie: (
              <>
                Scrisă așa, se vede că e o medie între valoarea veche și cea propusă de
                Gauss-Seidel. Pentru <Mate>ω = 1</Mate> iese exact Gauss-Seidel — deci SOR nu e o
                metodă nouă, ci o familie care îl conține.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "x^{(k+1)} = (D - \\omega L)^{-1}\\left[ (1-\\omega)D + \\omega U \\right]x^{(k)} + \\omega\\,(D - \\omega L)^{-1} b",
            sursa: "curs 5, §6",
            explicatie: (
              <>
                Forma matriceală, din care iese matricea de iterație a metodei — deci și raza ei
                spectrală, pentru fiecare <Mate>ω</Mate> în parte. Relaxarea se aplică{" "}
                <strong>componentă cu componentă</strong>, iar valoarea relaxată intră imediat în
                linia următoare; nu se baleiază întâi tot vectorul.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Ce valori are voie să ia ω.</strong> Peste <Mate>ω = 2</Mate> și sub{" "}
                <Mate>ω = 0</Mate> metoda diverge pentru orice matrice, fiindcă raza spectrală e cel
                puțin <Mate>|ω − 1|</Mate>. Între ele, <Mate>1 &lt; ω &lt; 2</Mate> înseamnă
                suprarelaxare, <Mate>ω &lt; 1</Mate> subrelaxare. Dacă matricea e simetrică și
                pozitiv definită, orice <Mate>ω</Mate> din <Mate>(0, 2)</Mate> converge.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Cât de bun e ω optim nu se poate calcula.</strong> Se caută încercând, iar
                pe cele două sisteme ale paginii răspunsul e chiar diferit ca semn: pe cel dominant
                diagonal, cel mai bun <Mate>ω</Mate> e <strong>subunitar</strong> — 0,935, adică
                subrelaxare —, iar suprarelaxarea strică lucrurile până la divergență, pe la{" "}
                <Mate>ω ≈ 1,47</Mate>. Pe al doilea, cel mai bun e 1,08, deci suprarelaxare.
                Câștigul pe sisteme mici e de o iterație-două; el crește cu dimensiunea sistemului,
                și de aceea metoda se folosește când ai de rezolvat multe sisteme cu aceeași
                matrice: cauți <Mate>ω</Mate> o dată și îl refolosești.
              </>
            ),
          },
        ],
      },
      {
        id: "oprire",
        titlu: "Când se oprește",
        esenta: (
          <>
            Soluția exactă nu se cunoaște, deci nu se poate măsura cât de departe ești de ea. Se
            măsoară altceva: cât de mult s-a mișcat vectorul la ultimul pas.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\left\\lVert x^{(k)} - x^{(k-1)} \\right\\rVert_{\\infty} = \\max_i \\left| x_i^{(k)} - x_i^{(k-1)} \\right| < \\varepsilon",
            sursa: "curs 5, §1.1, §7",
            legenda: [
              { simbol: "ε", sens: <>toleranța: sub cât se consideră că vectorul a stat pe loc</> },
              { simbol: "‖·‖∞", sens: <>cea mai mare schimbare dintre toate componentele</> },
            ],
            explicatie: (
              <>
                Se poate măsura și cu suma modulelor, și cu norma euclidiană, și relativ — împărțind
                la componentele soluției. Cea de aici e cea mai severă dintre variantele absolute:
                cere ca <em>fiecare</em> componentă să se fi liniștit, nu doar media lor.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                A doua condiție de oprire e <strong>numărul maxim de iterații</strong>, și nu e o
                formalitate: e singura care garantează că algoritmul se termină și când metoda
                diverge sau se blochează, cazuri în care prima condiție n-ar fi îndeplinită
                niciodată.
              </>
            ),
          },
        ],
      },
    ],
  },
};

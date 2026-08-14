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
 */
export const continutEliminareGaussiana: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Un sistem <Mate>A·x = b</Mate> nu se rezolvă prin determinanți: regula lui Cramer cere{" "}
        <Mate>(n−1)(n+1)!</Mate> înmulțiri și împărțiri, adică 360 de milioane de operații pentru
        numai zece ecuații. Eliminarea gaussiană ia alt drum, cu un cost de ordinul <Mate>n³</Mate>:
        nu atacă sistemul direct, ci îl <strong>schimbă în altul mai simplu</strong>, cu exact
        aceleași soluții. Ținta e forma triunghiulară, în care ultima ecuație are o singură
        necunoscută, iar de acolo restul se citesc de jos în sus.
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
                Toată metoda stă pe un singur rezultat: dacă <Mate>A</Mate> și <Mate>T</Mate> sunt
                nesingulare, atunci <Mate>x</Mate> e soluție pentru <Mate>A·x = b</Mate> dacă și
                numai dacă e soluție pentru <Mate>T·A·x = T·b</Mate>. Fiecare operație de mai jos e
                o astfel de înmulțire cu o matrice nesingulară, obținută din matricea unitate — de
                aceea niciuna nu pierde și nu adaugă soluții.
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
            explicatie: (
              <>
                Scalare, permutare, eliminare. Eliminarea gaussiană folosește a treia operație ca să
                producă zerouri, iar pivotările — pe a doua, ca să aleagă cu ce împarte. Fiecare are
                matricea ei elementară, iar determinantul se schimbă previzibil:{" "}
                <Mate>det = α</Mate> la scalare, <Mate>det = −1</Mate> la permutare și{" "}
                <Mate>det = 1</Mate> la eliminare — singura care lasă determinantul neatins.
              </>
            ),
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
                Raportul <Mate>µ</Mate> nu e ales, e impus: e singurul număr pentru care{" "}
                <Mate>aᵢₚ − µᵢₚ·aₚₚ</Mate> se anulează. Odată aflat, se aplică pe{" "}
                <strong>toată linia</strong>, nu doar pe elementul care se anulează — altfel ecuația
                nu ar mai fi aceeași. Termenul liber e și el pe linie, de aceea se lucrează pe
                matricea extinsă <Mate>[A|b]</Mate>.
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
                Aceeași operație, scrisă ca înmulțire de matrice. <Mate>Tₚ</Mate> lasă neatinse
                primele <Mate>p</Mate> componente ale unui vector și le anulează pe cele de sub ele;
                condiția asta impune chiar <Mate>tᵢₚ = xᵢ/xₚ</Mate>, adică rapoartele de mai sus.
                Cele două scrieri dau aceleași cifre — desfășurată pe linii, înmulțirea{" "}
                <Mate>Tₚ·A</Mate> e exact <Mate>Lᵢ ← Lᵢ − µᵢₚ·Lₚ</Mate> —, dar forma matriceală
                arată ceva ce forma pe linii ascunde: la capăt există o singură matrice{" "}
                <Mate>T</Mate>, iar <Mate>T·A = U</Mate>.
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
                Exemplul rezolvat, cu rapoartele <Mate>µ₂₁ = 1</Mate>, <Mate>µ₃₁ = 3</Mate> și{" "}
                <Mate>µ₃₂ = 2/(−2) = −1</Mate>. Ultimul e negativ, deci pasul al doilea{" "}
                <strong>adună</strong> linia pivotului în loc s-o scadă — scăderea unui multiplu
                negativ. Pivotul pasului al doilea nu e un element din matricea de pornire, ci{" "}
                <Mate>−2</Mate>, produs chiar de pasul întâi.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\frac{2n^3 + 3n^2 - 5n}{6} \\;\\text{înmulțiri și împărțiri}, \\qquad \\frac{n^3 - n}{3} \\;\\text{adunări și scăderi}",
            sursa: "curs 4, §4.5",
            explicatie: (
              <>
                Costul eliminării, dominat de termenul <Mate>n³</Mate>. Comparația cu Cramer nu e o
                chestiune de stil: la zece ecuații, aici sunt 375 de înmulțiri, acolo 360 de
                milioane.
              </>
            ),
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
                Pentru <Mate>i = n</Mate> suma e vidă, deci <Mate>xₙ = bₙ/aₙₙ</Mate>. Pe exemplul de
                mai sus: <Mate>3x₃ = 0</Mate> dă <Mate>x₃ = 0</Mate>, apoi{" "}
                <Mate>−2x₂ − 2·0 = −8</Mate> dă <Mate>x₂ = 4</Mate>, iar{" "}
                <Mate>x₁ + 3·4 + 0 = 9</Mate> dă <Mate>x₁ = −3</Mate>. Costul e <Mate>n²</Mate>,
                adică neglijabil față de eliminarea dinaintea lui — partea scumpă e aducerea la
                formă triunghiulară, nu rezolvarea.
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
                Un câștig care vine gratis: determinantul unei matrice triunghiulare e produsul
                diagonalei. Cât timp s-au folosit numai eliminări, fiecare <Mate>det Tᵢ = 1</Mate>,
                deci <Mate>det A = det U</Mate> — pe exemplul de mai sus, <Mate>1·(−2)·3 = −6</Mate>
                . Fiecare permutare de linii schimbă semnul, deci după pivotare se numără câte au
                fost.
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
                Metoda simplă are două feluri de a cădea. Unul e vizibil: dacă pivotul e{" "}
                <Mate>0</Mate>, raportul <Mate>µ</Mate> nu există. Al doilea e mai periculos,
                fiindcă nu se vede — un pivot foarte mic dă un <Mate>µ</Mate> uriaș, iar acesta
                amplifică erorile de rotunjire ale liniei pe care o scade.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\left(\\begin{array}{cc|c} 0{,}001 & 1 & 1 \\\\ 1 & 1 & 2 \\end{array}\\right) \\;\\xrightarrow{\\;\\mu = 1000\\;}\\; \\left(\\begin{array}{cc|c} 0{,}001 & 1 & 1 \\\\ 0 & -999 & -998 \\end{array}\\right)",
            sursa: "curs 4, §5.1",
            explicatie: (
              <>
                Într-o aritmetică cu trei zecimale, sistemul ăsta iese <Mate>x* = (2; 0,998)</Mate>,
                când soluția adevărată e <Mate>(1,001; 0,999)</Mate>: o eroare relativă de{" "}
                <strong>71 %</strong>, dintr-un sistem cu două ecuații și fără nimic patologic în
                el. Vinovatul e <Mate>µ = 1000</Mate>, adică împărțirea la <Mate>0,001</Mate>. Cu
                pivotarea parțială, liniile se schimbă între ele — <Mate>|1| &gt; |0,001|</Mate> —,
                iar aceeași aritmetică dă <Mate>(1,002; 0,998)</Mate>, cu o eroare de{" "}
                <strong>0,1 %</strong>.
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
                Se caută numai <strong>sub</strong> pivot, în coloana curentă, iar liniile deja
                terminate nu se mai ating. E singurul lucru adăugat față de eliminarea simplă, și
                costă o parcurgere de coloană per pas. Dacă cel mai mare element în modul e{" "}
                <Mate>0</Mate>, atunci toată coloana e nulă, iar matricea e singulară.
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
          {
            tip: "formula",
            latex:
              "\\left(\\begin{array}{cc|c} 1 & 10\\,000 & 10\\,000 \\\\ 1 & 0{,}0001 & 1 \\end{array}\\right)",
            sursa: "curs 4, §5.3",
            explicatie: (
              <>
                Cazul în care pivotarea parțială nu are ce alege: ambele elemente ale primei coloane
                sunt <Mate>1</Mate>, deci nu se permută nimic — și totuși prima ecuație are
                coeficienți de zece mii de ori mai mari, adică acel <Mate>1</Mate> e mic{" "}
                <strong>relativ la</strong> linia lui. Rapoartele scalate spun imediat ce trebuie
                făcut: <Mate>1/10 000</Mate> față de <Mate>1/1</Mate>, deci liniile se schimbă între
                ele. Asta e diferența dintre cele două metode — nu „mai multă siguranță", ci un caz
                pe care prima nu-l vede deloc.
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
                Permutarea de coloane se aplică <strong>la dreapta</strong>, și asta nu e un detaliu
                de scriere: înmulțirea la dreapta amestecă necunoscutele, nu ecuațiile. De aceea
                permutările de coloane se rețin, într-o matrice <Mate>PR</Mate> — la final,{" "}
                <Mate>x</Mate> iese în altă ordine decât cea în care a fost scris sistemul, iar fără
                evidența lor rezultatul nu se poate reașeza.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Dă cea mai bună stabilitate numerică dintre cele trei, dar se folosește rar: la
                fiecare pas trebuie parcursă toată submatricea rămasă, nu o singură coloană, iar
                câștigul nu acoperă costul. Ierarhia practică e deci alta decât cea a preciziei —
                parțiala e implicita, scalata se scoate când liniile au ordine de mărime diferite,
                iar totala rămâne pentru cazurile în care chiar contează fiecare cifră.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Ce rămâne, dacă rămâne un singur lucru: eliminarea gaussiană e{" "}
        <strong>o singură operație repetată</strong> — scade din fiecare linie de dedesubt linia
        pivotului, scalată cu <Mate>µ</Mate> —, iar cele trei pivotări nu schimbă operația, ci doar{" "}
        <strong>cine ajunge pivot</strong>. Nu e nevoie de forma eșalon redusă pentru a rezolva un
        sistem: e de ajuns să fie triunghiular, iar pașii în plus n-ar aduce decât erori de
        rotunjire în plus.
      </>
    ),
  },
};

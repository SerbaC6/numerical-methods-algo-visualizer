import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 15 — transformata Fourier rapidă (FFT).
 *
 * **Sursă: `cursuri_MN/cmmp_rationale_fft_teorie_curs10.md`, §8** — problema și
 * costul calculului direct, contextul istoric, coeficienții complecși, pasul de
 * înjumătățire, analiza complexității și structura recursivă. §1–§7 din același
 * curs (CMMP liniar și polinomial, spații prehilbertiene, Padé) țin de pagina
 * 14. Nimic scris din memorie.
 *
 * **Ce nu apare pe pagină, fiindcă nu apare în curs.** Lista e aici ca să nu se
 * „completeze" mai târziu din alte surse:
 *
 * - acronimele „DFT" / „TFD" — transformarea e numită doar FFT, respectiv
 *   algoritmul Cooley-Tukey;
 * - rădăcinile de ordinul n ale unității și notațiile `ωₙ` / `W_N`; factorii de
 *   fază apar exclusiv ca `e^{ikπj/m}`, `e^{ikπ/m}`, `e^{πij}`, iar singura
 *   identitate dată e `e^{nπi} = (−1)ⁿ`;
 * - „radix-2", „divide et impera", permutarea bit-reversal, forma matriceală;
 * - orice exemplu numeric rezolvat. Singurele cifre concrete din curs sunt
 *   numărătorile pe 8 puncte, transcrise ca atare la finalul paginii.
 *
 * „Butterfly" apare o singură dată în curs, ca nume al adunărilor și scăderilor
 * din recombinare — deci rămâne o mențiune, nu o secțiune cu schemă.
 *
 * **Verificat numeric, separat de aplicație**, pentru `m = 2, 4, 8, 16`, cu
 * `y` aleator:
 *
 * - `c_k + c_{k+m} = 2·Σ_{j=0}^{m−1} y_{2j}·e^{ikπj/(m/2)}` — eroare maximă
 *   `1,8·10⁻¹³`;
 * - `c_k − c_{k+m} = 2·e^{ikπ/m}·Σ_{j=0}^{m−1} y_{2j+1}·e^{ikπj/(m/2)}` — eroare
 *   maximă `1,6·10⁻¹³`;
 * - `a_k + i·b_k = [(−1)^k/m]·c_k`, cu `a_k`, `b_k` calculați din sumele de
 *   cosinus și sinus pe nodurile `x_j = −π + (j/m)π` — eroare maximă `6,1·10⁻¹⁵`;
 *   `b₀` și `b_m` ies 0, cum spune cursul;
 * - lanțul de complexitate, verificat simbolic: `m·m + m(m+1) = 2m² + m`,
 *   `2·[(m/2)² + (m/2)(m/2+1)] = m² + m`, iar `m²/2^{r−2} + m·r` dă `2m² + m` la
 *   `r = 1` și `m² + 2m` la `r = 2`. La `r = p+1` și `m = 2^p` se reduce la
 *   `2^p·(p+3) = 3m + m·log₂m`.
 *
 * Lanțul cursului e consistent peste tot, deci nu are intrare în
 * `docs/erata-cursuri.md`.
 */
export const continutFft: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Un set de <Mate>2m</Mate> puncte măsurate se poate aproxima cu o combinație de sinusuri și
        cosinusuri, iar coeficienții ei se obțin din niște sume peste toate punctele. Socoteala e
        directă și corectă, dar scumpă: fiecare coeficient costă cât tot setul de date, deci costul
        total crește cu <em>pătratul</em> numărului de puncte. La mii de puncte asta înseamnă
        milioane de operații — și, odată cu ele, o eroare de rotunjire pe măsură. FFT nu schimbă
        rezultatul, ci drumul până la el: rescrie sumele astfel încât fiecare pas să înjumătățească
        lungimea lor.
      </>
    ),

    metode: [
      {
        id: "cost-direct",
        titlu: "Cât costă calculul direct",
        esenta: (
          <>
            Sunt de aflat aproximativ <Mate>2m</Mate> coeficienți, iar fiecare e o sumă peste toate
            cele <Mate>2m</Mate> puncte.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "S_m(x) = a_0 + \\frac{a_m \\cos mx}{2} + \\sum_{k=1}^{m-1} \\left( a_k \\cos kx + b_k \\sin kx \\right)",
            sursa: "curs 10, §8",
            legenda: [
              { simbol: "Sₘ(x)", sens: <>funcția care aproximează punctele măsurate</> },
              {
                simbol: "aₖ, bₖ",
                sens: <>coeficienții de aflat, câte unul pentru fiecare frecvență</>,
              },
              {
                simbol: "m",
                sens: (
                  <>
                    jumătate din numărul de puncte; setul are <Mate>2m</Mate> puncte
                  </>
                ),
              },
            ],
            explicatie: (
              <>
                Fiecare termen din sumă e o oscilație de frecvență <Mate>k</Mate>, iar coeficienții{" "}
                <Mate>aₖ</Mate> și <Mate>bₖ</Mate> spun cât din ea intră în rezultat. Ce trebuie
                calculat sunt tocmai acești coeficienți.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              // Cele două sume stau una sub alta, nu una lângă alta: pe un rând
              // ieșeau din casetă și `b_k` se tăia la marginea din dreapta chiar
              // pe ecran lat, nu doar pe telefon.
              "\\begin{aligned} a_k &= \\frac{1}{m}\\sum_{j=0}^{2m-1} y_j \\cos(k x_j), && k = 0, 1, \\dots, m \\\\[6pt] b_k &= \\frac{1}{m}\\sum_{j=0}^{2m-1} y_j \\sin(k x_j), && k = 1, 2, \\dots, m-1 \\end{aligned}",
            sursa: "curs 10, §8",
            legenda: [
              {
                simbol: "yⱼ",
                sens: (
                  <>
                    valoarea măsurată în punctul <Mate>j</Mate>
                  </>
                ),
              },
              {
                simbol: "xⱼ",
                sens: (
                  <>
                    nodurile, echidistante: <Mate>xⱼ = −π + (j/m)·π</Mate>, cu{" "}
                    <Mate>j = 0, 1, …, 2m−1</Mate>
                  </>
                ),
              },
            ],
            explicatie: (
              <>
                Fiecare sumă are <Mate>2m</Mate> termeni, iar coeficienți sunt tot de ordinul{" "}
                <Mate>2m</Mate>: de aici <Mate>(2m)²</Mate> înmulțiri și tot atâtea adunări, adică
                aproximativ <Mate>4m²</Mate> operații. Nu doar că durează — cu atâtea operații se
                strânge și o eroare de rotunjire mare, exact acolo unde setul de date e mai bogat.
              </>
            ),
          },
        ],
      },
      {
        id: "coeficienti-complecsi",
        titlu: "Ocolul prin coeficienți complecși",
        esenta: (
          <>
            În loc să se calculeze <Mate>aₖ</Mate> și <Mate>bₖ</Mate> direct, se calculează un
            singur set de coeficienți complecși, din care cei doi se citesc printr-o înmulțire.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "c_k = \\sum_{j=0}^{2m-1} y_j\\, e^{i k \\pi j / m}, \\qquad k = 0, 1, \\dots, 2m-1",
            sursa: "curs 10, §8",
            legenda: [
              {
                simbol: "cₖ",
                sens: (
                  <>
                    coeficientul complex de rang <Mate>k</Mate>
                  </>
                ),
              },
              {
                simbol: "e^(ikπj/m)",
                sens: (
                  <>
                    factorul de fază; prin formula lui Euler, <Mate>e^(iz) = cos z + i·sin z</Mate>
                  </>
                ),
              },
            ],
            explicatie: (
              <>
                O singură sumă complexă ține locul perechii cosinus–sinus: partea reală și cea
                imaginară a exponențialei sunt chiar cele două funcții. Deocamdată nu s-a câștigat
                nimic — suma are tot <Mate>2m</Mate> termeni. Câștigul vine din <em>forma</em> ei,
                care se poate rupe în două.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "a_k + i\\,b_k = \\frac{(-1)^k}{m}\\, c_k",
            sursa: "curs 10, §8",
            legenda: [
              {
                simbol: "(−1)ᵏ",
                sens: (
                  <>
                    vine din <Mate>e^(nπi) = cos nπ + i·sin nπ = (−1)ⁿ</Mate>
                  </>
                ),
              },
              { simbol: "aₖ", sens: <>partea reală a produsului din dreapta</> },
              { simbol: "bₖ", sens: <>partea imaginară a aceluiași produs</> },
            ],
            explicatie: (
              <>
                Odată aflați <Mate>cₖ</Mate>, coeficienții căutați ies dintr-o singură înmulțire:{" "}
                <Mate>aₖ</Mate> e partea reală, <Mate>bₖ</Mate> cea imaginară. Nu toți contează —{" "}
                <Mate>b₀</Mate> și <Mate>bₘ</Mate> sunt nuli și nu intră în rezultatul final.
              </>
            ),
          },
        ],
      },
      {
        id: "injumatatire",
        titlu: "Pasul de înjumătățire",
        esenta: (
          <>
            Adunând doi coeficienți aflați la distanță <Mate>m</Mate> unul de altul, jumătate din
            termeni se anulează singuri.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\begin{aligned} c_k + c_{k+m} &= \\sum_{j=0}^{2m-1} y_j\\, e^{i k \\pi j / m}\\left(1 + e^{\\pi i j}\\right) \\\\[6pt] 1 + e^{\\pi i j} &= \\begin{cases} 2, & j \\text{ par} \\\\ 0, & j \\text{ impar} \\end{cases} \\end{aligned}",
            sursa: "curs 10, §8",
            legenda: [
              {
                simbol: "m = 2^p",
                sens: (
                  <>
                    se presupune că <Mate>m</Mate> e putere a lui 2
                  </>
                ),
              },
              {
                simbol: "k",
                sens: (
                  <>
                    indicele, luat acum doar până la <Mate>m−1</Mate>
                  </>
                ),
              },
              { simbol: "1 + e^(πij)", sens: <>factorul care stinge termenii de indice impar</> },
            ],
            explicatie: (
              <>
                Cei doi coeficienți diferă doar prin factorul <Mate>e^(πij)</Mate>, care e{" "}
                <Mate>+1</Mate> pentru <Mate>j</Mate> par și <Mate>−1</Mate> pentru <Mate>j</Mate>{" "}
                impar. Adunându-i, termenii de indice impar se anulează: rămân doar <Mate>m</Mate>{" "}
                termeni, deci <Mate>m</Mate> adunări în loc de <Mate>2m</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{aligned} c_k + c_{k+m} &= 2 \\sum_{j=0}^{m-1} y_{2j}\\, e^{i k \\pi j / (m/2)} \\\\[6pt] c_k - c_{k+m} &= 2\\, e^{i k \\pi / m} \\sum_{j=0}^{m-1} y_{2j+1}\\, e^{i k \\pi j / (m/2)} \\end{aligned}",
            sursa: "curs 10, §8",
            legenda: [
              { simbol: "y₂ⱼ", sens: <>valorile din punctele de indice par</> },
              { simbol: "y₂ⱼ₊₁", sens: <>valorile din punctele de indice impar</> },
              {
                simbol: "e^(ikπ/m)",
                sens: <>factorul care decalează suma impară față de cea pară</>,
              },
            ],
            explicatie: (
              <>
                Aceeași manevră, făcută cu scăderea în loc de adunare, stinge termenii de indice par
                și îi lasă pe cei impari. Rezultatul: două sume de câte <Mate>m</Mate> termeni, una
                peste punctele de indice par și una peste cele de indice impar — fiecare având{" "}
                <em>exact aceeași formă</em> ca cea de la care s-a pornit, dar pe jumătate de set.
                Din suma și diferența lor se recuperează atât <Mate>cₖ</Mate>, cât și{" "}
                <Mate>c₍ₖ₊ₘ₎</Mate>, adică toți cei <Mate>2m</Mate> coeficienți.
              </>
            ),
          },
        ],
      },
      {
        id: "complexitate",
        // Titlul nu trece prin `Notatie` (e un `h3` simplu), deci nu poate purta
        // `₂`: din indici, fonturile proiectului au doar `¹ ² ³`, fiindcă sunt în
        // Latin-1. Cursul scrie oricum „O(m log m)" în text.
        titlu: "De la 4m² la O(m·log m)",
        esenta: (
          <>
            Pasul se repetă pe fiecare jumătate, iar fiindcă <Mate>m</Mate> e putere a lui 2, se
            poate repeta până când sumele nu mai au ce înjumătăți.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "m \\cdot m + m(m+1) = 2m^2 + m \\;\\longrightarrow\\; m^2 + 2m \\;\\longrightarrow\\; \\dots \\;\\longrightarrow\\; \\frac{m^2}{2^{\\,r-2}} + m\\,r",
            sursa: "curs 10, §8",
            legenda: [
              { simbol: "r", sens: <>de câte ori s-a aplicat pasul de înjumătățire</> },
              {
                simbol: "m²/2^(r−2)",
                sens: <>partea pătratică, tot mai mică la fiecare repetare</>,
              },
              {
                simbol: "m·r",
                sens: (
                  <>
                    prețul plătit pentru cele <Mate>r</Mate> recombinări
                  </>
                ),
              },
            ],
            explicatie: (
              <>
                Prima aplicare coboară deja de la <Mate>4m²</Mate> la <Mate>2m² + m</Mate>. Fiecare
                repetare taie în două partea pătratică și adaugă în schimb doar <Mate>m</Mate>{" "}
                operații — un schimb tot mai avantajos, cu cât se merge mai departe.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{aligned} r = p + 1 \\;\\Longrightarrow\\;& \\frac{(2^p)^2}{2^{\\,p-1}} + m(p+1) \\\\[6pt] =\\;& 2m + pm + m \\;=\\; 3m + m \\log_2 m \\;=\\; O(m \\log_2 m) \\end{aligned}",
            sursa: "curs 10, §8",
            legenda: [
              {
                simbol: "p",
                sens: (
                  <>
                    exponentul din <Mate>m = 2^p</Mate>, adică <Mate>log₂m</Mate>
                  </>
                ),
              },
              { simbol: "r = p + 1", sens: <>numărul de repetări după care procesul se încheie</> },
            ],
            explicatie: (
              <>
                Procesul nu se poate repeta la nesfârșit: se oprește după <Mate>p + 1</Mate> pași,
                când sumele au ajuns la un singur termen. Partea pătratică s-a topit la{" "}
                <Mate>2m</Mate>, iar ce rămâne crește aproape liniar. Pentru un set de ordinul
                miilor, asta înseamnă mii de operații în loc de milioane.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Cum se calculează, de fapt.</strong> Ordinea se inversează: se pornește de
                la ultimul nivel, unde valorile sunt simple înmulțiri ale lui <Mate>yⱼ</Mate> cu
                factori de fază, și se recombină nivel cu nivel, prin adunări și scăderi de tip
                „butterfly", până se ajunge la <Mate>cₖ</Mate>. Constantele intermediare depind doar
                de <Mate>m</Mate>, nu de punctele măsurate — pentru fiecare <Mate>m</Mate> există un
                singur set, care se poate calcula o dată și refolosi.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Cât se câștigă, concret.</strong> Pentru <Mate>2m = 8</Mate> puncte,
                calculul direct al coeficienților <Mate>c₀, …, c₇</Mate> cere{" "}
                <strong>64 de înmulțiri sau împărțiri și 56 de adunări sau scăderi</strong>, în timp
                ce FFT cere doar <strong>24 și 24</strong>. Iar distanța dintre cele două se mărește
                cu fiecare punct adăugat.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Ideea care ține tot algoritmul încape într-o propoziție: doi coeficienți aflați la distanță{" "}
        <Mate>m</Mate> unul de altul diferă doar printr-un semn care alternează cu paritatea
        indicelui, așa că suma lor stinge termenii impari, iar diferența lor pe cei pari. Fiecare
        dintre cele două bucăți rămase e o problemă de aceeași formă, pe jumătate de set — și de
        aceea pasul se poate repeta până la capăt. Nimic din rezultat nu se schimbă: se schimbă doar
        ordinea în care se adună aceleași produse. Publicat de Cooley și Tukey în 1965, procedeul e
        numit de Gilbert Strang „cel mai important algoritm numeric al vieții noastre".
      </>
    ),
  },
};

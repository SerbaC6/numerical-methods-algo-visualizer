import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 18 — ecuații diferențiale cu condiții inițiale.
 *
 * **Sursă: `cursuri_MN/ode-runge-kutta_curs13.md`**, în ordinea din curs:
 * problema Cauchy, condiția Lipschitz și teorema de existență și unicitate,
 * problemele bine puse, metoda lui Euler, metodele Taylor, cadrul Runge-Kutta
 * (ordin și rang), metodele particulare de ordin 2 și RK de ordin 4. Nimic
 * scris din memorie.
 *
 * Metodele multipas (Adams-Bashforth, Adams-Moulton) sunt în curs, dar **nu**
 * pe pagină: scoase la cerere. Pagina se închide cu RK4, adică exact acolo unde
 * se închide și clipul.
 *
 * Accentul cerut pentru pagină: Euler și RK4 pe larg, restul în revistă, cu
 * maximum esențialul despre fiecare.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/ecuatii-diferentiale.ts`, pe modulele reale):
 * soluția analitică a exemplului chiar rezolvă ecuația; forma cu sonde din
 * `src/algorithms/` dă înapoi, pas cu pas, formulele tipărite aici; ordinele
 * ies măsurate (≈1 la Euler, ≈2 la cele de ordin 2, ≈4 la RK4), nu enunțate.
 */
export const continutEcuatiiDiferentiale: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Un model ajunge rareori la formula mărimii căutate; ajunge la <em>ritmul</em> ei de
        schimbare. Ecuația <Mate>y′ = f(t, y)</Mate> spune ce pantă are soluția în fiecare punct al
        planului, iar de găsit e funcția însăși.
      </>
    ),

    metode: [
      {
        id: "cauchy",
        titlu: "Problema Cauchy: o pantă peste tot, un punct de pornire",
        esenta: (
          <>
            Ecuația singură are o familie întreagă de soluții; condiția inițială alege una dintre
            ele.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "\\frac{dy}{dt} = f(t,y), \\quad a \\le t \\le b, \\qquad y(a) = \\alpha",
            sursa: "curs 13, §„Problema Cauchy”",
            legenda: [
              {
                simbol: "f(t, y)",
                sens: <>panta cerută soluției în punctul (t, y)</>,
              },
              { simbol: "α", sens: <>valoarea cunoscută în capătul din stânga</> },
              { simbol: "[a, b]", sens: <>intervalul pe care se caută soluția</> },
            ],
            explicatie: (
              <>
                Prin fiecare punct al planului trece exact o curbă care respectă pantele; punctul{" "}
                <Mate>(a, α)</Mate> spune pe care dintre ele se merge.
              </>
            ),
          },
        ],
      },

      {
        id: "lipschitz",
        titlu: "Când există soluție și când e una singură",
        esenta: (
          <>
            Ajunge ca panta să nu se schimbe prea brusc de la o înălțime la alta — asta cere
            condiția Lipschitz.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "|f(t,y_1) - f(t,y_2)| \\le L\\,|y_1 - y_2|",
            sursa: "curs 13, §„Condiția Lipschitz”",
            legenda: [
              { simbol: "L", sens: <>constanta Lipschitz, aceeași pe toată mulțimea</> },
              { simbol: "y₁, y₂", sens: <>două înălțimi, la același moment t</> },
            ],
            explicatie: (
              <>
                Cu <Mate>f</Mate> continuă și condiția asta îndeplinită, problema are o soluție și
                are una singură.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "\\left|\\frac{\\partial f}{\\partial y}(t,y)\\right| \\le L",
            sursa: "curs 13, §„Criteriu practic”",
            subtitlu: "Criteriul practic, pe o mulțime convexă",
            legenda: [{ simbol: "∂f/∂y", sens: <>cât de repede se schimbă panta cu înălțimea</> }],
            explicatie: <>Se verifică derivând o singură dată, nu căutând constanta cu mâna.</>,
          },
          {
            tip: "text",
            continut: (
              <>
                În aceleași condiții problema e și <strong>bine pusă</strong>: dacă datele se
                schimbă cu puțin, soluția se schimbă tot cu puțin. Fără asta, o metodă numerică n-ar
                avea ce aproxima — erorile ei de rotunjire sunt exact niște date schimbate cu puțin.
              </>
            ),
          },
        ],
      },

      {
        id: "euler",
        titlu: "Metoda lui Euler",
        esenta: (
          <>
            Din punctul cunoscut se merge pe tangentă cât ține pasul, iar de acolo se ia panta din
            nou.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "y(t_{i+1}) = y(t_i) + h\\,f(t_i, y(t_i)) + \\frac{h^2}{2}y''(\\xi_i), \\qquad t_i = a + ih",
            sursa: "curs 13, §„Metoda lui Euler”, dezvoltarea Taylor",
            legenda: [
              { simbol: "h", sens: <>pasul rețelei, distanța dintre două momente vecine</> },
              { simbol: "ξᵢ", sens: <>un punct din pas, necunoscut, dar existent</> },
              { simbol: "(h²/2)·y″(ξᵢ)", sens: <>restul, singurul termen care se aruncă</> },
            ],
            explicatie: (
              <>
                Egalitatea e exactă. Metoda apare tăind ultimul termen, deci eroarea făcută la un
                pas e chiar el.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "w_0 = \\alpha, \\qquad w_{i+1} = w_i + h\\,f(t_i, w_i)",
            sursa: "curs 13, §„Metoda lui Euler”",
            legenda: [
              { simbol: "wᵢ", sens: <>aproximarea soluției în momentul tᵢ</> },
              { simbol: "h·f(tᵢ, wᵢ)", sens: <>cât se urcă mergând pe tangentă un pas întreg</> },
            ],
            explicatie: (
              <>
                Soluția se află doar în punctele rețelei; între ele se interpolează. Eroarea globală
                merge ca <Mate>h</Mate>: pas la jumătate, eroare la jumătate.
              </>
            ),
          },
          {
            tip: "callout",
            titlu: "De aici pornește tot ce urmează",
            continut: (
              <>
                Un pas cere un singur lucru: valoarea lui <Mate>f</Mate> în punctul în care ești
                deja. Metodele următoare cumpără precizie cerând mai multe pante în interiorul
                aceluiași pas.
              </>
            ),
          },
        ],
      },

      {
        id: "taylor",
        titlu: "Metode Taylor",
        esenta: <>Se păstrează mai mulți termeni din dezvoltare, nu doar primul.</>,
        blocuri: [
          {
            tip: "formula",
            latex:
              "w_{i+1} = w_i + hT^{(n)}(t_i, w_i), \\qquad T^{(n)}(t_i,w_i) = f(t_i,w_i) + \\frac{h}{2}f'(t_i,w_i) + \\cdots + \\frac{h^{n-1}}{n!}f^{(n-1)}(t_i,w_i)",
            sursa: "curs 13, §„Metode Taylor”",
            legenda: [
              { simbol: "T⁽ⁿ⁾", sens: <>panta corectată cu derivatele lui f</> },
              { simbol: "f′, f″, …", sens: <>derivatele totale ale lui f în lungul soluției</> },
            ],
            explicatie: (
              <>
                Ordinul crește cu <Mate>n</Mate>, dar derivatele lui <Mate>f</Mate> trebuie scoase
                de mână, altele pentru fiecare ecuație.
              </>
            ),
          },
        ],
      },

      {
        id: "runge-kutta-2",
        titlu: "Runge-Kutta de ordin 2",
        esenta: (
          <>
            Aceeași precizie ca la Taylor, fără nicio derivată: panta se cere în încă un punct din
            interiorul pasului.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "w_{i+1} = w_i + h\\,f\\!\\left(t_i + \\frac{h}{2},\\ w_i + \\frac{h}{2}f(t_i,w_i)\\right)",
            sursa: "curs 13, §„Metoda punctului de mijloc”",
            subtitlu: "Punctul de mijloc",
            legenda: [
              {
                simbol: "wᵢ + (h/2)·f(tᵢ, wᵢ)",
                sens: <>unde ajunge un pas de probă, până la mijloc</>,
              },
            ],
            explicatie: (
              <>
                Pasul de probă e aruncat: din el se reține doar panta găsită la mijloc, cu care se
                face pasul întreg.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "w_{i+1} = w_i + \\frac{h}{2}\\left[f(t_i,w_i) + f\\big(t_{i+1},\\ w_i + hf(t_i,w_i)\\big)\\right]",
            sursa: "curs 13, §„Metoda Euler modificată”",
            subtitlu: "Euler modificat",
            legenda: [
              { simbol: "f(tᵢ, wᵢ)", sens: <>panta de la începutul pasului</> },
              { simbol: "f(tᵢ₊₁, …)", sens: <>panta din capătul unde ar ajunge Euler</> },
            ],
            explicatie: <>Se pășește cu media celor două pante, nu cu prima dintre ele.</>,
          },
          {
            tip: "text",
            continut: (
              <>
                Amândouă ies din aceeași schemă de rang 2, prin alegerea punctului intermediar:{" "}
                <Mate>u₁ = ½</Mate> dă punctul de mijloc, <Mate>u₁ = 1</Mate> dă Euler modificat,
                iar <Mate>u₁ = ⅔</Mate> metoda Heun. La ordinul 3, forma cunoscută cere două pante
                încuibate.
              </>
            ),
          },
        ],
      },

      {
        id: "rk4",
        titlu: "Runge-Kutta de ordin 4",
        esenta: (
          <>
            Patru pante pe pas — una la început, două la mijloc, una la capăt — și media lor
            cântărită.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "w_{i+1} = w_i + \\frac{1}{6}\\left(k_1 + 2k_2 + 2k_3 + k_4\\right)",
            sursa: "curs 13, §„RK de ordin 4”",
            legenda: [
              { simbol: "k₁ … k₄", sens: <>cele patru pante încercate pe pas</> },
              {
                simbol: "1, 2, 2, 1",
                sens: <>ponderile: mijlocul cântărește dublu față de capete</>,
              },
            ],
            explicatie: (
              <>
                Patru evaluări pe pas cumpără ordinul 4: la înjumătățirea pasului eroarea scade de
                circa șaisprezece ori, nu de două. De aceea e varianta folosită în mod obișnuit.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\begin{aligned} k_1 &= hf(t_i, w_i) & k_2 &= hf\\!\\left(t_i + \\tfrac{h}{2},\\ w_i + \\tfrac{1}{2}k_1\\right) \\\\ k_3 &= hf\\!\\left(t_i + \\tfrac{h}{2},\\ w_i + \\tfrac{1}{2}k_2\\right) & k_4 &= hf(t_{i+1},\\ w_i + k_3) \\end{aligned}",
            sursa: "curs 13, §„RK de ordin 4”",
            legenda: [
              { simbol: "k₁", sens: <>pasul luat cu panta din capătul din stânga</> },
              { simbol: "k₂, k₃", sens: <>două încercări la mijlocul pasului, a doua corectată</> },
              { simbol: "k₄", sens: <>panta din capătul unde duce k₃</> },
            ],
            explicatie: (
              <>
                Fiecare sondă pornește din <Mate>wᵢ</Mate> și folosește ce a aflat cea dinainte;
                niciuna nu e pasul adevărat.
              </>
            ),
          },
        ],
      },
    ],
  },
};

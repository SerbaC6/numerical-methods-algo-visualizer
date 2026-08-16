import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 17 — cuadraturi adaptive și cuadraturi Gaussiene.
 *
 * **Sursă: `cursuri_MN/romberg-cuadraturi-gaussiene_curs12.md`**, §„Cuadraturi
 * adaptive" și §„Cuadraturi Gaussiene": estimarea erorii din două aplicări ale
 * lui Simpson, factorul 1/15 și testul cu `15ε`; apoi gradul de valabilitate
 * `2n − 1`, condiția de ortogonalitate, polinoamele Legendre monice,
 * coeficienții din integrala Lagrange, schimbarea de interval și familiile
 * uzuale. Nimic scris din memorie.
 *
 * Extrapolarea Richardson și metoda Romberg, care stau în același curs, **nu**
 * sunt pe pagină: au ieșit din listă la trecerea de la 20 la 18 pagini.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/cuadraturi.ts`, pe modulele reale): nodurile
 * Gaussiene ies rădăcinile polinoamelor de mai jos, la `10⁻¹²`; gradul de
 * exactitate măsurat pe monoame e `2n − 1`, iar formula chiar greșește pe
 * primul monom de peste; ponderile ies din integrala Lagrange, iar cu noduri
 * echidistante aceeași construcție dă trapezele și Simpson; adaptivul respectă
 * toleranța pe funcțiile cu derivata a patra mărginită — și **nu** o respectă pe
 * `√x`, exact cum spune callout-ul.
 */
export const continutCuadraturi: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Formulele cu noduri echidistante tratează tot intervalul la fel și pun punctele unde
        nimerește rețeaua. Se poate mai bine în două feluri: împărțind intervalul numai acolo unde e
        nevoie, sau alegând nodurile în loc să le moștenești.
      </>
    ),

    metode: [
      {
        id: "adaptive",
        titlu: "Cuadraturi adaptive",
        esenta: (
          <>
            Metoda își măsoară singură eroarea pe fiecare bucată și taie mai departe doar bucățile
            care n-au trecut testul.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\int_a^b f(x)\\,dx = S(a,b) - \\frac{h^5}{90}f^{(4)}(\\xi), \\qquad S(a,b) = \\frac{h}{3}\\left[f(a) + 4f(a+h) + f(b)\\right]",
            sursa: "curs 12, §„Cuadraturi adaptive”",
            legenda: [
              { simbol: "S(a, b)", sens: <>Simpson aplicat o dată, pe tot intervalul</> },
              {
                simbol: "h",
                sens: <>jumătate din interval, (b − a)/2, fiindcă nodurile sunt trei</>,
              },
              { simbol: "ξ", sens: <>un punct din interval, necunoscut, dar existent</> },
            ],
            explicatie: (
              <>
                Termenul de eroare conține <Mate>f⁽⁴⁾</Mate>, pe care nu-l știm. Ideea metodei e
                să-l scoatem din calcul, nu să-l calculăm.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\left|\\int_a^b f(x)\\,dx - S\\!\\left(a,\\tfrac{a+b}{2}\\right) - S\\!\\left(\\tfrac{a+b}{2},b\\right)\\right| \\approx \\frac{1}{15}\\left|S(a,b) - S\\!\\left(a,\\tfrac{a+b}{2}\\right) - S\\!\\left(\\tfrac{a+b}{2},b\\right)\\right|",
            sursa: "curs 12, §„Cuadraturi adaptive”, estimarea erorii",
            subtitlu: "Eroarea, estimată din două aplicări",
            legenda: [
              {
                simbol: "S(a, (a+b)/2)",
                sens: <>Simpson pe jumătatea din stânga; la fel, cealaltă pe dreapta</>,
              },
              { simbol: "1/15", sens: <>cât de mult mai bună e varianta cu două panouri</> },
            ],
            explicatie: (
              <>
                Diferența dintre cele două socoteli nu se aruncă: ea e chiar măsura erorii, la un
                factor cunoscut.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\left|S(a,b) - S\\!\\left(a,\\tfrac{a+b}{2}\\right) - S\\!\\left(\\tfrac{a+b}{2},b\\right)\\right| < 15\\varepsilon",
            sursa: "curs 12, §„Cuadraturi adaptive”, algoritmul",
            subtitlu: "Testul care decide dacă bucata se mai taie",
            legenda: [
              { simbol: "ε", sens: <>eroarea admisă pe bucata cercetată</> },
              { simbol: "15ε", sens: <>pragul, din factorul de mai sus</> },
            ],
            explicatie: (
              <>
                Dacă testul pică, intervalul se taie la mijloc, iar fiecare jumătate primește
                <Mate> ε/2</Mate> — așa, erorile adunate rămân sub <Mate>ε</Mate>.
              </>
            ),
          },
          {
            tip: "callout",
            titlu: "Estimarea e o presupunere, nu o garanție",
            continut: (
              <>
                Toată socoteala ține pentru că <Mate>f⁽⁴⁾</Mate> se schimbă puțin de la un capăt la
                altul al bucății. Unde nu e așa, metoda se oprește prea devreme: pe <Mate>√x</Mate>,
                cu derivata a patra nemărginită în zero, eroarea ajunge de câteva ori mai mare decât
                toleranța cerută.
              </>
            ),
          },
        ],
      },

      {
        id: "gaussiene",
        titlu: "Cuadraturi Gaussiene",
        esenta: (
          <>
            Nodurile nu mai sunt moștenite de la o rețea: se aleg, iar din asta ies două ordine de
            exactitate în plus, pe gratis.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "\\int_a^b f(x)\\,dx \\approx \\sum_{i=1}^{n} c_i f(x_i)",
            sursa: "curs 12, §„Cuadraturi Gaussiene”, motivația",
            legenda: [
              { simbol: "xᵢ", sens: <>nodurile, acum necunoscute și ele</> },
              { simbol: "cᵢ", sens: <>ponderile</> },
              { simbol: "n", sens: <>câte evaluări ale funcției se plătesc</> },
            ],
            explicatie: (
              <>
                Sunt <Mate>2n</Mate> necunoscute, nu <Mate>n</Mate>: de aceea formula poate fi
                exactă până la gradul <Mate>2n − 1</Mate>, nu doar până la <Mate>n</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\int_a^b \\pi(x)\\,w(x)\\,x^k\\,dx = 0, \\qquad \\pi(x) = \\prod_{i=0}^{N}(x - x_i), \\quad k = 0 : n-1",
            sursa: "curs 12, §„Determinarea nodurilor prin ortogonalitate”",
            subtitlu: "De unde ies nodurile",
            legenda: [
              { simbol: "π(x)", sens: <>polinomul care are exact nodurile ca rădăcini</> },
              { simbol: "w(x)", sens: <>funcția pondere, dată odată cu intervalul</> },
            ],
            explicatie: (
              <>
                Nodurile nu se caută prin încercări: sunt rădăcinile polinomului ortogonal pe
                intervalul și ponderea date.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "P_0 = 1,\\quad P_1 = x,\\quad P_2 = x^2 - \\tfrac{1}{3},\\quad P_3 = x^3 - \\tfrac{3}{5}x,\\quad P_4 = x^4 - \\tfrac{6}{7}x^2 + \\tfrac{3}{35}",
            sursa: "curs 12, §„Rezultatul bazat pe polinoamele Legendre monice”",
            subtitlu: "Polinoamele Legendre monice",
            legenda: [{ simbol: "Pₙ", sens: <>polinomul ale cărui rădăcini dau cele n noduri</> }],
            explicatie: (
              <>
                Pe <Mate>[−1, 1]</Mate> cu ponderea <Mate>1</Mate>, acestea sunt polinoamele
                ortogonale; rădăcinile lui <Mate>P₂</Mate> sunt <Mate>±1/√3</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "c_i = \\int_{-1}^{1}\\prod_{\\substack{j=1 \\\\ j \\neq i}}^{n}\\frac{x - x_j}{x_i - x_j}\\,dx",
            sursa: "curs 12, §„Rezultatul bazat pe polinoamele Legendre monice”",
            subtitlu: "Ponderile, odată ce nodurile se știu",
            legenda: [
              {
                simbol: "∏ (x − xⱼ)/(xᵢ − xⱼ)",
                sens: <>multiplicatorul Lagrange al nodului i</>,
              },
            ],
            explicatie: (
              <>
                Aceeași integrală dă și ponderile Newton-Cotes; ce le deosebește sunt doar nodurile
                puse în ea.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\int_a^b f(x)\\,dx = \\int_{-1}^{1} f\\!\\left(\\frac{(b-a)t + (b+a)}{2}\\right)\\frac{b-a}{2}\\,dt",
            sursa: "curs 12, §„Schimbarea intervalului”",
            subtitlu: "Schimbarea de interval",
            legenda: [
              { simbol: "t", sens: <>variabila de pe intervalul standard [−1, 1]</> },
              { simbol: "(b − a)/2", sens: <>factorul care apare la schimbarea variabilei</> },
            ],
            explicatie: (
              <>
                Tabelul de noduri se calculează o singură dată, pe <Mate>[−1, 1]</Mate>, și se mută
                pe orice interval.
              </>
            ),
          },
        ],
      },

      {
        id: "familii",
        titlu: "Alte ponderi, alte familii",
        esenta: (
          <>
            Schimbând funcția pondere se schimbă polinomul ortogonal, deci și nodurile — inclusiv pe
            intervale nemărginite.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\int_{-1}^{1}\\frac{f(x)}{\\sqrt{1-x^2}}\\,dx = \\frac{\\pi}{N}\\sum_{i=0}^{N-1} f\\!\\left(\\cos\\frac{(2i+1)\\pi}{2N}\\right)",
            sursa: "curs 12, §„Formule pentru polinoamele ortogonale uzuale”, Cebâșev",
            subtitlu: "Cebâșev",
            legenda: [
              { simbol: "1/√(1 − x²)", sens: <>ponderea, care crește spre capete</> },
              { simbol: "π/N", sens: <>toate nodurile au aceeași pondere</> },
            ],
            explicatie: (
              <>Singura familie cu noduri și ponderi scrise direct, fără rădăcini de căutat.</>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Cu ponderea <Mate>e⁻ˣ</Mate> pe <Mate>[0, ∞)</Mate> se ajunge la Laguerre, cu{" "}
                <Mate>e⁻ˣ²</Mate> la Hermite, iar formula Gauss-Radau ia ca noduri zerourile lui{" "}
                <Mate>Tₙ₊₁ − Tₙ</Mate>. Se integrează astfel și pe intervale nemărginite, unde o
                rețea de noduri echidistante nici n-ar exista.
              </>
            ),
          },
        ],
      },
    ],
  },
};

import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 16 — derivare numerică.
 *
 * **Sursă: `cursuri_MN/derivare-integrare-numerica_curs11.md`**, partea de
 * derivare: formula two-point, formula generală cu `n+1` puncte, cele două
 * formule cu 3 puncte, derivata a doua în punct de mijloc și observația despre
 * eroarea de rotunjire. Partea de integrare (Newton-Cotes) e pagina 17.
 * Nimic scris din memorie.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/derivare-numerica.ts`, pe modulele reale):
 *
 * - fiecare formulă are `Σcₖ = 0` și e **exactă** pe polinoamele de grad ≤ ordinul
 *   ei — cel mai direct test al ordinului;
 * - ordinul erorii e **măsurat ca pantă** pe log-log, nu enunțat: iese `1,0045`
 *   și `0,9953` la cele două puncte, `2,0000` și `1,9949` la cele cu trei;
 * - formula înapoi e chiar cea înainte cu `h` schimbat de semn, la `0` diferență;
 * - capcana: pe `sin` în `x₀ = 0,6`, formula înainte are eroarea minimă
 *   `7,6·10⁻⁹` la `h ≈ 1,2·10⁻⁸`, iar la `h = 10⁻¹⁴` eroarea urcă la `3,8·10⁻³` —
 *   **de aproape șase ordine de mărime mai rea**. La punctul de mijloc:
 *   `4,9·10⁻¹²` la `h ≈ 5,6·10⁻⁶`;
 * - `h` optim teoretic (`√(2ε)` și `(3ε)^(1/3)`, cu `M = 1`) cade în același
 *   ordin de mărime cu cel măsurat.
 */
export const continutDerivareNumerica: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Derivata e definită ca o limită, iar un calculator nu poate lua limite: poate doar să se
        oprească la un <Mate>h</Mate> destul de mic.
      </>
    ),

    metode: [
      {
        id: "doua-puncte",
        titlu: "Două puncte: panta secantei",
        esenta: (
          <>
            Se ia definiția derivatei și se oprește limita la un <Mate>h</Mate> concret. Geometric:
            panta tangentei se înlocuiește cu panta secantei.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0+h) - f(x_0)}{h}",
            sursa: "curs 11, derivare numerică",
            legenda: [
              { simbol: "x₀", sens: <>punctul în care vrem derivata</> },
              { simbol: "h", sens: <>pasul: cât de departe se ia al doilea punct</> },
            ],
            explicatie: (
              <>
                Definiția însăși sugerează metoda: dacă raportul tinde la derivată, atunci pentru un{" "}
                <Mate>h</Mate> mic el ar trebui să fie aproape de ea.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "f'(x_0) = \\frac{f(x_0+h) - f(x_0)}{h} - \\frac{h}{2}f''(\\xi), \\qquad \\xi \\in [x_0,\\, x_0+h]",
            sursa: "curs 11, formula two-point",
            legenda: [
              {
                simbol: "−(h/2)·f″(ξ)",
                sens: <>eroarea de trunchiere: cât se pierde tăind limita</>,
              },
              { simbol: "ξ", sens: <>un punct din interval, necunoscut, dar existent</> },
            ],
            explicatie: (
              <>
                Egalitatea e <em>exactă</em>: nu o aproximare cu „≈", ci formula plus termenul ei de
                eroare, scos din polinomul de interpolare prin cele două puncte.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Formula se numește <strong>derivare înainte</strong> pentru <Mate>h &gt; 0</Mate> și{" "}
                <strong>derivare înapoi</strong> pentru <Mate>h &lt; 0</Mate> — deci nu sunt două
                formule, ci una singură cu semnul schimbat. Eroarea scade proporțional cu{" "}
                <Mate>h</Mate>: înjumătățești pasul, înjumătățești eroarea.
              </>
            ),
          },
        ],
      },
      {
        id: "trei-puncte",
        titlu: "Trei puncte: ordinul doi",
        esenta: (
          <>
            Cu încă un punct, eroarea trece de la <Mate>h</Mate> la <Mate>h²</Mate> — iar asta
            schimbă totul, fiindcă acum înjumătățirea pasului împarte eroarea la patru.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "f'(x_j) = \\sum_{k=0}^{n} f(x_k)L_k'(x_j) + \\frac{f^{(n+1)}(\\xi(x_j))}{(n+1)!}\\prod_{k \\neq j}(x_j - x_k)",
            sursa: "curs 11, formula cu n+1 puncte",
            legenda: [
              { simbol: "Lₖ", sens: <>polinoamele de bază Lagrange, derivate</> },
              { simbol: "n + 1", sens: <>câte puncte intră în formulă</> },
            ],
            explicatie: (
              <>
                Rețeta generală: se interpolează prin <Mate>n + 1</Mate> puncte, se derivează
                polinomul și se evaluează într-un nod. Evaluarea într-un nod e importantă — acolo
                produsul se anulează și ultimul termen dispare, deci eroarea rămâne scrisă curat.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "f'(x_0) = \\frac{1}{2h}\\left[f(x_0+h) - f(x_0-h)\\right] - \\frac{h^2}{6}f'''(\\xi), \\qquad \\xi \\in [x_0-h,\\, x_0+h]",
            sursa: "curs 11, three-point midpoint",
            subtitlu: "Punct de mijloc",
            legenda: [
              {
                simbol: "x₀ ± h",
                sens: <>cei doi vecini, la aceeași distanță de o parte și de alta</>,
              },
              { simbol: "h²/6", sens: <>eroarea scade acum pătratic</> },
            ],
            explicatie: (
              <>
                <strong>
                  Valoarea din <Mate>x₀</Mate> nici nu apare.
                </strong>{" "}
                Formula folosește doar cei doi vecini, simetric — și tocmai simetria e cea care
                anulează termenul de ordinul <Mate>h</Mate>. E formula recomandată pentru un punct
                din <em>interiorul</em> intervalului.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "f'(x_0) = \\frac{1}{2h}\\left[-3f(x_0) + 4f(x_0+h) - f(x_0+2h)\\right] + \\frac{h^2}{3}f'''(\\xi)",
            sursa: "curs 11, three-point endpoint",
            subtitlu: "Punct final",
            legenda: [
              { simbol: "x₀ + 2h", sens: <>al doilea vecin, luat tot spre dreapta</> },
              { simbol: "h²/3", sens: <>de două ori eroarea punctului de mijloc</> },
            ],
            explicatie: (
              <>
                Fără vecin la stânga, ambele puncte se iau la dreapta. Prețul e în constantă:{" "}
                <Mate>h²/3</Mate> în loc de <Mate>h²/6</Mate>, adică dublul erorii la același pas.
              </>
            ),
          },
        ],
      },
    ],
  },
};

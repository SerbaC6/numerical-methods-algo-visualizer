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
        oprească la un <Mate>h</Mate> destul de mic. Toată pagina e despre ce înseamnă „destul de
        mic" — fiindcă, spre deosebire de ce ne-am aștepta,{" "}
        <strong>mai mic nu înseamnă mai bun</strong>.
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
                Egalitatea e <em>exactă</em>: nu e o aproximare cu „≈", ci formula plus un termen de
                eroare. El se obține derivând polinomul de interpolare de grad 1 prin cele două
                puncte și evaluând în <Mate>x₀</Mate>, unde unul dintre termeni se anulează.
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
            legenda: [
              { simbol: "punct de mijloc", sens: <>x₀ e la mijloc între cele două noduri</> },
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
            legenda: [{ simbol: "punct final", sens: <>x₀ e la capătul șirului de noduri</> }],
            explicatie: (
              <>
                Când <Mate>x₀</Mate> e la <strong>capătul</strong> intervalului, nu ai vecin la
                stânga, deci ambele puncte se iau la dreapta. Prețul se vede în constantă:{" "}
                <Mate>h²/3</Mate> în loc de <Mate>h²/6</Mate>, adică o eroare de două ori mai mare
                la același pas.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Din cele șase formule care ies din calcul rămân doar <strong>două distincte</strong>
                : înlocuind <Mate>h</Mate> cu <Mate>−h</Mate>, celelalte se transformă una
                într-alta. Pentru derivata a doua se procedează identic și iese{" "}
                <Mate>f″(x₀) ≈ [f(x₀−h) − 2f(x₀) + f(x₀+h)] / h²</Mate>, cu eroarea{" "}
                <Mate>−(h²/12)·f⁽⁴⁾(ξ)</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "rotunjire",
        titlu: "De ce nu merge cu h oricât de mic",
        esenta: (
          <>
            Eroarea de trunchiere scade cu <Mate>h</Mate>, dar eroarea de rotunjire{" "}
            <strong>crește</strong>. Suma lor are un minim, iar sub el orice pas mai mic strică
            rezultatul.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\left| f'(x_0) - \\frac{\\tilde f(x_0+h) - \\tilde f(x_0-h)}{2h} \\right| \\le \\frac{\\varepsilon}{h} + \\frac{h^2}{6}M",
            sursa: "curs 11, eroarea de rotunjire",
            legenda: [
              { simbol: "ε", sens: <>cât de greșit e evaluată funcția: precizia mașinii</> },
              { simbol: "M", sens: <>o margine a lui f‴ pe interval</> },
              { simbol: "ε/h", sens: <>partea care crește când h scade</> },
              { simbol: "(h²/6)·M", sens: <>partea care scade când h scade</> },
            ],
            explicatie: (
              <>
                Numărătorul e o <strong>scădere între numere aproape egale</strong>: cu cât{" "}
                <Mate>h</Mate> e mai mic, cu atât <Mate>f(x₀+h)</Mate> și <Mate>f(x₀−h)</Mate> sunt
                mai apropiate, deci cu atât mai puține cifre semnificative supraviețuiesc. Iar
                împărțirea la <Mate>2h</Mate> amplifică ce a rămas.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Unde e minimul.</strong> Derivând marginea în raport cu <Mate>h</Mate> și
                egalând cu zero, iese <Mate>h = √(2ε/M)</Mate> pentru formula cu două puncte și{" "}
                <Mate>h = (3ε/M)^(1/3)</Mate> pentru cea cu punct de mijloc. În dublă precizie, cu{" "}
                <Mate>M = 1</Mate>, asta înseamnă <Mate>h ≈ 2·10⁻⁸</Mate>, respectiv{" "}
                <Mate>h ≈ 9·10⁻⁶</Mate> — cu mult peste cel mai mic număr reprezentabil.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Cât costă greșeala.</strong> Măsurat pe <Mate>sin</Mate> în{" "}
                <Mate>x₀ = 0,6</Mate>: formula înainte are eroarea cea mai mică, <Mate>8·10⁻⁹</Mate>
                , în jurul lui <Mate>h ≈ 10⁻⁸</Mate>; dusă până la <Mate>h = 10⁻¹⁴</Mate>, eroarea
                urcă la <Mate>4·10⁻³</Mate>, adică{" "}
                <strong>de aproape șase ordine de mărime mai rea</strong>. Punctul de mijloc coboară
                până la <Mate>5·10⁻¹²</Mate>, la un pas de o mie de ori mai mare — dar se strică la
                fel dacă îl împingi mai departe.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Ce rămâne, dacă rămâne un singur lucru: în derivarea numerică sunt <strong>două</strong>{" "}
        erori care trag în direcții opuse. Formula cu trei puncte o micșorează pe prima — de la{" "}
        <Mate>h</Mate> la <Mate>h²</Mate>, gratis, doar din simetrie — dar n-o atinge pe a doua.
        Ordinul mai bun nu înseamnă „putem lua <Mate>h</Mate> oricât de mic", ci „ajungem mai jos
        înainte să dăm de podea".
      </>
    ),
  },
};

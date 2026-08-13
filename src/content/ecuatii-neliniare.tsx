import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 5 — puncte fixe, bisecție, Newton (tangentei), secantă.
 *
 * **Sursa: `cursuri_MN/ecuatii_neliniare_MN_curs6.md`.** Nimic scris din memorie.
 *
 * **Teoria e scurtă intenționat.** Pagina nu e un rezumat al cursului: cursul
 * există și se poate citi. Aici stă doar cât să înțelegi ce vezi în interfața
 * interactivă de mai jos — o propoziție de esență, formula, și ce înseamnă
 * fiecare literă din ea. Demonstrațiile și criteriile de oprire alternative au
 * locul lor lângă animație, la pasul unde chiar se întâmplă.
 *
 * Verificat numeric, separat de aplicație: marginea de eroare a bisecției pe
 * `x² − 2` în `[1, 2]`, exemplul cu numărul de aur (converge la
 * 1,618033988749895), `g'(s) = 0` la Newton și recurența secantei.
 *
 * **Ce nu apare, intenționat:** `g''(x) = 2·f''(x)/f'(x)` din curs — nu se
 * verifică. Vezi `docs/erata-cursuri.md`.
 */
export const continutEcuatiiNeliniare: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Toate metodele de aici caută același lucru: valoarea în care funcția se face zero. Diferă
        prin ce știu la pornire — <strong>bisecția</strong> are nevoie de două capete între care
        rădăcina e sigur prinsă și converge întotdeauna, dar încet; celelalte pornesc de la o
        valoare ghicită, pot să și diveargă, dar când merg, merg mult mai repede.
      </>
    ),

    metode: [
      {
        id: "bisectie",
        titlu: "Bisecția",
        esenta: (
          <>Taie intervalul în două și păstrează jumătatea în care funcția își schimbă semnul.</>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "c = \\frac{a+b}{2}",
            sursa: "curs 6",
            legenda: [
              { simbol: "a", sens: <>capătul din stânga al intervalului</> },
              { simbol: "b", sens: <>capătul din dreapta</> },
              { simbol: "c", sens: <>mijlocul, unde se evaluează funcția la pasul curent</> },
            ],
            explicatie: (
              <>
                Condiția de pornire e f(a)·f(b) &lt; 0: semne opuse la capete înseamnă că o funcție
                continuă trece prin zero între ele.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "|p_n - p| < \\frac{b-a}{2^n}",
            sursa: "curs 6",
            legenda: [
              { simbol: "p", sens: <>rădăcina adevărată, pe care n-o cunoaștem</> },
              { simbol: "pₙ", sens: <>aproximarea obținută după n pași</> },
              { simbol: "n", sens: <>de câte ori s-a înjumătățit intervalul</> },
              { simbol: "b − a", sens: <>lungimea intervalului de la care s-a pornit</> },
            ],
            explicatie: (
              <>
                Singura metodă din pagină la care știi eroarea dinainte, fără să știi unde e
                rădăcina.
              </>
            ),
          },
        ],
      },

      {
        id: "puncte-fixe",
        titlu: "Puncte fixe",
        esenta: <>Rescrie ecuația ca „x = g(x)" și aplică g la nesfârșit.</>,
        blocuri: [
          {
            tip: "formula",
            latex: "p_n = g(p_{n-1})",
            sursa: "curs 6",
            legenda: [
              {
                simbol: "g",
                sens: <>funcția de iterație, obținută rescriind ecuația ca x = g(x)</>,
              },
              { simbol: "pₙ₋₁", sens: <>valoarea de la pasul anterior</> },
              { simbol: "pₙ", sens: <>valoarea nouă, adică g aplicată celei anterioare</> },
            ],
            explicatie: (
              <>
                Converge doar dacă g strânge distanțele, adică dacă |g′(x)| &lt; k &lt; 1 pe tot
                intervalul. Atunci punctul fix e unic și se ajunge la el din orice punct de pornire.
              </>
            ),
          },
        ],
      },

      {
        id: "newton",
        titlu: "Tangenta (Newton-Raphson)",
        esenta: <>Duce tangenta în punctul curent și sare acolo unde ea taie axa orizontală.</>,
        blocuri: [
          {
            tip: "formula",
            latex: "p_n = p_{n-1} - \\frac{f(p_{n-1})}{f'(p_{n-1})}",
            sursa: "curs 6",
            legenda: [
              { simbol: "f", sens: <>funcția căreia îi căutăm zeroul</> },
              { simbol: "f′", sens: <>derivata ei, adică panta tangentei</> },
              { simbol: "pₙ₋₁", sens: <>punctul din care pornim la pasul curent</> },
              { simbol: "pₙ", sens: <>unde taie tangenta axa orizontală</> },
            ],
            explicatie: (
              <>
                Eroarea se ridică la pătrat la fiecare pas, deci numărul de zecimale corecte se
                dublează. Eșuează dacă derivata se anulează sau dacă pornești prea departe de
                rădăcină.
              </>
            ),
          },
        ],
      },

      {
        id: "secanta",
        titlu: "Secanta",
        esenta: <>La fel ca Newton, dar panta se estimează din ultimele două puncte.</>,
        blocuri: [
          {
            tip: "formula",
            latex:
              "p_n = p_{n-1} - \\frac{f(p_{n-1})\\,(p_{n-1} - p_{n-2})}{f(p_{n-1}) - f(p_{n-2})}",
            sursa: "curs 6",
            legenda: [
              { simbol: "f", sens: <>funcția căreia îi căutăm zeroul</> },
              { simbol: "pₙ₋₂", sens: <>punctul dinaintea celui anterior</> },
              { simbol: "pₙ₋₁", sens: <>punctul anterior</> },
              {
                simbol: "fracția",
                sens: <>panta dreptei prin ultimele două puncte, care ține locul derivatei</>,
              },
            ],
            explicatie: (
              <>
                Cere două valori de pornire în loc de una, dar nu cere deloc derivata — utilă când
                aceasta nu se poate calcula.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Diferența se vede în cifre: acolo unde bisecția are nevoie de ordinul a <strong>50</strong>{" "}
        de iterații, secanta și tangenta termină în <strong>4–7</strong>. Motivul e ordinul de
        convergență — 2 pentru Newton, adică eroarea nouă e proporțională cu pătratul celei vechi.
      </>
    ),
  },
};

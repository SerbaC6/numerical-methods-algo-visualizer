import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 7 — gradientul Descendent (pașii descrescători) și gradientul Conjugat.
 *
 * **Surse: `cursuri_MN/ecuatii_neliniare_MN_curs6.md`, §4 (gradientul
 * descendent, alegerea lui α, gradientul Conjugat) și
 * `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §8 (SPD, direcții
 * de căutare, A-ortogonalitate, schema din §8.6).** Nimic scris din memorie.
 *
 * **Cele două cursuri folosesc notații diferite pentru aceleași mărimi**, iar
 * pagina nu le amestecă: coborârea e scrisă cu `α` și `r^(k)`, ca în cursul 6,
 * fiindcă asta e și notația din animația de deasupra; schema gradientului
 * conjugat e luată literal din cursul 5, §8.6, cu `t_k`, `v^(k)` și `s_k`, iar
 * corespondența cu `α`, `p^(k)`, `β^(k)` din cursul 6 e spusă în text. Nu s-a
 * rescris niciun indice: renumerotarea unei scheme e exact locul unde apar
 * greșelile pe care nu le mai vede nimeni.
 *
 * **Verificat numeric, separat de aplicație**, pe sistemul SPD
 * `A = [[4, 1], [1, 3]]`, `b = (1, 2)`, cu soluția exactă `x* = (1/11, 7/11)`:
 * - pașii descrescători, cu `α` din line search, converg la `x*` (după 12
 *   iterații, ‖r‖² ≈ 5,6·10⁻¹³), iar reziduul recurent `r^(k+1) = r^(k) − α·A·r^(k)`
 *   coincide cu `b − A·x^(k+1)`;
 * - gradientul Conjugat dă **exact** `x* = (1/11, 7/11)` după `n = 2` pași, cu
 *   reziduu nul și `⟨v^(1), A·v^(2)⟩ = 0` — adică A-ortogonalitatea cerută.
 */
export const continutMetodeDeGradient: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Când matricea A e <strong>simetrică și pozitiv definită</strong>, rezolvarea sistemului{" "}
        <Mate>A·x = b</Mate> e același lucru cu <strong>coborârea într-o vale</strong>: se
        construiește o funcție f al cărei gradient e chiar <Mate>A·x − b</Mate>, iar punctul ei de
        minim e chiar soluția. De aici încolo, cele două metode diferă doar prin direcția în care
        fac pasul următor — și tocmai direcția face diferența dintre zeci de pași și n pași.
      </>
    ),

    metode: [
      {
        id: "gradient-descendent",
        titlu: "Gradientul Descendent (pașii descrescători)",
        esenta: (
          <>
            La fiecare pas merge în direcția în care funcția scade cel mai repede: opusul
            gradientului.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "f(x) = \\frac{1}{2}x^{T}Ax - b^{T}x",
            sursa: "curs 6, §4",
            legenda: [
              { simbol: "A", sens: <>matricea sistemului, simetrică și pozitiv definită</> },
              {
                simbol: "b",
                sens: (
                  <>
                    termenul liber al sistemului <Mate>A·x = b</Mate>
                  </>
                ),
              },
              { simbol: "x", sens: <>vectorul necunoscut, adică punctul de pe „vale"</> },
            ],
            explicatie: (
              <>
                Funcția asta nu vine de nicăieri: gradientul ei e <Mate>∇f(x) = A·x − b</Mate>, deci
                se anulează exact în soluția sistemului. A minimiza <Mate>f</Mate> și a rezolva{" "}
                <Mate>A·x = b</Mate> sunt aceeași problemă.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "r^{(k)} = b - A\\,x^{(k)} = -\\nabla f(x^{(k)})",
            sursa: "curs 6, §4.1",
            legenda: [
              {
                simbol: "r⁽ᵏ⁾",
                sens: (
                  <>
                    reziduul: cât îi mai lipsește lui <Mate>x⁽ᵏ⁾</Mate> ca să verifice sistemul
                  </>
                ),
              },
              { simbol: "x⁽ᵏ⁾", sens: <>aproximarea de la pasul k</> },
              { simbol: "−∇f", sens: <>direcția de scădere maximă a funcției</> },
            ],
            explicatie: (
              <>
                Două fețe ale aceleiași mărimi: reziduul sistemului e chiar direcția în care valea
                coboară cel mai abrupt.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "x^{(k+1)} = x^{(k)} + \\alpha\\,r^{(k)}",
            sursa: "curs 6, §4.1",
            legenda: [
              { simbol: "α", sens: <>lungimea pasului făcut în direcția reziduului</> },
              { simbol: "x⁽ᵏ⁺¹⁾", sens: <>aproximarea următoare</> },
            ],
            explicatie: (
              <>
                Exact iterația din animație — acolo cu α ținut fix, aici cu α ales la fiecare pas.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "\\alpha = \\frac{r^{(k)T} r^{(k)}}{r^{(k)T} A\\, r^{(k)}}",
            sursa: "curs 6, §4.1",
            legenda: [
              { simbol: "r⁽ᵏ⁾ᵀr⁽ᵏ⁾", sens: <>pătratul normei reziduului</> },
              { simbol: "r⁽ᵏ⁾ᵀA·r⁽ᵏ⁾", sens: <>cât „urcă" A pe direcția reziduului</> },
            ],
            explicatie: (
              <>
                Nu e un pas ghicit: e valoarea care minimizează <Mate>g(α) = f(x⁽ᵏ⁾ + α·r⁽ᵏ⁾)</Mate>
                , obținută punând g′(α) = 0. Se numește <em>line search</em> — cauți minimul de-a
                lungul direcției alese, înainte să alegi altă direcție.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "r^{(k+1)} = r^{(k)} - \\alpha\\,A\\,r^{(k)}",
            sursa: "curs 6, §4.1",
            explicatie: (
              <>
                Ca să nu se recalculeze <Mate>b − A·x⁽ᵏ⁾</Mate> la fiecare pas: se înmulțește la
                stânga cu −A relația dintre două aproximări succesive. Rămâne un singur produs
                matrice-vector pe iterație.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Slăbiciunea se vede pe curbele de nivel: fiecare direcție e ortogonală cu cea
                dinaintea ei, deci traseul merge în zigzag de-a curmezișul văii. Pe sisteme liniare
                nu se folosește; rămâne bun la optimizare.
              </>
            ),
          },
        ],
      },

      {
        id: "gradient-conjugat",
        titlu: "Gradientul Conjugat",
        esenta: (
          <>
            Alege direcții care nu se încurcă între ele și ajunge la soluția exactă în cel mult n
            pași.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "\\langle v^{(i)}, A\\,v^{(j)}\\rangle = 0, \\quad i \\neq j",
            sursa: "curs 5, §8.4",
            legenda: [
              { simbol: "v⁽ⁱ⁾", sens: <>direcțiile de căutare, câte una la fiecare pas</> },
              { simbol: "A", sens: <>matricea sistemului, tot simetrică și pozitiv definită</> },
            ],
            explicatie: (
              <>
                Se numește <strong>A-ortogonalitate</strong> (sau direcții conjugate): nu unghi
                drept obișnuit, ci unghi drept „măsurat prin A". Dacă direcțiile o respectă, ce s-a
                câștigat pe una nu se strică pe următoarea — de aici saltul de viteză.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "t_k = \\frac{\\langle r^{(k-1)}, r^{(k-1)}\\rangle}{\\langle v^{(k)}, A\\,v^{(k)}\\rangle}, \\qquad x^{(k)} = x^{(k-1)} + t_k\\,v^{(k)}",
            sursa: "curs 5, §8.6",
            legenda: [
              { simbol: "tₖ", sens: <>lungimea pasului pe direcția curentă</> },
              { simbol: "v⁽ᵏ⁾", sens: <>direcția de căutare de la pasul k</> },
              { simbol: "r⁽ᵏ⁻¹⁾", sens: <>reziduul de la pasul anterior</> },
            ],
            explicatie: (
              <>
                Pornirea e aceeași ca la coborâre: <Mate>r⁽⁰⁾ = b − A·x⁽⁰⁾</Mate>, iar prima
                direcție e chiar reziduul, <Mate>v⁽¹⁾ = r⁽⁰⁾</Mate>. Aceleași mărimi se mai scriu și
                cu <Mate>α</Mate>, <Mate>p⁽ᵏ⁾</Mate> și <Mate>β⁽ᵏ⁾</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "r^{(k)} = r^{(k-1)} - t_k\\,A\\,v^{(k)}, \\qquad s_k = \\frac{\\langle r^{(k)}, r^{(k)}\\rangle}{\\langle r^{(k-1)}, r^{(k-1)}\\rangle}",
            sursa: "curs 5, §8.6",
            legenda: [{ simbol: "sₖ", sens: <>cât din direcția veche se păstrează în cea nouă</> }],
          },
          {
            tip: "formula",
            latex: "v^{(k+1)} = r^{(k)} + s_k\\,v^{(k)}",
            sursa: "curs 5, §8.6",
            explicatie: (
              <>
                Direcția nouă e reziduul <em>corectat</em> cu o parte din cea anterioară, exact cât
                să iasă A-ortogonală pe ea — un Gram-Schmidt căruia îi ajunge ultima direcție.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                Pentru <Mate>A</Mate> simetrică pozitiv definită, metoda atinge soluția{" "}
                <strong>exactă după cel mult n pași</strong>, dacă nu intervin erori numerice.
              </>
            ),
          },
        ],
      },
    ],
  },
};

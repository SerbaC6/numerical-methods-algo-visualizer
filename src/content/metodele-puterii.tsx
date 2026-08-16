import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 8 — metodele puterii, câtul Rayleigh, deflația.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`** — §5 (câtul Rayleigh), §6 (metoda
 * puterii directe, ipoteza de dominanță și rata `|λ₂|/|λ₁|`), §7 (puterea
 * inversă, cu și fără deplasare), §8 (iterarea câtului Rayleigh) și §9 (deflația
 * Wielandt). Secțiunea despre PageRank e a paginii 9 și nu apare aici.
 *
 * **Verificat numeric, separat de aplicație**
 * (`scripts/verificare-algoritmi/metodele-puterii.ts`), pe matricea desenată de
 * pagină, `A = [[3,1,0],[1,3,1],[0,1,3]]`: valorile proprii exacte sunt
 * `3 + √2`, `3`, `3 − √2`, cu vectorii proprii `(1, √2, 1)/2`, `(1, 0, −1)/√2`
 * și `(1, −√2, 1)/2`. Metoda directă ajunge la `3 + √2` cu rata măsurată 0,688
 * față de `|λ₂|/|λ₁| = 0,680`; puterea inversă fără deplasare dă `3 − √2`, iar
 * cu `q = 2,9` dă `3`; iterarea Rayleigh ajunge la aceeași valoare în 3 iterații
 * față de 22; deflația lasă o matrice `2×2` cu urma `λ₂ + λ₃` și determinantul
 * `λ₂·λ₃`.
 */
export const continutMetodelePuterii: ContinutPagina = {
  teorie: {
    intro: (
      <>
        O valoare proprie e numărul cu care matricea doar <strong>lungește</strong> un vector, fără
        să-i schimbe direcția. Teoretic se caută printre rădăcinile polinomului caracteristic; în
        practică se caută prin iterații, iar cea mai simplă dintre ele e o înmulțire repetată.
      </>
    ),

    metode: [
      {
        id: "catul-rayleigh",
        titlu: "Câtul Rayleigh",
        esenta: (
          <>
            Când ai un vector propriu aproximativ, cea mai bună valoare proprie care i se potrivește
            se scrie dintr-o singură formulă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "r(\\mu) = \\lVert A\\,x - \\mu\\,x \\rVert_2",
            sursa: "curs 7, §5",
            legenda: [
              { simbol: "x", sens: <>vectorul propriu aproximativ</> },
              { simbol: "μ", sens: <>valoarea proprie căutată pentru el</> },
            ],
            explicatie: <>Se caută acel μ care lasă reziduul cel mai mic.</>,
          },
          {
            tip: "formula",
            latex: "\\mu = \\frac{x^{T} A\\,x}{x^{T} x}",
            sursa: "curs 7, §5",
            legenda: [
              { simbol: "xᵀ·A·x", sens: <>cât lungește A vectorul, măsurat pe direcția lui x</> },
              { simbol: "xᵀ·x", sens: <>pătratul lungimii lui x</> },
            ],
            explicatie: (
              <>
                Minimul lui <Mate>r(µ)</Mate>, adică soluția în sensul celor mai mici pătrate a
                sistemului <Mate>x·µ = A·x</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "metoda-puterii",
        titlu: "Metoda puterii directe",
        esenta: (
          <>
            Se înmulțește un vector cu matricea, iar și iar: componenta de pe direcția dominantă
            crește cel mai repede și le acoperă pe celelalte.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "|\\lambda_1| > |\\lambda_2| \\ge \\dots \\ge |\\lambda_n|",
            sursa: "curs 7, §6",
            legenda: [
              { simbol: "λ₁", sens: <>valoarea proprie dominantă, strict cea mai mare în modul</> },
              {
                simbol: "y⁽⁰⁾",
                sens: <>vectorul de pornire, cu componentă nenulă pe direcția lui x₁</>,
              },
            ],
            explicatie: (
              <>
                Ipoteza fără de care metoda n-are ce găsi: dacă două valori proprii sunt egale în
                modul, nu există o direcție care să câștige.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "A^{k} x = \\lambda_1^{k} \\sum_{j=1}^{n} \\beta_j \\left(\\frac{\\lambda_j}{\\lambda_1}\\right)^{k} v^{(j)}",
            sursa: "curs 7, §6",
            legenda: [
              { simbol: "βⱼ", sens: <>cât din vectorul de pornire stă pe direcția j</> },
              {
                simbol: "(λⱼ/λ₁)ᵏ",
                sens: <>factorul care stinge toate direcțiile în afară de prima</>,
              },
            ],
            explicatie: (
              <>
                Toate rapoartele sunt subunitare, deci se sting; rămâne <Mate>λ₁ᵏ</Mate>, care ori
                explodează, ori se duce la zero — de aceea se normalizează la fiecare pas.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "y^{(k)} = \\frac{A\\,y^{(k-1)}}{\\lVert A\\,y^{(k-1)}\\rVert_2},\\qquad \\lambda^{(k)} = y^{(k)T} A\\,y^{(k)}",
            sursa: "curs 7, §6",
            legenda: [
              { simbol: "y⁽ᵏ⁾", sens: <>aproximarea direcției proprii la pasul k, de lungime 1</> },
              { simbol: "λ⁽ᵏ⁾", sens: <>câtul Rayleigh al ei: estimarea valorii proprii</> },
            ],
            explicatie: (
              <>
                Iterația propriu-zisă. Oprirea se face când <Mate>‖y⁽ᵏ⁾ − y⁽ᵏ⁻¹⁾‖</Mate> scade sub
                toleranță.
              </>
            ),
          },
          {
            tip: "callout",
            titlu: "Cât de repede",
            continut: (
              <>
                Rata de convergență e <Mate>|λ₂|/|λ₁|</Mate>: cu cât a doua valoare proprie e mai
                aproape de prima în modul, cu atât iterația se târăște mai mult.
              </>
            ),
          },
        ],
      },
      {
        id: "puterea-inversa",
        titlu: "Metoda puterii inverse",
        esenta: (
          <>
            Aceeași iterație, dar pe inversa matricei: acolo, cea mai mică valoare proprie a lui A
            devine cea dominantă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\lambda\\big((A - qI)^{-1}\\big) = \\left\\{ \\frac{1}{\\lambda_1 - q}, \\dots, \\frac{1}{\\lambda_n - q} \\right\\}",
            sursa: "curs 7, §7",
            legenda: [
              { simbol: "q", sens: <>deplasarea: în jurul cărei valori se caută</> },
              { simbol: "1/(λᵢ − q)", sens: <>cu cât mai aproape e λᵢ de q, cu atât mai mare</> },
            ],
            explicatie: (
              <>
                Vectorii proprii rămân aceiași. Iterația găsește valoarea proprie cea mai apropiată
                de <Mate>q</Mate>, nu pe cea mai mare.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "(A - qI)\\,y^{(m)} = x^{(m-1)},\\qquad x^{(m)} = \\frac{y^{(m)}}{\\lVert y^{(m)} \\rVert}",
            sursa: "curs 7, §7",
            legenda: [
              { simbol: "y⁽ᵐ⁾", sens: <>soluția sistemului, adică pasul neîmpărțit</> },
              {
                simbol: "λ ≈ q + 1/µ⁽ᵐ⁾",
                sens: <>valoarea proprie a lui A, refăcută din cea a inversei</>,
              },
            ],
            explicatie: (
              <>
                Matricea nu se inversează: la fiecare pas se rezolvă un sistem. Dacă <Mate>q</Mate>{" "}
                nimerește exact o valoare proprie, <Mate>A − qI</Mate> e singulară și sistemul n-are
                soluție.
              </>
            ),
          },
        ],
      },
      {
        id: "iterarea-rayleigh",
        titlu: "Iterarea câtului Rayleigh",
        esenta: (
          <>
            Puterea inversă cu deplasare recalculată la fiecare pas: estimarea curentă devine
            deplasarea următoare.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\rho^{(k)} = \\frac{x^{(k)T} A\\,x^{(k)}}{x^{(k)T} x^{(k)}},\\qquad (A - \\rho^{(k)} I)\\,y^{(k)} = x^{(k)}",
            sursa: "curs 7, §8",
            legenda: [
              { simbol: "ρ⁽ᵏ⁾", sens: <>câtul Rayleigh al aproximării curente</> },
              { simbol: "x⁽ᵏ⁺¹⁾", sens: <>y⁽ᵏ⁾ readus la lungime 1</> },
            ],
            explicatie: (
              <>
                Se aplică matricelor simetrice. Cu cât <Mate>ρ⁽ᵏ⁾</Mate> se apropie de valoarea
                proprie, cu atât pasul următor sare mai mult — de unde viteza.
              </>
            ),
          },
        ],
      },
      {
        id: "deflatie",
        titlu: "Deflația",
        esenta: (
          <>
            După ce ai găsit valoarea proprie dominantă, o scoți din matrice ca să poți căuta din
            nou o dominantă — următoarea.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "B = A - \\lambda_1 v^{(1)} x^{T},\\qquad \\sigma(B) = \\{0, \\lambda_2, \\dots, \\lambda_n\\}",
            sursa: "curs 7, §9",
            legenda: [
              { simbol: "v⁽¹⁾", sens: <>vectorul propriu al valorii dominante</> },
              { simbol: "x", sens: <>orice vector cu xᵀ·v⁽¹⁾ = 1</> },
              { simbol: "σ(B)", sens: <>spectrul lui B: la fel, cu 0 în locul lui λ₁</> },
            ],
            explicatie: (
              <>Valoarea deja găsită nu mai poate domina, fiindcă a fost înlocuită cu zero.</>
            ),
          },
          {
            tip: "formula",
            subtitlu: "Alegerea lui x — deflația Wielandt",
            latex:
              "x = \\frac{1}{\\lambda_1 v^{(1)}_i}\\,(a_{i1},\\, a_{i2},\\, \\dots,\\, a_{in})^{T}",
            sursa: "curs 7, §9",
            legenda: [
              { simbol: "aᵢ₁ … aᵢₙ", sens: <>linia i din A</> },
              { simbol: "v⁽¹⁾ᵢ", sens: <>o componentă nenulă a vectorului propriu</> },
            ],
            explicatie: (
              <>
                Din <Mate>A·v⁽¹⁾ = λ₁·v⁽¹⁾</Mate> rezultă direct <Mate>xᵀ·v⁽¹⁾ = 1</Mate>, iar linia{" "}
                <Mate>i</Mate> din <Mate>B</Mate> se face nulă.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "B' = B \\text{ fără linia } i \\text{ și coloana } i \\in \\mathbb{R}^{(n-1)\\times(n-1)}",
            sursa: "curs 7, §9",
            legenda: [{ simbol: "B′", sens: <>matricea redusă, cu valorile proprii λ₂ … λₙ</> }],
            explicatie: (
              <>
                Problema scade cu un ordin la fiecare pas, iar pe ce rămâne se aplică din nou metoda
                puterii.
              </>
            ),
          },
        ],
      },
    ],
  },
};

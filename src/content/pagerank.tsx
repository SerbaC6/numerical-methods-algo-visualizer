import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 9 — algoritmul PageRank.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §10** (matricea
 * stocastică, matricea Google, `M·R = R`, algoritmul cu metoda puterii) și §6
 * (metoda puterii, de unde vine iterația). Nimic scris din memorie.
 *
 * **O abatere declarată de la cifrele cursului.** Cursul cere normalizarea după
 * numărul de link-uri de **ieșire**, dar matricea `M` tipărită în exemplul lui e
 * normalizată după link-urile care **intră**, iar cele două dau clasamente
 * diferite. Pagina aplică regula scrisă, nu cifrele tipărite; cazul e documentat
 * în `docs/erata-cursuri.md` și ținut ca test în
 * `scripts/verificare-algoritmi/pagerank.ts`.
 *
 * **Verificat numeric, separat de aplicație**, pe exemplul cursului
 * (`P1→{P2,P3}`, `P2→{P3}`, `P3→{P1,P4}`, `P4→{P2}`, `d = 0,85`): sistemul
 * `(I − G)v = 0` cu `Σvᵢ = 1`, rezolvat pe fracții, dă
 * `v = (1429, 2109, 2687, 1429)/7654`, adică 18,67 % / 27,55 % / 35,11 % /
 * 18,67 %, cu `G·v = v` exact; metoda puterii ajunge la aceleași cifre în 44 de
 * iterații la toleranța 10⁻⁶.
 */
export const continutPagerank: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Întrebarea din spatele PageRank e „cât de importantă e o pagină web", iar răspunsul e o
        <strong> valoare proprie</strong>. Se pornește de la un navigator care urmează link-uri la
        întâmplare: importanța unei pagini e proporția din timp pe care el o petrece pe ea.
        Proporția asta nu se mai schimbă de la un click la altul — și tocmai „nu se mai schimbă"
        înseamnă vector propriu pentru λ = 1.
      </>
    ),

    metode: [
      {
        id: "matrice-stocastica",
        titlu: "Matricea stocastică a rețelei",
        esenta: (
          <>
            Fiecare pagină își împarte atenția în mod egal între link-urile care pleacă din ea, iar
            probabilitățile se așază într-o matrice cu coloanele egale cu 1.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "A = \\begin{pmatrix}0&1&1&0\\\\0&0&1&0\\\\1&0&0&1\\\\0&1&0&0\\end{pmatrix},\\quad a_{ij} = \\begin{cases}1, & P_i \\to P_j\\\\ 0, & \\text{altfel}\\end{cases}",
            sursa: "curs 7, §10",
            legenda: [
              { simbol: "Pᵢ", sens: <>pagina cu numărul i din rețea</> },
              { simbol: "aᵢⱼ", sens: <>1 dacă pagina i are link către pagina j</> },
              { simbol: "linia i", sens: <>toate link-urile care pleacă din pagina i</> },
            ],
            explicatie: (
              <>
                Matricea de adiacență a exemplului din curs: P1 → &#123;P2, P3&#125;, P2 →
                &#123;P3&#125;, P3 → &#123;P1, P4&#125;, P4 → &#123;P2&#125;. Se citește pe linii:
                linia i spune încotro se poate pleca de pe pagina i.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "s_{ij} = \\frac{a_{ij}}{\\sum_j a_{ij}},\\qquad M = S^{T}",
            sursa: "curs 7, §10",
            legenda: [
              { simbol: "Σⱼ aᵢⱼ", sens: <>câte link-uri pleacă din pagina i</> },
              { simbol: "sᵢⱼ", sens: <>probabilitatea de a pleca de pe i și a ajunge pe j</> },
              { simbol: "M", sens: <>matricea stocastică, cu coloanele egale cu 1</> },
            ],
            explicatie: (
              <>
                Cursul cere două lucruri deodată: normalizarea după numărul de link-uri de
                <strong> ieșire</strong> și coloane care însumează 1. Link-urile de ieșire ale unei
                pagini stau pe <strong>linia</strong> ei, deci împărțirea se face pe linii — iar
                transpunerea e chiar pasul care mută cerința de pe linii pe coloane. Coloana j a lui
                M spune unde ajunge cine e acum pe pagina j.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-google",
        titlu: "Matricea Google",
        esenta: (
          <>
            Navigatorul nu urmează link-uri la nesfârșit: din când în când sare la o pagină luată la
            întâmplare. Matricea Google amestecă cele două comportamente.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "M\\,R = R",
            sursa: "curs 7, §10",
            legenda: [
              { simbol: "R", sens: <>PageRank-ul: cât cântărește fiecare pagină</> },
              { simbol: "M·R", sens: <>ponderile după încă un click</> },
            ],
            explicatie: (
              <>
                Condiția care definește PageRank-ul: distribuția rămâne neschimbată indiferent ce
                face utilizatorul. Scrisă așa, se vede imediat că R e vector propriu al lui M pentru
                λ = 1.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "G = d\\,M + \\frac{1-d}{N}\\,\\mathrm{ONES}(N)",
            sursa: "curs 7, §10",
            legenda: [
              { simbol: "d", sens: <>probabilitatea de a continua navigarea pe link-uri</> },
              { simbol: "1 − d", sens: <>probabilitatea de a sări la o pagină aleatorie</> },
              { simbol: "N", sens: <>numărul de pagini din rețea</> },
              { simbol: "ONES(N)", sens: <>matricea N×N cu toate elementele 1</> },
            ],
            explicatie: (
              <>
                Termenul al doilea adaugă aceeași cantitate mică în fiecare celulă: de oriunde,
                navigatorul poate ajunge oriunde. G rămâne stocastică — coloanele ei însumează tot 1
                — dar acum are toate elementele strict pozitive, ceea ce face λ = 1 valoare proprie
                dominantă și unică.
              </>
            ),
          },
        ],
      },
      {
        id: "metoda-puterii",
        titlu: "PageRank-ul prin metoda puterii",
        esenta: (
          <>
            Fiind vector propriu pentru valoarea proprie dominantă, PageRank-ul se obține chiar cu
            metoda puterii: se înmulțește repetat cu G până când vectorul nu se mai mișcă.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "v \\leftarrow \\frac{G\\,v}{\\lVert G\\,v \\rVert},\\qquad \\text{oprire când } \\lVert v - v_{\\text{prev}} \\rVert < \\varepsilon",
            sursa: "curs 7, §10",
            legenda: [
              { simbol: "v", sens: <>aproximarea curentă a vectorului propriu</> },
              { simbol: "v_prev", sens: <>aceeași aproximare, la iterația dinainte</> },
              { simbol: "ε", sens: <>toleranța: cât de puțin trebuie să se mai miște v</> },
            ],
            explicatie: (
              <>
                Iterația pornește din vectorul cu toate componentele 1 — la început, toate paginile
                cântăresc la fel. Fiecare înmulțire cu G înseamnă „încă un click", iar împărțirea la
                normă ține vectorul de lungime 1, ca înmulțirile repetate să nu-l umfle sau să-l
                stingă.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "R = \\frac{v}{\\lVert v \\rVert_1}",
            sursa: "curs 7, §10",
            legenda: [
              { simbol: "‖v‖₁", sens: <>suma modulelor componentelor lui v</> },
              { simbol: "R", sens: <>PageRank-ul final, cu componentele însumând 1</> },
            ],
            explicatie: (
              <>
                Ultima linie a algoritmului, și singura care schimbă norma: până aici v a fost ținut
                de lungime 1, iar acum se împarte la suma componentelor. Abia după pasul ăsta
                cifrele se pot citi ca procente — de aceea ponderile desenate sub noduri sunt tot
                timpul raportul <Mate>v/‖v‖₁</Mate>, nu <Mate>v</Mate> însuși.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Ce rămâne, dacă rămâne un singur lucru: PageRank-ul nu e o formulă separată, ci{" "}
        <strong>metoda puterii aplicată matricei Google</strong>. Viteza cu care se așază ponderile
        e dată de raportul dintre a doua valoare proprie a lui <Mate>G</Mate> și prima; pentru{" "}
        <Mate>d = 0,85</Mate> pe exemplul din curs, raportul e ≈ 0,74, iar apropierea nu e monotonă
        — de la un pas la altul, o pondere poate și să se depărteze.
      </>
    ),
  },
};

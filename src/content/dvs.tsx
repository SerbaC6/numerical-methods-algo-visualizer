import { Mate } from "@/components/viz/Notatie";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Pagina 11 — descompunerea valorilor singulare (DVS/SVD).
 *
 * **Sursă: `cursuri_MN/qr_dvs_teorie_curs8.md`, §6–§10** (definiția `A = U S Vᵀ`,
 * rangul și nucleul, construcția lui `S`, a lui `V`, a lui `U`, Gram-Schmidt și
 * rezumatul pașilor). Partea de QR (§1–§5) din același curs ține de pagina 10.
 * Nimic scris din memorie.
 *
 * **O abatere declarată de la curs.** Cursul spune, la cazul particular al
 * matricelor simetrice, că „valorile singulare sunt chiar valorile proprii".
 * Afirmația nu ține când o valoare proprie e negativă: pentru `A = [[1,2],[2,1]]`
 * valorile proprii sunt `−1` și `3`, iar valorile singulare `3` și `1`. Ce se
 * păstrează — și ce scrie pe pagină — e concluzia corectă, care iese chiar din
 * `A² = AᵀA`: valorile singulare sunt **modulele** valorilor proprii. Cazul e
 * scris în `docs/erata-cursuri.md`.
 *
 * **Două redenumiri, cifrele neatinse** (regula din CLAUDE.md: se schimbă doar
 * numele):
 *
 * - Gram-Schmidt din curs folosește `u_j` și pentru vectorii intermediari, adică
 *   exact litera coloanelor lui `U` construite la §9. Aici vectorii intermediari
 *   se numesc `w_j`, ca `uᵢ = (1/sᵢ)·A·vᵢ` să rămână singurul lucru care se
 *   cheamă `u`.
 * - Cursul scrie ordonarea valorilor proprii ca `s₁² ≥ … ≥ s_k² > s_{k+1} = … = sₙ = 0`,
 *   scăpând pătratul pe coada șirului; pe pagină apare cu pătrat peste tot, fiind
 *   vorba de valorile proprii ale lui `AᵀA`, nu de valorile singulare.
 *
 * **Verificat numeric, separat de aplicație**, pe `A = [[3,1],[1,3],[1,1]]`
 * (3×2): valorile proprii ale lui `AᵀA` ies `18` și `4`, deci `s₁ = √18`,
 * `s₂ = 2`; coloanele `uᵢ = (1/sᵢ)·A·vᵢ` ies ortonormate (`U₁ᵀU₁ = I₂`), a treia
 * coloană completată prin Gram-Schmidt dă `UᵀU = I₃`, iar `‖A − U S Vᵀ‖ ≈ 1·10⁻¹⁵`.
 * `AAᵀ` are valorile proprii `18`, `4` și `0` — aceleași valori nenule ca `AᵀA`,
 * cum cere §6.
 */
export const continutDvs: ContinutPagina = {
  teorie: {
    intro: (
      <>
        Până aici, valorile proprii au cerut matrice pătratice. DVS ridică cerința: <em>orice</em>{" "}
        matrice, chiar dreptunghiulară, se scrie ca produsul dintre o matrice ortogonală, una
        diagonală cu numere nenegative și încă una ortogonală. Numerele de pe diagonală — valorile
        singulare — spun cât întinde matricea fiecare direcție, iar câte dintre ele sunt nenule
        spune chiar rangul. Drumul până la ele trece printr-o matrice pătratică și simetrică,
        construită din <Mate>A</Mate>: produsul <Mate>Aᵀ·A</Mate>.
      </>
    ),

    metode: [
      {
        id: "definitie",
        titlu: "Factorizarea",
        esenta: (
          <>
            Cele trei matrice au dimensiuni diferite și roluri diferite: două rotesc, cea din mijloc
            întinde.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\underset{(m\\times n)}{A} \\;=\\; \\underset{(m\\times m)}{U}\\;\\underset{(m\\times n)}{S}\\;\\underset{(n\\times n)}{V^{T}}",
            sursa: "curs 8, §6",
            legenda: [
              { simbol: "A", sens: <>matricea de descompus, cu m linii și n coloane</> },
              { simbol: "U", sens: <>matrice ortogonală m×m</> },
              {
                simbol: "S",
                sens: <>matrice m×n cu elemente nenule doar pe prima diagonală</>,
              },
              { simbol: "V", sens: <>matrice ortogonală n×n; în factorizare apare transpusă</> },
            ],
            explicatie: (
              <>
                Singura matrice care nu e pătratică e cea din mijloc: <Mate>S</Mate> preia toată
                diferența de formă dintre m și n, iar <Mate>U</Mate> și <Mate>V</Mate> rămân
                pătratice și ortogonale. Cazul obișnuit e <Mate>m &gt; n</Mate>, adesea{" "}
                <Mate>m ≫ n</Mate> — mai multe măsurători decât necunoscute. Elementele lui{" "}
                <Mate>S</Mate> sunt nenegative: <Mate>Sᵢᵢ ≥ 0</Mate>.
              </>
            ),
          },
        ],
      },
      {
        id: "rang-nucleu",
        titlu: "Rangul, nucleul și matricea AᵀA",
        esenta: (
          <>
            Descompunerea nu pornește de la <Mate>A</Mate>, ci de la produsele ei pătratice{" "}
            <Mate>Aᵀ·A</Mate> și <Mate>A·Aᵀ</Mate>, care sunt simetrice și păstrează informația care
            contează.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\operatorname{Rank}(A) \\;=\\; \\text{nr. de linii liniar independente},\\qquad \\operatorname{Null}(A) \\;=\\; \\{\\,v \\in \\mathbb{R}^{n} \\;:\\; A\\,v = 0\\,\\}",
            sursa: "curs 8, §6",
            legenda: [
              { simbol: "Rank(A)", sens: <>câte linii ale lui A sunt liniar independente</> },
              {
                simbol: "Null(A)",
                sens: (
                  <>
                    cel mai mare set de vectori liniar independenți duși în 0 de <Mate>A</Mate>
                  </>
                ),
              },
            ],
            explicatie: (
              <>
                Numărul de linii liniar independente e egal cu numărul de coloane liniar
                independente, deci rangul se poate citi de pe oricare dintre ele. Pentru o matrice
                pătratică <Mate>n×n</Mate>, inversabilitatea înseamnă exact <Mate>Null(A) = 0</Mate>{" "}
                și <Mate>Rank(A) = n</Mate>.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "\\operatorname{Null}(A) = \\operatorname{Null}(A^{T}A),\\qquad \\operatorname{Rank}(A) = \\operatorname{Rank}(A^{T}A)",
            sursa: "curs 8, §6",
            legenda: [
              { simbol: "AᵀA", sens: <>matrice pătratică n×n, simetrică</> },
              { simbol: "AAᵀ", sens: <>matrice pătratică m×m, tot simetrică</> },
            ],
            explicatie: (
              <>
                Trecerea de la <Mate>A</Mate> la <Mate>Aᵀ·A</Mate> nu pierde nici rangul, nici
                nucleul — de aceea se poate lucra cu matricea pătratică fără să se schimbe problema.
                În plus, valorile proprii ale lui <Mate>Aᵀ·A</Mate> și <Mate>A·Aᵀ</Mate> sunt reale
                și nenegative, iar cele diferite de 0 sunt aceleași pentru amândouă.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-s",
        titlu: "Matricea S — valorile singulare",
        esenta: (
          <>
            Valorile singulare sunt rădăcinile pozitive ale valorilor proprii ale lui{" "}
            <Mate>Aᵀ·A</Mate>, așezate descrescător pe diagonală.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "s_1^{2} \\ge s_2^{2} \\ge \\dots \\ge s_k^{2} > s_{k+1}^{2} = \\dots = s_n^{2} = 0",
            sursa: "curs 8, §7",
            legenda: [
              { simbol: "sᵢ²", sens: <>valorile proprii ale matricei simetrice n×n AᵀA</> },
              {
                simbol: "sᵢ",
                sens: <>valoarea singulară i a lui A: rădăcina pozitivă a lui sᵢ²</>,
              },
              { simbol: "k", sens: <>câte valori proprii sunt strict pozitive</> },
            ],
            explicatie: (
              <>
                Valorile proprii ale lui <Mate>Aᵀ·A</Mate> fiind nenegative, rădăcina se poate lua
                fără grijă, iar ordonarea descrescătoare fixează care valoare singulară e prima.
                Ultimele <Mate>n − k</Mate> sunt nule; <Mate>k</Mate> e numărul de direcții pe care{" "}
                <Mate>A</Mate> chiar le întinde.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "S = \\begin{pmatrix} s_1 & 0 & \\cdots & 0 \\\\ 0 & s_2 & \\cdots & 0 \\\\ \\vdots & & \\ddots & \\vdots \\\\ 0 & \\cdots & & s_n \\\\ 0 & \\cdots & \\cdots & 0 \\\\ \\vdots & & & \\vdots \\\\ 0 & \\cdots & \\cdots & 0 \\end{pmatrix}",
            sursa: "curs 8, §7",
            legenda: [
              {
                simbol: "primele n linii",
                sens: <>valorile singulare, în ordine descrescătoare</>,
              },
              { simbol: "ultimele m − n linii", sens: <>zerouri, ca S să aibă forma lui A</> },
            ],
            explicatie: (
              <>
                <Mate>S</Mate> are exact forma lui <Mate>A</Mate>: <Mate>m×n</Mate>. Valorile
                singulare umplu diagonala de sus, iar restul liniilor sunt zero — ele sunt cele care
                fac trecerea de la <Mate>n</Mate> la <Mate>m</Mate> fără să adauge nimic.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Când A e simetrică</strong>, avem <Mate>A = Aᵀ</Mate>, deci{" "}
                <Mate>Aᵀ·A = A²</Mate>: valorile proprii ale lui <Mate>Aᵀ·A</Mate> sunt pătratele
                valorilor proprii ale lui <Mate>A</Mate>, iar valorile singulare sunt{" "}
                <strong>modulele</strong> lor, <Mate>sᵢ = |λᵢ|</Mate>. Pentru o matrice simetrică cu
                valori proprii pozitive, cele două liste coincid pur și simplu — caz luat separat
                mai jos.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-v",
        titlu: "Matricea V — vectorii proprii ai lui AᵀA",
        esenta: (
          <>
            Fiind simetrică, <Mate>Aᵀ·A</Mate> se diagonalizează cu o matrice ortogonală, iar aceea
            e chiar <Mate>V</Mate>.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "A^{T}A = V\\,D\\,V^{T},\\qquad D = S^{2}",
            sursa: "curs 8, §8",
            legenda: [
              { simbol: "V", sens: <>coloanele sunt vectorii proprii ai lui AᵀA, de normă 1</> },
              { simbol: "D", sens: <>matricea diagonală n×n cu valorile proprii ale lui AᵀA</> },
              { simbol: "D = S²", sens: <>pe diagonala lui D stau chiar pătratele sᵢ²</> },
            ],
            explicatie: (
              <>
                Orice matrice simetrică <Mate>M</Mate> se scrie <Mate>M = V·D·Vᵀ</Mate>, cu{" "}
                <Mate>D</Mate> diagonală și <Mate>V</Mate> ortogonală, având drept coloane vectorii
                proprii de normă euclidiană 1. Vectorii proprii se pot alege însă cu orice direcție
                și orice semn, deci <Mate>V</Mate> nu e unic: aceeași matrice <Mate>A</Mate> are mai
                multe descompuneri, toate valabile. Egalitatea <Mate>D = S²</Mate> e chiar
                traducerea faptului că valorile proprii ale lui <Mate>Aᵀ·A</Mate> sunt nenegative.
              </>
            ),
          },
        ],
      },
      {
        id: "matricea-u",
        titlu: "Matricea U — imaginile direcțiilor lui V",
        esenta: (
          <>
            Primele <Mate>k</Mate> coloane ale lui <Mate>U</Mate> se obțin trecând coloanele lui{" "}
            <Mate>V</Mate> prin <Mate>A</Mate> și împărțind la valoarea singulară.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex: "u_i = \\frac{1}{s_i}\\,A\\,v_i,\\qquad i = 1,\\dots,k",
            sursa: "curs 8, §9",
            legenda: [
              {
                simbol: "vᵢ",
                sens: <>coloana i din V, corespunzătoare valorii singulare nenule sᵢ</>,
              },
              { simbol: "sᵢ", sens: <>valoare singulară nenulă: s₁ ≥ s₂ ≥ … ≥ s_k &gt; 0</> },
              { simbol: "uᵢ", sens: <>coloana i din U</> },
            ],
            explicatie: (
              <>
                <Mate>A·vᵢ</Mate> e direcția în care ajunge <Mate>vᵢ</Mate> după înmulțire, iar
                lungimea ei e chiar <Mate>sᵢ</Mate> — de aceea împărțirea la <Mate>sᵢ</Mate> o
                readuce la 1. Formula funcționează doar pentru valorile singulare nenule; pentru
                celelalte ar cere împărțire la zero, deci restul de <Mate>m − k</Mate> coloane
                trebuie completat altfel.
              </>
            ),
          },
        ],
      },
      {
        id: "gram-schmidt",
        titlu: "Gram-Schmidt — completarea coloanelor rămase",
        esenta: (
          <>
            Cele <Mate>m − k</Mate> coloane care lipsesc se aleg ortogonale pe cele deja construite,
            scăzând din fiecare vector proiecțiile lui pe cele dinainte.
          </>
        ),
        blocuri: [
          {
            tip: "formula",
            latex:
              "\\operatorname{proj}_{w}(v) = \\frac{\\langle w, v\\rangle}{\\langle w, w\\rangle}\\,w",
            sursa: "curs 8, §9",
            legenda: [
              { simbol: "⟨w, v⟩", sens: <>produsul scalar dintre w și v</> },
              { simbol: "proj_w(v)", sens: <>partea din v care merge în direcția lui w</> },
            ],
            explicatie: (
              <>
                Proiecția e bucata pe care doi vectori o au în comun. Dacă se scade din{" "}
                <Mate>v</Mate>, ce rămâne e perpendicular pe <Mate>w</Mate> — exact ce trebuie ca
                matricea să iasă ortogonală.
              </>
            ),
          },
          {
            tip: "formula",
            latex:
              "w_j = v_j - \\sum_{l=1}^{j-1} \\operatorname{proj}_{w_l}(v_j),\\qquad e_j = \\frac{w_j}{\\lVert w_j \\rVert}",
            sursa: "curs 8, §9",
            legenda: [
              {
                simbol: "wⱼ",
                sens: <>vectorul j după ce i s-au scăzut proiecțiile pe cei dinainte</>,
              },
              { simbol: "eⱼ", sens: <>același vector, adus la lungimea 1</> },
              { simbol: "‖wⱼ‖", sens: <>lungimea euclidiană a lui wⱼ</> },
            ],
            explicatie: (
              <>
                Procedeul merge în ordine: primul vector rămâne cum e (<Mate>w₁ = v₁</Mate>), al
                doilea pierde partea comună cu primul, al treilea pierde părțile comune cu primii
                doi și tot așa. Vectorii <Mate>eⱼ</Mate> formează baza ortonormată căutată, iar cu
                ea <Mate>U</Mate> devine ortogonală.
              </>
            ),
          },
        ],
      },
      {
        id: "valori-singulare-si-proprii",
        titlu: "Valorile singulare și valorile proprii",
        esenta: (
          <>
            Nu sunt același lucru, dar din DVS se citesc și valorile proprii — depinde ce formă are
            matricea.
          </>
        ),
        blocuri: [
          {
            tip: "text",
            continut: (
              <>
                O matrice dreptunghiulară <strong>nu are valori proprii</strong> în sensul obișnuit:{" "}
                <Mate>A·v = λ·v</Mate> nici măcar nu se poate scrie, fiindcă cele două părți ar avea
                lungimi diferite. În schimb <Mate>Aᵀ·A</Mate> și <Mate>A·Aᵀ</Mate> sunt pătratice și
                simetrice, deci au valori proprii — iar DVS le folosește chiar pe ele.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "s_i = \\sqrt{\\lambda_i\\!\\left(A^{T}A\\right)}",
            sursa: "curs 8, §7",
            legenda: [
              { simbol: "λᵢ(AᵀA)", sens: <>valoarea proprie i a matricei AᵀA</> },
              { simbol: "sᵢ", sens: <>valoarea singulară i, adică elementul Sᵢᵢ</> },
            ],
            explicatie: (
              <>
                Valorile singulare din <Mate>S</Mate> sunt exact rădăcinile valorilor proprii nenule
                ale lui <Mate>Aᵀ·A</Mate>. Radicalul e legitim tocmai fiindcă valorile proprii ale
                lui <Mate>Aᵀ·A</Mate> sunt nenegative.
              </>
            ),
          },
          {
            tip: "formula",
            latex: "A^{T}A = V\\,S^{2}\\,V^{T},\\qquad A\\,A^{T} = U\\,S\\,S^{T}\\,U^{T}",
            sursa: "curs 8, §6, §8, §9",
            legenda: [
              { simbol: "coloanele V", sens: <>vectorii proprii ai lui AᵀA (matrice n×n)</> },
              { simbol: "coloanele U", sens: <>vectorii proprii ai lui AAᵀ (matrice m×m)</> },
              { simbol: "S·Sᵀ", sens: <>matrice m×m, cu aceleași sᵢ² pe diagonală</> },
            ],
            explicatie: (
              <>
                Cele două matrice ortogonale nu sunt alese, ci citite: <Mate>V</Mate> are drept
                coloane vectorii proprii ai lui <Mate>Aᵀ·A</Mate>, iar <Mate>U</Mate> pe cei ai lui{" "}
                <Mate>A·Aᵀ</Mate>. Se vede înlocuind <Mate>A = U·S·Vᵀ</Mate> în fiecare produs:
                factorii ortogonali din mijloc se anulează și rămâne câte o diagonalizare. De aceea
                valorile proprii nenule ale celor două matrice sunt aceleași — sunt aceiași{" "}
                <Mate>sᵢ²</Mate>, doar așezați în matrice de mărimi diferite.
              </>
            ),
          },
          {
            tip: "text",
            continut: (
              <>
                <strong>Cazul special: A pătratică, simetrică și pozitiv semidefinită.</strong>{" "}
                Atunci valorile proprii sunt toate <Mate>≥ 0</Mate>, deci modulul nu mai schimbă
                nimic și valorile singulare sunt <em>chiar</em> valorile proprii,{" "}
                <Mate>sᵢ = λᵢ</Mate>. În plus <Mate>U = V</Mate>, iar DVS coincide cu descompunerea
                spectrală obișnuită, <Mate>A = V·D·Vᵀ</Mate>. Pentru orice altă matrice, cele două
                descompuneri rămân lucruri diferite.
              </>
            ),
          },
        ],
      },
    ],

    incheiere: (
      <>
        Pașii, în ordine: se calculează <Mate>Aᵀ·A</Mate>; valorile ei proprii, ordonate
        descrescător, dau prin radical valorile singulare din <Mate>S</Mate>; vectorii proprii
        ortonormați ai aceleiași matrice sunt coloanele lui <Mate>V</Mate>; primele <Mate>k</Mate>{" "}
        coloane ale lui <Mate>U</Mate> ies din <Mate>uᵢ = (1/sᵢ)·A·vᵢ</Mate>, iar restul se
        completează prin Gram-Schmidt. Ce rămâne, dacă rămâne un singur lucru: toată descompunerea
        unei matrice oarecare se obține din valorile și vectorii proprii ai unei singure matrice
        simetrice, <Mate>Aᵀ·A</Mate>.
      </>
    ),
  },
};

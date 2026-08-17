/**
 * Registrul paginilor tematice — sursa unică de adevăr pentru cuprins, rute și
 * navigația dintre pagini.
 *
 * Împărțirea, titlurile și metodele vin din `Plan.md` („Lista Algoritmi") și din
 * tabelul „Lista paginilor" din `Progress.md`, Faza 7. Nu se inventează pagini noi
 * aici: dacă se schimbă lista, se schimbă întâi `Plan.md`.
 *
 * Numărul de pagini **nu se scrie de mână** nicăieri în interfață; se ia din
 * `NUMAR_PAGINI`, de la finalul fișierului.
 */

export type Dificultate = "ușor" | "mediu" | "greu";

/** Grupurile din cuprins. Un capitol aparține exact unei secțiuni. */
export type Sectiune = "liniare" | "neliniare" | "valori-proprii" | "interpolare-integrare";

export type Capitol =
  | "sisteme-liniare"
  | "ortogonalitate"
  | "ecuatii-optimizare"
  | "valori-proprii"
  | "interpolare-aproximare"
  | "integrare-ode";

export type IntrareAlgoritm = {
  /** Ultimul segment din rută: `/algoritm/:slug`. */
  slug: string;
  /** Ordinea din `Plan.md`. Dă și ordinea în cuprins și navigația înainte/înapoi. */
  numar: number;
  titlu: string;
  capitol: Capitol;
  /** O propoziție: ce vede studentul pe pagină. */
  descriere: string;
  /** Metodele acoperite, ca etichete pe card. Alimentează și căutarea. */
  metode: string[];
  dificultate: Dificultate;
  /** Fișierele din `cursuri_MN/` din care se ia conținutul — singura sursă admisă. */
  cursSursa: string[];
  /**
   * `false` dacă pagina **nu primește** clip, prin decizie — nu „încă nu
   * are". Atunci secțiunea „Vizual" lipsește cu totul din pagină: fără schelet,
   * fără text de așteptare (vezi regula despre stările de progres din
   * `CLAUDE.md`).
   *
   * Implicit toate paginile au clip; se scrie explicit doar excepția.
   */
  clip?: boolean;
  /**
   * `false` dacă pagina **nu primește** interfață interactivă, prin decizie — nu
   * „încă nu are". Ca la `clip`, atunci secțiunea „Interactiv" lipsește cu
   * totul: fără schelet, fără text de așteptare.
   *
   * Implicit toate paginile au interfață; se scrie explicit doar excepția.
   */
  interactiv?: boolean;
  /** `false` cât timp pagina e doar schelet. */
  gata: boolean;
};

/**
 * Secțiunile cuprinsului, în ordinea în care apar pe pagină.
 *
 * „Vectori și valori proprii" s-a desprins din „Metode liniare",
 * care ajunsese să țină jumătate din site. Grupul e coerent de la sine: toate
 * patru caută perechi vector–factor de scalare pentru o matrice (metodele
 * puterii și PageRank iterativ, QR prin factorizări repetate), iar DVS le duce
 * pe matrice dreptunghiulare, unde valorile proprii nu mai există.
 *
 * „Norme, Householder, Givens, Gram-Schmidt" **rămâne** la metode liniare: acolo
 * ortogonalitatea e unealtă pentru rezolvat sisteme, nu scop.
 */
export const SECTIUNI: Record<Sectiune, { titlu: string; ordine: number }> = {
  liniare: { titlu: "Metode liniare", ordine: 1 },
  // Stă imediat după metodele liniare, adică exact unde stăteau paginile 8–11
  // înainte să se desprindă: cine răsfoiește cuprinsul le găsește în același loc.
  "valori-proprii": { titlu: "Vectori și valori proprii", ordine: 2 },
  neliniare: { titlu: "Metode neliniare", ordine: 3 },
  "interpolare-integrare": { titlu: "Interpolare, integrare și ODE", ordine: 4 },
};

/**
 * Capitole largi, nu unul per pagină. Capitolul apare ca supratitlu pe pagina
 * metodei; secțiunea lui dă grupul din cuprins.
 */
export const CAPITOLE: Record<Capitol, { titlu: string; ordine: number; sectiune: Sectiune }> = {
  "sisteme-liniare": { titlu: "Sisteme liniare", ordine: 1, sectiune: "liniare" },
  ortogonalitate: {
    titlu: "Norme și ortogonalitate",
    ordine: 2,
    sectiune: "liniare",
  },
  "valori-proprii": {
    titlu: "Valori proprii și valori singulare",
    ordine: 3,
    sectiune: "valori-proprii",
  },
  "ecuatii-optimizare": {
    titlu: "Ecuații neliniare și optimizare",
    ordine: 4,
    sectiune: "neliniare",
  },
  "interpolare-aproximare": {
    titlu: "Interpolare și aproximare",
    ordine: 5,
    sectiune: "interpolare-integrare",
  },
  "integrare-ode": {
    titlu: "Integrare și ecuații diferențiale",
    ordine: 6,
    sectiune: "interpolare-integrare",
  },
};

export const ALGORITMI: IntrareAlgoritm[] = [
  {
    slug: "factorizari-lu",
    numar: 1,
    titlu: "Factorizare LU",
    capitol: "sisteme-liniare",
    descriere:
      "De ce Cramer devine imposibil pe matrici mari și cum spargerea în L și U rezolvă același sistem cu mult mai puțină muncă.",
    metode: ["Cramer", "LU", "Doolittle", "Crout", "Cholesky"],
    dificultate: "mediu",
    cursSursa: ["MN_curs2_lab2_matrici.md", "sisteme_liniare_metode_directe_MN_curs4.md"],
    interactiv: false,
    gata: false,
  },
  {
    slug: "norme-si-ortogonalitate",
    numar: 2,
    titlu: "Householder și Givens",
    capitol: "ortogonalitate",
    descriere:
      "Două feluri de a face zerouri fără să strici lungimile: o oglindă aleasă anume și o rotație în planul a două linii.",
    metode: ["Householder", "Givens", "Reflexii", "Rotații plane", "Descompunerea QR"],
    dificultate: "mediu",
    cursSursa: ["curs3_ortogonalitate.md", "MN_curs2_lab2_matrici.md"],
    // Clipurile stau în teorie, lipite de metoda lor (`CLIPURI_IN_TEORIE`), nu
    // într-o secțiune „Vizual" de sus.
    clip: false,
    gata: false,
  },
  {
    slug: "eliminare-gaussiana",
    numar: 3,
    titlu: "Eliminare gaussiană și pivotări",
    capitol: "sisteme-liniare",
    descriere:
      "Eliminarea gaussiană văzută pe matrice, plus ce aduce în plus și cât costă fiecare tip de pivotare.",
    metode: ["Eliminare gaussiană", "Pivotare parțială", "Pivot scalat", "Pivotare totală"],
    dificultate: "mediu",
    cursSursa: ["sisteme_liniare_metode_directe_MN_curs4.md"],
    gata: false,
  },
  {
    slug: "algoritmul-thomas",
    numar: 4,
    titlu: "Algoritmul Thomas (sisteme tridiagonale)",
    capitol: "sisteme-liniare",
    descriere:
      "Aceeași eliminare, dar pe trei diagonale: patru vectori în loc de o matrice și O(n) operații în loc de O(n³).",
    metode: [
      "Sisteme tridiagonale",
      "Eliminare înainte",
      "Substituție înapoi",
      "Dominanță diagonală",
    ],
    dificultate: "ușor",
    cursSursa: ["sisteme_liniare_metode_directe_MN_curs4.md"],
    // Fără interfață interactivă, prin decizie: metoda are un singur drum, fără
    // parametri de ales, iar clipul îl arată în întregime — pas de eliminare,
    // apoi substituția înapoi. Pe pagină rămân clipul și teoria.
    interactiv: false,
    gata: false,
  },
  {
    slug: "metode-iterative",
    numar: 5,
    titlu: "Jacobi, Gauss-Seidel, SOR",
    capitol: "sisteme-liniare",
    descriere:
      "Trei moduri de a te apropia de soluție prin repetiție, cu formula alături de matricea care se schimbă la fiecare pas.",
    metode: ["Jacobi", "Gauss-Seidel", "SOR", "Convergență"],
    dificultate: "mediu",
    cursSursa: ["sisteme_liniare_metode_iterative_MN_curs5.md"],
    // Interfața a fost construită și scoasă la cerere; pe pagină rămâne clipul.
    interactiv: false,
    gata: false,
  },
  {
    slug: "ecuatii-neliniare",
    numar: 6,
    titlu: "Puncte fixe, bisecție, Newton, secantă",
    capitol: "ecuatii-optimizare",
    descriere:
      "Cauți rădăcina unei funcții pe un interval: alegi metoda, tragi de capete și vezi cât de repede se strânge fiecare.",
    metode: ["Puncte fixe", "Bisecție", "Newton (tangentei)", "Secantă", "Ordin de convergență"],
    dificultate: "ușor",
    cursSursa: ["ecuatii_neliniare_MN_curs6.md", "sisteme_liniare_metode_iterative_MN_curs5.md"],
    // Singura pagină fără clip. Bisecția se înțelege trăgând de capetele
    // intervalului, iar un film ar arăta exact ce face interfața, doar că fără
    // să-l poți opri. Decizia e în `Plan.md` și în `CLAUDE.md`.
    clip: false,
    gata: false,
  },
  {
    slug: "metode-de-gradient",
    numar: 7,
    titlu: "Gradient Descendent, Gradient Conjugat",
    capitol: "ecuatii-optimizare",
    descriere:
      "Coborârea într-o vale: de ce pasul cel mai abrupt coboară de-a curmezișul și cum îl îndreaptă direcțiile conjugate.",
    metode: ["Gradient Descendent", "Gradient Conjugat", "Precondiționare"],
    dificultate: "greu",
    cursSursa: ["ecuatii_neliniare_MN_curs6.md", "sisteme_liniare_metode_iterative_MN_curs5.md"],
    gata: false,
  },
  {
    slug: "metodele-puterii",
    numar: 8,
    titlu: "Metodele puterii, Rayleigh, deflație",
    capitol: "valori-proprii",
    descriere:
      "Cum scoate o simplă înmulțire repetată valoarea proprie dominantă și cum ajungi la celelalte, prin puterea inversă și deflație.",
    metode: ["Metoda puterii", "Puterea inversă", "Iterarea Rayleigh", "Deflație"],
    dificultate: "greu",
    cursSursa: ["valori_vectori_proprii_teorie_curs7.md"],
    gata: false,
  },
  {
    slug: "pagerank",
    numar: 9,
    titlu: "Algoritmul PageRank",
    capitol: "valori-proprii",
    descriere:
      "Importanța unei pagini web ca vector propriu pentru λ = 1 al matricei Google — adică metoda puterii, aplicată pe un graf de linkuri.",
    metode: ["Matrice stocastică", "Matricea Google", "Metoda puterii", "Deflație pe blocuri"],
    dificultate: "mediu",
    cursSursa: ["valori_vectori_proprii_teorie_curs7.md"],
    // Pagina se sprijină pe clip și pe teorie; interfața interactivă a fost
    // construită și scoasă prin decizie, deci secțiunea nu se pune deloc.
    interactiv: false,
    gata: false,
  },
  {
    slug: "algoritmul-qr",
    numar: 10,
    titlu: "Algoritmul QR și valorile proprii",
    capitol: "valori-proprii",
    descriere:
      "Ce înseamnă de fapt Q și R și de ce, repetând factorizarea, matricea se apropie de o formă din care se citesc toate valorile proprii deodată.",
    metode: [
      "Algoritmul QR",
      "Factorizare QR",
      "Matrice de rotație",
      "QR cu deplasare",
      "Deplasare explicită",
      "Deplasare QR dublă",
      "Formă simetrică tridiagonală",
      "Formă Hessenberg superioară",
      "Householder",
      "Valori proprii",
    ],
    dificultate: "greu",
    cursSursa: ["qr_dvs_teorie_curs8.md", "curs3_ortogonalitate.md"],
    // Ca la pagina 9: pagina se sprijină pe clip și pe teorie, iar interfața
    // interactivă lipsește **prin decizie**, nu „încă". Deci secțiunea nu se
    // pune deloc — fără schelet, fără text de așteptare.
    interactiv: false,
    gata: false,
  },
  {
    slug: "dvs",
    numar: 11,
    titlu: "Descompunerea valorilor singulare (DVS)",
    capitol: "valori-proprii",
    descriere:
      "Orice matrice, chiar și dreptunghiulară, se scrie ca o rotație, o întindere pe axe și încă o rotație — de unde ies valorile singulare și la ce sunt bune.",
    metode: [
      "DVS",
      "SVD",
      "Descompunerea valorilor singulare",
      "Valori singulare",
      "Matrice ortogonală",
      "Rang",
      "Nucleu",
      "Gram-Schmidt",
    ],
    dificultate: "greu",
    cursSursa: ["qr_dvs_teorie_curs8.md", "curs3_ortogonalitate.md"],
    // Pagina se sprijină pe clip și pe teorie, prin decizie: geometria
    // cerc → elipsă se vede din clip, iar secțiunea „Interactiv" nu se pune.
    interactiv: false,
    gata: false,
  },
  {
    slug: "interpolare-polinomiala",
    numar: 12,
    titlu: "Lagrange, Neville, funcția Runge, spline",
    capitol: "interpolare-aproximare",
    descriere:
      "Îți alegi punctele, iar polinomul le trece prin toate — până când funcția Runge arată de ce era nevoie de spline-uri.",
    metode: ["Lagrange", "Neville", "Diferențe divizate", "Newton", "Hermite", "Runge", "Spline"],
    dificultate: "mediu",
    cursSursa: ["interpolare_spline_bezier_teorie_curs09.md"],
    gata: false,
  },
  {
    slug: "curbe-bezier",
    numar: 13,
    titlu: "Curbe Bézier, algoritmul de Casteljau",
    capitol: "interpolare-aproximare",
    descriere:
      "Tragi de punctele de control și curba te urmează: construcția de Casteljau, în plan și în spațiu.",
    metode: ["Curbe Bézier", "Polinoame Bernstein", "de Casteljau", "2D / 3D"],
    dificultate: "ușor",
    cursSursa: ["interpolare_spline_bezier_teorie_curs09.md"],
    gata: false,
  },
  {
    slug: "fft",
    numar: 14,
    titlu: "Transformata Fourier rapidă (FFT)",
    capitol: "interpolare-aproximare",
    descriere:
      "Cum coboară interpolarea trigonometrică de la 4m² operații la O(m log m): coeficienții complecși și pasul de înjumătățire.",
    metode: [
      "FFT",
      "Cooley-Tukey",
      "Coeficienți complecși",
      "Interpolare trigonometrică",
      "Pasul de înjumătățire",
    ],
    dificultate: "greu",
    cursSursa: ["cmmp_rationale_fft_teorie_curs10.md"],
    // Fără interfață interactivă, prin decizie: clipul din secțiunea „Vizual"
    // duce singur povestea, iar teoria o scrie în formule.
    interactiv: false,
    gata: true,
  },
  {
    slug: "derivare-numerica",
    numar: 15,
    titlu: "Derivare numerică",
    capitol: "integrare-ode",
    descriere:
      "Panta tangentei, aproximată prin panta unei secante: ce câștigi micșorând pasul h și de unde apare eroarea de rotunjire.",
    metode: [
      "Formula two-point",
      "Derivare înainte",
      "Derivare înapoi",
      "Formule cu 3 puncte",
      "Eroare de rotunjire",
    ],
    dificultate: "ușor",
    cursSursa: ["derivare-integrare-numerica_curs11.md"],
    // Clipul a fost construit și scos la cerere; pagina rămâne cu interfața.
    clip: false,
    gata: false,
  },
  {
    slug: "newton-cotes",
    numar: 16,
    titlu: "Newton-Cotes: trapeze și Simpson",
    capitol: "integrare-ode",
    descriere:
      "Aria de sub grafic, aproximată pe noduri echidistante cu trapeze și cu parabole, plus ce câștigă formulele compuse.",
    metode: [
      "Cuadratură numerică",
      "Newton-Cotes",
      "Trapeze",
      "Simpson",
      "Formule compuse",
      "Formule închise și deschise",
    ],
    dificultate: "ușor",
    cursSursa: ["derivare-integrare-numerica_curs11.md"],
    // Fără secțiune „Vizual" cât timp clipul nu e scris. Scheletul care ținea
    // locul era tocmai lucrul pe care regula stărilor de progres îl interzice:
    // o casetă goală în capul paginii spune tăcut „aici lipsește ceva". Evidența
    // a ce urmează stă în `Progress.md`; steagul se scoate când apare clipul.
    clip: false,
    gata: false,
  },
  {
    slug: "cuadraturi-adaptive-si-gaussiene",
    numar: 17,
    titlu: "Cuadraturi adaptive și cuadraturi Gaussiene",
    capitol: "integrare-ode",
    descriere:
      "Unde își împarte Simpson intervalul când eroarea e prea mare și de ce nodurile Gaussiene nu sunt echidistante.",
    metode: [
      "Cuadraturi adaptive",
      "Simpson adaptiv",
      "Cuadraturi Gaussiene",
      "Polinoame ortogonale",
      "Legendre",
      "Gauss-Radau",
    ],
    dificultate: "greu",
    cursSursa: ["romberg-cuadraturi-gaussiene_curs12.md"],
    // Fără secțiune „Vizual", prin decizie: cele două metode se înțeleg trăgând
    // de toleranță și de numărul de noduri, iar un clip ar arăta exact ce face
    // interfața, doar că fără să-l poți opri unde vrei.
    clip: false,
    gata: true,
  },
  {
    slug: "ecuatii-diferentiale",
    numar: 18,
    titlu: "ODE: problema Cauchy, Euler, Runge-Kutta",
    capitol: "integrare-ode",
    descriere:
      "Pornești dintr-un singur punct și urmezi panta: de la pasul stângaci al lui Euler la precizia lui Runge-Kutta.",
    metode: ["Problema Cauchy", "Lipschitz", "Euler", "Taylor", "Runge-Kutta"],
    dificultate: "mediu",
    cursSursa: ["ode-runge-kutta_curs13.md"],
    // Fără secțiune „Interactiv", prin decizie. Clipul duce singur povestea, de
    // la câmpul de direcții până la RK4, iar ce ar putea schimba cititorul —
    // pasul, metoda — se vede deja acolo, comparat cu soluția exactă. Un panou
    // de parametri ar repeta clipul, fără să adauge o întrebare nouă.
    interactiv: false,
    gata: true,
  },
];

/**
 * Câte pagini are site-ul. Se citește de aici oriunde apare cifra în text
 * („Pagina 3 din 18"), ca să nu rămână un număr scris de mână în urmă când lista
 * se mai sparge o dată.
 */
export const NUMAR_PAGINI = ALGORITMI.length;

/** Pagina cu slug-ul dat, sau `undefined` dacă ruta e greșită. */
export function getAlgoritm(slug: string | undefined): IntrareAlgoritm | undefined {
  return ALGORITMI.find((a) => a.slug === slug);
}

/**
 * Paginile grupate pe secțiuni, gata de afișat în cuprins: secțiunile
 * în ordinea din `SECTIUNI`, iar în interior paginile în ordinea din `Plan.md`.
 */
export function getAlgoritmiPeSectiuni() {
  return (Object.keys(SECTIUNI) as Sectiune[])
    .sort((a, b) => SECTIUNI[a].ordine - SECTIUNI[b].ordine)
    .map((sectiune) => ({
      sectiune,
      titlu: SECTIUNI[sectiune].titlu,
      algoritmi: ALGORITMI.filter((a) => CAPITOLE[a.capitol].sectiune === sectiune).sort(
        (a, b) => a.numar - b.numar,
      ),
    }));
}

/**
 * Doar secțiunile cuprinsului, fără paginile din ele: numele, ancora și câte
 * metode ține fiecare.
 *
 * Există ca subsolul și cuprinsul de pe telefon să nu poată ajunge niciodată să
 * scrie liste diferite. Amândouă citeau din `SECTIUNI`, deci n-ar fi avut cum să
 * se depărteze, dar legătura era una pe care trebuia s-o observi din două
 * fișiere; aici e scrisă o dată.
 */
export function getSectiuni() {
  return getAlgoritmiPeSectiuni().map(({ sectiune, titlu, algoritmi }) => ({
    id: sectiune,
    titlu,
    numarMetode: algoritmi.length,
  }));
}

/**
 * Vecinii pentru navigația de la finalul unei pagini, în ordinea din `Plan.md`
 * — adică strict după `numar`, nu după grupurile din cuprins.
 *
 * Cele două nu coincid: cuprinsul strânge paginile pe secțiuni, deci după
 * pagina 5 („Metode liniare") vine pagina 6, care e la „Metode neliniare", iar
 * după 7 se sare la „Vectori și valori proprii" cu pagina 8. E
 * intenționat — numerotarea urmează ordinea cursului, iar gruparea din cuprins e
 * doar ajutor de răsfoit.
 */
export function getVecini(numar: number) {
  return {
    anterior: ALGORITMI.find((a) => a.numar === numar - 1),
    urmator: ALGORITMI.find((a) => a.numar === numar + 1),
  };
}

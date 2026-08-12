/**
 * Registrul celor 14 pagini tematice — sursa unică de adevăr pentru cuprins,
 * rute și navigația dintre pagini.
 *
 * Împărțirea, titlurile și metodele vin din `Plan.md` („Lista Algoritmi") și din
 * tabelul „Lista paginilor" din `Progress.md`, Faza 7. Nu se inventează pagini noi
 * aici: dacă se schimbă lista, se schimbă întâi `Plan.md`.
 */

export type Dificultate = "ușor" | "mediu" | "greu";

/** Cele trei grupuri din cuprins. Un capitol aparține exact unei secțiuni. */
export type Sectiune = "liniare" | "neliniare" | "interpolare-integrare";

export type Capitol =
  | "sisteme-liniare"
  | "ortogonalitate-valori-proprii"
  | "ecuatii-optimizare"
  | "interpolare-aproximare"
  | "integrare-ode";

export type IntrareAlgoritm = {
  /** Ultimul segment din rută: `/algoritm/:slug`. */
  slug: string;
  /** 1–14, ordinea din `Plan.md`. Dă și ordinea în cuprins și navigația înainte/înapoi. */
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
  /** `false` cât timp pagina e doar schelet. */
  gata: boolean;
};

/** Cele trei secțiuni ale cuprinsului, în ordinea în care apar pe pagină. */
export const SECTIUNI: Record<Sectiune, { titlu: string; ordine: number }> = {
  liniare: { titlu: "Metode liniare", ordine: 1 },
  neliniare: { titlu: "Metode neliniare", ordine: 2 },
  "interpolare-integrare": { titlu: "Interpolare, integrare și ODE", ordine: 3 },
};

/**
 * Capitole largi, nu unul per pagină. Capitolul apare ca supratitlu pe pagina
 * metodei; secțiunea lui dă grupul din cuprins.
 */
export const CAPITOLE: Record<Capitol, { titlu: string; ordine: number; sectiune: Sectiune }> = {
  "sisteme-liniare": { titlu: "Sisteme liniare", ordine: 1, sectiune: "liniare" },
  "ortogonalitate-valori-proprii": {
    titlu: "Ortogonalitate și valori proprii",
    ordine: 2,
    sectiune: "liniare",
  },
  "ecuatii-optimizare": {
    titlu: "Ecuații neliniare și optimizare",
    ordine: 3,
    sectiune: "neliniare",
  },
  "interpolare-aproximare": {
    titlu: "Interpolare și aproximare",
    ordine: 4,
    sectiune: "interpolare-integrare",
  },
  "integrare-ode": {
    titlu: "Integrare și ecuații diferențiale",
    ordine: 5,
    sectiune: "interpolare-integrare",
  },
};

export const ALGORITMI: IntrareAlgoritm[] = [
  {
    slug: "factorizari-lu",
    numar: 1,
    titlu: "Cramer, LU, Doolittle, Crout, Cholesky",
    capitol: "sisteme-liniare",
    descriere:
      "De ce Cramer devine imposibil pe matrici mari și cum spargerea în L și U rezolvă același sistem cu mult mai puțină muncă.",
    metode: ["Cramer", "LU", "Doolittle", "Crout", "Cholesky"],
    dificultate: "mediu",
    cursSursa: ["MN_curs2_lab2_matrici.md", "sisteme_liniare_metode_directe_MN_curs4.md"],
    gata: false,
  },
  {
    slug: "norme-si-ortogonalitate",
    numar: 2,
    titlu: "Norme, Householder, Givens, Gram-Schmidt",
    capitol: "ortogonalitate-valori-proprii",
    descriere:
      "Ce măsoară o normă, cum arată o reflexie și o rotație pe axe și cum se construiește pas cu pas o bază ortogonală.",
    metode: ["Norme vectoriale", "Norme matriceale", "Householder", "Givens", "Gram-Schmidt"],
    dificultate: "mediu",
    cursSursa: ["curs3_ortogonalitate.md", "MN_curs2_lab2_matrici.md"],
    gata: false,
  },
  {
    slug: "eliminare-gaussiana",
    numar: 3,
    titlu: "Eliminare gaussiană (pivotări), algoritmul Thomas",
    capitol: "sisteme-liniare",
    descriere:
      "Eliminarea gaussiană văzută pe matrice, plus ce aduce în plus fiecare tip de pivotare și de ce Thomas e atât de rapid pe matrici tridiagonale.",
    metode: [
      "Eliminare gaussiană",
      "Pivotare parțială",
      "Pivot scalat",
      "Pivotare totală",
      "Thomas",
    ],
    dificultate: "mediu",
    cursSursa: ["sisteme_liniare_metode_directe_MN_curs4.md"],
    gata: false,
  },
  {
    slug: "metode-iterative",
    numar: 4,
    titlu: "Jacobi, Gauss-Seidel, SOR",
    capitol: "sisteme-liniare",
    descriere:
      "Trei moduri de a te apropia de soluție prin repetiție, cu formula alături de matricea care se schimbă la fiecare pas.",
    metode: ["Jacobi", "Gauss-Seidel", "SOR", "Convergență"],
    dificultate: "mediu",
    cursSursa: ["sisteme_liniare_metode_iterative_MN_curs5.md"],
    gata: false,
  },
  {
    slug: "ecuatii-neliniare",
    numar: 5,
    titlu: "Puncte fixe, bisecție, Newton, secantă",
    capitol: "ecuatii-optimizare",
    descriere:
      "Cauți rădăcina unei funcții pe un interval: alegi metoda, tragi de capete și vezi cât de repede se strânge fiecare.",
    metode: ["Puncte fixe", "Bisecție", "Newton (tangentei)", "Secantă", "Ordin de convergență"],
    dificultate: "ușor",
    cursSursa: ["ecuatii_neliniare_MN_curs6.md", "sisteme_liniare_metode_iterative_MN_curs5.md"],
    gata: false,
  },
  {
    slug: "metode-de-gradient",
    numar: 6,
    titlu: "Gradient descendent, gradient conjugat",
    capitol: "ecuatii-optimizare",
    descriere:
      "Coborârea într-o vale: de ce pasul cel mai abrupt zigzaghează și cum îl îndreaptă direcțiile conjugate.",
    metode: ["Gradient descendent", "Gradient conjugat", "Precondiționare"],
    dificultate: "greu",
    cursSursa: ["ecuatii_neliniare_MN_curs6.md", "sisteme_liniare_metode_iterative_MN_curs5.md"],
    gata: false,
  },
  {
    slug: "metodele-puterii",
    numar: 7,
    titlu: "Metodele puterii, Rayleigh, deflație, PageRank",
    capitol: "ortogonalitate-valori-proprii",
    descriere:
      "Cum scoate o simplă înmulțire repetată valoarea proprie dominantă și unde ajunge ideea: în algoritmul PageRank.",
    metode: [
      "Matrici asemenea",
      "Metoda puterii",
      "Puterea inversă",
      "Iterarea Rayleigh",
      "Deflație",
      "PageRank",
    ],
    dificultate: "greu",
    cursSursa: ["valori_vectori_proprii_teorie_curs7.md"],
    gata: false,
  },
  {
    slug: "qr-si-dvs",
    numar: 8,
    titlu: "Algoritmul QR și DVS",
    capitol: "ortogonalitate-valori-proprii",
    descriere:
      "Ce înseamnă de fapt Q și R, la ce e bună o matrice ortogonală și cum descompune DVS orice matrice.",
    metode: ["Algoritmul QR", "QR cu deplasare", "Rotații", "DVS (SVD)"],
    dificultate: "greu",
    cursSursa: ["qr_dvs_teorie_curs8.md", "curs3_ortogonalitate.md"],
    gata: false,
  },
  {
    slug: "interpolare-polinomiala",
    numar: 9,
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
    numar: 10,
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
    slug: "cmmp-si-fft",
    numar: 11,
    titlu: "Aproximare CMMP, transformata Fourier rapidă",
    capitol: "interpolare-aproximare",
    descriere:
      "Dreapta care trece „cel mai aproape” de un nor de puncte și, mai departe, descompunerea unui semnal în frecvențe.",
    metode: ["CMMP liniar", "CMMP polinomial", "Spații prehilbertiene", "Padé", "FFT"],
    dificultate: "greu",
    cursSursa: ["cmmp_rationale_fft_teorie_curs10.md"],
    gata: false,
  },
  {
    slug: "derivare-si-integrare",
    numar: 12,
    titlu: "Derivare numerică, Newton-Cotes (trapeze, Simpson)",
    capitol: "integrare-ode",
    descriere:
      "Aria de sub grafic, aproximată cu trapeze și parabole: vezi cum scade eroarea când crești numărul de subintervale.",
    metode: ["Derivare numerică", "Newton-Cotes", "Trapeze", "Simpson", "Formule compuse"],
    dificultate: "ușor",
    cursSursa: ["derivare-integrare-numerica_curs11.md"],
    gata: false,
  },
  {
    slug: "romberg-si-cuadraturi",
    numar: 13,
    titlu: "Romberg, cuadraturi adaptive, cuadraturi Gaussiene",
    capitol: "integrare-ode",
    descriere:
      "Cum stoarce extrapolarea Richardson precizie dintr-un tabel de trapeze și de ce nodurile Gaussiene nu sunt echidistante.",
    metode: ["Richardson", "Romberg", "Cuadraturi adaptive", "Cuadraturi Gaussiene"],
    dificultate: "greu",
    cursSursa: ["romberg-cuadraturi-gaussiene_curs12.md"],
    gata: false,
  },
  {
    slug: "ecuatii-diferentiale",
    numar: 14,
    titlu: "ODE: problema Cauchy, Euler, Runge-Kutta",
    capitol: "integrare-ode",
    descriere:
      "Pornești dintr-un singur punct și urmezi panta: de la pasul stângaci al lui Euler la precizia lui Runge-Kutta.",
    metode: ["Problema Cauchy", "Lipschitz", "Euler", "Taylor", "Runge-Kutta", "Metode multipas"],
    dificultate: "mediu",
    cursSursa: ["ode-runge-kutta_curs13.md"],
    gata: false,
  },
];

/** Pagina cu slug-ul dat, sau `undefined` dacă ruta e greșită. */
export function getAlgoritm(slug: string | undefined): IntrareAlgoritm | undefined {
  return ALGORITMI.find((a) => a.slug === slug);
}

/**
 * Paginile grupate pe cele trei secțiuni, gata de afișat în cuprins: secțiunile
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

/** Vecinii din cuprins, pentru navigația de la finalul unei pagini. */
export function getVecini(numar: number) {
  return {
    anterior: ALGORITMI.find((a) => a.numar === numar - 1),
    urmator: ALGORITMI.find((a) => a.numar === numar + 1),
  };
}

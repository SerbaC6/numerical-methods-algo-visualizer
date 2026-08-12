/**
 * Rolurile vizuale ale proiectului: ce înseamnă fiecare culoare din desen.
 *
 * Sursa unică de adevăr. Variabilele CSS sunt definite în `src/index.css` și se
 * folosesc **și** în scenele Manim, ca desenul din browser și animația randată
 * să spună același lucru. Legenda își ia culorile tot de aici, deci nu poate
 * ajunge să mintă față de ce se vede pe ecran.
 *
 * Etichetele sunt cele implicite; o pagină le poate rescrie când în contextul ei
 * există un nume mai bun („intervalul [aₖ, bₖ]" în loc de „intervalul de căutare").
 */

/** Cum se desenează elementul în legendă — trebuie să semene cu ce e în figură. */
export type FormaLegenda = "linie" | "linie-punctata" | "punct" | "zona" | "celula";

export type RolViz = keyof typeof ROLURI_VIZ;

export const ROLURI_VIZ = {
  functie: {
    eticheta: "funcția",
    varCss: "--viz-functie",
    forma: "linie",
  },
  curent: {
    eticheta: "iterația curentă",
    varCss: "--viz-curent",
    forma: "punct",
  },
  anterior: {
    eticheta: "iterațiile anterioare",
    varCss: "--viz-anterior",
    forma: "punct",
  },
  interval: {
    eticheta: "intervalul de căutare",
    varCss: "--viz-interval",
    forma: "zona",
  },
  solutie: {
    eticheta: "soluția",
    varCss: "--viz-solutie",
    forma: "punct",
  },
  grila: {
    eticheta: "grilă și adnotări",
    varCss: "--viz-grila",
    forma: "linie-punctata",
  },
} as const satisfies Record<string, { eticheta: string; varCss: string; forma: FormaLegenda }>;

/** Culoarea unui rol, ca `var(--viz-...)` — de pus direct într-un `style` sau într-un SVG. */
export function culoareRol(rol: RolViz): string {
  return `var(${ROLURI_VIZ[rol].varCss})`;
}

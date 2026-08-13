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
  /**
   * Singurul rol cald din paletă. Pivotul e elementul cel mai important dintr-o
   * eliminare, deci trebuie să sară în ochi peste toate albastrurile — de-aia
   * are culoare proprie, nu o a treia nuanță de albastru.
   *
   * **Rolul e mai larg decât numele.** Pe lângă pivot, poartă și „punctul în
   * care iterația se blochează" — minimul local din animația paginii 7, unde
   * coborârea se oprește fără să fi găsit valea cea mai adâncă. E aceeași idee
   * vizuală (locul care decide rezultatul), iar eticheta se rescrie local acolo
   * unde se folosește. Extinderea e aprobată explicit; nu se lărgește mai
   * departe fără aceeași aprobare.
   *
   * **Pe grilă, roșul înseamnă exclusiv „pivot".** Erorile reale (pivot nul,
   * împărțire la zero, divergență) nu colorează celule, ci se scriu în
   * `Callout`: pivotul și `--eroare` au luminanțe aproape egale și s-ar
   * confunda pentru cine are daltonism roșu-verde.
   */
  pivot: {
    eticheta: "pivotul",
    varCss: "--viz-pivot",
    forma: "celula",
  },
  /**
   * Al doilea rol din afara albastrului, după `pivot`. Paranteza intervalului
   * se desenează exact peste curbă și peste punctul iterației curente, deci nu
   * poate fi tot albastră: s-ar topi în ele.
   *
   * Aceeași nuanță în ambele teme, schimbă doar luminozitatea: chihlimbar
   * (`#BE7434`) pe temă deschisă, portocaliu (`#F97B06`) pe cea întunecată, ca
   * fiecare să se desprindă de fundalul ei.
   *
   * Amândouă sunt domolite cât se poate fără să scadă sub 3:1 pe suprafață —
   * pragul WCAG pentru un element grafic — și amândouă trec
   * `scripts/verifica-daltonism.py` la distanță de cel puțin ΔE 25 față de
   * celelalte culori din același desen.
   *
   * Pe temă întunecată intervalul e cald ca și pivotul, deci separarea lor nu
   * se presupune, ci se măsoară în două locuri: ΔE 24,9 la simularea de
   * daltonism și 3,18:1 între banda la 20% și celula-pivot. Cele două nu apar
   * oricum pline în același desen — în grafic nu există pivot, iar în matrice
   * intervalul e doar fundal.
   *
   * Culoarea e **plină**: transparența o pune cine desenează (banda din grafic
   * la 14%, linia activă din `MatrixGrid` la 20%).
   *
   * **Rolul e mai larg decât numele**, ca și la `pivot`: portocaliul marchează
   * „ce se arată acum peste desen" — intervalul care se strânge la bisecție,
   * dar și tangenta cu săgeata pasului `α·r^(k)` din animația paginii 7. E
   * singura culoare caldă care rămâne lizibilă peste curbă și peste punctul
   * albastru al iterației, adică exact motivul pentru care există. Extinderea e
   * aprobată explicit; eticheta se rescrie local, la fiecare folosire.
   */
  interval: {
    eticheta: "intervalul de căutare",
    varCss: "--viz-interval",
    forma: "zona",
  },
  /**
   * Al treilea rol din afara albastrului. Verde (`#15803D`) pe temă deschisă,
   * alb-albăstrui (`#F2F5FA`) pe cea întunecată — acolo e singurul rol care se
   * separă prin **luminozitate**, nu prin nuanță: e punctul cel mai deschis din
   * desen.
   *
   * Nu e preferință, e ce a rămas. Nuanțele erau ocupate (albastrul ține trei
   * roluri, portocaliul intervalul, coralul pivotul), iar restul a picat la
   * `scripts/verifica-daltonism.py`. Verdele de dinainte trecea față de desen,
   * dar stătea la ΔE 16,8 față de coralul pivotului — amândouă devin gălbui la
   * deuteranopie.
   *
   * Fiind aproape de culoarea textului, marcajul trebuie să rămână distinct ca
   * **formă**, nu doar ca ton.
   */
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

/**
 * Rolurile care pot ajunge **scrise ca text** pe un desen — numele de lângă un
 * marcaj: „x₀", „a₀", „b₀". `grila` lipsește fiindcă e decor, nu marchează nimic
 * care să aibă nume.
 */
const ROLURI_CU_ETICHETA = [
  "functie",
  "curent",
  "anterior",
  "interval",
  "solutie",
  "pivot",
] as const;

type RolCuEticheta = (typeof ROLURI_CU_ETICHETA)[number];

/**
 * Culoarea cu care se **scrie** numele unui element, nu cu care se desenează.
 *
 * Sunt două lucruri diferite și e ușor de greșit: WCAG cere 4,5:1 pentru text de
 * corp obișnuit, dar doar 3:1 pentru un element grafic. Rolurile sunt calibrate
 * pentru desen, deci ca literă cad sub prag — safirul iterației curente ajungea
 * la 2,11:1 pe tema întunecată, adică exact ce interzice CLAUDE.md („safirul:
 * doar umplere, niciodată text").
 *
 * Eticheta păstrează nuanța rolului, ca legătura dintre numele „x₀" și punctul
 * lui să rămână vizibilă; se schimbă doar luminozitatea, în direcția cerută de
 * temă. Valorile stau în `src/index.css`, ca `--viz-*-eticheta`.
 *
 * Pentru un rol fără variantă de text (`grila`) se întoarce culoarea rolului:
 * n-are ce eticheta să poarte, iar o excepție aruncată aici ar rupe un desen
 * întreg pentru o problemă de contrast.
 */
export function culoareEticheta(rol: RolViz): string {
  return (ROLURI_CU_ETICHETA as readonly string[]).includes(rol)
    ? `var(${ROLURI_VIZ[rol as RolCuEticheta].varCss}-eticheta)`
    : culoareRol(rol);
}

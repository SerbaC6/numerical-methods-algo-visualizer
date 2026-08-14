/**
 * Peisajul pe care coboară animația paginii 7 și iterația care coboară pe el.
 *
 * **Nu e o metodă din curs și nu respectă contractul `meta`/`params`/`run`.**
 * Cursul definește gradientul Descendent pe `f(x) = ½xᵀAx − bᵀx`, cu
 * `r = b − Ax` și cu pasul `α` ales prin line search (curs 6, §4.1). Aici e
 * doar **intuiția** aceleiași idei, în dimensiunea 1: gradientul lui `f` e
 * `f′(x)`, direcția de scădere maximă e `−f′(x)`, iar iterația
 * `x^(k+1) = x^(k) + α·r^(k)` e chiar cea din curs, cu `α` ținut **fix** — ceea
 * ce animația spune explicit. Formulele cursului stau în teoria de sub clip.
 *
 * O cvadratică pozitiv definită are un singur minim, deci pe ea nu se poate
 * arăta lucrul pentru care există animația: că pasul cel mai abrupt te duce în
 * valea de lângă tine, nu neapărat în cea mai adâncă. De asta relieful are trei
 * dealuri și două văi.
 *
 * **Verificat numeric, separat de aplicație** (relieful e desen, dar cifrele
 * afișate lângă formulă tot cifre rămân). Pe `[−20, 20]`, minimele locale sunt
 * `(−8,578; 1,732)`, `(−2,847; 0,755)`, `(+2,633; 1,717)` și `(+8,033; 4,690)`,
 * iar `f → +∞` la ambele capete: valea de la `x ≈ −2,847` e **minimul global
 * adevărat**, nu doar cel mai adânc punct de pe ecran.
 *
 * > Înclinarea (`0,04·x²`) e mai mare decât în schița din care a pornit
 * > animația, unde era `0,02·x²`. Cu jumătatea aceea, `f(−8,5) = 0,289`
 * > cobora **sub** valea din stânga (`0,589`) chiar în cadrul desenat, iar
 * > minimul adevărat cădea în afara ecranului — eticheta „minim global" ar fi
 * > fost falsă.
 */

/** Un deal: înălțimea, unde e centrat și cât e de lat. */
type Deal = { inaltime: number; centru: number; latime: number };

const DEALURI: readonly Deal[] = [
  { inaltime: 3.2, centru: -5.6, latime: 1.4 },
  { inaltime: 3.8, centru: 0, latime: 1.4 },
  { inaltime: 3.0, centru: 5.6, latime: 1.4 },
];

/** Coeficienții înclinării de sub dealuri: `a·x² + b·x`. Ea face valea din stânga mai adâncă. */
const INCLINARE = { a: 0.04, b: 0.18 };

/** Relieful: trei clopote gaussiene peste o albie ușor înclinată. */
export function f(x: number): number {
  const dealuri = DEALURI.reduce(
    (s, d) => s + d.inaltime * Math.exp(-((x - d.centru) ** 2) / (2 * d.latime ** 2)),
    0,
  );
  return dealuri + INCLINARE.a * x * x + INCLINARE.b * x;
}

/** Derivata reliefului. Direcția de scădere maximă e `−f′(x)` — reziduul din curs, în 1D. */
export function df(x: number): number {
  const dealuri = DEALURI.reduce(
    (s, d) =>
      s -
      d.inaltime *
        ((x - d.centru) / d.latime ** 2) *
        Math.exp(-((x - d.centru) ** 2) / (2 * d.latime ** 2)),
    0,
  );
  return dealuri + 2 * INCLINARE.a * x + INCLINARE.b;
}

/**
 * Iterația `x^(k+1) = x^(k) + α·r^(k)`, cu `r^(k) = −f′(x^(k))` și `α` fix.
 *
 * Întoarce toate pozițiile, de la `x^(0)` la `x^(n)` — desenul are nevoie și de
 * cele vechi, ca să lase urma pașilor pe coastă.
 */
export function coboara(x0: number, alfa: number, pasi: number): number[] {
  const drum = [x0];
  let x = x0;
  for (let k = 0; k < pasi; k++) {
    x = x + alfa * -df(x);
    drum.push(x);
  }
  return drum;
}

/**
 * Vârfurile din interiorul unui interval, de la stânga la dreapta.
 *
 * Se caută în loc să fie scrise de mână fiindcă etichetele „deal 1/2/3" trebuie
 * să stea pe dealuri și după orice retușare a reliefului; centrele din
 * `DEALURI` nu sunt vârfurile lui `f`, care e suma lor plus înclinarea.
 */
export function varfuri(x0: number, x1: number, pas = 0.005): number[] {
  const gasite: number[] = [];
  for (let x = x0 + pas; x < x1 - pas; x += pas) {
    const stanga = df(x - pas);
    const dreapta = df(x + pas);
    const ultimul = gasite[gasite.length - 1];
    if (stanga > 0 && dreapta <= 0 && (ultimul === undefined || x - ultimul > 0.6)) {
      gasite.push(x);
    }
  }
  return gasite;
}

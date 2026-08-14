/**
 * Raza spectrală a matricei de iterație — criteriul de convergență din
 * `cursuri_MN/sisteme_liniare_metode_iterative_MN_curs5.md`, §3.1.
 *
 * Cursul spune că metoda converge dacă valorile proprii ale lui `G = M⁻¹N` sunt
 * subunitare în modul, deci pagina n-are ce arăta fără numărul ăsta: el separă
 * „merge" de „nu merge" înainte de prima iterație.
 *
 * **De ce în formă închisă și nu prin iterație.** Un `ρ` estimat cu metoda
 * puterii ar rata exact cazurile care contează: o pereche de valori proprii
 * complex conjugate domină la fel de bine ca una reală, dar metoda puterii nu
 * converge pe ea. Pentru `n ≤ 3` polinomul caracteristic se rezolvă exact —
 * pagina lucrează pe sisteme 3×3, ca exemplele din §10 —, iar peste `n = 3` se
 * întoarce `null`: mai bine niciun număr decât unul despre care nu poți spune
 * dacă e adevărat.
 *
 * Verificat împotriva valorilor proprii calculate cu `numpy.linalg.eigvals`
 * (vezi `scripts/verificare-algoritmi/metode-iterative.ts`).
 */

/** Rădăcinile polinomului caracteristic, ca module — semnul nu contează la `ρ`. */
export function moduleValoriProprii(M: number[][]): number[] | null {
  const n = M.length;
  if (n === 0 || M.some((linie) => linie.length !== n)) return null;

  if (n === 1) return [Math.abs(M[0]?.[0] ?? 0)];
  if (n === 2) return moduleCuadratica(M);
  if (n === 3) return moduleCubica(M);
  return null;
}

/**
 * `ρ(M) = max |λᵢ|`. `null` când nu se poate calcula exact.
 *
 * Sub 1 iterația converge pentru orice pornire, peste 1 diverge, iar la fix 1
 * se blochează — cazul din §10, problema 4, unde Jacobi oscilează la nesfârșit.
 */
export function razaSpectrala(M: number[][]): number | null {
  const module = moduleValoriProprii(M);
  if (!module || module.some((m) => !Number.isFinite(m))) return null;
  return Math.max(...module);
}

/** `λ² − tr·λ + det = 0`, cu rădăcini eventual complexe. */
function moduleCuadratica(M: number[][]): number[] {
  const [a, b] = [M[0]?.[0] ?? 0, M[0]?.[1] ?? 0];
  const [c, d] = [M[1]?.[0] ?? 0, M[1]?.[1] ?? 0];
  const tr = a + d;
  const det = a * d - b * c;
  const delta = tr * tr - 4 * det;

  if (delta >= 0) {
    const rad = Math.sqrt(delta);
    return [Math.abs((tr + rad) / 2), Math.abs((tr - rad) / 2)];
  }
  // Pereche complex conjugată: același modul pentru amândouă.
  const modul = Math.sqrt(det);
  return [modul, modul];
}

/**
 * `λ³ − tr·λ² + m₂·λ − det = 0`, unde `m₂` e suma minorilor principali 2×2.
 *
 * Se coboară la cubica redusă `t³ + a·t + b` cu `λ = t − p/3` și se aleg
 * formulele după discriminant: trigonometric când toate rădăcinile sunt reale
 * (cazul obișnuit aici, matricele fiind aproape simetrice), Cardano când una e
 * reală și celelalte două complex conjugate.
 */
function moduleCubica(M: number[][]): number[] {
  const m = (i: number, j: number) => M[i]?.[j] ?? 0;

  const tr = m(0, 0) + m(1, 1) + m(2, 2);
  const m2 =
    m(0, 0) * m(1, 1) -
    m(0, 1) * m(1, 0) +
    (m(0, 0) * m(2, 2) - m(0, 2) * m(2, 0)) +
    (m(1, 1) * m(2, 2) - m(1, 2) * m(2, 1));
  const det =
    m(0, 0) * (m(1, 1) * m(2, 2) - m(1, 2) * m(2, 1)) -
    m(0, 1) * (m(1, 0) * m(2, 2) - m(1, 2) * m(2, 0)) +
    m(0, 2) * (m(1, 0) * m(2, 1) - m(1, 1) * m(2, 0));

  const p = -tr;
  const q = m2;
  const r = -det;

  const a = q - (p * p) / 3;
  const b = (2 * p * p * p) / 27 - (p * q) / 3 + r;
  const deplasare = -p / 3;

  // a = 0 înseamnă cubică pură `t³ = −b`: cele trei rădăcini au același modul.
  if (Math.abs(a) < 1e-14) {
    const modul = Math.cbrt(Math.abs(b));
    const real = Math.cbrt(-b) + deplasare;
    // Celelalte două sunt rotite cu ±120°, deci se scriu direct.
    const parteReala = -Math.cbrt(-b) / 2 + deplasare;
    const parteImaginara = (Math.sqrt(3) / 2) * modul;
    const modulPereche = Math.hypot(parteReala, parteImaginara);
    return [Math.abs(real), modulPereche, modulPereche];
  }

  const delta = (b / 2) * (b / 2) + (a / 3) * (a / 3) * (a / 3);

  if (delta > 0) {
    // O rădăcină reală și o pereche complex conjugată (Cardano).
    const rad = Math.sqrt(delta);
    const u = Math.cbrt(-b / 2 + rad);
    const v = Math.cbrt(-b / 2 - rad);
    const real = u + v + deplasare;
    const parteReala = -(u + v) / 2 + deplasare;
    const parteImaginara = ((u - v) * Math.sqrt(3)) / 2;
    const modulPereche = Math.hypot(parteReala, parteImaginara);
    return [Math.abs(real), modulPereche, modulPereche];
  }

  // Trei rădăcini reale (forma trigonometrică; `a < 0` aici, altfel delta > 0).
  const razaCerc = 2 * Math.sqrt(-a / 3);
  const cosinus = ((3 * b) / (2 * a)) * Math.sqrt(-3 / a);
  const unghi = Math.acos(Math.min(1, Math.max(-1, cosinus)));
  return [0, 1, 2].map((k) =>
    Math.abs(razaCerc * Math.cos((unghi - 2 * Math.PI * k) / 3) + deplasare),
  );
}

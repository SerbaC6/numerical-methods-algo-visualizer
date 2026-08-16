/**
 * Formulele de cuadratură Newton-Cotes: trapeze, Simpson și punctul de mijloc.
 *
 * **Sursă: `cursuri_MN/derivare-integrare-numerica_curs11.md`**, partea de
 * integrare numerică — „Metode Newton-Cotes", „Formula trapezelor (N = 1)",
 * „Formula Simpson (N = 2)", „Formulele Newton-Cotes deschise particularizate"
 * și „Formule compuse". Nimic scris din memorie.
 *
 * **De ce o cuadratură, nu un `run(params)` cu pași de iterație.** Contractul
 * comun al proiectului (`src/algorithms/tipuri.ts`) descrie o metodă care se
 * apropie pas cu pas de un răspuns. Aici nu există așa ceva: rezultatul e o
 * sumă finită, calculată dintr-o dată. Ce se derulează pe ecran nu e o
 * iterație, ci **parcurgerea panourilor** — bucățile în care s-a tăiat
 * intervalul —, iar suma lor e gata din primul moment. De aceea pasul se
 * numește aici „panou", nu „iterație", și de aceea tipurile sunt proprii.
 *
 * **Formulele simple sunt cele compuse cu un singur panou.** Cursul le deduce
 * separat, dar `N = 1` la trapeze și `N = 2` la Simpson dau exact formulele
 * simple: `h/2·[f(a) + f(b)]` cu `h = b − a`, respectiv
 * `h/3·[f(a) + 4f((a+b)/2) + f(b)]` cu `h = (b − a)/2`. Verificat numeric în
 * `scripts/verificare-algoritmi/newton-cotes.ts`, tocmai ca să nu fie doar o
 * afirmație — de aici vine și posibilitatea de a trece de la simplu la compus
 * dintr-un singur cursor.
 */

import { latexNumar, zecimale } from "@/lib/numere";

/**
 * Cele trei formule.
 *
 * Primele două sunt **închise** (nodurile includ capetele `a` și `b`), a treia
 * e **deschisă** (nodurile stau strict înăuntru). Punctul de mijloc nu are filă
 * proprie în interfață — vezi comentariul de la `panouriMijloc`.
 */
export type IdCuadratura = "trapez" | "simpson" | "mijloc";

/** Un nod al formulei, cu coeficientul cu care intră în suma panoului. */
export type NodCuadratura = {
  x: number;
  y: number;
  /** Coeficientul din paranteza panoului: `1` și `1` la trapeze, `1, 4, 1` la Simpson. */
  coeficient: number;
};

/** O bucată din `[a, b]` pe care se aplică o dată formula simplă. */
export type PanouCuadratura = {
  /** Indicele panoului, de la 0. */
  indice: number;
  /** Capetele panoului. La Simpson un panou ține **două** subintervale. */
  a: number;
  b: number;
  noduri: NodCuadratura[];
  /** Cât adaugă panoul la sumă. Are semnul funcției, deci poate fi negativ. */
  contributie: number;
  /** Suma parțială după panoul acesta — coloana care crește în tabel. */
  cumulat: number;
  /**
   * Integrala adevărată **pe panoul acesta**, din primitivă. Lipsește dacă
   * primitiva nu s-a dat.
   *
   * Merită calculată separat, nu dedusă din eroarea totală: pe un panou eroarea
   * poate fi în plus, pe vecinul lui în minus, iar suma le ascunde. Coloana
   * asta e singurul loc din pagină în care se vede că formula nu greșește
   * uniform.
   */
  exactPanou?: number;
  /** `|exactPanou − contributie|`. */
  eroarePanou?: number;
  /** Ce se întâmplă pe panoul acesta, într-o propoziție. */
  explicatie: string;
  /** Formula panoului **cu numerele puse în ea**, în LaTeX. */
  latexPas: string;
  /** Ce părți din formula compusă se aprind pentru panoul acesta. */
  evidentiaza: string[];
};

export type RezultatCuadratura = {
  id: IdCuadratura;
  panouri: PanouCuadratura[];
  /** Toate nodurile folosite, în ordine — pentru desen și pentru tabel. */
  noduri: NodCuadratura[];
  /** Suma finală: aproximarea integralei. */
  aproximare: number;
  /** Valoarea adevărată, din primitivă. */
  exact: number;
  /** `|exact − aproximare|`. */
  eroare: number;
  /** Distanța dintre două noduri consecutive: `h = (b − a)/N`. */
  h: number;
  /** Numărul de subintervale în care s-a tăiat `[a, b]`. */
  n: number;
  /**
   * Marginea teoretică a erorii, din termenul de eroare al cursului.
   * `undefined` când derivata care intră în ea nu e mărginită pe interval.
   */
  margine?: number;
  /** `true` când formula e cea simplă: un singur panou. */
  esteSimpla: boolean;
};

// ── Nodurile ─────────────────────────────────────────────────────────────────

/**
 * Nodurile echidistante ale unei formule închise: `xᵢ = a + i·h`, `i = 0 : N`.
 *
 * `x` se calculează ca `a + (b − a)·i/N`, nu prin adunări repetate: adunarea
 * acumulează eroare, iar ultimul nod n-ar mai cădea exact pe `b`. La o
 * cuadratură asta se vede direct în rezultat, fiindcă ultimul panou ar avea
 * altă lățime decât celelalte.
 */
function abscise(a: number, b: number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  return out;
}

/**
 * Polinomul Lagrange de gradul doi prin cele trei noduri ale unui panou Simpson.
 *
 * E chiar `P₂` din deducerea formulei — arcul desenat peste panou **este**
 * polinomul din care iese `h/3·[f(x₀) + 4f(x₁) + f(x₂)]`. Se scrie aici, în
 * forma din curs, ca desenul și formula să nu poată ajunge să spună lucruri
 * diferite.
 */
export function parabolaPrin(noduri: readonly NodCuadratura[], x: number): number {
  const [p0, p1, p2] = noduri;
  if (!p0 || !p1 || !p2) return Number.NaN;
  return (
    (p0.y * ((x - p1.x) * (x - p2.x))) / ((p0.x - p1.x) * (p0.x - p2.x)) +
    (p1.y * ((x - p0.x) * (x - p2.x))) / ((p1.x - p0.x) * (p1.x - p2.x)) +
    (p2.y * ((x - p0.x) * (x - p1.x))) / ((p2.x - p0.x) * (p2.x - p1.x))
  );
}

// ── Panourile, formulă cu formulă ────────────────────────────────────────────

type ContextPanouri = {
  f: (x: number) => number;
  a: number;
  b: number;
  n: number;
  h: number;
};

/** `[0,25 ; 0,50]`, cum se scrie un interval în română. */
function intervalScris(a: number, b: number, cifre: number): string {
  return `[${zecimale(a, cifre)} ; ${zecimale(b, cifre)}]`;
}

/**
 * Câte zecimale se scriu în explicații și în formula pasului.
 *
 * Cu patru, două panouri vecine de pe un interval strâns ajung să afișeze
 * aceleași cifre, deși contribuie diferit — iar cine citește vede scris pe ecran
 * că formula a încetat să mai facă ceva.
 */
function cifreUtile(h: number): number {
  if (!Number.isFinite(h) || h <= 0) return 4;
  return Math.max(4, Math.min(8, Math.ceil(-Math.log10(h)) + 4));
}

/** Formula compusă a trapezelor, panou cu panou (§„Formula compusă a trapezelor"). */
function panouriTrapez(ctx: ContextPanouri): PanouCuadratura[] {
  const { f, n, h } = ctx;
  const x = abscise(ctx.a, ctx.b, n);
  const cifre = cifreUtile(h);
  const panouri: PanouCuadratura[] = [];
  let cumulat = 0;

  for (let i = 0; i < n; i++) {
    const stanga = x[i]!;
    const dreapta = x[i + 1]!;
    const noduri: NodCuadratura[] = [
      { x: stanga, y: f(stanga), coeficient: 1 },
      { x: dreapta, y: f(dreapta), coeficient: 1 },
    ];
    const contributie = (h / 2) * (noduri[0]!.y + noduri[1]!.y);
    cumulat += contributie;

    // Ce parte din formula compusă atinge panoul acesta: capetele intră o
    // singură dată, nodurile din interior de două ori — de-aia au coeficient 2.
    const evidentiaza = ["nc-h"];
    if (i === 0) evidentiaza.push("nc-capat-a");
    if (i === n - 1) evidentiaza.push("nc-capat-b");
    if (i > 0 || i < n - 1) evidentiaza.push("nc-suma");

    panouri.push({
      indice: i,
      a: stanga,
      b: dreapta,
      noduri,
      contributie,
      cumulat,
      explicatie:
        `Pe ${intervalScris(stanga, dreapta, cifre)} curba e înlocuită cu coarda dintre capete. ` +
        `Trapezul de sub ea contribuie cu ${zecimale(contributie, cifre)}; suma până aici e ${zecimale(cumulat, cifre)}.`,
      latexPas:
        `\\frac{h}{2}\\left[f(x_{${i}}) + f(x_{${i + 1}})\\right] = ` +
        `\\frac{${latexNumar(h, cifre)}}{2}\\left[${latexNumar(noduri[0]!.y, cifre)} + ${latexNumar(noduri[1]!.y, cifre)}\\right] = ` +
        `${latexNumar(contributie, cifre)}`,
      evidentiaza,
    });
  }

  return panouri;
}

/** Formula compusă Simpson, panou cu panou (§„Formula compusă Simpson"). */
function panouriSimpson(ctx: ContextPanouri): PanouCuadratura[] {
  const { f, n, h } = ctx;
  const x = abscise(ctx.a, ctx.b, n);
  const cifre = cifreUtile(h);
  const panouri: PanouCuadratura[] = [];
  const perechi = n / 2;
  let cumulat = 0;

  for (let j = 0; j < perechi; j++) {
    const i0 = 2 * j;
    const noduri: NodCuadratura[] = [
      { x: x[i0]!, y: f(x[i0]!), coeficient: 1 },
      { x: x[i0 + 1]!, y: f(x[i0 + 1]!), coeficient: 4 },
      { x: x[i0 + 2]!, y: f(x[i0 + 2]!), coeficient: 1 },
    ];
    const contributie = (h / 3) * (noduri[0]!.y + 4 * noduri[1]!.y + noduri[2]!.y);
    cumulat += contributie;

    // Nodul din mijlocul unui panou are întotdeauna indice impar, deci intră în
    // suma cu 4; capetele de panou din interiorul lui `[a, b]` au indice par și
    // intră în suma cu 2.
    const evidentiaza = ["nc-h", "nc-suma-impare"];
    if (j === 0) evidentiaza.push("nc-capat-a");
    if (j === perechi - 1) evidentiaza.push("nc-capat-b");
    if (i0 > 0 || i0 + 2 < n) evidentiaza.push("nc-suma-pare");

    panouri.push({
      indice: j,
      a: noduri[0]!.x,
      b: noduri[2]!.x,
      noduri,
      contributie,
      cumulat,
      explicatie:
        `Pe ${intervalScris(noduri[0]!.x, noduri[2]!.x, cifre)} curba e înlocuită cu parabola prin cele trei noduri. ` +
        `Aria de sub arc contribuie cu ${zecimale(contributie, cifre)}; suma până aici e ${zecimale(cumulat, cifre)}.`,
      latexPas:
        `\\frac{h}{3}\\left[f(x_{${i0}}) + 4f(x_{${i0 + 1}}) + f(x_{${i0 + 2}})\\right] = ` +
        `\\frac{${latexNumar(h, cifre)}}{3}\\left[${latexNumar(noduri[0]!.y, cifre)} + 4 \\cdot ${latexNumar(noduri[1]!.y, cifre)} + ${latexNumar(noduri[2]!.y, cifre)}\\right] = ` +
        `${latexNumar(contributie, cifre)}`,
      evidentiaza,
    });
  }

  return panouri;
}

/**
 * Formula compusă a punctului de mijloc — singura formulă **deschisă** de aici.
 *
 * **Notația diferă de a cursului, cifrele nu.** Cursul scrie panoul deschis cu
 * `n = 0` ca `2h·f(x₀)`, unde `h = (b − a)/(n + 2)` e jumătate din lățimea
 * panoului. Aici, ca la celelalte două formule, `h` e chiar lățimea panoului,
 * deci contribuția se scrie `h·f(mijloc)` — același număr, alt nume de literă
 * (`h_curs = h/2`). Termenul de eroare al cursului, `h_curs³/3·f″(ξ)`, devine
 * `h³/24·f″(ξ)`, iar cel compus, `(b − a)/6·h_curs²·f″(µ)`, devine
 * `(b − a)/24·h²·f″(µ)`.
 *
 * **Nu are filă în interfață**, tocmai din cauza asta: două file în care `h`
 * ar însemna lucruri diferite ar strica singurul lucru pe care cursorul de `N`
 * îl explică bine. Formula rămâne în teorie, scrisă în notația cursului, iar
 * codul de aici există ca să se poată verifica numeric ce scrie acolo.
 */
function panouriMijloc(ctx: ContextPanouri): PanouCuadratura[] {
  const { f, n, h } = ctx;
  const x = abscise(ctx.a, ctx.b, n);
  const cifre = cifreUtile(h);
  const panouri: PanouCuadratura[] = [];
  let cumulat = 0;

  for (let i = 0; i < n; i++) {
    const stanga = x[i]!;
    const dreapta = x[i + 1]!;
    const mijloc = (stanga + dreapta) / 2;
    const noduri: NodCuadratura[] = [{ x: mijloc, y: f(mijloc), coeficient: 1 }];
    const contributie = h * noduri[0]!.y;
    cumulat += contributie;

    panouri.push({
      indice: i,
      a: stanga,
      b: dreapta,
      noduri,
      contributie,
      cumulat,
      explicatie:
        `Pe ${intervalScris(stanga, dreapta, cifre)} curba e înlocuită cu valoarea din mijloc. ` +
        `Dreptunghiul contribuie cu ${zecimale(contributie, cifre)}; suma până aici e ${zecimale(cumulat, cifre)}.`,
      latexPas: `h \\cdot f(${latexNumar(mijloc, cifre)}) = ${latexNumar(h, cifre)} \\cdot ${latexNumar(noduri[0]!.y, cifre)} = ${latexNumar(contributie, cifre)}`,
      evidentiaza: ["nc-h", "nc-suma"],
    });
  }

  return panouri;
}

/**
 * Formula compusă, exact în forma tipărită în curs, cu părțile marcate.
 *
 * Marcajele `\htmlId` sunt chiar paralela formulă ↔ desen: fiecare panou aprinde
 * bucata din sumă la care contribuie, iar `evidentiaza` de pe panou spune care
 * sunt. Capetele intră o singură dată în paranteză, nodurile din interior de
 * două ori (la trapeze) sau alternativ cu 4 și cu 2 (la Simpson) — iar asta se
 * vede aprinzându-se, nu citind despre ea.
 *
 * Formula rămâne **simbolică**, cu `N` și `h` nescrise. Numerele stau în
 * formula panoului (`latexPas`): puse și aici, ar fi trebuit desfășurată o sumă
 * de patruzeci de termeni ca să spună același lucru.
 */
export function latexCompusa(id: IdCuadratura): string {
  if (id === "simpson") {
    return (
      "\\int_a^b f(x)\\,dx \\approx \\htmlId{nc-h}{\\frac{h}{3}}\\left[" +
      "\\htmlId{nc-capat-a}{f(a)} + \\htmlId{nc-capat-b}{f(b)}" +
      " + \\htmlId{nc-suma-impare}{4\\sum_{i=1}^{N/2} f(x_{2i-1})}" +
      " + \\htmlId{nc-suma-pare}{2\\sum_{i=1}^{N/2-1} f(x_{2i})}\\right]"
    );
  }
  if (id === "trapez") {
    return (
      "\\int_a^b f(x)\\,dx \\approx \\htmlId{nc-h}{\\frac{h}{2}}\\left[" +
      "\\htmlId{nc-capat-a}{f(a)} + \\htmlId{nc-capat-b}{f(b)}" +
      " + \\htmlId{nc-suma}{2\\sum_{i=1}^{N-1} f(a + ih)}\\right]"
    );
  }
  return (
    "\\int_a^b f(x)\\,dx \\approx \\htmlId{nc-h}{h}" +
    "\\htmlId{nc-suma}{\\sum_{i=0}^{N-1} f\\!\\left(a + \\left(i + \\tfrac{1}{2}\\right)h\\right)}"
  );
}

// ── Marginea de eroare ───────────────────────────────────────────────────────

/**
 * Cea mai mare valoare a lui `|g|` pe `[a, b]`, măsurată pe o grilă deasă.
 *
 * E o **măsurătoare pe eșantion**, nu supremumul demonstrat. Pentru funcțiile
 * paginii derivatele sunt monotone sau au un singur vârf, deci 2001 de puncte
 * le prind; iar `scripts/verificare-algoritmi/newton-cotes.ts` verifică pe
 * fiecare că eroarea chiar rămâne sub marginea calculată așa.
 *
 * Întoarce `undefined` dacă derivata iese nemărginită undeva pe interval — la
 * `√x` în zero e chiar cazul, iar atunci marginea cursului **nu există**, nu e
 * doar mare.
 */
function maximulModulului(
  g: (x: number) => number,
  a: number,
  b: number,
  esantioane = 2000,
): number | undefined {
  let max = 0;
  for (let i = 0; i <= esantioane; i++) {
    const valoare = Math.abs(g(a + ((b - a) * i) / esantioane));
    if (!Number.isFinite(valoare)) return undefined;
    if (valoare > max) max = valoare;
  }
  return max;
}

export type DerivateMarginire = {
  derivataDoi: (x: number) => number;
  derivataPatru: (x: number) => number;
};

/**
 * Marginea erorii formulei compuse, din termenii de eroare ai cursului:
 *
 * - trapeze: `(b − a)/12 · h² · max|f″|`;
 * - Simpson: `(b − a)/180 · h⁴ · max|f⁗|`;
 * - punct de mijloc: `(b − a)/24 · h² · max|f″|` (vezi `panouriMijloc` pentru
 *   trecerea de la `h` al cursului la `h` de aici).
 */
export function margineEroare(
  id: IdCuadratura,
  derivate: DerivateMarginire,
  a: number,
  b: number,
  n: number,
): number | undefined {
  const h = (b - a) / n;
  const lungime = Math.abs(b - a);

  if (id === "simpson") {
    const m4 = maximulModulului(derivate.derivataPatru, Math.min(a, b), Math.max(a, b));
    return m4 === undefined ? undefined : (lungime / 180) * h ** 4 * m4;
  }

  const m2 = maximulModulului(derivate.derivataDoi, Math.min(a, b), Math.max(a, b));
  if (m2 === undefined) return undefined;
  return id === "trapez" ? (lungime / 12) * h ** 2 * m2 : (lungime / 24) * h ** 2 * m2;
}

// ── Rularea ──────────────────────────────────────────────────────────────────

export type ParametriCuadratura = {
  id: IdCuadratura;
  f: (x: number) => number;
  a: number;
  b: number;
  /** Numărul de subintervale. La Simpson trebuie să fie par — vezi `normalizeazaN`. */
  n: number;
  /** Valoarea adevărată a integralei, din primitivă. */
  exact: number;
  derivate?: DerivateMarginire;
  /** Primitiva, dacă se vrea și eroarea calculată pe fiecare panou în parte. */
  primitiva?: (x: number) => number;
};

/**
 * `N` acceptabil pentru formula aleasă.
 *
 * Simpson lucrează pe **perechi** de subintervale, deci `N` par — cursul o cere
 * explicit înainte de formula compusă. Un `N` impar nu se refuză cu un mesaj de
 * eroare: se rotunjește în sus la următorul par, fiindcă utilizatorul trage de
 * un cursor, nu completează un formular.
 */
export function normalizeazaN(id: IdCuadratura, n: number): number {
  const intreg = Math.max(1, Math.round(n));
  if (id !== "simpson") return intreg;
  return intreg < 2 ? 2 : intreg % 2 === 0 ? intreg : intreg + 1;
}

export function ruleazaCuadratura(params: ParametriCuadratura): RezultatCuadratura {
  const { id, f, a, b, exact, derivate, primitiva } = params;
  const n = normalizeazaN(id, params.n);
  const h = (b - a) / n;
  const ctx: ContextPanouri = { f, a, b, n, h };

  const panouri =
    id === "trapez"
      ? panouriTrapez(ctx)
      : id === "simpson"
        ? panouriSimpson(ctx)
        : panouriMijloc(ctx);

  if (primitiva) {
    for (const panou of panouri) {
      panou.exactPanou = primitiva(panou.b) - primitiva(panou.a);
      panou.eroarePanou = Math.abs(panou.exactPanou - panou.contributie);
    }
  }

  const aproximare = panouri.reduce((suma, panou) => suma + panou.contributie, 0);

  return {
    id,
    panouri,
    noduri: noduriRezultat(id, panouri),
    aproximare,
    exact,
    eroare: Math.abs(exact - aproximare),
    h,
    n,
    margine: derivate ? margineEroare(id, derivate, a, b, n) : undefined,
    esteSimpla: panouri.length === 1,
  };
}

/**
 * Nodurile distincte ale întregii formule, în ordine.
 *
 * Panourile închise se ating în capete, deci nodul comun a două panouri vecine
 * apare de două ori în `panouri` — pe desen trebuie să fie un singur punct.
 * Coeficientul lui devine suma celor două, adică exact `2` din formula compusă
 * a trapezelor și `2` de la nodurile pare ale lui Simpson.
 */
function noduriRezultat(id: IdCuadratura, panouri: PanouCuadratura[]): NodCuadratura[] {
  if (id === "mijloc") return panouri.flatMap((panou) => panou.noduri);

  const out: NodCuadratura[] = [];
  for (const panou of panouri) {
    for (const nod of panou.noduri) {
      const ultim = out[out.length - 1];
      if (ultim && ultim.x === nod.x) {
        ultim.coeficient += nod.coeficient;
        continue;
      }
      out.push({ ...nod });
    }
  }
  return out;
}

/**
 * Conturul de sus al figurii desenate — chiar ce se integrează în locul curbei.
 *
 * La trapeze sunt coardele, deci nodurile ajung: între ele figura e o linie
 * dreaptă. La Simpson e arcul de parabolă, care trebuie eșantionat. La punctul
 * de mijloc e o scară: fiecare panou e plat, la înălțimea valorii din mijloc.
 *
 * Se întoarce **un singur** contur pentru toată figura, nu unul per panou:
 * desenat ca o singură arie, se vede că metoda înlocuiește curba pe tot
 * intervalul, nu că sunt `N` desene alăturate.
 */
export function conturAproximarii(
  rezultat: RezultatCuadratura,
  puncteDeArc = 20,
): { x: number; y: number }[] {
  if (rezultat.id === "trapez") {
    return rezultat.noduri.map((nod) => ({ x: nod.x, y: nod.y }));
  }

  if (rezultat.id === "mijloc") {
    return rezultat.panouri.flatMap((panou) => {
      const y = panou.noduri[0]?.y ?? Number.NaN;
      return [
        { x: panou.a, y },
        { x: panou.b, y },
      ];
    });
  }

  const out: { x: number; y: number }[] = [];
  for (const panou of rezultat.panouri) {
    for (let i = 0; i <= puncteDeArc; i++) {
      // Primul punct al fiecărui arc, în afară de cel dintâi, repetă ultimul
      // punct al arcului dinainte: sunt același nod, iar figura e continuă.
      if (i === 0 && out.length > 0) continue;
      const x = panou.a + ((panou.b - panou.a) * i) / puncteDeArc;
      out.push({ x, y: parabolaPrin(panou.noduri, x) });
    }
  }
  return out;
}

/** Bucata de contur care aparține unui singur panou — panoul evidențiat. */
export function conturPanou(
  rezultat: RezultatCuadratura,
  indice: number,
  puncteDeArc = 20,
): { x: number; y: number }[] {
  const panou = rezultat.panouri[indice];
  if (!panou) return [];

  if (rezultat.id === "trapez") {
    return panou.noduri.map((nod) => ({ x: nod.x, y: nod.y }));
  }
  if (rezultat.id === "mijloc") {
    const y = panou.noduri[0]?.y ?? Number.NaN;
    return [
      { x: panou.a, y },
      { x: panou.b, y },
    ];
  }

  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= puncteDeArc; i++) {
    const x = panou.a + ((panou.b - panou.a) * i) / puncteDeArc;
    out.push({ x, y: parabolaPrin(panou.noduri, x) });
  }
  return out;
}

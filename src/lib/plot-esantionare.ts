import type { Domeniu } from "./plot-scara";

/** Un punct în coordonate matematice. `y` poate fi `NaN` sau infinit. */
export type Punct = { x: number; y: number };

/**
 * Calculează funcția în puncte egal depărtate pe `domeniu`.
 *
 * `x` se calculează ca `min + lățime · i/(n−1)`, nu prin adunări repetate:
 * adunarea acumulează eroare, iar ultimul punct n-ar mai cădea exact pe capătul
 * din dreapta — se vede ca o curbă care nu ajunge la marginea graficului.
 *
 * Valorile problematice (`NaN`, `±Infinity`) **nu** se aruncă aici: se păstrează
 * ca atare, iar `sparge()` decide unde se rupe curba. Așa eșantionarea rămâne o
 * simplă evaluare, iar decizia vizuală stă într-un singur loc.
 */
export function esantioneaza(f: (x: number) => number, domeniu: Domeniu, puncte = 200): Punct[] {
  const [min, max] = domeniu;
  const n = Math.max(2, Math.floor(puncte));
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [];

  const latime = max - min;
  const rezultat: Punct[] = [];
  for (let i = 0; i < n; i++) {
    const x = min + (latime * i) / (n - 1);
    let y: number;
    try {
      y = f(x);
    } catch {
      // O funcție introdusă de utilizator poate arunca; asta e o gaură în
      // curbă, nu o eroare de pagină.
      y = Number.NaN;
    }
    rezultat.push({ x, y: typeof y === "number" ? y : Number.NaN });
  }
  return rezultat;
}

export type OptiuniSpargere = {
  /**
   * Înălțimea zonei vizibile pe `y`. Serveşte drept unitate de măsură pentru
   * „salt uriaș": fără ea nu se poate spune dacă un salt de 100 e mult sau puțin.
   */
  inaltimeVizibila?: number;
  /** De câte ori peste înălțimea vizibilă trebuie să treacă un salt ca să rupă curba. */
  pragSalt?: number;
};

/**
 * Taie șirul de puncte în bucăți continue, de desenat separat.
 *
 * Curba se rupe în două situații:
 *
 * 1. **valoare imposibilă** — `NaN` sau infinit, adică funcția nu există acolo
 *    (`sqrt(x)` sub zero, `ln(x)` la zero);
 * 2. **asimptotă** — două puncte vecine sar de o parte și de alta a zeroului,
 *    amândouă mult în afara zonei vizibile. `tan(x)` lângă π/2 sau `1/x` lângă 0
 *    trec de la valori uriașe pozitive la valori uriașe negative; fără ruptură,
 *    desenul ar uni cele două ramuri printr-o linie verticală care nu există în
 *    realitate.
 *
 * Regula de la punctul 2 e o **euristică**, nu o demonstrație: din două puncte
 * nu se poate ști sigur dacă între ele e o asimptotă sau doar o pantă foarte
 * mare. Cere schimbare de semn **și** magnitudine mare de ambele părți, ca o
 * funcție abruptă dar continuă să nu fie ruptă din greșeală. Dacă
 * `inaltimeVizibila` lipsește, se rup doar valorile imposibile — nu ghicim
 * fără unitate de măsură.
 *
 * Bucățile cu un singur punct se aruncă: dintr-un punct nu se poate desena linie.
 */
export function sparge(puncte: readonly Punct[], optiuni: OptiuniSpargere = {}): Punct[][] {
  const { inaltimeVizibila, pragSalt = 8 } = optiuni;
  const prag =
    inaltimeVizibila !== undefined && Number.isFinite(inaltimeVizibila) && inaltimeVizibila > 0
      ? inaltimeVizibila * pragSalt
      : Number.POSITIVE_INFINITY;

  const bucati: Punct[][] = [];
  let curenta: Punct[] = [];

  const inchide = () => {
    if (curenta.length >= 2) bucati.push(curenta);
    curenta = [];
  };

  for (const punct of puncte) {
    if (!Number.isFinite(punct.y)) {
      inchide();
      continue;
    }

    const anterior = curenta[curenta.length - 1];
    if (anterior !== undefined) {
      const semneOpuse = Math.sign(anterior.y) !== Math.sign(punct.y);
      const amandouaUriase = Math.abs(anterior.y) > prag && Math.abs(punct.y) > prag;
      if (semneOpuse && amandouaUriase) inchide();
    }

    curenta.push(punct);
  }
  inchide();

  return bucati;
}

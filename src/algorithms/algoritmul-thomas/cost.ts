/**
 * Cât costă Thomas față de eliminarea gaussiană deasă, în operații numărate.
 *
 * Măsura e **aceeași** la amândouă, altfel comparația n-ar însemna nimic:
 * numărul de înmulțiri și împărțiri. E măsura pe care o folosește §4.5 din
 * `sisteme_liniare_metode_directe_MN_curs4.md` când contorizează eliminarea
 * simplă, deci formulele de mai jos sunt citate de acolo, nu deduse aici:
 *
 * ```
 * eliminare simplă     `* sau /` → (2n³ + 3n² − 5n) / 6
 * substituție înapoi   `* sau /` → (n² + n) / 2
 * ```
 *
 * Se adună amândouă, fiindcă asta costă **rezolvarea sistemului**, iar `5n − 4`
 * de mai jos numără la fel amândouă fazele lui Thomas. Comparat doar cu prima,
 * raportul ar ieși în favoarea noastră din greșeală de contabilitate.
 *
 * Pentru Thomas cursul dă doar ordinul (**O(n)**, §9) și Algorithm 5. Numărul
 * exact se obține numărând liniile algoritmului aceluia, nu dintr-o formulă
 * scrisă din memorie:
 *
 * - eliminarea înainte, `i = 2 … n` — `µ ← a[i]/b[i−1]` (o împărțire),
 *   `b[i] ← b[i] − µ·c[i−1]` (o înmulțire), `d[i] ← d[i] − µ·d[i−1]` (o
 *   înmulțire) → **3 la fiecare din cei `n − 1` pași**;
 * - `x[n] ← d[n]/b[n]` → **1**;
 * - substituția înapoi, `i = n−1 … 1` — `(d[i] − c[i]·x[i+1]) / b[i]`, o
 *   înmulțire și o împărțire → **2 la fiecare din cei `n − 1` pași**.
 *
 * Total: `3(n − 1) + 1 + 2(n − 1) = 5n − 4`. Contorizarea se verifică rulând
 * chiar `algoritmulThomas` cu un contor pe operații, în
 * `scripts/verificare-algoritmi/algoritmul-thomas.ts` — dacă implementarea se
 * schimbă vreodată, formula pică acolo, nu pe ecran.
 */

/**
 * Înmulțiri și împărțiri ca să rezolvi un sistem `n × n` prin eliminare
 * gaussiană: eliminarea simplă plus substituția înapoi.
 */
export const operatiiGauss = (n: number) =>
  (2 * n ** 3 + 3 * n ** 2 - 5 * n) / 6 + (n ** 2 + n) / 2;

/** Înmulțiri și împărțiri la algoritmul Thomas, pentru un sistem `n × n`. */
export const operatiiThomas = (n: number) => 5 * n - 4;

/**
 * Cele trei ordine de mărime arătate în clip.
 *
 * `n = 1000` nu e ales ca să impresioneze: e mărimea obișnuită a sistemului
 * tridiagonal care iese dintr-un spline cubic pe o mie de noduri — exact
 * aplicația pe care §9 o dă drept motiv al metodei.
 */
export const COSTURI = [20, 100, 1000].map((n) => ({
  n,
  gauss: operatiiGauss(n),
  thomas: operatiiThomas(n),
  /** De câte ori mai puține operații face Thomas. */
  raport: operatiiGauss(n) / operatiiThomas(n),
}));

/**
 * Din ce punct pornesc tangenta și secanta, ca **să se vadă ce fac**.
 *
 * Nu e o întrebare de gust. Pornite lângă rădăcină, amândouă termină în 4–6
 * pași, fiecare salt e mai mic decât cel dinainte de zece ori, iar pe ecran nu
 * se distinge nimic: primul pas cade deja practic pe soluție. Ca metoda să se
 * vadă, primii pași trebuie să fie **salturi mari și distincte**, iar
 * accelerarea de la final să vină după ce ochiul a apucat să prindă mecanismul.
 *
 * Scriptul măsoară, pentru fiecare funcție din curs și fiecare punct de pornire
 * plauzibil: câți pași ies, cât de mare e primul salt și cât de repede scad
 * salturile. Pornirile alese pentru interfață sunt cele de la capătul listei —
 * cele care converg sigur, dar arată drumul.
 */
import * as newton from "../../src/algorithms/ecuatii-neliniare/newton.ts";
import * as secanta from "../../src/algorithms/ecuatii-neliniare/secanta.ts";
import { FUNCTII } from "../../src/algorithms/functii.ts";

const TOL = 1e-6;
const MAX = 40;

/** Cât de „urmăribilă" e o rulare: mulți pași, cu salturi care se văd. */
type Masura = {
  eticheta: string;
  x0: number;
  x1?: number;
  pasi: number;
  primulSalt: number;
  saltMinimVizibil: number;
  /** Cât de mult variază valorile funcției pe drumul parcurs. */
  gamaY: number;
  stare: string;
};

const masoara = (
  r: ReturnType<typeof newton.run>,
  f: (x: number) => number,
): Omit<Masura, "eticheta" | "x0" | "x1"> => {
  const salturi = r.pasi.map((p) => p.eroare);
  // Valorile funcției în toate punctele vizitate. Dacă ele se întind pe trei
  // ordine de mărime, graficul e nedesenabil: curba devine o cârjă lipită de
  // axă, iar rădăcina — tocmai ce trebuie văzut — cade într-o zonă plată.
  const valori = r.pasi.flatMap((p) => [f(p.x), f(p.xAnterior ?? p.x)]).map(Math.abs);
  const maxim = Math.max(...valori.filter(Number.isFinite));
  return {
    gamaY: maxim,
    pasi: r.pasi.length,
    primulSalt: salturi[0] ?? 0,
    // Câți pași au un salt care încă se vede pe un grafic — peste o miime din
    // primul salt. Sub atât, punctul nu se mai mișcă pe ecran.
    saltMinimVizibil: salturi.filter((s) => s > (salturi[0] ?? 0) / 1000).length,
    stare: r.stare,
  };
};

console.log("=== Tangenta (Newton): câți pași se văd, din ce punct de pornire ===\n");
const newtonBune: Masura[] = [];
for (const fn of FUNCTII) {
  const [a, b] = fn.interval;
  const latime = b - a;
  const candidati = [a, b, b + latime, b + 3 * latime, b + 6 * latime, a - latime];
  for (const x0 of candidati) {
    const r = newton.run({ functie: fn.id, x0, tol: TOL, maxIteratii: MAX });
    const m = { eticheta: fn.eticheta, x0, ...masoara(r, fn.f) };
    if (m.stare === "convergent") newtonBune.push(m);
  }
}
const ceaMaiBuna = (lista: Masura[]) =>
  FUNCTII.map(
    (fn) =>
      lista
        .filter((m) => m.eticheta === fn.eticheta && m.pasi <= 16 && m.gamaY <= 60)
        .sort((p, q) => q.saltMinimVizibil - p.saltMinimVizibil)[0],
  ).filter((m): m is Masura => m !== undefined);

ceaMaiBuna(newtonBune).forEach((m) =>
  console.log(
    `  ${m.eticheta.padEnd(14)} x₀=${String(m.x0).padStart(6)}  ` +
      `${String(m.pasi).padStart(2)} pași, ${m.saltMinimVizibil} vizibili, ` +
      `primul salt ${m.primulSalt.toFixed(2)}, |f| max ${m.gamaY.toExponential(1)}`,
  ),
);

console.log("\n=== Secanta: aceeași măsurătoare, cu două valori de pornire ===\n");
const secantaBune: Masura[] = [];
for (const fn of FUNCTII) {
  const [a, b] = fn.interval;
  const latime = b - a;
  const perechi: [number, number][] = [
    [a, b],
    [b, b + latime],
    [b + 2 * latime, b + 3 * latime],
    [b + 5 * latime, b + 6 * latime],
    [a - latime, a],
  ];
  for (const [x0, x1] of perechi) {
    const r = secanta.run({ functie: fn.id, x0, x1, tol: TOL, maxIteratii: MAX });
    const m = { eticheta: fn.eticheta, x0, x1, ...masoara(r, fn.f) };
    if (m.stare === "convergent") secantaBune.push(m);
  }
}
ceaMaiBuna(secantaBune).forEach((m) =>
  console.log(
    `  ${m.eticheta.padEnd(14)} x₀=${String(m.x0).padStart(6)} x₁=${String(m.x1).padStart(6)}  ` +
      `${String(m.pasi).padStart(2)} pași, ${m.saltMinimVizibil} vizibili, ` +
      `primul salt ${m.primulSalt.toFixed(2)}, |f| max ${m.gamaY.toExponential(1)}`,
  ),
);

console.log("\n=== Puncte fixe: câți pași dă exemplul din curs ===\n");

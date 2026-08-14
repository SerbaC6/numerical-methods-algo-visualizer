/**
 * Verificarea PageRank-ului — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §10.
 *
 * Ținta exactă, rezolvată pe fracții în afara iterației (`(I − G)v = 0`, cu
 * `d = 17/20` și `Σvᵢ = 1`): `v = (1429, 2109, 2687, 1429)/7654`. Verificarea
 * de mai jos **nu** ia rezultatul metodei ca referință pentru el însuși: sistemul
 * se rezolvă independent, prin eliminare, chiar aici.
 */
import * as pagerank from "../../src/algorithms/pagerank/putere.ts";
import {
  adiacenta,
  distributie,
  google,
  inmultesteVector,
  norma2,
  normalizeazaLinii,
  reteaDinCurs,
  transpune,
} from "../../src/algorithms/pagerank/retea.ts";
import type { Matrice, Retea } from "../../src/algorithms/pagerank/tipuri.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const D = 0.85;
const RETEA = reteaDinCurs();
/** `(1429, 2109, 2687, 1429)/7654` — soluția exactă pe fracții. */
const EXACT = [1429, 2109, 2687, 1429].map((x) => x / 7654);

const maxAbs = (v: number[]) => Math.max(...v.map(Math.abs));
const dif = (u: number[], v: number[]) => maxAbs(u.map((x, i) => x - v[i]!));

const A = adiacenta(RETEA);
const S = normalizeazaLinii(A);
const M = transpune(S);
const G = google(M, D);

console.log("=== 1. Construcția: M = Sᵀ, coloanele lui M și G însumează 1 ===");
{
  const coloana = (m: Matrice, j: number) => m.reduce((s, linie) => s + linie[j]!, 0);
  const sumeM = M.map((_, j) => coloana(M, j));
  const sumeG = G.map((_, j) => coloana(G, j));
  verifica(
    "coloanele lui M însumează 1",
    sumeM.every((s) => Math.abs(s - 1) < 1e-15),
    sumeM.map((s) => s.toFixed(3)).join(", "),
  );
  verifica(
    "coloanele lui G însumează 1",
    sumeG.every((s) => Math.abs(s - 1) < 1e-15),
    sumeG.map((s) => s.toFixed(3)).join(", "),
  );
  verifica(
    "M = Sᵀ, celulă cu celulă",
    M.every((linie, i) => linie.every((x, j) => x === S[j]![i]!)),
  );
  verifica(
    "S normalizează pe linii (fiecare linie a lui S însumează 1)",
    S.every((linie) => Math.abs(linie.reduce((s, x) => s + x, 0) - 1) < 1e-15),
  );
}

console.log("\n=== 2. Soluția exactă, rezolvată independent: (I − G)v = 0 cu Σvᵢ = 1 ===");
const vExact = rezolvaVectorulPropriu(G);
{
  verifica(
    "eliminarea dă (1429, 2109, 2687, 1429)/7654",
    dif(vExact, EXACT) < 1e-14,
    `abatere ${dif(vExact, EXACT).toExponential(2)}`,
  );
  const rezidual = dif(inmultesteVector(G, vExact), vExact);
  verifica("‖G·v − v‖∞ ≤ 1e-12", rezidual < 1e-12, rezidual.toExponential(2));
  verifica("P1 = P4 exact pe soluția rezolvată", Math.abs(vExact[0]! - vExact[3]!) < 1e-15);
}

console.log("\n=== 3. Metoda puterii converge la aceeași soluție ===");
const rulare = pagerank.run({ retea: RETEA, d: D, tol: 1e-6, maxIteratii: 200 });
{
  verifica("stare convergent", rulare.stare === "convergent");
  verifica(
    "pagerank-ul coincide cu soluția exactă",
    rulare.pagerank !== null && dif(rulare.pagerank, EXACT) < 1e-6,
    rulare.pagerank ? `abatere ${dif(rulare.pagerank, EXACT).toExponential(2)}` : "lipsă",
  );
  verifica(
    "suma componentelor e 1",
    rulare.pagerank !== null && Math.abs(rulare.pagerank.reduce((s, x) => s + x, 0) - 1) < 1e-12,
  );
  verifica(
    "matricile raportate sunt chiar A, S, M, G",
    rulare.matrici !== null &&
      dif(rulare.matrici.M.flat(), M.flat()) === 0 &&
      dif(rulare.matrici.G.flat(), G.flat()) === 0 &&
      dif(rulare.matrici.A.flat(), A.flat()) === 0 &&
      dif(rulare.matrici.S.flat(), S.flat()) === 0,
  );

  const iteratii = rulare.pasi.filter((p) => p.faza === "iteratie").length;
  verifica(
    "patru pași de construcție, apoi iterațiile, apoi normalizarea finală",
    rulare.pasi
      .slice(0, 4)
      .map((p) => p.faza)
      .join(",") === "adiacenta,normalizare,transpunere,google" &&
      rulare.pasi.at(-1)!.faza === "normalizare-finala",
    `${iteratii} iterații`,
  );
  verifica(
    "pașii de construcție nu raportează distribuție (desenul n-are ce arăta sub noduri)",
    rulare.pasi.slice(0, 4).every((p) => p.distributie === undefined),
  );
  verifica(
    "fiecare pas de iterație raportează v cu norma 2 egală cu 1 (linia 7 din algoritm)",
    rulare.pasi
      .filter((p) => p.faza === "iteratie")
      .every((p) => Math.abs(norma2(p.v!) - 1) < 1e-12),
  );
  verifica(
    "distribuția desenată însumează 1 la fiecare pas",
    rulare.pasi
      .filter((p) => p.distributie)
      .every((p) => Math.abs(p.distributie!.reduce((s, x) => s + x, 0) - 1) < 1e-12),
  );
}

console.log("\n=== 4. Clasamentul: P3 > P2 > P1 = P4, cu egalitatea tratată corect ===");
{
  const c = rulare.clasament;
  verifica(
    "ordinea e P3, P2, P1, P4",
    c.map((l) => l.nume).join(",") === "P3,P2,P1,P4",
    c.map((l) => `${l.nume} ${(100 * l.scor).toFixed(2)} %`).join(", "),
  );
  verifica(
    "locurile sunt 1, 2, 3, 3 — nu 3 și 4",
    c.map((l) => l.loc).join(",") === "1,2,3,3",
    c.map((l) => `${l.nume}:${l.loc}`).join(", "),
  );
  verifica(
    "procentele din curs, recalculate: 35,1 / 27,6 / 18,7 / 18,7",
    c.map((l) => (100 * l.scor).toFixed(1)).join(",") === "35.1,27.6,18.7,18.7",
  );
}

console.log("\n=== 5. Viteza de convergență se potrivește cu |λ₂|/|λ₁| = 0,7361 ===");
{
  // |λ₂| al lui G: pe subspațiul ortogonal pe 1, G se comportă ca d·M, iar
  // raportul se măsoară pe șirul erorilor față de soluția exactă.
  const rapoarte: number[] = [];
  let v = Array.from({ length: 4 }, () => 1);
  let eroareAnterioara = dif(distributie(v), EXACT);
  for (let k = 0; k < 60; k++) {
    const produs = inmultesteVector(G, v);
    v = produs.map((x) => x / norma2(produs));
    const eroare = dif(distributie(v), EXACT);
    if (eroare < 1e-13) break;
    if (k >= 10) rapoarte.push(eroare / eroareAnterioara);
    eroareAnterioara = eroare;
  }
  // Subdominanta lui G e o **pereche complexă**, deci raportul oscilează în
  // jurul lui |λ₂| în loc să se așeze pe el; se compară media geometrică pe
  // mai multe iterații, nu raportul unei singure iterații.
  const medie = Math.exp(rapoarte.reduce((s, r) => s + Math.log(r), 0) / rapoarte.length);
  const asteptat = 0.7361;
  verifica(
    `media geometrică a raporturilor de eroare ≈ ${asteptat}`,
    Math.abs(medie - asteptat) < 0.02,
    `măsurat ${medie.toFixed(4)} pe ${rapoarte.length} iterații`,
  );
  const oscileaza = rapoarte.some((r) => r > 1);
  verifica(
    "convergența oscilează (subdominanta e complexă), deci textul nu promite scădere la fiecare pas",
    oscileaza,
    `${rapoarte.filter((r) => r > 1).length} iterații în care eroarea a crescut`,
  );
}

console.log(
  "\n=== 6. Erată: matricea tipărită în curs NU e normalizarea pe link-uri de ieșire ===",
);
{
  // Cursul7 §10 tipărește M cu coloanele împărțite la numărul de link-uri care
  // **intră**; testul ăsta trebuie să treacă pentru ca erata din
  // `docs/erata-cursuri.md` să nu fie „reparată" înapoi în cod.
  const M_TIPARIT: Matrice = [
    [0, 1 / 2, 1 / 2, 0],
    [0, 0, 1 / 2, 0],
    [1, 0, 0, 1],
    [0, 1 / 2, 0, 0],
  ];
  verifica(
    "M tipărit ≠ M construit după regula scrisă a cursului",
    dif(M_TIPARIT.flat(), M.flat()) > 0.4,
    `diferență maximă ${dif(M_TIPARIT.flat(), M.flat()).toFixed(3)}`,
  );
  verifica(
    "M tipărit e chiar A normalizat pe coloane (de unde vine greșeala)",
    dif(M_TIPARIT.flat(), transpune(normalizeazaLinii(transpune(A))).flat()) < 1e-15,
  );

  const vTiparit = rezolvaVectorulPropriu(google(M_TIPARIT, D));
  verifica(
    "PageRank-ul matricei tipărite: .2878 .2020 .3869 .1233",
    vTiparit.map((x) => x.toFixed(4)).join(",") === "0.2878,0.2020,0.3869,0.1233",
    vTiparit.map((x) => x.toFixed(4)).join(", "),
  );
  const ordineTiparita = pagerank
    .construiesteClasament(vTiparit, RETEA.nume)
    .map((l) => l.nume)
    .join(",");
  verifica(
    "clasamentul diferă: P3,P1,P2,P4 tipărit vs. P3,P2,P1,P4 corect",
    ordineTiparita === "P3,P1,P2,P4" &&
      ordineTiparita !== rulare.clasament.map((l) => l.nume).join(","),
    ordineTiparita,
  );
}

console.log("\n=== 7. Cazuri-limită ===");
{
  const faraIesire: Retea = {
    nume: ["P1", "P2", "P3", "P4"],
    linkuri: RETEA.linkuri.map((linie, i) => (i === 1 ? linie.map(() => false) : [...linie])),
  };
  const r = pagerank.run({ retea: faraIesire, d: D, tol: 1e-6, maxIteratii: 100 });
  verifica(
    "o pagină fără link-uri de ieșire oprește metoda cu motivul corect",
    r.stare === "esuat" && (r.motiv ?? "").includes("P2") && r.pasi.length === 0,
    r.motiv?.slice(0, 60),
  );

  const dGresit = pagerank.run({ retea: RETEA, d: 1, tol: 1e-6, maxIteratii: 100 });
  verifica("d = 1 e respins (nu mai e probabilitate strictă)", dGresit.stare === "esuat");

  const scurt = pagerank.run({ retea: RETEA, d: D, tol: 1e-12, maxIteratii: 3 });
  verifica(
    "iterații insuficiente → neterminat, fără pas de normalizare finală",
    scurt.stare === "neterminat" && scurt.pasi.every((p) => p.faza !== "normalizare-finala"),
    `${scurt.pasi.length} pași`,
  );

  const laxe = pagerank.run({ retea: RETEA, d: 0.5, tol: 1e-6, maxIteratii: 200 });
  const iteratiiLaxe = laxe.pasi.filter((p) => p.faza === "iteratie").length;
  const iteratii85 = rulare.pasi.filter((p) => p.faza === "iteratie").length;
  verifica(
    "d mai mic ⇒ vizibil mai puține iterații",
    iteratiiLaxe < iteratii85,
    `d = 0,50: ${iteratiiLaxe} iterații; d = 0,85: ${iteratii85}`,
  );
}

/**
 * Rezolvă `(I − G)v = 0` cu `Σvᵢ = 1` prin eliminare Gauss-Jordan cu pivotare
 * parțială — independent de metoda puterii, ca verificarea să nu se sprijine pe
 * ea însăși.
 */
function rezolvaVectorulPropriu(G: Matrice): number[] {
  const n = G.length;
  const a: number[][] = G.map((linie, i) => linie.map((x, j) => (i === j ? 1 : 0) - x));
  const b: number[] = Array.from({ length: n }, () => 0);
  // Ultima ecuație e dependentă (coloanele lui I − G însumează 0); se înlocuiește
  // cu normalizarea Σvᵢ = 1, care fixează scara.
  a[n - 1] = Array.from({ length: n }, () => 1);
  b[n - 1] = 1;

  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r]![c]!) > Math.abs(a[pivot]![c]!)) pivot = r;
    [a[c], a[pivot]] = [a[pivot]!, a[c]!];
    [b[c], b[pivot]] = [b[pivot]!, b[c]!];
    const p = a[c]![c]!;
    a[c] = a[c]!.map((x) => x / p);
    b[c] = b[c]! / p;
    for (let r = 0; r < n; r++) {
      if (r === c || a[r]![c] === 0) continue;
      const f = a[r]![c]!;
      a[r] = a[r]!.map((x, k) => x - f * a[c]![k]!);
      b[r] = b[r]! - f * b[c]!;
    }
  }
  return b;
}

console.log("");
console.log(picate === 0 ? "✓ toate verificările au trecut" : `✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);

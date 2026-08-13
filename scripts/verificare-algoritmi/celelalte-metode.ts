/** Verificarea metodelor Newton, secantă și puncte fixe — rulează modulele reale. */
import { FUNCTII, getFunctie } from "../../src/algorithms/functii.ts";
import * as newton from "../../src/algorithms/ecuatii-neliniare/newton.ts";
import * as secanta from "../../src/algorithms/ecuatii-neliniare/secanta.ts";
import * as puncteFixe from "../../src/algorithms/ecuatii-neliniare/puncte-fixe.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

console.log("=== Newton: converge la rădăcina corectă ===");
for (const fn of FUNCTII) {
  // Pornim din capătul drept al intervalului recomandat, ca în curs ([c]+1).
  const r = newton.run({ functie: fn.id, x0: fn.interval[1], tol: 1e-12, maxIteratii: 60 });
  const ultim = r.pasi.at(-1);
  const abatere = ultim ? Math.abs(ultim.x - fn.radacina) : Number.NaN;
  verifica(
    `${fn.eticheta.padEnd(14)} ${r.stare}`,
    r.stare === "convergent" && abatere < 1e-9,
    `${r.pasi.length} pași, abatere ${abatere.toExponential(2)}`,
  );
}

console.log("\n=== Newton e mult mai rapid decât bisecția (concluzia din curs) ===");
{
  const r = newton.run({ functie: "cub", x0: 3, tol: 1e-12, maxIteratii: 60 });
  verifica(
    "sub 10 iterații acolo unde bisecția cere ~40",
    r.pasi.length < 10,
    `${r.pasi.length} pași`,
  );
}

console.log("\n=== Newton: convergență pătratică — eroarea se ridică la pătrat ===");
{
  const fn = getFunctie("patrat-minus-doi");
  const r = newton.run({ functie: fn.id, x0: 2, tol: 1e-15, maxIteratii: 20 });
  const erori = r.pasi.map((p) => Math.abs(p.x - fn.radacina)).filter((e) => e > 1e-14);
  const ordine = erori.slice(1).map((e, i) => Math.log(e) / Math.log(erori[i]!));
  verifica(
    "ordinul estimat tinde la 2",
    ordine.length > 0 && Math.abs(ordine.at(-1)! - 2) < 0.3,
    `ordine: ${ordine.map((o) => o.toFixed(2)).join(", ")}`,
  );
}

console.log("\n=== Newton: cele două condiții de eșec din curs ===");
{
  // f'(x) = 0 pentru x² − 2 se întâmplă în 0
  const r1 = newton.run({ functie: "patrat-minus-doi", x0: 0, tol: 1e-8, maxIteratii: 10 });
  verifica(
    "derivată nulă → eșec explicat",
    r1.stare === "esuat" && /derivata e zero/.test(r1.motiv ?? ""),
    r1.motiv?.slice(0, 55),
  );

  // pornire în afara domeniului: ln(x) din negativ
  const r2 = newton.run({ functie: "logaritm", x0: 0.06, tol: 1e-8, maxIteratii: 20 });
  verifica(
    "aruncat în afara domeniului → eșec explicat",
    r2.stare === "esuat",
    r2.motiv?.slice(0, 55),
  );
}

console.log("\n=== Secanta: converge la rădăcina corectă ===");
for (const fn of FUNCTII) {
  const r = secanta.run({
    functie: fn.id,
    x0: fn.interval[0],
    x1: fn.interval[1],
    tol: 1e-12,
    maxIteratii: 60,
  });
  const ultim = r.pasi.at(-1);
  const abatere = ultim ? Math.abs(ultim.x - fn.radacina) : Number.NaN;
  verifica(
    `${fn.eticheta.padEnd(14)} ${r.stare}`,
    r.stare === "convergent" && abatere < 1e-8,
    `${r.pasi.length} pași, abatere ${abatere.toExponential(2)}`,
  );
}

console.log("\n=== Secanta: cazuri-limită ===");
{
  const r1 = secanta.run({ functie: "cub", x0: 2, x1: 2, tol: 1e-8, maxIteratii: 10 });
  verifica("valori de pornire egale → eșec", r1.stare === "esuat" && r1.pasi.length === 0);

  // x² − 2 în ±1 dă aceeași valoare: secanta e orizontală
  const r2 = secanta.run({
    functie: "patrat-minus-doi",
    x0: -1,
    x1: 1,
    tol: 1e-8,
    maxIteratii: 10,
  });
  verifica(
    "secantă orizontală → eșec explicat",
    r2.stare === "esuat" && /orizontală/.test(r2.motiv ?? ""),
    r2.motiv?.slice(0, 55),
  );
}

console.log("\n=== Puncte fixe: exemplul din curs, numărul de aur ===");
{
  const fn = getFunctie("aur");
  const r = puncteFixe.run({ functie: fn.id, x0: 1, tol: 1e-12, maxIteratii: 80 });
  const ultim = r.pasi.at(-1);
  verifica(
    "converge la (1+√5)/2",
    r.stare === "convergent" && Math.abs((ultim?.x ?? 0) - fn.radacina) < 1e-10,
    `x = ${ultim?.x.toFixed(12)}, ${r.pasi.length} pași`,
  );
  // Cursul spune: converge pentru orice p₀ din interval
  const dinAltePuncte = [0, 0.5, 2, 5, 50].map((x0) =>
    puncteFixe.run({ functie: fn.id, x0, tol: 1e-10, maxIteratii: 200 }),
  );
  verifica(
    "converge din orice punct de pornire ≥ 0",
    dinAltePuncte.every(
      (r) => r.stare === "convergent" && Math.abs((r.pasi.at(-1)?.x ?? 0) - fn.radacina) < 1e-8,
    ),
  );
}

console.log("\n=== Puncte fixe: refuză funcțiile fără g dat de curs ===");
{
  const faraG = FUNCTII.filter((f) => !f.g);
  verifica(
    `toate cele ${faraG.length} funcții fără g sunt refuzate cu explicație`,
    faraG.every((f) => {
      const r = puncteFixe.run({ functie: f.id, x0: f.interval[0], tol: 1e-8, maxIteratii: 5 });
      return r.stare === "esuat" && (r.motiv ?? "").includes("nu dă o formă");
    }),
  );
}

console.log(picate === 0 ? "\n✓ toate verificările trec" : `\n✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);

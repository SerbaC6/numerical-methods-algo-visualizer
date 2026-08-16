/**
 * Verificarea metodelor pentru problema Cauchy — rulează modulele reale din `src/`.
 *
 * Referință: `cursuri_MN/ode-runge-kutta_curs13.md`.
 *
 * Ce se verifică:
 *
 * 1. **soluția analitică e chiar soluție**: `y′ = y − t² + 1` și `y(0) = 0,5`,
 *    verificate pe tot intervalul — dacă ar fi greșită, toate erorile din pagină
 *    ar fi măsurate față de un număr inventat;
 * 2. `solutiePrin` trece prin punctul cerut, oricare ar fi el (așa se desenează
 *    „albia" din clip);
 * 3. **forma cu sonde dă înapoi formulele tipărite în curs**, la `0` diferență:
 *    Euler, punctul de mijloc, Euler modificat și RK4, rescrise independent aici;
 * 4. ponderile sondelor însumează `1` la toate metodele (condiția de consistență);
 * 5. **ordinul fiecărei metode, măsurat** ca pantă la înjumătățirea pasului:
 *    ≈1, ≈2, ≈2, ≈4 — nu enunțat, ci citit din cifre;
 * 6. primii pași Euler cu `h = 0,5`, cifră cu cifră;
 * 7. cifrele scrise pe cartonașele clipului (erorile la `h = 0,1`) sunt chiar
 *    cele produse de module.
 */
import { PROBLEMA, SOLUTIA_EXACTA } from "../../src/algorithms/ecuatii-diferentiale/probleme.ts";
import {
  eroareFinala,
  ordinMasurat,
  ruleazaOde,
  type IdMetodaOde,
} from "../../src/algorithms/ecuatii-diferentiale/metode.ts";
import {
  bucatiVizibile,
  campDirectii,
  curbaSolutie,
  unghiEcran,
} from "../../src/algorithms/ecuatii-diferentiale/camp-directii.ts";

let picate = 0;
const verifica = (nume: string, conditie: boolean, detaliu = "") => {
  if (!conditie) picate++;
  console.log(`  ${conditie ? "OK  " : "PICĂ"} ${nume}${detaliu ? "  — " + detaliu : ""}`);
};

const [A, B] = PROBLEMA.interval;

console.log("=== 1. Soluția analitică e chiar soluția problemei ===");
{
  // Derivata se ia numeric, central, cu pas mic: dacă `y` e soluție, ea trebuie
  // să dea chiar `f(t, y(t))` în fiecare punct.
  const h = 1e-6;
  let maxim = 0;
  for (let i = 0; i <= 200; i++) {
    const t = A + ((B - A) * i) / 200;
    const derivata = (SOLUTIA_EXACTA(t + h) - SOLUTIA_EXACTA(t - h)) / (2 * h);
    maxim = Math.max(maxim, Math.abs(derivata - PROBLEMA.f(t, SOLUTIA_EXACTA(t))));
  }
  verifica(
    "y′(t) = y(t) − t² + 1 pe tot intervalul",
    maxim < 1e-6,
    `abatere ${maxim.toExponential(2)}`,
  );
  verifica(
    "y(0) = 0,5",
    Math.abs(SOLUTIA_EXACTA(A) - PROBLEMA.alfa) < 1e-15,
    `y(0) = ${SOLUTIA_EXACTA(A)}`,
  );
  verifica(
    "y(2) = (2+1)² − ½e² = 5,3054719505…",
    Math.abs(SOLUTIA_EXACTA(2) - (9 - 0.5 * Math.exp(2))) < 1e-15,
    SOLUTIA_EXACTA(2).toFixed(10),
  );
}

console.log("=== 2. Familia de soluții: solutiePrin trece prin punctul cerut ===");
{
  let maxim = 0;
  let abatereEcuatie = 0;
  for (const [t0, y0] of [
    [0, -1],
    [0, 0.5],
    [0, 2],
    [1, 3],
    [1.5, 0],
  ] as const) {
    const y = PROBLEMA.solutiePrin(t0, y0);
    maxim = Math.max(maxim, Math.abs(y(t0) - y0));
    const h = 1e-6;
    for (let i = 0; i <= 20; i++) {
      const t = A + ((B - A) * i) / 20;
      const derivata = (y(t + h) - y(t - h)) / (2 * h);
      abatereEcuatie = Math.max(abatereEcuatie, Math.abs(derivata - PROBLEMA.f(t, y(t))));
    }
  }
  verifica("curba trece prin (t₀, y₀)", maxim < 1e-12, `abatere ${maxim.toExponential(2)}`);
  verifica(
    "fiecare curbă din albie e soluție a aceleiași ecuații",
    abatereEcuatie < 1e-5,
    `abatere ${abatereEcuatie.toExponential(2)}`,
  );
}

console.log("=== 3. Forma cu sonde dă înapoi formulele din curs ===");
{
  const f = PROBLEMA.f;
  /** Formulele tipărite în curs, rescrise independent de modul. */
  const dinCurs: Record<IdMetodaOde, (t: number, w: number, h: number) => number> = {
    // §„Metoda lui Euler": wᵢ₊₁ = wᵢ + h·f(tᵢ, wᵢ)
    euler: (t, w, h) => w + h * f(t, w),
    // §„Metoda punctului de mijloc": wᵢ + h·f(tᵢ + h/2, wᵢ + (h/2)·f(tᵢ, wᵢ))
    mijloc: (t, w, h) => w + h * f(t + h / 2, w + (h / 2) * f(t, w)),
    // §„Metoda Euler modificată": wᵢ + (h/2)·[f(tᵢ, wᵢ) + f(tᵢ₊₁, wᵢ + h·f(tᵢ, wᵢ))]
    "euler-modificat": (t, w, h) => w + (h / 2) * (f(t, w) + f(t + h, w + h * f(t, w))),
    // §„RK de ordin 4": K₁…K₄ și media (K₁ + 2K₂ + 2K₃ + K₄)/6
    rk4: (t, w, h) => {
      const k1 = h * f(t, w);
      const k2 = h * f(t + h / 2, w + k1 / 2);
      const k3 = h * f(t + h / 2, w + k2 / 2);
      const k4 = h * f(t + h, w + k3);
      return w + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    },
  };

  for (const metoda of Object.keys(dinCurs) as IdMetodaOde[]) {
    let maxim = 0;
    for (const N of [4, 8, 20, 37]) {
      const rezultat = ruleazaOde({ metoda, problema: PROBLEMA, N });
      for (const pas of rezultat.pasi) {
        maxim = Math.max(maxim, Math.abs(pas.wUrmator - dinCurs[metoda](pas.t, pas.w, pas.h)));
      }
    }
    // Pragul nu e `0` decât la primele trei: la RK4, media ponderată din modul
    // adună termenii în altă ordine decât `(K₁ + 2K₂ + 2K₃ + K₄)/6`, iar din
    // asta iese ultimul bit al dublei precizii. E rotunjire, nu altă formulă.
    verifica(
      `${metoda}: pas cu pas, identic cu formula din curs`,
      maxim <= (metoda === "rk4" ? 1e-14 : 0),
      `diferență ${maxim}`,
    );
  }
}

console.log("=== 4. Ponderile sondelor însumează 1 (consistență) ===");
{
  for (const metoda of ["euler", "mijloc", "euler-modificat", "rk4"] as IdMetodaOde[]) {
    const pas = ruleazaOde({ metoda, problema: PROBLEMA, N: 8 }).pasi[0]!;
    const suma = pas.sonde.reduce((s, sonda) => s + sonda.pondere, 0);
    verifica(`${metoda}: Σ ponderi = 1`, Math.abs(suma - 1) < 1e-15, `${suma}`);
  }
  // Punctul de mijloc: prima sondă nu intră în pas, e doar drumul până la mijloc.
  const mijloc = ruleazaOde({ metoda: "mijloc", problema: PROBLEMA, N: 8 }).pasi[0]!;
  verifica("mijloc: sonda de probă are pondere 0", mijloc.sonde[0]!.pondere === 0);
}

console.log("=== 5. Ordinul fiecărei metode, măsurat ===");
{
  const asteptat: Record<IdMetodaOde, number> = {
    euler: 1,
    mijloc: 2,
    "euler-modificat": 2,
    rk4: 4,
  };
  for (const metoda of Object.keys(asteptat) as IdMetodaOde[]) {
    // Pas mic, ca termenul dominant `h^p` să fie chiar el dominant, dar nu atât
    // de mic încât eroarea de rotunjire să înceapă să conteze (la RK4, sub
    // `h ≈ 0,01` diferența ajunge la limita dublei precizii).
    const N = metoda === "rk4" ? 40 : 200;
    const ordin = ordinMasurat(metoda, PROBLEMA, N);
    verifica(
      `${metoda}: ordin măsurat ≈ ${asteptat[metoda]}`,
      Math.abs(ordin - asteptat[metoda]) < 0.1,
      ordin.toFixed(4),
    );
  }
}

console.log("=== 6. Primii pași Euler cu h = 0,5, cifră cu cifră ===");
{
  const rezultat = ruleazaOde({ metoda: "euler", problema: PROBLEMA, N: 4 });
  // Calculul de mână: w₀ = 0,5; f(0; 0,5) = 0,5 − 0 + 1 = 1,5 → w₁ = 0,5 + 0,5·1,5 = 1,25.
  // f(0,5; 1,25) = 1,25 − 0,25 + 1 = 2 → w₂ = 1,25 + 1 = 2,25.
  // f(1; 2,25) = 2,25 − 1 + 1 = 2,25 → w₃ = 2,25 + 1,125 = 3,375.
  // f(1,5; 3,375) = 3,375 − 2,25 + 1 = 2,125 → w₄ = 3,375 + 1,0625 = 4,4375.
  const asteptate = [1.25, 2.25, 3.375, 4.4375];
  const iesite = rezultat.pasi.map((p) => p.wUrmator);
  verifica(
    "w₁…w₄ = 1,25; 2,25; 3,375; 4,4375",
    iesite.every((v, i) => Math.abs(v - asteptate[i]!) < 1e-12),
    iesite.map((v) => v.toFixed(4)).join("  "),
  );
  verifica(
    "pantele: 1,5; 2; 2,25; 2,125",
    [1.5, 2, 2.25, 2.125].every((v, i) => Math.abs(rezultat.pasi[i]!.pantaPas - v) < 1e-12),
  );
}

console.log("=== 7. Cifrele scrise pe cartonașele clipului ===");
{
  // Erorile în t = 2, la h = 0,1 (N = 20). Ele ajung pe ecran, deci se verifică
  // exact în forma în care se scriu: două cifre semnificative.
  const asteptat: [IdMetodaOde, string][] = [
    ["euler", "2,4·10⁻¹"],
    ["euler-modificat", "1,9·10⁻²"],
    ["mijloc", "3,7·10⁻³"],
    ["rk4", "7,0·10⁻⁶"],
  ];
  for (const [metoda, scris] of asteptat) {
    const e = eroareFinala(metoda, PROBLEMA, 20);
    const mantisa = (e / 10 ** Math.floor(Math.log10(e))).toFixed(1).replace(".", ",");
    const exponent = Math.floor(Math.log10(e));
    const rescris = `${mantisa}·10${String(exponent)
      .replace("-", "⁻")
      .replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]!)}`;
    verifica(
      `${metoda}: ${scris}`,
      rescris === scris,
      `calculat ${rescris} (${e.toExponential(3)})`,
    );
  }

  // Ordinea metodelor pe precizie, la același pas — afirmația din clip.
  const erori = (["euler", "euler-modificat", "mijloc", "rk4"] as IdMetodaOde[]).map((m) =>
    eroareFinala(m, PROBLEMA, 20),
  );
  verifica(
    "Euler > Euler modificat > punctul de mijloc > RK4, ca eroare",
    erori.every((e, i) => i === 0 || e < erori[i - 1]!),
    erori.map((e) => e.toExponential(1)).join(" > "),
  );
}

console.log("=== 8. Câmpul de direcții și albia ===");
{
  const fereastra = { t: [0, 2], y: [-1, 6] } as const;
  const camp = campDirectii(PROBLEMA.f, fereastra, 12, 8);
  verifica("rețeaua are coloane × linii puncte", camp.length === 96, `${camp.length}`);
  verifica(
    "toate punctele cad strict în fereastră",
    camp.every(
      (d) =>
        d.t > fereastra.t[0] &&
        d.t < fereastra.t[1] &&
        d.y > fereastra.y[0] &&
        d.y < fereastra.y[1],
    ),
  );
  verifica(
    "panta din rețea e chiar f(t, y)",
    camp.every((d) => Math.abs(d.panta - PROBLEMA.f(d.t, d.y)) < 1e-15),
  );
  // Unghiul de desen ține cont de scările ecranului, altfel câmpul ar arăta alte
  // direcții decât cele cerute de ecuație. Cazurile simple: panta 0 e orizontală
  // oricare ar fi scările, iar cu scări egale se întoarce arctangenta.
  verifica("panta nulă se desenează orizontal", unghiEcran(0, 500, 90) === 0);
  verifica(
    "cu scări egale, unghiul e arctangenta pantei",
    camp.every(
      (d) => Math.abs(unghiEcran(d.panta, 100, 100) + (Math.atan(d.panta) * 180) / Math.PI) < 1e-12,
    ),
  );
  verifica(
    "pe scări diferite, unghiul e turtit de raportul lor",
    Math.abs(unghiEcran(1, 500, 90) + (Math.atan(90 / 500) * 180) / Math.PI) < 1e-12,
    `${unghiEcran(1, 500, 90).toFixed(3)}°`,
  );

  // O curbă care iese din fereastră trebuie ruptă, nu unită peste tot cadrul.
  const iese = curbaSolutie(PROBLEMA, { t: 0, y: 2 }, fereastra);
  const bucati = bucatiVizibile(iese, fereastra);
  verifica(
    "curba care iese pe sus se taie la margine",
    bucati.length >= 1 && bucati[0]!.length < iese.length,
    `${bucati.length} bucată/bucăți, ${bucati[0]!.length} din ${iese.length} puncte`,
  );
  const inauntru = curbaSolutie(PROBLEMA, { t: 0, y: PROBLEMA.alfa }, fereastra);
  verifica(
    "soluția problemei rămâne întreagă în fereastră",
    bucatiVizibile(inauntru, fereastra).length === 1,
  );
}

console.log("");
console.log(picate === 0 ? "✓ toate verificările au trecut" : `✗ ${picate} verificări au picat`);
process.exit(picate === 0 ? 0 : 1);

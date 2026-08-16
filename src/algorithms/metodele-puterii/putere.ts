/**
 * Metodele puterii, iterarea câtului Rayleigh și deflația Wielandt.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`.** Cele trei
 * iterații sunt algoritmii tipăriți în curs, literă cu literă:
 *
 * ```
 * §6 metoda puterii directe        §7 puterea inversă cu deplasare      §8 iterarea Rayleigh
 * 1: v ← v/‖v‖                     1: v ← v/‖v‖                         1: v ← v/‖v‖
 * 2: for i = 1 to max_iter do      2: for i = 1 to max_iter do          2: for i = 1 to max_iter do
 * 3:   vprev ← v                   3:   vprev ← v                       3:   vprev ← v
 * 4:   v ← A·v                     4:   rezolvă (A − μI)v = vprev       4:   μ ← vᵀAv
 * 5:   v ← v/‖v‖                   5:   v ← v/‖v‖                       5:   rezolvă (A − μI)v = vprev
 * 6:   if ‖v − vprev‖ < tol break  6:   if ‖v − vprev‖ < tol break      6:   v ← v/‖v‖
 * 7: end for                       7: end for                           7:   if ‖v − vprev‖ < tol break
 * 8: λ ← vᵀAv                      8: λ ← vᵀAv                          8: end for  9: λ ← vᵀAv
 * ```
 *
 * Singura completare față de pseudocod e ce se întâmplă când o împărțire nu se
 * poate face — vector nul la normalizare, `A − qI` singulară la rezolvare. Curs­ul
 * nu tratează cazurile astea; aici se opresc iterația și se explică în cuvinte,
 * fiindcă altfel pe ecran ar apărea `NaN`.
 *
 * `λ⁽ᵏ⁾` se calculează la **fiecare** pas, deși §6 spune că nu e necesar: pagina
 * arată șirul care converge, nu doar ultima valoare.
 */

import type { MetaMetoda, Parametru } from "@/algorithms/tipuri";
import {
  catRayleigh,
  inmultesteVector,
  norma2,
  normalizeaza,
  rezolvaSistem,
  scade,
  scadeDeplasare,
  scadeRang1,
  stergeLinieSiColoana,
} from "@/algorithms/metodele-puterii/matrice";
import type {
  FelIteratie,
  Matrice,
  ParametriPutere,
  PasPutere,
  RezultatDeflatie,
  RezultatPutere,
} from "@/algorithms/metodele-puterii/tipuri";
import { zecimale } from "@/lib/numere";

export const meta: MetaMetoda = {
  id: "metodele-puterii",
  titlu: "Metoda puterii, puterea inversă, iterarea Rayleigh",
  rezumat:
    "Înmulțește repetat un vector cu matricea (sau rezolvă repetat un sistem cu ea) până când direcția nu se mai schimbă, iar câtul Rayleigh dă valoarea proprie.",
  sursa: "valori_vectori_proprii_teorie_curs7.md",
};

export const params: Parametru[] = [
  { nume: "tol", eticheta: "toleranța pentru ‖v − vprev‖", tip: "numar", implicit: 1e-8 },
  { nume: "maxIteratii", eticheta: "iterații maxime", tip: "numar", implicit: 60, min: 1, pas: 1 },
  { nume: "q", eticheta: "deplasarea q", tip: "numar", implicit: 0, pas: 0.1 },
];

/**
 * Matricea pe care o desenează pagina.
 *
 * E simetrică și are valori proprii care se scriu exact: `3 + √2`, `3`, `3 − √2`,
 * cu vectorii proprii `(1, √2, 1)/2`, `(1, 0, −1)/√2` și `(1, −√2, 1)/2`. Alegerea
 * e făcută ca fiecare cifră de pe ecran să se poată verifica pe hârtie, iar
 * raportul `|λ₂|/|λ₁| = 3/(3+√2) ≈ 0,68` e destul de mare cât să se **vadă** că
 * metoda directă merge încet — exact ce spune §6 despre viteza de convergență.
 */
export function matriceaExemplu(): Matrice {
  return [
    [3, 1, 0],
    [1, 3, 1],
    [0, 1, 3],
  ];
}

/** Valorile proprii exacte ale matricei de mai sus, în ordinea modulului. */
export const VALORI_EXACTE = [3 + Math.SQRT2, 3, 3 - Math.SQRT2] as const;

/**
 * Matricea `2×2` pe care o desenează clipul în plan.
 *
 * Valorile proprii sunt **exact** `4` și `2`, cu vectorii proprii `(1, 1)/√2` și
 * `(1, −1)/√2` — cele două diagonale ale planului. Există fiindcă ideea metodei
 * se vede numai geometric: o săgeată care se rotește către o direcție. Raportul
 * `|λ₂|/|λ₁| = 1/2` face ca rotirea să se vadă din patru-cinci pași, cât ține o
 * scenă.
 */
export function matriceaPlana(): Matrice {
  return [
    [3, 1],
    [1, 3],
  ];
}

/** Valorile proprii exacte ale matricei plane, în ordinea modulului. */
export const VALORI_PLANE = [4, 2] as const;

/* ───────────────────────── scrierea cifrelor ───────────────────────── */

const num = (v: number, cifre = 4) => zecimale(v, cifre).replace(",", "{,}");
const vectorLatex = (v: number[], cifre = 4) =>
  `\\begin{pmatrix}${v.map((x) => num(x, cifre)).join(" \\\\ ")}\\end{pmatrix}`;
const vectorText = (v: number[], cifre = 4) => `(${v.map((x) => zecimale(x, cifre)).join("; ")})`;

/* ───────────────────────── cele trei iterații ───────────────────────── */

/**
 * Trunchiul comun al celor trei metode.
 *
 * Diferă un singur lucru: cum se obține `z` din `vprev`. Restul — normalizarea,
 * câtul Rayleigh, criteriul de oprire `‖v − vprev‖` — e identic în toți cei trei
 * algoritmi tipăriți în curs, deci se scrie o singură dată.
 */
function iereaza(
  p: ParametriPutere,
  fel: FelIteratie,
  pas: (
    vprev: number[],
    k: number,
  ) => {
    z: number[] | null;
    deplasare?: number;
    motiv?: string;
    /**
     * Când `z` lipsește, oprirea e de fapt un succes, nu o eroare. Se întâmplă
     * la iterarea Rayleigh: `A − ρI` devine singulară exact fiindcă `ρ` a ajuns
     * pe valoarea proprie, deci vectorul curent e deja vector propriu.
     */
    esteConvergenta?: boolean;
  },
): RezultatPutere {
  const { A, tol, maxIteratii } = p;
  const pasi: PasPutere[] = [];

  const start = normalizeaza(p.pornire);
  if (start === null) {
    return {
      pasi,
      stare: "esuat",
      motiv:
        "Vectorul de pornire e nul, deci nu se poate normaliza. §6 cere ca el să aibă componentă nenulă pe direcția vectorului propriu căutat.",
      v: null,
      lambda: null,
    };
  }

  let v = start;
  let convergent = false;

  for (let k = 1; k <= maxIteratii; k++) {
    const vprev = v;
    const { z, deplasare, motiv, esteConvergenta } = pas(vprev, k);
    if (z === null) {
      return {
        pasi,
        stare: esteConvergenta ? "convergent" : "esuat",
        ...(motiv === undefined ? {} : { motiv }),
        v: vprev,
        lambda: catRayleigh(A, vprev),
      };
    }

    const vUrmator = normalizeaza(z);
    if (vUrmator === null) {
      return {
        pasi,
        stare: "esuat",
        motiv: `La iterația ${k}, vectorul obținut are norma ${zecimale(norma2(z), 6)}, deci împărțirea la ‖z‖ nu se poate face.`,
        v: vprev,
        lambda: catRayleigh(A, vprev),
      };
    }

    const eroare = norma2(scade(vUrmator, vprev));
    const lambda = catRayleigh(A, vUrmator);

    pasi.push({
      iteratie: k,
      fel,
      vAnterior: vprev,
      v: vUrmator,
      ...(deplasare === undefined ? {} : { deplasare }),
      lambda,
      eroare,
      explicatie: explica(fel, k, vUrmator, lambda, eroare, tol, deplasare),
      latexPas: latexPas(fel, k, vUrmator, lambda, deplasare),
      evidentiaza: ["mp-v", "mp-lambda"],
    });

    v = vUrmator;
    if (eroare < tol) {
      convergent = true;
      break;
    }
  }

  const lambda = catRayleigh(A, v);
  if (!convergent) {
    return {
      pasi,
      stare: "neterminat",
      motiv:
        `S-au consumat cele ${maxIteratii} iterații fără ca ‖v − vprev‖ să scadă sub ${zecimale(tol, 10)}. ` +
        "Viteza metodei directe e dată de raportul |λ₂|/|λ₁|: cu cât cele două valori proprii sunt mai apropiate în modul, cu atât iterația se târăște mai mult.",
      v,
      lambda,
    };
  }
  return { pasi, stare: "convergent", v, lambda };
}

function explica(
  fel: FelIteratie,
  k: number,
  v: number[],
  lambda: number,
  eroare: number,
  tol: number,
  deplasare?: number,
): string {
  const inceput =
    fel === "directa"
      ? `Iterația ${k}: vectorul se înmulțește cu A și se readuce la lungime 1`
      : fel === "inversa"
        ? `Iterația ${k}: se rezolvă (A − qI)·v = vprev cu q = ${zecimale(deplasare ?? 0, 4)}, apoi vectorul se readuce la lungime 1`
        : `Iterația ${k}: deplasarea e chiar câtul Rayleigh al vectorului de la pasul dinainte, ρ = ${zecimale(deplasare ?? 0, 8)}, iar cu ea se rezolvă (A − ρI)·v = vprev`;

  return (
    `${inceput}. Direcția obținută e ${vectorText(v)}, câtul Rayleigh dă λ = ${zecimale(lambda, 8)}, ` +
    `iar criteriul de oprire ‖v − vprev‖ e ${zecimale(eroare, 10)}` +
    (eroare < tol
      ? `, adică sub toleranța ${zecimale(tol, 10)} — aici se oprește bucla.`
      : `, încă peste toleranța ${zecimale(tol, 10)}.`)
  );
}

function latexPas(
  fel: FelIteratie,
  k: number,
  v: number[],
  lambda: number,
  deplasare?: number,
): string {
  const stanga =
    fel === "directa"
      ? `\\htmlId{mp-v}{v^{(${k})}} = \\frac{A\\,v^{(${k - 1})}}{\\lVert A\\,v^{(${k - 1})}\\rVert}`
      : fel === "inversa"
        ? `(A - ${num(deplasare ?? 0)}\\,I)\\,z = v^{(${k - 1})},\\quad \\htmlId{mp-v}{v^{(${k})}} = \\frac{z}{\\lVert z\\rVert}`
        : `\\rho^{(${k - 1})} = ${num(deplasare ?? 0, 8)},\\quad (A - \\rho^{(${k - 1})} I)\\,z = v^{(${k - 1})},\\quad \\htmlId{mp-v}{v^{(${k})}} = \\frac{z}{\\lVert z\\rVert}`;

  return `${stanga} = ${vectorLatex(v)},\\quad \\htmlId{mp-lambda}{\\lambda^{(${k})}} = ${num(lambda, 8)}`;
}

/** §6 — metoda puterii directe. */
export function run(p: ParametriPutere): RezultatPutere {
  return iereaza(p, "directa", (vprev) => ({ z: inmultesteVector(p.A, vprev) }));
}

/**
 * §7 — puterea inversă, cu deplasarea `q`.
 *
 * `q = 0` e chiar varianta fără deplasare, adică metoda puterii pe `A⁻¹`:
 * converge către valoarea proprie **cea mai mică în modul**. Pentru `q ≠ 0`,
 * ținta e valoarea proprie cea mai apropiată de `q`.
 */
export function runInversa(p: ParametriPutere): RezultatPutere {
  const q = p.deplasare ?? 0;
  const M = scadeDeplasare(p.A, q);
  return iereaza(p, "inversa", (vprev, k) => {
    const z = rezolvaSistem(M, vprev);
    return {
      z,
      deplasare: q,
      ...(z === null
        ? {
            motiv:
              `La iterația ${k}, sistemul (A − qI)·v = vprev nu se poate rezolva: cu q = ${zecimale(q, 6)}, matricea A − qI e singulară. ` +
              "Asta înseamnă că q a nimerit exact o valoare proprie a lui A — se alege o deplasare puțin diferită.",
          }
        : {}),
    };
  });
}

/**
 * §8 — iterarea câtului Rayleigh: deplasare recalculată la fiecare pas.
 *
 * **Sistemul singular are două înțelesuri opuse, iar ele se despart după
 * rezidual, nu după intuiție.** `A − ρI` singulară înseamnă doar că `ρ` e
 * valoare proprie a lui `A`. Dacă vectorul curent e chiar vectorul ei propriu
 * (`‖A·v − ρ·v‖` neglijabil), metoda a ajuns la capăt și oprirea e un succes.
 * Dacă nu e — și se întâmplă din prima iterație pentru vectori simetrici, de
 * pildă `(1, 0, 0)` pe o matrice tridiagonală simetrică, unde câtul dă exact
 * valoarea proprie din mijloc —, atunci metoda chiar nu poate continua: pasul ar
 * cere împărțirea la zero pe o direcție care nu e proprie. Confundate, cele două
 * ar face pagina să anunțe drept rezultat un vector care nu e vector propriu.
 */
export function runRayleigh(p: ParametriPutere): RezultatPutere {
  return iereaza(p, "rayleigh", (vprev, k) => {
    const rho = catRayleigh(p.A, vprev);
    const z = rezolvaSistem(scadeDeplasare(p.A, rho), vprev);
    if (z !== null) return { z, deplasare: rho };

    const rezidual = norma2(
      scade(
        inmultesteVector(p.A, vprev),
        vprev.map((x) => rho * x),
      ),
    );
    const esteVectorPropriu = rezidual < 1e-8;

    return {
      z,
      deplasare: rho,
      esteConvergenta: esteVectorPropriu,
      motiv: esteVectorPropriu
        ? `La iterația ${k}, A − ρI a devenit singulară pentru ρ = ${zecimale(rho, 10)}. ` +
          "Nu e o eroare, ci chiar capătul metodei: ρ a ajuns pe valoarea proprie, deci vectorul curent e vector propriu cu precizia mașinii și nu mai are ce să se schimbe."
        : `La iterația ${k}, câtul Rayleigh al vectorului de pornire e ρ = ${zecimale(rho, 10)}, adică exact o valoare proprie a lui A — dar vectorul nu e vectorul ei propriu (‖A·v − ρ·v‖ = ${zecimale(rezidual, 6)}). ` +
          "Sistemul (A − ρI)·z = v n-are soluție, deci iterația nu poate face nici primul pas. Se pornește dintr-o altă direcție: e de ajuns să schimbi puțin o componentă a vectorului de pornire.",
    };
  });
}

/* ───────────────────────── deflația ───────────────────────── */

/**
 * §9 — deflația Wielandt.
 *
 * `x` e linia `i` din `A`, împărțită la `λ₁·v⁽¹⁾ᵢ`, unde `i` e poziția celei mai
 * mari componente în modul din `v⁽¹⁾` — cursul cere doar o componentă nenulă, iar
 * cea mai mare e alegerea care pierde cel mai puțină precizie. Rezultatul are
 * `xᵀ·v⁽¹⁾ = 1`, linia `i` din `B` nulă, iar `σ(B) = {0, λ₂, …, λₙ}`.
 */
export function deflatieWielandt(
  A: Matrice,
  lambda1: number,
  v1: number[],
): RezultatDeflatie | null {
  let indice = 0;
  for (let i = 1; i < v1.length; i++) {
    if (Math.abs(v1[i]!) > Math.abs(v1[indice]!)) indice = i;
  }
  const numitor = lambda1 * (v1[indice] ?? 0);
  if (!Number.isFinite(numitor) || Math.abs(numitor) < 1e-14) return null;

  const linie = A[indice];
  if (linie === undefined) return null;

  const x = linie.map((a) => a / numitor);
  const B = scadeRang1(A, lambda1, v1, x);
  return { indice, x, B, redusa: stergeLinieSiColoana(B, indice) };
}

/**
 * Algoritmul „MP cu deflație" din §9, rulat până la epuizarea matricei.
 *
 * La fiecare etapă: metoda puterii pe matricea curentă dă valoarea proprie
 * dominantă, deflația Wielandt o înlocuiește cu 0, iar linia și coloana ei se
 * șterg. Matricea scade cu un ordin la fiecare etapă, deci ultima are `1×1` și
 * se citește direct.
 *
 * **Vectorii proprii întorși sunt ai matricei etapei, nu ai lui `A`.** Cursul
 * dă relația care îi ridică înapoi la `A`; pagina nu o folosește, fiindcă ce se
 * arată e cum scade problema, nu reconstrucția bazei.
 */
export function deflatieCompleta(
  A: Matrice,
  tol: number,
  maxIteratii: number,
): { etape: EtapaDeflatie[]; motiv?: string } {
  const etape: EtapaDeflatie[] = [];
  let curenta = A.map((linie) => [...linie]);

  while (curenta.length > 0) {
    const n = curenta.length;

    if (n === 1) {
      const lambda = curenta[0]![0]!;
      etape.push({
        ordin: 1,
        matrice: curenta,
        lambda,
        v: [1],
        iteratii: 0,
        deflatie: null,
        explicatie: `Matricea a ajuns 1×1, deci ultima valoare proprie se citește direct: λ = ${zecimale(lambda, 8)}.`,
      });
      return { etape };
    }

    const rulare = run({
      A: curenta,
      pornire: Array.from({ length: n }, () => 1),
      tol,
      maxIteratii,
    });
    if (rulare.v === null || rulare.lambda === null) {
      return { etape, motiv: rulare.motiv };
    }

    const deflatie = deflatieWielandt(curenta, rulare.lambda, rulare.v);
    if (deflatie === null) {
      return {
        etape,
        motiv:
          "Deflația cere o componentă nenulă în vectorul propriu și o valoare proprie nenulă, ca împărțirea la λ₁·v⁽¹⁾ᵢ să se poată face. Aici nu există așa ceva.",
      };
    }

    etape.push({
      ordin: n,
      matrice: curenta,
      lambda: rulare.lambda,
      v: rulare.v,
      iteratii: rulare.pasi.length,
      deflatie,
      explicatie:
        `Pe matricea de ordin ${n}, metoda puterii dă în ${rulare.pasi.length} iterații λ = ${zecimale(rulare.lambda, 8)}, cu direcția ${vectorText(rulare.v)}. ` +
        `Deflația scade λ·v·xᵀ, ceea ce face linia ${deflatie.indice + 1} nulă și pune 0 în locul valorii proprii dominante; ` +
        `ștergând linia și coloana ${deflatie.indice + 1}, rămâne o matrice de ordin ${n - 1} cu exact celelalte valori proprii.`,
    });

    curenta = deflatie.redusa;
  }

  return { etape };
}

/** O etapă din algoritmul „MP cu deflație": ce matrice, ce valoare proprie, ce rămâne. */
export type EtapaDeflatie = {
  /** Ordinul matricei etapei. */
  ordin: number;
  matrice: Matrice;
  lambda: number;
  v: number[];
  /** Câte iterații a cerut metoda puterii aici. `0` la matricea 1×1. */
  iteratii: number;
  /** Deflația aplicată; `null` la ultima etapă, unde nu mai e nimic de deflat. */
  deflatie: RezultatDeflatie | null;
  explicatie: string;
};

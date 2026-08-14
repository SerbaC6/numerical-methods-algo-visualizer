/**
 * PageRank: metoda puterii pe matricea Google.
 *
 * **Sursă: `cursuri_MN/valori_vectori_proprii_teorie_curs7.md`, §10** — algoritmul
 * de la finalul secțiunii, literă cu literă:
 *
 * ```
 * 1: n ← numărul de linii ale lui M      6:     v ← G · v
 * 2: v ← 1_n                             7:     v ← v / ||v||
 * 3: G ← d·M + ((1−d)/n)·1_{n×n}         8:     if ||v − vprev|| < tol then break
 * 4: while true do                       9: end while
 * 5:     vprev ← v                      10: v ← v / ||v||_1
 * ```
 *
 * Iterația nu se renumerotează și nu se „îmbunătățește": normalizarea din linia
 * 7 rămâne cu norma 2, iar norma 1 vine abia la linia 10. Ce se adaugă față de
 * pseudocod e doar oprirea după `maxIteratii` — un `while true` n-are ce căuta
 * într-o pagină care rulează în browser — și cei patru pași de construcție
 * dinaintea buclei, care arată de unde vine `G`.
 */

import type { MetaMetoda, Parametru } from "@/algorithms/tipuri";
import { zecimale } from "@/lib/numere";
import {
  adiacenta,
  distributie,
  google,
  gradeIesire,
  inmultesteVector,
  norma2,
  normalizeazaLinii,
  paginiFaraLinkuri,
  transpune,
} from "@/algorithms/pagerank/retea";
import { clasamentText, matriceLatex, procent, vectorLatex } from "@/algorithms/pagerank/descriere";
import type {
  LocClasament,
  ParametriPageRank,
  PasPageRank,
  RezultatPageRank,
} from "@/algorithms/pagerank/tipuri";

export const meta: MetaMetoda = {
  id: "pagerank",
  titlu: "PageRank prin metoda puterii",
  rezumat:
    "Împarte fiecare pagină la link-urile care pleacă din ea, transpune, adaugă saltul aleatoriu și iterează până când ponderile nu se mai mișcă.",
  sursa: "valori_vectori_proprii_teorie_curs7.md",
};

export const params: Parametru[] = [
  { nume: "d", eticheta: "d — șansa de a urma un link", tip: "numar", implicit: 0.85, min: 0.5, max: 0.99, pas: 0.01 },
  { nume: "tol", eticheta: "toleranța pentru ‖v − vprev‖", tip: "numar", implicit: 1e-6 },
  { nume: "maxIteratii", eticheta: "iterații maxime", tip: "numar", implicit: 100, min: 1, pas: 1 },
];

/** Sub cât se consideră două scoruri egale, deci pe același loc în clasament. */
const TOLERANTA_EGALITATE = 1e-9;

export function run(p: ParametriPageRank): RezultatPageRank {
  const { retea, d, tol, maxIteratii } = p;
  const n = retea.linkuri.length;
  const nume = retea.nume;
  const gol = { pasi: [] as PasPageRank[], matrici: null, pagerank: null, clasament: [] };

  if (!(d > 0 && d < 1)) {
    return {
      ...gol,
      stare: "esuat",
      motiv: `d trebuie să fie strict între 0 și 1 — e o probabilitate. Valoarea primită e ${zecimale(d, 4)}.`,
    };
  }

  const agatatoare = paginiFaraLinkuri(retea);
  if (agatatoare.length > 0) {
    const lista = agatatoare.map((i) => nume[i] ?? `P${i + 1}`).join(", ");
    return {
      ...gol,
      stare: "esuat",
      motiv:
        `Din ${lista} nu pleacă niciun link, deci nu există „numărul de link-uri de ieșire" la care să se împartă linia ` +
        `și coloana corespunzătoare din M rămâne nulă. Matricea nu mai e stocastică, iar λ = 1 nu mai e garantat valoare proprie: ` +
        `navigatorul care ajunge acolo nu mai are unde să meargă. Dă-i ${agatatoare.length === 1 ? "paginii" : "paginilor"} măcar un link de ieșire.`,
    };
  }

  const A = adiacenta(retea);
  const grade = gradeIesire(retea);
  const S = normalizeazaLinii(A);
  const M = transpune(S);
  const G = google(M, d);
  const matrici = { A, S, M, G };

  const pasi: PasPageRank[] = [];
  const adauga = (pas: Omit<PasPageRank, "index">) => pasi.push({ ...pas, index: pasi.length + 1 });

  adauga({
    faza: "adiacenta",
    matrice: A,
    explicatie:
      "Se scrie rețeaua ca matrice: pe linia i stau link-urile care pleacă din pagina i, " +
      "deci a[i][j] = 1 înseamnă „pagina i trimite către pagina j". " +
      `Din fiecare pagină pleacă ${grade.map((g, i) => `${nume[i] ?? `P${i + 1}`}: ${g}`).join(", ")} link-uri.`,
    latexPas: `\\htmlId{pr-A}{A} = ${matriceLatex(A)}`,
    evidentiaza: ["pr-A"],
  });

  adauga({
    faza: "normalizare",
    matrice: S,
    explicatie:
      "Cine pleacă de pe o pagină își împarte atenția în mod egal între link-urile ei, deci fiecare linie se împarte la câte link-uri are: " +
      `${grade.map((g, i) => `linia ${i + 1} la ${g}`).join(", ")}. Acum fiecare linie însumează 1.`,
    latexPas: `\\htmlId{pr-S}{S} = ${matriceLatex(S)},\\quad s_{ij} = \\frac{a_{ij}}{\\sum_j a_{ij}}`,
    evidentiaza: ["pr-S"],
  });

  adauga({
    faza: "transpunere",
    matrice: M,
    explicatie:
      "Cursul cere ca matricea stocastică să aibă coloanele egale cu 1, iar împărțirea s-a făcut pe linii — așa că se transpune: " +
      "celula (i, j) se mută în (j, i), diagonala stă pe loc. De aici înainte coloana j spune unde se duce cine e pe pagina j.",
    latexPas: `\\htmlId{pr-M}{M} = S^{T} = ${matriceLatex(M)}`,
    evidentiaza: ["pr-M"],
  });

  adauga({
    faza: "google",
    matrice: G,
    explicatie:
      `Cu probabilitatea d = ${zecimale(d, 2)} navigatorul urmează un link, iar cu ${zecimale(1 - d, 2)} sare la o pagină luată la întâmplare — ` +
      `de aceea peste M se adaugă ${zecimale((1 - d) / n, 4)} în fiecare celulă. Matricea Google are toate elementele strict pozitive, ` +
      "deci λ = 1 e valoare proprie dominantă și se poate aplica metoda puterii.",
    latexPas:
      `\\htmlId{pr-G}{G} = d\\,M + \\frac{1-d}{N}\\,\\mathrm{ONES}(N)` +
      ` = ${zecimale(d, 2).replace(",", "{,}")}\\,M + ${zecimale((1 - d) / n, 4).replace(",", "{,}")}\\,\\mathrm{ONES}(${n})` +
      ` = ${matriceLatex(G)}`,
    evidentiaza: ["pr-G"],
  });

  // Liniile 2 și 5–8 din algoritm. `v ← 1_n`, nenormalizat, exact ca în curs.
  let v: number[] = Array.from({ length: n }, () => 1);
  let iteratii = 0;
  let convergent = false;

  for (let k = 1; k <= maxIteratii; k++) {
    const vprev = v;
    const produs = inmultesteVector(G, vprev);
    const lungime = norma2(produs);

    if (!(lungime > 0) || !Number.isFinite(lungime)) {
      return {
        pasi,
        stare: "esuat",
        motiv: `La iterația ${k}, ‖G·v‖ a ieșit ${zecimale(lungime, 6)}, deci împărțirea din linia 7 nu se poate face.`,
        matrici,
        pagerank: null,
        clasament: [],
      };
    }

    const vUrmator = produs.map((x) => x / lungime);
    const eroare = norma2(vUrmator.map((x, i) => x - vprev[i]!));
    const dist = distributie(vUrmator);
    const distAnterioara = distributie(vprev);
    const mutareMaxima = Math.max(...dist.map((x, i) => Math.abs(x - distAnterioara[i]!)));

    adauga({
      faza: "iteratie",
      iteratie: k,
      v: vUrmator,
      distributie: dist,
      distributieAnterioara: distAnterioara,
      eroare,
      explicatie:
        `Iterația ${k}: fiecare pagină primește ponderile paginilor care trimit către ea, apoi vectorul se readuce la lungime 1. ` +
        `Ponderea care s-a mișcat cel mai mult e cu ${procent(mutareMaxima, 2)}, iar criteriul de oprire, ‖v − vprev‖, e ${zecimale(eroare, 8)}` +
        `${eroare < tol ? `, adică sub toleranța ${zecimale(tol, 8)} — aici se oprește bucla.` : `, încă peste toleranța ${zecimale(tol, 8)}.`}`,
      latexPas:
        `\\htmlId{pr-v}{v^{(${k})}} = \\frac{\\htmlId{pr-G-iter}{G}\\,v^{(${k - 1})}}{\\lVert G\\,v^{(${k - 1})}\\rVert}` +
        ` = ${vectorLatex(vUrmator)},\\quad \\htmlId{pr-eroare}{\\lVert v^{(${k})} - v^{(${k - 1})}\\rVert} = ${zecimale(eroare, 8).replace(",", "{,}")}`,
      evidentiaza: ["pr-v", "pr-G-iter", "pr-eroare"],
    });

    v = vUrmator;
    iteratii = k;

    if (eroare < tol) {
      convergent = true;
      break;
    }
  }

  const pagerank = distributie(v);
  const clasament = construiesteClasament(pagerank, nume);

  if (!convergent) {
    return {
      pasi,
      stare: "neterminat",
      motiv:
        `S-au consumat cele ${maxIteratii} iterații fără ca ‖v − vprev‖ să scadă sub ${zecimale(tol, 8)}. ` +
        "Viteza buclei e dată de raportul dintre a doua valoare proprie a lui G și 1, iar acesta crește odată cu d: " +
        "cu cât navigatorul urmează mai des link-urile, cu atât ponderile se așază mai încet.",
      matrici,
      pagerank,
      clasament,
    };
  }

  // Linia 10 din algoritm: abia aici valorile devin probabilități.
  adauga({
    faza: "normalizare-finala",
    iteratie: iteratii,
    v: pagerank,
    distributie: pagerank,
    explicatie:
      "Bucla s-a oprit, iar ultima linie a algoritmului împarte vectorul la suma modulelor lui, nu la lungime: " +
      "abia acum cifrele însumează 100 % și se pot citi ca probabilități. " +
      `Clasamentul e ${clasamentText(clasament)}.`,
    latexPas:
      `\\htmlId{pr-final}{R} = \\frac{v^{(${iteratii})}}{\\lVert v^{(${iteratii})}\\rVert_1} = ${vectorLatex(pagerank)}`,
    evidentiaza: ["pr-final"],
  });

  return { pasi, stare: "convergent", matrici, pagerank, clasament };
}

/**
 * Clasamentul, cu egalități păstrate: pe exemplul din curs, `P1` și `P4` au
 * exact același scor și trebuie să primească **același loc**, iar locul următor
 * sare peste (1, 2, 3, 3 — nu 3 și 4).
 */
export function construiesteClasament(scoruri: number[], nume: string[]): LocClasament[] {
  const ordonate = scoruri
    .map((scor, pagina) => ({ pagina, nume: nume[pagina] ?? `P${pagina + 1}`, scor }))
    .sort((a, b) => b.scor - a.scor);

  const clasament: LocClasament[] = [];
  for (const [pozitie, intrare] of ordonate.entries()) {
    const anterior = clasament.at(-1);
    const egal = anterior !== undefined && Math.abs(anterior.scor - intrare.scor) < TOLERANTA_EGALITATE;
    clasament.push({ ...intrare, loc: egal ? anterior.loc : pozitie + 1 });
  }
  return clasament;
}

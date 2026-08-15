/**
 * Eliminarea gaussiană pe matricea extinsă, plus substituția înapoi.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`** — Algorithm 1
 * (§4.4) pentru eliminare, §8.1 pentru substituția înapoi, §3.4 pentru
 * determinant. Nimic scris din memorie.
 *
 * **Ce e și ce nu e aici.** Modulul dă cifrele, nu desenul: fiecare pas conține
 * pivotul, raportul `µ`, linia dinainte și linia de după, ca animația și, mai
 * târziu, interfața să nu-și poată calcula fiecare propriile numere. Nu conține
 * JSX și nu știe nimic despre React.
 *
 * **Forma pe care o folosește pasul.** Cursul scrie transformarea ca matrice
 * (`T_p = I_n − t_p·e_pᵀ`, apoi `A ← T·A`), dar înmulțirea aceea, desfășurată pe
 * linii, e chiar `Lᵢ ← Lᵢ − µᵢₚ·Lₚ` — de aceea aici se aplică pe linii. Cifrele
 * sunt identice; se schimbă doar felul în care se scrie, iar pe linii se poate
 * și desena.
 *
 * Verificat în `scripts/verificare-algoritmi/eliminare-gaussiana.ts`, pe
 * exemplul rezolvat din §4.3.
 */

/** O matrice deasă, pe linii: `m[i][j]`. */
export type Matrice = number[][];

/** Un pas de eliminare: o singură linie, schimbată o singură dată. */
export type PasEliminare = {
  /** Coloana pe care se lucrează, 0-based. Pivotul stă la `(coloana, coloana)`. */
  coloana: number;
  /** Linia care se schimbă, 0-based — mereu sub cea a pivotului. */
  linie: number;
  /** Valoarea pivotului, `a[coloana][coloana]`, dinaintea pasului. */
  pivot: number;
  /** `µ = a[linie][coloana] / pivot` — cât din linia pivotului se scade. */
  mu: number;
  /** Linia pivotului, cea care se scade (nu se schimbă la pasul ăsta). */
  liniaPivot: number[];
  /** Linia care se schimbă, înainte de operație. */
  inainte: number[];
  /** Aceeași linie, după `Lᵢ ← Lᵢ − µ·Lₚ`. */
  dupa: number[];
  /** Toată matricea extinsă după pas — starea pe care o desenează animația. */
  matrice: Matrice;
};

export type RezultatEliminare = {
  pasi: PasEliminare[];
  /** Matricea extinsă adusă la formă superior triunghiulară. */
  U: Matrice;
};

/** Copie adâncă — pașii păstrează stări, deci nu pot împărți același vector. */
const copiaza = (m: Matrice): Matrice => m.map((linie) => [...linie]);

/**
 * Eliminarea gaussiană fără pivotare, pe matricea extinsă `[A|b]`.
 *
 * Un pas per **linie**, nu per coloană: cursul îl scrie ca o singură înmulțire
 * `T·A` care curăță toată coloana deodată, dar cine învață metoda o face linie cu
 * linie, iar `µ` e altul pentru fiecare linie.
 *
 * Nu tratează pivotul nul — pivotarea e o metodă separată; aici oprirea e chiar
 * lecția (`µ` ar fi împărțire la zero). De aceea un pivot nul aruncă, în loc să
 * producă `Infinity` în tăcere.
 */
export function eliminareGaussiana(extinsa: Matrice): RezultatEliminare {
  const A = copiaza(extinsa);
  const m = A.length;
  const coloane = A[0]?.length ?? 0;
  // Matricea extinsă are o coloană în plus față de necunoscute, iar eliminarea
  // merge doar pe partea de coeficienți.
  const maxP = Math.min(m, coloane - 1);
  const pasi: PasEliminare[] = [];

  for (let p = 0; p < maxP; p++) {
    const liniaPivot = A[p];
    if (!liniaPivot) continue;
    const pivot = liniaPivot[p] ?? 0;
    if (pivot === 0) {
      throw new Error(`Pivot nul pe coloana ${p + 1}: eliminarea fără pivotare nu poate continua.`);
    }

    for (let i = p + 1; i < m; i++) {
      const linie = A[i];
      if (!linie) continue;
      const mu = (linie[p] ?? 0) / pivot;
      const inainte = [...linie];
      const dupa = inainte.map((v, j) => v - mu * (liniaPivot[j] ?? 0));
      A[i] = dupa;

      pasi.push({
        coloana: p,
        linie: i,
        pivot,
        mu,
        liniaPivot: [...liniaPivot],
        inainte,
        dupa: [...dupa],
        matrice: copiaza(A),
      });
    }
  }

  return { pasi, U: A };
}

/** Un pas de substituție înapoi: ce necunoscută iese și din ce ecuație. */
export type PasSubstitutie = {
  /** Indicele necunoscutei aflate acum, 0-based. */
  indice: number;
  /** Valoarea ei. */
  valoare: number;
  /** Suma termenilor deja cunoscuți, cea care se scade din termenul liber. */
  sumaCunoscute: number;
  /** Linia din care s-a aflat, ca s-o poată arăta desenul. */
  linie: number[];
};

/**
 * Substituția înapoi pe o matrice extinsă superior triunghiulară:
 * `xᵢ = (bᵢ − Σⱼ₌ᵢ₊₁ aᵢⱼ·xⱼ) / aᵢᵢ`, de jos în sus.
 */
export function substitutieInapoi(U: Matrice): { x: number[]; pasi: PasSubstitutie[] } {
  const n = U.length;
  const x = new Array<number>(n).fill(0);
  const pasi: PasSubstitutie[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const linie = U[i];
    if (!linie) continue;
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += (linie[j] ?? 0) * (x[j] ?? 0);
    const diagonala = linie[i] ?? 0;
    const valoare = ((linie[n] ?? 0) - suma) / diagonala;
    x[i] = valoare;
    pasi.push({ indice: i, valoare, sumaCunoscute: suma, linie: [...linie] });
  }

  return { x, pasi };
}

/**
 * Determinantul, citit de pe diagonala formei triunghiulare.
 *
 * Ține doar cât timp **nu** s-au permutat linii: matricea de adunare are
 * `det = 1`, deci eliminarea lasă determinantul neatins, pe când fiecare
 * permutare i-ar schimba semnul.
 */
export function determinantDinU(U: Matrice): number {
  return U.reduce((produs, linie, i) => produs * (linie[i] ?? 0), 1);
}

/*
 * Selecția pivotului nu mai stă aici. Cele trei strategii — parțială, scalată,
 * totală — au ajuns în `pivotare.ts`, împreună cu permutările pe care le cer:
 * separate, ele s-ar fi depărtat de eliminarea pe care o conduc, iar interfața
 * are nevoie și de **scorurile** comparate, nu doar de linia câștigătoare.
 */

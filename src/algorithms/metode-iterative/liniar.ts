/**
 * Aritmetica de vectori și matrice de care au nevoie metodele iterative, plus
 * rezolvarea **exactă** a sistemului, cu care se compară rezultatul iterației.
 *
 * Funcții pure, fără nimic din interfață. Eliminarea cu pivotare parțială e cea
 * din `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`, §4 — aici nu e
 * subiectul paginii, ci **martorul**: cursul 5, §7 spune că eroarea se măsoară
 * între doi pași consecutivi tocmai fiindcă `x*` nu se cunoaște, iar pagina
 * trebuie să poată arăta totuși cât de departe e adevărul.
 */

/** `A·v`, cu `A` pe linii. */
export function inmulteste(A: number[][], v: number[]): number[] {
  return A.map((linie) => linie.reduce((suma, a, j) => suma + a * (v[j] ?? 0), 0));
}

export function scade(u: number[], v: number[]): number[] {
  return u.map((x, i) => x - (v[i] ?? 0));
}

/** `‖v‖∞ = max |vᵢ|` — prima normă din lista de criterii de la §7. */
export function normaInfinit(v: number[]): number {
  return v.reduce((maxim, x) => Math.max(maxim, Math.abs(x)), 0);
}

/**
 * Matricea e **dominant diagonală** (pe linii)?
 *
 * `|aᵢᵢ| > Σ_{j≠i} |aᵢⱼ|`, pentru fiecare linie. Condiția suficientă — dar nu
 * necesară — de convergență din §1; inegalitatea e strictă, altfel exemplul din
 * §10, problema 4 (unde peste tot e egalitate) ar fi declarat convergent, deși
 * Jacobi nu converge pe el.
 */
export function esteDominantDiagonala(A: number[][]): boolean {
  return A.every((linie, i) => {
    const diagonala = Math.abs(linie[i] ?? 0);
    const rest = linie.reduce((suma, a, j) => (j === i ? suma : suma + Math.abs(a)), 0);
    return diagonala > rest;
  });
}

/**
 * Soluția exactă a lui `A·x = b`, prin eliminare gaussiană cu pivotare
 * parțială. `null` dacă matricea e singulară.
 */
export function rezolvaSistem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  const M = A.map((linie, i) => [...linie, b[i] ?? 0]);

  for (let k = 0; k < n; k++) {
    let liniePivot = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i]?.[k] ?? 0) > Math.abs(M[liniePivot]?.[k] ?? 0)) liniePivot = i;
    }
    const pivot = M[liniePivot]?.[k] ?? 0;
    if (!Number.isFinite(pivot) || Math.abs(pivot) < 1e-14) return null;

    if (liniePivot !== k) {
      const temp = M[k]!;
      M[k] = M[liniePivot]!;
      M[liniePivot] = temp;
    }

    const linieK = M[k]!;
    for (let i = k + 1; i < n; i++) {
      const linieI = M[i]!;
      const factor = (linieI[k] ?? 0) / (linieK[k] ?? 1);
      for (let j = k; j <= n; j++) linieI[j] = (linieI[j] ?? 0) - factor * (linieK[j] ?? 0);
    }
  }

  const x = Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const linie = M[i]!;
    let suma = linie[n] ?? 0;
    for (let j = i + 1; j < n; j++) suma -= (linie[j] ?? 0) * (x[j] ?? 0);
    const diagonala = linie[i] ?? 0;
    if (Math.abs(diagonala) < 1e-14) return null;
    x[i] = suma / diagonala;
  }

  return x.every(Number.isFinite) ? x : null;
}

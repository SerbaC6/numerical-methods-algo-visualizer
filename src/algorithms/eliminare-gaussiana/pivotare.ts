/**
 * Cele trei pivotări, pe matricea extinsă: parțială, cu pivot scalat, totală.
 *
 * **Sursă: `cursuri_MN/sisteme_liniare_metode_directe_MN_curs4.md`** — §5.2
 * (Algorithm 2, GPP), §5.3 (Algorithm 3, GPPS), §5.4 (Algorithm 4, GPT), plus
 * §8.1 pentru substituția înapoi. Nimic scris din memorie.
 *
 * **De ce un singur modul pentru toate trei.** Cele trei algoritme din curs
 * diferă printr-o singură linie — cea care alege pivotul —, iar restul
 * (permutarea, `µ`, `Lᵢ ← Lᵢ − µLₚ`) e literalmente același pseudocod. Scrise
 * separat, cele trei ar fi ajuns să se depărteze una de alta la prima corectură.
 *
 * **Ce e și ce nu e aici.** Modulul dă cifrele, propoziția fiecărui pas și
 * formula lui cu numerele puse în ea; nu conține JSX și nu știe nimic despre
 * React. Stările de celulă (`pivot`, `zero`, `curent`) sunt treabă de desen și
 * se compun în interfață, din câmpurile de mai jos.
 *
 * **Eșecul e rezultat, nu excepție.** Matricea e editabilă în interfață, deci un
 * pivot nul sau o linie nulă sunt intrări posibile, nu bug-uri: se întorc prin
 * `stare: "esuat"` și `motiv`, ca interfața să le poată scrie într-un `Callout`.
 *
 * Verificat în `scripts/verificare-algoritmi/eliminare-gaussiana.ts`, pe
 * exemplele din curs.
 */

import type { Matrice } from "@/algorithms/eliminare-gaussiana/eliminare";
import { zecimale } from "@/lib/numere";

export type Strategie = "partiala" | "scalata" | "totala";

/** Ce a comparat strategia la pasul `p` și ce a ieșit din comparație. */
export type AlegerePivot = {
  /** Pasul, adică poziția de pe diagonală care se umple acum. 0-based. */
  p: number;
  /** Linia care aduce pivotul. */
  linie: number;
  /** Coloana care aduce pivotul — diferă de `p` numai la pivotarea totală. */
  coloana: number;
  /**
   * Scorul după care candidează fiecare linie, indexat de la 0. Liniile de
   * deasupra lui `p` nu candidează, deci au `null`.
   *
   * `|aᵢₚ|` la parțială, `|aᵢₚ|/sᵢ` la scalată, iar la totală cel mai mare
   * element în modul de pe linia `i`, din submatricea rămasă.
   */
  scoruri: (number | null)[];
  /** Factorii de scalare `sᵢ`, numai la pivotarea scalată. */
  scalari?: (number | null)[];
  /** Nicio linie nu poate da pivot nenul: matricea e singulară. */
  singular: boolean;
};

type Baza = {
  /** Pasul de eliminare din care face parte, 0-based. */
  p: number;
  /** Starea completă a matricei **după** pas — ce desenează interfața. */
  matrice: Matrice;
  /** O propoziție: ce s-a întâmplat acum. */
  explicatie: string;
  /** Formula pasului, cu numerele lui puse în ea. */
  latexPas: string;
  /** Id-urile din `\htmlId` pe care `FormulaBlock` le aprinde. */
  evidentiaza: string[];
};

export type PasAlegere = Baza & { tip: "alegere"; alegere: AlegerePivot };

export type PasPermutare = Baza & {
  tip: "permutare";
  /** Liniile schimbate între ele: `[p, linia aleasă]`. */
  linii: [number, number];
  /** Coloanele schimbate, numai la pivotarea totală. */
  coloane?: [number, number];
};

export type PasEliminarePivot = Baza & {
  tip: "eliminare";
  /** Linia care se schimbă, mereu sub cea a pivotului. */
  linie: number;
  pivot: number;
  mu: number;
  inainte: number[];
  dupa: number[];
};

export type PasSubstitutie = Baza & {
  tip: "substitutie";
  /** Poziția din sistemul triunghiular, 0-based. */
  pozitie: number;
  /** Ce necunoscută din sistemul **scris** stă pe poziția asta. */
  necunoscuta: number;
  valoare: number;
  /** Suma termenilor deja aflați, cea care se scade din termenul liber. */
  sumaCunoscute: number;
};

export type PasPivotare = PasAlegere | PasPermutare | PasEliminarePivot | PasSubstitutie;

export type RezultatPivotare = {
  pasi: PasPivotare[];
  /** Matricea adusă la formă superior triunghiulară. */
  U: Matrice;
  /** Soluția, pusă la loc în ordinea necunoscutelor din sistemul scris. */
  x?: number[];
  /**
   * `PR` din Algorithm 4: `ordineNecunoscute[k]` e necunoscuta care a ajuns pe
   * poziția `k` după permutările de coloane. La parțială și la scalată rămâne
   * `[0, 1, …]`, fiindcă acelea nu ating coloanele.
   */
  ordineNecunoscute: number[];
  /** Câte permutări de linii s-au făcut — fiecare schimbă semnul determinantului. */
  permutariLinii: number;
  stare: "convergent" | "esuat";
  motiv?: string;
};

export type ParametriPivotare = {
  /** Matricea de lucru: `coeficienti` coloane de coeficienți, plus opțional `b`. */
  matrice: Matrice;
  /** Câte coloane de la stânga sunt coeficienți. Restul (cel mult una) e `b`. */
  coeficienti: number;
  strategie: Strategie;
};

const copiaza = (m: Matrice): Matrice => m.map((linie) => [...linie]);

/**
 * Sub cât se citește un număr ca zero.
 *
 * **Relativ, nu absolut.** Eliminarea lasă în urmă resturi de rotunjire de
 * ordinul `ε·‖A‖`: pe sistemul cu `10 000` din curs, un „zero" produs iese pe
 * la `10⁻¹²`, adică mult peste orice prag fix rezonabil. Un prag absolut ar
 * declara singulară o matrice perfect bună, sau — mai rău — ar accepta ca pivot
 * un rest de rotunjire pe o matrice chiar singulară.
 */
const pragNul = (m: Matrice): number => {
  let scara = 0;
  for (const linie of m) for (const v of linie) scara = Math.max(scara, Math.abs(v));
  return scara === 0 ? 0 : scara * 1e-12;
};

/** Cifra, așa cum se scrie în proză: întregii rămân întregi, restul se scurtează. */
function numar(x: number): string {
  if (x === 0 || Object.is(x, -0)) return "0";
  if (!Number.isFinite(x)) return zecimale(x);
  if (Number.isInteger(x) && Math.abs(x) < 1e6) return String(x);
  if (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e6) return x.toExponential(2).replace(".", ",");
  return zecimale(x, 4).replace(/0+$/, "").replace(/,$/, "");
}

/** Aceeași cifră, dar în modul matematic: virgula se scrie `{,}`, `e−5` devine putere. */
function numarLatex(x: number): string {
  const scris = numar(x);
  const stiintific = /^(-?[\d,]+)e([+-]\d+)$/.exec(scris);
  if (stiintific) {
    return `${stiintific[1]!.replace(",", "{,}")}\\cdot 10^{${Number(stiintific[2])}}`;
  }
  return scris.replace(",", "{,}");
}

/**
 * Linia aleasă de pivotarea parțială la pasul `p` (§5.2): cel mai mare element
 * în modul din coloana `p`, căutat numai **sub** pivot.
 */
export function alegePartial(M: Matrice, p: number, prag: number): AlegerePivot {
  const scoruri: (number | null)[] = M.map((_, i) => (i < p ? null : Math.abs(M[i]![p] ?? 0)));
  let linie = p;
  for (let i = p + 1; i < M.length; i++) {
    if ((scoruri[i] as number) > (scoruri[linie] as number)) linie = i;
  }
  return { p, linie, coloana: p, scoruri, singular: (scoruri[linie] as number) <= prag };
}

/**
 * Linia aleasă de pivotarea parțială cu pivot scalat (§5.3): se compară
 * rapoartele `|aᵢₚ|/sᵢ`, cu `sᵢ` cel mai mare element în modul de pe linia `i`.
 *
 * `sᵢ` se ia numai pe **coeficienți**, de la coloana `p` în dreapta — fereastra
 * `A(p:m, p:n−1)` din pseudocod. Cu termenul liber înăuntru, o ecuație cu `b`
 * mare ar părea prost scalată fără ca matricea să aibă vreo vină.
 */
export function alegeScalat(
  M: Matrice,
  p: number,
  coeficienti: number,
  prag: number,
): AlegerePivot {
  const scalari: (number | null)[] = [];
  const scoruri: (number | null)[] = [];

  for (let i = 0; i < M.length; i++) {
    if (i < p) {
      scalari.push(null);
      scoruri.push(null);
      continue;
    }
    let s = 0;
    for (let j = p; j < coeficienti; j++) s = Math.max(s, Math.abs(M[i]![j] ?? 0));
    scalari.push(s);
    // Linie nulă: raportul n-are numitor. Scorul e 0, iar `singular` de mai jos
    // îl prinde — cursul spune explicit că `sᵢ = 0` înseamnă matrice singulară.
    scoruri.push(s === 0 ? 0 : Math.abs(M[i]![p] ?? 0) / s);
  }

  let linie = p;
  for (let i = p + 1; i < M.length; i++) {
    if ((scoruri[i] as number) > (scoruri[linie] as number)) linie = i;
  }
  const scaraLiniei = scalari[linie] as number;
  return {
    p,
    linie,
    coloana: p,
    scoruri,
    scalari,
    singular: scaraLiniei === 0 || Math.abs(M[linie]![p] ?? 0) <= prag,
  };
}

/**
 * Poziția aleasă de pivotarea totală (§5.4): cel mai mare element în modul din
 * toată submatricea rămasă — deci se permută și coloane.
 *
 * Căutarea merge doar pe coloanele de coeficienți: termenul liber n-are cum să
 * ajungă pivot, iar cursul avertizează exact aici că `A` e matricea extinsă.
 *
 * Scorul unei linii e maximul ei din submatrice, ca să se poată pune tot o
 * coloană de scoruri lângă matrice; maximul global e maximul acestor maxime.
 */
export function alegeTotal(M: Matrice, p: number, coeficienti: number, prag: number): AlegerePivot {
  const scoruri: (number | null)[] = [];
  const coloanaLiniei: number[] = [];

  for (let i = 0; i < M.length; i++) {
    if (i < p) {
      scoruri.push(null);
      coloanaLiniei.push(p);
      continue;
    }
    let maxim = 0;
    let unde = p;
    for (let j = p; j < coeficienti; j++) {
      const v = Math.abs(M[i]![j] ?? 0);
      if (v > maxim) {
        maxim = v;
        unde = j;
      }
    }
    scoruri.push(maxim);
    coloanaLiniei.push(unde);
  }

  let linie = p;
  for (let i = p + 1; i < M.length; i++) {
    if ((scoruri[i] as number) > (scoruri[linie] as number)) linie = i;
  }
  return {
    p,
    linie,
    coloana: coloanaLiniei[linie]!,
    scoruri,
    singular: (scoruri[linie] as number) <= prag,
  };
}

/** Numele liniei și al coloanei, așa cum se scriu în interfață (1-based). */
const L = (i: number) => `L${i + 1}`;
const C = (j: number) => `C${j + 1}`;

/** Regula de selecție a strategiei, cu numerele pasului puse în ea. */
function latexAlegere(strategie: Strategie, a: AlegerePivot): string {
  const p = a.p + 1;
  const scor = numarLatex(a.scoruri[a.linie] as number);

  if (strategie === "partiala") {
    return (
      `|a_{i_p,\\,${p}}| = \\max_{i \\ge ${p}} |a_{i${p}}| = \\htmlId{piv-scor}{${scor}}` +
      ` \\quad \\Rightarrow \\quad i_p = \\htmlId{piv-linie}{${L(a.linie)}}`
    );
  }
  if (strategie === "scalata") {
    const s = numarLatex((a.scalari?.[a.linie] ?? 0) as number);
    return (
      `s_i = \\max_{j \\ge ${p}} |a_{ij}|, \\qquad` +
      ` \\max_{i \\ge ${p}} \\frac{|a_{i${p}}|}{s_i} = \\frac{|a_{${a.linie + 1}${p}}|}{\\htmlId{piv-scalare}{${s}}}` +
      ` = \\htmlId{piv-scor}{${scor}} \\quad \\Rightarrow \\quad i_p = \\htmlId{piv-linie}{${L(a.linie)}}`
    );
  }
  return (
    `|a_{rc}| = \\max_{i,\\,j \\ge ${p}} |a_{ij}| = \\htmlId{piv-scor}{${scor}}` +
    ` \\quad \\Rightarrow \\quad (r,\\,c) = \\htmlId{piv-linie}{(${a.linie + 1},\\,${a.coloana + 1})}`
  );
}

/** Propoziția pasului de selecție. */
function prozaAlegere(strategie: Strategie, a: AlegerePivot, M: Matrice): string {
  const scor = numar(a.scoruri[a.linie] as number);
  const valoare = numar(M[a.linie]![a.coloana] ?? 0);

  // Căutarea s-a făcut, dar n-a găsit nimic: nu există pivot, deci propoziția
  // nu are voie să numească un „câștigător". Motivul complet vine în `motiv`.
  if (a.singular) {
    if (strategie === "scalata" && a.scalari?.[a.linie] === 0) {
      return `${L(a.linie)} nu are factor de scalare: toți coeficienții ei de la coloana ${a.p + 1} încolo sunt nuli.`;
    }
    return strategie === "totala"
      ? `În toată submatricea rămasă nu mai există niciun element nenul, deci nu se poate alege un pivot.`
      : `Pe coloana ${a.p + 1}, de la ${L(a.p)} în jos, toate elementele sunt nule: nu e nimic de adus pe diagonală.`;
  }

  if (strategie === "partiala") {
    return a.linie === a.p
      ? `Pe coloana ${a.p + 1}, cel mai mare element în modul de sub diagonală e chiar ${valoare}, din ${L(a.p)}: nu se schimbă nimic.`
      : `Pe coloana ${a.p + 1}, cel mai mare element în modul e ${scor}, în ${L(a.linie)} — de acolo vine pivotul.`;
  }
  if (strategie === "scalata") {
    const s = numar((a.scalari?.[a.linie] ?? 0) as number);
    return (
      `Fiecare candidat se împarte la cel mai mare coeficient de pe linia lui; ` +
      `${L(a.linie)} câștigă cu ${scor} = ${valoare} / ${s}.`
    );
  }
  return `Cel mai mare element în modul din toată submatricea rămasă e ${scor}, la intersecția lui ${L(a.linie)} cu ${C(a.coloana)}.`;
}

/**
 * Eliminarea gaussiană cu pivotare, pe matricea de lucru.
 *
 * Un pas de listă = un lucru care se vede: alegerea pivotului, permutarea (numai
 * dacă schimbă ceva), fiecare linie eliminată, fiecare necunoscută aflată.
 * Structura asta vine din felul în care se predă metoda — alegerea pivotului e
 * ea însăși o decizie, nu un detaliu de implementare al eliminării.
 */
export function ruleazaPivotare({
  matrice,
  coeficienti,
  strategie,
}: ParametriPivotare): RezultatPivotare {
  const M = copiaza(matrice);
  const m = M.length;
  const coloane = M[0]?.length ?? 0;
  const areTermenLiber = coloane > coeficienti;
  const maxP = Math.min(m, coeficienti);
  const prag = pragNul(M);

  const pasi: PasPivotare[] = [];
  const ordineNecunoscute = Array.from({ length: coeficienti }, (_, j) => j);
  let permutariLinii = 0;

  for (let p = 0; p < maxP; p++) {
    const alegere =
      strategie === "partiala"
        ? alegePartial(M, p, prag)
        : strategie === "scalata"
          ? alegeScalat(M, p, coeficienti, prag)
          : alegeTotal(M, p, coeficienti, prag);

    pasi.push({
      tip: "alegere",
      p,
      alegere,
      matrice: copiaza(M),
      explicatie: prozaAlegere(strategie, alegere, M),
      latexPas: latexAlegere(strategie, alegere),
      evidentiaza: ["piv-scor", "piv-linie"],
    });

    if (alegere.singular) {
      return {
        pasi,
        U: M,
        ordineNecunoscute,
        permutariLinii,
        stare: "esuat",
        motiv: motivulOpririi(strategie, alegere),
      };
    }

    // Permutarea se scrie ca pas doar când chiar mută ceva. Un pas „nu s-a
    // schimbat nimic" imediat după propoziția care spune același lucru ar fi
    // fost doar un clic în plus.
    const schimbaLinii = alegere.linie !== p;
    const schimbaColoane = alegere.coloana !== p;
    if (schimbaLinii || schimbaColoane) {
      if (schimbaLinii) {
        const t = M[p]!;
        M[p] = M[alegere.linie]!;
        M[alegere.linie] = t;
        permutariLinii++;
      }
      if (schimbaColoane) {
        for (const linie of M) {
          const t = linie[p]!;
          linie[p] = linie[alegere.coloana]!;
          linie[alegere.coloana] = t;
        }
        const t = ordineNecunoscute[p]!;
        ordineNecunoscute[p] = ordineNecunoscute[alegere.coloana]!;
        ordineNecunoscute[alegere.coloana] = t;
      }

      pasi.push({
        tip: "permutare",
        p,
        linii: [p, alegere.linie],
        ...(schimbaColoane ? { coloane: [p, alegere.coloana] as [number, number] } : {}),
        matrice: copiaza(M),
        explicatie: schimbaColoane
          ? `Se schimbă ${L(p)} cu ${L(alegere.linie)} și ${C(p)} cu ${C(alegere.coloana)}; permutarea de coloane schimbă ordinea necunoscutelor, deci se ține minte.`
          : `Se schimbă ${L(p)} cu ${L(alegere.linie)}, ca pivotul să ajungă pe diagonală.`,
        latexPas: schimbaColoane
          ? `\\htmlId{piv-permutare}{${L(p)} \\leftrightarrow ${L(alegere.linie)}}, \\qquad \\htmlId{piv-coloane}{${C(p)} \\leftrightarrow ${C(alegere.coloana)}}`
          : `\\htmlId{piv-permutare}{${L(p)} \\leftrightarrow ${L(alegere.linie)}}`,
        evidentiaza: schimbaColoane ? ["piv-permutare", "piv-coloane"] : ["piv-permutare"],
      });
    }

    const liniaPivot = M[p]!;
    const pivot = liniaPivot[p]!;

    for (let i = p + 1; i < m; i++) {
      const linie = M[i]!;
      const mu = (linie[p] ?? 0) / pivot;
      const inainte = [...linie];
      const dupa = inainte.map((v, j) => v - mu * (liniaPivot[j] ?? 0));
      // Zeroul de pe coloana pivotului e exact prin construcție — `µ` e chiar
      // numărul care îl anulează. Lăsat pe seama aritmeticii, ar ieși un rest
      // de rotunjire care s-ar scrie pe grilă ca „1,11e-16" în loc de „0".
      dupa[p] = 0;
      M[i] = dupa;

      pasi.push({
        tip: "eliminare",
        p,
        linie: i,
        pivot,
        mu,
        inainte,
        dupa: [...dupa],
        matrice: copiaza(M),
        explicatie:
          `µ = ${numar(mu)}, deci din ${L(i)} se scade ${L(p)} înmulțită cu ${numar(mu)}` +
          ` — pe coloana ${p + 1} rămâne 0.`,
        latexPas:
          `\\mu_{${i + 1}${p + 1}} = \\frac{a_{${i + 1}${p + 1}}}{a_{${p + 1}${p + 1}}}` +
          ` = \\frac{${numarLatex(inainte[p] ?? 0)}}{${numarLatex(pivot)}} = \\htmlId{piv-mu}{${numarLatex(mu)}},` +
          ` \\qquad \\htmlId{piv-linie-noua}{${L(i)} \\leftarrow ${L(i)} - \\mu_{${i + 1}${p + 1}}\\,${L(p)}}`,
        evidentiaza: ["piv-mu", "piv-linie-noua"],
      });
    }
  }

  // Fără coloană de termeni liberi nu există ce substitui — exemplul de aranjare
  // din curs e chiar o matrice goală de `b`. La fel dacă sistemul nu e pătrat.
  if (!areTermenLiber || m !== coeficienti) {
    return { pasi, U: M, ordineNecunoscute, permutariLinii, stare: "convergent" };
  }

  // Substituția înapoi, pe sistemul triunghiular. `y` e în ordinea coloanelor de
  // acum; `x` îl pune la loc în ordinea necunoscutelor din sistemul scris.
  const n = coeficienti;
  const y = new Array<number>(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    const linie = M[i]!;
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += (linie[j] ?? 0) * y[j]!;
    const diagonala = linie[i] ?? 0;
    const valoare = ((linie[n] ?? 0) - suma) / diagonala;
    y[i] = valoare;

    const necunoscuta = ordineNecunoscute[i]!;
    pasi.push({
      tip: "substitutie",
      p: i,
      pozitie: i,
      necunoscuta,
      valoare,
      sumaCunoscute: suma,
      matrice: copiaza(M),
      explicatie: `Din ${L(i)} iese x${indice(necunoscuta + 1)} = ${numar(valoare)}.`,
      latexPas:
        `x_{${necunoscuta + 1}} = \\frac{b_{${i + 1}} - \\htmlId{piv-suma}{${numarLatex(suma)}}}{a_{${i + 1}${i + 1}}}` +
        ` = \\frac{${numarLatex(linie[n] ?? 0)} - ${numarLatex(suma)}}{${numarLatex(diagonala)}}` +
        ` = \\htmlId{piv-x}{${numarLatex(valoare)}}`,
      evidentiaza: ["piv-suma", "piv-x"],
    });
  }

  const x = new Array<number>(n).fill(0);
  for (let k = 0; k < n; k++) x[ordineNecunoscute[k]!] = y[k]!;

  return { pasi, U: M, x, ordineNecunoscute, permutariLinii, stare: "convergent" };
}

/** De ce s-a oprit metoda — corect pe fiecare strategie, nu un mesaj generic. */
function motivulOpririi(strategie: Strategie, a: AlegerePivot): string {
  if (strategie === "scalata" && a.scalari?.[a.linie] === 0) {
    return `${L(a.linie)} e nulă pe toată partea de coeficienți, deci nu are factor de scalare: matricea e singulară.`;
  }
  if (strategie === "totala") {
    return `Toată submatricea rămasă e nulă de la pasul ${a.p + 1} încolo: matricea e singulară și eliminarea nu poate continua.`;
  }
  return `Pe coloana ${a.p + 1} nu mai există niciun element nenul de la ${L(a.p)} în jos: matricea e singulară și eliminarea nu poate continua.`;
}

const CIFRE_JOS = "₀₁₂₃₄₅₆₇₈₉";
/** `12` → `„₁₂"` — pentru numele necunoscutelor din proză. */
const indice = (n: number): string =>
  String(n)
    .split("")
    .map((c) => CIFRE_JOS[Number(c)] ?? c)
    .join("");

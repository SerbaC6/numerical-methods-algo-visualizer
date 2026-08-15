/**
 * Formatarea numerelor pentru afișare, în convenția românească.
 *
 * Separatorul zecimal e **virgula**, nu punctul: site-ul e în română, iar un
 * `2.0945` citit de un student român arată ca o greșeală de tastare.
 */

/** `2.0945514` la 4 zecimale → `„2,0946"`. */
export function zecimale(valoare: number, cifre = 4): string {
  if (!Number.isFinite(valoare)) {
    return Number.isNaN(valoare) ? "nedefinit" : valoare > 0 ? "+∞" : "−∞";
  }
  return valoare.toFixed(cifre).replace(".", ",");
}

/**
 * Câte zecimale trebuie ca două valori aflate la distanța `lungime` să nu se
 * scrie la fel.
 *
 * Fără ea, eticheta intervalului ajunge `[2,095 ; 2,095]` după cincisprezece
 * înjumătățiri: capetele chiar diferă, dar rotunjirea le face identice, iar
 * cititorul vede scris pe ecran că metoda s-a oprit din lucru. Numărul fix de
 * zecimale merge doar cât timp cadrul stă pe loc; de îndată ce graficul se
 * apropie, precizia afișată trebuie să-l urmeze.
 */
export function zecimaleUtile(lungime: number, minim = 3, maxim = 12): number {
  if (!Number.isFinite(lungime) || lungime <= 0) return maxim;
  return Math.max(minim, Math.min(maxim, Math.ceil(-Math.log10(lungime)) + 2));
}

/**
 * Același număr, dar pentru interiorul unei formule LaTeX.
 *
 * Virgula zecimală se scrie `{,}`, nu `,`: în modul matematic al lui TeX
 * virgula e semn de punctuație și primește spațiu după ea, deci `2,0946` s-ar
 * culege ca „2, 0946". Acoladele o transformă în simbol obișnuit.
 */
export function latexNumar(valoare: number, cifre = 6): string {
  return zecimale(valoare, cifre).replace(",", "{,}").replace("−", "-");
}

/**
 * Numere foarte mici sau foarte mari, în notație științifică — pentru coloana
 * de eroare, unde `0,0000` n-ar spune dacă mai e ceva de câștigat.
 */
export function stiintific(valoare: number, cifre = 2): string {
  if (!Number.isFinite(valoare)) return zecimale(valoare);
  if (valoare === 0) return "0";
  if (Math.abs(valoare) >= 1e-3 && Math.abs(valoare) < 1e5) {
    return zecimale(valoare, cifre + 2);
  }
  const [mantisa, exponent] = valoare.toExponential(cifre).split("e");
  const semn = exponent?.startsWith("-") ? "−" : "";
  return `${mantisa?.replace(".", ",")}·10${indiceSus(semn + (exponent?.replace(/^[+-]/, "") ?? ""))}`;
}

const CIFRE_SUS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "−": "⁻",
};

function indiceSus(text: string): string {
  return [...text].map((c) => CIFRE_SUS[c] ?? c).join("");
}

/**
 * Numărul scris ca fracție exactă, dacă are una scurtă: `0.975` → `„39/40"`.
 *
 * Există fiindcă valorile unei iterații sunt rapoarte de întregi, iar scrise cu
 * trei zecimale arată ca niște aproximări — `„−0,947"` ascunde faptul că
 * valoarea e chiar `−341/360`, exactă. Pe desen, unde nu încape o explicație,
 * diferența dintre „cam atât" și „exact atât" se vede doar din formă.
 *
 * Reconstrucția se face cu fracții continue, cu numitorul mărginit: dacă
 * numărul nu e un raport scurt de întregi (sau e rezultatul unor rotunjiri
 * succesive), se întoarce `undefined` și cine cheamă scrie zecimalele.
 */
export function fractie(valoare: number, numitorMaxim = 999): string | undefined {
  if (!Number.isFinite(valoare)) return undefined;
  if (Number.isInteger(valoare)) return String(valoare).replace("-", "−");

  const semn = valoare < 0 ? "−" : "";
  let x = Math.abs(valoare);

  // Fracții continue: numărătorul și numitorul se construiesc din câturile
  // succesive, iar recurența e chiar cea a convergentelor.
  let [n0, n1] = [1, 0];
  let [d0, d1] = [0, 1];
  for (let i = 0; i < 24; i++) {
    const cat = Math.floor(x);
    [n0, n1] = [cat * n0 + n1, n0];
    [d0, d1] = [cat * d0 + d1, d0];
    if (d0 > numitorMaxim) return undefined;
    if (d0 !== 0 && Math.abs(Math.abs(valoare) - n0 / d0) < 1e-12) {
      return d0 === 1 ? `${semn}${n0}` : `${semn}${n0}/${d0}`;
    }
    const rest = x - cat;
    if (rest < 1e-15) return undefined;
    x = 1 / rest;
  }
  return undefined;
}

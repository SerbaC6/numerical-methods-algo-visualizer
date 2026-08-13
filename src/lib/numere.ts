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

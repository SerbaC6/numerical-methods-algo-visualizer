/**
 * Exponenții și indicii scriși ca **poziție**, nu ca literă Unicode.
 *
 * **De ce există.** Notațiile de pe site — `x⁽ᵏ⁾`, `x₁`, `r⁽ᵏ⁻¹⁾`, `tₖ`, `Aᵀ` —
 * erau scrise cu caractere Unicode din blocurile Superscripts and Subscripts,
 * Phonetic Extensions și Latin Extended. Măsurat cu fontTools pe toate cele
 * patru fișiere din `public/fonts/`: din cele 38 de caractere folosite, fonturile
 * proiectului conțin **trei** — `¹`, `²`, `³`, și alea doar fiindcă sunt în
 * Latin-1. Restul, inclusiv `⁽`, `⁾`, `⁰`, `ᵏ`, `₁`, `₂`, cad pe un font de
 * sistem, ales de browser separat pentru fiecare caracter.
 *
 * De aici veneau parantezele de mărime normală lipite de un exponent mic: `⁽`
 * și `ᵏ` ajungeau din fonturi diferite, cu proporții diferite. Pe o mașină fără
 * font de rezervă potrivit ar fi ieșit direct pătrățele goale.
 *
 * Soluția nu e re-subsetarea fonturilor: `ᵏ` (U+1D4F) lipsește oricum din multe
 * familii. Aici caracterele se traduc în cifre și litere ASCII — pe care
 * fonturile chiar le au — plus informația „stă sus" sau „stă jos", pe care
 * consumatorul o pune în `<sup>`/`<sub>` (HTML) sau într-un `<tspan>` deplasat
 * (SVG).
 *
 * Textele din cod **nu se schimbă**: rămân scrise `"x⁽ᵏ⁾"`, adică lizibile în
 * editor și în diff. Traducerea se face la desenare.
 */

export type NivelNotatie = "normal" | "sus" | "jos";

/** O bucată de text omogenă: tot ce e la același nivel. */
export type BucataNotatie = { text: string; nivel: NivelNotatie };

/**
 * Caracterele care stau sus, cu echivalentul lor ASCII.
 *
 * Sunt exact cele folosite în `src/`, plus cifrele lipsă din serie: o serie
 * incompletă ar face ca `x⁽⁵⁾` să se scrie altfel decât `x⁽⁶⁾`.
 */
const SUS: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  // Minus tipografic, nu cratimă: `⁻` e U+207B, iar în ASCII îi corespunde `−`
  // (U+2212), care e în fonturi. O cratimă ar fi mai scurtă și mai sus.
  "⁻": "−",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  ⁿ: "n",
  ⁱ: "i",
  ᵏ: "k",
  ᵀ: "T",
  ˣ: "x",
};

/** Caracterele care stau jos, cu echivalentul lor ASCII. */
const JOS: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  "₊": "+",
  "₋": "−",
  "₌": "=",
  "₍": "(",
  "₎": ")",
  ₐ: "a",
  ₑ: "e",
  ₕ: "h",
  ᵢ: "i",
  ⱼ: "j",
  ₖ: "k",
  ₗ: "l",
  ₘ: "m",
  ₙ: "n",
  ₒ: "o",
  ₚ: "p",
  ᵣ: "r",
  ₛ: "s",
  ₜ: "t",
  ᵤ: "u",
  ᵥ: "v",
  ₓ: "x",
};

/** Nivelul unui caracter, plus forma lui ASCII. */
function traduce(ch: string): { text: string; nivel: NivelNotatie } {
  const sus = SUS[ch];
  if (sus !== undefined) return { text: sus, nivel: "sus" };
  const jos = JOS[ch];
  if (jos !== undefined) return { text: jos, nivel: "jos" };
  return { text: ch, nivel: "normal" };
}

/**
 * Taie un text în bucăți omogene ca nivel.
 *
 * `"x⁽ᵏ⁾ − x*"` → `[{"x","normal"}, {"(k)","sus"}, {" − x*","normal"}]`.
 * Caracterele vecine de același nivel se lipesc, ca să nu iasă un `<tspan>` per
 * literă.
 */
export function bucatiNotatie(text: string): BucataNotatie[] {
  const bucati: BucataNotatie[] = [];

  for (const ch of text) {
    const { text: litera, nivel } = traduce(ch);
    const ultima = bucati[bucati.length - 1];
    if (ultima && ultima.nivel === nivel) ultima.text += litera;
    else bucati.push({ text: litera, nivel });
  }

  return bucati;
}

/** Are textul măcar un exponent sau un indice? Scutește consumatorul de muncă. */
export function areNotatie(text: string): boolean {
  for (const ch of text) {
    if (SUS[ch] !== undefined || JOS[ch] !== undefined) return true;
  }
  return false;
}

/**
 * Cât de mic e scrisul ridicat sau coborât, față de corpul din jur.
 *
 * **Două valori, fiindcă sunt două situații.** Într-un paragraf, exponentul e un
 * amănunt: `x⁽ᵏ⁾` se citește ca un cuvânt, iar dacă `(k)` se apropie de corpul
 * literei începe să rupă rândul în bucăți. Acolo 0,62.
 *
 * Pe desen, aceleași litere stau singure, mici, peste un mesh și peste curbe de
 * nivel. Un exponent la 0,62 dintr-un corp de 19 px ar ajunge la 12 px pe un
 * fundal aglomerat. Acolo rămâne 0,72.
 *
 * Deplasarea pe verticală e comună: exponentul urcă aproximativ o treime din
 * corp, indicele coboară puțin mai puțin (are sub el doar linia de bază, nu și
 * accentele).
 */
export const PROPORTIE_MICA_TEXT = 0.62;
export const PROPORTIE_MICA_DESEN = 0.72;

/**
 * Cât de gros e conturul de sub o etichetă scrisă peste desen.
 *
 * **Proporțional cu litera, nu fix.** Conturul e un halou: se desenează sub
 * glif (`paintOrder="stroke"`) ca numele să se citească și peste mesh, și peste
 * curbele de nivel. Cu o valoare fixă de 5 px sub o literă de 17–19 px, jumătate
 * din grosime iese în afara conturului literei și o îngroașă — arăta ca text
 * aldin, deși `font-weight` e 400. La 0,16 din corp rămâne halou, nu îngroșare.
 */
export const HALOU_ETICHETA = 0.16;
export const RIDICARE_SUS = 0.36;
export const COBORARE_JOS = 0.2;

/**
 * Unde se rupe o formulă afișată, când nu încape pe un rând.
 *
 * KaTeX taie matematica afișată în bucăți (`.katex-base`) și lasă o ocazie de
 * rupere după fiecare relație (`=`, `⟺`, `≤`) și după fiecare operator binar —
 * regula lui TeX. Peste ele, `src/index.css` face din `.katex-html` un flex care
 * se înfășoară, deci bucățile se așază pe rânduri.
 *
 * Ce iese urât din combinația asta: ruperea de linie e **lacomă** — ia mereu
 * ultima ocazie care încape. Într-o formulă cu două enunțuri,
 * `Null(A) = Null(Aᵀ A), \qquad Rank(A) = Rank(Aᵀ A)`, ultima ocazie care încape
 * e cea de după al doilea `=`, deci rândul se termină cu semnul de egal atârnat
 * și termenul lui rămâne singur dedesubt. Măsurat pe cele 18 pagini, la 390px:
 * **139** de rânduri se terminau în relație.
 *
 * Se repară în doi timpi, fiindcă un singur mecanism nu ajunge:
 *
 * 1. `permiteRupereIntreEnunturi` — adaugă ocazia de rupere **între enunțuri**.
 *    Ea nu există singură: spațiul de `\qquad` cade în interiorul unei bucăți,
 *    nu între două, deci fără pasul ăsta n-are unde să se rupă frumos.
 * 2. `lipesteRelatiaDeTermen` — **scoate** ocazia de după o relație, dar numai
 *    când relația și termenul care o urmează încap împreună pe un rând.
 *
 * Condiția din al doilea pas e tot ce ține în picioare câștigul de dinainte:
 * ruperea după `=` e uneori singurul lucru care salvează o formulă lungă de la
 * derulare. Lipită necondiționat, `x = ` cu o fracție uriașă după el ar redeveni
 * o formulă care iese din coloană. De aceea lipirea se face **după măsurătoare**,
 * în browser, nu din LaTeX.
 */

/** Spațiile cu care se despart două enunțuri în aceeași formulă. */
const SEPARATOARE_DE_ENUNT = new Set(["\\quad", "\\qquad"]);

/**
 * Adaugă o ocazie de rupere după fiecare separator de enunțuri de la nivelul de
 * sus al formulei.
 *
 * `\allowbreak` e exact ce cere KaTeX: bucățile se taie după orice element cu
 * clasa `allowbreak`, la fel ca după o relație. Iar fiind un simplu simbol, nu
 * poate strica formula — spre deosebire de varianta cu acolade în jurul fiecărui
 * enunț, care ar rupe un `\left( … \quad … \right)` în două.
 *
 * Se sare peste ce e între acolade, din două motive: un `\quad` din interiorul
 * lui `\text{…}` nu desparte enunțuri, iar `\allowbreak` nu există în modul text
 * (`defineSymbol(math, …)` în KaTeX) — pus acolo, ar arunca „Undefined control
 * sequence" și formula n-ar mai apărea deloc.
 */
export function permiteRupereIntreEnunturi(latex: string): string {
  let rezultat = "";
  let adancime = 0;
  let i = 0;

  while (i < latex.length) {
    const semn = latex[i] as string;

    // O comandă („\qquad") sau un semn scăpat („\{", „\\") se ia întreagă:
    // altfel acoladele scăpate ar fi numărate ca adâncime.
    if (semn === "\\") {
      const comanda = /^\\([a-zA-Z]+|.)/.exec(latex.slice(i))?.[0] ?? semn;
      rezultat += comanda;
      i += comanda.length;
      if (adancime === 0 && SEPARATOARE_DE_ENUNT.has(comanda)) rezultat += "\\allowbreak";
      continue;
    }

    if (semn === "{") adancime++;
    else if (semn === "}") adancime = Math.max(adancime - 1, 0);

    rezultat += semn;
    i++;
  }

  return rezultat;
}

/**
 * Clasele cu care KaTeX marchează spații și ajutoare de așezare. Nu spun nimic
 * despre cu ce se termină o bucată, deci se sar când o citim de la sfârșit.
 */
const CLASE_FARA_CONTINUT = ["mspace", "katex-strut", "vlist-s", "vlist-t"];

/** Se termină bucata cu o relație — adică ar lăsa un `=` atârnat la capăt de rând? */
function terminaCuRelatie(bucata: Element): boolean {
  const copii = [...bucata.children];
  for (let i = copii.length - 1; i >= 0; i--) {
    const copil = copii[i] as Element;
    if (CLASE_FARA_CONTINUT.some((clasa) => copil.classList.contains(clasa))) continue;
    return copil.classList.contains("mrel");
  }
  return false;
}

/** Desface lipiturile de la trecerea dinainte, ca măsurătoarea să pornească curat. */
function desfaLipiturile(rand: Element): void {
  for (const inveli of rand.querySelectorAll("[data-lipit]")) {
    inveli.replaceWith(...inveli.childNodes);
  }
}

/**
 * Lipește fiecare relație de termenul ei, cât încap împreună pe un rând.
 *
 * Rezultatul: `x = y` se mută întreg pe rândul următor, în loc să se rupă între
 * `x =` și `y`. Când perechea nu încape oricum pe un rând, ruperea rămâne unde
 * era — acolo nu există variantă mai bună, iar alternativa ar fi derularea.
 *
 * Lucrează pe `.katex-html`, care e `aria-hidden` (partea citită de cititorul de
 * ecran e MathML-ul de lângă), deci învelișurile adăugate aici nu se văd în
 * arborele de accesibilitate.
 */
export function lipesteRelatiaDeTermen(radacina: HTMLElement): void {
  const zona = radacina.querySelector(".katex-display");
  const rand = zona?.querySelector(".katex-html");
  if (!zona || !rand) return;

  desfaLipiturile(rand);

  const limita = zona.clientWidth;
  if (limita === 0) return; // formula nu e încă așezată (ascunsă, sau înainte de primul cadru)

  // Întâi toate măsurătorile, apoi toate scrierile: citit și scris alternativ în
  // DOM ar forța o reașezare la fiecare pas.
  const bucati = [...rand.children];
  const latimi = new Map(bucati.map((b) => [b, b.getBoundingClientRect().width]));
  const lat = (grup: Element[]) => grup.reduce((s, b) => s + (latimi.get(b) ?? 0), 0);

  const grupuri: Element[][] = [];
  for (const bucata of bucati) {
    const ultim = grupuri.at(-1);
    const seLipeste =
      ultim !== undefined &&
      terminaCuRelatie(ultim.at(-1) as Element) &&
      lat(ultim) + (latimi.get(bucata) ?? 0) <= limita;

    if (seLipeste) ultim.push(bucata);
    else grupuri.push([bucata]);
  }

  for (const grup of grupuri) {
    if (grup.length < 2) continue;
    const inveli = document.createElement("span");
    inveli.dataset.lipit = "";
    (grup[0] as Element).before(inveli);
    inveli.append(...grup);
  }
}

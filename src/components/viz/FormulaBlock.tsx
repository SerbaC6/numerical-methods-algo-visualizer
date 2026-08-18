import { useEffect, useRef, useState } from "react";

import { lipesteRelatiaDeTermen, permiteRupereIntreEnunturi } from "@/lib/rupere-formule";
import { cn } from "@/lib/utils";

export type FormulaBlockProps = {
  /** Formula în LaTeX. Se scrie EXACT cum e în cursul din `cursuri_MN/`. */
  latex: string;
  /** Formulă pe rând propriu (implicit) sau în interiorul unei propoziții. */
  inline?: boolean;
  /** Eticheta de deasupra — de obicei de unde vine formula (ex. „Curs 4, §6"). */
  eticheta?: string;
  /**
   * Id-uri `\htmlId{...}{...}` din formulă care trebuie evidențiate acum.
   * Ăsta e mecanismul prin care legăm formula de animație: același `l21`
   * se aprinde și în matrice, și în formulă.
   */
  evidentiaza?: string[];
  /**
   * Micșorează formula cât să încapă în casetă, în loc s-o lase să deruleze.
   *
   * Se pune **doar** pe formulele care n-au unde să se rupă — un tabel
   * `array`, o matrice —, fiindcă acolo ruperea pe rânduri (vezi `index.css`)
   * nu are ce tăia, iar singurul lucru rămas înaintea derulării e corpul mai
   * mic. Ordinea din regulile de mobil e: întâi rupere, apoi corp mai mic,
   * abia la urmă derulare.
   */
  incapeInCaseta?: boolean;
  className?: string;
};

/**
 * Sub ce mărime nu se coboară, oricât ar lipsi din lățime.
 *
 * Pragul e pe **corpul randat** (`.katex`), nu pe factorul de micșorare: un
 * factor n-ar însemna nimic singur, fiindcă pornește de la `--text-formula`,
 * care e el însuși fluid. Măsurat pe pagina metodelor iterative, la 360px:
 * tabelul cere 459px într-o casetă de 252px, deci ajunge la 10,6px — iar
 * rândurile lui, scrise cu `\large`, se văd la 12,7px.
 *
 * Ce n-ar încăpea nici așa e o formulă de rescris, nu de strâns mai departe:
 * rămâne la 10px și derulează, ca înainte.
 */
const MARIME_MINIMA = 10;

/**
 * Afișează o formulă cu KaTeX.
 *
 * KaTeX (JS + CSS + fonturi) se încarcă la cerere, nu în bundle-ul inițial —
 * pagina de cuprins nu are formule și n-are de ce să-l plătească. Fonturile
 * vin din pachet, deci tot fără cereri către domenii externe.
 */
export function FormulaBlock({
  latex,
  inline = false,
  eticheta,
  evidentiaza,
  incapeInCaseta = false,
  className,
}: FormulaBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const container = useRef<HTMLElement>(null);

  useEffect(() => {
    let anulat = false;

    void (async () => {
      try {
        const [katex] = await Promise.all([
          import("katex").then((m) => m.default),
          import("katex/dist/katex.min.css"),
        ]);
        if (anulat) return;

        // Ocaziile de rupere între enunțuri se adaugă doar la formulele afișate:
        // una inline curge în propoziție și se rupe după regulile textului.
        const sursa = inline ? latex : permiteRupereIntreEnunturi(latex);

        const randeaza = (tex: string) =>
          katex.renderToString(tex, {
            displayMode: !inline,
            throwOnError: true,
            // `\htmlId` e chiar mecanismul cu care legăm formula de animație,
            // deci avertismentul „HTML extension is disabled on strict mode" e
            // așteptat și doar umple consola — KaTeX aplică id-ul oricum. Îl
            // tăcem punctual; orice altă abatere de la LaTeX rămâne semnalată,
            // ca o formulă greșit transcrisă din curs să nu treacă neobservată.
            strict: (cod: string) => (cod === "htmlExtension" ? "ignore" : "warn"),
            // permitem doar marcarea părților din formulă, nu HTML arbitrar
            trust: (ctx) => ctx.command === "\\htmlId" || ctx.command === "\\htmlClass",
          });

        // Dacă ocaziile de rupere adăugate ar strica formula, se randează cea
        // scrisă de noi: o formulă lipsă e mult mai rău decât una care derulează.
        // În dezvoltare se aude, ca `permiteRupereIntreEnunturi` să nu rateze
        // tăcut un caz de LaTeX la care nu ne-am gândit.
        let randat: string;
        try {
          randat = randeaza(sursa);
        } catch (e) {
          if (sursa === latex) throw e;
          if (import.meta.env.DEV) {
            console.warn("Ruperea între enunțuri a stricat formula; se randează originalul.", {
              latex,
              sursa,
              e,
            });
          }
          randat = randeaza(latex);
        }

        setHtml(randat);
        setEroare(null);
      } catch (e) {
        if (!anulat) setEroare(e instanceof Error ? e.message : "Formulă invalidă");
      }
    })();

    return () => {
      anulat = true;
    };
  }, [latex, inline]);

  /**
   * Lipirea relației de termenul ei se face pe HTML-ul deja așezat, fiindcă are
   * nevoie de lățimi reale — vezi `src/lib/rupere-formule.ts`.
   *
   * Se reia la trei momente, toate necesare: după randare, când se schimbă
   * lățimea casetei (rotirea telefonului, deschiderea unui panou) și după ce
   * fonturile KaTeX au ajuns — până atunci măsurăm fontul de rezervă, deci alte
   * lățimi. `ResizeObserver` ține minte lățimea de dinainte: lipirea schimbă
   * **înălțimea** formulei, deci s-ar auto-declanșa la infinit.
   */
  useEffect(() => {
    const radacina = container.current;
    if (!radacina || html === null || inline) return;

    let cadru = 0;
    let latimeVazuta = -1;
    const ruleaza = () => {
      cancelAnimationFrame(cadru);
      cadru = requestAnimationFrame(() => lipesteRelatiaDeTermen(radacina));
    };

    ruleaza();
    void document.fonts?.ready.then(ruleaza);

    const observator = new ResizeObserver(([intrare]) => {
      const latime = intrare?.contentRect.width ?? 0;
      if (latime === latimeVazuta) return;
      latimeVazuta = latime;
      ruleaza();
    });
    observator.observe(radacina);

    return () => {
      cancelAnimationFrame(cadru);
      observator.disconnect();
    };
  }, [html, inline]);

  /**
   * Micșorarea până încape, pentru formulele care n-au unde să se rupă.
   *
   * Mărimea se pune pe `.katex-display` (în `em`, deci se înmulțește cu
   * `--text-formula`), nu pe `.katex`: foaia nelayerată a KaTeX îi impune
   * acolo `font-size: 1.21em` și bate orice regulă de-a noastră — aceeași
   * capcană descrisă în `index.css`.
   *
   * Se măsoară de fiecare dată **de la mărimea nemicșorată**; altfel al doilea
   * apel ar împărți la o lățime deja strânsă și formula s-ar micșora la
   * infinit. Un al doilea pas de ajustare e necesar fiindcă lățimea nu scade
   * chiar liniar cu corpul (rotunjiri de glife): din prima încercare rămâneau
   * 2px de derulare, măsurat.
   */
  useEffect(() => {
    const radacina = container.current;
    if (!radacina || html === null || inline || !incapeInCaseta) return;

    let cadru = 0;
    let latimeVazuta = -1;

    const potriveste = () => {
      const zona = radacina.querySelector<HTMLElement>(".katex-display");
      if (!zona) return;

      zona.style.fontSize = "";
      const disponibil = zona.clientWidth;
      const necesar = zona.scrollWidth;
      if (disponibil === 0 || necesar <= disponibil) return;

      const corp = zona.querySelector(".katex");
      if (!corp) return;
      const marime = parseFloat(getComputedStyle(corp).fontSize);
      const factorMinim = Math.min(1, MARIME_MINIMA / marime);

      let factor = Math.max((disponibil - 1) / necesar, factorMinim);
      zona.style.fontSize = `${factor}em`;

      for (let pas = 0; pas < 4; pas++) {
        if (zona.scrollWidth <= zona.clientWidth || factor <= factorMinim) break;
        factor = Math.max((factor * (zona.clientWidth - 1)) / zona.scrollWidth, factorMinim);
        zona.style.fontSize = `${factor}em`;
      }
    };

    const ruleaza = () => {
      cancelAnimationFrame(cadru);
      cadru = requestAnimationFrame(potriveste);
    };

    ruleaza();
    // Până sosesc fonturile KaTeX măsurăm fontul de rezervă, adică alte lățimi.
    void document.fonts?.ready.then(ruleaza);

    const observator = new ResizeObserver(([intrare]) => {
      const latime = intrare?.contentRect.width ?? 0;
      if (latime === latimeVazuta) return;
      latimeVazuta = latime;
      ruleaza();
    });
    observator.observe(radacina);

    return () => {
      cancelAnimationFrame(cadru);
      observator.disconnect();
    };
  }, [html, inline, incapeInCaseta]);

  // Evidențierea se aplică peste HTML-ul deja randat, ca să nu re-compilăm
  // formula la fiecare pas al animației.
  useEffect(() => {
    const radacina = container.current;
    if (!radacina) return;
    radacina.querySelectorAll("[data-evid]").forEach((el) => el.removeAttribute("data-evid"));
    for (const id of evidentiaza ?? []) {
      radacina.querySelector(`#${CSS.escape(id)}`)?.setAttribute("data-evid", "true");
    }
  }, [evidentiaza, html]);

  if (eroare) {
    return (
      <p className={cn("text-eroare font-mono text-sm", className)} role="alert">
        Formulă invalidă: {eroare}
      </p>
    );
  }

  const Tag = inline ? "span" : "div";

  return (
    <Tag
      className={cn(
        inline
          ? "inline-block align-baseline"
          : "bg-suprafata/60 border-bordura scroll-tabel rounded-lg border px-4 py-3",
        className,
      )}
    >
      {/* `text-sm`, nu `text-xs`: eticheta spune din ce secțiune de curs vine
          formula, adică e chiar lucrul care o face verificabilă. La 12px se
          citea cu greu. */}
      {eticheta && !inline && (
        <p className="text-text-slab mb-2 text-sm font-semibold tracking-wide uppercase">
          {eticheta}
        </p>
      )}
      {html === null ? (
        <span className="text-text-slab font-mono text-sm">{latex}</span>
      ) : inline ? (
        // Inline, învelișul e tot un `<span>`: o formulă din mijlocul unei
        // propoziții ajunge în interiorul unui `<p>`, iar un `<div>` acolo îl
        // închide pe loc și rupe paragraful în două.
        <span
          ref={container as React.RefObject<HTMLSpanElement>}
          className="formula"
          // conținutul e generat de KaTeX din LaTeX scris de noi, nu de utilizator
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div
          ref={container as React.RefObject<HTMLDivElement>}
          className="formula"
          // conținutul e generat de KaTeX din LaTeX scris de noi, nu de utilizator
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </Tag>
  );
}

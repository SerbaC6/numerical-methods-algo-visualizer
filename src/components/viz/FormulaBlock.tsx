import { useEffect, useRef, useState } from "react";

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
  className?: string;
};

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
  className,
}: FormulaBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [eroare, setEroare] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anulat = false;

    void (async () => {
      try {
        const [katex] = await Promise.all([
          import("katex").then((m) => m.default),
          import("katex/dist/katex.min.css"),
        ]);
        if (anulat) return;
        setHtml(
          katex.renderToString(latex, {
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
          }),
        );
        setEroare(null);
      } catch (e) {
        if (!anulat) setEroare(e instanceof Error ? e.message : "Formulă invalidă");
      }
    })();

    return () => {
      anulat = true;
    };
  }, [latex, inline]);

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
      ) : (
        <div
          ref={container}
          className="formula"
          // conținutul e generat de KaTeX din LaTeX scris de noi, nu de utilizator
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </Tag>
  );
}

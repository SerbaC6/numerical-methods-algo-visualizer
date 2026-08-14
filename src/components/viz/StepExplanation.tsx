import { cn } from "@/lib/utils";

export type StepExplanationProps = {
  /**
   * Propoziția care descrie pasul curent. E `ReactNode`, nu `string`, fiindcă
   * explicația conține adesea notație („acum se calculează `l₂₁`") și trebuie
   * să poată primi formula inline — asta e paralela formulă ↔ animație cerută
   * de `Plan.md`.
   */
  explicatie?: React.ReactNode;
  /** Pasul curent, 0-indexat — aceeași convenție ca `PlaybackBar`. */
  pas: number;
  /** Numărul total de pași; 0 înseamnă că încă n-a rulat nimic. */
  totalPasi: number;
  /**
   * Dacă derularea automată e pornită. Nu schimbă nimic vizual: taie doar
   * anunțurile către cititorul de ecran, care la 4× ar deveni zgomot.
   */
  ruleaza?: boolean;
  titlu?: string;
  /** Ce scrie cât timp nu există niciun pas de arătat. */
  textGol?: string;
  className?: string;
};

/**
 * Propoziția de lângă desen: ce se întâmplă chiar acum, la pasul curent.
 *
 * E piesa care leagă animația de text — fără ea, studentul vede o matrice care
 * se colorează și nu știe de ce. Ideea vine de la visualgo (panoul de stare
 * sincronizat cu animația), dar la noi textul nu descrie cod, ci formula.
 *
 * Nu conține matematică și nu umblă în `steps[]`: pagina îi dă propoziția deja
 * aleasă, exact ca restul componentelor din `viz/`.
 */
export function StepExplanation({
  explicatie,
  pas,
  totalPasi,
  ruleaza = false,
  titlu = "Explicația pasului",
  textGol = "Pornește derularea ca să vezi explicația fiecărui pas.",
  className,
}: StepExplanationProps) {
  const gol = totalPasi === 0 || explicatie === undefined;

  return (
    <section
      aria-label={titlu}
      className={cn(
        "bg-suprafata border-bordura shadow-jos rounded-xl border p-5 sm:p-6",
        // Bandă de accent în stânga: leagă vizual propoziția de iterația
        // curentă din desen, care poartă aceeași culoare.
        "border-l-viz-curent border-l-4",
        className,
      )}
    >
      {/* Fără titlu vizibil: propoziția spune oricum ce se întâmplă, iar un
          antet peste ea doar repeta cu majuscule ceva ce se citea deja. `titlu`
          rămâne numele secțiunii pentru cititorul de ecran, care are nevoie de
          unul. */}
      {!gol && (
        <div className="flex justify-end">
          <span className="text-text-slab shrink-0 font-mono text-sm tabular-nums">
            pasul {pas + 1} din {totalPasi}
          </span>
        </div>
      )}

      {/*
        Regiunea live e `<p>`-ul, care rămâne montat tot timpul — dacă i-am da
        `key` lui, cititorul de ecran ar vedea o înlocuire de element, nu o
        schimbare de conținut, și unele n-ar mai anunța nimic. Se schimbă doar
        `<span>`-ul dinăuntru, iar `key`-ul lui îl face să reapară cu un fade la
        fiecare pas.

        `aria-live` e activ doar când utilizatorul pășește manual: în derulare
        automată la 4× anunțurile s-ar suprapune și ar face pagina inutilizabilă.
        `aria-atomic` cere citirea propoziției întregi, nu doar a bucății noi.
      */}
      <p
        aria-live={ruleaza ? "off" : "polite"}
        aria-atomic="true"
        className={cn("text-lg text-pretty", gol ? "text-text-slab italic" : "text-text")}
      >
        <span key={gol ? "gol" : pas} className="motion-safe:animate-in motion-safe:fade-in-0">
          {gol ? textGol : explicatie}
        </span>
      </p>
    </section>
  );
}

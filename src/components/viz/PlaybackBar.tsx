import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VITEZE, type Viteza } from "@/lib/playback";
import { cn } from "@/lib/utils";

export type PlaybackBarProps = {
  /** Pasul curent, 0-indexat. */
  pas: number;
  /** Numărul total de pași; bara e dezactivată dacă e 0. */
  totalPasi: number;
  ruleaza: boolean;
  viteza: Viteza;
  onPas: (pas: number) => void;
  onRuleazaChange: (ruleaza: boolean) => void;
  onVitezaChange: (viteza: Viteza) => void;
  /**
   * Scoate redarea automată: rămân doar pașii duși cu mâna.
   *
   * Nu e o economie de spațiu. Pe unele metode, derularea singură **încurcă**:
   * tangenta face zece salturi, iar dacă ele vin unul după altul, ochiul le
   * pierde pe toate în loc să prindă unul. Acolo pasul manual e chiar unealta
   * potrivită, iar butonul de redare doar te ispitește să te uiți la un film.
   *
   * Când redarea lipsește, dispar și vitezele: fără ce să grăbească, ar fi
   * patru butoane care nu fac nimic.
   */
  faraRedare?: boolean;
  className?: string;
};

/**
 * Comenzile de derulare a unei animații pas cu pas: play/pauză, un pas
 * înainte/înapoi, reset, viteză, plus o bară de poziție cu care sari direct
 * la o iterație. Tot ce se poate face cu mouse-ul se poate face și de la
 * tastatură (sliderul Radix ascultă săgețile).
 *
 * Cu `faraRedare`, play-ul și vitezele dispar și rămâne doar mersul cu mâna.
 */
export function PlaybackBar({
  pas,
  totalPasi,
  ruleaza,
  viteza,
  onPas,
  onRuleazaChange,
  onVitezaChange,
  faraRedare = false,
  className,
}: PlaybackBarProps) {
  const ultimul = Math.max(totalPasi - 1, 0);
  const gol = totalPasi === 0;
  /**
   * Cu un singur pas nu e nimic de derulat, deci redarea se stinge.
   *
   * Nu e un caz teoretic: o metodă poate să nimerească soluția din primul pas
   * (coborârea pe gradient, când direcția cea mai abruptă arată chiar spre
   * fundul văii). Un buton de redare activ care nu face nimic se citește ca
   * defect, nu ca rezultat.
   */
  const unSingurPas = totalPasi === 1;

  return (
    <div
      role="group"
      aria-label="Derulare"
      className={cn(
        // `p-2` pe telefon, nu `p-3`: cei 8px câștigați din ramă intră direct în
        // rândul de butoane, care e piesa care nu se poate strânge (vezi mai jos).
        "bg-suprafata border-bordura shadow-jos rounded-xl border p-2 sm:p-4",
        // Aceeași așezare ca la `PlaybackClip`, din același motiv: pe un rând,
        // bara cere 532px (patru butoane de pas, sliderul și vitezele), deci pe
        // telefon `flex-wrap` o rupea în rânduri nimerite. Sub `sm` se scrie
        // explicit ce stă unde; peste `sm` revine rândul unic.
        "flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3 sm:order-2 sm:flex-1">
        <Slider
          aria-label="Poziția în animație"
          min={0}
          max={ultimul}
          step={1}
          value={[Math.min(pas, ultimul)]}
          disabled={gol}
          onValueChange={([v]) => {
            onRuleazaChange(false);
            onPas(v ?? 0);
          }}
        />
        <span
          className="text-text-slab shrink-0 font-mono text-sm tabular-nums sm:text-base"
          aria-live="polite"
        >
          {gol ? "—" : `${pas + 1}/${totalPasi}`}
        </span>
      </div>

      {/* Al doilea rând pe telefon. Peste `sm`, învelișul dispare din așezare
          (`contents`) — de aceea n-are `role`: un `role` pe `display: contents`
          poate cădea din arborele de accesibilitate.

          Distanța dintre cele două grupuri e `gap-1` pe telefon, cât cea dintre
          butoanele dinăuntru: cu `justify-between`, ce prisosește se împarte
          oricum între ele, deci valoarea de aici e doar podeaua de la care se
          rupe rândul. Cei 4px scoși de aici sunt jumătate din ce lipsea. */}
      <div className="flex flex-wrap items-center justify-between gap-1 sm:contents">
        <div className="flex items-center gap-1 sm:order-1">
          <Button
            variant="ghost"
            size="icon"
            className="tinta-atingere"
            aria-label="Reia de la început"
            disabled={gol}
            onClick={() => {
              onRuleazaChange(false);
              onPas(0);
            }}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="tinta-atingere"
            aria-label="Pasul anterior"
            disabled={gol || pas === 0}
            onClick={() => {
              onRuleazaChange(false);
              onPas(Math.max(pas - 1, 0));
            }}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          {!faraRedare && (
            <Button
              size="icon"
              className="tinta-atingere"
              aria-label={ruleaza ? "Pauză" : "Pornește"}
              aria-pressed={ruleaza}
              disabled={gol || unSingurPas}
              onClick={() => onRuleazaChange(!ruleaza)}
            >
              {ruleaza ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="tinta-atingere"
            aria-label="Pasul următor"
            disabled={gol || pas >= ultimul}
            onClick={() => {
              onRuleazaChange(false);
              onPas(Math.min(pas + 1, ultimul));
            }}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>

        <div
          className={cn("flex items-center gap-1 sm:order-3", faraRedare && "hidden")}
          role="group"
          aria-label="Viteză"
        >
          {VITEZE.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={v === viteza ? "default" : "ghost"}
              // `px-1.5` pe telefon, ca la `PlaybackClip`: „0,5×" e singurul
              // buton mai lat decât podeaua de 44px (are patru semne), deci
              // fiecare pixel de padding de aici lățește rândul întreg.
              className="tinta-atingere px-1.5 font-mono sm:px-3"
              aria-pressed={v === viteza}
              onClick={() => onVitezaChange(v)}
            >
              {v}×
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  className?: string;
};

/**
 * Comenzile de derulare a unei animații pas cu pas: play/pauză, un pas
 * înainte/înapoi, reset, viteză, plus o bară de poziție cu care sari direct
 * la o iterație. Tot ce se poate face cu mouse-ul se poate face și de la
 * tastatură (sliderul Radix ascultă săgețile).
 */
export function PlaybackBar({
  pas,
  totalPasi,
  ruleaza,
  viteza,
  onPas,
  onRuleazaChange,
  onVitezaChange,
  className,
}: PlaybackBarProps) {
  const ultimul = Math.max(totalPasi - 1, 0);
  const gol = totalPasi === 0;

  return (
    <div
      role="group"
      aria-label="Derulare"
      className={cn(
        "bg-suprafata border-bordura shadow-jos flex flex-wrap items-center gap-3 rounded-xl border p-3",
        className,
      )}
    >
      <div className="flex items-center gap-1">
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
        <Button
          size="icon"
          className="tinta-atingere"
          aria-label={ruleaza ? "Pauză" : "Pornește"}
          aria-pressed={ruleaza}
          disabled={gol}
          onClick={() => onRuleazaChange(!ruleaza)}
        >
          {ruleaza ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
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

      <div className="flex min-w-40 flex-1 items-center gap-3">
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
        <span className="text-text-slab shrink-0 font-mono text-sm" aria-live="polite">
          {gol ? "—" : `${pas + 1}/${totalPasi}`}
        </span>
      </div>

      <div className="flex items-center gap-1" role="group" aria-label="Viteză">
        {VITEZE.map((v) => (
          <Button
            key={v}
            size="sm"
            variant={v === viteza ? "default" : "ghost"}
            className="tinta-atingere font-mono"
            aria-pressed={v === viteza}
            onClick={() => onVitezaChange(v)}
          >
            {v}×
          </Button>
        ))}
      </div>
    </div>
  );
}

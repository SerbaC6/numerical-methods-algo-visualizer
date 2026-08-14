import { Maximize, Minimize, Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VITEZE, type Viteza } from "@/lib/playback";
import { cn } from "@/lib/utils";

export type PlaybackClipProps = {
  /** Secunda curentă din clip. */
  timp: number;
  /** Durata totală, în secunde. */
  total: number;
  ruleaza: boolean;
  viteza: Viteza;
  onTimp: (secunda: number) => void;
  onRuleazaChange: (ruleaza: boolean) => void;
  onVitezaChange: (viteza: Viteza) => void;
  /** Clipul e pe tot ecranul acum? Butonul apare doar dacă vine și `onPlinEcran`. */
  plinEcran?: boolean;
  onPlinEcran?: () => void;
  className?: string;
};

/** Cât sare căutarea cu săgețile de la tastatură, în secunde. */
const PAS_CAUTARE = 0.25;

/**
 * Comenzile unui clip animat: redare, reluare de la început, căutare pe timp și
 * viteză.
 *
 * **De ce nu e `PlaybackBar`.** Aceea derulează pași — iterația 3 din 12 —
 * și pe ea sliderul se mișcă din unu în unu. Un clip n-are pași: are un ceas
 * continuu, iar poziția se scrie în secunde. Ce e comun (butoanele, vitezele,
 * ținta de atingere) vine oricum din aceleași piese, deci dublarea e doar în
 * unitatea de măsură, unde chiar diferă.
 */
export function PlaybackClip({
  timp,
  total,
  ruleaza,
  viteza,
  onTimp,
  onRuleazaChange,
  onVitezaChange,
  plinEcran = false,
  onPlinEcran,
  className,
}: PlaybackClipProps) {
  const pozitie = Math.min(Math.max(timp, 0), total);

  return (
    <div
      role="group"
      aria-label="Comenzile animației"
      className={cn(
        "bg-suprafata border-bordura shadow-jos flex flex-wrap items-center gap-4 rounded-xl border p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="tinta-atingere"
          aria-label="Reia de la început"
          onClick={() => {
            onRuleazaChange(false);
            onTimp(0);
          }}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          className="tinta-atingere"
          aria-label={ruleaza ? "Pauză" : "Pornește"}
          aria-pressed={ruleaza}
          onClick={() => onRuleazaChange(!ruleaza)}
        >
          {ruleaza ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
      </div>

      <div className="flex min-w-40 flex-1 items-center gap-3">
        <Slider
          aria-label="Poziția în animație, în secunde"
          min={0}
          max={total}
          step={PAS_CAUTARE}
          value={[pozitie]}
          onValueChange={([v]) => {
            onRuleazaChange(false);
            onTimp(v ?? 0);
          }}
        />
        <span className="text-text-slab shrink-0 font-mono text-base tabular-nums">
          {secunde(pozitie)}/{secunde(total)}
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

      {onPlinEcran && (
        <Button
          variant="ghost"
          size="icon"
          className="tinta-atingere"
          aria-label={plinEcran ? "Ieși din ecranul complet" : "Pe tot ecranul"}
          aria-pressed={plinEcran}
          onClick={onPlinEcran}
        >
          {plinEcran ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
        </Button>
      )}
    </div>
  );
}

/** `12.4` → `0:12`. */
function secunde(t: number): string {
  const intreg = Math.floor(t);
  return `${Math.floor(intreg / 60)}:${String(intreg % 60).padStart(2, "0")}`;
}

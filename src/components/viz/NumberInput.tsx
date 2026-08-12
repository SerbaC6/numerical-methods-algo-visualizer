import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type NumberInputProps = {
  /** Eticheta vizibilă — obligatorie, nu folosim placeholder pe post de etichetă. */
  eticheta: string;
  valoare: number | "";
  onChange: (valoare: number | "") => void;
  min?: number;
  max?: number;
  pas?: number;
  /** Unitate sau simbol afișat în dreapta (ex. „iterații", „ε"). */
  unitate?: string;
  /** Explicație scurtă sub câmp, când e valid. */
  ajutor?: string;
  /** Mesaj de eroare; prezența lui pune câmpul în stare invalidă. */
  eroare?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Câmp numeric cu etichetă, validare și mesaj de eroare.
 * Eroarea e legată de input prin `aria-describedby`, ca să o citească
 * și cititoarele de ecran, nu doar ochiul.
 */
export function NumberInput({
  eticheta,
  valoare,
  onChange,
  min,
  max,
  pas,
  unitate,
  ajutor,
  eroare,
  disabled,
  className,
}: NumberInputProps) {
  const id = useId();
  const idMesaj = `${id}-mesaj`;
  const mesaj = eroare ?? ajutor;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{eticheta}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          className={cn("tinta-atingere font-mono", unitate && "pr-14")}
          value={valoare}
          min={min}
          max={max}
          step={pas}
          disabled={disabled}
          aria-invalid={eroare ? true : undefined}
          aria-describedby={mesaj ? idMesaj : undefined}
          onChange={(e) => {
            const brut = e.target.value;
            onChange(brut === "" ? "" : Number(brut));
          }}
        />
        {unitate && (
          <span
            aria-hidden="true"
            className="text-text-slab pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-sm"
          >
            {unitate}
          </span>
        )}
      </div>
      {mesaj && (
        <p id={idMesaj} className={cn("text-xs", eroare ? "text-eroare" : "text-text-slab")}>
          {mesaj}
        </p>
      )}
    </div>
  );
}

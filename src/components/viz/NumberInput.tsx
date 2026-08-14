import { useEffect, useId, useState } from "react";
import { Notatie } from "@/components/viz/Notatie";

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
 * Sub atâta, numărul se scrie în notație științifică.
 *
 * **JavaScript are propriul prag, și e prea jos.** `String(1e-8)` dă „1e-8", dar
 * `String(1e-4)` dă „0.0001" — deci două preseturi ale aceleiași pagini afișau
 * toleranța în două formate, iar cel zecimal se și tăia în câmpul îngust. Pragul
 * de aici e al nostru, ca afișarea să nu depindă de unde se răzgândește motorul.
 */
const PRAG_STIINTIFIC = 1e-3;

/** Ce scrie în câmp pentru o valoare venită din afară (preset, „Resetează"). */
function afiseaza(valoare: number | ""): string {
  if (valoare === "") return "";
  if (valoare !== 0 && Math.abs(valoare) < PRAG_STIINTIFIC) return valoare.toExponential();
  return String(valoare);
}

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

  /**
   * Textul din câmp e ținut separat de numărul din stare.
   *
   * Fără asta, formatarea ar lupta cu tastarea: cine scrie „0.0005" trece prin
   * „0.", „0.00", iar câmpul i-ar rescrie textul sub degete. Se resincronizează
   * **doar** când valoarea din afară chiar diferă de ce s-a tastat — adică la un
   * preset sau la „Resetează".
   */
  const [text, setText] = useState(() => afiseaza(valoare));

  useEffect(() => {
    const dinText = text.trim() === "" ? "" : Number(text);
    if (dinText === valoare) return;
    if (typeof dinText === "number" && typeof valoare === "number" && dinText === valoare) return;
    setText(afiseaza(valoare));
    // `text` lipsește dinadins din dependențe: efectul reacționează la valoarea
    // venită din afară, nu la fiecare tastă.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valoare]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-base">
        <Notatie>{eticheta}</Notatie>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          className={cn("tinta-atingere font-mono", unitate && "pr-14")}
          value={text}
          min={min}
          max={max}
          step={pas}
          disabled={disabled}
          aria-invalid={eroare ? true : undefined}
          aria-describedby={mesaj ? idMesaj : undefined}
          onChange={(e) => {
            const brut = e.target.value;
            setText(brut);
            onChange(brut.trim() === "" ? "" : Number(brut));
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
        <p id={idMesaj} className={cn("text-sm", eroare ? "text-eroare" : "text-text-slab")}>
          {mesaj}
        </p>
      )}
    </div>
  );
}

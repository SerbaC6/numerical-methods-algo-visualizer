import { useEffect, useId, useState } from "react";
import { Notatie } from "@/components/viz/Notatie";
import { areNotatie } from "@/lib/notatie";

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
  /**
   * Valoarea se scrie **întotdeauna** în notație științifică („1e-8"), oricât
   * de mare ar fi. Pentru toleranțe, unde altfel același câmp arăta „0,0001"
   * la un preset și „1e-8" la altul.
   */
  stiintific?: boolean;
  /**
   * Fără săgețile de sus-jos.
   *
   * Se pune pe câmpurile care se plimbă peste ordine de mărime — toleranța,
   * pasul `h`: un pas de 1e-9 pe o valoare de 1e-6 înseamnă o mie de apăsări ca
   * să se schimbe ceva vizibil, deci săgeata promitea o reglare pe care n-o
   * putea face.
   */
  faraSageti?: boolean;
  /**
   * Eticheta rămâne, dar numai pentru cititorul de ecran.
   *
   * Se pune acolo unde câmpurile formează ele însele o figură — o matrice între
   * paranteze —, iar numele fiecărei celule scris deasupra ei ar face din
   * matrice o listă de câmpuri. Numele nu dispare: câmpul îl păstrează ca nume
   * accesibil, deci „a₂₃" se aude în continuare.
   */
  etichetaAscunsa?: boolean;
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

/**
 * E eticheta un simbol matematic, sau un cuvânt?
 *
 * Simbolurile („a₁₁", „x₁⁽⁰⁾", „α") se scriu mono, ca cifrele din ele să se
 * alinieze și indicii să se citească. Cuvintele nu: „Toleranța" în JetBrains
 * Mono arată ca o scăpare. Criteriul e cel mai simplu care le separă: are
 * exponenți sau indici, ori e un singur cuvânt foarte scurt.
 */
function esteSimbol(eticheta: string): boolean {
  return areNotatie(eticheta) || (!/\s/.test(eticheta) && eticheta.length <= 4);
}

/** Ce scrie în câmp pentru o valoare venită din afară (preset, „Resetează"). */
function afiseaza(valoare: number | "", stiintific = false): string {
  if (valoare === "") return "";
  if (valoare !== 0 && (stiintific || Math.abs(valoare) < PRAG_STIINTIFIC)) {
    return valoare.toExponential();
  }
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
  stiintific,
  faraSageti,
  etichetaAscunsa,
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
  const [text, setText] = useState(() => afiseaza(valoare, stiintific));

  useEffect(() => {
    const dinText = text.trim() === "" ? "" : Number(text);
    if (dinText === valoare) return;
    if (typeof dinText === "number" && typeof valoare === "number" && dinText === valoare) return;
    setText(afiseaza(valoare, stiintific));
    // `text` lipsește dinadins din dependențe: efectul reacționează la valoarea
    // venită din afară, nu la fiecare tastă.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valoare]);

  return (
    <div className={cn("grid gap-2", className)}>
      {/* Mono **doar** când eticheta e un simbol („a₁₁", „x₁⁽⁰⁾"), nu când e un
          cuvânt („Toleranța", „Iterații maxime"): un cuvânt scris mono arată ca
          o eroare de stil. Simbolurile se scriu și mai mare, ca indicii să se
          vadă. */}
      <Label
        htmlFor={id}
        className={cn("text-lg", esteSimbol(eticheta) && "font-mono", etichetaAscunsa && "sr-only")}
      >
        <Notatie>{eticheta}</Notatie>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          className={cn(
            // `md:text-lg`, nu doar `text-lg`: `Input` din shadcn are `md:text-sm`
            // în clasa lui de bază, care altfel câștigă de la breakpoint în sus
            // și lăsa cifrele la 14 px pe desktop.
            "tinta-atingere font-mono text-lg md:text-lg",
            // Firefox scoate săgețile cu `appearance: textfield`,
            // WebKit/Chromium doar prin pseudo-elementele lor.
            faraSageti &&
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            unitate && "pr-14",
          )}
          value={text}
          min={min}
          max={max}
          step={faraSageti ? "any" : pas}
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

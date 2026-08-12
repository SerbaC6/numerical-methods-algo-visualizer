import { useId } from "react";
import { Check, TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verificaExpresie } from "@/lib/expresii";
import { cn } from "@/lib/utils";

export type ExpressionInputProps = {
  eticheta: string;
  valoare: string;
  onChange: (valoare: string) => void;
  placeholder?: string;
  /** Exemple pe care utilizatorul le poate pune cu un clic. */
  exemple?: string[];
  ajutor?: string;
  className?: string;
};

/**
 * Câmp pentru expresii matematice: font mono (cifrele se aliniază),
 * validare la tastare și exemple gata de folosit.
 */
export function ExpressionInput({
  eticheta,
  valoare,
  onChange,
  placeholder = "x^3 - 2*x - 5",
  exemple,
  ajutor,
  className,
}: ExpressionInputProps) {
  const id = useId();
  const idMesaj = `${id}-mesaj`;
  const eroare = verificaExpresie(valoare);
  const valid = eroare === null;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{eticheta}</Label>
      <div className="relative">
        <Input
          id={id}
          className="tinta-atingere pr-10 font-mono"
          value={valoare}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-invalid={valid ? undefined : true}
          aria-describedby={idMesaj}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {valid ? (
            <Check className="text-succes size-4" aria-hidden="true" />
          ) : (
            <TriangleAlert className="text-eroare size-4" aria-hidden="true" />
          )}
        </span>
      </div>

      <p
        id={idMesaj}
        role={valid ? undefined : "alert"}
        className={cn("text-xs", valid ? "text-text-slab" : "text-eroare")}
      >
        {valid ? (ajutor ?? "Expresie validă.") : eroare}
      </p>

      {exemple && exemple.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-slab text-xs">Exemple:</span>
          {exemple.map((exemplu) => (
            <button
              key={exemplu}
              type="button"
              onClick={() => onChange(exemplu)}
              className="border-bordura hover:border-accent hover:text-text focus-visible:ring-ring/50 text-text-slab duration-rapid ease-standard rounded-full border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
            >
              {exemplu}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

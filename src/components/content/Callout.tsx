import { CircleAlert, Info, Lightbulb, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export type TipCallout = "nota" | "retine" | "atentie" | "capcana";

const STILURI: Record<
  TipCallout,
  { titlu: string; icon: typeof Info; clase: string; iconClase: string }
> = {
  nota: {
    titlu: "De știut",
    icon: Info,
    clase: "border-accent-slab/50 bg-secondary/40",
    iconClase: "text-text-slab",
  },
  retine: {
    titlu: "De reținut",
    icon: Lightbulb,
    clase: "border-succes/40 bg-succes-fundal",
    iconClase: "text-succes",
  },
  atentie: {
    titlu: "Atenție",
    icon: TriangleAlert,
    clase: "border-atentie/40 bg-atentie-fundal",
    iconClase: "text-atentie",
  },
  capcana: {
    titlu: "Capcană",
    icon: CircleAlert,
    clase: "border-eroare/40 bg-eroare-fundal",
    iconClase: "text-eroare",
  },
};

export type CalloutProps = {
  tip?: TipCallout;
  /** Înlocuiește titlul implicit al tipului. */
  titlu?: string;
  children: React.ReactNode;
  className?: string;
};

/** Blocul de „atenție / capcană / de reținut" din textul unei metode. */
export function Callout({ tip = "nota", titlu, children, className }: CalloutProps) {
  const stil = STILURI[tip];
  const Icon = stil.icon;

  return (
    <aside className={cn("flex gap-3 rounded-lg border p-4", stil.clase, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", stil.iconClase)} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-bold">{titlu ?? stil.titlu}</p>
        <div className="text-text-slab mt-1 text-sm [&_a]:underline">{children}</div>
      </div>
    </aside>
  );
}

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { ALGORITMI, CAPITOLE, type Capitol } from "@/algorithms/registry";
import { AlgorithmCard } from "@/components/content/AlgorithmCard";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CAPITOLE_ORDONATE = (Object.keys(CAPITOLE) as Capitol[]).sort(
  (a, b) => CAPITOLE[a].ordine - CAPITOLE[b].ordine,
);

/** Fără diacritice și fără majuscule, ca „bisectie" să găsească „bisecție". */
function normalizeaza(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function Acasa() {
  const [cautare, setCautare] = useState("");
  const [capitolActiv, setCapitolActiv] = useState<Capitol | null>(null);

  const rezultate = useMemo(() => {
    const termen = normalizeaza(cautare.trim());
    return ALGORITMI.filter((a) => {
      if (capitolActiv && a.capitol !== capitolActiv) return false;
      if (!termen) return true;
      const haystack = normalizeaza([a.titlu, a.descriere, ...a.metode].join(" "));
      return haystack.includes(termen);
    });
  }, [cautare, capitolActiv]);

  const filtrat = cautare.trim() !== "" || capitolActiv !== null;

  function reseteaza() {
    setCautare("");
    setCapitolActiv(null);
  }

  return (
    <>
      <Hero />

      <Container className="pb-8">
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search
              className="text-text-slab pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              placeholder="Caută o metodă: Newton, spline, QR…"
              aria-label="Caută o metodă numerică"
              className="tinta-atingere pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FiltruCapitol
              activ={capitolActiv === null}
              onClick={() => setCapitolActiv(null)}
              eticheta="Toate"
            />
            {CAPITOLE_ORDONATE.map((c) => (
              <FiltruCapitol
                key={c}
                activ={capitolActiv === c}
                onClick={() => setCapitolActiv(capitolActiv === c ? null : c)}
                eticheta={CAPITOLE[c].titlu}
              />
            ))}
          </div>

          <p className="text-text-slab text-sm" aria-live="polite">
            {rezultate.length === ALGORITMI.length
              ? `${ALGORITMI.length} pagini tematice`
              : `${rezultate.length} din ${ALGORITMI.length} pagini`}
          </p>
        </div>
      </Container>

      <Container className="pb-12">
        {rezultate.length === 0 ? (
          <div className="border-bordura rounded-xl border border-dashed p-10 text-center">
            <p className="font-semibold">Nicio metodă nu se potrivește.</p>
            <p className="text-text-slab mt-1 text-sm">Încearcă alt termen sau șterge filtrele.</p>
            <Button variant="outline" className="mt-4" onClick={reseteaza}>
              <X aria-hidden="true" />
              Șterge filtrele
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rezultate.map((pagina) => (
              <li key={pagina.slug}>
                <AlgorithmCard
                  numar={pagina.numar}
                  titlu={pagina.titlu}
                  capitol={CAPITOLE[pagina.capitol].titlu}
                  descriere={pagina.descriere}
                  dificultate={pagina.dificultate}
                  metode={pagina.metode}
                  to={`/algoritm/${pagina.slug}`}
                  stare={pagina.gata ? "gata" : "in-lucru"}
                />
              </li>
            ))}
          </ul>
        )}

        {filtrat && rezultate.length > 0 && (
          <Button variant="ghost" className="mt-8" onClick={reseteaza}>
            <X aria-hidden="true" />
            Arată toate cele {ALGORITMI.length} pagini
          </Button>
        )}
      </Container>
    </>
  );
}

function FiltruCapitol({
  activ,
  eticheta,
  onClick,
}: {
  activ: boolean;
  eticheta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activ}
      className={cn(
        "duration-rapid ease-standard focus-visible:ring-ring/50 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
        activ
          ? "border-accent bg-accent text-white"
          : "border-bordura text-text-slab hover:text-text hover:border-accent-slab",
      )}
    >
      {eticheta}
    </button>
  );
}

/** Hero-ul: două propoziții și un fundal discret, construit din tokens de vizualizare. */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--viz-grila) 1px, transparent 1px), linear-gradient(90deg, var(--viz-grila) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(120% 80% at 30% 0%, #000 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="bg-accent/20 pointer-events-none absolute -top-32 -left-24 -z-10 size-96 rounded-full blur-3xl"
      />

      <Container className="py-14 sm:py-20">
        <p className="text-accent-slab text-xs font-semibold tracking-widest uppercase">
          Metode numerice · 14 pagini interactive
        </p>
        <h1 className="text-afis mt-3 max-w-3xl font-extrabold">
          Vezi cum lucrează <span className="text-accent-slab">algoritmii</span>, pas cu pas.
        </h1>
        <p className="text-text-slab mt-5 max-w-2xl text-lg">
          Fiecare metodă din curs, explicată prin animație și printr-o interfață cu care te poți
          juca — cu formula alături, ca să vezi de unde vine fiecare număr. Alege de mai jos ce vrei
          să înțelegi.
        </p>
      </Container>
    </section>
  );
}

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";

import { Input } from "@/components/ui/input";
import { cautaAlgoritmi } from "@/lib/cautare";
import { cn } from "@/lib/utils";

/**
 * Căutarea din bara de sus: scrii, alegi din listă, ajungi direct pe pagina
 * metodei. E un combobox scris de mână (tiparul APG „combobox with listbox
 * popup"), nu un Popover: focusul trebuie să rămână în input cât timp navighezi
 * cu săgețile prin rezultate.
 */
export function CautareMetode({ className }: { className?: string }) {
  const navigate = useNavigate();
  const idLista = useId();
  const container = useRef<HTMLDivElement>(null);

  const [termen, setTermen] = useState("");
  const [deschis, setDeschis] = useState(false);
  const [activ, setActiv] = useState(0);

  const rezultate = useMemo(() => cautaAlgoritmi(termen), [termen]);
  const listaVizibila = deschis && termen.trim() !== "";
  const ales = listaVizibila ? rezultate[activ] : undefined;

  /** Clic în afară închide lista, dar nu golește ce ai scris. */
  useEffect(() => {
    if (!listaVizibila) return;
    function laApasare(e: PointerEvent) {
      if (!container.current?.contains(e.target as Node)) setDeschis(false);
    }
    document.addEventListener("pointerdown", laApasare);
    return () => document.removeEventListener("pointerdown", laApasare);
  }, [listaVizibila]);

  /** Opțiunea activă rămâne în câmpul vizibil când derulezi cu săgețile. */
  useEffect(() => {
    if (!listaVizibila) return;
    document.getElementById(`${idLista}-${activ}`)?.scrollIntoView({ block: "nearest" });
  }, [activ, idLista, listaVizibila]);

  function deschidePagina(slug: string) {
    setTermen("");
    setDeschis(false);
    setActiv(0);
    navigate(`/algoritm/${slug}`);
  }

  function laTasta(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (rezultate.length === 0) return;
      e.preventDefault();
      setDeschis(true);
      setActiv((i) =>
        e.key === "ArrowDown"
          ? (i + 1) % rezultate.length
          : (i - 1 + rezultate.length) % rezultate.length,
      );
      return;
    }

    if (e.key === "Enter" && ales) {
      e.preventDefault();
      deschidePagina(ales.slug);
      return;
    }

    if (e.key === "Escape") {
      // Prima apăsare închide lista, a doua golește câmpul.
      if (listaVizibila) setDeschis(false);
      else setTermen("");
      return;
    }

    if (e.key === "Tab") setDeschis(false);
  }

  return (
    <div ref={container} className={cn("relative min-w-0", className)}>
      <Search
        className="text-text-slab pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        type="text"
        role="combobox"
        value={termen}
        onChange={(e) => {
          setTermen(e.target.value);
          setDeschis(true);
          setActiv(0);
        }}
        onFocus={() => setDeschis(true)}
        onKeyDown={laTasta}
        placeholder="Caută o metodă…"
        aria-label="Caută o metodă numerică"
        aria-expanded={listaVizibila}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={ales ? `${idLista}-${activ}` : undefined}
        autoComplete="off"
        spellCheck={false}
        className="tinta-atingere pl-9"
      />

      <span className="sr-only" aria-live="polite">
        {listaVizibila
          ? rezultate.length === 0
            ? "Nicio metodă găsită."
            : `${rezultate.length} metode găsite.`
          : ""}
      </span>

      {listaVizibila && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Rezultatele căutării"
          className="bg-fundal-ridicat border-bordura shadow-sus absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border p-1"
        >
          {rezultate.length === 0 ? (
            <li className="text-text-slab px-3 py-2.5 text-sm">Nicio metodă nu se potrivește.</li>
          ) : (
            rezultate.map((algoritm, i) => (
              <li
                key={algoritm.slug}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === activ}
                onMouseEnter={() => setActiv(i)}
                onMouseDown={(e) => {
                  // `mousedown`, nu `click`: altfel inputul pierde focusul întâi
                  // și lista se închide înainte să apuce clicul.
                  e.preventDefault();
                  deschidePagina(algoritm.slug);
                }}
                className={cn(
                  "duration-rapid ease-standard cursor-pointer rounded-lg px-3 py-2 transition-colors",
                  i === activ && "bg-secondary",
                )}
              >
                <p className="text-sm font-semibold">{algoritm.titlu}</p>
                <p className="text-text-slab mt-0.5 truncate text-xs">
                  {algoritm.metode.join(" · ")}
                </p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

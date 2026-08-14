import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { Notatie } from "@/components/viz/Notatie";
import type { BlocTeorie, TeorieScurtaContinut } from "@/content/tipuri";

/** Un bloc: ori o propoziție, ori o formulă cu sursa ei. */
function Bloc({ bloc }: { bloc: BlocTeorie }) {
  if (bloc.tip === "text") {
    return <p className="text-text-slab text-lg leading-relaxed">{bloc.continut}</p>;
  }

  return (
    <figure className="m-0 flex flex-col gap-3">
      {/* Formula și legenda literelor stau în **aceeași** casetă. Sunt un
          singur lucru: o formulă pe care n-o poți citi fiindcă nu știi ce e `p`
          și ce e `pₙ` nu comunică nimic. Despărțite în două cutii, ochiul le
          citea ca pe două secțiuni fără legătură. */}
      <div className="bg-suprafata/60 border-bordura overflow-hidden rounded-xl border">
        {/* Mărimea se dă pe **părinte**, nu pe `.katex`: KaTeX își impune propriul
            `font-size: 1.21em` dintr-o foaie nelayerată, pe care o regulă din
            `@layer components` n-o poate depăși. Aici, cei 1,21em ai lui se
            înmulțesc cu valoarea de mai jos și ies ~28px pe ecran lat. */}
        <FormulaBlock
          latex={bloc.latex}
          className="rounded-none border-0 bg-transparent px-5 py-6 text-[1.4rem] sm:text-[1.5rem]"
        />

        {/* Legenda literelor. Despărțită de formulă printr-o linie, nu printr-o
            ramă proprie: e continuarea ei, nu un bloc alăturat. */}
        {bloc.legenda && (
          <div className="border-bordura bg-fundal/40 border-t px-5 py-4">
            <p className="text-text-slab mb-3 text-sm font-semibold tracking-wide uppercase">
              Ce înseamnă literele
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              {bloc.legenda.map((intrare) => (
                <div
                  key={intrare.simbol}
                  className="col-span-2 grid grid-cols-subgrid items-baseline"
                >
                  {/* Aliniat la dreapta ca semnele egal să cadă unul sub altul,
                      deși simbolurile au lățimi diferite („a" față de „pₙ₋₁"). */}
                  <dt className="text-accent-slab text-right font-mono text-xl font-semibold tabular-nums">
                    <Notatie>{intrare.simbol}</Notatie>
                    <span aria-hidden="true" className="text-text-slab ml-2 font-normal">
                      =
                    </span>
                  </dt>
                  <dd className="text-text-slab m-0 text-lg leading-snug">{intrare.sens}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {bloc.explicatie && (
        <figcaption className="text-text-slab text-lg leading-relaxed">
          {bloc.explicatie}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Secțiunea „Teorie pe scurt" a unei pagini de metodă.
 *
 * Nu conține niciun text propriu — tot ce se citește vine din `src/content/`.
 * Componenta doar așază: esența metodei sus, ca propoziție de sine stătătoare,
 * apoi formulele.
 *
 * **Scrisul e mai mare decât textul obișnuit al site-ului**, iar asta e
 * intenționat: aici stau formule și indici mici (`p_{n-1}`), care la corpul
 * normal devin ilizibili. O formulă pe care trebuie s-o apropii de ochi nu-și
 * face treaba.
 */
export function TeorieScurta({ continut }: { continut: TeorieScurtaContinut }) {
  return (
    <div className="flex flex-col gap-10">
      <p className="text-text text-xl leading-relaxed">{continut.intro}</p>

      <div className="flex flex-col gap-8">
        {continut.metode.map((metoda) => (
          <article
            key={metoda.id}
            id={metoda.id}
            aria-labelledby={`titlu-${metoda.id}`}
            className="bg-suprafata border-bordura shadow-jos flex scroll-mt-20 flex-col gap-6 rounded-xl border p-6 sm:p-8"
          >
            <header className="flex flex-col gap-2">
              <h3 id={`titlu-${metoda.id}`} className="text-sectiune font-bold">
                {metoda.titlu}
              </h3>
              {/* Esența stă înaintea oricărei formule: cine citește doar rândul
                  ăsta trebuie să plece știind ce face metoda. */}
              <p className="text-text border-accent border-l-4 pl-4 text-xl leading-relaxed font-semibold">
                {metoda.esenta}
              </p>
            </header>

            <div className="flex flex-col gap-6">
              {metoda.blocuri.map((bloc, i) => (
                <Bloc key={i} bloc={bloc} />
              ))}
            </div>
          </article>
        ))}
      </div>

      {continut.incheiere && (
        <p className="text-text-slab text-lg leading-relaxed">{continut.incheiere}</p>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * Ce se întâmplă cu o celulă la pasul curent.
 *
 * - `normala` — neatinsă încă;
 * - `curent` — se calculează chiar acum;
 * - `calculat` — gata, dintr-un pas anterior;
 * - `pivot` — elementul cu care se împarte;
 * - `zero` — zero **produs de eliminare**, nu unul dat de la început.
 */
export type StareCelula = "normala" | "curent" | "calculat" | "pivot" | "zero";

export type MatrixGridProps = {
  /** Valorile, pe linii. `null` = celulă care încă nu există (L la LU, jumătatea goală la Romberg). */
  valori: (number | null)[][];
  /** Stările, paralel cu `valori`. Ce lipsește e `normala`. */
  stari?: StareCelula[][];
  /** Linia pe care se lucrează acum — se colorează pe toată lățimea. */
  linieActiva?: number;
  coloanaActiva?: number;
  /** Indexul coloanei după care se trage linia verticală, pentru matricea extinsă [A|b]. */
  separatorColoana?: number;
  etichetaLinii?: string[];
  etichetaColoane?: string[];
  /** Numele matricei: „A", „L", „U". Apare deasupra și în descrierea pentru cititorul de ecran. */
  titlu?: string;
  /** Rezumatul textual al matricei. Dacă lipsește, se compune automat. */
  descriere?: string;
  formateaza?: (x: number) => string;
  className?: string;
};

/**
 * Formatarea implicită: întregii rămân întregi, restul se taie la 3 zecimale.
 * `-0` devine `0` — altfel apare în tabel după o scădere și arată a greșeală.
 */
function formatImplicit(x: number): string {
  if (Object.is(x, -0)) return "0";
  if (Number.isInteger(x)) return String(x);
  return x.toFixed(3);
}

/** Clasele fiecărei stări. Culoarea nu e niciodată singurul semnal — merge cu grosime, umplere sau opacitate. */
const CLASE_STARE: Record<StareCelula, string> = {
  normala: "border-transparent",
  // Iterația curentă: inel safir, ca punctul curent de pe grafice.
  curent: "border-viz-curent text-text font-bold",
  // Deja calculat: rămâne lizibil, dar se retrage în plan secund.
  calculat: "border-transparent text-viz-anterior",
  // Pivotul: singurul plin, deci sare în ochi și la o privire scurtă.
  pivot: "border-viz-pivot bg-viz-pivot text-viz-pivot-text font-bold",
  // Zerourile produse de eliminare: prezente, dar clar „stinse".
  zero: "border-transparent text-text-slab opacity-55",
};

/**
 * Cum se citește fiecare stare cu voce tare. Se pune ca text ascuns vizual,
 * înaintea cifrei: „pivot, 2". Starea normală n-are etichetă — altfel fiecare
 * celulă neatinsă ar adăuga un cuvânt inutil într-o matrice de 36 de numere.
 */
const ETICHETA_STARE: Record<StareCelula, string> = {
  normala: "",
  curent: "se calculează acum,",
  calculat: "calculat,",
  pivot: "pivot,",
  zero: "zero din eliminare,",
};

/** O paranteză dreaptă de matrice, ca în curs. Pur decorativă. */
function Paranteza({ parte }: { parte: "stanga" | "dreapta" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "border-estompat/70 w-2 shrink-0 border-y-2",
        parte === "stanga" ? "rounded-l-sm border-l-2" : "rounded-r-sm border-r-2",
      )}
    />
  );
}

/**
 * Rezumatul citit la intrarea în matrice, când nu se dă unul explicit.
 *
 * Nu se rezumă la dimensiuni: spune și unde e pivotul și pe ce linie se lucrează.
 * Cine nu vede grila are nevoie exact de informația pe care culoarea o dă
 * dintr-o privire, altfel îi rămân doar niște numere înșirate.
 */
function descriereImplicita({
  valori,
  stari,
  linieActiva,
  titlu,
}: Pick<MatrixGridProps, "valori" | "stari" | "linieActiva" | "titlu">): string {
  const linii = valori.length;
  const coloane = valori[0]?.length ?? 0;
  const nume = titlu ? `Matricea ${titlu}` : "Matrice";
  const parti = [`${nume}, ${linii} linii și ${coloane} coloane.`];

  // Indicii se spun 1-based: studentul citește a₂₁, nu a₁₀.
  for (const [i, linie] of (stari ?? []).entries()) {
    const j = linie.indexOf("pivot");
    if (j !== -1) {
      parti.push(`Pivotul e pe linia ${i + 1}, coloana ${j + 1}.`);
      break;
    }
  }

  if (linieActiva !== undefined) parti.push(`Se lucrează pe linia ${linieActiva + 1}.`);

  return parti.join(" ");
}

/**
 * Matricea desenată, cu starea fiecărei celule la pasul curent.
 *
 * Desenează **o singură** matrice. Compunerea (A = L·U, una lângă alta) e
 * treaba paginii — altfel componenta ar fi trebuit să știe și de layout, și
 * n-ar mai fi mers pentru tabloul triunghiular de la Romberg.
 *
 * Nu conține matematică: primește valorile și stările deja calculate în
 * `src/algorithms`, ca restul componentelor din `viz/`.
 */
export function MatrixGrid({
  valori,
  stari,
  linieActiva,
  coloanaActiva,
  separatorColoana,
  etichetaLinii,
  etichetaColoane,
  titlu,
  descriere,
  formateaza = formatImplicit,
  className,
}: MatrixGridProps) {
  const areEtichetaColoane = etichetaColoane !== undefined;
  const areEtichetaLinii = etichetaLinii !== undefined;

  return (
    // `min-w-0` nu e decorativ: fără el, o matrice lată pusă într-un flex sau
    // grid (cum va sta pe paginile de metodă, lângă panoul de controale) refuză
    // să se micșoreze sub lățimea conținutului și împinge toată pagina, în loc
    // să facă scroll în containerul ei.
    <figure className={cn("m-0 min-w-0", className)}>
      {titlu && (
        <figcaption className="text-text-slab mb-2 font-mono text-xs font-bold tracking-wide">
          {titlu}
        </figcaption>
      )}

      <div className="scroll-tabel">
        <div className="flex w-max items-stretch gap-1.5">
          <Paranteza parte="stanga" />

          <table className="border-separate border-spacing-1 font-mono text-sm tabular-nums">
            {/*
              Rezumatul stă în `<caption>`, nu într-un `<p>` alăturat: așa e
              legat de tabel și se citește exact la intrarea în el, nu undeva
              înainte, rupt de context.
            */}
            <caption className="sr-only">
              {descriere ?? descriereImplicita({ valori, stari, linieActiva, titlu })}
            </caption>
            {areEtichetaColoane && (
              <thead>
                <tr>
                  {areEtichetaLinii && <td className="p-0" />}
                  {etichetaColoane.map((eticheta, j) => (
                    <th
                      key={j}
                      scope="col"
                      className="text-text-slab px-2 pb-1 text-xs font-semibold"
                    >
                      {eticheta}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody>
              {valori.map((linie, i) => (
                <tr key={i}>
                  {areEtichetaLinii && (
                    <th
                      scope="row"
                      className="text-text-slab pr-2 text-right text-xs font-semibold"
                    >
                      {etichetaLinii[i]}
                    </th>
                  )}

                  {linie.map((valoare, j) => {
                    const stare = stari?.[i]?.[j] ?? "normala";
                    const peLinieActiva = i === linieActiva;
                    const peColoanaActiva = j === coloanaActiva;

                    return (
                      <td
                        key={j}
                        // Doar pentru teste și depanare — `data-*` nu se citește
                        // cu voce tare. Starea ajunge la cititorul de ecran prin
                        // textul ascuns din interiorul celulei.
                        data-stare={stare}
                        className={cn(
                          "duration-mediu ease-standard min-w-11 rounded-md border-2 px-2 py-1.5 text-center transition-colors",
                          // Linia/coloana activă stau dedesubt, ca fundal; starea
                          // celulei se desenează peste ele, deci nu se pierde.
                          (peLinieActiva || peColoanaActiva) && "bg-viz-interval",
                          CLASE_STARE[stare],
                          separatorColoana === j && "border-r-estompat/70 mr-1.5 border-r-2",
                        )}
                      >
                        {ETICHETA_STARE[stare] && (
                          <span className="sr-only">{ETICHETA_STARE[stare]} </span>
                        )}
                        {valoare === null ? (
                          <>
                            <span aria-hidden="true" className="text-text-slab opacity-40">
                              ·
                            </span>
                            <span className="sr-only">gol</span>
                          </>
                        ) : (
                          formateaza(valoare)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <Paranteza parte="dreapta" />
        </div>
      </div>
    </figure>
  );
}

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
  /**
   * Cât de mari sunt cifrele. `normal` e mărimea de tabel, bună când matricea
   * stă lângă mult text; `mare` e pentru când matricea **e** subiectul zonei și
   * are loc — altfel arată ca o notă de subsol lângă o formulă de 20 px.
   */
  corp?: "normal" | "mare";
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
  curent: "se schimbă acum,",
  calculat: "terminat,",
  pivot: "pivot,",
  zero: "zero din eliminare,",
};

/**
 * O paranteză dreaptă de matrice. Pur decorativă.
 *
 * E element de sine stătător în grilă, care se întinde peste toate liniile de
 * date — nu și peste etichete. Matematic, `L₂` și `C₃` sunt repere din afara
 * matricei: dacă ar sta între paranteze, ar arăta ca niște elemente ale ei.
 */
function Paranteza({
  parte,
  coloana,
  linii,
}: {
  parte: "stanga" | "dreapta";
  coloana: number;
  linii: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ gridColumn: coloana, gridRow: linii }}
      className={cn(
        "border-estompat/70 border-y-2",
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
  corp = "normal",
  className,
}: MatrixGridProps) {
  const areEtichetaColoane = etichetaColoane !== undefined;
  const areEtichetaLinii = etichetaLinii !== undefined;
  const nrColoane = valori[0]?.length ?? 0;
  const areSeparator = separatorColoana !== undefined && separatorColoana < nrColoane - 1;

  /*
    Aşezarea se face cu CSS Grid, cu poziţii calculate explicit, nu cu
    `border-spacing` pe tabel. Motivul: parantezele şi linia de separare trebuie
    să acopere exact zona de numere — nici etichetele, nici mai puţin — şi să
    rămână aliniate oricât de late ar fi valorile. Grid-ul dimensionează
    coloanele după conţinut, deci alinierea vine de la sine.

    Ordinea coloanelor:
      [etichete linii] [ ( ] [ date… (+ linia de separare) ] [ ) ]
  */
  const colEtichete = areEtichetaLinii ? 1 : 0;
  const colParantezaStanga = colEtichete + 1;
  const primaColDate = colParantezaStanga + 1;
  /** Coloana din grilă a datelor cu indexul `j`. */
  const colDate = (j: number) => primaColDate + j;
  const colParantezaDreapta = colDate(nrColoane - 1) + 1;

  const primaLinieDate = areEtichetaColoane ? 2 : 1;
  /** Toate liniile de date, ca interval — parantezele se întind peste ele. */
  const liniiDate = `${primaLinieDate} / ${primaLinieDate + valori.length}`;

  const sabloanColoane = [
    ...(areEtichetaLinii ? ["auto"] : []),
    "0.5rem",
    ...Array.from({ length: nrColoane }, () => "auto"),
    "0.5rem",
  ].join(" ");

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
        {/*
          Grila stă pe `<div>`, nu pe `<table>`: parantezele și linia de separare
          sunt `<span>`-uri, iar un `<table>` n-are voie să le conțină direct.
          Tabelul primește `display: contents`, deci celulele lui ajung în grila
          de aici, păstrându-și structura din DOM.

          Elementele de tabel primesc `role` explicit fiindcă schimbarea lui
          `display` pe un `<table>` îi poate șterge semantica din arborele de
          accesibilitate; rolurile o pun la loc.
        */}
        <div
          className={cn(
            "grid w-max items-stretch gap-1 font-mono tabular-nums",
            corp === "mare" ? "gap-1.5 text-lg" : "text-sm",
          )}
          style={{ gridTemplateColumns: sabloanColoane }}
        >
          <Paranteza parte="stanga" coloana={colParantezaStanga} linii={liniiDate} />
          <Paranteza parte="dreapta" coloana={colParantezaDreapta} linii={liniiDate} />

          {/*
            Linia care desparte A de b. Nu are coloană proprie în grilă, ci se
            desenează în spaţiul dintre coloane, lipită de marginea din dreapta a
            ultimei coloane din A. Cu o coloană proprie, lăţimea ei s-ar fi
            simţit şi pe rândul etichetelor, iar `C₃` şi `b` ar fi apărut mai
            depărtate decât restul. Aşa, linia există doar în dreptul numerelor.
          */}
          {areSeparator && separatorColoana !== undefined && (
            <span
              aria-hidden="true"
              style={{
                gridColumn: colDate(separatorColoana),
                gridRow: liniiDate,
                // jumătate din `gap-1` (4px), plus jumătate din grosimea liniei
                marginRight: "-3px",
              }}
              className="bg-estompat/70 w-0.5 justify-self-end"
            />
          )}

          <table role="table" className="contents">
            {/*
              Rezumatul stă în `<caption>`, nu într-un `<p>` alăturat: așa e
              legat de tabel și se citește exact la intrarea în el, nu undeva
              înainte, rupt de context. Fiind `sr-only` (deci scos din flux), nu
              ocupă nicio celulă din grilă.
            */}
            <caption className="sr-only">
              {descriere ?? descriereImplicita({ valori, stari, linieActiva, titlu })}
            </caption>

            {areEtichetaColoane && (
              <thead className="contents">
                <tr role="row" className="contents">
                  {etichetaColoane.map((eticheta, j) => (
                    <th
                      key={j}
                      role="columnheader"
                      scope="col"
                      style={{ gridColumn: colDate(j), gridRow: 1 }}
                      className="text-text-slab px-2 pb-0.5 text-center text-xs font-semibold"
                    >
                      {eticheta}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody className="contents">
              {valori.map((linie, i) => (
                <tr key={i} role="row" className="contents">
                  {areEtichetaLinii && (
                    <th
                      role="rowheader"
                      scope="row"
                      style={{ gridColumn: 1, gridRow: primaLinieDate + i }}
                      className="text-text-slab flex items-center justify-end pr-1.5 text-xs font-semibold"
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
                        role="cell"
                        // Doar pentru teste și depanare — `data-*` nu se citește
                        // cu voce tare. Starea ajunge la cititorul de ecran prin
                        // textul ascuns din interiorul celulei.
                        data-stare={stare}
                        style={{ gridColumn: colDate(j), gridRow: primaLinieDate + i }}
                        className={cn(
                          "duration-mediu ease-standard min-w-11 rounded-md border-2 px-2 py-1.5 text-center transition-colors",
                          // Linia/coloana activă stau dedesubt, ca fundal; starea
                          // celulei se desenează peste ele, deci nu se pierde.
                          // `/20` fiindcă `--viz-interval` e culoare plină:
                          // transparența o pune consumatorul. Plin, ar înghiți
                          // cifra din celulă.
                          (peLinieActiva || peColoanaActiva) && "bg-viz-interval/20",
                          CLASE_STARE[stare],
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
        </div>
      </div>
    </figure>
  );
}

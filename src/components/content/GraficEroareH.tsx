import type { CurbaEroare } from "@/algorithms/derivare-numerica/eroare";
import { cn } from "@/lib/utils";
import { culoareEticheta, culoareRol, type RolViz } from "@/lib/viz-roles";

export type CurbaDesenata = {
  id: string;
  curba: CurbaEroare;
  eticheta: string;
};

export type GraficEroareHProps = {
  curbe: readonly CurbaDesenata[];
  /** Formula aleasă acum: curba ei se desenează apăsat, restul rămân context. */
  idSelectat: string;
  /** `h`-ul ales acum în interfață, marcat vertical. */
  hCurent: number;
  className?: string;
};

/**
 * Cum se desenează o curbă: aleasă sau nu.
 *
 * **De ce nu patru culori.** Paleta e monocromă pe albastru și nu se lărgește
 * pentru un grafic; patru curbe în patru nuanțe de albastru s-ar citi ca una
 * singură, groasă. Aici contează oricum o singură curbă odată — cea a formulei
 * din taburi —, iar celelalte trei sunt context: subțiri, punctate, estompate.
 * Culoarea nu e nici aici singurul semnal: grosimea și linia punctată spun
 * același lucru.
 */
function stil(selectat: boolean): {
  rol: RolViz;
  grosime: number;
  opacitate: number;
  punctata: boolean;
} {
  return selectat
    ? { rol: "curent", grosime: 5, opacitate: 1, punctata: false }
    : { rol: "anterior", grosime: 2.5, opacitate: 0.6, punctata: true };
}

const W = 900;
const H = 420;
const MARGINE = { sus: 20, dreapta: 24, jos: 78, stanga: 96 };

/**
 * Eroarea în funcție de pas, pe două scări logaritmice.
 *
 * **De ce log-log.** Aici nu se compară valori, ci **ordine de mărime**: `h`
 * merge de la `10⁰` la `10⁻¹⁴`, iar eroarea trece prin zece-douăsprezece decade.
 * Pe scară liniară s-ar vedea un singur punct. În plus, log-log e singura scară
 * pe care „eroarea e proporțională cu `hᵖ`" devine o **dreaptă de pantă `p`** —
 * adică ordinul formulei se citește cu ochiul, nu se ia pe încredere.
 *
 * **De ce contează forma de V.** Ramura din dreapta e trunchierea, care scade cu
 * `h`; cea din stânga e rotunjirea, care crește când `h` scade. Vârful de jos e
 * cel mai bun `h` — și e chiar lucrul pe care cursul îl enunță, dar nu-l arată.
 *
 * Nu conține matematică: primește curbele deja măsurate.
 */
export function GraficEroareH({ curbe, idSelectat, hCurent, className }: GraficEroareHProps) {
  const toatePunctele = curbe.flatMap((c) => c.curba.puncte).filter((p) => p.eroare > 0);
  if (toatePunctele.length === 0) return null;

  const hMax = Math.max(...toatePunctele.map((p) => p.h));
  const hMin = Math.min(...toatePunctele.map((p) => p.h));
  const erMax = Math.max(...toatePunctele.map((p) => p.eroare));
  const erMin = Math.min(...toatePunctele.map((p) => p.eroare));

  const logHMax = Math.ceil(Math.log10(hMax));
  const logHMin = Math.floor(Math.log10(hMin));
  const logEMax = Math.ceil(Math.log10(erMax));
  const logEMin = Math.floor(Math.log10(erMin));

  const latimeUtila = W - MARGINE.stanga - MARGINE.dreapta;
  const inaltimeUtila = H - MARGINE.sus - MARGINE.jos;

  // `h` scade spre dreapta: se citește ca „pasul se micșorează", nu invers.
  const x = (h: number) =>
    MARGINE.stanga + (latimeUtila * (logHMax - Math.log10(h))) / (logHMax - logHMin);
  const y = (eroare: number) =>
    MARGINE.sus + (inaltimeUtila * (logEMax - Math.log10(eroare))) / (logEMax - logEMin);

  const pasDecada = (interval: number) => Math.max(1, Math.round(interval / 7));
  const decadeH: number[] = [];
  for (let e = logHMax; e >= logHMin; e -= pasDecada(logHMax - logHMin)) decadeH.push(e);
  const decadeE: number[] = [];
  for (let e = logEMax; e >= logEMin; e -= pasDecada(logEMax - logEMin)) decadeE.push(e);

  return (
    <figure
      className={cn(
        "bg-suprafata border-bordura shadow-jos m-0 rounded-xl border p-4 sm:p-5",
        className,
      )}
    >
      <figcaption className="text-text-slab mb-3 text-base">
        Eroarea în funcție de pas, pe scări logaritmice. Panta din dreapta e chiar ordinul formulei;
        ramura din stânga e rotunjirea, care crește pe măsură ce pasul scade.
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={descriere(curbe)}
        className="block h-auto w-full"
      >
        {decadeE.map((e) => (
          <g key={`e-${e}`}>
            <line
              x1={MARGINE.stanga}
              x2={W - MARGINE.dreapta}
              y1={y(10 ** e)}
              y2={y(10 ** e)}
              stroke={culoareRol("grila")}
              strokeWidth={1}
              opacity={0.45}
            />
            <text
              x={MARGINE.stanga - 14}
              y={y(10 ** e)}
              textAnchor="end"
              dominantBaseline="central"
              fill="var(--text-slab)"
              style={{ font: "600 17px var(--font-mono)" }}
            >
              10{exponent(e)}
            </text>
          </g>
        ))}

        {decadeH.map((e) => (
          <g key={`h-${e}`}>
            <line
              x1={x(10 ** e)}
              x2={x(10 ** e)}
              y1={MARGINE.sus}
              y2={H - MARGINE.jos}
              stroke={culoareRol("grila")}
              strokeWidth={1}
              opacity={0.3}
            />
            <text
              x={x(10 ** e)}
              y={H - MARGINE.jos + 28}
              textAnchor="middle"
              fill="var(--text-slab)"
              style={{ font: "600 17px var(--font-mono)" }}
            >
              10{exponent(e)}
            </text>
          </g>
        ))}

        <text
          x={MARGINE.stanga + latimeUtila / 2}
          y={H - 16}
          textAnchor="middle"
          fill="var(--text-slab)"
          style={{ font: "600 17px var(--font-sans)" }}
        >
          pasul h, tot mai mic →
        </text>

        {/* Pasul ales acum. */}
        {hCurent > 0 && (
          <line
            x1={x(hCurent)}
            x2={x(hCurent)}
            y1={MARGINE.sus}
            y2={H - MARGINE.jos}
            stroke={culoareRol("interval")}
            strokeWidth={3}
            opacity={0.8}
          />
        )}

        {/* Întâi contextul, apoi curba aleasă — ea rămâne deasupra. */}
        {[...curbe]
          .sort((a, b) => Number(a.id === idSelectat) - Number(b.id === idSelectat))
          .map(({ id, curba, eticheta }) => {
            const puncte = curba.puncte.filter((p) => p.eroare > 0);
            if (puncte.length < 2) return null;
            const { rol, grosime, opacitate, punctata } = stil(id === idSelectat);
            return (
              <g key={eticheta} opacity={opacitate}>
                <polyline
                  points={puncte
                    .map((p) => `${x(p.h).toFixed(2)},${y(p.eroare).toFixed(2)}`)
                    .join(" ")}
                  fill="none"
                  stroke={culoareRol(rol)}
                  strokeWidth={grosime}
                  strokeDasharray={punctata ? "10 8" : undefined}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Vârful V-ului: cel mai bun pas pentru formula asta. */}
                {id === idSelectat && (
                  <circle
                    cx={x(curba.hOptim)}
                    cy={y(curba.eroareMinima)}
                    r={9}
                    fill={culoareRol("solutie")}
                    stroke="var(--suprafata)"
                    strokeWidth={3}
                  />
                )}
              </g>
            );
          })}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {curbe.map(({ id, curba, eticheta }) => {
          const selectat = id === idSelectat;
          const { rol } = stil(selectat);
          return (
            <li key={eticheta} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn("inline-block w-8 rounded-full", selectat ? "h-1.5" : "h-0.5")}
                style={{ background: culoareRol(rol), opacity: selectat ? 1 : 0.6 }}
              />
              <span
                className={cn("text-base", selectat && "font-bold")}
                style={{ color: culoareEticheta(rol) }}
              >
                {eticheta}
              </span>
              {selectat && (
                <span className="text-text-slab font-mono text-base">
                  cel mai bun h ≈ {exponentialRo(curba.hOptim)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

const CIFRE_SUS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
};

function exponent(e: number): string {
  return [...String(e)].map((c) => CIFRE_SUS[c] ?? c).join("");
}

/** `3.83e-6` → `4·10⁻⁶`, cum se scrie pe site. */
function exponentialRo(x: number): string {
  const [mantisa, exp] = x.toExponential(0).split("e");
  return `${mantisa}·10${exponent(Number(exp))}`;
}

function descriere(curbe: readonly CurbaDesenata[]): string {
  const parti = curbe.map(
    ({ curba, eticheta }) =>
      `${eticheta}: eroarea cea mai mică, ${curba.eroareMinima.toExponential(1)}, se atinge la h ≈ ${curba.hOptim.toExponential(1)}`,
  );
  return `Eroarea în funcție de pas, pe scări logaritmice. ${parti.join("; ")}.`;
}

import { Fragment, useMemo, useState } from "react";

import {
  EXEMPLE_PIVOTARE,
  EXEMPLU_IMPLICIT,
  type ExempluPivotare,
} from "@/algorithms/eliminare-gaussiana/exemple";
import type { Matrice } from "@/algorithms/eliminare-gaussiana/eliminare";
import {
  ruleazaPivotare,
  type AlegerePivot,
  type PasPivotare,
  type Strategie,
} from "@/algorithms/eliminare-gaussiana/pivotare";
import { Callout } from "@/components/content/Callout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { AceeasiInaltime } from "@/components/viz/AceeasiInaltime";
import { Legend, type ElementLegenda } from "@/components/viz/Legend";
import { MatrixGrid, type StareCelula } from "@/components/viz/MatrixGrid";
import { Notatie } from "@/components/viz/Notatie";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { useDerulare } from "@/hooks/use-derulare";
import { zecimale } from "@/lib/numere";
import { culoareEticheta, culoareRol } from "@/lib/viz-roles";

const METODE = [
  { id: "partiala", titlu: "Pivotare parțială" },
  { id: "scalata", titlu: "Pivot scalat" },
  { id: "totala", titlu: "Pivotare totală" },
] as const satisfies readonly { id: Strategie; titlu: string }[];

/** Cifra din grilă: întregii rămân întregi, restul se scurtează la 4 zecimale. */
function cifra(x: number): string {
  if (x === 0) return "0";
  if (!Number.isFinite(x)) return zecimale(x);
  if (Number.isInteger(x) && Math.abs(x) < 1e6) return String(x);
  if (Math.abs(x) < 1e-4 || Math.abs(x) >= 1e6) return x.toExponential(2).replace(".", ",");
  return zecimale(x, 4).replace(/0+$/, "").replace(/,$/, "");
}

/** Numele indicilor, ca să nu ajungă cifre goale în etichetele câmpurilor. */
const CIFRE_JOS = "₀₁₂₃₄₅₆₇₈₉";
const indice = (n: number): string =>
  String(n)
    .split("")
    .map((c) => CIFRE_JOS[Number(c)] ?? c)
    .join("");

/**
 * Interfața interactivă a paginii 3: aceeași matrice, trei feluri de a alege
 * pivotul.
 *
 * **De ce taburile împart matricea.** Cele trei strategii n-au sens una fără
 * alta: pivotarea scalată există fiindcă cea parțială nu vede ordinul de mărime
 * al liniei, iar cea totală fiindcă nici scalarea nu se uită dincolo de coloană.
 * Diferența dintre ele se vede numai pe **aceleași** cifre, deci matricea și
 * presetarea rămân pe loc când se schimbă tabul; se reia doar derularea.
 *
 * Matematica nu stă aici: selecția pivotului, permutările, `µ` și substituția
 * înapoi vin din `src/algorithms/eliminare-gaussiana/pivotare.ts`, cu propoziția
 * și formula fiecărui pas scrise tot acolo. Componenta traduce pasul în stări de
 * celulă și îl desenează — atât.
 */
export function InterfataEliminareGaussiana() {
  const [strategie, setStrategie] = useState<Strategie>("partiala");
  const [exemplu, setExemplu] = useState<ExempluPivotare>(EXEMPLU_IMPLICIT);
  const [matrice, setMatrice] = useState<Matrice>(() =>
    EXEMPLU_IMPLICIT.matrice.map((l) => [...l]),
  );

  const coeficienti = exemplu.coeficienti;
  const areTermenLiber = (matrice[0]?.length ?? 0) > coeficienti;

  const rezultat = useMemo(
    () => ruleazaPivotare({ matrice, coeficienti, strategie }),
    [matrice, coeficienti, strategie],
  );

  const derulare = useDerulare(rezultat.pasi.length);
  const pas = rezultat.pasi[derulare.pas];
  const ultimulPas = derulare.pas === rezultat.pasi.length - 1;

  const alegePresetare = (id: string) => {
    const ales = EXEMPLE_PIVOTARE.find((e) => e.id === id);
    if (!ales) return;
    setExemplu(ales);
    setMatrice(ales.matrice.map((l) => [...l]));
  };

  const schimbaCelula = (i: number, j: number, valoare: number | "") => {
    setMatrice((veche) =>
      veche.map((linie, li) =>
        li === i ? linie.map((v, lj) => (lj === j ? (valoare === "" ? 0 : valoare) : v)) : linie,
      ),
    );
  };

  const stari = stariDinPas(matrice, pas);
  // Scorurile se arată numai cât timp există o alegere de arătat: la pașii de
  // eliminare și de substituție, comparația s-a încheiat demult și coloana ar
  // rămâne pe ecran spunând ceva despre alt moment.
  const alegere = pas?.tip === "alegere" ? pas.alegere : undefined;

  return (
    <div className="flex flex-col gap-8">
      {/* Explicația scorului e alta la fiecare strategie și se înfășoară pe
          alt număr de rânduri. Legendele rămân ce sunt; se egalizează doar
          spațiul. */}
      <AceeasiInaltime
        activa={METODE.findIndex((m) => m.id === strategie)}
        variante={METODE.map((m) => (
          <Legend key={m.id} elemente={legendaMetodei(m.id)} />
        ))}
      />

      {/* La schimbarea tabului derularea se ia de la capăt: pasul 4 al
          pivotării parțiale și pasul 4 al celei totale nu sunt același moment
          din metodă, iar când cele două au din întâmplare tot atâția pași,
          `useDerulare` n-are de unde să știe asta. */}
      <Tabs
        value={strategie}
        onValueChange={(x) => {
          setStrategie(x as Strategie);
          derulare.setPas(0);
        }}
      >
        <TabsList className="w-full">
          {METODE.map((m) => (
            <TabsTrigger key={m.id} value={m.id} className="flex-1">
              {m.titlu}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,30%,400px)]">
          <div className="flex min-w-0 flex-col items-center justify-center gap-6 overflow-x-auto p-5 sm:p-7">
            <div className="flex items-start gap-4 sm:gap-6">
              <MatrixGrid
                valori={pas?.matrice ?? matrice}
                stari={stari}
                {
                  /* Indexul e al coloanei DUPĂ care se trage linia, deci ultima
                    coloană de coeficienți, nu prima de după ea. */ ...(areTermenLiber
                    ? { separatorColoana: coeficienti - 1 }
                    : {})
                }
                etichetaLinii={matrice.map((_, i) => `L${i + 1}`)}
                // Coloanele se numesc pe grilă fiindcă pivotarea totală chiar le
                // mută: fără nume, „C1 ↔ C3" din explicație n-ar avea ce arăta.
                etichetaColoane={(matrice[0] ?? []).map((_, j) =>
                  j < coeficienti ? `C${j + 1}` : "b",
                )}
                corp="mare"
                formateaza={cifra}
                descriere={descriereMatricei(pas, rezultat.pasi.length, derulare.pas)}
              />
              <ColoanaScoruri strategie={strategie} alegere={alegere} linii={matrice.length} />
            </div>

            <p className="text-text-slab max-w-prose text-center text-base text-pretty">
              <Notatie>{exemplu.observatie}</Notatie>
            </p>
          </div>

          <ControlPanel
            onReset={() => setMatrice(exemplu.matrice.map((l) => [...l]))}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div>
              <label
                className="text-text-slab mb-2 block text-sm font-semibold"
                htmlFor="presetare"
              >
                Sistemul
              </label>
              <Select value={exemplu.id} onValueChange={alegePresetare}>
                <SelectTrigger id="presetare" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXEMPLE_PIVOTARE.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.titlu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <MatriceEditabila
              matrice={matrice}
              coeficienti={coeficienti}
              onSchimba={schimbaCelula}
            />
          </ControlPanel>
        </div>
      </div>

      <PlaybackBar
        pas={derulare.pas}
        totalPasi={rezultat.pasi.length}
        ruleaza={derulare.ruleaza}
        viteza={derulare.viteza}
        onPas={derulare.setPas}
        onRuleazaChange={derulare.setRuleaza}
        onVitezaChange={derulare.setViteza}
      />

      {/* O singură formulă, **simbolică**, aceeași la toți pașii: se aprinde
          doar bucata la care s-a ajuns.

          Înainte, aici stăteau două piese care creșteau la fiecare pas —
          propoziția pasului și formula lui cu numerele puse în ea. Împreună
          făceau din interfață un al doilea capitol de teorie, exact ce nu-i
          trebuia: ce se schimbă pe grilă se vede pe grilă, iar de ce s-a ales
          pivotul acela se citește din coloana de scoruri de lângă ea. */}
      {pas && (
        <FormulaBlock
          latex={REGULA_PASULUI[strategie]}
          eticheta="Regula pasului"
          evidentiaza={pas.evidentiaza}
          className="text-[1.05rem] sm:text-[1.2rem]"
        />
      )}

      {/* Erorile se scriu, nu se colorează pe grilă — pe grilă roșul înseamnă
          exclusiv „pivot". */}
      {rezultat.stare === "esuat" && ultimulPas && (
        <Callout tip="atentie" titlu="Eliminarea s-a oprit">
          <Notatie>{rezultat.motiv ?? ""}</Notatie>
        </Callout>
      )}

      {rezultat.stare === "convergent" && rezultat.x && ultimulPas && (
        <Callout tip="retine" titlu="Soluția">
          <Notatie>{incheiere(rezultat.x, rezultat.ordineNecunoscute)}</Notatie>
        </Callout>
      )}
    </div>
  );
}

/**
 * Sistemul de editat, scris ca **o matrice**, nu ca un teanc de câmpuri.
 *
 * Cu eticheta fiecărei celule scrisă deasupra ei („a₁₁", „a₁₂", …, „b₁"),
 * panoul arăta ca o listă de doisprezece parametri fără legătură între ei, deși
 * e chiar matricea desenată alături. Numele n-au dispărut, doar au ieșit de pe
 * ecran: fiecare câmp îl păstrează ca nume accesibil, iar ochiul primește în loc
 * paranteza care le ține împreună și linia care desparte coeficienții de
 * termenii liberi — aceleași două semne ca pe grilă.
 */
function MatriceEditabila({
  matrice,
  coeficienti,
  onSchimba,
}: {
  matrice: Matrice;
  coeficienti: number;
  onSchimba: (i: number, j: number, valoare: number | "") => void;
}) {
  const coloane = matrice[0]?.length ?? 0;
  const areTermenLiber = coloane > coeficienti;

  return (
    <div className="grid gap-2">
      <span className="text-text-slab text-sm font-semibold">Matricea sistemului</span>
      {/* Paranteza e făcută din chenarul din stânga și cel din dreapta, ca la
          matricea din panoul metodelor puterii: două laturi verticale, niciuna
          orizontală. */}
      <div className="border-accent-slab/60 flex gap-2 rounded-sm border-x-2 border-y-0 px-2 py-2">
        <div className="grid flex-1 gap-2">
          {matrice.map((linie, i) => (
            <div
              key={i}
              className="grid items-center gap-1.5"
              style={{
                gridTemplateColumns: areTermenLiber
                  ? `repeat(${coeficienti}, minmax(0, 1fr)) auto minmax(0, 1fr)`
                  : `repeat(${coloane}, minmax(0, 1fr))`,
              }}
            >
              {linie.map((valoare, j) => (
                <Fragment key={j}>
                  {areTermenLiber && j === coeficienti && (
                    <span
                      aria-hidden="true"
                      className="bg-accent-slab/60 h-10 w-px justify-self-center"
                    />
                  )}
                  {/* Cifra la mijloc și cu margini strânse: în celule de 57 px,
                      `px-3` din `Input` lăsa 33 px pentru text, iar „35" și „−1"
                      ieșeau din câmp. */}
                  <NumberInput
                    className="[&_input]:px-1.5 [&_input]:text-center"
                    eticheta={
                      j < coeficienti ? `a${indice(i + 1)}${indice(j + 1)}` : `b${indice(i + 1)}`
                    }
                    etichetaAscunsa
                    valoare={valoare}
                    onChange={(x) => onSchimba(i, j, x)}
                    pas={0.1}
                  />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Regula fiecărei etape, scrisă o singură dată și cu simboluri, nu cu numere.
 *
 * Cele patru bucăți sunt exact cele patru feluri de pas pe care le produce
 * `ruleazaPivotare`, iar `\htmlId`-urile poartă aceleași nume ca `evidentiaza`
 * din pași — de aceea se aprinde singură bucata potrivită, fără ca formula să
 * se recompileze la fiecare pas.
 *
 * Ce diferă între strategii e **doar** scorul după care se alege pivotul; restul
 * eliminării e identic la toate trei.
 */
const REGULA_PASULUI: Record<Strategie, string> = {
  partiala: regulaPasului("\\max_{i \\ge p} |a_{ip}|"),
  scalata: regulaPasului("\\max_{i \\ge p} \\frac{|a_{ip}|}{s_i}"),
  totala: regulaPasului("\\max_{i,\\,j \\ge p} |a_{ij}|"),
};

function regulaPasului(scor: string): string {
  return (
    "\\begin{aligned}" +
    `\\htmlId{piv-linie}{${scor}} &\\quad \\htmlId{piv-permutare}{L_p \\leftrightarrow L_{i_p}} \\\\[4pt]` +
    "\\htmlId{piv-linie-noua}{L_i \\leftarrow L_i - \\mu_{ip}\\,L_p} &\\quad " +
    "\\htmlId{piv-x}{x_i = \\frac{b_i - \\sum_{j>i} a_{ij}x_j}{a_{ii}}}" +
    "\\end{aligned}"
  );
}

/**
 * Coloana de scoruri: după ce număr candidează fiecare linie la pivot.
 *
 * E singurul loc din interfață unde cele trei strategii chiar arată diferit —
 * matricea și pașii de eliminare sunt identici la toate trei. Fără ea, un tab
 * n-ar fi decât alt titlu deasupra aceluiași desen.
 */
function ColoanaScoruri({
  strategie,
  alegere,
  linii,
}: {
  strategie: Strategie;
  alegere: AlegerePivot | undefined;
  linii: number;
}) {
  const antet =
    strategie === "partiala" ? "|aᵢₚ|" : strategie === "scalata" ? "|aᵢₚ| / sᵢ" : "max |aᵢⱼ|";

  return (
    <figure className="m-0 min-w-[5.5rem]">
      <figcaption className="text-text-slab mb-2 text-center font-mono text-sm">
        <Notatie>{antet}</Notatie>
      </figcaption>
      <ul className="m-0 grid list-none gap-1 p-0">
        {Array.from({ length: linii }, (_, i) => {
          const scor = alegere?.scoruri[i];
          // Când toate scorurile sunt nule, nu există câștigător: linia „aleasă"
          // e doar prima din listă, iar marcată ca pivot ar minți.
          const castiga = alegere?.linie === i && !alegere.singular;
          const gol = scor === null || scor === undefined;

          return (
            <li
              key={i}
              className="border-bordura rounded-md border px-2 py-1.5 text-center font-mono text-base tabular-nums"
              style={{
                color: gol ? undefined : culoareEticheta(castiga ? "pivot" : "anterior"),
                borderColor: castiga ? culoareRol("pivot") : undefined,
                opacity: gol ? 0.35 : 1,
              }}
            >
              {gol ? "—" : cifra(scor)}
              {/* Rândul cu `sᵢ` există numai la pivotul scalat, dar locul
                  lui se ține la toate trei: altfel coloana — și cu ea grila de
                  lângă ea — creștea cu un rând la schimbarea tabului. */}
              <span
                className={
                  alegere?.scalari?.[i] != null && !gol
                    ? "text-text-slab block text-xs"
                    : "invisible block text-xs"
                }
                aria-hidden={alegere?.scalari?.[i] == null || gol}
              >
                {alegere?.scalari?.[i] != null && !gol ? (
                  <Notatie>{`sᵢ = ${cifra(alegere.scalari[i] as number)}`}</Notatie>
                ) : (
                  "sᵢ = 0"
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/**
 * Pasul, tradus în stări de celulă.
 *
 * Traducerea stă aici, nu în algoritm: `StareCelula` e vocabular de desen, iar
 * `src/algorithms/` n-are voie să știe cum arată grila.
 */
function stariDinPas(matrice: Matrice, pas: PasPivotare | undefined): StareCelula[][] {
  const linii = pas?.matrice ?? matrice;
  const stari: StareCelula[][] = linii.map((linie) => linie.map(() => "normala" as StareCelula));
  if (!pas) return stari;

  const marcheaza = (i: number, j: number, stare: StareCelula) => {
    const linie = stari[i];
    if (linie && j >= 0 && j < linie.length) linie[j] = stare;
  };

  // Tot ce e sub diagonală și la stânga pasului curent e deja zero produs de
  // eliminare; tot ce e deasupra e gata calculat.
  for (let i = 0; i < linii.length; i++) {
    for (let j = 0; j < Math.min(i, pas.p); j++) marcheaza(i, j, "zero");
  }

  switch (pas.tip) {
    case "alegere":
      // Când căutarea n-a găsit nimic nenul, nu există pivot — deci nu se
      // colorează nicio celulă ca pivot. Un „0" umplut cu vermillion ar spune
      // exact pe dos: că elementul ăla e cel cu care se împarte.
      if (pas.alegere.singular) break;
      // Pivotul e încă la candidatul lui, nu pe diagonală: se arată unde e, ca
      // pasul următor să se citească drept „de acolo îl aducem aici".
      marcheaza(pas.alegere.linie, pas.alegere.coloana, "pivot");
      break;
    case "permutare":
      for (const i of pas.linii) linii[i]?.forEach((_, j) => marcheaza(i, j, "curent"));
      marcheaza(pas.p, pas.p, "pivot");
      break;
    case "eliminare":
      marcheaza(pas.p, pas.p, "pivot");
      linii[pas.linie]?.forEach((_, j) => marcheaza(pas.linie, j, "curent"));
      marcheaza(pas.linie, pas.p, "zero");
      break;
    case "substitutie":
      linii[pas.pozitie]?.forEach((_, j) => marcheaza(pas.pozitie, j, "curent"));
      marcheaza(pas.pozitie, pas.pozitie, "pivot");
      break;
  }

  return stari;
}

/** Ce se vede pe grilă, în cuvinte — pentru cine n-o vede. */
function descriereMatricei(
  pas: PasPivotare | undefined,
  total: number,
  curent: number,
): string | undefined {
  if (!pas) return undefined;
  return `Matricea la pasul ${curent + 1} din ${total}. ${pas.explicatie}`;
}

/** Soluția scrisă pe o linie, în ordinea necunoscutelor din sistemul scris. */
function incheiere(x: number[], ordine: number[]): string {
  const componente = x.map((v, i) => `x${indice(i + 1)} = ${cifra(v)}`).join(", ");
  const permutat = ordine.some((necunoscuta, pozitie) => necunoscuta !== pozitie);
  return permutat
    ? `${componente}. Coloanele au fost permutate pe parcurs, deci necunoscutele au fost puse la loc în ordinea din sistemul scris.`
    : `${componente}.`;
}

/** Legenda, alta la fiecare strategie: se schimbă chiar ce se compară. */
function legendaMetodei(strategie: Strategie): ElementLegenda[] {
  const comune: ElementLegenda[] = [
    { rol: "pivot", eticheta: "pivotul pasului", forma: "celula" },
    { rol: "curent", eticheta: "linia care se schimbă acum", forma: "celula" },
    {
      rol: "anterior",
      eticheta: "zerourile produse de eliminare",
      forma: "celula",
      explicatie: "Rămân scrise, dar se sting: nu mai intră în niciun calcul.",
    },
  ];

  if (strategie === "partiala") {
    return [
      ...comune,
      {
        rol: "anterior",
        eticheta: "scorul: elementul brut din coloană",
        forma: "punct",
        explicatie: "Se compară numai valorile absolute de sub diagonală, în coloana pasului.",
      },
    ];
  }
  if (strategie === "scalata") {
    return [
      ...comune,
      {
        rol: "anterior",
        eticheta: "scorul: elementul raportat la linia lui",
        forma: "punct",
        explicatie: "Fiecare candidat se împarte la cel mai mare coeficient de pe linia proprie.",
      },
    ];
  }
  return [
    ...comune,
    {
      rol: "anterior",
      eticheta: "scorul: cel mai mare element al liniei",
      forma: "punct",
      explicatie:
        "Căutarea trece prin toată submatricea rămasă, deci pivotul poate veni de pe altă coloană.",
    },
  ];
}

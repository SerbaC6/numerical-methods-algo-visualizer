import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";

import { ContextPlot, usePlot, type ValoareContext } from "@/components/viz/plot-context";
import { useDimensiune } from "@/hooks/use-dimensiune";
import { useVederePlot } from "@/hooks/use-vedere-plot";
import { cn } from "@/lib/utils";
import { creeazaScara, repere, type Domeniu } from "@/lib/plot-scara";

/**
 * Spațiul din jurul zonei de desen. Marginea din stânga **lipsește de aici**: se
 * calculează din cât de late sunt chiar etichetele axei verticale.
 */
const MARGINI = { sus: 14, dreapta: 20, jos: 34 } as const;

/** Cât ocupă un caracter mono de 12px. Estimare, nu măsurătoare. */
const LATIME_CARACTER = 7.2;
/** Sub atât nu coboară marginea din stânga, chiar dacă etichetele sunt „0" și „1". */
const MARGINE_STANGA_MINIMA = 36;
/** Peste atât din lățime nu urcă: pe un ecran îngust, etichetele n-au voie să înghită graficul. */
const MARGINE_STANGA_MAXIMA = 0.4;

const INALTIME_MINIMA = 180;
/**
 * Plafonul implicit al înălțimii calculate din lățime.
 *
 * E gândit pentru o figură care însoțește un text. Pe o pagină unde graficul
 * **e** conținutul, nu ilustrația lui, se ridică prin `inaltimeMaxima` — vezi
 * interfața de la ecuații neliniare, care îi dă tot ce încape pe ecran.
 */
const INALTIME_MAXIMA = 420;

/**
 * Cât spațiu se lasă între două etichete vecine, în pixeli.
 *
 * Pe orizontală etichetele stau una lângă alta și sunt late („−0,25"), deci au
 * nevoie de mai mult loc. Pe verticală sunt suprapuse și înalte de ~11px, deci
 * încap mult mai des. Cu o singură valoare pentru amândouă, ori axa de jos s-ar
 * înghesui, ori cea din stânga ar rămâne aproape goală.
 */
const SPATIU_REPER = { x: 78, y: 46 } as const;

/**
 * Axele, grila și etichetele. Se desenează automat în orice `Plot`.
 *
 * Linia de zero se trage doar dacă zeroul chiar e în domeniu — pe un grafic cu
 * `x ∈ [2, 3]` nu există axă verticală de desenat, iar una trasă la marginea
 * din stânga ar spune că acolo e originea, ceea ce e fals. Ca etichetele să
 * aibă totuși o linie de sprijin, marginile zonei sunt trasate separat, mai
 * discret.
 *
 * Numele axelor nu se desenează aici: n-ar încăpea în margine fără să se
 * lovească de etichetele de repere, iar înăuntru s-ar suprapune peste curbă.
 * Ce reprezintă axele se spune în legendă.
 */
function Axe() {
  const { x, y, zona, reperiY, latimeTotala } = usePlot();

  const latimeZona = zona.dreapta - zona.stanga;
  const reperiX = repere(x.domeniu, latimeZona, SPATIU_REPER.x);

  /**
   * Ține eticheta în cadru. Ultimul reper de pe orizontală cade la marginea
   * zonei, iar textul centrat pe el ar ieși cu jumătate din lățime în afara
   * SVG-ului. Se împinge înăuntru doar cât e nevoie, deci etichetele din
   * mijloc rămân exact sub reperul lor.
   */
  const xEticheta = (pozitie: number, eticheta: string) => {
    const jumatate = (eticheta.length * LATIME_CARACTER) / 2;
    return Math.max(jumatate + 2, Math.min(latimeTotala - jumatate - 2, pozitie));
  };

  const zeroPeX = x.domeniu[0] <= 0 && 0 <= x.domeniu[1];
  const zeroPeY = y.domeniu[0] <= 0 && 0 <= y.domeniu[1];

  return (
    // Grila și reperele sunt decor: rezumatul graficului le spune deja în
    // cuvinte, iar citite unul câte unul ar fi doar zgomot.
    <g aria-hidden="true">
      {/* Grila */}
      <g className="stroke-viz-grila" strokeWidth={1} opacity={0.55}>
        {reperiX.map((reper) => (
          <line
            key={`gx-${reper.valoare}`}
            x1={x.la(reper.valoare)}
            x2={x.la(reper.valoare)}
            y1={zona.sus}
            y2={zona.jos}
          />
        ))}
        {reperiY.map((reper) => (
          <line
            key={`gy-${reper.valoare}`}
            x1={zona.stanga}
            x2={zona.dreapta}
            y1={y.la(reper.valoare)}
            y2={y.la(reper.valoare)}
          />
        ))}
      </g>

      {/* Marginile zonei — linia de sprijin a etichetelor */}
      <g className="stroke-viz-grila" strokeWidth={1.5}>
        <line x1={zona.stanga} x2={zona.dreapta} y1={zona.jos} y2={zona.jos} />
        <line x1={zona.stanga} x2={zona.stanga} y1={zona.sus} y2={zona.jos} />
      </g>

      {/* Axele propriu-zise, doar dacă originea e în cadru */}
      <g className="stroke-text-slab" strokeWidth={1.5} opacity={0.75}>
        {zeroPeY && <line x1={zona.stanga} x2={zona.dreapta} y1={y.la(0)} y2={y.la(0)} />}
        {zeroPeX && <line x1={x.la(0)} x2={x.la(0)} y1={zona.sus} y2={zona.jos} />}
      </g>

      {/* Etichetele stau în margini, nu pe lângă axa de zero: acolo ar cădea
          peste curbă când originea e în mijlocul graficului. */}
      <g className="fill-text-slab font-mono text-[12px] tabular-nums">
        {reperiX.map((reper) => (
          <text
            key={`tx-${reper.valoare}`}
            x={xEticheta(x.la(reper.valoare), reper.eticheta)}
            y={zona.jos + 18}
            textAnchor="middle"
          >
            {reper.eticheta}
          </text>
        ))}
        {reperiY.map((reper) => (
          <text
            key={`ty-${reper.valoare}`}
            x={zona.stanga - 8}
            y={y.la(reper.valoare)}
            dy="0.32em"
            textAnchor="end"
          >
            {reper.eticheta}
          </text>
        ))}
      </g>
    </g>
  );
}

export type PlotProps = {
  domeniuX: Domeniu;
  domeniuY: Domeniu;
  /**
   * Numele graficului, citit de cititorul de ecran: „Bisecție pe f(x) = x³ − 2x − 5".
   * E obligatoriu — un desen fără nume nu se poate construi din greșeală.
   */
  rezumat: string;
  /**
   * Descrierea stării de acum: ce interval, ce punct, ce valoare. E rezumatul
   * textual cerut de Faza 9 pentru cine nu vede graficul.
   *
   * Nu repetă propoziția din `StepExplanation`, care e citită separat și se
   * anunță singură la fiecare pas: aici se descrie **desenul**, acolo se descrie
   * **pasul**.
   */
  descriere?: string;
  /** Raport lățime/înălțime, când nu se dă o înălțime fixă. */
  raport?: number;
  inaltime?: number;
  /** Cât de înalt poate ajunge graficul calculat din lățime. */
  inaltimeMaxima?: number;
  /**
   * Permite explorarea: tragere, zoom și butoanele din colț.
   *
   * Implicit e stins. Un grafic care ilustrează un pas dintr-o animație n-are
   * de ce să fie mișcat — mutat din întâmplare, ar arăta altceva decât spune
   * explicația de lângă el.
   */
  interactiv?: boolean;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Sistemul de axe în care se desenează metodele numerice.
 *
 * Desenează axele, grila și etichetele; restul vine ca straturi copil
 * (`PlotCurba`, `PlotPunct`, `PlotInterval`…), fiecare cu numele lui — nu ca
 * treizeci de proprietăți pe o componentă uriașă.
 *
 * **Nu conține matematică și nu ghicește domeniul.** Scara, reperele și
 * eșantionarea stau în `src/lib/plot-scara.ts` și `plot-esantionare.ts`, unde
 * pot fi verificate numeric; domeniul îl dă pagina. Dacă graficul și-ar deduce
 * singur încadrarea din ce desenează copiii, straturile ar trebui să se
 * înregistreze într-un efect, deci o a doua randare la fiecare pas de animație.
 *
 * Dimensiunea vine din măsurarea containerului, nu dintr-un `viewBox` care se
 * scalează: altfel etichetele axelor s-ar micșora pe telefon și s-ar umfla pe
 * ecran lat.
 */
export function Plot({
  domeniuX,
  domeniuY,
  rezumat,
  descriere,
  raport = 1.6,
  inaltime,
  inaltimeMaxima = INALTIME_MAXIMA,
  interactiv = false,
  children,
  className,
}: PlotProps) {
  const { referinta, latime } = useDimensiune<HTMLDivElement>();
  const vedere = useVederePlot(domeniuX, domeniuY);
  const idBaza = useId();
  const idTaiere = `${idBaza}-taiere`;
  const idTitlu = `${idBaza}-titlu`;
  const idDescriere = `${idBaza}-descriere`;

  const inaltimeFinala =
    inaltime ?? Math.round(Math.min(inaltimeMaxima, Math.max(INALTIME_MINIMA, latime / raport)));

  const context = useMemo<ValoareContext | null>(() => {
    if (latime <= 0) return null;

    // Ordinea contează. Axa verticală se poate așeza fără să știm marginea din
    // stânga, fiindcă întinderea ei în pixeli ține doar de înălțime. Abia după
    // ce avem reperele ei știm cât loc cer etichetele — și de-acolo iese
    // marginea, deci și axa orizontală.
    const sus = MARGINI.sus;
    const jos = inaltimeFinala - MARGINI.jos;

    // Axa verticală primește intervalul inversat, fiindcă în SVG y crește în
    // jos. Inversarea stă doar aici, nu în fiecare strat.
    const y = creeazaScara(vedere.y, [jos, sus]);
    const reperiY = repere(y.domeniu, Math.max(0, jos - sus), SPATIU_REPER.y);

    const celMaiLungReper = Math.max(0, ...reperiY.map((r) => r.eticheta.length));
    const stanga = Math.min(
      latime * MARGINE_STANGA_MAXIMA,
      Math.max(MARGINE_STANGA_MINIMA, celMaiLungReper * LATIME_CARACTER + 12),
    );

    const zona = { stanga, dreapta: latime - MARGINI.dreapta, sus, jos };

    return {
      x: creeazaScara(vedere.x, [zona.stanga, zona.dreapta]),
      y,
      zona,
      latimeTotala: latime,
      reperiY,
      idTaiere,
    };
  }, [vedere.x, vedere.y, latime, inaltimeFinala, idTaiere]);

  // ── Explorarea graficului ──────────────────────────────────────────────────
  // Degetele/cursoarele apăsate acum. Pinch-ul are nevoie de amândouă, iar un
  // `Map` ține și cazul în care un deget e ridicat înaintea celuilalt.
  const degete = useRef(new Map<number, { x: number; y: number }>());
  const distantaAnterioara = useRef<number | null>(null);
  const contextRef = useRef(context);
  contextRef.current = context;

  /** Cât înseamnă un pixel în unități de pe fiecare axă. */
  const unitatiPePixel = () => {
    const c = contextRef.current;
    if (!c) return null;
    return { x: c.x.de(1) - c.x.de(0), y: c.y.de(1) - c.y.de(0) };
  };

  const pozitieInGrafic = (e: { clientX: number; clientY: number }, tinta: Element) => {
    const cadru = tinta.getBoundingClientRect();
    return { x: e.clientX - cadru.left, y: e.clientY - cadru.top };
  };

  const zoomLaPozitie = (factor: number, pozitie: { x: number; y: number }) => {
    const c = contextRef.current;
    if (!c) return;
    vedere.zoom(factor, c.x.de(pozitie.x), c.y.de(pozitie.y));
  };

  // Roata se ascultă manual, nu prin `onWheel`: React o leagă pasiv, iar un
  // ascultător pasiv n-are voie să oprească derularea paginii. Fără asta, zoom-ul
  // ar mișca și pagina în același timp.
  const containerRef = referinta;
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !interactiv) return;

    const laRoata = (e: WheelEvent) => {
      // Numai cu Ctrl/Cmd — și gestul de „pinch" de pe trackpad, pe care
      // browserul îl trimite tot așa. Altfel, derularea peste grafic ar rămâne
      // blocată, iar pagina n-ar mai putea fi parcursă.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.002);
      zoomLaPozitie(factor, pozitieInGrafic(e, element));
    };

    element.addEventListener("wheel", laRoata, { passive: false });
    return () => element.removeEventListener("wheel", laRoata);
  });

  const laApasare = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactiv) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    degete.current.set(e.pointerId, pozitieInGrafic(e, e.currentTarget));
    distantaAnterioara.current = null;
  };

  const laMiscare = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactiv || !degete.current.has(e.pointerId)) return;
    const acum = pozitieInGrafic(e, e.currentTarget);
    const inainte = degete.current.get(e.pointerId);
    degete.current.set(e.pointerId, acum);
    if (!inainte) return;

    const unitati = unitatiPePixel();
    if (!unitati) return;

    const toate = [...degete.current.values()];
    if (toate.length >= 2) {
      // Două degete: distanța dintre ele dă factorul, mijlocul lor dă ancora.
      const [a, b] = toate as [{ x: number; y: number }, { x: number; y: number }];
      const distanta = Math.hypot(a.x - b.x, a.y - b.y);
      const precedenta = distantaAnterioara.current;
      distantaAnterioara.current = distanta;
      if (precedenta && distanta > 0) {
        zoomLaPozitie(precedenta / distanta, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
      return;
    }

    // Un deget: se trage de grafic. Conținutul merge după cursor, deci domeniul
    // se mută în sens invers.
    vedere.muta(-(acum.x - inainte.x) * unitati.x, -(acum.y - inainte.y) * unitati.y);
  };

  const laRidicare = (e: React.PointerEvent<SVGSVGElement>) => {
    degete.current.delete(e.pointerId);
    distantaAnterioara.current = null;
  };

  const laTasta = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!interactiv || !context) return;
    const pasX = (context.x.domeniu[1] - context.x.domeniu[0]) * 0.1;
    const pasY = (context.y.domeniu[1] - context.y.domeniu[0]) * 0.1;
    const mijloc = {
      x: (context.zona.stanga + context.zona.dreapta) / 2,
      y: (context.zona.sus + context.zona.jos) / 2,
    };

    const actiuni: Record<string, () => void> = {
      ArrowLeft: () => vedere.muta(-pasX, 0),
      ArrowRight: () => vedere.muta(pasX, 0),
      ArrowUp: () => vedere.muta(0, pasY),
      ArrowDown: () => vedere.muta(0, -pasY),
      "+": () => zoomLaPozitie(0.8, mijloc),
      "=": () => zoomLaPozitie(0.8, mijloc),
      "-": () => zoomLaPozitie(1.25, mijloc),
      "0": () => vedere.reseteaza(),
    };

    const actiune = actiuni[e.key];
    if (actiune) {
      e.preventDefault();
      actiune();
    }
  };

  const mijlocZonei = context
    ? {
        x: (context.zona.stanga + context.zona.dreapta) / 2,
        y: (context.zona.sus + context.zona.jos) / 2,
      }
    : { x: 0, y: 0 };

  return (
    // `min-w-0` — fără el, graficul pus într-un flex sau grid refuză să se
    // micșoreze sub lățimea conținutului și împinge pagina (aceeași capcană ca
    // la `MatrixGrid`).
    <figure className={cn("relative m-0 min-w-0", className)}>
      {interactiv && (
        // Butoanele stau peste desen, iar colțul din dreapta-sus e chiar
        // locul în care cade adesea primul punct al unei metode, cu eticheta
        // lui. Se estompează cât timp nu le atinge nimeni, ca desenul să
        // rămână citibil, și revin întregi la hover sau la focalizare de la
        // tastatură — deci nu se pierd pentru cine navighează cu Tab.
        <div className="duration-mediu ease-standard absolute top-2 right-2 z-10 flex gap-1 opacity-55 transition-opacity focus-within:opacity-100 hover:opacity-100">
          <Button
            variant="outline"
            size="icon"
            className="tinta-atingere size-8"
            aria-label="Apropie"
            onClick={() => zoomLaPozitie(0.8, mijlocZonei)}
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="tinta-atingere size-8"
            aria-label="Depărtează"
            onClick={() => zoomLaPozitie(1.25, mijlocZonei)}
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="tinta-atingere size-8"
            aria-label="Încadrează tot"
            disabled={!vedere.modificata}
            onClick={vedere.reseteaza}
          >
            <Maximize2 className="size-4" />
          </Button>
        </div>
      )}

      <div ref={referinta} className="w-full" style={{ minHeight: inaltimeFinala }}>
        {context && (
          <svg
            width={latime}
            height={inaltimeFinala}
            // `pan-y` lasă pagina să se deruleze vertical peste grafic, dar ne
            // dă nouă tragerea orizontală și gestul cu două degete. Cu `none`,
            // graficul ar bloca derularea paginii pe telefon.
            style={interactiv ? { touchAction: "pan-y" } : undefined}
            tabIndex={interactiv ? 0 : undefined}
            onPointerDown={laApasare}
            onPointerMove={laMiscare}
            onPointerUp={laRidicare}
            onPointerCancel={laRidicare}
            onKeyDown={laTasta}
            // Graficul se anunță ca **o singură imagine**. Altfel cititorul de
            // ecran ar parcurge sute de noduri fără înțeles: fiecare linie de
            // grilă, fiecare segment de curbă.
            //
            // Numele și descrierea vin din `<title>` și `<desc>`, nu dintr-un
            // `aria-label`: sunt conținut al desenului, nu un atribut lipit pe
            // el, și rămân disponibile și pentru unelte care citesc SVG-ul
            // separat de pagină.
            role="img"
            aria-labelledby={idTitlu}
            aria-describedby={descriere ? idDescriere : undefined}
            className={cn(
              // `select-none`: tragerea de pe grafic e un gest de desen, nu de
              // citit. Fără el, cursorul selectează în drum etichetele („x₀",
              // „a₀") și rămân evidențiate albastru după ce ai dat drumul.
              "block overflow-visible select-none",
              interactiv &&
                "focus-visible:ring-ring/50 cursor-grab rounded-lg focus-visible:ring-[3px] focus-visible:outline-none active:cursor-grabbing",
            )}
          >
            <title id={idTitlu}>{rezumat}</title>
            {descriere && <desc id={idDescriere}>{descriere}</desc>}

            <defs>
              <clipPath id={idTaiere}>
                <rect
                  x={context.zona.stanga}
                  y={context.zona.sus}
                  width={Math.max(0, context.zona.dreapta - context.zona.stanga)}
                  height={Math.max(0, context.zona.jos - context.zona.sus)}
                />
              </clipPath>
            </defs>

            <ContextPlot.Provider value={context}>
              <Axe />
              {children}
            </ContextPlot.Provider>
          </svg>
        )}
      </div>
    </figure>
  );
}

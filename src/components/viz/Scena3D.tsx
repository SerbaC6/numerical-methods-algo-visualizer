import { ArrowDownToLine, Rotate3d } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { ContextScena3D, type ValoareContextScena3D } from "@/components/viz/scena-3d-context";
import { useCamera3D } from "@/hooks/use-camera-3d";
import { useDimensiune } from "@/hooks/use-dimensiune";
import { creeazaProiectie, type Cutie } from "@/lib/proiectie-3d";
import { cn } from "@/lib/utils";

const INALTIME_MINIMA = 220;
const INALTIME_MAXIMA = 460;

/** Câte patrulatere pe latură are mesh-ul, după cât loc are și după ce se întâmplă. */
const REZOLUTIE = { larg: 32, ingust: 24, inMiscare: 18 } as const;
/** Sub atâta lățime scena e pe telefon: mesh mai rar, altfel se târăște. */
const PRAG_INGUST = 640;

/**
 * Cât se trage până se decide al cui e gestul. Sub atât nu se poate ști dacă
 * omul rotește scena sau derulează pagina.
 */
const PRAG_GEST = 6;

const GRAD = 180 / Math.PI;

export type Scena3DProps = {
  cutie: Cutie;
  /** Numele scenei, citit de cititorul de ecran. Obligatoriu, ca la `Plot`. */
  rezumat: string;
  /** Descrierea a ce se vede acum: unde e valea, unde a ajuns iterația. */
  descriere?: string;
  /** Înălțimea cutiei, măsurată în laturi de bază. Vezi `normalizeaza`. */
  exagerareZ?: number;
  /** Raport lățime/înălțime. ~1,5 în peisaj; pe portret se dă ~1,05. */
  raport?: number;
  /**
   * Cutia scenei se schimbă chiar acum (lupa se apropie).
   *
   * Se unește cu „e trasă cu degetul" în `inMiscare` din context, fiindcă
   * straturile au nevoie de același lucru în amândouă cazurile: poziția pe ecran
   * se schimbă din **altă** cauză decât un pas nou, deci n-are ce să interpoleze
   * și mesh-ul poate coborî la rezoluția de mișcare.
   */
  seSchimba?: boolean;
  inaltimeMaxima?: number;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Scena 3D în care se desenează valea, curbele de nivel și traseul coborârii.
 *
 * **A treia familie de piese vizuale**, lângă `Plot` (o stare) și `Clip` (un
 * film): aici desenul e o funcție de **unghiul de privire**, iar unghiul îl
 * ține utilizatorul cu degetul. Ca și `Plot`, nu conține matematică: proiecția
 * stă în [`src/lib/proiectie-3d.ts`](../../lib/proiectie-3d.ts), unde e
 * verificată numeric, iar conținutul vine ca straturi copil (`Podea3D`,
 * `Suprafata3D`, `Traiectorie3D`…).
 *
 * **Înălțimea ține cont și de containerul măsurat**, spre deosebire de `Plot`,
 * care o scoate doar din lățime. Pe telefon în peisaj lățimea e mare și
 * înălțimea mică; o scenă dimensionată doar din lățime ar ieși din ecran exact
 * în orientarea în care e cel mai puțin loc.
 */
export function Scena3D({
  cutie,
  rezumat,
  descriere,
  exagerareZ = 0.62,
  raport = 1.5,
  seSchimba = false,
  inaltimeMaxima = INALTIME_MAXIMA,
  children,
  className,
}: Scena3DProps) {
  const { referinta, latime, inaltime: inaltimeContainer } = useDimensiune<HTMLDivElement>();
  const camera = useCamera3D();
  const idBaza = useId();
  const idTaiere = `${idBaza}-taiere`;
  const idTaierePodea = `${idBaza}-taiere-podea`;
  const idTitlu = `${idBaza}-titlu`;
  const idDescriere = `${idBaza}-descriere`;

  /** Anunțul de unghi. Se scrie **doar** din tastatură — vezi mai jos. */
  const [anunt, setAnunt] = useState("");

  const dinLatime = Math.max(INALTIME_MINIMA, latime / raport);
  const inaltimeFinala = Math.round(
    Math.min(inaltimeMaxima, dinLatime, inaltimeContainer > 0 ? inaltimeContainer : dinLatime),
  );

  const inMiscare = camera.inMiscare || seSchimba;

  const rezolutieMesh = inMiscare
    ? REZOLUTIE.inMiscare
    : latime > 0 && latime < PRAG_INGUST
      ? REZOLUTIE.ingust
      : REZOLUTIE.larg;

  const context = useMemo<ValoareContextScena3D | null>(() => {
    if (latime <= 0) return null;

    // Fără margini proprii: `creeazaProiectie` lasă deja o marjă în jurul
    // scenei, tocmai ca etichetele să aibă loc.
    const zona = { stanga: 0, dreapta: latime, sus: 0, jos: inaltimeFinala };

    return {
      proiectie: creeazaProiectie(camera.camera, cutie, zona, exagerareZ),
      camera: camera.camera,
      cutie,
      zona,
      idTaiere,
      idTaierePodea,
      inMiscare,
      rezolutieMesh,
    };
  }, [
    latime,
    inaltimeFinala,
    camera.camera,
    inMiscare,
    cutie,
    exagerareZ,
    idTaiere,
    idTaierePodea,
    rezolutieMesh,
  ]);

  /**
   * Colțurile podelei, proiectate: `z = cutie.z[0]`, cele patru colțuri ale
   * bazei. Patrulaterul e **exact**, nu o aproximare — proiecția e liniară, deci
   * imaginea unui segment e un segment (vezi `proiectie-3d.ts`).
   */
  const conturPodea = useMemo(() => {
    if (!context) return "";
    const z = cutie.z[0];
    return (
      [
        { x: cutie.x[0], y: cutie.y[0], z },
        { x: cutie.x[1], y: cutie.y[0], z },
        { x: cutie.x[1], y: cutie.y[1], z },
        { x: cutie.x[0], y: cutie.y[1], z },
      ] as const
    )
      .map((p) => context.proiectie.laEcran(p))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  }, [context, cutie]);

  // ── Arbitrajul gestului ────────────────────────────────────────────────────
  // La `pointerdown` nu se revendică nimic: pe telefon, o apăsare e cel mai
  // adesea începutul unei derulări a paginii. Abia la prima mișcare peste prag
  // se decide, o singură dată pe gest: dominant orizontal → scena se rotește (și
  // de-atunci se rotesc amândouă unghiurile, inclusiv elevația); dominant
  // vertical → gestul rămâne al paginii și nu se mai revine asupra deciziei.
  const gest = useRef<{
    id: number;
    plecare: { x: number; y: number };
    ultima: { x: number; y: number };
    decizie: "nedecis" | "scena" | "pagina";
  } | null>(null);

  const laApasare = (e: React.PointerEvent<SVGSVGElement>) => {
    if (gest.current) return;
    gest.current = {
      id: e.pointerId,
      plecare: { x: e.clientX, y: e.clientY },
      ultima: { x: e.clientX, y: e.clientY },
      decizie: "nedecis",
    };
  };

  const laMiscare = (e: React.PointerEvent<SVGSVGElement>) => {
    const g = gest.current;
    if (!g || g.id !== e.pointerId) return;

    if (g.decizie === "pagina") return;

    if (g.decizie === "nedecis") {
      const dx = e.clientX - g.plecare.x;
      const dy = e.clientY - g.plecare.y;
      if (Math.hypot(dx, dy) < PRAG_GEST) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        g.decizie = "scena";
        e.currentTarget.setPointerCapture(e.pointerId);
        camera.incepeRotirea();
      } else {
        g.decizie = "pagina";
        return;
      }
    }

    camera.rotesteCuPixeli(e.clientX - g.ultima.x, e.clientY - g.ultima.y);
    g.ultima = { x: e.clientX, y: e.clientY };
  };

  const laRidicare = (e: React.PointerEvent<SVGSVGElement>) => {
    const g = gest.current;
    if (!g || g.id !== e.pointerId) return;
    if (g.decizie === "scena") camera.terminaRotirea();
    gest.current = null;
  };

  /**
   * Anunțul se face **numai** la schimbarea din tastatură.
   *
   * La tragere, unghiul se schimbă de zeci de ori pe secundă: o regiune
   * `aria-live` ar turui continuu și ar acoperi orice altceva. Cine trage vede
   * oricum scena; cine apasă săgeți are nevoie să afle unde a ajuns.
   *
   * Steagul e un `ref`, iar anunțul se scrie dintr-un efect: în chiar handlerul
   * de tastă, `camera.camera` e încă valoarea **dinaintea** apăsării, deci un
   * anunț scris acolo ar fi mereu cu un pas în urmă.
   */
  const deAnuntat = useRef(false);
  const { azimut, elevatie } = camera.camera;

  useEffect(() => {
    if (!deAnuntat.current) return;
    deAnuntat.current = false;
    setAnunt(
      `Azimut ${Math.round(azimut * GRAD)} de grade, ` +
        `elevație ${Math.round(elevatie * GRAD)} de grade.`,
    );
  }, [azimut, elevatie]);

  const laTasta = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const pas = e.shiftKey ? camera.pasTasta.mare : camera.pasTasta.normal;

    const cuSteag = (rotire: () => void) => () => {
      deAnuntat.current = true;
      rotire();
    };

    // Revenirea la un unghi gata făcut se anunță **direct**: e animată, deci
    // efectul de mai sus ar prinde primul cadru al drumului, nu destinația.
    const laUnghi = (tinta: { azimut: number; elevatie: number }) => () => {
      camera.mergiLa(tinta);
      setAnunt(
        `Azimut ${Math.round(tinta.azimut * GRAD)} de grade, ` +
          `elevație ${Math.round(tinta.elevatie * GRAD)} de grade.`,
      );
    };

    const actiuni: Record<string, () => void> = {
      ArrowLeft: cuSteag(() => camera.rotesteCuUnghi(-pas, 0)),
      ArrowRight: cuSteag(() => camera.rotesteCuUnghi(pas, 0)),
      ArrowUp: cuSteag(() => camera.rotesteCuUnghi(0, pas)),
      ArrowDown: cuSteag(() => camera.rotesteCuUnghi(0, -pas)),
      "0": laUnghi(camera.unghiuriGata.implicit),
      "1": laUnghi(camera.unghiuriGata.deSus),
    };

    const actiune = actiuni[e.key];
    if (!actiune) return;
    e.preventDefault();
    actiune();
  };

  return (
    // `min-w-0` — fără el, scena pusă într-un flex sau grid refuză să se
    // micșoreze sub lățimea conținutului și împinge pagina.
    <figure className={cn("relative m-0 h-full min-w-0", className)}>
      {/* Spre deosebire de butoanele lui `Plot`, astea **nu** se estompează
          până la hover. Pe atingere nu există hover, iar ridicarea privirii nu
          se poate descoperi cu degetul: dacă butonul nu se vede, unghiul de sus
          — singurul din care unghiul drept dintre doi pași se citește corect —
          rămâne negăsit. */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="tinta-atingere size-8"
          aria-label="Unghi implicit"
          onClick={() => camera.mergiLa(camera.unghiuriGata.implicit)}
        >
          <Rotate3d className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="tinta-atingere size-8"
          aria-label="Privește de sus"
          disabled={camera.estePrivireDeSus}
          onClick={() => camera.mergiLa(camera.unghiuriGata.deSus)}
        >
          <ArrowDownToLine className="size-4" />
        </Button>
      </div>

      <div ref={referinta} className="h-full w-full" style={{ minHeight: INALTIME_MINIMA }}>
        {context && (
          <svg
            width={latime}
            height={inaltimeFinala}
            // `pan-y` lasă pagina să se deruleze vertical peste scenă; rotirea
            // e revendicată explicit, abia după arbitrajul de mai sus.
            style={{ touchAction: "pan-y" }}
            tabIndex={0}
            onPointerDown={laApasare}
            onPointerMove={laMiscare}
            onPointerUp={laRidicare}
            onPointerCancel={laRidicare}
            onKeyDown={laTasta}
            // Scena se anunță ca **o singură imagine**: altfel cititorul de ecran
            // ar parcurge o mie de patrulatere fără niciun înțeles.
            role="img"
            aria-labelledby={idTitlu}
            aria-describedby={descriere ? idDescriere : undefined}
            className="focus-visible:ring-ring/50 block cursor-grab overflow-visible rounded-lg focus-visible:ring-[3px] focus-visible:outline-none active:cursor-grabbing"
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
              <clipPath id={idTaierePodea}>
                <polygon points={conturPodea} />
              </clipPath>
            </defs>

            <ContextScena3D.Provider value={context}>{children}</ContextScena3D.Provider>
          </svg>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {anunt}
      </p>
    </figure>
  );
}

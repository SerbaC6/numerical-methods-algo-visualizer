import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ContextClip, type StareClip } from "@/components/viz/clip-context";
import { PlaybackClip } from "@/components/viz/PlaybackClip";
import { repere, type Scena } from "@/lib/compozitie";
import type { Viteza } from "@/lib/playback";
import { cn } from "@/lib/utils";

export type ClipProps = {
  scene: readonly Scena[];
  /** Ce e clipul, pentru cititorul de ecran — înlocuiește imaginea în cuvinte. */
  descriere: string;
  /**
   * Cadrul arătat când utilizatorul cere mișcare redusă, în secunde. Se alege
   * un moment care spune singur povestea, fiindcă s-ar putea să fie tot ce
   * vede omul din clip.
   */
  timpStatic?: number;
  className?: string;
  children: React.ReactNode;
};

/** Câte secunde de clip trec într-o secundă reală, la viteza 1×. */
const VITEZA_BAZA = 1;

/**
 * Un clip animat: ceasul, cadrul în care se desenează și bara de derulare.
 *
 * **Modelul.** Clipul e un singur arbore de elemente, randat ca funcție pură de
 * timpul autorat `T`. Nimic nu se montează la granița dintre scene, deci un
 * element poate traversa granița prin interpolare simplă (vezi
 * `src/lib/compozitie.ts`). Componenta asta nu știe nimic despre ce se
 * desenează — exact ca restul pieselor din `viz/`, primește doar cadrul și
 * ceasul.
 *
 * **Mișcare redusă.** `MotionConfig reducedMotion="user"` din `main.tsx`
 * acoperă animațiile lui `motion`, iar regula din `index.css` taie duratele
 * CSS; peste un `requestAnimationFrame` propriu n-are putere niciuna. De aceea
 * preferința se citește aici, explicit: clipul nu pornește singur și se
 * așază pe cadrul din `timpStatic`. Butonul de redare rămâne funcțional —
 * cine vrea mișcarea o poate cere.
 */
export function Clip({ scene, descriere, timpStatic, className, children }: ClipProps) {
  const { cue, total } = useMemo(() => repere(scene), [scene]);

  const miscareRedusa = useMiscareRedusa();
  const cadruStatic = Math.min(timpStatic ?? total, total);

  const [T, setT] = useState(0);
  const [ruleaza, setRuleaza] = useState(false);
  const [viteza, setViteza] = useState<Viteza>(1);
  /** Utilizatorul a atins comenzile? Atunci nu mai pornim și nu mai oprim noi. */
  const atins = useRef(false);

  // Preferința se poate schimba în timpul vizitei (utilizatorul o comută din
  // sistem), iar atunci clipul trebuie să se oprească pe cadrul static — nu să
  // rămână alergând fiindcă pornise înainte.
  useEffect(() => {
    if (!miscareRedusa) return;
    setRuleaza(false);
    setT(cadruStatic);
  }, [miscareRedusa, cadruStatic]);

  // Ceasul. Pasul se ia din diferența dintre cadre, nu din numărul lor: pe un
  // ecran la 120 Hz clipul ar merge de două ori mai repede.
  useEffect(() => {
    if (!ruleaza) return;

    let cadru = 0;
    let anterior: number | null = null;

    const pas = (acum: number) => {
      const delta = anterior === null ? 0 : (acum - anterior) / 1000;
      anterior = acum;
      setT((t) => {
        const urmator = t + delta * VITEZA_BAZA * viteza;
        if (urmator >= total) {
          setRuleaza(false);
          return total;
        }
        return urmator;
      });
      cadru = window.requestAnimationFrame(pas);
    };

    cadru = window.requestAnimationFrame(pas);
    return () => window.cancelAnimationFrame(cadru);
  }, [ruleaza, viteza, total]);

  // Pornirea la intrarea în cadru. Un clip care rulează sub linia de plutire
  // s-ar termina până ajunge cititorul la el, iar `requestAnimationFrame`-ul ar
  // arde bateria degeaba. Pornim o singură dată și doar dacă utilizatorul n-a
  // apucat să atingă comenzile.
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (miscareRedusa) return;
    const el = container.current;
    if (!el) return;

    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          if (!intrare.isIntersecting || atins.current) continue;
          setRuleaza(true);
          observator.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observator.observe(el);
    return () => observator.disconnect();
  }, [miscareRedusa]);

  const cauta = useCallback((secunda: number) => {
    atins.current = true;
    setT(secunda);
  }, []);

  const porneste = useCallback(
    (vrea: boolean) => {
      atins.current = true;
      // Play la finalul clipului înseamnă „încă o dată", nu „mergi mai departe
      // de la ultimul cadru", unde n-ar mai fi nimic de mers.
      if (vrea && T >= total) setT(0);
      setRuleaza(vrea);
    },
    [T, total],
  );

  const [latime, setLatime] = useState(0);
  const cadru = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = cadru.current;
    if (!el) return;
    const observator = new ResizeObserver(([intrare]) => {
      const masurata = intrare?.contentRect.width;
      if (masurata) setLatime(masurata);
    });
    observator.observe(el);
    return () => observator.disconnect();
  }, []);

  const { plinEcran, comutaPlinEcran } = usePlinEcran(container);

  const stare = useMemo<StareClip>(
    () => ({ T, cue, total, ruleaza, latime }),
    [T, cue, total, ruleaza, latime],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        plinEcran && "bg-fundal fixed inset-0 z-50 justify-center p-4",
        className,
      )}
      ref={container}
    >
      <ContextClip.Provider value={stare}>
        <figure className={cn("m-0", plinEcran && "flex min-h-0 flex-1 items-center")}>
          {/* `@container`: textele din desen și din subtitrări se scalează după
              lățimea cadrului, nu după cea a ferestrei — altfel pe telefon, în
              peisaj, ar fi ilizibile.

              Pe tot ecranul, cadrul renunță la 16:9 și ia toată suprafața: SVG-ul
              dinăuntru are `preserveAspectRatio` implicit, deci desenul rămâne
              nedeformat și doar se centrează, pe același fundal ca pagina. */}
          <div
            ref={cadru}
            role="img"
            aria-label={descriere}
            className={cn(
              "border-bordura bg-fundal shadow-jos @container relative w-full overflow-hidden rounded-xl border",
              plinEcran ? "h-full" : "aspect-video",
            )}
          >
            {children}
          </div>
        </figure>
      </ContextClip.Provider>

      <PlaybackClip
        timp={T}
        total={total}
        ruleaza={ruleaza}
        viteza={viteza}
        onTimp={cauta}
        onRuleazaChange={porneste}
        onVitezaChange={(v) => {
          atins.current = true;
          setViteza(v);
        }}
        plinEcran={plinEcran}
        onPlinEcran={comutaPlinEcran}
      />
    </div>
  );
}

/**
 * Clipul pe tot ecranul, cu comenzile lui cu tot.
 *
 * Se cere întâi ecranul complet al browserului; dacă nu se poate — pe iPhone,
 * `requestFullscreen` nu există pentru elemente obișnuite, doar pentru `<video>`
 * — rămâne varianta din CSS, un strat fix peste pagină. De aceea starea e ținută
 * aici, nu citită din `document.fullscreenElement`: altfel butonul n-ar face
 * nimic exact pe telefoanele unde e cel mai util.
 */
function usePlinEcran(element: React.RefObject<HTMLElement | null>) {
  const [plinEcran, setPlinEcran] = useState(false);

  // Ieșirea din ecranul complet al browserului (Escape, gestul de sistem) nu
  // trece prin butonul nostru, deci starea se sincronizează de la eveniment.
  useEffect(() => {
    const asculta = () => {
      if (!document.fullscreenElement) setPlinEcran(false);
    };
    document.addEventListener("fullscreenchange", asculta);
    return () => document.removeEventListener("fullscreenchange", asculta);
  }, []);

  const iesi = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    setPlinEcran(false);
  }, []);

  // Escape închide și varianta din CSS, unde browserul n-are ce să închidă.
  useEffect(() => {
    if (!plinEcran) return;
    const asculta = (e: KeyboardEvent) => {
      if (e.key === "Escape") iesi();
    };
    window.addEventListener("keydown", asculta);
    return () => window.removeEventListener("keydown", asculta);
  }, [plinEcran, iesi]);

  const comutaPlinEcran = useCallback(() => {
    if (plinEcran) {
      iesi();
      return;
    }
    setPlinEcran(true);
    const el = element.current;
    if (!el) return;
    try {
      void el.requestFullscreen().catch(() => undefined);
    } catch {
      // Rămâne stratul din CSS.
    }
  }, [plinEcran, iesi, element]);

  return { plinEcran, comutaPlinEcran };
}

/** `prefers-reduced-motion: reduce`, urmărit și după prima randare. */
function useMiscareRedusa(): boolean {
  const [redusa, setRedusa] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRedusa(media.matches);
    const asculta = (e: MediaQueryListEvent) => setRedusa(e.matches);
    media.addEventListener("change", asculta);
    return () => media.removeEventListener("change", asculta);
  }, []);

  return redusa;
}

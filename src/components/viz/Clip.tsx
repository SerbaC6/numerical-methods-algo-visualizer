import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ContextClip, type StareClip } from "@/components/viz/clip-context";
import { PlaybackClip } from "@/components/viz/PlaybackClip";
import { BANDA_SUBTITRARE } from "@/components/viz/Subtitrari";
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

/** Cât sare o apăsare de săgeată, în secunde de clip. */
const PAS_SAGEATA = 1;

/**
 * Cât din înălțimea cadrului trebuie să se vadă ca tastele să fie ale lui.
 * Peste jumătate nu pot fi două clipuri deodată, deci pragul e și regula care
 * spune care dintre ele ascultă.
 */
const PRAG_PRIM_PLAN = 0.5;

/** Cadrul e „în față"? Se măsoară la apăsarea tastei, nu se ține minte. */
function inPrimPlan(el: HTMLElement | null): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const vazut = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return r.height > 0 && vazut / r.height >= PRAG_PRIM_PLAN;
}

/**
 * Unde rămăsese fiecare clip, ca să nu se reia de la zero când te întorci pe
 * pagină.
 *
 * E o hartă în memorie, nu `localStorage` și nici `sessionStorage`: singura
 * scriere pe disc de pe site rămâne preferința de temă (vezi CLAUDE.md).
 * Harta ține exact cât ține fila deschisă, adică exact cât durează plimbarea
 * dintre pagini care a pornit cerința — la reîncărcare, clipul chiar pornește
 * de la început.
 *
 * Cheia e lista numelor de scene: e unică pe clip și nu cere un `id` scris de
 * mână la fiecare folosire, care s-ar putea dubla din greșeală.
 */
const pozitii = new Map<string, { T: number; atins: boolean }>();

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

  const cheie = useMemo(() => scene.map((s) => s.nume).join("|"), [scene]);
  const reluat = pozitii.get(cheie);

  const [T, setT] = useState(reluat?.T ?? 0);
  const [ruleaza, setRuleaza] = useState(false);
  const [viteza, setViteza] = useState<Viteza>(1);
  /** Utilizatorul a atins comenzile? Atunci nu mai pornim și nu mai oprim noi. */
  const atins = useRef(reluat?.atins ?? false);

  // Poziția se scrie la fiecare cadru, nu la demontare: pe schimbarea de rută,
  // efectul de curățare vede uneori un `T` vechi de un cadru, iar aici tocmai
  // ultimul cadru contează.
  useEffect(() => {
    pozitii.set(cheie, { T, atins: atins.current });
  }, [cheie, T]);

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

  const sari = useCallback(
    (secunde: number) => {
      atins.current = true;
      setT((t) => Math.min(Math.max(t + secunde, 0), total));
    },
    [total],
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

  // Tastatura: bara de spațiu dă pauză, săgețile derulează.
  //
  // Ascultătorul stă pe fereastră, nu pe cadru, fiindcă cerința era chiar „cât
  // am clipul în față" — nu „după ce dau un clic pe el". Ca să nu se comande
  // două clipuri deodată, tasta e a clipului doar dacă i se vede peste
  // jumătate din cadru; se măsoară pe loc, cu `getBoundingClientRect`, fiindcă
  // un `IntersectionObserver` raportează 0 pe filă ascunsă și ar lăsa tastele
  // moarte la întoarcerea pe filă, până la primul derulaj.
  const laTasta = useCallback(
    (e: KeyboardEvent) => {
      if (!inPrimPlan(cadru.current)) return;

      // Pe un buton, pe slider sau într-un câmp, tastele au deja înțelesul lor.
      const tinta = e.target instanceof HTMLElement ? e.target : null;
      if (tinta?.closest("button, input, textarea, select, [role='slider'], [contenteditable]")) {
        return;
      }

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        porneste(!ruleaza);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        sari(PAS_SAGEATA);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        sari(-PAS_SAGEATA);
      }
      // `Home` și `End` rămân ale paginii: pe un ascultător global ar face
      // clipul să fure saltul în capul sau în josul documentului.
    },
    [porneste, ruleaza, sari],
  );

  useEffect(() => {
    window.addEventListener("keydown", laTasta);
    return () => window.removeEventListener("keydown", laTasta);
  }, [laTasta]);

  const { plinEcran, comutaPlinEcran } = usePlinEcran(container);

  // Bara de comenzi în peisaj. Pe telefon culcat, cadrul are ~330 px pe
  // înălțime, iar bara mânca aproape un sfert din ei — exact orientarea în care
  // desenul are cel mai mult de câștigat. Acolo bara se dă la o parte, iar un
  // dublu-clic pe cadru o aduce înapoi (și o ascunde iar). În portret nu se
  // ascunde niciodată.
  const peisajStramt = usePeisajStramt();
  const [baraCeruta, setBaraCeruta] = useState(false);
  // Întoarcerea în portret e chiar cererea din caiet: bara „revine în portret".
  useEffect(() => {
    if (!peisajStramt) setBaraCeruta(false);
  }, [peisajStramt]);
  const baraVizibila = !peisajStramt || baraCeruta;

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
      aria-keyshortcuts="Space ArrowLeft ArrowRight"
    >
      <ContextClip.Provider value={stare}>
        {/* `@container` stă pe `figure`, nu pe cadru: textele din desen și din
            subtitrări se scalează după lățimea cadrului, nu după cea a
            ferestrei — altfel pe telefon, în peisaj, ar fi ilizibile. Lățimea e
            aceeași la amândouă (cadrul e `w-full`), dar unitățile `cq*` se
            măsoară întotdeauna față de un **strămoș**, deci cadrul nu-și poate
            citi propria lățime ca să-și calculeze rezerva de mai jos. */}
        <figure className={cn("@container m-0", plinEcran && "flex min-h-0 flex-1 items-center")}>
          {/* Pe tot ecranul, cadrul renunță la 16:9 și ia toată suprafața:
              SVG-ul dinăuntru are `preserveAspectRatio` implicit, deci desenul
              rămâne nedeformat și doar se centrează, pe același fundal ca
              pagina.

              `paddingBottom` e rezerva subtitrării, și e zero pe orice cadru mai
              lat de ~674px. Sub prag, corpul literei se oprește la podeaua lui
              (altfel ar ajunge la 6px) și banda ar crește peste desen; atunci
              cadrul îi dă înălțimea cerută, iar SVG-ul se micșorează cu ea.
              Subtitrarea e poziționată pe `bottom-0`, adică pe marginea cutiei
              de padding, deci rămâne exact în banda eliberată. */}
          <div
            ref={cadru}
            role="img"
            aria-label={descriere}
            onDoubleClick={() => peisajStramt && setBaraCeruta((v) => !v)}
            style={{ paddingBottom: BANDA_SUBTITRARE }}
            className={cn(
              "border-bordura bg-fundal shadow-jos relative w-full overflow-hidden rounded-xl border",
              plinEcran ? "h-full" : "aspect-video",
            )}
          >
            {children}
          </div>
        </figure>
      </ContextClip.Provider>

      {/* Ascunsă, nu demontată: `hidden` o scoate și din ordinea de tabulare și
          din cititorul de ecran, iar la întoarcere nu se pierde nimic. */}
      <PlaybackClip
        hidden={!baraVizibila}
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

/**
 * Ecran culcat și scund — adică un telefon în peisaj, nu un monitor.
 *
 * Pragul de înălțime e cel care desparte cele două: fără el, orice laptop ar
 * intra în regula asta, fiindcă și el e „landscape".
 */
function usePeisajStramt(): boolean {
  return useMedia("(orientation: landscape) and (max-height: 600px)");
}

/** `prefers-reduced-motion: reduce`, urmărit și după prima randare. */
function useMiscareRedusa(): boolean {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/**
 * O interogare media urmărită și după prima randare.
 *
 * Pornește pe `false` și se măsoară în efect, nu la randare: pe server-ul de
 * dezvoltare și la prima trecere `window.matchMedia` ar da un rezultat care nu
 * se potrivește cu HTML-ul deja trimis.
 */
function useMedia(interogare: string): boolean {
  const [potrivit, setPotrivit] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(interogare);
    setPotrivit(media.matches);
    const asculta = (e: MediaQueryListEvent) => setPotrivit(e.matches);
    media.addEventListener("change", asculta);
    return () => media.removeEventListener("change", asculta);
  }, [interogare]);

  return potrivit;
}

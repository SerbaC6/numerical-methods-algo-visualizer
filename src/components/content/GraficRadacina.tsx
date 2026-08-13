import { useMemo, useRef } from "react";

import type { PasRadacina } from "@/algorithms/tipuri";
import { Plot } from "@/components/viz/Plot";
import { PlotCurba } from "@/components/viz/PlotCurba";
import { PlotDreapta } from "@/components/viz/PlotDreapta";
import { PlotInterval } from "@/components/viz/PlotInterval";
import { PlotPanta } from "@/components/viz/PlotPanta";
import { PlotPunct } from "@/components/viz/PlotPunct";
import { PlotTaietura } from "@/components/viz/PlotTaietura";
import { useDomeniuAnimat } from "@/hooks/use-domeniu-animat";
import { zecimale, zecimaleUtile } from "@/lib/numere";
import { esantioneaza, sparge } from "@/lib/plot-esantionare";
import { incadreaza, type Domeniu } from "@/lib/plot-scara";
import { urmareste } from "@/lib/plot-urmarire";

export type GraficRadacinaProps = {
  /** Curba desenată. Nu e mereu `f`: la puncte fixe e `g(x) − x`, vezi metoda. */
  curba: (x: number) => number;
  /** Cum se numește curba în rezumatul citit de cititorul de ecran. */
  etichetaCurba: string;
  /** Domeniul pe care funcția chiar există (ln nu are valori sub zero). */
  domeniuValid?: readonly [number, number];
  pasi: PasRadacina[];
  /** Pasul afișat acum, 0-indexat. */
  pasCurent: number;
  /** Zona de la care pornește încadrarea — intervalul, sau punctele de pornire. */
  incadrareInitiala: readonly [number, number];
  /** Raport lățime/înălțime; sub el, graficul se înalță cât îi dă pagina voie. */
  raport?: number;
  inaltimeMaxima?: number;
  className?: string;
};

/** Câte iterații anterioare rămân pe desen, tot mai șterse. */
const URME = 6;

/** Cât se lasă liber în jurul zonei de pornire, ca paranteza să nu stea pe ramă. */
const MARJA_INCADRARE = 0.08;

/**
 * Desenul unei metode de căutare a rădăcinii: curba, zona cercetată acum,
 * dreapta de construcție și punctele calculate.
 *
 * **Nu conține matematică.** Primește `pasi[]` gata calculați din
 * `src/algorithms/` și doar îi așază pe axe — regula de separare din
 * `CLAUDE.md`. Nici nu știe ce metodă rulează: citește din datele pasului ce
 * are de desenat. Un pas cu `interval` primește bandă, unul cu `xPenultim`
 * primește secantă, unul doar cu `panta` primește tangentă.
 *
 * ## Încadrarea
 *
 * Cadrul pornește din zona inițială și **stă pe loc cât timp are sens**, ca să
 * se vadă că intervalul se strânge — asta e chiar ideea bisecției. Când zona
 * devine prea îngustă ca să mai fie vizibilă, cadrul se apropie o treaptă
 * (`plot-urmarire.ts`) și micșorarea reîncepe de sus. Fără asta, după opt pași
 * banda are sub trei pixeli și animația pare oprită, deși metoda lucrează.
 *
 * Apropierea e glisată, nu tăiată (`useDomeniuAnimat`), altfel ochiul pierde
 * legătura dintre cadrul dinainte și cel de după.
 *
 * Graficul rămâne și **explorabil cu mâna**: roată cu Ctrl, tragere, două
 * degete. Din clipa în care utilizatorul mișcă ceva, vederea lui are întâietate
 * asupra lupei automate — butonul „Încadrează tot" o dă înapoi.
 */
export function GraficRadacina({
  curba,
  etichetaCurba,
  domeniuValid,
  pasi,
  pasCurent,
  incadrareInitiala,
  raport = 1.55,
  inaltimeMaxima = 420,
  className,
}: GraficRadacinaProps) {
  const pas = pasi[pasCurent];

  // Încadrarea de pornire: se calculează o singură dată, din zona inițială.
  const domeniuBaza = useMemo<Domeniu>(() => {
    const [a, b] = incadrareInitiala;
    const latime = Math.abs(b - a) || 1;
    const brut: Domeniu = [
      Math.min(a, b) - latime * MARJA_INCADRARE,
      Math.max(a, b) + latime * MARJA_INCADRARE,
    ];
    return domeniuValid
      ? [Math.max(brut[0], domeniuValid[0]), Math.min(brut[1], domeniuValid[1])]
      : brut;
  }, [incadrareInitiala, domeniuValid]);

  // Ultima zonă nedegenerată. Când metoda nimerește rădăcina exact, zona se
  // strânge într-un punct și n-are lățime din care să iasă un nivel de
  // apropiere; atunci cadrul rămâne cel de la pasul dinainte.
  // Ținta: unde ajunge metoda la ultimul pas calculat. Fără ea, lupa s-ar
  // strânge pe primul salt și ar arăta o bucată de curbă din care nu se vede
  // încotro se merge — la tangentă, exact greșeala: primul salt e mic față de
  // tot drumul, deci cadrul ar sări de la început la o mărire de patru ori.
  const tinta = pasi.at(-1)?.x;
  const zonaPas = zonaPasului(pas, tinta);
  const ultimaZona = useRef<readonly [number, number] | null>(null);
  if (zonaPas) ultimaZona.current = zonaPas;
  const [zonaMin, zonaMax] = zonaPas ?? ultimaZona.current ?? incadrareInitiala;

  const tintaX = useMemo(
    () => urmareste(domeniuBaza, [zonaMin, zonaMax], domeniuValid).domeniu,
    [domeniuBaza, zonaMin, zonaMax, domeniuValid],
  );

  // Verticala se recalculează din cadrul orizontal curent: apropiindu-ne de
  // rădăcină, valorile funcției devin minuscule, iar pe scara inițială curba ar
  // fi o linie dreaptă lipită de axă.
  const tintaY = useMemo<Domeniu>(() => {
    const valori = esantioneaza(curba, tintaX, 200)
      .map((p) => p.y)
      .filter((y) => Number.isFinite(y));
    const incadrat = incadreaza(valori, 0.12);
    // Zeroul trebuie să rămână în cadru: rădăcina e chiar tăietura cu axa.
    return [Math.min(incadrat[0], 0), Math.max(incadrat[1], 0)];
  }, [curba, tintaX]);

  const domeniuX = useDomeniuAnimat(tintaX);
  const domeniuY = useDomeniuAnimat(tintaY);

  const segmente = useMemo(() => {
    const puncte = esantioneaza(curba, domeniuX, 260);
    return sparge(puncte, { inaltimeVizibila: domeniuY[1] - domeniuY[0] });
  }, [curba, domeniuX, domeniuY]);

  // Punctele prin care trece dreapta de construcție se desenează separat, cu
  // numele lor. Ele sunt însă și ultimele iterații, deci ar apărea a doua oară
  // în coada de urme — cu contur dublu, citit ca două iterații suprapuse.
  // Secanta are **două** astfel de puncte, nu unul, de-aia se filtrează după
  // valoare și nu se taie pur și simplu ultimul element.
  const sprijine = [pas?.xAnterior, pas?.xPenultim].filter((v) => v !== undefined);
  const anterioare = pasi
    .slice(Math.max(0, pasCurent - URME), pasCurent)
    .filter((p) => !sprijine.includes(p.x));

  return (
    <Plot
      domeniuX={domeniuX}
      domeniuY={domeniuY}
      raport={raport}
      inaltimeMaxima={inaltimeMaxima}
      className={className}
      interactiv
      rezumat={`Căutarea rădăcinii pentru ${etichetaCurba}`}
      descriere={descrie(pas, pasi.length)}
    >
      {/* Ordinea straturilor e ordinea de desenare: zona evidențiată dedesubt,
          apoi dreapta de construcție, apoi curba, apoi punctele peste ea. */}
      {pas?.interval && (
        <PlotInterval
          de={pas.interval.a}
          la={pas.interval.b}
          etichetaDe="a"
          etichetaLa="b"
          // Precizia urmează lupa: cu trei zecimale fixe, după cincisprezece
          // înjumătățiri capetele s-ar scrie amândouă „2,095".
          eticheta={etichetaIntervalului(pas.interval.a, pas.interval.b)}
        />
      )}

      {pas && <DreaptaConstructiei pas={pas} curba={curba} />}
      {pas && <PantaConstructiei pas={pas} curba={curba} />}

      <PlotCurba segmente={segmente} halou />

      {/* Punctele de sprijin ale dreptei: de-aici pleacă tangenta sau secanta.
          Fără ele se vede o dreaptă venită de nicăieri.

          **Amândouă poartă nume.** Secanta trece prin două puncte, iar dacă
          doar unul e etichetat, desenul arată ca și cum dreapta ar fi definită
          de un singur punct — adică exact confuzia dintre secantă și tangentă.
          La secantă se citește deci `x₀`, `x₁` și `x₂`, cum le numește și
          formula de dedesubt. */}
      {pas?.xPenultim !== undefined && (
        <PlotPunct
          x={pas.xPenultim}
          y={curba(pas.xPenultim)}
          rol="anterior"
          raza={6}
          eticheta={`x${indice(pas.indice - 2)}`}
        />
      )}
      {pas?.xAnterior !== undefined && pas.interval === undefined && (
        <PlotPunct
          x={pas.xAnterior}
          y={curba(pas.xAnterior)}
          rol="anterior"
          raza={6}
          eticheta={`x${indice(pas.indice - 1)}`}
        />
      )}

      {/* Iterațiile dinainte, tot mai șterse pe măsură ce se depărtează: se
          vede drumul, nu doar poziția de acum. */}
      {anterioare.map((p, i) => (
        <PlotPunct
          key={p.iteratie}
          x={p.x}
          y={p.fx}
          rol="anterior"
          raza={5}
          opacitate={0.25 + (0.45 * (i + 1)) / anterioare.length}
        />
      ))}

      {pas && <PlotPunct x={pas.x} y={pas.fx} rol="curent" proiectie />}

      {/* Tăietura cu axa se desenează ultima, peste tot restul: la tangentă și
          la secantă ea **e** rezultatul pasului, iar numele valorii găsite stă
          acolo, nu lângă punctul de pe curbă. */}
      {pas && <PlotTaietura x={pas.x} rol="curent" eticheta={`x${indice(pas.indice)}`} />}
    </Plot>
  );
}

/**
 * Dreapta pe care metoda o folosește ca să găsească pasul următor.
 *
 * Se alege după ce **conține pasul**, nu după numele metodei: două puncte de
 * sprijin înseamnă secantă, un punct și o pantă înseamnă tangentă. Așa desenul
 * nu trebuie să afle niciodată ce algoritm rulează.
 */
function DreaptaConstructiei({ pas, curba }: { pas: PasRadacina; curba: (x: number) => number }) {
  if (pas.xPenultim !== undefined && pas.xAnterior !== undefined) {
    return (
      <PlotDreapta
        intre={[
          { x: pas.xPenultim, y: curba(pas.xPenultim) },
          { x: pas.xAnterior, y: curba(pas.xAnterior) },
        ]}
        rol="anterior"
        punctata
      />
    );
  }

  if (pas.panta !== undefined && pas.xAnterior !== undefined) {
    return (
      <PlotDreapta
        prin={{ x: pas.xAnterior, y: curba(pas.xAnterior) }}
        panta={pas.panta}
        rol="anterior"
        punctata
      />
    );
  }

  return null;
}

/**
 * Triunghiul care arată de unde vine panta scrisă în explicație.
 *
 * Catetele nu sunt alese ca să arate bine — sunt chiar mărimile din formula
 * fiecărei metode:
 *
 * - la **secantă**, între cele două puncte de sprijin: orizontala e
 *   `xₙ₋₁ − xₙ₋₂`, verticala e `f(xₙ₋₁) − f(xₙ₋₂)`, adică exact numitorul și
 *   paranteza aprinse în formulă;
 * - la **tangentă**, între punctul de sprijin și tăietura cu axa: orizontala e
 *   saltul făcut, `xₙ − xₙ₋₁`, verticala e `f(xₙ₋₁)`. Raportul lor e panta, iar
 *   rescris dă chiar `xₙ = xₙ₋₁ − f(xₙ₋₁)/f′(xₙ₋₁)`.
 *
 * Metodele fără dreaptă de construcție — bisecția, punctele fixe — n-au pantă
 * și nu primesc triunghi.
 */
function PantaConstructiei({ pas, curba }: { pas: PasRadacina; curba: (x: number) => number }) {
  if (pas.panta === undefined || pas.xAnterior === undefined) return null;

  const eticheta = `panta ${zecimale(pas.panta, 4)}`;

  if (pas.xPenultim !== undefined) {
    return (
      <PlotPanta
        de={{ x: pas.xPenultim, y: curba(pas.xPenultim) }}
        la={{ x: pas.xAnterior, y: curba(pas.xAnterior) }}
        eticheta={eticheta}
      />
    );
  }

  return (
    <PlotPanta
      de={{ x: pas.xAnterior, y: curba(pas.xAnterior) }}
      la={{ x: pas.x, y: 0 }}
      eticheta={eticheta}
    />
  );
}

/**
 * Zona pe care metoda o cercetează la pasul curent, sau `null` dacă e un punct.
 *
 * La bisecție e chiar intervalul. La celelalte e saltul făcut acum **plus
 * ținta**: cât drum a rămas până la răspuns. Așa cadrul rămâne larg cât timp
 * metoda e departe și se strânge pe măsură ce se apropie — adică arată exact
 * progresul, nu doar ultimul pas.
 */
function zonaPasului(
  pas: PasRadacina | undefined,
  tinta?: number,
): readonly [number, number] | null {
  if (!pas) return null;
  if (pas.interval) return [pas.interval.a, pas.interval.b];

  const puncte = [pas.x, pas.xAnterior, pas.xPenultim, tinta].filter(
    (v): v is number => v !== undefined && Number.isFinite(v),
  );
  if (puncte.length === 0) return null;

  const min = Math.min(...puncte);
  const max = Math.max(...puncte);
  return max > min ? [min, max] : null;
}

/** Rezumatul citit de cititorul de ecran: ce se vede acum pe desen. */
function descrie(pas: PasRadacina | undefined, total: number): string {
  if (!pas) return "Nu s-a calculat încă niciun pas.";
  const cifre = pas.interval ? zecimaleUtile(pas.interval.b - pas.interval.a) : 6;
  const interval = pas.interval
    ? ` Intervalul e de la ${zecimale(pas.interval.a, cifre)} la ${zecimale(pas.interval.b, cifre)}.`
    : "";
  return (
    `Pasul ${pas.iteratie} din ${total}.${interval}` +
    ` Aproximarea curentă e ${zecimale(pas.x, 6)}, unde curba ia valoarea ${zecimale(pas.fx, 6)}.`
  );
}

/** `[2,0945511 ; 2,0945664]` — cu atâtea zecimale câte cer capetele. */
function etichetaIntervalului(a: number, b: number): string {
  const cifre = zecimaleUtile(b - a);
  return `[${zecimale(a, cifre)} ; ${zecimale(b, cifre)}]`;
}

/** `12` → `„₁₂"`. Indicii se scriu ca în curs, jos, nu ca „x_12". */
function indice(n: number): string {
  const CIFRE = "₀₁₂₃₄₅₆₇₈₉";
  return [...String(n)].map((c) => CIFRE[Number(c)] ?? c).join("");
}

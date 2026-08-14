import { useMemo } from "react";

import { bazaPatrata, cadrulPasului } from "@/algorithms/metode-de-gradient/cadru";
import type { PasGradient } from "@/algorithms/metode-de-gradient/tipuri";
import { CurbeDeNivel3D } from "@/components/viz/CurbeDeNivel3D";
import { Eticheta3D } from "@/components/viz/Eticheta3D";
import { Podea3D } from "@/components/viz/Podea3D";
import { Sageata3D } from "@/components/viz/Sageata3D";
import { Scena3D } from "@/components/viz/Scena3D";
import { Suprafata3D } from "@/components/viz/Suprafata3D";
import { Traiectorie3D } from "@/components/viz/Traiectorie3D";
import { TraseuReferinta3D } from "@/components/viz/TraseuReferinta3D";
import {
  centrul,
  elipsaRaza,
  inaltimePesteFund,
  razaA,
  razeEchidistante,
  valoare,
  type Mat2,
  type Vec2,
} from "@/lib/curbe-de-nivel";
import type { Cutie, Punct3 } from "@/lib/proiectie-3d";
import { useDomeniuAnimat } from "@/hooks/use-domeniu-animat";

export type ValeaGradientuluiProps = {
  A: Mat2;
  b: Vec2;
  /** Pașii metodei alese, gata calculați în `src/algorithms/metode-de-gradient/`. */
  pasi: readonly PasGradient[];
  /**
   * Pașii **celeilalte** metode, pentru paralelă. Se desenează întregi, punctat
   * și plat pe podea — comparația e între drumuri, nu între poziții la același
   * număr de pas (metodele nici n-au același număr de pași).
   */
  pasiReferinta?: readonly PasGradient[];
  pasCurent: number;
  /** `x* = A⁻¹b`, fundul văii. */
  solutie: Vec2 | null;
  /** Propoziția pentru cititorul de ecran; vine din `descrieScena()`. */
  descriere: string;
  /** Numele metodei, pentru `<title>`. */
  numeMetoda: string;
  raport?: number;
  inaltimeMaxima?: number;
  className?: string;
};

/** Câte inele de nivel se desenează pe podea. */
const INELE = 9;

/**
 * Valea `f(x) = ½·xᵀAx − bᵀx` în 3D, cu drumul metodei pe ea și cu harta de
 * curbe de nivel pe podeaua de sub ea.
 *
 * **Nu știe ce metodă rulează.** Ca `GraficRadacina` de pe pagina 6, ramifică pe
 * **datele** pasului, nu pe un nume: `cosDirectii` vine numai de la coborâre,
 * `aOrtogonalitate` și `s` numai de la gradientul Conjugat. Așa, adăugarea unei
 * a treia metode nu cere nicio modificare aici.
 *
 * Cele două jumătăți ale desenului spun lucruri diferite și amândouă sunt
 * necesare:
 *
 * - **suprafața** arată *de ce* există metoda — există o vale, iar rezolvarea
 *   sistemului înseamnă coborârea în ea (curs 5, §8.1);
 * - **podeaua** arată *cum lucrează* — unghiul dintre doi pași consecutivi se
 *   citește doar în planul soluțiilor, iar din privirea de sus (butonul din
 *   colțul scenei) desenul devine chiar figura de curbe de nivel din curs.
 *
 * **Cadrul urmărește metoda**, ca lupa de pe pagina 6: cât timp pasul se vede,
 * încadrarea stă pe loc — asta arată **că** pașii se scurtează — iar când pasul
 * ajunge sub o șeptime din scenă, cadrul se apropie o treaptă. Cutia rămâne
 * pătrată tot drumul (`urmarestePatrat` plus aceeași interpolare geometrică pe
 * amândouă axele); una forfecată ar strica exact unghiul drept pe care desenul
 * îl afirmă. Numerele de pe podea sunt cele care fac apropierea vizibilă: pe o
 * pătratică, valea arată la fel oricât te-ai apropia.
 *
 * Curba de nivel **prin punctul curent** e desenată aparte, mai apăsat: ea e
 * explicația zigzagului. Reziduul de după pas e perpendicular pe curba pe care
 * iterația tocmai a aterizat, deci pe direcția din care a venit — de aici cotul
 * drept și convergența lentă.
 */
export function ValeaGradientului({
  A,
  b,
  pasi,
  pasiReferinta,
  pasCurent,
  solutie,
  descriere,
  numeMetoda,
  raport = 1.45,
  inaltimeMaxima = 560,
  className,
}: ValeaGradientuluiProps) {
  /**
   * Înălțimea desenată e măsurată **de la fundul văii**, nu de la zero.
   *
   * Nu e o alegere de încadrare, e o condiție ca desenul să existe: aproape de
   * `x*`, `f(p)` și `f(x*)` diferă în cifre pe care virgula mobilă nu le mai
   * are, iar scăderea lor dă zero sau chiar negativ — măsurat, exact asta se
   * întâmpla la ultimii pași, iar valea se desena ca un plan gol. Tabelul cu
   * cifrele stă la `inaltimePesteFund`. Când A nu are centru (nu e SPD), se
   * cade înapoi pe valoarea absolută, care acolo e singura definită.
   */
  const areCentru = useMemo(() => centrul(A, b) !== null, [A, b]);
  const h = useMemo(
    () => (p: Vec2) => (areCentru ? inaltimePesteFund(A, b, p) : valoare(A, b, p)),
    [A, b, areCentru],
  );
  const inaltime = useMemo(() => (x: number, y: number) => h([x, y]), [h]);

  /**
   * Toate punctele pe care desenul trebuie să le cuprindă: drumul, fundul văii
   * și — când e cerut — drumul celeilalte metode, ca traseul de referință să
   * încapă întreg la pornire.
   */
  const puncteImportante = useMemo<Vec2[]>(() => {
    const lista: Vec2[] = [];
    const prim = pasi[0];
    if (prim) lista.push(prim.xAnterior);
    for (const p of pasi) lista.push(p.x);
    if (solutie) lista.push(solutie);
    if (pasiReferinta) {
      const primReferinta = pasiReferinta[0];
      if (primReferinta) lista.push(primReferinta.xAnterior);
      for (const p of pasiReferinta) lista.push(p.x);
    }
    return lista;
  }, [pasi, pasiReferinta, solutie]);

  /** Drumul celeilalte metode, în planul soluțiilor. */
  const traseuReferinta = useMemo<Vec2[]>(() => {
    if (!pasiReferinta || pasiReferinta.length === 0) return [];
    const prim = pasiReferinta[0];
    return prim ? [prim.xAnterior, ...pasiReferinta.map((p) => p.x)] : [];
  }, [pasiReferinta]);

  /** Baza scenei: pătratul care cuprinde tot drumul și fundul văii. */
  const baza = useMemo(() => bazaPatrata(puncteImportante), [puncteImportante]);

  const pas = pasi[Math.max(0, Math.min(pasCurent, pasi.length - 1))];

  /** Cadrul cerut de pasul curent — lupa din `cadrulPasului`. */
  const tinta = useMemo(() => {
    if (!pas) return baza;
    const deInteres: Vec2[] = [pas.xAnterior, pas.x];
    if (solutie) deInteres.push(solutie);
    return cadrulPasului(baza, deInteres);
  }, [baza, pas, solutie]);

  // Aceeași durată și aceeași interpolare geometrică pe amândouă axele, deci
  // cutia rămâne pătrată pe tot drumul, nu doar la capete.
  const x = useDomeniuAnimat(tinta.x);
  const y = useDomeniuAnimat(tinta.y);
  const seSchimba =
    x[0] !== tinta.x[0] || x[1] !== tinta.x[1] || y[0] !== tinta.y[0] || y[1] !== tinta.y[1];

  /**
   * Cutia scenei, cu înălțimea recalculată din colțurile bazei animate: pe o
   * pătratică, maximul pe un dreptunghi e mereu într-un colț, deci n-avem nevoie
   * de eșantionare.
   */
  const cutie = useMemo<Cutie>(() => {
    const fund = solutie
      ? h(solutie)
      : puncteImportante.length > 0
        ? Math.min(...puncteImportante.map((p) => h(p)))
        : 0;
    const colturi: Vec2[] = [
      [x[0], y[0]],
      [x[1], y[0]],
      [x[0], y[1]],
      [x[1], y[1]],
    ];
    const varf = Math.max(...colturi.map((c) => h(c)));

    return { x, y, z: [fund, varf > fund ? varf : fund + 1] };
  }, [h, x, y, puncteImportante, solutie]);

  /** Harta de nivel de pe podea. Exactă, nu eșantionată — vezi `curbe-de-nivel.ts`. */
  const curbeFundal = useMemo(() => {
    if (!centrul(A, b)) return [];
    const colturi: Vec2[] = [
      [cutie.x[0], cutie.y[0]],
      [cutie.x[1], cutie.y[0]],
      [cutie.x[0], cutie.y[1]],
      [cutie.x[1], cutie.y[1]],
    ];
    const raza = Math.max(...colturi.map((c) => razaA(A, b, c)));
    if (!Number.isFinite(raza) || raza <= 0) return [];

    // Prin rază, nu prin nivel: raza se calculează din vectorul diferență, deci
    // nu trece prin scăderea care se pierde lângă `x*`.
    return razeEchidistante(raza, INELE)
      .map((rho) => elipsaRaza(A, b, rho, 96))
      .filter((c) => c.length > 0);
  }, [A, b, cutie]);

  /**
   * Curba de nivel pe care stă chiar punctul curent.
   *
   * Se cere prin **rază** (`razaA`, calculată din vectorul `x⁽ᵏ⁾ − x*`), nu prin
   * nivel: la ultimii pași nivelul nu se mai poate scădea din `f(x*)`, iar curba
   * — tocmai explicația zigzagului — dispărea de pe ecran.
   */
  const curbaCurenta = useMemo(() => {
    if (!pas) return [];
    const curba = elipsaRaza(A, b, razaA(A, b, pas.x), 128);
    return curba.length > 0 ? [curba] : [];
  }, [A, b, pas]);

  const drum = useMemo<Punct3[]>(() => {
    const lista: Punct3[] = [];
    const prim = pasi[0];
    if (prim) {
      lista.push({ x: prim.xAnterior[0], y: prim.xAnterior[1], z: h(prim.xAnterior) });
    }
    for (const p of pasi) lista.push({ x: p.x[0], y: p.x[1], z: h(p.x) });
    return lista;
  }, [h, pasi]);

  // Punctul curent din `drum` e cu unu mai departe decât indicele pasului:
  // `drum[0]` e pornirea `x⁽⁰⁾`, care nu e produsă de niciun pas.
  const indiceDrum = pas ? Math.max(0, Math.min(pasCurent, pasi.length - 1)) + 1 : 0;

  const varfSageata: Punct3 | null = pas ? { x: pas.x[0], y: pas.x[1], z: h(pas.x) } : null;
  const coadaSageata: Punct3 | null = pas
    ? { x: pas.xAnterior[0], y: pas.xAnterior[1], z: h(pas.xAnterior) }
    : null;

  const pornire = drum[0];
  const fundulVaii: Punct3 | null = solutie
    ? { x: solutie[0], y: solutie[1], z: h(solutie) }
    : null;

  return (
    <Scena3D
      cutie={cutie}
      rezumat={`${numeMetoda} pe valea funcției f(x) = ½·xᵀAx − bᵀx`}
      descriere={descriere}
      raport={raport}
      seSchimba={seSchimba}
      inaltimeMaxima={inaltimeMaxima}
      className={className}
    >
      {/* Ordinea de mai jos e ordinea de pictare, de la fund spre privitor. */}
      {/* Drumul celeilalte metode stă sub tot: e termenul de comparație, nu
          subiectul desenului. */}
      {traseuReferinta.length >= 2 && <TraseuReferinta3D puncte={traseuReferinta} />}
      <Podea3D diviziuni={6} />
      <CurbeDeNivel3D curbe={curbeFundal} rol="grila" opacitate={0.5} />
      {/* Curba prin punctul curent, apăsată: pe ea aterizează pasul, și
          perpendicular pe ea pleacă următorul. */}
      <CurbeDeNivel3D curbe={curbaCurenta} rol="interval" opacitate={0.95} grosime={2} />
      <Traiectorie3D puncte={drum} pasCurent={indiceDrum} strat="umbra" cuUltimulSegment={false} />

      <Suprafata3D inaltime={inaltime} />

      <Traiectorie3D
        puncte={drum}
        pasCurent={indiceDrum}
        strat="traseu"
        cuUltimulSegment={false}
        inaltimea={inaltime}
      />
      {pas && coadaSageata && varfSageata && (
        <Sageata3D
          de={coadaSageata}
          la={varfSageata}
          rol="interval"
          eticheta={etichetaPasului(pas)}
        />
      )}

      {/* Cel mult patru nume pe scenă: mai multe se calcă între ele la o parte
          din azimuturi, oricât de bine ar fi împinse radial. */}
      {pornire && <Eticheta3D punct={pornire} text="x⁽⁰⁾" rol="anterior" />}
      {fundulVaii && <Eticheta3D punct={fundulVaii} text="x*" rol="solutie" />}
    </Scena3D>
  );
}

/**
 * Numele săgeții, în notația cursului din care vine metoda.
 *
 * Ramificarea e pe **datele** pasului, nu pe un nume de metodă: `s` există doar
 * în schema gradientului Conjugat (curs 5, §8.6), unde pasul se numește `t_k` și
 * direcția `v⁽ᵏ⁾`; la coborâre (curs 6, §4.1) sunt `α` și `r⁽ᵏ⁾`.
 */
function etichetaPasului(pas: PasGradient): string {
  return pas.s === undefined ? "α·r⁽ᵏ⁾" : "tₖ·v⁽ᵏ⁾";
}

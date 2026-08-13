import { useMemo } from "react";

import type { PasGradient } from "@/algorithms/metode-de-gradient/tipuri";
import { CurbeDeNivel3D } from "@/components/viz/CurbeDeNivel3D";
import { Eticheta3D } from "@/components/viz/Eticheta3D";
import { Podea3D } from "@/components/viz/Podea3D";
import { Sageata3D } from "@/components/viz/Sageata3D";
import { Scena3D } from "@/components/viz/Scena3D";
import { Suprafata3D } from "@/components/viz/Suprafata3D";
import { Traiectorie3D } from "@/components/viz/Traiectorie3D";
import {
  centrul,
  elipsaNivel,
  niveleEchidistante,
  razaA,
  valoare,
  type Mat2,
  type Vec2,
} from "@/lib/curbe-de-nivel";
import type { Cutie, Punct3 } from "@/lib/proiectie-3d";

export type ValeaGradientuluiProps = {
  A: Mat2;
  b: Vec2;
  /** Pașii metodei alese, gata calculați în `src/algorithms/metode-de-gradient/`. */
  pasi: readonly PasGradient[];
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

/** Cât spațiu se lasă în jurul drumului, ca fața văii să nu fie tăiată la buză. */
const MARJA_CUTIE = 0.55;

/**
 * Valea `f(x) = ½·xᵀAx − bᵀx` în 3D, cu drumul metodei pe ea și cu harta de
 * curbe de nivel pe podeaua de sub ea.
 *
 * **Nu știe ce metodă rulează.** Ca `GraficRadacina` de pe pagina 6, ramifică pe
 * **datele** pasului, nu pe un nume: `cosDirectii` vine numai de la coborâre,
 * `aOrtogonalitate` și `s` numai de la gradientul conjugat. Așa, adăugarea unei
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
 * Curba de nivel **prin punctul curent** e desenată aparte, mai apăsat: ea e
 * explicația zigzagului. Reziduul de după pas e perpendicular pe curba pe care
 * iterația tocmai a aterizat, deci pe direcția din care a venit — de aici cotul
 * drept și convergența lentă.
 */
export function ValeaGradientului({
  A,
  b,
  pasi,
  pasCurent,
  solutie,
  descriere,
  numeMetoda,
  raport = 1.45,
  inaltimeMaxima = 560,
  className,
}: ValeaGradientuluiProps) {
  const inaltime = useMemo(() => (x: number, y: number) => valoare(A, b, [x, y]), [A, b]);

  /** Toate punctele pe care desenul trebuie să le cuprindă: drumul și fundul văii. */
  const puncteImportante = useMemo<Vec2[]>(() => {
    const lista: Vec2[] = [];
    const prim = pasi[0];
    if (prim) lista.push(prim.xAnterior);
    for (const p of pasi) lista.push(p.x);
    if (solutie) lista.push(solutie);
    return lista;
  }, [pasi, solutie]);

  /**
   * Cutia scenei.
   *
   * Baza se face **pătrată** dinadins: scara pe x₁ și x₂ e oricum izotropă
   * (`normalizeaza` din `proiectie-3d.ts`), dar o cutie alungită ar sugera din
   * priviri că axele au unități diferite. Cu latura egală, ce se vede drept pe
   * ecran chiar e drept în planul soluțiilor.
   */
  const cutie = useMemo<Cutie>(() => {
    if (puncteImportante.length === 0) {
      return { x: [-1, 1], y: [-1, 1], z: [0, 1] };
    }

    const xs = puncteImportante.map((p) => p[0]);
    const ys = puncteImportante.map((p) => p[1]);
    const centruX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centruY = (Math.min(...ys) + Math.max(...ys)) / 2;

    const intindere = Math.max(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      1e-6,
    );
    const semi = (intindere / 2) * (1 + MARJA_CUTIE) + intindere * 0.15;

    const x: readonly [number, number] = [centruX - semi, centruX + semi];
    const y: readonly [number, number] = [centruY - semi, centruY + semi];

    // Înălțimea cutiei se ia din colțurile bazei: pe o pătratică, maximul pe un
    // dreptunghi e mereu într-un colț, deci n-avem nevoie de eșantionare.
    const fund = solutie
      ? valoare(A, b, solutie)
      : Math.min(...puncteImportante.map((p) => valoare(A, b, p)));
    const colturi: Vec2[] = [
      [x[0], y[0]],
      [x[1], y[0]],
      [x[0], y[1]],
      [x[1], y[1]],
    ];
    const varf = Math.max(...colturi.map((c) => valoare(A, b, c)));

    return { x, y, z: [fund, varf > fund ? varf : fund + 1] };
  }, [A, b, puncteImportante, solutie]);

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

    return niveleEchidistante(A, b, raza, INELE)
      .map((nivel) => elipsaNivel(A, b, nivel, 96))
      .filter((c) => c.length > 0);
  }, [A, b, cutie]);

  const pas = pasi[Math.max(0, Math.min(pasCurent, pasi.length - 1))];

  /** Curba de nivel pe care stă chiar punctul curent. O evaluare, exactă. */
  const curbaCurenta = useMemo(() => {
    if (!pas) return [];
    const curba = elipsaNivel(A, b, valoare(A, b, pas.x), 128);
    return curba.length > 0 ? [curba] : [];
  }, [A, b, pas]);

  const drum = useMemo<Punct3[]>(() => {
    const lista: Punct3[] = [];
    const prim = pasi[0];
    if (prim) {
      lista.push({ x: prim.xAnterior[0], y: prim.xAnterior[1], z: valoare(A, b, prim.xAnterior) });
    }
    for (const p of pasi) lista.push({ x: p.x[0], y: p.x[1], z: p.f });
    return lista;
  }, [A, b, pasi]);

  // Punctul curent din `drum` e cu unu mai departe decât indicele pasului:
  // `drum[0]` e pornirea `x⁽⁰⁾`, care nu e produsă de niciun pas.
  const indiceDrum = pas ? Math.max(0, Math.min(pasCurent, pasi.length - 1)) + 1 : 0;

  const varfSageata: Punct3 | null = pas ? { x: pas.x[0], y: pas.x[1], z: pas.f } : null;
  const coadaSageata: Punct3 | null = pas
    ? { x: pas.xAnterior[0], y: pas.xAnterior[1], z: valoare(A, b, pas.xAnterior) }
    : null;

  const pornire = drum[0];
  const fundulVaii: Punct3 | null = solutie
    ? { x: solutie[0], y: solutie[1], z: valoare(A, b, solutie) }
    : null;

  return (
    <Scena3D
      cutie={cutie}
      rezumat={`${numeMetoda} pe valea funcției f(x) = ½·xᵀAx − bᵀx`}
      descriere={descriere}
      raport={raport}
      inaltimeMaxima={inaltimeMaxima}
      className={className}
    >
      {/* Ordinea de mai jos e ordinea de pictare, de la fund spre privitor. */}
      <Podea3D diviziuni={6} />
      <CurbeDeNivel3D curbe={curbeFundal} rol="grila" opacitate={0.5} />
      {/* Curba prin punctul curent, apăsată: pe ea aterizează pasul, și
          perpendicular pe ea pleacă următorul. */}
      <CurbeDeNivel3D curbe={curbaCurenta} rol="interval" opacitate={0.95} grosime={2} />
      <Traiectorie3D puncte={drum} pasCurent={indiceDrum} strat="umbra" />

      <Suprafata3D inaltime={inaltime} />

      <Traiectorie3D puncte={drum} pasCurent={indiceDrum} strat="traseu" />
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
 * în schema gradientului conjugat (curs 5, §8.6), unde pasul se numește `t_k` și
 * direcția `v⁽ᵏ⁾`; la coborâre (curs 6, §4.1) sunt `α` și `r⁽ᵏ⁾`.
 */
function etichetaPasului(pas: PasGradient): string {
  return pas.s === undefined ? "α·r⁽ᵏ⁾" : "tₖ·v⁽ᵏ⁾";
}

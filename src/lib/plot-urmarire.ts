/**
 * Lupa care urmărește o metodă când zona de interes devine prea mică.
 *
 * Problema pe care o rezolvă e chiar a bisecției: intervalul se înjumătățește
 * la fiecare pas, deci după opt pași e de 256 de ori mai scurt decât la
 * pornire. Pe un grafic lat de 700 de pixeli asta înseamnă mai puțin de trei
 * pixeli — banda nu se mai vede, punctele se suprapun, iar animația pare că
 * s-a oprit, deși metoda lucrează în continuare.
 *
 * Încadrarea fixă nu e totuși o greșeală de care să scăpăm: ea e cea care
 * arată **că** intervalul se strânge. De-aia lupa nu urmărește continuu, ci
 * sare pe **trepte**: cât timp zona de interes e destul de lată, cadrul stă pe
 * loc și se vede micșorarea; când coboară sub prag, cadrul se apropie o dată,
 * cu un factor fix, și micșorarea reîncepe de sus.
 *
 * Factorul e 4, adică două înjumătățiri. Cu 2 s-ar fi apropiat la fiecare pas,
 * iar banda ar fi părut că stă mereu la fel de lată — exact impresia greșită.
 */

import type { Domeniu } from "@/lib/plot-scara";

/** Cât se apropie cadrul la o treaptă. Patru = două înjumătățiri ale bisecției. */
export const FACTOR_APROPIERE = 4;

/**
 * Sub ce fracțiune din lățimea cadrului se declanșează apropierea.
 *
 * La 0,14 zona de interes mai are ~1/7 din ecran înainte de salt, adică e încă
 * bine vizibilă când cadrul se schimbă. Mai jos, saltul ar veni după ce banda a
 * devenit deja greu de văzut; mai sus, cadrul ar sări prea des.
 */
export const PRAG_STRAMT = 0.14;

/**
 * Câte trepte de apropiere se admit.
 *
 * 4²⁰ ≈ 1,1·10¹²: cu un interval de pornire de lungime 1 se coboară până la
 * ~10⁻¹², adică sub cea mai mică toleranță pe care o oferă interfața. Limita
 * există fiindcă o zonă de interes de lungime **zero** (metoda a nimerit
 * rădăcina exact) ar face altfel bucla să nu se oprească.
 *
 * Prima versiune avea 12, socotind că e „destul". Verificarea a arătat că nu
 * e: cu toleranța 10⁻¹⁰ bisecția face 34 de pași, iar de la al 24-lea lupa
 * rămânea în urmă și banda cobora înapoi la 0,2% din cadru — exact bugul pe
 * care lupa trebuia să-l repare, doar mutat mai încolo.
 */
export const NIVEL_MAXIM = 20;

/**
 * Cât de îngust poate deveni cadrul, raportat la mărimea numerelor din el.
 *
 * Sub asta apropierea n-ar mai arăta nimic adevărat: pasul dintre două numere
 * reprezentabile lângă 2,09 e ~4,4·10⁻¹⁶, deci un cadru de 2·10⁻¹² mai are doar
 * câteva mii de valori distincte în el, iar curba eșantionată începe să iasă în
 * trepte. E o limită a aritmeticii, nu o preferință de desen — de-aia se aplică
 * indiferent de nivelul cerut.
 */
const REZOLUTIE_MINIMA = 1e-12;

export type Urmarire = {
  domeniu: Domeniu;
  /** De câte ori s-a apropiat cadrul față de încadrarea de pornire. */
  nivel: number;
  /** Cu cât e cadrul mai mic decât cel de pornire: `FACTOR_APROPIERE ** nivel`. */
  apropiere: number;
};

/**
 * Câte trepte de apropiere cere o zonă de interes de lungimea dată.
 *
 * Se calculează din raportul celor două lungimi, nu din numărul pasului:
 * bisecția înjumătățește regulat, dar Newton și secanta sar neregulat, iar o
 * formulă legată de pas ar apropia cadrul când n-are nevoie.
 */
export function nivelUrmarire(latimeBaza: number, latimeZona: number): number {
  if (!Number.isFinite(latimeBaza) || latimeBaza <= 0) return 0;
  if (!Number.isFinite(latimeZona) || latimeZona <= 0) return NIVEL_MAXIM;

  let nivel = 0;
  while (
    nivel < NIVEL_MAXIM &&
    latimeZona / (latimeBaza / FACTOR_APROPIERE ** nivel) < PRAG_STRAMT
  ) {
    nivel++;
  }
  return nivel;
}

/**
 * Cadrul în care se desenează acum, pornind de la încadrarea inițială și de la
 * zona pe care metoda o cercetează la pasul curent.
 *
 * `limita` e domeniul pe care funcția chiar există (ln nu are valori sub zero).
 * Cadrul se împinge înăuntru, păstrându-și lățimea, ca zona de interes să nu
 * ajungă lipită de margine când e aproape de capătul domeniului.
 */
export function urmareste(
  domeniuBaza: Domeniu,
  zona: readonly [number, number],
  limita?: readonly [number, number],
): Urmarire {
  const latimeBaza = domeniuBaza[1] - domeniuBaza[0];
  const [zonaMin, zonaMax] = zona[0] <= zona[1] ? zona : [zona[1], zona[0]];

  const centru = (zonaMin + zonaMax) / 2;

  // Podeaua de precizie: câte trepte mai încap până cadrul devine mai îngust
  // decât are sens în virgulă mobilă.
  const latimeMinima = Math.max(Math.abs(centru), 1) * REZOLUTIE_MINIMA;
  const nivelMaximAici =
    latimeBaza > latimeMinima
      ? Math.floor(Math.log(latimeBaza / latimeMinima) / Math.log(FACTOR_APROPIERE))
      : 0;

  const nivel = Math.min(nivelUrmarire(latimeBaza, zonaMax - zonaMin), nivelMaximAici);
  const apropiere = FACTOR_APROPIERE ** nivel;

  if (nivel === 0) return { domeniu: domeniuBaza, nivel, apropiere };

  const latime = latimeBaza / apropiere;
  let stanga = centru - latime / 2;
  let dreapta = centru + latime / 2;

  // Nu ieșim din încadrarea de pornire: apropierea arată o bucată din ea, nu
  // altă parte a planului.
  if (stanga < domeniuBaza[0]) {
    stanga = domeniuBaza[0];
    dreapta = stanga + latime;
  }
  if (dreapta > domeniuBaza[1]) {
    dreapta = domeniuBaza[1];
    stanga = dreapta - latime;
  }

  if (limita) {
    if (stanga < limita[0]) {
      stanga = limita[0];
      dreapta = stanga + latime;
    }
    if (dreapta > limita[1]) {
      dreapta = limita[1];
      stanga = dreapta - latime;
    }
  }

  return { domeniu: [stanga, dreapta], nivel, apropiere };
}

/**
 * Aceeași lupă, dar pe un plan: cutia rămâne **pătrată** la orice treaptă.
 *
 * **Nu se poate obține chemând `urmareste` de două ori.** Fiecare axă și-ar
 * alege singură treapta, iar la primul pas în care una se strânge mai tare
 * decât cealaltă, cutia s-ar forfeca — exact greșeala pe care o măsoară deja
 * `scripts/verificare-algoritmi/proiectie-3d.ts`: cu scară neizotropă, un unghi
 * real de 90° se citește între 58° și 130°, după azimut. Pe pagina 7 unghiul
 * drept dintre doi pași e chiar afirmația desenului, deci o cutie forfecată ar
 * face desenul să mintă.
 *
 * Regula proprie e una singură: **treapta se ia din latura mai mare a zonei de
 * interes și se aplică identic pe amândouă axele.** Latura mai mare, fiindcă ea
 * decide când zona nu mai încape; dacă s-ar lua cea mică, cadrul s-ar apropia
 * cât timp zona e încă lată pe cealaltă direcție și ar tăia-o.
 *
 * Restul — pragul, factorul, numărul de trepte, ne-ieșirea din cutia de bază —
 * e cel din `urmareste`, refolosit ca atare.
 *
 * Cutia de bază se presupune ea însăși pătrată (așa o construiește
 * `ValeaGradientului`); latura de pornire e cea mai mare dintre cele două, ca
 * baza să încapă întreagă și când nu e.
 */
export function urmarestePatrat(
  bazaX: Domeniu,
  bazaY: Domeniu,
  zonaX: readonly [number, number],
  zonaY: readonly [number, number],
): { x: Domeniu; y: Domeniu; nivel: number; apropiere: number } {
  const latimeBaza = Math.max(bazaX[1] - bazaX[0], bazaY[1] - bazaY[0]);
  const laturaZona = Math.max(
    Math.abs(zonaX[1] - zonaX[0]),
    Math.abs(zonaY[1] - zonaY[0]),
    // O zonă de interes strânsă la un punct (metoda a nimerit soluția exact)
    // ar cere apropiere infinită; `nivelUrmarire` o oprește la `NIVEL_MAXIM`.
    0,
  );

  const nivel = nivelUrmarire(latimeBaza, laturaZona);
  const apropiere = FACTOR_APROPIERE ** nivel;

  if (nivel === 0) return { x: bazaX, y: bazaY, nivel, apropiere };

  const latura = latimeBaza / apropiere;
  return {
    x: incadreaza(bazaX, zonaX, latura),
    y: incadreaza(bazaY, zonaY, latura),
    nivel,
    apropiere,
  };
}

/** O axă a cutiei pătrate: latura dată, centrată pe zonă, fără să iasă din bază. */
function incadreaza(baza: Domeniu, zona: readonly [number, number], latura: number): Domeniu {
  const [zonaMin, zonaMax] = zona[0] <= zona[1] ? zona : [zona[1], zona[0]];
  const centru = (zonaMin + zonaMax) / 2;

  let jos = centru - latura / 2;
  let sus = jos + latura;

  if (jos < baza[0]) {
    jos = baza[0];
    sus = jos + latura;
  }
  if (sus > baza[1]) {
    sus = baza[1];
    jos = sus - latura;
  }

  return [jos, sus];
}

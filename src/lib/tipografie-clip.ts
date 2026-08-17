/**
 * Tipografia textelor mărunte din clipuri.
 *
 * Clipurile desenează pe o pânză de 1920 de unități, care ajunge pe ecran la
 * 700–900 px lățime. Un text scris la 26 de unități se vede acolo la ~11 px,
 * adică sub pragul la care se citește comod — de aceea explicațiile din
 * cartonașe pornesc acum de la `CORP_EXPLICATIE` și coboară doar cât e nevoie
 * ca să încapă.
 */

/**
 * Corpul dorit pentru explicația de sub simbolul unui cartonaș, în unități de
 * pânză. Sub `CORP_EXPLICATIE_MINIM` nu se coboară: acolo textul se scurtează,
 * nu se micșorează.
 */
export const CORP_EXPLICATIE = 34;
export const CORP_EXPLICATIE_MINIM = 27;

/**
 * Lățimea medie a unui caracter, ca fracție din corpul fontului, pentru Nunito
 * Sans la greutatea 600 și text în română. Nu e o măsurătoare exactă per
 * literă — e o margine de siguranță: valoarea e aleasă puțin peste media reală
 * (~0,50 em), ca estimarea să greșească întotdeauna în favoarea încăperii.
 */
const LATIME_CARACTER = 0.54;

/**
 * Cel mai mare corp de literă cu care `text` încape în `latimeDisponibila`,
 * mărginit între minim și `maxim`. Textele care nici așa nu încap se scurtează
 * la sursă — funcția nu taie și nu înfășoară.
 */
export function marimeCareIncape(
  text: string,
  latimeDisponibila: number,
  maxim: number = CORP_EXPLICATIE,
  minim: number = CORP_EXPLICATIE_MINIM,
): number {
  if (text.length === 0) return maxim;
  const incapatoare = latimeDisponibila / (text.length * LATIME_CARACTER);
  return Math.max(minim, Math.min(maxim, incapatoare));
}

/**
 * Explicația unui cartonaș, ruptă pe cel mult două rânduri.
 *
 * **De ce nu ajunge `marimeCareIncape` singură.** Ea măsoară la corpul de bază,
 * dar clipurile înmulțesc pe urmă rezultatul cu scara de cadru îngust (până la
 * ×1,35, ca literele să nu se vadă la 6 px pe telefon). Înmulțit după ce s-a
 * măsurat, corpul care „încăpea" nu mai încape: exact așa ieșeau din pânză
 * explicațiile de la punctul de mijloc și de la Euler modificat, și numai pe
 * telefon.
 *
 * Aici se socotește invers: `scara` intră în calcul **înainte** de măsurare,
 * iar textul primește două rânduri în loc să fie micșorat până la ilizibil. Un
 * text care nici pe două rânduri nu încape se scurtează la sursă — funcția nu
 * taie cuvinte și nu pune trei puncte.
 */
export function randuriCartonas(
  text: string,
  latimeDisponibila: number,
  scara = 1,
): { randuri: string[]; marime: number } {
  const marime = marimeCareIncape(
    text,
    2 * latimeDisponibila,
    CORP_EXPLICATIE * scara,
    CORP_EXPLICATIE_MINIM * scara,
  );
  const caracterePeRand = Math.max(1, Math.floor(latimeDisponibila / (LATIME_CARACTER * marime)));

  if (text.length <= caracterePeRand) return { randuri: [text], marime };

  const cuvinte = text.split(" ");
  const randuri: string[] = [];
  let curent = "";
  for (const cuvant of cuvinte) {
    const incercare = curent ? `${curent} ${cuvant}` : cuvant;
    if (incercare.length <= caracterePeRand || !curent) {
      curent = incercare;
    } else {
      randuri.push(curent);
      curent = cuvant;
    }
  }
  if (curent) randuri.push(curent);

  // Peste două rânduri, cartonașul ar deveni un paragraf: restul se lipește de
  // al doilea rând, iar ce iese din el e semnul că propoziția e prea lungă.
  if (randuri.length > 2) {
    return { randuri: [randuri[0]!, randuri.slice(1).join(" ")], marime };
  }
  return { randuri, marime };
}

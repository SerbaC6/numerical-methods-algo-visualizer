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

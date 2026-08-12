import { ALGORITMI, CAPITOLE, type IntrareAlgoritm } from "@/algorithms/registry";

/** Fără diacritice și fără majuscule, ca „bisectie" să găsească „bisecție". */
export function normalizeaza(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Titlu + descriere + metode + capitol, o singură dată per pagină. */
const INDEX = new Map(
  ALGORITMI.map((a) => [
    a.slug,
    normalizeaza([a.titlu, a.descriere, ...a.metode, CAPITOLE[a.capitol].titlu].join(" ")),
  ]),
);

/**
 * Căutarea din bara de sus: potrivire simplă pe subșir. Capitolul intră și el
 * în index, ca „integrare" sau „valori proprii" să găsească ceva chiar dacă
 * termenul nu apare în titlu. Fără fuzzy și fără dependențe — 14 pagini, e de
 * ajuns. Termen gol → listă goală (nu afișăm nimic până nu scrie ceva).
 */
export function cautaAlgoritmi(termen: string, limita = 8): IntrareAlgoritm[] {
  const cautat = normalizeaza(termen.trim());
  if (!cautat) return [];

  return ALGORITMI.filter((a) => INDEX.get(a.slug)?.includes(cautat)).slice(0, limita);
}

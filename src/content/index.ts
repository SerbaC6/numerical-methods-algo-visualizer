import { continutEcuatiiNeliniare } from "@/content/ecuatii-neliniare";
import { continutMetodeDeGradient } from "@/content/metode-de-gradient";
import { continutPagerank } from "@/content/pagerank";
import type { ContinutPagina } from "@/content/tipuri";

/**
 * Conținutul scris al paginilor, după slug.
 *
 * Paginile care încă n-au text lipsesc pur și simplu din obiect, iar
 * `getContinut` întoarce `undefined` — pagina desenează atunci un placeholder
 * tăcut. Nicio etichetă de „în lucru" nu ajunge în interfață (vezi CLAUDE.md).
 */
const CONTINUT: Partial<Record<string, ContinutPagina>> = {
  "ecuatii-neliniare": continutEcuatiiNeliniare,
  "metode-de-gradient": continutMetodeDeGradient,
  pagerank: continutPagerank,
};

export function getContinut(slug: string | undefined): ContinutPagina | undefined {
  return slug ? CONTINUT[slug] : undefined;
}

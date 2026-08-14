import { continutDvs } from "@/content/dvs";
import { continutAlgoritmulQr } from "@/content/algoritmul-qr";
import { continutEcuatiiNeliniare } from "@/content/ecuatii-neliniare";
import { continutEliminareGaussiana } from "@/content/eliminare-gaussiana";
import { continutFactorizariLu } from "@/content/factorizari-lu";
import { continutFft } from "@/content/fft";
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
  dvs: continutDvs,
  "algoritmul-qr": continutAlgoritmulQr,
  "ecuatii-neliniare": continutEcuatiiNeliniare,
  "eliminare-gaussiana": continutEliminareGaussiana,
  "factorizari-lu": continutFactorizariLu,
  fft: continutFft,
  "metode-de-gradient": continutMetodeDeGradient,
  pagerank: continutPagerank,
};

export function getContinut(slug: string | undefined): ContinutPagina | undefined {
  return slug ? CONTINUT[slug] : undefined;
}

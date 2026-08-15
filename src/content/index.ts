import { continutDerivareNumerica } from "@/content/derivare-numerica";
import { continutDvs } from "@/content/dvs";
import { continutAlgoritmulQr } from "@/content/algoritmul-qr";
import { continutAlgoritmulThomas } from "@/content/algoritmul-thomas";
import { continutCurbeBezier } from "@/content/curbe-bezier";
import { continutEcuatiiNeliniare } from "@/content/ecuatii-neliniare";
import { continutEliminareGaussiana } from "@/content/eliminare-gaussiana";
import { continutFactorizariLu } from "@/content/factorizari-lu";
import { continutFft } from "@/content/fft";
import { continutMetodeDeGradient } from "@/content/metode-de-gradient";
import { continutMetodeIterative } from "@/content/metode-iterative";
import { continutNormeSiOrtogonalitate } from "@/content/norme-si-ortogonalitate";
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
  "derivare-numerica": continutDerivareNumerica,
  dvs: continutDvs,
  "algoritmul-qr": continutAlgoritmulQr,
  "algoritmul-thomas": continutAlgoritmulThomas,
  "curbe-bezier": continutCurbeBezier,
  "ecuatii-neliniare": continutEcuatiiNeliniare,
  "eliminare-gaussiana": continutEliminareGaussiana,
  "factorizari-lu": continutFactorizariLu,
  fft: continutFft,
  "metode-iterative": continutMetodeIterative,
  "norme-si-ortogonalitate": continutNormeSiOrtogonalitate,
  "metode-de-gradient": continutMetodeDeGradient,
  pagerank: continutPagerank,
};

export function getContinut(slug: string | undefined): ContinutPagina | undefined {
  return slug ? CONTINUT[slug] : undefined;
}

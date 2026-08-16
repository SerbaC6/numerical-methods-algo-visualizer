import { continutDerivareNumerica } from "@/content/derivare-numerica";
import { continutDvs } from "@/content/dvs";
import { continutAlgoritmulQr } from "@/content/algoritmul-qr";
import { continutAlgoritmulThomas } from "@/content/algoritmul-thomas";
import { continutCuadraturi } from "@/content/cuadraturi-adaptive-si-gaussiene";
import { continutCurbeBezier } from "@/content/curbe-bezier";
import { continutEcuatiiDiferentiale } from "@/content/ecuatii-diferentiale";
import { continutEcuatiiNeliniare } from "@/content/ecuatii-neliniare";
import { continutEliminareGaussiana } from "@/content/eliminare-gaussiana";
import { continutFactorizariLu } from "@/content/factorizari-lu";
import { continutFft } from "@/content/fft";
import { continutInterpolarePolinomiala } from "@/content/interpolare-polinomiala";
import { continutMetodeDeGradient } from "@/content/metode-de-gradient";
import { continutMetodelePuterii } from "@/content/metodele-puterii";
import { continutMetodeIterative } from "@/content/metode-iterative";
import { continutNewtonCotes } from "@/content/newton-cotes";
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
  "cuadraturi-adaptive-si-gaussiene": continutCuadraturi,
  "curbe-bezier": continutCurbeBezier,
  "ecuatii-diferentiale": continutEcuatiiDiferentiale,
  "ecuatii-neliniare": continutEcuatiiNeliniare,
  "eliminare-gaussiana": continutEliminareGaussiana,
  "factorizari-lu": continutFactorizariLu,
  fft: continutFft,
  "interpolare-polinomiala": continutInterpolarePolinomiala,
  "metode-iterative": continutMetodeIterative,
  "newton-cotes": continutNewtonCotes,
  "metodele-puterii": continutMetodelePuterii,
  "norme-si-ortogonalitate": continutNormeSiOrtogonalitate,
  "metode-de-gradient": continutMetodeDeGradient,
  pagerank: continutPagerank,
};

export function getContinut(slug: string | undefined): ContinutPagina | undefined {
  return slug ? CONTINUT[slug] : undefined;
}

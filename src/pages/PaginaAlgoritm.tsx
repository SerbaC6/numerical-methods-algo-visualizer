import { useEffect, type ComponentType, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router";

import { CAPITOLE, getAlgoritm, getVecini, SECTIUNI } from "@/algorithms/registry";
import { AnimatiaAlgoritmuluiQr } from "@/components/content/AnimatiaAlgoritmuluiQr";
import { AnimatiaDvs } from "@/components/content/AnimatiaDvs";
import { AnimatiaBezier } from "@/components/content/AnimatiaBezier";
import { InterfataBezier } from "@/components/content/InterfataBezier";
import { AnimatiaGivens } from "@/components/content/AnimatiaGivens";
import { AnimatiaHouseholder } from "@/components/content/AnimatiaHouseholder";
import { AnimatiaEliminariiGaussiene } from "@/components/content/AnimatiaEliminariiGaussiene";
import { AnimatiaFactorizariiLu } from "@/components/content/AnimatiaFactorizariiLu";
import { InterfataDerivareNumerica } from "@/components/content/InterfataDerivareNumerica";
import { InterfataOrtogonalitate } from "@/components/content/InterfataOrtogonalitate";
import { AnimatiaMetodelorIterative } from "@/components/content/AnimatiaMetodelorIterative";
import { AnimatiaMatriceiPageRank } from "@/components/content/AnimatiaMatriceiPageRank";
import { AnimatieCoborarePeGradient } from "@/components/content/AnimatieCoborarePeGradient";
import { InterfataEcuatiiNeliniare } from "@/components/content/InterfataEcuatiiNeliniare";
import { InterfataMetodeDeGradient } from "@/components/content/InterfataMetodeDeGradient";
import { TeorieScurta } from "@/components/content/TeorieScurta";
import { VideoFft } from "@/components/content/VideoFft";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getContinut } from "@/content";

/**
 * Secțiunile din interiorul unei pagini de metodă, în ordinea din `Plan.md`.
 * A nu se confunda cu `SECTIUNI` din registru, care sunt grupurile din
 * cuprins — de aici sufixul.
 *
 * Fiecare are unealta ei, fixată: „Vizual" e clipul narativ dinaintea oricărei
 * formule, „Interactiv" e interfața cu care se schimbă parametrii. Vezi
 * `CLAUDE.md`, §„Clip sau `motion`". Clipul e scris în cod și rulează pe ceasul
 * lui (`Clip`); interfața primește parametrii utilizatorului, clipul nu.
 *
 * `id` e separat de `titlu` fiindcă ajunge în atributul `id` al titlului, iar
 * „Teorie pe scurt" ar da un id cu spații. `aria-labelledby` citește spațiile ca
 * separator între mai multe id-uri, deci ar căuta trei elemente inexistente
 * („sectiune-Teorie", „pe", „scurt") și secțiunea ar rămâne fără nume la
 * cititorul de ecran.
 */
const SECTIUNI_PAGINA = [
  { id: "vizual", titlu: "Vizual", descriere: "Animația care arată metoda în ansamblu." },
  {
    id: "teorie",
    titlu: "Teorie pe scurt",
    descriere: "Un paragraf și formula, luate din cursul sursă.",
  },
  {
    id: "interactiv",
    titlu: "Interactiv",
    descriere: "Interfața cu care schimbi parametrii și vezi ce se întâmplă.",
  },
] as const;

/**
 * Ce piesă vizuală are fiecare pagină, pe slug.
 *
 * Tabel, nu un lanț de condiții: cu trei pagini scrise mergeau și `if`-urile,
 * dar fiecare pagină nouă adăuga încă o ramură în JSX-ul de mai jos, iar
 * secțiunea „Vizual" și cea „Interactiv" ajungeau descrise în locuri diferite.
 * Aici o pagină e un rând; ce lipsește din rând rămâne schelet tăcut.
 */
const PIESE_PAGINA: Record<string, { vizual?: ComponentType; interactiv?: ComponentType }> = {
  "factorizari-lu": { vizual: AnimatiaFactorizariiLu },
  "ecuatii-neliniare": { interactiv: InterfataEcuatiiNeliniare },
  "eliminare-gaussiana": { vizual: AnimatiaEliminariiGaussiene },
  "metode-de-gradient": {
    vizual: AnimatieCoborarePeGradient,
    interactiv: InterfataMetodeDeGradient,
  },
  "metode-iterative": { vizual: AnimatiaMetodelorIterative },
  "norme-si-ortogonalitate": { interactiv: InterfataOrtogonalitate },
  pagerank: { vizual: AnimatiaMatriceiPageRank },
  "algoritmul-qr": { vizual: AnimatiaAlgoritmuluiQr },
  dvs: { vizual: AnimatiaDvs },
  "curbe-bezier": { vizual: AnimatiaBezier, interactiv: InterfataBezier },
  "derivare-numerica": { interactiv: InterfataDerivareNumerica },
  fft: { vizual: VideoFft },
};

/**
 * Clipurile care nu stau în „Vizual", ci lipite de metoda lor din teorie.
 *
 * Deocamdată doar pagina 2, și cu motiv: Householder și Givens sunt două
 * geometrii diferite pentru aceeași problemă, iar fiecare se înțelege exact
 * lângă formula ei. Puse amândouă sus, într-o secțiune „Vizual", cereau
 * cititorului să țină minte oglinda până jos, la `P = I − 2ddᵀ/dᵀd`.
 */
const CLIPURI_IN_TEORIE: Record<string, Record<string, ReactNode>> = {
  "norme-si-ortogonalitate": {
    householder: <AnimatiaHouseholder />,
    givens: <AnimatiaGivens />,
  },
};

/**
 * Scheletul unei pagini de metodă. Aceeași componentă pentru toate rutele —
 * conținutul propriu-zis vine în Faza 7, câte o pagină pe rând.
 */
export default function PaginaAlgoritm() {
  const { slug } = useParams();
  const pagina = getAlgoritm(slug);

  useEffect(() => {
    if (!pagina) return;
    document.title = `${pagina.titlu} · Metode Numerice`;
    return () => {
      document.title = "Vizualizator de Metode Numerice";
    };
  }, [pagina]);

  if (!pagina) return <Navigate to="/404" replace />;

  const { anterior, urmator } = getVecini(pagina.numar);
  const continut = getContinut(pagina.slug);
  // Secțiunea din cuprins („Metode liniare", „Valori proprii și valori
  // singulare", „Metode neliniare", „Interpolare, integrare și ODE") —
  // capitolul e mai fin decât atât și nu apare în antet.
  const sectiune = CAPITOLE[pagina.capitol].sectiune;

  // O pagină care **nu primește** o secțiune, prin decizie, n-o are deloc — nu un
  // schelet gol, care ar spune tăcut „aici lipsește ceva". Amândouă steagurile
  // sunt `undefined` pentru paginile obișnuite, deci doar excepțiile scot ceva:
  // pagina 6 e fără clip, pagina 9 fără interfață interactivă.
  const sectiuni = SECTIUNI_PAGINA.filter(
    (s) =>
      (s.id !== "vizual" || pagina.clip !== false) &&
      (s.id !== "interactiv" || pagina.interactiv !== false),
  );

  return (
    <>
      {/* Antetul e doar breadcrumb + titlu.
          - Metodele paginii (`pagina.metode`) **nu** se afișează: rămân în
            registru, ca material pentru căutarea din header.
          - Numărul paginii a plecat și el; secțiunea din breadcrumb spune deja
            unde ești, iar cifra „3 din 19" nu ajuta pe nimeni să navigheze.
          - Descrierea (`pagina.descriere`) rămâne doar pe cardul din cuprins:
            pe pagină, teoria începe oricum cu ce ar fi spus ea. */}
      <PageHeader
        titlu={pagina.titlu}
        breadcrumb={[
          { eticheta: "Cuprins", to: "/" },
          {
            eticheta: SECTIUNI[sectiune].titlu,
            to: { pathname: "/", hash: `#sectiune-${sectiune}` },
          },
          { eticheta: pagina.titlu },
        ]}
      />

      {/* Fără spațiu jos: navigația între metode e ultima piesă, iar distanța
          până la subsol o dă subsolul însuși (`spatiuSus="stramt"`). */}
      <Container>
        {/* Fără anunț de „pagină în lucru”: scheletele de mai jos țin locul
            conținutului în tăcere. Cursul-sursă e în `registry.ts` și în
            tabelul din Faza 7 din `Progress.md`. */}
        {/* Secțiunile stau depărtate: pe paginile pline (clip, teorie, interfață)
            respirația dintre ele e singurul lucru care le ține separate vizual. */}
        <div className="flex flex-col gap-14">
          {sectiuni.map((s) => {
            // Secțiunea are conținut? Îl arătăm. Dacă nu, rămâne scheletul —
            // fără nicio etichetă care să spună că lipsește ceva.
            const scris = s.id === "teorie" ? continut?.teorie : undefined;
            const piese = PIESE_PAGINA[pagina.slug];
            const Piesa =
              s.id === "interactiv"
                ? piese?.interactiv
                : s.id === "vizual"
                  ? piese?.vizual
                  : undefined;

            return (
              <section key={s.id} aria-labelledby={`sectiune-${s.id}`}>
                <h2 id={`sectiune-${s.id}`} className="text-sectiune font-bold">
                  {s.titlu}
                </h2>
                {scris ? (
                  <div className="mt-6">
                    <TeorieScurta continut={scris} dupaMetoda={CLIPURI_IN_TEORIE[pagina.slug]} />
                  </div>
                ) : Piesa ? (
                  <div className="mt-6">
                    <Piesa />
                  </div>
                ) : (
                  <>
                    <p className="text-text-slab mt-1 text-sm">{s.descriere}</p>
                    <Skeleton className="mt-3 h-48 w-full" />
                  </>
                )}
              </section>
            );
          })}
        </div>

        <nav
          aria-label="Navigație între pagini"
          className="border-bordura mt-12 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between"
        >
          {anterior ? (
            <Link
              to={`/algoritm/${anterior.slug}`}
              className="text-text-slab hover:text-text tinta-atingere inline-flex items-center gap-2 text-sm font-semibold"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {anterior.titlu}
            </Link>
          ) : (
            <span />
          )}
          {urmator && (
            <Link
              to={`/algoritm/${urmator.slug}`}
              className="text-text-slab hover:text-text tinta-atingere inline-flex items-center gap-2 text-sm font-semibold sm:text-right"
            >
              {urmator.titlu}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      </Container>
    </>
  );
}

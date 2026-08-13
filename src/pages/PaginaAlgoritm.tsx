import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router";

import { CAPITOLE, getAlgoritm, getVecini, SECTIUNI } from "@/algorithms/registry";
import { InterfataEcuatiiNeliniare } from "@/components/content/InterfataEcuatiiNeliniare";
import { TeorieScurta } from "@/components/content/TeorieScurta";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getContinut } from "@/content";

/**
 * Secțiunile din interiorul unei pagini de metodă, în ordinea din `Plan.md`.
 * A nu se confunda cu `SECTIUNI` din registru, care sunt cele trei grupuri din
 * cuprins — de aici sufixul.
 *
 * Fiecare are unealta ei, fixată: „Vizual" e clipul Manim pre-randat,
 * „Interactiv" e interfața scrisă cu `motion`. Vezi `CLAUDE.md`, §„Manim sau
 * `motion`".
 */
const SECTIUNI_PAGINA = [
  { titlu: "Vizual", descriere: "Animația Manim care arată metoda în ansamblu." },
  { titlu: "Teorie pe scurt", descriere: "Un paragraf și formula, luate din cursul sursă." },
  {
    titlu: "Interactiv",
    descriere: "Interfața cu care schimbi parametrii și vezi ce se întâmplă.",
  },
] as const;

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
  // Secțiunea din cuprins („Metode liniare", „Metode neliniare", „Interpolare,
  // integrare și ODE") — capitolul e mai fin decât atât și nu apare în antet.
  const sectiune = CAPITOLE[pagina.capitol].sectiune;

  // O pagină fără clip Manim nu are secțiunea „Vizual" deloc — nu un schelet
  // gol, care ar spune tăcut „aici lipsește ceva". `clipManim` e `undefined`
  // pentru paginile obișnuite, deci doar excepția scoate secțiunea.
  const sectiuni = SECTIUNI_PAGINA.filter(
    (s) => s.titlu !== "Vizual" || pagina.clipManim !== false,
  );

  return (
    <>
      {/* Antetul e doar breadcrumb + titlu + descriere.
          - Metodele paginii (`pagina.metode`) **nu** se afișează: rămân în
            registru, ca material pentru căutarea din header.
          - Numărul paginii a plecat și el; secțiunea din breadcrumb spune deja
            unde ești, iar cifra „3 din 19" nu ajuta pe nimeni să navigheze. */}
      <PageHeader
        titlu={pagina.titlu}
        descriere={pagina.descriere}
        breadcrumb={[
          { eticheta: "Cuprins", to: "/" },
          {
            eticheta: SECTIUNI[sectiune].titlu,
            to: { pathname: "/", hash: `#sectiune-${sectiune}` },
          },
          { eticheta: pagina.titlu },
        ]}
      />

      <Container className="pb-8">
        {/* Fără anunț de „pagină în lucru”: scheletele de mai jos țin locul
            conținutului în tăcere. Cursul-sursă e în `registry.ts` și în
            tabelul din Faza 7 din `Progress.md`. */}
        <div className="flex flex-col gap-8">
          {sectiuni.map((s) => {
            // Secțiunea are conținut? Îl arătăm. Dacă nu, rămâne scheletul —
            // fără nicio etichetă care să spună că lipsește ceva.
            const scris = s.titlu === "Teorie pe scurt" ? continut?.teorie : undefined;
            const interactiv = s.titlu === "Interactiv" && pagina.slug === "ecuatii-neliniare";

            return (
              <section key={s.titlu} aria-labelledby={`sectiune-${s.titlu}`}>
                <h2 id={`sectiune-${s.titlu}`} className="text-sectiune font-bold">
                  {s.titlu}
                </h2>
                {scris ? (
                  <div className="mt-4">
                    <TeorieScurta continut={scris} />
                  </div>
                ) : interactiv ? (
                  <div className="mt-4">
                    <InterfataEcuatiiNeliniare />
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

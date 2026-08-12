import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router";

import { CAPITOLE, getAlgoritm, getVecini } from "@/algorithms/registry";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/** Secțiunile pe care le va avea fiecare pagină, în ordinea din `Plan.md`. */
const SECTIUNI = [
  { titlu: "Vizual", descriere: "Animația Manim care arată metoda în ansamblu." },
  { titlu: "Teorie pe scurt", descriere: "Un paragraf și formula, luate din cursul sursă." },
  {
    titlu: "Interactiv",
    descriere: "Interfața cu care schimbi parametrii și vezi ce se întâmplă.",
  },
] as const;

/**
 * Scheletul unei pagini de metodă. Aceeași componentă pentru toate cele 14 rute —
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

  return (
    <>
      <PageHeader
        supratitlu={`Pagina ${pagina.numar} din 14 · ${CAPITOLE[pagina.capitol].titlu}`}
        titlu={pagina.titlu}
        descriere={pagina.descriere}
        breadcrumb={[{ eticheta: "Cuprins", to: "/" }, { eticheta: pagina.titlu }]}
      >
        <ul className="flex flex-wrap gap-1.5">
          {pagina.metode.map((m) => (
            <li key={m}>
              <Badge variant="secondary">{m}</Badge>
            </li>
          ))}
        </ul>
      </PageHeader>

      <Container className="pb-8">
        {/* Fără anunț de „pagină în lucru”: scheletele de mai jos țin locul
            conținutului în tăcere. Cursul-sursă e în `registry.ts` și în
            tabelul din Faza 7 din `Progress.md`. */}
        <div className="flex flex-col gap-8">
          {SECTIUNI.map((s) => (
            <section key={s.titlu} aria-labelledby={`sectiune-${s.titlu}`}>
              <h2 id={`sectiune-${s.titlu}`} className="text-sectiune font-bold">
                {s.titlu}
              </h2>
              <p className="text-text-slab mt-1 text-sm">{s.descriere}</p>
              <Skeleton className="mt-3 h-48 w-full" />
            </section>
          ))}
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

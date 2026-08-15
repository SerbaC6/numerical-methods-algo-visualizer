import { ChevronRight } from "lucide-react";
import { Link, type To } from "react-router";

import { Container } from "@/components/layout/Container";

export type PageHeaderProps = {
  /** Textul de deasupra titlului (capitol, „Pagina 3 din 18" etc.). */
  supratitlu?: string;
  titlu: string;
  descriere?: string;
  /**
   * Ultimul element e pagina curentă: nu e link și primește `aria-current`.
   * Un element intermediar fără `to` rămâne text simplu — dar **fără**
   * `aria-current`, altfel cititorul de ecran ar anunța două „pagini curente".
   */
  breadcrumb?: { eticheta: string; to?: To }[];
  children?: React.ReactNode;
};

/** Antetul unei pagini interioare: breadcrumb, titlu, descriere, extra (badge-uri). */
export function PageHeader({
  supratitlu,
  titlu,
  descriere,
  breadcrumb,
  children,
}: PageHeaderProps) {
  return (
    <Container className="pt-8 pb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Firimituri" className="mb-4">
          <ol className="text-text-slab flex flex-wrap items-center gap-1 text-sm">
            {breadcrumb.map((item, i) => (
              <li key={item.eticheta} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />}
                {item.to ? (
                  <Link to={item.to} className="hover:text-text underline-offset-4 hover:underline">
                    {item.eticheta}
                  </Link>
                ) : (
                  <span
                    aria-current={i === breadcrumb.length - 1 ? "page" : undefined}
                    className="text-text"
                  >
                    {item.eticheta}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {supratitlu && (
        <p className="text-accent-slab text-xs font-semibold tracking-wide uppercase">
          {supratitlu}
        </p>
      )}
      <h1 className="text-titlu mt-1 font-extrabold">{titlu}</h1>
      {descriere && <p className="text-text-slab mt-3 max-w-2xl">{descriere}</p>}
      {children && <div className="mt-4">{children}</div>}
    </Container>
  );
}

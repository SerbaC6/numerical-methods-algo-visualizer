import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";

const AN = new Date().getFullYear();

/**
 * Coloana din dreapta e locul paginilor statice (`/despre`, `/contact`). Cât
 * timp rutele nu există, rămâne goală — nu anunțăm în interfață ce urmează;
 * evidența stă în `Progress.md`.
 */
export function Footer() {
  return (
    <footer className="border-bordura mt-20 border-t">
      <Container className="py-12">
        <div className="flex items-center gap-2.5">
          <Logo className="shrink-0" />
          <span className="leading-tight font-bold">
            Metode
            <span className="text-accent-slab"> Numerice</span>
          </span>
        </div>
        <p className="text-text-slab mt-3 max-w-xs text-sm">
          Metodele din curs, fiecare cu animația, formula și interfața ei.
        </p>

        <div className="border-bordura text-text-slab mt-10 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {AN} · Vizualizator de metode numerice · construit cu React și Manim</p>
          <p>
            Conținutul urmează cursul predat. Site static, fără conturi, fără cookies, fără
            urmărire.
          </p>
        </div>
      </Container>
    </footer>
  );
}

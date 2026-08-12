import { NavLink } from "react-router";

import { CautareMetode } from "@/components/layout/CautareMetode";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

/**
 * Bara de sus: siglă, căutarea în toate metodele și comutatorul de temă. Atât —
 * cuprinsul stă pe pagina principală, sub hero; sigla e deja drumul înapoi
 * spre el. Meniul-sertar are sens abia când apar paginile statice.
 */
export function Header() {
  return (
    <header className="border-bordura bg-fundal/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        <NavLink
          to="/"
          className="tinta-atingere -mx-2 flex shrink-0 items-center gap-2.5 rounded-md px-2"
          aria-label="Acasă — Vizualizator de Metode Numerice"
        >
          <Logo className="shrink-0" />
          <span className="hidden leading-tight font-bold sm:inline">
            Metode
            <span className="text-accent-slab"> Numerice</span>
          </span>
        </NavLink>

        <CautareMetode className="max-w-xs flex-1" />

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}

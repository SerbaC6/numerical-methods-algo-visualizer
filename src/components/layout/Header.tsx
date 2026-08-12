import { NavLink } from "react-router";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

const LINKURI = [{ to: "/", eticheta: "Cuprins" }];

/**
 * Bara de sus. Pe mobil rămân doar sigla și comutatorul de temă — meniul-sertar
 * are sens abia când apar paginile statice (Faza 3, restul).
 */
export function Header() {
  return (
    <header className="border-bordura bg-fundal/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <NavLink
          to="/"
          className="tinta-atingere -mx-2 flex items-center gap-2.5 rounded-md px-2"
          aria-label="Acasă — Vizualizator de Metode Numerice"
        >
          <Logo className="shrink-0" />
          <span className="leading-tight font-bold">
            Metode
            <span className="text-accent-slab"> Numerice</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          <nav aria-label="Navigație principală" className="hidden sm:block">
            <ul className="flex items-center gap-1">
              {LINKURI.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end
                    className={({ isActive }) =>
                      cn(
                        "duration-rapid ease-standard hover:text-text flex h-9 items-center rounded-md px-3 text-sm font-semibold transition-colors",
                        isActive ? "text-text bg-secondary" : "text-text-slab",
                      )
                    }
                  >
                    {link.eticheta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}

import { NavLink } from "react-router";

import { CautareMetode } from "@/components/layout/CautareMetode";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { ProgresDerulare } from "@/components/layout/ProgresDerulare";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

/**
 * Bara de sus: siglă, căutarea în toate metodele și comutatorul de temă. Atât —
 * cuprinsul stă pe pagina principală, sub hero; sigla e deja drumul înapoi
 * spre el.
 *
 * **Fără meniu-sertar**, decis: căutarea duce direct pe metodă de pe orice
 * pagină, iar paginile de sine stătătoare (contact, termeni, confidențialitate)
 * stau în subsol. Un sertar ar dubla subsolul și ar adăuga o capcană de focus.
 */
export function Header() {
  return (
    <header className="border-bordura bg-fundal/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Distanțele din bară se măsoară între lucrurile care se **văd** (sigla,
            câmpul, pictograma temei), nu între cutiile lor: și sigla, și butonul
            de temă au aer în interior, iar ochiul îl adună la spațiul dintre
            elemente. Butonul de temă fixează măsura — pictograma lui de 16 px
            stă centrată într-o țintă de atingere de 44 px, deci are 14 px de
            fiecare parte —, iar sigla primește aceeași valoare, `px-3.5`.

            Negativul e **doar la stânga**: `-ml-3.5` scoate din așezare aerul
            dinspre marginea containerului, ca sigla să rămână lipită de ea, iar
            cel dinspre câmp rămâne în așezare, fiindcă el e chiar distanța pe
            care o vede ochiul. Cu `-mx-3.5` se anulau amândouă și golul dinspre
            câmp rămânea mai mic decât cel dinspre butonul de temă — exact buba
            de reparat. Pe telefon ies 22 px de fiecare parte a câmpului. */}
        <NavLink
          to="/"
          className="tinta-atingere -ml-3.5 flex shrink-0 items-center gap-2.5 rounded-md px-3.5"
          aria-label="Acasă — numerical-methods-visualizer"
        >
          <Logo className="shrink-0" />
          <span className="hidden leading-tight font-bold sm:inline">
            numerical-methods
            <span className="text-accent-slab">-visualizer</span>
          </span>
        </NavLink>

        {/* Numele metodelor sunt lungi („eliminare gaussiană cu pivotare"), iar
            câmpul rămâne oricum `flex-1`: pe ecrane mici se strânge singur. */}
        <CautareMetode className="max-w-sm flex-1 sm:max-w-md" />

        {/* `-mr-3.5` face pentru buton ce face `-ml-3.5` pentru siglă, în oglindă:
            scoate din așezare aerul dinspre marginea containerului, ca pictograma
            temei să stea la aceeași distanță de margine ca sigla. */}
        <div className="-mr-3.5 flex shrink-0 items-center gap-1">
          <ThemeToggle />
        </div>
      </Container>

      {/* Stă peste linia de jos a antetului, ca să nu mai adauge un rând. */}
      <ProgresDerulare />
    </header>
  );
}

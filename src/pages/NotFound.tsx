import { Link } from "react-router";

import { NUMAR_PAGINI } from "@/algorithms/registry";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container ingust className="py-24 text-center">
      <p className="text-accent-slab font-mono text-sm font-semibold">404</p>
      <h1 className="text-titlu mt-2 font-extrabold">Pagina asta nu există.</h1>
      <p className="text-text-slab mt-3">
        Poate a fost un link vechi sau o greșeală de tastare. Cuprinsul le are pe toate cele{" "}
        {NUMAR_PAGINI}.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">Înapoi la cuprins</Link>
        </Button>
        {/* Un link rupt de la noi n-are cum să se repare dacă nu aflăm de el. */}
        <Button asChild variant="ghost">
          <Link to="/contact">Spune-ne ce link te-a adus aici</Link>
        </Button>
      </div>
    </Container>
  );
}

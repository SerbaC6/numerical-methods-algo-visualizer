import { Link } from "react-router";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container ingust className="py-24 text-center">
      <p className="text-accent-slab font-mono text-sm font-semibold">404</p>
      <h1 className="text-titlu mt-2 font-extrabold">Pagina asta nu există.</h1>
      <p className="text-text-slab mt-3">
        Poate a fost un link vechi sau o greșeală de tastare. Cuprinsul le are pe toate cele 14.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Înapoi la cuprins</Link>
      </Button>
    </Container>
  );
}

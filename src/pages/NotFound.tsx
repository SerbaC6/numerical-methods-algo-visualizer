import { Link } from "react-router";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

/**
 * Pagina de 404, ținută pe un singur ecran: eticheta mică, o frază mare și
 * drumul înapoi. Nu are paragraf explicativ — fraza spune deja tot, iar un
 * rând de proză sub ea ar micșora exact lucrul care ajută: titlul.
 */
export default function NotFound() {
  return (
    // Spațiul de sus și de jos scade pe ecranele scunde (telefon în peisaj):
    // acolo, cu padding de desktop, butoanele ajungeau sub marginea ecranului.
    <section className="relative flex min-h-[50svh] items-center overflow-hidden py-12 sm:py-20 lg:py-28">
      {/* Aceeași grilă ca în hero, ca pagina goală să nu pară o eroare de randare. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--viz-grila) 1px, transparent 1px), linear-gradient(90deg, var(--viz-grila) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(85% 65% at 20% 45%, #000 10%, transparent 70%)",
        }}
      />

      <Container>
        <p className="text-text-slab font-mono text-sm font-semibold tracking-wide">
          404 — pagina nu există
        </p>
        <h1 className="text-afis mt-3 max-w-4xl font-extrabold text-balance">
          Ai ieșit din <span className="text-accent-slab">interval</span>…{" "}
          {/* Cuvintele cu cratimă nu se rup la capăt de rând: pe telefon „Întoarce-te" cădea în
              două, iar cratima se citea ca despărțire în silabe. */}
          <span className="whitespace-nowrap">Întoarce-te</span> la cuprins și pornește pe altă
          cale.
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link to="/">Înapoi la cuprins</Link>
          </Button>
          {/* Un link rupt de la noi n-are cum să se repare dacă nu aflăm de el. */}
          <Button asChild size="lg" variant="outline" className="rounded-full px-6">
            <Link to="/contact">Spune-ne ce link te-a adus aici</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

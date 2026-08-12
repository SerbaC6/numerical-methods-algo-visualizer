import { lazy, Suspense, useEffect, useState } from "react";

import { getAlgoritmiPeSectiuni } from "@/algorithms/registry";
import { AlgorithmCard } from "@/components/content/AlgorithmCard";
import { Container } from "@/components/layout/Container";

/** Panoul aduce cu el biblioteca de animație; textul din hero nu-l așteaptă. */
const TextFlippingBoard = lazy(() =>
  import("@/components/ui/text-flipping-board").then((m) => ({ default: m.TextFlippingBoard })),
);

const SECTIUNI_CUPRINS = getAlgoritmiPeSectiuni();

/** Ce scrie panoul din hero. Maximum 16 semne pe rând, 4 rânduri. */
const MESAJE = [
  "14 METODE\nNUMERICE\nPAS CU PAS",
  "BISECȚIA\nNU DĂ GREȘ\nNICIODATĂ",
  "NEWTON CONVERGE\nPĂTRATIC",
  "TRAPEZE, SIMPSON\nȘI ROMBERG",
  "EULER PORNEȘTE\nRUNGE-KUTTA\nAJUNGE",
];

const PAUZA_MESAJ = 5000;

export default function Acasa() {
  return (
    <>
      <Hero />

      <Container className="flex flex-col gap-12 py-12">
        {SECTIUNI_CUPRINS.map(({ sectiune, titlu, algoritmi }) => (
          <section key={sectiune} aria-labelledby={`sectiune-${sectiune}`}>
            <h2
              id={`sectiune-${sectiune}`}
              className="border-bordura mb-5 scroll-mt-24 border-b pb-3 text-xl font-bold"
            >
              {titlu}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {algoritmi.map((pagina) => (
                <li key={pagina.slug}>
                  <AlgorithmCard
                    titlu={pagina.titlu}
                    descriere={pagina.descriere}
                    to={`/algoritm/${pagina.slug}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </>
  );
}

/**
 * Hero-ul: titlul într-o parte, panoul split-flap în cealaltă. Înălțimea o dă
 * conținutul — fără `min-height` pe ecran întreg, ca primele carduri să înceapă
 * imediat sub el.
 */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(var(--viz-grila) 1px, transparent 1px), linear-gradient(90deg, var(--viz-grila) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(140% 95% at 30% 0%, #000 25%, transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="bg-accent/20 pointer-events-none absolute -top-40 -left-32 -z-10 size-[36rem] rounded-full blur-3xl"
      />

      <Container className="grid w-full items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div>
          <h1 className="text-afis font-extrabold">
            Vezi cum lucrează <span className="text-accent-slab">algoritmii</span>, pas cu pas.
          </h1>
          <p className="text-text-slab mt-4 max-w-2xl sm:mt-6 sm:text-xl">
            Fiecare metodă din curs, explicată prin animație și printr-o interfață cu care te poți
            juca — cu formula alături, ca să vezi de unde vine fiecare număr.
          </p>
        </div>

        <PanouMesaje />
      </Container>
    </section>
  );
}

/** Panoul split-flap din hero, care schimbă mesajul din 5 în 5 secunde. */
function PanouMesaje() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESAJE.length), PAUZA_MESAJ);
    return () => clearInterval(id);
  }, []);

  return (
    <Suspense
      fallback={<div className="bg-noapte border-bordura aspect-2/1 w-full rounded-xl border" />}
    >
      <TextFlippingBoard
        text={MESAJE[index] ?? ""}
        gridRows={4}
        gridCols={16}
        duration={0.6}
        className="max-w-none"
      />
    </Suspense>
  );
}

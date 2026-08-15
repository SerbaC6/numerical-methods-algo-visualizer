import { lazy, Suspense, useEffect, useState } from "react";

import { ALGORITMI, getAlgoritmiPeSectiuni } from "@/algorithms/registry";
import { AlgorithmCard } from "@/components/content/AlgorithmCard";
import { Container } from "@/components/layout/Container";

/** Panoul aduce cu el biblioteca de animație; textul din hero nu-l așteaptă. */
const TextFlippingBoard = lazy(() =>
  import("@/components/ui/text-flipping-board").then((m) => ({ default: m.TextFlippingBoard })),
);

const SECTIUNI_CUPRINS = getAlgoritmiPeSectiuni();

/** Panoul din hero: 4 rânduri a câte 16 semne. */
const RANDURI_PANOU = 4;
const COLOANE_PANOU = 16;

/**
 * Rupe titlul în rânduri care încap pe panou, fără să taie cuvinte.
 *
 * Titlul rămâne exact cel din registru — se schimbă doar unde cade rândul, nu
 * cuvintele. Dacă un titlu viitor nu încape, se vede aici, nu pe ecran.
 */
function randuriPanou(titlu: string): string[] {
  const randuri: string[] = [];
  let curent = "";

  for (const cuvant of titlu.toUpperCase().split(" ")) {
    const incercare = curent ? `${curent} ${cuvant}` : cuvant;
    if (incercare.length <= COLOANE_PANOU) {
      curent = incercare;
    } else {
      if (curent) randuri.push(curent);
      curent = cuvant;
    }
  }
  if (curent) randuri.push(curent);

  return randuri;
}

/**
 * Ce scrie panoul: titlul fiecărei pagini din registru, pe rând, în ordinea din
 * cuprins. Lista nu se scrie de mână — dacă apare o pagină nouă, apare și în
 * panou, cu titlul ei adevărat.
 */
const MESAJE = ALGORITMI.map((pagina) => randuriPanou(pagina.titlu).join("\n"));

// Un titlu care nu încape ar fi tăiat tăcut de panou. În dezvoltare se aude.
if (import.meta.env.DEV) {
  for (const pagina of ALGORITMI) {
    const randuri = randuriPanou(pagina.titlu);
    const prea_lat = randuri.find((r) => r.length > COLOANE_PANOU);
    if (randuri.length > RANDURI_PANOU || prea_lat) {
      console.warn(
        `Titlul „${pagina.titlu}" nu încape pe panou (${RANDURI_PANOU}×${COLOANE_PANOU}).`,
      );
    }
  }
}

const PAUZA_MESAJ = 4250;

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
            Metode numerice explicate <span className="text-accent-slab">vizual</span>, pas cu pas.
          </h1>
          <p className="text-text-slab mt-4 max-w-2xl sm:mt-6 sm:text-xl">
            Fiecare metodă din curs, arătată prin animație și printr-o interfață cu care te poți
            juca — cu formula alături, ca să vezi de unde vine fiecare număr.
          </p>
        </div>

        <PanouMesaje />
      </Container>
    </section>
  );
}

/** Panoul split-flap din hero, care schimbă mesajul la fiecare 4,25 secunde. */
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
        gridRows={RANDURI_PANOU}
        gridCols={COLOANE_PANOU}
        duration={0.6}
        className="max-w-none"
      />
    </Suspense>
  );
}

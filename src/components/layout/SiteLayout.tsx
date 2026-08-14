import { useLocation } from "react-router";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Scheletul comun al tuturor paginilor: skip link, header, conținut, footer. */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  // Paginile de algoritm se termină cu săgețile către metoda anterioară și cea
  // următoare; subsolul se apropie de ele, ca navigația să nu rămână suspendată
  // în gol. Ruta e singurul loc de unde se poate ști: pagina și subsolul sunt
  // frați, deci nu se pot înțelege printr-o variabilă moștenită.
  const esteAlgoritm = useLocation().pathname.startsWith("/algoritm/");

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#continut"
        className="bg-accent focus:ring-ring sr-only rounded-md px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:ring-2"
      >
        Sari la conținut
      </a>

      <Header />

      <main id="continut" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <Footer spatiuSus={esteAlgoritm ? "stramt" : "larg"} />
    </div>
  );
}

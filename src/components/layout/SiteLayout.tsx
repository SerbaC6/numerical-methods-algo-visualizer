import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/** Scheletul comun al tuturor paginilor: skip link, header, conținut, footer. */
export function SiteLayout({ children }: { children: React.ReactNode }) {
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

      <Footer />
    </div>
  );
}

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import { Container } from "@/components/layout/Container";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

const Acasa = lazy(() => import("@/pages/Acasa"));
const PaginaAlgoritm = lazy(() => import("@/pages/PaginaAlgoritm"));
const NotFound = lazy(() => import("@/pages/NotFound"));
// Instrument intern. Ternarul pe `import.meta.env.DEV` e important: la build
// devine `false ? ... : null`, deci pagina nu ajunge deloc în producție.
const DesignSystem = import.meta.env.DEV ? lazy(() => import("@/pages/DesignSystem")) : null;

function Incarcare() {
  return (
    <Container className="flex flex-col gap-4 py-16">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-64 w-full" />
    </Container>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <ScrollToTop />
      <SiteLayout>
        <Suspense fallback={<Incarcare />}>
          <Routes>
            <Route path="/" element={<Acasa />} />
            <Route path="/algoritm/:slug" element={<PaginaAlgoritm />} />
            {DesignSystem && <Route path="/design-system" element={<DesignSystem />} />}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </SiteLayout>
    </TooltipProvider>
  );
}

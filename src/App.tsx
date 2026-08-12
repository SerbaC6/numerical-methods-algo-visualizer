import { TooltipProvider } from "@/components/ui/tooltip";
import DesignSystem from "@/pages/DesignSystem";

/**
 * Până la Faza 3 (rutare) aplicația arată direct pagina de design system,
 * ca să putem verifica toate componentele în ambele teme. Când intră
 * react-router, pagina rămâne pe `/design-system`, doar în dev.
 */
export default function App() {
  return (
    <TooltipProvider>
      <DesignSystem />
    </TooltipProvider>
  );
}

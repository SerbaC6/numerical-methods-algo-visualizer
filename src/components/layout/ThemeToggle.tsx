import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleTheme, useTheme } from "@/hooks/use-theme";

/** Comutatorul de temă. Preferința se ține în `localStorage`, atât. */
export function ThemeToggle() {
  const tema = useTheme();
  const spreLuminoasa = tema === "dark";
  const eticheta = spreLuminoasa ? "Treci pe tema luminoasă" : "Treci pe tema întunecată";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="tinta-atingere"
          aria-label={eticheta}
          onClick={toggleTheme}
        >
          {spreLuminoasa ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{eticheta}</TooltipContent>
    </Tooltip>
  );
}

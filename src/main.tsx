import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import App from "@/App";
import { initTheme } from "@/hooks/use-theme";
import "@/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Elementul #root lipsește din index.html");

// înainte de prima randare, ca să nu pâlpâie tema
initTheme();

createRoot(root).render(
  <StrictMode>
    {/* HashRouter: pe GitHub Pages nu există rescriere de rute, iar cu `#`
        un refresh pe /#/algoritm/... nu dă 404 și nu e nevoie de 404.html. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);

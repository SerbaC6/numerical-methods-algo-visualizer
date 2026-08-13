import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";

import App from "@/App";
import { initTheme } from "@/hooks/use-theme";
import { tranzitie, verificaMiscare } from "@/lib/miscare";
import "@/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Elementul #root lipsește din index.html");

// înainte de prima randare, ca să nu pâlpâie tema
initTheme();

// Doar în dezvoltare: prinde desincronizarea dintre tokenii de mișcare din
// `index.css` și numerele din `src/lib/miscare.ts`.
if (import.meta.env.DEV) verificaMiscare();

createRoot(root).render(
  <StrictMode>
    {/*
      `reducedMotion="user"` e singurul loc din care `motion` află de
      `prefers-reduced-motion`. Regula globală din `index.css` taie doar
      duratele CSS; peste animațiile scrise în JS n-are nicio putere. Fără
      linia asta, accesibilitatea s-ar rupe tăcut pe fiecare pagină nouă.

      `transition` de aici e valoarea implicită pentru tot ce nu-și cere alta,
      deci treapta „mediu" e ce se întâmplă când nimeni nu se gândește la
      durată — exact ce vrem.
    */}
    <MotionConfig reducedMotion="user" transition={tranzitie()}>
      {/* HashRouter: pe GitHub Pages nu există rescriere de rute, iar cu `#`
          un refresh pe /#/algoritm/... nu dă 404 și nu e nevoie de 404.html. */}
      <HashRouter>
        <App />
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import { initTheme } from "@/hooks/use-theme";
import "@/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Elementul #root lipsește din index.html");

// înainte de prima randare, ca să nu pâlpâie tema
initTheme();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

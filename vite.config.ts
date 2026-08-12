import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Deploy pe GitHub Pages ca project page: asset-urile trebuie servite din /<nume-repo>/.
// Dacă trecem pe domeniu propriu sau pe user page, `base` devine "/".
const base = process.env.VITE_BASE ?? "/numerical-methods-algo-visualizer/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

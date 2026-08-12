import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const paleta = [
  { hex: "#0474C4", nume: "Safir", rol: "accent principal" },
  { hex: "#5379AE", nume: "Albastru estompat", rol: "accent secundar" },
  { hex: "#2C444C", nume: "Gri-verzui închis", rol: "suprafețe" },
  { hex: "#A8C4EC", nume: "Albastru deschis", rol: "text pe fundal închis" },
  { hex: "#06457F", nume: "Albastru adânc", rol: "accent apăsat, hover" },
  { hex: "#262B40", nume: "Bleumarin închis", rol: "fundalul temei întunecate" },
];

export default function App() {
  const [toleranta, setToleranta] = useState([3]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-text-slab text-sm font-semibold tracking-widest uppercase">Faza 0</p>
      <h1 className="mt-2 text-4xl font-extrabold text-balance sm:text-5xl">
        Vizualizator de Metode Numerice
      </h1>
      <p className="text-text-slab mt-4 text-lg">
        Schelet funcțional: React + Vite + TypeScript, cu paleta „Sapphire nightfall whisper" legată
        ca design tokens. Conținutul propriu-zis vine din Faza 3.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Paleta</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paleta.map((culoare) => (
            <li key={culoare.hex}>
              <Card className="overflow-hidden py-0">
                <div className="h-16 w-full" style={{ backgroundColor: culoare.hex }} />
                <CardContent className="p-3">
                  <p className="font-semibold">{culoare.nume}</p>
                  <p className="text-text-slab font-mono text-sm">{culoare.hex}</p>
                  <p className="text-text-slab mt-1 text-sm">{culoare.rol}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Verificare componente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button>Buton primar</Button>
              <Button variant="secondary">Secundar</Button>
              <Button variant="outline">Contur</Button>
              <Button variant="ghost">Ghost</Button>
            </div>

            <div>
              <label className="text-text-slab text-sm font-semibold" htmlFor="toleranta">
                Toleranță: 10<sup>−{toleranta[0]}</sup>
              </label>
              <Slider
                id="toleranta"
                className="mt-3"
                min={1}
                max={12}
                step={1}
                value={toleranta}
                onValueChange={setToleranta}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

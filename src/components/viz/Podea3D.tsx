import { NotatieSVG } from "@/components/viz/Notatie";
import { HALOU_ETICHETA } from "@/lib/notatie";
import { deplasareRadiala, useScena3D } from "@/components/viz/scena-3d-context";
import type { Ecran, Punct3 } from "@/lib/proiectie-3d";
import { culoareRol } from "@/lib/viz-roles";

/** Corpul numelor de axă. Vezi `src/lib/notatie.ts` pentru cum se scriu indicii. */
const MARIME_NUME_AXA = 17;

export type Podea3DProps = {
  /** Câte pătrate are grila pe fiecare latură. */
  diviziuni?: number;
  /** Numele axelor, scrise pe marginea din față a podelei. */
  numeX?: string;
  numeY?: string;
};

/**
 * Planul soluțiilor, la baza cutiei: rama, grila și numele axelor.
 *
 * **Fără umplere plină, intenționat.** Podeaua e desenată înaintea suprafeței,
 * deci suprafața o acoperă — dar la elevații mici marginea din față a podelei ar
 * trebui să treacă **peste** buza apropiată a văii, iar ordinea fixă de straturi
 * nu poate face asta. O podea plină ar arăta atunci ca o eroare de desen: o
 * placă opacă tăiată de vale. O grilă rară e onestă la orice unghi, fiindcă
 * liniile se citesc și când trec pe sub suprafață.
 *
 * Grila e decor pentru cititorul de ecran: ce spune scena stă în `<title>` și
 * `<desc>`, nu în o sută de linii citite una câte una.
 */
export function Podea3D({ diviziuni = 6, numeX = "x₁", numeY = "x₂" }: Podea3DProps) {
  const { proiectie, cutie, idTaiere } = useScena3D();
  const culoare = culoareRol("grila");

  const [x0, x1] = cutie.x;
  const [y0, y1] = cutie.y;
  const z = cutie.z[0];

  const la = (p: Punct3) => proiectie.laEcran(p);
  const segment = (a: Punct3, b: Punct3) => {
    const pa = la(a);
    const pb = la(b);
    return { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y };
  };

  const linii: { cheie: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < diviziuni; i++) {
    const t = i / diviziuni;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    linii.push({ cheie: `x-${i}`, ...segment({ x, y: y0, z }, { x, y: y1, z }) });
    linii.push({ cheie: `y-${i}`, ...segment({ x: x0, y, z }, { x: x1, y, z }) });
  }

  const colturi = [
    { x: x0, y: y0, z },
    { x: x1, y: y0, z },
    { x: x1, y: y1, z },
    { x: x0, y: y1, z },
  ].map(la);
  const rama = `${colturi.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")} Z`;

  // Numele axei se scrie pe marginea **dinspre privitor**, altfel ar cădea în
  // spatele văii la jumătate din azimuturi. „Dinspre privitor" înseamnă
  // adâncimea mai mare — vezi `bazaCamerei`.
  const mijlocX = (x0 + x1) / 2;
  const mijlocY = (y0 + y1) / 2;
  const maiAproape = (a: Ecran, b: Ecran) => (a.adancime >= b.adancime ? a : b);

  const etichete = [
    { text: numeX, punct: maiAproape(la({ x: mijlocX, y: y0, z }), la({ x: mijlocX, y: y1, z })) },
    { text: numeY, punct: maiAproape(la({ x: x0, y: mijlocY, z }), la({ x: x1, y: mijlocY, z })) },
  ];

  return (
    <g aria-hidden="true" clipPath={`url(#${idTaiere})`}>
      <g stroke={culoare} fill="none" strokeLinecap="round">
        {linii.map((l) => (
          <line
            key={l.cheie}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            strokeWidth={1}
            opacity={0.5}
          />
        ))}
        <path d={rama} strokeWidth={1.5} opacity={0.85} />
      </g>

      {/* Numele axelor se scriu cu tokenul de text, nu cu culoarea grilei: o
          literă are nevoie de 4,5:1, o linie de 3:1. */}
      <g className="fill-text-slab font-mono" fontSize={MARIME_NUME_AXA}>
        {etichete.map((e) => {
          const d = deplasareRadiala(proiectie, e.punct, 16);
          return (
            <text
              key={e.text}
              x={e.punct.x + d.dx}
              y={e.punct.y + d.dy}
              dy="0.32em"
              textAnchor={d.ancora}
              stroke="var(--suprafata)"
              strokeWidth={MARIME_NUME_AXA * HALOU_ETICHETA}
              paintOrder="stroke"
            >
              <NotatieSVG text={e.text} marime={MARIME_NUME_AXA} />
            </text>
          );
        })}
      </g>
    </g>
  );
}

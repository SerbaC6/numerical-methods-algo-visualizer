import { NavLink } from "react-router";

import { SECTIUNI } from "@/algorithms/registry";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { Separator } from "@/components/ui/separator";
import { GITHUB_URL } from "@/content/contact";
import { cn } from "@/lib/utils";

const AN = new Date().getFullYear();

/** Paginile de sine stătătoare ale site-ului, în ordinea din subsol. */
const PAGINI_SITE = [
  { to: "/contact", eticheta: "Contact" },
  { to: "/termeni", eticheta: "Termeni și condiții" },
  { to: "/confidentialitate", eticheta: "Confidențialitate" },
];

/**
 * Linkurile din subsol sunt text mic, dar degetul are nevoie de aceeași
 * suprafață ca oriunde altundeva: `tinta-atingere`, ca în header.
 */
const CLASE_LINK =
  "tinta-atingere text-text-slab hover:text-text focus-visible:ring-ring/50 -mx-2 inline-flex items-center rounded-md px-2 text-sm focus-visible:ring-[3px] focus-visible:outline-none";

/** Secțiunile cuprinsului, în ordinea lor din registru. */
const SECTIUNI_CUPRINS = Object.entries(SECTIUNI)
  .sort(([, a], [, b]) => a.ordine - b.ordine)
  .map(([id, { titlu }]) => ({ id, titlu }));

/**
 * Subsolul: sigla și numele stau în prima coloană a grilei, nu într-un bloc
 * deasupra ei — altfel arătau ca un antet lipit peste subsol, nu ca parte din
 * el.
 *
 * A treia coloană ține paginile de sine stătătoare (contact, termeni,
 * confidențialitate) și legătura către codul sursă.
 *
 * `spatiuSus` reglează distanța față de conținutul de deasupra. Paginile de
 * algoritm se termină cu navigația între metode (săgețile „înapoi/înainte"),
 * care e ea însăși un element de navigație: lăsată la distanța largă, plutea
 * singură între pagină și subsol. Acolo se cere `"stramt"`.
 */
export function Footer({ spatiuSus = "larg" }: { spatiuSus?: "larg" | "stramt" }) {
  return (
    <footer className={cn("border-bordura border-t", spatiuSus === "stramt" ? "mt-10" : "mt-20")}>
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo className="shrink-0" />
              <span className="leading-tight font-bold">
                visualiser
                <span className="text-accent-slab">-mn</span>
              </span>
            </div>
          </div>

          <nav aria-labelledby="subsol-cuprins">
            <h2 id="subsol-cuprins" className="text-sm font-semibold">
              Cuprins
            </h2>
            <ul className="mt-1 flex flex-col">
              {SECTIUNI_CUPRINS.map(({ id, titlu }) => (
                <li key={id}>
                  <NavLink to={`/#sectiune-${id}`} className={CLASE_LINK}>
                    {titlu}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="subsol-site">
            <h2 id="subsol-site" className="text-sm font-semibold">
              Site
            </h2>
            <ul className="mt-1 flex flex-col">
              {PAGINI_SITE.map(({ to, eticheta }) => (
                <li key={to}>
                  <NavLink to={to} className={CLASE_LINK}>
                    {eticheta}
                  </NavLink>
                </li>
              ))}
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={CLASE_LINK}>
                  Cod sursă
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <Separator className="mt-10" />

        <div className="text-text-slab flex flex-col gap-2 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {AN} · visualiser-mn · construit cu React</p>
          <p>
            Conținutul urmează cursul predat. Site static, fără conturi, fără cookies, fără
            urmărire.
          </p>
        </div>
      </Container>
    </footer>
  );
}

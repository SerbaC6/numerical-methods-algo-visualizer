import { useMemo, useState } from "react";

import * as bisectie from "@/algorithms/ecuatii-neliniare/bisectie";
import * as newton from "@/algorithms/ecuatii-neliniare/newton";
import * as puncteFixe from "@/algorithms/ecuatii-neliniare/puncte-fixe";
import * as secanta from "@/algorithms/ecuatii-neliniare/secanta";
import { FUNCTII, getFunctie, type FunctieTest } from "@/algorithms/functii";
import type { PasRadacina, RezultatRulare } from "@/algorithms/tipuri";
import { Callout } from "@/components/content/Callout";
import { GraficRadacina } from "@/components/content/GraficRadacina";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ControlPanel } from "@/components/viz/ControlPanel";
import { FormulaBlock } from "@/components/viz/FormulaBlock";
import { IterationTable } from "@/components/viz/IterationTable";
import { AceeasiInaltime } from "@/components/viz/AceeasiInaltime";
import { Legend } from "@/components/viz/Legend";
import { NumberInput } from "@/components/viz/NumberInput";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { useDerulare } from "@/hooks/use-derulare";
import { stiintific, zecimale } from "@/lib/numere";

/** Metodele din pagină, în ordinea în care le ia cursul. */
const METODE = [
  { id: "bisectie", titlu: "Bisecția" },
  { id: "puncte-fixe", titlu: "Puncte fixe" },
  { id: "newton", titlu: "Tangenta" },
  { id: "secanta", titlu: "Secanta" },
] as const;

type IdMetoda = (typeof METODE)[number]["id"];

/** Ce parametri de pornire cere fiecare metodă. */
const PORNIRE: Record<IdMetoda, "interval" | "un-punct" | "doua-puncte"> = {
  bisectie: "interval",
  "puncte-fixe": "un-punct",
  newton: "un-punct",
  secanta: "doua-puncte",
};

const TOLERANTA_IMPLICITA = 1e-6;
const MAX_ITERATII_IMPLICIT = 40;

/**
 * Interfața interactivă a paginii 5: cele patru metode de căutare a rădăcinii,
 * pe funcțiile din curs.
 *
 * Matematica **nu** stă aici. Vine din `src/algorithms/`, iar componenta doar
 * alege ce pas se arată și îl așază pe ecran. Explicația fiecărui pas și
 * formula lui cu numerele puse în ea vin tot de acolo, împreună cu cifrele pe
 * care le descriu — scrise în UI, s-ar putea desincroniza de ele.
 *
 * Puncte fixe merge doar pe funcțiile pentru care cursul dă explicit forma
 * `x = g(x)`; pe celelalte, metoda însăși refuză să pornească și spune de ce.
 * Nu inventăm noi o transformare: alegerea greșită diverge.
 */
export function InterfataEcuatiiNeliniare() {
  const [idMetoda, setIdMetoda] = useState<IdMetoda>("bisectie");
  const [idFunctie, setIdFunctie] = useState("cub");
  const functie = getFunctie(idFunctie);

  const [pornire, setPornire] = useState(() => pornireImplicita(functie, "bisectie"));
  const [tol, setTol] = useState<number | "">(TOLERANTA_IMPLICITA);
  const [maxIteratii, setMaxIteratii] = useState<number | "">(MAX_ITERATII_IMPLICIT);

  const schimbaFunctia = (id: string) => {
    setIdFunctie(id);
    // Capetele vechi n-au nicio legătură cu funcția nouă: „x³ − 2x − 5" se
    // caută în [2, 3], „3·cos(x) − 4x" în [0, 1]. Păstrate, prima ar porni cu
    // un interval fără schimbare de semn, adică refuzată din start.
    setPornire(pornireImplicita(getFunctie(id), idMetoda));
  };

  /**
   * Schimbarea metodei aduce și exemplul pe care metoda aceea se vede cel mai
   * bine — funcția **și** punctul de pornire.
   *
   * E o resetare pe față, nu o subtilitate: fiecare metodă are alt caz care o
   * arată. Puncte fixe cere o funcție pentru care cursul dă forma `x = g(x)`,
   * altfel metoda refuză să pornească; tangenta și secanta cer o pornire
   * departe de rădăcină, altfel termină înainte să se vadă ce fac. Funcția
   * rămâne oricând de ales din panou, iar „Resetează" readuce exemplul.
   */
  const schimbaMetoda = (id: IdMetoda) => {
    setIdMetoda(id);
    const demonstrativa = functiaDemonstrativa(id, functie);
    setIdFunctie(demonstrativa.id);
    setPornire(pornireImplicita(demonstrativa, id));
  };

  const reseteaza = () => {
    setPornire(pornireImplicita(functie, idMetoda));
    setTol(TOLERANTA_IMPLICITA);
    setMaxIteratii(MAX_ITERATII_IMPLICIT);
  };

  const tolValid = typeof tol === "number" && tol > 0 ? tol : TOLERANTA_IMPLICITA;
  const maxValid =
    typeof maxIteratii === "number" && maxIteratii >= 1
      ? Math.min(Math.round(maxIteratii), 200)
      : MAX_ITERATII_IMPLICIT;

  const rezultat = useMemo(
    () => ruleaza(idMetoda, functie, pornire, tolValid, maxValid),
    [idMetoda, functie, pornire, tolValid, maxValid],
  );

  const derulare = useDerulare(rezultat.pasi.length);
  const pasCurent = rezultat.pasi[derulare.pas];
  const ultimulPas = derulare.pas === rezultat.pasi.length - 1;

  // La puncte fixe desenăm `g(x) − x`, nu `f`: iterația se oprește acolo unde
  // `g(x) = x`, deci zeroul curbei ăsteia e chiar punctul fix căutat. Așa
  // desenul spune același lucru ca la celelalte metode — „unde taie axa" — fără
  // să inventeze o a doua convenție de citit.
  // Amândouă sunt memorate fiindcă ajung în `GraficRadacina` ca **identitate**:
  // recreate la fiecare randare, ar invalida acolo încadrarea, eșantionarea
  // curbei și ținta lupei, adică toate calculele pe care graficul le face o
  // singură dată tocmai ca să nu le refacă în timpul animației.
  const g = functie.g;
  const { curba, etichetaCurba } = useMemo(
    () =>
      idMetoda === "puncte-fixe" && g
        ? { curba: (x: number) => g(x) - x, etichetaCurba: "g(x) − x" }
        : { curba: functie.f, etichetaCurba: functie.eticheta },
    [idMetoda, g, functie],
  );

  const incadrare = useMemo(
    () => incadrareDePornire(idMetoda, functie, pornire, rezultat.pasi),
    [idMetoda, functie, pornire, rezultat.pasi],
  );

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={idMetoda} onValueChange={(v) => schimbaMetoda(v as IdMetoda)}>
        <TabsList className="w-full">
          {METODE.map((m) => (
            <TabsTrigger key={m.id} value={m.id} className="flex-1">
              {m.titlu}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Legenda stă **înaintea** desenului, nu după el.

          Ea e prima care trebuie citită: spune ce înseamnă fiecare lucru de pe
          grafic, iar pusă dedesubt ajungea să fie citită abia după ce
          utilizatorul se uitase deja la un desen pe care nu-l înțelegea. Aici
          urmează firesc după alegerea metodei — întâi afli ce metodă e și ce
          vei vedea, apoi te uiți. */}
      {/* Legendele au între patru și șase intrări, după metodă, iar blocul
          se scurta la fiecare schimbare de tab. Rămân exact ce erau — se
          egalizează doar spațiul. */}
      <AceeasiInaltime
        activa={METODE.findIndex((m) => m.id === idMetoda)}
        variante={METODE.map((m) => (
          <Legend key={m.id} elemente={legendaMetodei(m.id, etichetaCurba)} />
        ))}
      />

      {/* Graficul și parametrii stau într-o **singură** ramă, despărțiți doar de
          o linie. Sunt un instrument, nu două panouri alăturate: tragi de un
          parametru din dreapta și se schimbă desenul din stânga, iar două
          cartonașe cu spațiu între ele spuneau că n-au legătură.

          Parametrii merg pe o fâșie de lățime fixă, nu pe o fracțiune: câmpurile
          au lățimea lor firească, iar tot restul îl ia graficul — care aici e
          conținutul, nu ilustrația lui. */}
      <div className="bg-suprafata border-bordura shadow-jos overflow-hidden rounded-xl border">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_clamp(300px,26%,380px)]">
          {/* Graficul primul în ordinea din cod: pe telefon el trebuie să fie
              deasupra, ca să se vadă ce se schimbă când tragi de un parametru. */}
          {/* `items-center`: panoul de parametri e mai înalt decât desenul, iar
              grila întinde amândouă coloanele la înălțimea celei mai mari.
              Fără asta, golul rămas cădea tot sub grafic și arăta ca o
              greșeală de aliniere. */}
          <div className="flex min-w-0 items-center p-4 sm:p-5">
            {rezultat.pasi.length > 0 ? (
              <GraficRadacina
                curba={curba}
                etichetaCurba={etichetaCurba}
                domeniuValid={functie.domeniuValid}
                pasi={rezultat.pasi}
                pasCurent={derulare.pas}
                incadrareInitiala={incadrare}
                className="w-full"
                raport={1.35}
                inaltimeMaxima={640}
              />
            ) : (
              <div className="text-text-slab flex min-h-[420px] items-center justify-center px-6 text-center text-lg text-pretty">
                {rezultat.motiv}
              </div>
            )}
          </div>

          <ControlPanel
            onReset={reseteaza}
            incorporat
            className="border-bordura min-w-0 border-t lg:border-t-0 lg:border-l"
          >
            <div className="grid gap-2">
              <label className="text-base font-medium" htmlFor="alegere-functie">
                Funcția
              </label>
              <Select value={idFunctie} onValueChange={schimbaFunctia}>
                <SelectTrigger
                  id="alegere-functie"
                  className="tinta-atingere w-full font-mono text-base"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNCTII.map((f) => (
                    <SelectItem
                      key={f.id}
                      value={f.id}
                      // Pe puncte fixe, funcțiile fără formă `x = g(x)` dată de
                      // curs nu se pot alege deloc: metoda le-ar refuza oricum,
                      // iar un refuz care se putea prevedea e mai bine prevenit.
                      disabled={idMetoda === "puncte-fixe" && !f.g}
                      className="font-mono"
                    >
                      f(x) = {f.eticheta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {PORNIRE[idMetoda] === "interval" && (
              <>
                <NumberInput
                  eticheta="Capătul din stânga, a"
                  valoare={pornire.a}
                  onChange={(v) => setPornire((p) => ({ ...p, a: v }))}
                  pas={0.1}
                />
                <NumberInput
                  eticheta="Capătul din dreapta, b"
                  valoare={pornire.b}
                  onChange={(v) => setPornire((p) => ({ ...p, b: v }))}
                  pas={0.1}
                />
              </>
            )}

            {PORNIRE[idMetoda] === "un-punct" && (
              <>
                <NumberInput
                  eticheta="Punctul de pornire, x₀"
                  valoare={pornire.a}
                  onChange={(v) => setPornire((p) => ({ ...p, a: v }))}
                  pas={0.1}
                  ajutor={
                    idMetoda === "newton"
                      ? "Prea departe de rădăcină, tangenta poate arunca punctul aiurea."
                      : undefined
                  }
                />
                {/* Metodele care pornesc dintr-un singur punct au un câmp mai
                    puțin decât celelalte, iar panoul — și cu el tot blocul —
                    se scurta cu un rând la schimbarea tabului. Locul rămâne
                    ocupat, dar gol: un al doilea câmp, inert, ar fi fost mai
                    rău decât nimic. */}
                <div aria-hidden className="pointer-events-none invisible" inert>
                  <NumberInput eticheta="—" valoare={0} onChange={() => {}} pas={0.1} />
                </div>
              </>
            )}

            {PORNIRE[idMetoda] === "doua-puncte" && (
              <>
                <NumberInput
                  eticheta="Prima valoare, x₀"
                  valoare={pornire.a}
                  onChange={(v) => setPornire((p) => ({ ...p, a: v }))}
                  pas={0.1}
                />
                <NumberInput
                  eticheta="A doua valoare, x₁"
                  valoare={pornire.b}
                  onChange={(v) => setPornire((p) => ({ ...p, b: v }))}
                  pas={0.1}
                />
              </>
            )}

            <NumberInput
              eticheta="Toleranța"
              valoare={tol}
              onChange={setTol}
              min={1e-12}
              stiintific
              faraSageti
              unitate="ε"
              eroare={
                typeof tol === "number" && tol <= 0
                  ? "Toleranța trebuie să fie pozitivă."
                  : undefined
              }
            />
            <NumberInput
              eticheta="Iterații maxime"
              valoare={maxIteratii}
              onChange={setMaxIteratii}
              min={1}
              max={200}
              pas={1}
              eroare={
                typeof maxIteratii === "number" && maxIteratii > 200
                  ? "Cel mult 200 de iterații."
                  : undefined
              }
            />
          </ControlPanel>
        </div>
      </div>

      {rezultat.pasi.length > 0 && (
        <>
          <PlaybackBar
            pas={derulare.pas}
            totalPasi={rezultat.pasi.length}
            ruleaza={derulare.ruleaza}
            viteza={derulare.viteza}
            onPas={derulare.setPas}
            onRuleazaChange={derulare.setRuleaza}
            onVitezaChange={derulare.setViteza}
            // Pașii se duc cu mâna. Redarea automată face exact ce nu trebuie
            // aici: tangenta sare de zece ori, iar dacă salturile vin unul după
            // altul, nu se prinde niciunul.
            faraRedare
          />

          {/* Paralela formulă ↔ desen: formula are numerele pasului curent puse
              în ea, iar partea aprinsă e chiar elementul desenat. */}
          {pasCurent?.latexPas && (
            <FormulaBlock
              latex={pasCurent.latexPas}
              eticheta="Pasul acesta, cu numerele în formulă"
              evidentiaza={pasCurent.evidentiaza}
            />
          )}
        </>
      )}

      {/* Erorile se scriu, nu se colorează pe desen — regula din CLAUDE.md. */}
      {rezultat.stare === "esuat" && (
        <Callout tip="atentie" titlu="Metoda s-a oprit">
          {rezultat.motiv}
        </Callout>
      )}
      {ultimulPas && rezultat.stare === "convergent" && (
        <Callout tip="retine" titlu="Metoda a ajuns la soluție">
          {incheiere(idMetoda, rezultat)}
        </Callout>
      )}
      {ultimulPas && rezultat.stare === "neterminat" && (
        <Callout tip="atentie" titlu="S-au terminat iterațiile">
          {rezultat.motiv}
        </Callout>
      )}

      {rezultat.pasi.length > 0 && (
        <IterationTable
          coloane={[
            { cheie: "x", titlu: "xₖ", descriere: "Aproximarea de la pasul k" },
            { cheie: "fx", titlu: "f(xₖ)", descriere: "Cât de departe e de zero" },
            {
              cheie: "eroare",
              titlu: "criteriu de oprire",
              descriere: "Lungimea intervalului la bisecție, saltul făcut la celelalte metode",
            },
            {
              cheie: "abatere",
              titlu: "|xₖ − p|",
              descriere:
                "Distanța până la rădăcina adevărată, cunoscută dinainte pentru funcțiile din curs",
            },
          ]}
          randuri={rezultat.pasi.map((p) => ({
            x: zecimale(p.x, 8),
            fx: stiintific(p.fx, 2),
            eroare: stiintific(p.eroare, 2),
            // Are sens și la puncte fixe: forma din curs, x = √(x+1), are ca
            // punct fix chiar rădăcina lui x² − x − 1.
            abatere: stiintific(Math.abs(p.x - functie.radacina), 2),
          }))}
          randCurent={derulare.pas}
          onAlegeRand={derulare.setPas}
          // Bisecția are zeci de rânduri, tangenta patru: fără înălțime fixă,
          // tabelul se strânge și trage toată pagina în sus la schimbarea
          // tabului.
          className="h-96"
        />
      )}
    </div>
  );
}

// ── Parametrii de pornire ────────────────────────────────────────────────────

type Pornire = { a: number | ""; b: number | "" };

/**
 * De unde pornește metoda când utilizatorul n-a schimbat nimic.
 *
 * Bisecția are nevoie de intervalul cu schimbare de semn din curs. Tangenta și
 * secanta pornesc **dinadins mai departe**, din `pornireTangenta` /
 * `pornireSecanta`: de lângă rădăcină termină în patru pași, cu primul deja pe
 * soluție, și nu se vede nici construcția, nici de ce ar fi ele mai bune decât
 * înjumătățirea. Puncte fixe folosește capătul din stânga, ca în exemplul cu
 * numărul de aur din curs.
 */
function pornireImplicita(functie: FunctieTest, idMetoda: IdMetoda): Pornire {
  switch (idMetoda) {
    case "newton":
      return { a: functie.pornireTangenta, b: functie.interval[1] };
    case "secanta":
      return { a: functie.pornireSecanta[0], b: functie.pornireSecanta[1] };
    case "bisectie":
    case "puncte-fixe":
      return { a: functie.interval[0], b: functie.interval[1] };
  }
}

/**
 * Funcția pe care metoda se vede cel mai bine.
 *
 * Pentru tangentă și secantă e `ln(x) − 2`, pornită din 18. Alegerea e
 * măsurată în `scripts/verificare-algoritmi/alegere-pornire.ts` și ține de
 * două lucruri deodată:
 *
 * - **drumul e spectaculos** — tangenta aruncă punctul de la 18 tocmai în 1,98,
 *   apoi el urcă înapoi prin 4,59 și 6,77 până se așază în e². Se vede că
 *   metoda poate să și rateze urât un pas și tot să ajungă unde trebuie;
 * - **curba rămâne desenabilă** — `|f|` nu trece de 1,3 pe tot drumul. Pe
 *   exponențiala pornită de la fel de departe, valorile urcă la 2000, iar
 *   rădăcina se pierde în porțiunea plată de lângă axă.
 */
function functiaDemonstrativa(idMetoda: IdMetoda, functieAcum: FunctieTest): FunctieTest {
  if (idMetoda === "puncte-fixe") {
    return functieAcum.g ? functieAcum : (FUNCTII.find((f) => f.g) ?? functieAcum);
  }
  if (idMetoda === "newton" || idMetoda === "secanta") {
    return FUNCTII.find((f) => f.id === "logaritm") ?? functieAcum;
  }
  return getFunctie("cub");
}

/** Câmpul gol înseamnă „încă tastez", nu zero: se folosește valoarea din curs. */
function numar(valoare: number | "", implicit: number): number {
  return typeof valoare === "number" && Number.isFinite(valoare) ? valoare : implicit;
}

// ── Rularea ──────────────────────────────────────────────────────────────────

function ruleaza(
  idMetoda: IdMetoda,
  functie: FunctieTest,
  pornire: Pornire,
  tol: number,
  maxIteratii: number,
): RezultatRulare {
  const a = numar(pornire.a, functie.interval[0]);
  const b = numar(pornire.b, functie.interval[1]);
  const comun = { functie: functie.id, tol, maxIteratii };

  switch (idMetoda) {
    case "bisectie":
      return bisectie.run({ ...comun, a, b });
    case "newton":
      return newton.run({ ...comun, x0: a });
    case "secanta":
      return secanta.run({ ...comun, x0: a, x1: b });
    case "puncte-fixe":
      return puncteFixe.run({ ...comun, x0: a });
  }
}

/**
 * Zona din care pornește încadrarea graficului.
 *
 * Bisecția și-o are gata făcută: rădăcina e prinsă între capete, prin chiar
 * condiția de pornire, deci nimic nu poate ieși din interval.
 *
 * Celelalte trei **nu**. Tangenta și secanta pot arunca punctul oriunde, iar
 * distanța nu se poate ghici din datele de pornire: pe `ln(x) − 2` pornită din
 * 18, prima tangentă cade tocmai în 1,97 — sub rădăcina de la 7,39 și cu mult
 * în afara oricărui cadru dedus din `[7,39 ; 18]`. Cadrul se ia deci din
 * **drumul chiar parcurs**, adică din pașii calculați; pașii există deja,
 * fiindcă graficul îi primește oricum.
 */
function incadrareDePornire(
  idMetoda: IdMetoda,
  functie: FunctieTest,
  pornire: Pornire,
  pasi: readonly PasRadacina[],
): readonly [number, number] {
  const a = numar(pornire.a, functie.interval[0]);
  const b = numar(pornire.b, functie.interval[1]);

  if (PORNIRE[idMetoda] === "interval") return a <= b ? [a, b] : [b, a];

  const capete = [
    a,
    ...(PORNIRE[idMetoda] === "doua-puncte" ? [b] : []),
    ...pasi.map((p) => p.x).filter(Number.isFinite),
  ];
  if (capete.length === 0) return functie.interval;
  return [Math.min(...capete), Math.max(...capete)];
}

// ── Texte ────────────────────────────────────────────────────────────────────

function incheiere(idMetoda: IdMetoda, rezultat: RezultatRulare): string {
  const n = rezultat.pasi.length;
  switch (idMetoda) {
    case "bisectie":
      return `După ${n} înjumătățiri, intervalul a scăzut sub toleranță, iar mijlocul lui este aproximarea rădăcinii.`;
    case "newton":
      return `După ${n} pași, tangenta a adus punctul atât de aproape încât saltul dintre două iterații a coborât sub toleranță.`;
    case "secanta":
      return `După ${n} pași, secanta a adus punctul atât de aproape încât saltul dintre două iterații a coborât sub toleranță.`;
    case "puncte-fixe":
      return `După ${n} aplicări ale lui g, distanța dintre doi pași consecutivi a coborât sub toleranță: șirul s-a oprit în punctul fix.`;
  }
}

function legendaMetodei(idMetoda: IdMetoda, etichetaCurba: string) {
  const curba = {
    rol: "functie" as const,
    eticheta: `Curba ${etichetaCurba}`,
    explicatie: "rădăcina e acolo unde taie axa orizontală",
  };
  const acum = {
    rol: "curent" as const,
    eticheta: "Aproximarea de acum",
    explicatie: "punctul calculat la pasul afișat",
  };
  // Urmele apar doar la metodele care lasă un drum. La bisecție istoria o
  // spune banda care se strânge, deci legenda n-are ce promite acolo.
  const urme = {
    rol: "anterior" as const,
    eticheta: "Pașii dinainte",
    explicatie: "tot mai șterși cu cât sunt mai vechi",
  };
  const comun = [curba, acum, urme];

  // Marcajul de pe axă e același desen la toate metodele — valoarea produsă
  // acum — dar **nu înseamnă același lucru**, deci nu se numește la fel. La
  // bisecție e mijlocul intervalului; la tangentă și secantă e locul în care
  // dreapta taie axa, adică tot rezultatul pasului. O legendă care ar spune
  // „tăietura cu axa" și pe bisecție ar pretinde o construcție care acolo nu
  // există.
  const peAxa = (explicatie: string, eticheta: string) => ({
    rol: "curent" as const,
    forma: "celula" as const,
    eticheta,
    explicatie,
  });

  // Panta e o cifră în explicație; triunghiul e locul ei pe desen. Fără intrarea
  // asta, cititorul citește „are panta 0,1148" și n-are unde s-o caute.
  const panta = (explicatie: string) => ({
    rol: "curent" as const,
    forma: "linie-punctata" as const,
    eticheta: "Triunghiul pantei",
    explicatie,
  });

  switch (idMetoda) {
    case "bisectie":
      return [
        curba,
        acum,
        {
          rol: "interval" as const,
          eticheta: "Intervalul curent",
          explicatie: "zona în care rădăcina e sigur prinsă; se înjumătățește la fiecare pas",
        },
        peAxa("mijlocul intervalului, marcat pe axă", "Valoarea pasului"),
        {
          rol: "interval" as const,
          eticheta: "f(a) și f(b)",
          explicatie:
            "valorile funcției la capete, pe curbă; semnele lor opuse sunt chiar condiția de pornire",
        },
      ];
    case "newton":
      return [
        ...comun,
        {
          rol: "anterior" as const,
          forma: "linie-punctata" as const,
          eticheta: "Tangenta",
          explicatie: "dusă în punctul dinainte; ea înlocuiește curba la pasul acesta",
        },
        peAxa("unde tangenta întâlnește axa — chiar aproximarea pasului", "Tăietura cu axa"),
        panta(
          "cateta orizontală e saltul făcut, cea verticală e f în punctul de plecare; panta e raportul lor",
        ),
      ];
    case "secanta":
      return [
        ...comun,
        {
          rol: "anterior" as const,
          forma: "linie-punctata" as const,
          eticheta: "Secanta",
          explicatie: "dreapta prin ultimele două puncte; ea înlocuiește curba la pasul acesta",
        },
        peAxa("unde secanta întâlnește axa — chiar aproximarea pasului", "Tăietura cu axa"),
        panta(
          "catetele sunt chiar diferențele din formulă: pe orizontală xₙ₋₁ − xₙ₋₂, pe verticală f(xₙ₋₁) − f(xₙ₋₂)",
        ),
      ];
    case "puncte-fixe":
      return [...comun, peAxa("valoarea dată de g, marcată pe axă", "Valoarea pasului")];
  }
}

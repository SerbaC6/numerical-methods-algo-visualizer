import { useMemo } from "react";

import { run } from "@/algorithms/ecuatii-neliniare/bisectie";
import { getFunctie } from "@/algorithms/functii";
import { Callout } from "@/components/content/Callout";
import { GraficRadacina } from "@/components/content/GraficRadacina";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { StepExplanation } from "@/components/viz/StepExplanation";
import { useDerulare } from "@/hooks/use-derulare";

/**
 * Interfața interactivă a paginii 5.
 *
 * Se construiește pe pași: acum are desenul, comenzile de derulare și
 * propoziția care descrie pasul. Panoul de parametri, tabelul de iterații și
 * celelalte trei metode urmează.
 *
 * Matematica **nu** stă aici: vine din `src/algorithms/`, iar componenta doar
 * alege ce pas se arată. Explicația fiecărui pas vine tot de acolo, împreună cu
 * cifrele pe care le descrie — dacă ar fi scrisă în UI, s-ar putea desincroniza
 * de ele.
 */
export function InterfataEcuatiiNeliniare() {
  const functie = getFunctie("cub");

  const rezultat = useMemo(
    () =>
      run({
        functie: functie.id,
        a: functie.interval[0],
        b: functie.interval[1],
        tol: 1e-6,
        maxIteratii: 40,
      }),
    [functie],
  );

  const derulare = useDerulare(rezultat.pasi.length);
  const pasCurent = rezultat.pasi[derulare.pas];

  if (rezultat.stare === "esuat") {
    // Erorile se scriu, nu se colorează pe desen — regula din CLAUDE.md.
    return (
      <Callout tip="atentie" titlu="Metoda nu poate porni">
        {rezultat.motiv}
      </Callout>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-suprafata border-bordura shadow-jos rounded-xl border p-4">
        <GraficRadacina
          functie={functie}
          pasi={rezultat.pasi}
          pasCurent={derulare.pas}
          intervalInitial={functie.interval}
        />
      </div>

      <PlaybackBar
        pas={derulare.pas}
        totalPasi={rezultat.pasi.length}
        ruleaza={derulare.ruleaza}
        viteza={derulare.viteza}
        onPas={derulare.setPas}
        onRuleazaChange={derulare.setRuleaza}
        onVitezaChange={derulare.setViteza}
      />

      <StepExplanation
        pas={derulare.pas}
        totalPasi={rezultat.pasi.length}
        ruleaza={derulare.ruleaza}
        explicatie={pasCurent?.explicatie}
      />

      {/* Ultimul pas spune și cum s-a terminat. Nu e o etichetă de progres, ci
          rezultatul metodei: convergență sau buget de iterații epuizat. */}
      {derulare.pas === rezultat.pasi.length - 1 &&
        rezultat.stare === "convergent" &&
        pasCurent && (
          <Callout tip="retine" titlu="Metoda a ajuns la soluție">
            După {rezultat.pasi.length} înjumătățiri, intervalul a scăzut sub toleranță, iar
            mijlocul lui este aproximarea rădăcinii.
          </Callout>
        )}
      {derulare.pas === rezultat.pasi.length - 1 && rezultat.stare === "neterminat" && (
        <Callout tip="atentie" titlu="S-au terminat iterațiile">
          {rezultat.motiv}
        </Callout>
      )}
    </div>
  );
}

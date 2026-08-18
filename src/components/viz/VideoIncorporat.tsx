import { useState } from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

export type VideoIncorporatProps = {
  /** Identificatorul clipului pe YouTube. */
  id: string;
  /** Titlul clipului, exact cum e la sursă. Dă și numele accesibil al butonului. */
  titlu: string;
  /** Cine l-a făcut. Se scrie sub cadru, ca atribuire. */
  autor: string;
  /** Miniatura găzduită de site — **importată**, nu scrisă ca șir de caractere. */
  miniatura: string;
  /** Ce se vede în clip, pentru cine nu-l poate viziona. */
  descriere: string;
  className?: string;
};

/**
 * Un clip găzduit de YouTube, redat **în pagină**.
 *
 * **De ce nu e un `<iframe>` pus direct.** Tot site-ul e construit fără cereri
 * către alte domenii — de aceea fonturile stau în `public/fonts/` și de aceea
 * clipurile narative sunt desenate în cod (vezi `Clip`). Un iframe încărcat
 * odată cu pagina ar anunța YouTube despre fiecare vizitator, inclusiv despre
 * cei care nu apasă niciodată pe redare, și ar face falsă promisiunea din
 * politica de confidențialitate.
 *
 * Aici se încarcă întâi o **facadă**: miniatura, găzduită de site, peste care
 * stă un buton. Până la clic nu pleacă nicio cerere. La clic se montează
 * iframe-ul către `youtube-nocookie.com` — varianta fără cookies de publicitate
 * — cu `autoplay`, deci clipul pornește singur, fără al doilea clic, și rulează
 * în pagină: vizitatorul nu e mutat pe alt site.
 *
 * Sub cadru rămâne doar atribuirea — titlul clipului și cine l-a făcut.
 */
export function VideoIncorporat({
  id,
  titlu,
  autor,
  miniatura,
  descriere,
  className,
}: VideoIncorporatProps) {
  const [pornit, setPornit] = useState(false);

  // `rel=0` ține sugestiile de la final în același canal, `modestbranding=1`
  // scoate sigla din bara de comenzi, iar `hl`/`cc_lang_pref` cer româna acolo
  // unde YouTube o are (interfața playerului și subtitrările automate).
  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    "?autoplay=1&rel=0&modestbranding=1&hl=ro&cc_lang_pref=ro";

  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <div className="border-bordura bg-suprafata relative aspect-video overflow-hidden rounded-lg border">
        {pornit ? (
          <iframe
            src={src}
            title={titlu}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPornit(true)}
            aria-label={`Redă clipul „${titlu}"`}
            // Conturul de focalizare vine din regula globală din `index.css`.
            // Se schimbă doar decalajul: pozitiv, ar cădea în afara cadrului cu
            // `overflow-hidden` și s-ar tăia, deci intră spre interior.
            className="group absolute inset-0 size-full cursor-pointer focus-visible:-outline-offset-4"
          >
            {/* Miniatura e decorativă: numele accesibil vine de pe buton, iar un
                `alt` care repetă titlul l-ar face pe cititorul de ecran să-l
                spună de două ori. */}
            <img
              src={miniatura}
              alt=""
              width={1280}
              height={720}
              className="absolute inset-0 size-full object-cover"
            />
            {/* Voalul întunecă miniatura, ca pastila de redare să aibă contrast
                indiferent ce culori are cadrul ales de YouTube. */}
            <span className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/45" />
            <span className="bg-accent group-hover:bg-accent-apasat absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg transition-colors">
              <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>

      <figcaption className="text-text-slab mt-3 text-sm">
        <span className="text-text font-semibold">{titlu}</span> · {autor}
      </figcaption>

      <p className="sr-only">{descriere}</p>
    </figure>
  );
}

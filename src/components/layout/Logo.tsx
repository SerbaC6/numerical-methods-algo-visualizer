import { cn } from "@/lib/utils";

/**
 * Sigla: o pastilă închisă pe care stau cinci puncte și curba trasată prin ele —
 * interpolarea, ideea centrală a site-ului. Aceeași imagine cu `public/sigla.svg`,
 * ca pictograma din tab și sigla din pagină să nu se depărteze.
 *
 * Culorile vin din paletă (`--color-noapte`, `--color-cer`, `--color-safir`), nu
 * din rolurile semantice: pastila e închisă în **ambele** teme, la fel ca fișierul
 * de pictogramă, care n-are cum să știe pe ce fundal ajunge.
 *
 * Măsura implicită e 40 px, adică cât încape în bara de 64 px fără să atingă
 * marginile (12 px sus și jos) și fără să treacă peste ținta de atingere de 44 px
 * a linkului. Pe 360 px linkul iese la 78 px cu tot cu `px-3.5`, deci rămân ~190 px
 * pentru câmpul de căutare — wordmark-ul e oricum ascuns sub `sm`.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-10", className)}
      role="img"
      aria-label="Siglă: puncte și curba trasată prin ele"
    >
      <rect x="1" y="1" width="30" height="30" rx="7.5" fill="var(--color-noapte)" />
      <rect
        x="1.6"
        y="1.6"
        width="28.8"
        height="28.8"
        rx="6.9"
        fill="none"
        stroke="var(--color-cer)"
        strokeOpacity="0.22"
        strokeWidth="1.2"
      />
      <path
        d="M4.6 25.2 C 9.6 25.2, 11.4 8.6, 16 8.6 C 20.6 8.6, 22.4 25.2, 27.4 25.2"
        fill="none"
        stroke="var(--color-cer)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="5.4" cy="25.1" r="2.5" fill="var(--color-safir)" />
      <circle cx="26.6" cy="25.1" r="2.5" fill="var(--color-safir)" />
      <circle cx="11.3" cy="16.3" r="1.9" fill="var(--color-safir)" />
      <circle cx="20.7" cy="16.3" r="1.9" fill="var(--color-safir)" />
      <circle cx="16" cy="8.6" r="3.2" fill="var(--color-safir)" />
    </svg>
  );
}

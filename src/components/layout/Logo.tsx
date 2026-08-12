import { cn } from "@/lib/utils";

/**
 * Logo placeholder: o rețea de puncte cu o curbă trasată prin ele — interpolare,
 * ideea centrală a site-ului. Folosește `currentColor` și tokenul de accent, deci
 * merge pe ambele teme fără variante separate.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label="Siglă: puncte și curba trasată prin ele"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path
        d="M6 23C10 23 11 9 16 9s6 14 10 14"
        fill="none"
        stroke="var(--accent-slab)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="23" r="2.5" fill="var(--accent)" />
      <circle cx="16" cy="9" r="2.5" fill="var(--accent)" />
      <circle cx="26" cy="23" r="2.5" fill="var(--accent)" />
    </svg>
  );
}

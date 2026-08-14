import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Linia subțire de sub bara de sus, care arată cât din pagină a fost parcurs.
 *
 * Se desenează prin `scaleX` pe un element cât toată lățimea, nu prin `width`:
 * `scaleX` stă pe compositor, deci linia urmărește derularea fără să oblige
 * browserul să recalculeze layout-ul la fiecare pixel.
 *
 * Arcul (`useSpring`) e doar netezire: la derulare cu rotița, `scrollYProgress`
 * sare în trepte, iar linia ar zvâcni. E ținut **supraamortizat**
 * (ζ = 20 / (2·√70) ≈ 1,20), ca linia să ajungă din urmă fără să treacă
 * niciodată peste poziția reală — o linie de progres care sare înainte și se
 * întoarce ar minți despre cât ai citit. La `prefers-reduced-motion` netezirea
 * dispare și linia urmează derularea exact — mișcarea rămâne una singură, a
 * paginii, nu două.
 */
export function ProgresDerulare() {
  const { scrollYProgress } = useScroll();
  const miscareRedusa = useReducedMotion();
  const neted = useSpring(scrollYProgress, { stiffness: 70, damping: 20, restDelta: 0.0005 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: miscareRedusa ? scrollYProgress : neted }}
      className="bg-accent absolute inset-x-0 -bottom-px h-[3px] origin-left"
    />
  );
}

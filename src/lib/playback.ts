/** Vitezele de derulare oferite de `PlaybackBar`. */
export const VITEZE = [0.5, 1, 2] as const;

export type Viteza = (typeof VITEZE)[number];

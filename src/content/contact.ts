/**
 * Datele de contact ale site-ului, într-un singur loc: le folosesc și subsolul,
 * și pagina de contact, și politica de confidențialitate. Dacă se schimbă o
 * adresă, se schimbă aici, nu în trei fișiere.
 */

export const ADRESE_EMAIL = [
  { nume: "Robert Dimitrescu", email: "robertdimitrescu@gmail.com" },
  { nume: "Șerban Ciumacencu", email: "serbaciumacencu@gmail.com" },
] as const;

/** Unde învățăm — apare pe pagina de contact. */
export const FACULTATE = "UPB, Facultatea de Automatică și Calculatoare, specializarea CTI";

/** Depozitul public al site-ului. */
export const GITHUB_URL = "https://github.com/SerbaC6/numerical-methods-algo-visualizer";

/**
 * Data ultimei revizuiri a paginilor de termeni și confidențialitate. Se scrie
 * cu mâna, la fiecare modificare a textului lor — nu se ia din ceas, fiindcă
 * „actualizat azi" pe un text nemodificat de un an ar fi o minciună.
 */
export const DATA_ACTUALIZARE = "13 august 2026";

/**
 * Datele de contact ale site-ului, într-un singur loc: le folosesc și subsolul,
 * și pagina de contact, și politica de confidențialitate. Dacă se schimbă o
 * adresă, se schimbă aici, nu în trei fișiere.
 */

/** Cine ține site-ul, cu ambele adrese — personală și de facultate. */
export const PERSOANE = [
  {
    nume: "Robert-Sebastian Dimitrescu",
    emailPersonal: "robertdimitrescu@gmail.com",
    emailFacultate: "robert.dimitrescu@stud.acs.upb.ro",
  },
  {
    nume: "Șerban-Ioan Ciumacencu",
    emailPersonal: "serbaciumacencu@gmail.com",
    emailFacultate: "serban.ciumacencu@stud.acs.upb.ro",
  },
] as const;

/** Toate adresele, ca listă plată — pentru paginile care doar le înșiră. */
export const ADRESE_EMAIL = [
  { nume: PERSOANE[0].nume, email: PERSOANE[0].emailPersonal },
  { nume: PERSOANE[0].nume, email: PERSOANE[0].emailFacultate },
  { nume: PERSOANE[1].nume, email: PERSOANE[1].emailPersonal },
  { nume: PERSOANE[1].nume, email: PERSOANE[1].emailFacultate },
] as const;

/** Unde învățăm — apare pe pagina de contact. */
export const FACULTATE = "UPB, Facultatea de Automatică și Calculatoare, specializarea CTI";

/** Depozitul public al site-ului. */
export const GITHUB_URL = "https://github.com/SerbaC6/numerical-methods-visualizer";

/**
 * Data ultimei revizuiri a paginilor de termeni și confidențialitate. Se scrie
 * cu mâna, la fiecare modificare a textului lor — nu se ia din ceas, fiindcă
 * „actualizat azi" pe un text nemodificat de un an ar fi o minciună.
 */
export const DATA_ACTUALIZARE = "14 august 2026";

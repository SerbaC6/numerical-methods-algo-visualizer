/**
 * Verificare de suprafață a unei expresii scrise de utilizator, doar cât să dăm
 * feedback la tastare: caractere permise și paranteze închise.
 *
 * Evaluarea propriu-zisă vine în Faza 4, cu un parser adevărat — niciodată `eval`.
 *
 * @returns mesajul de eroare, sau `null` dacă expresia trece verificarea.
 */
export function verificaExpresie(expresie: string): string | null {
  const text = expresie.trim();
  if (text === "") return "Scrie o expresie.";
  if (!/^[-+*/^().,\s0-9a-zA-Z]*$/.test(text)) return "Conține caractere nepermise.";

  let deschise = 0;
  for (const ch of text) {
    if (ch === "(") deschise++;
    if (ch === ")") deschise--;
    if (deschise < 0) return "Ai închis o paranteză care nu era deschisă.";
  }
  if (deschise > 0) return "Ți-a rămas o paranteză deschisă.";
  return null;
}

# `src/algorithms`

Implementările metodelor numerice, **fără JSX**. Fiecare fișier exportă un obiect
conform contractului comun (`meta`, `params`, `run(params)`), ca să poată fi testat
independent de interfață. Registrul din `registry.ts` e sursa unică de adevăr pentru
ce metode există pe site.

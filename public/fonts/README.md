# `public/fonts`

Fonturile auto-găzduite: **Nunito Sans** (text) și **JetBrains Mono** (formule și tabele
numerice, pentru cifrele tabulare). Nu folosim CDN — site-ul nu face cereri către domenii
externe.

Sunt variable fonts, deci un fișier acoperă toate grosimile. Subset: latin + latin-ext
(latin-ext aduce Ș/ș/Ț/ț cu virgulă, U+0218–U+021B).

Se descarcă din nou cu:

```bash
python3 scripts/descarca-fonturi.py
```

Declarațiile `@font-face` stau în `src/styles/fonts.css`.

# Manim

Scenele Manim se randează **offline**, local. Rezultatele ajung în `public/media/<slug>/`
și sunt servite ca fișiere statice — Manim nu rulează niciodată în browser.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python render.py
```

Se configurează în Faza 5 din `Progress.md`. Culorile și fontul vin din `theme.py`,
care oglindește paleta din `src/index.css`.

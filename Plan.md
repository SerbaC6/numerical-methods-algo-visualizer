# SITE MN

## Ideea centrala a site-ului

Mod prin care studentii sa vada si sa se joace cu algoritmii, sa-i inteleaga vizual si sa incerce sa se joace cu ei.

- La nivel de teorie, un paragraf maxim
- Instructiuni despre folosire, ce e algoritmul acela etc.

## Tooling

- React + Vite
- Sa caut React Components libraries pe gratis:
  - <https://ui.shadcn.com> — componente de baza
  - <https://magicui.design> — componente animate, merge peste shadcn/ui (bun pentru partea de animatii)
  - <https://ui.aceternity.com> — efecte vizuale mai spectaculoase (hero, fundaluri, carduri)
- Setup la Github si apoi acces la Claude la commit-uri si la PR-uri
- Font si tema pentru site pe care sa nu le stie Claude
- Sa cautam cum facem animatiile si chestiile interactive in stil Gemini (sa ne jucam cu Claude Design)
- Daca ai chef chiar ajuta sa cauti site-uri si sa le dai reference ca exemplu pentru Claude sa se inspire

## Claude Specific Instructions

- Library Python Manim
- All in romanian
- No auth
- No cookies
- Static website
- SSL encryption
- Github Pages deployment
- Claude Github issues
- Mobile — make sure interactions and visuals wrap around properly
- `.gitignore`
- `robots.txt`
- `progress.md`
- `sitemap.xml`
- TOC
- contact page
- logo placeholder

## Lista Algoritmi

<!-- de completat: ~15 metode numerice -->

## Layout Site

- **Pagina principala**, de cuprins cumva, in care utilizatorul va selecta ce algoritm vrea sa vada
- **Pagina pentru fiecare algoritm**, in care va fi la inceput o chestie vizuala, apoi un scurt Briefing despre algoritm si modul in care functioneaza, apoi o interfata interactiva cu care sa schimbe modul in care este asezat, lucreaza, etc. Cumva, dupa modul in care se schimba formula de baza sa se schimbe si imaginea

**Exemple:**

- <https://visualgo.net/en>
- <https://csvistool.com/>
- <https://www.dsavisualizer.in/visualizer/searching/binarysearch>

## Design (DECIS)

**Paleta: „Sapphire nightfall whisper"**

| Hex | Culoare | Rol |
|---|---|---|
| `#0474C4` | safir | accent principal |
| `#5379AE` | albastru estompat | accent secundar |
| `#2C444C` | gri-verzui inchis | suprafata / neutru |
| `#A8C4EC` | albastru deschis | accent pe fundal inchis, text secundar |
| `#06457F` | albastru adanc | accent apasat, hover |
| `#262B40` | bleumarin inchis | fundal tema intunecata |

- **Font:** Nunito Sans (titluri + text). Mono pentru formule/tabele numerice: de ales separat.

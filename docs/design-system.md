# Design system

> ⚠️ **Document de lucru, nu rezultat final.** Faza 2 e debifată în `Progress.md`: regulile de
> mai jos sunt punctul de plecare și se schimbă odată cu paginile reale.

Limba vizuală a proiectului. Deciziile de aici se aplică la toate cele 19 pagini de metode;
dacă o pagină are nevoie de altceva, se schimbă întâi documentul ăsta, apoi pagina.

Pagina vie cu toate componentele: `src/pages/DesignSystem.tsx`, pe ruta `/design-system` —
**doar în dev**, nu intră în build-ul de producție.

---

## 1. Culoare

Paleta „Sapphire nightfall whisper". Tokens brute în `src/index.css`, blocul `@theme`.

| Token              | Hex       | Rol                                                |
| ------------------ | --------- | -------------------------------------------------- |
| `--color-safir`    | `#0474C4` | accent principal, iterația curentă                 |
| `--color-estompat` | `#5379AE` | accent secundar, iterații anterioare               |
| `--color-ardezie`  | `#2C444C` | suprafețe                                          |
| `--color-cer`      | `#A8C4EC` | text secundar, grilă, adnotări, inel focus         |
| `--color-adanc`    | `#06457F` | accent apăsat, interval evidențiat                 |
| `--color-noapte`   | `#262B40` | fundalul temei întunecate, textul pe temă deschisă |

**Regula de contrast.** Pe fundal închis, textul-accent e `#A8C4EC` (7,8:1 față de `#262B40`).
Safirul `#0474C4` are 2,9:1 pe același fundal — **culoare de umplere, niciodată de text.**
În tema luminoasă accentul de text devine `#06457F` (9,2:1).

Stările (succes / atenție / eroare) sunt derivate **în afara** paletei: paleta e monocromă pe
albastru și nu poate purta singură înțelesul de „divergent".

**Roluri de vizualizare** — aceleași în web și în scenele Manim, ca desenul și animația să
însemne același lucru:

| Token            | Înțeles                     |
| ---------------- | --------------------------- |
| `--viz-functie`  | funcția / datele de intrare |
| `--viz-curent`   | iterația curentă            |
| `--viz-anterior` | iterațiile anterioare       |
| `--viz-interval` | intervalul evidențiat       |
| `--viz-solutie`  | soluția / convergența       |
| `--viz-grila`    | grilă și adnotări           |

Verificare automată a contrastului:

```bash
python3 scripts/verifica-contrast.py
```

Toate perechile folosite trec AA (≥ 4,5:1). Cele două care „pică" sunt perechile **interzise** —
safirul ca text pe fundal închis și estompatul ca text pe fundal deschis — și sunt în listă
intenționat, ca teste de regresie pentru regula de mai sus.

## 2. Teme

Tema implicită e cea **luminoasă** (fundal `#F7F9FD`). Valorile ei stau pe `:root`, ca pagina să
arate corect și înainte ca JS-ul să apuce să pună clasa pe `<html>`. Comutarea adaugă `.light` sau
`.dark`; tema întunecată (`#262B40`) suprascrie tokens-urile în blocul `.dark`.

Accentul folosit **ca text** diferă pe teme, din contrast: `#0474C4` pe fundal deschis (4,63:1),
`#A8C4EC` pe fundal închis (7,84:1). `#5379AE` nu se folosește ca text pe fundal deschis (4,23:1),
iar `#0474C4` nu se folosește ca text pe fundal închis (2,86:1). Inelul de focus urmează `--ring`:
`#06457F` pe deschis, `#A8C4EC` pe închis.

Preferința se ține în `localStorage`, cheia `mn-tema`. E **singurul** lucru pe care îl scriem în
browser: fără cookies, fără analytics, fără date personale.

## 3. Tipografie

- **Nunito Sans** — titluri și text. Grosimi 400 / 600 / 700–800.
- **JetBrains Mono** — formule, valori de parametri, tabele de iterații. Ales pentru cifre
  tabulare (coloanele se compară pe verticală) și pentru că distinge clar `0/O` și `1/l/I`.

Ambele sunt **self-hosted** în `public/fonts`, variable fonts, subset latin + latin-ext,
`font-display: swap`. Preîncărcat: doar subsetul latin al fontului principal.

**Diacritice.** Verificat cu fontTools: ambele fonturi au Ș/ș/Ț/ț la codepoint-urile cu virgulă
(U+0218–U+021B), nu doar variantele cu sedilă, plus Ă/Â/Î. Scrie mereu cu virgulă.

Descărcarea fonturilor se reface cu:

```bash
python3 scripts/descarca-fonturi.py
```

Scala tipografică e fluidă (`clamp`), raport ~1,25: `text-afis`, `text-titlu`, `text-sectiune`,
`text-subsectiune`. Textul curent rămâne la mărimile Tailwind.

Cifrele tabulare sunt pornite automat pe `.font-mono`, pe `table` și pe `input[type=number]`.

## 4. Mișcare

Trei durate, atât:

| Token            | Valoare | Când                                 |
| ---------------- | ------- | ------------------------------------ |
| `duration-rapid` | 150 ms  | hover, focus, apăsare                |
| `duration-mediu` | 250 ms  | apariții, schimbări de stare         |
| `duration-lent`  | 400 ms  | layout, panouri, tranziții de pagină |

Easing: `ease-standard` implicit, `ease-iesire` pentru ce intră în ecran, `ease-elastic` doar
pentru accente rare.

**Ce se animează:** apariția panourilor, evidențierea rândului curent, evidențierea din formulă,
pașii vizualizării.
**Ce nu se animează:** textul, tabelele la scroll, culorile de stare (o eroare nu „se strecoară").

**Regula de aur:** pe paginile de algoritm se mișcă **graficul**, nu ambalajul. Efectele
decorative (Magic UI / Aceternity) stau pe pagina de cuprins și pe hero — maximum 2–3, și
re-colorate pe paleta noastră înainte de folosire (vin cu gradienturi violet/roz).

Tot ce se mișcă respectă `prefers-reduced-motion`, dar prin **două** mecanisme, fiindcă avem două
feluri de animație:

- animațiile CSS — `index.css` taie duratele global la utilizatorii care au cerut asta;
- animațiile scrise cu `motion` — `MotionConfig reducedMotion="user"`, în `src/main.tsx`.

Al doilea nu e opțional și nu se poate înlocui cu primul: regula din `index.css` n-are nicio putere
peste animațiile în JavaScript.

**Bibliotecă de animație: `motion`** (fostul Framer Motion). Decizia s-a luat înainte de prima
pagină de metodă, iar motivele sunt în [`CLAUDE.md`](../CLAUDE.md), la „Decizii de luat înainte de
Etapa 0". Pe scurt: CSS nu poate anima geometria SVG (`x`, `width`) pe toate browserele — pe Safari
banda intervalului sare în loc să alunece, adică exact animația centrală a bisecției — iar paginile
grele cer secvențe, nu simple schimbări de valoare.

Costul e ~124 KB, dar stă într-un chunk încărcat leneș; `MotionConfig` din rădăcină adaugă în
bundle-ul principal doar 0,6 KB.

**`motion` nu se bate cu Manim** — acoperă secțiuni diferite ale paginii. `motion` face secțiunea
**Interactiv** (interfața cu care te joci), Manim face secțiunea **Vizual** (clipul pre-randat, care
spune despre ce e vorba). Detaliile deciziei: [`CLAUDE.md`](../CLAUDE.md), §„Manim sau `motion`".

**Duratele și curbele se iau din [`src/lib/miscare.ts`](../src/lib/miscare.ts)** — `tranzitie()`,
`DURATE`, `CURBE` — niciodată numere scrise de mână. Fișierul ține aceleași valori ca tabelul de
mai sus, în forma cerută de `motion` (secunde, vectori Bézier), iar `verificaMiscare()` compară
cele două surse la pornire, în dezvoltare.

Tokenii de mișcare stau într-un bloc **`@theme static`**: Tailwind v4 elimină din CSS-ul generat
variabilele de temă nefolosite, iar `--duration-lent` și `--ease-intrare` chiar lipseau din build
înainte de asta.

**Din Magic UI** sunt alese trei componente (vezi `Plan.md`); `animated-beam` nu mai are nimic de
decis, fiindcă `motion` e deja asumat:

| Componentă               | Unde                      | Ce aduce                        |
| ------------------------ | ------------------------- | ------------------------------- |
| `particles`              | fundalul hero-ului        | nimic — canvas pur              |
| `animated-beam`          | hero / carduri            | `motion`, deja în proiect       |
| `animated-theme-toggler` | înlocuiește `ThemeToggle` | `lucide-react`, deja în proiect |

`animated-theme-toggler` scrie direct pe `<html>` prin View Transitions API: la integrare trebuie
legat de `src/hooks/use-theme.ts`, altfel avem două surse de adevăr pentru temă.

## 5. Componente

`src/components/ui/` — generice, luate din shadcn/ui și re-colorate (cod copiat, nu dependență):
Button, Card, Slider, Input, Label, Badge, Skeleton, Separator, Tabs, Accordion, Select, Tooltip,
Popover.

`src/components/viz/` — aparatul interactiv al unei pagini de algoritm:

| Componentă        | Ce face                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `ControlPanel`    | grupul de parametri, responsiv, cu „Resetează"                             |
| `PlaybackBar`     | reset / pas înapoi / play-pauză / pas înainte / viteză / poziție           |
| `IterationTable`  | tabel de iterații, antet lipit, rând curent evidențiat, clic = sari la pas |
| `FormulaBlock`    | formulă KaTeX, cu evidențierea părților sincron cu animația                |
| `NumberInput`     | câmp numeric cu validare și mesaj de eroare legat prin `aria-describedby`  |
| `ExpressionInput` | câmp pentru `f(x)`, font mono, validare la tastare, exemple cu un clic     |
| `Legend`          | legenda de culori + „cum se folosește" în 3–5 pași                         |

### Legenda — obligatorie la fiecare interfață interactivă

Cerință din `Plan.md`: orice figură sau interfață cu care se joacă utilizatorul trebuie să aibă
legendă **și** explicația modului de funcționare. Stau în aceeași componentă tocmai ca să nu se
uite una din ele:

```tsx
<Legend
  elemente={[
    { rol: "functie", explicatie: "curba pe care căutăm rădăcina" },
    { rol: "interval", eticheta: "intervalul [aₖ, bₖ]" },
    { rol: "curent", eticheta: "mijlocul xₖ" },
  ]}
  pasi={["Scrie funcția sau alege un exemplu.", "Apasă play sau mergi pas cu pas."]}
/>
```

Culorile **nu se scriu de mână** în legendă: `rol` le ia din `src/lib/viz-roles.ts`, care e sursa
unică pentru rolurile `--viz-*`. Dacă schimbi un token, legenda se schimbă cu el și nu poate ajunge
să contrazică desenul. `eticheta` se rescrie când pagina are un nume mai bun pentru același rol.
Pentru ceva ce încă n-are rol definit, dai `culoare` + `eticheta` explicit.

Culoarea nu e niciodată singurul semnal: fiecare element are și **formă** (linie, linie punctată,
punct, zonă, celulă) și text, ca legenda să funcționeze și pentru cine nu distinge culorile.
Forma din legendă trebuie să fie cea din figură — un interval e zonă, nu bulină.

`src/components/content/` — blocuri de text și navigare: `Callout` (de știut / de reținut /
atenție / capcană), `AlgorithmCard` (cardul din cuprins, cu starea „în curând").

### Legătura formulă ↔ animație

Cerința centrală din `Plan.md`. Mecanismul: în LaTeX marchezi părțile cu `\htmlId{...}{...}`, iar
`FormulaBlock` primește lista de id-uri active:

```tsx
<FormulaBlock
  latex={String.raw`x_k = \frac{\htmlId{f-a}{a_k} + \htmlId{f-b}{b_k}}{2}`}
  evidentiaza={["f-a"]}
/>
```

Aceleași id-uri se folosesc și pentru elementele din desen, deci `l21` se aprinde simultan în
matrice și în formulă. KaTeX rulează cu `trust` limitat la `\htmlId` și `\htmlClass` — nu se
poate injecta HTML arbitrar.

KaTeX (JS + CSS + fonturi, ~78 KB gzip) se încarcă **la cerere**, nu în bundle-ul inițial:
pagina de cuprins nu are formule. Fonturile lui vin din pachet, deci tot fără cereri externe.

## 6. Responsivitate

Breakpoint-urile sunt cele Tailwind, nemodificate:

| Nume | De la   | Ce se schimbă la noi                     |
| ---- | ------- | ---------------------------------------- |
| —    | 0       | o coloană; grafic sus, controale jos     |
| `sm` | 640 px  | parametrii pe două coloane               |
| `md` | 768 px  | meniul iese din drawer                   |
| `lg` | 1024 px | grafic și controale alături; TOC lateral |
| `xl` | 1280 px | container la lățime maximă               |

Reguli:

- **grafic sus, controale jos pe mobil** — vrei să vezi graficul când tragi de un slider;
- toate controalele au minimum 44×44 px (`.tinta-atingere`);
- tabelele largi fac scroll în containerul lor (`.scroll-tabel`), nu împing pagina;
- de testat pe 360 px și pe 1440 px+.

## 7. Accesibilitate

- inel de focus vizibil peste tot (`:focus-visible`, 2 px `#A8C4EC`);
- fiecare control are etichetă vizibilă; `placeholder` nu ține loc de etichetă;
- mesajele de eroare sunt legate prin `aria-describedby` și au `role="alert"` unde apar la tastare;
- pozițiile din playback se anunță cu `aria-live="polite"`;
- iconițele decorative au `aria-hidden`, butoanele-iconiță au `aria-label`;
- contrast AA verificat cu scriptul de mai sus, în ambele teme.

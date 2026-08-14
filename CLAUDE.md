# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Limba

Tot ce ajunge la utilizator — UI, texte, comentarii în cod, commit-uri, documentație — se scrie
**în română, cu diacritice** (Ș/ș/Ț/ț cu virgulă, U+0218–U+021B). Identificatorii din cod sunt tot
în română (`verificaExpresie`, `--fundal`, `VITEZE`); numele shadcn/ui rămân în engleză.

## Înainte de orice sesiune de lucru

Citește **[`Plan.md`](./Plan.md)** (viziunea, cele 19 pagini și ce trebuie să conțină fiecare) și
**[`Progress.md`](./Progress.md)** (fazele, checkbox-urile, deciziile deschise). Progress.md se
actualizează la finalul fiecărei sesiuni — bifezi ce ai terminat.

## Comenzi

```bash
npm install
npm run dev        # http://localhost:5173/numerical-methods-algo-visualizer/ (atenție la base path)
npm run build      # tsc -b && vite build → dist/
npm run preview
npm run typecheck  # tsc -b --noEmit
npm run lint       # oxlint + prettier --check
npm run lint:fix
```

Testele nu există încă; se introduc în Faza 4, odată cu `src/algorithms/`.

Manim (offline, local — niciodată în browser):

```bash
cd manim && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && python render.py
```

Scripturile din `scripts/` (`descarca-fonturi.py`, `verifica-contrast.py`) se rulează manual, cu
Python 3 pur, și nu fac parte din build.

## Regula de conținut (nenegociabilă)

**Formulele, definițiile, notațiile și exemplele vin exclusiv din `cursuri_MN/`** (12 fișiere de
curs + 21 de capturi în `cursuri_MN/poze/`). Nimic din memorie, nimic din alte surse. Înainte să
scrii o pagină, citește întâi cursul-sursă indicat în tabelul din Faza 7 din `Progress.md`.
Inspirația pentru animații și interfețe poate veni de oriunde — formulele nu.

Fiecare interfață interactivă trebuie să aibă legendă și să facă paralela explicită
formulă ↔ animație (ce parte din formulă corespunde cărui element vizual).

**Nicio trimitere la curs în interfață.** Pe site nu se scrie niciodată „curs6 §4.2", „curs 5, §8.4",
„Algorithm 4", „Figura 1 din laborator" sau orice altă indicație de unde vine o formulă. Nici în
teorie, nici în legendă, nici în explicația unui pas, nici în descrierea unei coloane de tabel, nici
în callout-uri. Regula nu are excepții și nu se negociază per pagină.

Motivul: cine citește pagina nu are cursul deschis lângă el, iar o paranteză cu numărul secțiunii nu
îi spune nimic — îl trimite altundeva în loc să-i explice aici. Afirmația trebuie să se susțină
singură. Dacă nu se susține fără trimitere, textul e prea scurt, nu insuficient citat.

**Trasabilitatea rămâne, dar în cod.** Câmpurile `sursa` (din `src/content/`) și `meta.sursa` /
`cursSursa` (din `src/algorithms/`) sunt **obligatorii** și se completează în continuare: ele nu se
randează nicăieri și există exclusiv pentru cine editează, ca regula „formulele vin din `cursuri_MN/`"
să poată fi verificată mai târziu fără să recitești tot cursul. La fel, comentariile din cod pot și
trebuie să citeze secțiunea. Granița e simplă: **în cod, da; pe ecran, niciodată.**

**Fără secțiune „cum se folosește".** Nu se scrie lista de pași de folosire (`pasi` din `Legend`) și
nici textele mărunte de sub titlul panoului de parametri sau sub câmpuri („alege funcția din
curs…"). Interfața se explică singură prin legendă, etichetele controalelor și formula pasului
curent; instrucțiunile de folosire nu ajung pe site, nici acum, nici mai târziu.

**Antetul unei pagini de algoritm e doar breadcrumb + titlu.** Descrierea scurtă de sub titlu
(`pagina.descriere` din registru) **nu** se afișează pe pagina metodei — rămâne exclusiv pe cardul
din cuprins, unde chiar ajută la ales. Pe pagină, prima secțiune spune oricum același lucru, mai
bine: un rezumat de o propoziție între titlu și teorie doar amână începutul. `PageHeader` păstrează
prop-ul `descriere` pentru paginile statice (contact, termeni, confidențialitate); `PaginaAlgoritm`
nu i-l dă.

### Corectitudinea matematică — zero greșeli, fără excepții

**Nimic din ce ajunge sub ochii utilizatorului nu are voie să fie greșit matematic.** Nici o
formulă, nici un semn, nici un indice, nici un rezultat intermediar, nici o propoziție care descrie
un pas. Nu există „aproximativ corect" și nu există greșeală acceptabilă fiindcă e „doar o
demonstrație" sau „doar în galerie". Site-ul e material de învățat: un student care memorează o
formulă greșită de aici o duce mai departe la examen.

Asta se aplică la **tot** — formule, exemple numerice, etichete, explicații de pas, texte de
legendă, comentarii din cod, rezumate pentru cititorul de ecran.

**Nu ai voie să scrii matematică din memorie.** Deschizi fișierul din `cursuri_MN/` și îl citești
înainte, de fiecare dată, chiar dacă „știi" rezultatul.

Înainte să declari gata orice piesă cu conținut matematic:

1. **Verifică față de sursă.** Fiecare formulă și fiecare exemplu se compară cu cursul, nu cu
   intuiția. Dacă cursul dă un exemplu rezolvat, folosește-l pe acela.
2. **Verifică numeric, separat.** Rulează calculul independent de aplicație (un script scurt) și
   compară cifră cu cifră cu ce e în curs. Nu te baza pe faptul că pare corect pe ecran.
3. **Verifică semnele și indicii.** Aici apar cele mai multe greșeli: `−(−2)` scris ca `−2`, indici
   0-based afișați ca 1-based, `µ` calculat înainte sau după transformare, minus tipografic
   confundat cu cratimă.
4. **Verifică cazurile-limită** cerute de metodă: pivot nul, împărțire la zero, divergență,
   interval greșit. Dacă metoda eșuează, textul trebuie să spună corect **de ce**.
5. **Verifică coerența** dintre formulă, desen, tabel și propoziție. Toate patru descriu același
   pas; dacă una spune altceva, e greșeală, chiar dacă fiecare în parte pare corectă.

Dacă nu poți verifica ceva — nu îl scrii. Spui că nu ai putut verifica și te oprești acolo. **Un
gol declarat e acceptabil; o afirmație matematică negarantată, nu.**

**Când cursul însuși greșește**, regula de corectitudine o bate pe cea de fidelitate: formula nu
ajunge pe site, dar nici nu se „corectează" tăcut. Se scrie în
[`docs/erata-cursuri.md`](./docs/erata-cursuri.md), cu verificarea numerică care a prins-o, și —
dacă se poate — se păstrează concluzia pe o cale care se verifică. Fișierul acela există ca să nu
se repare la loc: cine compară site-ul cu cursul peste trei luni trebuie să găsească acolo de ce
diferă.

Când notația intuitivă cerută pentru interfață diferă de cea din curs (de ex. `L₁`/`C₁` în loc de
`E₁`/`x₁`), se schimbă **doar numele**, niciodată cifrele sau operațiile — iar diferența se notează
în cod, ca să se poată pune notația din curs alături pe pagina reală.

## Stările de progres nu ajung niciodată în interfață

**Pe site nu apare nicio etichetă de stare: „în lucru", „în curând", „urmează", „TODO", „beta",
„work in progress" sau orice altă formulă care spune vizitatorului că ceva nu e gata.** Fără
badge-uri de progres, fără secțiuni „ce urmează", fără note de scuze. Regula ține și de anunțuri:
nu promitem în interfață pagini sau funcții viitoare.

Ce nu e gata are două variante, ambele tăcute:

- **lipsește din interfață** — nu adaugi linkul, nu adaugi rândul; sau
- **stă ca placeholder neutru** — un `Skeleton`, un card gol, un spațiu rezervat, fără text care
  să explice că lipsește ceva.

Evidența a ce urmează se ține **exclusiv în `Progress.md`**. Acolo scrii tot: ce e schelet, ce
pagini vin, ce s-a amânat. În `src/` — nimic.

## Arhitectură

Site 100% static, fără auth, fără cookies, fără tracking, fără cereri către domenii externe (de
aceea fonturile sunt auto-găzduite în `public/fonts/`). Singura scriere în `localStorage` e
preferința de temă (`mn-tema`). Deploy pe GitHub Pages ca _project page_ — de aici `base` din
`vite.config.ts`; dacă se trece pe domeniu propriu, `base` devine `/`.

Separarea de bază, care ține tot proiectul:

- `src/algorithms/` — matematica, **fără JSX**. Fiecare metodă exportă `meta`, `params`, `run(params)`
  și produce `steps[]`, fiecare pas cu explicația lui de o propoziție. `registry.ts` e sursa unică
  de adevăr pentru ce metode există pe site. Testabil complet independent de UI.
- `src/components/viz/` — aparatul interactiv (`ControlPanel`, `PlaybackBar`, `IterationTable`,
  `FormulaBlock`, `NumberInput`, `ExpressionInput`). **Nu conțin matematică** — primesc `steps[]`
  gata calculați.
- `src/content/` — textele în română (briefing, instrucțiuni, capcane), un fișier per slug, ca să
  se poată corecta fără să atingi logica.
- `src/components/ui/` — shadcn/ui copiat în repo; e cod al proiectului, se poate modifica, dar
  re-colorează-l pe paletă. Exclus din lint în `.oxlintrc.json`.
- `src/lib/`, `src/hooks/`, `src/pages/`, `src/styles/`, `public/media/` (Manim randat), `manim/`.

Evaluarea expresiilor utilizatorului: **niciodată `eval`**. `src/lib/expresii.ts` face doar
validare de suprafață; parserul adevărat vine în Faza 4.

## Design system

### Paleta — „Sapphire nightfall whisper" (DECISĂ, închisă)

> **NICIODATĂ nu folosi altă culoare în afara acestei liste.** Nu inventa culori, nu „completa"
> paleta, nu împrumuta culori din exemple de pe net, din shadcn, din Magic UI sau din Tailwind
> (`slate-800`, `blue-500` etc. sunt interzise). Excepțiile deja aprobate, toate definite explicit
> în `src/index.css`, sunt stările succes/atenție/eroare și cele trei culori de vizualizare care
> nu pot fi albastre: `--viz-solutie` (verde pe luminoasă, alb pe întunecată), `--viz-pivot`
> (vermillion) și `--viz-interval`
> (chihlimbar/portocaliu) — ultimele două, explicate mai jos.
>
> Dacă o componentă sau o vizualizare pare că are nevoie de o culoare nouă: **oprește-te și
> întreabă-mă**. Nu adăuga culoarea și nu explica după aceea — decizia de culoare e a mea, nu a ta.
> Doar dacă îți spun eu explicit „folosește culoarea X" intră ceva nou în paletă, și atunci intră
> ca token în `src/index.css` și se oglindește în `manim/theme.py`, nu scris direct în componentă.

Șase culori de interfață, atât. Dacă ai nevoie de o nuanță intermediară, **derivă** din cele de mai jos cu
`color-mix(in oklab, …)`, cum se face deja în `src/index.css` — asta nu e culoare nouă.

> **Suprafața temei întunecate e o derivată, nu ardezia.** Ardezia stă pe hue 195, adică
> albastru-verde; pusă ca fundal de card lângă un fundal albastru curat (noapte, hue 228), făcea
> fiecare căsuță de pe site să pară verde. Acum se folosește
> `color-mix(in oklab, var(--color-noapte) 70%, var(--color-estompat))` → `#33415F`, hue 221.
>
> Mai deschisă de atât **nu se poate**, oricât ar cere ochiul, iar limita e ușor de uitat: eticheta
> pivotului (`#FF8E74`) ajunge la exact 4,55:1 pe suprafața asta, la un prag de 4,5:1. Următoarea
> treaptă o coboară sub prag. Un card alb ar duce textul (`#EEF3FB`) la 1,02:1 — invizibil. Ca să se
> poată lumina suprafața, trebuie întâi recalibrate `--viz-*-eticheta` și `--text-slab`.

| Hex       | Token              | Rol                                                               |
| --------- | ------------------ | ----------------------------------------------------------------- |
| `#0474C4` | `--color-safir`    | accent principal — buton primar, linia funcției, iterația curentă |
| `#5379AE` | `--color-estompat` | accent secundar — iterații anterioare, elemente inactive, borduri |
| `#2C444C` | `--color-ardezie`  | suprafețe pe tema luminoasă; grila din grafice                    |
| `#A8C4EC` | `--color-cer`      | text pe fundal închis, grilă și etichete de axe                   |
| `#06457F` | `--color-adanc`    | accent apăsat — hover/active, interval evidențiat                 |
| `#262B40` | `--color-noapte`   | fundalul temei întunecate (tema implicită)                        |

#### Vermillionul pivotului — `--viz-pivot` (aprobat explicit)

`#C43314` pe tema luminoasă, `#FF7A5C` pe cea întunecată. **Nu e a șaptea culoare de interfață**:
nu se folosește niciodată pentru butoane, text, suprafețe sau borduri de UI. E un **rol de
vizualizare**, exact ca `--viz-solutie`, care iese din albastru din același motiv — paleta e monocromă pe
albastru și nu poate purta singură anumite sensuri.

Există fiindcă pivotul e elementul cel mai important dintr-o eliminare și trebuie să sară în ochi
peste toate albastrurile. O a treia nuanță de albastru l-ar fi îngropat într-un degrade.

> **Rolul e mai larg decât numele (aprobat explicit).** Pe lângă pivot, vermillionul poartă și
> „punctul în care iterația se blochează" — minimul local din animația paginii 7, acolo unde
> coborârea se oprește fără să fi găsit valea cea mai adâncă. E aceeași idee vizuală: locul care
> decide rezultatul. Eticheta se rescrie local, la fiecare folosire; rolul nu se lărgește mai
> departe fără o aprobare nouă.

> **Pe grilă, roșul înseamnă exclusiv „pivot".** Erorile reale — pivot nul, împărțire la zero,
> divergență — **nu colorează celule**; se scriu ca text în `Callout`. Motivul e măsurat, nu
> estetic: `--viz-pivot` și `--eroare` au luminanțe aproape egale (raport ~1,0), deci s-ar
> distinge doar prin nuanță și s-ar confunda pentru cine are daltonism roșu-verde.

Cifra de pe o celulă umplută cu vermillion își schimbă culoarea între teme: **albă** pe `#C43314`
(5,48:1), **`#262B40`** pe `#FF7A5C` (5,45:1). Inversul pică sub prag în ambele cazuri, iar
`scripts/verifica-contrast.py` are ambele greșeli ca teste care trebuie să pice.

Când se scrie `manim/theme.py` (Faza 5), tokenul se oglindește și acolo.

#### Intervalul — `--viz-interval` (aprobat explicit)

`#BE7434` (chihlimbar) pe tema luminoasă, `#F97B06` (portocaliu) pe cea întunecată. Ca și
vermillionul de mai sus, **nu e culoare de interfață**: doar rol de vizualizare, niciodată buton,
text sau bordură.

Amândouă sunt **domolite intenționat**, ca să nu strige peste albastruri: 3,66:1 pe suprafață pe
luminoasă, 3,86:1 pe întunecată. Mai jos de atât **nu se coboară** — 3:1 e pragul WCAG 1.4.11 pentru
un element grafic, iar sub el paranteza redevine invizibilă, adică exact bugul de la care s-a
pornit. `scripts/verifica-contrast.py` ține treapta următoare de pe fiecare temă (`#D96A05`, 2,95:1
pe întunecată) ca test care trebuie să pice.

> **Pe tema întunecată au picat două variante înaintea portocaliului, din motive diferite — și
> amândouă sunt de reținut.** Un violet (`#9B85D8`) arăta cel mai bine pe ecran și trecea toate
> pragurile de contrast, dar a căzut la `scripts/verifica-daltonism.py`: pentru un protanop ajungea
> la ΔE **10,9** față de safirul iterației curente și **13,1** față de albastrul estompat — adică
> paranteza și punctele deveneau practic aceeași culoare. L-a înlocuit un turcoaz (`#4CA49C`), care
> trecea toate măsurătorile, dar a picat la ceva ce nu măsoară niciun script: citea ca „încă un
> verde" lângă verdele soluției, iar tema întunecată ajungea să nu semene cu cea luminoasă.
>
> Morala dublă: contrastul față de fundal nu e suficient — se verifică și separarea dintre culorile
> care apar în **același** desen — dar nici cifrele nu sunt suficiente. O culoare care trece toate
> pragurile poate fi în continuare greșită pentru ochi, iar atunci se schimbă.

Există fiindcă paranteza intervalului se desenează **exact peste** curbă (`--viz-functie`) și peste
punctul iterației curente (`--viz-curent`). Albastrul adânc de dinainte, la 55% pe fundal bleumarin,
era literalmente invizibil pe tema întunecată — capetele intervalului nu se vedeau deloc.

Nuanța e **aceeași în ambele teme**, ca la toate celelalte roluri; se schimbă doar luminozitatea, cât
să se desprindă de fundalul fiecăreia. Regula de scriere rămâne totuși: legendele și explicațiile
**nu numesc culoarea** („banda portocalie"), ci rolul („intervalul").

Tokenul e **opac**; transparența o pune consumatorul — banda din grafic la 14%, linia activă din
`MatrixGrid` la 20%. Plin, ar înghiți cifra din celulă.

> Intervalul și pivotul sunt calde în **amândouă** temele, deci s-ar putea confunda la daltonism
> roșu-verde. **Pe pagina 7 apar amândouă pline în același desen** (săgeata pasului și steagul
> minimului local), deci relația nu se mai poate presupune — se măsoară: `scripts/verifica-daltonism.py`
> le dă ΔE minim **24,9** pe tema întunecată (deuteranopie) și **49,0** pe cea luminoasă, adică peste
> pragul de ~20 sub care două culori nu se mai separă. În plus, în animație nu se suprapun în timp:
> săgeata dispare exact când se ridică steagul. În matrice, unde ar sta una peste alta,
> intervalul rămâne doar fundal la 20% — compus dă `#F2E3D6` pe luminoasă (4,37:1 față de celula-pivot)
> și `#554F3E` pe întunecată (3,18:1). Ambele perechi sunt teste în
> `scripts/verifica-contrast.py`, iar `scripts/verifica-daltonism.py` ține pivotul între vecinii
> intervalului, ca relația să rămână măsurată. Dacă vreodată intervalul ajunge culoare plină pe o
> matrice, verificările astea cad și trebuie refăcute.

Separarea față de curbă și de iterația curentă e prin **nuanță**, nu prin luminanță, iar formele
diferă oricum (paranteză vs. linie). De aceea `scripts/verifica-contrast.py` nu pune prag de
luminanță acolo: n-ar măsura nimic real. Ce măsoară ceva real e
`scripts/verifica-daltonism.py` — rulează-l ori de câte ori adaugi sau schimbi o culoare de
vizualizare.

#### Soluția — `--viz-solutie` (aprobat explicit)

`#15803D` (verde) pe tema luminoasă, `#F2F5FA` (alb-albăstrui) pe cea întunecată. Ca și celelalte
două de mai sus, **doar rol de vizualizare**, niciodată buton, text sau bordură de interfață.

Pe tema întunecată soluția e singurul rol care se separă prin **luminozitate**, nu prin nuanță: e
punctul cel mai deschis din desen. Nu e o preferință, e ce a rămas. Nuanțele erau ocupate —
albastrul ține trei roluri, portocaliul intervalul, coralul pivotul — iar tot ce mai încăpea a picat
la `scripts/verifica-daltonism.py`: violetul ajunge la **ΔE 14,1** față de safir, cyanul la **4,5**
față de curbă, magenta cade și față de safir, și față de curbă.

> **Verdele de dinainte (`#4ADE80`) avea o problemă care nu fusese niciodată măsurată.** Trecea
> confortabil față de tot desenul, dar stătea la **ΔE 16,8** față de coralul pivotului: verdele și
> coralul devin amândouă gălbui la deuteranopie. Scăpase fiindcă `verifica-daltonism.py` verifica
> doar candidații pentru interval, iar soluția era acolo doar ca vecin — nu era testată ea însăși.
> De aceea scriptul are acum **două grupe**, una pentru fiecare rol care nu poate fi albastru, și
> fiecare rol e verificat și față de celălalt. Regula: orice rol de vizualizare nou intră în
> script ca **grupă**, nu doar ca vecin.

Albul stă la minimum **ΔE 26,8** față de tot desenul (cel mai strâns e curba) și 49,0 față de pivot.

Consecința pentru desen, de ținut minte: fiind aproape de culoarea textului, marcajul soluției
trebuie să rămână distinct ca **formă**, nu doar ca ton. Aceeași valoare o poartă și `--succes`, ca
„a ajuns la soluție" din grafic și „a ieșit bine" din interfață să însemne vizual același lucru.

Când se scrie `manim/theme.py` (Faza 5), ambele valori se oglindesc și acolo.

**Tipografie:** **Nunito Sans** pentru titluri și text, **JetBrains Mono** pentru formule, valori
de parametri și tabele de iterații (cifre tabulare, distinge `0/O` și `1/l/I`). Ambele
auto-găzduite în `public/fonts/`, fără CDN.

### Cum se folosesc

Tokenii trăiesc într-un singur loc: `src/index.css`, în trei straturi —
`@theme` (culorile brute de mai sus, tipografie, mișcare, umbre) → roluri semantice pe
`:root, .dark` și `.light` → `@theme inline` care le expune ca utilitare Tailwind. Peste ele există
o **punte către numele standard shadcn** (`--background`, `--primary`, `--muted`…), ca să poți lipi
componente din shadcn/Magic UI/Aceternity fără să le rescrii.

Scrie întotdeauna rolul semantic (`bg-suprafata`, `text-text-slab`, `--viz-curent`), nu hexul brut.

- Tema implicită e cea **întunecată**; `:root` conține deja valorile închise, ca pagina să nu
  pâlpâie înainte să ruleze JS-ul (`initTheme()` din `src/hooks/use-theme.ts`, apelat în `main.tsx`).
  Există și temă deschisă (`.light`) — orice componentă nouă se verifică în ambele.
- Culorile de vizualizare au rol semantic fix: `--viz-curent` = iterația curentă,
  `--viz-anterior` = iterații anterioare, `--viz-functie` = curba, `--viz-grila` = grilă/adnotări,
  `--viz-interval` = zona evidențiată (și linia activă dintr-o matrice), `--viz-solutie` = soluția,
  `--viz-pivot` = pivotul. Sursa unică e `src/lib/viz-roles.ts`, de unde își ia și `Legend`
  culorile — deci legenda nu poate ajunge să contrazică desenul. Aceleași valori se oglindesc în
  `manim/theme.py`, ca vizualurile pre-randate să nu se bată cap în cap cu interfața.
- **Culoarea cu care desenezi nu e culoarea cu care scrii.** Fiecare rol are o a doua valoare,
  `--viz-*-eticheta`, folosită exclusiv pentru numele scrise pe desen („x₀", „a₀", „b₀"). Motivul e
  un prag, nu o preferință: WCAG cere 4,5:1 pentru text de corp obișnuit, dar doar 3:1 pentru un
  element grafic, iar rolurile sunt calibrate pentru desen. Safirul iterației curente ajungea la
  2,11:1 ca literă pe tema întunecată — exact interdicția de mai jos. Se ia cu `culoareEticheta(rol)`
  din `src/lib/viz-roles.ts`, **niciodată** cu `culoareRol(rol)` pentru un `<text>`. Eticheta
  păstrează nuanța rolului și schimbă doar luminozitatea (mai deschisă pe fundal închis, mai închisă
  pe fundal deschis), ca legătura dintre numele „x₀" și punctul lui să rămână vizibilă.
  A nu se confunda cu `--viz-pivot-text`, care e cifra scrisă **pe** umplerea pivotului.
- Paleta e monocromă pe albastru, deci nu poate purta singură sensul de „eroare": stările
  (succes/atenție/eroare) sunt derivate separat, în afara paletei.
- `#0474C4` nu se folosește ca text pe fundal închis (~2,9:1) — pe închis, accentul de text e
  `#A8C4EC` (~8,5:1). Pe fundal deschis, `#0474C4` trece AA (~4,8:1) ca text și link.
  Verifică cu `scripts/verifica-contrast.py`.
- Mișcarea are trei trepte: `--duration-rapid` / `-mediu` / `-lent`. Detaliile complete:
  [`docs/design-system.md`](./docs/design-system.md).

Mobilul nu e opțional: fiecare vizualizare și fiecare set de controale trebuie să se comporte
corect în portret și peisaj.

## TODO — animații și interfețe grafice

Ordinea de lucru pentru partea vizuală, **de la cel mai ușor la cel mai greu**. Dificultatea nu e
dată de matematică, ci de **primitiva de desen** pe care o cere pagina: cât timp o pagină
refolosește o primitivă deja construită, e ieftină; când cere una nouă, aceea e munca reală.

Referințele vizuale (ce împrumutăm și ce evităm de la fiecare site analizat) stau în
[`docs/referinte.md`](./docs/referinte.md) — se citește **înainte** de a începe o etapă, nu după.

Regulile care se aplică la fiecare punct de mai jos, fără excepție:

- culorile vin din `src/lib/viz-roles.ts` (`--viz-*`), niciodată scrise direct în componentă;
- fiecare interfață primește **legendă** (`Legend`), fără listă de „cum se folosește";
- fiecare interfață face **paralela explicită formulă ↔ desen** (ce parte din formulă e ce
  element vizual), prin `FormulaBlock` cu `\htmlId`;
- matematica stă în `src/algorithms/`, desenul primește `steps[]` gata calculați;
- verificat în ambele teme, în portret și în peisaj, cu `prefers-reduced-motion`.

### Etapa 0 — primitivele de bază (blochează tot restul)

- [x] **`StepExplanation`** — propoziția care spune ce se întâmplă la pasul curent, lângă desen.
      Cea mai ieftină piesă și cea mai des folosită: intră pe toate cele 19 pagini.
- [x] **`MatrixGrid`** — matricea desenată, cu stări per celulă (normală, evidențiată, deja
      calculată, pivot, zero). Fără sistem de coordonate, doar grilă + tranziții.
      Necesară pe paginile **1, 3, 4, 5, 8, 9, 10, 17**.
- [x] **`Plot`** — axe, grilă, etichete, scalare automată, eșantionarea funcției, `ResizeObserver`,
      zoom/pan. Cea mai grea piesă de fundație și cea de care atârnă zece pagini
      (**6, 7, 11, 12, 13, 14, 15, 16, 18, 19**). **SVG scris de mână**, fără bibliotecă de charting —
      Recharts/visx/D3 sunt gândite pentru date de business și încurcă exact ce ne trebuie (o
      tangentă care apare la pasul 3, un interval care se strânge), plus 40–100 KB. Se compune din
      straturi cu nume (`PlotCurba`, `PlotPunct`, `PlotInterval`, `PlotArie`, `PlotDreapta`), iar
      matematica lui stă în `src/lib/plot-scara.ts` și `plot-esantionare.ts`, verificată numeric.

### Etapa 1 — pagini ușoare (refolosesc primitivele de mai sus)

- [ ] **Pagina 6 — `ecuatii-neliniare`** (puncte fixe, bisecție, Newton, secantă). `Plot` + marker
      de punct, dreaptă tangentă/secantă, interval care se strânge. Interfețe interactive, nu
      animații. E pagina-pilot naturală: cea mai mică distanță între formulă și desen.
- [ ] **Pagina 16 — `newton-cotes`** (trapeze, Simpson, formule compuse). `Plot` + arii
      colorate sub curbă. Primitivă nouă: poligon/arie umplută. Fără stare iterativă complicată.
- [ ] **Pagina 15 — `derivare-numerica`** (two-point, înainte/înapoi, formule cu 3 puncte).
      `Plot` + secanta care se apropie de tangentă când scade `h`. Refolosește `PlotDreapta`,
      deci nu cere nicio primitivă nouă — cea mai ieftină pagină din listă.
- [ ] **Pagina 13 — `cmmp`** (CMMP liniar și polinomial, Padé). `Plot` + norul de puncte și
      dreapta de aproximare. Refolosește tot; nicio primitivă nouă.
- [ ] **Pagina 1 — `factorizari-lu`** (Cramer, LU, Doolittle, Crout, Cholesky). `MatrixGrid` +
      umplere celulă cu celulă, plus spargerea matricei în două. **Fără input manual de valori**
      (cerință din `Plan.md`).
- [ ] **Pagina 3 — `eliminare-gaussiana`** (pivotări). `MatrixGrid` + operații pe linii.
      Primitivă nouă: linia care se mută, se schimbă cu alta și se scalează.
- [ ] **Pagina 4 — `algoritmul-thomas`** (sistem tridiagonal, eliminare înainte, substituție
      înapoi). Aceeași primitivă de linii ca la pagina 3, pe o matrice cu doar trei diagonale —
      de făcut imediat după ea, cât e proaspătă.
- [ ] **Pagina 11 — `interpolare-polinomiala`** (Lagrange, Neville, Runge, spline). `Plot` + puncte
      pe care utilizatorul le trage cu mouse-ul. Primitivă nouă: punct interactiv (drag).

### Etapa 2 — pagini medii (cer o primitivă nouă fiecare)

- [ ] **Pagina 5 — `metode-iterative`** (Jacobi, Gauss-Seidel, SOR). `MatrixGrid` + al doilea desen,
      de convergență (eroarea pe iterații). Două vizualizări sincronizate pe același `steps[]`.
- [ ] **Pagina 17 — `romberg`** (extrapolare Richardson, tabloul Romberg). `MatrixGrid`
      triunghiular, umplut coloană cu coloană. O singură primitivă — pagina s-a ușurat când
      cuadraturile au plecat de pe ea.
- [ ] **Pagina 18 — `cuadraturi-adaptive-si-gaussiene`**. `Plot` pentru intervalul care se
      înjumătățește la Simpson adaptiv și pentru nodurile neechidistante Gaussiene. Primitivă
      nouă: subdiviziunea recursivă desenată fără să devină o pădure de linii.
- [ ] **Pagina 19 — `ecuatii-diferentiale`** (Cauchy, Euler, Runge-Kutta). `Plot` + **câmp de
      direcții** — primitivă nouă: multe segmente scurte orientate, desenate eficient.
- [ ] **Pagina 2 — `norme-si-ortogonalitate`** (norme, Householder, Givens, Gram-Schmidt).
      Primitive noi: vector cu vârf de săgeată, reflexie și rotație interactivă, plus **jocul**
      de Gram-Schmidt (inspirație: PerfectlyNormal, dar cu pași mult mai clari).

### Etapa 3 — pagini grele (primitive scumpe, de atacat la final)

- [ ] **Pagina 8 — `metodele-puterii`** (puterea, puterea inversă, Rayleigh, deflație).
      `MatrixGrid` + vector care converge la direcția proprie. Două feluri de desen pe aceeași
      pagină, sincronizate pe același `steps[]`.
- [ ] **Pagina 9 — `pagerank`**. `MatrixGrid` pentru matricea stocastică + **graf cu noduri și
      muchii** — primitivă nouă, și singurul loc din site care o cere. Iterația e chiar metoda
      puterii de la pagina 8, deci se face după ea.
- [ ] **Pagina 10 — `qr-si-dvs`**. `MatrixGrid` pentru iterațiile QR + interpretarea geometrică a
      DVS: **cerc unitate → elipsă**, primitivă nouă care trebuie legată de valorile singulare.
- [ ] **Pagina 12 — `curbe-bezier`** (Bézier, de Casteljau, 2D **și 3D**). Interpolarea de Casteljau
      e ușoară în 2D; comutatorul 2D/3D cerut în `Plan.md` înseamnă **proiecție 3D scrisă de mână**
      plus rotirea scenei — de departe cea mai mare bucată de cod nou.
- [ ] **Pagina 7 — `metode-de-gradient`** (gradient descendent și conjugat, „valea"). Primitivă
      nouă: **curbe de nivel** (isolinii) peste o funcție de două variabile, plus traseul care
      coboară. Întâi animații explicative, apoi interfața de aprofundare.
- [ ] **Pagina 14 — `fft`**. **Cel mai greu vizual din site**: plan complex, rădăcini ale unității
      și schema recursivă („fluture"). De lăsat ultimul, indiferent de ordinea din care se
      lucrează. (Partea ușoară a vechii pagini 11 a plecat la pagina 13, `cmmp`.)

### Decizii de luat înainte de Etapa 0

- [x] ~~`MatrixGrid` cere stări de celulă care nu există în `viz-roles.ts`~~ → **rezolvat**: s-a
      adăugat un singur rol nou, `pivot`, cu vermillionul aprobat explicit (vezi secțiunea de
      paletă). Restul stărilor refolosesc roluri existente — linia activă e `--viz-interval`, iar
      zerourile produse se estompează, fără culoare proprie.
- [x] ~~Decizia despre `motion`~~ → **se asumă**: `motion` e unealta de animație pentru paginile de
      metodă, nu doar pentru hero. Două motive au înclinat balanța. Întâi, CSS nu poate anima
      geometria SVG (`x`, `width`) decât în browserele care o expun ca proprietăți CSS — pe Safari,
      banda intervalului **sare** în loc să alunece, adică exact animația centrală a bisecției. Al
      doilea, paginile din Etapa 3 (câmp de direcții, curbe de nivel, cerc→elipsă, de Casteljau,
      fluturele FFT) cer secvențe, nu simple schimbări de valoare.

  Trei lucruri fixate odată cu decizia, toate obligatorii:
  - **`MotionConfig reducedMotion="user"` stă în `src/main.tsx`** și e singurul loc din care
    `motion` află de `prefers-reduced-motion`. Regula globală din `index.css` taie **doar** duratele
    CSS; peste animațiile în JS n-are nicio putere. Nu-l muta și nu-l dubla.
  - **Duratele și curbele se iau din `src/lib/miscare.ts`** (`tranzitie()`, `DURATE`, `CURBE`) —
    niciodată numere scrise de mână. Fișierul oglindește tokenii CSS în forma cerută de `motion`
    (secunde, vectori Bézier), iar `verificaMiscare()` compară cele două surse la pornire, în
    dezvoltare, și strigă în consolă dacă se depărtează.
  - Tokenii de mișcare stau într-un bloc **`@theme static`**, nu `@theme`. Tailwind v4 elimină din
    CSS-ul generat variabilele de temă nefolosite: `--duration-lent` și `--ease-intrare` chiar
    lipseau din build, fiindcă nu-i folosea încă nimeni.

  Piesele din `src/components/viz/` care se **mișcă** au trecut deja pe `motion`; granița față de
  CSS e scrisă în [`src/components/viz/README.md`](./src/components/viz/README.md) și e după _ce_ se
  schimbă: geometria pe `motion`, culorile pe CSS.

## Manim sau `motion`: fiecare secțiune cu unealta ei (DECIS)

Cele două nu concurează, fiindcă răspund la întrebări diferite. Împărțirea e fixată și **nu se
renegociază per pagină**:

| Secțiunea din pagină | Unealta                                         | La ce e bună                                                          |
| -------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| **Vizual**           | **Manim**, clip pre-randat offline              | „despre ce e vorba", în treizeci de secunde, înainte de orice formulă |
| **Interactiv**       | **`motion`** + straturile `Plot` / `MatrixGrid` | „ce se întâmplă dacă schimb eu asta"                                  |

Clipul Manim **nu** înlocuiește interfața și nici invers. Un clip nu poate fi oprit la pasul 3, nu
primește parametrii utilizatorului, nu se leagă de evidențierea din formulă prin `\htmlId` și, la
`prefers-reduced-motion`, nu poate decât să arate un poster static. În schimb, o interfață nu poate
duce singură o introducere narativă.

Manim rămâne **exclusiv offline** (vezi §Arhitectură): randare locală, rezultat static în
`public/media/<slug>/`, niciodată în browser. Pipeline-ul se face în Faza 5 din `Progress.md`.

**Excepția 2: pagina 7** (`metode-de-gradient`) — secțiunea „Vizual" există, dar clipul e **scris în
cod**, nu randat cu Manim. Rulează pe un ceas propriu (`Clip` din `src/components/viz/`, cu
`src/lib/compozitie.ts`), iar tot ce se vede e o funcție pură de timpul clipului. Regula generală
rămâne Manim; aici clipul a venit gata făcut ca animație web și s-a portat ca atare. Ce trebuie
ținut minte, dacă se mai repetă: un clip scris în cod **nu** capătă voie să facă și treaba
interfeței interactive — se oprește și se derulează, dar nu primește parametrii utilizatorului.

**Excepția 3: pagina 9** (`pagerank`) — la fel ca pagina 7: secțiunea „Vizual" există, dar clipul e
**scris în cod** (`AnimatiaMatriceiPageRank`), fiindcă a venit gata făcut ca animație web și s-a
portat ca atare. Aceleași două condiții: rulează pe ceasul lui (`Clip`), iar cifrele vin din
`src/algorithms/pagerank/`, ca desenul și textul să nu poată spune lucruri diferite. `d` e fixat —
un clip nu primește parametrii utilizatorului.

**Excepția 1: pagina 6** (`ecuatii-neliniare`) — **fără clip Manim**, doar interfața interactivă.
Bisecția se înțelege trăgând de capetele intervalului, iar un film ar arăta exact ce face interfața,
doar că fără să-l poți opri. Pe pagina aceea secțiunea „Vizual" **nu există**: nu se pune schelet,
nu se pune text de așteptare, nu se anunță nimic — vezi regula despre stările de progres.

## Convenții

- TypeScript strict, cu `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`,
  `verbatimModuleSyntax` și `erasableSyntaxOnly` — fără `enum`/`namespace`, importurile de tipuri
  se scriu `import type`.
- Alias `@/` → `src/`.
- Prettier: 100 de coloane, ghilimele duble, `prettier-plugin-tailwindcss` (ordinea claselor se
  rezolvă automat — nu o rearanja manual).
- Node 22+ (`.nvmrc`), Python 3.12+ pentru vizualuri.

## Git

**Până la primul deploy reușit: doar `main`, commit-uri directe, fără PR-uri.** După primul deploy
se trece pe branch protection + PR-uri obligatorii (pașii marcați cu 🔒 în Faza 1 din `Progress.md`).

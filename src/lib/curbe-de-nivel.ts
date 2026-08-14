/**
 * Curbele de nivel ale funcției pătratice `f(x) = ½·xᵀAx − bᵀx`, în formă
 * închisă.
 *
 * Funcții pure, verificate separat de interfață
 * (`scripts/verificare-algoritmi/curbe-de-nivel.ts`).
 *
 * **De ce nu marching squares.** Când A e simetrică și pozitiv definită,
 * `f(x) = f(x*) + ½·(x − x*)ᵀA(x − x*)` cu `x* = A⁻¹b`, deci mulțimea `f = c` e
 * **exact** elipsa `(x − x*)ᵀA(x − x*) = 2(c − f(x*))`. O simetrică 2×2 are
 * valori și vectori proprii în formă închisă, fără nicio iterație, deci elipsa
 * se parametrizează direct. Marching squares ar aduce o grilă de eșantionare
 * (adică o eroare de discretizare de justificat), contururi cu colțuri, tabela
 * de 16 cazuri și ambiguitatea de șa — fără niciun avantaj. Există pentru
 * funcțiile la care nu ai forma închisă; aici o avem.
 *
 * Câștigul care nu se poate obține din marching squares: se poate cere **exact**
 * curba prin `x⁽ᵏ⁾` (`c = f(x⁽ᵏ⁾)`, o singură evaluare). Aia e chiar explicația
 * zigzag-ului — reziduul nou e normal pe curba pe care iterația tocmai a
 * aterizat, deci perpendicular pe direcția din care a venit.
 */

/**
 * O matrice simetrică 2×2, scrisă ca `[a₁₁, a₁₂, a₂₂]`.
 *
 * Simetria e **structurală**, nu o invariantă de păzit: nu există un al patrulea
 * număr care s-o poată încălca, nici din cod, nici din câmpurile interfeței.
 */
export type Mat2 = readonly [a11: number, a12: number, a22: number];

/** Un vector din planul soluțiilor. */
export type Vec2 = readonly [number, number];

export function inmulteste(A: Mat2, v: Vec2): Vec2 {
  const [a11, a12, a22] = A;
  return [a11 * v[0] + a12 * v[1], a12 * v[0] + a22 * v[1]];
}

export function aduna(u: Vec2, v: Vec2): Vec2 {
  return [u[0] + v[0], u[1] + v[1]];
}

export function scade(u: Vec2, v: Vec2): Vec2 {
  return [u[0] - v[0], u[1] - v[1]];
}

export function scaleaza(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

/** Produsul scalar `⟨u, v⟩ = uᵀv`, notația din curs 5, §8.1. */
export function produsScalar(u: Vec2, v: Vec2): number {
  return u[0] * v[0] + u[1] * v[1];
}

export function norma(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

export function determinant(A: Mat2): number {
  return A[0] * A[2] - A[1] * A[1];
}

/**
 * Criteriul lui Sylvester pentru o simetrică 2×2: toți minorii principali
 * strict pozitivi, adică `a₁₁ > 0` și `det A > 0`.
 *
 * E echivalent cu definiția din curs 5, §8.1 (`xᵀAx > 0` pentru orice `x ≠ 0`),
 * dar se poate verifica din două numere.
 */
export function esteSPD(A: Mat2): boolean {
  return A[0] > 0 && determinant(A) > 0;
}

/** Numărul de condiționare `λmax/λmin` — cât de alungită e valea. */
export function conditionare(A: Mat2): number {
  const { valori } = eigenSimetrica2(A);
  const [l1, l2] = valori;
  const mic = Math.min(Math.abs(l1), Math.abs(l2));
  if (mic < 1e-300) return Number.POSITIVE_INFINITY;
  return Math.max(Math.abs(l1), Math.abs(l2)) / mic;
}

/**
 * Valorile și vectorii proprii ai unei simetrice 2×2, în formă închisă.
 *
 * Pentru `[[a, b], [b, c]]`, ecuația caracteristică e o ecuație de gradul doi cu
 * discriminantul `((a − c)/2)² + b²`, mereu pozitiv — de aceea o simetrică reală
 * are mereu valori proprii reale. Vectorii ies din `(A − λI)q = 0`.
 *
 * Cazul `b = 0` se tratează separat: acolo `(λ₁ − c, b)` devine vectorul nul și
 * formula generală n-ar da nimic, deși matricea e deja diagonală și răspunsul e
 * baza canonică. Același lucru când `a = c` și `b = 0`: valorile proprii sunt
 * egale, orice bază ortonormată e corectă, iar noi o dăm pe cea canonică.
 *
 * Ordinea: `valori[0] ≥ valori[1]`, cu vectorii în aceeași ordine.
 */
export function eigenSimetrica2(A: Mat2): {
  valori: [number, number];
  vectori: [Vec2, Vec2];
} {
  const [a, b, c] = A;
  const mijloc = (a + c) / 2;
  const raza = Math.hypot((a - c) / 2, b);

  const l1 = mijloc + raza;
  const l2 = mijloc - raza;

  if (Math.abs(b) < 1e-14 * Math.max(1, Math.abs(a), Math.abs(c))) {
    // Deja diagonală: axele proprii sunt chiar axele de coordonate. Le dăm în
    // ordinea cerută de valorile proprii.
    return a >= c
      ? {
          valori: [a, c],
          vectori: [
            [1, 0],
            [0, 1],
          ],
        }
      : {
          valori: [c, a],
          vectori: [
            [0, 1],
            [1, 0],
          ],
        };
  }

  const q1 = normalizeazaVec2([l1 - c, b]);
  // Al doilea e perpendicular pe primul — se poate scrie direct, fără a doua
  // rezolvare, fiindcă vectorii proprii ai unei simetrice sunt ortogonali.
  const q2: Vec2 = [-q1[1], q1[0]];

  return { valori: [l1, l2], vectori: [q1, q2] };
}

function normalizeazaVec2(v: Vec2): Vec2 {
  const l = norma(v);
  if (l < 1e-300) return [1, 0];
  return [v[0] / l, v[1] / l];
}

/**
 * Fundul văii: `x* = A⁻¹b`, adică soluția sistemului `A·x = b` și, în același
 * timp, punctul de minim al lui f — echivalența din curs 5, §8.1.
 *
 * Întoarce `null` când A e singulară: atunci ori nu există soluție, ori există o
 * dreaptă întreagă, deci nu e nimic de arătat ca punct.
 */
export function centrul(A: Mat2, b: Vec2): Vec2 | null {
  const det = determinant(A);
  if (!Number.isFinite(det) || Math.abs(det) < 1e-300) return null;

  const [a11, a12, a22] = A;
  return [(a22 * b[0] - a12 * b[1]) / det, (a11 * b[1] - a12 * b[0]) / det];
}

/** `f(p) = ½·pᵀAp − bᵀp`, formula din curs 6, §4. */
export function valoare(A: Mat2, b: Vec2, p: Vec2): number {
  return 0.5 * produsScalar(p, inmulteste(A, p)) - produsScalar(b, p);
}

/**
 * „Raza" unui punct în metrica lui A: `ρ = √((p − x*)ᵀA(p − x*))`.
 *
 * E mărimea care parametrizează familia de elipse — cea care crește **liniar**
 * pe ecran, spre deosebire de nivelul `c`, care crește pătratic.
 */
export function razaA(A: Mat2, b: Vec2, p: Vec2): number {
  const x = centrul(A, b);
  if (!x) return Number.NaN;
  const d = scade(p, x);
  return Math.sqrt(Math.max(0, produsScalar(d, inmulteste(A, d))));
}

/**
 * Înălțimea unui punct **peste fundul văii**: `f(p) − f(x*) = ½·(p−x*)ᵀA(p−x*)`.
 *
 * **Nu e o comoditate, e singura formă care supraviețuiește aproape de `x*`.**
 * Scrisă ca scădere, `valoare(A,b,p) − valoare(A,b,x*)` anulează catastrofal:
 * cele două valori diferă în cifre pe care virgula mobilă nu le mai are.
 * Măsurat pe sistemul din curs (`A = [[4,1],[1,3]]`, `b = (1,2)`), la iterațiile
 * coborârii:
 *
 * | `|x − x*|` | prin scădere | adevărat  | eroare relativă |
 * | ---------- | ------------ | --------- | --------------- |
 * | 8,4·10⁻⁷   | 9,176·10⁻¹³  | 9,176·10⁻¹³ | 5·10⁻⁵        |
 * | 1,8·10⁻⁸   | 4,441·10⁻¹⁶  | 5,310·10⁻¹⁶ | **16 %**      |
 * | 5,9·10⁻⁹   | **0**        | 4,4·10⁻¹⁷ | 100 %           |
 * | 1,5·10⁻⁹   | **−1,1·10⁻¹⁶** | 3,7·10⁻¹⁸ | semn greșit   |
 *
 * Consecințele se vedeau pe ecran: la ultimii pași curba de nivel prin `x⁽ᵏ⁾`
 * dispărea (raza ieșea zero sau imaginară), iar cutia scenei se turtea, deci
 * valea se desena ca un plan gol. Forma pătratică de mai jos are eroare
 * relativă ~10⁻¹⁶ la **orice** distanță.
 */
export function inaltimePesteFund(A: Mat2, b: Vec2, p: Vec2): number {
  const x = centrul(A, b);
  if (!x) return Number.NaN;
  const d = scade(p, x);
  return 0.5 * produsScalar(d, inmulteste(A, d));
}

/**
 * Elipsa de **rază A** dată: `(x − x*)ᵀA(x − x*) = ρ²`.
 *
 * E forma de bază; `elipsaNivel` doar traduce nivelul în rază. Cine are deja
 * raza — de pildă din `razaA`, care o calculează din vectorul diferență — o dă
 * direct aici și scapă de anularea descrisă la `inaltimePesteFund`.
 */
export function elipsaRaza(A: Mat2, b: Vec2, rho: number, puncte = 96): Vec2[] {
  if (!esteSPD(A)) return [];
  const x = centrul(A, b);
  if (!x) return [];
  if (!(rho > 0) || !Number.isFinite(rho)) return [];

  const { valori, vectori } = eigenSimetrica2(A);
  const [l1, l2] = valori;
  const [q1, q2] = vectori;
  const a1 = rho / Math.sqrt(l1);
  const a2 = rho / Math.sqrt(l2);

  const rezultat: Vec2[] = [];
  for (let i = 0; i <= puncte; i++) {
    // Ultimul punct primește exact θ = 0, ca poligonul să se închidă la bit, nu
    // la rotunjire.
    const teta = i === puncte ? 0 : (2 * Math.PI * i) / puncte;
    const c = Math.cos(teta) * a1;
    const s = Math.sin(teta) * a2;
    rezultat.push([x[0] + c * q1[0] + s * q2[0], x[1] + c * q1[1] + s * q2[1]]);
  }
  return rezultat;
}

/**
 * Razele pentru care inelele ies **egal depărtate pe ecran**: `ρⱼ = j·raza/cate`.
 *
 * Naiv, inelele s-ar lua echidistante în nivelul `c`; atunci s-ar îndesi spre
 * margine, fiindcă `c` crește cu pătratul razei.
 */
export function razeEchidistante(raza: number, cate: number): number[] {
  if (!(raza > 0) || cate < 1) return [];
  return Array.from({ length: cate }, (_, j) => ((j + 1) * raza) / cate);
}

/**
 * Elipsa `f = nivel`, ca poligon închis (ultimul punct = primul).
 *
 * Din `A = QΛQᵀ`, punctele elipsei sunt
 * `x(θ) = x* + ρ·( q₁·cos θ/√λ₁ + q₂·sin θ/√λ₂ )`, cu `ρ = √(2(nivel − f(x*)))`.
 * Se verifică imediat: `(x − x*)ᵀA(x − x*) = ρ²(cos²θ + sin²θ) = ρ²`.
 *
 * Întoarce lista goală pentru un nivel sub fundul văii (nu există puncte) și
 * pentru A nepozitiv definită (mulțimile de nivel nu mai sunt curbe închise).
 *
 * **Pentru curba prin punct se folosește `elipsaRaza`, nu asta.** Nivelul unui
 * punct de lângă `x*` nu se poate scădea din `f(x*)` fără să se piardă tot —
 * vezi tabelul de la `inaltimePesteFund`.
 */
export function elipsaNivel(A: Mat2, b: Vec2, nivel: number, puncte = 96): Vec2[] {
  const x = centrul(A, b);
  if (!x) return [];

  const rho2 = 2 * (nivel - valoare(A, b, x));
  if (!(rho2 > 0)) return [];

  return elipsaRaza(A, b, Math.sqrt(rho2), puncte);
}

/**
 * Nivelurile pentru care inelele ies **egal depărtate pe ecran**.
 *
 * Naiv, nivelurile s-ar lua echidistante în `c`; atunci inelele s-ar îndesi spre
 * margine, fiindcă `c` crește cu pătratul razei. Aici se ia raza echidistantă,
 * `ρⱼ = j·raza/cate`, și se întoarce `cⱼ = f(x*) + ½·ρⱼ²`.
 */
export function niveleEchidistante(A: Mat2, b: Vec2, raza: number, cate: number): number[] {
  const x = centrul(A, b);
  if (!x || !(raza > 0) || cate < 1) return [];

  const fMin = valoare(A, b, x);
  const niveluri: number[] = [];
  for (let j = 1; j <= cate; j++) {
    const rho = (j * raza) / cate;
    niveluri.push(fMin + 0.5 * rho * rho);
  }
  return niveluri;
}

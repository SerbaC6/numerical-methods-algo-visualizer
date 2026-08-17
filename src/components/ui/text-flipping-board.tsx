import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Panou split-flap („tabelă de aeroport"), din registry-ul Aceternity, adaptat:
 * culorile vin exclusiv din paletă (panoul e un obiect întunecat în ambele
 * teme, ca un aparat fotografiat), alfabetul are diacriticele românești — dar
 * rola care se rostogolește, doar semne de pe o tastatură obișnuită —, iar la
 * `prefers-reduced-motion` literele apar direct, fără rotire.
 */

/**
 * Ce poate să **rămână** într-o celulă la finalul rotirii. Ce nu e aici devine
 * spațiu — de aceea Ă, Â, Î, Ș, Ț, plus É, care nu e literă românească, dar
 * apare în „curbe Bézier".
 */
const CARACTERE_AFISABILE = " AĂÂBCDEÉFGHIÎJKLMNOPQRSȘTȚUVWXYZ0123456789!@#$%&()-+=;:'\",./?";

/**
 * Ce **fâlfâie** în timpul rotirii: doar semne care se găsesc pe tastatura unui
 * laptop obișnuit, europeană sau americană. Nu e o restrângere estetică — o rolă
 * adevărată are un set fix de clapete, iar ce trecea pe lângă ochi până acum
 * (`°` și literele cu diacritice) arăta ca un alfabet străin amestecat printre
 * litere.
 *
 * Litera finală poate în continuare să aibă diacritice: aceea vine din titlul
 * paginii, nu de pe rolă.
 */
const CARACTERE_ROLA = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&()-+=;:'\",./?";

const BASE_COL_DELAY = 30;
const BASE_ROW_DELAY = 20;
const BASE_STEP_MS = 55;
const BASE_FLIP_S = 0.35;

type AccentColor = {
  top: string;
  bottom: string;
  text: string;
};

/** Sclipirile de culoare din timpul rotirii — doar culori din paletă. */
const ACCENT_COLORS: AccentColor[] = [
  { top: "bg-safir", bottom: "bg-adanc", text: "text-white" },
  { top: "bg-adanc", bottom: "bg-noapte", text: "text-cer" },
  { top: "bg-estompat", bottom: "bg-adanc", text: "text-white" },
  { top: "bg-cer", bottom: "bg-estompat", text: "text-noapte" },
];

/**
 * Corpul literei nu se scrie aici: vine din `--corp-celula`, pusă pe grilă și
 * calculată din lățimea **ei**, nu din a ferestrei (vezi `TextFlippingBoard`).
 * Valoarea de dinainte era `clamp(7px, 2vw, 22px)`, iar `2vw` și lățimea
 * panoului cresc pe curbe diferite: pe un telefon de 360px litera cădea pe
 * podeaua de 7px într-o celulă de 18px, adică de patru ori mai mică, propor-
 * țional, decât pe desktop.
 */
const CELL_TEXT_STYLE: React.CSSProperties = {
  fontSize: "var(--corp-celula)",
  lineHeight: 1,
};

/** Culorile pentru celulele-pastilă scrise ca `{S}`, `{A}`, `{E}`, `{C}`. */
const COLOR_MAP: Record<string, string> = {
  "{S}": "var(--color-safir)",
  "{A}": "var(--color-adanc)",
  "{E}": "var(--color-estompat)",
  "{C}": "var(--color-cer)",
};

/** `true` dacă vizitatorul a cerut mai puțină mișcare din sistemul de operare. */
function useMiscareRedusa() {
  const [redusa, setRedusa] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRedusa(mq.matches);
    const laSchimbare = (e: MediaQueryListEvent) => setRedusa(e.matches);
    mq.addEventListener("change", laSchimbare);
    return () => mq.removeEventListener("change", laSchimbare);
  }, []);

  return redusa;
}

// ── Celula, cu rola ei ────────────────────────────────────────────────

const FlapCell = React.memo(
  function FlapCell({
    target,
    delay,
    stepMs,
    flipDuration,
    static: fara,
  }: {
    target: string;
    delay: number;
    stepMs: number;
    flipDuration: number;
    /** Fără rotire: litera apare direct (mișcare redusă). */
    static: boolean;
  }) {
    const [current, setCurrent] = useState(" ");
    const [prev, setPrev] = useState(" ");
    const [flipId, setFlipId] = useState(0);
    const [accent, setAccent] = useState<AccentColor | null>(null);
    const [prevAccent, setPrevAccent] = useState<AccentColor | null>(null);
    const curRef = useRef(" ");
    const tgtRef = useRef<string | null>(null);
    const accentRef = useRef<AccentColor | null>(null);
    const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (startTimer.current) clearTimeout(startTimer.current);
      if (stepTimer.current) clearTimeout(stepTimer.current);
      startTimer.current = null;
      stepTimer.current = null;

      const normalized = CARACTERE_AFISABILE.includes(target.toUpperCase())
        ? target.toUpperCase()
        : " ";
      if (normalized === tgtRef.current) return;
      tgtRef.current = normalized;

      if (fara) {
        curRef.current = normalized;
        setCurrent(normalized);
        return;
      }

      if (normalized === " " && curRef.current === " ") return;

      const scrambleCount =
        normalized === " "
          ? 8 + Math.floor(Math.random() * 8)
          : 25 + Math.floor(Math.random() * 15);

      const runStep = (i: number) => {
        const isLast = i === scrambleCount;
        const ch = isLast
          ? normalized
          : (CARACTERE_ROLA[1 + Math.floor(Math.random() * (CARACTERE_ROLA.length - 1))] ?? " ");

        const newAccent =
          isLast || Math.random() >= 0.2
            ? null
            : (ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)] ?? null);

        setPrev(curRef.current);
        setPrevAccent(accentRef.current);
        curRef.current = ch;
        accentRef.current = newAccent;
        setCurrent(ch);
        setAccent(newAccent);
        setFlipId((n) => n + 1);

        if (!isLast) {
          stepTimer.current = setTimeout(() => runStep(i + 1), stepMs);
        }
      };

      startTimer.current = setTimeout(() => runStep(1), delay);

      return () => {
        if (startTimer.current) clearTimeout(startTimer.current);
        if (stepTimer.current) clearTimeout(stepTimer.current);
        startTimer.current = null;
        stepTimer.current = null;
        tgtRef.current = null;
      };
    }, [target, delay, stepMs, fara]);

    const show = current === " " ? " " : current;
    const showPrev = prev === " " ? " " : prev;

    const textCx =
      "absolute inset-x-0 flex select-none items-center justify-center font-mono font-bold tracking-wide";
    const topBg = accent?.top ?? "bg-ardezie";
    const bottomBg = accent?.bottom ?? "bg-ardezie";
    const textColor = accent?.text ?? "text-cer";

    const flapTopBg = prevAccent?.top ?? "bg-ardezie";
    const flapTextColor = prevAccent?.text ?? "text-cer";

    const bottomDelay = flipDuration * 0.5;

    return (
      <div className="border-noapte flex aspect-3/6 flex-col overflow-hidden rounded-[2px] border md:rounded-[3px] md:border-2">
        <div className="relative flex-1 perspective-dramatic transform-3d">
          <div className="absolute inset-0 z-40 hidden flex-row items-center justify-center md:flex">
            <div className="bg-noapte h-1/2 w-px rounded-tr-sm rounded-br-sm" />
            <div className="bg-noapte flex h-px flex-1" />
            <div className="bg-noapte h-1/2 w-px rounded-tl-sm rounded-bl-sm" />
          </div>

          {/* jumătatea de sus, litera nouă */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-[calc(50%-0.5px)] overflow-hidden rounded-t-[3px]",
              topBg,
            )}
          >
            <div className={cn(textCx, textColor, "top-0 h-[200%]")} style={CELL_TEXT_STYLE}>
              {show}
            </div>
          </div>

          {/* jumătatea de jos, litera nouă */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 h-[calc(50%-0.5px)] overflow-hidden rounded-b-[3px]",
              bottomBg,
            )}
          >
            <div className={cn(textCx, textColor, "bottom-0 h-[200%]")} style={CELL_TEXT_STYLE}>
              {show}
            </div>
            {flipId > 0 && (
              <motion.div
                key={`s${flipId}`}
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),transparent_60%)]"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: flipDuration * 1.3, ease: "easeOut" }}
              />
            )}
          </div>

          {/* clapeta care cade: jumătatea de sus a literei vechi */}
          {flipId > 0 && (
            <motion.div
              key={flipId}
              className={cn(
                "absolute inset-x-0 top-0 z-10 h-[calc(50%-0.5px)] origin-bottom overflow-hidden rounded-t-[3px] backface-hidden transform-3d",
                flapTopBg,
              )}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -100 }}
              transition={{
                duration: flipDuration,
                ease: [0.55, 0.055, 0.675, 0.19],
              }}
            >
              <div className={cn(textCx, flapTextColor, "top-0 h-[200%]")} style={CELL_TEXT_STYLE}>
                {showPrev}
              </div>
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0),rgba(0,0,0,0.85))]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: flipDuration }}
              />
            </motion.div>
          )}

          {/* clapeta care urcă: jumătatea de jos a literei noi */}
          {flipId > 0 && (
            <motion.div
              key={`b${flipId}`}
              className={cn(
                "absolute inset-x-0 bottom-0 z-10 h-[calc(50%-0.5px)] origin-top overflow-hidden rounded-b-[3px] backface-hidden transform-3d",
                bottomBg,
              )}
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{
                duration: flipDuration * 0.85,
                delay: bottomDelay,
                ease: [0.33, 1.55, 0.64, 1],
              }}
            >
              <div className={cn(textCx, textColor, "bottom-0 h-[200%]")} style={CELL_TEXT_STYLE}>
                {show}
              </div>
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0),rgba(0,0,0,0.5))]"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0 }}
                transition={{
                  duration: flipDuration * 0.85,
                  delay: bottomDelay,
                }}
              />
            </motion.div>
          )}

          {/* linia de îmbinare */}
          <div className="bg-noapte/70 pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-[0.5px]" />
        </div>

        {/* dungile decorative de sub rolă */}
        <div className="text-noapte h-2 w-full bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_1px,transparent_1px,transparent_0.15rem)] mask-t-from-50% md:h-4 md:bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_1px,transparent_1px,transparent_0.2rem)]" />
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.target === nextProps.target &&
    prevProps.delay === nextProps.delay &&
    prevProps.stepMs === nextProps.stepMs &&
    prevProps.flipDuration === nextProps.flipDuration &&
    prevProps.static === nextProps.static,
);

// ── Celula-pastilă de culoare ─────────────────────────────────────────

const ColorCell = React.memo(function ColorCell({ color }: { color: string }) {
  return (
    <div
      className="border-noapte aspect-3/5 rounded-[3px] border-2"
      style={{ backgroundColor: color }}
    />
  );
});

// ── Împărțirea textului în celule ─────────────────────────────────────

type ParsedCell = { type: "char"; value: string } | { type: "color"; hex: string };

function parseRow(row: string): ParsedCell[] {
  const cells: ParsedCell[] = [];
  let i = 0;
  while (i < row.length) {
    if (row.charAt(i) === "{" && i + 2 < row.length && row.charAt(i + 2) === "}") {
      const code = row.substring(i, i + 3);
      const hex = COLOR_MAP[code];
      if (hex) {
        cells.push({ type: "color", hex });
        i += 3;
        continue;
      }
    }
    cells.push({ type: "char", value: row.charAt(i) });
    i++;
  }
  return cells;
}

function wrapParagraph(paragraph: string, maxCols: number): string[] {
  const lines: string[] = [];
  const words = paragraph.split(/[ \t]+/).filter(Boolean);
  let currentLine = "";

  for (const word of words) {
    if (word.length > maxCols) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      lines.push(word.slice(0, maxCols));
      continue;
    }

    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxCols) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapText(input: string, maxCols: number): string[] {
  return input
    .split("\n")
    .flatMap((paragraph) => (paragraph.trim() === "" ? [""] : wrapParagraph(paragraph, maxCols)));
}

// ── Panoul ────────────────────────────────────────────────────────────

export interface TextFlippingBoardProps {
  rows?: string[];
  text?: string;
  className?: string;
  /** Numărul de rânduri și de coloane ale panoului. */
  gridRows?: number;
  gridCols?: number;
  /** Durata totală a rotirii, în secunde. */
  duration?: number;
}

export function TextFlippingBoard({
  rows,
  text,
  className,
  gridRows = 6,
  gridCols = 22,
  duration,
}: TextFlippingBoardProps) {
  const miscareRedusa = useMiscareRedusa();

  const durataDeBaza =
    ((gridCols - 1) * BASE_COL_DELAY + (gridRows - 1) * BASE_ROW_DELAY + 8 * BASE_STEP_MS) / 1000;
  const scale = (duration ?? durataDeBaza) / durataDeBaza;
  const colDelay = BASE_COL_DELAY * scale;
  const rowDelay = BASE_ROW_DELAY * scale;
  const stepMs = BASE_STEP_MS * scale;
  const flipDur = Math.min(0.6, Math.max(0.15, BASE_FLIP_S * scale));

  const board = useMemo(() => {
    const grid: ParsedCell[][] = Array.from({ length: gridRows }, () =>
      Array.from({ length: gridCols }, () => ({ type: "char" as const, value: " " })),
    );

    if (text) {
      const lines = wrapText(text, gridCols).slice(0, gridRows);
      const startRow = Math.max(0, Math.floor((gridRows - lines.length) / 2));
      lines.forEach((line, i) => {
        const rand = grid[startRow + i];
        if (!rand) return;
        const parsed = parseRow(line);
        const startCol = Math.max(0, Math.floor((gridCols - parsed.length) / 2));
        parsed.forEach((cell, c) => {
          if (startCol + c < gridCols) rand[startCol + c] = cell;
        });
      });
    } else if (rows) {
      rows.forEach((row, r) => {
        const rand = grid[r];
        if (!rand) return;
        parseRow(row).forEach((cell, c) => {
          if (c < gridCols) rand[c] = cell;
        });
      });
    }

    return grid;
  }, [rows, text, gridRows, gridCols]);

  return (
    <div
      className={cn(
        "bg-noapte border-bordura shadow-sus relative mx-auto w-full max-w-3xl rounded-xl border p-2 md:rounded-2xl md:p-3",
        className,
      )}
    >
      {/* Cititorul de ecran primește textul întreg, nu 132 de litere răzlețe. */}
      <p className="sr-only">{text ?? rows?.join(" ")}</p>

      <div
        aria-hidden="true"
        className="grid gap-px md:gap-[3px]"
        style={
          {
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            // Containerul stă pe **grilă**, nu pe celulă: `container-type` aduce
            // cu el `contain: layout`, iar celula are `transform-3d` și
            // `perspective-dramatic`, care n-au de ce să fie atinse.
            containerType: "inline-size",
            // 0,66 e raportul măsurat pe desktop (celulă ~33px → literă 22px),
            // deci panoul lat arată exact ca înainte. Pe telefon, celula de
            // ~21px dă o literă de ~14px, în loc de 7.
            "--corp-celula": `clamp(9px, calc(100cqi / ${gridCols} * 0.66), 22px)`,
          } as React.CSSProperties
        }
      >
        {board.map((row, r) =>
          row.map((cell, c) =>
            cell.type === "color" ? (
              <ColorCell key={`${r}-${c}`} color={cell.hex} />
            ) : (
              <FlapCell
                key={`${r}-${c}`}
                target={cell.value}
                delay={c * colDelay + r * rowDelay}
                stepMs={stepMs}
                flipDuration={flipDur}
                static={miscareRedusa}
              />
            ),
          ),
        )}
      </div>
    </div>
  );
}

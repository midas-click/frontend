import { ReactNode, useState, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Palette } from "lucide-react";
import clsx from "clsx";
import { DOT_COLORS } from "@/lib/utils";

interface Props {
  colId: string;
  label: string;
  colorClass: string;
  count: number;
  children: ReactNode;
  onChangeColor: (colId: string, color: string) => void;
  colors: string[];
}

export function KanbanColumn({ colId, label, colorClass, count, children, onChangeColor, colors }: Props) {
  const { setNodeRef } = useDroppable({ id: colId, data: { stage: colId } });

  const [showColors, setShowColors] = useState(false);
  const [palettePos, setPalettePos] = useState({ top: 0, left: 0 });
  const paletteBtnRef = useRef<HTMLButtonElement>(null);

  function openPalette() {
    if (paletteBtnRef.current) {
      const rect = paletteBtnRef.current.getBoundingClientRect();
      setPalettePos({ top: rect.bottom + 6, left: rect.left - 110 });
    }
    setShowColors(true);
  }

  return (
    <div
      ref={setNodeRef}
      data-col-id={colId}
      className={clsx(
        "flex flex-col w-72 shrink-0 rounded-xl border p-3",
        colorClass,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-1 mb-3">
        <h3 className="font-semibold text-sm truncate">
          {label}
        </h3>
        <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-auto", count > 0 ? "bg-white/70 text-gray-700" : "bg-white/40 text-text-muted")}>
          {count}
        </span>
        <button ref={paletteBtnRef} onClick={openPalette} className="text-text-muted hover:text-text-secondary p-0.5 shrink-0" title="Color">
          <Palette className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">{children}</div>

      {/* Color palette */}
      {showColors && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowColors(false)} />
          <div className="fixed z-50 bg-white border rounded-xl shadow-xl p-2.5 grid grid-cols-5 gap-1.5"
            style={{ top: palettePos.top, left: palettePos.left }}>
            {colors.map((c) => {
              const name = c.match(/bg-(\w+)-50/)?.[1] || "gray";
              return (
                <button key={c} onClick={() => { onChangeColor(colId, c); setShowColors(false); }}
                  className="w-7 h-7 rounded-tag border-2 border-border hover:scale-125 transition-all"
                  style={{ backgroundColor: DOT_COLORS[name] || "#6b7280" }} title={name} />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

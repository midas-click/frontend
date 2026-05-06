import { ReactNode, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, X, Check, Palette, AlertTriangle, GripVertical } from "lucide-react";
import clsx from "clsx";

const DOT_COLORS: Record<string, string> = {
  blue: "#3b82f6", yellow: "#eab308", orange: "#f97316",
  purple: "#a855f7", green: "#22c55e", red: "#ef4444",
  gray: "#6b7280", pink: "#ec4899", teal: "#14b8a6", indigo: "#6366f1",
};

interface Props {
  colId: string;
  label: string;
  colorClass: string;
  count: number;
  children: ReactNode;
  onRename: (colId: string, newLabel: string) => void;
  onChangeColor: (colId: string, color: string) => void;
  onDelete: (colId: string) => void;
  colors: string[];
}

export function KanbanColumn({ colId, label, colorClass, count, children, onRename, onChangeColor, onDelete, colors }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: colId, data: { stage: colId },
  });

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [showColors, setShowColors] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [palettePos, setPalettePos] = useState({ top: 0, left: 0 });
  const paletteBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = count === 0;

  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);

  useEffect(() => {
    if (confirmDelete) { const t = setTimeout(() => setConfirmDelete(false), 4000); return () => clearTimeout(t); }
  }, [confirmDelete]);

  function openPalette() {
    if (paletteBtnRef.current) {
      const rect = paletteBtnRef.current.getBoundingClientRect();
      setPalettePos({ top: rect.bottom + 6, left: rect.left - 110 });
    }
    setShowColors(true);
  }

  function save() {
    const t = editValue.trim();
    if (t && t !== label) onRename(colId, t);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-col-id={colId}
      className={clsx(
        "flex flex-col w-72 shrink-0 rounded-xl border p-3",
        colorClass, isDragging && "opacity-40",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-1 mb-3">
        <button {...attributes} {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          tabIndex={-1}>
          <GripVertical className="w-4 h-4" />
        </button>

        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              onBlur={save}
              className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-sm font-semibold outline-none" />
            <button onClick={save} className="text-green-600 hover:text-green-700 shrink-0"><Check className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-sm cursor-pointer hover:text-brand-600 truncate flex-1"
              onDoubleClick={() => { setEditValue(label); setEditing(true); }}>
              {label}
            </h3>
            <div className="flex items-center gap-0.5 shrink-0">
              <button ref={paletteBtnRef} onClick={openPalette} className="text-gray-400 hover:text-gray-600 p-0.5" title="Color">
                <Palette className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setEditValue(label); setEditing(true); }} className="text-gray-400 hover:text-gray-600 p-0.5" title="Rename">
                <Pencil className="w-3 h-3" />
              </button>
              {isEmpty && !confirmDelete && (
                <button onClick={() => setConfirmDelete(true)} className="text-gray-400 hover:text-red-500 p-0.5" title="Delete">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Count */}
      <span className={clsx("text-xs font-bold px-2.5 py-0.5 rounded-full self-start mb-3", count > 0 ? "bg-gray-200 text-gray-700" : "bg-white/50 text-gray-400")}>
        {count} {count === 1 ? "card" : "cards"}
      </span>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs">
          <p className="flex items-center gap-1 text-red-700 mb-1.5"><AlertTriangle className="w-3 h-3" />Delete this column?</p>
          <div className="flex gap-1.5">
            <button onClick={() => { onDelete(colId); setConfirmDelete(false); }}
              className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">Delete</button>
            <button onClick={() => setConfirmDelete(false)}
              className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

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
                  className="w-7 h-7 rounded-full border-2 border-gray-200 hover:scale-125 transition-all"
                  style={{ backgroundColor: DOT_COLORS[name] || "#6b7280" }} title={name} />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

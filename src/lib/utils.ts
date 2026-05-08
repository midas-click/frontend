
export const COLORS = [
  "bg-purple-50 border-purple-200",
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-yellow-50 border-yellow-200",
  "bg-orange-50 border-orange-200",
  "bg-pink-50 border-pink-200",
  "bg-red-50 border-red-200",
  "bg-gray-50 border-gray-200",
  "bg-teal-50 border-teal-200",
  "bg-indigo-50 border-indigo-200",
];

export const DOT_COLORS: Record<string, string> = {
  purple: "#6941C6", blue: "#3b82f6", green: "#22c55e", yellow: "#eab308", orange: "#f97316",
  pink: "#ec4899", red: "#ef4444", gray: "#6b7280", teal: "#14b8a6", indigo: "#6366f1",
};

const LS_KEY = "midas-kanban-columns";

export function loadColumns(): { id: string; label: string; color: string }[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveColumns(cols: { id: string; label: string; color: string }[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(cols));
}

const STAGE_FALLBACKS: Record<string, { label: string; color: string }> = {
  applied:   { label: "Applied",       color: "bg-purple-100 text-purple-700" },
  phone_screen: { label: "Phone Screen",  color: "bg-blue-100 text-blue-700" },
  technical: { label: "Technical",     color: "bg-orange-100 text-orange-700" },
  team_interview:    { label: "Team Interview",        color: "bg-green-100 text-green-700" },
  offer:     { label: "Offer",         color: "bg-yellow-100 text-yellow-700" },
  rejected:  { label: "Rejected",      color: "bg-red-100 text-red-700" },
};


export function getStageLabel(stage: string): string {
  if (STAGE_FALLBACKS[stage]) return STAGE_FALLBACKS[stage].label;
  return stage;
}

export function getStageColor(stage: string): string {
  if (STAGE_FALLBACKS[stage]) return STAGE_FALLBACKS[stage].color;
  return "";
}

export function getStageStyle(stage: string): { backgroundColor: string; color: string } {
  const names: Record<string, string> = {
    purple: "#F3EEFF", blue: "#dbeafe", green: "#dcfce7", yellow: "#fef9c3", orange: "#ffedd5",
    pink: "#fce7f3", red: "#fee2e2", gray: "#f3f4f6", teal: "#ccfbf1", indigo: "#e0e7ff",
  };
  const texts: Record<string, string> = {
    purple: "#55309E", blue: "#1d4ed8", green: "#15803d", yellow: "#a16207", orange: "#c2410c",
    pink: "#be185d", red: "#b91c1c", gray: "#4b5563", teal: "#0f766e", indigo: "#4338ca",
  };
  const raw = getStageColor(stage);
  const m = raw.match(/bg-(\w+)-/);
  const name = m?.[1] || "gray";
  return { backgroundColor: names[name] || names.gray, color: texts[name] || texts.gray };
}

/** Replace stage IDs in timeline events with human-readable labels */
export function formatEvent(text: string): string {
  return text.replace(/[a-z0-9_-]+/gi, (match) => {
    const label = getStageLabel(match);
    return label !== match ? label : match;
  });
}

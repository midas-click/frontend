const STAGE_FALLBACKS: Record<string, { label: string; color: string }> = {
  applied:   { label: "Applied",       color: "bg-blue-100 text-blue-700" },
  phone_screen: { label: "Phone Screen",  color: "bg-yellow-100 text-yellow-700" },
  technical: { label: "Technical",     color: "bg-orange-100 text-orange-700" },
  team_panel:    { label: "Team Panel",        color: "bg-purple-100 text-purple-700" },
  offer:     { label: "Offer",         color: "bg-green-100 text-green-700" },
  rejected:  { label: "Rejected",      color: "bg-red-100 text-red-700" },
  withdrawn: { label: "Withdrawn",     color: "bg-gray-100 text-gray-600" },
};

function loadColumns(): { id: string; label: string; color: string }[] {
  try {
    const raw = localStorage.getItem("midas-kanban-columns");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getStageLabel(stage: string): string {
  if (STAGE_FALLBACKS[stage]) return STAGE_FALLBACKS[stage].label;
  const col = loadColumns().find((c) => c.id === stage);
  return col?.label || stage;
}

export function getStageColor(stage: string): string {
  const col = loadColumns().find((c) => c.id === stage);
  if (col?.color) return col.color;
  if (STAGE_FALLBACKS[stage]) return STAGE_FALLBACKS[stage].color;
  return "";
}

export function getStageStyle(stage: string): { backgroundColor: string; color: string } {
  const names: Record<string, string> = {
    blue: "#dbeafe", yellow: "#fef9c3", orange: "#ffedd5", purple: "#f3e8ff", green: "#dcfce7",
    red: "#fee2e2", gray: "#f3f4f6", pink: "#fce7f3", teal: "#ccfbf1", indigo: "#e0e7ff",
  };
  const texts: Record<string, string> = {
    blue: "#1d4ed8", yellow: "#a16207", orange: "#c2410c", purple: "#7e22ce", green: "#15803d",
    red: "#b91c1c", gray: "#4b5563", pink: "#be185d", teal: "#0f766e", indigo: "#4338ca",
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

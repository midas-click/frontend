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
  if (STAGE_FALLBACKS[stage]) return STAGE_FALLBACKS[stage].color;
  const col = loadColumns().find((c) => c.id === stage);
  if (col?.color) {
    const m = col.color.match(/bg-(\w+)-/);
    if (m) return `bg-${m[1]}-100 text-${m[1]}-700`;
  }
  return "bg-gray-100 text-gray-600";
}

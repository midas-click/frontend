// ── Stage display ───────────────────────────────

export const STAGES: Record<string, { label: string; bg: string; text: string }> = {
  applied:        { label: "Applied",        bg: "#f0eafdfd", text: "#55309E" },
  phone_screen:   { label: "Phone Screen",   bg: "#e1ecfcfb", text: "#1d4ed8" },
  technical:      { label: "Technical",      bg: "#fcf0e0", text: "#c2410c" },
  team_interview: { label: "Team Interview", bg: "#fdfbe3", text: "#a16207" },
  offer:          { label: "Offer",          bg: "#ecfff3", text: "#15803d" },
  rejected:       { label: "Rejected",       bg: "#fce9e9", text: "#b91c1c" },
};

export function getMatchScoreTextClass(score: number) {
  if (score >= 80) return "text-green-700";
  if (score >= 50) return "text-yellow-700";
  return "text-red-700";
}

export function getMatchScoreBadgeClass(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 50) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

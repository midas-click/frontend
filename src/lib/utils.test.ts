import { getMatchScoreBadgeClass, getMatchScoreTextClass, STAGES } from "./utils";

// Defines every kanban stage with a readable label and display colors.
test("STAGES includes all expected application stages", () => {
  expect(Object.keys(STAGES)).toEqual([
    "applied",
    "phone_screen",
    "technical",
    "team_interview",
    "offer",
    "rejected",
  ]);
  expect(STAGES.applied).toMatchObject({ label: "Applied", text: "#55309E" });
});

// Maps high, medium, and low match scores to text color classes.
test("getMatchScoreTextClass returns threshold-based text colors", () => {
  expect(getMatchScoreTextClass(80)).toBe("text-green-700");
  expect(getMatchScoreTextClass(50)).toBe("text-yellow-700");
  expect(getMatchScoreTextClass(49.9)).toBe("text-red-700");
});

// Maps high, medium, and low match scores to badge color classes.
test("getMatchScoreBadgeClass returns threshold-based badge colors", () => {
  expect(getMatchScoreBadgeClass(95)).toBe("bg-green-100 text-green-700");
  expect(getMatchScoreBadgeClass(65)).toBe("bg-yellow-100 text-yellow-700");
  expect(getMatchScoreBadgeClass(20)).toBe("bg-red-100 text-red-700");
});

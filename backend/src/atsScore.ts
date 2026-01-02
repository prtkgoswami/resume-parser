type Issue = {
  severity: "low" | "medium" | "high";
  description?: string;
};

export function calculateAtsScore(
  glyphIssues: Issue[],
  tokenIssues: Issue[]
) {
  let score = 100;

  const high = glyphIssues.filter(i => i.severity === "high").length;
  const medium = [
    ...glyphIssues,
    ...tokenIssues,
  ].filter(i => i.severity === "medium").length;
  const low = [
    ...glyphIssues,
    ...tokenIssues,
  ].filter(i => i.severity === "low").length;

  score -= Math.min(high * 12, 30);
  score -= Math.min(medium * 4, 20);
  score -= Math.min(low * 1, 10);

  score = Math.max(score, 40);

  let label: string;
  if (score >= 90) label = "ATS-safe";
  else if (score >= 75) label = "Minor ATS issues";
  else if (score >= 60) label = "Moderate ATS risk";
  else label = "High ATS failure risk";

  return {
    score,
    label,
    breakdown: {
      highSeverityIssues: high,
      mediumSeverityIssues: medium,
      lowSeverityIssues: low,
    },
  };
}

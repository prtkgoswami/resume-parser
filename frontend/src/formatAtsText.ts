export type FormattedBlock =
  | { type: "section"; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

const SECTION_HEADERS = [
  "SKILLS",
  "WORK EXPERIENCE",
  "EDUCATION",
  "PROJECTS",
];

export function formatAtsText(raw: string): FormattedBlock[] {
  const blocks: FormattedBlock[] = [];

  // Normalize spacing for display only
  const cleaned = raw.replace(/\s{2,}/g, " ").trim();

  // Split on section headers (keep headers)
  const regex = new RegExp(
    `(${SECTION_HEADERS.join("|")})`,
    "g"
  );

  const parts = cleaned.split(regex);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    if (SECTION_HEADERS.includes(part)) {
      blocks.push({ type: "section", text: part });
      continue;
    }

    // Split sentences / bullets
    const lines = part.split(/●| o | - /g);

    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;

      if (line.startsWith("●") || line.startsWith("o")) {
        blocks.push({ type: "bullet", text: t });
      } else {
        blocks.push({ type: "paragraph", text: t });
      }
    }
  }

  return blocks;
}

export type AtsIssue = {
  index: number;
  char: string;
  description: string;
  codePoint: string;
  severity: "low" | "medium" | "high";
};

const KNOWN_GLYPHS: Record<string, string> = {
  "ﬁ": "fi ligature",
  "ﬂ": "fl ligature",
  "ﬀ": "ff ligature",
  "ﬃ": "ffi ligature",
  "ﬄ": "ffl ligature",
  "Ɵ": "broken ti / theta glyph",
  "Ʃ": "latin sigma (looks like S)",
  "ƞ": "latin n variant",
  "Ō": "latin O with macron",
};

function isAscii(char: string) {
  const c = char.charCodeAt(0);
  return c >= 32 && c <= 126;
}

function isLikelyWordChar(char: string) {
  return /[A-Za-z]/.test(
    char.normalize("NFKD")[0] ?? ""
  );
}

function isLikelyUrlContext(text: string, index: number) {
  const slice = text.slice(Math.max(0, index - 10), index + 10);
  return slice.includes("http") || slice.includes("www");
}

export function detectLigatures(text: string): AtsIssue[] {
  const issues: AtsIssue[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (KNOWN_GLYPHS[char]) {
      issues.push({
        index: i,
        char,
        description: KNOWN_GLYPHS[char],
        codePoint: `U+${char.charCodeAt(0).toString(16).toUpperCase()}`,
        severity: isLikelyUrlContext(text, i) ? "high" : "medium",
      });
      continue;
    }

    // Catch visually normal but ATS-unsafe letters
    if (!isAscii(char) && isLikelyWordChar(char)) {
      issues.push({
        index: i,
        char,
        description: "non-ASCII letter (ATS-unsafe)",
        codePoint: `U+${char.charCodeAt(0).toString(16).toUpperCase()}`,
        severity: isLikelyUrlContext(text, i) ? "high" : "low",
      });
    }
  }

  return issues;
}

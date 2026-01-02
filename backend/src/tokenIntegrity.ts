export type TokenIssue = {
  start: number;
  end: number;
  original: string;
  suggestion: string;
  description: string;
  severity: "low" | "medium" | "high";
};

export type AtsSuggestion = {
  original: string;
  suggestion: string;
  reason: string;
  severity: "low" | "medium" | "high";
};

const URL_PATTERN = /(https?:\/\/[^\s]+)/gi;

export function detectTokenIssues(text: string): TokenIssue[] {
  const issues: TokenIssue[] = [];

  // 1. Broken URLs (spaces around hyphens)
  const urlLike = text.match(/https?:\/\/[^\s]+(\s-\s[^\s]+)+/gi);
  if (urlLike) {
    for (const broken of urlLike) {
      issues.push({
        start: text.indexOf(broken),
        end: text.indexOf(broken) + broken.length,
        original: broken,
        suggestion: broken.replace(/\s-\s/g, "-"),
        description: "URL contains spaces around hyphens",
        severity: "high",
      });
    }
  }

  // 2. Word splits: ex p anding, r ole
  const splitWordRegex = /\b([A-Za-z])\s([A-Za-z]{1,2})\s([A-Za-z]{2,})\b/g;
  let match: RegExpExecArray | null;

  while ((match = splitWordRegex.exec(text))) {
    const original = match[0];
    const suggestion = match.slice(1).join("");

    issues.push({
      start: match.index,
      end: match.index + original.length,
      original,
      suggestion,
      description: "Word appears split into multiple tokens",
      severity: "medium",
    });
  }

  // 3. Hyphen misuse: real - time
  const hyphenSplitRegex = /\b([A-Za-z]+)\s-\s([A-Za-z]+)\b/g;
  while ((match = hyphenSplitRegex.exec(text))) {
    const original = match[0];
    const suggestion = `${match[1]}-${match[2]}`;

    issues.push({
      start: match.index,
      end: match.index + original.length,
      original,
      suggestion,
      description: "Hyphenated word split by spaces",
      severity: "medium",
    });
  }

  return issues;
}

export function buildSuggestions(
  glyphIssues: { char: string; description: string; severity: string }[],
  tokenIssues: {
    original: string;
    suggestion: string;
    description: string;
    severity: string;
  }[]
): AtsSuggestion[] {
  const suggestions: AtsSuggestion[] = [];

  for (const issue of tokenIssues) {
    suggestions.push({
      original: issue.original,
      suggestion: issue.suggestion,
      reason: issue.description,
      severity: issue.severity as any,
    });
  }

  for (const issue of glyphIssues) {
    suggestions.push({
      original: issue.char,
      suggestion: issue.char.normalize("NFKD").replace(/[^\x00-\x7F]/g, ""),
      reason: issue.description,
      severity: issue.severity as any,
    });
  }

  return suggestions.filter(
    (s) => s.original && s.suggestion && s.original !== s.suggestion
  );
}
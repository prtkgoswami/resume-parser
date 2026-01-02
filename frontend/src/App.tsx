import { useState } from "react";

type Issue = {
  index: number;
  char: string;
  description: string;
  codePoint: string;
  severity: "low" | "medium" | "high";
};

type TokenIssue = {
  start: number;
  end: number;
  original: string;
  suggestion: string;
  description: string;
  severity: "low" | "medium" | "high";
};

type AtsSuggestion = {
  original: string;
  suggestion: string;
  reason: string;
  severity: "low" | "medium" | "high";
};

type AtsScore = {
  score: number;
  label: string;
  breakdown: {
    highSeverityIssues: number;
    mediumSeverityIssues: number;
    lowSeverityIssues: number;
  };
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tokenIssues, setTokenIssues] = useState<TokenIssue[]>([]);
  const [suggestions, setSuggestions] = useState<AtsSuggestion[]>([]);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setRawText("");
    setIssues([]);
    setTokenIssues([]);
    setSuggestions([]);
    setAtsScore(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:4000/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Parsing failed");
      }

      const data = await res.json();
      setRawText(data.rawText);
      setIssues(data.issues || []);
      setTokenIssues(data.tokenIssues || []);
      setSuggestions(data.suggestions || []);
      setAtsScore(data.atsScore || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const highlightedText = rawText.split("").map((char, idx) => {
    const issue = issues.find((i) => i.index === idx);
    if (!issue) return <span key={idx}>{char}</span>;

    const color =
      issue.severity === "high"
        ? "bg-red-300 text-red-900"
        : issue.severity === "medium"
        ? "bg-orange-200 text-orange-800"
        : "bg-yellow-200 text-yellow-800";

    return (
      <span
        key={idx}
        title={`${issue.description} (${issue.codePoint})`}
        className={`${color} font-semibold`}
      >
        {char}
      </span>
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3">
      <div className="bg-white p-6 rounded shadow w-full max-w-[80%]">
        <h1 className="text-xl font-semibold mb-4">ATS Resume Parser</h1>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 border border-gray-300 px-2 py-1 cursor-pointer w-full"
        />

        <button
          onClick={onSubmit}
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {atsScore && (
          <div className="mt-4 p-4 rounded border bg-gray-50">
            <div className="text-lg font-semibold">
              ATS Compatibility Score:{" "}
              <span className="font-bold">{atsScore.score}/100</span>
            </div>
            <div className="text-sm text-gray-700">{atsScore.label}</div>
            <div className="mt-2 text-xs text-gray-600">
              High: {atsScore.breakdown.highSeverityIssues} · Medium:{" "}
              {atsScore.breakdown.mediumSeverityIssues} · Low:{" "}
              {atsScore.breakdown.lowSeverityIssues}
            </div>
          </div>
        )}

        {rawText && (
          <pre className="mt-6 text-xs bg-gray-100 p-4 rounded max-h-125 overflow-auto whitespace-pre-wrap">
            {highlightedText}
          </pre>
        )}

        {issues.some((i) => i.severity === "high") && (
          <div className="mt-4 text-sm text-red-700 font-medium">
            🚨 Critical ATS issues detected (URLs or keywords may be broken)
          </div>
        )}

        {issues.length > 0 && (
          <div className="mt-4 text-sm text-red-700">
            ⚠️ {issues.length} potential ATS-breaking character(s) detected
          </div>
        )}

        {tokenIssues.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-2">
              ⚠️ Token Integrity Issues
            </h2>

            <ul className="text-xs space-y-2">
              {tokenIssues.map((issue, i) => (
                <li key={i} className="border rounded p-2 bg-gray-50">
                  <div>
                    <span className="font-semibold">Problem:</span>{" "}
                    {issue.original}
                  </div>
                  <div>
                    <span className="font-semibold">Suggestion:</span>{" "}
                    {issue.suggestion}
                  </div>
                  <div className="text-gray-600">{issue.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-2">
              ✅ ATS Safe Suggestions (Preview)
            </h2>

            <ul className="text-xs space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="border rounded p-2 bg-green-50">
                  <div>
                    <span className="font-semibold">Before:</span>{" "}
                    <code>{s.original}</code>
                  </div>
                  <div>
                    <span className="font-semibold">After:</span>{" "}
                    <code>{s.suggestion}</code>
                  </div>
                  <div className="text-gray-600">{s.reason}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

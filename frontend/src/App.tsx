import { useState } from "react";
import { formatAtsText } from "./formatAtsText";
import Accordion from "./Accordion";

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
  const [viewMode, setViewMode] = useState<"raw" | "formatted">("formatted");
  const [rawText, setRawText] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tokenIssues, setTokenIssues] = useState<TokenIssue[]>([]);
  const [suggestions, setSuggestions] = useState<AtsSuggestion[]>([]);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTokenIssues, setShowTokenIssues] = useState(
    window.innerWidth >= 768
  );
  const [showSuggestions, setShowSuggestions] = useState(
    window.innerWidth >= 768
  );

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
    <div className="min-h-screen bg-gray-100 flex items-start md:items-center justify-center p-3">
      <main
        className="bg-white rounded shadow w-full max-w-full md:max-w-[80%] p-4 md:p-6"
        aria-labelledby="app-title"
      >
        <h1 id="app-title" className="text-xl font-semibold mb-4">
          ATS Resume Parser
        </h1>

        <label
          htmlFor="resume-upload"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Upload resume (PDF or DOCX)
        </label>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 border border-gray-300 px-2 py-1 cursor-pointer w-full"
        />
        <p id="resume-upload-hint" className="sr-only">
          Accepted formats are PDF and DOCX
        </p>

        <button
          onClick={onSubmit}
          disabled={!file || loading}
          aria-disabled={!file || loading}
          aria-busy={loading}
          className="w-full bg-blue-600 text-white py-3 md:py-2 rounded disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {atsScore && (
          <div
            className="mt-4 p-4 rounded border bg-gray-50"
            role="status"
            aria-live="polite"
          >
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

        {rawText && (
          <div
            className="flex flex-row gap-2 mt-4"
            role="tablist"
            aria-label="ATS text view mode"
          >
            <button
              role="tab"
              aria-selected={viewMode === "formatted"}
              onClick={() => setViewMode("formatted")}
              className={`w-full sm:w-auto px-3 py-1 text-sm rounded border ${
                viewMode === "formatted" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Formatted ATS View
            </button>

            <button
              role="tab"
              aria-selected={viewMode === "raw"}
              onClick={() => setViewMode("raw")}
              className={`w-full sm:w-auto px-3 py-1 text-sm rounded border ${
                viewMode === "raw" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              Raw ATS Text
            </button>
          </div>
        )}

        {rawText && viewMode === "raw" && (
          <pre
            className="mt-4 text-xs bg-gray-100 p-3 md:p-4 rounded max-h-[60vh] md:max-h-125 overflow-auto whitespace-pre-wrap"
            aria-label="Raw ATS extracted text"
          >
            {highlightedText}
          </pre>
        )}

        {rawText && viewMode === "formatted" && (
          <div className="mt-4 space-y-3 text-sm bg-gray-100 p-3 md:p-4 rounded">
            {formatAtsText(rawText).map((block, i) => {
              if (block.type === "section") {
                return (
                  <h2
                    key={i}
                    className="mt-6 mb-2 font-semibold text-gray-800 uppercase border-b pb-1"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === "bullet") {
                return (
                  <div key={i} className="pl-4 flex gap-2">
                    <span>•</span>
                    <span>{block.text}</span>
                  </div>
                );
              }

              return (
                <p key={i} className="text-gray-700">
                  {block.text}
                </p>
              );
            })}
          </div>
        )}

        {tokenIssues.length > 0 && (
          <Accordion
            title={`⚠️ Token Integrity Issues (${tokenIssues.length})`}
            isOpen={showTokenIssues}
            onToggle={() => setShowTokenIssues((v) => !v)}
          >
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
          </Accordion>
        )}

        {suggestions.length > 0 && (
          <Accordion
            title={`✅ ATS Safe Suggestions (Preview) (${suggestions.length})`}
            isOpen={showSuggestions}
            onToggle={() => setShowSuggestions((v) => !v)}
          >
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
          </Accordion>
        )}
      </main>
    </div>
  );
}

export default App;

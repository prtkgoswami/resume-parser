import { useState } from "react";

function App() {
   const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setRawText(null);

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">
          ATS Resume Parser
        </h1>

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

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {rawText && (
          <pre className="mt-6 text-xs bg-gray-100 p-4 rounded max-h-125 overflow-auto whitespace-pre-wrap">
            {rawText}
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;

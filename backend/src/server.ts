import express from "express";
import cors from "cors";
import multer from "multer";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { detectLigatures } from "./ligature";
import { detectTokenIssues, buildSuggestions } from "./tokenIntegrity";
import { calculateAtsScore } from "./atsScore";


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only PDF and DOCX files are allowed"));
      return;
    }
    cb(null, true);
  },
});

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/parse", upload.single("resume"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      let text = "";

      if (req.file.mimetype === "application/pdf") {
        const uint8Array = new Uint8Array(req.file.buffer);

        const pdf = await pdfjs.getDocument({
          data: uint8Array,
        }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ");
          text += "\n";
        }
      }

      if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });
        text = result.value;
      }

      const issues = detectLigatures(text);
      const tokenIssues = detectTokenIssues(text);
      const suggestions = buildSuggestions(issues, tokenIssues);
      const atsScore = calculateAtsScore(issues, tokenIssues);

      return res.json({
        filename: req.file.originalname,
        rawText: text,
        issues,
        tokenIssues,
        suggestions,
        atsScore,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to parse resume",
      });
    }
  });

  return app;
}

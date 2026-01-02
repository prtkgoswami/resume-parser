import express from "express";
import cors from "cors";
import multer from "multer";

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

  // Upload endpoint (no parsing yet)
  app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    return res.json({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      message: "File uploaded successfully",
    });
  });

  return app;
}

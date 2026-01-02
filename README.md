# ATS Resume Parser & Diagnostic Tool

A frontend-focused tool that shows **what an Applicant Tracking System (ATS) actually sees** when it parses your resume — and highlights issues that commonly cause data loss, keyword misses, or broken links.

This project focuses on **diagnosis, transparency, and correctness**, not resume rewriting or AI-driven auto-fixing.

---

## Why This Project Exists

Many job portals (Workday, Oracle Cloud, Greenhouse, etc.) silently mis-parse resumes due to:

- Broken Unicode characters (e.g. `Ɵ`, `Ʃ`, ligatures)
- Token splits caused by PDF fonts (`ex p anding`, `Tik T ok`)
- Malformed URLs with invisible spacing
- Non-ASCII glyphs that look correct to humans but fail machine parsing

Most resume tools hide these failures.

This app makes them **visible and explainable**.

---

## What This Tool Does

### 1. ATS-Style Text Extraction
- Parses PDF and DOCX resumes similarly to real ATS systems
- Displays the **raw extracted text** exactly as machines see it

### 2. ATS Diagnostics
Detects and highlights:
- Unicode ligatures and non-ASCII glyphs
- ATS-breaking characters inside keywords and URLs
- Token integrity issues (split words, broken hyphenation)
- URL formatting issues that break ATS link detection

Each issue is classified by severity.

---

### 3. ATS Compatibility Score (Approximate)
- Computes a **heuristic ATS compatibility score**
- Based on parsing confidence, not hiring likelihood
- Mirrors how ATS systems degrade confidence internally

Score bands:
- 90–100 → ATS-safe
- 75–89 → Minor ATS issues
- 60–74 → Moderate ATS risk
- < 60 → High ATS failure risk

---

### 4. ATS-Safe Suggestions (Preview Only)
- Shows **before → after** suggestions for detected issues
- No automatic mutation
- No rewriting
- User remains fully in control

---

### 5. Readable ATS Output
- Toggle between:
  - **Raw ATS Text** (exact machine output)
  - **Formatted ATS View** (presentation-only)
- Formatting improves readability without changing content
- Helps users visually audit their resume structure

---

### 6. Accessible & Mobile-Friendly UI
- Keyboard navigable
- Screen-reader friendly (ARIA roles, live regions)
- Mobile-optimized without affecting desktop UX
- Collapsible sections with animated accordions to reduce overload

---

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS (Vite setup)

### Backend
- Node.js
- Express

### Parsing
- `pdfjs-dist` for PDF parsing
- `mammoth` for DOCX parsing

### Deployment
- Designed for Cloudflare / modern edge-friendly setups

---

## Design Principles

- **Truth over polish**: show what ATS actually sees
- **No silent fixes**: nothing is changed without user awareness
- **Explainability first**: every score and warning is traceable
- **Frontend-first**: UI clarity and usability matter as much as logic
- **Accessibility is not optional**

---

## What This Tool Is NOT

- ❌ A resume writer
- ❌ A hiring probability predictor
- ❌ An AI keyword stuffer
- ❌ An auto-submit optimizer

It is a **diagnostic and educational tool**.

---

## Running Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

---

## Future Improvements (Optional)

* Export ATS-safe text
* Section-wise ATS confidence
* Per-issue apply/reset controls
* Dark mode (UI only)

---

## Motivation

This project was built after repeatedly encountering resumes being mis-parsed by job portals despite looking correct visually.

The goal is simple:

> If an ATS breaks your resume, you should be able to *see why*.
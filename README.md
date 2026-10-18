# CVMaker

A CV builder that runs entirely in your browser. Upload your existing CV, tailor it to a job description with on-device AI, and download an ATS-friendly PDF. Nothing is uploaded to a server: your CV, job descriptions and the AI model all stay on your device.

**Live app:** https://a-aadam.github.io/CVMaker/

## Features

- **My Profile**
  - Upload a PDF, DOCX or TXT CV and the fields are filled in automatically.
  - Every field is editable.
  - Add sections: Work Experience, Project Experience, Leadership Experience, Education, Skills, Summary, Certifications or Custom.
  - Entries have start and end dates (or a single date) and a location.
- **Keyword Extractor**
  - Paste a job description. Two seconds after you stop typing, the text locks and the ATS keywords are extracted.
  - Each keyword shows whether your CV already has it.
  - You can add your own keywords.
  - **Push keywords to my CV** proposes changes: missing skills, plus a reworded summary and bullet points. You review each change before anything is applied.
- **CV Generator**
  - The same profile editor as My Profile, kept in two-way sync.
  - Drag sections by their ⋮⋮ handle to reorder them.
  - A live, read-only preview of the PDF.
  - Download a text-based PDF that ATS can read, in A4 or US Letter.

## How the AI works

CVMaker uses [WebLLM](https://github.com/mlc-ai/web-llm) to run **Qwen2.5-0.5B-Instruct** (4-bit, the smallest Qwen build WebLLM ships) on your GPU through WebGPU.

- The model, about 280 MB, downloads the first time an AI feature runs. After that the browser caches it.
- A 0.5B model is small, so every AI result is checked before it's used:
  - Extracted CV fields and keywords must appear in the source text.
  - Rewrites that add numbers or don't include a keyword are dropped.
- Without WebGPU, or with **Use AI** switched off, CVMaker uses its built-in rule-based parser and keyword extractor.

AI features need a recent Chrome or Edge on desktop. Everything else works in any modern browser.

## Development

```bash
npm install
npm run dev      # http://localhost:5173/CVMaker/
npm test         # unit tests (parser, keyword extraction, push planner)
npm run build    # type-check and production build into dist/
```

Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Tech

Vite, React and TypeScript, with these libraries:

- Zustand: state, saved to localStorage
- @mlc-ai/web-llm: on-device AI
- pdf.js: reading PDFs and the preview
- mammoth: reading DOCX files
- @react-pdf/renderer: generating the PDF
- dnd-kit: drag and drop

## License

MIT

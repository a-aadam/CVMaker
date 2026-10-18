# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Active job seekers applying to many roles. They tailor one master CV to each job description, usually in a single sitting at a laptop, repeating the loop job after job.

## Product Purpose

CVMaker turns an existing CV into an editable profile, extracts the ATS keywords from a pasted job description, proposes truthful edits that work those keywords into the CV, and exports a text-based, ATS-readable PDF. Success: a tailored, accurate CV downloaded within minutes of reading a posting.

## Positioning

Private tailoring. Keyword tailoring and privacy are one mechanism: the parsing, keyword extraction and AI rewriting all run on the user's own device (WebLLM, Qwen2.5-0.5B), so a CV and the jobs someone is applying for never reach a server. Both claims lead together.

## Operating Context

- Three tabs, in workflow order: My Profile (upload and edit the master profile), Keyword Extractor (paste a job description, review keywords, push them into the CV), CV Generator (edit beside a live, read-only PDF preview, then download).
- Inputs are the user's own CV (PDF, DOCX or TXT) and job postings copied from job boards.
- The AI model is a one-time ~280 MB download cached by the browser; AI features need WebGPU and fall back to rule-based logic without it.
- Hosted as a static site on GitHub Pages; all state lives in the browser's localStorage.

## Capabilities and Constraints

- Profile sections: Work Experience, Project Experience, Leadership Experience, Education, Skills, Summary, Certifications, Custom. Entries carry dates (range or single) and location; sections and entries reorder by drag handle.
- The pasted job description locks 2 seconds after typing stops; keywords can be added manually.
- Every AI edit is reviewed by the user before it is applied; AI output is grounded against the source text.
- My Profile and the CV Generator editor share one profile, in two-way sync.
- The three-tab structure (My Profile, Keyword Extractor, CV Generator) is fixed.
- The exported CV PDF template is fixed; app UI redesigns do not change it.

## Brand Commitments

Set by the user on 2026-10-18 after rejecting the first redesign:
- Feel: premium and polished.
- Colour: neutral surfaces; indigo-violet (#5546E8) is the only accent, used on actions, focus, active states and highlights. No brown, no red accents, no grey-washed ground.
- Type: Libre Caslon Display for headings, Manrope for body and UI.
- Theme follows the system light/dark setting.
- No catalogue metaphor (no call numbers or catalogue rail), no job-match side panel, no per-section colour tags. Keep the move up/down reorder buttons, styled quietly.

## Evidence on Hand

- Sample CV and job description fixtures in `test-fixtures/` (synthetic, for testing only).
- No users, testimonials, metrics or press exist. Do not fabricate any.

## Product Principles

1. The user's data never leaves their device; say so plainly and never contradict it.
2. Nothing changes the CV without the user seeing and approving it.
3. Truthful tailoring: reword what is there, never invent experience or numbers.
4. Works without AI; the AI makes it better, not possible.
5. Fast repeat loop: the second and tenth job should take less effort than the first.

## Accessibility & Inclusion

WCAG 2.2 AA is a hard requirement: contrast, visible focus, full keyboard operation (including drag-and-drop reordering), reduced-motion support. Light and dark themes follow the system setting.

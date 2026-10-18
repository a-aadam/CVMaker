---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/styles.css"]
---

# CVMaker app shell (all three tabs)

Scope: the whole working app (My Profile, Keyword Extractor, CV Generator). Visitor mode: Operate. Code-led.
Audience and task: active job seekers tailoring one master CV per job posting, repeatedly, at a laptop. Success: tailored, accurate CV downloaded in minutes; nothing changes without review.
Constraints: three-tab structure fixed; exported PDF template fixed; light and dark follow the system; WCAG 2.2 AA.
Chosen direction: user-pinned "Violet Atelier" (replaces the rejected Card Catalogue roll). Pinned by the user: premium and polished; accent-only indigo-violet #5546E8; Libre Caslon Display headings with Manrope body; no catalogue rail, call numbers, job-match panel or section colour tags; keep quiet move up/down buttons.
Memorable moment: the CV's own words set in Caslon (page and section titles), so the editor already reads like a finished document.

## Direction contract

THESIS: A premium writing desk for a CV: quiet neutral surfaces, editorial serif titles and one precise violet accent, so the user's content is the most important thing on screen. Refuses the brown catalogue costume and the busy multi-colour SaaS dashboard.

OWN-WORLD: Near-white neutral ground and white panels in light, near-black ink-violet neutrals in dark; 1px hairlines, 12px panel radius, no decorative colour; indigo-violet #5546E8 only on primary actions, focus, the active tab underline, matched keywords and selection; Libre Caslon Display for page, panel and section titles; Manrope for all UI and body text.

STORY: The visitor imports or types their CV, reads it back in a calm document-like editor, reviews keyword edits, and downloads the PDF, never distracted by chrome.

FIRST VIEWPORT: Slim white header with the serif wordmark left, three standard tabs centred with a violet underline on the active one, privacy and AI status right. My Profile: a single centred column (max 820px) with the upload panel first, then the serif page title, then the personal-details panel and section panels.

FORM: User-pinned direction, not from the ordered list; earlier seed:3fdc364d0e28acc4 superseded by the user's brief. Signature interaction: section panels settle gently after a drag and their serif titles stay editable in place. Motion grammar: 150-220ms panel fades, dialog fade and rise, chip fade-in, drop settle; reduced motion keeps fades only.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

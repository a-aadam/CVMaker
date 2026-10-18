---
name: CVMaker
description: Private, on-device CV tailoring, set like a finished document on a quiet writing desk.
colors:
  accent: "#5546e8"
  accent-hover: "#4536d6"
  accent-ink: "#ffffff"
  accent-soft: "#efeefd"
  accent-text: "#3f31c9"
  accent-line: "#c9c4f8"
  focus: "#5546e8"
  ground: "#f7f7f9"
  surface: "#ffffff"
  surface-2: "#f3f3f6"
  line: "#e6e5eb"
  line-strong: "#cfcdd8"
  ink: "#15141a"
  muted: "#5e5b69"
  placeholder: "#73707e"
  danger: "#b4231b"
  danger-soft: "#fcecea"
  warn: "#8a5300"
  warn-soft: "#fdf3e0"
  accent-dark: "#9d95ff"
  accent-hover-dark: "#b4adff"
  accent-ink-dark: "#120f2e"
  accent-soft-dark: "#221f45"
  accent-text-dark: "#bdb7ff"
  accent-line-dark: "#3f3a7a"
  focus-dark: "#9d95ff"
  ground-dark: "#0e0d12"
  surface-dark: "#16151c"
  surface-2-dark: "#1d1c25"
  line-dark: "#2a2833"
  line-strong-dark: "#3d3a49"
  ink-dark: "#edecf2"
  muted-dark: "#a6a3b3"
  placeholder-dark: "#8f8b9d"
  danger-dark: "#f2948a"
  danger-soft-dark: "#3a1b18"
  warn-dark: "#f0c46e"
  warn-soft-dark: "#33270f"
typography:
  display:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  wordmark:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.625rem"
    fontWeight: 400
    letterSpacing: "-0.01em"
  display-compact:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  wordmark-compact:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "'Libre Caslon Display', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
  body:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  ui:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
  ui-sm:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  ui-lg:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
  entry-label:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
  label:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
  meta:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    fontFeature: "tnum"
  micro:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  bar: "1px"
  hairline: "2px"
  sm: "8px"
  control-lg: "10px"
  md: "12px"
  dialog: "16px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "38px"
  button-primary-lg:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.ui-lg}"
    rounded: "{rounded.control-lg}"
    padding: "11px 22px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "38px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.accent-text}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-quiet-hover:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    size: "32px"
  button-icon-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "18px 20px 20px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 4px 2px 12px"
    height: "30px"
  chip-matched:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.pill}"
  chip-missing:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
    padding: "0 14px"
  tab-active:
    textColor: "{colors.ink}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    width: "min(560px, calc(100vw - 32px))"
  notice-info:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  notice-ok:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  notice-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: CVMaker

## Overview

**Creative North Star: "The Violet Atelier"**

CVMaker is a writing desk for one document. Neutral surfaces recede, the user's own words are set in an editorial display serif, and a single indigo-violet carries every action, focus ring, active state and highlight. Nothing else on screen is coloured, so the violet always means "this is live" or "this is yours to act on", and the CV content reads as the most important thing in the room.

Density is calm rather than sparse: white panels with hairline borders and 12px corners sit on a near-white ground (near-black, faintly violet ground in dark), stacked in a single column on My Profile and paired side by side on the Keyword Extractor and CV Generator. Depth is mostly tonal; shadows appear only on things that float (dialogs, a dragged panel, the preview page). Motion is short and settling: panels fade up, dialogs fade and rise, chips fade in, a dropped panel exhales a shadow.

Light and dark are equal citizens and follow the system setting; every token below has a dark counterpart (the `-dark` keys), tuned so the accent lightens to a soft lavender and the accent-on-accent ink flips to a deep violet-black.

**Key Characteristics:**
- One accent hue (indigo-violet), used only for actions, focus, the active tab, matched keywords, selection and the brand tile.
- Libre Caslon Display 400 for page, panel, section and dialog titles and the wordmark; Manrope for everything else.
- 1px hairlines and tonal surface steps instead of shadows at rest.
- Pill-shaped buttons and chips against 8px fields and 12px panels.
- Section titles are editable in place yet read as headings until touched.

## Colors

Cool neutrals with a trace of violet in the greys, and one saturated indigo-violet doing all of the signalling.

### Primary
- **Atelier Violet** (`accent`; dark `accent-dark`): primary button fill, the active tab underline, focus ring (`focus`), status dots for ready and loading, progress fills, bullet dots, the brand tile, the privacy shield icon, and the caret. Hover deepens to **Pressed Violet** (`accent-hover`), which in dark lightens instead.
- **Violet Ink** (`accent-text`): accent-coloured text on neutral or soft-violet surfaces (quiet buttons, the active step numeral, matched chips, success notices, highlighted words in a diff). It is a darker step than the fill in light so text clears AA.
- **Violet Wash** (`accent-soft`) with **Violet Hairline** (`accent-line`): the soft tint and its border for matched keyword chips, toggled chips, success notices, the "after" side of a diff, quiet-button hover, drag-over upload panel, choice hover and text selection.
- **On-Violet** (`accent-ink`): text and glyphs on a violet fill.

### Neutral
- **Ground** (`ground`): the page behind everything.
- **Panel White** (`surface`): panels, header, fields, dialogs, secondary buttons and chips.
- **Recess** (`surface-2`): one tonal step down, for read-only fields, the preview well, info notices, the "before" diff, inline option strips, pills such as "Locked" and "Hidden", and icon-button hover.
- **Hairline** (`line`): panel borders, panel-head and dialog dividers, entry separators.
- **Strong Hairline** (`line-strong`): field, button and chip borders; dashed borders for empty states, the file button and missing keywords; the unready status dot.
- **Ink** (`ink`): primary text. **Muted Ink** (`muted`): labels, meta lines, inactive tabs, helper text, idle icons. **Placeholder** (`placeholder`): placeholders and drag handles at rest.

### Semantic (not accents)
- **Danger** (`danger` on `danger-soft`): error notices and the hover state of destructive icon buttons only.
- **Caution** (`warn` on `warn-soft`): the top banner and the warning status dot only.

### Named Rules
**The One Voice Rule.** Indigo-violet is the only decorative or interactive hue. If an element is coloured and it is not an action, focus, the active state, a matched keyword, selection or the brand mark, it should not be coloured.

**The Semantic Quarantine Rule.** Danger and caution colours appear only as status (errors, warnings, a destructive hover). They never tag sections, decorate headers or fill buttons at rest.

**The Two-Violet Rule.** Fills use `accent`; text uses `accent-text`. Never set body-size text in the fill violet on a light surface.

## Typography

**Display Font:** Libre Caslon Display 400 (with Iowan Old Style, Georgia, serif)
**Body Font:** Manrope 400/500/600/700 (with ui-sans-serif, system-ui, sans-serif)

**Character:** A high-contrast editorial serif sets the CV's own structure (its name, its sections) so the editor already looks like a finished document; a warm, open geometric sans handles every control, label and line of body copy. Both are self-hosted.

### Hierarchy
- **Display** (Caslon 400, 2.25rem, 1.1, -0.015em): page titles ("My Profile", "Profile details"). Its responsive variant **Display, compact** (`display-compact`, 1.875rem) applies at 860px and below.
- **Wordmark** (Caslon 400, 1.5rem, 1, -0.01em): "CVMaker" beside the violet tile. Its responsive variant **Wordmark, compact** (`wordmark-compact`, 1.25rem) applies at 480px and below.
- **Headline** (Caslon 400, 1.625rem, -0.01em): dialog titles.
- **Title** (Caslon 400, 1.375rem, 1.2, -0.01em): panel and section titles, including the editable section-title field.
- **Title, small** (Caslon 400, 1.125rem): names inside choice tiles (Add section dialog).
- **Body** (Manrope 400, 15px, 1.55): all text and field content.
- **UI** (Manrope 600, 0.9375rem, 1.2): buttons and tabs.
- **UI, large** (`ui-lg`, Manrope 600, 1rem, 1.2): labels on large buttons.
- **UI, small** (`ui-sm`, Manrope, 0.875rem): the small UI size, used for small-button labels (600), check labels, chips (500), notices, the status row, dialog-footer text and diff text. The size is fixed; the weight follows the element.
- **Entry label** (Manrope 700, 0.9375rem): the collapsed summary line of an entry.
- **Label** (Manrope 600, 0.8125rem, muted): field labels, pills, legend.
- **Meta** (Manrope 400, 0.8125rem, muted, tabular figures): dates, counts, status text.
- **Micro** (Manrope 700, 0.75rem, tabular figures): tab step numerals, diff labels, "Hidden" tag.

### Named Rules
**The Caslon Is For Names Rule.** The serif sets titles only: page, panel, section, dialog, choice names and the wordmark, always at weight 400. Never use it for body copy, labels, buttons or numbers.

**The No Faux-Bold Display Rule.** Libre Caslon Display ships one weight; hierarchy among serif titles comes from size, never weight or caps.

## Layout

Centred page containers: 1320px max for the two-pane tabs, 820px for the single-column My Profile. `main` pads 32px 24px (20px 16px at 640px and below). The header is a sticky 64px three-column grid (wordmark left, tabs centred, privacy and AI status right) on a white surface with a bottom hairline.

- **Keyword Extractor:** two panes, 1.1fr / 1fr, 24px gap; one column at 860px.
- **CV Generator:** two equal panes, 28px gap; the preview pane is sticky at 88px from the top; one column at 980px.
- **Panels** stack with 16px gaps; panel bodies pad 18px 20px 20px (16px on phones) with 16px internal gaps; form grids are two columns with 14px row and 16px column gaps, one column at 640px.
- **Header on narrow screens:** at 860px the tabs drop to a full-width second row, share width equally and lose their step numerals; at 640px the header stops being sticky; at 1500px and 480px the privacy and AI status text shortens in steps.

Spacing runs on a 4px base (4, 8, 12, 16, 20, 24, 32), with 6, 10, 14, 18 and 28 used as half-steps inside components.

## Elevation & Depth

Flat by default, tonal by structure: depth at rest comes from the ground / surface / recess steps and hairlines. Shadows are reserved for objects that are lifted off the desk.

### Shadow Vocabulary
- **Pop** (`--shadow-pop`): dialogs and the focused skip link. Light: `0 18px 48px rgb(21 20 26 / 16%), 0 2px 8px rgb(21 20 26 / 8%)`; dark: `0 18px 48px rgb(0 0 0 / 55%)`.
- **Lift** (`--shadow-lift`): a panel or entry while being dragged, then fading out over 0.5s as it settles. Light: `0 12px 32px rgb(21 20 26 / 14%), 0 2px 6px rgb(21 20 26 / 8%)`; dark: `0 12px 32px rgb(0 0 0 / 50%)`.
- **Paper** (`0 1px 2px rgb(21 20 26 / 10%), 0 8px 24px rgb(21 20 26 / 10%)`): the white PDF preview pages inside the recessed preview well.
- **Focus halo** (`0 0 0 1px accent, 0 0 0 4px accent-soft`): focused fields; the drag-over upload panel uses a 4px `accent-soft` ring.

The dialog backdrop is `rgb(14 13 18 / 45%)` with a 2px blur.

### Named Rules
**The Lifted-Only Rule.** A shadow means the thing is floating (dialog, dragged panel, paper). Resting panels, buttons and chips stay flat; the primary button carries only a 1px contact shadow.

## Shapes

Three corner families: pills (999px) for small controls you press or tag (standard and small buttons, chips, the Locked and Hidden tags), 8px for things you type into or that sit inside a panel (fields, notices, choice tiles, icon buttons, the preview well, diff blocks), and 12px for panels and the upload panel. Dialogs open at 16px. Large and full-width buttons use `control-lg` (10px). Preview pages, the model progress bar and the tab underline keep a near-square 2px corner (`hairline`). Bars 2px high or less, such as the read-timer track, use `bar` (1px). Borders are always 1px; dashed 1px borders mark the empty or not-yet states (empty lists, the file-picker button, missing keywords).

**The Pills-Are-Small Rule.** The full pill is for controls 38px tall or less. A large button (46px) or a full-width button takes 10px corners, because a long pill reads as a capsule rather than a button.

## Components

### Buttons
Rounded, confident and quiet until they matter.
- **Shape:** full pill (999px) at standard 38px (8px 16px padding) and small 32px (5px 12px, UI small). Large buttons are 46px (11px 22px, UI large); large and full-width buttons take `control-lg` (10px) corners, per the Pills-Are-Small Rule.
- **Primary:** violet fill, on-violet text, 1px contact shadow; hover deepens to Pressed Violet. Used once per pane for the main action (Upload CV, Push keywords to my CV, Download PDF).
- **Secondary:** white with a Strong Hairline border and ink text; hover turns the border to ink.
- **Quiet:** transparent with Violet Ink text; hover adds the Violet Wash. Used for low-stakes actions such as "Clear profile".
- **Icon button:** 32px square, 8px corners, muted glyph; hover gives Recess background and ink glyph; destructive variants hover to Danger on Danger-soft.
- **All:** press nudges down 1px; disabled is 45% opacity; focus is a 2px violet outline offset 2px.
- **Shell button:** a compact pill in the header (4px 12px, 0.8125rem) whose hover turns border violet and text Violet Ink.

### Chips
- **Style:** 30px pills, Manrope 500 at 0.875rem, white with a Strong Hairline border, a 24px round remove button at 60% opacity.
- **State:** matched keywords take Violet Wash, Violet Hairline and Violet Ink with a check glyph; missing keywords are transparent with a dashed border; toggle chips (checkbox inside) take the matched look when on. Chips fade and scale in from 94% on arrival.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Panel White on Ground.
- **Shadow Strategy:** none at rest; Lift while dragged (see Elevation).
- **Border:** 1px Hairline; the head is separated by a Hairline rule and is at least 60px tall.
- **Internal Padding:** 18px 20px 20px; entries inside a section bleed to the panel edges and are separated by hairlines.

### Inputs / Fields
- **Style:** 40px min height, 1px Strong Hairline, white, 8px corners, 8px 12px padding; labels sit above in the Label style. Textareas grow with their content. Selects use a custom chevron in Muted Ink.
- **Hover:** border darkens to Muted Ink.
- **Focus:** violet border plus the focus halo (1px violet, 4px Violet Wash).
- **Read-only / Disabled:** Recess background, muted text.

### Navigation
Three text tabs centred in the header, Manrope 600 at 0.9375rem, muted at rest and ink on hover or when selected. The active tab carries a 2px violet underline on the header's bottom edge that scales in from the centre (0.25s). Each tab is prefixed by its workflow step numeral in Micro, which turns Violet Ink when active and is dropped below 860px.

### Section Panel (signature)
A sortable panel whose head holds a grip handle (Placeholder, grab cursor), the section title as a borderless Caslon input, quiet up/down move buttons, and visibility, delete and collapse icon buttons. The title shows no box at rest, a hairline on hover and a violet border on Recess when editing. Move buttons rest at 55% opacity and come to full strength when the row is hovered or focused. Hidden sections fade to 50% and show a "Hidden" pill. Dragging lifts the panel with a Violet Hairline border; dropping settles the shadow away over 0.5s.

### Dialog
Native dialog, 560px (860px wide variant), 16px corners, Pop shadow, Hairline-ruled head and foot, Caslon headline. Opens with a 0.24s fade and 12px rise. Review-changes dialogs show before / after pairs: Recess with muted text, then Violet Wash with changed words in bold Violet Ink with a 2px underline.

### Notices
8px corners, 10px 14px padding, 0.875rem, with a leading 16px stroke icon: info on Recess with a violet icon, success on Violet Wash, error on Danger-soft.

## Do's and Don'ts

### Do:
- **Do** reserve indigo-violet for actions, focus, the active tab underline, matched keywords, selection and the brand tile.
- **Do** set page, panel, section and dialog titles in Libre Caslon Display 400 with slight negative tracking (-0.01em to -0.015em).
- **Do** separate surfaces with 1px hairlines and the Ground / Surface / Recess steps before reaching for a shadow.
- **Do** give every interactive element a visible 2px violet focus outline (or the field focus halo).
- **Do** keep motion short and eased with `cubic-bezier(0.16, 1, 0.3, 1)`, 150 to 250ms, and fall back to fades only under reduced motion.
- **Do** ship both light and dark values for any new token.
- **Do** use 16px stroke icons at 2px stroke in currentColor, inlined as SVG.

### Don't:
- **Don't** introduce a second accent hue, brown tones, or red as decoration; red is for errors and destructive hover only.
- **Don't** tag sections with per-section colours.
- **Don't** add call numbers, a catalogue rail or a job-match side panel.
- **Don't** use the serif for body text, buttons, labels or figures.
- **Don't** shadow panels, buttons or chips at rest.
- **Don't** hide the move up/down buttons entirely; keep them quiet at 55% until their row is engaged.
- **Don't** wash the ground grey; it stays near-white in light and near-black in dark.

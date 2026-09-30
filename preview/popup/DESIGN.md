# Newsletter popup v4

## Style Prompt
An editorial Affiniti+ collection: cream canvas, cocoa text, Adonis headlines,
compact series capsules and image-led article tiles with readable title overlays. Clicking opens a focused native
dialog, with a series collection view and an article detail view. Avoid the old
large split panel and empty fixed-height reader. Preserve actual article copy.

## Colors
- #4a2824: cocoa text, inherited nl-cocoa fallback from preserved newsletter.
- #fffaf7: paper surface, inherited nl-paper fallback.
- #e5d6b2: cream action fill, inherited ap-control-bg fallback.
- #f4ecdd: standalone test canvas from preserved newsletter foundation.

## Typography
Adonis/Georgia for headings; Proxima Nova/Arial for text. Existing page fonts are
inherited where installed; no font CDN request. Section-title size consumes
nl-section-title-size when available, otherwise preserved newsletter sizing.

## What NOT to Do
- No hard-coded article or tag catalogue.
- No arbitrary modal z-index or page-width breakout controllers.
- No new site-wide injection or shared token changes.
- No full article HTML insertion or fabricated cover images.
- No rotating brand plus into an X; close uses a separate labelled control.

## Motion
Static layout first, then a single short opacity/translation entrance and restrained
tile hover lift. Reduced motion disables both. Hyperframes was reviewed: its video
composition/timeline runtime is not appropriate for a user-operated web dialog.
No Hyperframes, GSAP or other external animation runtime is included.

## Media
Use validated image_url from the automated feed. Render each title once visually, with description below. Missing or failed images use text-only previews. No iframe or embed-script fallback.

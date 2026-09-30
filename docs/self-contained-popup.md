# Self-contained newsletter popup — 30 September 2026

## Provenance and scope
Rules reviewed: affiniti-plus-squarespace main AGENTS.md, standards/DESIGN-SYSTEM.md,
standards/LAYERS.md and site/custom-css.css. The design/layers documents remain
partly placeholders. Values are taken from the preserved newsletter; the redesign
does not promote any other page's shared branch or alter the source website repo.
Prior implementations remain untouched. This is a new documented test candidate.

All component HTML, CSS and JavaScript are in preview/popup/block.html. It fetches
only public feed data. No external loader, template, stylesheet, animation runtime
or page-header injection is required. Official article cards are a third-party
media fallback and make their own Substack requests.

## Interaction
Default block supplies dynamic series buttons and three latest article launchers.
Series click opens its article list; article click opens detail; Back returns to
the same series. Article order supports newest/oldest. Previous/next stay within
the selected series and stop at the ends. Empty series are omitted.

Native dialog provides top-layer placement, background interaction exclusion and
Escape dismissal. Closing restores the opening control and original inline scroll
setting. Opening detail removes prior media. No URL/hash routing is imposed.

Existing page elements can also use data-nl-open-series with a tag slug/ID or
data-nl-open-article with a post ID/canonical URL. Unknown targets retain normal
link behaviour. Install exactly one block per page and remove previous newsletter
test blocks before installation.

## Media honesty
Current public feed has no image_url field. V3 therefore keeps the working official
Substack card in the article popup, including its media. The custom cover/title
overlay is implemented only when a future feed includes a validated image_url.
It accepts HTTPS substackcdn.com and substack-post-media.s3.amazonaws.com images.
An unavailable/invalid image falls back to the official card; a failed card retains
the canonical article link. Cover image provenance/collection is still unresolved.
The component does not pretend an arbitrary image is an article's real cover.

## Install
Paste the entire block.html into one Squarespace HTML Code Block on the test page.
Use full available width; the component does not mutate the section width. Save
and fully reload outside the editor. No page-header injection and no Apps Script
changes. Roll back using the previous v2 block; its files are unchanged.

Run node tests/popup.test.cjs from the repo. The standalone index.html embeds the
same block for browser review. Test series/article switching, long titles, narrow
mobile width, keyboard closure/focus, sort order and blocked-media fallback.

Scheduling, credential handling, source collection and publishing automation are
unchanged. This display candidate does not establish production readiness.

## Observed verification
Offline popup validation and all three prior renderer test scripts passed.
Hosted browser review confirmed seven series, six Mind the Gap posts, chronological
sort reversal, article identity/date/link display, disabled end-of-series next,
Back preserving series/order, iframe removal, and Escape restoring launcher focus.
The cloud browser returned Site Unavailable inside the Substack iframe; official
card visuals and media were not accepted from this browser. Mobile visual review,
Squarespace embedding and the future real-image overlay remain pending.

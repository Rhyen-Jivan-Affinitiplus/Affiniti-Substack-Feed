# Native newsletter preview v2

## Change

The user approved rendering collected public metadata directly inside the preserved
newsletter design. This version removes the iframe and its script/message/timeout
machinery. The focused preview contains the collected title, subtitle, authors,
publication date (Europe/London), series labels and canonical Substack links.
It does not include a full article body or a cover image.

No new collection, credentials, requests to Substack or Apps Script changes are
needed to render it. The browser fetches the public feed and component template;
Substack is opened only when a visitor follows a link. Existing series discovery,
sorting, hidden-empty-series behaviour, modal navigation and focus handling remain.
The feed's incomplete coverage is unchanged.

## Install on the test page

Replace the previous test-page Code Block with the complete contents of
preview/newsletter/squarespace-block-v2.html. Use HTML mode, one component, full width.
No page-header injection is required. Do not paste the historical newsletter header:
the component already contains its necessary foundation styles.
Save and fully reload the published test page outside the Squarespace editor.

Check: 7 populated series and 25 collected articles with the current feed, newest/
oldest sorting, title/subtitle/byline/date, multi-series labels, modal navigation,
Escape/focus restoration, narrow-screen overflow, and canonical article links.
No iframe should exist in the new component.

## Fallbacks and rollback

The static archive link remains usable if JSON/template/JavaScript cannot load.
Existing last-successful public JSON remains the publishing fallback, with a notice
when the snapshot is older than 48 hours. Empty subtitles are hidden, not invented.
No full article HTML is inserted; metadata is escaped or assigned with textContent.
Only fixed-host validated canonical URLs become article links.

The previous loader.js/template.html/index.html and squarespace-block.html are
unchanged and retain the official iframe test. Reinstall that old Code Block to
roll back, then reload. The new native.html is an independent hosted test.

## Build and validation

Run python3 tools/build-native-newsletter.py from this repository. The builder derives
the separate v2 assets from preserved v1 files. Run node tests/newsletter-native.test.cjs,
node tests/newsletter.test.cjs and node tests/loader.test.cjs.

Scheduling and production rollout remain disabled. The automation gaps documented
in newsletter-test.md still apply; this display change does not resolve them.

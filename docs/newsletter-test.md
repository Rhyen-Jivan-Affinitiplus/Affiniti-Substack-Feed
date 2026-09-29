# Newsletter integration test — 29 September 2026

Preserved source: Rhyen-Jivan-Affinitiplus/affiniti-plus-squarespace at
1aaba413e1371abd8745aa84470d10a4ed9708ff:
pages/learning-hub/newsletter/blocks/Section 02 - Series.html and
pages/learning-hub/newsletter/injection/header.html.
The preserved repository is unchanged. This derivative isolates the series foundation;
other sections, fixed Squarespace section IDs and page-wide controllers are excluded.

The user confirmed the existing direct iframe preview renders all cards. That is
user-reported acceptance of the prior renderer, not acceptance of this new layout.

## Install

Use preview/newsletter/squarespace-block.html in the existing test page HTML Code
Block, replacing the six-card preview block. Use one block, full width. Do not add
the old newsletter header injection. Save and inspect the published page outside
the editor. The old preview/loader.js and preview/index.html remain available for rollback.

The preserved carousel, article tiles, reader, colours and three existing editorial
descriptions remain. Descriptions are optional presentation metadata, not a tag registry.
New tags need no code edits. Series with published feed articles appear dynamically,
ordered by latest article then name. Articles default newest first; the select
also supports oldest first. All posts are accessible, without the old six-post cap.
Empty feed series are hidden. Multiple tag assignments are preserved.

The official iframe is loaded only for the selected article, with verified-origin
height messages and direct article links. Closing removes the iframe. Third-party
card internals are not restyled. Feed values are validated and text escaped.
One component per page; replacing the block requires a full reload.

## Acceptance

Check desktop and narrow mobile: series navigation, sorting, long titles, all posts
in longer series, modal close/Escape, keyboard focus, article navigation, and direct
links. Confirm a single iframe while the reader is open and none after closing.
Verify blocked embeds retain the direct link. Failed JSON retrieval retains the
static archive link; no localStorage snapshot is used. Old successful GitHub JSON
remains the publishing fallback. Snapshots older than 48 hours receive a visible notice.

## Automation readiness — not enabled

Current Triggers.gs calls the old collector and notification paths. It does not
call dynamic review collection or FeedPublisher. CredentialStore and dynamic
collection also require dryRun true and scheduling/notifications false.
Do not enable the old triggers as a shortcut.

Next implementation needs a dedicated owner-scoped orchestrator: collect once,
validate that exact run, publish that snapshot, and persist run/commit outcome.
Do not silently select an older completed run when collection fails. Separate
operational scheduling permission from dry-run probe guards without toggling
global flags during execution. Maintain locks and unknown-write reconciliation.

Before unattended publication: preserve prior article/tag memberships on incomplete
coverage, detect credential expiry/challenges without automatic retries, implement
deduplicated failure alerts to the configured recipient, and test recovery after
credential replacement. Needs-tag preview is not delivery; intentional non-series
posts need a recorded exclusion policy. Retention is needed for accumulating review
tabs. Use the same account owning stored UserProperties and the Gmail mailbox.

Target 08:30/20:30 Europe/London. Apps Script nearMinute(30) has +/-15-minute
precision (Google ClockTriggerBuilder documentation); it is not exact-minute delivery.
Scheduling, notification sends and production-page replacement remain pending.

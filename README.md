# Affiniti Substack Feed

Public metadata and display integration assets only. Collector source, credentials, Gmail identifiers and private review sheets belong elsewhere.

## Hosting

In Settings → Pages choose Deploy from a branch, main, /(root). The .nojekyll file makes this a static site. No custom build workflow is required.

Expected test URL: https://rhyen-jivan-affinitiplus.github.io/Affiniti-Substack-Feed/preview/

`preview/feed.json` begins with ready:false and no articles. The private Apps Script publisher replaces it with validated public metadata. This path is a display test, not an approved production feed. Coverage remains explicitly incomplete. No article data is seeded manually.

## Access

All files and history in this repository are public and copyable. Public visibility does not grant write access. Review collaborator/team permissions in GitHub. No repository protection or access settings were automatically changed.

The publisher uses a fine-grained token scoped to this repository with Contents read/write. This permission is repository-wide, not restricted by GitHub to a single file. The publisher code restricts its target to preview/feed.json. Do not grant Actions, Workflows or Administration permissions to that token. Repository settings and Pages setup are performed separately by the owner.

## Preview behaviour

loader.js fetches JSON without credentials and creates at most six official Substack embed iframes using the URL protocol in the user-supplied embed.js source. It does not load embed.js, whose shared global regular expression skips alternating posts. Frame height messages require matching origin/source and a bounded numeric height. Accessible article text/links remain until a valid height message. Renderer v2 still requires live visual acceptance; see docs/embed-alternation-2026-09-29.md.

Publication is atomic at the Git file-update level. Pages deployment and caching are separate and may lag behind the commit. The publisher stops on missing prior articles/tags, an API error or a concurrent update rather than infer deletions from incomplete collection. Scheduled refresh and production carousel integration remain disabled.

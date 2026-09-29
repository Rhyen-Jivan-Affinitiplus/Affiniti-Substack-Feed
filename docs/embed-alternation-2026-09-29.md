# Alternating Substack embeds

User screenshot showed cards 1, 3, 5 embedded and 2, 4, 6 left as text. User then supplied the actual embed.js source loaded in Firefox.

Confirmed cause: postLinkRegex is declared once with /g and reused with exec for successive canonical URLs. A successful match advances lastIndex to the end of the first URL; the next exec starts at that offset, fails and resets lastIndex. A subsequent URL starts at zero again. The supplied six-article pattern is reproduced with a minimal six-URL test. The same construction is present for note links, which this integration does not use.

The earlier hypothesis of a live DOM collection was incorrect: the source uses querySelectorAll, not a live collection. No source evidence supports blaming cookies or the article metadata.

## Change

The feed loader now generates Substack's own /embed/p/{slug} iframe URL directly for each already validated canonical URL. This follows the protocol in user-supplied source rather than an independently documented stable API. No embed.js is loaded, copied, monkey-patched or repeatedly executed. The original article remains rendered by Substack, not a recreated visual card. Target remains six articles for display acceptance; collection and publishing are unchanged.

Frames are responsive, titled and sandboxed with scripts, same-origin, user-activated top navigation and popups; clipboard-write only. fullURL excludes the host query and fragment. One message listener checks exact frame origin and contentWindow, then accepts only bounded numeric height values. Text/link fallback is retained until a valid height message. The status counts frames and height messages separately; neither frame creation nor height acknowledgment establishes visual correctness.

A scoped grid stylesheet applies on the hosted and Squarespace pages. It cannot make a narrow Squarespace parent Code Block wider; the owner must expand the block in the editor if needed.

## Verification

Node regression checks reproduce the original alternating regex result and verify six distinct frames, no embed.js insertion, safe DOM text, host URL privacy, rejection of wrong origins/sources/invalid heights, six resize acknowledgments, listener cleanup and invalid-feed/fetch-failure handling. Tests run offline; actual Substack iframe rendering must still be visually confirmed in the user's browser. Prior cloud-browser script access returned Site Unavailable and is not evidence that the user's browser is blocked.

## Acceptance

Reload the hosted preview. Status must identify Renderer v2 and create six frames. Confirm all six show styled Substack content. Refresh the Squarespace page with loader.js?v=2 if its existing script remains cached. No Apps Script/publisher/token change is necessary. Coverage and unattended scheduling remain incomplete/disabled.

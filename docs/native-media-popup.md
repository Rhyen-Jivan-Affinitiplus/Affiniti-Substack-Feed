# Popup v4: native media

The popup now uses article.image_url directly, with a title overlay and subtitle below. Images appear in article cards and detail. The iframe fallback, embed script, message receiver and iframe timeout have been removed. Missing, rejected or failed images retain the text and original link. Image nodes are replaced on navigation to isolate old load/error events. Images in lists load lazily. Layout still uses the existing brand colours, native dialog, focus return and reduced motion.

No external JS/CSS or header injection is required. One complete preview/popup/block.html goes in one Squarespace HTML Code Block. The test preview index contains the same block verbatim. Production Squarespace is not edited here.

The current GitHub JSON is not rewritten with historical images. The user must install the matching Sync collector update, make a fresh collection and publish the resulting image_url fields. Until then this popup deliberately displays text-only previews. Source-media overlay acceptance is pending that fresh feed and Squarespace checks. Compatible old schema-v1 feeds still load; no hardcoded per-article image mapping exists.

User-reported coverage: 25/25 image references, 11 tags, zero conflicts. All 25 rows came from initial archive pages; seven continuation pages were empty. Image URL validation does not establish download availability.

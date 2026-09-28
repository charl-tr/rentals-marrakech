# FR / EN rollout — validation status

## Shared layouts

HomePage/HomeHero, Catalogue/CatalogueBrowser, PropertyCard, PropertyDetail,
ContactPageContent/ContactForm, SellerPageContent/SellerContactForm,
FavoritesPageContent, area guides, journal index/articles, comparison, map,
Navbar and Footer now accept a locale and share markup.
Do not introduce independent English versions of these layouts.

French public URLs remain unprefixed. /fr redirects to their existing URLs.
English uses /en. Original property slugs and recorded values remain unchanged.

## Checks performed

- Production build and TypeScript passed.
- Desktop 1440px rental catalogue: FR/EN heading position and height match.
- Mobile 390px FR/EN rental catalogue and EN favourites: no horizontal overflow
  or browser page errors.
- Bedroom filtering updates the English URL.
- Shared property detail opens at the top; contact form advances to step two.
- No live form submissions or database mutations were used for these checks.

## Not yet ready for an unrestricted English launch

- English remains noindex, follow; no English sitemap/hreflang rollout yet.
- Original property descriptions and feature prose remain French, identified
  as original content. English headings are factual, not translated marketing copy.
- Area and journal layouts now match French. Their source editorial prose is
  explicitly marked French, pending reviewed translations. Other editorial/legal
  routes still use the explicit French-original fallback.
- Private saved-selection emails/portal still require English localization.
- Complete responsive and end-to-end regression testing remains necessary.

Do not describe this stage as a fully translated or fully parity-tested site.

## Display currencies

- Only EUR/USD/GBP are selectable. Recorded MAD is always the second price.
- EUR and MAD remain independent agency inputs, never overwritten by conversion.
- USD/GBP use EUR multiplied by the dated ECB reference rate, shown with ≈.
- One shared browser request, cached server feed, no per-property FX requests.
- Missing EUR is never inferred from MAD. Missing MAD is explicitly on request.
- Missing/invalid/stale rates fall back to labelled EUR, not invented FX rates.
- Price ranges, rental units and EUR-based budget thresholds stay consistent.
- Applies to public cards/details/contact context, saved properties, comparison,
  map panels/markers and the sticky property CTA; admin editing stays EUR/MAD.
- Regression checks: npx tsx scripts/test-i18n-currency.ts.
- Browser checks included USD/GBP updates without MAD changes, one FX request per
  catalogue, comparison selection, maps, area and journal page rendering.

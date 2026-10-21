# Imprint Engine

## Links

- Webflow: Imprint Engine v2
- Staging: https://imprint-engine-v2.webflow.io/

## Webflow loading

Use `webflow-custom-code.txt` for the current site-level head/footer setup.
The development loader resolves GitHub `main` once, fetches CSS and JS together
from that commit, and executes after the deferred libraries and Webflow's jQuery
are ready. Refresh staging after pushing changes.

Keep development on this loader to avoid jsDelivr branch-cache delays.
Use pinned jsDelivr releases when switching to stable production code.

## Notes

- Custom Products uses native reusable components and instant category/decoration
  filters. See `custom-products-notes.txt` for the component IDs, props and checks.
- Keep this site's custom code inside this site folder.
- Copy snippets into this site before adapting them.
- Custom code selects elements by attributes; see `attribute-hooks.md` when
  adding or duplicating elements in Webflow. Keep state classes for styling.
- Edit `homeMotion` inside `homeAnimation()` to tune the home scroll sequence.
  See [home-animation.md](home-animation.md) for percentages, linked starts,
  grouped controls, and the local staging preview.
- The 13 lander card positions use native lists from **Homepage Lander Cards**.
  Edit the collection's Name and Image fields, then publish. Each position selects
  one record; adding a CMS item alone does not add another animated position.
  See `webflow-notes.md` for the list structure and item mapping.

## Homepage mobile — 20 October 2026

The supplied `Website.png` and `Frame 2147236654/6655/6656.png` are the mobile
references. The original `homeAnimation()` now runs below 1200px as well as on
desktop. It retains its percentage scrub controls, separate entrance and idle
card rotation; the static mobile card slider has been removed.

`homeMobile` at the top of `homeAnimation()` owns mobile framing in rem:
opening/scene heights, logo clearance, artwork framing, card placement and final
drop size. It measures the actual text/logo heights so short screens can scroll
through the opening content before scrubbing. `homeMobile.scroll` caps mobile/tablet
scroll speed through the lander, including swipe inertia. Scrolling beyond it is uncapped.
Breakpoint cleanup restores the desktop SVG geometry and attributes.

Layout, spacing, gradients and image positioning are native Webflow styles.
The homepage uses one original Accordion 01 - Single and one original Teams
component at every breakpoint, preserving their props and instance overrides.
The separate mobile copies and their responsive wrappers were removed on
21 October. Adapt components internally; do not duplicate them for mobile.
Mobile dimensions use rem, with a 100dvh final home scene. The menu and lander
follow the visible browser height, without a larger 100vh minimum. The lander
observes that dynamic height, updates its framing and refreshes the scrub range
after browser-bar resizing settles. Menu close also resynchronizes the lander.
On mobile/tablet, the final transition fades the hero instead of animating its
clip path; desktop keeps the wipe. Timing remains in `homeMotion.finish.clip`.

Teams uses the same floating-circle physics on mobile, with four photos and six
white satellites. Native tablet styles size and position the circles; explicit
`team-profile-from` / `team-profile-to` line hooks preserve their connections.
Touch holds reveal connected photos until release, retaining the existing short
drag and release fade. The mobile team list is one full-width column. Accordion
03 switches instantly on mobile; desktop keeps its existing animation.

Tablet (1199px and below) is the first mobile layer. The lander uses the same
centred card arrangement on tablet and phone. Tablet uses larger tile images,
wider `text-ch` copy and eight logos per row at the viewport bottom; phones
retain four logos per row. `homeMobile.tablet` owns the tablet copy and logo controls.
The shared nav opens as a full-screen white, single-column menu. Submenus cover
the main options and have a Back control; all mobile menu changes are instant.
While open, the original nav temporarily moves outside the hero clip, then
returns to its component position on close. Links and props are never cloned.

Webflow's native tablet breakpoint stops at 991px. The generated block at the
top of `src/styles.css` extends those native tablet styles through 1199px.
After publishing tablet style edits, run `node sites/imprint-engine/sync-tablet-styles.mjs`
to refresh that block. Keep styling in Webflow; the extension reuses its output.
The menu header stays white above scrolling items, with inset dividers and
bottom-aligned actions. Smaller mobile tiles keep readable labels and fade out
at the back; their stacking order stays fixed on desktop and mobile to avoid snaps.

`mobileHomepageDetails()` handles the mobile footer Submit label, with cleanup.
The separate drop-text section retains its desktop outlined drop on mobile. The home animation retains
the desktop outlined drop and proportionate brackets at a smaller native size.
Both ripple positions follow their drop; the final scene aligns with the clip
and completes before Form 1 enters. The small `[mobile-type]`
CSS rules select saved typography sizes where the existing body typography
embed otherwise overrides native breakpoint sizes. Text wrapping continues to
use `text-ch`; short drop headings retain their authored character limits.

Webflow's original Gilroy 700 face resolves to ExtraBold. The separate native
Gilroy Mobile font family uses the actual Regular, SemiBold and Bold files,
leaving the desktop registration intact.

The existing process photograph and current CMS logo records are retained.
The exported mobile reference shows a different laptop photograph, which is
not in the available page assets. Final mobile approval remains with Michael;
Mobile is unchecked in the tracker.

Published checks: `node sites/imprint-engine/tests/home-mobile-staging.browser.mjs`.
Set `PLAYWRIGHT_MODULE` if Playwright is outside local node_modules and
`HOME_TEST_OUTPUT` to choose the screenshot/report folder. The test uses a
headless Chrome touch context and checks native swipe scrolling, reversible
scrub, short phones, tablet/desktop transitions, navigation, tabs, cards,
process accordion, FAQ and envelope. It does not submit forms.

## Solutions by Product mobile — 21 October 2026

Page Header 01 stacks its artwork above the existing content below 1200px.
The optional `Mobile Image` and `Use Mobile Image` content props select square
assets on Product overview, Merchandise, Kits, Events, Print and Packaging.
Apparel also uses a square mobile reframe. Signage and Custom Products have text-only
headers. All existing content props remain shared.
The square asset is saved in the overview's local `webflow-ready` asset folder
as `product-header-mobile-square.png`; Webflow serves its optimized WebP version.
The five additional reframes and their image-editing prompts are saved in each
page's `webflow-ready` folder as `<page>-header-mobile-square.png` and the sibling
`-prompt.txt`. The parent Solutions by Product export folder also holds
`mobile-hero-updates-2026-10-21.json`, with asset IDs and the prior instance values.
These were made with the built-in image editor and compressed to WebP in Webflow.
Only mobile image props changed; the desktop image props retain their originals.

Native mobile styles give Logo List six columns / three rows, Split 6 two equal
columns of three evenly spaced cards, Shop Slider two visible cards plus part of the third, Hoodie
a rem-sized contained image, and Tiles 1 landscape 3:2 images with matching content
insets. Sections use 1.25rem side padding; the Split 6 tab strip stays edge-to-edge,
with that padding applied only to its content below. The main 18px paragraphs opt into the
saved 16px p-2 mobile size. Desktop section geometry was unchanged in staging.
Phone and tablet staging checks passed; mobile approval remains with Michael.
Shop Slider's mobile background uses contain sizing inside the section height,
positioned behind the cards, rather than enlarging the artwork to cover a tall frame.

Accordion 06 uses the Product overview's pale tab background and single horizontally
scrolling row below 1200px. Its native `accord-06-marker` reuses the existing
`active-marker` behavior; the desktop underlines remain on desktop. Tab labels
and content bindings remain on the original component.

## Services and Apparel mobile — 21 October 2026

Apparel, the Services overview and all five Service detail pages now select their
own square artwork through Page Header 01's existing Mobile Image and Use Mobile
Image props. Desktop image props are unchanged. The built-in image editor reframed
the existing artwork; originals, square PNGs and prompts are saved in each page's
`webflow-ready` folder. Webflow serves optimized WebP files. The Services export
folder contains `mobile-updates-2026-10-21.json` with asset IDs and prior prop values.

Accordion 01 - Services reuses the Split 6 mobile content padding and typography.
Its horizontal tab strip has the pale background and no outer page inset. Its
three-item panels stack evenly, including the separate Photography benefits panel.
Native responsive overrides keep Service headers consistent with Page Header 01
on phones and tablets. The detail-page Accordion 06 instances retain their shared
horizontal mobile tabs. Mobile approval remains unchecked for Michael's review.

## Animation regression checks

See [homepage-design.md](homepage-design.md) for native Webflow styling,
reference matching and the page-specific FAQ. Run
`node sites/imprint-engine/tests/homepage-design.browser.mjs` for its desktop,
tablet, mobile and keyboard checks.

See [animation-controls.md](animation-controls.md) for the other functions'
control groups, timing units, footer rendering and keyboard behavior.

Run `node --test sites/imprint-engine/tests/*.test.mjs` from the repo
root. The tests use GSAP 3.15.0 (fetched from the pinned CDN if not installed)
to check grouped percentage timing, linked starts and stagger, reversal,
responsive em-based gradient-droplet sizing, clip geometry, and the independent
drop-text ripple trigger, purple settling, reversal, and cleanup. Flex-grow gallery checks
cover initial active state, hover interruption, keyboard/tap selection, scoped
class changes, animation timing, and cleanup.
Run `node sites/imprint-engine/tests/home-scroll.browser.mjs` with Playwright
and Chrome for the home animation's browser checks. These cover pauses,
forward/reverse/jump consistency, fast scrolling, sticky boundaries, responsive
sizes, breakpoint cleanup, and changes to timing controls. See
[home-animation.md](home-animation.md) for setup and report options.

Run `node sites/imprint-engine/tests/home-polish.browser.mjs` for continuous
card motion/opacity, nav clipping and footer themes, end-drop alignment, and
gallery image sizing through desktop/mobile expansion and resize.

Run `node sites/imprint-engine/tests/home-cards.browser.mjs` for card placement,
logo clearance, stable resize, scroll-accelerated rotation and fade/reverse.

Run `node sites/imprint-engine/tests/site-interactions.browser.mjs` for keyboard
and rapid-selection checks, repeated initialization, footer visibility/idle
work, reduced motion, breakpoint changes, and complete cleanup.

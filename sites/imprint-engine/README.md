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
references. The original `homeAnimation()` now runs below 992px as well as on
desktop. It retains its percentage scrub controls, separate entrance and idle
card rotation; the static mobile card slider has been removed.

`homeMobile` at the top of `homeAnimation()` owns mobile framing in rem:
opening/scene heights, logo clearance, artwork framing, card placement and final
drop size. It measures the actual text/logo heights so short screens can scroll
through the opening content before scrubbing. Touch swipes scroll normally.
Breakpoint cleanup restores the desktop SVG geometry and attributes.

Layout, spacing, gradients and image positioning are native Webflow styles.
The homepage uses one original Accordion 01 - Single and one original Teams
component at every breakpoint, preserving their props and instance overrides.
The separate mobile copies and their responsive wrappers were removed on
21 October. Adapt components internally; do not duplicate them for mobile.
Mobile dimensions use rem, with a 100svh final home scene.

Tablet (991px and below) is the first mobile layer. The lander uses the same
centred, smaller card arrangement and `text-ch` copy lengths on tablet and phone.
The shared nav opens as a full-screen white, single-column menu. Submenus cover
the main options and have a Back control; all mobile menu changes are instant.
While open, the original nav temporarily moves outside the hero clip, then
returns to its component position on close. Links and props are never cloned.

`mobileHomepageDetails()` handles only the separate drop-text section's mobile
solid drop and footer Submit label, with cleanup. The home animation retains
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

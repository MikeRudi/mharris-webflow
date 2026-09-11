# Imprint Engine

## Links

- Webflow: Imprint Engine v1
- Staging: https://imprint-engine-v1.webflow.io/home-staged

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

## Animation regression checks

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

Run `node sites/imprint-engine/tests/site-interactions.browser.mjs` for keyboard
and rapid-selection checks, repeated initialization, footer visibility/idle
work, reduced motion, breakpoint changes, and complete cleanup.

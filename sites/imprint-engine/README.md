# Imprint Engine

## Links

- Webflow: Imprint Engine v1
- Staging: https://imprint-engine-v1.webflow.io/home-staged

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/MikeRudi/mharris-webflow@main/sites/imprint-engine/src/styles.css">
<script defer src="https://cdn.jsdelivr.net/gh/MikeRudi/mharris-webflow@main/sites/imprint-engine/src/script.js"></script>
```

See `webflow-custom-code.txt` for the full copy-paste Webflow library setup.

## Notes

- Keep this site's custom code inside this site folder.
- Copy snippets into this site before adapting them.
- Custom code selects elements by attributes; see `attribute-hooks.md` when
  adding or duplicating elements in Webflow. Keep state classes for styling.
- Edit `homeMotion` inside `homeAnimation()` to tune the home scroll sequence.
  See [home-animation.md](home-animation.md) for percentages, linked starts,
  grouped controls, and the local staging preview.

## Animation regression checks

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

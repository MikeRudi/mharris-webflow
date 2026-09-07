# Imprint Engine

## Links

- Webflow:
- Live site:

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/MikeRudi/mharris-webflow@main/sites/imprint-engine/src/styles.css">
<script defer src="https://cdn.jsdelivr.net/gh/MikeRudi/mharris-webflow@main/sites/imprint-engine/src/script.js"></script>
```

See `webflow-custom-code.txt` for the full copy-paste Webflow library setup.

## Notes

- Keep this site's custom code inside this site folder.
- Copy snippets into this site before adapting them.

## Animation regression checks

Run `node --test sites/imprint-engine/tests/home-finish.test.mjs` from the repo
root. The tests use GSAP 3.15.0 (fetched from the pinned CDN if not installed)
to check ripple timing, colour interpolation, reverse/replay, and scroll handoff.
Browser visual checks are still required for layout and CSS rendering.

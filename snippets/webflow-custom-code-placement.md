# Webflow Custom Code Placement

Typical library order in Webflow before the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/sites/site-name/src/script.js"></script>
```

CSS usually goes in the page or site head:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/sites/site-name/src/styles.css">
```

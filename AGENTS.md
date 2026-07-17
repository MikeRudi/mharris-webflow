# Codex Rules for Webflow Projects

This repo stores custom code for Webflow sites.

## Core Principles

- Each site must be self-contained.
- Do not create shared runtime code that multiple live sites import.
- The `snippets/` folder is a vault for reference and copy-paste starting points only.
- The `reference-code/` folder is raw historical code for Codex to study and search. Do not link Webflow sites to files in this folder.
- When a snippet is needed, copy the relevant code into that site's own files and adapt it there.
- Prefer simple static files that can be served through GitHub + jsDelivr.
- Keep code readable for Webflow custom-code use, not over-engineered for an app framework.

## Site Folder Pattern

Each site should live in:

```txt
sites/site-name/
  src/
    script.js
    styles.css
  dist/
  README.md
  webflow-notes.md
```

Use `src/script.js` and `src/styles.css` as the main editable files unless we later add a build step for a specific site.

## Webflow Integration

For GitHub + jsDelivr, link site files in Webflow custom code with pinned or branch-based CDN URLs.

Use `sites/_template/webflow-custom-code.txt` as the maintained copy-paste starting point for new Webflow library scripts.

Use `libraries.md` as the quick reference for library CDN links.

For development links, prefer the GitHub API loader pattern in `sites/_template/webflow-custom-code.txt` so Webflow refreshes can pick up pushed `main` changes without jsDelivr branch cache getting in the way.

Do not rely on jsDelivr `@main` URLs for active development. They can cache old files and purge requests can be throttled. Use jsDelivr for stable production links later, once code is less frequently changing.

Keep Flowplay optional in new-site templates. Loading it on pages without video players can create noisy counter errors in the console.

For fast Webflow testing, `scripts/watch-push.js` can watch a site's `src` folder and auto-commit/push saved changes.

Development or quick testing:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/sites/site-name/src/styles.css">
<script defer src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/sites/site-name/src/script.js"></script>
```

Production preference after stable releases:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.0.0/sites/site-name/src/styles.css">
<script defer src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.0.0/sites/site-name/src/script.js"></script>
```

## Coding Style

- Use plain JavaScript unless a site specifically needs a build tool.
- Wrap site code in a clear initialization function.
- Prefer small named functions for each behavior, then call those functions from the site initializer.
- Use the local `onDesktop(fn)` and `onMobile(fn)` helpers for desktop/mobile-specific behavior:
  `const onDesktop = (fn) => gsap.matchMedia().add("(min-width: 992px)", fn);`
  `const onMobile = (fn) => gsap.matchMedia().add("(max-width: 991px)", fn);`
- Put global function calls directly inside `initSite()`, and put desktop/mobile calls directly inside the `onDesktop()` and `onMobile()` blocks.
- Guard against missing Webflow elements before running animations.
- Keep GSAP and Lenis setup explicit inside each site folder.
- Use class names and attributes that match the Webflow project.
- Do not assume a class exists unless it is documented in `webflow-notes.md` or visible in the current site code.
- Prefer jQuery for DOM selection, events, and class changes when Webflow already provides jQuery.
- Use jQuery ready shorthand `$(initSite)` for Webflow startup.
- Add comments only where they help explain site-specific behavior.

## Before Editing a Site

Check:

1. `sites/site-name/README.md`
2. `sites/site-name/webflow-notes.md`
3. `sites/site-name/src/script.js`
4. `sites/site-name/src/styles.css`

## Assets

Use `assets/` as a grab-and-duplicate vault for commonly used assets such as SVGs, icons, logos, and reference files.

Do not treat `assets/` as a live dependency folder.

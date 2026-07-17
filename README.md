# Webflow Projects

Custom-code workspace for Webflow sites.

This repo is designed for simple GitHub + jsDelivr hosting. Each site has its own self-contained folder with its own JavaScript and CSS. Shared snippets and assets are kept as a vault, but live sites should not import shared project code directly.

## Structure

```txt
assets/
  Reference assets and reusable files.

snippets/
  Copy-paste code vault. Not live shared code.

sites/
  _template/
    Starter structure for a new Webflow site.
```

## Creating a New Site

Copy `sites/_template/` and rename the copy:

```txt
sites/my-site-name/
```

Then update:

- `sites/my-site-name/README.md`
- `sites/my-site-name/webflow-notes.md`
- `sites/my-site-name/src/script.js`
- `sites/my-site-name/src/styles.css`

## CDN Links

Once this folder is pushed to GitHub, files can be loaded in Webflow through jsDelivr.

Replace `USERNAME`, `REPO`, and `site-name`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/sites/site-name/src/styles.css">
<script defer src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/sites/site-name/src/script.js"></script>
```

For production, prefer a version tag once a site is stable:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.0.0/sites/site-name/src/styles.css">
<script defer src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@v1.0.0/sites/site-name/src/script.js"></script>
```

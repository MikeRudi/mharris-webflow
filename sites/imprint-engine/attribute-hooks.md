# Custom-code attribute hooks

Custom JavaScript and CSS select elements with attributes such as `[nav-block]`.
In Webflow, keep the existing class and add a custom attribute with that exact
name and an empty value. Copy both when building another instance of a feature.
Changing a class name in Designer does not require changing the behavior hook.

The same migration is applied to Home, Home Staged, Landing-staged, reused
elements on other pages, and shared component definitions. The three card
transform embeds also use `[perspective-card]` with their original transform.

## Attributes on Webflow elements

Each name below is both the existing class name and its matching attribute name.

| Feature | Attribute names |
| --- | --- |
| Git save test | `git-test` |
| Home layout | `lander-wrap`, `layout-start`, `home-start`, `layout-end` |
| Home cards | `perspective-card`, `perspective-opacity-1`, `perspective-opacity-2`, `perspective-opacity-3` |
| Home ending | `home-end-brackets`, `home-end-brackets-svg`, `home-end-bracket-left`, `home-end-bracket-right`, `home-end-target-svg`, `home-end-ripple` |
| Gallery | `flex-grow-block`, `flex-grow-item`, `flex-grow-item-img`, `flex-grow-item-content`, `text-grow-item-title`, `flex-grow-item-copy`, `img-abs` |
| Drop text | `drop-text-layout`, `drop-text-ripple` |
| Navigation | `nav-block` |
| Filters and accordions | `h-line`, `accord-heading`, `active-marker` |
| Footer | `footer-svg`, `footer-svg-engine` |

`img-abs` and `h-line` are reused elsewhere on the site. Their attributes are
present on those matching elements too; custom-code selectors remain scoped to
the relevant feature.

## Attributes created by JavaScript

- `word`: added to the word wrappers returned by SplitType during filter setup.
- `footer-pixels-defs`: added to the generated footer SVG definitions.
- `footer-svg-pixel-layer`: added to the generated footer pixel group.

These generated elements do not need to be added in Webflow.

## State classes

`active`, `is-active`, `nav-light`, `nav-dark`, `is-moved-down`, and
`is-moved-right` remain classes so existing Webflow styles and state changes
continue to work. Existing section attributes `[nav-light]` and `[nav-dark]`
also remain unchanged; they tell navigation which theme to use.

jQuery event namespaces such as `.flexGrowAnimation` are cleanup identifiers,
not element selectors, and remain unchanged.

## Rollout order

Add the attributes in Webflow and publish those changes before pushing the
attribute-based source files to `main`. The previous code continues to work
with the retained classes while the new attributes are being prepared.
Resume the desktop auto-push task only after that coordinated rollout.

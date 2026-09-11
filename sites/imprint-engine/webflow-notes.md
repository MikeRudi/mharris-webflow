# Webflow Notes

- Site name: Imprint Engine
- Webflow site ID: `6a59f919cc325da48eff4d6d`
- Staging page: https://imprint-engine-v1.webflow.io/home-staged

## Custom Code

- Site head/footer: see `webflow-custom-code.txt`.
- Home Staged head: desktop entrance visibility/transform rules.
- Runtime files: `src/script.js` and `src/styles.css`.

## Classes and Attributes

Custom JavaScript and CSS use attribute hooks for element selection. Keep the
existing Webflow classes for Designer styling, and add an empty custom attribute
with the same name to each matching element. See `attribute-hooks.md` for the
complete mapping, including hooks created by JavaScript.

State classes remain classes: `active`, `is-active`, `nav-light`, `nav-dark`,
`is-moved-down`, and `is-moved-right`. The class diagrams below describe the
native Webflow structure; the custom code selects their matching attributes.

## Home animation

Edit the numbered groups in `homeMotion` inside `homeAnimation()`. Every
step has its own start, duration, and ease; durations use fractions of the full
scroll distance. See [home-animation.md](home-animation.md) for the controls,
linked starts, examples, and browser checks.

`[layout-start]` is currently `450vh`. One ScrollTrigger runs from `top top`
to `bottom bottom`, with a fixed 0–1 clock and `scrub: true`. The opening
scene/drop sequence reaches the clip at 52%, leaving 48% for the finish. Both
home ripples, the clip, brackets, final drop, and content follow scroll in both
directions. There is no timed finish or scroll lock during the scroll sequence.
The entrance and idle card rotation keep their separate time-based behavior.
Most scroll motion uses `power1.in`; orbit and star rotation initially use
`none`, with their own editable controls.

```txt
.home-gradient-wrap
  .home-gradient
    .home-gradient-embed
      [home-gradient-svg]
        [home-gradient-orbit]
          [home-gradient-piece="1"] to [home-gradient-piece="8"]
        [home-gradient-line]
        [home-gradient-drops]
          [home-gradient-drop="1"] to [home-gradient-drop="3"]
          [home-gradient-drop="2"]
            [home-drop-base]
              [home-drop-colors]
                [home-drop-circle] x4
            [home-drop-star]
      [home-gradient-ripples]
        [ripple-ring] x3

.layout-start
  .home-start
  .layout-end
    .home-end-brackets
      .home-end-brackets-svg
        .home-end-bracket-shape.home-end-bracket-left
        .home-end-bracket-shape.home-end-bracket-right
      .home-end-drop-stage
        .home-end-target-svg
          .home-end-target-path
        .home-end-ripples
          .home-end-ripple x3
```

Gradient SVG and embedded CSS live in `.home-gradient-embed`. The eight pieces
form the bottom gradient, split into a ring, rotate, rise, then converge into
the drop. One renderer owns their orbit/merge coordinates so jumping or
reversing cannot leave stale SVG positions. The orbit shrinks to 0.82 while
rotating and stays at that size as it rises.

`homeMotion.drop.resize.widthEm` controls the final gradient drop width,
initially `6.5em`. The existing `223 × 315` artwork therefore has a nominal
size of `104 × 146.91px` at a `16px` font size; painted paths have internal
padding. The resize uses the SVG screen scale and retains the line contact at
scene `(720, 330)`. The drop holds its size during the masked colour animation.
ScrollTrigger refresh recalculates this explicit-from-state resize tween while
preserving progress. Keep star artwork centred on its local SVG origin and
use `transformOrigin: "center center"` to avoid drift inside transformed groups.

The line reaches the drop before the clip starts. The clip retains its
12-point clock-hand polygon and pivot at the gradient line. Its measured
geometry is cached until refresh; completion closes the remaining area fully.
The blur animates content children of `[home-start]` once from clear to 1.5rem,
leaving the sticky wrapper and clip edge unfiltered. Returning before the clip
or leaving desktop removes those child filters. The embedded nav is excluded
from the blur.

Webflow owns both overlapping `100vh` sticky layers, the `-100vh` top margin
on `.layout-end`. On desktop, JS adjusts its top padding so the bracket centre
sits `0.75rem` above the gradient line, controlled by `homeAlignment.endDropOffsetRem`.
The measured alignment refreshes on resize and restores authored padding on
cleanup. `.home-end-drop-stage` keeps its native `translate(-50%, -50%)`;
JavaScript scales only the target SVG in place, to 0.5 initially. Brackets close
from -72px / 72px and the end content fades in. Both layers leave together
through normal page scrolling at the exact section boundary.

The landing ripple expands and fades away on scrub. The final ripple expands
to 1.1 / 0.8 / 0.5 and settles into blue shadows with 2.5rem blur and 0.7 opacity.
It stays visible behind the end artwork and content at z-index 2. Use decimal
`rgba()` alpha for tweened shadows: GSAP 3.15 misinterpolates percentage alpha.
Desktop cleanup restores ring styles and content stacking order.

The page-load entrance stops Lenis and restarts it on completion. Early native
scroll input finishes the entrance before rendering the corresponding scroll
frame. `[home-logo-up]` enters alongside the initial content, then exits after
the first scene movement; reverse scrolling restores it. Its initial CSS
opacity prevents a flash before the entrance begins.

The rotating card sphere retains its pointer dragging and cached GSAP quick
setters. Do not create `gsap.set()` tweens inside its frame updates: those
completed tweens remain retained by the desktop matchMedia context. Rotation
and smoothing pause while the tab is hidden, `[home-start]` is out of view,
or the cards' fade has finished; that endpoint follows the timing controls.
Returning resumes from the retained position. Desktop cleanup removes the
observer, visibility listener, ticker, and timelines.

`homeCardMotion` controls the slower 48-second idle rate, drag response and
continuous depth opacity. The scale setters use explicit `scaleX` / `scaleY`;
GSAP's multi-property `scale` alias does not work as a quickSetter here.
Framing lasts through 30% of scroll and cards fade from 24–33%. Cards rise
straight up by `18rem` instead of moving to the viewport centre. Their position
spread is 1.12 horizontally and 0.6 vertically, anchored at the authored top
and right. This moves lower cards away from the logos and into left-hand space.
Refresh remeasures the layout without resetting its rotation.
Idle rotation advances directly on the ticker, independently of drag smoothing;
its speed increases to 3× across the opening 30% and stays active until fade-out.

Home Staged contains two `[nav-block]` copies: one inside `[home-start]`, the
other in the page root. `nav-light` means white text; `nav-dark` means dark text.
The hero uses `nav-light`; the page copy starts `nav-dark` and switches for the
footer. Attribute-scoped CSS removes the outer `[layout-start]` stacking context
only where a hero nav exists, letting hero z-index 21 cover page nav 20 while
layout-end stays below it. The hero nav wrapper is absolute inside the sticky
hero so it follows the clip and leaves with the section, including on mobile.

Home Staged's approved `.layout-end` artwork is recorded in
`sites/imprint-engine/layout-end-svg-replacement.html`. The existing SVG
containers, viewBoxes, classes, and animation hooks are preserved. The supplied
brackets are uniformly scaled to their existing height and centres; the supplied
compound raindrop path is scaled to its existing painted height and centre.
The brackets use `fill: #5F249F`, and the drop uses `fill: #111111` with no stroke.

## Flex Grow Gallery

Home Staged's process gallery uses the existing `.flex-grow-block` structure:

```txt
.flex-grow-block
  .flex-grow-item x4 (one .active)
    .flex-grow-item-content
      .text-grow-item-title
        .flex-grow-item-number [class="h-1 weight-700"]
        [class="h-9 weight-700"]
      .flex-grow-item-copy [class="p-3"]
    .flex-grow-item-img
      .img-abs
```

`flexGrowAnimation()` runs globally from `initSite()`. Hover, focus, or tap/click
activates an item; Enter and Space also work. Exactly one valid item per block
is active, starting with the authored active item (then an active image, then
the first item as fallbacks). The same `.active` state is applied to the item,
its image wrapper, and its copy. Leaving the gallery keeps the last item open.

On desktop/tablet, only the item animates `flexGrow` between `0` and `1` over
`0.3s` with `power1.in`. Every image pane has `flexGrow: 1` so its width follows
the item's available space without multiplying two easing curves.
Copy fades over `0.15s`. Interrupted transitions restart
from the current rendered values; initial inline values prevent active-class CSS
from snapping widths before a tween starts. Div items receive keyboard focus,
button semantics, and `aria-expanded`. Cleanup restores authored styles,
classes, and accessibility attributes.

Sizing is native Webflow CSS, recorded in `flex-grow-webflow.css` for reference;
do not load that reference file as another runtime stylesheet. Desktop text
columns are `10em` with `1rem` padding/gaps. The item's non-shrinking basis also
accounts for its padding, internal gap, and two 1px borders. Image wrappers have
zero basis/width, `min-width: 0`, and no forced aspect ratio. The absolute image
keeps the fully open size using `--gallery-image-width/height` in `src/styles.css`.
Its parent clips the reveal. JS measures once per initialization, font readiness
or width change, never per animation frame. Desktop object-position remains
`right center`; mobile uses the native crop within a full-size 2:1 image.
Desktop copy is anchored to the bottom of its text column and hidden when
inactive. Its previous `[text-ch="18"]` limit now lives on the native copy class
as `max-width: 18ch`, allowing an unrestricted mobile right-hand column.

At tablet widths, text columns reduce to `7em`, spacing to `0.75rem`, and the
row height increases to `30em`. At `767px` and below, the gallery matches the
mobile reference: a centered heading/button, number/title on the left, copy
on the right, and a full-width 2:1 image underneath. Closed rows show only their
number/title. Mobile rows have `1.25em` padding and a `9em` minimum height.
The section has `1.25em` horizontal padding. The heading uses the scoped native
`.h-4.flex-grow-heading` combo to avoid changing other headings.
Mobile animation measures and tweens content/image heights and the image's
`1em` top gap at the same `0.3s`, `power1.in` timing; horizontal flex-grow remains
desktop/tablet-only. Width changes keep the selected item and recalculate its
sizes; mobile address-bar height changes do not interrupt the animation.
Font readiness also refreshes measured text heights, guarded against cleanup.
Numbers and labels are 01 Discover, 02 Design, 03 Develop,
and 04 Deploy. Existing image assets and body copy are preserved for editing
in Webflow. The first item, image, and copy are authored active in Designer.
Native changes need a Webflow publish; the JS uses the existing site loader.

## Drop Text Section

Home Staged contains `.drop-text-section > .drop-text-layout`. The existing
`.drop-text-content` and its text are preserved. The new sibling is:

```txt
.drop-text-artwork (decorative, aria-hidden)
  .drop-text-ripples
    .drop-text-ripple x3
  .drop-text-mark
    .drop-text-bracket-left (svg)
    .drop-text-droplet (svg)
    .drop-text-bracket-right (svg)
```

Native Webflow styles control the layout, not `src/styles.css`. The artwork
column is `45%` wide and `28em` tall. The mark is `9.125em` wide; the gradient
drop is `4.75em` wide with an automatic proportional SVG height. It reuses the
home drop silhouette with layered purple shading from the supplied Figma
reference. Brackets use the approved `#5F249F` paths. Native SVG definitions
use the unique IDs `drop-text-purple-fill` and `drop-text-soft-edge`; after WHTML
insertion, set the SVG tags to the case-sensitive `radialGradient` and
`feGaussianBlur` (the importer lowercases them).

The square ripple container is `32em` wide, falling to `28em` on tablet and
`24em` on mobile portrait. Its three rings have their own classes, so neither
home ripple animation selects them. `.drop-text-section` hides decorative
overflow; at tablet and below the section becomes auto-height, its layout
stacks with a `3em` gap, and the text's desktop `7em` left padding becomes zero.
Original desktop text typography, spacing and the `80vh` section height remain.

`dropTextAnimation()` initializes globally for desktop and mobile. Each layout
gets its own ScrollTrigger at `top 50%`: enter plays the ripple, leave-back
reverses it from its current frame. Scrolling further down leaves it settled;
there is no scrub, pin, repeat, or Lenis scroll lock. The rings expand over
`0.95s` with `0.09s` stagger to scales `1.1 / 0.8 / 0.5`. Starting at `0.05s`,
their purple shadows spread and soften to `1.2rem` blur over `1.15s`, ending at
opacity `0.7`. Full sequence duration is `1.38s`. The drop and brackets remain
still. Cleanup kills only these triggers/timelines and clears their ring styles.

`drop-text-artwork.html` and `drop-text-webflow.css` record the native markup and
class settings as reference copies, not live dependencies. Designer changes
need a Webflow publish; the animation comes from the existing GitHub JS loader.

## Libraries

- GSAP 3.15.0 with ScrollTrigger and Flip.
- Lenis 1.3.25.
- SplitType 0.3.4.
- jQuery supplied by Webflow.

## Known Issues

See `homepage-design.md` for the native Home Staged reference pass, new
comparison/testimonial sections, page-specific FAQ hooks, and remaining source
artwork dependencies. These layouts use native Webflow classes, not new embeds
or additions to `src/styles.css`.

- The shared social links still point to `#` until their final URLs are supplied.
- English is supplied in head code; native locale configuration would also cover
  visitors with JavaScript disabled.
- Mobile loading remains below 90 performance; see `performance-review.md`.

## Performance and accessibility cleanup — 2026-09-11

- The five approved light-background buttons on Home Staged now carry
  `readable-brand-text`; its purple text colour lives in `src/styles.css`.
  Keep this attribute when duplicating the same light-surface treatment.
- Native accordion number/title text is `#6f6c65`; footer legal text is `#999999`.
- The shared footer's Facebook, LinkedIn and Instagram links have accessible
  labels. Their existing `#` destinations still need final social URLs.
- Thirteen Home Staged image instances now use ten uploaded WebP card assets.
  Original PNG assets are retained; dimensions, transparency and authored alt
  text are preserved.
- The site loader fetches CSS/JS together from one main commit and defers library
  execution. `webflow-custom-code.txt` contains the complete maintained copy,
  including the site's typography styles.
- Head code supplies `lang="en"` when the HTML has no language. This runs before
  content and preserves any future native locale. A native Webflow language
  setting is preferable for visitors with JavaScript disabled; the connector
  currently does not expose that setting.
- Runtime control groups and lifecycle behavior are documented in
  `animation-controls.md`. Later motion polishing is recorded in `home-animation.md`.

# Webflow Notes

- Site name: Imprint Engine
- Webflow site ID: `6a59f919cc325da48eff4d6d`
- Staging page: https://imprint-engine-v1.webflow.io/home-staged

## Custom Code

- Site head/footer: see `webflow-custom-code.txt`.
- Home Staged head: desktop entrance visibility/transform rules.
- v2 Home head: `home-head-code.html` holds synchronous desktop opacity rules
  matching `homeAnimation()` initial states. These must stay in page settings,
  because the GitHub-loaded stylesheet arrives too late to prevent a first-paint
  flash. GSAP's inline opacity values take over; the CSS has no `!important` and
  does not apply below 992px.
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

The opening, second and third scene fades use GSAP `autoAlpha` so fully hidden
scenes also have `visibility: hidden`. Their full-screen wrappers therefore do
not intercept the visible `.home-start-btns` links. The hero drag handler already
ignores links/buttons; fade timings and native button styles are unchanged.
Breakpoint cleanup clears visibility together with the other animation styles.
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

The landing ripple expands and fades away on scrub. The final ripple matches
Figma Ellipses 10–12: inner 969×221, middle 1489×335, outer 2477×487 at the
1440px reference width, with 80px borders, #B7D1FF, 26.4px blur, multiply blending,
and inner/middle/outer opacity 0.6/0.4/0.4. Native dimensions use em, with centres
32/54/80px below the drop centre at the reference width to retain the perspective.
All three keep `.home-end-ripple` as their base; middle/inner modifiers use the
custom `class` attribute and the behavior hook identifies outer/middle/inner.
See `home-end-ripple-webflow.css` for the native style reference, not a runtime file.
JS expands each from 0.08 to 1 over 29% of the scrub with 2% stagger, reaching
the authored final size at 97%. Blur and borders stay native throughout; no
animated shadows or filter repaint are needed. Desktop cleanup restores ring
transforms/opacity and content stacking order.

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

v2's shared Navigation component publishes both copies with `nav-dark` and has
no theme prop. `home-head-code.html` therefore supplies the hero-only light text,
translucent background/border and nav stacking rules synchronously in Home's
page head. This matches the existing `nav-light` appearance before the async JS
switches its state class. The separate page nav still uses the normal scroll
theme logic. Keep these initial colours aligned with native navigation styles.

Home Staged's approved `.layout-end` artwork is recorded in
`sites/imprint-engine/layout-end-svg-replacement.html`. The existing SVG
containers, viewBoxes, classes, and animation hooks are preserved. The supplied
brackets are uniformly scaled to their existing height and centres; the supplied
compound raindrop path is scaled to its existing painted height and centre.
The brackets use `fill: #5F249F`, and the drop uses `fill: #111111` with no stroke.

## Support accordion active labels

The Support / Infrastructure / Technology label elements carry `[accord-1-title]`.
`accordionOne()` mirrors the selected row's `.active` class onto its label and
restores the authored classes on cleanup. Native `.accord-1-title.active` owns
the original purple-to-blue text gradient (`#674dc7` to `#55a6d1`), text clipping
and transparent color. Inactive labels retain native `#6f6c65`. The first label
is authored active in Webflow. Keep the hook when duplicating these labels.
The child `[accord-1-arrow]` also reveals on row hover or keyboard focus via
the attribute selectors in `src/styles.css`; the active row's arrow stays visible.

Accordion 01's grey dividers come from the reveal/background shells and 1px
gaps. The selected `[accord-reveal]` now becomes fully visible immediately;
its copy, buttons and images also switch instantly (`reveal.duration: 0`), with
no opacity fade. Marker movement keeps its existing timing. Runtime attribute hooks mirror
the existing `ac-1-top-flex`, `ac-1-btn`, `ac-1-card-flex`, `ac-1-card-img` and
`ac-1-img-single` classes. Inactive panels remain hidden/inert, and interrupted
reveals are cancelled. The native divider/background shells are not animated.

## Comparison component conventions (v2)

`Gradient Scroll 01` (`4928117d-677d-0eb1-85b6-d945bf1af05e`) keeps its
original component identity and all 13 text property IDs, names, groups and
instance values. Its existing root now has the HTML tag `div`; Webflow's API
still reports its original internal `Section` type. The `[compare-section]`
hook and region label remain on that root.

All 13 bound text fields are Text Blocks with only the native `text` class.
Their custom `class` attributes use the existing typography system:
- Section heading: `h-6 weight-700 text-center`.
- Six row titles: `p-2 weight-700`.
- Six descriptions: `p-3`.

Each replacement text block is bound to the same original component property.
Heading roles/levels retain the original accessible hierarchy. The logo is
preserved inside a Div Block, and `.compare-copy` owns the 0.75rem title/copy
gap. Existing layout classes and SVG artwork remain in place. These edits are
saved in Designer; publishing is separate.

The comparison drop uses native `compare-drop-track`, `compare-drop-line` and
`compare-drop` div classes, each with its matching behavior attribute. The
track is absolutely centred in `.compare-layout`; all `.compare-row` elements
have `[compare-row]`. Figma's Group 14588 provided the `#B26BFF` purple.
Per the user's follow-up, the artwork reuses the existing drop path from
`drop-text-artwork.html`, sized to 1em by 1.5333em inside `.compare-drop`.
Its native colour and drop-shadow remain editable there; `.compare-drop-svg`
fills the wrapper. A one-pixel purple gradient line trails behind it.
No CSS embed is used.

`compareDropAnimation()` keeps the drop at 50% of the viewport during the
scrub, draws its trail from the authored starting point, and releases when
the drop's bottom reaches the final row's bottom. The movement reverses with
scroll and adds no pin spacer or layout height. Reduced motion keeps the
drop static. Component text properties are untouched by this addition.

The old `.compare-glow` element and its cursor branch in `homeBackgroundMotion()`
have been removed. The replacement is a native Div Block with class and behavior
attribute `compare-gradient`, directly inside the comparison component. Native
styling uses `left: 58%`, `top: 20%`, `width: 15em`, `height: 18em`, cyan
`rgba(1, 163, 183, 0.55)` from the Figma reference, `blur(5.5vw)`, and initial
opacity 0. Its authored transform is `none`; only runtime cursor movement uses
translation. `.compare-layout` has z-index 1 to keep content above the artwork.

`compareGradientAnimation()` owns the pointer behavior separately. The gradient
arrives invisibly in 0.14s, then reveals from 0 to 1 over 0.3s with `power1.in`.
Each entry creates its own head and four reusable trail copies of the native artwork;
the copies follow at increasing delays, and all are removed after that exit fades.
Their opacity fades as they converge, so they never pile up into a bright blob
at rest. On pointer exit, the head parks at the exit point, the trail catches up,
the catch-up lasts 0.1–0.35s, then everything fades out over 0.3s (`power1.out`).
Re-entry starts a new gradient while the previous head and trail finish fading
independently. It does not return to its original percentage position.
The frame loop stops at rest and when hidden/offscreen. Touch/reduced-motion
visitors receive no decorative cursor effect; cleanup removes all trail copies.

## Flex Grow Gallery

Accordion 03's native `flex-grow-title` divider and `flex-grow-item` borders use
the reference's P+B v1 treatment: `linear-gradient(90deg, #674dc7 24.52%, #55a6d1 69.71%)`,
with `border-image-slice: 1`. Edit these colours in Webflow, not runtime CSS.

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

On desktop/tablet, the item animates `flexGrow` between `0` and `1` over
`0.4s` with `power1.inOut`. The native active image gap and content minimum width
animate on that same timeline. Every image pane has `flexGrow: 1` so its width follows
the item's available space without multiplying two easing curves.
Copy fades out over `0.2s` before resizing begins, stays hidden during resizing,
then the selected copy fades in over `0.2s` once expansion finishes. Edit
`galleryMotion.copy.hide` and `.reveal` separately; grow/mobile `start` is a delay
after the fade-out. Interrupted transitions restart
from the current rendered values; initial inline values prevent active-class CSS
from snapping widths before a tween starts. Div items receive keyboard focus,
button semantics, and `aria-expanded`. Cleanup restores authored styles,
classes, and accessibility attributes.

Sizing is native Webflow CSS, recorded in `flex-grow-webflow.css` for reference;
do not load that reference file as another runtime stylesheet. Desktop text
columns use native `width: max-content` and automatic flex basis. Closed items
have zero image gap, giving the number/title equal left/right padding. The open
column keeps its original `10em` minimum via the standalone native
`flex-grow-content-open` class, with the original `1rem` image gap on the item's
existing active state. The first content block carries this modifier through its
`class` attribute; JS toggles it and reads both states' native spacing to animate
alongside growth. No JS-calculated closed widths remain.
Image wrappers have
zero basis/width, `min-width: 0`, and no forced aspect ratio. The absolute image
keeps the fully open size using `--gallery-image-width/height` in `src/styles.css`.
Its parent clips the reveal. Each item's fully open image width is measured
separately before paint at initialization, font readiness or width change, then
the selected state is restored. Different number widths must not share one
image-width measurement. No image measurement runs per animation frame.
Desktop object-position remains
`right center`; mobile uses the native crop within a full-size 2:1 image.
Desktop copy is anchored to the bottom of its text column and hidden when
inactive. Its previous `[text-ch="18"]` limit now lives on the native copy class
as `max-width: 18ch`, allowing an unrestricted mobile right-hand column.

At tablet widths, open text columns retain a `7em` minimum, spacing is `0.75rem`, and the
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

## v2 testimonial envelope — 2026-10-08

`Testimonials 01` (`75501620-ec18-b292-2f8d-988bcd52a869`) now renders its root
as a div. It contains a native `.testimonial-layout`, heading text block,
layered envelope and `.btn-2-black` label. All fourteen text elements have `.text`
as their only native base, with typography in the custom `class` attribute.
There were no component props to relink. Existing names/company/quote copy is
preserved. Each card has a name/arrow/company row, divider and paragraph. John
and Emily use the existing front-card quote as placeholder copy; John also
reuses its Docusign label, as requested. The Wall of Love label has `[line-hover-item]` and a `[line-hover]`
underline; it has no destination, as requested.

All four supplied PNGs were resized to 1400px wide and compressed to WebP with
transparency preserved, from 32,106,842 bytes to 223,764 bytes combined. The
compressed reference copies are in `assets/envelope/`; runtime images come
from the Webflow asset library, not the repository vault:

| Asset | Webflow asset ID | Bytes |
| --- | --- | --- |
| envelope-bottom.webp | 6ac72b014b9d233dd71c2885 | 56,694 |
| envelope-top.webp | 6ac72b028030aee2939aa132 | 58,256 |
| envelope-bottom-crop.webp | 6ac72b02d1f9a887cf0cd3e9 | 52,992 |
| envelope-top-crop.webp | 6ac72b0295180e47249f0fa7 | 55,822 |

The open back uses the full-canvas top. The pocket uses the cropped bottom;
the closed flap uses the cropped top, clipped above the fold and mirrored
vertically in native Webflow. Images use `.img-abs` with separate modifier
classes in the `class` attribute. Three purple hit areas toggle the envelope;
the front pocket is the single keyboard button. Transparent corners allow
pointer access to the cards. The card mask follows the outer pocket edges,
with generous room above so lifted cards and the back flap stay visible.

`testimonialEnvelopeAnimation()` runs from `initSite()` on desktop and mobile.
Native styles start the envelope closed before JS. Opening fades out the closed
flap while the back and cards reveal. Hover/focus/tap lifts one card enough to
show all its content while retaining paper inside the pocket. Card stacking stays
fixed at back/middle/front (1/2/3); rear-card travel clears the cards in front as
well as the pocket. Rear papers are taller natively (90%, minimum 22rem) to
support this travel. Purple
clicks reverse the state; interrupted transitions start from current positions.
All timings, eases and travel controls are in `envelopeMotion` at the top.
Resize/content/font changes recalculate card clearance. Cleanup restores native
styles and attributes and removes observers/events. Reduced motion is instant.

`testimonial-envelope.html` and `testimonial-envelope-webflow.css` are references
to the native structure/styles, not runtime dependencies. First-build checks used
the staging CSS/fonts with the exact native changes at 1440, 1024, 768, 390 and
320px; all cards showed their content without horizontal overflow. Purple-area
clicks, rapid toggles, mouse hover, keyboard, touch, reduced motion and re-init
were checked. Native changes still require a Webflow publish.

The first published check exposed missing `[testimonial-envelope]`,
`[testimonial-cards]` and three `[testimonial-card-content]` hooks: the WHTML
imported wrappers rejected attribute writes despite some success responses.
Those five wrappers were replaced with native Div Blocks through the element
builder, retaining their children and styles. A fresh read confirmed all hooks,
then staging was published and real open/hover/close clicks passed with no JS
errors. Always verify saved attributes and the published DOM, not only tool
success messages. Publish to staging before functional Webflow testing.

## Drop Text Section

Home Staged contains `.drop-text-section > .drop-text-layout`. The existing
`.drop-text-content` and its text are preserved. In v2's `Homepage Drop with
Text` component, both text blocks use the native `.text` base with typography
classes in the custom `class` attribute. The heading keeps `weight-600 h-6
text-center` and `text-ch="15"`; the paragraph keeps `p-1 text-center` and
`text-ch="35"`. The heading has `role="heading"` and `aria-level="2"`. The
original Heading and Description component properties remain linked to those
same text blocks. The artwork sibling is:

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
column is `45%` wide and `28em` tall. The mark is `8em` wide; the drop is `4em`
wide with an automatic proportional SVG height. It reuses the exact black
outline path, transform and viewBox from the final home-animation drop, with
`#111111` fill and a transparent centre. The old purple fill layers, gradient
and blur definitions are removed. Brackets retain their approved `#5F249F`
paths and `1.7em` width.

The square ripple container is `32em` wide, falling to `28em` on tablet and
`24em` on mobile portrait. Its three rings have their own classes, so neither
home ripple animation selects them. `.drop-text-section` uses auto height,
an `80vh` minimum height and visible overflow so the artwork is not clipped.
At tablet and below its layout stacks with a `3em` gap, and the text's desktop
`7em` left padding becomes zero. Original text typography and spacing remain.

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

## v2 FAQ gradients — 2026-10-08

`Accordion 04` now contains `.faq-gradient-1` and `.faq-gradient-2` directly
inside `.home-faq-section`, replacing the old `.home-faq-glows` wrapper and
its two radial backgrounds. These native divs copy the team gradients' shape,
`15.4em` by `22.4em` dimensions, `5.5vw` blur and percentage placement, with
purple `#AB56F2` fill. Both use `[gradient-breath-1]`, so the team and FAQ
gradients share the controls at the top of `gradientBreathOne()`. Their native
classes remain separate so colours can be edited independently. The old
FAQ-only breathing branch in `homeBackgroundMotion()` was removed; that
function now controls the DNA ribbon only. FAQ content and component props
are unchanged. Publish Webflow to apply the native replacements.

## v2 team profile network — 2026-10-08

Imprint Engine v2 (`6abbde0cb7e6f39d52509b6c`), Home
(`6abbde0cb7e6f39d52509b36`), currently loads this folder's existing JS through
its GitHub development loader. Its new team artwork is native Webflow content:

Two native divs, `.team-gradient-1` and `.team-gradient-2`, sit directly inside
`.section-teams`, before `.teams-layout`, as the left and right red glows.
Both use the selected Figma Ellipse 589's `#FF9AA4` fill, `15.4em × 22.4em` size,
`top: 10.4%` and `blur(5.5vw)`, with no transform. The first uses `left: -8.5%`;
the second mirrors it with `right: -8.5%` and `left: auto`.
Native rounded corners and the blur filter create the soft edges; there is no
embed or runtime CSS. Both sit at z-index 0 behind the existing layout at 1,
with pointer events disabled and `aria-hidden`. Matching `team-gradient-1` and
`team-gradient-2` attributes identify each glow. Both also have `gradient-breath-1`,
which runs the reusable `gradientBreathOne()` function from `initSite()`.
Its controls sit at the top: scale to 1.08 over 14 seconds with `sine.inOut`,
then reverse, drifting 4% horizontally and 3% vertically in opposite directions.
It pauses offscreen or in hidden tabs, respects reduced motion, and restores
native styles on cleanup. Colour, dimensions and blur remain owned by Webflow.
The existing FAQ breathing animation remains separate. The first class
and hook replace the former `gradient-float-1` name.

Native `.section-teams` uses `user-select: none` to prevent text highlighting.
The header's `.btn-2-brand` has custom `class="text-selectable"`; that standalone
native class restores `user-select: text` for the button only. Link clicking and
circle dragging are unaffected.

```txt
.section-teams > .teams-layout > .teams-header
  .team-profiles
    .team-profile-canvas
      .team-profile-group.is-left / .is-right / .is-top / .is-floating
        svg.team-profile-lines > line
        .team-profile-node.is-01 ... .is-21
        .team-profile-node (22 / 23 / 24 use position classes via the class attribute)
          .team-profile-clip (relative, circular clip, white background)
            .img-abs.team-profile-image [.is-hidden]
```

The layout has 24 circles: 9 photos, 15 hidden placeholder images and
15 `#E0E0E0` lines. Each white circle connects directly to one photo, with no
white-to-white or shared connections:

| Photo IDs | Connections per photo | White circle IDs |
| --- | --- | --- |
| 01, 02, 09 | 3 | 03/04/05, 06/07/08, 11/12/13 |
| 10, 17 | 2 | 14/15, 16/22 |
| 18, 19 | 1 | 23, 24 |
| 20, 21 | 0 | None |

Desktop refinement: JS hides photo `02`, white circles `06/07/08` and their three
connectors, leaving 20 visible circles (8 photos, 12 white) and 12 lines. Native
Designer markup remains as listed above and is restored when desktop JS cleans up.
Only the eight revealed-photo circles are draggable; white circles follow their
connections and collisions without accepting pointer interaction.
Hovering a photo scales its clip and its connected circles' clips to 1.15, while
their images scale to 0.85. Connected circles additionally scale their outer node
to 1.3; the directly hovered photo keeps its original outer size. One tween applies
all scales together using `teamMotion.hover.duration` and `.ease` (currently
0.3 seconds, power1.out). `connectedParentScale` controls the extra enlargement.
Connected placeholder images
fade to opacity 1 over 0.2 seconds. Leaving restores their original appearance.
Dragging keeps that hover appearance through release and for another 0.4 seconds,
then restores the photo and its connected circles only once the pointer is outside
the dragged circle. Staying over it keeps the reveal active; leaving afterwards
uses the same release fade. Connected images fade out over
1.2 seconds with power1.out after release; scale restoration uses the shared hover timing.
Hover scaling keeps the circles' centers and connector anchors intact; resize
measurements exclude the temporary parent enlargement.
Native Webflow `team-profile-image` sizing is 120% width/height, max-width none,
left/top 50%, right/bottom auto and translate(-50%, -50%), with a centred transform
origin. The existing team-specific style supplies this on `img-abs`; at hover's
0.85 image scale it still covers 102% of the clip, preventing exposed edges.

`teamProfilesAnimation()` owns desktop movement only. `section-teams`, `teams-layout`, `teams-header`,
`team-profile-group`, `team-profile-node` and `team-profile-lines` are the behavior
attributes. The initializer adds missing hooks from these known native classes
at runtime because some imported elements currently have only their classes.
Future Designer copies may carry the matching attributes directly. Cleanup removes
only hooks it added. Keep connector endpoints on their circle centers in Designer;
the animation binds the original pairs once and preserves those pairs after resize.

Connected circles use distance constraints with at most 6% elastic extension
or compression. Their joints rotate freely, keeping independent momentum during
grabs and releases. Each grab automatically releases after 0.1 seconds,
even if the mouse button remains down. Circles collide across all groups, with a 1px
gap and a soft rebound, while links and section walls remain constrained. Connector
lines stay anchored and flexible but do not participate in collisions.
Circles lingering within 32px of each other gain a gentle separating force after
0.75 seconds, building over 1.25 seconds to at most 60px/second². This excludes
directly linked pairs and active grabs, preserving connection lengths and dragging.
Fast pointer jumps are swept through small steps to prevent passing through circles.
Release velocity and its cap remain 20% gentler; stronger follow momentum, slower
elastic settling and heavier photos let connected groups travel more freely. Momentum can
carry a circle farther after automatic release. The enclosing `.section-teams`
sets all four walls and visibility/resize observation; positions and SVG coordinates
remain relative to the header, with visible overflow.
JavaScript draws animated line copies in a single `[team-profile-connector-layer]`
SVG directly inside the header, avoiding the nested group/SVG clipping boxes. It
keeps native source SVGs intact and restores their visibility on desktop cleanup.
The runtime layer has the single base class `team-profile-lines`; no new Designer
combo classes or CSS embeds are added.

The text, button and team list inside `.teams-layout` repel circles. The initializer
bridges their `.text`, `.btn-2-brand` and `.team-list` classes to matching attributes,
scoped to that layout. Each outer content rectangle supplies one gradual outward
force, permitting some overlap instead of snapping circles out. The soft field
uses a -4px gap (full repulsion reached by 10% of each circle's radius), 12px falloff
and 360px/second² maximum acceleration. The size-relative overlap keeps small
white circles responsive to the same content repulsion as photos.
Content rectangles are cached and remeasured on entry, resize, font readiness
or observed content size changes. No native Webflow changes are needed for this behavior.

The three added circles use native `DivBlock` containers with base class
`team-profile-node` and custom `class="team-profile-position-22"` (or 23/24).
The standalone position classes live in Webflow. Their clip remains relative
and circular; each image uses base `img-abs` with custom
`class="team-profile-image is-hidden"`. The WHTML importer's root containers
failed to persist custom attributes, so these containers were built through
the native element builder and their saved attributes were verified.

The section's native markup must be published in Webflow before it can appear on
staging; saving the JS alone does not publish Designer content.

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

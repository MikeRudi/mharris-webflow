# Webflow Notes

- Site name: Imprint Engine
- Webflow link:
- Live link:

## Custom Code

- Head:
- Before `</body>`:
- Page-level code:
- Embeds:

## Classes and Attributes

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

Gradient SVG and CSS live in .home-gradient-embed.
Gradient scroll animation lives in homeAnimation(). The eight SVG pieces form the
bottom gradient, split into a rotating ring, then form and merge into one drop in
the same transition. The orbit runs from `40-48` and rotates by half a turn. Its
group scales from `1` to `0.82` during the first half of the spin, stays at that
size for the remaining spin, and moves upward without scaling back up.
`gradientDropMerge` runs from `53-73`; the side drops fade as all three converge
while the drop group moves down `150px`.
The final drop landing triggers the preserved elliptical ripple animation. The
ripple plays on its own timeline and is not tied to scroll scrub.
The bottom gradient forms the hollow ring in one transition. After the drop
lands, the white line reaches the drop before .home-start opens with a
12-point polygon around an oversized square. Two points sweep in opposite
directions like clock hands. The main timeline reserves 132.4-135 as its final
2% spacer; the star continues its approved rotation through the timeline end.
The line starts at timeline time 73, runs for 17 timeline units, and stops at
the drop at 90. The clip starts from the `lineMeetsDrop` label at 90.
At `lineMeetsDrop`, four blurred circles move through the final-drop mask while
the star scales up, rotates, and settles slightly smaller. The circles enter
from left to right. They start at `x: -40` with yellow and white faint, blue
hidden, and purple visible, then build to full opacity. A purple drop base fades
in from `lineMeetsDrop` at 90. The star is fixed halfway between the line
contact point and the drop centre: it grows from 91-95, rotates continuously
from 91-135, and settles from 103-106. In the current normalized scrub timeline,
the final drop blur sharpens from `22` to `6` over `0.92-1.0` so the blue, white,
yellow, and purple remain more distinct. The masked colour layer retains its
existing blur and palette.
Keep the star artwork centred around its local SVG origin and animate it with
`transformOrigin: "center center"`; `svgOrigin` drifts inside the transformed
drop groups.

`gradientDropletAnimation.final.widthEm` controls the gradient droplet's final
nominal SVG width, currently `6.5em`. With the existing `223 x 315` artwork
space, that is `104 x 146.91px` at a `16px` font size; the painted path has internal
padding. Height follows the artwork proportion without distortion. The
`gradientDropletAnimation.scaleDown` phase runs over scrub time `0.82-0.9`,
after the merge ends at `0.811` and while the horizontal line approaches.
The drop is already at its final size when the masked colours begin at `0.9`,
and its size stays fixed throughout the masked animation. Blur sharpening keeps
its existing `0.92-1.0` timing. The earlier merge stays unchanged. The final
transform is calculated from the SVG's screen scale, maintaining
the existing line-contact point at scene `(720, 330)`. The line, clip pivot,
root SVG sizing, and later `.home-end-target-svg` are unchanged. ScrollTrigger
refresh recalculates only this explicit-from-state resize tween, preserving
scrub progress and reversal without invalidating unrelated animations.

The desktop page-load animation stops Lenis before its entrance stagger starts
and restarts Lenis from the load timeline's `onComplete` callback.

`[home-logo-up]` reveals alongside the first content on page load. Its movement
takes 1.2 seconds and its fade takes 0.6 seconds. The logos stay visible until
scrub time `0.334`, after the first scene's full exit stagger, then move up and
fade out. Scrolling back restores the logos. The initial CSS `opacity: 0`
prevents a flash before the page-load animation starts.

The rotating card sphere caches GSAP quick setters for each card. Do not create
`gsap.set()` tweens inside its frame updates: those completed tweens stay retained
by the desktop matchMedia context. Rotation and smoothing pause when the browser
tab is hidden, `.home-start` is outside the viewport, or the resting cards have
finished fading at scrub time `0.37`. Returning resumes from the retained position.
The observer, visibility listener, and ticker are removed during desktop cleanup.

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

`.layout-end` is a sticky `100vh` layer beneath `.home-start` inside
`.layout-start`. Its spacing is controlled in Webflow, including its current
`35vh` top padding. Do not override that padding in the local CSS: it prevents
Webflow adjustments from taking effect on staging. The heading, copy, and button
follow beneath the bracket group. The group's centre is its top padding plus
half its height; this is separate from the clip's pivot at the gradient line.
The drop stays centred by `.home-end-drop-stage`'s Webflow CSS
`translate(-50%, -50%)`; JavaScript no longer offsets or animates that wrapper.

`.layout-start` is currently `450vh` in Webflow. Its ScrollTrigger drives
`homeScrubTimeline` and ends 12px before the sticky boundary. At the trigger end,
Lenis stops and `homeFinishTimeline` plays at `1 / homeFinishDuration` time scale.
The clip keeps its existing pivot at the gradient line and opens over timeline
time `0-0.36`. `homeClipAnimation.contentBlur` blurs each direct content child
of `.home-start` once, from `0` to `1.5rem` over `0-0.36`: full blur at the end
of the clip. It starts clear, holds the blur for the rest of the finish, and
reverses with the same timeline. The parent clip edge and `.layout-end` stay
unfiltered. Reverse completion and desktop cleanup remove the content filter
so it does not leave a containing block or stacking context behind.
The final drop scales in place from `1` to `0.5` over
`0.1-0.488`. Both brackets close horizontally from `-72px` / `72px` to `0`
over `0.18-0.568`, clipped by their SVG parent. The bracket SVG, heading, copy,
and button fade in over `0.46-0.62`; the drop stays visible.
The larger second ripple is nested in `homeFinishTimeline` at time `0.27`.
Its child time scale is `homeFinishDuration`, preserving real-second timing
under the slowed parent. Its three rings expand to scales `1.1 / 0.8 / 0.5`
over `0.95s`, staggered by `0.09s`, and fade in from zero. Only this final ripple
has a `settle` configuration: from `0.05s`, blue shadows spread and blur to
`2.5rem` over `1.15s`. Use decimal `rgba()` alpha for animated shadow colours:
GSAP 3.15 interpolates percentage alpha incorrectly and snaps at completion.
The rings finish at opacity `0.7` and stay visible as a soft background, with
no repeating animation. End content and bracket artwork stay above the rings
at `z-index: 2`. The earlier gradient ripple still plays independently and fades
away as before. Lenis restarts when the parent finish timeline completes.
Scrolling back reverses the same parent and ripple together, smoothly restoring
the rings' starting scale, zero opacity, and original Webflow filter/shadows.
Direction changes during the finish resume from the current frame. Reverse
completion applies the latest ScrollTrigger progress before returning control
to scrub. The drop has no vertical travel in either direction. After the sticky
sequence, `.layout-end`, brackets, drop, and ripple leave together through normal
page scroll. Desktop cleanup clears settling styles and content stacking order.
```

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

On desktop/tablet, the item and image wrapper animate `flexGrow` between `0` and `1` together over
`0.3s` with `power1.in`. Copy fades over `0.15s`. Interrupted transitions restart
from the current rendered values; initial inline values prevent active-class CSS
from snapping widths before a tween starts. Div items receive keyboard focus,
button semantics, and `aria-expanded`. Cleanup restores authored styles,
classes, and accessibility attributes.

Sizing is native Webflow CSS, recorded in `flex-grow-webflow.css` for reference;
do not load that reference file as another runtime stylesheet. Desktop text
columns are `10em` with `1rem` padding/gaps. The item's non-shrinking basis also
accounts for its padding, internal gap, and two 1px borders. Image wrappers have
zero basis/width, `min-width: 0`, and no forced aspect ratio; the absolute image
fills their available space with the existing `.img-abs` cover styling.
The active image therefore occupies the remaining row width without overflow.
On desktop/tablet, `src/styles.css` anchors only the gallery's `.img-abs` crop
to `right center`. As the panel widens, more artwork reveals toward the left
instead of both sides. This is `object-position`, not `transform-origin`: the
image is not being scaled. Item order, flex sizing, and mobile cropping stay
unchanged.
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

- GSAP:
- ScrollTrigger:
- Lenis:
- Other:

## Known Issues

- None yet.

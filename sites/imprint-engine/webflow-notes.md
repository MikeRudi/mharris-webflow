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
padding. Height follows the artwork proportion without distortion. Only the
final masked state shrinks, over scrub time `0.92-1.0`; the earlier merge stays
unchanged. Its transform is calculated from the SVG's screen scale, maintaining
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
time `0-0.36`. The final drop scales in place from `1` to `0.5` over
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

## Libraries

- GSAP:
- ScrollTrigger:
- Lenis:
- Other:

## Known Issues

- None yet.

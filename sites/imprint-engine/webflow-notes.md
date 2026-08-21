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
the same transition. `gradientDropMerge` runs from 60-80; the side drops fade as
all three converge while the drop group moves down `150px`.
The final drop landing triggers the preserved elliptical ripple animation. The
ripple plays on its own timeline and is not tied to scroll scrub.
The bottom gradient forms the hollow ring in one transition. After the drop
lands, the white line reaches the drop before .home-start opens with a
12-point polygon around an oversized square. Two points sweep in opposite
directions like clock hands. The main timeline reserves 127.4-130 as its final
2% spacer; the star continues its approved rotation through the timeline end.
The line starts at timeline time 80, stops at the drop at 85, and the clip
starts from the `lineMeetsDrop` label at 85.
At `lineMeetsDrop`, four blurred circles move through the final-drop mask while
the star scales up, rotates, and settles slightly smaller. The circles enter
from left to right. They start at `x: -40` with yellow and white faint, blue
hidden, and purple visible, then build to full opacity. A purple drop base fades
in from `lineMeetsDrop` at 85. The star is fixed halfway between the line
contact point and the drop centre: it grows from 86-90, rotates continuously
from 86-120, and settles from 98-101. The final drop blur sharpens from 22 to
16 during this transition.
Keep the star artwork centred around its local SVG origin and animate it with
`transformOrigin: "center center"`; `svgOrigin` drifts inside the transformed
drop groups.

The desktop page-load animation stops Lenis before its entrance stagger starts
and restarts Lenis from the load timeline's `onComplete` callback.

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
`.layout-start`. Its bracket group is aligned with the final gradient-drop
centre, and the single outlined drop is positioned in the centre of that group.
`.layout-start` is `300vh`. Its ScrollTrigger maps the full scroll range only
to timeline time `0-85`, ending exactly at `lineMeetsDrop`. At that trigger end,
Lenis stops and the same `homeTimeline` plays from `lineMeetsDrop` to its end at
`20x` time scale. The second ripple also uses half its previous duration. Lenis
restarts only after the master timeline and the second ripple have both
completed. Crossing the trigger end while scrolling back up stops Lenis again,
reverses the same timeline to `lineMeetsDrop`, then returns control to scrub.
After the clip finishes, `endDropSettle` runs from `108-127.4`:
the outlined drop moves down `8rem` while scaling down, and the brackets close
from an initial `72px` offset on each side, fully clipped by their SVG parent.
The `.layout-end` content starts
`8rem` lower so the drop remains aligned with the gradient drop before this
movement. At `108`, the bracket SVG, heading, copy, and button fade from
`opacity: 0` to `1` over `8` timeline units with `power1.inOut`; the drop stays
visible.
The larger, stronger second ripple then plays on its own non-scrub timeline.
There is no separate `homeEndAnimation()`, duplicate captured drop, content
translation, or drop swap. When the main sticky timeline finishes,
`.layout-end`, the brackets, and the outlined drop leave together through
normal page scroll.
```

## Libraries

- GSAP:
- ScrollTrigger:
- Lenis:
- Other:

## Known Issues

- None yet.

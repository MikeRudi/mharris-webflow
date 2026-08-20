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
bottom gradient, split into a rotating ring, then become three drops that merge.
The final drop landing triggers the preserved elliptical ripple animation. The
ripple plays on its own timeline and is not tied to scroll scrub.
The bottom gradient forms the hollow ring in one transition. After the drop
lands, the white line reaches the drop before .home-start opens with a
12-point polygon around an oversized square. Two points sweep in opposite
directions like clock hands. The reveal finishes at 90%; the final 10% holds.
The line starts at timeline time 80, stops at the drop at 85, and the clip
starts from the `lineMeetsDrop` label at 85.
At `lineMeetsDrop`, four blurred circles move through the final-drop mask while
the star scales up, rotates, and settles slightly smaller. The circles enter
from left to right. The star is anchored where the line meets the drop: it
grows from 86-90, spins from 90-98, then settles from 98-101. The final drop
blur sharpens from 22 to 16 during this transition.
Keep the star artwork centred around its local SVG origin and animate it with
`transformOrigin: "center center"`; `svgOrigin` drifts inside the transformed
drop groups.
```

## Libraries

- GSAP:
- ScrollTrigger:
- Lenis:
- Other:

## Known Issues

- None yet.

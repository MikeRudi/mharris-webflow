# Home animation controls

Edit `homeMotion` near the beginning of `src/script.js` → `homeAnimation()`.
The numbered comment headings follow the animation from the first scene through
the final water rings. Each step has its own `start`, `duration`, and `ease`.

## Scroll distance and percentages

The animation starts when `[layout-start]` reaches the top of the viewport and
finishes when its bottom reaches the bottom of the viewport. Webflow owns the
section height and the two overlapping sticky layers.

`1` means the full scroll distance. `duration: 0.2` means 20% of that distance,
even inside a group. For a `450vh` section and a `100vh` viewport, the available
scroll distance is `350vh`.

The scroll clock always spans exactly `0–1`. It does not rescale the other
animations when a duration changes. Keep the final endpoints at or before `1`;
an overrun produces a console warning and is cut off at the section boundary.

## Start positions and animation trains

A group's numeric `start` is a percentage of the full scroll. A step's numeric
`start` is an offset from its group's start, using the same units. For example,
a group at `0.3` with a step at `0.1` starts that step at 40% of the full scroll.

| Step position | Meaning |
| --- | --- |
| `0` | Start with the group |
| `"enter"` | Start with the named enter step |
| `"enter:end"` | Start after enter finishes |
| `"enter:end+=0.02"` | Start after enter, with a 2% scroll delay |
| `"<"` | Start with the previously added step |
| `">"` | Start after the previously added step |
| `">+=0.02"` | Start after the previous step, with a 2% delay |

Use a specific step name when movement and fading overlap. For example,
`"enter:end"` follows the movement even if the fade is shorter. Stagger is also
measured against the full scroll; it adds time across elements. `:end` includes
that stagger, so the next step waits for the whole step to finish.

To link groups, prefix the step with its group name. The finish group starts at
`"line:end"`; the line starts at `"drop.land:end"`. Changing the landing duration
moves the line and its following finish sequence together.

Example: make the clip take 20% of the scroll. Its content reveal follows the
new endpoint automatically:

```js
finish: {
  start: "line:end",
  clip: { start: 0, duration: 0.2, ease: "power1.in" },
  // Other finish steps remain here.
  content: { start: "clip:end+=0.035", duration: 0.1, ease: "power1.in" },
}
```

## Starting choreography

The opening scene/drop sequence reaches the clip at 52%, leaving 48% for the
finish. Copy transitions overlap the slow background card framing rather than
waiting for it to finish. Most movements use `power1.in`. Card framing, the
gradient orbit and star rotation use `none` for a constant rate. Card fades use
`power1.inOut` to ease smoothly into and out of transparency.

| Group | Initial start | Main behavior |
| --- | --- | --- |
| `firstScene` | 0% | Exit text; card sphere keeps drifting until 30% |
| `cards`, `logos` | 24%; after first exit | Cards fade through 33%; logos leave with the next scene |
| `secondScene` | After first text exit, currently 11% | Enter, hold, then leave |
| `thirdScene` | After second exit, currently 28.5% | Enter and remain until the clip |
| `gradientDots` | 2% | Form the ring, rotate, rise, merge |
| `drop` | When dots start fading | Form, land, then resize the drop |
| `landingRipple`, `line` | After landing, currently 35% | Water ripple and line drawing |
| `dropColours` | After resizing, currently 40.5% | Fill the drop and sharpen it |
| `finish` | After the line, currently 52% | Clip through 70%; drop, brackets and content settle after it |
| `endRipple` | Clip start + 12%, currently 64% | Expand and settle through 97% |

The page entrance uses the separate `homeEntrance` controls in seconds. Idle
card rotation and pointer dragging use `homeCardMotion`: the idle rate is 360
degrees per 48 seconds, with a 45-degree axis. `opacity.back/front/ease` defines
one continuous depth curve for every card, replacing fixed opacity tiers.
`framing` controls the sphere's size and vertical offset. All home scroll
sequences, including both ripples, follow scroll in both directions.

`homeAlignment.endDropOffsetRem` positions the end mark relative to the gradient
line; `-0.75` raises its centre slightly above the line. The surrounding content
moves with it. Alignment is measured on refresh, without moving either sticky
wrapper or changing the section height.

Home Staged has a white-text nav inside the dark hero and a dark-text page nav.
The hero clip reveals the page nav naturally. `navTheme()` keeps the hero's theme
fixed and applies section themes (including the footer) to the page nav.

## Preview and regression checks

Run the unit checks from the repo root:

```sh
node --test sites/imprint-engine/tests/*.test.mjs
```

Preview the published Webflow markup with local source changes:

```sh
node sites/imprint-engine/tests/preview-server.mjs
```

Open `http://127.0.0.1:4173`, then refresh after editing. This local server does
not publish or alter Webflow. `HOME_PREVIEW_HTML` can point to a saved staging
HTML response for repeatable offline-markup tests; linked libraries/assets still
load from their original CDNs.

The browser suite requires Playwright and Chrome:

```sh
node sites/imprint-engine/tests/home-scroll.browser.mjs
node sites/imprint-engine/tests/home-polish.browser.mjs
```

Use `PLAYWRIGHT_MODULE` for a separately installed Playwright module,
`HOME_TEST_CHROME` for a browser executable, and `HOME_TEST_OUTPUT` for reports
and screenshots. The suite checks reverse/jump consistency, fixed percentage
timing, pauses, fast wheel scrolling, sticky boundaries, responsive drop sizing,
breakpoint cleanup, and edits to chained timings. The polish suite additionally
checks card motion/opacity, actual nav hit-testing during the clip, end alignment,
and full-size gallery artwork during desktop and mobile expansion.

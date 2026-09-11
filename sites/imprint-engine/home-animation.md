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
  content: { start: "clip:end+=0.03", duration: 0.048, ease: "power1.in" },
}
```

## Starting choreography

The original scene/drop sequence occupies the first 70%, and the former autoplay
ending now occupies the remaining 30%. These are starting timings for polishing.
Most movements use `power1.in`. The gradient orbit and star rotation use `none`
for constant angular speed; both eases can be changed in their controls.

| Group | Initial start | Main behavior |
| --- | --- | --- |
| `firstScene` | 0% | Exit text and centre the card sphere |
| `cards`, `logos` | 21%; after first exit | Hide cards and logos |
| `secondScene` | 28% | Enter, hold, then leave |
| `thirdScene` | 46.69% | Enter and remain until the clip |
| `gradientDots` | 7.77% | Form the ring, rotate, rise, merge |
| `drop` | When dots start fading | Form, land, then resize the drop |
| `landingRipple`, `line` | After landing, initially 56.77% | Water ripple and line drawing |
| `dropColours` | After resizing, initially 63% | Fill the drop and sharpen it |
| `finish` | After the line, initially 70% | Clip, star, brackets, drop, content |
| `endRipple` | After clip start + 8.1% | Expand and settle the final rings |

The page entrance uses the separate `homeEntrance` controls in seconds. Idle
card rotation and pointer dragging retain their existing behavior. All home
scroll sequences, including both ripples, follow scroll in both directions.

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
```

Use `PLAYWRIGHT_MODULE` for a separately installed Playwright module,
`HOME_TEST_CHROME` for a browser executable, and `HOME_TEST_OUTPUT` for reports
and screenshots. The suite checks reverse/jump consistency, fixed percentage
timing, pauses, fast wheel scrolling, sticky boundaries, responsive drop sizing,
breakpoint cleanup, and edits to chained timings.

# Animation controls

Edit the control object near the top of the function in `src/script.js`.
Keep each feature's movement, timing, opacity and visual values together.

| Function | Controls | Purpose |
| --- | --- | --- |
| `initLenis` | `scrollControls` | Scroll smoothing and wheel sensitivity |
| `homeAnimation` | `homeMotion` | Existing grouped percentage-based scrub; see [home-animation.md](home-animation.md) |
| `homeAnimation` | `homeCardMotion`, `homeAlignment` | Background rotation, depth opacity, framing and end-drop alignment |
| `flexGrowAnimation` | `galleryMotion.grow / copy / mobile` | Item growth revealing full-size images, copy fade, mobile expansion and image ratio |
| `dropTextAnimation` | `rippleControls.trigger / expand / fade / settle` | Scroll entry, ring size, opacity and purple blur |
| `navTheme` | `navControls.start / heroMode / pageMode` | Section theme trigger, fixed hero theme and starting page theme |
| `lineHover` | `lineMotion.enter / leave` | Pointer and keyboard underline timing and direction |
| `filterOne` | `filterMotion` | Hide, container resize and incoming result trains |
| `catalogueAnimation` | `catalogueControls.hide / reveal` | Image exit/entrance timing, vertical movement and scale; reduced motion switches immediately |
| `accordionOne` | `accordionMotion.marker / reveal` | Independent marker movement and panel fade |
| `footerEnginePixels` | `footerMotion` | Reveal size, pixel pattern, glow, opacity and rendering budget |

## Timing

Only the home scrub uses fractions of the full scroll: `duration: 0.2` is 20%.
Hover, click and drop-text animations use seconds: `duration: 0.2` is 200 ms.
Their numeric `start` is relative to the interaction's beginning. A start of zero
begins immediately. Timeline-based groups also accept GSAP positions such as
`">"` and `">+=0.1"`; individual hover states use numeric delays.

Most interaction eases use `power1.in`. The drop-text ripple keeps its existing
outward easing; its expansion, opacity and settling can each be changed independently.

## Filter trains

The filter has three commented stages:

1. Hide the currently visible results. The `switch` label follows this animation.
2. Change the results and resize their container.
3. Start each incoming result at `filterMotion.items.train.start`, staggered by
   `filterMotion.items.train.stagger`. Each result groups its slide, divider,
   word movement and word fade on a local timeline.

For example, `start: "switch+=0.08"` waits 80 ms after the hide finishes.
Inside one result, `words.fade.start: 0.1` delays the word fade by 100 ms.
Rapid selection finishes the previous transition before building the next one,
so old callbacks cannot re-show stale results.

## Gallery image reveal

Only the desktop item's `flexGrow` is animated. Its image pane fills all available
space immediately, so the reveal follows the item's exact curve. Each photo stays
at its fully open width, measured on initialization, font readiness and resize.
Mobile keeps the photo at its fully open height while its parent expands.
`galleryMotion.grow` and `galleryMotion.mobile` therefore control both the item
and its image reveal; there is no separate image zoom or delay.

## Footer responsiveness

The pointer updates coordinates and schedules at most one draw per frame.
There is no pointer-follow tween or perpetual animation loop.
`reveal.duration: 0` and `reveal.start: 0` make entry immediate; `hide` only
controls the fade after leaving.

The SVG lettering remains the source artwork. Cached pixel fields replace
thousands of changing SVG nodes and filters. Preparation is spread across
frames, only when visible. Pointer movement reveals small cached regions.
Increasing `pixels.levels`, `performance.maxPixelRatio` or the cache pixel budget
increases the rendering cost; keep the defaults unless visual testing justifies it.
The pixel budget caps the field caches at approximately 32 MB of RGBA pixel data,
plus the output/scratch canvases and browser overhead.

Offscreen, hidden-tab and reduced-motion states suspend the footer. Leaving the
desktop breakpoint removes its generated layer. A stationary pointer causes no
additional drawing.

## Lifecycle and accessibility

`initSite()` first cleans up any previous initialization. Each feature returns a
cleanup that removes its own events, animations and generated elements and
restores the attributes/styles it owns. Lenis has one ticker and is destroyed last.

The accordion, catalogue and filter support Enter/Space, visible focus and
selected/expanded state. Inactive accordion/catalogue panels are excluded from
keyboard focus. Existing Webflow state classes remain in use.

## Checks

```sh
node --test sites/imprint-engine/tests/*.test.mjs
node sites/imprint-engine/tests/home-scroll.browser.mjs
node sites/imprint-engine/tests/home-polish.browser.mjs
node sites/imprint-engine/tests/site-interactions.browser.mjs
```

Browser checks require Playwright and Chrome. Set `PLAYWRIGHT_MODULE` to an
installed module path if Playwright is outside this repository. They use the
published Home Staged HTML with the current checkout's JS/CSS in a local server.
They do not edit or publish Webflow.

# Animation controls

Edit the control object near the top of the function in `src/script.js`.
Keep each feature's movement, timing, opacity and visual values together.

| Function | Controls | Purpose |
| --- | --- | --- |
| `initLenis` | `scrollControls` | Scroll smoothing and wheel sensitivity |
| `homeAnimation` | `homeMotion` | Existing grouped percentage-based scrub; see [home-animation.md](home-animation.md) |
| `homeAnimation` | `homeCardMotion`, `homeAlignment` | Background rotation, depth opacity, framing and end-drop alignment |
| `teamProfilesAnimation` | `teamMotion.float / drag / throw / links / collision / repel / walls` | Desktop circle drift, connected dragging, content repulsion, collisions and section-wall bounces |
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

## Team circles (v2)

`teamProfilesAnimation()` is called inside `onDesktop()` (992px and wider).
The `teamMotion` controls are at the top of the function:

- `layout.hiddenCircles`: hide photo `02` and its white circles `06/07/08` in the
  desktop animation. Eight photos remain, with two groups of three connections.
- Only circles containing a revealed image accept pointer selection/dragging.
- `hover.clipScale / imageScale`: hovered photos and their connected circles scale
  the clip to `1.15` and the image to `0.95`, over `0.25` seconds with `power1.in`.
  Connected images fade to opacity `1` over `hover.fadeDuration: 0.2` seconds.
  Leaving restores original scales/opacity with the same timing; reduced motion is instant.
- `float.x / y`: drift distance in pixels; `cycleSeconds`: how slowly circles float.
- `float.resumeSeconds`: gentle drift fade-in after grabbing/releasing a circle.
- `float.jointVariation`: independent drift within a connected group (`1`),
  allowing the white circles to move around their photo instead of keeping a rigid pose.
- `drag.velocityMultiplier / maxSpeed`: release strength and maximum px/second;
  `0.68 / 748` makes throws 20% gentler than the previous settings.
- `drag.holdSeconds`: automatically let go after `0.1` seconds,
  even while the mouse button is held and even if the pointer is stationary. Further
  pointer movement is ignored until a new press; the released circle keeps its momentum.
- `drag.followMomentum`: momentum given to outer circles as their joint moves
  (`0.8`). Each circle keeps its own velocity during the grab and after release.
- `drag.sampleMs / releasePauseMs`: recent pointer samples and the pause that cancels a throw.
- `throw.friction`: higher values slow throws sooner; `stopSpeed`: settling threshold.
- `links.elasticity / settleSeconds`: maximum stretch/compression (`0.06`,
  or 6%) and the slower return toward the authored length (`0.65` seconds).
- `links.photoMass`: photos have six times the mass of white circles, so connected
  photos retain more momentum and pull their lighter satellites along.
- `collision.gap / bounce`: clearance between circle outlines (`1`px) and impact
  restitution (`0.45`). Collisions cover circles in every group in the header.
- `spacing.range / strength`: a weaker repulsion within `32`px between outlines,
  up to `60`px/second². It begins after `spacing.delaySeconds: 0.75` nearby,
  then builds over `spacing.rampSeconds: 1.25`. Directly linked circles keep their
  authored distance; other nearby circles gently separate without stretching links.
- `repel.gap`: `-4` allows slight overlap before full force.
  `repel.maxOverlapRatio: 0.1` limits that overlap to 10% of each circle's radius,
  so small white circles still feel the push before disappearing into the content.
  Applies to `.text`, `.btn-2-brand` and `.team-list` inside `.teams-layout`.
  Nested content shares its parent's rectangle; hooks are added at runtime.
- `repel.range / strength`: force fades in over `12`px, up to `360`px/second².
  There is no hard snap out of content. Geometry is cached on entry/resize,
  with content size changes observed; no content layout reads each frame.
- `walls.inset / bounce`: clearance inside `.section-teams` and energy retained
  on rebound. The header is only a fallback if no enclosing team section exists.

Circles connected by lines form a jointed network. Dragging any circle pulls its
connected neighbors; distance constraints preserve each authored link length with
only the small allowed elastic movement. Joints rotate freely, without a hard
angle limit or forced group translation. Circles push each other on contact and
share momentum on impact; connections and walls are solved alongside collisions.
Only the held circle receives the release impulse; its connected circles retain
their own swing. Circles settle around their new position after a throw.

The original SVG endpoints identify connected circles once. Animated copies of the
lines render in one header-sized SVG, outside the smaller group boxes so those
boxes cannot clip a moving connection. Its lines keep their authored colours.
The original SVGs are hidden only during desktop animation and restored on cleanup.
Small physics steps and cached circle geometry avoid per-frame layout measurements.
Fast pointer jumps are swept in small spatial steps to prevent tunnelling through
another circle. Lines remain anchored but do not collide. Content applies a gradual force. The grab timer is cleared on release,
cancellation and cleanup. Circles keep gliding after the timer releases them.
No extra animation library, runtime stylesheet or Webflow embed is required.

The frame loop stops off-screen and while the tab is hidden. Reduced motion keeps
direct dragging but disables drifting and momentum. Leaving desktop or reinitializing
restores native styles and removes the generated connector layer. During refinement,
the user refreshes and tests first; see the project rules. The existing browser suite
captures the earlier 24-circle/1%-elasticity baseline and needs its expectations
updated before a future requested test pass.

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

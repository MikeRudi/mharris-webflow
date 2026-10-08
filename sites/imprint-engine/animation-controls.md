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
| `compareDropAnimation` | `dropMotion.scroll / draw` | Centre-screen drop hold, trailing line and release at the final comparison row |
| `compareGradientAnimation` | `gradientMotion.arrive / reveal / follow / trail / leave / performance` | Invisible arrival, cursor reveal, fading paint trail and parked exit |
| `navTheme` | `navControls.start / heroMode / pageMode` | Section theme trigger, fixed hero theme and starting page theme |
| `lineHover` | `lineMotion.enter / leave` | Pointer and keyboard underline timing and direction |
| `filterOne` | `filterMotion` | Hide, container resize and incoming result trains |
| `catalogueAnimation` | `catalogueControls.hide / reveal` | Image exit/entrance timing, vertical movement and scale; reduced motion switches immediately |
| `accordionOne` | `accordionMotion.marker / reveal` | Marker movement; content switches instantly with reveal duration 0, and grey divider/background shells stay solid |
| `footerEnginePixels` | `footerMotion` | Reveal size, pixel pattern, glow, opacity and rendering budget |

## Timing

Only the home scrub uses fractions of the full scroll: `duration: 0.2` is 20%.
Hover, click and drop-text animations use seconds: `duration: 0.2` is 200 ms.
Their numeric `start` is relative to the interaction's beginning. A start of zero
begins immediately. Timeline-based groups also accept GSAP positions such as
`">"` and `">+=0.1"`; individual hover states use numeric delays.

Most interaction eases use `power1.in`. The drop-text ripple keeps its existing
outward easing; its expansion, opacity and settling can each be changed independently.

## Comparison drop

`dropMotion.scroll.screenPosition: 0.5` holds the drop at the viewport centre.
`startOffset` and `endInset` are pixels measured inside the comparison layout.
The drop's size, colour, glow and line artwork are controlled natively in Webflow.
Keep `scrub: true` and `draw.ease: "none"` for an exact screen hold; smoothing
or easing would let the drop lag behind the scroll. The drop and line share a
normalised timeline (`draw.duration: 1`), not a timed autoplay animation.

The release point updates after responsive/copy/font changes, and all inline
styles and triggers are restored on cleanup. Run `tests/compare-drop.browser.mjs`
for the focused first-build check.

## Comparison gradient

The controls at the top of `compareGradientAnimation()` use seconds and pixels:
- `arrive`: movement duration/ease before the hidden gradient is revealed.
- `reveal`: opacity 1, duration 0.3, ease `power1.in`.
- `follow.responseSeconds`: cursor response; smaller values follow more closely.
- `trail`: layer count per entry, per-layer response, opacity, spread and fade response.
- `leave`: catch-up time of 0.1–0.35s, catch distance, and a 0.3s final fade with
  `power1.out`. Re-entry starts independent layers while the previous exit fades.
- `performance`: settling thresholds and frame-delta cap. The frame loop sleeps
  once the head and trail settle, and stops immediately when hidden/offscreen.

Edit the native `.compare-gradient` class for size, percentage placement, colour
and blur. Runtime trail layers reuse it. Run `tests/compare-gradient.browser.mjs`
for the focused first-build check; the earlier background test no longer expects
the removed `[compare-glow]` behavior.

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
All `teamMotion` controls are at the top of the function, under labelled feature
headings. Distances are pixels, durations are seconds (except names ending `Ms`),
and strengths are acceleration in pixels/second². Advanced solver controls are last.

- `layout.hiddenCircles`: hide photo `02` and its white circles `06/07/08` in the
  desktop animation. Eight photos remain, with two groups of three connections.
- Only circles containing a revealed image accept pointer selection/dragging.
  `layout.photoOpacityThreshold` sets the minimum initial opacity (`0.01`).
- `hover.scaleAmount: 0.15`: hovered photos and their connected circles scale
  the clip up 15% (`1.15`) and the image down 15% (`0.85`). Both share one tween,
  `hover.duration: 0.4` and `hover.ease: "power1.in"`, so their timing stays matched.
  `hover.revealedOpacity: 1`, `hover.fadeDuration: 0.2` and `hover.fadeEase: "power1.in"`
  control the connected image reveal independently of scaling.
  `hover.releaseHoldSeconds: 0.4` keeps the whole hovered group revealed after a
  drag releases, then restores it. `hover.releaseFadeDuration: 1.2` controls the
  connected images' opacity fade after release, with `hover.releaseFadeEase: "power1.out"`;
  normal hover timing stays unchanged.
  Leaving restores original scales/opacity with the same timing; reduced motion is instant.
- `float.x / y`: drift distance in pixels; `cycleSeconds`: how slowly circles float.
- `float.resumeSeconds`: gentle drift fade-in after grabbing/releasing a circle.
- `float.jointVariation`: independent drift within a connected group (`1`),
  allowing the white circles to move around their photo instead of keeping a rigid pose.
- `float.phaseStep / speedVariants / speedVariation / verticalSpeedRatio`: starting
  phase spacing, repeating speed variation and vertical rhythm; previous values retained.
- `drag.velocityMultiplier / maxSpeed`: release strength and maximum px/second;
  `0.68 / 748` makes throws 20% gentler than the previous settings.
- `drag.holdSeconds`: automatically let go after `0.1` seconds,
  even while the mouse button is held and even if the pointer is stationary. Further
  pointer movement is ignored until a new press; the released circle keeps its momentum.
- `drag.followMomentum`: momentum given to outer circles as their joint moves
  (`0.8`). Each circle keeps its own velocity during the grab and after release.
- `drag.sampleMs / releasePauseMs`: recent pointer samples and the pause that cancels a throw.
- `drag.heldWeight`: how much a grabbed circle can yield to contacts (`0.1`).
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
- `physics`: solver/momentum iterations, physics steps per second, maximum frame
  time, spatial step limits, distance/contact tolerances and connector decimal precision.
  These retain their existing values and normally do not need tuning.

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

## Reusable gradient breathing

Add the empty `gradient-breath-1` attribute to any gradient in Webflow.
`gradientBreathOne()` runs from `initSite()` on desktop and mobile, using the
same slow drift/scale as the FAQ glows. Edit `gradientMotion` at its top:

- `breath.scale`: largest scale (1.08).
- `breath.duration`: seconds for each inhale or exhale (14; full cycle 28).
- `breath.ease`: smoothing (`sine.inOut`).
- `breath.repeatDelay`: pause between directions (0 seconds).
- `drift.xPercent` / `yPercent`: movement as percentages of the gradient's size (4 / 3).
- `drift.alternateDirection`: alternate movement direction between gradients (true).
- `visibility.rootMargin`: distance outside the viewport at which it can run (`300px 0px`).

Webflow controls the resting position, size, colour and blur. The animation
pauses outside its visibility margin and in hidden tabs, and stays static when
reduced motion is requested. A focused initial lifecycle check lives in
`tests/gradient-breath.browser.mjs`.

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

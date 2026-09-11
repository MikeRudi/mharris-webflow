# Performance and accessibility review — 2026-09-11

Audited the published [Home Staged](https://imprint-engine-v1.webflow.io/home-staged)
page with Lighthouse 13.4.1 and installed Chrome. The user’s 64/88 result was a
desktop run. This environment initially measured 91/88, so compare the matched
before/after runs below rather than claiming a 64-point-baseline improvement.

| Test | Before | After |
| --- | ---: | ---: |
| Desktop performance | 91 | 96 |
| Desktop accessibility | 88 | 100 |
| Desktop LCP | 1.9 s | 1.3 s |
| Mobile performance | 67 | 78 |
| Mobile accessibility | 88 | 100 |
| Mobile LCP | 8.5 s | 4.5 s |

Desktop used 1350×940, standard desktop simulated throttling (40 ms RTT,
10,240 Kbps, 1× CPU). Mobile used Lighthouse defaults. Runs used fresh browser
profiles and were performed serially, without concurrent animation benchmarks.

The first run immediately after publication scored 66/100: the document response
took 1,567 ms versus 19 ms before, and newly published GitHub files took 857–1,342
ms to arrive. The subsequent fresh-profile run scored 96/100. This illustrates
staging/CDN variability; the scores are observations, not guarantees.

## Footer

Matched desktop pointer sweeps at 1440×900 and 4× CPU slowdown:

| Frame interval | Before | After |
| --- | ---: | ---: |
| Median | 339.2 ms | 13.5 ms |
| 95th percentile | 352.5 ms | 17.2 ms |
| Maximum | 390.7 ms | 19.6 ms |

The old SVG implementation continually changed many pixel elements and filters.
The new canvas overlay reveals cached pixel fields while retaining the original
letter paths and glow treatment. Pointer bursts coalesce to one draw, with no
cursor tween. Idle/offscreen work is zero. Cache preparation is spread over
frames; the final 4× CPU entry test recorded no task longer than 50 ms. The
overlay suspends for hidden tabs/reduced motion and is removed on mobile.

## Delivered changes

- Grouped controls for the gallery, drop-text ripple, navigation, underlines,
  filter trains, catalogue, accordion and footer; see `animation-controls.md`.
- Cleanup for events, generated UI, GSAP animations, ScrollTriggers and Lenis.
- Keyboard activation, visible focus, selection/expansion states and inactive
  panel focus exclusion.
- Accessible social link names; better accordion/button/footer legal contrast.
- English fallback in head code when native HTML has no language. Existing
  locale declarations take precedence.
- Ten WebP files replace thirteen card image instances: 968,587 → 113,258 bytes
  (88.3% reduction), preserving dimensions, transparency and authored alt text.
- Custom CSS/JS fetch together from the same GitHub commit; libraries defer and
  site startup waits for their execution. Existing typography styles remain.

## Verification and remaining work

- 26 unit tests, 16 home scroll browser checks and 14 interaction/lifecycle checks.
- Home animation implementation remained byte-identical after line-ending normalization.
- Published Home Staged, Landing Staged and Home loaded the new GitHub commit
  without runtime exceptions; image loading and footer behavior were verified.
- Automated WCAG A/AA scans passed at the initial and footer scroll positions.
  A score of 100 is automated coverage, not complete accessibility conformance.
- Mobile performance improved but is still below 90. Lighthouse flags Webflow’s
  generated CSS, jQuery and Webflow runtime as its remaining render blockers
  (estimated 1.85 s); reducing those needs a separate platform-loading pass.
- The three social destinations remain `#`; actual URLs were not supplied.
- Native Webflow locale configuration would make the language declaration
  available with JavaScript disabled as well.

Detailed HTML/JSON reports and screenshots are stored in the task’s artifact
directory under `lighthouse-before-*`, `lighthouse-after-*`,
`published-cleanup-checks.json`, and `footer-*-frames.json`.

# Home Staged reference styling

Reference: the user's 1440 × 8369 `homepage-content.png` export of Figma frame
7396:26887. The opening home animation is outside this design pass.

## Native Webflow ownership

All new layout, typography, gradients, borders and responsive styling live in
native Webflow classes. No CSS embed or runtime stylesheet was added for this
pass. `src/styles.css` is unchanged. Publish Webflow after editing these styles.

- Support: `ac-1-wrap`, `ac-1-list`, `ac-1-content`, `home-support-copy`.
- Catalogue: `cat-select.active` owns the gradient outline; `home-catalogue-text`
  owns the lighter, larger pill lettering.
- Audience: `tiles-dna-split`, `tile-dna-title`, `home-audience-heading`,
  `home-audience-copy`, and `home-audience-card` on each existing `tiles-item.is-*`
  combo. The three placeholder images are hidden natively; gray image surfaces
  match the supplied export. Existing desktop card staggering is retained.
- Comparison: `compare-section`, `compare-layout`, `compare-heading-row`,
  `compare-row`, `compare-title`, `compare-text`, `compare-glow`, `compare-logo`.
  The logo reuses the existing native navigation SVG with a unique clip ID.
- Process: `flex-grow-title` and `flex-grow-item` own the purple/cyan border
  treatment. Existing gallery expansion and image animation are retained.
- Testimonial: `testimonial-section`, `testimonial-envelope`, the envelope/card
  classes and native gradient/clip settings recreate the supplied composition.
- FAQ: `home-faq-section`, `home-faq-heading`, `home-faq-list`, `home-faq-item`,
  `home-faq-button`, `home-faq-panel`, `home-faq-answer`.

The FAQ instance was unlinked on Home Staged so its redesign does not replace
the shared filter component elsewhere. Its old filter attributes and hover CSS
were removed; unused category tabs, extra placeholder rows and load-more are
hidden natively. The five visible question labels follow the PNG. Answer copy
was drafted from existing homepage information because the export only shows
closed questions; it is not transcribed Figma answer copy.

## FAQ behavior

### Decorative backgrounds

`homeBackgroundMotion()` controls the DNA ribbon: 18 seconds, 5%/2% movement
and 1.5 degrees of sway. The FAQ uses the same `[gradient-breath-1]` hook and
`gradientBreathOne()` controls as the team gradients. Both use `sine.inOut`
so the repeated direction change is smooth.
Animations pause outside the viewport (300px breathing margin) and in hidden
tabs. Reduced motion leaves the authored artwork static. Cleanup restores styles.

In v2, the old `[home-faq-glows]` wrapper and its two radial backgrounds are
replaced by native `.faq-gradient-1` and `.faq-gradient-2` divs directly inside
`.home-faq-section`. They copy the team gradients' `15.4em` by `22.4em` size,
`5.5vw` blur, rounded shape and percentage positions, using purple `#AB56F2`.
They sit behind `.home-faq-layout`, ignore pointer events, and can extend
beyond the section. The old FAQ-specific breathing branch was removed.
`[home-dna-ribbon]` uses the original lined PNG at 180% width, with native opacity
and a soft vertical mask. The native `.cat-select:hover` matches `.active`.
The v2 comparison now uses native `[compare-gradient]` and the separate
`compareGradientAnimation()` function. It arrives invisibly, reveals, follows
the cursor with a fading trail, then parks and fades at the exit point. The old
`[compare-glow]` element/cursor branch was removed. Sizing, gradients and hover
styles live in Webflow.

Run `tests/home-backgrounds.browser.mjs` for motion, cursor, hover, responsive
overflow, reduced-motion and cleanup checks (from this site's directory).

Keep `[home-faq]` on the section and `[home-faq-item]`, `[home-faq-button]`,
`[home-faq-panel]` on each question and answer pair. `homeFaqAnimation()` owns
only opening/closing, keyboard activation and accessible expanded/hidden state.
`faqMotion.toggle` controls seconds and ease (0.3, `power1.in`). One panel opens
at a time; rapid selections interrupt from the current height. Reduced motion
settles immediately. Scroll positions refresh once when the transition ends.
The initializer returns a cleanup and restores authored attributes.

## Remaining source dependencies

- The process photograph visible in Figma is absent from the available site
  assets; the existing placeholder remains until the original is supplied.
- The v2 envelope now uses the supplied paper-texture assets and an interactive
  closed/open/hover stack. Text remains editable native `.text` blocks. John and
  Emily's cards still contain only the original name/company copy; their full
  quotes were not present in the component and have not been invented.
- The Wall of Love destination is not present among the site's pages. Its
  reference label is static until a real destination is supplied.
- Existing social and other placeholder links remain to be completed.

## Verification

`node sites/imprint-engine/tests/homepage-design.browser.mjs` checks staging
markup with this checkout's code at 1440, 768 and 390px: section overflow, five
FAQ questions, Enter/Space activation, rapid selection, reduced motion and
initialization/cleanup. Set `HOME_TEST_OUTPUT` for screenshots and a JSON report.
Existing home scroll, polish and interaction suites cover downstream animation,
navigation themes, gallery sizing and footer behavior. This is not a new
Lighthouse score measurement.

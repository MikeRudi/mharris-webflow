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
- The envelope is a native geometric approximation. Exact paper texture,
  typography/logos and complete testimonial text require the source artwork.
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

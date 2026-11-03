# Accordion 02 image galleries

The existing Accordion 02 component (`91442d9d-cdb8-69e8-eb7f-ced0eac42c05`)
has five categories. The first row is Apparel, Custom, Print. Existing prop IDs
and groups remain intact: Item 1 Apparel, Item 2 Print, Item 3 Merchandise & Kits,
Item 4 Events & Signage, Item 5 Custom.

Each item exposes its original `Image` prop followed by `Image 2` through
`Image 12`. Custom starts with the Apparel set and has independent props.
The 48 Figma slots share 37 unique PNG assets. Sources and the upload manifest
are saved under `C:/Users/miker/OneDrive/Desktop/Imprint Engine/Figma exports/Accordion 02 - 2026-11-03/`.

The component root has `[cat-catalogue]`; controls use `[cat-select]`.
Every image owns a `[cat-reveal]` panel with a category value and zero-based
`[cat-image-index]`. Inside is a relative `cat-image-frame` div, explicit width,
square aspect ratio and no fixed height, with an `img-abs` image. The standalone
`cat-product-image` class contains the transparent artwork without cropping it.

`catalogueAnimation()` remembers each category's position independently.
The first click on a new category shows its first image; subsequent clicks,
including returning from another category, advance and wrap after image 12.
The incoming image decodes before transition. Rapid clicks keep the latest
requested image. Only the first choices and next active image are prefetched
when the component approaches the viewport.

Controls are at the top of that function, in seconds:

| Step | Start | Duration | Ease | Movement | Scale | Opacity |
| --- | --- | --- | --- | --- | --- | --- |
| Hide | 0 | 0.2 | power1.in | 0 to -2rem | unchanged | 1 to 0 |
| Reveal | 0.1 | 0.3 | power1.in | 2rem to 0 | 0.9 to 1 | 0 to 1 |

The complete overlap lasts 0.4 seconds. Incoming z-index is 2, outgoing is 1.
Reduced motion switches instantly. Controls support click, Enter and Space;
each component instance keeps independent state and restores its attributes on cleanup.

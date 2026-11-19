# IEX Feature Comparison — 19 November 2026

Site: Imprint Engine_PROD / imprint-engine-v2 (`6abbde0cb7e6f39d52509b6c`).
Page: `/product/plans-pricing` (`6ace1d82727eb32bbd627b6f`).
Component: IEX Feature Comparison (`364b0ac4-df23-e032-0c72-3f2307f41da2`).
Collection: IEX Pricing Tables (`6afec116b0e4107807152c0b`).

## Content

The native Collection List is sorted by Display Order ascending, with pagination
and item limiting off. It contains the 65 source rows:

| Filter | Table Category | Rows | Display Order |
| --- | --- | ---: | --- |
| support | Service & Support | 14 | 101–114 |
| infrastructure | Infrastructure | 9 | 201–209 |
| technology | Technology | 25 | 301–325 |
| stores | IEX Stores (Add-On) | 17 | 401–417 |

Edit names, descriptions, plan values, links and ordering in the CMS, then
publish. Keep Table Category equal to one of the four values above. Plan values
are plain text, including ✓, — and descriptive values. Stores only uses Plans
1 and 2. Plan 3 and 4 cells are hidden for Stores rows.

The main header preserves the existing component props and page overrides:
Free / Starter / Growth / Partnership. The old source called these Free /
Express / Pro / Enterprise; the imported values retain their column positions.
Stores has two bound text-content props in the Stores group: Plan 1 = Basic,
Plan 2 = Advanced. Existing component identity and prop definitions remain.

Source: https://imprintengine.com/platform/#pricing-form
Audit: `reference-data/iex-pricing-tables-2026-11-19.json`.
Source modal copy is retained in Feature Details, without adding unrequested
popups. Feature Description is an optional short description under the name.
The source Gmail/Outlook modal pointed to unrelated brand-manager copy; that
incorrect modal content was excluded and recorded in the audit.

## Native bindings and behavior

- `final-feature-cms` → native Collection List Wrapper, IEX Pricing Tables.
- `final-feature-category` on Collection Item → Table Category.
- `final-feature-name` Text Block → Name.
- `final-feature-description` Text Block → Feature Description.
- `final-feature-value="1"` through `"4"` Text Blocks → Plan 1–4 Value.
- Plan 2–4 Text Blocks' `final-feature-link` → matching Plan Link fields.
  These provide the three warehouse-pricing links present in the source.
- `final-feature-head="stores"` identifies the alternate two-column header;
  the original empty-valued hook identifies the main four-column header.
- `final-feature-stores-row` defines the two-column layout natively.
- Header, row, typography, spacing, backgrounds and orange hover colours are
  native Webflow styles. Custom CSS only enforces the behavioral hidden state.
- JavaScript filters CMS items, switches headers, moves the underline, highlights
  the hovered plan, creates optional anchors from CMS URLs and synchronizes
  the sticky header with horizontal table scrolling. Cleanup restores states.

## Validation

The staged CMS import was checked field-for-field against the saved source.
Published HTML contains all 65 rows in source order. Desktop (1440), tablet
(768) and phone (390) checks cover every row name/value, all four category
counts, both header layouts, cell alignment, warehouse links, desktop orange
hover, horizontal header synchronization and no horizontal page overflow.
No page JavaScript errors occurred in these checks.

Implementation is awaiting Michael's review; no tracker approval flags changed.

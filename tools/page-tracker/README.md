# Michael's Webdev Tracker

Local page checklist for Imprint Engine and future projects.

Run from the repository root:

```powershell
node tools/page-tracker/server.mjs
```

Open http://127.0.0.1:4318. Keep the terminal running while using it.
Changes save automatically to data/<project-id>.json. New project creates a separate list.
Use the page name to edit details; group names can be changed in the page dialog.
Use **To-do list** beside **Add page** to check off tasks or add/remove items.
Use **Typography** beside **Add page** for the project's saved class sizes, line
heights, letter spacing and font weights. Imprint Engine's values were imported
from its saved desktop typography text file and live in the project JSON's
`typography` field. Heading sizes use a 1440px viewport and 16px root reference.
Each page has seven independent checkboxes: **Design ready**, **Developing in Webflow**,
**Desktop**, **Mobile**, **Awaiting content**, **Client’s hands**, and **Complete**. They appear
in the table and page dialog and save automatically in the project JSON. The filter
checkboxes show pages matching every selected checkbox. Seven compact totals at
the top count checked items in the page groups, excluding Removed entries.
Navigation, CMS collections and References sit under **Other groups** in the
sidebar. They remain editable there but are excluded from All groups and its totals.
Only Michael's explicit final confirmation authorizes checking Complete, Desktop or Mobile.
Implementation, testing and publishing alone do not count as approval.
The checkbox fields are `designReady`, `workingInWebflow`, `desktop`, `mobile`,
`awaitingContent`, `clientsHands`, and `complete`. These are the current workflow values;
the old `status` and `webflow` fields remain as historical metadata, including
Removed entries. Do not use the old status fields for new updates.
`workflow.mjs` carries existing saved designs, Webflow presence and approvals into
the checkboxes on load without overwriting explicit checkbox values. Desktop and
Client’s hands start unchecked. The new values persist with the next local save.
Imprint Engine's eight desktop to-dos were imported on 13 October 2026, initially unchecked,
along with unchecked Mobile controls for every existing tracker entry.
The plain-text snapshot is imprint-page-list.txt; it is not automatically regenerated after edits.

The initial Imprint list is a working inventory. Only Homepage is approved complete.
Resources, Customers and Pages Product names were supplied by Michael on 13 October 2026.
The reference Webflow API snapshot is preserved in data/reference/.
This tool does not modify or publish Webflow.

## View-only Vercel site

Live URL: https://imprint-engine-tracker.vercel.app/
Vercel project: `imprint-engine-tracker` (`prj_zPB8ACLEsqDCAW7bn5Z6uB4QTBRy`).
Connected repository: `MikeRudi/mharris-webflow`, production branch `main`.

The `public/` folder is a static snapshot for colleagues. It includes page groups,
search, checklist filtering, seven disabled status checkboxes,
staging links and full-resolution, lossless design previews. It has no editing API,
project creation, to-do list, typography editor or Add page controls.

Local editing remains at `http://127.0.0.1:4318`.
To update the online snapshot, install this folder's dependencies once, then run
`npm run export` from this folder and commit/push `public/` together with any UI changes.
The export reads `data/imprint-engine.json` and the local Figma export folder.
Set `TRACKER_EXPORTS_ROOT` if that folder moves. `TRACKER_SHARP_PATH` may point to
an existing Sharp installation instead of installing dependencies locally.

Vercel settings: existing GitHub repository, root directory
`tools/page-tracker/public`, framework Other, no build command, output directory `.`.
Do not deploy the local server or the complete `data/` folder. Each deployment is a
snapshot; local status edits reach colleagues after exporting and pushing again.

Figma's Design > Dev page is the current design inventory. Entries marked Removed
remain in the list but are excluded from the progress totals. CMS collections are
listed separately and do not count toward page totals.
View design opens a locally saved PNG. Files are organised by group and page under:

`C:/Users/miker/OneDrive/Desktop/Imprint Engine/Figma exports/`

Each page folder contains `design.png`, original files in `images/`, SVG files in
`svg/`, and a `manifest.json` identifying its Figma source and exported files.

All 71 design previews are saved. Michael stopped the bulk asset export after
1,685 images and 3,412 SVGs had been saved across the page folders; the asset set
is partial. The stopping point is recorded in `data/reference/export-status.json`
and `data/reference/pending-exports.json` for a later refinement of the process.

# Michael's Webdev Tracker

Local page checklist for Imprint Engine and future projects.

Run from the repository root:

```powershell
node tools/page-tracker/server.mjs
```

Open http://127.0.0.1:4318. Keep the terminal running while using it.
The local tracker opens Imprint Engine directly; project switching and creation
controls are temporarily removed. Changes save automatically to data/imprint-engine.json.
Use the page name to edit details; group names can be changed in the page dialog.
Use **To-do list** beside **Add page** to check off tasks or add/remove items.
Use **Typography** beside **Add page** for the project's saved class sizes, line
heights, letter spacing and font weights. Imprint Engine's values were imported
from its saved desktop typography text file and live in the project JSON's
`typography` field. Heading sizes use a 1440px viewport and 16px root reference.
Each page has four independent checkboxes: **Desktop**, **Mobile**, **Missing content**,
and **Complete**. They appear in the table and page dialog and save automatically
in the project JSON. Design previews and staging links remain beside them.
All page groups appear in one full-width list, without a sidebar, filters or totals.
Navigation, CMS collections and References and their records were removed from
the local Imprint Engine tracker on 24 November 2026.
Only Michael's explicit final confirmation authorizes checking Complete, Desktop or Mobile.
Implementation, testing and publishing alone do not count as approval.
The checkbox fields are `desktop`, `mobile`, `missingContent`, and `complete`.
These are the current workflow values;
the old `status` and `webflow` fields remain as historical metadata, including
Removed entries. Do not use the old status fields for new updates.
`workflow.mjs` migrates Awaiting content to Missing content and Client’s hands to
Complete, preserving existing Complete approvals. It removes the obsolete checkbox
fields. Schema version 3 prevents older browser windows from saving the old format.
Imprint Engine's eight desktop to-dos were imported on 13 October 2026, initially unchecked,
along with unchecked Mobile controls for every existing tracker entry.
The plain-text snapshot is imprint-page-list.txt; it is not automatically regenerated after edits.

The initial Imprint list is a working inventory. Only Homepage is approved complete.
Resources, Customers and Pages Product names were supplied by Michael on 13 October 2026.
The reference Webflow API snapshot is preserved in data/reference/.
This tool does not modify or publish Webflow.

## Shared Vercel checklist

Live URL: https://imprint-engine-tracker.vercel.app/
Vercel project: `imprint-engine-tracker` (`prj_zPB8ACLEsqDCAW7bn5Z6uB4QTBRy`).
Connected repository: `MikeRudi/mharris-webflow`, production branch `main`.

The `public/` folder contains the shared tracker. Anyone with its link can change
Desktop, Mobile, Missing content and Complete. Each click saves one checkbox
through `/api/checklist` into a private Vercel Blob store. Other open trackers
refresh every 15 seconds and when brought back into focus. Failed saves show an
error and revert the optimistic checkbox; no browser-only save is treated as shared.
Page names, groups, links and design previews still come from the exported snapshot.
Public visitors cannot edit those details or access the local to-do list.

Local editing remains at `http://127.0.0.1:4318`.
To update the online snapshot, install this folder's dependencies once, then run
`npm run export` from this folder and commit/push `public/` together with any UI changes.
The export reads `data/imprint-engine.json` and the local Figma export folder.
Set `TRACKER_EXPORTS_ROOT` if that folder moves. `TRACKER_SHARP_PATH` may point to
an existing Sharp installation instead of installing dependencies locally.

Vercel settings: existing GitHub repository, root directory
`tools/page-tracker/public`, framework Other, no build command, output directory `.`.
Do not deploy the local server or the complete `data/` folder. The public folder's
package.json installs the Blob SDK for the Vercel Function. The connected private
store is `imprint-engine-tracker-checklist` (`store_aLB0G41Sp9k4AW4c`); its
`BLOB_READ_WRITE_TOKEN` belongs only in Vercel environment variables.

The first live request seeds shared checkboxes from project.json. Later exports
add new pages without replacing existing shared checkbox values. Local editing
continues to save the separate local JSON; it does not sync checkbox edits to or
from the live tracker. Use the live URL for the shared checklist.
Conditional Blob writes merge concurrent edits without losing other checkboxes.
Preview deployments use a separate state document, protecting production values.
Run `node --test tools/page-tracker/checklist.test.mjs` from the repository root
after installing dependencies in `tools/page-tracker/public` to verify persistence.

Figma's Design > Dev page is the current design inventory. Entries marked Removed
remain in the page list as historical records.
View design opens a locally saved PNG. Files are organised by group and page under:

`C:/Users/miker/OneDrive/Desktop/Imprint Engine/Figma exports/`

Each page folder contains `design.png`, original files in `images/`, SVG files in
`svg/`, and a `manifest.json` identifying its Figma source and exported files.

All 71 design previews are saved. Michael stopped the bulk asset export after
1,685 images and 3,412 SVGs had been saved across the page folders; the asset set
is partial. The stopping point is recorded in `data/reference/export-status.json`
and `data/reference/pending-exports.json` for a later refinement of the process.

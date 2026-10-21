import { readFile, writeFile } from "node:fs/promises";

// Webflow only offers a 991px tablet breakpoint. Extend its native styles,
// rather than maintaining a separate hand-styled layout for 1024px tablets.
const site = "https://imprint-engine-v2.webflow.io/";
const file = new URL("./src/styles.css", import.meta.url);
const startMarker = "/* BEGIN NATIVE TABLET EXTENSION";
const endMarker = "/* END NATIVE TABLET EXTENSION */";
async function get(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}
const html = await get(site);
const href = html.match(/href="([^"]+\/css\/[^"<>]+\.css)"/)?.[1];
if (!href) throw new Error("Published Webflow stylesheet was not found.");
const native = await get(href);
const blocks = [];
const media = /@media[^{}]*\(max-width:\s*991px\)[^{}]*\{/g;
for (const match of native.matchAll(media)) {
  const start = match.index + match[0].length;
  let depth = 1, quote = "", end = start;
  for (; end < native.length && depth; end++) {
    const char = native[end];
    if (quote) {
      if (char === "\\") end++;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "/" && native[end + 1] === "*") {
      const closing = native.indexOf("*/", end + 2);
      if (closing < 0) throw new Error("Unclosed CSS comment.");
      end = closing + 1;
    } else if (char === "{") depth++;
    else if (char === "}") depth--;
  }
  if (depth) throw new Error("Incomplete published tablet styles.");
  blocks.push(native.slice(start, end - 1).trim());
}
if (!blocks.length) throw new Error("Native tablet rules were not found; file unchanged.");
let source = await readFile(file, "utf8");
if (source.startsWith(startMarker)) {
  const end = source.indexOf(endMarker);
  if (end < 0) throw new Error("Existing extension is incomplete; file unchanged.");
  source = source.slice(end + endMarker.length).trimStart();
}
const header = `${startMarker}
   Generated from published native Webflow tablet styles. Do not edit this block.
   After publishing tablet changes: node sites/imprint-engine/sync-tablet-styles.mjs */
@media screen and (min-width: 992px) and (max-width: 1199px) {
${blocks.join("\n")}
}
${endMarker}\n\n`;
await writeFile(file, header + source);
console.log(`Extended ${blocks.length} native tablet block(s) through 1199px.`);

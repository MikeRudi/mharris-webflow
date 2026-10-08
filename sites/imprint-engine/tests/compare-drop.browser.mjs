import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");
const animation = source.slice(source.indexOf("function compareDropAnimation()"), source.indexOf("function homeBackgroundMotion()"));
const restore = source.slice(source.indexOf("function rememberAttributes("), source.indexOf("function uniqueElementId("));
const libraries = await Promise.all([
  "https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js",
].map(async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  assert.ok(response.ok, `Could not load ${url}`);
  return response.text();
}));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setContent(`<style>
    body{margin:0;font-size:16px}.spacer{height:1200px}
    [compare-section]{padding:80px 48px 48px}.layout{position:relative}
    header{height:100px}[compare-row]{height:180px}
    [compare-drop-track]{position:absolute;left:50%;top:0;bottom:0;width:0;pointer-events:none}
    [compare-drop]{position:absolute;left:-.21875em;top:0;width:.4375em;height:1.5625em;background:#b26bff;border-radius:50%;filter:blur(1px)}
    [compare-drop-line]{position:absolute;left:-.5px;top:.78125em;width:1px;height:0;transform-origin:50% 0%;background:#b26bff}
  </style><div class="spacer"></div><div compare-section><div class="layout">
    <header>Other vendors / Imprint Engine</header>
    <div compare-row>One</div><div compare-row>Two</div><div compare-row>Three</div>
    <div compare-drop-track aria-hidden="true"><div compare-drop-line></div><div compare-drop></div></div>
  </div></div><div class="spacer"></div>`);
  for (const content of libraries) await page.addScriptTag({ content });
  const heightBefore = await page.evaluate(() => document.body.scrollHeight);
  await page.addScriptTag({ content: `${restore}\n${animation}\nwindow.stopDrop=compareDropAnimation();` });
  await page.waitForFunction(() => ScrollTrigger.getById("compare-drop-1")?.end > ScrollTrigger.getById("compare-drop-1")?.start);
  const bounds = () => page.evaluate(() => {
    const t = ScrollTrigger.getById("compare-drop-1");
    return { start: t.start, end: t.end };
  });
  const state = () => page.evaluate(() => {
    const drop = document.querySelector("[compare-drop]").getBoundingClientRect();
    const line = document.querySelector("[compare-drop-line]").getBoundingClientRect();
    const track = document.querySelector("[compare-drop-track]").getBoundingClientRect();
    const rows = document.querySelectorAll("[compare-row]");
    return { center: (drop.top + drop.bottom) / 2, bottom: drop.bottom,
      x: drop.left + drop.width / 2, lineEnd: line.bottom, lineLength: line.height,
      travel: gsap.getProperty(document.querySelector("[compare-drop]"), "y"),
      lastBottom: rows[rows.length - 1].getBoundingClientRect().bottom, trackTop: track.top,
      viewportMiddle: innerHeight / 2, height: document.body.scrollHeight,
      spacers: document.querySelectorAll(".pin-spacer").length };
  });
  const scroll = async y => {
    await page.evaluate(y => { scrollTo(0, y); ScrollTrigger.update(); }, y);
    await page.waitForTimeout(40);
  };
  const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) <= 1.1, `${label}: ${actual} vs ${expected}`);
  let { start, end } = await bounds();
  await scroll(start - 80);
  near((await state()).travel, 0, "Drop rests at its authored top before pinning");
  near((await state()).lineLength, 0, "Line is hidden before pinning");
  // Include fast jumps and reverse movement through the same scroll range.
  for (const progress of [0.1, 0.8, 0.3, 1, 0.5]) {
    await scroll(start + (end - start) * progress);
    const s = await state();
    near(s.center, s.viewportMiddle, "Drop holds screen centre");
    near(s.lineEnd, s.center, "Trailing line remains attached to drop");
    near(s.lineLength, (end - start) * progress, "Line follows scroll progress");
    assert.equal(s.height, heightBefore, "No layout shift or spacer padding");
    assert.equal(s.spacers, 0);
  }
  await scroll(end + 100);
  let s = await state();
  near(s.bottom, s.lastBottom, "Drop releases exactly at the last row bottom");
  near(s.center, s.viewportMiddle - 100, "Released drop leaves with the section");
  await page.setViewportSize({ width: 768, height: 900 });
  await page.evaluate(() => ScrollTrigger.refresh());
  ({ start, end } = await bounds());
  await scroll((start + end) / 2);
  s = await state();
  near(s.center, 450, "Resize updates screen centre");
  await page.evaluate(() => { const rows = document.querySelectorAll("[compare-row]"); rows[rows.length - 1].style.height = "280px"; });
  await page.waitForFunction(() => {
    const rows = document.querySelectorAll("[compare-row]");
    const expected = rows[rows.length - 1].getBoundingClientRect().bottom + scrollY
      - innerHeight / 2 - document.querySelector("[compare-drop]").offsetHeight / 2;
    return Math.abs(ScrollTrigger.getById("compare-drop-1").end - expected) < 1.1;
  }, null, { timeout: 3000 });
  ({ start, end } = await bounds());
  await scroll(end);
  s = await state();
  near(s.bottom, s.lastBottom, "Content resizing updates the release boundary");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => !ScrollTrigger.getById("compare-drop-1"));
  near((await state()).lineLength, 0, "Reduced motion uses the native static artwork");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => Boolean(ScrollTrigger.getById("compare-drop-1")));
  await page.evaluate(() => stopDrop());
  assert.equal(await page.evaluate(() => ScrollTrigger.getAll().filter(t => t.vars.id?.startsWith("compare-drop-")).length), 0);
  const restored = await page.evaluate(() => [...document.querySelectorAll("[compare-drop], [compare-drop-line]")].map(e => ({ class: e.outerHTML, style: e.style.cssText })));
  assert.ok(restored.every(e => !e.style), `Cleanup restores authored styles: ${JSON.stringify(restored)}`);
  assert.deepEqual(errors, []);
  console.log("PASS comparison drop: centre hold, attached trail, fast/reverse scroll, exact release, resize, reduced motion and cleanup");
} finally {
  await browser.close();
}

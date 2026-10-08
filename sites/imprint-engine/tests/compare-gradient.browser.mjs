import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");
const animation = source.slice(source.indexOf("function compareGradientAnimation()"), source.indexOf("function homeBackgroundMotion()"));
const restore = source.slice(source.indexOf("function rememberAttributes("), source.indexOf("function uniqueElementId("));
const libraries = await Promise.all([
  "https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js",
].map(async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  assert.ok(response.ok); return response.text();
}));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setContent(`<style>
    body{margin:0;background:#f3f4f8;font-size:16px}
    [compare-section]{position:relative;margin:100px;width:1000px;height:600px}
    .compare-gradient{position:absolute;left:58%;top:20%;width:22em;height:26em;border-radius:50%;
      background:rgba(1,163,183,.55);filter:blur(5.5vw);opacity:0;pointer-events:none;transform:none;z-index:0}
  </style><div compare-section><div class="compare-gradient" compare-gradient aria-hidden="true"></div></div>`);
  for (const content of libraries) await page.addScriptTag({ content });
  await page.addScriptTag({ content: `${restore}\n${animation}\nwindow.stopGradient=compareGradientAnimation();` });
  const fire = (type, x, y) => page.evaluate(({ type, x, y }) => {
    document.querySelector("[compare-section]").dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerType: "mouse" }));
  }, { type, x, y });
  const state = () => page.evaluate(() => {
    const read = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return {
      x: r.left + r.width / 2, y: r.top + r.height / 2, opacity: Number(s.opacity),
      transform: s.transform, working: e.style.willChange, filter: s.filter,
    }; };
    return { head: read(document.querySelector("[compare-gradient]")),
      trails: [...document.querySelectorAll("[compare-gradient-trail]")].map(read) };
  });
  const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 2, `${label}: ${actual} vs ${expected}`);
  assert.equal((await state()).head.opacity, 0);
  await fire("pointerenter", 400, 350);
  await page.waitForTimeout(50);
  assert.equal((await state()).head.opacity, 0, "Moves to the cursor invisibly before reveal");
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("[compare-gradient]")).opacity) === 1, null, { timeout: 2000 });
  let s = await state();
  assert.equal(s.head.opacity, 1, JSON.stringify({ state: s, errors }));
  near(s.head.x, 400, "Head reaches entry X"); near(s.head.y, 350, "Head reaches entry Y");
  assert.equal(s.head.filter, "blur(79.2px)", "Native Webflow blur is preserved");
  await fire("pointermove", 850, 500);
  await page.waitForTimeout(120);
  s = await state();
  assert.equal(s.trails.length, 4, "The trail uses a fixed pool");
  assert.ok(s.trails.some(t => t.opacity > 0.02 && t.x < s.head.x - 20), "Movement leaves a visible delayed trail");
  await page.waitForFunction(() => document.querySelector("[compare-gradient]").style.willChange === "", null, { timeout: 4000 });
  s = await state();
  near(s.head.x, 850, "Settled cursor X");
  assert.ok(s.trails.every(t => t.opacity < 0.003), "Trail fades when the pointer rests");
  assert.equal(s.head.working, "", "The idle loop stops and releases layer hints");
  await fire("pointermove", 600, 300);
  await page.waitForTimeout(80);
  await fire("pointerleave", 1101, 400);
  await page.waitForTimeout(80);
  const exit = await state();
  near(exit.head.x, 1100, "Head parks at the section exit");
  assert.ok(exit.head.opacity > 0.9);
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("[compare-gradient]")).opacity) === 0, null, { timeout: 3000 });
  s = await state();
  near(s.head.x, exit.head.x, "Exit does not return the head to its authored position");
  assert.equal(s.head.opacity, 0);
  assert.ok(s.trails.every(t => t.opacity === 0));
  assert.equal(s.head.working, "");
  await fire("pointerenter", 500, 300);
  await page.waitForTimeout(20);
  await fire("pointerleave", 99, 300);
  await page.waitForTimeout(450);
  assert.equal((await state()).head.opacity, 0, "Leaving during arrival cancels the reveal");
  await fire("pointerenter", 500, 300);
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector("[compare-gradient]")).opacity) === 1, null, { timeout: 2000 });
  s = await state(); near(s.head.x, 500, "Rapid re-entry keeps the correct origin");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  assert.equal((await state()).head.opacity, 0);
  assert.equal((await state()).head.working, "");
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelectorAll("[compare-gradient-trail]").length === 0);
  assert.equal((await state()).head.opacity, 0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => document.querySelectorAll("[compare-gradient-trail]").length === 4);
  await page.evaluate(() => stopGradient());
  assert.equal((await state()).trails.length, 0);
  assert.ok(await page.locator("[compare-gradient]").evaluate(e => !e.style.cssText));
  assert.deepEqual(errors, []);
  console.log("PASS comparison gradient: arrive before reveal, cursor trail, idle stop, parked exit/fade, interrupted entry, reduced motion and cleanup");
} finally { await browser.close(); }

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { createHomePreview } from "./preview-server.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const { server, url } = await createHomePreview({ port: 0 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");
const errors = [], results = [];
const near = (a, b, tolerance = 1) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
async function check(name, action) {
  try { await action(); results.push(true); console.log(`PASS ${name}`); }
  catch (error) { results.push(false); console.error(`FAIL ${name}: ${error.stack}`); }
}
async function open(code) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/script.js", (route) => route.fulfill({ body: code, contentType: "text/javascript" }));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.ScrollTrigger?.getById("home-scroll"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2100);
  await page.evaluate(() => ScrollTrigger.refresh());
  return page;
}
async function bounds(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("[home-resting] [perspective-card]")].map((card) => card.getBoundingClientRect());
    return { top: Math.min(...cards.map((r) => r.top)), right: Math.max(...cards.map((r) => r.right)),
      bottom: Math.max(...cards.map((r) => r.bottom)), left: Math.min(...cards.map((r) => r.left)),
      logoTop: document.querySelector("[home-logo-up]").getBoundingClientRect().top };
  });
}
try {
  // Freeze idle rotation to compare placement at exactly the same orientation.
  const frozen = source.replace("cycleSeconds: 48", "cycleSeconds: 480000000");
  const arranged = await open(frozen);
  const neutral = await open(frozen.replace("horizontalSpread: 1.12, verticalSpread: 0.6", "horizontalSpread: 1, verticalSpread: 1"));
  await check("card placement preserves top/right, uses left space and clears the opening logos", async () => {
    const before = await bounds(neutral), after = await bounds(arranged);
    console.log("Card envelope:", { before, after });
    near(after.top, before.top); near(after.right, before.right);
    assert.ok(after.bottom < before.bottom - 100);
    assert.ok(after.left < before.left - 30);
    assert.ok(after.bottom < after.logoTop - 20);
  });
  await check("card placement survives desktop resize and repeated refresh without drifting", async () => {
    for (const viewport of [{ width: 1200, height: 800 }, { width: 1920, height: 1080 }, { width: 1440, height: 900 }]) {
      for (const page of [neutral, arranged]) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100);
        await page.evaluate(() => ScrollTrigger.refresh());
      }
      const before = await bounds(neutral), after = await bounds(arranged);
      near(after.top, before.top); near(after.right, before.right);
      assert.ok(after.bottom < before.bottom - 80);
      await arranged.evaluate(() => { for (let index = 0; index < 3; index++) ScrollTrigger.refresh(); });
      const refreshed = await bounds(arranged);
      for (const key of ["left", "right", "top", "bottom"]) near(refreshed[key], after[key]);
    }
  });
  await neutral.close(); await arranged.close();

  // Record the actual rotation increments while independently checking rendered
  // card movement; instrumentation never changes the production calculations.
  const instrumented = source.replace("function rotateHomeRestingMatrix(rotationX, rotationY) {", `function rotateHomeRestingMatrix(rotationX, rotationY) {
    window.cardRotationRadians = (window.cardRotationRadians || 0) + Math.hypot(rotationX, rotationY);`);
  const page = await open(instrumented);
  async function sample(progress) {
    return page.evaluate(async (progress) => {
      const trigger = ScrollTrigger.getById("home-scroll");
      lenis.scrollTo(trigger.end * progress, { immediate: true, force: true }); ScrollTrigger.update();
      await new Promise(requestAnimationFrame);
      const before = [...document.querySelectorAll("[home-resting] [perspective-card]")].map((card) => card.style.transform);
      const angle = window.cardRotationRadians, time = performance.now();
      for (let frame = 0; frame < 35; frame++) await new Promise(requestAnimationFrame);
      return { rate: (window.cardRotationRadians - angle) / (performance.now() - time) * 1000,
        changed: [...document.querySelectorAll("[home-resting] [perspective-card]")].some((card, index) => card.style.transform !== before[index]) };
    }, progress);
  }
  await check("idle rotation continues after scrolling and accelerates through the opening", async () => {
    const idle = await sample(0), middle = await sample(0.15), late = await sample(0.3);
    assert.ok(idle.changed && middle.changed && late.changed);
    near(middle.rate / idle.rate, 2, 0.2);
    near(late.rate / idle.rate, 3, 0.3);
    console.log("Rotation degrees/second:", [idle, middle, late].map(({ rate }) => rate * 180 / Math.PI));
  });
  await check("wheel scrolling and a paused scroll position both keep visible cards rotating", async () => {
    await sample(0.03);
    const angle = await page.evaluate(() => window.cardRotationRadians);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(450);
    assert.ok(await page.evaluate((before) => window.cardRotationRadians > before, angle));
    const stopped = await sample(0.2); assert.ok(stopped.changed && stopped.rate > 0.15);
  });
  await check("hidden cards stop work at the existing fade endpoint and resume on reverse", async () => {
    const hidden = await sample(0.34);
    assert.equal(hidden.rate, 0); assert.equal(hidden.changed, false);
    const reversed = await sample(0.15);
    assert.ok(reversed.changed && reversed.rate > 0.15);
  });
  await check("no runtime errors occur during card layout, rotation and resize checks", async () => assert.deepEqual(errors, []));
} finally {
  await browser.close(); await new Promise((resolve) => server.close(resolve));
}
console.log(`${results.filter(Boolean).length}/${results.length} card checks passed`);
if (results.some((passed) => !passed)) process.exitCode = 1;

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = process.env.HOME_TEST_OUTPUT || join(tmpdir(), "imprint-mobile-staging");
const url = process.env.HOME_TEST_URL || "https://imprint-engine-v2.webflow.io/";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.HOME_TEST_CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.setDefaultTimeout(8000);
const errors = [], results = [];
page.on("pageerror", e => errors.push(e.message));
async function check(name, fn) {
  try { await fn(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (e) { results.push({ name, passed: false, error: e.message }); console.error(`FAIL ${name}: ${e.message}`); }
}
async function seek(progress) {
  await page.evaluate(p => {
    const t = ScrollTrigger.getById("home-scroll");
    lenis.scrollTo(t.start + (t.end - t.start) * p, { immediate: true, force: true });
    ScrollTrigger.update();
  }, progress);
  await page.waitForTimeout(120);
}
const frame = () => page.evaluate(() => ({
  clip: document.querySelector("[home-start]").style.clipPath,
  drop: document.querySelector('[home-gradient-drop="2"]').getAttribute("transform"),
  copy: [...document.querySelectorAll("[home-second-up],[home-third-up]")].map(e => e.style.opacity),
}));
try {
  await page.goto(`${url}?mobile-check=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForFunction(() => window.ScrollTrigger?.getById("home-scroll"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  await check("mobile keeps the original scrub controller and floating cards", async () => {
    const state = await page.evaluate(() => ({
      count: ScrollTrigger.getAll().filter(t => t.vars.id === "home-scroll").length,
      scrub: ScrollTrigger.getById("home-scroll").vars.scrub,
      cards: document.querySelectorAll("[home-resting]").length,
      position: getComputedStyle(document.querySelector("[home-resting]")).position,
    }));
    assert.equal(state.count, 1); assert.equal(state.scrub, true);
    assert.ok(state.cards > 8); assert.equal(state.position, "absolute");
  });
  await check("a native touch swipe scrolls through the hero", async () => {
    const touch = await context.newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: 500 }] });
    for (let i = 1; i <= 12; i++) {
      await touch.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: 500 - i * 25 }] });
      await page.waitForTimeout(16);
    }
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(() => scrollY > 150));
    await touch.detach();
  });
  await check("scrub reverses to identical frames", async () => {
    for (const p of [.28, .52, .8]) {
      await seek(p); const forward = await frame();
      await seek(1); await seek(p);
      assert.deepEqual(await frame(), forward);
    }
  });
  await check("mobile to desktop and back keeps one controller and no horizontal overflow", async () => {
    for (const [width, height] of [[320, 568], [375, 740], [768, 1024], [1440, 900], [402, 874]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(450);
      await page.evaluate(() => { ScrollTrigger.refresh(); lenis.scrollTo(0, { immediate: true, force: true }); });
      await page.waitForTimeout(200);
      const state = await page.evaluate(() => ({
        width: innerWidth, doc: document.documentElement.scrollWidth,
        count: ScrollTrigger.getAll().filter(t => t.vars.id === "home-scroll").length,
        introBottom: document.querySelector(".home-start-layout").offsetTop + document.querySelector(".home-start-layout").offsetHeight,
        logosTop: document.querySelector("[home-logo-up]").offsetTop,
        artwork: document.querySelector("[home-gradient-svg]").getAttribute("viewBox"),
      }));
      assert.equal(state.count, 1); assert.ok(state.doc <= state.width + 1);
      if (width < 992) {
        assert.ok(state.logosTop > state.introBottom, JSON.stringify(state));
        await seek(.52);
        const copy = await page.locator("[home-third-up]").boundingBox();
        assert.ok(copy.y + copy.height <= height + 1, `Third scene exceeds ${width} x ${height}: ${JSON.stringify(copy)}`);
        await page.evaluate(() => lenis.scrollTo(0, { immediate: true, force: true }));
      } else {
        assert.equal(state.artwork, "0 0 1440 832");
        assert.ok(await page.locator(".section-teams").isVisible());
        assert.ok(await page.locator(".footer-main-show").isVisible());
        assert.equal(await page.locator(".ac-1-wrap").count(), 1);
        assert.equal(await page.locator(".section-teams").count(), 1);
      }
    }
  });
  await page.screenshot({ path: join(output, "mobile-opening.png") });
  for (const [name, p] of [["second-scene", .28], ["third-scene", .52], ["final-scene", 1]]) {
    await seek(p); await page.screenshot({ path: join(output, `${name}.png`) });
  }
  await check("mobile navigation opens full screen with a single-column submenu and Back", async () => {
    await seek(0);
    const toggle = page.locator("[nav-mobile-toggle]").first();
    try {
      await page.locator("[home-start] [nav-mobile-toggle]").tap();
      const menu = page.locator(".is-mobile-open");
      assert.equal(await menu.locator("[nav-mobile-toggle]").getAttribute("aria-expanded"), "true");
      assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
      const bounds = await menu.boundingBox();
      assert.equal(bounds.y, 0); assert.ok(bounds.height >= page.viewportSize().height);
      await menu.locator('[nav-dropdown-trigger="solutions"]').tap();
      const submenu = menu.locator('[nav-dropdown="solutions"]');
      await submenu.waitFor({ state: "visible" });
      assert.equal(await submenu.locator(".nav-menu-columns").evaluate(e => getComputedStyle(e).flexDirection), "column");
      assert.equal(await menu.locator("[nav-mobile-main]").getAttribute("aria-hidden"), "true");
      await submenu.locator("[nav-mobile-back]").tap();
      assert.equal(await menu.locator("[nav-mobile-main]").getAttribute("aria-hidden"), "false");
    } finally {
      const openToggle = page.locator(".is-mobile-open [nav-mobile-toggle]");
      if (await openToggle.count()) await openToggle.tap();
    }
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), "hidden");
  });
  await check("the original four support tabs switch one panel at a time", async () => {
    const tabs = page.locator(".ac-1-wrap [accord-item]");
    assert.equal(await tabs.count(), 4);
    for (const i of [1, 2, 0]) {
      await tabs.nth(i).scrollIntoViewIfNeeded(); await tabs.nth(i).tap();
      assert.ok((await tabs.nth(i).getAttribute("class")).includes("active"));
      assert.equal(await page.evaluate(() => [...document.querySelectorAll(".ac-1-wrap [accord-reveal]")].filter(e => getComputedStyle(e).display !== "none").length), 1);
    }
  });
  await check("one Teams instance serves desktop and mobile with the same five items", async () => {
    assert.equal(await page.locator(".section-teams").count(), 1);
    assert.equal(await page.locator(".section-teams .team-block").count(), 5);
    assert.equal(await page.locator("[mobile-team-list]").count(), 0);
  });
  await check("the final home scene fills the screen before Form 1 enters", async () => {
    await seek(1);
    const state = await page.evaluate(() => ({
      height: document.querySelector("[layout-end]").getBoundingClientRect().height,
      formTop: document.querySelector(".page-content").getBoundingClientRect().top,
      screen: innerHeight,
      outline: document.querySelector("[home-end-target-path]").getAttribute("d").includes("ZM"),
    }));
    assert.ok(Math.abs(state.height - state.screen) < 1);
    assert.ok(Math.abs(state.formTop - state.screen) < 1);
    assert.equal(state.outline, true);
  });
  await check("process accordion expands the selected image on touch", async () => {
    const items = page.locator("[flex-grow-item]");
    for (const i of [2, 0]) {
      await items.nth(i).scrollIntoViewIfNeeded(); await items.nth(i).tap();
      await page.waitForTimeout(800);
      assert.equal(await items.nth(i).getAttribute("aria-expanded"), "true");
      const heights = await items.evaluateAll(es => es.map(e => e.querySelector("[flex-grow-item-img]").getBoundingClientRect().height));
      assert.ok(heights[i] > 100); assert.ok(heights.every((h, j) => j === i || h < 1));
    }
  });
  await check("FAQ opens and closes on tap", async () => {
    const question = page.locator(".home-faq-button").first();
    await question.scrollIntoViewIfNeeded(); await question.tap();
    assert.equal(await question.getAttribute("aria-expanded"), "true");
    await question.tap(); assert.equal(await question.getAttribute("aria-expanded"), "false");
  });
  await check("envelope opens, reveals a card, retains its layers, and closes", async () => {
    const envelope = page.locator("[testimonial-envelope]");
    const pocket = page.locator('[testimonial-envelope-toggle][role="button"]');
    await envelope.scrollIntoViewIfNeeded();
    const box = await pocket.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * .8);
    await page.waitForTimeout(900);
    assert.equal(await pocket.getAttribute("aria-expanded"), "true");
    const card = page.locator("[testimonial-card]").last();
    const before = await card.evaluate(e => getComputedStyle(e).zIndex);
    const cb = await card.boundingBox();
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + 24);
    await page.waitForTimeout(400);
    assert.ok(await card.evaluate(e => gsap.getProperty(e, "y") < 0));
    assert.equal(await card.evaluate(e => getComputedStyle(e).zIndex), before);
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * .8);
    await page.waitForTimeout(700); assert.equal(await pocket.getAttribute("aria-expanded"), "false");
  });
  await check("no runtime exceptions", async () => assert.deepEqual(errors, []));
} finally {
  await writeFile(join(output, "checks.json"), JSON.stringify({ url, results, errors }, null, 2));
  await browser.close();
}
if (results.some(r => !r.passed)) process.exitCode = 1;

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHomePreview } from "./preview-server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { server, url } = await createHomePreview({ port: 0 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.ScrollTrigger?.getById("home-scroll"));
  await page.waitForTimeout(2100);
  const home = await page.evaluate(() => {
    const timeline = gsap.getById("home-sequence"), labels = timeline.labels;
    const at = (time, hook) => {
      timeline.time(time);
      const element = document.querySelector(hook);
      return { scale: gsap.getProperty(element, "scaleX"), opacity: gsap.getProperty(element, "opacity") };
    };
    const result = {
      gap: labels["secondScene.enter"] - labels["logos:end"],
      entering: at(labels["secondScene.enter"] + 0.0325, "[home-second-up]"),
      full: at(labels["secondScene.enter:end"], "[home-second-up]"),
      leaving: at(labels["secondScene.leave"] + 0.0325, "[home-second-up]"),
      gone: at(labels["secondScene.leave:end"], "[home-second-up]"),
    };
    timeline.time(0);
    return result;
  });
  assert.ok(Math.abs(home.gap - 0.02) < 0.00001);
  assert.ok(home.entering.scale > 0.9 && home.entering.scale < 1);
  assert.equal(home.full.scale, 1);
  assert.ok(home.leaving.scale > 0.9 && home.leaving.scale < 1);
  assert.equal(home.gone.scale, 0.9);
  console.log("PASS logos finish before incoming text; text scales continuously in and out");

  await page.locator("[cat-select]").nth(2).evaluate(element => element.click());
  await page.waitForTimeout(600);
  const transition = await page.evaluate(() => {
    const selects = [...document.querySelectorAll("[cat-select]")];
    const old = [...document.querySelectorAll("[cat-reveal].active")];
    selects.find(element => !element.classList.contains("active") && [...document.querySelectorAll("[cat-reveal]")].some(panel => panel.getAttribute("cat-reveal") === element.getAttribute("cat-select"))).click();
    const tween = gsap.getTweensOf(old)[0];
    const timeline = tween.parent;
    timeline.pause().time(0.1);
    const outgoing = { scale: gsap.getProperty(old[0], "scaleX"), opacity: gsap.getProperty(old[0], "opacity") };
    timeline.time(0.35);
    const current = document.querySelector("[cat-reveal].active");
    const incoming = { scale: gsap.getProperty(current, "scaleX"), opacity: gsap.getProperty(current, "opacity") };
    timeline.progress(1);
    return { outgoing, incoming };
  });
  for (const state of Object.values(transition)) {
    assert.ok(state.scale > 0.9 && state.scale < 1);
    assert.ok(state.opacity > 0 && state.opacity < 1);
  }
  console.log("PASS catalogue images interpolate scale and opacity during both halves");

  await page.evaluate(() => {
    const selects = document.querySelectorAll("[cat-select]");
    [0, 2, 1, 0, 2].forEach(index => selects[index].click());
  });
  await page.waitForTimeout(650);
  const selected = await page.evaluate(() => {
    const key = document.querySelector('[cat-select][aria-pressed="true"]').getAttribute("cat-select");
    return { key, panels: [...document.querySelectorAll("[cat-reveal].active")].map(element => ({
      key: element.getAttribute("cat-reveal"), opacity: getComputedStyle(element).opacity,
      transform: getComputedStyle(element).transform, inert: element.inert,
    })) };
  });
  assert.ok(selected.panels.length > 0);
  assert.ok(selected.panels.every(panel => panel.key === selected.key && panel.opacity === "1" && !panel.inert && panel.transform === "none"));
  console.log("PASS rapid catalogue changes settle on the latest image without leftover transforms");
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

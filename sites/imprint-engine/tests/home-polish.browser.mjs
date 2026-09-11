import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHomePreview } from "./preview-server.mjs";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = process.env.HOME_TEST_OUTPUT || join(tmpdir(), "imprint-home-polish-tests");
await mkdir(output, { recursive: true });
const { server, url } = await createHomePreview({ port: 0 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const results = [], errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const near = (actual, expected, tolerance = 0.6) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);
async function check(name, action) {
  try { await action(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, error: error.stack }); console.error(`FAIL ${name}: ${error.stack}`); }
}
async function seek(progress) {
  await page.evaluate((p) => {
    const trigger = ScrollTrigger.getById("home-scroll");
    lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * p, { immediate: true, force: true });
    ScrollTrigger.update();
  }, progress);
  await page.waitForTimeout(40);
}
async function navHits() {
  return page.evaluate(() => [100, innerWidth - 100].map((x) => {
    const element = document.elementFromPoint(x, 64)?.closest("[nav-block]");
    return element && { hero: Boolean(element.closest("[home-start]")), color: getComputedStyle(element).color };
  }));
}
const white = { hero: true, color: "rgb(255, 255, 255)" };
const dark = { hero: false, color: "rgb(0, 0, 0)" };
try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.ScrollTrigger?.getById("home-scroll"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2100);

  await check("white hero navigation is visible, and the clip reveals the dark page navigation", async () => {
    await seek(0); assert.deepEqual(await navHits(), [white, white]);
    await page.screenshot({ path: join(output, "opening.png") });
    await seek(0.63); assert.deepEqual(await navHits(), [white, dark]);
    await page.screenshot({ path: join(output, "nav-clip.png") });
    await seek(0.7); assert.deepEqual(await navHits(), [dark, dark]);
    await seek(0); assert.deepEqual(await navHits(), [white, white]);
  });
  await check("the page nav switches at the footer and restores the correct theme on return", async () => {
    await page.evaluate(() => {
      const footer = document.querySelector("[nav-light]");
      lenis.scrollTo(scrollY + footer.getBoundingClientRect().top + 20, { immediate: true, force: true });
      ScrollTrigger.update();
    });
    assert.deepEqual(await navHits(), [0, 1].map(() => ({ hero: false, color: "rgb(255, 255, 255)" })));
    await seek(1); assert.deepEqual(await navHits(), [dark, dark]);
    await seek(0); assert.deepEqual(await navHits(), [white, white]);
  });
  await check("card framing rises without moving horizontally and finishes at 30%", async () => {
    const state = await page.evaluate(() => {
      const timeline = gsap.getById("home-sequence"), card = document.querySelector("[home-resting] [perspective-card]");
      const frames = [0, 0.1, 0.2, 0.3].map((time) => {
        timeline.time(time, false);
        return { scale: Number(gsap.getProperty(card, "scale")), x: Number(gsap.getProperty(card, "x")), y: Number(gsap.getProperty(card, "y")) };
      });
      timeline.time(0);
      return { frames, labels: timeline.labels, rem: parseFloat(getComputedStyle(document.documentElement).fontSize) };
    });
    near(state.labels["firstScene.sphere:end"], 0.3, 0.00001);
    const scales = state.frames.map((frame) => frame.scale);
    near(scales[3] / scales[0], 0.78, 0.001);
    state.frames.forEach((frame) => near(frame.x, state.frames[0].x, 0.001));
    state.frames.forEach((frame, index) => near(frame.y - state.frames[0].y, -2 * index * state.rem, 0.001));
    const differences = scales.slice(1).map((value, index) => scales[index] - value);
    assert.ok(differences.every((difference) => difference > 0.02));
    differences.forEach((difference) => near(difference, differences[0], 0.001));
    assert.ok(state.labels["finish.clip"] <= 0.55);
  });
  await check("rotating cards change opacity continuously even through a dragged half turn", async () => {
    await seek(0);
    const samples = await page.evaluate(async () => {
      const surface = document.querySelector("[home-start]");
      const cards = [...document.querySelectorAll("[home-resting] [perspective-card]")];
      const event = (name, x) => new PointerEvent(name, { pointerId: 9, button: 0, clientX: x, clientY: 500, bubbles: true });
      const frames = [];
      surface.dispatchEvent(event("pointerdown", 200));
      for (let index = 0; index < 100; index++) {
        if (index < 60) document.dispatchEvent(event("pointermove", 200 + index * 12));
        await new Promise(requestAnimationFrame);
        frames.push(cards.map((card) => Number(getComputedStyle(card).opacity)));
      }
      document.dispatchEvent(event("pointerup", 908));
      return frames;
    });
    const differences = samples.slice(1).flatMap((frame, index) => frame.map((opacity, card) => Math.abs(opacity - samples[index][card])));
    assert.ok(Math.max(...differences) < 0.08, `Opacity jumps by ${Math.max(...differences)}`);
    assert.ok(samples[0].some((opacity, index) => Math.abs(opacity - samples.at(-1)[index]) > 0.3), "Exercise a meaningful depth/opacity change");
    assert.ok(samples.flat().every((opacity) => opacity >= 0.08 && opacity <= 1));
  });
  await check("the end drop aligns across desktop sizes and repeated refreshes do not drift", async () => {
    for (const [width, height] of [[1440, 900], [1200, 800], [1920, 1080]]) {
      await page.setViewportSize({ width, height });
      await seek(1);
      const samples = await page.evaluate(() => Array.from({ length: 3 }, () => {
        ScrollTrigger.refresh();
        const home = document.querySelector("[home-start]").getBoundingClientRect();
        const line = document.querySelector("[home-gradient-line]").getBoundingClientRect();
        const end = document.querySelector("[layout-end]").getBoundingClientRect();
        const marker = document.querySelector("[home-end-brackets]").getBoundingClientRect();
        return { center: marker.top + marker.height / 2 - end.top,
          target: line.top + line.height / 2 - home.top - 0.75 * parseFloat(getComputedStyle(document.documentElement).fontSize),
          padding: parseFloat(getComputedStyle(document.querySelector("[layout-end]")).paddingTop) };
      }));
      samples.forEach((sample) => { near(sample.center, sample.target); near(sample.padding, samples[0].padding); });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await seek(1);
    await page.screenshot({ path: join(output, "end-alignment.png") });
  });
  await check("gallery item growth reveals a constant-size photo without a second easing curve", async () => {
    await page.evaluate(() => {
      const block = document.querySelector("[flex-grow-block]");
      lenis.scrollTo(scrollY + block.getBoundingClientRect().top - 200, { immediate: true, force: true });
    });
    await page.waitForFunction(() => [...document.querySelectorAll("[flex-grow-item-img] img")].every((image) => image.complete && image.naturalWidth > 0));
    const frames = await page.evaluate(() => {
      const items = [...document.querySelector("[flex-grow-block]").querySelectorAll(":scope > [flex-grow-item]")];
      const snapshot = () => items.map((item) => {
        const pane = item.querySelector("[flex-grow-item-img]"), art = pane.querySelector("[img-abs]");
        return { item: item.getBoundingClientRect().width, pane: pane.getBoundingClientRect().width,
          art: art.getBoundingClientRect().width, height: art.getBoundingClientRect().height };
      });
      const initial = snapshot();
      items[1].click();
      const tween = gsap.getTweensOf(items[1]).find((tween) => "flexGrow" in tween.vars);
      const timeline = tween.parent.pause();
      const frames = [0, 0.25, 0.5, 0.75, 1].map((progress) => { timeline.progress(progress); return snapshot(); });
      return { initial, frames };
    });
    const fullWidth = frames.initial.reduce((sum, item) => sum + item.pane, 0);
    for (const frame of frames.frames) frame.forEach((item, index) => {
      near(item.art, fullWidth);
      near(item.item - frames.initial[index].item, item.pane - frames.initial[index].pane);
      near(item.height, frames.initial[index].height);
    });
    await page.screenshot({ path: join(output, "gallery-desktop.png") });
  });
  await check("gallery artwork remeasures on resize and mobile expands by revealing its full-height photo", async () => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(150);
    const desktop = await page.evaluate(() => {
      const panes = [...document.querySelector("[flex-grow-block]").querySelectorAll("[flex-grow-item-img]")];
      return { openWidth: panes.reduce((sum, pane) => sum + pane.getBoundingClientRect().width, 0), widths: panes.map((pane) => pane.firstElementChild.getBoundingClientRect().width) };
    });
    desktop.widths.forEach((width) => near(width, desktop.openWidth));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    const frames = await page.evaluate(() => {
      const items = [...document.querySelector("[flex-grow-block]").querySelectorAll(":scope > [flex-grow-item]")];
      items[2].click();
      const pane = items[2].querySelector("[flex-grow-item-img]");
      const tween = gsap.getTweensOf(pane).find((tween) => "height" in tween.vars);
      const timeline = tween.parent.pause();
      return [0, 0.25, 0.5, 0.75, 1].map((progress) => {
        timeline.progress(progress);
        return { pane: pane.getBoundingClientRect().height, image: pane.firstElementChild.getBoundingClientRect().height,
          width: pane.firstElementChild.getBoundingClientRect().width };
      });
    });
    frames.forEach((frame) => { near(frame.image, frames.at(-1).pane); near(frame.image, frame.width / 2); });
    assert.ok(frames[2].pane > 0 && frames[2].pane < frames[2].image);
  });
  await check("mobile hero navigation scrolls away so it cannot cover the footer", async () => {
    await page.evaluate(() => { lenis.scrollTo(0, { immediate: true, force: true }); ScrollTrigger.update(); });
    assert.ok((await navHits()).every((hit) => hit?.hero));
    await page.evaluate(() => { lenis.scrollTo(document.documentElement.scrollHeight, { immediate: true, force: true }); ScrollTrigger.update(); });
    assert.ok((await navHits()).every((hit) => hit && !hit.hero));
  });
  await check("motion and responsive tests produce no runtime errors", async () => assert.deepEqual(errors, []));
} finally {
  await writeFile(join(output, "polish-results.json"), JSON.stringify({ results, errors }, null, 2));
  await browser.close(); await new Promise((resolve) => server.close(resolve));
}
console.log(`${results.filter((result) => result.passed).length}/${results.length} polish checks passed. Reports: ${output}`);
if (results.some((result) => !result.passed)) process.exitCode = 1;

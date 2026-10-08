import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");
const breath = source.slice(source.indexOf("function gradientBreathOne()"), source.indexOf("function homeBackgroundMotion()"));
const restore = source.slice(source.indexOf("function rememberAttributes("), source.indexOf("function uniqueElementId("));
const libraries = await Promise.all([
  "https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js",
].map(async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  assert.ok(response.ok, `Could not load ${url}`);
  return response.text();
}));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<style>body{margin:0}.gap{height:1800px}section{position:relative;height:700px}.glow{position:absolute;top:10%;width:15.4em;height:22.4em;background:#ff9aa4;filter:blur(5.5vw);pointer-events:none;border-radius:50%}.left{left:0}.right{right:0}</style>
    <div class="gap"></div><section><div class="glow left" gradient-breath-1></div><div class="glow right" gradient-breath-1></div><div id="untagged"></div></section><div class="gap"></div>`);
  for (const content of libraries) await page.addScriptTag({ content });
  await page.addScriptTag({ content: `${restore}\n${breath}\nwindow.stopBreath = gradientBreathOne();` });
  const states = () => page.evaluate(() => [...document.querySelectorAll("[gradient-breath-1]")].map((element) => {
    const tween = gsap.getTweensOf(element)[0];
    return { paused: tween.paused(), time: tween.time() };
  }));
  assert.ok((await states()).every((state) => state.paused), "Offscreen gradients should start paused");
  await page.evaluate(() => scrollTo(0, 1750));
  await page.waitForFunction(() => [...document.querySelectorAll("[gradient-breath-1]")].every((element) => !gsap.getTweensOf(element)[0].paused()));
  const peak = await page.evaluate(() => [...document.querySelectorAll("[gradient-breath-1]")].map((element) => {
    const tween = gsap.getTweensOf(element)[0];
    tween.pause().totalTime(14, true);
    return { scale: gsap.getProperty(element, "scaleX"), x: gsap.getProperty(element, "xPercent"), y: gsap.getProperty(element, "yPercent"), filter: getComputedStyle(element).filter };
  }));
  assert.deepEqual(peak.map(({ scale, x, y }) => ({ scale, x, y })), [
    { scale: 1.08, x: 4, y: 3 }, { scale: 1.08, x: -4, y: -3 },
  ]);
  assert.ok(peak.every((value) => value.filter === "blur(66px)"), "The native blur must remain unchanged");
  await page.evaluate(() => document.querySelectorAll("[gradient-breath-1]").forEach((element) => {
    const tween = gsap.getTweensOf(element)[0];
    tween.totalTime(28, true);
    if (Math.abs(gsap.getProperty(element, "scaleX") - 1) > 0.0001) throw Error("Exhale did not return to its original size");
    tween.play();
  }));
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => [...document.querySelectorAll("[gradient-breath-1]")].every((element) => gsap.getTweensOf(element)[0].paused()));
  const paused = await states();
  await page.waitForTimeout(80);
  assert.deepEqual(await states(), paused, "Offscreen gradients must not advance");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); scrollTo(0, 1750); });
  await page.waitForTimeout(80);
  assert.ok((await states()).every((state) => state.paused), "Hidden tabs must stay paused");
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForFunction(() => [...document.querySelectorAll("[gradient-breath-1]")].every((element) => !gsap.getTweensOf(element)[0].paused()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => [...document.querySelectorAll("[gradient-breath-1]")].every((element) => gsap.getTweensOf(element).length === 0 && !element.style.cssText));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => gsap.getTweensOf(document.querySelector("[gradient-breath-1]")).length === 1);
  const clean = await page.evaluate(() => {
    stopBreath();
    const all = [...document.querySelectorAll("[gradient-breath-1], #untagged")];
    return all.every((element) => !element.style.cssText && gsap.getTweensOf(element).length === 0);
  });
  assert.ok(clean, "Cleanup must restore native styles and leave untagged elements alone");
  assert.deepEqual(errors, []);
  console.log("PASS gradient breathing: motion/reverse, native blur, offscreen pause, hidden tab, reduced motion and cleanup");
} finally {
  await browser.close();
}

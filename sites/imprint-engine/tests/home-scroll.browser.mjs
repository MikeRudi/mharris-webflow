import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHomePreview } from "./preview-server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = process.env.HOME_TEST_OUTPUT || join(tmpdir(), "imprint-home-scroll-tests");
await mkdir(output, { recursive: true });
const { server, url } = await createHomePreview({ port: 0 });
const browser = await chromium.launch(process.env.HOME_TEST_CHROME
  ? { executablePath: process.env.HOME_TEST_CHROME, headless: true }
  : { channel: "chrome", headless: true });
const errors = [];
const warnings = [];
let page;
async function freshPage() {
  if (page) await page.close();
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(20000);
  page.on("pageerror", (error) => { errors.push(error.message); console.error(`Browser error: ${error.message}`); });
  page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
}
await freshPage();
const results = [];
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");

async function check(name, run) {
  if (process.env.HOME_TEST_FILTER && !new RegExp(process.env.HOME_TEST_FILTER).test(name)) return;
  try { await run(); results.push({ name, passed: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, passed: false, error: error.stack }); console.error(`FAIL ${name}: ${error.message}`); }
}
const near = (actual, expected, tolerance = 0.0001) => assert.ok(
  Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`
);

async function ready() {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.ScrollTrigger?.getById("home-scroll"));
  await page.evaluate(async () => {
    await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 5000))]);
    await new Promise((resolve) => setTimeout(resolve, 1900));
    ScrollTrigger.refresh();
  });
}
async function seek(progress) {
  return page.evaluate(async (progress) => {
    const trigger = ScrollTrigger.getById("home-scroll");
    lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * progress, { immediate: true, force: true });
    ScrollTrigger.update();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return trigger.progress;
  }, progress);
}
async function frame() {
  return page.evaluate(() => {
    const round = (value) => Math.round(Number(value) * 10000) / 10000;
    const props = (selector, names) => Array.from(document.querySelectorAll(selector), (el) => Object.fromEntries(
      names.map((name) => [name, round(gsap.getProperty(el, name))])
    ));
    const attrs = (selector, names) => Array.from(document.querySelectorAll(selector), (el) => Object.fromEntries(
      names.map((name) => [name, el.getAttribute(name)])
    ));
    const ring = (selector) => Array.from(document.querySelectorAll(selector), (el) => ({
      scale: round(gsap.getProperty(el, "scale")), opacity: round(gsap.getProperty(el, "opacity")),
      filter: getComputedStyle(el).filter, shadow: getComputedStyle(el).boxShadow,
    }));
    return {
      first: props("[home-start-up]", ["y", "opacity"]),
      logos: props("[home-logo-up]", ["y", "opacity"]),
      second: props("[home-second-up]", ["y", "opacity"]),
      third: props("[home-third-up]", ["y", "opacity"]),
      pieces: attrs("[home-gradient-piece]", ["cx", "cy", "rx", "ry"]),
      pieceOpacity: props("[home-gradient-piece]", ["opacity"]),
      orbit: props("[home-gradient-orbit]", ["y", "scale"]),
      drops: attrs("[home-gradient-drop]", ["transform"]),
      dropOpacity: props("[home-gradient-drop]", ["opacity"]),
      finalBlur: attrs("[home-final-drop-blur]", ["stdDeviation"]),
      colours: props("[home-drop-circle]", ["x", "opacity"]),
      star: props("[home-drop-star]", ["scale", "rotation", "opacity"]),
      line: attrs("[home-gradient-line]", ["stroke-dashoffset"]),
      clip: getComputedStyle(document.querySelector("[home-start]")).clipPath,
      blur: Array.from(document.querySelector("[home-start]").children, (el) => getComputedStyle(el).filter),
      target: props("[home-end-target-svg]", ["scale"]),
      brackets: props("[home-end-bracket-left], [home-end-bracket-right]", ["x"]),
      landingRings: ring("[ripple-ring]"), endRings: ring("[home-end-ripple]"),
    };
  });
}
function compareFrames(actual, expected, path = "frame") {
  if (typeof expected === "number") return near(actual, expected, 0.001);
  if (Array.isArray(expected)) {
    assert.equal(actual.length, expected.length, path);
    return expected.forEach((value, index) => compareFrames(actual[index], value, `${path}[${index}]`));
  }
  if (expected && typeof expected === "object") return Object.keys(expected).forEach((key) => compareFrames(actual[key], expected[key], `${path}.${key}`));
  assert.equal(actual, expected, path);
}

try {
  await ready();
  await check("page entrance completes and releases Lenis without runtime errors", async () => {
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => lenis.isStopped), false);
    const initial = await frame();
    assert.ok(initial.first.every((el) => el.opacity === 1 && el.y === 0));
    assert.ok(initial.logos.every((el) => el.opacity === 1 && el.y === 0));
  });
  await check("exact sticky boundaries and a fixed one-unit scroll clock", async () => {
    const details = await page.evaluate(() => {
      const trigger = ScrollTrigger.getById("home-scroll");
      const layout = document.querySelector("[layout-start]").getBoundingClientRect();
      return { start: trigger.start, end: trigger.end, height: layout.height, viewport: innerHeight,
        startRule: trigger.vars.start, endRule: trigger.vars.end, scrub: trigger.vars.scrub,
        clock: trigger.animation.duration(), duration: gsap.getById("home-sequence").duration(),
        labels: gsap.getById("home-sequence").labels };
    });
    near(details.start, 0); near(details.end, details.height - details.viewport);
    assert.equal(details.startRule, "top top"); assert.equal(details.endRule, "bottom bottom");
    assert.equal(details.scrub, true); assert.equal(details.clock, 1); assert.equal(details.duration, 1);
    near(details.labels["finish.clip"], 0.52);
    await writeFile(join(output, "timeline.json"), JSON.stringify(details, null, 2));
  });
  await check("all home sequences stay still when scrolling stops", async () => {
    for (const progress of [0.58, 0.72, 0.79, 0.85, 0.94]) {
      await seek(progress); const before = await frame();
      await page.waitForTimeout(300);
      compareFrames(await frame(), before, `stopped at ${progress}`);
      assert.equal(await page.evaluate(() => lenis.isStopped), false);
    }
  });
  const checkpoints = [0, 0.04, 0.1, 0.13, 0.1797, 0.1803, 0.195, 0.225, 0.24, 0.28, 0.305,
    0.33, 0.35, 0.38, 0.405, 0.48, 0.5197, 0.5203, 0.56, 0.6, 0.64, 0.67,
    0.6997, 0.7003, 0.735, 0.775, 0.8, 0.835, 0.87, 0.9, 0.95, 0.98, 1];
  const forward = [];
  await check("33 forward and reverse frames match, including orbit/merge and clip", async () => {
    await seek(0);
    for (const progress of checkpoints) { await seek(progress); forward.push(await frame()); }
    for (let index = checkpoints.length - 1; index >= 0; index--) {
      await seek(checkpoints[index]); compareFrames(await frame(), forward[index], `reverse ${checkpoints[index]}`);
    }
  });
  await check("direct jumps and repeated reversals reproduce the same frames", async () => {
    for (const index of [26, 4, 19, 32, 9, 24, 0, 30, 13, 22, 5, 32, 0, 26, 13, 26]) {
      await seek(checkpoints[index]); compareFrames(await frame(), forward[index], `jump ${checkpoints[index]}`);
    }
  });
  await check("the second scene holds without a tween fighting its exit", async () => {
    const labels = await page.evaluate(() => gsap.getById("home-sequence").labels);
    const holdStart = labels["secondScene.enter:end"], holdEnd = labels["secondScene.leave"];
    for (const fraction of [0.2, 0.5, 0.8]) {
      const progress = holdStart + (holdEnd - holdStart) * fraction;
      await seek(progress); const current = await frame();
      assert.ok(current.second.every((el) => el.y === 0 && el.opacity === 1));
    }
    await seek((holdEnd + labels["secondScene.leave:end"]) / 2);
    assert.ok((await frame()).second.every((el) => el.y < 0 && el.opacity < 1));
  });
  await check("both home ripples start hidden and reach their intended endpoints", async () => {
    await seek(0); let current = await frame();
    assert.ok([...current.landingRings, ...current.endRings].every((ring) => ring.opacity === 0 && ring.scale === 0.08));
    await seek(1); current = await frame();
    assert.ok(current.landingRings.every((ring) => ring.opacity === 0 && ring.scale === 1));
    current.endRings.forEach((ring, index) => { near(ring.scale, 1.1 - index * 0.3); near(ring.opacity, 0.7); });
  });
  await check("drop size and line anchor remain fixed throughout the colour fill", async () => {
    await seek(0.406); const transform = (await frame()).drops[1].transform;
    for (const progress of [0.43, 0.48, 0.52, 0.7, 1, 0.7, 0.52, 0.48, 0.406]) {
      await seek(progress); assert.equal((await frame()).drops[1].transform, transform);
    }
    const geometry = await page.evaluate(() => {
      const svg = document.querySelector("[home-gradient-svg]");
      const matrix = svg.getScreenCTM();
      const numbers = document.querySelector('[home-gradient-drop="2"]').getAttribute("transform").match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi).map(Number);
      return { numbers, scale: Math.hypot(matrix.a, matrix.b), em: parseFloat(getComputedStyle(svg).fontSize) };
    });
    const [x, y, scale] = geometry.numbers;
    near(223 * scale * geometry.scale, 6.5 * geometry.em, 0.005);
    near(x + 111.1 * scale, 720, 0.001); near(y + 168.0556 * scale + 150, 330, 0.001);
  });
  await check("content blur stays off the sticky wrappers and is cleared on return", async () => {
    await seek(0.7);
    const styles = await page.evaluate(() => ({
      wrappers: ["[home-start]", "[layout-end]", "[home-end-target-svg]"].map((s) => getComputedStyle(document.querySelector(s)).filter),
      children: [...document.querySelector("[home-start]").children].filter((el) => !["SCRIPT", "STYLE"].includes(el.tagName) && !el.querySelector("[nav-block]")).map((el) => getComputedStyle(el).filter),
      nav: getComputedStyle(document.querySelector("[home-start] [nav-block]").parentElement).filter,
    }));
    assert.ok(styles.wrappers.every((filter) => filter === "none"));
    assert.ok(styles.children.every((filter) => /^blur\(/.test(filter)));
    assert.equal(styles.nav, "none");
    await seek(0.51); assert.equal((await frame()).clip, "none");
    assert.ok((await frame()).blur.every((filter) => filter === "none"));
  });
  await check("sticky layers cover the viewport through the clip and release together", async () => {
    for (const progress of [0.50, 0.54, 0.63, 0.7, 0.95, 1, 1.03]) {
      await seek(progress);
      const geometry = await page.evaluate(() => {
        const rect = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; };
        return { start: rect("[home-start]"), end: rect("[layout-end]"), layout: rect("[layout-start]"), height: innerHeight, stopped: lenis.isStopped };
      });
      near(geometry.start.top, geometry.end.top, 0.6);
      near(geometry.start.bottom, geometry.end.bottom, 0.6);
      if (progress <= 1) { near(geometry.start.top, 0, 0.6); near(geometry.end.bottom, geometry.height, 0.6); }
      else near(geometry.end.bottom, geometry.layout.bottom, 0.6);
      assert.equal(geometry.stopped, false);
      if ([0.54, 0.63, 0.7, 1, 1.03].includes(progress)) await page.screenshot({ path: join(output, `home-${Math.round(progress * 100)}.png`) });
    }
  });
  await check("fast wheel scrolling crosses the finish without a scroll lock or layer gap", async () => {
    await seek(0.48);
    await page.evaluate(() => {
      window.homeFastFrames = [];
      const record = () => {
        const trigger = ScrollTrigger.getById("home-scroll");
        const start = document.querySelector("[home-start]").getBoundingClientRect();
        const end = document.querySelector("[layout-end]").getBoundingClientRect();
        homeFastFrames.push({ progress: trigger.progress, top: start.top, bottom: end.bottom, height: innerHeight, stopped: lenis.isStopped });
        if (homeFastFrames.length < 80) requestAnimationFrame(record);
      }; requestAnimationFrame(record);
    });
    await page.mouse.wheel(0, 3000);
    await page.waitForFunction(() => window.homeFastFrames.length >= 80);
    const frames = await page.evaluate(() => homeFastFrames);
    assert.ok(frames.some((frame) => frame.progress === 1));
    assert.ok(frames.every((frame) => !frame.stopped));
    for (const frame of frames.filter((frame) => frame.progress < 0.999)) {
      near(frame.top, 0, 1); near(frame.bottom, frame.height, 1);
    }
  });
  await check("resize during drop shrink preserves its frame and endpoint sizing", async () => {
    await seek(0.38);
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.evaluate(() => ScrollTrigger.refresh());
    await seek(0.38); const resized = await frame();
    await seek(1); await seek(0.38); compareFrames(await frame(), resized, "resized shrink");
    await seek(0.406);
    const width = await page.evaluate(() => {
      const svg = document.querySelector("[home-gradient-svg]"), m = svg.getScreenCTM();
      const scale = Number(document.querySelector('[home-gradient-drop="2"]').getAttribute("transform").match(/scale\(([^)]+)\)/)[1]);
      return { actual: 223 * scale * Math.hypot(m.a, m.b), expected: 6.5 * parseFloat(getComputedStyle(svg).fontSize) };
    });
    near(width.actual, width.expected, 0.005);
  });
  await check("desktop breakpoint cleanup removes the home scroll controller and rebuilds cleanly", async () => {
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.setViewportSize({ width: 767, height: 800 });
      await page.waitForFunction(() => !ScrollTrigger.getById("home-scroll"));
      assert.equal(await page.evaluate(() => document.querySelector("[home-start]").style.clipPath), "");
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForFunction(() => Boolean(ScrollTrigger.getById("home-scroll")));
      await seek(0.9); assert.equal(await page.evaluate(() => ScrollTrigger.getAll().filter((t) => t.vars.id === "home-scroll").length), 1);
      assert.equal(await page.evaluate(() => lenis.isStopped), false);
    }
  });
  await check("editing a duration to 0.2 means 20% and moves linked steps without stretching other groups", async () => {
    // Isolate edited configurations from the breakpoint/scroll history above.
    await freshPage();
    const edited = source.replace('clip: { start: 0, duration: 0.18, ease: "power1.in" }', 'clip: { start: 0, duration: 0.2, ease: "power1.in" }');
    assert.notEqual(edited, source);
    await page.route("**/script.js", (route) => route.fulfill({ body: edited, contentType: "text/javascript" }));
    await ready();
    const labels = await page.evaluate(() => gsap.getById("home-sequence").labels);
    near(labels["finish.clip:end"] - labels["finish.clip"], 0.2);
    near(labels["finish.content"], labels["finish.clip:end"] + 0.035);
    near(labels["gradientDots.spin"], 0.18);
    await page.unroute("**/script.js");
  });
  await check("overrunning edits never silently renormalize the full scroll", async () => {
    await freshPage();
    const edited = source.replace('clip: { start: 0, duration: 0.18, ease: "power1.in" }', 'clip: { start: 0, duration: 0.5, ease: "power1.in" }');
    await page.route("**/script.js", (route) => route.fulfill({ body: edited, contentType: "text/javascript" }));
    await ready(); await seek(0.5);
    const timing = await page.evaluate(() => ({ time: gsap.getById("home-sequence").time(), progress: ScrollTrigger.getById("home-scroll").progress, clock: ScrollTrigger.getById("home-scroll").animation.duration() }));
    near(timing.time, timing.progress); assert.equal(timing.clock, 1);
    assert.ok(warnings.some((message) => message.includes("beyond 100%")));
    await page.unroute("**/script.js");
  });
  await check("no runtime exceptions occurred during the complete browser suite", async () => assert.deepEqual(errors, []));
} finally {
  await writeFile(join(output, "results.json"), JSON.stringify({ results, errors, warnings }, null, 2));
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(`${results.filter((result) => result.passed).length}/${results.length} browser checks passed. Reports: ${output}`);
if (results.some((result) => !result.passed)) process.exitCode = 1;

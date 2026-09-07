import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { afterEach, test } from "node:test";

// Run with: node --test sites/imprint-engine/tests/home-finish.test.mjs
// Plain-object targets exercise GSAP timing/color interpolation, not browser layout.
const version = "3.15.0";
const require = createRequire(import.meta.url);
let gsap;

try {
  ({ gsap } = require("gsap/dist/gsap.js"));
} catch {
  // The site deliberately has no package/build dependency installation.
}

if (gsap?.version !== version) {
  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/gsap@${version}/dist/gsap.min.js`,
    { signal: AbortSignal.timeout(30000) }
  );
  assert.ok(response.ok, `Could not load pinned GSAP: ${response.status}`);
  const module = { exports: {} };
  new Function("module", "exports", await response.text())(module, module.exports);
  ({ gsap } = module.exports);
}

assert.equal(gsap.version, version);
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");

function section(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  assert.ok(startIndex >= 0 && endIndex > startIndex, `Missing source section: ${start}`);
  return source.slice(startIndex, endIndex);
}

const rippleSource = section("function rippleAnimation(", "\nfunction navTheme()");
const finalSource = section("  const homeEndRippleTimeline =", "  let rippleHasPlayed");
const finishSource = section("  const homeFinishDuration =", "  function syncRippleTimeline()");
const initialShadow =
  "rgba(104, 150, 230, 0.32) 0px 0px 32px 0px, rgba(104, 150, 230, 0.24) 0px 0px 32px 0px inset";

function collection(count = 1) {
  const items = Array.from({ length: count }, () => ({
    scale: 1,
    x: 0,
    rotation: 0,
    opacity: 1,
    autoAlpha: 0,
    filter: "none",
    boxShadow: initialShadow,
    clipPath: "none",
  }));
  Object.defineProperties(items, {
    toArray: { value: () => items.slice() },
    css: { value: () => items },
  });
  return items;
}

function fixture() {
  const rings = collection(3);
  const elements = new Map([[".home-end-ripple", rings]]);
  const $ = (selector) => {
    if (!elements.has(selector)) elements.set(selector, collection());
    return elements.get(selector);
  };
  const build = new Function(
    "gsap", "window", "getComputedStyle", "$", "homeClip", "homeClipPath", "$homeEndContent",
    `${rippleSource}\n${finalSource}\n${finishSource}
     return { rippleAnimation, homeEndRippleTimeline, homeFinishTimeline, homeFinishDuration };`
  );
  const result = build(
    gsap, { gsap }, (ring) => ring, $, { progress: 0 }, () => "none", collection(3)
  );
  result.homeFinishTimeline.timeScale(1 / result.homeFinishDuration);
  return { ...result, rings };
}

function snapshot(rings) {
  return rings.map(({ scale, autoAlpha, filter, boxShadow }) => ({
    scale, autoAlpha, filter, boxShadow,
  }));
}

function alphas(shadow) {
  return [...shadow.matchAll(/rgba?\([^)]*\)/g)].map(
    ([color]) => gsap.utils.splitColor(color)[3] ?? 1
  );
}

function finishLifecycle() {
  const finish = fixture();
  const scrub = gsap.timeline({ paused: true }).to({ value: 0 }, { value: 1, duration: 1 });
  scrub.progress(1);
  const clip = { progress: 1 };
  const trigger = { progress: 1 };
  const calls = [];
  const lifecycleSource = section("  function releaseHomeFinishScroll()", "  const homeScrollTrigger =");
  const register = new Function(
    "homeFinishTimeline", "homeFinishDuration", "homeScrubTimeline", "homeScrollTrigger", "homeClip", "$",
    "syncHomeRestingActivity", "syncRippleTimeline", "window",
    `let homeFinishState = "scrub";
     let homeFinishScrollLocked = false;
     ${lifecycleSource}
     return { playHomeFinish, reverseHomeFinish,
       state: () => homeFinishState, locked: () => homeFinishScrollLocked };`
  );
  const lifecycle = register(
    finish.homeFinishTimeline, finish.homeFinishDuration, scrub, trigger, clip, () => ({ css() {} }),
    () => calls.push(["activity", scrub.progress()]),
    () => calls.push(["ripple", scrub.progress()]),
    { lenis: {
      stop: () => calls.push(["stop", scrub.progress()]),
      start: () => calls.push(["start", scrub.progress()]),
    } }
  );
  return { ...finish, ...lifecycle, scrub, trigger, clip, calls };
}

afterEach(() => {
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
});

test("earlier ripple retains its independent fade-out and original styles", () => {
  const { rippleAnimation } = fixture();
  const rings = collection(3);
  const timeline = rippleAnimation(rings);
  assert.equal(timeline.duration(), 1.92);
  timeline.time(0.001);
  assert.ok(rings[0].autoAlpha > 0.4);
  timeline.progress(1);
  for (const ring of rings) {
    assert.equal(ring.scale, 1);
    assert.equal(ring.autoAlpha, 0);
    assert.equal(ring.filter, "none");
    assert.equal(ring.boxShadow, initialShadow);
  }
});

test("final ripple belongs to the finish timeline with finite real-second timing", () => {
  const { homeFinishTimeline: parent, homeEndRippleTimeline: child, rings } = fixture();
  assert.equal(child.parent, parent);
  assert.equal(child.startTime(), 0.27);
  assert.equal(child.timeScale(), 2.5);
  assert.equal(child.duration(), 1.38);
  assert.equal(parent.duration(), 0.9);
  assert.equal(parent.duration() / parent.timeScale(), 2.25);
  assert.equal(child.repeat(), 0);
  let completed = 0;
  parent.eventCallback("onComplete", () => completed++);
  parent.totalTime(0.9, false);
  parent.totalTime(100, false);
  assert.equal(completed, 1);
  rings.forEach((ring, index) => {
    assert.ok(Math.abs(ring.scale - (1.1 - index * 0.3)) < 1e-6);
    assert.equal(ring.autoAlpha, 0.7);
    assert.equal(ring.filter, "blur(2.5rem)");
  });
});

test("forward and reverse frames match, with invisible start and clean replay", () => {
  const { homeFinishTimeline: parent, rings } = fixture();
  const times = [0, 0.2, 0.27, 0.275, 0.3, 0.35, 0.5, 0.65, 0.75, 0.82, 0.9];
  const forward = times.map((time) => {
    parent.time(time);
    return snapshot(rings);
  });
  parent.reverse().pause();
  for (let index = times.length - 1; index >= 0; index--) {
    parent.time(times[index]);
    assert.deepEqual(snapshot(rings), forward[index], `Different frame at ${times[index]}`);
  }
  for (let cycle = 0; cycle < 3; cycle++) {
    parent.progress(1);
    parent.restart().pause();
    assert.ok(rings.every((ring) => ring.autoAlpha === 0));
    assert.ok(rings.every((ring) => ring.filter === "none" && ring.boxShadow === initialShadow));
    parent.time(0.27);
    assert.ok(rings.every((ring) => ring.autoAlpha === 0));
    parent.time(0.271);
    assert.ok(rings[0].autoAlpha > 0 && rings[0].autoAlpha < 0.01);
  }
});

test("shadow alpha remains valid during interpolation and continuous at completion", () => {
  const { homeFinishTimeline: parent, homeEndRippleTimeline: child, rings } = fixture();
  const atRippleTime = (time) => parent.time(child.startTime() + time / child.timeScale());
  for (const time of [0.051, 0.2, 0.5, 0.9, 1.199, 1.2, 1.38]) {
    atRippleTime(time);
    for (const ring of rings) {
      const values = alphas(ring.boxShadow);
      assert.equal(values.length, 2);
      assert.ok(values.every((alpha) => alpha >= 0 && alpha <= 1), ring.boxShadow);
    }
  }
  atRippleTime(0.05 + 1.15 * 0.999);
  const before = alphas(rings[0].boxShadow);
  atRippleTime(0.05 + 1.15);
  const after = alphas(rings[0].boxShadow);
  assert.deepEqual(after, [0.6, 0.45]);
  before.forEach((alpha, index) => assert.ok(Math.abs(alpha - after[index]) < 0.001));
});

test("reverse completion restores current scroll progress before releasing scrolling", () => {
  const current = finishLifecycle();
  const { homeFinishTimeline: parent, trigger, calls, clip } = current;
  current.playHomeFinish();
  parent.totalTime(parent.duration(), false);
  trigger.progress = 0.63;
  current.reverseHomeFinish();
  parent.pause();
  parent.totalTime(0, false);
  assert.equal(current.state(), "scrub");
  assert.equal(current.locked(), false);
  assert.equal(clip.progress, 0);
  assert.equal(parent.paused(), true);
  assert.deepEqual(calls.slice(-3), [["activity", 0.63], ["ripple", 0.63], ["start", 0.63]]);
});

test("immediate native return at time zero cannot leave scrolling locked", () => {
  const current = finishLifecycle();
  current.playHomeFinish();
  assert.equal(current.homeFinishTimeline.time(), 0);
  current.trigger.progress = 0.97;
  current.reverseHomeFinish();
  assert.equal(current.state(), "scrub");
  assert.equal(current.locked(), false);
  assert.equal(current.homeFinishTimeline.paused(), true);
  assert.equal(current.scrub.progress(), 0.97);
  assert.deepEqual(current.calls.at(-1), ["start", 0.97]);
});

test("interrupting either direction resumes the same finish/ripple state", () => {
  const current = finishLifecycle();
  const { homeFinishTimeline: parent, rings, calls } = current;
  current.playHomeFinish();
  parent.pause().time(0.55);
  let before = snapshot(rings);
  current.reverseHomeFinish();
  parent.pause();
  assert.equal(current.state(), "reversing");
  assert.equal(parent.reversed(), true);
  assert.equal(parent.time(), 0.55);
  assert.deepEqual(snapshot(rings), before);
  parent.time(0.45);
  before = snapshot(rings);
  current.playHomeFinish();
  parent.pause();
  assert.equal(current.state(), "playing");
  assert.equal(parent.reversed(), false);
  assert.equal(parent.time(), 0.45);
  assert.deepEqual(snapshot(rings), before);
  assert.equal(calls.filter(([name]) => name === "stop").length, 1);
  assert.equal(calls.filter(([name]) => name === "start").length, 0);
  parent.totalTime(parent.duration(), false);
  assert.equal(current.state(), "complete");
  assert.equal(current.locked(), false);
  assert.equal(calls.filter(([name]) => name === "start").length, 1);
});

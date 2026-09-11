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

if (gsap?.version !== version || !gsap.plugins.attr) {
  const response = await fetch(
    `https://cdn.jsdelivr.net/npm/gsap@${version}/dist/gsap.min.js`,
    { signal: AbortSignal.timeout(30000) }
  );
  assert.ok(response.ok, `Could not load pinned GSAP: ${response.status}`);
  const module = { exports: {} };
  // A window object enables GSAP's built-in AttrPlugin for SVG attribute stubs.
  new Function("module", "exports", "window", await response.text())(module, module.exports, {});
  ({ gsap } = module.exports);
}

assert.equal(gsap.version, version);
const source = (await readFile(new URL("../src/script.js", import.meta.url), "utf8")).replace(/\r\n/g, "\n");

function section(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  assert.ok(startIndex >= 0 && endIndex > startIndex, `Missing source section: ${start}`);
  return source.slice(startIndex, endIndex);
}

const rippleSource = section("function rippleAnimation(", "\nfunction navTheme()");
const dropTextSource = section("function dropTextAnimation()", "\nfunction rippleAnimation(");
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
    not: { value: () => items },
    css: { value: (name, value) => {
      items.forEach((element) => { element[name] = value === "" ? "none" : value; });
      return items;
    } },
  });
  return items;
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

function dropTextFixture({ count = 2, ringCount = 3, hasGsap = true, hasScrollTrigger = true } = {}) {
  const layouts = Array.from({ length: count }, () => ({ rings: collection(ringCount) }));
  layouts.forEach(({ rings }) => rings.forEach((ring) => {
    ring.boxShadow =
      "rgba(137, 62, 213, 0.16) 0px 0px 16px 0px, rgba(137, 62, 213, 0.1) 0px 0px 16px 0px inset";
  }));
  Object.defineProperty(layouts, "each", {
    value: (callback) => layouts.forEach((layout, index) => callback.call(layout, index, layout)),
  });
  const $ = (target) => {
    if (target === "[drop-text-layout]") return layouts;
    assert.ok(layouts.includes(target), "A ripple lookup escaped its layout");
    return { find: (selector) => {
      assert.equal(selector, "[drop-text-ripple]");
      return target.rings;
    } };
  };
  const timelines = [];
  const triggers = [];
  const cleared = [];
  const trackedGsap = {
    ...gsap,
    registerPlugin() {},
    timeline: (options) => {
      const timeline = gsap.timeline(options);
      timelines.push(timeline);
      return timeline;
    },
    set: (targets, options) => {
      // Browser CSS removal is represented by the exact requested properties.
      if (options.clearProps) {
        cleared.push({ targets, properties: options.clearProps.split(",") });
        return;
      }
      return gsap.set(targets, options);
    },
  };
  const ScrollTrigger = {
    create: (options) => {
      const trigger = { options, killed: false, kill() { this.killed = true; } };
      triggers.push(trigger);
      return trigger;
    },
  };
  const build = new Function(
    "gsap", "window", "ScrollTrigger", "$", "getComputedStyle",
    `${rippleSource}\n${dropTextSource}\nreturn dropTextAnimation();`
  );
  const cleanup = build(
    trackedGsap,
    { gsap: hasGsap ? trackedGsap : null, ScrollTrigger: hasScrollTrigger ? ScrollTrigger : null },
    ScrollTrigger, $, (ring) => ring
  );
  return { cleanup, layouts, timelines, triggers, cleared };
}

afterEach(() => {
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
});

function scheduleFixture(homeMotion) {
  return new Function("gsap", "homeMotion", `${section("  const homeTimeline =", "  // 01 — First scene and sphere framing.")}
    return { homeTimeline, addHomeStep, addHomeGroup };`)(gsap, homeMotion);
}

test("named steps follow the preceding movement including stagger and a fractional delay", () => {
  const current = scheduleFixture({ scene: { start: 0.1 } });
  current.addHomeGroup("scene", (group) => {
    current.addHomeStep(group, "move", collection(3), { x: 0 }, { x: 100 },
      { start: 0, duration: 0.2, ease: "power1.in", stagger: 0.025 });
    current.addHomeStep(group, "next", { x: 0 }, { x: 0 }, { x: 10 },
      { start: "move:end+=0.02", duration: 0.1, ease: "power1.in" });
  });
  assert.ok(Math.abs(current.homeTimeline.labels["scene.move:end"] - 0.35) < 1e-8);
  assert.ok(Math.abs(current.homeTimeline.labels["scene.next"] - 0.37) < 1e-8);
});

test("greater-than and delayed greater-than positions work inside a group", () => {
  const current = scheduleFixture({ scene: { start: 0 } });
  current.addHomeGroup("scene", (group) => {
    for (const [name, start] of [["one", 0], ["two", ">"], ["three", ">+=0.03"]]) {
      current.addHomeStep(group, name, { x: 0 }, { x: 0 }, { x: 1 },
        { start, duration: 0.1, ease: "power1.in" });
    }
  });
  assert.equal(current.homeTimeline.labels["scene.two"], 0.1);
  assert.equal(current.homeTimeline.labels["scene.three"], 0.23);
});

test("group links follow changed durations without moving an independent percentage group", () => {
  for (const duration of [0.1, 0.2, 0.3]) {
    const current = scheduleFixture({ first: { start: 0.1 }, linked: { start: "first.move:end+=0.02" }, fixed: { start: 0.6 } });
    const build = (name, length) => current.addHomeGroup(name, (group) => current.addHomeStep(
      group, "move", { x: 0 }, { x: 0 }, { x: 1 }, { start: 0, duration: length, ease: "power1.in" }
    ));
    build("first", duration); build("linked", 0.1); build("fixed", 0.1);
    assert.ok(Math.abs(current.homeTimeline.labels.linked - (0.12 + duration)) < 1e-8);
    assert.equal(current.homeTimeline.labels.fixed, 0.6);
  }
});

test("each step's ease remains independent and its frames are reversible", () => {
  const current = scheduleFixture({ scene: { start: 0 } });
  const linear = { x: 0 }, eased = { x: 0 };
  current.addHomeGroup("scene", (group) => {
    current.addHomeStep(group, "linear", linear, { x: 0 }, { x: 100 }, { start: 0, duration: 0.2, ease: "none" });
    current.addHomeStep(group, "eased", eased, { x: 0 }, { x: 100 }, { start: "<", duration: 0.2, ease: "power1.in" });
  });
  current.homeTimeline.time(0.1);
  assert.equal(linear.x, 50); assert.equal(eased.x, 25);
  current.homeTimeline.time(0.2).time(0.1);
  assert.equal(linear.x, 50); assert.equal(eased.x, 25);
});

test("missing optional targets retain their group's timing labels", () => {
  const current = scheduleFixture({ optional: { start: 0.3 } });
  current.addHomeGroup("optional", (group) => current.addHomeStep(group, "move", [], {}, {},
    { start: 0, duration: 0.2, ease: "power1.in" }));
  assert.equal(current.homeTimeline.labels["optional.move:end"], 0.5);
});

test("responsive drop sizing preserves its artwork proportions and line-contact point", () => {
  const svg = { matrix: null, em: 16, getScreenCTM() { return this.matrix; } };
  const transform = new Function("$", "getComputedStyle", "homeMotion",
    `${section("  function finalGradientDropTransform()", "  const gradientRingPoints =")} return finalGradientDropTransform;`
  )(() => [svg], () => ({ fontSize: `${svg.em}px` }), { drop: { resize: { widthEm: 6.5 } } });
  assert.equal(transform(), "translate(640 59) scale(0.72)");
  for (const [a, b, em] of [[0.7, 0, 16], [1, 0, 16], [1.8, 0, 20], [0, 2, 16]]) {
    svg.matrix = { a, b }; svg.em = em;
    const [x, y, scale] = transform().match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi).map(Number);
    assert.ok(Math.abs(223 * scale * Math.hypot(a, b) - 6.5 * em) < 1e-6);
    assert.ok(Math.abs(x + 111.1 * scale - 720) < 1e-6);
    assert.ok(Math.abs(y + 168.0556 * scale + 150 - 330) < 1e-6);
  }
});

test("clip geometry is finite across viewport sizes and closes without a residual edge", () => {
  const build = new Function("homeClipBounds", `${section("  function homeClipPath(progress)", "  function moveGradientDots()")}
    return homeClipPath;`);
  for (const [width, height] of [[1440, 900], [1024, 768], [1920, 1080], [1000, 1200]]) {
    const clip = build({ width, height, centerY: height * 0.4 });
    for (const progress of [0, 0.001, 0.249, 0.25, 0.251, 0.5, 0.749, 0.75, 0.751, 0.999]) {
      const value = clip(progress);
      assert.ok(value.startsWith("polygon("));
      assert.ok(!/NaN|Infinity/.test(value));
      assert.equal(value.split(",").length, 8);
    }
    assert.equal(clip(1), "inset(0 100% 0 0)");
  }
});

test("shared non-home ripple behavior retains its original duration and style restoration", () => {
  const rippleAnimation = new Function("gsap", "window", "getComputedStyle", `${rippleSource} return rippleAnimation;`)(gsap, { gsap }, (el) => el);
  const rings = collection(3);
  const timeline = rippleAnimation(rings);
  assert.equal(timeline.duration(), 1.92);
  timeline.time(0.001);
  assert.ok(rings[0].autoAlpha > 0.4);
  timeline.progress(1);
  for (const ring of rings) {
    assert.equal(ring.scale, 1); assert.equal(ring.autoAlpha, 0);
    assert.equal(ring.filter, "none"); assert.equal(ring.boxShadow, initialShadow);
  }
});

test("drop-text animation initializes globally and skips missing layouts, rings, or libraries", () => {
  const names = ["initLenis", "navTheme", "accordionOne", "filterOne", "catalogueAnimation", "dropTextAnimation", "flexGrowAnimation", "onDesktop", "onMobile"];
  const calls = [];
  new Function(...names, `${section("function initSite()", "\n$(initSite);")}\ninitSite();`)(
    ...names.map((name) => () => calls.push(name))
  );
  assert.equal(calls.filter((name) => name === "dropTextAnimation").length, 1);
  assert.ok(calls.indexOf("dropTextAnimation") < calls.indexOf("onDesktop"));
  for (const options of [{ count: 0 }, { ringCount: 0 }, { hasGsap: false }, { hasScrollTrigger: false }]) {
    const current = dropTextFixture(options);
    assert.equal(current.cleanup, null);
    assert.equal(current.triggers.length, 0);
    assert.equal(current.timelines.length, 0);
  }
});

test("drop-text layouts play independently at the viewport midpoint and retain the endpoint", () => {
  const { layouts, timelines, triggers } = dropTextFixture();
  assert.equal(triggers.length, 2);
  triggers.forEach(({ options }, index) => {
    assert.equal(options.trigger, layouts[index]);
    assert.equal(options.start, "top 50%");
    assert.equal(options.scrub, undefined);
    assert.equal(options.onLeave, undefined);
    assert.equal(options.onEnterBack, undefined);
  });
  assert.ok(layouts.every(({ rings }) => rings.every((ring) => ring.autoAlpha === 0)));
  triggers[0].options.onEnter();
  timelines[0].pause().time(0.7);
  assert.ok(layouts[0].rings.every((ring) => ring.autoAlpha > 0));
  assert.ok(layouts[1].rings.every((ring) => ring.autoAlpha === 0));
  timelines[0].progress(1);
  assert.equal(timelines[0].duration(), 1.38);
  assert.equal(timelines[0].repeat(), 0);
  layouts[0].rings.forEach((ring, index) => {
    assert.ok(Math.abs(ring.scale - (1.1 - index * 0.3)) < 1e-6);
    assert.equal(ring.autoAlpha, 0.7);
    assert.equal(ring.filter, "blur(1.2rem)");
  });
  const endpoint = snapshot(layouts[0].rings);
  triggers[0].options.onEnter();
  timelines[0].pause();
  assert.deepEqual(snapshot(layouts[0].rings), endpoint);
});

test("drop-text direction changes resume from the current frame and reverse to hidden", () => {
  const { layouts, timelines, triggers } = dropTextFixture({ count: 1 });
  const [timeline] = timelines;
  const { rings } = layouts[0];
  const initialShadow = rings[0].boxShadow;
  triggers[0].options.onEnter();
  timeline.pause().time(0.8);
  const beforeReverse = snapshot(rings);
  triggers[0].options.onLeaveBack();
  timeline.pause();
  assert.equal(timeline.time(), 0.8);
  assert.equal(timeline.reversed(), true);
  assert.deepEqual(snapshot(rings), beforeReverse);
  timeline.time(0.4);
  const beforePlay = snapshot(rings);
  triggers[0].options.onEnter();
  timeline.pause();
  assert.equal(timeline.time(), 0.4);
  assert.equal(timeline.reversed(), false);
  assert.deepEqual(snapshot(rings), beforePlay);
  timeline.progress(1);
  triggers[0].options.onLeaveBack();
  timeline.pause().time(0);
  assert.ok(rings.every((ring) => ring.scale === 0.08 && ring.autoAlpha === 0));
  assert.ok(rings.every((ring) => ring.filter === "none" && ring.boxShadow === initialShadow));
});

test("drop-text purple shadows interpolate continuously without invalid percentage alpha", () => {
  const { layouts, timelines } = dropTextFixture({ count: 1 });
  const [timeline] = timelines;
  const { rings } = layouts[0];
  for (const time of [0.1, 0.3, 0.7, 1.199, 1.2, 1.38]) {
    timeline.time(time);
    for (const ring of rings) {
      for (const [color] of ring.boxShadow.matchAll(/rgba?\([^)]*\)/g)) {
        const [red, green, blue, alpha] = gsap.utils.splitColor(color);
        assert.deepEqual([red, green, blue], [137, 62, 213]);
        assert.ok(alpha >= 0 && alpha <= 1);
      }
    }
  }
  assert.deepEqual(alphas(rings[0].boxShadow), [0.35, 0.25]);
});

test("drop-text cleanup kills its triggers and timelines and clears only its rings", () => {
  const { cleanup, layouts, timelines, triggers, cleared } = dropTextFixture();
  triggers.forEach(({ options }) => options.onEnter());
  timelines.forEach((timeline) => timeline.pause().time(0.5));
  cleanup();
  assert.ok(triggers.every((trigger) => trigger.killed));
  assert.ok(timelines.every((timeline) => timeline.parent === null));
  assert.equal(cleared.length, 2);
  cleared.forEach(({ targets, properties }, index) => {
    assert.equal(targets, layouts[index].rings);
    assert.deepEqual(properties, ["transform", "opacity", "visibility", "filter", "box-shadow"]);
  });
});

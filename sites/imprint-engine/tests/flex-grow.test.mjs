import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { afterEach, test } from "node:test";

// Actual GSAP timing with DOM/jQuery stand-ins; browser checks cover flex layout.
const require = createRequire(import.meta.url);
let gsap;
try {
  ({ gsap } = require("gsap/dist/gsap.js"));
} catch {}
if (gsap?.version !== "3.15.0") {
  const response = await fetch("https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js", {
    signal: AbortSignal.timeout(30000),
  });
  assert.ok(response.ok, `Could not load GSAP: ${response.status}`);
  const module = { exports: {} };
  new Function("module", "exports", "window", await response.text())(module, module.exports, {});
  ({ gsap } = module.exports);
}
const source = await readFile(new URL("../src/script.js", import.meta.url), "utf8");
const start = source.indexOf("function flexGrowAnimation()");
const end = source.indexOf("\nfunction dropTextAnimation()", start);
assert.ok(start >= 0 && end > start);
const animationSource = source.slice(start, end);

function node(className, attributes = {}, children = []) {
  const element = {
    classes: new Set(className.split(" ")),
    attributes: new Map(Object.entries(attributes)),
    children,
    events: new Map(),
    autoAlpha: 0,
    naturalHeight: 60,
    width: 320,
    fontSize: 16,
  };
  const styles = new Map();
  const writeStyle = () => {
    const value = [...styles].map(([property, entry]) => `${property}: ${entry.value}${entry.priority ? " !important" : ""};`).join(" ");
    if (value) element.attributes.set("style", value);
    else element.attributes.delete("style");
  };
  element.setStyleText = (text) => {
    styles.clear();
    for (const declaration of (text || "").split(";")) {
      const [property, ...parts] = declaration.split(":");
      if (!parts.length) continue;
      const value = parts.join(":").trim();
      styles.set(property.trim(), { value: value.replace(/\s*!important$/, ""), priority: value.endsWith("!important") ? "important" : "" });
    }
  };
  element.setStyleText(attributes.style);
  element.style = {
    getPropertyValue: (property) => styles.get(property)?.value || "",
    getPropertyPriority: (property) => styles.get(property)?.priority || "",
    setProperty: (property, value, priority = "") => {
      styles.set(property, { value: String(value), priority });
      writeStyle();
    },
    removeProperty: (property) => {
      styles.delete(property);
      writeStyle();
    },
  };
  for (const [property, cssName] of [["height", "height"], ["marginTop", "margin-top"], ["flexGrow", "flex-grow"]]) {
    Object.defineProperty(element, property, {
      get: () => {
        const value = element.style.getPropertyValue(cssName);
        return value === "auto" ? value : parseFloat(value) || 0;
      },
      set: (value) => element.style.setProperty(cssName, value),
    });
  }
  return element;
}

function outerHeight(element, includeMargin = false) {
  if (!element) return undefined;
  const inline = element.style.getPropertyValue("height");
  if (inline && inline !== "auto") return parseFloat(inline);
  if (element.classes.has("flex-grow-item-img")) return element.classes.has("active") ? element.width / 2 : 0;
  if (element.classes.has("flex-grow-item-content")) {
    return Math.max(0, ...element.children.filter((child) => !child.classes.has("flex-grow-item-copy") || child.classes.has("active")).map((child) => outerHeight(child, true)));
  }
  return element.naturalHeight + (includeMargin ? element.verticalMargins || 0 : 0);
}

function wrap(elements) {
  const values = [...elements];
  const matches = (element, selector) => element.classes.has(selector.slice(1));
  Object.defineProperties(values, {
    toArray: { value: () => values.slice() },
    first: { value: () => wrap(values.slice(0, 1)) },
    each: { value: (callback) => {
      values.forEach((element, index) => callback.call(element, index, element));
      return values;
    } },
    children: { value: (selector) => wrap(values.flatMap((element) => element.children).filter((element) => matches(element, selector))) },
    find: { value: (selector) => {
      const descend = (element) => element.children.flatMap((child) => [child, ...descend(child)]);
      return wrap(values.flatMap(descend).filter((element) => matches(element, selector)));
    } },
    add: { value: (other) => wrap(new Set([...values, ...other])) },
    hasClass: { value: (name) => values.some((element) => element.classes.has(name)) },
    outerHeight: { value: (includeMargin) => outerHeight(values[0], includeMargin) },
    outerWidth: { value: () => values[0]?.width },
    css: { value: (property) => {
      const element = values[0];
      if (!element) return undefined;
      if (property === "font-size") return `${element.fontSize}px`;
      if (property === "margin-top") return element.style.getPropertyValue(property) || (element.classes.has("active") ? `${element.fontSize}px` : "0px");
      throw new Error(`Unexpected CSS property: ${property}`);
    } },
    toggleClass: { value: (name, enabled) => {
      values.forEach((element) => enabled ? element.classes.add(name) : element.classes.delete(name));
      return values;
    } },
    attr: { value: (name, value) => {
      if (typeof name === "string" && value === undefined) return values[0]?.attributes.get(name);
      const entries = typeof name === "object" ? Object.entries(name) : [[name, value]];
      values.forEach((element) => entries.forEach(([key, entry]) => {
        element.attributes.set(key, String(entry));
        if (key === "style") element.setStyleText(String(entry));
      }));
      return values;
    } },
    removeAttr: { value: (name) => {
      values.forEach((element) => {
        element.attributes.delete(name);
        if (name === "style") element.setStyleText("");
      });
      return values;
    } },
    on: { value: (names, callback) => {
      values.forEach((element) => names.split(" ").forEach((name) => element.events.set(name, callback)));
      return values;
    } },
    off: { value: (namespace) => {
      values.forEach((element) => [...element.events.keys()].forEach((name) => {
        if (name.endsWith(namespace)) element.events.delete(name);
      }));
      return values;
    } },
  });
  return values;
}

function fixture({ blockCount = 2, itemCount = 4, activeItems = [], activeImages = [0], images = true, copies = true, contents = true, hasGsap = true, viewportWidth = 1280, loadingFonts = false } = {}) {
  const blocks = Array.from({ length: blockCount }, () => {
    const items = Array.from({ length: itemCount }, (_, index) => {
      const copy = node("flex-grow-item-copy", { style: "color: purple;" });
      copy.naturalHeight = 100;
      const title = node("text-grow-item-title");
      const content = node("flex-grow-item-content", { style: "color: blue;" }, copies ? [title, copy] : [title]);
      const image = node(`flex-grow-item-img${activeImages.includes(index) ? " active" : ""}`);
      const item = node(`flex-grow-item${activeItems.includes(index) ? " active" : ""}`, {
        ...(index === 0 ? { role: "group", tabindex: "-1", "aria-expanded": "mixed", style: "color: red;" } : {}),
      }, [...(contents ? [content] : []), ...(images ? [image] : [])]);
      item.image = image;
      item.copy = copy;
      item.content = content;
      item.title = title;
      return item;
    });
    return node("flex-grow-block", {}, items);
  });
  const $ = (target) => {
    if (typeof target === "string") {
      assert.equal(target, ".flex-grow-block");
      return wrap(blocks);
    }
    return wrap(Array.isArray(target) ? target : target ? [target] : []);
  };
  const timelines = [];
  const trackedGsap = {
    ...gsap,
    timeline: (...args) => {
      const timeline = gsap.timeline(...args);
      timelines.push(timeline);
      return timeline;
    },
  };
  const all = blocks.flatMap((block) => block.children.flatMap((item) => [item, item.image, item.copy, item.content]));
  const original = all.map((element) => ({ element, active: element.classes.has("active"), attributes: [...element.attributes] }));
  const listeners = new Map();
  const frames = new Map();
  let frameId = 0;
  let finishFonts;
  const fontReady = loadingFonts ? new Promise((resolve) => { finishFonts = resolve; }) : null;
  const window = {
    gsap: hasGsap ? trackedGsap : null,
    document: fontReady ? { fonts: { ready: fontReady } } : {},
    innerWidth: viewportWidth,
    matchMedia: (query) => {
      assert.equal(query, "(max-width: 767px)");
      return { matches: window.innerWidth <= 767 };
    },
    addEventListener: (type, callback) => listeners.set(type, callback),
    removeEventListener: (type, callback) => {
      if (listeners.get(type) === callback) listeners.delete(type);
    },
    requestAnimationFrame: (callback) => {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const cleanup = new Function("gsap", "window", "$", `${animationSource}\nreturn flexGrowAnimation();`)(
    trackedGsap, window, $
  );
  const resize = (width) => {
    window.innerWidth = width;
    listeners.get("resize")?.();
  };
  const flushResize = () => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback());
  };
  const loadFonts = async () => {
    finishFonts?.();
    await fontReady;
  };
  return { blocks, timelines, original, cleanup, resize, flushResize, frames, listeners, loadFonts };
}

function emit(element, type, extra = {}) {
  const event = { target: element, prevented: false, preventDefault() { this.prevented = true; }, ...extra };
  for (const [name, callback] of element.events) {
    if (name.split(".")[0] === type) callback.call(element, event);
  }
  return event;
}

function assertActive(block, activeIndex) {
  block.children.forEach((item, index) => {
    const active = index === activeIndex;
    assert.equal(item.classes.has("active"), active);
    assert.equal(item.image.classes.has("active"), active);
    assert.equal(item.copy.classes.has("active"), active);
    assert.equal(item.attributes.get("aria-expanded"), String(active));
  });
}

afterEach(() => {
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
});

test("flex-grow initializes globally before desktop/mobile branches", () => {
  const names = ["initLenis", "navTheme", "accordionOne", "filterOne", "catalogueAnimation", "dropTextAnimation", "flexGrowAnimation", "onDesktop", "onMobile"];
  const calls = [];
  const init = source.slice(source.indexOf("function initSite()"), source.indexOf("\n$(initSite);"));
  new Function(...names, `${init}\ninitSite();`)(...names.map((name) => () => calls.push(name)));
  assert.equal(calls.filter((name) => name === "flexGrowAnimation").length, 1);
  assert.ok(calls.indexOf("flexGrowAnimation") < calls.indexOf("onDesktop"));
});

test("authored active item wins, then active image, then first valid item", () => {
  for (const [options, expected] of [[{ activeItems: [2, 3], activeImages: [0] }, 2], [{ activeImages: [3] }, 3], [{ activeImages: [] }, 0]]) {
    const current = fixture(options);
    current.blocks.forEach((block) => {
      assertActive(block, expected);
      block.children.forEach((item, index) => {
        assert.equal(item.flexGrow, index === expected ? 1 : 0);
        assert.equal(item.image.flexGrow, item.flexGrow);
        assert.equal(item.copy.autoAlpha, index === expected ? 1 : 0);
        assert.equal(item.attributes.get("role"), "button");
        assert.equal(item.attributes.get("tabindex"), "0");
      });
    });
    current.cleanup();
  }
});

test("hover grows item and image together while synchronizing the copy fade", () => {
  const { blocks, timelines } = fixture();
  const [block] = blocks;
  emit(block.children[1], "mouseenter");
  assertActive(block, 1);
  const timeline = timelines.at(-1);
  timeline.pause().time(0.15);
  assert.equal(timeline.duration(), 0.3);
  assert.equal(block.children[0].flexGrow, 0.75);
  assert.equal(block.children[1].flexGrow, 0.25);
  block.children.forEach((item, index) => {
    assert.equal(item.flexGrow, item.image.flexGrow);
    assert.equal(item.copy.autoAlpha, index === 1 ? 1 : 0);
  });
  assertActive(blocks[1], 0);
  timeline.progress(1);
  emit(block.children[1], "mouseleave");
  emit(block.children[1], "mouseenter");
  assertActive(block, 1);
  assert.equal(timelines.length, 1);
});

test("rapid hover interrupts without resetting current growth", () => {
  const { blocks: [block], timelines } = fixture({ blockCount: 1 });
  emit(block.children[1], "mouseenter");
  const previous = timelines.at(-1);
  previous.pause().time(0.15);
  const before = block.children.map((item) => item.flexGrow);
  emit(block.children[2], "mouseenter");
  const current = timelines.at(-1);
  current.pause();
  assert.equal(previous.parent, null);
  assert.deepEqual(block.children.map((item) => item.flexGrow), before);
  current.time(0.15);
  assert.equal(block.children[0].flexGrow, 0.5625);
  assert.equal(block.children[1].flexGrow, 0.1875);
  assert.equal(block.children[2].flexGrow, 0.25);
  current.progress(1);
  assertActive(block, 2);
  assert.deepEqual(block.children.map((item) => item.flexGrow), [0, 0, 1, 0]);
});

test("mobile opens a full-width 2:1 image below the text without desktop growth", () => {
  const { blocks: [block], timelines } = fixture({ blockCount: 1, viewportWidth: 390 });
  assertActive(block, 0);
  block.children.forEach((item, index) => {
    assert.equal(item.content.height, index === 0 ? 100 : 60);
    assert.equal(item.image.height, index === 0 ? 160 : 0);
    assert.equal(item.image.marginTop, index === 0 ? 16 : 0);
    assert.equal(item.style.getPropertyValue("flex-grow"), "");
    assert.equal(item.image.style.getPropertyValue("flex-grow"), "");
  });

  emit(block.children[1], "click");
  const timeline = timelines.at(-1);
  timeline.pause();
  assert.equal(block.children[0].content.height, 100);
  assert.equal(block.children[0].image.height, 160);
  assert.equal(block.children[1].content.height, 60);
  assert.equal(block.children[1].image.height, 0);
  timeline.time(0.15);
  assert.equal(timeline.duration(), 0.3);
  assert.deepEqual(block.children.map((item) => item.content.height), [90, 70, 60, 60]);
  assert.deepEqual(block.children.map((item) => item.image.height), [120, 40, 0, 0]);
  assert.deepEqual(block.children.map((item) => item.image.marginTop), [12, 4, 0, 0]);
  assert.deepEqual(block.children.map((item) => item.copy.autoAlpha), [0, 1, 0, 0]);
  timeline.progress(1);
  assertActive(block, 1);
  assert.deepEqual(block.children.map((item) => item.content.height), [60, 100, 60, 60]);
  assert.deepEqual(block.children.map((item) => item.image.height), [0, 160, 0, 0]);
  assert.deepEqual(block.children.map((item) => item.image.marginTop), [0, 16, 0, 0]);
});

test("rapid mobile taps preserve the currently rendered text, image and spacing", () => {
  const { blocks: [block], timelines } = fixture({ blockCount: 1, viewportWidth: 767 });
  emit(block.children[1], "click");
  const previous = timelines.at(-1);
  previous.pause().time(0.15);
  const currentSizes = () => block.children.map((item) => [item.content.height, item.image.height, item.image.marginTop]);
  const before = currentSizes();
  emit(block.children[2], "click");
  const current = timelines.at(-1);
  current.pause();
  assert.equal(previous.parent, null);
  assert.deepEqual(currentSizes(), before);
  current.time(0.15);
  assert.deepEqual(currentSizes(), [[82.5, 90, 9], [67.5, 30, 3], [70, 40, 4], [60, 0, 0]]);
  current.progress(1);
  assertActive(block, 2);
  assert.deepEqual(currentSizes(), [[60, 0, 0], [60, 0, 0], [100, 160, 16], [60, 0, 0]]);
});

test("mobile resize remeasures wrapped text, image ratio and em spacing without changing the active item", () => {
  const { blocks: [block], timelines, resize, flushResize, frames } = fixture({ blockCount: 1, viewportWidth: 390 });
  emit(block.children[1], "click");
  const previous = timelines.at(-1);
  previous.pause().time(0.1);
  resize(390);
  assert.equal(frames.size, 0, "mobile address-bar height changes must not settle an in-flight transition");
  assert.notEqual(previous.parent, null);
  block.children.forEach((item) => {
    item.title.naturalHeight = 80;
    item.copy.naturalHeight = 135;
    item.copy.verticalMargins = 5;
    item.image.width = 440;
    item.image.fontSize = 18;
  });
  resize(510);
  resize(511);
  assert.equal(frames.size, 1);
  flushResize();
  assert.equal(previous.parent, null);
  assert.equal(timelines.length, 1);
  assertActive(block, 1);
  assert.deepEqual(block.children.map((item) => item.content.height), [80, 140, 80, 80]);
  assert.deepEqual(block.children.map((item) => item.image.height), [0, 220, 0, 0]);
  assert.deepEqual(block.children.map((item) => item.image.marginTop), [0, 18, 0, 0]);

  block.children[1].copy.naturalHeight = 40;
  resize(600);
  flushResize();
  assert.equal(block.children[1].content.height, 80, "short copy cannot make the title overflow its row");
});

test("crossing the 767px breakpoint restores mode-owned styles and preserves selection", () => {
  const { blocks: [block], timelines, resize, flushResize } = fixture({ blockCount: 1, viewportWidth: 768 });
  emit(block.children[2], "click");
  timelines.at(-1).pause().time(0.1);
  resize(767);
  flushResize();
  assertActive(block, 2);
  block.children.forEach((item, index) => {
    assert.equal(item.style.getPropertyValue("flex-grow"), "");
    assert.equal(item.image.style.getPropertyValue("flex-grow"), "");
    assert.equal(item.content.height, index === 2 ? 100 : 60);
    assert.equal(item.image.height, index === 2 ? 160 : 0);
  });
  emit(block.children[1], "click");
  timelines.at(-1).pause().time(0.1);
  resize(768);
  flushResize();
  assertActive(block, 1);
  block.children.forEach((item, index) => {
    assert.equal(item.content.style.getPropertyValue("height"), "");
    assert.equal(item.image.style.getPropertyValue("height"), "");
    assert.equal(item.image.style.getPropertyValue("margin-top"), "");
    assert.equal(item.content.style.getPropertyValue("color"), "blue");
    assert.equal(item.flexGrow, index === 1 ? 1 : 0);
    assert.equal(item.image.flexGrow, item.flexGrow);
  });
  emit(block.children[3], "mouseenter");
  timelines.at(-1).pause().time(0.15);
  assert.equal(block.children[1].flexGrow, 0.75);
  assert.equal(block.children[3].flexGrow, 0.25);
});

test("late font loading remeasures mobile text without a width change and cannot run after cleanup", async () => {
  const current = fixture({ blockCount: 1, viewportWidth: 390, loadingFonts: true });
  const [block] = current.blocks;
  assert.equal(block.children[0].content.height, 100);
  block.children[0].copy.naturalHeight = 150;
  block.children[1].title.naturalHeight = 75;
  await current.loadFonts();
  assert.equal(current.frames.size, 1);
  current.flushResize();
  assert.equal(block.children[0].content.height, 150);
  assert.equal(block.children[1].content.height, 75);
  assertActive(block, 0);
  current.cleanup();

  const destroyed = fixture({ blockCount: 1, viewportWidth: 390, loadingFonts: true });
  destroyed.cleanup();
  await destroyed.loadFonts();
  assert.equal(destroyed.frames.size, 0);
  destroyed.original.forEach(({ element, attributes }) => assert.deepEqual([...element.attributes], attributes));
});

test("mobile cleanup cancels pending refresh and restores content styles along with other targets", () => {
  const { blocks: [block], timelines, original, cleanup, resize, frames, listeners, flushResize } = fixture({ blockCount: 1, viewportWidth: 390 });
  emit(block.children[2], "click");
  timelines.at(-1).pause().time(0.1);
  resize(768);
  assert.equal(frames.size, 1);
  cleanup();
  assert.equal(frames.size, 0);
  assert.equal(listeners.size, 0);
  assert.ok(timelines.every((timeline) => timeline.parent === null));
  flushResize();
  original.forEach(({ element, active, attributes }) => {
    assert.equal(element.classes.has("active"), active);
    assert.deepEqual([...element.attributes], attributes);
  });
});

test("focus, click, Enter and Space activate items without intercepting child keyboard controls", () => {
  const { blocks: [block], timelines } = fixture({ blockCount: 1 });
  emit(block.children[1], "focusin");
  assertActive(block, 1);
  emit(block.children[2], "click");
  assertActive(block, 2);
  assert.equal(emit(block.children[3], "keydown", { key: "Enter" }).prevented, true);
  assertActive(block, 3);
  assert.equal(emit(block.children[0], "keydown", { key: " " }).prevented, true);
  assertActive(block, 0);
  const count = timelines.length;
  assert.equal(emit(block.children[1], "keydown", { key: "Enter", target: block.children[1].copy }).prevented, false);
  emit(block.children[1], "keydown", { key: "Escape" });
  assertActive(block, 0);
  assert.equal(timelines.length, count);
});

test("cleanup kills the animation and restores original classes, inline styles and accessibility attributes", () => {
  const { blocks, timelines, original, cleanup } = fixture();
  const first = blocks[0].children[0];
  first.events.set("click.otherFeature", () => {});
  emit(blocks[0].children[2], "mouseenter");
  timelines.at(-1).pause().time(0.1);
  original.forEach(({ element }) => element.attributes.set("style", "flex-grow: 0.5; opacity: 0.5;"));
  cleanup();
  assert.ok(timelines.every((timeline) => timeline.parent === null));
  original.forEach(({ element, active, attributes }) => {
    assert.equal(element.classes.has("active"), active);
    assert.deepEqual([...element.attributes], attributes);
    assert.ok([...element.events.keys()].every((name) => !name.endsWith(".flexGrowAnimation")));
  });
  assert.equal(first.events.has("click.otherFeature"), true);
});

test("missing blocks, items, images or GSAP are safe; missing copies still allows growth", () => {
  for (const options of [{ blockCount: 0 }, { itemCount: 0 }, { images: false }, { hasGsap: false }]) {
    const current = fixture(options);
    assert.equal(current.cleanup, null);
    assert.equal(current.timelines.length, 0);
  }
  const { blocks: [block], timelines } = fixture({ blockCount: 1, copies: false });
  emit(block.children[2], "click");
  timelines.at(-1).pause().progress(1);
  assert.equal(block.children[2].flexGrow, 1);
  assert.equal(block.children[2].image.flexGrow, 1);

  for (const missing of [{ copies: false }, { contents: false }]) {
    const mobile = fixture({ blockCount: 1, viewportWidth: 390, ...missing });
    emit(mobile.blocks[0].children[2], "click");
    mobile.timelines.at(-1).pause().progress(1);
    assert.equal(mobile.blocks[0].children[2].image.height, 160);
    mobile.cleanup();
  }
});

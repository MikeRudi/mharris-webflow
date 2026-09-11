import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHomePreview } from "./preview-server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { server, url } = await createHomePreview({ port: 0 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [], results = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.addInitScript(() => {
  window.footerDraws = 0;
  window.longTasks = [];
  new PerformanceObserver((list) => longTasks.push(...list.getEntries().map(({startTime,duration}) => ({startTime,duration})))).observe({type:"longtask",buffered:true});
  const draw = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    if (this.canvas.hasAttribute("footer-pixel-canvas")) window.footerDraws++;
    return draw.apply(this, args);
  };
});
async function check(name, action) {
  try { await action(); results.push({name, passed:true}); console.log(`PASS ${name}`); }
  catch (error) { results.push({name, passed:false}); console.error(`FAIL ${name}: ${error.stack}`); }
}
async function activate(selector, index, key) {
  await page.locator(selector).nth(index).evaluate((element) => element.focus({preventScroll:true}));
  await page.keyboard.press(key);
  await page.waitForTimeout(600);
}
async function scrollFooter() {
  await page.evaluate(() => lenis.scrollTo(document.querySelector("[footer-svg-engine]").getBoundingClientRect().top + scrollY - 150, {immediate:true,force:true}));
  await page.waitForTimeout(600);
}
async function hoverFooter() {
  const box = await page.locator("[footer-svg-engine]").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(60);
}
try {
  await page.goto(url, {waitUntil:"domcontentloaded"});
  await page.waitForFunction(() => window.ScrollTrigger?.getById("home-scroll"));
  await page.waitForTimeout(2100);
  await check("footer is not built before it becomes visible", async () => {
    assert.equal(await page.locator("[footer-pixel-canvas]").count(), 0);
  });
  await check("accordion keyboard selection updates one panel and hides inactive panels from focus", async () => {
    await activate("[accord-item]", 1, "Enter");
    const state = await page.evaluate(() => ({active:[...document.querySelectorAll("[accord-item]")].map(e=>e.getAttribute("aria-expanded")),panels:[...document.querySelectorAll("[accord-reveal]")].map(e=>({hidden:e.getAttribute("aria-hidden"),inert:e.inert,opacity:getComputedStyle(e).opacity}))}));
    assert.deepEqual(state.active, ["false","true","false"]);
    assert.equal(state.panels.filter(e=>!e.inert).length, 1);
    assert.ok(state.panels.every(e=>e.inert ? e.hidden==="true" && e.opacity==="0" : e.hidden==="false" && e.opacity==="1"));
  });
  await check("rapid accordion clicks finish on the final panel", async () => {
    await page.evaluate(() => {const items=document.querySelectorAll("[accord-item]");[0,2,0,1,2].forEach(i=>items[i].click());});
    await page.waitForTimeout(450);
    assert.equal(await page.locator('[accord-item][aria-expanded="true"]').getAttribute("accord-item"), await page.locator("[accord-item]").nth(2).getAttribute("accord-item"));
    assert.equal(await page.locator('[accord-reveal]:not([inert])').count(), 1);
  });
  await check("catalogue supports Space and exposes only its chosen panel", async () => {
    await activate("[cat-select]", 2, "Space");
    const key = await page.locator("[cat-select]").nth(2).getAttribute("cat-select");
    assert.equal(await page.locator('[cat-select][aria-pressed="true"]').getAttribute("cat-select"), key);
    assert.ok((await page.locator('[cat-reveal]:not([inert])').evaluateAll(es=>es.map(e=>e.getAttribute("cat-reveal")))).every(value=>value===key));
  });
  await check("filter keyboard selection reveals matching results and restores text markup", async () => {
    await activate("[filter-tab]", 1, "Enter");
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => ({key:document.querySelector('[filter-tab][aria-pressed="true"]').getAttribute("filter-tab"),visible:[...document.querySelectorAll("[filter-reveal]")].filter(e=>getComputedStyle(e).display!=="none").map(e=>e.getAttribute("filter-reveal")),split:document.querySelectorAll("[filter-reveal] [word]").length}));
    assert.ok(state.visible.length > 0);
    assert.ok(state.visible.every(value=>value.toLowerCase()===state.key.toLowerCase()));
    assert.equal(state.split, 0);
  });
  await check("rapid filter changes settle on All without hidden or offset results", async () => {
    await page.evaluate(() => {const tabs=document.querySelectorAll("[filter-tab]");[2,3,1,4,0].forEach(i=>tabs[i].click());});
    await page.waitForTimeout(1600);
    const state=await page.locator("[filter-reveal]").evaluateAll(es=>es.map(e=>({display:getComputedStyle(e).display,x:gsap.getProperty(e,"x"),opacity:getComputedStyle(e).opacity})));
    assert.ok(state.every(e=>e.display!=="none" && e.x===0 && e.opacity==="1"));
  });
  await check("reinitialization does not accumulate ScrollTriggers, control listeners or Lenis instances", async () => {
    const state=await page.evaluate(() => {
      const before=ScrollTrigger.getAll().length, original=lenis;
      for(let i=0;i<3;i++) initSite();
      const items=[...document.querySelectorAll("[accord-item]")];
      return {before,after:ScrollTrigger.getAll().length,replaced:original!==lenis,counts:items.map(e=>($._data(e,"events")?.click||[]).filter(h=>h.namespace==="accordionOne").length),ids:[...document.querySelectorAll("[id]")].map(e=>e.id).filter(id=>id.startsWith("accordion-"))};
    });
    assert.equal(state.after,state.before);
    assert.equal(state.replaced,true);
    assert.ok(state.counts.every(n=>n===1));
    assert.equal(new Set(state.ids).size,state.ids.length);
    await page.waitForTimeout(2200);
  });
  await check("footer builds once and follows a burst of pointer events in one frame", async () => {
    const cdp=await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
    await page.evaluate(()=>{longTasks.length=0;});
    await scrollFooter();
    console.log("Cold footer entry long tasks (4x CPU):", await page.evaluate(()=>longTasks));
    await cdp.send("Emulation.setCPUThrottlingRate",{rate:1});
    await hoverFooter();
    assert.equal(await page.locator("[footer-pixel-canvas]").count(),1);
    const state=await page.evaluate(async()=>{
      await new Promise(requestAnimationFrame);footerDraws=0;
      const svg=document.querySelector("[footer-svg-engine]"),box=svg.getBoundingClientRect();
      for(let i=0;i<40;i++) svg.dispatchEvent(new PointerEvent("pointermove",{clientX:box.left+box.width*(.3+i*.01),clientY:box.top+box.height/2}));
      await new Promise(requestAnimationFrame);
      return {draws:footerDraws,opacity:getComputedStyle(document.querySelector("[footer-svg-pixel-layer]")).opacity};
    });
    assert.equal(state.draws,20);
    assert.equal(state.opacity,"1");
  });
  await check("footer performs no drawing while the pointer is idle",async()=>{
    await page.waitForTimeout(100);
    const before=await page.evaluate(()=>footerDraws);
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(()=>footerDraws),before);
  });
  await check("offscreen footer removes pointer listeners and performs no drawing",async()=>{
    await page.evaluate(()=>lenis.scrollTo(0,{immediate:true,force:true}));
    await page.waitForTimeout(300);
    const state=await page.evaluate(async()=>{footerDraws=0;document.querySelector("[footer-svg-engine]").dispatchEvent(new PointerEvent("pointermove",{clientX:500,clientY:500}));await new Promise(requestAnimationFrame);return {draws:footerDraws,listeners:($._data(document.querySelector("[footer-svg-engine]"),"events")?.pointermove||[]).length};});
    assert.deepEqual(state,{draws:0,listeners:0});
  });
  await check("reduced motion suspends the footer and resuming recreates no duplicate layer",async()=>{
    await page.emulateMedia({reducedMotion:"reduce"});
    await scrollFooter();await hoverFooter();
    assert.equal(await page.locator("[footer-svg-pixel-layer]").evaluate(e=>getComputedStyle(e).opacity),"0");
    await page.emulateMedia({reducedMotion:"no-preference"});
    await hoverFooter();
    assert.equal(await page.locator("[footer-pixel-canvas]").count(),1);
  });
  await check("desktop/mobile transitions remove and recreate the footer cleanly",async()=>{
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
    assert.equal(await page.locator("[footer-pixel-canvas]").count(),0);
    assert.equal(await page.evaluate(()=>!!ScrollTrigger.getById("home-scroll")),false);
    await activate("[accord-item]",0,"Space");
    assert.equal(await page.locator('[accord-item][aria-expanded="true"]').count(),1);
    await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(2200);
    await scrollFooter();await hoverFooter();
    assert.equal(await page.locator("[footer-pixel-canvas]").count(),1);
  });
  await check("full cleanup removes generated UI and restores authored attributes",async()=>{
    await page.evaluate(()=>initSite.cleanup());
    assert.equal(await page.locator("[footer-pixel-canvas]").count(),0);
    assert.equal(await page.locator('[accord-item][role="button"],[cat-select][role="button"],[filter-tab][role="button"]').count(),0);
    assert.equal(await page.evaluate(()=>window.lenis),null);
  });
  await check("all interactions complete without runtime errors",async()=>assert.deepEqual(errors,[]));
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
console.log(`${results.filter(r=>r.passed).length}/${results.length} browser checks passed`);
if(results.some(r=>!r.passed)) process.exitCode=1;

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const source = await readFile(process.env.TEAM_SOURCE || new URL("../src/script.js", import.meta.url), "utf8");
const fixture = await readFile(new URL("fixtures/team-profiles.html", import.meta.url), "utf8");
const fetchScript = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.ok(response.ok); return response.text();
};
const [jquery, gsap] = await Promise.all([
  fetchScript("https://code.jquery.com/jquery-3.5.1.min.js"),
  fetchScript("https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"),
]);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [], results = [];
const pairs = [["01", "03"], ["01", "04"], ["01", "05"], ["05", "06"], ["06", "02"], ["02", "07"], ["02", "08"],
  ["11", "09"], ["09", "12"], ["09", "13"], ["13", "10"], ["14", "10"], ["10", "15"], ["16", "17"]];
const selector = (id = "01") => `.team-profile-node.is-${id}`;
const near = (a, b, tolerance = 1) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);
async function check(name, fn) {
  try { await fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (error) { results.push(false); console.error(`FAIL ${name}: ${error.stack}`); }
}
async function open({ width = 1440, reducedMotion = "no-preference", duplicate = false, code = source } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(fixture, { waitUntil: "domcontentloaded" });
  await page.addScriptTag({ content: jquery });
  await page.addScriptTag({ content: gsap });
  await page.evaluate((duplicate) => {
    if (duplicate) document.querySelector('.section-teams').after(document.querySelector('.section-teams').cloneNode(true));
    window.originalArtwork = [...document.querySelectorAll('.team-profile-node, .team-profile-lines line')].map(e => e.outerHTML);
    window.nodeReads = 0; window.lineWrites = 0;
    const bounds = Element.prototype.getBoundingClientRect, set = Element.prototype.setAttribute;
    Element.prototype.getBoundingClientRect = function () {
      if (this.classList.contains('team-profile-node')) window.nodeReads++;
      return bounds.call(this);
    };
    Element.prototype.setAttribute = function (name, value) {
      if (this.tagName === 'line' && /^[xy][12]$/.test(name)) window.lineWrites++;
      return set.call(this, name, value);
    };
  }, duplicate);
  await page.addScriptTag({ content: code });
  await page.waitForTimeout(200);
  return page;
}
async function center(page, id = "01") {
  const b = await page.locator(selector(id)).first().boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function anchored(page) {
  const error = await page.evaluate((pairs) => {
    let max = 0;
    document.querySelectorAll('.teams-header').forEach(header => {
      const layer = header.querySelector('[team-profile-connector-layer]');
      [...(layer || header).querySelectorAll(layer ? 'line' : '.team-profile-lines line')].forEach((line, i) => {
        const matrix = line.ownerSVGElement.getScreenCTM();
        pairs[i].forEach((id, j) => {
          const rect = header.querySelector(`.team-profile-node.is-${id}`).getBoundingClientRect();
          const point = new DOMPoint(Number(line.getAttribute(`x${j+1}`)), Number(line.getAttribute(`y${j+1}`))).matrixTransform(matrix);
          max = Math.max(max, Math.hypot(point.x - rect.left - rect.width / 2, point.y - rect.top - rect.height / 2));
        });
      });
    });
    return max;
  }, pairs);
  assert.ok(error < 0.15, `Line misses its circle center by ${error}px`);
}
async function dragBy(page, dx, dy, { hold = 0, id = "01" } = {}) {
  const start = await center(page, id);
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(start.x + dx * i / 8, start.y + dy * i / 8);
    await page.waitForTimeout(12);
  }
  await page.waitForTimeout(18);
  const held = await center(page, id);
  await anchored(page);
  if (hold) await page.waitForTimeout(hold);
  await page.mouse.up();
  return { start, held };
}
async function linkLengths(page) {
  return page.evaluate(pairs => {
    const header=document.querySelector('.teams-header');
    return pairs.map(pair=>{
      const points=pair.map(id=>{
        const e=header.querySelector(`.team-profile-node.is-${id}`),r=e.getBoundingClientRect();
        const [tx=0,ty=0]=e.style.translate.split(' ').map(parseFloat);
        return {x:r.x+r.width/2,y:r.y+r.height/2,bx:r.x+r.width/2-(tx||0),by:r.y+r.height/2-(ty||0)};
      });
      const [a,b]=points;
      return {length:Math.hypot(b.x-a.x,b.y-a.y),rest:Math.hypot(b.bx-a.bx,b.by-a.by),angle:Math.atan2(b.y-a.y,b.x-a.x),restAngle:Math.atan2(b.by-a.by,b.bx-a.bx)};
    });
  },pairs);
}
async function constrained(page, tolerance=0.011) {
  const lengths=await linkLengths(page);
  lengths.forEach((edge,i)=>assert.ok(Math.abs(edge.length/edge.rest-1)<tolerance,`Link ${i}: ${JSON.stringify(edge)}`));
  lengths.forEach((edge,i)=>{
    const angle=Math.atan2(Math.sin(edge.angle-edge.restAngle),Math.cos(edge.angle-edge.restAngle))*180/Math.PI;
    assert.ok(Math.abs(angle)<=2.03,`Link ${i} rotated ${angle} degrees`);
  });
}
try {
  await check("all 21 circles drift gently; 14 connectors stay at their centers with no frame layout reads", async () => {
    const page = await open(); await page.waitForTimeout(1300);
    const first = await center(page); await page.evaluate(() => { window.nodeReads = 0; });
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => window.nodeReads), 0);
    const second = await center(page); assert.ok(Math.hypot(second.x-first.x, second.y-first.y) > 1);
    await anchored(page);
    assert.equal(await page.locator('[team-profile-node]').count(), 21);
    assert.equal(await page.locator('.team-profile-image.is-hidden').evaluateAll(es => es.filter(e => getComputedStyle(e).opacity === '0').length), 12);
    assert.equal(await page.locator('.cta').evaluate(e => { const r=e.getBoundingClientRect(); return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e; }), true);
    await page.close();
  });
  await check("drag tracks the pointer immediately and release glides in the same direction before slowing", async () => {
    const page = await open();
    const { start, held } = await dragBy(page, 180, 45);
    near(held.x-start.x, 180, 2); near(held.y-start.y, 45, 2);
    await page.waitForTimeout(220); const fast = await center(page);
    assert.ok(fast.x > held.x + 60 && fast.x < held.x + 180);
    await page.waitForTimeout(1500); const settled = await center(page);
    await page.waitForTimeout(220); const slow = await center(page);
    assert.ok(Math.abs(slow.x-settled.x) < (fast.x-held.x) / 5);
    await anchored(page); await constrained(page); await page.close();
  });
  await check("release power is close to the original, reduced only to 85%",async()=>{
    const still=source.replace('float: { x: 12, y: 9','float: { x: 0, y: 0');
    const distances=[];
    for(const code of [still,still.replace('velocityMultiplier: 0.85, maxSpeed: 935','velocityMultiplier: 1, maxSpeed: 1100')]){
      const page=await open({code});const {held}=await dragBy(page,500,0,{id:'18'});
      await page.waitForTimeout(250);distances.push((await center(page,'18')).x-held.x);await page.close();
    }
    near(distances[0]/distances[1],0.85,0.09);
  });
  await check("dragging moves the connected shape with only 2 degrees of rotation and 1% elasticity",async()=>{
    const page=await open(); const before=await linkLengths(page);const neighbor=await center(page,'03');
    await dragBy(page,240,110,{hold:100});
    const after=await linkLengths(page),moved=await center(page,'03');
    assert.ok(Math.hypot(moved.x-neighbor.x,moved.y-neighbor.y)>50);
    assert.ok(after.some((edge,i)=>Math.abs(edge.angle-before[i].angle)>0.002));
    await constrained(page);await page.waitForTimeout(1200);await constrained(page,0.001);
    assert.equal(await page.locator('[team-profile-connector-layer]').count(),1);
    assert.equal(await page.locator('[team-profile-connector-layer]').evaluate(e=>e.parentElement.matches('.teams-header')&&getComputedStyle(e).overflow==='visible'),true);
    assert.equal(await page.locator('[team-profile-lines]').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')),true);
    await page.close();
  });
  await check("a paused release and pointer cancellation do not launch stale momentum", async () => {
    const page = await open();
    const { held } = await dragBy(page, 120, 0, { hold: 180 });
    await page.waitForTimeout(300); const stopped = await center(page); near(stopped.x, held.x, 5);
    const p = await center(page); await page.mouse.move(p.x,p.y); await page.mouse.down();
    await page.mouse.move(p.x+120,p.y); await page.waitForTimeout(20);
    await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,bubbles:true})));
    await page.mouse.up(); const canceled = await center(page);
    await page.waitForTimeout(300); near((await center(page)).x, canceled.x, 5);
    await page.close();
  });
  await check("all four header walls contain the entire circle and reflect fast throws", async () => {
    const page = await open();
    for (const [dx,dy] of [[2500,0],[-2500,0],[0,1500],[0,-1500]]) {
      await page.evaluate(() => initSite()); await page.waitForTimeout(100);
      const { held } = await dragBy(page,dx,dy,{id:'18'});
      await page.waitForTimeout(180); const bounced = await center(page,'18');
      assert.ok(dx ? (bounced.x-held.x)*Math.sign(dx)<-5 : (bounced.y-held.y)*Math.sign(dy)<-5, JSON.stringify({dx,dy,held,bounced}));
      const contained = await page.evaluate(() => {
        const h = document.querySelector('.teams-header').getBoundingClientRect();
        return [...document.querySelectorAll('.team-profile-node')].every(e => { const b=e.getBoundingClientRect();return b.left>=h.left-0.1&&b.right<=h.right+0.1&&b.top>=h.top-0.1&&b.bottom<=h.bottom+0.1; });
      });
      assert.ok(contained); await anchored(page); await constrained(page);
    }
    await page.close();
  });
  await check("fast connected drags stay within the elastic limit at every wall and corner",async()=>{
    const page=await open();
    for(const id of Array.from({length:17},(_,i)=>String(i+1).padStart(2,'0'))){
      await page.evaluate(()=>initSite());await page.waitForTimeout(80);
      const p=await center(page,id);await page.mouse.move(p.x,p.y);await page.mouse.down();
      for(const [x,y] of [[1400,100],[1400,680],[50,680],[50,50],[700,350]]){
        await page.mouse.move(x,y);await page.waitForTimeout(25);
        await constrained(page);await anchored(page);
      }
      await page.mouse.up();await page.waitForTimeout(120);await constrained(page);
    }
    await page.close();
  });
  await check("resize and scrolling preserve connections; off-screen and hidden tabs stop rendering", async () => {
    const page = await open(); await dragBy(page,120,30);
    for (const width of [1100,1920,1440]) {
      await page.setViewportSize({width,height:900}); await page.waitForTimeout(150); await anchored(page); await constrained(page);
    }
    await page.evaluate(() => scrollTo(0,1200)); await page.waitForTimeout(150);
    const writes = await page.evaluate(() => window.lineWrites); await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.lineWrites), writes);
    await page.evaluate(() => scrollTo(0,0)); await page.waitForTimeout(150); await anchored(page);
    await page.evaluate(() => { Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange')); });
    const hidden = await page.evaluate(() => window.lineWrites); await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.lineWrites), hidden);
    await page.evaluate(() => { delete document.hidden;document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(100); assert.ok(await page.evaluate(() => window.lineWrites) > hidden);
    await page.close();
  });
  await check("desktop-only initialization and repeat cleanup restore authored styles and line coordinates", async () => {
    const page = await open({width:800});
    assert.equal(await page.locator('[team-profile-node]').count(),0);
    assert.equal(await page.locator('[team-profile-connector-layer]').count(),0);
    await page.setViewportSize({width:1440,height:900}); await page.waitForTimeout(200);
    assert.equal(await page.locator('[team-profile-node]').count(),21);
    for(let i=0;i<3;i++){await page.evaluate(()=>initSite());await page.waitForTimeout(50);}
    await page.setViewportSize({width:800,height:900}); await page.waitForTimeout(150);
    assert.equal(await page.locator('[team-profile-node]').count(),0);
    assert.deepEqual(await page.locator('.team-profile-node, .team-profile-lines line').evaluateAll(es=>es.map(e=>e.outerHTML.replace(/ style=""/g,''))),await page.evaluate(()=>originalArtwork));
    const writes=await page.evaluate(()=>lineWrites);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>lineWrites),writes);
    await page.close();
  });
  await check("reduced motion keeps direct dragging but disables idle movement and throws", async () => {
    const page = await open({reducedMotion:'reduce'}); const before=await center(page);
    const writes=await page.evaluate(()=>lineWrites);await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>lineWrites),writes);near((await center(page)).x,before.x,0.01);
    const {held}=await dragBy(page,150,20);await page.waitForTimeout(200);near((await center(page)).x,held.x,0.01);
    await anchored(page);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(800);
    assert.ok(Math.abs((await center(page)).x-held.x)>1);await page.close();
  });
  await check("duplicate sections keep independent endpoints and cleanup", async () => {
    const page=await open({duplicate:true});await dragBy(page,100,10);await anchored(page);
    await page.evaluate(()=>initSite.cleanup());
    assert.deepEqual(await page.locator('.team-profile-node, .team-profile-lines line').evaluateAll(es=>es.map(e=>e.outerHTML.replace(/ style=""/g,''))),await page.evaluate(()=>originalArtwork));
    await page.close();
  });
  await check("no runtime exceptions",async()=>assert.deepEqual(errors,[]));
} finally {await browser.close();}
console.log(`${results.filter(Boolean).length}/${results.length} team motion checks passed`);
if(results.some(result=>!result))process.exitCode=1;

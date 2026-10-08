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
const pairs = [["01", "03"], ["01", "04"], ["01", "05"], ["06", "02"], ["02", "07"], ["02", "08"],
  ["11", "09"], ["09", "12"], ["09", "13"], ["14", "10"], ["10", "15"], ["16", "17"], ["17", "22"], ["18", "23"], ["19", "24"]];
const selector = (id = "01") => `.team-profile-node:is(.is-${id}, .team-profile-position-${id})`;
const near = (a, b, tolerance = 1) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);
async function check(name, fn) {
  try { await fn(); results.push(true); console.log(`PASS ${name}`); }
  catch (error) { results.push(false); console.error(`FAIL ${name}: ${error.stack}`); }
  finally { await Promise.all(browser.contexts().map(context=>context.close())); }
}
async function open({ width = 1440, reducedMotion = "no-preference", duplicate = false, code = source, scene = null, content = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(fixture, { waitUntil: "domcontentloaded" });
  await page.addScriptTag({ content: jquery });
  await page.addScriptTag({ content: gsap });
  if (content) await page.evaluate(() => {
    const section=document.querySelector('.section-teams'),header=section.querySelector('.teams-header');
    const layout=document.createElement('div');layout.className='teams-layout';section.append(layout);layout.append(header);
    header.querySelector('.heading').classList.add('text');header.querySelector('.cta').classList.add('btn-2-brand');
    const list=document.createElement('div');list.className='team-list';list.style.cssText='height:90px;width:70%;margin:30px auto 0';
    list.innerHTML='<p class="text">Teams content</p>';layout.append(list);
  });
  if (scene) await page.evaluate(scene => {
    const header = document.querySelector('.teams-header');
    ['18', '19'].slice(0, scene === 'solo' ? 1 : 2).forEach((id, i) => {
      const node = header.querySelector(`.is-${id}`);
      header.append(node);
      node.style.cssText = `left:${(scene === 'solo' ? 670 : 400 + i * 220) - 30}px;top:295px;width:60px`;
    });
    header.querySelector('.team-profiles').remove();
  }, scene);
  await page.evaluate((duplicate) => {
    if (duplicate) document.querySelector('.section-teams').after(document.querySelector('.section-teams').cloneNode(true));
    window.originalArtwork = [...document.querySelectorAll('.team-profile-node, .team-profile-lines line')].map(e => e.outerHTML);
    window.nodeReads = 0; window.contentReads = 0; window.lineWrites = 0;
    const bounds = Element.prototype.getBoundingClientRect, set = Element.prototype.setAttribute;
    Element.prototype.getBoundingClientRect = function () {
      if (this.classList.contains('team-profile-node')) window.nodeReads++;
      if (this.matches('.teams-layout .text,.teams-layout .btn-2-brand,.teams-layout .team-list')) window.contentReads++;
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
          const rect = header.querySelector(`.team-profile-node:is(.is-${id},.team-profile-position-${id})`).getBoundingClientRect();
          const point = new DOMPoint(Number(line.getAttribute(`x${j+1}`)), Number(line.getAttribute(`y${j+1}`))).matrixTransform(matrix);
          max = Math.max(max, Math.hypot(point.x - rect.left - rect.width / 2, point.y - rect.top - rect.height / 2));
        });
      });
    });
    return max;
  }, pairs);
  assert.ok(error < 0.15, `Line misses its circle center by ${error}px`);
}
async function dragBy(page, dx, dy, { hold = 0, id = "01", steps = 2 } = {}) {
  const start = await center(page, id);
  await page.mouse.move(start.x, start.y); await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(start.x + dx * i / steps, start.y + dy * i / steps);
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
        const e=header.querySelector(`.team-profile-node:is(.is-${id},.team-profile-position-${id})`),r=e.getBoundingClientRect();
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
  await separated(page);
}
async function separated(page) {
  const overlaps = await page.locator('.teams-header').first().evaluate(header => {
    const circles = [...header.querySelectorAll('.team-profile-node')].map(e => {
      const r=e.getBoundingClientRect();return {id:e.className,x:r.x+r.width/2,y:r.y+r.height/2,r:r.width/2};
    });
    return circles.flatMap((a,i)=>circles.slice(i+1).map(b=>({a:a.id,b:b.id,overlap:a.r+b.r-Math.hypot(b.x-a.x,b.y-a.y)}))).filter(pair=>pair.overlap>0.1);
  });
  assert.deepEqual(overlaps, [], 'Circle outlines must not overlap');
}
async function contentClear(page) {
  const overlaps=await page.evaluate(()=>{
    const layout=document.querySelector('.teams-layout');
    const boxes=[...layout.querySelectorAll('.text,.btn-2-brand,.team-list')].filter(e=>!e.parentElement.closest('.text,.btn-2-brand,.team-list')).map(e=>({id:e.className,r:e.getBoundingClientRect()}));
    return [...layout.querySelectorAll('.team-profile-node')].flatMap(e=>{
      const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
      return boxes.map(({id,r:box})=>({circle:e.className,box:id,overlap:r.width/2+16-Math.hypot(x-Math.max(box.left,Math.min(box.right,x)),y-Math.max(box.top,Math.min(box.bottom,y)))}));
    }).filter(pair=>pair.overlap>0.1);
  });
  assert.deepEqual(overlaps,[],'Circles must leave 16px around protected content');
}
try {
  await check("text, button and team list repel whole circles without per-frame layout reads",async()=>{
    const page=await open({content:true});await page.waitForTimeout(500);
    await contentClear(page);await anchored(page);await constrained(page);
    await page.evaluate(()=>{nodeReads=contentReads=0});await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>nodeReads+contentReads),0);
    for(const target of ['.heading','.cta','.team-list']){
      const box=await page.locator(target).boundingBox(),p=await center(page,'02');
      await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
      await page.waitForTimeout(160);await page.mouse.up();await contentClear(page);await constrained(page);await anchored(page);
    }
    for(const width of [1100,1920,1440]){
      await page.setViewportSize({width,height:1000});await page.waitForTimeout(180);await contentClear(page);await constrained(page);await anchored(page);
    }
    await page.locator('.heading').evaluate(e=>e.style.fontSize='58px');await page.waitForTimeout(180);await contentClear(page);
    await page.evaluate(()=>initSite.cleanup());
    assert.equal(await page.locator('[teams-layout],[text],[btn-2-brand],[team-list]').count(),0);
    await page.close();
  });
  await check("repulsion starts gently outside content; reduced motion stays still after clearing content",async()=>{
    const code=source.replace('float: { x: 12, y: 9','float: { x: 0, y: 0');
    const page=await open({content:true,scene:'solo',code});
    await page.evaluate(()=>{
      initSite.cleanup();const header=document.querySelector('.teams-header'),h=header.getBoundingClientRect(),box=document.querySelector('.heading').getBoundingClientRect(),node=header.querySelector('.is-18');
      node.style.left=`${box.left-h.left-60-16-25}px`;node.style.top=`${box.top-h.top+box.height/2-30}px`;initSite();
    });await page.waitForTimeout(100);
    const before=await center(page,'18');await page.waitForTimeout(650);const after=await center(page,'18');
    assert.ok(after.x<before.x-10,JSON.stringify({before,after}));await contentClear(page);
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
    const still=await center(page,'18');await page.waitForTimeout(250);near((await center(page,'18')).x,still.x,0.01);
    await page.close();
  });
  await check("cleanup during a grab clears its timer and restores the artwork",async()=>{
    const page=await open({scene:'solo',reducedMotion:'reduce'}),p=await center(page,'18');
    await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+80,p.y);
    await page.evaluate(()=>initSite.cleanup());await page.waitForTimeout(150);await page.mouse.up();
    assert.deepEqual(await page.locator('.team-profile-node, .team-profile-lines line').evaluateAll(es=>es.map(e=>e.outerHTML.replace(/ style=""/g,''))),await page.evaluate(()=>originalArtwork));
    await page.evaluate(()=>initSite());await page.waitForTimeout(120);
    const next=await dragBy(page,70,0,{id:'18'});near(next.held.x-next.start.x,70,0.1);await page.close();
  });
  await check("all 24 circles drift gently; 15 connectors stay at their centers with no frame layout reads", async () => {
    const page = await open(); await page.waitForTimeout(1300);
    const first = await center(page); await page.evaluate(() => { window.nodeReads = 0; });
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => window.nodeReads), 0);
    const second = await center(page); assert.ok(Math.hypot(second.x-first.x, second.y-first.y) > 1);
    await anchored(page);
    assert.equal(await page.locator('[team-profile-node]').count(), 24);
    assert.equal(await page.locator('.team-profile-image.is-hidden').evaluateAll(es => es.filter(e => getComputedStyle(e).opacity === '0').length), 15);
    assert.equal(await page.locator('.cta').evaluate(e => { const r=e.getBoundingClientRect(); return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e; }), true);
    await page.close();
  });
  await check("nine photo circles have the requested connection counts; white circles are single leaves",async()=>{
    const page=await open();await anchored(page);
    const counts=await page.evaluate(pairs=>{
      const result={photos:[],white:[]};
      document.querySelectorAll('.team-profile-node').forEach(node=>{
        const id=node.className.match(/(?:is-|position-)(\d+)/)[1];
        const degree=pairs.filter(pair=>pair.includes(id)).length;
        const hidden=getComputedStyle(node.querySelector('img')).opacity==='0';
        result[hidden?'white':'photos'].push(degree);
        if(hidden)for(const pair of pairs.filter(pair=>pair.includes(id))){
          const other=pair.find(item=>item!==id),target=document.querySelector(`.team-profile-node:is(.is-${other},.team-profile-position-${other})`);
          if(getComputedStyle(target.querySelector('img')).opacity==='0')throw new Error('A white circle connects to another white circle');
        }
      });return result;
    },pairs);
    assert.deepEqual(counts.photos.sort(),[0,0,1,1,2,2,3,3,3]);assert.deepEqual(counts.white,Array(15).fill(1));
    await page.close();
  });
  await check("drag tracks the pointer immediately and release glides in the same direction before slowing", async () => {
    const page = await open({scene:'solo',code:source.replace('holdSeconds: 0.1','holdSeconds: 1')});
    const { start, held } = await dragBy(page, 180, 45, {id:'18'});
    near(held.x-start.x, 180, 2); near(held.y-start.y, 45, 2);
    await page.waitForTimeout(220); const fast = await center(page,'18');
    assert.ok(fast.x > held.x + 60 && fast.x < held.x + 180);
    await page.waitForTimeout(1500); const settled = await center(page,'18');
    await page.waitForTimeout(220); const slow = await center(page,'18');
    assert.ok(Math.abs(slow.x-settled.x) < (fast.x-held.x) / 5);
    await separated(page); await page.close();
  });
  await check("throw velocity is 20% gentler than the previous version",async()=>{
    const still=source.replace('float: { x: 12, y: 9','float: { x: 0, y: 0').replace('holdSeconds: 0.1','holdSeconds: 1');
    const distances=[];
    for(const code of [still,still.replace('velocityMultiplier: 0.68, maxSpeed: 748','velocityMultiplier: 0.85, maxSpeed: 935')]){
      const page=await open({code,scene:'solo'});const {held}=await dragBy(page,280,0,{id:'18',steps:2});
      await page.waitForTimeout(250);distances.push((await center(page,'18')).x-held.x);await page.close();
    }
    near(distances[0]/distances[1],0.8,0.09);
  });
  await check("dragging restores free joint rotation while keeping 1% elasticity",async()=>{
    const page=await open(); const before=await linkLengths(page);const neighbor=await center(page,'03');
    await dragBy(page,240,110,{hold:100});
    const after=await linkLengths(page),moved=await center(page,'03');
    assert.ok(Math.hypot(moved.x-neighbor.x,moved.y-neighbor.y)>50);
    assert.ok(after.some((edge,i)=>Math.abs(edge.angle-before[i].angle)>0.1), 'Joints should rotate freely beyond the removed 2-degree limit');
    await constrained(page);await page.waitForTimeout(1200);await constrained(page,0.001);
    assert.equal(await page.locator('[team-profile-connector-layer]').count(),1);
    assert.equal(await page.locator('[team-profile-connector-layer]').evaluate(e=>e.parentElement.matches('.teams-header')&&getComputedStyle(e).overflow==='visible'),true);
    assert.equal(await page.locator('[team-profile-lines]').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')),true);
    await page.close();
  });
  await check("a paused manual release and pointer cancellation do not launch stale momentum", async () => {
    // Longer test hold isolates the existing manual-release sampling from auto-release.
    const page = await open({scene:'solo',code:source.replace('holdSeconds: 0.1','holdSeconds: 1')});
    const { held } = await dragBy(page, 120, 0, { hold: 180,id:'18' });
    await page.waitForTimeout(300); const stopped = await center(page,'18'); near(stopped.x, held.x, 5);
    const p = await center(page,'18'); await page.mouse.move(p.x,p.y); await page.mouse.down();
    await page.mouse.move(p.x+120,p.y); await page.waitForTimeout(20);
    await page.evaluate(() => document.dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,bubbles:true})));
    await page.mouse.up(); const canceled = await center(page,'18');
    await page.waitForTimeout(300); near((await center(page,'18')).x, canceled.x, 5);
    await page.close();
  });
  await check("100ms grabs release automatically; later pointer movement cannot move the released circle", async () => {
    const page = await open({scene:'solo',reducedMotion:'reduce'});
    await page.evaluate(()=>{
      const node=document.querySelector('.is-18');window.releaseTimes=[];let began;
      node.addEventListener('pointerdown',()=>began=performance.now());
      new MutationObserver(()=>{if(began&&node.style.cursor==='grab'){releaseTimes.push(performance.now()-began);began=null;}}).observe(node,{attributes:true,attributeFilter:['style']});
    });
    const p=await center(page,'18');await page.mouse.move(p.x,p.y);await page.mouse.down();
    await page.mouse.move(p.x+180,p.y);await page.waitForTimeout(140);
    assert.equal(await page.locator(selector('18')).evaluate(e=>e.style.cursor),'grab');
    assert.equal(await page.locator(selector('18')).evaluate(e=>e.hasPointerCapture(1)),false);
    const elapsed=await page.evaluate(()=>releaseTimes[0]);assert.ok(elapsed>=95&&elapsed<150,`${elapsed}ms hold`);
    const released=await center(page,'18');near(released.x-p.x,180,0.1);
    await page.mouse.move(p.x+240,p.y+100);await page.waitForTimeout(50);
    near((await center(page,'18')).x,released.x,0.1);await page.mouse.up();
    const next=await dragBy(page,-70,20,{id:'18'});near(next.held.x-next.start.x,-70,0.1);
    const still=await center(page,'18');await page.mouse.move(still.x,still.y);await page.mouse.down();await page.waitForTimeout(140);
    assert.equal(await page.locator(selector('18')).evaluate(e=>e.style.cursor),'grab');near((await center(page,'18')).x,still.x,0.1);await page.mouse.up();
    await page.close();
  });
  await check("connected circles keep swinging while their photo is held and after release",async()=>{
    const page=await open({code:source.replace('holdSeconds: 0.1','holdSeconds: 1')});const p=await center(page,'17');await page.mouse.move(p.x,p.y);await page.mouse.down();
    await page.mouse.move(p.x+110,p.y+80,{steps:6});await page.waitForTimeout(30);
    const first=await linkLengths(page);await page.waitForTimeout(180);const second=await linkLengths(page);
    assert.ok([11,12].some(i=>Math.abs(second[i].angle-first[i].angle)>0.02),'Outer circles froze while the photo was held');
    await page.mouse.up();await page.waitForTimeout(180);const third=await linkLengths(page);
    assert.ok([11,12].some(i=>Math.abs(third[i].angle-second[i].angle)>0.02),'Outer circles lost their swing on release');
    await constrained(page);await page.close();
  });
  await check("a fast drag cannot tunnel through another circle; a throw transfers momentum on impact",async()=>{
    const page=await open({scene:'pair',reducedMotion:'reduce'});
    const a=await center(page,'18'),b=await center(page,'19');
    await page.mouse.move(a.x,a.y);await page.mouse.down();
    await page.mouse.move(a.x+300,a.y);await page.waitForTimeout(30);
    const held=await center(page,'18'),pushed=await center(page,'19');
    near(held.x-a.x,300,1);assert.ok(pushed.x>=held.x+60,JSON.stringify({held,pushed}));
    assert.ok(pushed.x>b.x+100);await separated(page);
    await page.waitForTimeout(120);await page.mouse.up();
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>initSite());await page.waitForTimeout(100);
    const before=await center(page,'19');
    await dragBy(page,120,0,{id:'18',steps:2});await page.waitForTimeout(250);
    assert.ok((await center(page,'19')).x>before.x+25,'Impact should transfer velocity to the other circle');
    await separated(page);await page.close();
  });
  await check("all four section walls contain circles and allow movement beyond the header",async()=>{
    const page=await open({scene:'solo'});
    for(const [dx,dy] of [[200,0],[-200,0],[0,200],[0,-200]]){
      await page.evaluate(({dx,dy})=>{
        initSite.cleanup();const header=document.querySelector('.teams-header'),node=header.querySelector('.is-18');
        const section=header.closest('.section-teams').getBoundingClientRect(),h=header.getBoundingClientRect();
        node.style.left=`${dx>0?section.right-h.left-260:dx<0?section.left-h.left+200:640}px`;
        node.style.top=`${dy>0?section.bottom-h.top-260:dy<0?section.top-h.top+200:295}px`;initSite();
      },{dx,dy});await page.waitForTimeout(100);
      const {held}=await dragBy(page,dx,dy,{id:'18'});await page.waitForTimeout(180);
      const bounced=await center(page,'18');assert.ok(dx?(bounced.x-held.x)*Math.sign(dx)<-5:(bounced.y-held.y)*Math.sign(dy)<-5);
      const h=await page.locator('.teams-header').boundingBox();
      assert.ok(dx>0?held.x>h.x+h.width:dx<0?held.x<h.x:dy>0?held.y>h.y+h.height:held.y<h.y,'Still bouncing at header bounds');
      await separated(page);
    }
    await page.close();
  });
  await check("fast connected drags stay within the elastic limit at every wall and corner",async()=>{
    const page=await open();
    await page.evaluate(()=>{
      window.worstOverlap=0;
      function sample(){
        const circles=[...document.querySelectorAll('.team-profile-node')].map(e=>e.getBoundingClientRect());
        circles.forEach((a,i)=>circles.slice(i+1).forEach(b=>{
          const overlap=(a.width+b.width)/2-Math.hypot(b.x+b.width/2-a.x-a.width/2,b.y+b.height/2-a.y-a.height/2);
          window.worstOverlap=Math.max(window.worstOverlap,overlap);
        }));
        window.contactFrame=requestAnimationFrame(sample);
      }
      sample();
    });
    for(const id of Array.from({length:17},(_,i)=>String(i+1).padStart(2,'0'))){
      await page.evaluate(()=>initSite());await page.waitForTimeout(80);
      for(const [x,y] of [[1400,100],[1400,680],[50,680],[50,50],[700,350]]){
        const p=await center(page,id);await page.mouse.move(p.x,p.y);await page.mouse.down();
        await page.mouse.move(x,y);await page.waitForTimeout(25);
        await constrained(page);await anchored(page);
        await page.mouse.up();
      }
      await page.mouse.up();await page.waitForTimeout(120);await constrained(page);
    }
    assert.ok(await page.evaluate(()=>{cancelAnimationFrame(contactFrame);return worstOverlap;})<0.15,'Circles overlapped during a rendered frame');
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
    assert.equal(await page.locator('[team-profile-node]').count(),24);
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
    const resumed=await center(page);assert.ok(Math.hypot(resumed.x-held.x,resumed.y-held.y)>1);await page.close();
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

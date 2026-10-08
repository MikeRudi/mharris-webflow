import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {createHomePreview} from './preview-server.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {server,url}=await createHomePreview({port:0});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const output=process.env.HOME_TEST_OUTPUT;
if(output)await mkdir(output,{recursive:true});
async function visit(selector){
 await page.locator(selector).first().scrollIntoViewIfNeeded();
 await page.waitForTimeout(350);
}
try {
 await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(2200);
 assert.equal(await page.locator('[home-faq-glows]').count(),1);
 assert.equal(await page.evaluate(()=>gsap.getById('home-faq-breath').paused()),true);
 await visit('[home-faq]');
 const state=await page.evaluate(()=>{
  const section=document.querySelector('[home-faq]'),glow=document.querySelector('[home-faq-glows]').firstElementChild;
  return {overflow:getComputedStyle(section).overflow,background:getComputedStyle(section).backgroundImage,
   extends:glow.getBoundingClientRect().top<section.getBoundingClientRect().top,
   playing:!gsap.getById('home-faq-breath').paused()};
 });
 assert.deepEqual(state,{overflow:'visible',background:'none',extends:true,playing:true});
 const time=await page.evaluate(()=>gsap.getById('home-faq-breath').time());
 await page.waitForTimeout(200);
 assert.ok(await page.evaluate(t=>gsap.getById('home-faq-breath').time()>t,time));
 if(output)await page.screenshot({path:output+'/faq-background.png'});
 await visit('[section-tiles]');
 await page.locator('[home-dna-ribbon]').evaluate(e=>e.decode());
 assert.equal(await page.evaluate(()=>gsap.getById('home-dna-sway').paused()),false);
 assert.ok(await page.locator('[home-dna-ribbon]').evaluate(e=>e.offsetWidth>e.parentElement.clientWidth*1.5));
 if(output)await page.screenshot({path:output+'/dna-background.png'});
 await visit('[cat-select]');
 const active=await page.locator('[cat-select].active').evaluate(e=>getComputedStyle(e).backgroundImage);
 await page.locator('[cat-select]:not(.active)').first().hover({force:true});
 assert.equal(await page.locator('[cat-select]:hover').first().evaluate(e=>getComputedStyle(e).backgroundImage),active);
 console.log('PASS unclipped FAQ layers, visible breathing/ribbon motion and native catalogue hover');
 for(const width of [1440,768,390]) {
  await page.setViewportSize({width,height:900});await visit('[home-faq]');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('[home-faq-button]').first().click();await page.waitForTimeout(400);
  assert.equal(await page.locator('[home-faq-button]').first().getAttribute('aria-expanded'),'true');
  await page.locator('[home-faq-button]').first().click();await page.waitForTimeout(400);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>!gsap.getById('home-faq-breath'));
 assert.equal(await page.evaluate(()=>!!gsap.getById('home-faq-breath')),false);
 assert.equal(await page.locator('[home-dna-ribbon]').evaluate(e=>getComputedStyle(e).transform),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);
 await page.evaluate(()=>{initSite();initSite();});await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>gsap.globalTimeline.getChildren().filter(t=>t.vars.id==='home-faq-breath').length),1);
 await page.evaluate(()=>initSite.cleanup());
 assert.equal(await page.evaluate(()=>!!gsap.getById('home-faq-breath')||!!gsap.getById('home-dna-sway')),false);
 assert.deepEqual(errors,[]);
 console.log('PASS responsive overflow, FAQ interaction, reduced motion and complete background cleanup');
} finally {await browser.close();await new Promise(r=>server.close(r));}

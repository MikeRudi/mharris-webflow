import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHomePreview} from './preview-server.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.HOME_TEST_OUTPUT;
if(output)await mkdir(output,{recursive:true});
const {server,url}=await createHomePreview({port:0});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[],report=[];
page.on('pageerror',error=>errors.push(error.message));
try {
 await page.goto(url,{waitUntil:'networkidle'});
 await page.waitForTimeout(2200);
 assert.equal(await page.locator('[compare-section]').count(),1);
 assert.equal(await page.locator('[testimonial-section]').count(),1);
 assert.equal(await page.locator('[home-faq-button]').count(),5);
 assert.equal(await page.locator('[home-faq-button]').first().innerText(),'What is Imprint Engine?');
 assert.equal(await page.locator('[home-faq] [filter-tab]').count(),0);
 console.log('PASS native sections and five reference FAQ questions are present');
 for(const width of [1440,768,390]) {
  await page.setViewportSize({width,height:900});
  await page.waitForTimeout(300);
  for(const [name,selector]of [['comparison','[compare-section]'],['testimonials','[testimonial-section]'],['faq','[home-faq]'],['audience','.section-tiles'],['catalogue','[cat-select]']]) {
   // Decorative artwork intentionally extends beyond sections; check content width.
   const layout=await page.locator(selector).first().evaluate(e=>{
    const content=e.querySelector('.compare-heading-row,.home-faq-layout,.tiles-dna-layout')||e;
    return {width:e.getBoundingClientRect().width,scroll:content.scrollWidth,client:content.clientWidth};
   });
   report.push({width,name,...layout});
   assert.ok(layout.width<=width+1,`${name} is wider than ${width}px viewport`);
   assert.ok(layout.scroll<=layout.client+2,`${name} content overflows at ${width}px: ${JSON.stringify(layout)}`);
   if(output && selector!=='[cat-select]')await page.locator(selector).screenshot({path:join(output,`${name}-${width}.png`)});
  }
  await page.locator('[home-faq-button]').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(450);
  assert.equal(await page.locator('[home-faq-button]').first().getAttribute('aria-expanded'),'true');
  const answer=await page.locator('[home-faq-panel]').first().evaluate(e=>({height:e.clientHeight,content:e.scrollHeight,inert:e.inert}));
  assert.ok(answer.height>0 && answer.height>=answer.content-1 && !answer.inert);
  await page.evaluate(()=>{const buttons=document.querySelectorAll('[home-faq-button]');[1,3,2,4].forEach(i=>buttons[i].click());});
  await page.waitForTimeout(450);
  assert.equal(await page.locator('[home-faq-button][aria-expanded="true"]').count(),1);
  assert.equal(await page.locator('[home-faq-button]').last().getAttribute('aria-expanded'),'true');
  await page.locator('[home-faq-button]').last().focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(450);
  assert.equal(await page.locator('[home-faq-button][aria-expanded="true"]').count(),0);
  console.log(`PASS ${width}px layouts, keyboard activation and interrupted FAQ transitions`);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('[home-faq-button]').first().evaluate(e=>e.click());
 await page.waitForTimeout(50);
 assert.ok(await page.locator('[home-faq-panel]').first().evaluate(e=>e.clientHeight>0));
 await page.evaluate(()=>{initSite();initSite();initSite.cleanup();});
 assert.equal(await page.locator('[home-faq-button][aria-expanded]').count(),0);
 assert.equal(await page.locator('[home-faq-button][tabindex]').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS reduced motion, repeated initialization and complete FAQ cleanup');
} finally {
 if(output)await writeFile(join(output,'homepage-design-report.json'),JSON.stringify({report,errors},null,2));
 await browser.close();await new Promise(resolve=>server.close(resolve));
}

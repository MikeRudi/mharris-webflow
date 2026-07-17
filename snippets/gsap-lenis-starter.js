/*
  GSAP + Lenis starter snippet.

  Copy this into a site's own script.js and adapt it there.
  Do not link this snippet directly from Webflow.
*/

function initSmoothScroll() {
  if (!window.Lenis || !window.gsap) return;

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

function initPageAnimations() {
  if (!window.gsap) return;

  gsap.from("[data-animate='fade-up']", {
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.08,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initPageAnimations();
});

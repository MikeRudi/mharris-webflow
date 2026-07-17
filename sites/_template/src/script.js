function isWebflowEditor() {
  return window.Webflow && window.Webflow.env && window.Webflow.env("editor") !== undefined;
}

function initLenis() {
  if (!window.Lenis || isWebflowEditor()) return null;

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.7,
    gestureOrientation: "vertical",
    normalizeWheel: false,
    smoothTouch: false,
  });

  window.lenis = lenis;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  document.querySelectorAll("[data-lenis-prevent]").forEach((el) => {
    el.addEventListener("wheel", (event) => event.stopPropagation());
    el.addEventListener("touchmove", (event) => event.stopPropagation());
  });

  if (window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  if (window.gsap) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  return lenis;
}

function gitTestDesktop() {
  const gitTest = document.querySelector(".git-test");
  if (!gitTest) return null;

  const handleClick = () => {
    gitTest.classList.toggle("is-moved-right");
  };

  gitTest.addEventListener("click", handleClick);

  return () => {
    gitTest.removeEventListener("click", handleClick);
    gitTest.classList.remove("is-moved-right");
  };
}

function gitTestMobile() {
  const gitTest = document.querySelector(".git-test");
  if (!gitTest) return null;

  const handleClick = () => {
    gitTest.classList.toggle("is-moved-down");
  };

  gitTest.addEventListener("click", handleClick);

  return () => {
    gitTest.removeEventListener("click", handleClick);
    gitTest.classList.remove("is-moved-down");
  };
}

function initResponsiveScripts() {
  if (!window.gsap) {
    gitTestDesktop();
    return;
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 992px)", () => {
    return gitTestDesktop();
  });

  mm.add("(max-width: 991px)", () => {
    return gitTestMobile();
  });
}

function initSite() {
  initLenis();
  initResponsiveScripts();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite);
} else {
  initSite();
}

let lineSplit;
function runSplit() {
  lineSplit = new SplitType("[lineSplit]", {
    types: "lines, words, char",
  });
}
runSplit();
let windowWidth = $(window).innerWidth();
window.addEventListener("resize", function () {
  if (windowWidth !== $(window).innerWidth()) {
    windowWidth = $(window).innerWidth();
    splitText.revert();
    runSplit();
  }
});
const lenis = new Lenis({
  gestureOrientation: "vertical",
  normalizeWheel: false,
  smoothTouch: false,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
gsap.registerPlugin(ScrambleTextPlugin);
let mm = gsap.matchMedia();
// ~~~~~~~~~~~~~~~~~~~~GENERAL~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".page_wrap")) {
  mm.add("(min-width: 992px)", () => {
    lineAnimate();
  });
  mm.add("(max-width: 991px)", () => {});
  copyToClipboard();
  animateTextType();
  animateTextUp();
  mobileMenu();
  let wasInLandscape = false;
  function handleOrientationLock() {
    const isMobile = window.matchMedia("(max-width: 991px)").matches;
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const message = document.querySelector(".mobile-landscape-message");

    if (!message) return;

    if (isMobile && isLandscape && isTouch) {
      wasInLandscape = true;
      message.style.display = "flex";
    } else {
      message.style.display = "none";

      if (wasInLandscape) {
        wasInLandscape = false;
        lenis.scrollTo(0, { immediate: true });
      }
    }
  }
  window.addEventListener("load", handleOrientationLock);
  window.addEventListener("resize", handleOrientationLock);
  window.addEventListener("orientationchange", handleOrientationLock);
}
// ~~~~~~~~~~~~~~~~~~~~HOME~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".hero_section")) {
  mm.add("(min-width: 992px)", () => {
    imageFollowCursor();
    btnRoundHover();
    homeLineHover();
    valueHoverEffect();
    whatWeDoHover();
    animateTextTypeParallax();
  });
  mm.add("(max-width: 991px)", () => {
    mobileVideoFullScreen();
    animateTextTypeParallaxMobile();
  });
  // preloader first visit
  if (!sessionStorage.getItem("visited")) {
    sessionStorage.setItem("visited", "true");
    pageLoader();
  } else {
    const loader = document.querySelector(".loader");
    if (loader) {
      loader.style.display = "none";
    }

    const pageWrap = document.querySelector(".page_wrap");
    if (pageWrap) {
      pageWrap.style.marginTop = "0";
    }
  }
  textCursorFollow();
  containerGrowScroll();
  footerSmall();
  randomFooter();
  valueScrollAnimation();
  valueHoverEffect();
  videoGrow();
  infiniteScrollHome();
  animateLines();
  imageFollowCursor();
  sectionUp();
}
// ~~~~~~~~~~~~~~~~~~~~people~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".p-hover-section")) {
  mm.add("(min-width: 992px)", () => {
    clientHover();
    btnRoundHover();
  });
  mm.add("(max-width: 991px)", () => {});
  peopleLotiAnimation();
  peopleScroll();
  footerSmall();
  animateLines();
  lineAnimate();
}
// ~~~~~~~~~~~~~~~~~~~~work~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".work-item-content")) {
  mm.add("(min-width: 992px)", () => {
    horizontalScroll();
    textCursorFollow();
  });
  mm.add("(max-width: 991px)", () => {
    horizontalScroll();
  });
}
// ~~~~~~~~~~~~~~~~~~~~Projects~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".project-info-wrap")) {
  mm.add("(min-width: 992px)", () => {
    nextProjectCursor();
  });
  mm.add("(max-width: 991px)", () => {});
  animateLines();
  beforeAndAfter();
  nextProject();
  footerSmall();
  imageFollowCursor();
  imageTopscroll();
  imageScroll();
  videoScroll();
}
// ~~~~~~~~~~~~~~~~~~~~Reasons~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".reasons-contain")) {
  mm.add("(min-width: 992px)", () => {
    btnRoundHover();
  });
  mm.add("(max-width: 991px)", () => {
    mobileVideoFullScreenSingle();
  });
  footerSmall();
  $(document).ready(function () {
    if ($(".reasons-layout").length) newReasons();
  });
}
// ~~~~~~~~~~~~~~~~~~~~Taster~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".taster-contain")) {
  mm.add("(min-width: 992px)", () => {
    tasterHover();
  });

  mm.add("(max-width: 991px)", () => {});
  footerSmall();
}
// ~~~~~~~~~~~~~~~~~~~~Questions~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".questions-wrap")) {
  mm.add("(min-width: 992px)", () => {
    questionScrollParallax();
    questionNumScroll();
  });
  mm.add("(max-width: 991px)", () => {});
  accordionHover();
  footerSmall();
  animateLines();
  seeMoreScroll();
}
// ~~~~~~~~~~~~~~~~~~~~error~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".is-error")) {
  mm.add("(min-width: 992px)", () => {
    hoverPageImageTrail();
  });
  mm.add("(max-width: 991px)", () => {});
}
// Functions
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.target.closest("[mobile-contact]")) return;
      if (link.hasAttribute("pag-next")) return;

      const href = link.getAttribute("href");

      if (href && !href.startsWith("#") && href !== window.location.pathname) {
        event.preventDefault();

        if (document.body.classList.contains("menu-open")) {
          const menuWrap = $("[m-menu-wrap]");
          const navPointer = $("[mobile-nav-pointer]");

          const closeMenuTL = gsap.timeline({
            onComplete: () => {
              $("body").removeClass("menu-open");
              menuWrap.css("pointer-events", "none");
              navPointer.css("pointer-events", "auto");

              runPageLeaveAnimation(href, link);
            },
          });

          closeMenuTL.fromTo(
            "[m-menu-fade]",
            {
              opacity: 1,
            },
            {
              opacity: 0,
              duration: 0.6,
              ease: "power2.inOut",
            }
          );
        } else {
          runPageLeaveAnimation(href, link);
        }
      }
    });
  });
});
function runPageLeaveAnimation(href, link) {
  const pageLeave = document.querySelector(".page-leave-grow");
  const nextBg = link.getAttribute("background");

  if (pageLeave && nextBg) {
    pageLeave.style.backgroundColor = nextBg;
  }

  let nextHTML = null;

  fetch(href)
    .then((response) => response.text())
    .then((html) => {
      nextHTML = html;
    });

  const tl = gsap.timeline({
    onComplete: () => {
      if (nextHTML) {
        const parser = new DOMParser();
        const nextDoc = parser.parseFromString(nextHTML, "text/html");
        const newContent = nextDoc.querySelector("main");
        const currentMain = document.querySelector("main");

        if (newContent && currentMain) {
          currentMain.innerHTML = newContent.innerHTML;
          window.history.pushState({}, "", href);
          window.scrollTo(0, 0);
          animatePageIn();
        } else {
          window.location.href = href;
        }
      } else {
        window.location.href = href;
      }
    },
  });

  tl.set(".page-leave-grow", { rotate: -35 });
  tl.set(".page-leave-overlay", { opacity: 0 });

  tl.to(
    ".page-leave-overlay",
    {
      opacity: 1,
      duration: 0.5,
      ease: "power1.in",
    },
    0
  );

  tl.to(
    ".page-leave-wrap",
    {
      opacity: 1,
      duration: 0.05,
      ease: "linear",
    },
    0
  );

  tl.fromTo(
    ".page-leave-grow",
    { scale: 0.01, rotate: 0 },
    { scale: 1, duration: 1, ease: "power3.inOut" },
    0
  );

  tl.fromTo(
    ".page-leave-grow",
    { rotate: -35 },
    { rotate: 0, duration: 1, ease: "power3.inOut" },
    0
  );

  tl.fromTo(
    ".page-leave-grow",
    { borderRadius: "1.25rem" },
    { borderRadius: "0rem", duration: 0.2, ease: "power2.out" },
    0.8
  );
}
function animatePageIn() {
  const animatePageInTimeline = gsap.timeline();

  animatePageInTimeline.set("[page-fade]", { opacity: 1 }, 0);

  animatePageInTimeline.set(".page-leave-wrap", { opacity: 0 }, 0);

  animatePageInTimeline.fromTo(
    "[workload-img-wrap]",
    {
      clipPath: "inset(100% 0% 0% 0% round 0.625rem)",
    },
    {
      clipPath: "inset(0% 0% 0% 0% round 0.625rem)",
      duration: 1,
      ease: "power3.inOut",
      stagger: 0.1,
      immediateRender: true,
    },
    0.1
  );

  animatePageInTimeline.fromTo(
    "[workload-img]",
    {
      yPercent: 50,
    },
    {
      yPercent: 0,
      duration: 1.2,
      ease: "power3.inOut",
      immediateRender: true,
    },
    0.1
  );

  $("[workload-up-one]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(
      words,
      { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
      0
    );

    animatePageInTimeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.3
    );
  });
  $("[workload-up-one]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { yPercent: 50, opacity: 1 }, 0);

    animatePageInTimeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.3
    );
  });
  $("[workload-up-two]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(
      words,
      { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
      0
    );

    animatePageInTimeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.7
    );
  });
  $("[workload-up-two]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { yPercent: 50, opacity: 1 }, 0);

    animatePageInTimeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.7
    );
  });
  $("[workload-up-three]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(
      words,
      { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
      0
    );

    animatePageInTimeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.8
    );
  });
  $("[workload-up-three]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { yPercent: 50, opacity: 1 }, 0);

    animatePageInTimeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.8
    );
  });
  animatePageInTimeline.fromTo(
    "[workcmsload-img-wrap]",
    {
      clipPath: "inset(100% 0% 0% 0% round 0.625rem)",
    },
    {
      clipPath: "inset(0% 0% 0% 0% round 0.625rem)",
      duration: 1.2,
      ease: "power3.inOut",
      stagger: 0.1,
      immediateRender: true,
    },
    0.2
  );

  animatePageInTimeline.fromTo(
    "[workcmsload-img]",
    {
      yPercent: 50,
    },
    {
      yPercent: 0,
      duration: 1.2,
      ease: "power3.inOut",
      immediateRender: true,
    },
    0.2
  );

  $("[workcmsload-up-animate]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(
      words,
      { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
      0
    );

    animatePageInTimeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "linear",
      },
      0.2
    );
  });

  $("[workcmsload-up-animate]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { yPercent: 50, opacity: 1 }, 0);

    animatePageInTimeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "linear",
      },
      0.2
    );
  });
  animatePageInTimeline.fromTo(
    "[pageload-up]",
    {
      clipPath: "inset(0% 0% 100% 0%)",
    },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.2,
      stagger: 0.02,
      ease: "linear",
    },
    0
  );

  animatePageInTimeline.fromTo(
    "[pageload-reveal]",
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 0.3,
      stagger: 0.03,
      ease: "linear",
    },
    0
  );

  $("[pageload-text-type]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { opacity: 0 }, 0);

    animatePageInTimeline.to(
      words,
      {
        opacity: 1,
        duration: 0.1,
        stagger: 0.03,
        ease: "linear",
      },
      0
    );
  });
  $("[pageload-up-animate]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(
      words,
      { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
      0
    );

    animatePageInTimeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0
    );
  });
  $("[pageload-up-animate]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { yPercent: 50, opacity: 1 }, 0);

    animatePageInTimeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0
    );
  });
  $("[homeload-text-type]").each(function () {
    const words = $(this).find(".word");
    if (!words.length) return;

    animatePageInTimeline.set(words, { opacity: 0 }, 0);

    animatePageInTimeline.to(
      words,
      {
        opacity: 1,
        duration: 0.1,
        stagger: 0.03,
        ease: "linear",
      },
      0.6
    );
  });

  animatePageInTimeline.fromTo(
    "[pageload-line]",
    {
      clipPath: "inset(0% 100% 0% 0%)",
    },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.6,
      ease: "power2.in",
      immediateRender: true,
    },
    0.6
  );

  animatePageInTimeline.fromTo(
    ".questions-preload",
    {
      opacity: 0,
      scale: 0.9,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "power1.in",
      immediateRender: true,
    },
    0
  );

  animatePageInTimeline.fromTo(
    ".questions-preload",
    {
      opacity: 1,
      scale: 1,
    },
    {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: "power1.in",
      immediateRender: false,
    },
    2.7
  );

  animatePageInTimeline.fromTo(
    ".questions-spline-wrap",
    {
      scale: 0.9,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "power1.in",
      immediateRender: true,
    },
    3
  );

  return animatePageInTimeline;
}
window.addEventListener("pageshow", animatePageIn);
function runReasonsAnimation($layout, initialLoad) {
  if (!initialLoad) return;

  const timeline = gsap.timeline();

  $layout.find("[reasonsload-text-type]").each(function (i) {
    const words = $(this).find(".word");
    if (!words.length) return;
    timeline.set(words, { opacity: 0 }, 0);
    timeline.to(
      words,
      {
        opacity: 1,
        duration: 0.2,
        stagger: 0.03,
        ease: "linear",
      },
      0.5
    );
  });

  $layout.find("[reasonsload-up-animate]").each(function (i) {
    const words = $(this).find(".word");
    if (!words.length) return;
    timeline.set(words, { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 }, 0);
    timeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.8
    );
  });

  $layout.find("[reasonsload-up-animate]").each(function (i) {
    const words = $(this).find(".word");
    if (!words.length) return;
    timeline.set(words, { yPercent: 50, opacity: 1 }, 0);
    timeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.3
    );
  });

  $layout.find("[reasonsload-up-fade]").each(function (i) {
    const el = $(this);
    timeline.set(el, { opacity: 0 }, 0);
    timeline.to(
      el,
      {
        opacity: 1,
        duration: 0.3,
        ease: "linear",
      },
      1.5
    );
  });

  timeline.fromTo(
    $layout.find("[pageload-line-long]"),
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.6,
      ease: "power2.in",
      stagger: 0.6,
      immediateRender: true,
    },
    0.2
  );
}
function runReasonsAnimation($layout) {
  const timeline = gsap.timeline();

  $layout.find("[reasonsload-text-type]").each(function (i) {
    const words = $(this).find(".word");
    if (!words.length) return;
    timeline.set(words, { opacity: 0 }, 0);
    timeline.to(
      words,
      {
        opacity: 1,
        duration: 0.2,
        stagger: 0.03,
        ease: "linear",
      },
      0.5
    );
  });

  $layout.find("[reasonsload-up-animate]").each(function (i) {
    const words = $(this).find(".word");
    if (!words.length) return;
    timeline.set(words, { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 }, 0);
    timeline.to(
      words,
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.8
    );
  });

  $layout.find("[reasonsload-up-animate]").each(function (i) {
    const words = $(this).find(".word");
    if (!words.length) return;
    timeline.set(words, { yPercent: 50, opacity: 1 }, 0);
    timeline.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "linear",
      },
      0.3
    );
  });

  $layout.find("[reasonsload-up-fade]").each(function (i) {
    const el = $(this);
    timeline.set(el, { opacity: 0 }, 0);
    timeline.to(
      el,
      {
        opacity: 1,
        duration: 0.3,
        ease: "linear",
      },
      1.5
    );
  });

  timeline.fromTo(
    $layout.find("[pageload-line-long]"),
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.6,
      ease: "power2.in",
      stagger: 0.6,
      immediateRender: true,
    },
    0.2
  );

  $layout.find("[reason-reveal]").each(function () {
    const $el = $(this);
    timeline.set($el, { opacity: 0, y: 40 }, 0);
    timeline.to(
      $el,
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      1.2
    );
  });
}
function mobileMenu() {
  const menuWrap = $("[m-menu-wrap]");
  const navPointer = $("[mobile-nav-pointer]");

  const tl = gsap.timeline({
    paused: true,
    reversed: true,
    onComplete: () => {
      menuWrap.css("pointer-events", "auto");
      navPointer.css("pointer-events", "none");
      $("body").addClass("menu-open");
    },
    onReverseComplete: () => {
      menuWrap.css("pointer-events", "none");
      navPointer.css("pointer-events", "auto");
      $("body").removeClass("menu-open");
    },
  });

  tl.fromTo(
    menuWrap,
    {
      clipPath: "inset(0% 0% 100% 0% round 1.25rem)",
    },
    {
      clipPath: "inset(0% 0% 0% 0% round 0rem)",
      duration: 0.6,
      ease: "power2.inOut",
    }
  );

  $("[m-menu-open]").on("click touchstart", function () {
    if (tl.reversed()) tl.play();
  });

  $("[m-menu-close]").on("click touchstart", function () {
    if (!tl.reversed()) tl.reverse();
  });
}
function homeLineHover() {
  document.querySelectorAll(".hero-link").forEach((link) => {
    const line = link.querySelector(".h-line-abs");

    if (!line) return;

    link.addEventListener("mouseenter", () => {
      gsap.to(line, {
        clipPath: "inset(0% 0% 0% 100%)",
        duration: 0.6,
        ease: "cubic-bezier(0.25, 1, 0.5, 1)",
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(line, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.6,
        ease: "cubic-bezier(0.25, 1, 0.5, 1)",
      });
    });
  });
}
function nextProjectCursor() {
  document.addEventListener("DOMContentLoaded", () => {
    const $cursor = $(".cursor-img");
    const $cursorHolder = $(".cursor_img_holder");
    const $cursorImage = $cursor.find("[cursor-img-single]");

    $cursorImage.hide();
    gsap.set($cursor, { opacity: 0 });

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = window.scrollY;
    let lastMouseX = 0;
    let isHovering = false;
    let activeProjectItem = null;

    const xTo = gsap.quickTo($cursor, "x", { ease: "power3", duration: 0.1 });
    const yTo = gsap.quickTo($cursor, "y", { ease: "power3", duration: 0.1 });

    function updateCursor() {
      const cursorWidth = $cursor.outerWidth();
      const cursorHeight = $cursor.outerHeight();
      const xOffset = -200;
      const yOffset = -100;

      const cursorX = mouseX - cursorWidth / 2 + xOffset;
      const cursorY = mouseY + scrollY - cursorHeight / 2 + yOffset;

      xTo(cursorX);
      yTo(cursorY);

      if (isHovering) {
        const deltaX = mouseX - lastMouseX;
        const rotation = Math.max(-45, Math.min(45, deltaX * 0.2));
        gsap.to($cursorHolder, {
          rotate: rotation,
          duration: 0.4,
          ease: "power1.out",
        });
      }

      lastMouseX = mouseX;
    }

    gsap.ticker.add(updateCursor);

    function handleMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function handleScroll() {
      scrollY = window.scrollY;

      if (activeProjectItem) {
        const newImgSrc = activeProjectItem
          .find("[next-project-img]")
          .attr("src");
        if (newImgSrc) {
          $cursorImage.attr("src", newImgSrc);
        }
        $cursorImage.show();
        gsap.to($cursor, { opacity: 1, duration: 0.1 });
      }
    }

    $(document).on("mousemove", handleMouseMove);
    $(window).on("scroll", handleScroll);

    $(".project-next-item").each(function () {
      let hoverTimeout;
      $(this).on("mouseenter", function () {
        isHovering = true;
        activeProjectItem = $(this);

        hoverTimeout = setTimeout(() => {
          const newImgSrc = $(this).find("[next-project-img]").attr("src");
          if (newImgSrc) {
            $cursorImage.attr("src", newImgSrc);
          }
          $cursorImage.show();
          gsap.to($cursor, { opacity: 1, duration: 0.1 });
        }, 0);
      });

      $(this).on("mouseleave", function () {
        isHovering = false;
        activeProjectItem = null;
        clearTimeout(hoverTimeout);
        gsap.to($cursor, { opacity: 0, duration: 0.1, ease: "power2.out" });
        $cursorImage.hide();
      });
    });
  });
}
function tasterHover() {
  const items = document.querySelectorAll(".taster-menu-item");
  const layout = document.querySelector(".taster-menu-layout");

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      layout.classList.add("is-hovered");
      items.forEach((el) => {
        el.classList.toggle("is-active", el === item);
      });
    });

    item.addEventListener("mouseleave", () => {
      layout.classList.remove("is-hovered");
      items.forEach((el) => el.classList.remove("is-active"));
    });
  });
}
function imageFollowCursor() {
  const $cursor = $(".cursor-img");
  const $cursorholder = $(".cursor_img_holder");
  const $images = $cursor.find("[cursor-img-one]");
  let lastMouseX = 0;

  const cursorWidth = $cursor.outerWidth() / 2;
  const cursorHeight = $cursor.outerHeight() * 1.1;

  const xTo = gsap.quickTo($cursor, "x", { ease: "circ.out", duration: 0.1 });
  const yTo = gsap.quickTo($cursor, "y", { ease: "circ.out", duration: 0.1 });

  $("[cursor-follow]").on("mousemove", function (event) {
    const cursorX = event.clientX - cursorWidth;
    const cursorY = event.clientY - cursorHeight;

    const deltaX = event.clientX - lastMouseX;
    const rotation = Math.max(-45, Math.min(45, deltaX * 0.2));
    lastMouseX = event.clientX;

    xTo(cursorX);
    yTo(cursorY);

    gsap.to($cursorholder, {
      rotate: rotation,
      duration: 0.2,
      ease: "power1.out",
    });
  });

  $(".hero-link").on("mouseenter", function () {
    $images.show();
    gsap.to($cursor, {
      opacity: 1,
      duration: 0.2,
      ease: "power1.out",
    });
    gsap.fromTo(
      $(this).find(".underline-line"),
      {
        clipPath: "inset(0% 0% 0% 0%)",
      },
      {
        clipPath: "inset(0% 0% 0% 100%)",
        duration: 0.3,
        ease: "power2.in",
        immediateRender: false,
      }
    );
  });

  $(".hero-link").on("mouseleave", function () {
    gsap.to($cursor, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });
    $images.hide();
    gsap.fromTo(
      $(this).find(".underline-line"),
      {
        clipPath: "inset(0% 0% 0% 100%)",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.3,
        ease: "power2.in",
        immediateRender: false,
      }
    );
  });
}
function mobileVideoFullScreen() {
  $(document).ready(function () {
    const $videoWrap = $(".mobile_video_wrap");
    const $videos = $videoWrap.find(
      "[mobile-vid-one], [mobile-vid-two], [mobile-vid-three]"
    );
    let holdCount = 0;

    $(".hero-link").on("touchstart", function () {
      holdCount++;
      const cycle = holdCount % 3;

      $videos.hide();

      if (cycle === 1) {
        $videoWrap.find("[mobile-vid-one]").show();
      } else if (cycle === 2) {
        $videoWrap.find("[mobile-vid-two]").show();
      } else {
        $videoWrap.find("[mobile-vid-three]").show();
      }

      gsap.to($videoWrap, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    $(".hero-link").on("touchend", function () {
      gsap.to($videoWrap, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}
function mobileVideoFullScreenSingle() {
  $(document).ready(function () {
    const $videoWrap = $(".mobile_video_wrap");
    const $video = $videoWrap.find("[mobile-vid-one]");

    $(".hero-link").on("touchstart", function () {
      $video.show();

      gsap.to($videoWrap, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    $(".hero-link").on("touchend", function () {
      gsap.to($videoWrap, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => $video.hide(),
      });
    });
  });
}
function copyToClipboard() {
  const $copiedCursor = $(".copied_cursor");

  function updateOffsets() {
    return window.matchMedia("(max-width: 992px)").matches
      ? { x: -50, y: -50 }
      : { x: 20, y: 10 };
  }

  let offsets = updateOffsets();

  $(window).on("resize", () => {
    offsets = updateOffsets();
    ScrollTrigger.refresh();
  });

  $(document).on("mousemove", function (event) {
    gsap.to($copiedCursor, {
      x: event.clientX + offsets.x,
      y: event.clientY + offsets.y,
      duration: 0.1,
      ease: "power2.out",
    });
  });

  $("[copy-text-item]")
    .on("mouseenter", function () {
      $copiedCursor.text("Click to Copy");
      gsap.to($copiedCursor, { opacity: 1, duration: 0 });
    })
    .on("mouseleave", function () {
      gsap.to($copiedCursor, { opacity: 0, duration: 0 });
    })
    .on("click", function () {
      const $landText = $(this).find("[copy-text]");
      const originalText = $landText.text();

      navigator.clipboard
        .writeText(originalText)
        .then(() => {
          $copiedCursor.text("Copied");
          gsap.to($copiedCursor, { opacity: 1, duration: 0.1 });
          setTimeout(() => {
            gsap.to($copiedCursor, { opacity: 0, duration: 0.3 });
          }, 1000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    });
}
function pageLoader() {
  lenis.stop();

  const loader = document.querySelector(".loader");
  const loadUpElements = document.querySelectorAll("[load-up]");
  const loadFadeElements = document.querySelectorAll("[load-fade]");

  const videos = [
    document.querySelector("[preloader-one]"),
    document.querySelector("[preloader-two]"),
    document.querySelector("[preloader-three]"),
  ];

  const randomIndex = Math.floor(Math.random() * videos.length);
  const selectedVideo = videos[randomIndex];
  selectedVideo.style.display = "block";
  selectedVideo.play().catch(() => {});

  const startTime = performance.now();

  window.addEventListener("load", () => {
    const now = performance.now();
    const elapsed = now - startTime;
    const minDuration = 2000;
    const delay = Math.max(minDuration - elapsed, 0);

    setTimeout(() => {
      loaderComplete();
    }, delay);
  });

  function loaderComplete() {
    const timeline = gsap.timeline({
      onComplete: () => {
        lenis.start();
      },
    });

    timeline
      .to(loader, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.8,
        ease: "power2.inOut",
      })
      .fromTo(
        loadUpElements,
        {
          opacity: 0,
          yPercent: 25,
        },
        {
          opacity: 1,
          yPercent: 0,
          duration: 1.2,
          ease: "expo.out",
        },
        "<45%"
      )
      .fromTo(
        loadFadeElements,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "<40%"
      );
  }
}
function lineAnimate() {
  $(document).ready(function () {
    $("[line-hover-item]").each(function () {
      const $hoverItem = $(this);
      const $lineHover = $hoverItem.find("[line-hover]");

      $hoverItem.on("mouseenter", function () {
        gsap.fromTo(
          $lineHover,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.3,
            ease: "cubic-bezier(0.25, 1, 0.5, 1)",
          }
        );
      });

      $hoverItem.on("mouseleave", function () {
        gsap.fromTo(
          $lineHover,
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 100%)",
            duration: 0.3,
            ease: "cubic-bezier(0.25, 1, 0.5, 1)",
          }
        );
      });
    });
  });
}
function animateLines() {
  $("[animate-line]").each(function () {
    const line = this;

    gsap.fromTo(
      line,
      { clipPath: "inset(0% 100% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.4,
        ease: "linear",
        scrollTrigger: {
          trigger: line,
          start: "top bottom",
          end: "top 70%",
          scrub: true,

          toggleActions: "play none none none",
        },
      }
    );
  });
}
function valueScrollAnimation() {
  let valueTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[value-trigger]",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  valueTimeline.fromTo(
    "[value-up]",
    { yPercent: 0 },
    { yPercent: -100, y: "-0.3em", ease: "none", duration: 0.7 }
  );

  valueTimeline.fromTo(
    "[value-parallax]",
    { marginTop: "0px" },
    { marginTop: "auto", ease: "none", duration: 0.7 },
    0
  );

  valueTimeline.fromTo(
    ".value-scroll-vid",
    { pointerEvents: "none" },
    { pointerEvents: "auto", duration: 0, immediateRender: false },
    0.7
  );

  valueTimeline.fromTo(
    ".h-line-value",
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.3,
      ease: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
    0.7
  );
}
function footerBig() {
  let footerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[footer-trigger]",
      start: "top 10%",

      toggleActions: "play none none reverse",
    },
  });

  let $menuUp = $("[menu-up-f]");

  $("[footer-trigger]").each(function () {
    let $footerUp = $(this).find("[footer-up]");

    footerTimeline.fromTo(
      $menuUp,
      { yPercent: 0 },
      {
        yPercent: -100,
        y: "-0.3em",
        duration: 0.2,
        ease: "cubic-bezier(0.25, 1, 0.5, 1)",
      }
    );

    footerTimeline.fromTo(
      $footerUp,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: 0.2,
        ease: "cubic-bezier(0.25, 1, 0.5, 1)",
      }
    );
  });
}
function footerSmall() {
  const $menuUp = $("[menu-up-f]");
  const $menuItems = $("[menu-item]");

  $("[footer-trigger]").each(function () {
    const $footerUp = $(this).find("[footer-up]");

    ScrollTrigger.create({
      trigger: this,
      start: "top 10%",
      toggleActions: "play none none reverse",
      onEnter: () => {
        gsap.to($menuUp, {
          yPercent: -100,
          y: "-0.3em",
          duration: 0.2,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
        });

        gsap.to($footerUp, {
          yPercent: 0,
          opacity: 1,
          duration: 0.2,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
        });

        $menuItems.css("pointer-events", "none");
      },
      onLeaveBack: () => {
        gsap.to($menuUp, {
          yPercent: 0,
          y: "0em",
          duration: 0.2,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
        });

        gsap.to($footerUp, {
          yPercent: 100,
          opacity: 0,
          duration: 0.2,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
        });

        $menuItems.css("pointer-events", "auto");
      },
    });
  });
}
function valueHoverEffect() {
  const $valueVidSticky = $(".value-vid-sticky");
  const $valueVids = $valueVidSticky.find(".value-vid");
  const $valueFade = $("[value-fade]");
  const $navWrap = $(".nav_wrap");
  const $valueHover = $("[value-hover]");
  const $hLine2 = $(".h-line-2");
  const $hLineValue = $(".h-line-value");
  const $tapHold = $(".mobile_tap_wrap");
  let hoverCount = 0;

  function showVideo() {
    hoverCount++;
    const cycle = hoverCount % $valueVids.length;

    $valueVids.css("display", "none");
    $valueVids.eq(cycle).css("display", "block");
    $valueFade.css("opacity", 0);
    $navWrap.css("color", "white");
    $valueHover.css("color", "white");
    $hLineValue.css("background-color", "white");
    $hLine2.css("background-color", "white");
    $tapHold.css("display", "none");
  }

  function hideVideo() {
    $valueVids.css("display", "none");
    $valueFade.css("opacity", 1);
    $navWrap.css("color", "");
    $hLine2.css("background-color", "");
    $hLineValue.css("background-color", "");
    $valueHover.css("color", "black");
    $tapHold.css("display", "block");
  }

  $("[value-hover]").on("mouseenter touchstart", function (e) {
    e.preventDefault();
    showVideo();
  });

  $("[value-hover]").on("mouseleave touchend", function () {
    hideVideo();
  });
}
function containerGrowScroll() {
  let containerGrowScroll = gsap.timeline({
    scrollTrigger: {
      trigger: "[grow-trigger]",
      start: "top top",
      end: "bottom top",
      toggleActions: "play none none reverse",
    },
  });

  containerGrowScroll.fromTo(
    "[scroll-grow]",
    { clipPath: "inset(1.7rem round 1.7rem)" },
    {
      clipPath: "inset(0rem round 0rem)",
      ease: "none",
      immediateRender: true,
      duration: 0.2,
    }
  );
}
function btnRoundHover() {
  $("[btn-round]").each(function () {
    let $btnRound = $(this);
    let $btnRoundNg = $btnRound.find("[btn-round-bg]");
    let $btnRoundText = $btnRound.find("[btn-round-text]");

    let hoverTimeline = gsap.timeline({ paused: true });
    let leaveTimeline = gsap.timeline({ paused: true });

    hoverTimeline.fromTo(
      $btnRoundNg,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.2,
        ease: "cubic-bezier(0.3, 0, 0.3, 1)",
      }
    );

    hoverTimeline.fromTo(
      $btnRoundText,
      { color: "black" },
      { color: "white", duration: 0.2, ease: "cubic-bezier(0.3, 0, 0.3, 1)" },
      0
    );

    leaveTimeline.fromTo(
      $btnRoundNg,
      { clipPath: "inset(0% 0% 0% 0%)", immediateRender: false },
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.2,
        ease: "cubic-bezier(0.3, 0, 0.3, 1)",
        immediateRender: false,
      }
    );

    leaveTimeline.fromTo(
      $btnRoundText,
      { color: "white" },
      {
        color: "black",
        duration: 0.2,
        ease: "cubic-bezier(0.3, 0, 0.3, 1)",
        immediateRender: false,
      },
      0
    );

    $btnRound.on("mouseenter", function () {
      hoverTimeline.play();
      leaveTimeline.pause(0);
    });

    $btnRound.on("mouseleave", function () {
      leaveTimeline.play();
      hoverTimeline.pause(0);
    });
  });
}
function infiniteScrollHome() {
  $(document).ready(function () {
    let hoverTimer;

    $(".inf-mid").on("mousemove", function () {
      let $infSide = $(this).siblings(".inf-side");

      hoverTimer = setTimeout(function () {
        $infSide.css("opacity", 1);
      }, 0); // 2-second delay
    });

    $(".inf-mid").on("mouseleave", function () {
      clearTimeout(hoverTimer);
      $(this).siblings(".inf-side").css("opacity", "");
    });
  });
}
function videoGrow() {
  let lastScrollY = window.scrollY;
  let firstUpdate = true;

  let videoGrow = gsap.timeline({
    scrollTrigger: {
      trigger: "[vid-trigger]",
      start: "top top",
      end: "bottom bottom",
      scrub: true,

      onUpdate: (self) => {
        if (self.progress <= 0.69) {
          let currentScrollY = self.scroll();
          let deltaY = firstUpdate ? 0 : currentScrollY - lastScrollY;
          lastScrollY = currentScrollY;
          firstUpdate = false;
          let scaleFactor = self.progress < 0.4 ? 1 - self.progress / 0.4 : 0;
          let maxRotation = 45 * scaleFactor;
          let rotation = Math.max(
            -maxRotation,
            Math.min(maxRotation, deltaY * 0.12)
          );

          gsap.to("[vid-item]", {
            rotate: rotation,
            duration: 0.07,
            ease: "linear",
          });

          gsap.to("[video]", {
            rotate: -rotation,
            duration: 0.07,
            ease: "linear",
          });
        }
      },
    },
  });

  videoGrow.fromTo(
    "[vid-item]",
    { scale: 0.15 },
    { scale: 0.8, ease: "none", duration: 0.7 },
    0
  );

  videoGrow.to(
    "[vid-item]",
    { borderRadius: "2.5rem", duration: 0.3, ease: "none" },
    0
  );

  videoGrow.to(
    "[vid-item]",
    { borderRadius: "1.25rem", duration: 0.3, ease: "none" },
    0.3
  );
  videoGrow.to(
    "[vid-item]",
    {
      borderRadius: 0,
      duration: 0.15,
      borderRadius: "1.25rem",
      ease: "none",
    },
    0.6
  );

  videoGrow.to("[vid-item]", { scale: 0.8, duration: 0.3, ease: "none" }, 0.7);

  videoGrow.to("[video]", { rotation: 0, duration: 0.2, ease: "none" }, 0.7);
}
function peopleLotiAnimation() {
  lottie.loadAnimation({
    container: document.querySelector(".error-loti"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://cdn.prod.website-files.com/6756b8dd59cec0a354f2a62c/67597faf3abf1682d8381727_Boring_O_PreLoader.json",
  });
}
function VideoFlip() {
  let navWrap = $(".nav_wrap");

  $("[video-player]").each(function () {
    let videoPopupEl = $(this).find(".video-popup");
    let vidLand = $(this).find(".vid-land");
    let closeVidBtn = $(this).find(".video-close");
    let videoElement = $(this).find(".plyr_video")[0];

    if (
      !videoPopupEl.length ||
      !vidLand.length ||
      !closeVidBtn.length ||
      !videoElement
    ) {
      console.warn("Missing required elements inside [video-player]");
      return;
    }

    vidLand.on("click", function () {
      lenis.stop();
      videoPopupEl.css("display", "block");
      videoElement.play();
      navWrap.css("display", "none");
    });

    closeVidBtn.on("click", function () {
      if (videoElement && typeof videoElement.pause === "function") {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
      videoPopupEl.css("display", "none");
      navWrap.css("display", "block");
      lenis.start();
    });

    videoElement.addEventListener("ended", function () {
      closeVidBtn.click();
    });
  });
}
function peopleScroll() {
  const topHeaderWords = $("[spline-header-top] .word").toArray();
  const botHeaderWords = $("[spline-header-bot] .word").toArray();
  const topWords = $("[spline-content-top] .word").toArray();
  const botWords = $("[spline-content-bot] .word").toArray();

  gsap.set(topHeaderWords, { yPercent: 0, opacity: 1 });
  gsap.set(botHeaderWords, { yPercent: 50, opacity: 1 });

  gsap.set(topHeaderWords, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
  gsap.set(botHeaderWords, { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 });
  gsap.set(topWords, { opacity: 1, pointerEvents: "auto" });
  gsap.set(botWords, { opacity: 0, pointerEvents: "none" });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".p-spline-height",
      start: "50% 50%",
      end: "50% 50%",
      toggleActions: "play none none reverse",
    },
  });

  timeline.fromTo(
    "[spline-scroll]",
    { yPercent: 0 },
    { yPercent: -100, ease: "linear", duration: 0.5 },
    0
  );

  timeline.to(
    topHeaderWords,
    {
      clipPath: "inset(100% 0% 0% 0%)",
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "linear",
    },
    0
  );

  timeline.to(
    botHeaderWords,
    {
      clipPath: "inset(0% 0% 0% 0%)",
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "linear",
    },
    0.2
  );

  timeline.to(
    topHeaderWords,
    {
      yPercent: 50,
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "linear",
    },
    0
  );

  timeline.to(
    botHeaderWords,
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.3,
      stagger: 0.05,
      ease: "linear",
    },
    0.2
  );

  timeline.fromTo(
    topWords,
    {
      opacity: 1,
      pointerEvents: "auto",
    },
    {
      opacity: 0,
      pointerEvents: "none",
      ease: "linear",
      duration: 0.1,
      stagger: 0.01,
    },
    0
  );

  timeline.fromTo(
    botWords,
    {
      opacity: 0,
      pointerEvents: "none",
    },
    {
      opacity: 1,
      pointerEvents: "auto",
      ease: "linear",
      duration: 0.1,
      stagger: 0.01,
    },
    0.2
  );

  timeline.fromTo(
    "[scroll-top-item]",
    { pointerEvents: "auto" },
    { pointerEvents: "none" },
    0
  );

  timeline.fromTo(
    "[scroll-bot-item]",
    { pointerEvents: "none" },
    { pointerEvents: "auto" },
    0
  );
}
function textCursorFollow() {
  let cursorItem = document.querySelector(".cursor");
  let cursorParagraph = cursorItem.querySelector("p");
  let targets = document.querySelectorAll("[data-cursor]");
  let xOffset = 6;
  let yOffset = -50;
  let currentTarget = null;
  let lastText = "";

  gsap.set(cursorItem, { autoAlpha: 0 });

  let xTo = gsap.quickTo(cursorItem, "x", {
    ease: "circ.out",
    duration: 0.1,
  });
  let yTo = gsap.quickTo(cursorItem, "y", {
    ease: "circ.out",
    duration: 0.1,
  });

  $("[cursor-follow]").on("mousemove", (e) => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scrollY = window.scrollY;
    let cursorX = e.clientX;
    let cursorY = e.clientY + scrollY;

    // Default offsets
    let xPercent = xOffset;
    let yPercent = yOffset;

    gsap.set(cursorItem, {
      xPercent: xPercent,
      yPercent: yPercent,
    });
    xTo(cursorX);
    yTo(cursorY - scrollY);
  });

  targets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      currentTarget = target;
      let newText = target.getAttribute("data-cursor");

      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;
      }

      gsap.to(cursorItem, { autoAlpha: 1, duration: 0 });
    });

    target.addEventListener("mouseleave", () => {
      gsap.to(cursorItem, { autoAlpha: 0, duration: 0 });
    });
  });
}
function clientHover() {
  document.querySelectorAll(".client-hover-item").forEach((root) => {
    const images = [];
    root.querySelectorAll(".client-hover-media img").forEach((image) => {
      images.push(image.getAttribute("src"));
    });

    let incr = 0,
      oldIncrX = 0,
      oldIncrY = 0,
      resetDist = window.innerWidth / 6,
      indexImg = 0,
      firstImageTriggered = false;

    root.addEventListener("mouseenter", (e) => {
      oldIncrX = e.clientX;
      oldIncrY = e.clientY;
      firstImageTriggered = false;
    });

    root.addEventListener("mousemove", (e) => {
      const valX = e.clientX;
      const valY = e.clientY;

      if (!firstImageTriggered) {
        incr = 220;
        firstImageTriggered = true;
      } else {
        incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);
      }

      if (incr > resetDist) {
        incr = 0;
        createMedia(
          valX,
          valY - root.getBoundingClientRect().top,
          valX - oldIncrX,
          valY - oldIncrY
        );
      }

      oldIncrX = valX;
      oldIncrY = valY;
    });

    function createMedia(x, y, deltaX, deltaY) {
      const image = document.createElement("img");
      image.setAttribute("src", images[indexImg]);

      if (indexImg === images.length - 1) {
        image.style.opacity = "0";
      }

      root.appendChild(image);

      const tl = gsap.timeline({
        onComplete: () => {
          root.removeChild(image);
          tl && tl.kill();
        },
      });
      tl.set(
        image,

        {
          opacity: 1,
        }
      );

      tl.fromTo(
        image,
        {
          xPercent: -120 + (Math.random() - 0.5) * 10,
          yPercent: -100 + (Math.random() - 0.5) * 10,
          scaleX: 1,
          scaleY: 1,
        },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "elastic.out(2, 0.6)",
          duration: 0.6,
        }
      );

      tl.fromTo(
        image,
        {
          x,
          y,
          rotation: (Math.random() - 0.5) * 10,
        },
        {
          x: "+=" + deltaX * 2,
          y: "+=" + deltaY * 2,
          rotation: (Math.random() - 0.5) * 10,
          ease: "power4.out",
          duration: 0.5,
        },
        "<"
      );

      tl.to(image, {
        duration: 0.3,
        scale: 0.5,
        delay: 0.1,
        ease: "back.in(1.5)",
      });

      indexImg = (indexImg + 1) % images.length;
    }
  });
}
function horizontalScroll() {
  document.querySelectorAll("[work-bracket-one]").forEach((el, i) => {
    if (i > 0) el.style.opacity = "0";
  });

  document.querySelectorAll("[work-bracket-two]").forEach((el, i) => {
    if (i > 0) el.style.opacity = "0";
  });

  gsap.registerPlugin(Observer);

  let WIDTH_INACTIVE;
  let WIDTH_ACTIVE;
  let xTo;

  let mm = gsap.matchMedia();

  mm.add("(min-width: 500px)", () => {
    WIDTH_INACTIVE = "50%";
    WIDTH_ACTIVE = "100%";
    setupHorizontalScroll(
      window.innerWidth * 0.51,
      window.innerWidth * (-25 / 100)
    );
  });

  mm.add("(max-width: 500px)", () => {
    WIDTH_INACTIVE = "75%";
    WIDTH_ACTIVE = "100%";
    setupHorizontalScroll(
      window.innerWidth * 0.609,
      window.innerWidth * (-41 / 100)
    );
  });

  function setupHorizontalScroll(moveAmount, startingPosition) {
    const container = document.querySelector(
      ".horizontal-wrap .horizontal-container"
    );
    const cards = document.querySelectorAll(
      ".horizontal-wrap .horizontal-card"
    );

    const half = container.clientWidth / 2;
    const wrap = gsap.utils.wrap(-half, 0);
    let total = startingPosition;
    let animating = false;

    gsap.set(container, { x: total });

    xTo = gsap.quickTo(container, "x", {
      duration: 1,
      ease: "expo.out",
      modifiers: { x: gsap.utils.unitize(wrap) },
    });

    function getCenterCard() {
      const centerX = window.innerWidth / 2;
      let closestCard = null;
      let closestDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + card.offsetWidth / 2;
        const distance = Math.abs(centerX - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCard = card;
        }
      });

      return closestCard;
    }

    function setInitialCenterCard() {
      const centerCard = getCenterCard();
      const centerItemName = centerCard.getAttribute("work-item");

      gsap.set("[work-animate]", {
        yPercent: 200,
        opacity: 0,
        scale: 0.8,
      });

      gsap.set("[work-animate-horizontal]", {
        opacity: 0,
        scale: 0.8,
      });

      cards.forEach((card) => {
        const isCenter = card.getAttribute("work-item") === centerItemName;
        gsap.set(card.querySelector(".h-img-wrap"), {
          width: isCenter ? WIDTH_ACTIVE : WIDTH_INACTIVE,
        });
      });

      gsap.set(`[work-animate="${centerItemName}"]`, {
        yPercent: 0,
        scale: 1,
        opacity: 1,
      });

      gsap.set(`[work-animate-horizontal="${centerItemName}"]`, {
        scale: 1,
        opacity: 1,
      });
    }

    function move(direction) {
      if (animating) return;
      animating = true;
      document.body.classList.add("is-animating");

      const cardArray = Array.from(cards);
      const currentCard = getCenterCard();
      const currentIndex = cardArray.indexOf(currentCard);
      const targetIndex = gsap.utils.wrap(
        0,
        cardArray.length
      )(currentIndex + direction);
      const incomingCard = cardArray[targetIndex];

      total += direction * -moveAmount;
      xTo(total);

      const timeline = gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(0.125, () => {
            animating = false;
            document.body.classList.remove("is-animating");
          });
        },
      });

      const incomingName = incomingCard.getAttribute("work-item");
      const outgoingName = currentCard.getAttribute("work-item");

      const incomingWraps = document.querySelectorAll(
        `.horizontal-card[work-item="${incomingName}"] .h-img-wrap`
      );
      const outgoingWraps = document.querySelectorAll(
        `.horizontal-card[work-item="${outgoingName}"] .h-img-wrap`
      );

      incomingWraps.forEach((wrap) => {
        gsap.set(wrap, { width: WIDTH_INACTIVE });
        timeline.to(
          wrap,
          { width: WIDTH_ACTIVE, duration: 1, ease: "expo.out" },
          0
        );
      });

      outgoingWraps.forEach((wrap) => {
        timeline.to(
          wrap,
          { width: WIDTH_INACTIVE, duration: 1, ease: "expo.out" },
          0
        );
      });

      const verticalElsIn = document.querySelectorAll(
        `[work-animate="${incomingName}"]`
      );
      const horizontalElsIn = document.querySelectorAll(
        `[work-animate-horizontal="${incomingName}"]`
      );

      timeline.set(verticalElsIn, { opacity: 0 }, 0);
      timeline.set(horizontalElsIn, { opacity: 0 }, 0);

      timeline.fromTo(
        verticalElsIn,
        { opacity: 1 },
        { duration: 0.25, opacity: 1, ease: "power1.in" },
        0.2
      );

      timeline.fromTo(
        verticalElsIn,
        {
          yPercent: direction === 1 ? 200 : -200,
          scale: 1,
        },
        {
          yPercent: 0,
          scale: 1,
          duration: 0.5,
          ease: "power1.out",
          stagger: 0.02,
        },
        0.2
      );

      timeline.fromTo(
        horizontalElsIn,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power1.in" },
        0.5
      );

      const verticalElsOut = document.querySelectorAll(
        `[work-animate="${outgoingName}"]`
      );
      const horizontalElsOut = document.querySelectorAll(
        `[work-animate-horizontal="${outgoingName}"]`
      );

      timeline.to(
        verticalElsOut,
        {
          yPercent: direction === 1 ? -200 : 200,
          scale: 1,
          duration: 0.4,
          ease: "power1.in",
          stagger: 0,
        },
        0
      );

      timeline.to(
        horizontalElsOut,
        { scale: 0.6, duration: 0.4, opacity: 0, ease: "power1.in" },
        0
      );

      timeline.add(() => {
        const centerCard = getCenterCard();
        const centerItemName = centerCard.getAttribute("work-item");

        document.querySelectorAll(".h-img-wrap").forEach((wrap) => {
          const wrapCard = wrap.closest(".horizontal-card");
          const itemName = wrapCard?.getAttribute("work-item");
          const rect = wrapCard.getBoundingClientRect();
          const isInView = rect.left < window.innerWidth && rect.right > 0;

          if (
            itemName !== incomingName &&
            itemName !== centerItemName &&
            !isInView
          ) {
            gsap.set(wrap, { width: WIDTH_INACTIVE });
          }
        });

        document.querySelectorAll("[work-animate]").forEach((el) => {
          const name = el.getAttribute("work-animate");
          if (name !== incomingName) {
            gsap.set(el, {
              yPercent: 200,
              scale: 1,
              opacity: 0,
            });
          }
        });

        document.querySelectorAll("[work-animate-horizontal]").forEach((el) => {
          const name = el.getAttribute("work-animate-horizontal");
          if (name !== incomingName) {
            gsap.set(el, {
              scale: 0.8,
              opacity: 0,
            });
          }
        });
      }, ">");
    }

    let mmObserver = gsap.matchMedia();

    mmObserver.add("(min-width: 992px)", () => {
      Observer.create({
        type: "wheel,pointer",
        wheelSpeed: -1,
        preventDefault: true,
        tolerance: 500,
        axis: "x",
        onDown: () => !animating && move(-1),
        onUp: () => !animating && move(1),
      });
    });

    mmObserver.add("(max-width: 991px)", () => {
      Observer.create({
        type: "touch,pointer",
        preventDefault: true,
        tolerance: 20,
        axis: "x",
        onLeft: () => !animating && move(1),
        onRight: () => !animating && move(-1),
        onDown: () => !animating && move(1),
        onUp: () => !animating && move(-1),
      });
    });

    setInitialCenterCard();

    cards.forEach((card) => {
      const imgWrap = card.querySelector(".h-img-wrap");
      const tl = gsap.timeline({ paused: true });
      tl.to(imgWrap, {
        scale: 1.02,
        duration: 0.2,
        ease: "linear",
      });

      card.addEventListener("mouseenter", () => {
        const centerCard = getCenterCard();
        if (card === centerCard) tl.play();
      });

      card.addEventListener("mouseleave", () => {
        tl.reverse();
      });
    });
  }
}
function nextProject() {
  const currentItem = document.querySelector("[next-current]");
  if (!currentItem) return;

  const currentValue = parseInt(currentItem.getAttribute("next-current"), 10);
  let nextValue = currentValue + 1;

  const projectItems = document.querySelectorAll("[next-project]");

  let max = 0;
  projectItems.forEach((item) => {
    const num = parseInt(item.getAttribute("next-project"), 10);
    if (num > max) {
      max = num;
    }
  });

  if (nextValue > max) {
    nextValue = 1;
  }

  projectItems.forEach((item) => {
    const projectNumber = parseInt(item.getAttribute("next-project"), 10);
    if (projectNumber === nextValue) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}
function mobileSwiper() {
  const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: true,
    slidesPerView: "auto",
    spaceBetween: 0,
    on: {
      slideChange: function () {
        updateWorkDetails();
      },
    },
  });

  function updateWorkDetails() {
    const activeSlide = document.querySelector(".swiper-slide-active");

    if (!activeSlide) return;

    const workNumEl = activeSlide.querySelector("[work-num]");
    const workHeaderEl = activeSlide.querySelector("[work-header]");
    const workTagEl = activeSlide.querySelector("[work-tag]");
    const workSubEl = activeSlide.querySelector("[work-sub]");

    const workNumInput = document.querySelector("[work-num-input]");
    const workHeaderInput = document.querySelector("[work-header-input]");
    const workTagInput = document.querySelector("[work-tag-input]");
    const workSubInput = document.querySelector("[work-sub-input]");

    workNumInput.textContent = workNumEl
      ? "(00" + workNumEl.textContent.trim() + ")"
      : "";
    workHeaderInput.textContent = workHeaderEl ? workHeaderEl.textContent : "";
    workTagInput.innerHTML = workTagEl ? workTagEl.innerHTML : "";
    workSubInput.textContent = workSubEl ? workSubEl.textContent : "";
  }

  updateWorkDetails();
}
function accordionHover() {
  const items = document.querySelectorAll(".accordian-item");
  const isDesktop = window.matchMedia("(hover: hover)").matches;
  const isMobile = window.matchMedia("(hover: none)").matches;

  function expand(panel) {
    gsap.killTweensOf(panel);

    mm.add("(min-width: 992px)", () => {
      gsap.fromTo(
        panel,
        { height: "0px" },
        {
          height: "auto",
          duration: 0.5,
          ease: "power2.out",

          onUpdate: ScrollTrigger.refresh,
        }
      );
    });

    mm.add("(max-width: 991px)", () => {
      gsap.fromTo(
        panel,
        { height: "0px" },
        {
          height: "auto",
          duration: 0.5,
          ease: "power2.out",
        }
      );
    });

    gsap.fromTo(
      panel,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "sine.in",
      }
    );
  }

  function collapse(panel) {
    gsap.killTweensOf(panel);

    gsap.to(panel, {
      height: "0px",
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: ScrollTrigger.refresh,
    });

    gsap.to(panel, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }

  if (isDesktop) {
    items.forEach((item) => {
      const content = item.querySelector(".accordian-bot");

      item.addEventListener("mouseenter", () => {
        item.classList.add("is-active");
        expand(content);
      });

      item.addEventListener("mouseleave", () => {
        item.classList.remove("is-active");
        collapse(content);
      });
    });
  }

  if (isMobile) {
    items.forEach((item) => {
      const content = item.querySelector(".accordian-bot");

      item.addEventListener("click", () => {
        const isActive = item.classList.contains("is-active");

        items.forEach((el) => {
          el.classList.remove("is-active");
          const elContent = el.querySelector(".accordian-bot");
          if (elContent) collapse(elContent);
        });

        if (!isActive) {
          item.classList.add("is-active");
          expand(content);
        }
      });
    });
  }
}
function questionNumScroll() {
  const accordianItems = document.querySelectorAll(".accordian-item");
  const numMoves = document.querySelectorAll(".accordian-num-move");

  accordianItems.forEach((item, index) => {
    if (index === accordianItems.length - 1) return;

    gsap
      .timeline({
        scrollTrigger: {
          trigger: item,
          start: "bottom 45%",
          end: "bottom 45%",
          toggleActions: "play none none reverse",

          scrub: true,
        },
      })
      .to(numMoves, {
        yPercent: -(100 * (index + 1)),
        ease: "none",
      });
  });
}
function questionScrollParallax() {
  gsap.to("[question-scroll-spline]", {
    yPercent: 50,
    ease: "none",
    scrollTrigger: {
      trigger: "[question-scroll-trigger]",
      start: "top bottom",
      end: "bottom 40%",
      scrub: true,
    },
  });
}
function whatWeDoHover() {
  $("[hover-item-js]").each(function () {
    const parent = $(this);
    const targets = parent.find("[hover-show-js]");

    const tl = gsap.timeline({ paused: true });

    tl.to(targets, {
      yPercent: -101,
      y: "-0.3em",
      duration: 0.3,
      ease: "power2.out",
    });

    let isLeaving = false;

    parent.on("mouseenter", () => {
      isLeaving = false;
      tl.play();
    });

    parent.on("mouseleave", () => {
      if (tl.isActive()) {
        isLeaving = true;
        tl.eventCallback("onComplete", () => {
          if (isLeaving) {
            tl.reverse();
          }
        });
      } else {
        tl.reverse();
      }
    });
  });
}
function sectionUp() {
  const sectionUpTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[section-up-trigger]",
      start: "80% bottom",
      end: "bottom 60%",
      scrub: true,
    },
    defaults: {
      ease: "none",
    },
  });

  sectionUpTimeline.fromTo(
    "[section-up]",
    {
      clipPath: "inset(50% 0% 0% 0% round 1.25rem)",
    },
    {
      clipPath: "inset(0% 0% 0% 0% round 1.25rem)",
      duration: 0.2,
      stagger: 0.02,
      ease: "linear",
    },
    0
  );

  sectionUpTimeline.fromTo(
    "[section-up-content]",
    {
      yPercent: 75,
    },
    {
      yPercent: 0,
      duration: 0.2,
      stagger: 0.02,
      ease: "linear",
    },
    0
  );
}
function animateTextTypeParallax() {
  $("[text-type-parallax]").each(function () {
    const parent = this;
    const words = $(parent).find(".word");
    if (!words.length) return;

    gsap.set(words, { opacity: 0 });

    ScrollTrigger.matchMedia({
      "(min-width: 992px)": () => {
        gsap.to(words, {
          opacity: 1,
          duration: 0.2,
          stagger: 0.03,
          ease: "linear",
          scrollTrigger: {
            trigger: "[section-up-trigger]",
            start: "bottom bottom",
            end: "bottom 70%",
            scrub: true,
            toggleActions: "play none none none",
          },
        });
      },
    });
  });
}
function animateTextTypeParallaxMobile() {
  $("[text-type-parallaxMobile]").each(function () {
    const parent = this;
    const words = $(parent).find(".word");
    if (!words.length) return;

    gsap.set(words, { opacity: 0 });

    gsap.to(words, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.03,
      ease: "linear",
      scrollTrigger: {
        trigger: "[section-up-trigger]",
        start: "bottom 75%",
        end: "bottom 45%",
        scrub: true,
        toggleActions: "play none none none",
      },
    });
  });
}
function animateTextType() {
  $("[text-type]").each(function () {
    const parent = this;
    const words = $(parent).find(".word");
    if (!words.length) return;
    gsap.set(words, { opacity: 0 });
    gsap.to(words, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.03,
      ease: "linear",

      scrollTrigger: {
        trigger: parent,
        start: "top 95%",
        end: "top 70%",
        scrub: true,
        toggleActions: "play none none none",
      },
    });
  });

  $("[text-type-rich]").each(function () {
    const parent = this;

    const words = $(parent).find(".word");
    if (!words.length) return;

    gsap.set(words, { opacity: 0 });

    gsap.to(words, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.03,
      ease: "linear",

      scrollTrigger: {
        trigger: parent,
        start: "top 90%",
        end: "top 60%",

        scrub: true,
        toggleActions: "play none none none",
      },
    });
  });
}
function animateTextUp() {
  $("[text-up]").each(function () {
    const parent = this;
    const words = $(parent).find(".char");
    if (!words.length) return;

    gsap.set(words, {
      clipPath: "inset(0% 0% 100% 0%)",
      yPercent: 50,
      opacity: 1,
    });

    gsap.to(words, {
      clipPath: "inset(0% 0% 0% 0%)",
      yPercent: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",

      scrollTrigger: {
        trigger: parent,
        start: "top 90%",
        end: "top 60%",
        toggleActions: "play none none reverse",
        scrub: true,
      },
    });
  });
}
function reasonsRich() {
  $(".reason-rich").each(function () {
    $(this).find(".char").slice(0, 4).css("opacity", 0);
  });
}
function imageTopscroll() {
  $("[img-scroll-top]").each(function () {
    let parallaxImgWrap = $(this);
    let parallaxImg = parallaxImgWrap.find("img");
    const imgScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "top 25%",
        end: "bottom top",
        scrub: true,
      },
    });

    imgScrollTimeline.fromTo(
      parallaxImg,
      { yPercent: 0 },
      { yPercent: 20, ease: "linear", immediateRender: false }
    );
  });
}
function imageScroll() {
  $("[img-scroll]").each(function () {
    let parallaxImgWrap = $(this);
    let parallaxImg = parallaxImgWrap.find("img");
    const imgScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    imgScrollTimeline.fromTo(
      parallaxImg,
      { yPercent: 0 },
      { yPercent: 20, ease: "linear", immediateRender: false }
    );
  });
}
function videoScroll() {
  $("[vid-scroll]").each(function () {
    let parallaxImgWrap = $(this);
    let parallaxImg = parallaxImgWrap.find("video");
    const imgScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: $(this),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    imgScrollTimeline.fromTo(
      parallaxImg,
      { yPercent: 0 },
      { yPercent: 20, ease: "linear", immediateRender: false }
    );
  });
}
function beforeAndAfter() {
  let beforeAndAfter = gsap.timeline({
    scrollTrigger: {
      trigger: ".gallery-wrap",
      start: "50% bottom",
      end: "50% top",
      scrub: true,
    },
  });

  beforeAndAfter.fromTo(
    "[project-after]",
    { clipPath: "inset(100% 0% 0% 0% round 0.75rem)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 0.75rem)",
      stagger: 0.1,
      duration: 1,
      ease: "power1.in",
    },
    0
  );

  beforeAndAfter.fromTo(
    "[gallery-img-top]",
    { yPercent: 0 },
    { yPercent: -30, stagger: 0.1, duration: 1, ease: "power1.in" },
    0
  );

  beforeAndAfter.fromTo(
    "[project-slide]",
    { width: "0px" },
    { width: "auto", duration: 1, ease: "power1.in" },
    0
  );

  beforeAndAfter.fromTo(
    "[project-slide-text]",
    { xPercent: -105 },
    { xPercent: 0, duration: 1, ease: "power1.in" },
    0
  );

  beforeAndAfter.fromTo(
    ".project-side-gap",
    { width: "0rem" },
    { width: "2rem", duration: 1, ease: "power1.in" },
    0
  );
}
function seeMoreScroll() {
  const trigger = document.querySelector("[see-more-trigger]");
  const text = document.querySelector("[see-more-text]");
  if (!trigger || !text) return;

  const words = text.querySelectorAll(".char");
  if (!words.length) return;

  const seeMoreScroll = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: "top bottom",
      end: "top 85%",
      scrub: true,
    },
  });

  seeMoreScroll.to(words, {
    opacity: 0,
    ease: "none",
    stagger: 0.1,
  });
}
function hoverPageImageTrail() {
  const container = document.querySelector(".page_wrap");
  const imageSources = Array.from(
    document.querySelectorAll(".hover-image-bank img")
  ).map((img) => img.getAttribute("src"));

  if (!container || imageSources.length === 0) return;

  let incr = 0,
    oldX = 0,
    oldY = 100,
    resetDist = window.innerWidth / 6,
    indexImg = 0,
    firstImageTriggered = false;

  container.addEventListener("mouseenter", (e) => {
    oldX = e.clientX;
    oldY = e.clientY;
    firstImageTriggered = false;
  });

  container.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (!firstImageTriggered) {
      incr = 220;
      firstImageTriggered = true;
    } else {
      incr += Math.abs(x - oldX) + Math.abs(y - oldY);
    }

    if (incr > resetDist) {
      incr = 0;
      createTrailImage(
        x,
        y - container.getBoundingClientRect().top - window.innerHeight,
        x - oldX,
        y - oldY
      );
    }

    oldX = x;
    oldY = y;
  });

  function createTrailImage(x, y, deltaX, deltaY) {
    const wrapper = document.createElement("div");
    wrapper.className = "hover-fx-wrapper";

    const image = document.createElement("img");
    image.src = imageSources[indexImg];

    wrapper.appendChild(image);
    container.appendChild(wrapper);

    const tl = gsap.timeline({
      onComplete: () => {
        wrapper.remove();
        tl.kill();
      },
    });

    tl.set(wrapper, { opacity: 1 });

    tl.fromTo(
      wrapper,
      {
        xPercent: -120 + (Math.random() - 0.5) * 10,
        yPercent: -100 + (Math.random() - 0.5) * 10,
        scaleX: 1,
        scaleY: 1,
      },
      {
        scaleX: 1,
        scaleY: 1,
        ease: "elastic.out(2, 0.6)",
        duration: 0.6,
      }
    );

    tl.fromTo(
      wrapper,
      {
        x,
        y,
        rotation: (Math.random() - 0.5) * 10,
      },
      {
        x: "+=" + deltaX * 2,
        y: "+=" + deltaY * 2,
        rotation: (Math.random() - 0.5) * 10,
        ease: "power4.out",
        duration: 0.5,
      },
      "<"
    );

    tl.to(wrapper, {
      duration: 0.3,
      scale: 0.5,
      delay: 0.1,
      ease: "back.in(1.5)",
    });

    indexImg = (indexImg + 1) % imageSources.length;
  }
}
function randomFooter() {
  $(".page_wrap").each(function () {
    var $footerSplines = $(this).find(".footer-spline").hide();
    if ($footerSplines.length > 0) {
      $footerSplines.eq(0).css("display", "block");
    }
  });
}
function newReasons() {
  const $layouts = $(".reasons-layout");
  let currentIndex = 0;

  $(".reasons-rich strong").each(function () {
    const text = $(this).text();
    $(this)
      .addClass("hero-link")
      .html(
        `<span class="underline-text">${text}</span><span class="underline-line"></span>`
      );
  });

  $layouts.css({
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
  });

  const $first = $layouts.eq(currentIndex);
  $first.css({
    opacity: 1,
    pointerEvents: "auto",
    position: "relative",
  });

  requestAnimationFrame(() => {
    imageReasonCursor();
  });

  runReasonsAnimation($first);

  $("[random-btn]").on("click", function () {
    const $current = $layouts.eq(currentIndex);
    currentIndex = (currentIndex + 1) % $layouts.length;
    const $next = $layouts.eq(currentIndex);

    $current.css({
      opacity: 0,
      pointerEvents: "none",
      position: "absolute",
      zIndex: 0,
    });

    $next.css({
      opacity: 1,
      pointerEvents: "auto",
      position: "relative",
      zIndex: 1,
    });

    runReasonsAnimation($next);
  });
}
function imageReasonCursor() {
  const $cursor = $(".cursor-img");
  const $cursorholder = $(".cursor_img_holder");
  const $images = $cursor.find("[cursor-img-one]");
  let lastMouseX = 0;

  const xTo = gsap.quickTo($cursor, "x", { ease: "circ.out", duration: 0.1 });
  const yTo = gsap.quickTo($cursor, "y", { ease: "circ.out", duration: 0.1 });

  $("[cursor-follow]").on("mousemove", function (event) {
    const cursorWidth = $cursor.outerWidth();
    const cursorHeight = $cursor.outerHeight();

    const cursorX = event.pageX - cursorWidth / 2;
    const cursorY = event.pageY - cursorHeight / 2 - 170;

    const deltaX = event.clientX - lastMouseX;
    const rotation = Math.max(-45, Math.min(45, deltaX * 0.2));
    lastMouseX = event.clientX;

    xTo(cursorX);
    yTo(cursorY);

    gsap.to($cursorholder, {
      rotate: rotation,
      duration: 0.2,
      ease: "power1.out",
    });
  });

  $(".hero-link").on("mouseenter", function () {
    $images.show();
    gsap.to($cursor, {
      opacity: 1,
      duration: 0.2,
      ease: "power1.out",
    });
    gsap.fromTo(
      $(this).find(".underline-line"),
      {
        clipPath: "inset(0% 0% 0% 0%)",
      },
      {
        clipPath: "inset(0% 0% 0% 100%)",
        duration: 0.3,
        ease: "power2.in",
        immediateRender: false,
      }
    );
  });

  $(".hero-link").on("mouseleave", function () {
    gsap.to($cursor, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });
    $images.hide();
    gsap.fromTo(
      $(this).find(".underline-line"),
      {
        clipPath: "inset(0% 0% 0% 100%)",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.3,
        ease: "power2.in",
        immediateRender: false,
      }
    );
  });
}

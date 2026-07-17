//Phase 2
if (document.querySelector(".home-hero")) {
  landerScroll();
  hideNav();
}

let lenis;
if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.7,
    gestureOrientation: "vertical",
    normalizeWheel: false,
    smoothTouch: false,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

let mm = gsap.matchMedia();

if (document.querySelector(".page-wrap")) {
  mm.add("(min-width: 992px)", () => {
    textCursorFollow();
    mconAnimation();
    setupMenuToggle();
  });
  mm.add("(max-width: 991px)", () => {
    mconMobileAnimation();
    setupMobileMenuToggle();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pageWrap = document.querySelector(".page-wrap");
  if (pageWrap) {
    pageWrap.style.opacity = "1";
    pageWrap.style.pointerEvents = "auto";
  }
});

// preload preloader pageload
if (!sessionStorage.getItem("visited")) {
  sessionStorage.setItem("visited", "true");
  pageLoader();
} else {
  // Skip preloader — just reveal content
  gsap.set(".page-wrap", { opacity: 1 });
}

function landerScroll() {
  const landerOverlay = gsap.timeline({
    scrollTrigger: {
      // trigger: "[intro-opacity-trigger]",
      // start: "top top",
      // end: "bottom bottom",
      trigger: "[intro-banner-trigger]",
      // start: () => `bottom 50%`,
      // end: () => `bottom top`,
      start: "top 50%",
      end: "top top",
      scrub: true,
    },
  });

  landerOverlay.fromTo(
    $("[intro-opacity]"),
    { opacity: 1 },
    { opacity: 0, immedieteRender: true }
  );

  const landerItem = gsap.timeline({
    scrollTrigger: {
      trigger: "[intro-banner-trigger]",
      // start: () => `bottom 50%`,
      // end: () => `bottom top`,
      start: "bottom 50%",
      end: "bottom top",
      scrub: true,
    },
  });
  landerItem.fromTo(
    $("[intro-item-hide]"),
    { opacity: 1 },
    { opacity: 0, immedieteRender: true }
  );

  landerItem.fromTo($("[intro-item-show]"), { opacity: 0 }, { opacity: 1 });

  const landerBanner = gsap.timeline({
    scrollTrigger: {
      trigger: ".home-bracket-trigger",
      start: "top 60%",
      end: "top 60%",
      toggleActions: "restart reverse restart reverse",
      // scrub: true,
    },
  });

  // landerBanner.fromTo($("[intro-item-show]"), { opacity: 0 }, { opacity: 1 });
  // landerBanner.fromTo(
  //   $("[intro-item-hide]"),
  //   { opacity: 1 },
  //   { opacity: 0 },
  //   ">"
  // );
}

function pageLoader() {
  lenis.stop();

  const preloader = document.querySelector("[preloader]");
  const pagewrap = document.querySelector(".page-wrap"); // Target
  const imgWrap = document.querySelector("[preload-img-wrap]");
  const images = document.querySelectorAll("[preload-img]");
  const tensEl = document.querySelector("[preload-tens]");
  const secsEl = document.querySelector("[preload-secs]");
  const totalImages = images.length;
  const animationDuration = 1.5;
  const minDuration = 2000;
  const startTime = performance.now();

  let pageLoaded = false;
  let animationComplete = false;

  // Make page-wrap visible before animation begins
  gsap.set(pagewrap, { opacity: 1, pointerEvents: "auto" });

  // Show preloader
  gsap.set(preloader, { display: "flex" });

  // Stack images
  images.forEach((img, i) => {
    img.style.position = "absolute";
    img.style.top = 0;
    img.style.left = 0;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.zIndex = i === 0 ? 2 : 1;
    img.style.opacity = i === 0 ? 1 : 0;
  });

  // Start counter
  gsap.to(
    { count: 0 },
    {
      count: 99,
      duration: animationDuration,
      ease: "none",
      onUpdate: function () {
        const count = Math.floor(this.targets()[0].count);
        const tens = Math.floor(count / 10);
        const secs = count % 10;

        if (tensEl) tensEl.textContent = tens;
        if (secsEl) secsEl.textContent = secs;
      },
    }
  );

  // Animate image wrap
  const timeline = gsap.timeline({
    onUpdate: () => {
      const progress = timeline.progress();
      const index = Math.min(
        totalImages - 1,
        Math.floor(progress * totalImages)
      );

      images.forEach((img, i) => {
        img.style.zIndex = i === index ? 2 : 1;
        img.style.opacity = i === index ? 1 : 0;
      });
    },
    onComplete: () => {
      animationComplete = true;
      maybeFinish();
    },
  });

  timeline.to(imgWrap, {
    top: "auto",
    bottom: 0,
    duration: animationDuration,
    ease: "power2.inOut",
  });

  // Wait for full load (min 2s)
  window.addEventListener("load", () => {
    const elapsed = performance.now() - startTime;
    const delay = Math.max(minDuration - elapsed, 0);

    setTimeout(() => {
      pageLoaded = true;
      maybeFinish();
    }, delay);
  });

  function maybeFinish() {
    if (pageLoaded && animationComplete) {
      gsap.to(preloader, {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          preloader.style.display = "none";
          lenis.start();
        },
      });
    }
  }
}

function footerOverlayInteraction() {
  const isMobile = window.matchMedia("(max-width: 992px)").matches;
  const $overlay = $(".footer-overlay");
  const $overlayImg = $overlay.find(".img-abs-replace");

  if (isMobile) {
    $(".footer-item").on("click", function () {
      const newImgSrc = $(this).find(".footer-images").attr("src");

      if (newImgSrc) {
        $overlayImg.attr("src", newImgSrc);
        $overlay.css({
          display: "flex",
          "pointer-events": "auto",
        });
      }
    });

    $(".footer-overlay").on("click", function (e) {
      if ($(e.target).closest(".footer-img_component").length) {
        $overlay.css({
          display: "none",
          "pointer-events": "none",
        });

        window.scrollTo(0, document.body.scrollHeight);
      }
    });
  } else {
    $(".footer-item").on("mouseenter", function () {
      const newImgSrc = $(this).find(".footer-images").attr("src");

      if (newImgSrc) {
        $overlayImg.attr("src", newImgSrc);
      }

      $overlay.css("display", "flex");
    });

    $(".footer-item").on("mouseleave", function () {
      $overlay.css("display", "none");
    });
  }
}

$(document).ready(footerOverlayInteraction);

// // Run the function
// mconAnimation();
function mconAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  let mconTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[mcon-list]",
      start: "top 55%",
      end: "bottom top",
      toggleActions: "play none none reverse",
    },
  });

  mconTimeline.fromTo(
    "[mcon-bracket-left]",
    { x: "0em" },
    { x: "-10em", duration: 0.1, ease: "linear" }
  );
  mconTimeline.fromTo(
    "[mcon-bracket-right]",
    { x: "0em" },
    { x: "10em", duration: 0.1, ease: "linear" },
    "<"
  );
  mconTimeline.fromTo(
    "[mcon-bg]",
    { opacity: 0 },
    { opacity: 1, duration: 0.1, ease: "linear" },
    "<"
  );
  mconTimeline.fromTo(
    "[mcon-img]",
    { opacity: 0 },
    { opacity: 1, duration: 0.1, ease: "linear" },
    "<"
  );

  mconTimeline.progress(1).reverse();

  $("[mcon-item]").each(function () {
    let item = $(this);
    let growElement = item.find("[mcon-grow]")[0];

    let mconTimelineTwo = gsap.timeline({
      scrollTrigger: {
        trigger: item[0],
        start: "top 54%",
        end: "bottom 31%",
        scrub: true,
      },
    });

    mconTimelineTwo.fromTo(
      growElement,
      { width: "1em" },
      { width: "9em", ease: "expo.out" }
    );
    mconTimelineTwo.fromTo(
      growElement,
      { width: "9em" },
      { width: "1em", ease: "expo.out", immediateRender: false }
    );
  });

  $("[mcon-item]").each(function () {
    let item = $(this);
    gsap
      .timeline({
        scrollTrigger: {
          trigger: item[0],
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      })
      .fromTo(
        item,
        { opacity: 0.1 },
        { opacity: 1, ease: "power3.in", duration: 0.5 }
      )
      .fromTo(
        item,
        { opacity: 1 },
        { opacity: 1, ease: "power3.in", duration: 0.05 }
      )
      .fromTo(
        item,
        { opacity: 1 },
        { opacity: 0.1, ease: "power3.out", duration: 0.45 }
      );
  });

  $("[mcon-item]").each(function () {
    let item = $(this);

    let mconTimelineFour = gsap.timeline({
      scrollTrigger: {
        trigger: item[0],
        start: "top 50%",
        end: "top 44%",
        onEnter: () => updateImages(item),
        onEnterBack: () => updateImages(item),
      },
    });
    function updateImages(item) {
      console.log("⏺ Triggered updateImages for:", item);

      const itemImgEl = item.find("[mcon-item-img]");
      const itemImg = itemImgEl.attr("src") || itemImgEl.prop("currentSrc");
      const itemSrcset = itemImgEl.attr("srcset") || "";

      console.log("✅ Found [mcon-item-img]:", itemImgEl);
      console.log("🖼️ Image src:", itemImg);
      console.log("🖼️ Image srcset:", itemSrcset);

      const mainImg = $("[mcon-main-img]");
      const bgImg = $("[mcon-bg-img]");

      console.log("📦 Target main image element:", mainImg);
      console.log("📦 Target bg image element:", bgImg);

      gsap.killTweensOf(mainImg);
      gsap.killTweensOf(bgImg);

      if (itemImg) {
        mainImg.attr("src", itemImg);
        bgImg.attr("src", itemImg);
        console.log("✅ Set src on both images.");
      } else {
        console.warn("⚠️ No valid image src found.");
      }

      if (itemSrcset) {
        mainImg.attr("srcset", itemSrcset);
        bgImg.attr("srcset", itemSrcset);
        console.log("✅ Set srcset on both images.");
      } else {
        console.warn("⚠️ No srcset found.");
      }

      if (!mainImg[0]?.complete || mainImg[0]?.naturalWidth === 0) {
        mainImg[0].src = itemImg;
        console.log("🔁 Forced fallback set on main image.");
      }

      if (!bgImg[0]?.complete || bgImg[0]?.naturalWidth === 0) {
        bgImg[0].src = itemImg;
        console.log("🔁 Forced fallback set on bg image.");
      }
    }
  });
}

function mconMobileAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  let hasUserScrolled = false;
  let currentActiveItem = null;

  function updateMainImage(item) {
    const itemImgEl = item.find("[mcon-item-img]");
    const itemImg = itemImgEl.attr("src") || itemImgEl.prop("currentSrc");
    const itemSrcset = itemImgEl.attr("srcset") || "";
    const mainImg = $("[mcon-main-img]");
    const mconImg = $("[mcon-img]");

    gsap.killTweensOf(mainImg);

    if (itemImg) mainImg.attr("src", itemImg);
    if (itemSrcset) mainImg.attr("srcset", itemSrcset);

    if (!mainImg[0]?.complete || mainImg[0]?.naturalWidth === 0) {
      mainImg[0].src = itemImg;
    }

    gsap.to([mconImg, mainImg], {
      opacity: 1,
      duration: 0.2,
      ease: "linear",
    });

    currentActiveItem = item;
  }

  function clearMainImage() {
    gsap.to("[mcon-main-img], [mcon-img]", { opacity: 0, duration: 0.2 });
    currentActiveItem = null;
  }

  $("[mcon-item]").css("opacity", "0.3");

  window.addEventListener(
    "scroll",
    () => {
      hasUserScrolled = true;
    },
    { once: true }
  );

  $("[mcon-item]").each(function () {
    const item = $(this);

    ScrollTrigger.create({
      trigger: item[0],
      start: "top 55%",
      end: "bottom 45%",
      onUpdate: (self) => {
        const isInView = self.progress > 0 && self.progress < 1;
        if (!hasUserScrolled) return;

        if (isInView) {
          if (!currentActiveItem || !currentActiveItem.is(item)) {
            $("[mcon-item]").css("opacity", "0.3");
            item.css("opacity", "1");
            updateMainImage(item);
          }
        } else {
          if (currentActiveItem && currentActiveItem.is(item)) {
            item.css("opacity", "0.3");
            clearMainImage();
          }
        }
      },
    });
  });
}

function setupMobileMenuToggle() {
  $("[mobile-menu]").on("click", function () {
    const menu = $(".mobile-menu-open");
    const navbar = $(".navbar");
    const isVisible = menu.css("display") === "flex";

    menu.css("display", isVisible ? "none" : "flex");
    navbar.css("height", isVisible ? "2.5rem" : "5rem");
  });
}

//cs lander scroll
function landerImageScroll() {
  gsap.registerPlugin(ScrollTrigger);

  let landerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[lander-img-trigger]",
      start: "top top",
      end: "bottom 50%",
      scrub: true,
    },
  });

  landerTimeline.fromTo("[lander-img]", { opacity: 1 }, { opacity: 0 });
}

// Run the function
landerImageScroll();

// Handle brackets on scroll// Handle brackets on scroll
$("[bracket-trigger]").each(function () {
  let triggerElement = $(this);
  let textContent = triggerElement.attr("bracket-trigger");
  let bracketText = document.querySelector("[bracket-text]");
  let bracketBox = document.querySelector(".bracket-box");
  let anticlockwise = document.querySelector("[anticlockwise]");
  let clockwise = document.querySelector("[clockwise]");

  ScrollTrigger.create({
    trigger: triggerElement,
    start: "top bottom",
    end: "bottom 100%-=2px",
    toggleActions: "play none none reverse",

    onEnter: () => {
      gsap.set(bracketText, { textContent: textContent });

      gsap.fromTo(
        bracketBox,
        { width: "0%" },
        { width: "100%", duration: 0.1, ease: "linear" }
      );

      gsap.fromTo(
        bracketBox,
        { clipPath: "inset(0% 50% 0% 50%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.1, ease: "linear" }
      );

      gsap.fromTo(
        anticlockwise,
        { rotateZ: 0 },
        { rotateZ: -90, ease: "power2.out", duration: 0.2 }
      );

      gsap.fromTo(
        clockwise,
        { rotateZ: 0 },
        { rotateZ: 90, ease: "power2.out", duration: 0.2 }
      );
    },

    onLeave: () => {
      // When scrolling past the bottom, force reset

      gsap.fromTo(
        bracketBox,
        { width: "100%" },
        { width: "0%", duration: 0.1, ease: "linear" }
      );
      // gsap.set(bracketText, { textContent: "" });
      gsap.fromTo(
        anticlockwise,
        { rotateZ: -90 },
        { rotateZ: -180, ease: "power2.out", duration: 0.2 }
      );

      gsap.fromTo(
        clockwise,
        { rotateZ: 90 },
        { rotateZ: 180, ease: "power2.out", duration: 0.2 }
      );
    },

    onEnterBack: () => {
      // When scrolling back up from the bottom, replay the animation
      gsap.set(bracketText, { textContent: textContent });

      gsap.fromTo(
        bracketBox,
        { width: "0%" },
        { width: "100%", duration: 0.1, ease: "linear" }
      );

      gsap.fromTo(
        bracketBox,
        { clipPath: "inset(0% 50% 0% 50%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.1, ease: "linear" }
      );

      gsap.fromTo(
        anticlockwise,
        { rotateZ: -180 },
        { rotateZ: -270, ease: "power2.out", duration: 0.2 }
      );

      gsap.fromTo(
        clockwise,
        { rotateZ: 180 },
        { rotateZ: 270, ease: "power2.out", duration: 0.2 }
      );
    },

    onLeaveBack: () => {
      // When scrolling back up past the top, fully reset
      gsap.fromTo(
        bracketBox,
        { width: "100%" },
        { width: "0%", duration: 0.1, ease: "linear" }
      );
      // gsap.set(bracketText, { textContent: "" });

      gsap.fromTo(
        anticlockwise,
        { rotateZ: -270 },
        { rotateZ: -360, ease: "power2.out", duration: 0.2 }
      );

      gsap.fromTo(
        clockwise,
        { rotateZ: 270 },
        { rotateZ: 360, ease: "power2.out", duration: 0.2 }
      );
    },
  });
});

//ticker timeline
function landerTickerAnimation() {
  let tickerWrap = document.querySelector(".lander-ticker-wrap");
  let tickerItems = document.querySelectorAll(".lander-ticker-item");
  let flickerTexts = document.querySelectorAll(".flicker-img_text");
  let images = document.querySelectorAll(".img-abs-flicker");

  // Number of items and step size for scroll-triggered changes
  const totalItems = tickerItems.length;
  const scrollStep = 1 / totalItems; // Divide the scroll distance evenly

  // Initial state setup
  gsap.set(images, { display: "none", zIndex: 1 }); // Hide all images and reset zIndex
  gsap.set(images[0], { display: "block", zIndex: 10 }); // Show first image with highest zIndex
  gsap.set(flickerTexts, { display: "none" }); // Hide all texts
  gsap.set(flickerTexts[0], { display: "block" }); // Show first text

  // ScrollTrigger
  ScrollTrigger.create({
    trigger: tickerWrap,
    start: "top bottom",
    end: "50% top",
    scrub: true,

    onUpdate: (self) => {
      const progress = self.progress; // Get current scroll progress (0 to 1)
      const activeIndex = Math.min(
        Math.floor(progress / scrollStep),
        totalItems - 1
      ); // Determine the active item index

      // Update images and text based on the active index
      images.forEach((img, i) => {
        gsap.set(img, {
          display: i === activeIndex ? "block" : "none",
          zIndex: i === activeIndex ? 10 : 1,
        });
      });

      flickerTexts.forEach((text, i) => {
        gsap.set(text, { display: i === activeIndex ? "block" : "none" });
      });
    },
  });
}

landerTickerAnimation();

//marqeee
// MARQUEE POWER-UP
window.addEventListener("DOMContentLoaded", (event) => {
  // attribute value checker
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }
  // marquee component
  $("[tr-marquee-element='component']").each(function (index) {
    let componentEl = $(this),
      panelEl = componentEl.find("[tr-marquee-element='panel']");

    let speedSetting = attr(100, componentEl.attr("tr-marquee-speed")),
      verticalSetting = attr(false, componentEl.attr("tr-marquee-vertical")),
      reverseSetting = attr(false, componentEl.attr("tr-marquee-reverse")),
      moveDistanceSetting = -100;
    if (reverseSetting) moveDistanceSetting = 100;
    let marqueeTimeline = gsap.timeline({
      repeat: -1,
      onReverseComplete: () => marqueeTimeline.progress(1),
    });
    if (verticalSetting) {
      speedSetting = panelEl.first().height() / speedSetting;
      marqueeTimeline.fromTo(
        panelEl,
        { yPercent: 0 },
        { yPercent: moveDistanceSetting, ease: "none", duration: speedSetting }
      );
    } else {
      speedSetting = panelEl.first().width() / speedSetting;
      marqueeTimeline.fromTo(
        panelEl,
        { xPercent: 0 },
        { xPercent: moveDistanceSetting, ease: "none", duration: speedSetting }
      );
    }
  });
});

//menu toggle

function setupMenuToggle() {
  $("[menu-toggle]")
    .off("click")
    .on("click", function () {
      const $navbar = $(this).closest(".navbar:visible");
      const $menuOpen = $navbar.find(".menu-open");
      const $menuToggleText = $navbar.find("[menu-toggle-text]");

      const isOpen = $menuOpen.width() > 0;

      if (!isOpen) {
        $menuToggleText.text("close");
        gsap.fromTo(
          $menuOpen,
          { width: "0%" },
          { width: "100%", duration: 0.2, ease: "power2.in" }
        );
        gsap.fromTo(
          $menuOpen,
          { opacity: 0 },
          { opacity: 1, duration: 0.02, ease: "power2.in" },
          "<+=0.18"
        );
      } else {
        $menuToggleText.text("menu");
        gsap.fromTo(
          $menuOpen,
          { opacity: 1 },
          { opacity: 0, duration: 0.02, ease: "power2.out" }
        );
        gsap.to(
          $menuOpen,
          { width: "0%", opacity: 0, duration: 0.2, ease: "power2.out" },
          "<"
        );
      }
    });
}

//mouse hover
let splitText;
let lineSplit;
function runSplit() {
  splitText = new SplitType("[stagger-link]", {
    types: "words, chars",
  });
  lineSplit = new SplitType("[lineSplit]", {
    types: "lines, words",
  });
}
runSplit();

// ————— Update on window resize
let windowWidth = $(window).innerWidth();
window.addEventListener("resize", function () {
  if (windowWidth !== $(window).innerWidth()) {
    windowWidth = $(window).innerWidth();
    splitText.revert();
    runSplit();
  }
});

//date for lander
$(".date").text(new Date().getFullYear());

// const staggerLinks = document.querySelectorAll("[stagger-link]");
// staggerLinks.forEach((link) => {
//   const letters = link.querySelectorAll("[stagger-link-text] .char");
//   link.addEventListener("mouseenter", function () {
//     gsap.fromTo(
//       letters,
//       {
//         opacity: 0,
//       },
//       {
//         opacity: 1,
//         duration: 0.4,
//         ease: "power2.inOut",
//         stagger: { each: 0.04, from: "start" },
//         overwrite: "auto",
//       }
//     );
//   });
// });

//hide nav

function hideNav() {
  gsap.set(".nav", { opacity: 0 }); // Initial state

  ScrollTrigger.create({
    trigger: "[hide-nav-trig]",
    start: "bottom 110%",
    end: "bottom top",

    onEnter: () => {
      $("[hide-nav]").css({
        opacity: "0",
        pointerEvents: "none",
      });
      $(".nac").css("opacity", "1");
    },
    onLeaveBack: () => {
      $("[hide-nav]").css({
        opacity: "1",
        pointerEvents: "auto",
      });
      $(".nac").css("opacity", "0");
    },
  });
}

$(".allworks-list_item").each(function () {
  const listItem = $(this);
  const listBg = listItem.find(".list-bg");
  gsap.set(listBg, { clipPath: "inset(0% 0% 100% 0%)" });

  let lastY = 0;
  const isMobile = window.matchMedia("(max-width: 992px)").matches;

  if (isMobile) {
    listItem.on("click", function () {
      $(".allworks-list_item").each(function () {
        $(this).removeClass("is-active").css("color", "");
        $(this).find(".list-bg").css("clip-path", "inset(0% 0% 100% 0%)");
      });

      listItem.addClass("is-active").css("color", "black");
      listBg.css("clip-path", "inset(0% 0% 0% 0%)");
    });
  } else {
    listItem.on("click", function () {
      $(".allworks-list_item").removeClass("is-active").css("color", "");
      $(".list-bg").css("clip-path", "inset(0% 0% 100% 0%)");

      listItem.addClass("is-active").css("color", "black");
      listBg.css("clip-path", "inset(0% 0% 0% 0%)");
    });

    listItem.on("mouseenter", function (e) {
      if (listItem.hasClass("is-active")) return;

      const currentY = e.clientY;
      const direction = currentY > lastY ? "down" : "up";
      lastY = currentY;

      gsap.killTweensOf([listBg, listItem]);

      gsap
        .timeline()
        .to(listItem, { color: "black", duration: 0, ease: "power1.out" }, 0)
        .fromTo(
          listBg,
          {
            clipPath:
              direction === "down"
                ? "inset(0% 0% 100% 0%)"
                : "inset(100% 0% 0% 0%)",
          },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0, ease: "power1.out" },
          0
        );
    });

    listItem.on("mouseleave", function (e) {
      if (listItem.hasClass("is-active")) return;

      const currentY = e.clientY;
      const direction = currentY > lastY ? "down" : "up";
      lastY = currentY;

      gsap.killTweensOf([listBg, listItem]);

      gsap
        .timeline()
        .to(listItem, { color: "", duration: 0.3, ease: "power1.out" }, 0)
        .fromTo(
          listBg,
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath:
              direction === "down"
                ? "inset(100% 0% 0% 0%)"
                : "inset(0% 0% 100% 0%)",
            duration: 0.2,
            ease: "power1.out",
          },
          0
        );
    });
  }
});

$(".cs-list-item").on("click", function (e) {
  // If the click happened on or inside [video-reveal-btn], do nothing
  if ($(e.target).closest("[video-reveal-btn]").length) return;

  const allworksListItem = $(this).closest(".allworks-list_item");
  const swiperContainer = allworksListItem.find(".swiper-container");
  const isExpanded = swiperContainer.is(":visible");

  $(".swiper-container")
    .not(swiperContainer)
    .each(function () {
      if ($(this).is(":visible")) {
        gsap.to($(this), {
          opacity: 0,
          duration: 0.0,
          ease: "power1.out",
          onComplete: () => {
            $(this).css("display", "none");
            $(window).trigger("resize");
          },
        });
      }
    });

  if (isExpanded) {
    gsap.to(swiperContainer, {
      opacity: 0,
      duration: 0.0,
      ease: "power1.out",
      onComplete: () => {
        swiperContainer.css("display", "none");
        lenis.resize();
      },
    });
  } else {
    swiperContainer.css("display", "block");
    gsap.to(swiperContainer, {
      opacity: 1,
      duration: 0.1,
      ease: "power1.in",
      onStart: () => {
        swiperContainer.css("opacity", 0);
      },
      onComplete: () => {
        lenis.resize();
      },
    });
  }
});

// //ADD REMOVE CLASS "show" when you hover on/off
// $(".allworks-list_item").on("click", function () {
//   lenis.stop(); // Pause Lenis scrolling
//   $(this).find(".swiper-container").toggleClass("show"); // Toggle the class

//   // Ensure Lenis and ScrollTrigger are properly refreshed after the toggle
//   setTimeout(() => {
//     lenis.start(); // Resume Lenis scrolling
//     lenis.refresh(); // Refresh Lenis calculations
//     ScrollTrigger.refresh(); // Refresh ScrollTrigger
//   }, 0); // Add a slight delay to ensure DOM updates are applied
// });
// Phase 1
//CHANGE
//Homepage Image Flicker
// gsap.registerPlugin(ScrollTrigger);
// let tl = gsap.timeline({
//   scrollTrigger: {
//     trigger: ".intro-img_holder",
//     start: "top 50%",
//     endTrigger: ".intro-img_holder",
//     end: "top 20%",
//     scrub: true,
//   },
// });
// tl.set(".sticky-img.hidden", { delay: 1, opacity: 1, stagger: 1 });

//KEEP
// let transitionTrigger = $(".transition-trigger");
// let introDurationMS = 1600;
// let exitDurationMS = 1000;
// let excludedClass = "no-transition";

// // On Page Load
// if (transitionTrigger.length > 0) {
//   transitionTrigger.click();
//   $("body").addClass("no-scroll-transition");
//   setTimeout(() => {
//     $("body").removeClass("no-scroll-transition");
//   }, introDurationMS);
// }
// // On Link Click
// $("a").on("click", function (e) {
//   if (
//     $(this).prop("hostname") == window.location.host &&
//     $(this).attr("href").indexOf("#") === -1 &&
//     !$(this).hasClass(excludedClass) &&
//     $(this).attr("target") !== "_blank" &&
//     transitionTrigger.length > 0
//   ) {
//     e.preventDefault();
//     $("body").addClass("no-scroll-transition");
//     let transitionURL = $(this).attr("href");
//     transitionTrigger.click();
//     setTimeout(function () {
//       window.location = transitionURL;
//     }, exitDurationMS);
//   }
// });
// // On Back Button Tap
// window.onpageshow = function (event) {
//   if (event.persisted) {
//     window.location.reload();
//   }
// };
// // Hide Transition on Window Width Resize
// setTimeout(() => {
//   $(window).on("resize", function () {
//     setTimeout(() => {
//       $(".transition").css("display", "none");
//     }, 50);
//   });
// }, introDurationMS);

//Drag slider for testimonials
$(".swiper-container").each(function (index) {
  let loopMode = true;

  let sliderDuration = 300;
  if ($(this).attr("slider-duration") !== undefined) {
    sliderDuration = +$(this).attr("slider-duration");
  }
  const swiper = new Swiper($(this).find(".swiper")[0], {
    speed: sliderDuration,
    loop: loopMode,
    autoHeight: false,
    centeredSlides: false,
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    slidesPerView: 1,
    rewind: false,
    mousewheel: {
      forceToAxis: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    breakpoints: {
      // mobile landscape
      480: {
        slidesPerView: 1,
      },
      // tablet
      768: {
        slidesPerView: 2,
      },
      // desktop
      992: {
        slidesPerView: 2.5,
      },
    },
  });
});

//On click, "show" is added

// $("[video-reveal-btn]").on("click", function () {
//   lenis.stop();
//   $(".body").addClass("no-scroll");
//   $(".video-holder").addClass("show");
//   setTimeout(() => {
//     $(".video-slide").addClass("slide");
//   }, 100);
// });

// $(".close-button, .video-holder").on("click", function () {
//   lenis.start();
//   $(".video-slide").removeClass("slide");
//   setTimeout(() => {
//     $(".body").removeClass("no-scroll");
//     $(".video-holder").removeClass("show");
//   });
// });

// Handle Vimeo embeds using iframe instead of video tag
$("[video-reveal-btn]").on("click", function () {
  const videoURL = $(this).attr("video-reveal-btn");
  const $container = $(".video-fill");

  console.log("Clicked button:", this);
  console.log("Video URL from attribute:", videoURL);

  // Replace inner HTML with iframe embed
  if (videoURL && $container.length) {
    const iframeHTML = `<iframe src="${videoURL}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    $container.html(iframeHTML);
  }

  lenis.stop();
  $(".body").addClass("no-scroll");
  $(".video-holder").addClass("show");
  setTimeout(() => {
    $(".video-slide").addClass("slide");
  }, 100);
});

$(".close-button, .video-holder").on("click", function () {
  lenis.start();
  $(".video-slide").removeClass("slide");
  setTimeout(() => {
    $(".body").removeClass("no-scroll");
    $(".video-holder").removeClass("show");
    $(".video-fill").html("");
  });
});

// CMS LIST SYNC POWER-UP
window.addEventListener("DOMContentLoaded", (event) => {
  // attribute value checker
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }
  // cms list sync component
  $("[tr-listsync-element='component']").each(function (index) {
    let componentEl = $(this),
      cmsListEl = componentEl.find("[tr-listsync-element='list']"),
      cmsItemEl = cmsListEl.children(),
      prevButtonEl = componentEl.find("[tr-listsync-element='button-prev']"),
      nextButtonEl = componentEl.find("[tr-listsync-element='button-next']");
    let onLoadSetting = attr(false, componentEl.attr("tr-listsync-onload")),
      activeIndexSetting = attr(0, componentEl.attr("tr-listsync-activeindex")),
      activeClassSetting = attr(
        "is-active",
        componentEl.attr("tr-listsync-activeclass")
      );
    function addActive(trigger) {
      cmsItemEl.removeClass(activeClassSetting);
      let itemIndex = trigger.index();
      cmsListEl.each(function () {
        $(this).children().eq(itemIndex).addClass(activeClassSetting);
      });
    }
    if (onLoadSetting) addActive(cmsItemEl.eq(activeIndexSetting));
    cmsListEl.each(function () {
      let childrenItemEl = $(this).children(),
        clickSetting = attr(true, $(this).attr("tr-listsync-click")),
        hoverInSetting = attr(false, $(this).attr("tr-listsync-hoverin")),
        hoverOutSetting = attr(false, $(this).attr("tr-listsync-hoverout"));
      if (clickSetting) {
        childrenItemEl.on("click", function () {
          addActive($(this));
        });
      }
      if (hoverInSetting) {
        childrenItemEl.on("mouseenter", function () {
          addActive($(this));
        });
      }
      if (hoverOutSetting) {
        childrenItemEl.on("mouseleave", function () {
          cmsItemEl.removeClass(activeClassSetting);
        });
      }
    });
    prevButtonEl.on("click", function () {
      cmsListEl.each(function (index) {
        let childrenItemEl = $(this).children();
        let currentItemEl = childrenItemEl
          .filter("." + activeClassSetting)
          .removeClass(activeClassSetting);
        let prevItemEl = currentItemEl.prev();
        if (prevItemEl.length === 0) prevItemEl = childrenItemEl.last();
        prevItemEl.addClass(activeClassSetting);
      });
    });
    nextButtonEl.on("click", function () {
      cmsListEl.each(function (index) {
        let childrenItemEl = $(this).children();
        let currentItemEl = childrenItemEl
          .filter("." + activeClassSetting)
          .removeClass(activeClassSetting);
        let nextItemEl = currentItemEl.next();
        if (nextItemEl.length === 0) nextItemEl = childrenItemEl.first();
        nextItemEl.addClass(activeClassSetting);
      });
    });
  });
});
$(".easteregg-illustrations").on("mouseenter mouseleave", function () {
  $(".easteregg-illustrations").toggleClass("easteregg-zindex");
});
$(".easteregg-illustrations").on("mouseenter mouseleave", function () {
  $(".easteregg").toggleClass("hide");
});

$(".stills-img_holder").on("click", function () {
  lenis.stop();
  $(".stills-popup_wrap").toggleClass("show");
});
$(".stills-popup_wrap").on("click", function () {
  lenis.start();
  $(".stills-popup_wrap").removeClass("show");
});

// CMS LIST SYNC POWER-UP
window.addEventListener("DOMContentLoaded", (event) => {
  // attribute value checker
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }
  // cms list sync component
  $("[tr-listsync-element='component']").each(function (index) {
    let componentEl = $(this),
      cmsListEl = componentEl.find("[tr-listsync-element='list']"),
      cmsItemEl = cmsListEl.children(),
      prevButtonEl = componentEl.find("[tr-listsync-element='button-prev']"),
      nextButtonEl = componentEl.find("[tr-listsync-element='button-next']");
    let onLoadSetting = attr(false, componentEl.attr("tr-listsync-onload")),
      activeIndexSetting = attr(0, componentEl.attr("tr-listsync-activeindex")),
      activeClassSetting = attr(
        "is-active",
        componentEl.attr("tr-listsync-activeclass")
      );
    function addActive(trigger) {
      cmsItemEl.removeClass(activeClassSetting);
      let itemIndex = trigger.index();
      cmsListEl.each(function () {
        $(this).children().eq(itemIndex).addClass(activeClassSetting);
      });
    }
    if (onLoadSetting) addActive(cmsItemEl.eq(activeIndexSetting));
    cmsListEl.each(function () {
      let childrenItemEl = $(this).children(),
        clickSetting = attr(true, $(this).attr("tr-listsync-click")),
        hoverInSetting = attr(false, $(this).attr("tr-listsync-hoverin")),
        hoverOutSetting = attr(false, $(this).attr("tr-listsync-hoverout"));
      if (clickSetting) {
        childrenItemEl.on("click", function () {
          addActive($(this));
        });
      }
      if (hoverInSetting) {
        childrenItemEl.on("mouseenter", function () {
          addActive($(this));
        });
      }
      if (hoverOutSetting) {
        childrenItemEl.on("mouseleave", function () {
          cmsItemEl.removeClass(activeClassSetting);
        });
      }
    });
    prevButtonEl.on("click", function () {
      cmsListEl.each(function (index) {
        let childrenItemEl = $(this).children();
        let currentItemEl = childrenItemEl
          .filter("." + activeClassSetting)
          .removeClass(activeClassSetting);
        let prevItemEl = currentItemEl.prev();
        if (prevItemEl.length === 0) prevItemEl = childrenItemEl.last();
        prevItemEl.addClass(activeClassSetting);
      });
    });
    nextButtonEl.on("click", function () {
      cmsListEl.each(function (index) {
        let childrenItemEl = $(this).children();
        let currentItemEl = childrenItemEl
          .filter("." + activeClassSetting)
          .removeClass(activeClassSetting);
        let nextItemEl = currentItemEl.next();
        if (nextItemEl.length === 0) nextItemEl = childrenItemEl.first();
        nextItemEl.addClass(activeClassSetting);
      });
    });
  });
});

// //MENU
// //MENU
// let menuDuration = 0.8;

// let menuSlideIn = gsap.timeline({
//   paused: true,
// });
// menuSlideIn.to(".menu-overlay", {
//   opacity: 1,
//   duration: menuDuration,
//   ease: "power3.out",
// });

// menuSlideIn.from(".menu-right", {
//   xPercent: 100,
//   duration: 1,
//   ease: "power3.out",
// });

// let menuSlideOut = gsap.timeline({
//   paused: true,
// });

// menuSlideOut.to(".menu-right", {
//   xPercent: 100,
//   duration: 1,
//   ease: "power3.out",
// });

// menuSlideOut.to(
//   ".menu-overlay",
//   {
//     opacity: 0,
//     duration: menuDuration,
//     ease: "power3.out",
//   },
//   menuDuration / 2
// );

// $(".menu-link").on("click", function () {
//   lenis.stop();
//   menuSlideIn.restart();
// });

// $(".close-link ,.menu-left").on("click", function () {
//   lenis.start();
//   menuSlideOut.restart();
// });

// $(".menu-link").on("click", function () {
//   $(".menu").addClass("show");
// });

// $(".close-link ,.menu-left").on("click", function () {
//   setTimeout(function () {
//     $(".menu").removeClass("show");
//   }, 630);
// });

// $(".img-item").click(function () {
//   lenis.stop();
//   // Find the image inside the clicked ".img-item"
//   let imageSource = $(this).find(".stills-img").attr("src");

//   // Set the image src of the ".popup-img" to the clicked image's src
//   $(".popup-img").attr("src", imageSource);

//   // Optionally, you can display the popup here if it's hidden
//   // $(".popup").show();
// });

function homeButtonHover() {
  $(".home-button").each(function () {
    const $button = $(this);
    const $longItems = $button.find(".is-long");

    $button.on("mouseenter", function () {
      $longItems.each(function (i, el) {
        const $el = $(el);
        const isLogo = $el.hasClass("logo-item-w");
        const targetMinWidth = isLogo ? "1.2rem" : "1rem";

        gsap.fromTo(
          el,
          { minWidth: "0rem", width: "0rem" },
          {
            minWidth: targetMinWidth,
            width: targetMinWidth,
            duration: 0.25,
            delay: i * 0.05,
            ease: "sine.out",
            immediateRender: false,
          }
        );
      });
    });

    $button.on("mouseleave", function () {
      $longItems.each(function (i, el) {
        gsap.to(el, {
          minWidth: "0rem",
          width: "0rem",
          duration: 0.15,
          delay: i * 0.05,
          ease: "sine.in",
          immediateRender: true,
        });
      });
    });
  });
}

mm.add("(min-width: 992px)", () => {
  footerPointerEvent();

  homeButtonHover();
  // ———— animation
  const staggerLinks = document.querySelectorAll("[stagger-link]");
  staggerLinks.forEach((link) => {
    const letters = link.querySelectorAll("[stagger-link-text] .char");
    link.addEventListener("mouseenter", function () {
      gsap.fromTo(
        letters,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.1,
          ease: "power2.inOut",
          stagger: { each: 0.07, from: "start" },
          overwrite: "auto",
        }
      );
    });
  });
});

// Custom Lightbox Viewer Logic
function initCustomLightbox() {
  const $galleryItems = $("[lightbox-gallery-item]");
  const $lightbox = $("[lightbox]");
  const $mainImg = $("[lightbox-main-img]");

  let currentIndex = 0;

  $galleryItems.each(function (index) {
    $(this).on("click", function () {
      currentIndex = index;
      updateLightboxImage(true);
      $lightbox.css({ opacity: 1, pointerEvents: "auto" });
      $("body").addClass("no-scroll");
      lenis.stop();
    });
  });

  $("[lightbox-prev]").on("click", function () {
    currentIndex =
      (currentIndex - 1 + $galleryItems.length) % $galleryItems.length;
    updateLightboxImage();
  });

  $("[lightbox-next]").on("click", function () {
    currentIndex = (currentIndex + 1) % $galleryItems.length;
    updateLightboxImage();
  });

  $("[lightbox-close]").on("click", function () {
    $lightbox.css({ opacity: 0, pointerEvents: "none" });
    $("body").removeClass("no-scroll");
    lenis.start();
  });

  function updateLightboxImage(immediate = false) {
    const src = $galleryItems
      .eq(currentIndex)
      .find("[lightbox-gallery-img]")
      .attr("src");

    if (immediate) {
      $mainImg.attr("src", src).css("opacity", 1);
      return;
    }

    gsap.to($mainImg, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        $mainImg.attr("src", src);
        gsap.to($mainImg, { opacity: 1, duration: 0.2 });
      },
    });
  }
}

initCustomLightbox();

// Follow Cursor with Attribute Text Display
function textCursorFollow() {
  document.addEventListener("DOMContentLoaded", () => {
    let cursorItem = document.querySelector(".cursor-follow");
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

    window.addEventListener("mousemove", (e) => {
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
      target.addEventListener("mousemove", () => {
        currentTarget = target;
        let newText = target.getAttribute("data-cursor");

        if (newText !== lastText) {
          cursorParagraph.innerHTML = newText;
          lastText = newText;
        }

        gsap.to(cursorItem, { autoAlpha: 1, duration: 0.2 });
      });

      target.addEventListener("mouseleave", () => {
        currentTarget = null;

        gsap.to(cursorItem, { autoAlpha: 0, duration: 0.2 });
      });
    });
  });
}

function contactStepCycle() {
  const steps = ["[contact-one]", "[contact-two]", "[contact-three]"];

  $(".josh-btn-wrap").on("click", function () {
    const $current = $(this).closest(
      "[contact-one], [contact-two], [contact-three]"
    );
    const currentIndex = steps.findIndex((sel) => $current.is(sel));
    const nextIndex = (currentIndex + 1) % steps.length;

    $(steps[currentIndex]).css("display", "none");
    $(steps[nextIndex]).css("display", "flex");
  });
}

contactStepCycle();

function footerPointerEvent() {
  const $footerList = $(".footer-item");
  const $footerComponent = $(".footer-img_component");
  gsap.set($footerList, { pointerEvents: "none" });

  ScrollTrigger.create({
    trigger: $footerComponent[0],
    start: "top top",
    end: "bottom bottom",

    onUpdate: (self) => {
      if (self.progress > 0) {
        $footerList.css("pointer-events", "auto");
      } else {
        $footerList.css("pointer-events", "none");
      }
    },
  });
}

function toggleIllustration() {
  if (window.matchMedia("(max-width: 992px)").matches) {
    const openBtns = document.querySelectorAll("[illustration-hover]");
    const closeBtns = document.querySelectorAll("[illustration-hover-close]");

    openBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".illustrate-wrap").style.display = "block";
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelector(".illustrate-wrap").style.display = "none";
      });
    });
  }
}

toggleIllustration();

function footerCarousel() {
  const $footerList = $(".footer-list");
  const $items = $(".footer-item");
  const totalItems = $items.length;
  const itemsPerView = 8;
  const itemWidthPercent = 100 / itemsPerView; // 12.5%
  const totalSteps = Math.ceil(totalItems / itemsPerView) - 1;

  let currentStep = 0;

  $("[footer-next]").on("click", function () {
    if (currentStep < totalSteps) {
      currentStep++;
      moveFooter();
    }
  });

  $("[footer-prev]").on("click", function () {
    if (currentStep > 0) {
      currentStep--;
      moveFooter();
    }
  });

  function moveFooter() {
    const movePercent = -(currentStep * 100);
    gsap.to($footerList, {
      xPercent: movePercent,
      duration: 0.5,
      ease: "power2.inOut",
    });
  }
}

footerCarousel();

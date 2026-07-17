//Phase 2
if (document.querySelector(".home-hero")) {
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

// footer image hover
$(document).ready(function () {
  $(".footer-item").on("mouseenter", function () {
    const $overlay = $(".footer-overlay");
    const $overlayImg = $overlay.find(".img-abs-replace");
    const newImgSrc = $(this).find(".footer-images").attr("src");

    if (newImgSrc) {
      $overlayImg.attr("src", newImgSrc);
    }

    $overlay.css("display", "flex");
  });

  $(".footer-item").on("mouseleave", function () {
    $(".footer-overlay").css("display", "none");
  });
});

// mcon controller
function mconAnimation() {
  gsap.registerPlugin(ScrollTrigger);

  let mconTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[mcon-list]",
      start: "top 55%",
      end: "bottom top",
      toggleActions: "play none none reverse",
      // markers: true,
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

  // Ensure the timeline starts in the reversed state
  mconTimeline.progress(1).reverse();

  // ScrollTrigger for mcon-item animations

  $("[mcon-item]").each(function () {
    let item = $(this);
    let growElement = item.find("[mcon-grow]")[0];

    let mconTimelineTwo = gsap.timeline({
      scrollTrigger: {
        trigger: item[0],
        // start: "top 61%",
        // end: "bottom 41%",
        start: "top 54%",
        end: "bottom 31%",

        scrub: true,
        // markers: true,
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

  // ScrollTrigger for mcon-item opacity animation
  $("[mcon-item]").each(function () {
    let item = $(this);

    gsap
      .timeline({
        scrollTrigger: {
          trigger: item[0], // Use the native DOM element for ScrollTrigger
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

  //change image
  // Change image with forced update on fast scrolling
  $("[mcon-item]").each(function () {
    let item = $(this);

    let mconTimelineFour = gsap.timeline({
      scrollTrigger: {
        trigger: item[0],
        start: "top 50%",
        end: "top 44%",
        // markers: true,
        onEnter: () => {
          forceUpdateImages(item);
        },
        onEnterBack: () => {
          forceUpdateImages(item);
        },
      },
    });

    function forceUpdateImages(item) {
      let itemImg = item.find("[mcon-item-img]").attr("src");
      let itemSrcset = item.find("[mcon-item-img]").attr("srcset");

      // Kill only tweens, NOT the ScrollTrigger
      gsap.killTweensOf("[mcon-bg-img], [mcon-main-img]");

      // Invalidate & refresh ScrollTrigger so it recalculates positions
      mconTimelineFour.invalidate();
      ScrollTrigger.refresh();

      // Forcefully update images
      if (itemImg) {
        $("[mcon-bg-img], [mcon-main-img]").attr("src", itemImg);
      }
      if (itemSrcset) {
        $("[mcon-bg-img], [mcon-main-img]").attr("srcset", itemSrcset);
      }
    }
  });
}

// Run the function
mconAnimation();

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

function landerScroll() {
  const landerOverlay = gsap.timeline({
    scrollTrigger: {
      trigger: "[intro-opacity-trigger]",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  landerOverlay.fromTo($("[intro-opacity]"), { opacity: 1 }, { opacity: 0 });

  const landerItem = gsap.timeline({
    scrollTrigger: {
      trigger: "[banner-opacity-trigger]",
      // start: () => `top 90%`,
      // end: () => `top 95%`,
      start: "top 90%",
      end: "top 95%",

      scrub: true,
      markers: true,
    },
  });

  landerItem.fromTo($("[intro-item-show]"), { opacity: 0 }, { opacity: 1 });
  landerItem.fromTo(
    $("[intro-item-hide]"),
    { opacity: 1 },
    { opacity: 0, immedieteRender: false },
    ">"
  );

  const landerBanner = gsap.timeline({
    scrollTrigger: {
      trigger: ".home-bracket-trigger",
      start: "top 60%",
      end: "top 60%",
      toggleActions: "restart reverse restart reverse",
      // scrub: true,
      // markers: true,
    },
  });

  landerBanner.fromTo($("[intro-item-show]"), { opacity: 0 }, { opacity: 1 });
  // landerBanner.fromTo(
  //   $("[intro-item-hide]"),
  //   { opacity: 1 },
  //   { opacity: 0 },
  //   ">"
  // );
}

landerScroll();

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
    // markers: true,
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
    // markers: true,
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

$(document).ready(function () {
  $("[menu-toggle]").on("click", function () {
    let menuOpen = $(".menu-open");
    let menuToggleText = $("[menu-toggle-text]");

    if (menuOpen.width() === 0) {
      // Open the menu
      menuToggleText.text("close"); // Change text instantly
      gsap.to(menuOpen, {
        width: "100%",
        // opacity: 1,
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.fromTo(
        menuOpen,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.02,
          ease: "power2.in",
        },
        "<+=0.18"
      );
    } else {
      // Close the menu
      menuToggleText.text("menu"); // Change text instantly
      gsap.fromTo(
        menuOpen,
        {
          opacity: 1,
        },
        {
          opacity: 0,
          duration: 0.02,
          ease: "power2.out",
        }
      );
      gsap.to(
        menuOpen,
        {
          width: "0%",
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        },
        "<"
      );
    }
  });
});

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
  ScrollTrigger.create({
    trigger: "[hide-nav-trigger]",
    start: "top 20%", // When the top of [hide-nav-trigger] reaches 20% from the top
    onEnter: () => {
      $("[hide-nav]").css({
        opacity: "0",
        pointerEvents: "none",
      });
    },
    onLeaveBack: () => {
      $("[hide-nav]").css({
        opacity: "1",
        pointerEvents: "auto",
      });
    },
  });
}

//list view hover
$(".allworks-list_item").each(function () {
  const listBg = $(this).find(".list-bg");
  const listItem = $(this);

  gsap.set(listBg, { clipPath: "inset(0% 0% 100% 0%)" });

  let lastY = 0;

  $(this).on("mouseenter", function (e) {
    const currentY = e.clientY;
    const direction = currentY > lastY ? "down" : "up";
    lastY = currentY;

    gsap.killTweensOf([listBg, listItem]);

    if (direction === "down") {
      gsap
        .timeline()
        .to(listItem, { color: "black", duration: 0, ease: "power1.out" }, 0)
        .fromTo(
          listBg,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0, ease: "power1.out" },
          0
        );
    } else {
      gsap
        .timeline()
        .to(listItem, { color: "black", duration: 0, ease: "power1.out" }, 0)
        .fromTo(
          listBg,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0, ease: "power1.out" },
          0
        );
    }
  });

  $(this).on("mouseleave", function (e) {
    const currentY = e.clientY;
    const direction = currentY > lastY ? "down" : "up";
    lastY = currentY;

    gsap.killTweensOf([listBg, listItem]);

    if (direction === "down") {
      gsap
        .timeline()
        .to(listItem, { color: "", duration: 0.3, ease: "power1.out" }, 0)
        .fromTo(
          listBg,
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 0.2,
            ease: "power1.out",
          },
          0
        );
    } else {
      gsap
        .timeline()
        .to(listItem, { color: "", duration: 0.3, ease: "power1.out" }, 0)
        .fromTo(
          listBg,
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.2,
            ease: "power1.out",
          },
          0
        );
    }
  });
});

$(".cs-list-item").on("click", function () {
  const allworksListItem = $(this).closest(".allworks-list_item"); // Find the parent .allworks-list_item
  const swiperContainer = allworksListItem.find(".swiper-container"); // Find .swiper-container within the parent
  const isExpanded = swiperContainer.is(":visible"); // Check if the element is visible

  // Collapse any other expanded items
  $(".swiper-container")
    .not(swiperContainer)
    .each(function () {
      if ($(this).is(":visible")) {
        gsap.to($(this), {
          opacity: 0,
          duration: 0.0,
          ease: "power1.out",
          onComplete: () => {
            $(this).css("display", "none"); // Hide the element after the animation
            $(window).trigger("resize"); // Trigger a resize event
          },
        });
      }
    });

  if (isExpanded) {
    // Collapse the currently clicked item
    gsap.to(swiperContainer, {
      opacity: 0,
      duration: 0.0,
      ease: "power1.out",
      onComplete: () => {
        swiperContainer.css("display", "none"); // Hide the element after collapsing
        lenis.resize(); // Recalculate the layout after collapsing
      },
    });
  } else {
    // Expand the clicked item
    swiperContainer.css("display", "block"); // Set display: block first
    gsap.to(swiperContainer, {
      opacity: 1,
      duration: 0.1,
      ease: "power1.in",
      onStart: () => {
        swiperContainer.css("opacity", 0); // Ensure opacity starts at 0 when displayed
      },
      onComplete: () => {
        lenis.resize(); // Recalculate the layout after expanding
      },
    });
  }
});

//cursor text

document.addEventListener("DOMContentLoaded", () => {
  let cursorItem = document.querySelector(".cursor");
  let cursorParagraph = cursorItem.querySelector("p");
  let targets = document.querySelectorAll("[data-cursor]");
  let xOffset = 6;
  let yOffset = -50;
  let currentTarget = null;
  let lastText = "";

  // Hide the cursor initially
  gsap.set(cursorItem, { autoAlpha: 0 });

  // Use GSAP quick.to for a more performative tween on the cursor
  let xTo = gsap.quickTo(cursorItem, "x", {
    ease: "circ.out",
    duration: 0.1,
  });
  let yTo = gsap.quickTo(cursorItem, "y", {
    ease: "circ.out",
    duration: 0.1,
  });

  // On mousemove, call the quickTo functions to the actual cursor position
  window.addEventListener("mousemove", (e) => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scrollY = window.scrollY;
    let cursorX = e.clientX;
    let cursorY = e.clientY + scrollY; // Adjust cursorY to account for scroll

    // Default offsets
    let xPercent = xOffset;
    let yPercent = yOffset;

    gsap.set(cursorItem, {
      xPercent: xPercent,
      yPercent: yPercent,
    });
    xTo(cursorX);
    yTo(cursorY - scrollY); // Subtract scroll for viewport positioning
  });

  // Add mousemove listener to toggle visibility on hover
  targets.forEach((target) => {
    target.addEventListener("mousemove", () => {
      currentTarget = target; // Set the current target
      let newText = target.getAttribute("data-cursor");

      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;
      }

      // Show the cursor when over a target
      gsap.to(cursorItem, { autoAlpha: 1, duration: 0.2 });
    });

    target.addEventListener("mouseleave", () => {
      currentTarget = null;

      // Hide the cursor when leaving a target
      gsap.to(cursorItem, { autoAlpha: 0, duration: 0.2 });
    });
  });
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
let transitionTrigger = $(".transition-trigger");
let introDurationMS = 1600;
let exitDurationMS = 1000;
let excludedClass = "no-transition";

// On Page Load
if (transitionTrigger.length > 0) {
  transitionTrigger.click();
  $("body").addClass("no-scroll-transition");
  setTimeout(() => {
    $("body").removeClass("no-scroll-transition");
  }, introDurationMS);
}
// On Link Click
$("a").on("click", function (e) {
  if (
    $(this).prop("hostname") == window.location.host &&
    $(this).attr("href").indexOf("#") === -1 &&
    !$(this).hasClass(excludedClass) &&
    $(this).attr("target") !== "_blank" &&
    transitionTrigger.length > 0
  ) {
    e.preventDefault();
    $("body").addClass("no-scroll-transition");
    let transitionURL = $(this).attr("href");
    transitionTrigger.click();
    setTimeout(function () {
      window.location = transitionURL;
    }, exitDurationMS);
  }
});
// On Back Button Tap
window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};
// Hide Transition on Window Width Resize
setTimeout(() => {
  $(window).on("resize", function () {
    setTimeout(() => {
      $(".transition").css("display", "none");
    }, 50);
  });
}, introDurationMS);

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
$(".home-hero_play, .menu-playreel ,.play-reel").on("click", function () {
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
  });
});

$(".works-item").on("mouseenter mouseleave", function () {
  $(this).toggleClass("hovered");
});
$(".footer-images").on("mouseenter mouseleave", function () {
  $(".footer-image_full").toggleClass("is-open");
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

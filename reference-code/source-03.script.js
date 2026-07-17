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
    lineSplit.revert();
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

let mm = gsap.matchMedia();

if (document.querySelector(".page-wrap")) {
  mm.add("(min-width: 992px)", () => {
    landerLotiAnimation();
    headerHoverLoti();
    textCursorFollow();
  });
  mm.add("(max-width: 991px)", () => {});
}
document.body.setAttribute(
  "data-has-visited",
  sessionStorage.getItem("hasVisited") ? "true" : "false"
);

function preloader() {
  // if (sessionStorage.getItem("hasVisited")) {
  //   $(".preloader-wrap").css("display", "none");
  //   $(".page-main").css("opacity", "1");
  //   return;
  // }

  // sessionStorage.setItem("hasVisited", "true");

  const $wrap = $(".preloader-wrap");
  const $progress = $(".preloader-progress-item");
  const $pageMain = $(".page-main");
  const $loaderEnter = $("[loader-enter]");

  $wrap.css("display", "block");
  $progress.css({ width: "0%", opacity: 1 });
  $loaderEnter.removeClass("is-visible");

  let pageLoaded = false;
  let timerComplete = false;

  function checkReveal() {
    if (pageLoaded && timerComplete) {
      setTimeout(() => {
        gsap.to($progress, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });

        $loaderEnter.addClass("is-visible");
      }, 500);
    }
  }

  const preloaderProgressTimeline = gsap.timeline();

  preloaderProgressTimeline.to(
    $progress,
    {
      width: "100%",
      duration: 2,
      ease: "power2.inOut",
    },
    0
  );

  let counter = { val: 0 };
  preloaderProgressTimeline.to(
    counter,
    {
      val: 99,
      duration: 2,
      ease: "none",
      onUpdate: () => {
        const num = Math.floor(counter.val);
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        $("[progress-first]").text(tens);
        $("[progress-second]").text(ones);
      },
    },
    0
  );

  $(window).on("load", () => {
    pageLoaded = true;
    checkReveal();
  });

  setTimeout(() => {
    timerComplete = true;
    checkReveal();
  }, 2000);

  $loaderEnter.on("click", () => {
    document.body.setAttribute("data-has-visited", "true");

    // $(".preloader-header-wrap").addClass("is-lander");

    const landerLoadTimeline = gsap.timeline();
    landerLoadTimeline.set($pageMain, { opacity: 1 });
    landerLoadTimeline.set(".preloader-header-wrap", {
      clearProps: "pointerEvents", // First remove existing styles
    });
    landerLoadTimeline.set(".preloader-header-wrap", {
      css: { pointerEvents: "none" },
    });

    //old animation

    // //hide all letters in "twenty"
    // landerLoadTimeline.fromTo(
    //   "[preloader-header-twenty] [preload-header-word]",
    //   {
    //     opacity: 1,
    //     visibility: "visible",
    //   },
    //   {
    //     opacity: 0,
    //     visibility: "hidden",
    //     stagger: { each: 0.15, from: "end" },
    //     duration: 0.3,
    //   },
    //   0
    // );

    // //hide all letters in "eighteen"
    // landerLoadTimeline.fromTo(
    //   "[preloader-header-eighteen] [preload-header-word]",
    //   {
    //     opacity: 1,
    //     visibility: "visible",
    //   },
    //   {
    //     opacity: 0,
    //     visibility: "hidden",
    //     stagger: { each: 0.1, from: "end" },
    //     duration: 0.3,
    //   },
    //   0
    // );

    // // remove all letters in twenty
    // landerLoadTimeline.set(
    //   "[preloader-header-twenty] [preload-header-word]",
    //   {
    //     display: "none",
    //     // stagger: 0.1,
    //   },
    //   ">"
    // );

    // // remove all letters in eighteen
    // landerLoadTimeline.set(
    //   "[preloader-header-eighteen] [preload-header-word]",
    //   {
    //     display: "none",
    //     // stagger: 0.1,
    //   },
    //   "<"
    // );

    // // animate width of twenty
    // landerLoadTimeline.fromTo(
    //   "[preloader-header-twenty]",
    //   {
    //     width: "43%",
    //     minWidth: "43%",
    //     marginRight: "0em",
    //   },
    //   {
    //     width: "5rem",
    //     minWidth: "0px",
    //     marginRight: "-4.32em",
    //     duration: 1.5,
    //     ease: "power3.inOut",
    //   },
    //   0
    // );
    // // animate margin of E
    // landerLoadTimeline.fromTo(
    //   "[preloader-header-e]",
    //   {
    //     marginRight: "0em",
    //   },
    //   {
    //     marginRight: "-0.40em",
    //     duration: 1.5,
    //     ease: "power3.inOut",
    //   },
    //   0
    // );
    // // animate width of eighteen
    // landerLoadTimeline.fromTo(
    //   "[preloader-header-eighteen]",
    //   {
    //     width: "52.5%",
    //     minWidth: "52.5%",
    //   },
    //   {
    //     width: "7rem",
    //     minWidth: "0px",
    //     duration: 1.5,
    //     ease: "power3.inOut",
    //   },
    //   0
    // );

    // // display letter S
    // landerLoadTimeline.fromTo(
    //   ["[preloader-header-s]"],
    //   {
    //     opacity: 0,
    //   },
    //   {
    //     opacity: 1,

    //     duration: 0.3,
    //   },
    //   "<+=0.75" // or adjust timing as needed
    // );

    // // display letter S
    // landerLoadTimeline.set(
    //   ["[preloader-header-s]"],
    //   {
    //     display: "block",
    //   },
    //   ">" // or adjust timing as needed
    // );

    // twenty eighteen letters drop animation
    landerLoadTimeline.fromTo(
      "[svg-wrap]",
      {
        yPercent: 0,
      },
      {
        yPercent: 110,
        duration: 0.8,
        ease: "power3.inOut",
        stagger: 0.1,
      },
      0
    );

    // clip video into view
    landerLoadTimeline.fromTo(
      "[lander-vid-holder]",
      {
        clipPath: "inset(50% 50% 50% 50%)",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.5,
        ease: "power3.inOut",
      },
      1
    );
    // scale video with clip
    landerLoadTimeline.fromTo(
      "[lander-vid-scale]",
      {
        scale: 0.6,
      },
      {
        scale: 1,
        duration: 1.5,
        ease: "power3.inOut",
      },
      1
    );

    // //animate height of T E S
    // landerLoadTimeline.to(
    //   ["[preloader-header-e]", "[preloader-header-s]", "[preloader-header-t]"],
    //   {
    //     height: "8.5em",
    //     duration: 1,
    //     ease: "power2.out",
    //     // stagger: 0.1,
    //   },
    //   // "<+=0.25"
    //   0.65
    // );

    // // animate height of T E S
    // landerLoadTimeline.fromTo(
    //   ["[preloader-header-wrap]"],
    //   {
    //     height: "18.2em",
    //   },
    //   {
    //     height: "8.5em",
    //     duration: 1,
    //     ease: "power2.out",
    //   },
    //   "<"
    // );

    // reveal dot
    landerLoadTimeline.fromTo(
      ".header-dot",
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.1,
        ease: "expo.out",
      },
      2.5
    );

    // reveal lander content #1
    // $("[lander-type-text]").each(function (index) {
    //   new SplitType(this, { types: "words, chars" });

    //   landerLoadTimeline.fromTo(
    //     $(this).find(".char"),
    //     { opacity: 0 },
    //     {
    //       opacity: 1,
    //       duration: 0.1,
    //       ease: "expo.out",
    //       stagger: 0.02,
    //     },
    //     "<+=0.25"
    //   );
    // });

    // Add a label where you want this group of animations to begin
    $("[lander-type-text]").each(function (index) {
      new SplitType(this, { types: "words, chars" });

      landerLoadTimeline.fromTo(
        $(this).find(".char"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
          ease: "expo.out",
          stagger: 0.02,
        },
        `<-=${0.25 + index * 0.1}`
      );
    });

    $("[lander-typetwo-text]").each(function (index) {
      new SplitType(this, { types: "words, chars" });

      landerLoadTimeline.fromTo(
        $(this).find(".char"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          ease: "expo.out",
          stagger: 0.03,
        },
        `<+=${0.08 + index * 0.05}`
      );
    });

    // landerLoadTimeline.fromTo(
    //   "[preloader-header] [preloader-header-item]",
    //   { opacity: 0 },
    //   {
    //     opacity: 1,
    //     duration: 0.1,
    //     ease: "expo.out",
    //     stagger: 0.4,
    //   },
    //   0.1
    // );

    // landerLoadTimeline.fromTo(
    //   "[lander-line]",
    //   { width: "0%" },
    //   {
    //     width: "100%",
    //     duration: 0.5,
    //     ease: "expo.out",
    //   },
    //   ">0.1"
    // );
    landerLoadTimeline.set(".btn-wrap.is-page-main", {
      clearProps: "pointerEvents",
    });
    landerLoadTimeline.set(".btn-wrap.is-page-main", {
      css: { pointerEvents: "auto" },
    });
  });
}

preloader();

function textCursorFollow() {
  const cursorItem = document.querySelector(".cursor");
  const cursorParagraph = cursorItem.querySelector("p");
  const targets = document.querySelectorAll("[data-cursor]");
  const xOffset = 32;
  const yOffset = 5;
  let lastText = "";
  let currentTarget = null;
  let insideCursorFollow = false;
  let lastMouseEvent = null;
  let hasMoved = false;
  let isForceHidden = false;

  gsap.set(cursorItem, { autoAlpha: 0 });

  const xTo = gsap.quickTo(cursorItem, "left", {
    ease: "power2.out",
    duration: 0.4,
  });
  const yTo = gsap.quickTo(cursorItem, "top", {
    ease: "power2.out",
    duration: 0.4,
  });

  function moveCursor(e) {
    lastMouseEvent = e;

    const cursorRect = cursorItem.getBoundingClientRect();
    const cursorWidth = cursorRect.width;
    const cursorHeight = cursorRect.height;

    const rawX = e.clientX + xOffset;
    const rawY = e.clientY + yOffset;

    const clampedX = Math.min(
      Math.max(rawX, 0),
      window.innerWidth - cursorWidth
    );
    const clampedY = Math.min(
      Math.max(rawY, 0),
      window.innerHeight - cursorHeight
    );

    xTo(clampedX);
    yTo(clampedY);

    // if (!isForceHidden) {
    //   const edgeBuffer = 10;
    //   const atLeftEdge = clampedX <= edgeBuffer;
    //   const atRightEdge =
    //     clampedX >= window.innerWidth - cursorWidth - edgeBuffer;
    //   const atTopEdge = clampedY <= edgeBuffer;
    //   const atBottomEdge =
    //     clampedY >= window.innerHeight - cursorHeight - edgeBuffer;

    //   const nearEdge = atLeftEdge || atRightEdge || atTopEdge || atBottomEdge;

    //   gsap.to(cursorItem, {
    //     autoAlpha: nearEdge ? 0 : 1,
    //     duration: 0.01,
    //   });
    // }
  }

  window.addEventListener("mousemove", (e) => {
    window.lastMouseMoveEvent = e;
    moveCursor(e);

    if (!hasMoved) {
      hasMoved = true;

      const cursorRect = cursorItem.getBoundingClientRect();
      const cursorWidth = cursorRect.width;
      const cursorHeight = cursorRect.height;
      const rawX = e.clientX + xOffset;
      const rawY = e.clientY + yOffset;

      const clampedX = Math.min(
        Math.max(rawX, 0),
        window.innerWidth - cursorWidth
      );
      const clampedY = Math.min(
        Math.max(rawY, 0),
        window.innerHeight - cursorHeight
      );

      gsap.set(cursorItem, { left: clampedX, top: clampedY });

      requestAnimationFrame(() => {
        gsap.to(cursorItem, { autoAlpha: 1, duration: 0.2 });
      });

      targets.forEach((target) => {
        if (target.matches(":hover")) {
          const newText = target.getAttribute("data-cursor");
          cursorParagraph.textContent = newText;
          lastText = newText;
          currentTarget = target;
          insideCursorFollow = true;
        }
      });
    }

    moveCursor(e);
  });

  targets.forEach((target) => {
    const newText = target.getAttribute("data-cursor");

    target.addEventListener("mouseenter", (e) => {
      currentTarget = target;
      insideCursorFollow = true;

      if (newText !== lastText) {
        cursorParagraph.textContent = newText;
        lastText = newText;
      }

      if (hasMoved) {
        moveCursor(lastMouseEvent || e);
        gsap.to(cursorItem, { autoAlpha: 1, duration: 0.1, delay: 0.1 });
      }
    });

    target.addEventListener("mouseleave", () => {
      insideCursorFollow = false;
      currentTarget = null;
      gsap.to(cursorItem, { autoAlpha: 0, duration: 0 });
    });
  });

  document.querySelectorAll("[cursor-hide]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      isForceHidden = true;
      gsap.to(cursorItem, { autoAlpha: 0, duration: 0.1 });
    });

    el.addEventListener("mouseleave", () => {
      isForceHidden = false;
      if (insideCursorFollow && currentTarget && hasMoved) {
        gsap.to(cursorItem, { autoAlpha: 1, duration: 0.1 });
      }
    });
  });
}

function videoPopup() {
  const $popupItem = $("[video-popup-item]");
  const $popupHeader = $("[video-popup-header]");
  const $openBtn = $("[video-popup-open]");
  const $closeBtn = $("[video-popup-close]");
  const $video = $("[video-main]")[0];

  gsap.set($popupItem, { opacity: 0, pointerEvents: "none" });
  gsap.set($popupHeader, { scale: 1 });

  $openBtn.on("click", () => {
    gsap.fromTo(
      $popupItem,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.in",
        onStart: () => {
          $popupItem.css("pointer-events", "auto");
        },
      }
    );

    gsap.fromTo(
      $popupHeader,
      { scale: 1 },
      { scale: 0.6, duration: 0.7, ease: "power2.out" }
    );

    if ($video) {
      $video.currentTime = 0;
      $video.play();
    }

    updateCursorText("Close");
  });

  $("[video-sound]").on("click", (e) => {
    e.stopPropagation();
  });

  $closeBtn.on("click", () => {
    if ($video) $video.pause(); // Pause before fade starts

    gsap.fromTo(
      $popupItem,
      {
        opacity: 1,
      },
      {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          $popupItem.css("pointer-events", "none");
        },
      }
    );

    gsap.fromTo(
      $popupHeader,
      {
        scale: 0.6,
      },
      {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      }
    );

    updateCursorText("Play Showreel");
  });
}

// videoPopup();

function updateCursorText(newText) {
  const cursorItem = document.querySelector(".cursor");
  const cursorParagraph = cursorItem.querySelector("p");

  if (!cursorItem || !cursorParagraph) return;

  cursorParagraph.textContent = newText;

  // Recalculate position to avoid jitter
  const evt = window.lastMouseMoveEvent;
  if (evt) {
    const moveCursorEvent = new MouseEvent("mousemove", {
      clientX: evt.clientX,
      clientY: evt.clientY,
    });
    window.dispatchEvent(moveCursorEvent);
  }
}

function setupVideoSoundToggle() {
  const $video = $("[video-main]")[0]; // plain JS video element
  const $soundButton = $("[video-sound]");

  $soundButton.on("click", () => {
    if ($video) {
      $video.muted = !$video.muted;
    }
  });
}

// setupVideoSoundToggle();

function toggleSoundIcon() {
  const $soundBtn = $("[video-sound]");
  const $soundOn = $("[video-sound-on]");
  const $soundOff = $("[video-sound-off]");

  $soundBtn.on("click", () => {
    const isOnVisible = $soundOn.css("display") === "block";

    if (isOnVisible) {
      $soundOn.css("display", "none");
      $soundOff.css("display", "block");
    } else {
      $soundOn.css("display", "block");
      $soundOff.css("display", "none");
    }
  });
}

// toggleSoundIcon();

function updateVideoProgress() {
  const $video = $("[video-main]")[0];
  const $progressText = $("[video-progress-text]");

  if (!$video || !$progressText.length) return;

  $video.addEventListener("timeupdate", () => {
    const time = Math.floor($video.currentTime);
    const hours = String(Math.floor(time / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");

    $progressText.text(`${hours}:${minutes}:${seconds}`);
  });
}

// updateVideoProgress();

function landerLotiAnimation() {
  $("[loti-wrap]").each(function () {
    const path = $(this).attr("loti-path");
    if (!path) return;

    bodymovin.loadAnimation({
      container: this,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: path,
    });
  });
}

// function landerLotiAnimation() {
//   $("[header-hover-letter]").each(function (index) {
//     let lottieHolder = $(this).find("[loti-wrap]");
//     // let lottieFile = $(this).find("[lottie-element]");
//     let lottieUrl = lottieFile.attr("loti-path");
//     let animationType = lottieHolder.attr("loti-wrap");

//     let lottieAnimation = bodymovin.loadAnimation({
//       container: lottieFile[0],
//       renderer: "svg",
//       autoplay: animationType === "loop",
//       loop: animationType === "loop",
//       path: lottieUrl,
//     });
//   });
// }

// landerLotiAnimation();

// function headerHoverLoti() {
//   $("[header-hover-letter]").each(function () {
//     const $el = $(this);
//     const svg = $el.find("[svg-wrap]");
//     const loti = $el.find("[loti-wrap]");

//     const hoverOn = gsap.timeline({ paused: true });
//     hoverOn.fromTo(
//       svg,
//       { opacity: 1 },
//       { opacity: 0, duration: 0.01, ease: "linear", immediateRender: false },
//       0
//     );
//     hoverOn.fromTo(
//       loti,
//       { opacity: 0 },
//       { opacity: 1, duration: 0.3, ease: "power2.in", immediateRender: false },
//       0
//     );

//     const hoverOff = gsap.timeline({ paused: true });
//     hoverOff.fromTo(
//       loti,
//       { opacity: 1 },
//       { opacity: 0, duration: 0.01, ease: "linear", immediateRender: false },
//       0
//     );
//     hoverOff.fromTo(
//       svg,
//       { opacity: 0 },
//       { opacity: 1, duration: 0.3, ease: "power2.in", immediateRender: false },
//       0
//     );

//     $el.on("mouseenter", () => hoverOn.restart());
//     $el.on("mouseleave", () => hoverOff.restart());
//   });
// }

// headerHoverLoti();

function headerHoverLoti() {
  $("[header-hover-letter]").each(function () {
    const $el = $(this);
    const svg = $el.find("[svg-wrap]");
    const loti = $el.find("[loti-wrap]");

    const tl = gsap.timeline({ paused: true });
    tl.set(svg, { opacity: 0 }, 0);
    tl.fromTo(
      loti,
      { opacity: 0 },
      { opacity: 1, duration: 0.01, ease: "linear" },
      0
    );

    $el.on("mouseenter", () => tl.play());
    $el.on("mouseleave", () => {
      tl.pause(0);
      gsap.set(loti, { opacity: 0 });
      gsap.to(svg, { opacity: 1, duration: 0.01, ease: "linear" });
    });
  });
}

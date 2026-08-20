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

  $("[data-lenis-prevent]").on("wheel touchmove", function (event) {
    event.stopPropagation();
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
  const $gitTest = $(".git-test");
  if (!$gitTest.length) return null;

  const handleClick = () => {
    $gitTest.toggleClass("is-moved-down");
  };

  $gitTest.on("click.gitTestDesktop", handleClick);

  return () => {
    $gitTest.off("click.gitTestDesktop");
    $gitTest.removeClass("is-moved-down");
  };
}

function gitTestMobile() {
  const $gitTest = $(".git-test");
  if (!$gitTest.length) return null;

  const handleClick = () => {
    $gitTest.toggleClass("is-moved-right");
  };

  $gitTest.on("click.gitTestMobile", handleClick);

  return () => {
    $gitTest.off("click.gitTestMobile");
    $gitTest.removeClass("is-moved-right");
  };
}

const onDesktop = (fn) => gsap.matchMedia().add("(min-width: 992px)", fn);
const onMobile = (fn) => gsap.matchMedia().add("(max-width: 991px)", fn);

function initSite() {
  initLenis();
  navTheme();
  accordionOne();
  filterOne();

  onDesktop(() => {
    // gitTestDesktop();
    lineHover();
    const homeAnimationCleanup = homeAnimation();
    const homeEndAnimationCleanup = homeEndAnimation();
    const footerEnginePixelsCleanup = footerEnginePixels();

    return () => {
      if (homeAnimationCleanup) homeAnimationCleanup();
      if (homeEndAnimationCleanup) homeEndAnimationCleanup();
      if (footerEnginePixelsCleanup) footerEnginePixelsCleanup();
    };
  });

  onMobile(() => {
    // gitTestMobile();
  });
}

$(initSite);

function homeAnimation() {
  if (
    !$(".lander-wrap").length ||
    !$(".layout-start").length ||
    !$(".home-start").length ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return null;
  }

  gsap.registerPlugin(ScrollTrigger);

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  ScrollTrigger.clearScrollMemory();
  window.scrollTo(0, 0);

  if (window.lenis) {
    window.lenis.scrollTo(0, {
      immediate: true,
      force: true,
    });

    window.lenis.stop();
  }

  let homeLoadScrollLocked = Boolean(window.lenis);

  gsap.set(
    $(
      "[home-resting], [home-start-up], [home-second-up], [home-third-up]"
    ),
    {
      y: "10rem",
      opacity: 0,
      willChange: "transform, opacity",
    }
  );

  const gradientOrbit = { angle: 0 };
  const gradientAngles = [
    -Math.PI / 2,
    -Math.PI / 4,
    0,
    Math.PI / 4,
    Math.PI / 2,
    (Math.PI * 3) / 4,
    Math.PI,
    (Math.PI * 5) / 4,
  ];

  function homeClipPath(state) {
    const home = $(".home-start")[0];
    const line = $("[home-gradient-line]")[0];
    const homeRect = home.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    const width = home.offsetWidth;
    const height = home.offsetHeight;
    const centerX = width * 0.5;
    const centerY = lineRect.top + lineRect.height / 2 - homeRect.top;
    const half = Math.max(width, height);
    const left = centerX - half;
    const right = centerX + half;
    const top = centerY - half;
    const bottom = centerY + half;
    const point = (x, y) => `${x}px ${y}px`;
    const topLeft = point(left, top);
    const topRight = point(right, top);
    const bottomLeft = point(left, bottom);
    const bottomRight = point(right, bottom);
    const leftCenter = point(left, centerY);
    const rightCenter = point(right, centerY);
    const center = point(centerX, centerY);
    const rightUpper = point(right, centerY - half * 0.06);
    const rightLower = point(right, centerY + half * 0.06);

    const paths = {
      closed: [
        topRight,
        topRight,
        topRight,
        topRight,
        rightCenter,
        center,
        rightCenter,
        bottomRight,
        bottomRight,
        bottomRight,
        bottomLeft,
        topLeft,
      ],
      slit: [
        topRight,
        topRight,
        topRight,
        topRight,
        rightUpper,
        center,
        rightLower,
        bottomRight,
        bottomRight,
        bottomRight,
        bottomLeft,
        topLeft,
      ],
      open: [
        topRight,
        topRight,
        topRight,
        topRight,
        topRight,
        center,
        bottomRight,
        bottomRight,
        bottomRight,
        bottomRight,
        bottomLeft,
        topLeft,
      ],
      sweep: [
        topLeft,
        topLeft,
        topLeft,
        topLeft,
        topRight,
        center,
        bottomRight,
        bottomLeft,
        bottomLeft,
        bottomLeft,
        bottomLeft,
        topLeft,
      ],
      left: [
        topLeft,
        topLeft,
        topLeft,
        topLeft,
        topLeft,
        center,
        bottomLeft,
        bottomLeft,
        bottomLeft,
        bottomLeft,
        bottomLeft,
        topLeft,
      ],
      complete: [
        leftCenter,
        leftCenter,
        leftCenter,
        leftCenter,
        leftCenter,
        center,
        leftCenter,
        leftCenter,
        leftCenter,
        leftCenter,
        leftCenter,
        leftCenter,
      ],
    };

    return `polygon(${paths[state].join(", ")})`;
  }

  function moveGradientDots() {
    if (homeTimeline.time() < 40) return;

    $("[home-gradient-piece]").each(function (index) {
      const angle = gradientAngles[index] + gradientOrbit.angle;

      $(this).attr({
        cx: 720 + Math.cos(angle) * 520,
        cy: 416 + Math.sin(angle) * 520,
      });
    });
  }

  gsap.set($("[home-gradient-orbit]"), {
    x: 0,
    y: 0,
  });

  gsap.set($("[home-gradient-drops]"), {
    y: 0,
  });

  gsap.set($("[home-gradient-piece]"), {
    attr: {
      cx: 720,
      cy: 900,
      rx: 900,
      ry: 225,
    },
    opacity: 0,
  });

  gsap.set($('[home-gradient-piece="1"]'), {
    opacity: 0.85,
  });

  gsap.set($("[home-gradient-drop]"), {
    opacity: 0,
  });

  gsap.set($('[home-gradient-drop="1"]'), {
    attr: { transform: "translate(167 7) scale(1.1)" },
  });

  gsap.set($('[home-gradient-drop="2"]'), {
    attr: { transform: "translate(598 7) scale(1.1)" },
  });

  gsap.set($('[home-gradient-drop="3"]'), {
    attr: { transform: "translate(1029 7) scale(1.1)" },
  });

  gsap.set($("[home-gradient-drop-blur], [home-final-drop-blur]"), {
    attr: { stdDeviation: 52 },
  });

  gsap.set($("[home-drop-purple-base], [home-drop-colors]"), {
    opacity: 0,
  });

  gsap.set($("[home-drop-circle]"), {
    x: -40,
  });

  gsap.set($('[home-drop-circle="yellow"]'), {
    opacity: 0.12,
  });

  gsap.set($('[home-drop-circle="white"]'), {
    opacity: 0.08,
  });

  gsap.set($('[home-drop-circle="blue"]'), {
    opacity: 0,
  });

  gsap.set($('[home-drop-circle="purple"]'), {
    opacity: 1,
  });

  gsap.set($("[home-drop-star]"), {
    opacity: 0,
    scale: 0.15,
    rotation: -35,
    transformOrigin: "center center",
  });

  gsap.set($("[home-gradient-line]"), {
    attr: {
      "stroke-dasharray": 1560,
      "stroke-dashoffset": 1560,
    },
    opacity: 0,
  });

  gsap.set($(".home-start"), {
    clipPath: "none",
    willChange: "clip-path",
  });

  gsap.set($("[ripple-ring]"), {
    scale: 0.08,
    autoAlpha: 0,
    transformOrigin: "center",
  });

  const homeRippleTimeline = rippleAnimation();
  let rippleHasPlayed = false;

  const restingTimeline = gsap.timeline();

  restingTimeline.to($("[home-resting]"), {
    xPercent: (index) => (index % 2 === 0 ? 1 : -1),
    yPercent: (index) => (index % 3 === 0 ? -2 : 2),
    duration: 3.2,
    ease: "power1.inOut",
    repeat: -1,
    repeatDelay: 0,
    yoyo: true,
    stagger: {
      each: 0.14,
      from: "random",
    },
  });

  const homeLoadTimeline = gsap.timeline({
    onComplete: () => {
      if (!homeLoadScrollLocked || !window.lenis) return;

      window.lenis.start();
      homeLoadScrollLocked = false;
    },
  });

  homeLoadTimeline
    .to(
      $("[home-start-up]"),
      {
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        stagger: {
          amount: 0.6,
          from: "end",
        },
      },
      0
    )
    .to(
      $("[home-start-up]"),
      {
        opacity: 1,
        duration: 0.6,
        ease: "power1.out",
        stagger: {
          amount: 0.6,
          from: "end",
        },
      },
      0
    );

  const homeTimeline = gsap.timeline({ paused: true });

  homeTimeline
    .addLabel("startExit", 0)
    .to(
      $("[home-start-up]"),
      {
        y: "-20rem",
        duration: 24,
        ease: "power2.inOut",
        stagger: {
          amount: 6,
          from: "end",
        },
      },
      "startExit"
    )
    .to(
      $("[home-start-up]"),
      {
        opacity: 0,
        duration: 12,
        ease: "power1.in",
        stagger: {
          amount: 6,
          from: "end",
        },
      },
      "startExit"
    )
    .addLabel("secondEnter", 30)
    .to(
      $("[home-second-up]"),
      {
        y: 0,
        duration: 7.5,
        ease: "power1.in",
      },
      "secondEnter"
    )
    .to(
      $("[home-second-up]"),
      {
        opacity: 1,
        duration: 6,
        ease: "power1.out",
      },
      "secondEnter"
    )
    .addLabel("secondResting", 37.5)
    .to(
      $("[home-second-up]"),
      {
        y: 0,
        duration: 15,
        ease: "none",
      },
      "secondResting"
    )
    .addLabel("secondExit", 52.5)
    .to(
      $("[home-second-up]"),
      {
        y: "-20rem",
        duration: 7.5,
        ease: "power1.in",
      },
      "secondExit"
    )
    .to(
      $("[home-second-up]"),
      {
        opacity: 0,
        duration: 6,
        ease: "power1.out",
      },
      "secondExit"
    )
    .addLabel("thirdEnter", 60)
    .to(
      $("[home-third-up]"),
      {
        y: 0,
        duration: 7.5,
        ease: "power2.out",
      },
      "thirdEnter"
    )
    .to(
      $("[home-third-up]"),
      {
        opacity: 1,
        duration: 6,
        ease: "power1.out",
      },
      "thirdEnter"
    )
    .addLabel("thirdResting", 67.5)
    .to(
      $("[home-third-up]"),
      {
        y: 0,
        duration: 22.5,
        ease: "none",
      },
      "thirdResting"
    )
    .to(
      {},
      {
        duration: 10,
        ease: "none",
      },
      90
    )
    .addLabel("complete", 100);

  homeTimeline
    .addLabel("gradientCircle", 10)
    .to(
      $('[home-gradient-piece="1"]'),
      {
        attr: { cx: 720, cy: -104, rx: 160, ry: 160 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="2"]'),
      {
        attr: { cx: 1088, cy: 48, rx: 145, ry: 145 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="3"]'),
      {
        attr: { cx: 1240, cy: 416, rx: 155, ry: 155 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="4"]'),
      {
        attr: { cx: 1088, cy: 784, rx: 140, ry: 140 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="5"]'),
      {
        attr: { cx: 720, cy: 936, rx: 165, ry: 165 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="6"]'),
      {
        attr: { cx: 352, cy: 784, rx: 145, ry: 145 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="7"]'),
      {
        attr: { cx: 200, cy: 416, rx: 155, ry: 155 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .to(
      $('[home-gradient-piece="8"]'),
      {
        attr: { cx: 352, cy: 48, rx: 140, ry: 140 },
        opacity: 0.82,
        duration: 30,
        ease: "power2.inOut",
      },
      "gradientCircle"
    )
    .addLabel("gradientOrbit", 40)
    .to(
      gradientOrbit,
      {
        angle: Math.PI * 2,
        duration: 15,
        ease: "none",
        onUpdate: moveGradientDots,
      },
      "gradientOrbit"
    )
    .addLabel("gradientRise", 55)
    .to(
      $("[home-gradient-orbit]"),
      {
        y: -620,
        duration: 10,
        ease: "power2.inOut",
      },
      "gradientRise"
    )
    .to(
      $(
        '[home-gradient-piece="4"], [home-gradient-piece="5"], [home-gradient-piece="6"]'
      ),
      {
        attr: { cy: 800 },
        duration: 10,
        ease: "power2.inOut",
      },
      "gradientRise"
    )
    .to(
      $(
        '[home-gradient-piece="1"], [home-gradient-piece="2"], [home-gradient-piece="3"], [home-gradient-piece="7"], [home-gradient-piece="8"]'
      ),
      {
        opacity: 0,
        duration: 6,
        ease: "power1.in",
      },
      "gradientRise+=2"
    )
    .addLabel("gradientDropMerge", 60)
    .to(
      $(
        '[home-gradient-piece="4"], [home-gradient-piece="5"], [home-gradient-piece="6"]'
      ),
      {
        opacity: 0,
        duration: 10,
        ease: "power1.in",
      },
      "gradientDropMerge"
    )
    .to(
      $('[home-gradient-drop="2"]'),
      {
        opacity: 1,
        duration: 7,
        ease: "power1.out",
      },
      "gradientDropMerge"
    )
    .to(
      $('[home-gradient-drop="1"], [home-gradient-drop="3"]'),
      {
        opacity: 0.8,
        duration: 3,
        ease: "power1.out",
      },
      "gradientDropMerge"
    )
    .to(
      $("[home-gradient-drop]"),
      {
        attr: { transform: "translate(640 59) scale(0.72)" },
        duration: 20,
        ease: "power2.out",
      },
      "gradientDropMerge"
    )
    .to(
      $("[home-gradient-drop-blur], [home-final-drop-blur]"),
      {
        attr: { stdDeviation: 22 },
        duration: 20,
        ease: "power1.inOut",
      },
      "gradientDropMerge"
    )
    .to(
      $("[home-gradient-drops]"),
      {
        y: 150,
        duration: 20,
        ease: "power1.inOut",
      },
      "gradientDropMerge"
    )
    .to(
      $('[home-gradient-drop="1"], [home-gradient-drop="3"]'),
      {
        opacity: 0,
        duration: 10,
        ease: "power1.in",
      },
      "gradientDropMerge+=3"
    )
    .addLabel("gradientLand", 80)
    .to(
      $("[home-gradient-line]"),
      {
        attr: { "stroke-dashoffset": 780 },
        opacity: 1,
        duration: 5,
        ease: "power2.inOut",
      },
      "gradientLand"
    )
    .addLabel("lineMeetsDrop", 85)
    .to(
      $("[home-drop-purple-base], [home-drop-colors]"),
      {
        opacity: 1,
        duration: 4,
        ease: "power1.inOut",
      },
      "lineMeetsDrop"
    )
    .to(
      $("[home-final-drop-blur]"),
      {
        attr: { stdDeviation: 16 },
        duration: 4,
        ease: "power1.out",
      },
      "lineMeetsDrop"
    )
    .to(
      $("[home-drop-circle]"),
      {
        x: 0,
        duration: 7,
        ease: "power2.inOut",
        stagger: 0.25,
      },
      "lineMeetsDrop"
    )
    .to(
      $("[home-drop-circle]"),
      {
        opacity: 1,
        duration: 4,
        ease: "power1.inOut",
        stagger: 0.25,
      },
      "lineMeetsDrop"
    )
    .to(
      $("[home-drop-star]"),
      {
        opacity: 1,
        scale: 2.5,
        duration: 4,
        ease: "power2.out",
      },
      "lineMeetsDrop+=1"
    )
    .to(
      $("[home-drop-star]"),
      {
        rotation: 360,
        duration: 34,
        ease: "none",
      },
      "lineMeetsDrop+=1"
    )
    .to(
      $("[home-drop-star]"),
      {
        scale: 2.15,
        duration: 3,
        ease: "power2.inOut",
      },
      "lineMeetsDrop+=13"
    )
    .set(
      $(".home-start"),
      {
        clipPath: () => homeClipPath("closed"),
      },
      "lineMeetsDrop"
    )
    .to(
      $(".home-start"),
      {
        clipPath: () => homeClipPath("slit"),
        duration: 2,
        ease: "power2.inOut",
      },
      "lineMeetsDrop"
    )
    .to(
      $(".home-start"),
      {
        clipPath: () => homeClipPath("open"),
        duration: 3,
        ease: "power2.inOut",
      },
      "lineMeetsDrop+=2"
    )
    .set(
      $(".home-start"),
      {
        clipPath: () => homeClipPath("sweep"),
      },
      "lineMeetsDrop+=5"
    )
    .to(
      $(".home-start"),
      {
        clipPath: () => homeClipPath("left"),
        duration: 10,
        ease: "power1.inOut",
      },
      "lineMeetsDrop+=5"
    )
    .to(
      $(".home-start"),
      {
        clipPath: () => homeClipPath("complete"),
        duration: 8,
        ease: "power1.inOut",
      },
      "lineMeetsDrop+=15"
    )
    .to(
      {},
      {
        duration: 2.4,
        ease: "none",
      },
      117.6
    );

  function syncRestingTimeline(progress) {
    if (progress === 0) {
      restingTimeline.resume();
    } else {
      restingTimeline.pause();
    }
  }

  function syncRippleTimeline() {
    const dropHasLanded = homeTimeline.time() >= 80;

    if (dropHasLanded && !rippleHasPlayed) {
      if (homeRippleTimeline) homeRippleTimeline.restart();
      rippleHasPlayed = true;
    }

    if (!dropHasLanded && rippleHasPlayed) {
      if (homeRippleTimeline) homeRippleTimeline.pause(0);
      gsap.set($("[ripple-ring]"), { scale: 0.08, autoAlpha: 0 });
      rippleHasPlayed = false;
    }
  }

  const homeScrollTrigger = ScrollTrigger.create({
    trigger: $(".layout-start")[0],
    animation: homeTimeline,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      syncRestingTimeline(self.progress);
      syncRippleTimeline();
    },
    onLeave: () => {
      syncRestingTimeline(1);
      syncRippleTimeline();
    },
    onLeaveBack: () => {
      syncRestingTimeline(0);
      syncRippleTimeline();
    },
  });

  syncRestingTimeline(homeScrollTrigger.progress);
  syncRippleTimeline();

  return () => {
    if (homeLoadScrollLocked && window.lenis) {
      window.lenis.start();
      homeLoadScrollLocked = false;
    }

    homeScrollTrigger.kill();
    homeLoadTimeline.kill();
    homeTimeline.kill();
    if (homeRippleTimeline) homeRippleTimeline.kill();
    restingTimeline.kill();
    gsap.set(
      $(
        "[home-resting], [home-start-up], [home-second-up], [home-third-up]"
      ),
      { clearProps: "transform,opacity,will-change" }
    );
    gsap.set(
      $(
        "[home-gradient-orbit], [home-gradient-piece], [home-gradient-drops], [home-gradient-drop], [home-gradient-line], [home-drop-purple-base], [home-drop-colors], [home-drop-circle], [home-drop-star], [ripple-ring]"
      ),
      { clearProps: "transform,opacity,visibility,will-change" }
    );
    gsap.set($(".home-start"), {
      clearProps: "clip-path,will-change",
    });
  };
}

function homeEndAnimation() {
  if (
    !$(".layout-end").length ||
    !$(".home-end-brackets").length ||
    !$(".home-end-drop-stage").length ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return null;
  }

  gsap.registerPlugin(ScrollTrigger);

  function positionHomeEndDrop() {
    const homeStart = $(".home-start")[0];
    if (!homeStart) return { x: window.innerWidth / 2, y: window.innerHeight * 0.384 };

    const homeStartStyle = window.getComputedStyle(homeStart);
    const homeStartRect = homeStart.getBoundingClientRect();
    const svgScale = Math.max(
      homeStart.offsetWidth / 1440,
      homeStart.offsetHeight / 832
    );
    const svgLeft = (homeStart.offsetWidth - 1440 * svgScale) / 2;
    const svgTop = (homeStart.offsetHeight - 832 * svgScale) / 2;
    const stickyTop = parseFloat(homeStartStyle.top) || 0;
    const dropPosition = {
      x: homeStartRect.left + svgLeft + 720 * svgScale,
      y: stickyTop + svgTop + 319.52 * svgScale,
    };

    gsap.set($(".home-end-drop-stage"), {
      left: dropPosition.x,
      top: dropPosition.y,
    });

    return dropPosition;
  }

  const homeEndDropPosition = positionHomeEndDrop();
  const $layoutEndContent = $(".layout-end")
    .children()
    .not(".home-end-drop-stage");
  const layoutEndRect = $(".layout-end")[0].getBoundingClientRect();
  const bracketsRect = $(".home-end-brackets")[0].getBoundingClientRect();
  const bracketsCenter =
    bracketsRect.top - layoutEndRect.top + bracketsRect.height / 2;
  const dropTravelY = 24;
  const bracketStartGap = 40;
  const contentStartY =
    homeEndDropPosition.y +
    dropTravelY +
    bracketStartGap -
    (window.innerHeight + bracketsCenter);
  const contentEndY =
    homeEndDropPosition.y +
    dropTravelY -
    (window.innerHeight -
      $(".layout-end")[0].offsetHeight +
      bracketsCenter);
  const dropLandingProgress = 1;
  const dropLandingTime = 100;
  const dropApproachTime = 60;

  gsap.set($layoutEndContent, {
    y: contentStartY,
    willChange: "transform",
  });

  gsap.set($(".home-end-drop-stage"), {
    y: 0,
    autoAlpha: 1,
  });

  gsap.set($(".home-end-target-svg"), {
    scale: 1,
    opacity: 1,
    transformOrigin: "center center",
  });

  gsap.set($(".home-end-captured-drop"), {
    attr: { transform: "translate(46.75 20.5) scale(0.22)" },
    opacity: 0,
    transformOrigin: "0 0",
  });

  gsap.set($(".home-end-bracket-shape"), {
    x: 0,
  });

  gsap.set($(".home-end-ripple"), {
    scale: 0.08,
    autoAlpha: 0,
    transformOrigin: "center",
  });

  const homeEndRippleTimeline = gsap.timeline({ paused: true });

  homeEndRippleTimeline.fromTo(
    $(".home-end-ripple"),
    {
      scale: 0.08,
      autoAlpha: 0.42,
    },
    {
      scale: 1,
      autoAlpha: 0,
      duration: 1.6,
      stagger: 0.16,
      ease: "power2.out",
      immediateRender: false,
    }
  );

  let homeEndRippleHasPlayed = false;

  function syncHomeEndRipple(progress) {
    if (progress >= dropLandingProgress && !homeEndRippleHasPlayed) {
      homeEndRippleTimeline.restart();
      homeEndRippleHasPlayed = true;
    }

    if (progress < dropLandingProgress && homeEndRippleHasPlayed) {
      homeEndRippleTimeline.pause(0);
      gsap.set($(".home-end-ripple"), {
        scale: 0.08,
        autoAlpha: 0,
      });
      homeEndRippleHasPlayed = false;
    }
  }

  const homeEndTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: $(".layout-end")[0],
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: positionHomeEndDrop,
      onUpdate: (self) => syncHomeEndRipple(self.progress),
    },
  });

  homeEndTimeline
    .to(
      $layoutEndContent,
      {
        y: contentEndY,
        duration: 100,
        ease: "none",
      },
      0
    )
    .addLabel("dropApproach", dropApproachTime)
    .to(
      $(".home-end-drop-stage"),
      {
        y: dropTravelY,
        duration: 40,
        ease: "power2.inOut",
      },
      "dropApproach"
    )
    .to(
      $(".home-end-target-svg"),
      {
        scale: 0.5,
        duration: 40,
        ease: "power2.inOut",
      },
      "dropApproach"
    )
    .to(
      $(".home-end-bracket-left"),
      {
        x: -8,
        duration: 40,
        ease: "power2.inOut",
      },
      "dropApproach"
    )
    .to(
      $(".home-end-bracket-right"),
      {
        x: 8,
        duration: 40,
        ease: "power2.inOut",
      },
      "dropApproach"
    )
    .addLabel("dropLands", dropLandingTime)
    .set($(".home-end-target-svg"), { opacity: 0 }, "dropLands")
    .set($(".home-end-captured-drop"), { opacity: 1 }, "dropLands");

  const homeEndStageTrigger = ScrollTrigger.create({
    trigger: $(".layout-end")[0],
    start: "top bottom",
    end: "bottom top",
    onEnter: () => gsap.set($(".home-end-drop-stage"), { autoAlpha: 1 }),
    onEnterBack: () =>
      gsap.set($(".home-end-drop-stage"), { autoAlpha: 1 }),
    onLeave: () => gsap.set($(".home-end-drop-stage"), { autoAlpha: 0 }),
    invalidateOnRefresh: true,
  });

  return () => {
    homeEndTimeline.scrollTrigger.kill();
    homeEndStageTrigger.kill();
    homeEndTimeline.kill();
    homeEndRippleTimeline.kill();
    gsap.set($layoutEndContent, {
      clearProps: "transform,will-change",
    });
    gsap.set(
      $(
        ".home-end-drop-stage, .home-end-target-svg, .home-end-captured-drop, .home-end-brackets, .home-end-bracket-shape, .home-end-ripple"
      ),
      {
        clearProps: "left,top,transform,opacity,visibility,will-change",
      }
    );
  };
}

function rippleAnimation() {
  const $rings = $("[ripple-ring]");
  if (!$rings.length || !window.gsap) return null;

  gsap.set($rings, { scale: 0.08, autoAlpha: 0 });

  const rippleTimeline = gsap.timeline({ paused: true });

  rippleTimeline.fromTo(
    $rings,
    {
      scale: 0.08,
      autoAlpha: 0.42,
    },
    {
      scale: 1,
      autoAlpha: 0,
      duration: 1.6,
      stagger: 0.16,
      ease: "power2.out",
      immediateRender: false,
    }
  );

  return rippleTimeline;
}

function navTheme() {
  const $nav = $(".nav-block").first();
  const $sections = $("[nav-light], [nav-dark]");
  if (!$nav.length || !$sections.length || !window.ScrollTrigger) return null;

  gsap.registerPlugin(ScrollTrigger);

  const initialMode = $nav.hasClass("nav-light") ? "nav-light" : "nav-dark";
  const sections = $sections.toArray().map((element) => ({
    element,
    mode: $(element).is("[nav-light]") ? "nav-light" : "nav-dark",
  }));

  function setNavMode(mode) {
    $nav
      .toggleClass("nav-light", mode === "nav-light")
      .toggleClass("nav-dark", mode === "nav-dark");
  }

  function syncNavMode() {
    let mode = initialMode;

    sections.forEach((section) => {
      if (section.element.getBoundingClientRect().top <= 0) {
        mode = section.mode;
      }
    });

    setNavMode(mode);
  }

  const triggers = sections.map((section, index) =>
    ScrollTrigger.create({
      trigger: section.element,
      start: "top top",
      onEnter: () => setNavMode(section.mode),
      onLeaveBack: () =>
        setNavMode(index > 0 ? sections[index - 1].mode : initialMode),
      invalidateOnRefresh: true,
    })
  );

  ScrollTrigger.addEventListener("refresh", syncNavMode);
  syncNavMode();

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    ScrollTrigger.removeEventListener("refresh", syncNavMode);
    setNavMode(initialMode);
  };
}

function lineHover() {
  $("[line-hover-item]").each(function () {
    const $item = $(this);
    const $line = $item.find("[line-hover]").first();

    if (!$line.length) return;

    gsap.set($line, {
      clipPath: $item.hasClass("is-active")
        ? "inset(0% 0% 0% 0%)"
        : "inset(0% 100% 0% 0%)",
    });

    $item
      .off(".lineHover")
      .on("mouseenter.lineHover", function () {
        gsap.killTweensOf($line);

        if ($item.hasClass("is-active")) {
          gsap.set($line, { clipPath: "inset(0% 0% 0% 0%)" });
          return;
        }

        gsap.fromTo(
          $line,
          {
            clipPath: "inset(0% 100% 0% 0%)",
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.3,
            ease: "power3.out",
          }
        );
      })
      .on("mouseleave.lineHover", function () {
        gsap.killTweensOf($line);

        gsap.to($line, {
          clipPath: $item.hasClass("is-active")
            ? "inset(0% 0% 0% 0%)"
            : "inset(0% 0% 0% 100%)",
          duration: 0.3,
          ease: "power3.out",
        });
      });
  });
}

function filterOne() {
  const $tabs = $("[filter-tab]");
  const $reveals = $("[filter-reveal]");
  if (!$tabs.length || !$reveals.length) return null;

  const settings = {
    itemAnimation: {
      hide: {
        duration: 0.2,
        ease: "power1.out",
      },
      reveal: {
        fromX: -100,
        toX: 0,
        duration: 0.4,
        ease: "power1.inOut",
      },
    },
    wordAnimation: {
      reveal: {
        fromX: -100,
        toX: 0,
        duration: 0.3,
        ease: "power1.inOut",
        stagger: 0.02,
        fade: 0.2,
        fadeEase: "power1.in",
      },
    },
    itemStagger: 0.03,
    lineEnterDuration: 0.5,
    heightDuration: 0.5,
  };

  const $lines = $tabs.find("[line-hover]");
  const $revealLines = $reveals.find(".h-line");
  const $revealParent = $reveals.first().parent();
  const $initialTab = $tabs.filter('[filter-tab="all"]').first();
  const $activeTab = $initialTab.length ? $initialTab : $tabs.first();
  let splitInstances = [];
  let filterTimeline = null;

  function normalizeValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function revertHeadings() {
    splitInstances.forEach((instance) => instance.revert());
    splitInstances = [];
  }

  function splitHeadings($items) {
    revertHeadings();
    if (!window.SplitType) return;

    $items.find(".accord-heading").each(function () {
      splitInstances.push(
        new SplitType(this, {
          types: "words",
        })
      );
    });
  }

  function getHeadingTargets(item) {
    const $heading = $(item).find(".accord-heading").first();
    const words = $heading.find(".word").toArray();

    return words.length ? words : $heading.toArray();
  }

  function setActiveTab($nextTab, immediate = false) {
    const $nextLine = $nextTab.find("[line-hover]").first();
    const $otherLines = $tabs.not($nextTab).find("[line-hover]");
    const duration = immediate ? 0 : 0.3;

    $tabs.removeClass("is-active");
    $nextTab.addClass("is-active");

    gsap.killTweensOf($lines);
    gsap.to($otherLines, {
      clipPath: "inset(0% 0% 0% 100%)",
      duration,
      ease: "power3.out",
      overwrite: true,
    });
    gsap.to($nextLine, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function finishFilterAnimation() {
    const activeTimeline = filterTimeline;

    if (activeTimeline) {
      activeTimeline.progress(1);
      activeTimeline.kill();
      filterTimeline = null;
    }

    gsap.killTweensOf($reveals);
    gsap.killTweensOf($revealLines);
    gsap.killTweensOf($revealParent);

    const $visibleReveals = $reveals.filter(function () {
      return $(this).css("display") !== "none";
    });

    gsap.set($visibleReveals, { autoAlpha: 1 });
    gsap.set($visibleReveals.find(".h-line"), {
      clipPath: "inset(0% 0% 0% 0%)",
    });
    gsap.set($revealParent, { clearProps: "height,overflow" });
    revertHeadings();
  }

  function showFilter(value, immediate = false) {
    const filterValue = normalizeValue(value);
    const $itemsToShow =
      filterValue === "all"
        ? $reveals
        : $reveals.filter(function () {
            return normalizeValue($(this).attr("filter-reveal")) === filterValue;
          });

    if (immediate) {
      finishFilterAnimation();
      gsap.set($reveals, {
        display: "block",
        autoAlpha: 1,
      });
      gsap.set($revealLines, {
        clipPath: "inset(0% 0% 0% 0%)",
      });
      return;
    }

    finishFilterAnimation();
    splitHeadings($itemsToShow);

    const $visibleReveals = $reveals.filter(function () {
      return $(this).css("display") !== "none";
    });
    const incomingHeadingTargets = $itemsToShow
      .toArray()
      .flatMap((item) => getHeadingTargets(item));

    gsap.killTweensOf(incomingHeadingTargets);
    gsap.set($visibleReveals, { autoAlpha: 1 });

    filterTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set($itemsToShow, {
          clearProps: "transform,opacity,visibility",
        });
        gsap.set($revealParent, { clearProps: "height,overflow" });
        revertHeadings();
        filterTimeline = null;
      },
    });

    $visibleReveals.each(function () {
      const $item = $(this);

      gsap.set($item, {
        autoAlpha: 1,
        willChange: "opacity",
      });

      filterTimeline.to(
        $item,
        {
          autoAlpha: 0,
          duration: settings.itemAnimation.hide.duration,
          ease: settings.itemAnimation.hide.ease,
        },
        0
      );
    });

    const exitEnd = filterTimeline.duration();

    filterTimeline.addLabel("switch", exitEnd);

    filterTimeline.add(() => {
      const currentHeight = $revealParent.outerHeight();

      gsap.set($revealParent, {
        height: currentHeight,
        overflow: "hidden",
      });
      gsap.set($reveals, { display: "none" });
      gsap.set($itemsToShow, {
        display: "block",
        autoAlpha: 1,
        x: settings.itemAnimation.reveal.fromX,
        willChange: "transform",
      });

      $itemsToShow.each(function () {
        gsap.set(getHeadingTargets(this), {
          x: settings.wordAnimation.reveal.fromX,
          autoAlpha: 0,
          willChange: "transform,opacity",
        });
      });

      gsap.set($itemsToShow.find(".h-line"), {
        clipPath: "inset(0% 100% 0% 0%)",
      });
    }, "switch");

    filterTimeline.to(
      $revealParent,
      {
        height: "auto",
        duration: settings.heightDuration,
        ease: "power2.inOut",
      },
      "switch+=0.001"
    );

    $itemsToShow.each(function (index) {
      const $item = $(this);
      const headingTargets = getHeadingTargets(this);
      const startTime = 0.04 + index * settings.itemStagger;

      filterTimeline.to(
        $item,
        {
          x: settings.itemAnimation.reveal.toX,
          duration: settings.itemAnimation.reveal.duration,
          ease: settings.itemAnimation.reveal.ease,
        },
        `switch+=${startTime}`
      );

      filterTimeline.to(
        $(this).find(".h-line"),
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: settings.lineEnterDuration,
          ease: "power3.out",
        },
        `switch+=${startTime}`
      );

      filterTimeline.to(
        headingTargets,
        {
          x: settings.wordAnimation.reveal.toX,
          duration: settings.wordAnimation.reveal.duration,
          ease: settings.wordAnimation.reveal.ease,
          stagger: {
            each: settings.wordAnimation.reveal.stagger,
            from: "end",
          },
        },
        `switch+=${startTime}`
      );

      filterTimeline.to(
        headingTargets,
        {
          autoAlpha: 1,
          duration:
            settings.wordAnimation.reveal.duration *
            settings.wordAnimation.reveal.fade,
          ease: settings.wordAnimation.reveal.fadeEase,
          stagger: {
            each: settings.wordAnimation.reveal.stagger,
            from: "end",
          },
        },
        `switch+=${startTime}`
      );
    });
  }

  setActiveTab($activeTab, true);
  showFilter("all", true);

  $tabs
    .off("click.filterOne")
    .on("click.filterOne", function () {
      const $nextTab = $(this);
      if ($nextTab.hasClass("is-active")) return;

      setActiveTab($nextTab);
      showFilter($nextTab.attr("filter-tab"));
    });

  return () => {
    finishFilterAnimation();

    $tabs.off("click.filterOne");
    gsap.killTweensOf($lines);
  };
}

function accordionOne() {
  if (window.Flip) {
    gsap.registerPlugin(Flip);
  }

  const cleanups = [];

  $("[accord-wrap]").each(function () {
    const $wrap = $(this);
    const $items = $wrap.find("[accord-item]");
    const $children = $wrap.find("[accord-reveal]");
    if (!$items.length) return;

    const $marker = $items.find(".active-marker").first();
    const $currentItem = $items.filter(".active").first();
    const $initialItem = $currentItem.length ? $currentItem : $items.first();
    let activeValue = $initialItem.attr("accord-item");

    gsap.set($children, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set($children.filter(`[accord-reveal="${activeValue}"]`).first(), {
      autoAlpha: 1,
      pointerEvents: "auto",
    });

    $items
      .off("click.accordionOne")
      .on("click.accordionOne", function () {
        const $activeItem = $(this);
        if ($activeItem.hasClass("active")) return;

        const nextValue = $activeItem.attr("accord-item");
        const $currentChild = $children
          .filter(`[accord-reveal="${activeValue}"]`)
          .first();
        const $nextChild = $children
          .filter(`[accord-reveal="${nextValue}"]`)
          .first();
        const marker = $marker[0];
        let markerState = null;

        if (window.Flip && marker) {
          Flip.killFlipsOf(marker);
          markerState = Flip.getState(marker);
        }

        $items.removeClass("active");
        $activeItem.addClass("active");

        if (marker) {
          $activeItem.append(marker);
        }

        if (markerState) {
          Flip.from(markerState, {
            duration: 0.3,
            ease: "ease.in",
            absolute: true,
          });
        }

        if ($nextChild.length) {
          gsap.killTweensOf([$currentChild[0], $nextChild[0]]);

          gsap.to($currentChild, {
            autoAlpha: 0,
            pointerEvents: "none",
            duration: 0.3,
            ease: "none",
            overwrite: true,
          });

          gsap.to($nextChild, {
            autoAlpha: 1,
            pointerEvents: "auto",
            duration: 0.3,
            ease: "none",
            overwrite: true,
          });

          activeValue = nextValue;
        }
      });

    cleanups.push(() => {
      $items.off("click.accordionOne");
      gsap.killTweensOf($children);

      if (window.Flip && $marker.length) {
        Flip.killFlipsOf($marker[0]);
      }
    });
  });

  if (!cleanups.length) return null;

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function footerEnginePixels() {
  const settings = {
    outsideColor: "#ffffff",
    insideColor: "#000000",
    pixelGap: 9,
    pixelSize: 1.6,
    outsideSpread: 6,
    insideSpread: 0.5,
    lightRadius: 150,
    lightLevels: 10,
    maxPixelScale: 4,
    outsideOpacity: 0.1,
    insideOpacity: 0.3,
    outsideBlur: 0.95,
    scaleFalloff: 0.78,
    cursorSmoothing: 0.18,
    fadeIn: 0.35,
    fadeOut: 0.45,
  };

  const $svg = $(".footer-svg-engine").first();
  if (!$svg.length) return null;

  const svg = $svg[0];
  const viewBox = svg.viewBox.baseVal;
  const svgNamespace = "http://www.w3.org/2000/svg";
  const originalPaths = $svg.children("path").toArray();
  const effectId = `footer-pixels-${Date.now()}`;
  const lightGradients = [];
  const pixelCenters = [];
  const lightPosition = {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2,
  };

  if (!originalPaths.length) return null;

  $svg.children(".footer-pixels-defs, .footer-svg-pixel-layer").remove();

  for (
    let y = viewBox.y + settings.pixelGap / 2;
    y < viewBox.y + viewBox.height;
    y += settings.pixelGap
  ) {
    for (
      let x = viewBox.x + settings.pixelGap / 2;
      x < viewBox.x + viewBox.width;
      x += settings.pixelGap
    ) {
      const point = new DOMPoint(x, y);

      if (originalPaths.some((path) => path.isPointInFill(point))) {
        pixelCenters.push({ x, y });
      }
    }
  }

  function createSvgElement(tag, attributes = {}) {
    const element = document.createElementNS(svgNamespace, tag);

    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });

    return element;
  }

  function createCirclePath(radius) {
    const diameter = radius * 2;

    return pixelCenters
      .map(
        ({ x, y }) =>
          `M ${x - radius} ${y}` +
          `a ${radius} ${radius} 0 1 0 ${diameter} 0` +
          `a ${radius} ${radius} 0 1 0 ${-diameter} 0`
      )
      .join(" ");
  }

  function createPixelPath(path, patternId) {
    const pixelPath = path.cloneNode(false);

    pixelPath.removeAttribute("id");
    pixelPath.setAttribute("fill", `url(#${patternId})`);
    pixelPath.setAttribute("stroke", `url(#${patternId})`);
    pixelPath.setAttribute("stroke-width", settings.insideSpread);
    pixelPath.setAttribute("stroke-linejoin", "round");

    return pixelPath;
  }

  const defs = createSvgElement("defs", {
    class: "footer-pixels-defs",
  });
  const glowFilterId = `${effectId}-glow`;
  const glowFilter = createSvgElement("filter", {
    id: glowFilterId,
    x: "-20%",
    y: "-80%",
    width: "140%",
    height: "260%",
    "color-interpolation-filters": "sRGB",
  });
  const glowBlur = createSvgElement("feGaussianBlur", {
    stdDeviation: settings.outsideBlur,
    result: "blur",
  });
  const glowMerge = createSvgElement("feMerge");

  glowMerge.append(
    createSvgElement("feMergeNode", { in: "blur" }),
    createSvgElement("feMergeNode", { in: "SourceGraphic" })
  );
  glowFilter.append(glowBlur, glowMerge);
  defs.appendChild(glowFilter);

  const pixelLayer = createSvgElement("g", {
    class: "footer-svg-pixel-layer",
    "aria-hidden": "true",
  });
  const outsideLayer = createSvgElement("g", {
    filter: `url(#${glowFilterId})`,
  });
  const insideLayer = createSvgElement("g");

  for (let index = 0; index < settings.lightLevels; index += 1) {
    const level = index / (settings.lightLevels - 1);
    const pixelRadius =
      settings.pixelSize *
      (1 + level * (settings.maxPixelScale - 1));
    const revealRadius =
      settings.lightRadius * (1 - level * settings.scaleFalloff);
    const insidePatternId = `${effectId}-inside-${index}`;
    const gradientId = `${effectId}-gradient-${index}`;
    const maskId = `${effectId}-mask-${index}`;
    const insidePattern = createSvgElement("pattern", {
      id: insidePatternId,
      patternUnits: "userSpaceOnUse",
      width: settings.pixelGap,
      height: settings.pixelGap,
    });

    insidePattern.appendChild(
      createSvgElement("circle", {
        cx: settings.pixelGap / 2,
        cy: settings.pixelGap / 2,
        r: pixelRadius,
        fill: settings.insideColor,
      })
    );

    const gradient = createSvgElement("radialGradient", {
      id: gradientId,
      gradientUnits: "userSpaceOnUse",
      cx: lightPosition.x,
      cy: lightPosition.y,
      r: revealRadius,
    });

    gradient.append(
      createSvgElement("stop", {
        offset: "0%",
        "stop-color": "#ffffff",
      }),
      createSvgElement("stop", {
        offset: "55%",
        "stop-color": "#ffffff",
      }),
      createSvgElement("stop", {
        offset: "100%",
        "stop-color": "#000000",
      })
    );

    const mask = createSvgElement("mask", {
      id: maskId,
      maskUnits: "userSpaceOnUse",
      x: viewBox.x - settings.lightRadius,
      y: viewBox.y - settings.lightRadius,
      width: viewBox.width + settings.lightRadius * 2,
      height: viewBox.height + settings.lightRadius * 2,
      style: "mask-type: luminance;",
    });

    mask.appendChild(
      createSvgElement("rect", {
        x: viewBox.x - settings.lightRadius,
        y: viewBox.y - settings.lightRadius,
        width: viewBox.width + settings.lightRadius * 2,
        height: viewBox.height + settings.lightRadius * 2,
        fill: `url(#${gradientId})`,
      })
    );

    const outsideLevel = createSvgElement("g", {
      mask: `url(#${maskId})`,
      opacity: settings.outsideOpacity,
    });
    const insideLevel = createSvgElement("g", {
      mask: `url(#${maskId})`,
      opacity: settings.insideOpacity,
    });

    outsideLevel.appendChild(
      createSvgElement("path", {
        d: createCirclePath(pixelRadius * settings.outsideSpread),
        fill: settings.outsideColor,
      })
    );

    originalPaths.forEach((path) => {
      insideLevel.appendChild(createPixelPath(path, insidePatternId));
    });

    defs.append(insidePattern, gradient, mask);
    outsideLayer.appendChild(outsideLevel);
    insideLayer.appendChild(insideLevel);
    lightGradients.push(gradient);
  }

  pixelLayer.append(outsideLayer, insideLayer);
  svg.prepend(defs);
  svg.appendChild(pixelLayer);

  function renderLight() {
    lightGradients.forEach((gradient) => {
      gradient.setAttribute("cx", lightPosition.x);
      gradient.setAttribute("cy", lightPosition.y);
    });
  }

  const xTo = gsap.quickTo(lightPosition, "x", {
    duration: settings.cursorSmoothing,
    ease: "power3.out",
    onUpdate: renderLight,
  });

  const yTo = gsap.quickTo(lightPosition, "y", {
    duration: settings.cursorSmoothing,
    ease: "power3.out",
    onUpdate: renderLight,
  });

  function moveLight(event, immediate = false) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const svgPoint = point.matrixTransform(matrix.inverse());

    if (immediate) {
      lightPosition.x = svgPoint.x;
      lightPosition.y = svgPoint.y;
      renderLight();
      return;
    }

    xTo(svgPoint.x);
    yTo(svgPoint.y);
  }

  $svg
    .off(".footerEnginePixels")
    .on("mouseenter.footerEnginePixels", function (event) {
      moveLight(event, true);

      gsap.to(pixelLayer, {
        opacity: 1,
        duration: settings.fadeIn,
        ease: "power2.out",
        overwrite: true,
      });
    })
    .on("mousemove.footerEnginePixels", moveLight)
    .on("mouseleave.footerEnginePixels", function () {
      gsap.to(pixelLayer, {
        opacity: 0,
        duration: settings.fadeOut,
        ease: "power2.out",
        overwrite: true,
      });
    });

  return () => {
    $svg.off(".footerEnginePixels");
    xTo.tween.kill();
    yTo.tween.kill();
    gsap.killTweensOf(pixelLayer);
    pixelLayer.remove();
    defs.remove();
  };
}

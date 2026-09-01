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
    const footerEnginePixelsCleanup = footerEnginePixels();

    return () => {
      if (homeAnimationCleanup) homeAnimationCleanup();
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

  const $homeEndContent = $(".layout-end")
    .children()
    .not(".home-end-brackets")
    .add($(".layout-end .home-end-brackets-svg"));

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
      "[home-resting], [home-start-up], [home-second-up], [home-third-up], [home-logo-up]"
    ),
    {
      y: "10rem",
      opacity: 0,
      willChange: "transform, opacity",
    }
  );

  const $homeResting = $("[home-resting]");
  const $homeRestingDragSurface = $(".home-start");
  const homeRestingView = { progress: 0 };
  const homeRestingCenterShift = { x: 0, y: 0 };
  const homeRestingBaseY =
    parseFloat(getComputedStyle(document.documentElement).fontSize) * 2;
  const homeRestingRadiusScale = 0.9;
  const homeRestingMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const homeRestingMatrixTemp = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const homeRestingRotationMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const homeRestingSmooth = { x: 0, y: 0 };
  let homeRestingPreviousX = 0;
  let homeRestingPreviousY = 0;
  let homeRestingSphere = [];

  function buildHomeRestingSphere() {
    const restingItems = $homeResting.toArray().map((element, index) => {
      const isFront = $(element).closest(".perspective-opacity-1").length;
      const isBack = $(element).closest(".perspective-opacity-3").length;

      const transformX = Number(gsap.getProperty(element, "x", "px")) || 0;
      const transformY = Number(gsap.getProperty(element, "y", "px")) || 0;
      const bounds = element.getBoundingClientRect();

      return {
        element,
        card: $(element).find(".perspective-card")[0],
        x: bounds.left - transformX + bounds.width / 2,
        y: bounds.top - transformY + bounds.height / 2,
        depth: isFront ? 1 : isBack ? -1 : index % 2 === 0 ? 0.35 : -0.35,
        opacity: isFront ? 1 : isBack ? 0.1 : 0.3,
      };
    });

    if (!restingItems.length) return;

    const centerX =
      restingItems.reduce((total, item) => total + item.x, 0) /
      restingItems.length;
    const centerY =
      restingItems.reduce((total, item) => total + item.y, 0) /
      restingItems.length;
    const radius = Math.max(
      ...restingItems.map((item) =>
        Math.hypot(item.x - centerX, item.y - centerY)
      )
    );

    homeRestingCenterShift.x = window.innerWidth / 2 - centerX;
    homeRestingCenterShift.y = window.innerHeight / 2 - centerY;

    homeRestingSphere = restingItems.map((item) => {
      const screenX = item.x - centerX;
      const screenY = item.y - centerY;
      const z =
        Math.sqrt(
          Math.max(
            radius * radius - screenX * screenX - screenY * screenY,
            0
          )
        ) *
        item.depth;

      return {
        ...item,
        x: screenX,
        y: -screenY,
        screenX,
        screenY,
        z,
        radius,
      };
    });
  }

  function premultiplyHomeRestingMatrix(left) {
    for (let row = 0; row < 3; row += 1) {
      const a = left[row * 3];
      const b = left[row * 3 + 1];
      const c = left[row * 3 + 2];

      for (let column = 0; column < 3; column += 1) {
        homeRestingMatrixTemp[row * 3 + column] =
          a * homeRestingMatrix[column] +
          b * homeRestingMatrix[3 + column] +
          c * homeRestingMatrix[6 + column];
      }
    }

    for (let index = 0; index < 9; index += 1) {
      homeRestingMatrix[index] = homeRestingMatrixTemp[index];
    }
  }

  function renderHomeRestingSphere() {
    const viewScale = gsap.utils.interpolate(
      1,
      0.78,
      homeRestingView.progress
    );
    const viewX = homeRestingCenterShift.x * homeRestingView.progress;
    const viewY = homeRestingCenterShift.y * homeRestingView.progress;

    homeRestingSphere.forEach((item) => {
      const x =
        homeRestingMatrix[0] * item.x +
        homeRestingMatrix[1] * item.y +
        homeRestingMatrix[2] * item.z;
      const y =
        homeRestingMatrix[3] * item.x +
        homeRestingMatrix[4] * item.y +
        homeRestingMatrix[5] * item.z;
      const depth =
        homeRestingMatrix[6] * item.x +
        homeRestingMatrix[7] * item.y +
        homeRestingMatrix[8] * item.z;
      const scale =
        gsap.utils.clamp(
          0.82,
          1.16,
          1 + ((depth - item.z) / item.radius) * 0.16
        ) * viewScale;
      const opacity = gsap.utils.clamp(
        0.08,
        1,
        item.opacity + ((depth - item.z) / (item.radius * 2)) * 0.9
      );

      $(item.element).css("z-index", Math.round(depth + item.radius));

      gsap.set(item.card, {
        x:
          x * homeRestingRadiusScale * viewScale +
          viewX -
          item.screenX,
        y:
          -y * homeRestingRadiusScale * viewScale +
          homeRestingBaseY +
          viewY -
          item.screenY,
        scale,
        opacity,
        force3D: true,
        transformOrigin: "center center",
      });
    });
  }

  function updateHomeRestingSphere() {
    const rotationY =
      ((homeRestingSmooth.y - homeRestingPreviousY) * Math.PI) / 180;
    const rotationX =
      ((homeRestingSmooth.x - homeRestingPreviousX) * Math.PI) / 180;

    homeRestingPreviousY = homeRestingSmooth.y;
    homeRestingPreviousX = homeRestingSmooth.x;

    if (rotationX !== 0 || rotationY !== 0) {
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      homeRestingRotationMatrix[0] = cosY;
      homeRestingRotationMatrix[1] = 0;
      homeRestingRotationMatrix[2] = sinY;
      homeRestingRotationMatrix[3] = sinX * sinY;
      homeRestingRotationMatrix[4] = cosX;
      homeRestingRotationMatrix[5] = -sinX * cosY;
      homeRestingRotationMatrix[6] = -cosX * sinY;
      homeRestingRotationMatrix[7] = sinX;
      homeRestingRotationMatrix[8] = cosX * cosY;

      premultiplyHomeRestingMatrix(homeRestingRotationMatrix);
    }

    renderHomeRestingSphere();
  }

  const homeRestingQuickY = gsap.quickTo(homeRestingSmooth, "y", {
    duration: 1,
    ease: "power2",
    onUpdate: updateHomeRestingSphere,
  });
  const homeRestingQuickX = gsap.quickTo(homeRestingSmooth, "x", {
    duration: 1,
    ease: "power2",
    onUpdate: updateHomeRestingSphere,
  });

  gsap.set(
    $(".perspective-opacity-1, .perspective-opacity-2, .perspective-opacity-3"),
    {
      opacity: 1,
      zIndex: "auto",
    }
  );

  buildHomeRestingSphere();
  renderHomeRestingSphere();

  const gradientOrbit = { angle: 0 };
  const homeClip = { progress: 0 };
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

  function homeClipPath(progress) {
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
    const center = point(centerX, centerY);
    const angle = Math.PI * Math.min(Math.max(progress, 0), 1);

    const rayPoint = (rayAngle) => {
      const x = Math.cos(rayAngle);
      const y = Math.sin(rayAngle);
      const distance = half / Math.max(Math.abs(x), Math.abs(y));

      return point(centerX + x * distance, centerY + y * distance);
    };

    const upper = rayPoint(-angle);
    const lower = rayPoint(angle);
    const topLeft = point(left, top);
    const topRight = point(right, top);
    const bottomLeft = point(left, bottom);
    const bottomRight = point(right, bottom);
    let path;

    if (progress <= 0.25) {
      path = [
        center,
        upper,
        topRight,
        topLeft,
        bottomLeft,
        bottomRight,
        lower,
        center,
      ];
    } else if (progress <= 0.75) {
      path = [
        center,
        upper,
        upper,
        topLeft,
        bottomLeft,
        lower,
        lower,
        center,
      ];
    } else {
      path = [
        center,
        upper,
        upper,
        upper,
        lower,
        lower,
        lower,
        center,
      ];
    }

    return `polygon(${path.join(", ")})`;
  }

  function moveGradientDots() {
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
    scale: 1,
    svgOrigin: "720 416",
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
    x: -20,
    y: -20,
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

  gsap.set($(".home-end-target-svg"), {
    scale: 1,
    opacity: 1,
    transformOrigin: "center center",
  });

  gsap.set($(".home-end-drop-stage"), {
    y: "-8rem",
    willChange: "transform",
  });

  gsap.set($(".home-end-brackets-svg"), {
    overflow: "hidden",
  });

  gsap.set($(".home-end-bracket-left"), {
    x: -72,
  });

  gsap.set($(".home-end-bracket-right"), {
    x: 72,
  });

  gsap.set($homeEndContent, {
    opacity: 0,
    willChange: "opacity",
  });

  gsap.set($(".home-end-ripple"), {
    scale: 0.08,
    autoAlpha: 0,
    transformOrigin: "center",
  });

  const homeRippleTimeline = rippleAnimation();
  const homeEndRippleTimeline = rippleAnimation($(".home-end-ripple"), {
    endScale: 1.25,
    startOpacity: 0.62,
    duration: 0.95,
    stagger: 0.09,
  });
  let rippleHasPlayed = false;
  let homeEndRippleHasPlayed = false;
  let homeEndRippleHasFinished = true;
  let homeFinishState = "scrub";
  let homeFinishScrollLocked = false;

  let homeRestingIsDragging = false;
  let homeRestingPointerId = null;
  let homeRestingLastPointerX = 0;
  let homeRestingLastPointerY = 0;
  let homeRestingInputX = 0;
  let homeRestingInputY = 0;
  let homeRestingUserSelect = "";

  function rotateHomeRestingSphere(time, deltaTime) {
    if (homeRestingIsDragging) return;

    const rotation =
      (deltaTime / 1000) * (360 / 8 / Math.SQRT2);

    homeRestingInputX += rotation;
    homeRestingInputY += rotation;
    homeRestingQuickY(homeRestingInputX);
    homeRestingQuickX(homeRestingInputY);
  }

  function canDragHomeResting() {
    return (
      homeLoadTimeline.progress() >= 0.999 &&
      homeFinishState === "scrub" &&
      homeScrollTrigger.progress <= 0.002
    );
  }

  function startHomeRestingDrag(event) {
    if (
      event.button !== 0 ||
      $(event.target).closest("a, button, input, textarea, select").length ||
      !canDragHomeResting()
    ) {
      return;
    }

    homeRestingIsDragging = true;
    homeRestingPointerId = event.pointerId;
    homeRestingLastPointerX = event.clientX;
    homeRestingLastPointerY = event.clientY;

    homeRestingUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    $homeRestingDragSurface.css("cursor", "grabbing");
    event.preventDefault();
  }

  function moveHomeRestingDrag(event) {
    if (
      !homeRestingIsDragging ||
      event.pointerId !== homeRestingPointerId
    ) {
      return;
    }

    const deltaX = event.clientX - homeRestingLastPointerX;
    const deltaY = event.clientY - homeRestingLastPointerY;

    homeRestingLastPointerX = event.clientX;
    homeRestingLastPointerY = event.clientY;
    homeRestingInputX += deltaX / 4;
    homeRestingInputY += deltaY / 4;
    homeRestingQuickY(homeRestingInputX);
    homeRestingQuickX(homeRestingInputY);
    event.preventDefault();
  }

  function endHomeRestingDrag() {
    if (!homeRestingIsDragging) return;

    homeRestingIsDragging = false;
    homeRestingPointerId = null;
    document.body.style.userSelect = homeRestingUserSelect;
    $homeRestingDragSurface.css("cursor", "grab");
  }

  gsap.ticker.add(rotateHomeRestingSphere);

  const homeLoadTimeline = gsap.timeline({
    onComplete: () => {
      if (!homeLoadScrollLocked || !window.lenis) return;

      window.lenis.start();
      homeLoadScrollLocked = false;
    },
  });

  // Page load
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

  const homeScrubTimeline = gsap.timeline({ paused: true });

  // Scrub: content scenes
  homeScrubTimeline
    // Sphere scales down and moves to the centre
    .to(
      homeRestingView,
      {
        progress: 1,
        duration: 0.2,
        ease: "power1.inOut",
        onUpdate: renderHomeRestingSphere,
      },
      0
    )
    // First scene leaves
    .to(
      $("[home-start-up]").not("[home-resting]"),
      {
        y: "-20rem",
        duration: 0.267,
        ease: "power2.inOut",
        stagger: {
          amount: 0.067,
          from: "end",
        },
      },
      0
    )
    .to(
      $("[home-start-up]").not("[home-resting]"),
      {
        opacity: 0,
        duration: 0.133,
        ease: "power1.in",
        stagger: {
          amount: 0.067,
          from: "end",
        },
      },
      0
    )
    // Logo enters between first and second scenes
    .to(
      $("[home-logo-up]"),
      {
        y: 0,
        duration: 0.15,
        ease: "power1.in",
      },
      0.05
    )
    .to(
      $("[home-logo-up]"),
      {
        opacity: 1,
        duration: 0.17,
        ease: "power1.out",
      },
      0.05
    )
    // Second scene enters
    .to(
      $("[home-second-up]"),
      {
        y: 0,
        duration: 0.083,
        ease: "power1.in",
      },
      0.4
    )
    .to(
      $("[home-second-up]"),
      {
        opacity: 1,
        duration: 0.067,
        ease: "power1.out",
      },
      0.4
    )
    // Second scene holds
    .to(
      $("[home-second-up]"),
      {
        y: 0,
        duration: 0.167,
        ease: "none",
      },
      0.484
    )
    // Logo holds with second scene
    // .to(
    //   $("[home-logo-up]"),
    //   {
    //     y: 0,
    //     duration: 0.25,
    //     ease: "none",
    //   },
    //   0.1
    // )
    // Second scene leaves
    .to(
      $("[home-second-up]"),
      {
        y: "-20rem",
        duration: 0.083,
        ease: "power1.in",
      },
      0.567
    )
    .to(
      $("[home-second-up]"),
      {
        opacity: 0,
        duration: 0.067,
        ease: "power1.out",
      },
      0.567
    )
    // Logo leaves as second scene enters
    .to(
      $("[home-logo-up]"),
      {
        y: "-10rem",
        duration: 0.09,
        ease: "power1.in",
      },
      0.3
    )
    // Resting cards leave with the logos
    .to(
      $homeResting,
      {
        y: "-10rem",
        duration: 0.09,
        ease: "power1.in",
      },
      0.3
    )
    .to(
      $homeResting,
      {
        opacity: 0,
        duration: 0.07,
        ease: "power1.out",
      },
      0.3
    )
    .to(
      $("[home-logo-up]"),
      {
        opacity: 0,
        duration: 0.07,
        ease: "power1.out",
      },
      0.3
    )
    // Third scene enters
    .to(
      $("[home-third-up]"),
      {
        y: 0,
        duration: 0.083,
        ease: "power2.out",
      },
      0.667
    )
    .to(
      $("[home-third-up]"),
      {
        opacity: 1,
        duration: 0.067,
        ease: "power1.out",
      },
      0.667
    )
    // Third scene holds
    .to(
      $("[home-third-up]"),
      {
        y: 0,
        duration: 0.25,
        ease: "none",
      },
      0.75
    );

  // Scrub: gradient
  homeScrubTimeline
    // Bottom gradient becomes the dot circle
    .to(
      $('[home-gradient-piece="1"]'),
      {
        attr: { cx: 720, cy: -104, rx: 160, ry: 160 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="2"]'),
      {
        attr: { cx: 1088, cy: 48, rx: 145, ry: 145 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="3"]'),
      {
        attr: { cx: 1240, cy: 416, rx: 155, ry: 155 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="4"]'),
      {
        attr: { cx: 1088, cy: 784, rx: 140, ry: 140 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="5"]'),
      {
        attr: { cx: 720, cy: 936, rx: 165, ry: 165 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="6"]'),
      {
        attr: { cx: 352, cy: 784, rx: 145, ry: 145 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="7"]'),
      {
        attr: { cx: 200, cy: 416, rx: 155, ry: 155 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    .to(
      $('[home-gradient-piece="8"]'),
      {
        attr: { cx: 352, cy: 48, rx: 140, ry: 140 },
        opacity: 0.82,
        duration: 0.333,
        ease: "power2.inOut",
      },
      0.111
    )
    // Dot circle spins and shrinks
    .to(
      gradientOrbit,
      {
        angle: Math.PI / 2,
        duration: 0.089,
        ease: "none",
        onUpdate: moveGradientDots,
      },
      0.444
    )
    .to(
      $("[home-gradient-orbit]"),
      {
        scale: 0.82,
        duration: 0.044,
        ease: "power1.inOut",
      },
      0.444
    )
    // Small dot circle moves up
    .to(
      $("[home-gradient-orbit]"),
      {
        y: -620,
        duration: 0.111,
        ease: "power2.inOut",
      },
      0.533
    )
    // All circles merge into the centre drop
    .to(
      $("[home-gradient-piece]"),
      {
        attr: { cx: 720, cy: 800 },
        duration: 0.111,
        ease: "power2.inOut",
      },
      0.533
    )
    .to(
      $("[home-gradient-piece]"),
      {
        opacity: 0,
        duration: 0.111,
        ease: "power1.in",
      },
      0.589
    )
    // Centre circle becomes the drop
    .to(
      $('[home-gradient-drop="2"]'),
      {
        opacity: 1,
        duration: 0.078,
        ease: "power1.out",
      },
      0.589
    )
    .to(
      $("[home-gradient-drop]"),
      {
        attr: { transform: "translate(640 59) scale(0.72)" },
        duration: 0.222,
        ease: "power2.out",
      },
      0.589
    )
    .to(
      $("[home-gradient-drop-blur], [home-final-drop-blur]"),
      {
        attr: { stdDeviation: 22 },
        duration: 0.222,
        ease: "power1.inOut",
      },
      0.589
    )
    .to(
      $("[home-gradient-drops]"),
      {
        y: 150,
        duration: 0.222,
        ease: "power1.inOut",
      },
      0.589
    )
    // Drop lands, ripple plays and line draws
    .to(
      $("[home-gradient-line]"),
      {
        attr: { "stroke-dashoffset": 780 },
        opacity: 1,
        duration: 0.189,
        ease: "power2.inOut",
      },
      0.811
    )
    // Masked drop fills as the line reaches it
    .to(
      $("[home-drop-purple-base], [home-drop-colors]"),
      {
        opacity: 1,
        duration: 0.08,
        ease: "power1.in",
      },
      0.9
    )
    .to(
      $("[home-final-drop-blur]"),
      {
        attr: { stdDeviation: 16 },
        duration: 0.08,
        ease: "power1.in",
      },
      0.92
    )
    .to(
      $("[home-drop-circle]"),
      {
        x: 0,
        duration: 0.085,
        ease: "power1.in",
        stagger: 0.005,
      },
      0.9
    )
    .to(
      $("[home-drop-circle]"),
      {
        opacity: 1,
        duration: 0.08,
        ease: "power1.inOut",
        stagger: 0.005,
      },
      0.9
    );

  const homeFinishDuration = 2.5;
  const homeFinishTimeline = gsap.timeline({ paused: true });

  // Auto play starts when scrub reaches 100%
  homeFinishTimeline
    // Star grows
    .to(
      $("[home-drop-star]"),
      {
        opacity: 1,
        scale: 2.5,
        duration: 0.08,
        ease: "power2.out",
      },
      0
    )
    // Star rotates
    .to(
      $("[home-drop-star]"),
      {
        rotation: 360,
        duration: 0.88,
        ease: "none",
      },
      0
    )
    // Star scales down
    .to(
      $("[home-drop-star]"),
      {
        scale: 2.15,
        duration: 0.06,
        ease: "power2.inOut",
      },
      0.26
    )
    // Clip rotates open: 0%-36%
    .set(
      $(".home-start"),
      {
        clipPath: () => homeClipPath(0),
      },
      0
    )
    // Screen clip rotates open
    .to(
      homeClip,
      {
        progress: 1,
        duration: 0.36,
        ease: "none",
        onUpdate: () => {
          $(".home-start").css(
            "clip-path",
            homeClipPath(homeClip.progress)
          );
        },
      },
      0
    )
    // End content fades in
    .to(
      $homeEndContent,
      {
        opacity: 1,
        duration: 0.16,
        ease: "power1.in",
      },
      0.46
    )
    // Drop falls into the brackets
    .to(
      $(".home-end-drop-stage"),
      {
        y: 0,
        duration: 0.388,
        ease: "power1.in",
      },
      0.1
    )
    // Drop scales down
    .to(
      $(".home-end-target-svg"),
      {
        scale: 0.5,
        duration: 0.388,
        ease: "power1.in",
      },
      0.1
    )
    // Left bracket closes
    .to(
      $(".home-end-bracket-left"),
      {
        x: 0,
        duration: 0.388,
        ease: "power1.in",
      },
      0.18
    )
    // Right bracket closes
    .to(
      $(".home-end-bracket-right"),
      {
        x: 0,
        duration: 0.388,
        ease: "power1.in",
      },
      0.18
    )
    // Short pause before scrolling unlocks
    .to(
      {},
      {
        duration: 0.052,
        ease: "none",
      },
      0.848
    );

  function syncRippleTimeline() {
    const dropHasLanded = homeScrubTimeline.progress() >= 0.811;
    const endDropHasSettled = homeFinishTimeline.progress() >= 0.3;

    if (dropHasLanded && !rippleHasPlayed) {
      if (homeRippleTimeline) homeRippleTimeline.restart();
      rippleHasPlayed = true;
    }

    if (!dropHasLanded && rippleHasPlayed) {
      if (homeRippleTimeline) homeRippleTimeline.pause(0);
      gsap.set($("[ripple-ring]"), { scale: 0.08, autoAlpha: 0 });
      rippleHasPlayed = false;
    }

    if (endDropHasSettled && !homeEndRippleHasPlayed) {
      if (homeEndRippleTimeline) {
        homeEndRippleHasFinished = false;
        homeEndRippleTimeline.restart();
      }
      homeEndRippleHasPlayed = true;
    }

    if (!endDropHasSettled && homeEndRippleHasPlayed) {
      if (homeEndRippleTimeline) homeEndRippleTimeline.pause(0);
      gsap.set($(".home-end-ripple"), { scale: 0.08, autoAlpha: 0 });
      homeEndRippleHasPlayed = false;
      homeEndRippleHasFinished = true;
    }
  }

  function releaseHomeFinishScroll() {
    if (homeFinishScrollLocked && window.lenis) {
      window.lenis.start();
    }

    homeFinishScrollLocked = false;
  }

  function lockHomeFinishScroll() {
    if (!homeFinishScrollLocked && window.lenis) {
      window.lenis.stop();
      homeFinishScrollLocked = true;
    }
  }

  function completeHomeFinish() {
    if (
      homeFinishState !== "playing" ||
      homeFinishTimeline.progress() < 1 ||
      !homeEndRippleHasFinished
    ) {
      return;
    }

    homeFinishState = "complete";
    releaseHomeFinishScroll();
  }

  function playHomeFinish() {
    if (homeFinishState !== "scrub") return;

    homeFinishState = "playing";
    homeClip.progress = 0;
    lockHomeFinishScroll();

    homeFinishTimeline.pause();
    homeFinishTimeline.progress(0, true);
    homeFinishTimeline.timeScale(1 / homeFinishDuration).play();
  }

  function reverseHomeFinish() {
    if (homeFinishState !== "complete") return;

    homeFinishState = "reversing";
    lockHomeFinishScroll();
    homeFinishTimeline.timeScale(1 / homeFinishDuration).reverse();
  }

  homeFinishTimeline.eventCallback("onUpdate", () => {
    syncRippleTimeline();

    if (
      homeFinishState === "reversing" &&
      homeFinishTimeline.progress() <= 0
    ) {
      homeFinishTimeline.pause(0);
      homeFinishTimeline.timeScale(1);
      homeClip.progress = 0;
      $(".home-start").css("clip-path", "none");
      homeFinishState = "scrub";
      syncRippleTimeline();
      releaseHomeFinishScroll();
    }
  });

  homeFinishTimeline.eventCallback("onComplete", () => {
    completeHomeFinish();
  });

  if (homeEndRippleTimeline) {
    homeEndRippleTimeline.eventCallback("onComplete", () => {
      homeEndRippleHasFinished = true;
      completeHomeFinish();
    });
  }

  const homeScrollTrigger = ScrollTrigger.create({
    trigger: $(".layout-start")[0],
    start: "top top",
    end: "bottom bottom+=12",
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (homeFinishState !== "scrub") return;

      if (self.progress > 0.002 && homeRestingIsDragging) {
        endHomeRestingDrag();
      }

      homeScrubTimeline.progress(self.progress);
      syncRippleTimeline();

      if (self.progress >= 1) {
        playHomeFinish();
      }
    },
    onLeave: () => {
      playHomeFinish();
    },
    onEnterBack: () => {
      reverseHomeFinish();
    },
    onLeaveBack: () => {
      if (homeFinishState !== "scrub") return;

      homeScrubTimeline.progress(0);
      syncRippleTimeline();
    },
  });

  homeScrubTimeline.progress(homeScrollTrigger.progress);
  syncRippleTimeline();

  $homeRestingDragSurface.css("cursor", "grab");
  $homeRestingDragSurface.on(
    "pointerdown.homeRestingDrag",
    startHomeRestingDrag
  );
  $(document)
    .on("pointermove.homeRestingDrag", moveHomeRestingDrag)
    .on("pointerup.homeRestingDrag pointercancel.homeRestingDrag", (event) => {
      if (event.pointerId !== homeRestingPointerId) return;
      endHomeRestingDrag();
    });

  return () => {
    if ((homeLoadScrollLocked || homeFinishScrollLocked) && window.lenis) {
      window.lenis.start();
      homeLoadScrollLocked = false;
      homeFinishScrollLocked = false;
    }

    homeScrollTrigger.kill();
    homeLoadTimeline.kill();
    homeScrubTimeline.kill();
    homeFinishTimeline.kill();
    if (homeRippleTimeline) homeRippleTimeline.kill();
    if (homeEndRippleTimeline) homeEndRippleTimeline.kill();
    gsap.ticker.remove(rotateHomeRestingSphere);
    homeRestingQuickX.tween.kill();
    homeRestingQuickY.tween.kill();
    $homeRestingDragSurface.css("cursor", "");
    $homeRestingDragSurface.off(".homeRestingDrag");
    $(document).off(".homeRestingDrag");
    document.body.style.userSelect = homeRestingUserSelect;
    gsap.set(
      $(
        "[home-resting], [home-start-up], [home-second-up], [home-third-up], [home-logo-up]"
      ),
      { clearProps: "transform,opacity,will-change" }
    );
    gsap.set($homeResting.find(".perspective-card"), {
      clearProps: "transform,opacity,will-change",
    });
    gsap.set(
      $(".perspective-opacity-1, .perspective-opacity-2, .perspective-opacity-3"),
      {
        clearProps: "opacity,z-index",
      }
    );
    $homeResting.css({
      zIndex: "",
    });
    gsap.set(
      $(
        "[home-gradient-orbit], [home-gradient-piece], [home-gradient-drops], [home-gradient-drop], [home-gradient-line], [home-drop-purple-base], [home-drop-colors], [home-drop-circle], [home-drop-star], [ripple-ring]"
      ),
      { clearProps: "transform,opacity,visibility,will-change" }
    );
    gsap.set($(".home-start"), {
      clearProps: "clip-path,will-change",
    });
    gsap.set($homeEndContent, {
      clearProps: "opacity,will-change",
    });
    gsap.set($(".home-end-brackets-svg"), {
      clearProps: "overflow",
    });
    gsap.set(
      $(
        ".home-end-drop-stage, .home-end-target-svg, .home-end-bracket-left, .home-end-bracket-right, .home-end-ripple"
      ),
      {
        clearProps: "transform,opacity,visibility,will-change",
      }
    );
  };
}

function rippleAnimation(
  $rings = $("[ripple-ring]"),
  {
    endScale = 1,
    startOpacity = 0.42,
    duration = 1.6,
    stagger = 0.16,
  } = {}
) {
  if (!$rings.length || !window.gsap) return null;

  gsap.set($rings, { scale: 0.08, autoAlpha: 0 });

  const rippleTimeline = gsap.timeline({ paused: true });

  rippleTimeline.fromTo(
    $rings,
    {
      scale: 0.08,
      autoAlpha: startOpacity,
    },
    {
      scale: endScale,
      autoAlpha: 0,
      duration,
      stagger,
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

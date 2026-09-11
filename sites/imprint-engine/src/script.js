function isWebflowEditor() {
  return Boolean(window.Webflow && window.Webflow.env && window.Webflow.env("editor"));
}

function initLenis() {
  if (!window.Lenis || isWebflowEditor()) return null;

  // SCROLL CONTROLS — one clock shared with GSAP, cleaned up on reinitialization.
  const scrollControls = {
    lerp: 0.1,
    wheelMultiplier: 0.7,
    gestureOrientation: "vertical",
    normalizeWheel: false,
    smoothTouch: false,
  };
  const lenis = new Lenis(scrollControls);
  window.lenis = lenis;
  const $prevent = $("[data-lenis-prevent]");
  $prevent.on("wheel.siteLenis touchmove.siteLenis", (event) => event.stopPropagation());
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);

  let frame = null;
  const tick = (seconds) => lenis.raf(seconds * 1000);
  function fallbackTick(time) { lenis.raf(time); frame = requestAnimationFrame(fallbackTick); }
  if (window.gsap) {
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  } else frame = requestAnimationFrame(fallbackTick);

  return () => {
    if (window.gsap) gsap.ticker.remove(tick);
    if (frame !== null) cancelAnimationFrame(frame);
    if (window.ScrollTrigger) lenis.off("scroll", ScrollTrigger.update);
    $prevent.off(".siteLenis");
    lenis.destroy();
    if (window.lenis === lenis) window.lenis = null;
  };
}

const onDesktop = (fn) => gsap.matchMedia().add("(min-width: 992px)", fn);
const onMobile = (fn) => gsap.matchMedia().add("(max-width: 991px)", fn);

function initSite() {
  if (isWebflowEditor()) return null;
  if (initSite.cleanup) initSite.cleanup();
  const cleanups = [initLenis(), navTheme(), accordionOne(), filterOne(),
    catalogueAnimation(), dropTextAnimation(), flexGrowAnimation()];

  if (window.gsap) {
    const desktop = onDesktop(() => {
      const lineCleanup = lineHover();
      const homeCleanup = homeAnimation();
      const footerCleanup = footerEnginePixels();
      return () => [footerCleanup, homeCleanup, lineCleanup].forEach((cleanup) => cleanup && cleanup());
    });
    cleanups.push(() => desktop.revert());
  }
  let destroyed = false;
  initSite.cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    cleanups.slice().reverse().forEach((cleanup) => cleanup && cleanup());
    initSite.cleanup = null;
  };
  return initSite.cleanup;
}

$(initSite);

function homeAnimation() {
  if (
    !$("[lander-wrap]").length ||
    !$("[layout-start]").length ||
    !$("[home-start]").length ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return null;
  }

  gsap.registerPlugin(ScrollTrigger);

  // HOME SCROLL CONTROLS
  // 1 = the full section scroll. A duration of 0.2 always uses 20% of it.
  // Each group has a start on the main timeline; its steps use local positions.
  // start: 0          starts at the beginning of the group.
  // start: "move"     starts with the step named move.
  // start: "move:end" starts after move, including its stagger.
  // start: "move:end+=0.02" adds a delay of 2% of the FULL scroll.
  // "<", ">", and ">+=0.02" also work relative to the previous step.
  // Across groups, use "group.step:end" or "group:end".
  const homeMotion = {
    // 01 — Copy leaves early; the card sphere drifts behind the opening scenes.
    firstScene: {
      start: 0,
      sphere: { start: 0, duration: 0.3, ease: "none" },
      move: { start: 0, duration: 0.11, ease: "power1.in", y: "-20rem", stagger: { amount: 0.02, from: "end" } },
      fade: { start: "move", duration: 0.07, ease: "power1.in", stagger: { amount: 0.02, from: "end" } },
    },
    // 02 — Cards fade gently; the logos follow the first scene's exit.
    cards: {
      start: 0.24,
      move: { start: 0, duration: 0.09, ease: "power1.in", y: "-6rem" },
      fade: { start: "move", duration: 0.09, ease: "power1.inOut" },
    },
    logos: {
      start: "firstScene.move:end",
      move: { start: 0, duration: 0.06, ease: "power1.in", y: "-10rem" },
      fade: { start: "move", duration: 0.06, ease: "power1.in" },
    },
    // 03 — Second scene: enter → hold → leave.
    secondScene: {
      start: "firstScene.move:end",
      enter: { start: 0, duration: 0.065, ease: "power1.in" },
      reveal: { start: "enter", duration: 0.05, ease: "power1.in" },
      leave: { start: "enter:end+=0.045", duration: 0.065, ease: "power1.in", y: "-20rem" },
      hide: { start: "leave", duration: 0.05, ease: "power1.in" },
    },
    // 04 — Third scene enters and holds naturally until the screen opens.
    thirdScene: {
      start: "secondScene.leave:end",
      enter: { start: 0, duration: 0.065, ease: "power1.in" },
      reveal: { start: "enter", duration: 0.05, ease: "power1.in" },
    },
    // 05 — Bottom gradient → ring → rotation → upward merge.
    gradientDots: {
      start: 0.02,
      form: { start: 0, duration: 0.16, ease: "power1.in" },
      spin: { start: "form:end", duration: 0.045, ease: "none", angle: Math.PI / 2 },
      shrink: { start: "spin", duration: 0.025, ease: "power1.in", scale: 0.82 },
      rise: { start: "spin:end", duration: 0.055, ease: "power1.in", y: -620 },
      merge: { start: "rise", duration: 0.055, ease: "power1.in" },
      fade: { start: "merge+=0.025", duration: 0.06, ease: "power1.in" },
    },
    // 06 — Centre drop appears, forms, lands, then resizes in place.
    drop: {
      start: "gradientDots.fade",
      appear: { start: 0, duration: 0.035, ease: "power1.in" },
      merge: { start: 0, duration: 0.1, ease: "power1.in" },
      soften: { start: "merge", duration: 0.1, ease: "power1.in", blur: 22 },
      land: { start: "merge", duration: 0.1, ease: "power1.in", y: 150 },
      resize: { start: "land:end+=0.01", duration: 0.045, ease: "power1.in", widthEm: 6.5 },
    },
    // 07 — Landing ripple: expand and fade, entirely controlled by scroll.
    landingRipple: {
      start: "drop.land:end",
      expand: { start: 0, duration: 0.15, ease: "power1.in", stagger: 0.018, scale: 1 },
      reveal: { start: "expand", duration: 0.008, ease: "power1.in", stagger: 0.018, opacity: 0.42 },
      fade: { start: "reveal+=0.008", duration: 0.142, ease: "power1.in", stagger: 0.018 },
    },
    // 08 — Line draws to the landed drop.
    line: {
      start: "drop.land:end",
      draw: { start: 0, duration: 0.17, ease: "power1.in" },
    },
    // 09 — Masked colours fill the resized drop and its blur sharpens.
    dropColours: {
      start: "drop.resize:end",
      base: { start: 0, duration: 0.07, ease: "power1.in" },
      move: { start: "base", duration: 0.07, ease: "power1.in", stagger: 0.005 },
      reveal: { start: "base", duration: 0.07, ease: "power1.in", stagger: 0.005 },
      sharpen: { start: "base+=0.01", duration: 0.07, ease: "power1.in", blur: 6 },
    },
    // 10 — Line contact → clip opens → drop and brackets settle → content.
    finish: {
      start: "line:end",
      clip: { start: 0, duration: 0.18, ease: "power1.in" },
      blur: { start: "clip", duration: 0.18, ease: "power1.in", from: "blur(0rem)", to: "blur(1.5rem)" },
      starGrow: { start: "clip", duration: 0.04, ease: "power1.in", scale: 2.5 },
      starRotate: { start: "starGrow", duration: 0.43, ease: "none", rotation: 360 },
      starSettle: { start: "starGrow:end+=0.07", duration: 0.04, ease: "power1.in", scale: 2.15 },
      drop: { start: "clip+=0.04", duration: 0.18, ease: "power1.in", scale: 0.5 },
      leftBracket: { start: "drop+=0.035", duration: 0.18, ease: "power1.in" },
      rightBracket: { start: "leftBracket", duration: 0.18, ease: "power1.in" },
      content: { start: "clip:end+=0.035", duration: 0.1, ease: "power1.in" },
    },
    // 11 — Final water rings expand and settle behind the end content.
    endRipple: {
      start: "finish.clip+=0.12",
      expand: { start: 0, duration: 0.2, ease: "power1.in", stagger: 0.02, scale: (index) => 1.1 - index * 0.3 },
      reveal: { start: "expand", duration: 0.2, ease: "power1.in", stagger: 0.02, opacity: 0.7 },
      settle: {
        start: "expand+=0.01", duration: 0.28, ease: "power1.in", stagger: 0.02,
        blur: "2.5rem",
        // Decimal alpha avoids GSAP's percentage-alpha colour interpolation snap.
        shadow: "0 0 5rem 3rem rgba(104, 150, 230, 0.6), inset 0 0 5rem 3rem rgba(104, 150, 230, 0.45)",
      },
    },
  };

  // The embedded nav clips with the hero, but stays crisp during the content blur.
  const $homeStartContent = $("[home-start]").children().not("script, style")
    .filter((_, element) => !$(element).find("[nav-block]").length);
  const $homeEnd = $("[layout-end]").first();
  const restoreHomeEndLayout = rememberAttributes($homeEnd, ["style"]);
  const $homeEndContent = $("[layout-end]")
    .children()
    .not("[home-end-brackets]")
    .add($("[layout-end] [home-end-brackets-svg]"));

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

  const $homeLogos = $("[home-logo-up]");
  // PAGE ENTRANCE — seconds, independent of the scroll controls above.
  const homeEntrance = {
    move: { start: 0, duration: 1.2, ease: "power2.out", stagger: { amount: 0.6, from: "end" } },
    fade: { start: 0, duration: 0.6, ease: "power1.out", stagger: { amount: 0.6, from: "end" } },
    logosMove: { start: 0, fromY: "10rem", duration: 1.2, ease: "power2.out", stagger: 0 },
    logosFade: { start: 0, duration: 0.6, ease: "power1.out", stagger: 0 },
  };

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

  gsap.set($homeLogos, { y: homeEntrance.logosMove.fromY });

  // CARD BACKGROUND — seconds for idle/drag; framing uses firstScene.sphere above.
  const homeCardMotion = {
    idle: { cycleSeconds: 48, axisDegrees: 45 },
    drag: { duration: 0.6, ease: "power2.out", degreesPerPixel: 0.25 },
    framing: { scale: 0.78, radiusScale: 0.9, offsetYRem: 2 },
    opacity: { back: 0.08, front: 1, ease: "power1.inOut" },
  };
  const cardOpacityEase = gsap.parseEase(homeCardMotion.opacity.ease);
  const $homeResting = $("[home-resting]");
  const $homeRestingDragSurface = $("[home-start]");
  const homeRestingView = { progress: 0 };
  const homeRestingCenterShift = { x: 0, y: 0 };
  const homeRestingBaseY =
    parseFloat(getComputedStyle(document.documentElement).fontSize) * homeCardMotion.framing.offsetYRem;
  const homeRestingRadiusScale = homeCardMotion.framing.radiusScale;
  const homeRestingMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const homeRestingMatrixTemp = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const homeRestingRotationMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const homeRestingSmooth = { x: 0, y: 0 };
  let homeRestingPreviousX = 0;
  let homeRestingPreviousY = 0;
  let homeRestingSphere = [];

  function buildHomeRestingSphere() {
    const restingItems = $homeResting.toArray().map((element, index) => {
      const card = $(element).find("[perspective-card]")[0];
      if (!card) return null;

      const isFront = $(element).closest("[perspective-opacity-1]").length;
      const isBack = $(element).closest("[perspective-opacity-3]").length;

      const transformX = Number(gsap.getProperty(element, "x", "px")) || 0;
      const transformY = Number(gsap.getProperty(element, "y", "px")) || 0;
      const bounds = element.getBoundingClientRect();

      gsap.set(card, {
        force3D: true,
        transformOrigin: "center center",
      });

      return {
        element,
        card,
        setX: gsap.quickSetter(card, "x", "px"),
        setY: gsap.quickSetter(card, "y", "px"),
        // quickSetter needs explicit axes; "scale" is a multi-property alias.
        setScaleX: gsap.quickSetter(card, "scaleX"),
        setScaleY: gsap.quickSetter(card, "scaleY"),
        setOpacity: gsap.quickSetter(card, "opacity"),
        setZIndex: gsap.quickSetter(element, "zIndex"),
        x: bounds.left - transformX + bounds.width / 2,
        y: bounds.top - transformY + bounds.height / 2,
        depth: isFront ? 1 : isBack ? -1 : index % 2 === 0 ? 0.35 : -0.35,
      };
    }).filter(Boolean);

    if (!restingItems.length) return;

    const centerX =
      restingItems.reduce((total, item) => total + item.x, 0) /
      restingItems.length;
    const centerY =
      restingItems.reduce((total, item) => total + item.y, 0) /
      restingItems.length;
    const radius = Math.max(
      1,
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
      homeCardMotion.framing.scale,
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
      // Every card uses the same continuous depth curve: no front/middle/back states.
      // Cards crossing at the same depth now have the same opacity.
      const depthProgress = gsap.utils.clamp(0, 1, (depth / item.radius + 1) / 2);
      const opacity = gsap.utils.interpolate(homeCardMotion.opacity.back,
        homeCardMotion.opacity.front, cardOpacityEase(depthProgress));

      // Reuse setters: per-frame gsap.set() tweens accumulate in matchMedia.
      item.setZIndex(Math.round(depth + item.radius));
      item.setX(
        x * homeRestingRadiusScale * viewScale + viewX - item.screenX
      );
      item.setY(
        -y * homeRestingRadiusScale * viewScale +
          homeRestingBaseY + viewY - item.screenY
      );
      item.setScaleX(scale);
      item.setScaleY(scale);
      item.setOpacity(opacity);
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
    duration: homeCardMotion.drag.duration,
    ease: homeCardMotion.drag.ease,
    onUpdate: updateHomeRestingSphere,
  });
  const homeRestingQuickX = gsap.quickTo(homeRestingSmooth, "x", {
    duration: homeCardMotion.drag.duration,
    ease: homeCardMotion.drag.ease,
    onUpdate: updateHomeRestingSphere,
  });

  gsap.set(
    $("[perspective-opacity-1], [perspective-opacity-2], [perspective-opacity-3]"),
    {
      opacity: 1,
      zIndex: "auto",
    }
  );

  buildHomeRestingSphere();
  renderHomeRestingSphere();

  // GRADIENT AND CLIP GEOMETRY — artwork measurements, separate from timing.
  // Align the end mark to the opening drop/line; negative values lift it slightly.
  const homeAlignment = { endDropOffsetRem: -0.75 };
  const $gradientPieces = $("[home-gradient-piece]");
  const gradientOrbit = { angle: 0, merge: 0 };
  const homeClip = { progress: 0 };
  function finalGradientDropTransform() {
    const svg = $("[home-gradient-svg]")[0];
    const matrix = svg && svg.getScreenCTM();
    const screenScale = matrix && Math.hypot(matrix.a, matrix.b);
    if (!screenScale) return "translate(640 59) scale(0.72)";

    const em = parseFloat(getComputedStyle(svg).fontSize);
    const scale = (homeMotion.drop.resize.widthEm * em) / (223 * screenScale);
    // Scale the 223 x 315 artwork around the existing line-contact point.
    const x = 720 - 111.1 * scale;
    const y = 180 - 168.0556 * scale;
    return `translate(${x} ${y}) scale(${scale})`;
  }

  const gradientRingPoints = [
    [720, -104, 160], [1088, 48, 145], [1240, 416, 155], [1088, 784, 140],
    [720, 936, 165], [352, 784, 145], [200, 416, 155], [352, 48, 140],
  ];
  let homeClipBounds;

  function measureHomeClip() {
    const home = $("[home-start]")[0];
    const line = $("[home-gradient-line]")[0];
    const homeRect = home.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    homeClipBounds = {
      width: home.offsetWidth,
      height: home.offsetHeight,
      centerY: lineRect.top + lineRect.height / 2 - homeRect.top,
    };
    const marker = $homeEnd.find("[home-end-brackets]")[0];
    if (marker && $homeEnd.length) {
      const endRect = $homeEnd[0].getBoundingClientRect(), markerRect = marker.getBoundingClientRect();
      const currentPadding = parseFloat(getComputedStyle($homeEnd[0]).paddingTop) || 0;
      const em = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const desiredCenter = homeClipBounds.centerY + homeAlignment.endDropOffsetRem * em;
      const shift = desiredCenter - (markerRect.top + markerRect.height / 2 - endRect.top);
      $homeEnd.css("padding-top", Math.max(0, currentPadding + shift));
    }
  }
  measureHomeClip();

  function homeClipPath(progress) {
    if (progress >= 1) return "inset(0 100% 0 0)";
    const { width, height, centerY } = homeClipBounds;
    const centerX = width * 0.5;
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
    const cos = Math.cos(gradientOrbit.angle);
    const sin = Math.sin(gradientOrbit.angle);
    $gradientPieces.each(function (index) {
      const [startX, startY] = gradientRingPoints[index];
      const x = 720 + (startX - 720) * cos - (startY - 416) * sin;
      const y = 416 + (startX - 720) * sin + (startY - 416) * cos;
      $(this).attr({
        cx: gsap.utils.interpolate(x, 720, gradientOrbit.merge),
        cy: gsap.utils.interpolate(y, 800, gradientOrbit.merge),
      });
    });
  }

  // INITIAL STATES — authored artwork and the same resting appearance.
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

  gsap.set($("[home-start]"), {
    clipPath: "none",
    willChange: "clip-path",
  });

  gsap.set($("[ripple-ring]"), {
    scale: 0.08,
    autoAlpha: 0,
    transformOrigin: "center",
  });

  gsap.set($("[home-end-target-svg]"), {
    scale: 1,
    opacity: 1,
    transformOrigin: "center center",
  });

  gsap.set($("[home-end-brackets-svg]"), {
    overflow: "hidden",
  });

  gsap.set($("[home-end-bracket-left]"), {
    x: -72,
  });

  gsap.set($("[home-end-bracket-right]"), {
    x: 72,
  });

  gsap.set($homeEndContent, {
    opacity: 0,
    willChange: "opacity",
    zIndex: 2,
  });

  gsap.set($("[home-end-ripple]"), {
    scale: 0.08,
    autoAlpha: 0,
    transformOrigin: "center",
  });

  // IDLE ROTATION AND DRAG — never used to play a scroll sequence.
  let homeRestingIsDragging = false;
  let homeRestingPointerId = null;
  let homeRestingLastPointerX = 0;
  let homeRestingLastPointerY = 0;
  let homeRestingInputX = 0;
  let homeRestingInputY = 0;
  let homeRestingUserSelect = "";
  let homeRestingIsActive = false;
  let homeRestingIsInView = true;
  let homeRestingIsDestroyed = false;
  let homeRestingObserver = null;

  function rotateHomeRestingSphere(time, deltaTime) {
    if (!homeRestingIsActive || document.hidden || homeRestingIsDragging) return;

    const rotation = (Math.min(deltaTime, 32) / 1000) * (360 / homeCardMotion.idle.cycleSeconds);
    const direction = (homeCardMotion.idle.axisDegrees * Math.PI) / 180;

    homeRestingInputX += Math.cos(direction) * rotation;
    homeRestingInputY += Math.sin(direction) * rotation;
    homeRestingQuickY(homeRestingInputX);
    homeRestingQuickX(homeRestingInputY);
  }

  function syncHomeRestingActivity() {
    if (homeRestingIsDestroyed) return;

    // Follow the editable fade endpoint rather than a hard-coded percentage.
    const shouldRun =
      homeRestingSphere.length > 0 &&
      !document.hidden &&
      homeRestingIsInView &&
      homeTimeline.time() < homeTimeline.labels["cards.fade:end"];

    if (shouldRun === homeRestingIsActive) return;
    homeRestingIsActive = shouldRun;

    if (shouldRun) {
      gsap.ticker.add(rotateHomeRestingSphere);
    } else {
      gsap.ticker.remove(rotateHomeRestingSphere);
      homeRestingQuickX.tween.pause();
      homeRestingQuickY.tween.pause();
      endHomeRestingDrag();
    }
  }

  function canDragHomeResting() {
    return (
      homeRestingIsActive &&
      homeLoadTimeline.progress() >= 0.999 &&
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
    homeRestingInputX += deltaX * homeCardMotion.drag.degreesPerPixel;
    homeRestingInputY += deltaY * homeCardMotion.drag.degreesPerPixel;
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

  // PAGE ENTRANCE — the only non-scroll timeline in this sequence.
  const homeLoadTimeline = gsap.timeline({
    onComplete: () => {
      if (!homeLoadScrollLocked || !window.lenis) return;
      window.lenis.start();
      homeLoadScrollLocked = false;
    },
  });
  homeLoadTimeline
    .to($("[home-start-up]"), { y: 0, duration: homeEntrance.move.duration, ease: homeEntrance.move.ease, stagger: homeEntrance.move.stagger }, homeEntrance.move.start)
    .to($("[home-start-up]"), { opacity: 1, duration: homeEntrance.fade.duration, ease: homeEntrance.fade.ease, stagger: homeEntrance.fade.stagger }, homeEntrance.fade.start)
    .to($homeLogos, { y: 0, duration: homeEntrance.logosMove.duration, ease: homeEntrance.logosMove.ease, stagger: homeEntrance.logosMove.stagger }, homeEntrance.logosMove.start)
    .to($homeLogos, { opacity: 1, duration: homeEntrance.logosFade.duration, ease: homeEntrance.logosFade.ease, stagger: homeEntrance.logosFade.stagger }, homeEntrance.logosFade.start);

  // BUILD THE SCRUB SEQUENCE — timing stays in homeMotion above.
  const homeTimeline = gsap.timeline({ paused: true, id: "home-sequence" });

  function addHomeStep(group, name, targets, from, to, timing) {
    if (!targets || (typeof targets.length === "number" && !targets.length)) {
      // Keep the timing labels even when an optional piece of artwork is absent.
      targets = {};
      from = {};
      to = {};
    }
    group.fromTo(targets, from, {
      ...to,
      duration: timing.duration,
      ease: timing.ease,
      stagger: timing.stagger || 0,
      immediateRender: false,
    }, timing.start);
    const step = group.recent();
    group.addLabel(name, step.startTime());
    group.addLabel(`${name}:end`, step.endTime());
    return step;
  }

  function addHomeGroup(name, build) {
    const group = gsap.timeline({ id: `home-${name}` });
    build(group, homeMotion[name]);
    homeTimeline.add(group, homeMotion[name].start);
    homeTimeline.addLabel(name, group.startTime());
    homeTimeline.addLabel(`${name}:end`, group.endTime());
    Object.entries(group.labels).forEach(([label, time]) => {
      homeTimeline.addLabel(`${name}.${label}`, group.startTime() + time);
    });
    return group;
  }

  // 01 — First scene and sphere framing.
  addHomeGroup("firstScene", (group, motion) => {
    addHomeStep(group, "sphere", homeRestingView, { progress: 0 },
      { progress: 1, onUpdate: renderHomeRestingSphere }, motion.sphere);
    const $content = $("[home-start-up]").not("[home-resting]");
    addHomeStep(group, "move", $content, { y: 0 }, { y: motion.move.y }, motion.move);
    addHomeStep(group, "fade", $content, { opacity: 1 }, { opacity: 0 }, motion.fade);
  });

  // 02 — Cards and logos leave in their own groups.
  addHomeGroup("cards", (group, motion) => {
    addHomeStep(group, "move", $homeResting, { y: 0 }, { y: motion.move.y }, motion.move);
    addHomeStep(group, "fade", $homeResting, { opacity: 1 }, { opacity: 0 }, motion.fade);
  });
  addHomeGroup("logos", (group, motion) => {
    addHomeStep(group, "move", $homeLogos, { y: 0 }, { y: motion.move.y }, motion.move);
    addHomeStep(group, "fade", $homeLogos, { opacity: 1 }, { opacity: 0 }, motion.fade);
  });

  // 03 — Second scene: the delay before leave is the hold; no competing tween.
  addHomeGroup("secondScene", (group, motion) => {
    const $content = $("[home-second-up]");
    addHomeStep(group, "enter", $content, { y: "10rem" }, { y: 0 }, motion.enter);
    addHomeStep(group, "reveal", $content, { opacity: 0 }, { opacity: 1 }, motion.reveal);
    addHomeStep(group, "leave", $content, { y: 0 }, { y: motion.leave.y }, motion.leave);
    addHomeStep(group, "hide", $content, { opacity: 1 }, { opacity: 0 }, motion.hide);
  });

  // 04 — Third scene remains in place until the clip reveals the next layer.
  addHomeGroup("thirdScene", (group, motion) => {
    const $content = $("[home-third-up]");
    addHomeStep(group, "enter", $content, { y: "10rem" }, { y: 0 }, motion.enter);
    addHomeStep(group, "reveal", $content, { opacity: 0 }, { opacity: 1 }, motion.reveal);
  });

  // 05 — Gradient formation and orbit. One renderer owns the dot positions.
  addHomeGroup("gradientDots", (group, motion) => {
    const positions = gradientRingPoints;
    addHomeStep(group, "form", $gradientPieces,
      { attr: { cx: 720, cy: 900, rx: 900, ry: 225 }, opacity: (index) => index === 0 ? 0.85 : 0 },
      { attr: {
        cx: (index) => positions[index][0], cy: (index) => positions[index][1],
        rx: (index) => positions[index][2], ry: (index) => positions[index][2],
      }, opacity: 0.82 }, motion.form);
    addHomeStep(group, "spin", gradientOrbit, { angle: 0 }, { angle: motion.spin.angle }, motion.spin);
    addHomeStep(group, "shrink", $("[home-gradient-orbit]"), { scale: 1 }, { scale: motion.shrink.scale }, motion.shrink);
    addHomeStep(group, "rise", $("[home-gradient-orbit]"), { y: 0 }, { y: motion.rise.y }, motion.rise);
    addHomeStep(group, "merge", gradientOrbit, { merge: 0 }, { merge: 1 }, motion.merge);
    addHomeStep(group, "fade", $gradientPieces, { opacity: 0.82 }, { opacity: 0 }, motion.fade);
  });

  // 06 — Form and land the drop, preserving its artwork and contact point.
  let homeFinalDropTween;
  addHomeGroup("drop", (group, motion) => {
    const $drop = $('[home-gradient-drop="2"]');
    addHomeStep(group, "appear", $drop, { opacity: 0 }, { opacity: 1 }, motion.appear);
    addHomeStep(group, "merge", $("[home-gradient-drop]"),
      { attr: { transform: (index) => ["translate(167 7) scale(1.1)", "translate(598 7) scale(1.1)", "translate(1029 7) scale(1.1)"][index] } },
      { attr: { transform: "translate(640 59) scale(0.72)" } }, motion.merge);
    addHomeStep(group, "soften", $("[home-gradient-drop-blur], [home-final-drop-blur]"),
      { attr: { stdDeviation: 52 } }, { attr: { stdDeviation: motion.soften.blur } }, motion.soften);
    addHomeStep(group, "land", $("[home-gradient-drops]"), { y: 0 }, { y: motion.land.y }, motion.land);
    homeFinalDropTween = addHomeStep(group, "resize", $drop,
      { attr: { transform: "translate(640 59) scale(0.72)" } },
      { attr: { transform: finalGradientDropTransform } }, motion.resize);
  });

  // 07 — Landing rings share the scroll clock, including their opacity.
  addHomeGroup("landingRipple", (group, motion) => {
    const $rings = $("[ripple-ring]");
    addHomeStep(group, "expand", $rings, { scale: 0.08 }, { scale: motion.expand.scale }, motion.expand);
    addHomeStep(group, "reveal", $rings, { autoAlpha: 0 }, { autoAlpha: motion.reveal.opacity }, motion.reveal);
    addHomeStep(group, "fade", $rings, { autoAlpha: motion.reveal.opacity }, { autoAlpha: 0 }, motion.fade);
  });

  // 08 — Horizontal line reaches the drop, then starts the finish group.
  addHomeGroup("line", (group, motion) => {
    addHomeStep(group, "draw", $("[home-gradient-line]"),
      { attr: { "stroke-dashoffset": 1560 }, opacity: 0 },
      { attr: { "stroke-dashoffset": 780 }, opacity: 1 }, motion.draw);
  });

  // 09 — Drop colours and final sharpness.
  addHomeGroup("dropColours", (group, motion) => {
    addHomeStep(group, "base", $("[home-drop-purple-base], [home-drop-colors]"),
      { opacity: 0 }, { opacity: 1 }, motion.base);
    addHomeStep(group, "move", $("[home-drop-circle]"), { x: -40 }, { x: 0 }, motion.move);
    addHomeStep(group, "reveal", $("[home-drop-circle]"),
      { opacity: (index, element) => ({ yellow: 0.12, white: 0.08, blue: 0, purple: 1 })[element.getAttribute("home-drop-circle")] ?? 0 },
      { opacity: 1 }, motion.reveal);
    addHomeStep(group, "sharpen", $("[home-final-drop-blur]"),
      { attr: { stdDeviation: homeMotion.drop.soften.blur } },
      { attr: { stdDeviation: motion.sharpen.blur } }, motion.sharpen);
  });

  // 10 — Screen opening, star, brackets, final drop and end content.
  addHomeGroup("finish", (group, motion) => {
    addHomeStep(group, "clip", homeClip, { progress: 0 }, { progress: 1 }, motion.clip);
    addHomeStep(group, "blur", $homeStartContent, { filter: motion.blur.from }, { filter: motion.blur.to }, motion.blur);
    addHomeStep(group, "starGrow", $("[home-drop-star]"),
      { opacity: 0, scale: 0.15 }, { opacity: 1, scale: motion.starGrow.scale }, motion.starGrow);
    addHomeStep(group, "starRotate", $("[home-drop-star]"),
      { rotation: -35 }, { rotation: motion.starRotate.rotation }, motion.starRotate);
    addHomeStep(group, "starSettle", $("[home-drop-star]"),
      { scale: motion.starGrow.scale }, { scale: motion.starSettle.scale }, motion.starSettle);
    addHomeStep(group, "drop", $("[home-end-target-svg]"),
      { scale: 1 }, { scale: motion.drop.scale }, motion.drop);
    addHomeStep(group, "leftBracket", $("[home-end-bracket-left]"), { x: -72 }, { x: 0 }, motion.leftBracket);
    addHomeStep(group, "rightBracket", $("[home-end-bracket-right]"), { x: 72 }, { x: 0 }, motion.rightBracket);
    addHomeStep(group, "content", $homeEndContent, { opacity: 0 }, { opacity: 1 }, motion.content);
  });

  // 11 — Settled end rings. Their authored shadows are restored on reverse.
  addHomeGroup("endRipple", (group, motion) => {
    const $rings = $("[home-end-ripple]");
    const styles = $rings.toArray().map((ring) => {
      const style = getComputedStyle(ring);
      return { filter: style.filter === "none" ? "blur(0rem)" : style.filter, shadow: style.boxShadow };
    });
    addHomeStep(group, "expand", $rings, { scale: 0.08 }, { scale: motion.expand.scale }, motion.expand);
    addHomeStep(group, "reveal", $rings, { autoAlpha: 0 }, { autoAlpha: motion.reveal.opacity }, motion.reveal);
    addHomeStep(group, "settle", $rings,
      { filter: (index) => styles[index].filter, boxShadow: (index) => styles[index].shadow },
      { filter: `blur(${motion.settle.blur})`, boxShadow: motion.settle.shadow }, motion.settle);
  });

  // A fixed 0–1 clock keeps percentages literal even if edited steps exceed 1.
  // Such steps stop at the section end; they never stretch all the other timings.
  if (homeTimeline.duration() > 1.00001) {
    console.warn("Home animation extends beyond 100% scroll. Move or shorten its last steps in homeMotion.");
  }
  homeTimeline.to({}, { duration: Math.max(0, 1 - homeTimeline.duration()) });
  let homeClipWasActive = false;

  function renderHomeScrollGeometry() {
    if (homeTimeline.time() >= homeTimeline.labels["gradientDots.spin"]) moveGradientDots();
    if (homeTimeline.time() > homeTimeline.labels["finish.clip"]) {
      $("[home-start]").css("clip-path", homeClipPath(homeClip.progress));
      homeClipWasActive = true;
    } else if (homeClipWasActive) {
      $("[home-start]").css("clip-path", "none");
      $homeStartContent.css("filter", "");
      homeClipWasActive = false;
    }
  }
  homeTimeline.eventCallback("onUpdate", renderHomeScrollGeometry);

  const homeScrollPosition = { value: 0 };
  const homeScrubClock = gsap.fromTo(homeScrollPosition, { value: 0 }, {
    value: 1, duration: 1, ease: "none", paused: true, id: "home-scrub-clock",
    onUpdate: () => {
      // Native scrollbar/PageDown input can arrive before the load entrance ends.
      if (homeScrollPosition.value > 0 && homeLoadTimeline.progress() < 1) homeLoadTimeline.progress(1);
      homeTimeline.time(homeScrollPosition.value);
      if (homeScrollPosition.value > 0.002 && homeRestingIsDragging) endHomeRestingDrag();
      syncHomeRestingActivity();
    },
  });

  // STICKY SCROLL RANGE — no autoplay, scroll locking, pin spacer or end offset.
  const homeScrollTrigger = ScrollTrigger.create({
    id: "home-scroll",
    trigger: $("[layout-start]")[0],
    start: "top top",
    end: "bottom bottom",
    animation: homeScrubClock,
    scrub: true,
    onRefresh: () => {
      measureHomeClip();
      const progress = homeFinalDropTween.progress();
      homeFinalDropTween.invalidate();
      if (homeTimeline.time() >= homeTimeline.labels["drop.resize"]) homeFinalDropTween.progress(progress, true);
      renderHomeScrollGeometry();
    },
  });
  homeScrubClock.progress(homeScrollTrigger.progress);
  syncHomeRestingActivity();

  if (window.IntersectionObserver) {
    homeRestingObserver = new IntersectionObserver(([entry]) => {
      homeRestingIsInView = entry.isIntersecting;
      syncHomeRestingActivity();
    });
    homeRestingObserver.observe($homeRestingDragSurface[0]);
  }

  $(document).on("visibilitychange.homeRestingVisibility", syncHomeRestingActivity);

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

  // CLEANUP — restore the desktop scene when leaving this breakpoint.
  return () => {
    homeRestingIsDestroyed = true;
    homeRestingIsActive = false;
    if (homeRestingObserver) homeRestingObserver.disconnect();
    $(document).off(".homeRestingVisibility");

    if (homeLoadScrollLocked && window.lenis) {
      window.lenis.start();
      homeLoadScrollLocked = false;
    }

    homeScrollTrigger.kill();
    homeLoadTimeline.kill();
    homeScrubClock.kill();
    homeTimeline.kill();
    restoreHomeEndLayout();
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
    gsap.set($homeResting.find("[perspective-card]"), {
      clearProps: "transform,opacity,will-change",
    });
    gsap.set(
      $("[perspective-opacity-1], [perspective-opacity-2], [perspective-opacity-3]"),
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
    gsap.set($("[home-start]"), {
      clearProps: "clip-path,will-change",
    });
    gsap.set($homeStartContent, { clearProps: "filter" });
    gsap.set($homeEndContent, {
      clearProps: "opacity,will-change,z-index",
    });
    gsap.set($("[home-end-brackets-svg]"), {
      clearProps: "overflow",
    });
    gsap.set(
      $(
        "[home-end-target-svg], [home-end-bracket-left], [home-end-bracket-right], [home-end-ripple]"
      ),
      {
        clearProps: "transform,opacity,visibility,will-change",
      }
    );
    gsap.set($("[home-end-ripple]"), {
      clearProps: "filter,box-shadow",
    });
  };
}

function flexGrowAnimation() {
  const $blocks = $("[flex-grow-block]");
  if (!$blocks.length || !window.gsap) return null;

  // GALLERY CONTROLS — desktop growth, copy fade, and mobile expansion in seconds.
  const galleryMotion = {
    grow: {
      start: 0,
      active: 1,
      inactive: 0,
      duration: 0.3,
      ease: "power1.in",
    },
    copy: {
      start: 0,
      active: 1,
      inactive: 0,
      duration: 0.15,
      ease: "power1.in",
    },
    mobile: {
      start: 0,
      media: "(max-width: 767px)",
      imageAspectRatio: 2,
      imageGapEm: 1,
      duration: 0.3,
      ease: "power1.in",
    },
  };
  const cleanups = [];
  const refreshers = [];
  let resizeFrame = null;
  let viewportWidth = window.innerWidth;
  let destroyed = false;

  $blocks.each(function () {
    const items = $(this)
      .children("[flex-grow-item]")
      .toArray()
      .map((element) => {
        const $item = $(element);
        const $image = $item.children("[flex-grow-item-img]").first();
        if (!$image.length) return null;

        const $content = $item.children("[flex-grow-item-content]").first();
        const $title = $content.children("[text-grow-item-title]").first();
        const $copy = $content.find("[flex-grow-item-copy]");
        const $art = $image.children("[img-abs]");
        return { $item, $image, $art, $content, $title, $copy };
      })
      .filter(Boolean);
    if (!items.length) return;

    const $growTargets = $(items.map(({ $item }) => $item[0]));
    const $imageTargets = $(items.map(({ $image }) => $image[0]));
    const $copyTargets = $(items.flatMap(({ $copy }) => $copy.toArray()));
    const $contentTargets = $(items.flatMap(({ $content }) => $content.toArray()));
    const originalStates = [];
    const growStyles = rememberStyles($growTargets.add($imageTargets), ["flex-grow"]);
    const mobileStyles = [
      ...rememberStyles($contentTargets, ["height"]),
      ...rememberStyles($(items.map(({ $image }) => $image[0])), ["height", "margin-top"]),
    ];
    let mobile = window.matchMedia(galleryMotion.mobile.media).matches;
    let activeItem = null;
    let timeline = null;

    function rememberStyles($elements, properties) {
      return $elements.toArray().flatMap((element) => properties.map((property) => ({
        element,
        property,
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      })));
    }

    function restoreStyles(styles) {
      styles.forEach(({ element, property, value, priority }) => {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
      });
    }

    function rememberElements($elements, attributes) {
      $elements.each(function () {
        const $element = $(this);
        originalStates.push({
          $element,
          active: $element.hasClass("active"),
          attributes: Object.fromEntries(attributes.map((name) => [name, $element.attr(name)])),
        });
      });
    }

    function sizeImageArtwork() {
      if (!items.some(({ $art }) => $art.length)) return;
      // One item's worth of free space is shared by the row. Keep every photo at
      // that full width; only its parent reveals it as the item expands.
      const openWidth = mobile ? 0 : items.reduce((sum, { $image }) => sum + ($image.width() || 0), 0);
      items.forEach(({ $image, $art }) => {
        $art.css({
          "--gallery-image-width": mobile ? "100%" : `${openWidth}px`,
          "--gallery-image-height": mobile ? `${$image.width() / galleryMotion.mobile.imageAspectRatio}px` : "100%",
        });
      });
    }

    function activateItem(item, immediate = false) {
      if (activeItem === item && !immediate) return;
      activeItem = item;
      if (timeline) timeline.kill();

      const currentSizes = mobile && !immediate ? items.map(({ $content, $image }) => ({
        content: $content.outerHeight() || 0,
        image: $image.outerHeight() || 0,
        gap: parseFloat($image.css("margin-top")) || 0,
      })) : null;

      items.forEach((entry) => {
        const active = entry === item;
        entry.$item.toggleClass("active", active).attr("aria-expanded", String(active));
        entry.$image.toggleClass("active", active);
        entry.$copy.toggleClass("active", active);
      });

      const grow = (_, element) =>
        $(element).hasClass("active") ? galleryMotion.grow.active : galleryMotion.grow.inactive;
      const visibility = (_, element) =>
        $(element).hasClass("active") ? galleryMotion.copy.active : galleryMotion.copy.inactive;

      if (!immediate) timeline = gsap.timeline();

      if (mobile) {
        // Measure natural text wrapping, then restore the current frame before tweening.
        if ($contentTargets.length) gsap.set($contentTargets, { height: "auto" });
        const targetSizes = items.map(({ $image, $title, $copy }, index) => ({
          content: Math.max($title.outerHeight(true) || 0, items[index] === item ? $copy.outerHeight(true) || 0 : 0),
          image: items[index] === item ? $image.outerWidth() / galleryMotion.mobile.imageAspectRatio : 0,
          gap: items[index] === item ? galleryMotion.mobile.imageGapEm * (parseFloat($image.css("font-size")) || 16) : 0,
        }));

        items.forEach(({ $content, $image }, index) => {
          const target = targetSizes[index];
          if (immediate) {
            if ($content.length) gsap.set($content, { height: target.content });
            gsap.set($image, { height: target.image, marginTop: target.gap });
            return;
          }

          const current = currentSizes[index];
          if ($content.length) gsap.set($content, { height: current.content });
          gsap.set($image, { height: current.image, marginTop: current.gap });
          const timing = {
            duration: galleryMotion.mobile.duration,
            ease: galleryMotion.mobile.ease,
            overwrite: "auto",
          };
          if ($content.length) timeline.to($content, { height: target.content, ...timing }, galleryMotion.mobile.start);
          timeline.to($image, { height: target.image, marginTop: target.gap, ...timing }, galleryMotion.mobile.start);
        });
      } else if (immediate) {
        gsap.set($growTargets, { flexGrow: grow });
      } else {
        timeline.to($growTargets, {
          flexGrow: grow,
          duration: galleryMotion.grow.duration,
          ease: galleryMotion.grow.ease,
          overwrite: "auto",
        }, galleryMotion.grow.start);
      }

      if ($copyTargets.length) {
        if (immediate) gsap.set($copyTargets, { autoAlpha: visibility });
        else {
          timeline.to($copyTargets, {
            autoAlpha: visibility,
            duration: galleryMotion.copy.duration,
            ease: galleryMotion.copy.ease,
            overwrite: "auto",
          }, galleryMotion.copy.start);
        }
      }
    }

    const initialItem = items.find(({ $item }) => $item.hasClass("active")) ||
      items.find(({ $image }) => $image.hasClass("active")) || items[0];

    items.forEach((item) => {
      rememberElements(item.$item, ["style", "role", "tabindex", "aria-expanded"]);
      rememberElements(item.$image.add(item.$art).add(item.$content).add(item.$copy), ["style"]);
      item.$item.attr({ role: "button", tabindex: "0" });
      item.$item
        .off(".flexGrowAnimation")
        .on("mouseenter.flexGrowAnimation focusin.flexGrowAnimation click.flexGrowAnimation", () => {
          activateItem(item);
        })
        .on("keydown.flexGrowAnimation", function (event) {
          if (event.target !== this || (event.key !== "Enter" && event.key !== " ")) return;
          event.preventDefault();
          activateItem(item);
        });
    });

    if (!mobile) gsap.set($imageTargets, { flexGrow: 1 });
    activateItem(initialItem, true);
    sizeImageArtwork();

    refreshers.push(() => {
      const nextMobile = window.matchMedia(galleryMotion.mobile.media).matches;
      if (timeline) timeline.kill();
      if (nextMobile !== mobile) {
        restoreStyles(mobile ? mobileStyles : growStyles);
        mobile = nextMobile;
      }
      if (!mobile) gsap.set($imageTargets, { flexGrow: 1 });
      activateItem(activeItem, true);
      sizeImageArtwork();
    });

    cleanups.push(() => {
      if (timeline) timeline.kill();
      items.forEach(({ $item }) => $item.off(".flexGrowAnimation"));
      originalStates.forEach(({ $element, active, attributes }) => {
        $element.toggleClass("active", active);
        Object.entries(attributes).forEach(([name, value]) => {
          if (value === undefined) $element.removeAttr(name);
          else $element.attr(name, value);
        });
      });
    });
  });

  if (!cleanups.length) return null;

  function scheduleRefresh(force = false) {
    if (destroyed || resizeFrame !== null || (!force && window.innerWidth === viewportWidth)) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = null;
      if (destroyed) return;
      viewportWidth = window.innerWidth;
      refreshers.forEach((refresh) => refresh());
    });
  }

  function refreshOnResize() {
    scheduleRefresh();
  }

  window.addEventListener("resize", refreshOnResize);
  if (window.document?.fonts?.ready) {
    window.document.fonts.ready.then(() => scheduleRefresh(true));
  }

  return () => {
    destroyed = true;
    window.removeEventListener("resize", refreshOnResize);
    if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    cleanups.forEach((cleanup) => cleanup());
  };
}

function dropTextAnimation() {
  const $layouts = $("[drop-text-layout]");
  if (!$layouts.length || !window.gsap || !window.ScrollTrigger) return null;

  gsap.registerPlugin(ScrollTrigger);

  // DROP-TEXT CONTROLS — separate trigger, expansion, opacity, and settling.
  const rippleControls = {
    trigger: { start: "top 50%" },
    fade: { start: 0, duration: 0.95, ease: "power2.out", stagger: 0.09 },
    expand: {
      start: 0,
      startScale: 0.08,
      endScale: (index) => 1.1 - index * 0.3,
      duration: 0.95,
      stagger: 0.09,
      ease: "power2.out",
    },
    settle: {
      opacity: 0.7,
      blur: "1.2rem",
      shadow:
        "0 0 2.4rem 1.3rem rgba(137, 62, 213, 0.35), inset 0 0 2.4rem 1.3rem rgba(137, 62, 213, 0.25)",
      start: 0.05,
      duration: 1.15,
      ease: "power1.out",
    },
  };
  const cleanups = [];

  $layouts.each(function () {
    const $rings = $(this).find("[drop-text-ripple]");
    if (!$rings.length) return;

    const rippleTimeline = rippleAnimation($rings, {
      ...rippleControls.expand,
      fade: rippleControls.fade,
      settle: rippleControls.settle,
    });
    if (!rippleTimeline) return;

    const trigger = ScrollTrigger.create({
      trigger: this,
      start: rippleControls.trigger.start,
      onLeave: () => rippleTimeline.progress(1).pause(),
      onEnter: () => rippleTimeline.play(),
      onLeaveBack: () => rippleTimeline.reverse(),
    });

    cleanups.push(() => {
      trigger.kill();
      rippleTimeline.kill();
      gsap.set($rings, {
        clearProps: "transform,opacity,visibility,filter,box-shadow",
      });
    });
  });

  if (!cleanups.length) return null;

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

function rippleAnimation(
  $rings = $("[ripple-ring]"),
  {
    start = 0,
    startScale = 0.08,
    endScale = 1,
    startOpacity = 0.42,
    duration = 1.6,
    stagger = 0.16,
    ease = "power2.out",
    fade = null,
    settle = null,
  } = {}
) {
  if (!$rings.length || !window.gsap) return null;

  gsap.set($rings, { scale: startScale, autoAlpha: 0 });

  const rippleTimeline = gsap.timeline({ paused: true });

  rippleTimeline.fromTo(
    $rings,
    {
      scale: startScale,
    },
    {
      scale: endScale,
      duration,
      stagger,
      ease,
      immediateRender: false,
    },
    start
  );
  const fadeMotion = { start, duration, ease, stagger, ...fade };
  rippleTimeline.fromTo($rings, { autoAlpha: settle ? 0 : startOpacity }, {
    autoAlpha: settle ? settle.opacity : 0, duration: fadeMotion.duration,
    ease: fadeMotion.ease, stagger: fadeMotion.stagger, immediateRender: false,
  }, fadeMotion.start);

  if (settle) {
    // Capture Webflow's resting styles so replay restores the original water rings.
    const ringStyles = $rings.toArray().map((ring) => {
      const styles = getComputedStyle(ring);
      return {
        filter: styles.filter === "none" ? "blur(0rem)" : styles.filter,
        shadow: styles.boxShadow,
      };
    });

    rippleTimeline.fromTo(
      $rings,
      {
        filter: (index) => ringStyles[index].filter,
        boxShadow: (index) => ringStyles[index].shadow,
      },
      {
        filter: `blur(${settle.blur})`,
        boxShadow: settle.shadow,
        duration: settle.duration,
        stagger,
        ease: settle.ease,
        immediateRender: false,
      },
      settle.start
    );
  }

  return rippleTimeline;
}

function navTheme() {
  const $allNavs = $("[nav-block]");
  const $heroNavs = $allNavs.filter((_, element) => $(element).closest("[home-start]").length);
  const $nav = $allNavs.not($heroNavs);
  const $sections = $("[nav-light], [nav-dark]");
  if (!$allNavs.length || !window.gsap || !window.ScrollTrigger) return null;

  gsap.registerPlugin(ScrollTrigger);

  // NAV CONTROLS — switch themes when a marked section reaches this position.
  // Names describe TEXT colour: light text on the dark hero/footer; dark on light.
  // The hero's own nav is clipped with it, revealing the page nav underneath.
  const navControls = { start: "top top", heroMode: "nav-light", pageMode: "nav-dark" };
  const restoreNavs = rememberAttributes($allNavs, ["class"]);
  $heroNavs.toggleClass("nav-light", navControls.heroMode === "nav-light")
    .toggleClass("nav-dark", navControls.heroMode === "nav-dark");
  let currentMode;
  const initialMode = $heroNavs.length ? navControls.pageMode :
    ($nav.first().hasClass("nav-light") ? "nav-light" : "nav-dark");
  const sections = $sections.toArray().map((element) => ({
    element,
    mode: $(element).is("[nav-light]") ? "nav-light" : "nav-dark",
  }));

  function setNavMode(mode) {
    if (currentMode === mode) return;
    currentMode = mode;
    $nav
      .toggleClass("nav-light", mode === "nav-light")
      .toggleClass("nav-dark", mode === "nav-dark");
  }

  function syncNavMode() {
    let mode = initialMode;

    sections.forEach((section, index) => {
      if (window.scrollY >= triggers[index].start) {
        mode = section.mode;
      }
    });

    setNavMode(mode);
  }

  const triggers = sections.map((section, index) =>
    ScrollTrigger.create({
      trigger: section.element,
      start: navControls.start,
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
    restoreNavs();
  };
}

function lineHover() {
  if (!window.gsap) return null;
  // UNDERLINE CONTROLS — each state owns its timing, including keyboard focus.
  const lineMotion = {
    enter: { start: 0, duration: 0.3, ease: "power1.in", clipPath: "inset(0% 0% 0% 0%)" },
    leave: { start: 0, duration: 0.3, ease: "power1.in", clipPath: "inset(0% 0% 0% 100%)" },
    hidden: "inset(0% 100% 0% 0%)",
  };
  const cleanups = [];
  $("[line-hover-item]").each(function () {
    const $item = $(this), $line = $item.find("[line-hover]").first();
    if (!$line.length) return;
    const restore = rememberAttributes($line, ["style"]);
    let hovered = false, closed = !$item.hasClass("is-active");
    gsap.set($line, { clipPath: $item.hasClass("is-active") ? lineMotion.enter.clipPath : lineMotion.hidden });

    function animate(enter) {
      const motion = lineMotion[enter ? "enter" : "leave"];
      if (enter && closed) gsap.set($line, { clipPath: lineMotion.hidden });
      closed = false;
      gsap.to($line, { clipPath: $item.hasClass("is-active") ? lineMotion.enter.clipPath : motion.clipPath,
        duration: motion.duration, delay: motion.start, ease: motion.ease, overwrite: true,
        onComplete: () => { closed = !enter && !$item.hasClass("is-active"); } });
    }
    $item.on("mouseenter.lineHover", () => { hovered = true; animate(true); })
      .on("mouseleave.lineHover", () => { hovered = false; animate(this.contains(document.activeElement)); })
      .on("focusin.lineHover", () => animate(true))
      .on("focusout.lineHover", (event) => { if (!this.contains(event.relatedTarget)) animate(hovered); });
    cleanups.push(() => { $item.off(".lineHover"); gsap.killTweensOf($line); restore(); });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

function filterOne() {
  const $tabs = $("[filter-tab]"), $reveals = $("[filter-reveal]");
  if (!$tabs.length || !$reveals.length || !window.gsap) return null;

  // FILTER CONTROLS — seconds. Each incoming item's child timeline starts after hide.
  const filterMotion = {
    items: {
      hide: { start: 0, duration: 0.2, ease: "power1.in" },
      reveal: { start: 0, duration: 0.4, ease: "power1.in", fromX: -100, toX: 0 },
      train: { start: "switch+=0.04", stagger: 0.03 },
    },
    words: {
      move: { start: 0, fromX: -100, toX: 0, duration: 0.3, ease: "power1.in", stagger: { each: 0.02, from: "end" } },
      fade: { start: 0, duration: 0.06, ease: "power1.in", stagger: { each: 0.02, from: "end" } },
    },
    divider: { start: 0, duration: 0.5, ease: "power1.in" },
    container: { start: "switch+=0.001", duration: 0.5, ease: "power1.in" },
    tabLine: { start: 0, duration: 0.3, ease: "power1.in" },
  };
  const $lines = $tabs.find("[line-hover]"), $dividers = $reveals.find("[h-line]");
  const $parent = $reveals.first().parent();
  const restoreTabs = rememberAttributes($tabs, ["class", "aria-pressed"]);
  const restoreStyles = rememberAttributes($reveals.add($dividers).add($lines).add($parent), ["style"]);
  let splits = [], timeline = null;
  const normalize = (value) => String(value || "").trim().toLowerCase();

  function revertHeadings() { splits.forEach((split) => split.revert()); splits = []; }
  function headingTargets(element) {
    const $heading = $(element).find("[accord-heading]").first();
    const $words = $heading.find("[word]");
    return ($words.length ? $words : $heading).toArray();
  }
  function finish() {
    const previous = timeline;
    if (previous) { previous.progress(1); previous.kill(); timeline = null; }
    gsap.killTweensOf($reveals.add($dividers).add($parent));
    gsap.set($parent, { clearProps: "height,overflow" });
    gsap.set($reveals, { clearProps: "will-change" });
    revertHeadings();
  }
  function setActiveTab($tab, immediate = false) {
    $tabs.removeClass("is-active").attr("aria-pressed", "false");
    $tab.addClass("is-active").attr("aria-pressed", "true");
    gsap.to($lines, {
      clipPath: (_, element) => $tab[0].contains(element) ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 0% 100%)",
      duration: immediate ? 0 : filterMotion.tabLine.duration,
      delay: immediate ? 0 : filterMotion.tabLine.start,
      ease: filterMotion.tabLine.ease, overwrite: true,
    });
  }

  function showFilter(value, immediate = false) {
    finish();
    const key = normalize(value);
    const $incoming = key === "all" ? $reveals : $reveals.filter((_, element) => normalize(element.getAttribute("filter-reveal")) === key);
    if (immediate) {
      gsap.set($reveals, { display: "none" });
      gsap.set($incoming, { display: "block", autoAlpha: 1 });
      gsap.set($dividers, { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }
    if (window.SplitType) $incoming.find("[accord-heading]").each(function () {
      const split = new SplitType(this, { types: "words" });
      $(split.words).attr("word", "");
      splits.push(split);
    });
    const $outgoing = $reveals.filter((_, element) => getComputedStyle(element).display !== "none");
    timeline = gsap.timeline({ onComplete: () => {
      gsap.set($incoming, { clearProps: "transform,opacity,visibility,will-change" });
      gsap.set($parent, { clearProps: "height,overflow" });
      revertHeadings();
      timeline = null;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }});

    // 01 — Hide the current results, then switch the visible items.
    timeline.to($outgoing, { autoAlpha: 0, duration: filterMotion.items.hide.duration,
      ease: filterMotion.items.hide.ease }, filterMotion.items.hide.start);
    timeline.addLabel("switch");
    timeline.call(() => {
      const height = $parent.outerHeight();
      gsap.set($parent, { height, overflow: "hidden" });
      gsap.set($reveals, { display: "none" });
      gsap.set($incoming, { display: "block", autoAlpha: 1, x: filterMotion.items.reveal.fromX });
      gsap.set($incoming.find("[h-line]"), { clipPath: "inset(0% 100% 0% 0%)" });
      $incoming.each(function () { gsap.set(headingTargets(this), { x: filterMotion.words.move.fromX, autoAlpha: 0 }); });
    }, null, "switch");

    // 02 — Resize the container alongside the incoming train.
    timeline.to($parent, { height: "auto", duration: filterMotion.container.duration,
      ease: filterMotion.container.ease }, filterMotion.container.start);
    timeline.addLabel("incoming", filterMotion.items.train.start);

    // 03 — Each result groups its movement, divider, word motion, and word fade.
    $incoming.each(function (index) {
      const group = gsap.timeline(), $item = $(this), words = headingTargets(this);
      const item = filterMotion.items.reveal, move = filterMotion.words.move, fade = filterMotion.words.fade;
      group.to($item, { x: item.toX, duration: item.duration, ease: item.ease }, item.start)
        .to($item.find("[h-line]"), { clipPath: "inset(0% 0% 0% 0%)", duration: filterMotion.divider.duration,
          ease: filterMotion.divider.ease }, filterMotion.divider.start)
        .to(words, { x: move.toX, duration: move.duration, ease: move.ease, stagger: move.stagger }, move.start)
        .to(words, { autoAlpha: 1, duration: fade.duration, ease: fade.ease, stagger: fade.stagger }, fade.start);
      timeline.add(group, `incoming+=${index * filterMotion.items.train.stagger}`);
    });
  }
  const $all = $tabs.filter('[filter-tab="all"]').first();
  const $initial = $all.length ? $all : $tabs.first();
  setActiveTab($initial, true);
  showFilter($initial.attr("filter-tab"), true);
  const unbind = bindControlActivation($tabs, "filterOne", ($tab) => {
    if ($tab.hasClass("is-active")) return;
    setActiveTab($tab);
    showFilter($tab.attr("filter-tab"));
  });
  return () => { finish(); unbind(); gsap.killTweensOf($lines); restoreTabs(); restoreStyles(); };
}

function catalogueAnimation() {
  const $selects = $("[cat-select]"), $reveals = $("[cat-reveal]");
  if (!$selects.length || !$reveals.length) return null;
  // CATALOGUE CONTROLS — visibility and layout stay in Webflow's active state.
  const catalogueControls = { activeClass: "active", initialValue: null };
  const restoreSelects = rememberAttributes($selects, ["class", "aria-pressed"]);
  const restoreReveals = rememberAttributes($reveals, ["class", "aria-hidden", "inert"]);
  function activate($select) {
    const value = $select.attr("cat-select");
    const $matches = $reveals.filter((_, element) => element.getAttribute("cat-reveal") === value);
    if (!$matches.length) return;
    $selects.removeClass(catalogueControls.activeClass).attr("aria-pressed", "false");
    $select.addClass(catalogueControls.activeClass).attr("aria-pressed", "true");
    $reveals.removeClass(catalogueControls.activeClass).attr({ "aria-hidden": "true", inert: "" });
    $matches.addClass(catalogueControls.activeClass).attr("aria-hidden", "false").removeAttr("inert");
  }
  const $initial = catalogueControls.initialValue === null ? $selects.filter(".active").first()
    : $selects.filter((_, element) => element.getAttribute("cat-select") === catalogueControls.initialValue).first();
  activate($initial.length ? $initial : $selects.first());
  const unbind = bindControlActivation($selects, "catalogueAnimation", activate);
  return () => { unbind(); restoreSelects(); restoreReveals(); };
}

function accordionOne() {
  const $wraps = $("[accord-wrap]");
  if (!$wraps.length || !window.gsap) return null;
  if (window.Flip) gsap.registerPlugin(Flip);

  // ACCORDION CONTROLS — seconds; marker movement and content reveal are independent.
  const accordionMotion = {
    marker: { start: 0, duration: 0.3, ease: "power1.in" },
    reveal: { start: 0, duration: 0.3, ease: "power1.in" },
  };
  const cleanups = [];
  $wraps.each(function (wrapIndex) {
    const wrap = this, $wrap = $(wrap);
    const $items = $wrap.find("[accord-item]").filter((_, element) => $(element).closest("[accord-wrap]")[0] === wrap);
    const $panels = $wrap.find("[accord-reveal]").filter((_, element) => $(element).closest("[accord-wrap]")[0] === wrap);
    if (!$items.length) return;
    const $marker = $items.find("[active-marker]").first();
    const marker = $marker[0], markerParent = marker && marker.parentNode, markerNext = marker && marker.nextSibling;
    const restoreItems = rememberAttributes($items, ["class", "aria-expanded", "aria-controls"]);
    const restorePanels = rememberAttributes($panels, ["id", "class", "style", "aria-hidden", "inert"]);
    const restoreMarker = rememberAttributes($marker, ["style"]);
    const panelFor = ($item) => $panels.filter((_, element) => element.getAttribute("accord-reveal") === $item.attr("accord-item")).first();
    $panels.each(function (index) {
      if (!this.id) this.id = uniqueElementId(`accordion-${wrapIndex + 1}-panel-${index + 1}`);
    });
    $items.each(function () {
      const panel = panelFor($(this))[0];
      if (panel) $(this).attr("aria-controls", panel.id);
    });

    function activate($item, immediate = false) {
      if (!immediate && $item.hasClass("active")) return;
      const $panel = panelFor($item);
      if ($panels.length && !$panel.length) return;
      let markerState;
      if (window.Flip && marker && !immediate) {
        Flip.killFlipsOf(marker);
        markerState = Flip.getState(marker);
      }
      $items.removeClass("active").attr("aria-expanded", "false");
      $item.addClass("active").attr("aria-expanded", "true");
      if (marker) $item.append(marker);
      if (markerState) Flip.from(markerState, {
        duration: accordionMotion.marker.duration, delay: accordionMotion.marker.start,
        ease: accordionMotion.marker.ease, absolute: true,
      });
      if (!$panels.length) return;
      // Kill every old reveal, so interrupted clicks cannot revive hidden panels.
      gsap.killTweensOf($panels);
      $panels.removeClass("active").attr({ "aria-hidden": "true", inert: "" });
      gsap.set($panels, { autoAlpha: 0, pointerEvents: "none" });
      $panel.addClass("active").attr("aria-hidden", "false").removeAttr("inert");
      gsap.to($panel, { autoAlpha: 1, pointerEvents: "auto",
        duration: immediate ? 0 : accordionMotion.reveal.duration,
        delay: immediate ? 0 : accordionMotion.reveal.start,
        ease: accordionMotion.reveal.ease, overwrite: true });
    }
    const $initial = $items.filter(".active").first();
    activate($initial.length ? $initial : $items.first(), true);
    const unbind = bindControlActivation($items, "accordionOne", activate);
    cleanups.push(() => {
      unbind(); gsap.killTweensOf($panels);
      if (window.Flip && marker) Flip.killFlipsOf(marker);
      if (markerParent) markerParent.insertBefore(marker, markerNext && markerNext.parentNode === markerParent ? markerNext : null);
      restoreMarker(); restoreItems(); restorePanels();
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

function footerEnginePixels() {
  const $svg = $("[footer-svg-engine]").first();
  if (!$svg.length || !window.gsap || !window.Path2D || !window.IntersectionObserver) return null;

  // FOOTER CONTROLS — sizes use the existing SVG viewBox, timings use seconds.
  const footerMotion = {
    pixels: { gap: 9, radius: 1.6, maxScale: 4, levels: 10 },
    light: { radius: 150, solidCore: 0.55, falloff: 0.78 },
    ink: { color: "#000000", opacity: 0.3, spread: 0.5 },
    glow: { color: "#ffffff", opacity: 0.1, spread: 6, blur: 0.95 },
    reveal: { start: 0, duration: 0, ease: "power1.in" },
    hide: { start: 0, duration: 0.15, ease: "power1.in" },
    performance: { maxPixelRatio: 1, maxCachePixels: 8000000 },
  };
  const svg = $svg[0];
  const view = svg.viewBox.baseVal;
  const paths = $svg.children("path").toArray();
  if (!paths.length || !view.width || !view.height) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const namespace = "http://www.w3.org/2000/svg";
  const padding = footerMotion.pixels.radius * footerMotion.pixels.maxScale * footerMotion.glow.spread + footerMotion.glow.blur * 3;
  const width = view.width + padding * 2;
  const height = view.height + padding * 2;
  let layer, canvas, context, outline, inverseMatrix, scratch, scratchContext;
  let renderScale = 0;
  let columns = [], levels = [];
  let frame = null;
  let bakeFrame = null, nextLevel = 0;
  let visible = false;
  let listening = false;
  let hovering = false;
  let geometryDirty = true;
  let destroyed = false;
  let pointer = { x: 0, y: 0 };

  // BAKE THE PIXEL FIELDS ONCE — the pointer only reveals cached image regions.
  function circleField(radius) {
    const path = new Path2D();
    columns.forEach((column) => column.points.forEach(({ x, y }) => {
      path.moveTo(x + radius, y);
      path.arc(x, y, radius, 0, Math.PI * 2);
    }));
    return path;
  }
  function bakeField(kind, radius) {
    const image = document.createElement("canvas");
    image.width = canvas.width; image.height = canvas.height;
    const paint = image.getContext("2d");
    paint.setTransform(renderScale, 0, 0, renderScale,
      (padding - view.x) * renderScale, (padding - view.y) * renderScale);
    paint.fillStyle = footerMotion[kind].color;
    if (kind === "ink") {
      paint.fill(outline);
      paint.strokeStyle = footerMotion.ink.color;
      paint.lineWidth = footerMotion.ink.spread;
      paint.stroke(outline);
      paint.globalCompositeOperation = "source-in";
      paint.fill(circleField(radius));
    } else {
      const dots = circleField(radius * footerMotion.glow.spread);
      paint.filter = `blur(${footerMotion.glow.blur * renderScale}px)`;
      paint.fill(dots);
      paint.filter = "none";
      paint.fill(dots);
    }
    return image;
  }

  // Prepare one size per frame so first entry does not stall scrolling.
  function bakeNext() {
    bakeFrame = null;
    if (!listening || destroyed || nextLevel >= levels.length) return;
    const level = levels[nextLevel++];
    level.ink = bakeField("ink", level.pixelRadius);
    level.glow = bakeField("glow", level.pixelRadius);
    scheduleFrame();
    if (nextLevel < levels.length) bakeFrame = requestAnimationFrame(bakeNext);
  }
  function scheduleBake() {
    if (bakeFrame === null && nextLevel < levels.length) bakeFrame = requestAnimationFrame(bakeNext);
  }

  function buildArtwork() {
    if (canvas) return;
    outline = new Path2D();
    paths.forEach((path) => outline.addPath(new Path2D(path.getAttribute("d"))));
    const sample = document.createElement("canvas").getContext("2d");
    const gap = footerMotion.pixels.gap;
    for (let x = view.x + gap / 2; x < view.x + view.width; x += gap) {
      const points = [];
      for (let y = view.y + gap / 2; y < view.y + view.height; y += gap) {
        if (sample.isPointInPath(outline, x, y)) points.push({ x, y });
      }
      columns.push({ x, points });
    }
    for (let index = 0; index < footerMotion.pixels.levels; index++) {
      const fraction = index / Math.max(1, footerMotion.pixels.levels - 1);
      const radius = footerMotion.pixels.radius * (1 + fraction * (footerMotion.pixels.maxScale - 1));
      levels.push({
        radius: footerMotion.light.radius * (1 - fraction * footerMotion.light.falloff),
        pixelRadius: radius,
      });
    }
    layer = document.createElementNS(namespace, "foreignObject");
    Object.entries({ x: view.x - padding, y: view.y - padding, width, height,
      "footer-svg-pixel-layer": "", "aria-hidden": "true" }).forEach(([name, value]) => layer.setAttribute(name, value));
    canvas = document.createElement("canvas");
    canvas.setAttribute("footer-pixel-canvas", "");
    canvas.style.cssText = "display:block;width:100%;height:100%;pointer-events:none";
    context = canvas.getContext("2d");
    scratch = document.createElement("canvas");
    scratchContext = scratch.getContext("2d");
    layer.appendChild(canvas);
    svg.appendChild(layer);
  }

  // MEASURE ONLY ON ENTRY / RESIZE / SCROLL — pointer events just store coordinates.
  function measure() {
    const matrix = svg.getScreenCTM();
    if (!matrix || !matrix.a || !matrix.d) return false;
    inverseMatrix = matrix.inverse();
    const ratio = Math.min(window.devicePixelRatio || 1, footerMotion.performance.maxPixelRatio);
    const scale = Math.min(Math.hypot(matrix.a, matrix.b) * ratio,
      Math.sqrt(footerMotion.performance.maxCachePixels / (width * height * 2 * levels.length)));
    const pixelWidth = Math.ceil(width * scale), pixelHeight = Math.ceil(height * scale);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      renderScale = scale;
      canvas.width = pixelWidth; canvas.height = pixelHeight;
      context.setTransform(scale, 0, 0, scale, (padding - view.x) * scale, (padding - view.y) * scale);
      scratch.width = scratch.height = Math.ceil(footerMotion.light.radius * 2 * scale);
      nextLevel = 0;
      levels.forEach((level) => {
        level.ink = level.glow = null;
        const centre = footerMotion.light.radius * scale;
        level.mask = scratchContext.createRadialGradient(centre, centre, 0, centre, centre, level.radius * scale);
        level.mask.addColorStop(0, "#fff");
        level.mask.addColorStop(footerMotion.light.solidCore, "#fff");
        level.mask.addColorStop(1, "rgba(255,255,255,0)");
      });
    }
    scheduleBake();
    geometryDirty = false;
    return true;
  }

  // POINTER REVEAL — one scheduled frame, small cached image crops, no cursor tween.
  function render() {
    frame = null;
    if (!visible || !hovering || document.hidden || destroyed) return;
    if (geometryDirty && !measure()) return;
    const x = pointer.x * inverseMatrix.a + pointer.y * inverseMatrix.c + inverseMatrix.e;
    const y = pointer.x * inverseMatrix.b + pointer.y * inverseMatrix.d + inverseMatrix.f;
    const radius = footerMotion.light.radius;
    const left = x - radius, top = y - radius;
    context.clearRect(view.x - padding, view.y - padding, width, height);
    ["glow", "ink"].forEach((kind) => {
      context.globalAlpha = footerMotion[kind].opacity;
      levels.forEach((level) => {
        if (!level[kind]) return;
        scratchContext.clearRect(0, 0, scratch.width, scratch.height);
        scratchContext.globalCompositeOperation = "source-over";
        scratchContext.drawImage(level[kind], -(left - view.x + padding) * renderScale, -(top - view.y + padding) * renderScale);
        scratchContext.globalCompositeOperation = "destination-in";
        scratchContext.fillStyle = level.mask;
        scratchContext.fillRect(0, 0, scratch.width, scratch.height);
        context.drawImage(scratch, left, top, scratch.width / renderScale, scratch.height / renderScale);
      });
    });
    context.globalAlpha = 1;
  }

  function scheduleFrame() {
    if (frame === null && hovering && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function move(event) {
    pointer = { x: event.clientX, y: event.clientY };
    if (!hovering) {
      hovering = true;
      geometryDirty = true;
      const motion = footerMotion.reveal;
      gsap.to(layer, { opacity: 1, delay: motion.start, duration: motion.duration, ease: motion.ease, overwrite: true });
    }
    scheduleFrame();
  }
  function leave() {
    hovering = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (layer) {
      const motion = footerMotion.hide;
      gsap.to(layer, { opacity: 0, delay: motion.start, duration: motion.duration, ease: motion.ease, overwrite: true });
    }
  }
  function invalidateGeometry() {
    geometryDirty = true;
    scheduleFrame();
  }

  // VISIBILITY LIFECYCLE — attach work only while the footer is on screen.
  function syncActivity() {
    const active = visible && !document.hidden && !reducedMotion.matches && !destroyed;
    if (active === listening) return;
    listening = active;
    if (active) {
      buildArtwork();
      geometryDirty = true;
      measure();
      $svg.on("pointerenter.footerEnginePixels pointermove.footerEnginePixels", move)
        .on("pointerleave.footerEnginePixels", leave);
      window.addEventListener("resize", invalidateGeometry, { passive: true });
      window.addEventListener("scroll", invalidateGeometry, { passive: true });
    } else {
      if (bakeFrame !== null) cancelAnimationFrame(bakeFrame);
      bakeFrame = null;
      $svg.off(".footerEnginePixels");
      window.removeEventListener("resize", invalidateGeometry);
      window.removeEventListener("scroll", invalidateGeometry);
      leave();
      if (layer) { gsap.killTweensOf(layer); layer.style.opacity = "0"; }
    }
  }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncActivity(); });
  observer.observe(svg);
  document.addEventListener("visibilitychange", syncActivity);
  reducedMotion.addEventListener("change", syncActivity);

  return () => {
    destroyed = true;
    syncActivity();
    observer.disconnect();
    document.removeEventListener("visibilitychange", syncActivity);
    reducedMotion.removeEventListener("change", syncActivity);
    if (layer) { gsap.killTweensOf(layer); layer.remove(); }
    columns = levels = [];
  };
}

// SMALL DOM HELPERS — used only by this site's interactive controls.
function rememberAttributes($elements, names) {
  const originals = $elements.toArray().map((element) => ({ element,
    values: names.map((name) => [name, element.getAttribute(name)]) }));
  return () => originals.forEach(({ element, values }) => values.forEach(([name, value]) => {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }));
}

function uniqueElementId(prefix) {
  let id = prefix, suffix = 1;
  while (document.getElementById(id)) id = `${prefix}-${suffix++}`;
  return id;
}

function bindControlActivation($controls, namespace, activate) {
  const restore = rememberAttributes($controls, ["role", "tabindex"]);
  $controls.each(function () {
    if (!this.matches("button,input,select,textarea")) $(this).attr({ role: "button", tabindex: "0" });
  });
  $controls.on(`click.${namespace}`, function (event) { event.preventDefault(); activate($(this)); })
    .on(`keydown.${namespace}`, function (event) {
      if (event.target !== this || (event.key !== "Enter" && event.key !== " ")) return;
      if (this.matches("button,input,select,textarea") || (this.matches("a[href]") && event.key === "Enter")) return;
      event.preventDefault(); activate($(this));
    });
  return () => { $controls.off(`.${namespace}`); restore(); };
}

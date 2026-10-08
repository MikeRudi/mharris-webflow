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
    catalogueAnimation(), homeFaqAnimation(), homeBackgroundMotion(), dropTextAnimation(), flexGrowAnimation()];

  if (window.gsap) {
    const desktop = onDesktop(() => {
      const lineCleanup = lineHover();
      const homeCleanup = homeAnimation();
      const footerCleanup = footerEnginePixels();
      const teamCleanup = teamProfilesAnimation();
      return () => [teamCleanup, footerCleanup, homeCleanup, lineCleanup].forEach((cleanup) => cleanup && cleanup());
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
      move: { start: 0, duration: 0.11, ease: "power1.in", y: "-20rem", scale: 0.9, stagger: { amount: 0.02, from: "end" } },
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
      start: "logos:end+=0.02",
      enter: { start: 0, duration: 0.065, ease: "power1.in", fromY: "10rem", fromScale: 0.9, scale: 1 },
      reveal: { start: "enter", duration: 0.05, ease: "power1.in" },
      leave: { start: "enter:end+=0.045", duration: 0.065, ease: "power1.in", y: "-20rem", scale: 0.9 },
      hide: { start: "leave", duration: 0.05, ease: "power1.in" },
    },
    // 04 — Third scene enters and holds naturally until the screen opens.
    thirdScene: {
      start: "secondScene.leave:end",
      enter: { start: 0, duration: 0.065, ease: "power1.in", fromY: "10rem", fromScale: 0.9, scale: 1 },
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
      textLeave: { start: "clip", duration: 0.18, ease: "power1.in", scale: 0.9 },
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
    scale: { start: 0, duration: 1.2, ease: "power2.out", from: 0.9, to: 1 },
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
  gsap.set($("[home-start-up]").not("[home-resting]"), { scale: homeEntrance.scale.from });

  // CARD BACKGROUND — seconds for idle/drag; framing uses firstScene.sphere above.
  const homeCardMotion = {
    idle: { cycleSeconds: 48, axisDegrees: 45, scrollSpeedMultiplier: 3 },
    drag: { duration: 0.6, ease: "power2.out", degreesPerPixel: 0.25 },
    layout: { horizontalSpread: 1.12, verticalSpread: 0.6 },
    framing: { scale: 0.78, radiusScale: 0.9, offsetYRem: 2, riseYRem: -18 },
    opacity: { back: 0.08, front: 1, ease: "power1.inOut" },
  };
  const cardOpacityEase = gsap.parseEase(homeCardMotion.opacity.ease);
  const $homeResting = $("[home-resting]");
  const $homeRestingDragSurface = $("[home-start]");
  const homeRestingView = { progress: 0 };
  const homeRestingLayoutOffset = { x: 0, y: 0 };
  let homeRestingRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const homeRestingRadiusScale = homeCardMotion.framing.radiusScale;
  const homeRestingMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const homeRestingMatrixTemp = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const homeRestingRotationMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const homeRestingSmooth = { x: 0, y: 0 };
  let homeRestingPreviousX = 0;
  let homeRestingPreviousY = 0;
  let homeRestingSphere = [];

  function buildHomeRestingSphere() {
    homeRestingRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
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

    // Spread left and lift the lower rows, anchored to the authored top/right.
    // These are layout offsets, independent of scroll and the rotating matrix.
    const right = Math.max(...restingItems.map((item) => item.x - centerX)) * homeRestingRadiusScale;
    const top = Math.min(...restingItems.map((item) => item.y - centerY)) * homeRestingRadiusScale;
    homeRestingLayoutOffset.x = right * (1 - homeCardMotion.layout.horizontalSpread);
    homeRestingLayoutOffset.y = top * (1 - homeCardMotion.layout.verticalSpread);

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
    const viewY = homeCardMotion.framing.riseYRem * homeRestingRem * homeRestingView.progress;

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
        x * homeRestingRadiusScale * homeCardMotion.layout.horizontalSpread +
          homeRestingLayoutOffset.x - item.screenX
      );
      item.setY(
        -y * homeRestingRadiusScale * homeCardMotion.layout.verticalSpread +
          homeRestingLayoutOffset.y + homeCardMotion.framing.offsetYRem * homeRestingRem +
          viewY - item.screenY
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

    rotateHomeRestingMatrix(rotationX, rotationY);
    renderHomeRestingSphere();
  }

  function rotateHomeRestingMatrix(rotationX, rotationY) {
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

    const speed = gsap.utils.interpolate(1, homeCardMotion.idle.scrollSpeedMultiplier, homeRestingView.progress);
    const rotation = (Math.min(deltaTime, 32) / 1000) * (360 / homeCardMotion.idle.cycleSeconds) * speed * Math.PI / 180;
    const direction = (homeCardMotion.idle.axisDegrees * Math.PI) / 180;

    // Advance directly every frame. Drag tweens smooth only pointer input, so
    // repeatedly restarting them cannot damp or delay the background rotation.
    rotateHomeRestingMatrix(Math.sin(direction) * rotation, Math.cos(direction) * rotation);
    renderHomeRestingSphere();
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
    .to($("[home-start-up]").not("[home-resting]"), { scale: homeEntrance.scale.to, duration: homeEntrance.scale.duration, ease: homeEntrance.scale.ease }, homeEntrance.scale.start)
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
    addHomeStep(group, "move", $content, { y: 0, scale: 1 }, { y: motion.move.y, scale: motion.move.scale }, motion.move);
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
    addHomeStep(group, "enter", $content, { y: motion.enter.fromY, scale: motion.enter.fromScale }, { y: 0, scale: motion.enter.scale }, motion.enter);
    addHomeStep(group, "reveal", $content, { opacity: 0 }, { opacity: 1 }, motion.reveal);
    addHomeStep(group, "leave", $content, { y: 0, scale: motion.enter.scale }, { y: motion.leave.y, scale: motion.leave.scale }, motion.leave);
    addHomeStep(group, "hide", $content, { opacity: 1 }, { opacity: 0 }, motion.hide);
  });

  // 04 — Third scene remains in place until the clip reveals the next layer.
  addHomeGroup("thirdScene", (group, motion) => {
    const $content = $("[home-third-up]");
    addHomeStep(group, "enter", $content, { y: motion.enter.fromY, scale: motion.enter.fromScale }, { y: 0, scale: motion.enter.scale }, motion.enter);
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
    addHomeStep(group, "textLeave", $("[home-third-up]"), { scale: 1 }, { scale: motion.textLeave.scale }, motion.textLeave);
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
      buildHomeRestingSphere();
      renderHomeRestingSphere();
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

function teamProfilesAnimation() {
  if (!window.gsap) return null;

  // TEAM CIRCLES — distances/speeds are px and px/second; times are seconds.
  const teamMotion = {
    layout: { hiddenCircles: ["02", "06", "07", "08"] }, // Remove one photo and its three white satellites.
    float: { x: 12, y: 9, cycleSeconds: 14, resumeSeconds: 1.2, jointVariation: 1 },
    drag: { velocityMultiplier: 0.68, maxSpeed: 748, holdSeconds: 0.1, followMomentum: 0.8, sampleMs: 90, releasePauseMs: 100 },
    throw: { friction: 2.6, stopSpeed: 3 }, // Higher friction stops a throw sooner.
    links: { elasticity: 0.06, settleSeconds: 0.65, photoMass: 6 }, // Photos lead; lighter satellites follow.
    collision: { gap: 1, bounce: 0.45, lineGap: 2 }, // Circles and connectors both take part.
    repel: { gap: -18, range: 12, strength: 240 }, // Allow some overlap, then ease circles out slowly.
    walls: { inset: 2, bounce: 0.72 }, // 0 = no rebound; 1 = no energy lost.
  };

  // The new Designer artwork still has some class-only elements. Add matching
  // runtime hooks once; all motion below uses attributes. No Webflow edit needed.
  const addedHooks = [];
  ["section-teams", "teams-layout", "teams-header", "team-profile-group", "team-profile-node", "team-profile-lines", "text", "btn-2-brand", "team-list"].forEach((name) => {
    const selector = ["text", "btn-2-brand", "team-list"].includes(name)
      ? `.teams-layout .${name}, [teams-layout] .${name}`
      : ["teams-header", "teams-layout", "section-teams"].includes(name) ? `.${name}` : `.teams-header .${name}, [teams-header] .${name}`;
    $(selector)
      .each(function () {
        if (!this.hasAttribute(name)) { this.setAttribute(name, ""); addedHooks.push([this, name]); }
      });
  });
  const cleanups = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  $("[teams-header]").each(function (sectionIndex) {
    const header = this, $header = $(header), $nodes = $header.find("[team-profile-node]");
    const boundary = $header.closest("[section-teams]")[0] || header;
    const layout = $header.closest("[teams-layout]")[0] || boundary;
    if (!$nodes.length) return;
    // A list/button already protects its contents; avoid overlapping duplicate zones.
    const $content = $(layout).find("[text], [btn-2-brand], [team-list]").filter(function () {
      return !$(this).closest("[team-profile-node]").length &&
        !$(this).parentsUntil(layout).filter("[text], [btn-2-brand], [team-list]").length;
    });
    const namespace = `.teamProfiles${sectionIndex}`;
    const $sourceSvgs = $header.find("[team-profile-lines]");
    const $lines = $sourceSvgs.find("line");
    const restoreNodes = rememberAttributes($nodes, ["style"]);
    const restoreSvgs = rememberAttributes($sourceSvgs, ["style"]);
    const allNodes = $nodes.toArray().map((element, index) => ({
      element, group: $(element).closest("[team-profile-group]")[0],
      enabled: !teamMotion.layout.hiddenCircles.some((id) => element.classList.contains(`is-${id}`) || element.classList.contains(`team-profile-position-${id}`)),
      draggable: [...element.querySelectorAll("img")].some((image) => Number(getComputedStyle(image).opacity) > 0.01 && getComputedStyle(image).visibility !== "hidden"),
      phase: index * 2.39996, speed: 1 + (index % 5) * 0.07,
      baseX: 0, baseY: 0, x: 0, y: 0, vx: 0, vy: 0,
      tx: 0, ty: 0, blend: 0, floatX: 0, floatY: 0, neighbors: [],
      minX: 0, maxX: 0, minY: 0, maxY: 0,
    }));
    const nodes = allNodes.filter((node) => node.enabled);
    const byElement = new Map(nodes.map((node) => [node.element, node]));
    const pairs = nodes.flatMap((a, index) => nodes.slice(index + 1).map((b) => ({ a, b })));
    const edges = $lines.toArray().map((element) => ({ element, svg: element.ownerSVGElement, stretch: 0 }));
    let layer = null, contentBoxes = [];
    let width = 0, height = 0, scaleX = 1, scaleY = 1, clock = 0, motionStep = 4;
    let visible = !window.IntersectionObserver, active = false, destroyed = false;
    let geometryDirty = true, paintDirty = true, drag = null;
    allNodes.forEach((node) => {
      const interactive = node.enabled && node.draggable;
      $(node.element).css({ pointerEvents: interactive ? "auto" : "none", cursor: interactive ? "grab" : "default", touchAction: interactive ? "none" : "auto", userSelect: "none" });
      // Keep authored geometry available when mapping the original SVG endpoints.
      if (!node.enabled) node.element.style.visibility = "hidden";
    });

    // GEOMETRY — measure on entry/resize, never all circles inside the frame loop.
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    function measure() {
      const rect = header.getBoundingClientRect();
      if (!rect.width || !rect.height || !header.offsetWidth || !header.offsetHeight) return false;
      const oldWidth = width, oldHeight = height;
      // Keep fractional CSS sizes so SVG endpoints and translated circles align.
      width = $header.outerWidth(); height = $header.outerHeight();
      scaleX = rect.width / width; scaleY = rect.height / height;
      const walls = boundary.getBoundingClientRect();
      contentBoxes = $content.toArray().map((element) => {
        const box = element.getBoundingClientRect();
        return box.width && box.height ? { left: (box.left - rect.left) / scaleX,
          right: (box.right - rect.left) / scaleX, top: (box.top - rect.top) / scaleY,
          bottom: (box.bottom - rect.top) / scaleY } : null;
      }).filter(Boolean);
      allNodes.forEach((node) => {
        const bounds = node.element.getBoundingClientRect();
        const offsetX = oldWidth ? (node.x - node.baseX) * width / oldWidth : 0;
        const offsetY = oldHeight ? (node.y - node.baseY) * height / oldHeight : 0;
        node.baseX = (bounds.left + bounds.width / 2 - rect.left) / scaleX - node.tx;
        node.baseY = (bounds.top + bounds.height / 2 - rect.top) / scaleY - node.ty;
        node.radius = Math.max(bounds.width / scaleX, bounds.height / scaleY) / 2;
        const radiusX = bounds.width / scaleX / 2 + teamMotion.walls.inset;
        const radiusY = bounds.height / scaleY / 2 + teamMotion.walls.inset;
        node.minX = (walls.left - rect.left) / scaleX + Math.min(walls.width / scaleX / 2, radiusX);
        node.minY = (walls.top - rect.top) / scaleY + Math.min(walls.height / scaleY / 2, radiusY);
        node.maxX = Math.max(node.minX, (walls.right - rect.left) / scaleX - radiusX);
        node.maxY = Math.max(node.minY, (walls.bottom - rect.top) / scaleY - radiusY);
        node.x = node.baseX + offsetX; node.y = node.baseY + offsetY;
      });
      const matrices = new Map();
      edges.forEach((edge) => {
        if (edge.from) return;
        if (!matrices.has(edge.svg)) {
          const matrix = edge.svg.getScreenCTM();
          if (matrix && matrix.a * matrix.d !== matrix.b * matrix.c) {
            const inverse = matrix.inverse();
            matrices.set(edge.svg, {
              a: inverse.a * scaleX, b: inverse.b * scaleX,
              c: inverse.c * scaleY, d: inverse.d * scaleY,
              e: inverse.a * rect.left + inverse.c * rect.top + inverse.e,
              f: inverse.b * rect.left + inverse.d * rect.top + inverse.f,
            });
          }
        }
        edge.matrix = matrices.get(edge.svg);
        if (!edge.matrix) return;
        const group = $(edge.svg).closest("[team-profile-group]")[0];
        const candidates = allNodes.filter((node) => node.group === group);
        const nearest = (end) => {
          const x = Number(edge.element.getAttribute(`x${end}`));
          const y = Number(edge.element.getAttribute(`y${end}`));
          let match = null, distance = Infinity;
          candidates.forEach((node) => {
            const point = svgPoint(edge.matrix, node.baseX, node.baseY);
            const next = Math.hypot(point.x - x, point.y - y);
            if (next < distance) { match = node; distance = next; }
          });
          return match;
        };
        // Bind the authored endpoints once. Never rematch circles during a drag.
        edge.from = nearest(1); edge.to = nearest(2);
        if (edge.from?.enabled && edge.to?.enabled && edge.from !== edge.to) {
          edge.from.neighbors.push(edge.to); edge.to.neighbors.push(edge.from);
        }
      });
      edges.forEach((edge) => {
        if (!edge.from?.enabled || !edge.to?.enabled || edge.from === edge.to) return;
        // Responsive layout may change the authored length; dragging never does.
        edge.length = Math.hypot(edge.to.baseX - edge.from.baseX, edge.to.baseY - edge.from.baseY);
        edge.targetLength = edge.length * (1 + edge.stretch);
      });
      nodes.forEach((node) => {
        if (node.network) return;
        const members = connectedTo(node);
        members.forEach((member) => {
          member.network = members; member.floatPhase = node.phase; member.floatSpeed = node.speed;
        });
      });
      motionStep = Math.max(1, Math.min(4, ...nodes.map((node) => node.radius / 2)));
      if (!layer && edges.some((edge) => edge.length)) buildLineLayer();
      if (layer) layer.setAttribute("viewBox", `0 0 ${width} ${height}`);
      solveLinks();
      geometryDirty = false;
      return true;
    }
    function svgPoint(matrix, x, y) {
      return { x: matrix.a * x + matrix.c * y + matrix.e, y: matrix.b * x + matrix.d * y + matrix.f };
    }
    // One header-sized SVG avoids the nested group/SVG clipping rectangles.
    // Copy the authored lines (and their colours), leaving Designer markup intact.
    function buildLineLayer() {
      layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      layer.setAttribute("class", "team-profile-lines");
      layer.setAttribute("team-profile-connector-layer", "");
      layer.setAttribute("aria-hidden", "true");
      layer.setAttribute("focusable", "false");
      layer.setAttribute("preserveAspectRatio", "none");
      layer.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none";
      edges.forEach((edge) => {
        if (!edge.length) return;
        edge.draw = edge.element.cloneNode(false);
        edge.draw.removeAttribute("id");
        layer.appendChild(edge.draw);
      });
      header.prepend(layer);
      $sourceSvgs.css("display", "none");
    }
    function paint() {
      nodes.forEach((node) => {
        node.tx = node.x - node.baseX; node.ty = node.y - node.baseY;
        node.element.style.translate = `${node.tx}px ${node.ty}px`;
      });
      edges.forEach((edge) => {
        if (!edge.draw) return;
        edge.draw.setAttribute("x1", edge.from.x.toFixed(3));
        edge.draw.setAttribute("y1", edge.from.y.toFixed(3));
        edge.draw.setAttribute("x2", edge.to.x.toFixed(3));
        edge.draw.setAttribute("y2", edge.to.y.toFixed(3));
      });
      paintDirty = false;
    }

    // CONNECTED JOINTS + COLLISIONS — free angles, nearly fixed link lengths.
    // Solve both together so a bump also moves the circles attached to that circle.
    function inverseMass(node) {
      return (drag?.node === node ? 0.1 : 1) / (node.draggable ? teamMotion.links.photoMass : 1);
    }
    function solveLinks() {
      for (let pass = 0; pass < 160; pass++) {
        edges.forEach((edge) => {
          if (!edge.length) return;
          const a = edge.from, b = edge.to;
          // Let the grabbed circle yield a little when its network is squeezed.
          const weightA = inverseMass(a), weightB = inverseMass(b);
          const dx = b.x - a.x, dy = b.y - a.y;
          const distance = Math.hypot(dx, dy) || 0.001;
          const correction = (distance - edge.targetLength) / distance / (weightA + weightB);
          const correctionX = dx * correction, correctionY = dy * correction;
          a.x += correctionX * weightA; a.y += correctionY * weightA;
          b.x -= correctionX * weightB; b.y -= correctionY * weightB;
        });
        resolveCollisions();
        const lineContact = resolveLineCollisions();
        nodes.forEach((node) => {
          node.x = clamp(node.x, node.minX, node.maxX);
          node.y = clamp(node.y, node.minY, node.maxY);
        });
        const settled = edges.every((edge) => !edge.length ||
          Math.abs(Math.hypot(edge.to.x - edge.from.x, edge.to.y - edge.from.y) - edge.targetLength) < 0.015) &&
          pairs.every(({ a, b }) => Math.hypot(b.x - a.x, b.y - a.y) >= a.radius + b.radius + teamMotion.collision.gap - 0.015) && !lineContact;
        if (settled) break;
      }
    }
    function resolveCollisions() {
      pairs.forEach(({ a, b }) => {
        const dx = b.x - a.x, dy = b.y - a.y;
        const minimum = a.radius + b.radius + teamMotion.collision.gap;
        if (dx * dx + dy * dy > (minimum + 0.02) ** 2) return;
        const distance = Math.hypot(dx, dy);
        const nx = distance > 0.001 ? dx / distance : 1, ny = distance > 0.001 ? dy / distance : 0;
        // The held circle can yield slightly when squeezed against a wall.
        const weightA = inverseMass(a), weightB = inverseMass(b);
        const correction = Math.max(0, minimum - distance) / (weightA + weightB);
        a.x -= nx * correction * weightA; a.y -= ny * correction * weightA;
        b.x += nx * correction * weightB; b.y += ny * correction * weightB;
        const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (closing >= 0 || reducedMotion.matches) return;
        const impulse = -(1 + teamMotion.collision.bounce) * closing / (weightA + weightB);
        a.vx -= nx * impulse * weightA; a.vy -= ny * impulse * weightA;
        b.vx += nx * impulse * weightB; b.vy += ny * impulse * weightB;
      });
    }
    function connectedTo(node) {
      const members = new Set([node]);
      members.forEach((item) => item.neighbors.forEach((neighbor) => members.add(neighbor)));
      return members;
    }
    // CONNECTOR COLLISIONS — circles push the closest point on a line; unrelated
    // lines separate when they cross. Shared photo joints remain free to rotate.
    function resolveLineCollisions() {
      let contact = false;
      const liveEdges = edges.filter((edge) => edge.length);
      liveEdges.forEach((edge) => {
        const a = edge.from, b = edge.to;
        nodes.forEach((node) => {
          if (node === a || node === b) return;
          const dx = b.x - a.x, dy = b.y - a.y, square = dx * dx + dy * dy;
          if (!square) return;
          const t = clamp(((node.x - a.x) * dx + (node.y - a.y) * dy) / square, 0, 1);
          const x = node.x - a.x - dx * t, y = node.y - a.y - dy * t;
          const distance = Math.hypot(x, y), depth = node.radius + teamMotion.collision.lineGap - distance;
          if (depth <= 0.015) return;
          contact = true;
          const nx = distance > 0.001 ? x / distance : -dy / Math.sqrt(square);
          const ny = distance > 0.001 ? y / distance : dx / Math.sqrt(square);
          const wa = inverseMass(a), wb = inverseMass(b), wn = inverseMass(node);
          const weight = wn + wa * (1 - t) ** 2 + wb * t * t;
          const move = depth / weight;
          node.x += nx * move * wn; node.y += ny * move * wn;
          a.x -= nx * move * wa * (1 - t); a.y -= ny * move * wa * (1 - t);
          b.x -= nx * move * wb * t; b.y -= ny * move * wb * t;
          const closing = (node.vx - a.vx * (1 - t) - b.vx * t) * nx + (node.vy - a.vy * (1 - t) - b.vy * t) * ny;
          if (closing >= 0 || reducedMotion.matches) return;
          const impulse = -(1 + teamMotion.collision.bounce) * closing / weight;
          node.vx += nx * impulse * wn; node.vy += ny * impulse * wn;
          a.vx -= nx * impulse * wa * (1 - t); a.vy -= ny * impulse * wa * (1 - t);
          b.vx -= nx * impulse * wb * t; b.vy -= ny * impulse * wb * t;
        });
      });
      liveEdges.forEach((first, index) => liveEdges.slice(index + 1).forEach((second) => {
        const a = first.from, b = first.to, c = second.from, d = second.to;
        if (a === c || a === d || b === c || b === d) return;
        const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
        if (cross(a, b, c) * cross(a, b, d) >= 0 || cross(c, d, a) * cross(c, d, b) >= 0) return;
        // Smallest translation along either segment's normal separates the crossing.
        const options = [];
        [[a, b], [c, d]].forEach(([p, q]) => {
          const length = Math.hypot(q.x - p.x, q.y - p.y);
          if (!length) return;
          const nx = -(q.y - p.y) / length, ny = (q.x - p.x) / length;
          const project = (node) => node.x * nx + node.y * ny;
          const aa = project(a), bb = project(b), cc = project(c), dd = project(d);
          options.push({ nx, ny, depth: Math.max(aa, bb) - Math.min(cc, dd) + teamMotion.collision.lineGap },
            { nx: -nx, ny: -ny, depth: Math.max(cc, dd) - Math.min(aa, bb) + teamMotion.collision.lineGap });
        });
        if (!options.length) return;
        const hit = options.reduce((best, next) => next.depth < best.depth ? next : best);
        const wa = inverseMass(a) + inverseMass(b), wb = inverseMass(c) + inverseMass(d), total = wa + wb;
        [a, b].forEach((node) => { node.x -= hit.nx * hit.depth * wa / total; node.y -= hit.ny * hit.depth * wa / total; });
        [c, d].forEach((node) => { node.x += hit.nx * hit.depth * wb / total; node.y += hit.ny * hit.depth * wb / total; });
        contact = true;
      }));
      return contact;
    }
    // CONTENT REPULSION — negative gap permits overlap; force eases circles out.
    function contentContact(node, box) {
      const dx = node.x - clamp(node.x, box.left, box.right);
      const dy = node.y - clamp(node.y, box.top, box.bottom);
      const distance = Math.hypot(dx, dy), radius = Math.max(0, node.radius + teamMotion.repel.gap);
      if (distance > 0.001) return { nx: dx / distance, ny: dy / distance, clearance: distance - radius };
      const exits = [{ nx: -1, ny: 0, depth: node.x - box.left }, { nx: 1, ny: 0, depth: box.right - node.x },
        { nx: 0, ny: -1, depth: node.y - box.top }, { nx: 0, ny: 1, depth: box.bottom - node.y }];
      const exit = exits.reduce((best, next) => next.depth < best.depth ? next : best);
      return { nx: exit.nx, ny: exit.ny, clearance: -exit.depth - radius };
    }
    function repelContent(node, dt) {
      let repelling = false;
      contentBoxes.forEach((box) => {
        const { nx, ny, clearance } = contentContact(node, box);
        if (clearance >= teamMotion.repel.range) return;
        repelling = true;
        const proximity = 1 - clamp(clearance / teamMotion.repel.range, 0, 1);
        const push = teamMotion.repel.strength * proximity * proximity * dt;
        node.vx += nx * push; node.vy += ny * push;
      });
      capVelocity(node);
      return repelling;
    }
    function advanceDrag() {
      if (!drag.pending) return;
      const root = drag.node, dx = drag.x - root.x, dy = drag.y - root.y;
      const before = [...drag.members].map((node) => ({ node, x: node.x, y: node.y }));
      const now = performance.now(), seconds = Math.max(1 / 120, (now - drag.appliedAt) / 1000);
      drag.pending = false; drag.appliedAt = now;
      // Sweep through fast pointer jumps in small steps; no circle can teleport
      // through another circle between pointer events, including linked neighbors.
      const count = Math.max(1, Math.ceil(Math.hypot(dx, dy) / motionStep));
      const startX = root.x, startY = root.y;
      for (let index = 1; index <= count; index++) {
        const x = startX + dx * index / count, y = startY + dy * index / count;
        root.x = x; root.y = y;
        updateLinkLengths(0);
        solveLinks();
        // Stop a blocked sweep at the obstacle instead of repeatedly forcing the
        // network through it. The next pointer event can move around the obstacle.
        if (Math.hypot(root.x - x, root.y - y) > motionStep) break;
      }
      if (!reducedMotion.matches) before.forEach(({ node, x, y }) => {
        if (node === root) return;
        // Keep the outer circles' own momentum: they swing around their joint
        // instead of freezing during a grab or receiving one shared throw.
        node.vx += (node.x - x) / seconds * teamMotion.drag.followMomentum;
        node.vy += (node.y - y) / seconds * teamMotion.drag.followMomentum;
        capVelocity(node);
      });
    }
    function capVelocity(node) {
      const amount = Math.min(1, teamMotion.drag.maxSpeed / (Math.hypot(node.vx, node.vy) || 1));
      node.vx *= amount; node.vy *= amount;
    }
    function updateLinkLengths(dt) {
      edges.forEach((edge) => {
        if (!edge.length) return;
        if (drag?.members.has(edge.from)) {
          const extension = Math.hypot(edge.to.x - edge.from.x, edge.to.y - edge.from.y) / edge.length - 1;
          edge.stretch = reducedMotion.matches ? 0 : clamp(extension, -teamMotion.links.elasticity, teamMotion.links.elasticity);
        } else edge.stretch *= reducedMotion.matches ? 0 : Math.exp(-dt / teamMotion.links.settleSeconds);
        edge.targetLength = edge.length * (1 + edge.stretch);
      });
    }

    // FLOAT + THROW — small physics steps keep chains stable even on slow frames.
    function step(dt) {
      const moving = !reducedMotion.matches;
      if (moving) clock += dt;
      const decay = Math.exp(-teamMotion.throw.friction * dt);
      const travel = teamMotion.throw.friction > 0 ? (1 - decay) / teamMotion.throw.friction : dt;
      nodes.forEach((node) => {
        if (!moving || drag?.node === node) return;
        const repelling = repelContent(node, dt);
        node.x += node.vx * travel; node.y += node.vy * travel;
        node.vx *= decay; node.vy *= decay;
        if (!repelling && Math.hypot(node.vx, node.vy) < teamMotion.throw.stopSpeed) node.vx = node.vy = 0;
        node.blend = Math.min(1, node.blend + dt / teamMotion.float.resumeSeconds);
        const blend = node.blend * node.blend * (3 - 2 * node.blend);
        const cycle = clock * Math.PI * 2 / teamMotion.float.cycleSeconds;
        const phase = cycle * node.floatSpeed + node.floatPhase;
        const jointPhase = cycle * node.speed + node.phase;
        const variation = node.network.size > 1 ? teamMotion.float.jointVariation : 0;
        // Float the group together, with a little independent movement at joints.
        const floatX = (Math.sin(phase) + Math.sin(jointPhase) * variation) * teamMotion.float.x * blend;
        const floatY = (Math.cos(phase * 0.83) + Math.cos(jointPhase * 0.83) * variation) * teamMotion.float.y * blend;
        node.x += floatX - node.floatX; node.y += floatY - node.floatY;
        node.floatX = floatX; node.floatY = floatY;
      });
      if (drag) advanceDrag();
      updateLinkLengths(dt);
      solveLinks();
      nodes.forEach((node) => {
        if ((node.x <= node.minX + 0.02 && node.vx < 0) || (node.x >= node.maxX - 0.02 && node.vx > 0)) node.vx *= -teamMotion.walls.bounce;
        if ((node.y <= node.minY + 0.02 && node.vy < 0) || (node.y >= node.maxY - 0.02 && node.vy > 0)) node.vy *= -teamMotion.walls.bounce;
      });
      // Share momentum along connections, allowing their joints to turn freely.
      for (let pass = 0; pass < 4; pass++) edges.forEach((edge) => {
        if (!edge.length) return;
        const a = edge.from, b = edge.to, dx = b.x - a.x, dy = b.y - a.y;
        const weightA = drag?.node === a ? 0 : inverseMass(a), weightB = drag?.node === b ? 0 : inverseMass(b);
        const squareLength = dx * dx + dy * dy;
        if (!squareLength) return;
        const impulse = ((b.vx - a.vx) * dx + (b.vy - a.vy) * dy) / squareLength / (weightA + weightB);
        a.vx += impulse * dx * weightA; a.vy += impulse * dy * weightA;
        b.vx -= impulse * dx * weightB; b.vy -= impulse * dy * weightB;
      });
    }
    function tick(time, deltaMs) {
      if (!active || destroyed) return;
      if (geometryDirty && !measure()) return;
      const dt = Math.min(deltaMs, 50) / 1000;
      const speed = Math.max(...nodes.map((node) => Math.hypot(node.vx, node.vy)));
      const steps = Math.max(1, Math.ceil(dt * 120), Math.ceil(speed * dt / motionStep));
      for (let index = 0; index < steps; index++) step(dt / steps);
      paint();
      syncActivity();
    }

    // POINTER DRAG — direct movement; only the last short motion sets the throw.
    function moveDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (performance.now() >= drag.releaseAt) { finishDrag(true); return; }
      const rect = header.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / scaleX - drag.offsetX, drag.node.minX, drag.node.maxX);
      const y = clamp((event.clientY - rect.top) / scaleY - drag.offsetY, drag.node.minY, drag.node.maxY);
      const now = performance.now();
      const previous = drag.samples[drag.samples.length - 1];
      if (x !== previous.x || y !== previous.y) {
        drag.x = x; drag.y = y; drag.pending = true;
        drag.lastMove = now;
        drag.samples.push({ x, y, time: now });
        // Keep at least one velocity interval when a slow frame delays an event.
        while (drag.samples.length > 2 && drag.samples[0].time < now - teamMotion.drag.sampleMs) drag.samples.shift();
      }
      paintDirty = true; syncActivity();
      event.preventDefault();
    }
    function finishDrag(throwIt = false) {
      if (!drag) return;
      const current = drag, node = current.node;
      clearTimeout(current.releaseTimer);
      // Include the final pointer position before releasing the pinned joint.
      if (!destroyed) step(0);
      drag = null;
      let vx = 0, vy = 0;
      const samples = current.samples, first = samples[0], last = samples[samples.length - 1];
      if (throwIt && !reducedMotion.matches && performance.now() - current.lastMove < teamMotion.drag.releasePauseMs && last.time > first.time) {
        const seconds = (last.time - first.time) / 1000;
        vx = (last.x - first.x) / seconds * teamMotion.drag.velocityMultiplier;
        vy = (last.y - first.y) / seconds * teamMotion.drag.velocityMultiplier;
        const speed = Math.hypot(vx, vy), cap = Math.min(1, teamMotion.drag.maxSpeed / speed);
        vx *= cap; vy *= cap;
      }
      node.vx = vx; node.vy = vy;
      current.members.forEach((member) => {
        if (!throwIt) member.vx = member.vy = 0;
        member.blend = member.floatX = member.floatY = 0;
      });
      node.element.style.cursor = "grab";
      if (node.element.hasPointerCapture?.(current.pointerId)) node.element.releasePointerCapture(current.pointerId);
      paintDirty = true; syncActivity();
    }
    $header.on(`pointerdown${namespace}`, "[team-profile-node]", function (event) {
      const original = event.originalEvent || event, node = byElement.get(this);
      if (!node?.draggable || drag || original.button !== 0 || original.isPrimary === false || !visible || document.hidden) return;
      if (geometryDirty && !measure()) return;
      const rect = header.getBoundingClientRect(), now = performance.now();
      const members = connectedTo(node);
      node.vx = node.vy = 0;
      drag = { node, members, x: node.x, y: node.y, pending: false, appliedAt: now, pointerId: original.pointerId,
        releaseAt: now + teamMotion.drag.holdSeconds * 1000,
        offsetX: (original.clientX - rect.left) / scaleX - node.x,
        offsetY: (original.clientY - rect.top) / scaleY - node.y,
        samples: [{ x: node.x, y: node.y, time: now }], lastMove: now };
      node.element.style.cursor = "grabbing";
      try { node.element.setPointerCapture(original.pointerId); } catch {}
      const current = drag;
      current.releaseTimer = setTimeout(() => { if (drag === current) finishDrag(true); }, teamMotion.drag.holdSeconds * 1000);
      event.preventDefault(); syncActivity();
    }).on(`dragstart${namespace}`, "[team-profile-node]", (event) => event.preventDefault())
      .on(`lostpointercapture${namespace}`, "[team-profile-node]", (event) => {
        if (event.originalEvent?.pointerId === drag?.pointerId) finishDrag();
      });
    $(document).on(`pointermove${namespace}`, (event) => moveDrag(event.originalEvent || event))
      .on(`pointerup${namespace} pointercancel${namespace}`, (event) => {
        const original = event.originalEvent || event;
        if (original.pointerId !== drag?.pointerId) return;
        if (event.type === "pointerup") moveDrag(original);
        finishDrag(event.type === "pointerup");
      });
    $(window).on(`blur${namespace}`, () => finishDrag());

    // LIFECYCLE — no off-screen frames; desktop cleanup restores native artwork.
    function syncActivity() {
      const shouldRun = !destroyed && visible && !document.hidden &&
        (!reducedMotion.matches || drag || paintDirty || geometryDirty);
      if (Boolean(shouldRun) === active) return;
      active = Boolean(shouldRun);
      if (active) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    }
    function invalidateGeometry() { finishDrag(); geometryDirty = paintDirty = true; syncActivity(); }
    function visibilityChanged() {
      if (document.hidden) finishDrag();
      else geometryDirty = true;
      syncActivity();
    }
    function motionChanged() {
      nodes.forEach((node) => { node.vx = node.vy = node.blend = node.floatX = node.floatY = 0; });
      paintDirty = true; syncActivity();
    }
    const observer = window.IntersectionObserver && new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) finishDrag();
      else geometryDirty = true;
      syncActivity();
    });
    if (observer) observer.observe(boundary);
    const resizeObserver = window.ResizeObserver && new ResizeObserver(invalidateGeometry);
    if (resizeObserver) {
      resizeObserver.observe(header);
      if (boundary !== header) resizeObserver.observe(boundary);
      if (layout !== boundary && layout !== header) resizeObserver.observe(layout);
      $nodes.each(function () { resizeObserver.observe(this); });
      $content.each(function () { resizeObserver.observe(this); });
    }
    $(window).on(`resize${namespace}`, invalidateGeometry);
    document.addEventListener("visibilitychange", visibilityChanged);
    reducedMotion.addEventListener("change", motionChanged);
    if (document.fonts) document.fonts.ready.then(() => { if (!destroyed) invalidateGeometry(); });
    syncActivity();
    cleanups.push(() => {
      destroyed = true; finishDrag(); syncActivity();
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      $header.off(namespace); $(document).off(namespace); $(window).off(namespace);
      document.removeEventListener("visibilitychange", visibilityChanged);
      reducedMotion.removeEventListener("change", motionChanged);
      if (layer) layer.remove();
      restoreNodes(); restoreSvgs();
    });
  });
  return () => {
    cleanups.forEach((cleanup) => cleanup());
    addedHooks.forEach(([element, name]) => element.removeAttribute(name));
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
  // CATALOGUE CONTROLS — seconds; the new image follows the outgoing image.
  const catalogueControls = {
    activeClass: "active", initialValue: null,
    hide: { start: 0, duration: 0.2, ease: "power1.in", y: "-2rem", scale: 0.9 },
    reveal: { start: ">", duration: 0.3, ease: "power1.in", fromY: "2rem", fromScale: 0.9, y: 0, scale: 1 },
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let transition = null;
  const restoreSelects = rememberAttributes($selects, ["class", "aria-pressed"]);
  const restoreReveals = rememberAttributes($reveals, ["class", "style", "aria-hidden", "inert"]);
  function activate($select, immediate = false) {
    const value = $select.attr("cat-select");
    const $matches = $reveals.filter((_, element) => element.getAttribute("cat-reveal") === value);
    if (!$matches.length || (!immediate && $select.hasClass(catalogueControls.activeClass))) return;
    if (transition) transition.kill();
    const $outgoing = $reveals.filter(`.${catalogueControls.activeClass}`).not($matches);
    $selects.removeClass(catalogueControls.activeClass).attr("aria-pressed", "false");
    $select.addClass(catalogueControls.activeClass).attr("aria-pressed", "true");
    $reveals.attr({ "aria-hidden": "true", inert: "" });
    function showSelected() {
      $reveals.removeClass(catalogueControls.activeClass);
      $matches.addClass(catalogueControls.activeClass).attr("aria-hidden", "false").removeAttr("inert");
    }
    if (immediate || !window.gsap || reducedMotion.matches) {
      showSelected();
      if (window.gsap) gsap.set($reveals, { clearProps: "transform,opacity" });
      return;
    }
    const { hide, reveal } = catalogueControls;
    transition = gsap.timeline({ onComplete: () => {
      gsap.set($reveals, { clearProps: "transform,opacity" });
      transition = null;
    } });
    if ($outgoing.length) {
      transition.to($outgoing, { y: hide.y, scale: hide.scale, opacity: 0, duration: hide.duration, ease: hide.ease }, hide.start);
    }
    // Keep Webflow's display state until the outgoing image has finished.
    transition.call(showSelected);
    transition.fromTo($matches, { y: reveal.fromY, scale: reveal.fromScale, opacity: 0 },
      { y: reveal.y, scale: reveal.scale, opacity: 1, duration: reveal.duration, ease: reveal.ease, immediateRender: false }, reveal.start);
  }
  const $initial = catalogueControls.initialValue === null ? $selects.filter(".active").first()
    : $selects.filter((_, element) => element.getAttribute("cat-select") === catalogueControls.initialValue).first();
  activate($initial.length ? $initial : $selects.first(), true);
  const unbind = bindControlActivation($selects, "catalogueAnimation", activate);
  return () => { if (transition) transition.kill(); unbind(); restoreSelects(); restoreReveals(); };
}

function homeBackgroundMotion() {
  if (!window.gsap || !$("[home-faq], [section-tiles], [compare-section]").length) return null;
  // BACKGROUND MOTION — seconds; native Webflow classes own artwork and layout.
  const backgroundMotion = {
    faq: { xPercent: 4, yPercent: 3, scale: 1.08, duration: 14, ease: "sine.inOut" },
    ribbon: { xPercent: 5, yPercent: 2, rotation: 1.5, duration: 18, ease: "sine.inOut" },
    cursor: { duration: 0.3, ease: "power1.out" },
  };
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const cleanups = [];
    // Repeat only while the artwork is near the viewport and the tab is visible.
    function animateVisible(section, targets, motion, name) {
      if (!section || !targets.length) return;
      const restore = rememberAttributes($(targets), ["style"]);
      const timeline = gsap.timeline({ id: name, paused: true, repeat: -1, yoyo: true });
      targets.forEach((target, index) => {
        const direction = index % 2 ? -1 : 1;
        timeline.to(target, { ...motion, xPercent: motion.xPercent * direction,
          yPercent: motion.yPercent * direction }, 0);
      });
      let visible = false;
      const sync = () => visible && !document.hidden ? timeline.play() : timeline.pause();
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); },
        { rootMargin: "300px 0px" });
      observer.observe(section);
      document.addEventListener("visibilitychange", sync);
      cleanups.push(() => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); timeline.kill(); restore(); });
    }

    // FAQ — independently drifting glows extend beyond section edges.
    $("[home-faq]").each(function () {
      animateVisible(this, $(this).find("[home-faq-glows]").children().toArray(), backgroundMotion.faq, "home-faq-breath");
    });
    // AUDIENCE — the oversized original lined artwork sways behind the cards.
    $("[section-tiles]").each(function () {
      animateVisible(this, $(this).find("[home-dna-ribbon]").toArray(), backgroundMotion.ribbon, "home-dna-sway");
    });

    // COMPARISON — one pointer update per frame, with no idle rendering loop.
    $("[compare-section]").each(function () {
      const section = this, glow = $(this).find("[compare-glow]")[0];
      if (!glow || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const restore = rememberAttributes($(glow), ["style"]);
      const xTo = gsap.quickTo(glow, "x", backgroundMotion.cursor);
      const yTo = gsap.quickTo(glow, "y", backgroundMotion.cursor);
      let frame = 0, pointer, listening = false;
      const cancel = () => { cancelAnimationFrame(frame); frame = 0; };
      const paint = () => {
        frame = 0;
        if (!pointer || document.hidden) return;
        const rect = glow.getBoundingClientRect();
        const baseX = rect.left + rect.width / 2 - Number(gsap.getProperty(glow, "x"));
        const baseY = rect.top + rect.height / 2 - Number(gsap.getProperty(glow, "y"));
        xTo(pointer.x - baseX); yTo(pointer.y - baseY);
      };
      const move = event => {
        if (event.pointerType === "touch") return;
        pointer = { x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(paint);
      };
      const leave = () => { pointer = null; cancel(); xTo(0); yTo(0); };
      const detach = () => {
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerleave", leave);
        listening = false; pointer = null; cancel(); xTo.tween.pause(); yTo.tween.pause();
      };
      let visible = false;
      const sync = () => {
        if (visible && !document.hidden) {
          if (!listening) {
            section.addEventListener("pointermove", move, { passive: true });
            section.addEventListener("pointerleave", leave);
            listening = true;
          }
        } else detach();
      };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
      observer.observe(section);
      document.addEventListener("visibilitychange", sync);
      cleanups.push(() => {
        observer.disconnect(); document.removeEventListener("visibilitychange", sync); detach();
        xTo.tween.kill(); yTo.tween.kill(); restore();
      });
    });
    return () => cleanups.forEach(cleanup => cleanup());
  });
  return () => media.revert();
}

function homeFaqAnimation() {
  const $sections = $("[home-faq]");
  if (!$sections.length) return null;
  // HOME FAQ — seconds; Webflow owns the layout, borders and gradient backgrounds.
  const faqMotion = { toggle: { duration: 0.3, ease: "power1.in" } };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cleanups = [];
  $sections.each(function () {
    const $items = $(this).find("[home-faq-item]");
    const $buttons = $items.find("[home-faq-button]");
    const $panels = $items.find("[home-faq-panel]");
    const restoreButtons = rememberAttributes($buttons, ["aria-expanded", "aria-controls"]);
    const restorePanels = rememberAttributes($panels, ["id", "style", "aria-hidden", "inert"]);
    let transition;
    $items.each(function () {
      const $button = $(this).find("[home-faq-button]").first();
      const $panel = $(this).find("[home-faq-panel]").first();
      if (!$button.length || !$panel.length) return;
      if (!$panel[0].id) $panel[0].id = uniqueElementId("home-faq-answer");
      $button.attr({ "aria-expanded": "false", "aria-controls": $panel[0].id });
      $panel.attr({ "aria-hidden": "true", inert: "" });
    });
    const unbind = bindControlActivation($buttons, "homeFaq", ($button) => {
      const opening = $button.attr("aria-expanded") !== "true";
      if (transition) transition.kill();
      // Refresh downstream scroll positions once, after all panel heights settle.
      transition = window.gsap ? gsap.timeline({
        onComplete: () => window.ScrollTrigger && ScrollTrigger.refresh(),
      }) : null;
      $items.each(function () {
        const $current = $(this).find("[home-faq-button]").first();
        const $panel = $(this).find("[home-faq-panel]").first();
        const open = opening && $current[0] === $button[0];
        $current.attr("aria-expanded", String(open));
        $panel.attr("aria-hidden", String(!open));
        if (open) $panel.removeAttr("inert"); else $panel.attr("inert", "");
        if (transition) {
          transition.to($panel, { height: open ? "auto" : 0,
            duration: reducedMotion.matches ? 0 : faqMotion.toggle.duration,
            ease: faqMotion.toggle.ease, overwrite: true,
          }, 0);
        } else $panel.css("height", open ? "auto" : 0);
      });
    });
    cleanups.push(() => {
      unbind();
      if (transition) transition.kill();
      if (window.gsap) gsap.killTweensOf($panels);
      restoreButtons(); restorePanels();
    });
  });
  return () => cleanups.forEach(cleanup => cleanup());
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
    const $labels = $items.find("[accord-1-title]");
    const restoreLabels = rememberAttributes($labels, ["class"]);
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
      // Webflow owns the active label's gradient; mirror the selected row state.
      $labels.removeClass("active");
      $item.find("[accord-1-title]").addClass("active");
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
      restoreMarker(); restoreItems(); restorePanels(); restoreLabels();
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

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
  const $gitTest = $("[git-test]");
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
  const $gitTest = $("[git-test]");
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
  catalogueAnimation();
  dropTextAnimation();
  flexGrowAnimation();

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
    // 01 — First scene leaves while the card sphere moves to the centre.
    firstScene: {
      start: 0,
      sphere: { start: 0, duration: 0.14, ease: "power1.in" },
      move: { start: 0, duration: 0.1869, ease: "power1.in", y: "-20rem", stagger: { amount: 0.0469, from: "end" } },
      fade: { start: "move", duration: 0.0931, ease: "power1.in", stagger: { amount: 0.0469, from: "end" } },
    },
    // 02 — Cards leave, then the logos follow the first scene's exit.
    cards: {
      start: 0.21,
      move: { start: 0, duration: 0.063, ease: "power1.in", y: "-10rem" },
      fade: { start: "move", duration: 0.049, ease: "power1.in" },
    },
    logos: {
      start: "firstScene.move:end",
      move: { start: 0, duration: 0.063, ease: "power1.in", y: "-10rem" },
      fade: { start: "move", duration: 0.049, ease: "power1.in" },
    },
    // 03 — Second scene: enter → hold → leave.
    secondScene: {
      start: 0.28,
      enter: { start: 0, duration: 0.0581, ease: "power1.in" },
      reveal: { start: "enter", duration: 0.0469, ease: "power1.in" },
      leave: { start: "enter:end+=0.0588", duration: 0.0581, ease: "power1.in", y: "-20rem" },
      hide: { start: "leave", duration: 0.0469, ease: "power1.in" },
    },
    // 04 — Third scene enters and holds naturally until the screen opens.
    thirdScene: {
      start: 0.4669,
      enter: { start: 0, duration: 0.0581, ease: "power1.in" },
      reveal: { start: "enter", duration: 0.0469, ease: "power1.in" },
    },
    // 05 — Bottom gradient → ring → rotation → upward merge.
    gradientDots: {
      start: 0.0777,
      form: { start: 0, duration: 0.2331, ease: "power1.in" },
      spin: { start: "form:end", duration: 0.0623, ease: "none", angle: Math.PI / 2 },
      shrink: { start: "spin", duration: 0.0308, ease: "power1.in", scale: 0.82 },
      rise: { start: "spin:end", duration: 0.0777, ease: "power1.in", y: -620 },
      merge: { start: "rise", duration: 0.0777, ease: "power1.in" },
      fade: { start: "merge+=0.0392", duration: 0.0777, ease: "power1.in" },
    },
    // 06 — Centre drop appears, forms, lands, then resizes in place.
    drop: {
      start: "gradientDots.fade",
      appear: { start: 0, duration: 0.0546, ease: "power1.in" },
      merge: { start: 0, duration: 0.1554, ease: "power1.in" },
      soften: { start: "merge", duration: 0.1554, ease: "power1.in", blur: 22 },
      land: { start: "merge", duration: 0.1554, ease: "power1.in", y: 150 },
      resize: { start: "land:end+=0.0063", duration: 0.056, ease: "power1.in", widthEm: 6.5 },
    },
    // 07 — Landing ripple: expand and fade, entirely controlled by scroll.
    landingRipple: {
      start: "drop.land:end",
      expand: { start: 0, duration: 0.12, ease: "power1.in", stagger: 0.012, scale: 1 },
      reveal: { start: "expand", duration: 0.008, ease: "power1.in", stagger: 0.012, opacity: 0.42 },
      fade: { start: "reveal+=0.008", duration: 0.112, ease: "power1.in", stagger: 0.012 },
    },
    // 08 — Line draws to the landed drop.
    line: {
      start: "drop.land:end",
      draw: { start: 0, duration: 0.1323, ease: "power1.in" },
    },
    // 09 — Masked colours fill the resized drop and its blur sharpens.
    dropColours: {
      start: "drop.resize:end",
      base: { start: 0, duration: 0.056, ease: "power1.in" },
      move: { start: "base", duration: 0.0595, ease: "power1.in", stagger: 0.0035 },
      reveal: { start: "base", duration: 0.056, ease: "power1.in", stagger: 0.0035 },
      sharpen: { start: "base+=0.014", duration: 0.056, ease: "power1.in", blur: 6 },
    },
    // 10 — Line contact → clip opens → drop and brackets settle → content.
    finish: {
      start: "line:end",
      clip: { start: 0, duration: 0.108, ease: "power1.in" },
      blur: { start: "clip", duration: 0.108, ease: "power1.in", from: "blur(0rem)", to: "blur(1.5rem)" },
      starGrow: { start: "clip", duration: 0.024, ease: "power1.in", scale: 2.5 },
      starRotate: { start: "starGrow", duration: 0.264, ease: "none", rotation: 360 },
      starSettle: { start: "starGrow:end+=0.054", duration: 0.018, ease: "power1.in", scale: 2.15 },
      drop: { start: "clip+=0.03", duration: 0.1164, ease: "power1.in", scale: 0.5 },
      leftBracket: { start: "drop+=0.024", duration: 0.1164, ease: "power1.in" },
      rightBracket: { start: "leftBracket", duration: 0.1164, ease: "power1.in" },
      content: { start: "clip:end+=0.03", duration: 0.048, ease: "power1.in" },
    },
    // 11 — Final water rings expand and settle behind the end content.
    endRipple: {
      start: "finish.clip+=0.081",
      expand: { start: 0, duration: 0.114, ease: "power1.in", stagger: 0.0108, scale: (index) => 1.1 - index * 0.3 },
      reveal: { start: "expand", duration: 0.114, ease: "power1.in", stagger: 0.0108, opacity: 0.7 },
      settle: {
        start: "expand+=0.006", duration: 0.138, ease: "power1.in", stagger: 0.0108,
        blur: "2.5rem",
        // Decimal alpha avoids GSAP's percentage-alpha colour interpolation snap.
        shadow: "0 0 5rem 3rem rgba(104, 150, 230, 0.6), inset 0 0 5rem 3rem rgba(104, 150, 230, 0.45)",
      },
    },
  };

  const $homeStartContent = $("[home-start]").children().not("script, style");
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

  // CARD SPHERE — retained idle rotation, framing, and pointer interaction.
  const $homeResting = $("[home-resting]");
  const $homeRestingDragSurface = $("[home-start]");
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
        setScale: gsap.quickSetter(card, "scale"),
        setOpacity: gsap.quickSetter(card, "opacity"),
        setZIndex: gsap.quickSetter(element, "zIndex"),
        x: bounds.left - transformX + bounds.width / 2,
        y: bounds.top - transformY + bounds.height / 2,
        depth: isFront ? 1 : isBack ? -1 : index % 2 === 0 ? 0.35 : -0.35,
        opacity: isFront ? 1 : isBack ? 0.1 : 0.3,
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

      // Reuse setters: per-frame gsap.set() tweens accumulate in matchMedia.
      item.setZIndex(Math.round(depth + item.radius));
      item.setX(
        x * homeRestingRadiusScale * viewScale + viewX - item.screenX
      );
      item.setY(
        -y * homeRestingRadiusScale * viewScale +
          homeRestingBaseY + viewY - item.screenY
      );
      item.setScale(scale);
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
    $("[perspective-opacity-1], [perspective-opacity-2], [perspective-opacity-3]"),
    {
      opacity: 1,
      zIndex: "auto",
    }
  );

  buildHomeRestingSphere();
  renderHomeRestingSphere();

  // GRADIENT AND CLIP GEOMETRY — artwork measurements, separate from timing.
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

    const rotation = (Math.min(deltaTime, 32) / 1000) * (360 / 14);
    const direction = (45 * Math.PI) / 180;

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

  const animationControls = {
    grow: {
      active: 1,
      inactive: 0,
      duration: 0.3,
      ease: "power1.in",
    },
    copy: {
      active: 1,
      inactive: 0,
      duration: 0.15,
      ease: "power1.in",
    },
    mobile: {
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
        return { $item, $image, $content, $title, $copy };
      })
      .filter(Boolean);
    if (!items.length) return;

    const $growTargets = $(items.flatMap(({ $item, $image }) => [$item[0], $image[0]]));
    const $copyTargets = $(items.flatMap(({ $copy }) => $copy.toArray()));
    const $contentTargets = $(items.flatMap(({ $content }) => $content.toArray()));
    const originalStates = [];
    const growStyles = rememberStyles($growTargets, ["flex-grow"]);
    const mobileStyles = [
      ...rememberStyles($contentTargets, ["height"]),
      ...rememberStyles($(items.map(({ $image }) => $image[0])), ["height", "margin-top"]),
    ];
    let mobile = window.matchMedia(animationControls.mobile.media).matches;
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
        $(element).hasClass("active") ? animationControls.grow.active : animationControls.grow.inactive;
      const visibility = (_, element) =>
        $(element).hasClass("active") ? animationControls.copy.active : animationControls.copy.inactive;

      if (!immediate) timeline = gsap.timeline();

      if (mobile) {
        // Measure natural text wrapping, then restore the current frame before tweening.
        if ($contentTargets.length) gsap.set($contentTargets, { height: "auto" });
        const targetSizes = items.map(({ $image, $title, $copy }, index) => ({
          content: Math.max($title.outerHeight(true) || 0, items[index] === item ? $copy.outerHeight(true) || 0 : 0),
          image: items[index] === item ? $image.outerWidth() / animationControls.mobile.imageAspectRatio : 0,
          gap: items[index] === item ? animationControls.mobile.imageGapEm * (parseFloat($image.css("font-size")) || 16) : 0,
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
            duration: animationControls.mobile.duration,
            ease: animationControls.mobile.ease,
            overwrite: "auto",
          };
          if ($content.length) timeline.to($content, { height: target.content, ...timing }, 0);
          timeline.to($image, { height: target.image, marginTop: target.gap, ...timing }, 0);
        });
      } else if (immediate) {
        gsap.set($growTargets, { flexGrow: grow });
      } else {
        timeline.to($growTargets, {
          flexGrow: grow,
          duration: animationControls.grow.duration,
          ease: animationControls.grow.ease,
          overwrite: "auto",
        }, 0);
      }

      if ($copyTargets.length) {
        if (immediate) gsap.set($copyTargets, { autoAlpha: visibility });
        else {
          timeline.to($copyTargets, {
            autoAlpha: visibility,
            duration: animationControls.copy.duration,
            ease: animationControls.copy.ease,
            overwrite: "auto",
          }, 0);
        }
      }
    }

    const initialItem = items.find(({ $item }) => $item.hasClass("active")) ||
      items.find(({ $image }) => $image.hasClass("active")) || items[0];

    items.forEach((item) => {
      rememberElements(item.$item, ["style", "role", "tabindex", "aria-expanded"]);
      rememberElements(item.$image.add(item.$content).add(item.$copy), ["style"]);
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

    activateItem(initialItem, true);

    refreshers.push(() => {
      const nextMobile = window.matchMedia(animationControls.mobile.media).matches;
      if (timeline) timeline.kill();
      if (nextMobile !== mobile) {
        restoreStyles(mobile ? mobileStyles : growStyles);
        mobile = nextMobile;
      }
      activateItem(activeItem, true);
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

  const rippleControls = {
    expand: {
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
      settle: rippleControls.settle,
    });
    if (!rippleTimeline) return;

    const trigger = ScrollTrigger.create({
      trigger: this,
      start: "top 50%",
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
    endScale = 1,
    startOpacity = 0.42,
    duration = 1.6,
    stagger = 0.16,
    ease = "power2.out",
    settle = null,
  } = {}
) {
  if (!$rings.length || !window.gsap) return null;

  gsap.set($rings, { scale: 0.08, autoAlpha: 0 });

  const rippleTimeline = gsap.timeline({ paused: true });

  rippleTimeline.fromTo(
    $rings,
    {
      scale: 0.08,
      autoAlpha: settle ? 0 : startOpacity,
    },
    {
      scale: endScale,
      autoAlpha: settle ? settle.opacity : 0,
      duration,
      stagger,
      ease,
      immediateRender: false,
    }
  );

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
  const $nav = $("[nav-block]").first();
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
  const $revealLines = $reveals.find("[h-line]");
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

    $items.find("[accord-heading]").each(function () {
      const split = new SplitType(this, { types: "words" });
      $(split.words).attr("word", "");
      splitInstances.push(split);
    });
  }

  function getHeadingTargets(item) {
    const $heading = $(item).find("[accord-heading]").first();
    const words = $heading.find("[word]").toArray();

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
    gsap.set($visibleReveals.find("[h-line]"), {
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

      gsap.set($itemsToShow.find("[h-line]"), {
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
        $(this).find("[h-line]"),
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

function catalogueAnimation() {
  const $selects = $("[cat-select]");
  const $reveals = $("[cat-reveal]");
  if (!$selects.length || !$reveals.length) return null;

  function setActiveCatalogue($select) {
    const value = $select.attr("cat-select");
    const $matchingReveals = $reveals.filter(function () {
      return $(this).attr("cat-reveal") === value;
    });
    if (!$matchingReveals.length) return;

    $selects.removeClass("active");
    $select.addClass("active");
    $reveals.removeClass("active");
    $matchingReveals.addClass("active");
  }

  const $initialSelect = $selects.filter(".active").first();
  setActiveCatalogue($initialSelect.length ? $initialSelect : $selects.first());

  $selects
    .off("click.catalogueAnimation")
    .on("click.catalogueAnimation", function (event) {
      event.preventDefault();
      setActiveCatalogue($(this));
    });

  return () => {
    $selects.off("click.catalogueAnimation");
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

    const $marker = $items.find("[active-marker]").first();
    const $currentItem = $items.filter(".active").first();
    const $initialItem = $currentItem.length ? $currentItem : $items.first();
    let activeValue = $initialItem.attr("accord-item");
    const $initialChild = $children
      .filter(`[accord-reveal="${activeValue}"]`)
      .first();

    $children.removeClass("active");
    $initialChild.addClass("active");
    gsap.set($children, {
      autoAlpha: 0,
      pointerEvents: "none",
    });

    gsap.set($initialChild, {
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

          $children.removeClass("active");
          $nextChild.addClass("active");

          gsap.set($currentChild, {
            autoAlpha: 0,
            pointerEvents: "none",
          });

          gsap.fromTo(
            $nextChild,
            {
              autoAlpha: 0,
              pointerEvents: "none",
            },
            {
              autoAlpha: 1,
              pointerEvents: "auto",
              duration: 0.3,
              ease: "none",
              overwrite: true,
            }
          );

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

  const $svg = $("[footer-svg-engine]").first();
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

  $svg.children("[footer-pixels-defs], [footer-svg-pixel-layer]").remove();

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
    "footer-pixels-defs": "",
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
    "footer-svg-pixel-layer": "",
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

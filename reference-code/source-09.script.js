function linesFilter() {
  gsap.set(".chaos-lines-wrap, .order-lines-wrap", {
    willChange: "clip-path",
  });

  gsap.set(".chaos-lines-wrap", {
    clipPath: "inset(0% 0% 0% 0%)",
  });

  gsap.set(".order-lines-wrap", {
    clipPath: "inset(0% 0% 0% 100%)",
  });

  gsap.set(".chip-wrap", {
    x: 0,
  });

  const linesFilterTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[lines-filter-trigger]",
      start: "top 50%",
      end: "bottom bottom",
      scrub: true,
      markers: false,
      invalidateOnRefresh: true,
    },
  });

  linesFilterTimeline.fromTo(
    ".chaos-lines-wrap",
    {
      clipPath: "inset(0% 0% 0% 0%)",
    },
    {
      clipPath: "inset(0% 0% 0% 100%)",
      ease: "none",
      duration: 1,
    }
  );

  linesFilterTimeline.fromTo(
    ".order-lines-wrap",
    {
      clipPath: "inset(0% 100% 0% 0%)",
    },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      duration: 1,
    },
    0
  );

  linesFilterTimeline.fromTo(
    ".chip-wrap",
    {
      x: 0,
    },
    {
      x: () => {
        const parentWidth = $(".chip-move").width();
        const chipWidth = $(".chip-wrap").outerWidth();
        return parentWidth - chipWidth;
      },
      ease: "none",
      duration: 1,
    },
    0
  );

  linesFilterTimeline.fromTo(
    ".chaos-line-text",
    {
      x: -250,
    },
    {
      x: 200,
      ease: "none",
      duration: 0.75,
    },
    0
  );

  linesFilterTimeline.fromTo(
    ".order-line-text",
    {
      x: 0,
    },
    {
      x: 250,
      ease: "none",
      duration: 0.75,
    },
    0.25
  );
}

linesFilter();

function carFilterAnimation() {
  gsap.set(".car-filter-line", {
    yPercent: 0,
    willChange: "transform",
  });

  gsap.set(".car-filter", {
    clipPath: "inset(0% 0% 0% 0%)",
    willChange: "clip-path",
  });

  const carFilterTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".car-section",
      start: "top 90%",
      end: "bottom 40%",
      scrub: true,
      markers: false,
      invalidateOnRefresh: true,
    },
  });

  carFilterTimeline.fromTo(
    ".car-filter-line",
    {
      y: 0,
    },
    {
      y: () => {
        const sectionHeight = $(".car-section").outerHeight();
        const lineHeight = $(".car-filter-line").outerHeight();
        return sectionHeight - lineHeight;
      },
      ease: "none",
    }
  );

  carFilterTimeline.fromTo(
    ".car-filter",
    {
      clipPath: "inset(0% 0% 0% 0%)",
    },
    {
      clipPath: "inset(100% 0% 0% 0%)",
      ease: "none",
    },
    0
  );
}

carFilterAnimation();

function satelliteOrbit() {
  const $satWrap = $(".sat-wrap");
  const $satItem = $(".sat-item");

  if (!$satWrap.length || !$satItem.length) return;

  const orbitState = {
    angle: 0,
  };

  function setSatellitePosition() {
    const wrapRect = $satWrap[0].getBoundingClientRect();
    const itemRect = $satItem[0].getBoundingClientRect();

    const wrapCenterX = wrapRect.width / 2;
    const wrapCenterY = wrapRect.height / 2;

    const itemX = itemRect.left - wrapRect.left;
    const itemY = itemRect.top - wrapRect.top;

    const itemCenterX = itemX + itemRect.width / 2;
    const itemCenterY = itemY + itemRect.height / 2;

    const offsetX = itemCenterX - wrapCenterX;
    const offsetY = itemCenterY - wrapCenterY;

    const radius = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const startAngle = Math.atan2(offsetY, offsetX);

    gsap.set($satItem, {
      transformOrigin: "50% 50%",
      willChange: "transform",
    });

    gsap.to(orbitState, {
      angle: Math.PI * 2,
      duration: 16,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        const angle = startAngle + orbitState.angle;

        gsap.set($satItem, {
          x: Math.cos(angle) * radius - offsetX,
          y: Math.sin(angle) * radius - offsetY,
          rotation: -20 + orbitState.angle * (180 / Math.PI),
        });
      },
    });
  }

  setSatellitePosition();
}

satelliteOrbit();

function heroScrollAnimation() {
  gsap.set("[hero-blur]", {
    opacity: 1,
    willChange: "opacity",
  });

  gsap.set("[hero-globe]", {
    scale: 1,
    transformOrigin: "50% 50%",
    willChange: "transform",
  });

  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "[hero-trigger]",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  heroTimeline.fromTo(
    "[hero-blur]",
    {
      opacity: 1,
    },
    {
      opacity: 0,
      ease: "none",
    }
  );

  heroTimeline.fromTo(
    "[hero-globe]",
    {
      scale: 1,
    },
    {
      scale: 1.3,
      ease: "none",
    },
    0
  );
}

heroScrollAnimation();

function heroGradientLoop() {
  const minScale = 0.8;
  const maxScale = 1.5;

  const minRotationDuration = 8;
  const maxRotationDuration = 12;

  const rotationStep = 120;

  gsap.set("[hero-gradient]", {
    scale: 1,
    rotation: 0,
    transformOrigin: "50% 50%",
    willChange: "transform",
  });

  function randomRotationDuration() {
    return gsap.utils.random(minRotationDuration, maxRotationDuration);
  }

  const heroGradientTimeline = gsap.timeline({
    repeat: -1,
    defaults: {
      ease: "none",
    },
  });

  heroGradientTimeline
    .to("[hero-gradient]", {
      scale: maxScale,
      rotation: rotationStep,
      duration: randomRotationDuration,
    })
    .to("[hero-gradient]", {
      scale: 1,
      rotation: rotationStep * 2,
      duration: randomRotationDuration,
    })
    .to("[hero-gradient]", {
      scale: minScale,
      rotation: rotationStep * 3,
      duration: randomRotationDuration,
    })
    .to("[hero-gradient]", {
      scale: 1,
      rotation: rotationStep * 4,
      duration: randomRotationDuration,
    });
}

heroGradientLoop();

function heroGradientTwoLoop() {
  const minScale = 0.8;
  const maxScale = 1.8;

  const minRotationDuration = 10;
  const maxRotationDuration = 14;

  const rotationStep = 90;

  /*
    transformOrigin controls the rotation anchor.
    50% 50% = own center
    50% 120% = below itself
    50% -20% = above itself
    -20% 50% = left of itself
    120% 50% = right of itself
  */
  const originX = "50%";
  const originY = "50%";

  gsap.set("[hero-gradient-2]", {
    scale: 1,
    rotation: 0,
    transformOrigin: `${originX} ${originY}`,
    willChange: "transform",
  });

  function randomRotationDuration() {
    return gsap.utils.random(minRotationDuration, maxRotationDuration);
  }

  const heroGradientTwoTimeline = gsap.timeline({
    repeat: -1,
    defaults: {
      ease: "none",
    },
  });

  heroGradientTwoTimeline
    .to("[hero-gradient-2]", {
      scale: maxScale,
      rotation: rotationStep,
      duration: randomRotationDuration,
    })
    .to("[hero-gradient-2]", {
      scale: 1,
      rotation: rotationStep * 2,
      duration: randomRotationDuration,
    })
    .to("[hero-gradient-2]", {
      scale: minScale,
      rotation: rotationStep * 3,
      duration: randomRotationDuration,
    })
    .to("[hero-gradient-2]", {
      scale: 1,
      rotation: rotationStep * 4,
      duration: randomRotationDuration,
    });
}

heroGradientTwoLoop();

/* <style>
.svg-full {
  position: relative;
}

.svg-static,
.svg-water,
.svg-water-inline {
  display: block;
  width: 100%;
  height: auto;
}

.svg-water,
.svg-water-inline {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.svg-static {
  position: relative;
  z-index: 1;
}

.svg-water-inline path {
  will-change: transform;
}
</style> */

function inlineWaterSvg() {
  const waterImg = document.querySelector(".svg-water");

  if (!waterImg) return;

  const waterSrc = waterImg.getAttribute("src");

  fetch(waterSrc)
    .then(function (response) {
      return response.text();
    })
    .then(function (svgText) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svg = svgDoc.querySelector("svg");

      if (!svg) return;

      svg.classList.add("svg-water-inline");

      svg.removeAttribute("width");
      svg.removeAttribute("height");

      svg.setAttribute("viewBox", "0 0 1441 801");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.display = "block";

      waterImg.replaceWith(svg);

      waterLineHover();
    });
}

function waterLineHover() {
  const svg = document.querySelector(".svg-water-inline");
  const wrap = document.querySelector(".svg-full");

  if (!svg || !wrap) return;

  const radius = 120;
  const strength = 800;
  const returnSpeed = 0.02;
  const followSpeed = 0.08;
  const sampleSpacing = 8;
  const lineStrokeWidth = 0.4;

  const velocityStrength = 0.18;
  const maxVelocityPush = 14;
  const rippleFalloff = 0.1;

  const updateEveryNthFrame = 2;
  const lineCheckPadding = 140;
  const sleepThreshold = 0.04;

  const svgNS = "http://www.w3.org/2000/svg";
  const originalPaths = Array.from(svg.querySelectorAll(".svg-water-line"));
  const lines = [];

  function pointsToString(points) {
    return points
      .map(function (point) {
        return point.x.toFixed(2) + "," + point.y.toFixed(2);
      })
      .join(" ");
  }

  originalPaths.forEach(function (path, lineIndex) {
    let length;

    try {
      length = path.getTotalLength();
    } catch (error) {
      return;
    }

    if (!length || length < 2) return;

    const pointCount = Math.max(8, Math.ceil(length / sampleSpacing));
    const basePoints = [];
    const livePoints = [];

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i <= pointCount; i++) {
      const point = path.getPointAtLength((length / pointCount) * i);

      const basePoint = {
        x: point.x,
        y: point.y,
      };

      basePoints.push(basePoint);

      livePoints.push({
        x: point.x,
        y: point.y,
      });

      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const color =
      path.getAttribute("stroke") || path.getAttribute("fill") || "#D64127";

    const strokeWidth = path.getAttribute("stroke-width") || lineStrokeWidth;

    const polyline = document.createElementNS(svgNS, "polyline");

    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", color);
    polyline.setAttribute("stroke-width", strokeWidth);
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    polyline.classList.add("svg-water-line-poly");
    polyline.setAttribute("data-water-line", lineIndex);

    // IMPORTANT: render the line immediately before any cursor interaction
    polyline.setAttribute("points", pointsToString(basePoints));

    path.replaceWith(polyline);

    lines.push({
      el: polyline,
      basePoints: basePoints,
      livePoints: livePoints,
      bounds: {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY,
      },
      isMoving: false,
    });
  });

  if (!lines.length) return;

  const mouse = {
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    active: false,
  };

  let frame = 0;
  let tickerActive = false;

  function getSvgMousePosition(event) {
    const point = svg.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function isLineNearMouse(line) {
    const bounds = line.bounds;

    return (
      mouse.x >= bounds.minX - lineCheckPadding &&
      mouse.x <= bounds.maxX + lineCheckPadding &&
      mouse.y >= bounds.minY - lineCheckPadding &&
      mouse.y <= bounds.maxY + lineCheckPadding
    );
  }

  function startTicker() {
    if (tickerActive) return;

    tickerActive = true;
    gsap.ticker.add(updateWaterLines);
  }

  function stopTicker() {
    if (!tickerActive) return;

    tickerActive = false;
    gsap.ticker.remove(updateWaterLines);
  }

  function updateWaterLines() {
    frame++;

    if (frame % updateEveryNthFrame !== 0) return;

    mouse.velocityX *= 0.92;
    mouse.velocityY *= 0.92;

    let anythingStillMoving = false;

    lines.forEach(function (line) {
      const shouldCheckLine = mouse.active && isLineNearMouse(line);

      let hasChanged = false;
      let lineIsMoving = false;

      line.livePoints.forEach(function (livePoint, index) {
        const basePoint = line.basePoints[index];

        let targetX = basePoint.x;
        let targetY = basePoint.y;

        if (shouldCheckLine) {
          const dx = mouse.x - basePoint.x;
          const dy = mouse.y - basePoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius) {
            const influence = 1 - distance / radius;
            const easedInfluence = Math.pow(influence, 2);

            const velocityX = gsap.utils.clamp(
              -maxVelocityPush,
              maxVelocityPush,
              mouse.velocityX * velocityStrength
            );

            const velocityY = gsap.utils.clamp(
              -maxVelocityPush,
              maxVelocityPush,
              mouse.velocityY * velocityStrength
            );

            const ripple =
              Math.sin(index * 0.45 + distance * 0.08) * rippleFalloff;

            targetX =
              basePoint.x +
              velocityX * strength * 0.08 * easedInfluence +
              ripple * easedInfluence;

            targetY =
              basePoint.y +
              velocityY * strength * 0.04 * easedInfluence +
              ripple * 0.35 * easedInfluence;
          }
        }

        const speed = mouse.active ? followSpeed : returnSpeed;

        livePoint.x += (targetX - livePoint.x) * speed;
        livePoint.y += (targetY - livePoint.y) * speed;

        const diffX = Math.abs(livePoint.x - basePoint.x);
        const diffY = Math.abs(livePoint.y - basePoint.y);

        if (diffX > 0.05 || diffY > 0.05) {
          hasChanged = true;
        }

        if (diffX > sleepThreshold || diffY > sleepThreshold) {
          lineIsMoving = true;
          anythingStillMoving = true;
        }
      });

      line.isMoving = lineIsMoving;

      if (hasChanged || shouldCheckLine) {
        line.el.setAttribute("points", pointsToString(line.livePoints));
      }
    });

    if (!mouse.active && !anythingStillMoving) {
      stopTicker();
    }
  }

  wrap.addEventListener("mouseenter", function () {
    mouse.active = true;
    startTicker();
  });

  wrap.addEventListener("mousemove", function (event) {
    const svgPoint = getSvgMousePosition(event);

    if (!mouse.active) {
      mouse.lastX = svgPoint.x;
      mouse.lastY = svgPoint.y;
    }

    mouse.x = svgPoint.x;
    mouse.y = svgPoint.y;

    mouse.velocityX = mouse.x - mouse.lastX;
    mouse.velocityY = mouse.y - mouse.lastY;

    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;

    mouse.active = true;

    startTicker();
  });

  wrap.addEventListener("mouseleave", function () {
    mouse.active = false;
    mouse.velocityX = 0;
    mouse.velocityY = 0;

    startTicker();
  });
}

inlineWaterSvg();

function submarineAnimation() {
  gsap.set(".submarine-wrap", {
    right: "20%",
    bottom: "16%",
    willChange: "right, bottom",
  });

  const submarineAnimationTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".boat-layout",
      start: "top 50%",
      end: "bottom top",
      scrub: true,
      markers: false,
      invalidateOnRefresh: true,
    },
  });

  submarineAnimationTimeline.fromTo(
    ".submarine-wrap",
    {
      right: "20%",
      bottom: "16%",
    },
    {
      right: "60%",
      bottom: "5%",
      ease: "none",
    }
  );
}

submarineAnimation();

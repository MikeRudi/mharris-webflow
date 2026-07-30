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
  accordionOne();

  onDesktop(() => {
    // gitTestDesktop();
    lineHover();
    return footerEnginePixels();
  });

  onMobile(() => {
    // gitTestMobile();
  });
}

$(initSite);

function lineHover() {
  $("[line-hover-item]").each(function () {
    const $item = $(this);
    const $line = $item.find("[line-hover]").first();

    if (!$line.length) return;

    gsap.set($line, {
      clipPath: "inset(0% 100% 0% 0%)",
    });

    $item
      .off(".lineHover")
      .on("mouseenter.lineHover", function () {
        gsap.killTweensOf($line);

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
          clipPath: "inset(0% 0% 0% 100%)",
          duration: 0.3,
          ease: "power3.out",
        });
      });
  });
}

function accordionOne() {
  const $items = $(".accordian-1-item");
  if (!$items.length) return null;

  $items
    .off("click.accordionOne")
    .on("click.accordionOne", function () {
      $items.removeClass("active");
      $(this).addClass("active");
    });

  return () => {
    $items.off("click.accordionOne");
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

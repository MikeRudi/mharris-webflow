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

function footerEnginePixels() {
  const settings = {
    pixelGap: 9,
    pixelSize: 1.6,
    lightRadius: 150,
    maxPixelScale: 4,
    minOpacity: 0.18,
    maxOpacity: 1,
    minGlowBlur: 5,
    maxGlowBlur: 20,
    cursorSmoothing: 0.18,
    fadeIn: 0.35,
    fadeOut: 0.45,
    canvasPadding: 48,
  };

  const $svg = $(".footer-svg-engine").first();
  if (!$svg.length || !window.Path2D) return null;

  const svg = $svg[0];
  const $wrap = $svg.parent();
  const viewBox = svg.viewBox.baseVal;
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const svgPaths = [...svg.querySelectorAll("path")]
    .map((path) => path.getAttribute("d"))
    .filter(Boolean)
    .map((pathData) => new Path2D(pathData));
  const pixels = [];
  const lightPosition = {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2,
  };
  const canvasSize = {
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    pixelRadius: 1,
  };
  let renderFrame = null;

  if (!sampleContext || !context || !svgPaths.length) return null;

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
      if (svgPaths.some((path) => sampleContext.isPointInPath(path, x, y))) {
        pixels.push({ x, y });
      }
    }
  }

  $wrap.find(".footer-svg-light, .footer-svg-pixels").remove();

  canvas.className = "footer-svg-pixels";
  canvas.setAttribute("aria-hidden", "true");
  $svg.after(canvas);

  function resizeCanvas() {
    const rect = svg.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvasSize.width = rect.width + settings.canvasPadding * 2;
    canvasSize.height = rect.height + settings.canvasPadding * 2;
    canvasSize.scaleX = rect.width / viewBox.width;
    canvasSize.scaleY = rect.height / viewBox.height;
    canvasSize.pixelRadius =
      Math.max(
        1,
        Math.min(canvasSize.scaleX, canvasSize.scaleY) * settings.pixelSize
      );

    canvas.style.left = `${-settings.canvasPadding}px`;
    canvas.style.top = `${-settings.canvasPadding}px`;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    canvas.width = Math.round(canvasSize.width * dpr);
    canvas.height = Math.round(canvasSize.height * dpr);

    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    requestRender();
  }

  function requestRender() {
    if (renderFrame) return;
    renderFrame = requestAnimationFrame(renderPixels);
  }

  function renderPixels() {
    renderFrame = null;

    context.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const lightLevels = Array.from({ length: 4 }, () => new Path2D());

    pixels.forEach((pixel) => {
      const distance = Math.hypot(
        pixel.x - lightPosition.x,
        pixel.y - lightPosition.y
      );

      if (distance >= settings.lightRadius) return;

      const strength = 1 - distance / settings.lightRadius;
      const level = Math.min(3, Math.floor(strength * 4));
      const x =
        settings.canvasPadding + (pixel.x - viewBox.x) * canvasSize.scaleX;
      const y =
        settings.canvasPadding + (pixel.y - viewBox.y) * canvasSize.scaleY;
      const radius =
        canvasSize.pixelRadius *
        (1 + strength * (settings.maxPixelScale - 1));

      lightLevels[level].moveTo(x + radius, y);
      lightLevels[level].arc(x, y, radius, 0, Math.PI * 2);
    });

    context.globalCompositeOperation = "lighter";

    lightLevels.forEach((path, index) => {
      const level = index / (lightLevels.length - 1);
      const opacity =
        settings.minOpacity +
        (settings.maxOpacity - settings.minOpacity) * level;
      const glowBlur =
        settings.minGlowBlur +
        (settings.maxGlowBlur - settings.minGlowBlur) * level;
      const color = `rgb(255 255 255 / ${opacity})`;

      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = glowBlur;
      context.fill(path);
    });

    context.globalCompositeOperation = "source-over";
    context.shadowBlur = 0;
  }

  const xTo = gsap.quickTo(lightPosition, "x", {
    duration: settings.cursorSmoothing,
    ease: "power3.out",
    onUpdate: requestRender,
  });

  const yTo = gsap.quickTo(lightPosition, "y", {
    duration: settings.cursorSmoothing,
    ease: "power3.out",
    onUpdate: requestRender,
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
      requestRender();
      return;
    }

    xTo(svgPoint.x);
    yTo(svgPoint.y);
  }

  $svg
    .off(".footerEnginePixels")
    .on("mouseenter.footerEnginePixels", function (event) {
      moveLight(event, true);

      gsap.to(canvas, {
        opacity: 1,
        duration: settings.fadeIn,
        ease: "power2.out",
        overwrite: true,
      });
    })
    .on("mousemove.footerEnginePixels", moveLight)
    .on("mouseleave.footerEnginePixels", function () {
      gsap.to(canvas, {
        opacity: 0,
        duration: settings.fadeOut,
        ease: "power2.out",
        overwrite: true,
      });
    });

  $(window).on("resize.footerEnginePixels", resizeCanvas);
  resizeCanvas();

  return () => {
    $svg.off(".footerEnginePixels");
    $(window).off("resize.footerEnginePixels");
    xTo.tween.kill();
    yTo.tween.kill();

    if (renderFrame) cancelAnimationFrame(renderFrame);

    gsap.killTweensOf(canvas);
    canvas.remove();
  };
}

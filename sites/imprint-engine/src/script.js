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
    footerEngineLight();
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

function footerEngineLight() {
  const $svg = $(".footer-svg-engine").first();
  if (!$svg.length) return null;

  const svg = $svg[0];
  const svgNamespace = "http://www.w3.org/2000/svg";
  const gradientId = `footer-engine-light-${Date.now()}`;
  const lightSvg = svg.cloneNode(true);
  const $lightSvg = $(lightSvg);

  $svg.siblings(".footer-svg-light").remove();

  $lightSvg
    .removeClass("footer-svg-engine")
    .addClass("footer-svg-light")
    .attr({
      "aria-hidden": "true",
      focusable: "false",
    });

  const defs = document.createElementNS(svgNamespace, "defs");
  const gradient = document.createElementNS(svgNamespace, "radialGradient");
  const stops = [
    ["0%", "#ffffff", "1"],
    ["20%", "#ffffff", "1"],
    ["45%", "#dffaff", "0.95"],
    ["70%", "#79dcff", "0.8"],
    ["100%", "#4a9bff", "0"],
  ];

  gradient.setAttribute("id", gradientId);
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  gradient.setAttribute("r", "170");

  stops.forEach(([offset, color, opacity]) => {
    const stop = document.createElementNS(svgNamespace, "stop");

    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    stop.setAttribute("stop-opacity", opacity);
    gradient.appendChild(stop);
  });

  defs.appendChild(gradient);
  lightSvg.insertBefore(defs, lightSvg.firstChild);

  $lightSvg.find("path").attr("fill", `url(#${gradientId})`);
  $svg.after($lightSvg);

  const lightPosition = { x: 0, y: 0 };

  function renderLight() {
    gradient.setAttribute("cx", lightPosition.x);
    gradient.setAttribute("cy", lightPosition.y);
  }

  const xTo = gsap.quickTo(lightPosition, "x", {
    duration: 0.18,
    ease: "power3.out",
    onUpdate: renderLight,
  });

  const yTo = gsap.quickTo(lightPosition, "y", {
    duration: 0.18,
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
    .off(".footerEngineLight")
    .on("mouseenter.footerEngineLight", function (event) {
      moveLight(event, true);
      gsap.to(lightSvg, {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
      });
    })
    .on("mousemove.footerEngineLight", moveLight)
    .on("mouseleave.footerEngineLight", function () {
      gsap.to(lightSvg, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        overwrite: true,
      });
    });

  return () => {
    $svg.off(".footerEngineLight");
    xTo.tween.kill();
    yTo.tween.kill();
    gsap.killTweensOf(lightSvg);
    $lightSvg.remove();
  };
}

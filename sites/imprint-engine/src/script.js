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



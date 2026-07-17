window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

let primaryDuration = 1;
let primaryEase = "expo.out";
let opacityEase = "power1.out";
let toggleReset = "play none none none";
let mm = gsap.matchMedia();

gsap.registerPlugin(ScrollTrigger);

function runSplit() {
  $("[run-split]").each(function () {
    const split = new SplitType(this, {
      types: "lines, words, chars",
      tagName: "span",
    });
    $(this).data("split", split);
  });
}
document.fonts.ready.then(() => {
  runSplit();
});

const onDesktop = (fn) =>
  gsap.matchMedia().add("(min-width: 992px) and (pointer: fine)", fn);
const onMobile = (fn) =>
  gsap.matchMedia().add("(max-width: 991px), (pointer: coarse)", fn);

const lenis = new Lenis({
  gestureOrientation: "vertical",
  normalizeWheel: false,
  smoothTouch: false,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

if (document.querySelector(".hero-section")) {
  homeScripts();
}

if (document.querySelector(".filter-section")) {
  workScripts();
}

if (document.querySelector(".next-section")) {
  projectScripts();
}

// global functions
function globalScripts() {
  function windowResizeRefresh() {
    let t;
    const exec = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    $(window).on("resize", function () {
      clearTimeout(t);
      t = setTimeout(exec, 150);
    });
    window.addEventListener("orientationchange", exec);
  }

  windowResizeRefresh();

  gsap.ticker.lagSmoothing(0);
  function resetWebflow() {
    Webflow.destroy();
    Webflow.ready();
    Webflow.require("ix2").init();
  }

  function navMenuControl() {
    let navMenuControlTimeline;
    let contactPETimer = null;

    const setContactPE = (enabled) => {
      $("[contact-btn-pointer]").css(
        "pointer-events",
        enabled ? "auto" : "none"
      );
    };

    function buildMenuTl(w) {
      if (navMenuControlTimeline) {
        if (navMenuControlTimeline.scrollTrigger)
          navMenuControlTimeline.scrollTrigger.kill();
        navMenuControlTimeline.kill();
      }
      navMenuControlTimeline = gsap
        .timeline({ paused: true })
        .fromTo(
          ".menu-item",
          { opacity: 1 },
          { opacity: 0, duration: 0.1, ease: "linear" },
          0
        )
        .fromTo(
          ".menu-item",
          { width: w },
          { width: "0rem", duration: 0.3, ease: "power1.inOut" },
          0.1
        )
        .fromTo(
          ".menu-item_menu",
          { width: "0rem" },
          { width: w, duration: 0.3, ease: "power1.inOut" },
          0.1
        );
    }

    function openMenu(immediate = false) {
      if (immediate) navMenuControlTimeline.progress(0);
      else navMenuControlTimeline.reverse();
    }

    function closeMenu(immediate = false) {
      if (immediate) navMenuControlTimeline.progress(1);
      else navMenuControlTimeline.play();
    }

    function toggleMenu() {
      if (
        navMenuControlTimeline.progress() === 0 ||
        navMenuControlTimeline.reversed()
      )
        closeMenu();
      else openMenu();
    }

    onDesktop(() => {
      buildMenuTl("5.75rem");
      openMenu(true);
      $("[menu-btn]").off(".nav").on("mouseenter.nav", toggleMenu);
      $(".menu-layout")
        .off(".nav")
        .on("mouseleave.nav pointerleave.nav", function () {
          if (!$("body").hasClass("is-top")) closeMenu();
        });
      ScrollTrigger.create({
        id: "navMenuControlDesktop",
        trigger: ".scroll-trigger",
        start: "bottom 80%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
        onEnter: () => closeMenu(),
        onLeaveBack: () => openMenu(),
      });
    });

    onMobile(() => {
      buildMenuTl("4.1rem");
      closeMenu(true);
      setContactPE(false);
      $("[menu-btn], .menu-layout, document").off(".nav");

      navMenuControlTimeline.eventCallback("onComplete", () => {
        clearTimeout(contactPETimer);
        setContactPE(false);
      });

      navMenuControlTimeline.eventCallback("onReverseComplete", () => {
        clearTimeout(contactPETimer);
        setContactPE(false);
        contactPETimer = setTimeout(() => setContactPE(true), 500);
      });

      $("[menu-btn]").on("pointerdown.nav", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = !(
          navMenuControlTimeline.progress() === 0 ||
          navMenuControlTimeline.reversed()
        );
        if (willOpen) {
          clearTimeout(contactPETimer);
          setContactPE(false);
        }
        toggleMenu();
      });

      $(".menu-layout").on("pointerdown.nav", function (e) {
        e.stopPropagation();
      });

      $(document).on("pointerdown.nav", function (e) {
        if ($(e.target).closest(".menu-layout, [menu-btn]").length === 0) {
          clearTimeout(contactPETimer);
          setContactPE(false);
          closeMenu();
        }
      });

      $(".menu-layout").each(function () {
        const $layout = $(this);
        const $items = $layout.find(".menu-item");
        const $hoverMove = $layout.find(".menu-hover-move").first();
        if (!$items.length || !$hoverMove.length) return;

        const $active = $items.filter(".is-active, .w--current").first();
        const $default = $active.length ? $active : $items.first();

        if (!$default[0].contains($hoverMove[0])) {
          const s = Flip.getState($hoverMove[0]);
          $hoverMove.appendTo($default);
          Flip.from(s, { duration: 0.3, ease: "power2.out", absolute: true });
        }

        $items.off(".flipMobile").on("pointerdown.flipMobile", function () {
          const $t = $(this);
          if ($t[0].contains($hoverMove[0])) return;
          const s = Flip.getState($hoverMove[0]);
          $hoverMove.appendTo($t);
          Flip.from(s, { duration: 0.3, ease: "power2.out", absolute: true });
        });

        const prevComplete = navMenuControlTimeline.eventCallback("onComplete");
        navMenuControlTimeline.eventCallback("onComplete", function () {
          if (typeof prevComplete === "function") prevComplete();
          const $return = $active.length ? $active : $items.first();
          if ($return[0].contains($hoverMove[0])) return;
          const s = Flip.getState($hoverMove[0]);
          $hoverMove.appendTo($return);
          Flip.from(s, { duration: 0.3, ease: "power1.in", absolute: true });
        });
      });
    });
  }

  navMenuControl();

  function damp(current, target, smoothing, deltaTime) {
    return current + (target - current) * Math.min(1, smoothing * deltaTime);
  }

  class ParallaxSlider extends Smooothy {
    constructor(section, config = {}) {
      const wrapper = section.querySelector('[data-smooothy="1"]');
      const slides = [...wrapper.querySelectorAll("[slide-w]")];
      const parallaxEls = slides.map((slide) =>
        slide.querySelector("[parallax]")
      );

      // 👇 read multiplier from wrapper instead of section
      const speedMultiplier =
        parseFloat(wrapper.getAttribute("slider-speed")) || 1;

      const paginationEl = section.querySelector("[slider-pagination]");
      const prevBtn = section.querySelector("[slider-prev]");
      const nextBtn = section.querySelector("[slider-next]");

      super(wrapper, {
        onUpdate({ speed, deltaTime, parallaxValues }) {
          this.lerpedSpeed = damp(this.lerpedSpeed || 0, speed, 5, deltaTime);

          parallaxEls.forEach((el, i) => {
            if (!el) return;
            const offset = parallaxValues?.[i] ?? 0;
            el.style.transform = `translateX(${
              offset * Math.abs(this.lerpedSpeed) * 20 * speedMultiplier
            }%)`;
          });
        },

        onSlideChange(current) {
          if (this.dots?.length) {
            this.dots.forEach((dot, i) => {
              dot.classList.toggle("is-active", i === current);
            });
          }
        },
      });

      this.lerpedSpeed = 0;
      this.dots = [];

      if (paginationEl) {
        paginationEl.innerHTML = "";
        for (let i = 0; i < slides.length; i++) {
          const dot = document.createElement("div");
          dot.classList.add("slider-dot");
          if (i === 0) dot.classList.add("is-active");
          paginationEl.appendChild(dot);
          this.dots.push(dot);
        }
      }

      const simulateDrag = (direction) => {
        const initial = 0;
        const peak = direction === "next" ? 0.3 : -0.3;

        const simulateDragTimeline = gsap.timeline();

        simulateDragTimeline.fromTo(
          this,
          { lerpedSpeed: initial },
          { lerpedSpeed: peak, duration: 0.3, ease: "power1.out" }
        );

        simulateDragTimeline.fromTo(
          this,
          { lerpedSpeed: peak },
          { lerpedSpeed: initial, duration: 0.9, ease: "power1.out" },
          ">"
        );
      };

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          this.goToPrev();
          simulateDrag("prev");
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.goToNext();
          simulateDrag("next");
        });
      }
    }
  }

  const rafs = [];

  document.querySelectorAll("[slider-section]").forEach((section) => {
    const sliderWrapper = section.querySelector('[data-smooothy="1"]');
    if (sliderWrapper) {
      const slider = new ParallaxSlider(section, {
        infinite: false,
        snap: true,
      });
      rafs.push(() => slider.update());
    }
  });

  function animate() {
    rafs.forEach((raf) => raf());
    requestAnimationFrame(animate);
  }
  animate();

  $("[work-hover]").each(function () {
    let $item = $(this);
    let $overlay = $item.find(".link-overlay");
    let $img = $item.find("[img-scale]");
    let $circle = $item.find("[work-circle-rotate]");
    let $arrow = $item.find(".work-item-arrow");
    let rotation = 0;
    let spinInterval;

    gsap.set($overlay, { opacity: 0 });
    gsap.set($img, { scale: 1.1 });
    gsap.set($circle, { rotation: 0 });

    let workItemHoverTl = gsap
      .timeline({ paused: true })
      .fromTo(
        $overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "linear" },
        0
      );

    $item.on("mouseenter", function () {
      workItemHoverTl.play();
      spinInterval = setInterval(function () {
        rotation += 45;
        gsap.set($circle, { rotation: rotation });
      }, 150);
    });

    $item.on("mouseleave", function () {
      workItemHoverTl.reverse();
      clearInterval(spinInterval);
    });
  });

  onDesktop(() => {
    $(".menu-layout").each(function () {
      const $layout = $(this);
      const $items = $layout.find(".menu-item");
      const $hoverMove = $layout.find(".menu-hover-move").first();
      if (!$items.length || !$hoverMove.length) return;

      const path = window.location.pathname || "";
      const isWorkDetail = /^\/work\/.+/.test(path);
      const $forced = isWorkDetail ? $items.filter("[menu-work]") : $();

      const $active = $forced.length
        ? $forced
        : $items.filter(".is-active, .w--current").first();
      const $default = $active.length ? $active : $items.first();

      if (!$default[0].contains($hoverMove[0])) {
        const s = Flip.getState($hoverMove[0]);
        $hoverMove.appendTo($default);
        Flip.from(s, { duration: 0.3, ease: "power2.out", absolute: true });
      }

      $items.off(".flip").on("mouseenter.flip", function () {
        const $t = $(this);
        if ($t[0].contains($hoverMove[0])) return;
        const state = Flip.getState($hoverMove[0]);
        $hoverMove.appendTo($t);
        Flip.from(state, { duration: 0.3, ease: "power2.out", absolute: true });
      });

      $layout.off(".flip").on("mouseleave.flip", function () {
        const $return = $active.length ? $active : $items.first();
        if ($return[0].contains($hoverMove[0])) return;
        const state = Flip.getState($hoverMove[0]);
        $hoverMove.appendTo($return);
        Flip.from(state, { duration: 0.3, ease: "power1.in", absolute: true });
      });
    });
  });

  onMobile(() => {
    $(".menu-layout").each(function () {
      const $layout = $(this);
      const $hoverMove = $layout.find(".menu-hover-move").first();
      if (!$hoverMove.length) return;

      const isWorkDetail = /^\/work\/.+/.test(window.location.pathname || "");
      if (!isWorkDetail) return;

      const $target = $layout.find(".menu-item[menu-work]");
      if (!$target.length || $target[0].contains($hoverMove[0])) return;

      const s = Flip.getState($hoverMove[0]);
      $hoverMove.appendTo($target);
      Flip.from(s, { duration: 0.3, ease: "power2.out", absolute: true });
    });
  });

  onDesktop(() => {
    $("[btn-arrow-wrap]").each(function () {
      let $wrap = $(this);
      let $arrow = $wrap.find("[btn-arrow-spin]");
      let rotation = 0;
      let spinInterval;

      $wrap.on("mouseenter", function () {
        rotation += 45;
        gsap.set($arrow, { rotation: rotation });

        spinInterval = setInterval(function () {
          rotation += 45;
          gsap.set($arrow, { rotation: rotation });
        }, 150);
      });

      $wrap.on("mouseleave", function () {
        clearInterval(spinInterval);
        rotation = 0;
        gsap.set($arrow, { rotation: 0 });
      });
    });
  });

  $("[news-section]").each(function () {
    let section = $(this);
    let slides = section.find("[news-slide]");
    let firstFour = slides.slice(0, 4);

    gsap.set(firstFour, { xPercent: 200 });

    let newsSectionAnimationTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section[0],
        start: "top 75%",
        end: "top 75%",
        toggleActions: toggleReset,
      },
    });

    newsSectionAnimationTimeline.to(firstFour, {
      xPercent: 0,
      duration: primaryDuration,
      ease: primaryEase,
      stagger: 0.05,
    });
  });

  $(".footer-section").each(function () {
    let section = $(this);
    let item = section.find("[flip-item]");
    let wrap = section.find("[flip-wrap]");
    let trigger = $("[footer-flip-trigger]");

    onDesktop(() => {
      let footerLogoFlip = gsap.timeline({
        defaults: { duration: primaryDuration, ease: primaryEase },
        scrollTrigger: {
          trigger: trigger,
          start: "bottom 70%",
          end: "bottom 70%",
          toggleActions: "play none reset none",
        },
      });
      footerLogoFlip.fromTo(wrap, { yPercent: 100 }, { yPercent: 0 });
      footerLogoFlip.fromTo(
        item,
        { clipPath: "inset(0% 0% 100% 0%)", yPercent: 110, rotateX: -75 },
        { yPercent: 0, rotateX: 0, clipPath: "inset(0% 0% -10% 0%)" },
        "<"
      );
      footerLogoFlip.fromTo(
        item,
        { opacity: 0 },
        { opacity: 1, duration: primaryDuration / 2, ease: "power1.out" },
        "<"
      );
    });

    onMobile(() => {
      let footerLogoFlip = gsap.timeline({
        defaults: { duration: primaryDuration, ease: primaryEase },
        scrollTrigger: {
          trigger: trigger,
          start: "bottom 40%",
          end: "bottom 40%",
          toggleActions: "play none reset none",
        },
      });
      footerLogoFlip.fromTo(wrap, { yPercent: 100 }, { yPercent: 0 });
      footerLogoFlip.fromTo(
        item,
        { clipPath: "inset(0% 0% 100% 0%)", yPercent: 110, rotateX: -75 },
        { yPercent: 0, rotateX: 0, clipPath: "inset(0% 0% -10% 0%)" },
        "<"
      );
      footerLogoFlip.fromTo(
        item,
        { opacity: 0 },
        { opacity: 1, duration: primaryDuration / 2, ease: "power1.out" },
        "<"
      );
    });
  });

  function initWorkPopups() {
    const $popups = $("[popup-item]");
    $popups.css("display", "none");

    function showPopup($target) {
      const $bg = $target.find("[popup-bg]");
      const $content = $target.find("[popup-content]");
      const $closeWrap = $target.find("[popup-close-wrap]");

      $popups.css("display", "none");
      $target.css("display", "flex");

      gsap.set($content, { xPercent: 200 });
      gsap.set($closeWrap, { xPercent: 200, opacity: 0 });
      gsap.set($bg, { opacity: 0 });

      const tl = gsap.timeline();
      tl.to($bg, { opacity: 1, duration: 0.3, ease: "linear" }, 0);
      tl.to(
        $content,
        { xPercent: 0, duration: 0.3, ease: "power2.out" },
        "<50%"
      );
      tl.to(
        $closeWrap,
        { xPercent: 0, duration: 0.3, ease: "power2.out" },
        "<60%"
      );
      tl.to($closeWrap, { opacity: 1, duration: 0.1, ease: "linear" }, "<10%");
    }

    function hidePopup($target) {
      const $bg = $target.find("[popup-bg]");
      const $content = $target.find("[popup-content]");
      const $closeWrap = $target.find("[popup-close-wrap]");

      const tl = gsap.timeline({
        onComplete: () => {
          $target.css("display", "none");
          gsap.set([$content, $closeWrap], { clearProps: "transform,opacity" });
          gsap.set($bg, { clearProps: "opacity" });
        },
      });

      tl.to($closeWrap, { xPercent: 200, duration: 0.3, ease: "power2.in" }, 0);
      tl.set($closeWrap, { opacity: 0 });
      tl.to(
        $content,
        { xPercent: 200, duration: 0.3, ease: "power2.in" },
        "<50%"
      );
      tl.to($bg, { opacity: 0, duration: 0.3, ease: "linear" }, "<");
    }

    $(document).on("click", "[work-item]", function (e) {
      e.stopPropagation();
      const name = $(this).attr("work-item");
      const $target = $(`[popup-item="${name}"]`);
      if ($target.length) showPopup($target);
    });

    $(document).on("click", "[popup-close]", function (e) {
      e.stopPropagation();
      const $popup = $(this).closest("[popup-item]");
      if ($popup.length) hidePopup($popup);
    });

    $(document).on("click", "[popup-content]", function (e) {
      e.stopPropagation();
    });

    $(document).on("click", function (e) {
      const $open = $("[popup-item]:visible");
      if (!$open.length) return;
      if ($(e.target).closest("[popup-content], [work-item]").length) return;
      hidePopup($open.first());
    });
  }

  initWorkPopups();

  function initCloseIconHover() {
    const $icons = $(".popup-close-item");

    $icons.each(function () {
      const $icon = $(this);
      const $rects = $icon.find("rect");
      let runner = null;

      function launch() {
        const el = gsap.utils.random($rects.toArray());
        gsap.set(el, { opacity: 0 });
        gsap.delayedCall(0.25, () => gsap.set(el, { opacity: 1 }));
        runner = gsap.delayedCall(0.2, launch);
      }

      $icon.on("mouseenter", function () {
        if (!runner) launch();
      });

      $icon.on("mouseleave", function () {
        if (runner) {
          runner.kill();
          runner = null;
        }
        gsap.set($rects, { opacity: 1 });
      });
    });
  }

  initCloseIconHover();

  function initWorkPopups() {
    const $popups = $("[popup-item]");
    $popups.css("display", "none");

    function showPopup($target) {
      const $bg = $target.find("[popup-bg]");
      const $content = $target.find("[popup-content]");
      const $closeWrap = $target.find("[popup-close-wrap]");

      // reveal wrapper
      $popups.css("display", "none");
      $target.css("display", "flex");

      // reset states
      gsap.set($content, { xPercent: 200 });
      gsap.set($closeWrap, { xPercent: 200 });
      gsap.set($bg, { opacity: 0 });
      gsap.set($closeWrap, { opacity: 0 });

      const workPopupTimeline = gsap.timeline({});

      workPopupTimeline.to(
        $bg,
        { opacity: 1, duration: 0.3, ease: "linear" },
        0
      );

      workPopupTimeline.to(
        $content,
        { xPercent: 0, duration: 0.3, ease: "power2.out" },
        "<50%"
      );

      workPopupTimeline.to(
        $closeWrap,
        { xPercent: 0, duration: 0.3, ease: "power2.out" },
        "<60%"
      );

      workPopupTimeline.to(
        $closeWrap,
        { opacity: 1, duration: 0.1, ease: "linear" },
        "<10%"
      );
    }

    function hidePopup($target) {
      const $bg = $target.find("[popup-bg]");
      const $content = $target.find("[popup-content]");
      const $closeWrap = $target.find("[popup-close-wrap]");

      const workPopupTimeline = gsap.timeline({
        onComplete: () => {
          $target.css("display", "none");
          gsap.set([$content, $closeWrap], { clearProps: "transform,opacity" });
          gsap.set($bg, { clearProps: "opacity" });
        },
      });

      workPopupTimeline.to(
        $closeWrap,
        { xPercent: 200, duration: 0.3, ease: "power2.in" },
        0
      );

      workPopupTimeline.set($closeWrap, { opacity: 0 });

      workPopupTimeline.to(
        $content,
        { xPercent: 200, duration: 0.3, ease: "power2.in" },
        "<50%"
      );

      workPopupTimeline.to(
        $bg,
        { opacity: 0, duration: 0.3, ease: "linear" },
        "<"
      );
    }

    // open
    $(document).on("click", "[work-item]", function () {
      const name = $(this).attr("work-item");
      const $target = $(`[popup-item="${name}"]`);
      if ($target.length) showPopup($target);
    });

    // close
    $(document).on("click", "[popup-close]", function () {
      const $popup = $(this).closest("[popup-item]");
      if ($popup.length) hidePopup($popup);
    });
  }

  initWorkPopups();

  function initContactPopup() {
    const $wrap = $("[contact-page]");
    if (!$wrap.length) return;

    $wrap.css("display", "none");

    function openContact() {
      lenis.stop();

      const $bg = $wrap.find("[popup-bg]");
      const $content = $wrap.find("[popup-content]");
      const $closeWrap = $wrap.find("[popup-close-wrap]");

      $wrap.css("display", "flex");

      gsap.set($content, { xPercent: 200 });
      gsap.set($closeWrap, { xPercent: 200, opacity: 0 });
      gsap.set($bg, { opacity: 0 });

      const contactPopupTimeline = gsap.timeline();
      contactPopupTimeline.to(
        $bg,
        { opacity: 1, duration: 0.3, ease: "linear" },
        0
      );
      contactPopupTimeline.to(
        $content,
        { xPercent: 0, duration: 0.3, ease: "power2.out" },
        "<50%"
      );
      contactPopupTimeline.to(
        $closeWrap,
        { xPercent: 0, duration: 0.3, ease: "power2.out" },
        "<60%"
      );
      contactPopupTimeline.to(
        $closeWrap,
        { opacity: 1, duration: 0.1, ease: "linear" },
        "<10%"
      );
    }

    function closeContact() {
      const $bg = $wrap.find("[popup-bg]");
      const $content = $wrap.find("[popup-content]");
      const $closeWrap = $wrap.find("[popup-close-wrap]");

      const contactPopupTimeline = gsap.timeline({
        onComplete: () => {
          $wrap.css("display", "none");
          gsap.set([$content, $closeWrap], { clearProps: "transform,opacity" });
          gsap.set($bg, { clearProps: "opacity" });
          lenis.start();
        },
      });

      contactPopupTimeline.to(
        $closeWrap,
        { xPercent: 200, duration: 0.3, ease: "power2.in" },
        0
      );
      contactPopupTimeline.set($closeWrap, { opacity: 0 });
      contactPopupTimeline.to(
        $content,
        { xPercent: 200, duration: 0.3, ease: "power2.in" },
        "<50%"
      );
      contactPopupTimeline.to(
        $bg,
        { opacity: 0, duration: 0.3, ease: "linear" },
        "<"
      );
    }

    $(document).on("click", "[contact-btn]", openContact);
    $(document).on("click", "[popup-close]", function () {
      if ($(this).closest("[contact-page]").length) closeContact();
    });

    $(document).on("click", ".popup-item", function (e) {
      e.stopPropagation();
    });

    $(document).on("click", function (e) {
      if (
        $wrap.is(":visible") &&
        !$(e.target).closest(".popup-item").length &&
        !$(e.target).closest("[contact-btn]").length
      ) {
        closeContact();
      }
    });
  }

  initContactPopup();

  $("[data-email-address]").on("click", function () {
    const $el = $(this);
    const email = $el.attr("data-email-address");

    const originalHTML = $el.html(); // keep everything (incl. [line])
    const $line = $el.find("[line]");
    const lineHTML = $line.length ? $line.prop("outerHTML") : "";

    function showCopied() {
      $el.addClass("is-clicked");
      // replace only the label, keep the underline element
      $el.html(`<span data-copy-text>Copied to clipboard</span>${lineHTML}`);

      setTimeout(() => {
        $el.html(originalHTML); // restore underline + original text
        $el.removeClass("is-clicked");
      }, 1000);
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(showCopied).catch(showCopied);
    } else {
      const temp = $("<input>").val(email).appendTo("body").select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      temp.remove();
      showCopied();
    }
  });

  function workHomeScrollAnimate() {
    const $visible = $("[work-scroll-item]:visible");
    const noSkip = $visible.filter('[work-scroll-item="ignore"]').length > 0;

    ScrollTrigger.getAll().forEach((t) => {
      if ($(t.trigger).is("[work-scroll-item]")) t.kill();
    });

    const $initial = noSkip ? $() : $visible.slice(0, 2);
    $initial.each(function () {
      const $item = $(this);
      const $img = $item.find("[work-scroll-img]").first();
      gsap.killTweensOf($item);
      gsap.killTweensOf($img);
      gsap.set($item, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set($img, { scale: 1.2, transformOrigin: "50% 50%" });
    });

    const $targets = noSkip ? $visible : $visible.slice(2);

    $targets.each(function () {
      const $item = $(this);
      const $img = $item.find("[work-scroll-img]").first();

      const workHomeScrollAnimateTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: $item[0],
          start: "top bottom",
          // toggleActions: "play none none none",
        },
      });

      workHomeScrollAnimateTimeline.fromTo(
        $item,
        { clipPath: "inset(15% 15% 15% 15%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
        },
        0
      );

      workHomeScrollAnimateTimeline.fromTo(
        $img,
        { scale: 1.4, transformOrigin: "50% 50%" },
        { scale: 1, ease: "expo.out", duration: 1.2 },
        0
      );
    });
  }
  workHomeScrollAnimate();
}

globalScripts();

// home page functions
function homeScripts() {
  function navLogoReveal() {
    gsap.set("[nav-logo-item]", {
      clipPath: "inset(0% 0% 100% 0%)",
      yPercent: 100,
      rotateX: -90,
    });
    $("body").addClass("is-top");

    onDesktop(() => {
      ScrollTrigger.create({
        id: "navLogoRevealDesktop",
        trigger: ".scroll-trigger",
        start: "bottom 80%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
        onEnter: () => {
          $("body").removeClass("is-top");
          const navLogoRevealTimeline = gsap.timeline();
          navLogoRevealTimeline
            .fromTo(
              "[nav-logo-item]",
              { yPercent: 100, clipPath: "inset(0% 0% 100% 0%)" },
              {
                yPercent: 0,
                clipPath: "inset(0% 0% -10% 0%)",
                stagger: 0.1,
                duration: 0.4,
                ease: "power1.out",
                onStart: () =>
                  gsap.set(".nav-logo_wrap", { pointerEvents: "auto" }),
              }
            )
            .fromTo(
              "[nav-logo-item]",
              { rotateX: -90 },
              { rotateX: 0, stagger: 0.09, duration: 0.5, ease: "power1.out" },
              0
            );
        },
        onLeaveBack: () => {
          $("body").addClass("is-top");
          const navLogoRevealTimeline = gsap.timeline();
          navLogoRevealTimeline
            .fromTo(
              "[nav-logo-item]",
              { yPercent: 0, clipPath: "inset(0% 0% -10% 0%)" },
              {
                yPercent: 100,
                clipPath: "inset(0% 0% 100% 0%)",
                stagger: 0.1,
                duration: 0.4,
                ease: "power1.out",
              }
            )
            .fromTo(
              "[nav-logo-item]",
              { rotateX: 0 },
              { rotateX: -90, stagger: 0.1, duration: 0.4, ease: "power1.out" },
              0
            );
        },
      });
    });

    onMobile(() => {
      ScrollTrigger.create({
        id: "navLogoRevealMobile",
        trigger: ".scroll-trigger",
        start: "bottom 80%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
        onEnter: () => {
          $("body").removeClass("is-top");
          const navLogoRevealTimeline = gsap.timeline();
          navLogoRevealTimeline
            .fromTo(
              "[nav-logo-item]",
              { yPercent: 100, clipPath: "inset(0% 0% 100% 0%)" },
              {
                yPercent: 0,
                clipPath: "inset(0% 0% -10% 0%)",
                stagger: 0.1,
                duration: 0.4,
                ease: "power1.out",
                onStart: () =>
                  gsap.set(".nav-logo_wrap", { pointerEvents: "auto" }),
              }
            )
            .fromTo(
              "[nav-logo-item]",
              { rotateX: -90 },
              { rotateX: 0, stagger: 0.09, duration: 0.5, ease: "power1.out" },
              0
            );
        },
        onLeaveBack: () => {
          $("body").addClass("is-top");
          const navLogoRevealTimeline = gsap.timeline();
          navLogoRevealTimeline
            .fromTo(
              "[nav-logo-item]",
              { yPercent: 0, clipPath: "inset(0% 0% -10% 0%)" },
              {
                yPercent: 100,
                clipPath: "inset(0% 0% 100% 0%)",
                stagger: 0.1,
                duration: 0.4,
                ease: "power1.out",
              }
            )
            .fromTo(
              "[nav-logo-item]",
              { rotateX: 0 },
              { rotateX: -90, stagger: 0.1, duration: 0.4, ease: "power1.out" },
              0
            );
        },
      });
    });
  }
  navLogoReveal();

  function peopleLotiAnimation() {
    const anim = lottie.loadAnimation({
      container: document.querySelector(".loti-item"),
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "https://cdn.prod.website-files.com/688b54e20c1a494f7d4678bc/689dde72bf126473b5ea1861_loti.json",
    });

    anim.addEventListener("DOMLoaded", function () {
      const svg = anim.renderer.svgElement;
      if (svg) svg.classList.add("loti-svg");
    });

    anim.addEventListener("complete", () => {
      homeIntroTransition();
    });

    // anim.onComplete = () => alert("done");
  }

  function homeIntroTransition() {
    lenis.scrollTo(0, { immediate: true });
    lenis.stop();

    let el = $("[lander-text]");
    let split =
      $(el).data("split") ||
      new SplitType(el, { types: "lines, words, chars", tagName: "span" });

    let homeIntroTransitionTimeline = gsap.timeline({
      defaults: { duration: primaryDuration, ease: primaryEase },
      onComplete() {
        lenis.start();
        ScrollTrigger.refresh();
      },
    });
    onDesktop(() => {
      homeIntroTransitionTimeline.add(() => {
        let $wrap = $(".home-header_wrap");
        let $end = $(".home-header_end");
        let state = Flip.getState($wrap[0]);
        $wrap.appendTo($end);
        return Flip.from(state, {
          duration: primaryDuration,
          ease: "power2.inOut",
        });
      });
    });

    homeIntroTransitionTimeline.to(
      ".loti-wrap",
      { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "power2.inOut" },
      "<"
    );

    homeIntroTransitionTimeline.fromTo(
      ".loti-item",
      { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, rotateX: 0 },
      {
        yPercent: -100,
        rotateX: 75,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.65,
        ease: "power2.inOut",
      },
      "<"
    );

    onDesktop(() => {
      homeIntroTransitionTimeline.fromTo(
        split.lines,
        { yPercent: 100, clipPath: "inset(0% 0% 100% 0%)" },
        { yPercent: 0, clipPath: "inset(0% 0% -10% 0%)", stagger: 0.1 },
        "<60%"
      );
      homeIntroTransitionTimeline.fromTo(
        "[video-item]",
        { y: 200 },
        { y: 0, duration: 0.8, ease: "expo.out" },
        "<"
      );
      homeIntroTransitionTimeline.fromTo(
        "[shopify-item]",
        { y: -200 },
        { y: 0, duration: 0.8, ease: "expo.out" },
        "<"
      );
    });

    onMobile(() => {
      homeIntroTransitionTimeline.from("[lander-text]", { y: "10rem" }, "<60%");
      homeIntroTransitionTimeline.from(".home-header_end", { y: "10rem" }, "<");
      homeIntroTransitionTimeline.from("[video-item]", { y: "10rem" }, "<");
      homeIntroTransitionTimeline.from("[shopify-item]", { y: "10rem" }, "<");
      homeIntroTransitionTimeline.from(
        ".header-scroll-text",
        { y: "10rem" },
        "<"
      );
    });
  }

  function firstLoadGate() {
    const KEY = "gbs_preloader_done_v1";
    const isFirst = !localStorage.getItem(KEY);

    if (isFirst) {
      peopleLotiAnimation = (function () {
        const _peopleLotiAnimation = peopleLotiAnimation;
        return function () {
          const anim = lottie.loadAnimation({
            container: document.querySelector(".loti-item"),
            renderer: "svg",
            loop: false,
            autoplay: true,
            path: "https://cdn.prod.website-files.com/688b54e20c1a494f7d4678bc/689dde72bf126473b5ea1861_loti.json",
          });

          anim.addEventListener("DOMLoaded", function () {
            const svg = anim.renderer.svgElement;
            if (svg) svg.classList.add("loti-svg");
          });

          anim.addEventListener("complete", () => {
            localStorage.setItem(KEY, "1");
            homeIntroTransition();
          });
        };
      })();
      peopleLotiAnimation();
    } else {
      skipPreloaderIntro();
    }
  }

  function skipPreloaderIntro() {
    try {
      gsap.set(".preloader-wrap", { display: "none" });
      gsap.set(".loti-wrap", { display: "none" }); // ensure hidden
      gsap.set(".page-main", { opacity: 1 });

      onDesktop(() => {
        const $wrap = $(".home-header_wrap");
        const $end = $(".home-header_end");
        if (
          $wrap.length &&
          $end.length &&
          !$end.find(".home-header_wrap").length
        ) {
          $wrap.appendTo($end);
        }
      });

      lenis.scrollTo(0, { immediate: true });
      lenis.start?.();
      ScrollTrigger.refresh();
    } catch (e) {}
  }

  firstLoadGate();

  $(".header-scroll_wrap").each(function () {
    let wrap = $(this);
    let headerText = wrap.find(".header-scroll-text");
    let scrollFlipTimeline = gsap.timeline({
      defaults: {
        duration: primaryDuration,
        ease: primaryEase,
      },
      scrollTrigger: {
        trigger: wrap,
        start: "top 90%",
        end: "bottom 75%",
        toggleActions: toggleReset,
      },
    });
    scrollFlipTimeline.fromTo(
      wrap,
      {
        yPercent: 100,
      },
      {
        yPercent: 0,
      }
    );

    scrollFlipTimeline.fromTo(
      headerText,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        yPercent: 110,
        rotateX: -75,
      },
      {
        yPercent: 0,
        rotateX: 0,
        clipPath: "inset(0% 0% -10% 0%)",
      },
      "<"
    );
    scrollFlipTimeline.fromTo(
      headerText,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: primaryDuration / 2,
        ease: "power1.out",
      },
      "<"
    );
  });

  $(".services-bot_list").each(function () {
    let el = this;
    let splitOpacityAnimationTimeline = gsap.timeline({
      defaults: { duration: 0.01, ease: "linear" },
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "bottom 75%",
        toggleActions: toggleReset,
      },
    });

    splitOpacityAnimationTimeline.fromTo(el, { opacity: 0 }, { opacity: 1 }, 0);
  });

  $(".service_num").each(function () {
    let el = this;
    let $text = $(el).find("[service-num]");

    let splitNumAnimationTimeline = gsap.timeline({
      defaults: {
        duration: primaryDuration,
        ease: primaryEase,
      },
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "bottom 75%",
        toggleActions: toggleReset,
      },
    });

    splitNumAnimationTimeline.fromTo(
      $text,
      {
        yPercent: 100,

        clipPath: "inset(0% 0% 100% 0%)",
        transformOrigin: "50% 100%",
      },
      {
        yPercent: 0,

        clipPath: "inset(0% 0% -10% 0%)",
        stagger: 0.1,
      },
      0
    );
  });

  $("[split-heading]").each(function () {
    let el = this;

    let prevSplit = $(el).data("split");
    if (prevSplit) prevSplit.revert();

    let split = new SplitType(el, { types: "lines", tagName: "span" });
    $(el).data("split", split);

    gsap.set(split.lines, {
      yPercent: 100,
      rotateX: -90,
      clipPath: "inset(0% 0% 100% 0%)",
    });

    let splitHeadingTimeline = gsap.timeline({
      defaults: {
        duration: primaryDuration,
        ease: primaryEase,
      },
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "bottom 75%",
        toggleActions: toggleReset,
      },
    });

    splitHeadingTimeline.fromTo(
      split.lines,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        yPercent: 110,
        rotateX: -75,
      },
      {
        yPercent: 0,
        rotateX: 0,
        clipPath: "inset(0% 0% -10% 0%)",
      },
      "<"
    );
    splitHeadingTimeline.fromTo(
      split.lines,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: primaryDuration / 2,
        ease: "power1.out",
      },
      "<"
    );
  });

  $(document).on("dblclick", ".news-item", function () {
    const url = $(this).attr("news-link");
    if (!url) return;
    window.open(url, "_blank", "noopener");
  });

  function splitTextAnimation() {
    let ready =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
    ready.then(() => {
      $("[split-text]").each(function () {
        setupSplitText(this);
      });
    });
  }

  splitTextAnimation();

  function setupSplitText(el) {
    let $el = $(el);

    let prevTl = $el.data("splitTextAnimationTimeline");
    if (prevTl) {
      if (prevTl.scrollTrigger) prevTl.scrollTrigger.kill();
      prevTl.kill();
    }

    let prevSplit = $el.data("split");
    if (prevSplit) prevSplit.revert();

    let split = new SplitType(el, {
      types: "lines, words, chars",
      tagName: "span",
    });
    $el.data("split", split);

    gsap.set(split.lines, {
      yPercent: 100,

      clipPath: "inset(0% 0% 100% 0%)",
      transformOrigin: "50% 100%",
    });

    let splitTextAnimationTimeline = gsap.timeline({
      defaults: {
        duration: primaryDuration,
        ease: primaryEase,
      },
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "bottom 75%",
        toggleActions: toggleReset,
      },
    });

    splitTextAnimationTimeline
      .fromTo(
        split.lines,
        {
          yPercent: 100,
          clipPath: "inset(0% 0% 100% 0%)",
          transformOrigin: "50% 100%",
        },
        {
          yPercent: 0,
          clipPath: "inset(0% 0% -10% 0%)",
          stagger: 0.1,
          immediateRender: false,
        },
        0
      )
      .to(
        split.lines,
        {
          stagger: 0.09,
        },
        0
      );

    $el.data("splitTextAnimationTimeline", splitTextAnimationTimeline);
  }

  onDesktop(() => {
    function debounce(fn, wait) {
      let t;
      return function () {
        clearTimeout(t);
        const args = arguments,
          ctx = this;
        t = setTimeout(function () {
          fn.apply(ctx, args);
        }, wait);
      };
    }

    document.fonts.ready.then(() => {
      window.addEventListener(
        "resize",
        debounce(function () {
          $("[split-text]").each(function () {
            setupSplitText(this);
          });
          ScrollTrigger.refresh();
        }, 150)
      );
    });
  });

  onDesktop(() => {
    $(".services-section").each(function () {
      let solutionsSection = $(this);
      let solutionItems = solutionsSection.find(".services-item");
      let firstThree = solutionItems.slice(0, 3);
      let lastItem = solutionItems.slice(3);

      let solutionTopHeight = 0;
      let firstSolutionTop = solutionItems.first().find(".services-top");
      if (firstSolutionTop.length) {
        solutionTopHeight = firstSolutionTop.outerHeight() * 0.3;
      }

      let pinStartOffset = $(".nav-wrap").outerHeight() || 0;

      firstThree.each(function (index) {
        let solutionItem = $(this);
        let pinPosition = pinStartOffset + index * solutionTopHeight;

        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === solutionItem[0]) trigger.kill();
        });

        let solutionPinTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: solutionItem,
            start: `top top+=${pinPosition}`,
            end: "top 215px",
            endTrigger: lastItem,
            pin: solutionItem,
            pinSpacing: false,
            scrub: true,
            // markers: true,
          },
        });

        solutionPinTl.fromTo(
          solutionItem,
          { yPercent: 0 },
          { yPercent: -20 },
          0
        );
      });
    });
  });

  $("[data-review-slider]").each(function () {
    const $container = $(this);
    const $wrapper = $container.find(".review-slider");
    const $textWrap = $container
      .closest(".review-section")
      .find(".review-text");
    const $texts = $textWrap.children("[text]");
    const $section = $container.closest(".review-section");

    const AUTOPLAY_DELAY = 5000;
    const SLIDE_SPEED = 600;
    const SLIDE_EASE = "cubic-bezier(0.22,0.61,0.36,1)";

    const SCALE_CENTER = 2;
    const SCALE_SIDE = 1.5;
    const SCALE_DUR = 0.35;
    const SCALE_EASE = "power2.out";

    const CIRCLE_FADE_DUR = 0.4;
    const CIRCLE_FADE_EASE = "linear";

    const RING_EASE = "none";
    const TEXT_FADE_DUR = 0.3;

    $container[0].style.setProperty("--slider-ease", SLIDE_EASE);

    let $slides = $wrapper.children(".review-item-wrap");
    const originals = $slides.length;
    if (!originals) return;

    const targetMin = 12;
    if ($slides.length < targetMin) {
      const source = $slides.toArray();
      let i = 0;
      while ($wrapper.children(".review-item-wrap").length < targetMin) {
        $wrapper.append($(source[i % source.length]).clone(true));
        i++;
      }
      $slides = $wrapper.children(".review-item-wrap");
    }

    $wrapper.find(".review-item-wrap").each(function () {
      const $c = $(this).find(".review-circle");
      if (!$c.length || $c.find("svg").length) return;
      $c.append(`
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle class="rc-bg"  cx="50" cy="50" r="49" pathLength="100"></circle>
          <circle class="rc-ring" cx="50" cy="50" r="49" pathLength="100"></circle>
        </svg>
      `);
    });

    function syncReviewText(sw, fromIdx, toIdx, immediate) {
      const toEl = sw.slides[toIdx];
      if (!toEl) return;
      const match = toEl.getAttribute("slide");
      if (!match) return;
      const $next = $texts.filter(`[text="${match}"]`);
      if (!$next.length) return;

      const tl = gsap.timeline();
      if (immediate) {
        gsap.set($texts, { opacity: 0 });
        tl.to(
          $next,
          { opacity: 1, duration: TEXT_FADE_DUR, ease: "linear" },
          0
        );
        return;
      }

      let $prev = $();
      if (fromIdx != null) {
        const fromEl = sw.slides[fromIdx];
        if (fromEl) {
          const prevMatch = fromEl.getAttribute("slide");
          if (prevMatch) $prev = $texts.filter(`[text="${prevMatch}"]`);
        }
      }

      tl.to(
        $prev,
        {
          opacity: 0,
          duration: TEXT_FADE_DUR,
          ease: "linear",
          overwrite: true,
        },
        0
      ).to(
        $next,
        {
          opacity: 1,
          duration: TEXT_FADE_DUR,
          ease: "linear",
          overwrite: true,
        },
        0
      );
    }

    function syncReviewLabel(sw, fromIdx, toIdx, immediate) {
      const toEl = sw.slides[toIdx];
      if (!toEl) return;
      const match = toEl.getAttribute("slide");
      if (!match) return;

      const $all = $section.find("[review-label]");
      const $next = $all.filter(`[review-label="${match}"]`);
      if (!$next.length) return;

      if (immediate) {
        gsap.set($all, { opacity: 0 });
        gsap.fromTo(
          $next,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "linear" }
        );
        return;
      }

      let $prev = $();
      if (fromIdx != null) {
        const fromEl = sw.slides[fromIdx];
        if (fromEl) {
          const prevMatch = fromEl.getAttribute("slide");
          if (prevMatch) $prev = $all.filter(`[review-label="${prevMatch}"]`);
        }
      }

      gsap.fromTo(
        $prev,
        { opacity: 1 },
        { opacity: 0, duration: 0.3, ease: "linear", overwrite: true }
      );
      gsap.fromTo(
        $next,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "linear", overwrite: true }
      );
    }

    const sw = new Swiper($container[0], {
      wrapperClass: "review-slider",
      slideClass: "review-item-wrap",
      slidesPerView: 5,
      centeredSlides: true,
      loop: true,
      speed: SLIDE_SPEED,
      simulateTouch: false,
      autoplay: {
        delay: AUTOPLAY_DELAY,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: $container.find(".review-next")[0],
        prevEl: $container.find(".review-prev")[0],
      },
      on: {
        init() {
          gsap.set($texts, { opacity: 0 });
          gsap.set($section.find("[review-label]"), { opacity: 0 });
          scaleSlides(this);
          drawCircle(this, AUTOPLAY_DELAY);
          syncReviewText(this, null, this.activeIndex, true);
          syncReviewLabel(this, null, this.activeIndex, true);
        },
        slideChangeTransitionStart() {
          const from = this.previousIndex;
          const to = this.activeIndex;
          scaleSlides(this);
          resetAllRings();
          drawCircle(this, AUTOPLAY_DELAY);
          syncReviewText(this, from, to, false);
          syncReviewLabel(this, from, to, false);
        },
      },
    });

    $container.on("click", ".review-item-wrap", function () {
      const real = Number(this.getAttribute("data-swiper-slide-index"));
      sw.slideToLoop(real, SLIDE_SPEED);
    });

    function scaleSlides(sw) {
      const slides = sw.slides,
        len = slides.length,
        ai = sw.activeIndex;
      if (!len) return;

      const c = slides[ai];
      const p1 = slides[(ai - 1 + len) % len];
      const n1 = slides[(ai + 1) % len];
      const p2 = slides[(ai - 2 + len) % len];
      const n2 = slides[(ai + 2) % len];

      gsap.set($(slides).find(".review-circle"), { opacity: 0 });

      if (c)
        gsap.to($(c).find(".review-item_img"), {
          scale: SCALE_CENTER,
          duration: SCALE_DUR,
          ease: SCALE_EASE,
          overwrite: true,
        });
      gsap.to(
        [$(p1).find(".review-item_img"), $(n1).find(".review-item_img")],
        {
          scale: SCALE_SIDE,
          duration: SCALE_DUR,
          ease: SCALE_EASE,
          overwrite: true,
        }
      );
      gsap.to(
        [$(p2).find(".review-item_img"), $(n2).find(".review-item_img")],
        {
          scale: 1,
          duration: SCALE_DUR,
          ease: SCALE_EASE,
          overwrite: true,
        }
      );

      if (c) {
        const $circle = $(c).find(".review-circle");
        gsap.to($circle, {
          opacity: 1,
          duration: CIRCLE_FADE_DUR,
          ease: CIRCLE_FADE_EASE,
          overwrite: true,
        });
      }
    }

    function resetAllRings() {
      const rings = $wrapper.find(".rc-ring").get();
      if (rings.length) {
        gsap.killTweensOf(rings);
        gsap.set(rings, { strokeDashoffset: 100 });
      }
    }

    function drawCircle(sw, delayMs) {
      resetAllRings();
      const active = sw.slides[sw.activeIndex];
      if (!active) return;
      const ring = $(active).find(".rc-ring").get(0);
      if (!ring) return;

      const mult = window.matchMedia("(min-width: 992px) and (pointer: fine)")
        .matches
        ? 1
        : 0.8;

      gsap.to(ring, {
        strokeDashoffset: 0,
        duration: (delayMs / 480) * mult,
        ease: RING_EASE,
      });
    }
  });

  $(".donate-video").each(function () {
    let $item = $(this);
    let $circle = $item.find("[work-circle-rotate]");
    let rotation = 0;
    let spinInterval;

    gsap.set($circle, { rotation: 0 });

    let circleHoverTl = gsap
      .timeline({ paused: true })
      .to($circle, { duration: 0.3, ease: "linear" }, 0);

    $item.on("mouseenter", function () {
      circleHoverTl.play();
      spinInterval = setInterval(function () {
        rotation += 45;
        gsap.set($circle, { rotation: rotation });
      }, 150);
    });

    $item.on("mouseleave", function () {
      circleHoverTl.reverse();
      clearInterval(spinInterval);
    });
  });

  $("[tr-marquee-element='component']").each(function () {
    let componentEl = $(this);
    let panelEl = componentEl.find("[tr-marquee-element='panel']");

    let speed = 100;
    let distance = -100;

    let duration = panelEl.first().width() / speed;

    gsap
      .timeline({ repeat: -1 })
      .fromTo(
        panelEl,
        { xPercent: 0 },
        { xPercent: distance, ease: "none", duration: duration }
      );
  });

  onDesktop(() => {
    $(".donate-video").each(function () {
      const greenboxPaddingAnimTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".greenbox-section",
          start: "top bottom",
          end: "top 25%",
          scrub: true,
        },
        defaults: { ease: "none" },
      });

      greenboxPaddingAnimTimeline.to(".home-video_sticky", { padding: 0 }, 0);

      greenboxPaddingAnimTimeline.to(".home-hero_img", { borderRadius: 0 }, 0);
    });
  });

  $("[video-player]").each(function (index) {
    let playVidBtn = $(this).find("[vid-play]");
    let videoPopupEl = $(this).find("[video-popup]");
    let closeVidBtn = $(this).find("[video-close]");
    let videoItem = $(this).find(".plyr_component");
    let videoBg = $(this).find(".video-popup_bg");

    let thisComponent = $(this);
    const controls = `
  <div class="plyr__controls">
    <div class="plyr__progress">
        <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek">
    </div>
    <div class="plyr_stretch">
        <div class="plyr_col">
            <div class="plyr__control" aria-label="Play, {title}" data-plyr="play">
                <div class="icon--pressed" role="presentation">Pause</div>
                <div class="icon--not-pressed" role="presentation">Play</div>
            </div>
            <div class="plyr__time plyr__time--current" aria-label="Current time">
                00:00
            </div>
        </div>

        <div class="plyr__control" aria-label="Mute" data-plyr="mute">
            <span class="icon--pressed" role="presentation">Sound On</span>
            <span class="icon--not-pressed" role="presentation">Sound Off</span>
        </div>
    </div>
</div>
`;

    let player = new Plyr(thisComponent.find(".plyr_video")[0], {
      controls,
      resetOnEnd: true,
    });

    let videoPopupTl = gsap.timeline({
      paused: true,
      defaults: {
        ease: primaryEase,
        duration: primaryDuration,
      },
      onStart: () => {
        lenis.stop();
      },
      onReverseComplete: () => {
        lenis.start();
      },
    });
    videoPopupTl.set(videoPopupEl, {
      display: "flex",
    });

    videoPopupTl.to(videoBg, {
      opacity: 1,
    });

    videoPopupTl.fromTo(
      videoItem,
      {
        opacity: 0,
        // scale: 0.5,
      },
      {
        opacity: 1,
        // scale: 1,
      },
      "<"
    );
    videoPopupTl.from(
      closeVidBtn,
      {
        opacity: 0,
        duration: 0.6,
      },
      "<"
    );

    videoPopupTl.set(videoBg, {
      pointerEvents: "auto",
    });

    playVidBtn.on("click", function () {
      videoPopupTl.timeScale(1).restart();
      player.play();
    });

    closeVidBtn.on("click", function () {
      videoPopupTl.timeScale(2).reverse();
      player.pause();
    });

    player.on("ended", (event) => {
      videoPopupTl.timeScale(2).reverse();
    });
  });
}

// work page functions
function workScripts() {
  function injectFilterCounts() {
    const $filters = $(".filter-item");
    const $items = $(".work-item");
    const total = $items.length;
    const counts = {};

    $items.each(function () {
      const raw = ($(this).attr("category") || "").trim();
      if (!raw) return;
      raw
        .split(",")
        .map((s) => s.trim())
        .forEach((c) => {
          counts[c] = (counts[c] || 0) + 1;
        });
    });

    $filters.each(function () {
      const $f = $(this);
      const cat = ($f.attr("category") || "").trim();
      const n = cat === "allwork" ? total : counts[cat] || 0;
      $f.find("[filter-list-number]").text(n);
    });
  }

  injectFilterCounts();

  function workScrollAnimate() {
    const $visible = $("[work-scroll-item]:visible");
    const noSkip = $visible.filter('[work-scroll-item="ignore"]').length > 0;

    ScrollTrigger.getAll().forEach((t) => {
      if ($(t.trigger).is("[work-scroll-item]")) t.kill();
    });

    const $initial = noSkip ? $() : $visible.slice(0, 2);
    $initial.each(function () {
      const $item = $(this);
      const $img = $item.find("[work-scroll-img]").first();
      gsap.killTweensOf($item);
      gsap.killTweensOf($img);
      gsap.set($item, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set($img, { scale: 1.2, transformOrigin: "50% 50%" });
    });

    const $targets = noSkip ? $visible : $visible.slice(2);

    $targets.each(function () {
      const $item = $(this);
      const $img = $item.find("[work-scroll-img]").first();

      const workScrollAnimateTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: $item[0],
          start: "top bottom",
          // toggleActions: "play none none none",
        },
      });

      workScrollAnimateTimeline.fromTo(
        $item,
        { clipPath: "inset(15% 15% 15% 15%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
        },
        0
      );

      workScrollAnimateTimeline.fromTo(
        $img,
        { scale: 1.4, transformOrigin: "50% 50%" },
        { scale: 1, ease: "expo.out", duration: 1.2 },
        0
      );
    });
  }
  // workScrollAnimate();

  function initWorkFilter() {
    const $filters = $(".filter-item");
    const $items = $(".work-item");
    let filterTl = null;

    $items.css("display", "flex");
    gsap.set($items, { y: "0rem", opacity: 1 });

    $filters.on("click", function () {
      const $btn = $(this);
      if ($btn.hasClass("is-active")) return;

      if (filterTl && filterTl.isActive()) {
        filterTl.progress(1);
        filterTl.kill();
      }
      gsap.killTweensOf($items);

      lenis.stop();

      $filters.filter(".is-active").removeClass("is-active");
      $btn.addClass("is-active");

      const cat = $btn.attr("category");
      const $toShow =
        cat === "allwork" ? $items : $items.filter(`[category="${cat}"]`);
      const $visible = $items.filter(function () {
        return $(this).css("display") !== "none";
      });

      ScrollTrigger.getAll().forEach((t) => {
        if ($(t.trigger).is("[work-scroll-item]")) t.kill();
      });
      gsap.set($items, { clearProps: "clipPath,scale" });

      filterTl = gsap.timeline({
        onComplete: () => {
          workScrollAnimate();
          lenis.start();
          lenis.resize();
          ScrollTrigger.refresh();
        },
      });

      if ($visible.length) {
        filterTl.to(
          $visible,
          {
            opacity: 0,
            duration: 0.25,
            ease: primaryEase,
            onComplete: () => {
              $visible.css("display", "none");
              gsap.set($visible, { clearProps: "transform,opacity" });
            },
          },
          0
        );
      }

      filterTl.add(() => {
        $toShow.css("display", "flex");
        gsap.set($toShow, { y: "25rem", opacity: 0 });
      });

      filterTl.to($toShow, { opacity: 1, duration: 0.05, ease: "none" });
      filterTl.to(
        $toShow,
        {
          y: "0rem",
          duration: 0.5,
          ease: primaryEase,

          stagger: 0.05,
          immediateRender: false,
        },
        "<"
      );
    });
  }

  initWorkFilter();

  function filterListScroll() {
    ScrollTrigger.create({
      trigger: ".filter-list",
      start: "top top",
      end: "top top",
      onEnter: () => $(".filter-list").addClass("is-scrolled"),
      onLeaveBack: () => $(".filter-list").removeClass("is-scrolled"),
    });
  }

  filterListScroll();
}

// single work page functions
function projectScripts() {
  function hideCurrentProjectSlide() {
    const slug = window.location.pathname
      .replace(/\/+$/, "")
      .split("/")
      .filter(Boolean)
      .pop();
    if (!slug) return;

    const $target = $(`[project-slug="${slug}"][slide-w]`);
    if ($target.length) {
      $target.remove();
      return;
    }

    const $byCurrent = $('a[aria-current="page"]').closest("[slide-w]");
    if ($byCurrent.length) $byCurrent.remove();
  }
  hideCurrentProjectSlide();

  function projectDoubleClickRedirect() {
    $("[project-slug]").on("dblclick", function () {
      const slug = $(this).attr("project-slug");
      if (slug) window.location.href = `/work/${slug}`;
    });
  }

  projectDoubleClickRedirect();
}

//BARBA

// if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// function resetScrollTop() {
//   window.scrollTo(0, 0);
//   document.documentElement.scrollTop = 0;
//   document.body.scrollTop = 0;

//   lenis.scrollTo(0, { immediate: true });
// }
// ScrollTrigger.refresh();

// barba.hooks.before(() => {
//   lenis.stop();
// });

// barba.hooks.after(() => {
//   globalScripts();

//   try {
//     Webflow.destroy();
//     Webflow.ready();
//     Webflow.require("ix2").init();
//   } catch (e) {}

//   lenis.resize();
//   lenis.start();
//   ScrollTrigger.refresh();
// });

// barba.init({
//   preventRunning: true,
//   cacheFirstPage: true,
//   timeout: 10000,

//   views: [
//     {
//       namespace: "home",
//       afterEnter() {
//         homeScripts();
//       },
//     },
//     {
//       namespace: "work",
//       afterEnter() {
//         workScripts();
//       },
//     },
//     {
//       namespace: "project",
//       afterEnter() {
//         projectScripts();
//       },
//     },
//   ],

//   transitions: [
//     {
//       name: "fade-out-in",
//       sync: false,

//       once({ next }) {
//         resetScrollTop();
//         return gsap.fromTo(
//           next.container,
//           { opacity: 0 },
//           { opacity: 1, duration: 0.5, ease: "power1.out" }
//         );
//       },

//       leave({ current }) {
//         return new Promise((resolve) => {
//           gsap.to(current.container, {
//             opacity: 0,
//             duration: 0.35,
//             ease: "power1.out",
//             onComplete: () => {
//               resetScrollTop();
//               resolve();
//               scrollTrigger.refresh();
//             },
//           });
//         });
//       },

//       enter({ next }) {
//         gsap.set(next.container, { opacity: 0 });
//         resetScrollTop();
//         return gsap.to(next.container, {
//           opacity: 1,
//           duration: 0.5,
//           ease: "power1.out",
//         });
//       },
//     },
//   ],
// });

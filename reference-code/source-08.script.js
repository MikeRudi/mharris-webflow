// LENIS SETUP
const lenis = new Lenis({
  duration: 0.5,
  easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic
  // easing: (t) => 1 - Math.pow(1 - t, 3),
  smoothWheel: true,
  smoothTouch: false,
});

// RAF LOOP
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// SYNC WITH SCROLLTRIGGER
lenis.on("scroll", ScrollTrigger.update);

Webflow.push(function () {
  $("[instant-scroll]").on("click", function (e) {
    const id = $(this).attr("href");
    if (!id.startsWith("#")) return;

    e.preventDefault();

    const $target = $(id);
    if (!$target.length) return;

    const targetTop = $target.offset().top + window.innerHeight; // +100vh

    window.scrollTo({
      top: targetTop,
      behavior: "auto",
    });

    ScrollTrigger.refresh();
  });
});

const onDesktop = (fn) => gsap.matchMedia().add("(min-width: 992px)", fn);
const onMobile = (fn) => gsap.matchMedia().add("(max-width: 991px)", fn);

onDesktop(() => {
  aaItemsAuto();
  clipItemScrollBottom();
  starScroll();
  textScroll();
  linkArrowHover();
  cardHoverPopup();
  navScroll();
  linkUnderlineHover();
});
onMobile(() => {
  mobileMenu();
  aaItemsMobile();
  mobileFilter();
});

//MOBILE FILTER SECTION start
function mobileFilter() {
  const $btns = $("[mobile-filter-btn]");
  const $items = $("[mobile-filter-item]");

  if (!$btns.length || !$items.length) return;

  function setActive(id) {
    $btns.css("background-color", "");
    $(`[mobile-filter-btn="${id}"]`).css("background-color", "#827127");

    $items.css("display", "none");
    $(`[mobile-filter-item="${id}"]`).css("display", "block");
  }

  setActive("1");

  $btns.on("click", function () {
    const id = $(this).attr("mobile-filter-btn");
    setActive(id);
  });
}

// ACCORDIAN SLIDER start
function aaItemsAuto() {
  const $section = $("[aa-section]");
  const $items = $("[aa-item]");
  const $multiDisplay = $("[aa-multi-img]");

  // const $multiNext = $("[aa-multi-next]");
  // const $multiPrev = $("[aa-multi-prev]");
  // const $multiNum = $("[aa-multi-num]");

  if (!$section.length || !$items.length || !$multiDisplay.length) return;

  let index = 0;
  let timer = null;
  let auto = false;
  let progressTween = null;

  // let multiImgInterval = null;
  // let multiIndex = 0;

  const autoDuration = 18000;

  function getCurrentItem() {
    return $items.eq(index);
  }

  function getFirstSourceImg() {
    return getCurrentItem().find("[aa-img-src]").first();
  }

  // function getCurrentSourceImgs() {
  //   const $imgs = getCurrentItem().find("[aa-img-src]");
  //   return $imgs.sort(function (a, b) {
  //     const aNum = parseInt($(a).attr("aa-img-src"), 10) || 0;
  //     const bNum = parseInt($(b).attr("aa-img-src"), 10) || 0;
  //     return aNum - bNum;
  //   });
  // }

  // function stopMultiImageCycle() {
  //   clearInterval(multiImgInterval);
  //   multiImgInterval = null;
  // }

  function setManualState() {
    auto = false;
    clearTimeout(timer);

    if (progressTween) progressTween.kill();

    // stopMultiImageCycle();

    $items.find("[aa-progress-fill]").css("width", "0%");
    $items.eq(index).find("[aa-progress-fill]").css("width", "100%");
  }

  // function updateControls(totalImgs) {
  //   const showNav = totalImgs > 1;
  //   const showNum = totalImgs > 0;

  //   $multiNum.css("display", showNum ? "" : "none");
  //   $multiNext.css("display", showNav ? "" : "none");
  //   $multiPrev.css("display", showNav ? "" : "none");
  // }

  // function updateMultiNum(current, total) {
  //   if (!$multiNum.length) return;

  //   const nextText = `${formatNum(current)}/${formatNum(total)}`;

  //   if (typeof gsap === "undefined") {
  //     $multiNum.text(nextText);
  //     return;
  //   }

  //   gsap.killTweensOf($multiNum);

  //   gsap.to($multiNum, {
  //     opacity: 0,
  //     duration: 0.15,
  //     ease: "power1.out",
  //     onComplete: function () {
  //       $multiNum.text(nextText);
  //       gsap.to($multiNum, {
  //         opacity: 1,
  //         duration: 0.15,
  //         ease: "power1.out",
  //       });
  //     },
  //   });
  // }

  function renderSingleImage($source) {
    $multiDisplay.find("[aa-rendered-img]").remove();

    if (!$source.length) return;

    const $clone = $source.clone();
    $clone.removeAttr("aa-img-src");
    $clone.attr("aa-rendered-img", "true");

    if ($clone.is("img")) {
      $clone.css({
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover",
      });
    } else {
      $clone.css({
        width: "100%",
        height: "100%",
      });
    }

    $clone.prependTo($multiDisplay);
  }

  function showImageForCurrent() {
    const $img = getFirstSourceImg();
    renderSingleImage($img);
  }

  function startProgressBar() {
    if (typeof gsap === "undefined") return;

    if (progressTween) progressTween.kill();

    $items.find("[aa-progress-fill]").css("width", "0%");

    const $currentFill = $items.eq(index).find("[aa-progress-fill]");

    progressTween = gsap.fromTo(
      $currentFill,
      { width: "0%" },
      {
        width: "100%",
        duration: autoDuration / 1000,
        ease: "linear",
      }
    );
  }

  function restartTimer() {
    clearTimeout(timer);
    if (!auto) return;

    timer = setTimeout(nextItem, autoDuration);
    startProgressBar();

    // startMultiImageCycle();
  }

  function setActive(i) {
    index = i;

    $items.removeClass("is-open");
    $items.eq(index).addClass("is-open");

    showImageForCurrent();

    if (auto) restartTimer();
  }

  function nextItem() {
    index = (index + 1) % $items.length;
    setActive(index);
  }

  // function nextMultiImage() {
  //   setManualState();
  //   showMultiImage(multiIndex + 1);
  // }

  // function prevMultiImage() {
  //   setManualState();
  //   showMultiImage(multiIndex - 1);
  // }

  $items.each(function (i) {
    $(this).on("click", function () {
      const isCurrentItem = i === index;

      if (isCurrentItem) {
        setManualState();
        return;
      }

      setActive(i);
      setManualState();
    });
  });

  // $multiNext.on("click", function () {
  //   nextMultiImage();
  // });

  // $multiPrev.on("click", function () {
  //   prevMultiImage();
  // });

  setActive(0);
  $items.find("[aa-progress-fill]").css("width", "0%");
  $items.eq(index).find("[aa-progress-fill]").css("width", "0%");

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: $section[0],
      start: "top 50%",
      once: true,
      onEnter() {
        auto = true;
        restartTimer();
      },
    });
  }
}

function aaItemsMobile() {
  const $items = $("[aa-item]");

  if (!$items.length) return;

  function setActive(i) {
    $items.removeClass("is-open");
    $items.eq(i).addClass("is-open");
  }

  setActive(0);

  $items.each(function (i) {
    $(this).on("click", function () {
      setActive(i);
    });
  });
}

// ACCORDIAN SLIDER end

//LANGUAGE POPUP start
function languageDropdown() {
  const $btn = $("[language-btn]");
  const $dropdown = $("[language-dropdown]");
  const $arrow = $("[language-arrow]");

  gsap.set($dropdown, {
    height: "0rem",
    overflow: "hidden",
  });

  let isOpen = false;

  $btn.on("click", function () {
    isOpen = !isOpen;

    const languageDropdownTimeline = gsap.timeline();

    languageDropdownTimeline.to(
      $arrow,
      {
        rotate: isOpen ? 180 : 0,
        duration: 0.3,
        ease: "power1.out",
      },
      0
    );

    languageDropdownTimeline.to(
      $dropdown,
      {
        height: isOpen ? "16.7rem" : "0rem",
        duration: 0.3,
        ease: "power1.out",
      },
      0
    );
  });
}

languageDropdown();
//LANGUAGE POPUP end

// LANGUAGE GA TRACKING start
function trackLanguagePageView(path) {
  if (typeof gtag !== "function") return;

  gtag("event", "page_view", {
    page_title: document.title,
    page_location: `${window.location.origin}${path}`,
    page_path: path,
  });
}
// LANGUAGE GA TRACKING end

// LANGUAGE ACTIVE STATE start
function languageSwitch() {
  const $langButtons = $("[lang-btn]");
  const $langText = $("[lang-text]");

  const langUrlMap = {
    english: "en-GB",
    french: "fr-FR",
    german: "de-DE",
    italian: "it-IT",
    japanese: "ja-JP",
    korean: "ko-KR",
    polish: "pl-PL",
    portuguese: "pt-BR",
    russian: "ru-RU",
    spanish: "es-LA",
    turkish: "tr-TR",
    chineseSimplified: "zh-CN",
    chineseTraditional: "zh-Hant-TW",
    dutch: "nl-NL",
  };

  const urlLangMap = Object.fromEntries(
    Object.entries(langUrlMap).map(([lang, locale]) => [
      locale.toLowerCase(),
      lang,
    ])
  );

  function updateHtmlLang(locale) {
    document.documentElement.setAttribute("lang", locale);
  }

  function refreshLanguageScroll() {
    setTimeout(function () {
      if (window.lenis) {
        window.lenis.resize();
      }

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 100);
  }

  function updateExternalLinks(locale) {
    $("[lounge-link]").each(function () {
      const $link = $(this);
      let href = $link.attr("href");

      if (!href) return;

      href = href.replace(
        /https:\/\/www\.prioritypass\.com\/[a-z]{2}-[a-z]{2}\//i,
        `https://www.prioritypass.com/${locale}/`
      );

      href = href.replace(
        /https:\/\/www\.prioritypass\.com\/zh-hant-tw\//i,
        `https://www.prioritypass.com/${locale}/`
      );

      $link.attr("href", href);
    });
  }

  function setLanguage(selectedLang) {
    const $target = $(`[lang-text="${selectedLang}"]`);

    $langText.removeClass("active-lang");
    $target.addClass("active-lang");

    refreshLanguageScroll();
  }

  function updateLanguageUrl(path) {
    if (window.location.pathname !== path) {
      window.history.replaceState({}, "", path);
    }

    localStorage.setItem("selectedLangPath", path);

    if (typeof trackLanguagePageView === "function") {
      trackLanguagePageView(path);
    }
  }

  function getLanguageFromPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const locale = segments[0]?.toLowerCase();

    return urlLangMap[locale];
  }

  const pathLang = getLanguageFromPath();
  const savedLang = localStorage.getItem("selectedLang") || "english";

  const initialLang = pathLang || savedLang;
  const initialLocale = langUrlMap[initialLang];

  setLanguage(initialLang);
  localStorage.setItem("selectedLang", initialLang);

  if (initialLocale) {
    updateHtmlLang(initialLocale);
    updateLanguageUrl(`/${initialLocale}/excellenceawards`);
    updateExternalLinks(initialLocale);
  }

  $langButtons.on("click", function () {
    const selectedLang = $(this).attr("lang-btn");
    const locale = langUrlMap[selectedLang];

    if (!selectedLang || !locale) return;

    const newPath = `/${locale}/excellenceawards`;

    updateHtmlLang(locale);
    setLanguage(selectedLang);
    localStorage.setItem("selectedLang", selectedLang);
    updateLanguageUrl(newPath);
    updateExternalLinks(locale);
  });
}

languageSwitch();
// LANGUAGE ACTIVE STATE end

// LANGUAGE URL INIT start
function languageUrlInit() {
  const path = window.location.pathname;
  const savedLangPath = localStorage.getItem("selectedLangPath");

  if (path === "/" || path === "") {
    const target = savedLangPath || "/en-GB/excellenceawards";
    window.history.replaceState({}, "", target);
    trackLanguagePageView(target);
  }
}

languageUrlInit();
// LANGUAGE URL INIT end

//CLIP SECTION ON SCROLL start
function clipItemScrollBottom() {
  $("[clip-bottom-trigger]").each(function () {
    const $trigger = $(this);
    const $target = $trigger.is("[clip-item-bottom]")
      ? $trigger
      : $trigger.find("[clip-item-bottom]").first();

    if (!$target.length) return;

    gsap.set($target, {
      clipPath: "inset(0rem 3.5rem 3.5rem 3.5rem round 1rem)",
    });

    const clipItemScrollBottomTimelineIn = gsap.timeline({
      scrollTrigger: {
        trigger: $trigger[0],
        start: "top bottom",
        end: "top 60%",
        scrub: true,
        markers: false,
      },
    });

    clipItemScrollBottomTimelineIn.fromTo(
      $target,
      {
        clipPath: "inset(0rem 3.5rem 3.5rem 3.5rem round 1rem)",
      },
      {
        clipPath: "inset(0rem 0rem 0rem 0rem round 0rem)",
        ease: "linear",
        immediateRender: false,
      }
    );

    const clipItemScrollBottomTimelineOut = gsap.timeline({
      scrollTrigger: {
        trigger: $trigger[0],
        start: "bottom 40%",
        end: "bottom top",
        scrub: true,
        markers: false,
      },
    });

    clipItemScrollBottomTimelineOut.fromTo(
      $target,
      {
        clipPath: "inset(0rem 0rem 0rem 0rem round 0rem)",
      },
      {
        clipPath: "inset(0rem 3.5rem 0rem 3.5rem round 1rem)",
        ease: "linear",
        immediateRender: false,
      }
    );
  });
}

//CLIP SECTION ON SCROLL end

//VIDEO PLAYER start
function videoItemScroll() {
  // DESKTOP (unchanged)
  onDesktop(() => {
    gsap.set(".vid-scroll", {
      scale: 0.9,
    });

    $(".vid-scroll").each(function () {
      const videoItemScrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: this,
          start: "top bottom",
          end: "top 75%",
          scrub: true,
          markers: false,
        },
      });

      videoItemScrollTimeline.fromTo(
        this,
        {
          scale: 0.95,
        },
        {
          scale: 1.1,
          ease: "power1.out",
          immediateRender: false,
        }
      );
    });
  });

  // MOBILE (new)
  onMobile(() => {
    gsap.set(".vid-scroll", {
      scale: 0.4,
    });

    $(".vid-scroll").each(function () {
      const videoItemScrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: this,
          start: "top bottom",
          end: "top 75%",
          scrub: true,
          markers: false,
        },
      });

      videoItemScrollTimeline.fromTo(
        this,
        {
          scale: 0.6,
        },
        {
          scale: 1,
          ease: "linear",
          immediateRender: false,
        }
      );
    });
  });
}

videoItemScroll();

function updateVideoCursorState() {
  const $cursor = $(".cursor");

  // If hovering an element that disables the cursor → clear everything
  if ($("[video-cursor-remove]:hover").length) {
    $cursor.removeClass("hover-play hover-pause");
    return;
  }

  // If NOT hovering the video area → clear everything
  if (!$("[video-cursor]:hover").length) {
    $cursor.removeClass("hover-play hover-pause");
    return;
  }

  // Otherwise show correct state depending on play/pause
  $cursor.removeClass("hover-play hover-pause");

  if (isVideoPlaying) {
    $cursor.addClass("hover-pause");
  } else {
    $cursor.addClass("hover-play");
  }
}

const MAGNET = {
  distance: 200,
  move: 1.1,
  duration: 0.5,
  ease: "power1.out",
  resetDuration: 0.5,
  resetEase: "power1.out",
};

function initMagnetEffect() {
  const $magnets = $(".magnet");
  if (!$magnets.length) return;

  const magnetItems = [];

  $magnets.each(function () {
    magnetItems.push({
      element: this,
      isActive: false,
      tween: null,
    });
  });

  function animateTo(item, x, y, duration, ease) {
    if (item.tween) item.tween.kill();

    item.tween = gsap.to(item.element, {
      x,
      y,
      duration,
      ease,
      overwrite: true,
    });
  }

  $(document).on("mousemove", function (e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    magnetItems.forEach(function (item) {
      const rect = item.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = mouseX - centerX;
      const distanceY = mouseY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance <= MAGNET.distance) {
        const pullStrength = (MAGNET.distance - distance) / MAGNET.distance;
        const pullX = distanceX * pullStrength * MAGNET.move;
        const pullY = distanceY * pullStrength * MAGNET.move;

        item.isActive = true;

        animateTo(item, pullX, pullY, MAGNET.duration, MAGNET.ease);
      } else if (item.isActive) {
        item.isActive = false;

        animateTo(item, 0, 0, MAGNET.resetDuration, MAGNET.resetEase);
      }
    });
  });

  $(document).on("mouseleave", function () {
    magnetItems.forEach(function (item) {
      item.isActive = false;

      animateTo(item, 0, 0, MAGNET.resetDuration, MAGNET.resetEase);
    });
  });
}

initMagnetEffect();

let isVideoPlaying = false;
let $currentHolder = null;

$(".modal_trigger_btn_wrap").on("click", function () {
  const id = $(this).attr("video-target") || "default";
  const $holder = $(`.full_vid_holder[video-target="${id}"]`);

  if (!$holder.length) return;

  $currentHolder = $holder;

  const playBtn = $holder.find("[f-data-video='play-button']")[0];
  playBtn?.click();
  isVideoPlaying = true;
  updateVideoCursorState();

  gsap.to($holder, {
    opacity: 1,
    pointerEvents: "auto",
    duration: 0.3,
    ease: "linear",
  });

  gsap.set(".model-close-m", {
    pointerEvents: "auto",
    display: "block",
  });
});

$(".model-close-m").on("click", function (e) {
  e.preventDefault(); //dont scroll to top on close
  e.stopPropagation(); //stop video on close

  if ($currentHolder && isVideoPlaying) {
    const pauseBtn = $currentHolder.find("[f-data-video='pause-button']")[0];
    pauseBtn?.click();
  }

  isVideoPlaying = false;
  updateVideoCursorState();

  if ($currentHolder) {
    gsap.to($currentHolder, {
      opacity: 0,
      pointerEvents: "none",
      duration: 0.5,
      ease: "power2.out",
    });
  } else {
    gsap.to(".full_vid_holder", {
      opacity: 0,
      pointerEvents: "none",
      duration: 0.5,
      ease: "power2.out",
    });
  }

  gsap.set(".model-close-m", {
    pointerEvents: "none",
    display: "none",
  });

  $currentHolder = null;
});

$(".full_vid_holder").on("click", function (e) {
  if (
    $(e.target).closest(".video-volume-embed, .video-volum-embed").length ||
    $(e.target).closest(".slider").length ||
    $(e.target).closest(".video-progress-wrap").length
  ) {
    return;
  }

  const $holder = $(this);
  const playBtn = $holder.find("[f-data-video='play-button']")[0];
  const pauseBtn = $holder.find("[f-data-video='pause-button']")[0];

  if (isVideoPlaying) {
    pauseBtn?.click();
    isVideoPlaying = false;
  } else {
    playBtn?.click();
    isVideoPlaying = true;
  }

  updateVideoCursorState();

  gsap.set(".model-close-m", {
    pointerEvents: "auto",
    display: "block",
  });

  $currentHolder = $holder;
});

function visualVolumeSlider() {
  const wraps = document.querySelectorAll(
    ".video-volume-embed, .video-volum-embed"
  );

  wraps.forEach((wrap) => {
    const slider = wrap.querySelector(".slider");
    if (!slider) return;

    function setValueFromClick(e) {
      const rect = wrap.getBoundingClientRect();
      let pct = (e.clientX - rect.left) / rect.width;
      pct = Math.min(Math.max(pct, 0), 1);

      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 1;
      const step = parseFloat(slider.step) || 0.01;

      let val = min + pct * (max - min);
      val = Math.round(val / step) * step;

      slider.value = val;
      slider.dispatchEvent(new Event("input"));
    }

    wrap.addEventListener("click", setValueFromClick);

    wrap.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches && e.touches[0]) setValueFromClick(e.touches[0]);
      },
      { passive: true }
    );
  });

  document.querySelectorAll(".slider").forEach((slider) => {
    slider.addEventListener("input", () => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 1;
      const val = parseFloat(slider.value) || 0;

      const pct = ((val - min) / (max - min)) * 100;

      slider.style.backgroundImage = `linear-gradient(to right, white ${pct}%, rgba(255,255,255,.2) ${pct}%)`;
    });

    slider.dispatchEvent(new Event("input"));
  });
}

visualVolumeSlider();

//VIDEO PLAYER end

// CARD HOVER start
function cardHoverPopup() {
  $("[card-hover-popup]").each(function () {
    const $card = $(this);
    const $bg = $card.find("[card-bg]");
    const $textWrap = $card.find("[card-hover-text]");
    const $star = $card.find("[card-hover-star]");

    if (!$bg.length && !$textWrap.length && !$star.length) return;

    gsap.set($bg, { opacity: 0 });

    gsap.set($star, {
      opacity: 0.5,
      rotation: 90,
    });

    function prepText($text) {
      if (!$text.length) return;

      if (!$text.find(".card-hover-line-inner").length) {
        const split = new SplitType($text[0], {
          types: "lines",
          lineClass: "card-hover-line",
        });

        $(split.lines).wrapInner('<div class="card-hover-line-inner"></div>');
      }

      gsap.set($text.find(".card-hover-line"), {
        clipPath: "inset(100% 0% 0% 0%)",
      });

      gsap.set($text.find(".card-hover-line-inner"), {
        yPercent: 100,
      });
    }

    function prepAllText() {
      $textWrap.find("[lang-text]").each(function () {
        prepText($(this));
      });
    }

    function getActiveText() {
      const $activeText = $textWrap.find("[lang-text].active-lang").first();

      return {
        $lines: $activeText.find(".card-hover-line"),
        $lineInners: $activeText.find(".card-hover-line-inner"),
      };
    }

    prepAllText();

    $card.on("mouseenter", function () {
      const { $lines, $lineInners } = getActiveText();

      gsap.to($bg, {
        opacity: 1,
        duration: 0.2,
        ease: "power1.in",
      });

      gsap.to($lines, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.3,
        ease: "power1.out",
        stagger: 0.05,
      });

      gsap.to($lineInners, {
        yPercent: 0,
        duration: 0.3,
        ease: "power1.out",
        stagger: 0.05,
      });

      gsap.to($star, {
        opacity: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power1.out",
      });
    });

    $card.on("mouseleave", function () {
      const { $lines, $lineInners } = getActiveText();

      gsap.to($lines, {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 0.75,
        ease: "power1.in",
        stagger: 0.05,
      });

      gsap.to($lineInners, {
        yPercent: 100,
        duration: 0.1,
        ease: "power1.in",
        stagger: 0.05,
      });

      gsap.to($star, {
        opacity: 0.5,
        rotation: 90,
        duration: 0.3,
        ease: "power1.in",
      });

      gsap.to($bg, {
        opacity: 0,
        duration: 0.2,
        ease: "power1.out",
        delay: 0.15,
      });
    });
  });
}

// CARD HOVER end

//GRADIENT BG start
function gradientOpacity() {
  const $el = $(".gradient-1");
  if (!$el.length) return;

  gsap.fromTo(
    $el,
    { opacity: 0 },
    {
      opacity: 0.5,
      ease: "power1.out",
      duration: 0.3,
      scrollTrigger: {
        trigger: $el,
        start: "top top",
        end: "top top",
        toggleActions: "play none none reverse",
        markers: false,
      },
    }
  );
}

gradientOpacity();
//GRADIENT BG end

//NAV SCROLL startfunction navScroll() {
function navScroll() {
  const navScrollTimeline = gsap.timeline({
    paused: true,
  });

  navScrollTimeline
    .fromTo(
      "[nav-scroll-wrap]",
      {
        width: "100%",
        color: "#ffffff",
      },
      {
        width: "75%",
        color: "#363534",
        duration: 0.3,
        ease: "power1.out",
      }
    )
    .fromTo(
      "[nav-scroll-bg]",
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out",
      },
      0
    );

  ScrollTrigger.create({
    trigger: "[nav-scroll-trigger]",
    start: "bottom top",
    end: "bottom top",
    onEnter: () => navScrollTimeline.play(),
    onLeaveBack: () => navScrollTimeline.reverse(),
    markers: false,
  });
}

//NAV SCROLL end

//LINK HOVERS start
function linkUnderlineHover() {
  $("[link-underline-hover]").each(function () {
    const $wrap = $(this);
    const $line = $wrap.find("[link-underline]").first();
    if (!$line.length) return;

    gsap.set($line, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    $wrap.on("mouseenter", function () {
      gsap.killTweensOf($line);

      gsap.set($line, {
        transformOrigin: "left center",
      });

      gsap.to($line, {
        scaleX: 1,
        duration: 0.15,
        ease: "power1.out",
      });
    });

    $wrap.on("mouseleave", function () {
      gsap.killTweensOf($line);

      gsap.set($line, {
        transformOrigin: "right center",
      });

      gsap.to($line, {
        scaleX: 0,
        duration: 0.15,
        ease: "power1.out",
      });
    });
  });
}

function linkArrowHover() {
  $("[link-arrow-hover]").each(function () {
    const $wrap = $(this);
    const $line = $wrap.find("[link-underline]").first();
    const $arrow = $wrap.find("[link-arrow]").first();
    if (!$line.length || !$arrow.length) return;

    gsap.set($line, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set($arrow, {
      x: "0rem",
    });

    $wrap.on("mouseenter", function () {
      gsap.killTweensOf([$line, $arrow]);

      gsap.set($line, {
        transformOrigin: "left center",
      });

      gsap.to($line, {
        scaleX: 1,
        duration: 0.15,
        ease: "power1.out",
      });

      gsap.to($arrow, {
        x: "0.1rem",
        duration: 0.15,
        ease: "power1.out",
      });
    });

    $wrap.on("mouseleave", function () {
      gsap.killTweensOf([$line, $arrow]);

      gsap.set($line, {
        transformOrigin: "right center",
      });

      gsap.to($line, {
        scaleX: 0,
        duration: 0.15,
        ease: "power1.out",
      });

      gsap.to($arrow, {
        x: "0rem",
        duration: 0.15,
        ease: "power1.out",
      });
    });
  });
}

//LINK HOVERS end

//TEXT SCROLL startfunction textScroll() {
function textScroll() {
  $(".text-scroll").each(function () {
    const $el = $(this);

    gsap.set($el, {
      scale: 0.9,
    });

    gsap.to($el, {
      scale: 1,
      duration: 0.3,
      ease: "power1.out",
      scrollTrigger: {
        trigger: $el[0],
        start: "top 95%",
        toggleActions: "play none none none",
        markers: false,
      },
    });
  });
}

//TEXT SCROLL end

// STAR SCROLL start
function starScroll() {
  $("[scroll-star-trigger]").each(function () {
    const $trigger = $(this);
    const id = $trigger.attr("scroll-star-trigger");

    const $star = $(`[scroll-star="${id}"]`);
    const $vert = $(`[scroll-star-verticle="${id}"]`);
    const $horiz = $(`[scroll-star-horizontal="${id}"]`);

    if (!$star.length || !$vert.length || !$horiz.length) return;

    const starScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: $trigger[0],
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    // star runs full scrub
    starScrollTimeline.fromTo(
      $star,
      { scale: 0 },
      {
        scale: 1,
        ease: "none",
        duration: 1,
      },
      0
    );

    // lines run from 33% → 100%
    starScrollTimeline.fromTo(
      $vert,
      { height: "0%" },
      {
        height: "100%",
        ease: "none",
        duration: 0.67,
      },
      0.33
    );

    starScrollTimeline.fromTo(
      $horiz,
      { width: "0%" },
      {
        width: "100%",
        ease: "none",
        duration: 0.67,
      },
      0.33
    );
  });
}

// STAR SCROLL end

function mobileMenu() {
  const btn = document.querySelector("[mobile-menu-btn]");
  const hamburger = document.querySelector(".mobile-hamburger");
  const logo = document.querySelector(".nav-logo-full");
  const bg = document.querySelector("[mobile-menu-bg]");
  const dropdown = document.querySelector("[mobile-menu-dropdown]");

  let isOpen = false;

  // INITIAL STATE
  gsap.set(bg, { opacity: 0 });
  gsap.set(dropdown, { display: "none" });

  btn.addEventListener("click", function () {
    isOpen = !isOpen;

    if (isOpen) {
      // OPEN
      hamburger.classList.add("is-closed");

      if (logo) logo.classList.remove("text-white");

      gsap.set(bg, { opacity: 1 });
      gsap.set(dropdown, { display: "flex" });
    } else {
      // CLOSE
      hamburger.classList.remove("is-closed");

      if (logo) logo.classList.add("text-white");

      gsap.set(bg, { opacity: 0 });
      gsap.set(dropdown, { display: "none" });
    }
  });
}

// function setHtmlLangFromUrl() {
//   const pathLocale = window.location.pathname.split("/").filter(Boolean)[0];

//   const validLocales = [
//     "en-GB",
//     "fr-FR",
//     "de-DE",
//     "it-IT",
//     "ja-JP",
//     "ko-KR",
//     "pl-PL",
//     "pt-BR",
//     "ru-RU",
//     "es-LA",
//     "tr-TR",
//     "zh-CN",
//     "zh-Hant-TW",
//     "nl-NL",
//   ];

//   const lang = validLocales.includes(pathLocale) ? pathLocale : "en-GB";

//   document.documentElement.setAttribute("lang", lang);
// }

// // FORCE it to run after everything
// window.addEventListener("load", function () {
//   setHtmlLangFromUrl();
// });

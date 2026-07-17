const mm = gsap.matchMedia();
// ~~~~~~~~~~~~~~~~~~~~Privacy Policy~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".privacy-lander")) {
  mm.add("(min-width: 992px)", () => {});

  mm.add("(max-width: 991px)", () => {});

  // ~~~~~ home hero scroll functions
  function privacyLanderScroll() {
    const heroScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "[hero-scrolltrigger]",
        start: "top bottom",
        end: "top top",
        scrub: true,
      },
    });

    heroScrollTimeline.fromTo("[hero-scroll]", { opacity: 1 }, { opacity: 0 });

    heroScrollTimeline.fromTo(
      "[hero-mobile-scroll]",
      { opacity: 1 },
      { opacity: 0 },
      "<"
    );

    heroScrollTimeline.fromTo(
      ".hero_grid_item-bottom",
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", stagger: 0.1 },
      0
    );
  }
  privacyLanderScroll();
}

// ~~~~~~~~~~~~~~~~~~~~GENERAL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

mm.add("(min-width: 992px)", () => {
  // ~~~~~ nav home hover show logo
  $("[nav-home-hover], .nav-home-logo").hover(
    function () {
      $(".nav-home-logo").css("display", "block");
    },
    function () {
      $(".nav-home-logo").css("display", "none");
    }
  );
});

mm.add("(max-width: 991px)", () => {});

// ~~~~~ lenis
let lenis;
if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.7,
    gestureOrientation: "vertical",
    normalizeWheel: false,
    smoothTouch: false,
    // touchMultiplier: 0,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll("[data-lenis-prevent]").forEach((el) => {
    el.addEventListener("wheel", (e) => e.stopPropagation());
    el.addEventListener("touchmove", (e) => e.stopPropagation());
  });

  // // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
  // lenis.on("scroll", ScrollTrigger.update);

  // // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
  // // This ensures Lenis's smooth scroll animation updates on each GSAP tick
  // gsap.ticker.add((time) => {
  //   lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  // });

  // // Disable lag smoothing in GSAP to prevent any delay in scroll animations
  // gsap.ticker.lagSmoothing(0);
}

// ~~~~~ menu functionality
function menu() {
  document.addEventListener("DOMContentLoaded", () => {
    // open menu animation
    const menuTimelineOpen = gsap.timeline({ paused: true });
    gsap.set(".menu_wrap", {
      opacity: 0,
      pointerEvents: "none",
    });

    menuTimelineOpen.set(".menu_contain", {
      opacity: 1,
    });

    menuTimelineOpen.to(".menu_wrap", {
      opacity: 1,
      pointerEvents: "auto",
      duration: 0.4,
      ease: "power4.out",
    });

    menuTimelineOpen.fromTo(
      "[menu-unmask]",
      {
        yPercent: 120,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        yPercent: 0,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.5,
        ease: "power4.out",
      },
      "<"
    );
    menuTimelineOpen.fromTo(
      "[menu-unmask-stagger]",
      {
        yPercent: 120,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        yPercent: 0,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.1,
      },
      "<"
    );
    menuTimelineOpen.fromTo(
      "[menu-unmask]",
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.75,
        ease: "power2.out",
      },
      "<"
    );

    // close menu animation
    const menuTimelineClose = gsap.timeline({ paused: true });

    menuTimelineClose.to(".menu_contain", {
      opacity: 0,
      duration: 0.75,
      ease: "power4.out",
    });
    menuTimelineClose.to(
      ".menu_wrap",
      {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.75,
        ease: "power4.out",
      },
      "<50%"
    );

    // open menu on click
    document.querySelectorAll(".menu-link").forEach((link) => {
      link.addEventListener("click", () => {
        lenis.stop();
        menuTimelineOpen.restart();
      });
    });

    //close menu on click
    document.querySelectorAll(".menu-close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        lenis.start();
        menuTimelineClose.restart();
      });
    });
  });

  // menu interactions
  function setupMenuInteractions() {
    const menuItems = $("[menu-item]");
    const menuImages = $("[menu-img]");
    const menuImgContainer = $(".menu-list-img");
    const menuListTop = $(".menu-list-top");
    let hoverTimeout;

    function resetImages() {
      menuImages.css("z-index", 1);
      $("[menu-img='land']").css("z-index", 10);

      const windowWidth = $(window).width();
      const containerWidth = menuImgContainer.outerWidth(true);
      const shift =
        windowWidth - containerWidth - menuImgContainer.offset().left;

      gsap.killTweensOf(menuImgContainer);

      gsap.to(menuImgContainer, {
        x: `+=${shift}`,
        duration: 0,
        ease: "linear",
      });
    }

    function moveImageContainer(target) {
      if (target && target.length) {
        const targetOffsetLeft = target.offset().left;
        const containerOffsetLeft = menuImgContainer.offset().left;
        const containerShift = targetOffsetLeft - containerOffsetLeft;

        gsap.killTweensOf(menuImgContainer);

        gsap.to(menuImgContainer, {
          x: `+=${containerShift}`,
          duration: 0,
          ease: "linear",
        });
      }
    }

    resetImages();

    menuItems.on("mouseenter", function () {
      clearTimeout(hoverTimeout);
      const targetMenu = $(this).attr("menu-item");
      menuImages.css("z-index", 1);
      $(`[menu-img='${targetMenu}']`).css("z-index", 10);
      moveImageContainer($(this));
    });

    menuItems.on("mouseleave", function () {
      // hoverTimeout = setTimeout(() => {
      resetImages();
      // }, 200);
    });

    $(document).ready(function () {
      const $menuImgs = $(".menu-img");

      $menuImgs.first().addClass("big");

      $menuImgs.hover(
        function () {
          $menuImgs.removeClass("big");
          $(this).addClass("big");
        },
        function () {}
      );
    });
  }

  function setupOpacityInteractions() {
    const menuItems = $(".menu-list-item");

    menuItems.on("mouseenter", function () {
      menuItems.css("opacity", 0.2);
      $(this).css("opacity", 1.0);
    });

    menuItems.on("mouseleave", function () {
      menuItems.css("opacity", 1.0);
    });
  }
  setupMenuInteractions();
}

menu();

// ~~~~~ filter system
function projectFilter() {
  $(function () {
    let currentTopItem = $(".p-filter-all");
    let userHasInteracted = false;
    const $filterWrapper = $(".p-filter-wrapper");
    const SCROLL_TRIGGER = 300;

    // --- HASH HELPERS ---
    function textToHash(text) {
      return text.toLowerCase().replace(/\s+/g, "");
    }

    function hashToFilterText(hash) {
      return hash.replace("#", "").toLowerCase();
    }

    function getFilterItemByHash(hash) {
      const target = hashToFilterText(hash);
      if (!target || target === "all") return $(".p-filter-all");

      return $("[filter-btn-item]").filter(function () {
        const text = $(this).find("[filter-btn-text]").text().trim();
        return textToHash(text) === target;
      });
    }

    // Initialize - page loads expanded
    $filterWrapper.addClass("is-expanded");
    updateFilterDisplay(true);

    // --- APPLY FILTER FROM HASH ON LOAD ---
    const initialHash = window.location.hash;
    if (initialHash) {
      const $matchedItem = getFilterItemByHash(initialHash);
      if ($matchedItem.length) {
        // Small delay to let the rest of the page initialise
        setTimeout(() => {
          $matchedItem.trigger("click");
        }, 100);
      }
    }

    // --- SCROLL LISTENER ---
    $(window).on("scroll", function () {
      const scrollTop = $(window).scrollTop();
      const isExpanded = $filterWrapper.hasClass("is-expanded");

      if (scrollTop > SCROLL_TRIGGER) {
        if (isExpanded && !userHasInteracted) {
          $filterWrapper.removeClass("is-expanded");
          updateFilterDisplay(false);
        }
      } else {
        if (!isExpanded && !userHasInteracted) {
          $filterWrapper.addClass("is-expanded");
          updateFilterDisplay(true);
        }
      }

      if (
        (scrollTop > SCROLL_TRIGGER && !isExpanded) ||
        (scrollTop <= SCROLL_TRIGGER && isExpanded)
      ) {
        userHasInteracted = false;
      }
    });

    // --- TOGGLE CLICK ---
    $(".p-filter-click").on("click", function () {
      const isExpanded = $filterWrapper.hasClass("is-expanded");
      userHasInteracted = true;

      if (isExpanded) {
        $filterWrapper.removeClass("is-expanded");
        updateFilterDisplay(false);
      } else {
        $filterWrapper.addClass("is-expanded");
        updateFilterDisplay(true);
      }
    });

    function updateFilterDisplay(expanded) {
      if (expanded) {
        $(".p-filter-item, .p-filter-all").css({
          display: "block",
          visibility: "visible",
        });
        $(".p-filter-item, .p-filter-all")
          .not(currentTopItem)
          .css("opacity", "0.3");
        currentTopItem.css({ opacity: "1", visibility: "visible" });
      } else {
        $(".p-filter-item, .p-filter-all").not(currentTopItem).css({
          display: "none",
          opacity: "1",
          visibility: "hidden",
        });
        currentTopItem.css({ opacity: "1", visibility: "visible" });
      }
    }

    // --- FILTER SELECTION ---
    $("[filter-btn-item], [filter-btn-all]").on("click", function () {
      const clickedItem = $(this);
      const filterText = clickedItem.find("[filter-btn-text]").text().trim();

      currentTopItem = clickedItem;

      $(".p-filter-list").prepend(clickedItem);

      clickedItem.css({
        opacity: "1",
        visibility: "visible",
        position: "relative",
      });
      $(".p-filter-item, .p-filter-all").not(clickedItem).css({
        display: "none",
        opacity: "0",
        visibility: "hidden",
      });

      $filterWrapper.removeClass("is-expanded");
      userHasInteracted = true;

      // --- UPDATE HEADER TEXT ---
      $("[text-after-filter]").text(filterText);

      // --- UPDATE URL HASH ---
      const isAll = filterText.toLowerCase() === "all";
      if (isAll) {
        history.replaceState(null, "", window.location.pathname);
      } else {
        history.replaceState(null, "", "#" + textToHash(filterText));
      }

      applyMFilter(filterText);
    });

    function applyMFilter(filterText) {
      const isAllFilter = filterText.toLowerCase() === "all";
      const items = $("[mfilter-item]");

      const filteredItems = isAllFilter
        ? items
        : items.filter(function () {
            const itemText = $(this).find("[mfilter-item-text]").text().trim();
            return itemText === filterText;
          });

      gsap
        .timeline({
          onComplete: () => {
            setTimeout(() => {
              ScrollTrigger.getAll().forEach((trigger) => trigger.refresh());
            }, 100);

            if (window.matchMedia("(pointer: coarse)").matches) {
              mobileListScroll();
            }
            lenis.stop();
            ScrollTrigger.refresh();
            lenis.start();
            lenis.resize();
          },
        })
        .to(items, {
          opacity: 0,
          duration: 0.2,
          display: "none",
          visibility: "hidden",
        })
        .add(() => {
          filteredItems.css({
            display: "none",
            opacity: 0,
            visibility: "hidden",
          });
          const visibleItems = filteredItems;
          visibleItems.css({
            display: "block",
            opacity: 0,
            visibility: "visible",
          });
          showItems(visibleItems);
        });
    }

    function showItems(itemsToReveal) {
      gsap.to(itemsToReveal, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
      });
    }
  });

  $(document).ready(function () {
    $("[filter-btn-text]").on("click", function () {
      let newText = $(this).text().trim();
      $("[text-after-filter]").text(newText);
    });

    $("[mfilter-btn-text]").on("click", function () {
      let newText = $(this).text().trim();
      $("[text-after-filter]").text(newText);
    });
  });
}

// ~~~~~ page transition
document.addEventListener("DOMContentLoaded", () => {
  const ease = "linear";

  function revealTransition() {
    return new Promise((resolve) => {
      resolve();
    });
  }

  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        link.hasAttribute("pag-next") ||
        link.getAttribute("target") === "_blank"
      ) {
        return;
      }

      event.preventDefault();
      const href = link.getAttribute("href");

      if (href && !href.startsWith("#") && href !== window.location.pathname) {
        animateTransition().then(() => {
          window.location.href = href;
        });
      }
    });
  });

  function animateTransition() {
    return new Promise((resolve) => {
      const currentPage = document.querySelector(".page_wrap");
      gsap.to(currentPage, {
        opacity: 0,
        duration: 0.5,
        ease: ease,
        onComplete: resolve,
      });
    });
  }
});

window.addEventListener("load", runPageLoadAnimation);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    runPageLoadAnimation();
  }
});

function runPageLoadAnimation() {
  const ease = "power4.inOut";
  const newPage = document.querySelector(".page_wrap");
  const navWrap = document.querySelector(".nav_wrap");

  const pload = gsap.timeline({});

  pload.set(newPage, { opacity: 0 });
  pload.set(navWrap, { opacity: 1 });
  // pload.fromTo(
  //   navWrap,
  //   { opacity: 0 },
  //   {
  //     opacity: 1,
  //     duration: 0.01,
  //   }
  // );

  pload.fromTo(
    newPage,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      ease: ease,
    }
  );

  if (document.querySelector("[navmask]")) {
    pload.fromTo(
      "[navmask]",
      {
        yPercent: 120,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        yPercent: 0,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.5,
        ease: ease,
        clearProps: "all",
      },
      "<"
    );
    pload.fromTo(
      "[navmask]",
      { opacity: 0 },
      { opacity: 1, duration: 0.75, ease: "power2.out" },
      "<"
    );
  }

  if (document.querySelector("[unmask]")) {
    pload.fromTo(
      "[unmask]",
      {
        yPercent: 120,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        yPercent: 0,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.5,
        ease: ease,
      },
      "<+=0.25"
    );
    pload.fromTo(
      "[unmask]",
      { opacity: 0 },
      { opacity: 1, duration: 0.75, ease: "power2.out" },
      "<"
    );
  }

  if (document.querySelector("[unmask-50]")) {
    pload.fromTo(
      "[unmask-50]",
      {
        yPercent: 120,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      },
      {
        yPercent: 0,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.5,
        ease: ease,
      },
      "<"
    );
    pload.fromTo(
      "[unmask-50]",
      { opacity: 0 },
      { opacity: 0.3, duration: 0.75, ease: "power2.out" },
      "<"
    );
  }

  if (document.querySelector("[opacity]")) {
    pload.fromTo(
      "[opacity]",
      { opacity: 0 },
      { opacity: 0.3, duration: 0.75, ease: "power2.out" },
      "<+=0.35"
    );
  }

  if (document.querySelector("[opacity-full]")) {
    pload.fromTo(
      "[opacity-full]",
      { opacity: 0 },
      { opacity: 1, duration: 0.75, ease: "power2.out" },
      "<+=0.75"
    );
  }
}

// ~~~~~ light dark theme
function handleTheme() {
  $(".nav_link-light").on("click", function () {
    $("body").attr("data-theme", "light");
    $(".nav_link-light").addClass("is-active");
    $(".nav_link-dark").removeClass("is-active");
  });

  $(".nav_link-dark").on("click", function () {
    $("body").attr("data-theme", "dark");
    $(".nav_link-dark").addClass("is-active");
    $(".nav_link-light").removeClass("is-active");
  });
}
handleTheme();

// ~~~~~ form field
function handleFormField() {
  $("[form_field_wrap]").each(function () {
    const $wrap = $(this);
    const $formField = $wrap.find("[form_field]");
    const $formClose = $wrap.find(".form_close");

    $formField.on("input", function () {
      if ($formField.val().trim() !== "") {
        $formClose.css("display", "block");
      } else {
        $formClose.css("display", "none");
      }
    });

    $formClose.on("click", function () {
      $formField.val("");
      $formClose.css("display", "none");
    });
  });
}
handleFormField();

// ~~~~~ text follow cursor
function textCursorFollow() {
  document.addEventListener("DOMContentLoaded", () => {
    let cursorItem = document.querySelector(".cursor");
    let cursorParagraph = cursorItem.querySelector("p");
    let targets = document.querySelectorAll("[data-cursor]");
    let xOffset = 6;
    let yOffset = -50;
    let currentTarget = null;
    let lastText = "";

    gsap.set(cursorItem, { autoAlpha: 0 });

    let xTo = gsap.quickTo(cursorItem, "x", {
      ease: "circ.out",
      duration: 0.1,
    });
    let yTo = gsap.quickTo(cursorItem, "y", {
      ease: "circ.out",
      duration: 0.1,
    });

    window.addEventListener("mousemove", (e) => {
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let scrollY = window.scrollY;
      let cursorX = e.clientX;
      let cursorY = e.clientY + scrollY;

      // Default offsets
      let xPercent = xOffset;
      let yPercent = yOffset;

      gsap.set(cursorItem, {
        xPercent: xPercent,
        yPercent: yPercent,
      });
      xTo(cursorX);
      yTo(cursorY - scrollY);
    });

    targets.forEach((target) => {
      target.addEventListener("mousemove", () => {
        currentTarget = target;
        let newText = target.getAttribute("data-cursor");

        if (newText !== lastText) {
          cursorParagraph.innerHTML = newText;
          lastText = newText;
        }

        gsap.to(cursorItem, { autoAlpha: 1, duration: 0.2 });
      });

      target.addEventListener("mouseleave", () => {
        currentTarget = null;

        gsap.to(cursorItem, { autoAlpha: 0, duration: 0.2 });
      });
    });
  });
}

// ~~~~~ awards interactions
function initializeAwardsImageMovement() {
  const awardsList = $(".awards_list");
  const awardsItems = $(".awards_item, .cms_link");
  const placeholderImg = $("[awards-img]");

  placeholderImg.attr("src", "").hide();

  if (window.matchMedia("(min-width: 992px)").matches) {
    const yTo = gsap.quickTo(placeholderImg.parent(), "y", {
      duration: 0.6,
      ease: "power3",
    });

    const preloadImage = (src) => {
      const img = new Image();
      img.src = src;
    };

    let isImageVisible = false;

    awardsList.on("mousemove", function (e) {
      const yPosition = e.clientY - this.getBoundingClientRect().top;
      yTo(yPosition);
    });

    awardsItems.on("mouseenter", function () {
      const item = $(this);
      const itemWrap = item.closest(".awards_item_wrap");
      const awardsDate = itemWrap.find(".awards_date");
      const awardsTitle = item.find(".awards_title");

      const itemImg = item.find(".feature_img_placeholder");
      if (itemImg.length) {
        const newSrc = itemImg.attr("src");
        preloadImage(newSrc);

        if (!isImageVisible) {
          placeholderImg.css({
            display: "block",
            opacity: 1,
            visibility: "visible",
          });
          isImageVisible = true;
        }

        placeholderImg.attr("src", newSrc);
      }

      // awardsDate.css({ opacity: 1 });
      // item.css({ opacity: 1 });

      // awardsTitle.css({ height: "2.5rem" });
    });

    awardsItems.on("mouseleave", function () {
      placeholderImg.css({ display: "none", opacity: 0, visibility: "hidden" });
      isImageVisible = false;

      const item = $(this);
      const itemWrap = item.closest(".awards_item_wrap");
      const awardsDate = itemWrap.find(".awards_date");
      const awardsTitle = item.find(".awards_title");

      // awardsDate.css({ opacity: "" });
      // item.css({ opacity: "" });

      // awardsTitle.css({ height: "1.25rem" });
    });

    awardsList.on("mouseleave", function () {
      placeholderImg.css({ display: "none", opacity: 0, visibility: "hidden" });
      isImageVisible = false;
    });
  }
  let seenDates = new Set();

  // $(".awards_item_wrap").each(function () {
  //   let $dateText = $(this).find(".awards_title_text");
  //   let date = $dateText.text().trim();

  //   if (seenDates.has(date)) {
  //     $dateText.css("opacity", "0");
  //   } else {
  //     seenDates.add(date);
  //     $dateText.css("opacity", "1");
  //   }
  // });
}
function awardsMobile() {
  $(document).ready(function () {
    let seenDates = new Set();

    $(".awards_item_wrap").each(function () {
      let $dateElement = $(this).find(".awards_date");
      let date = $dateElement.text().trim();

      if (seenDates.has(date)) {
        $dateElement.css("display", "none");
      } else {
        seenDates.add(date);
        $dateElement.css("display", "inline");
      }
    });

    // Toggle active class on tap
    $(".awards_item").on("click touchend", function (e) {
      e.preventDefault(); // Prevent accidental double-taps

      let $this = $(this);

      // If already active, remove the class (close it)
      if ($this.hasClass("is-active")) {
        $this.removeClass("is-active");
      } else {
        // Close any other open items
        $(".awards_item.is-active").removeClass("is-active");
        // Open the clicked one
        $this.addClass("is-active");
      }
    });
  });
}

function initializeAwardsLoadMore() {
  const awardsItems = $("[awards-load-item]");
  const loadMoreButton = $("[awards-load-btn]");
  const awardsContainer = $(".awards_list"); // Parent container
  let itemsToShow = 10;

  // Hide all items initially
  awardsItems.css({ display: "none", opacity: 0 });

  function showInitialItems() {
    const initialItems = awardsItems.slice(0, itemsToShow);
    initialItems.css({ display: "flex", opacity: 0 });

    gsap.to(initialItems, {
      opacity: 0.3,
      duration: 0.3,
      clearProps: "opacity",
      stagger: 0.1,
      onComplete: updateContainerHeight, // Update height after items are shown
    });

    updateLoadMoreButton();
  }

  function updateLoadMoreButton() {
    const hiddenItems = awardsItems.filter(":hidden");
    if (hiddenItems.length > 0) {
      loadMoreButton.show();
    } else {
      loadMoreButton.hide();
    }
  }

  function updateContainerHeight() {
    const totalHeight = awardsItems
      .filter(":visible")
      .toArray()
      .reduce((acc, item) => {
        return acc + $(item).outerHeight(true);
      }, 0);

    gsap.to(awardsContainer, {
      height: totalHeight,
      duration: 0,
      ease: "linear",
    });
  }

  loadMoreButton.on("click", function () {
    const hiddenItems = awardsItems.filter(":hidden");
    const nextItems = hiddenItems.slice(0, itemsToShow);

    if (nextItems.length > 0) {
      nextItems.css({ display: "flex", opacity: 0 });

      gsap.to(nextItems, {
        opacity: 0.3,
        duration: 0,
        clearProps: "opacity",
        onComplete: () => {
          updateContainerHeight();

          // Refresh ScrollTrigger and Lenis after DOM changes
          ScrollTrigger.refresh();
          lenis.resize();
          // lenis.scrollTo(lenis.scroll); // Keep current position
        },
      });
    }

    updateLoadMoreButton();
  });

  showInitialItems();
}

// ~~~~~ load more btn
// function mLoadMore(filterHandler) {
//   const loadMoreButton = $("[load-more]");
//   let itemsToShow = 3; // Number of items to reveal per click

//   function showItems(startIndex, endIndex, filteredItems) {
//     const itemsToReveal = filteredItems.slice(startIndex, endIndex);

//     gsap.to(itemsToReveal, {
//       display: "block",
//       opacity: 1,
//       duration: 0.3,
//       stagger: 0.1,
//       onComplete: () => {
//         lenis.stop();
//         ScrollTrigger.refresh();
//         lenis.start();
//         lenis.resize();
//       },
//     });
//   }

//   loadMoreButton.on("click", function () {
//     const currentFilter = filterHandler.getCurrentFilter();
//     const filteredItems = filterHandler.getFilteredItems(currentFilter);
//     const visibleCount = filteredItems.filter(
//       (index, item) => $(item).css("opacity") === "1"
//     ).length;
//     showItems(visibleCount, visibleCount + itemsToShow, filteredItems);
//   });
// }
// mLoadMore(filterHandler);

// ~~~~~~~~~~~~~~~~~~~~HOME~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (document.querySelector(".we_text")) {
  mm.add("(min-width: 992px)", () => {
    textCursorFollow();
    initializeAwardsImageMovement();
    initializeAwardsLoadMore();
    enableNavLinkOnScroll();
    // ~~~~~ home story paralax
    function heroStoryScroll() {
      const $storyContent = $(".story_content");
      const parentHeight = $storyContent.parent().height();
      const contentHeight = $storyContent.height();
      const adjustedHeight = parentHeight - contentHeight;

      const heroWeScrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".story_grid_img",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          // markers: true,
        },
      });

      heroWeScrollTimeline.fromTo(
        ".story_content",
        { y: "0px" },
        { y: adjustedHeight, ease: "linear" },
        0
      );
    }
    heroStoryScroll();
  });

  mm.add("(max-width: 991px)", () => {
    awardsMobile();
    initializeAwardsLoadMore();
  });

  // pageLoad();

  // function endLoaderAnimation() {
  //   $(".loader, .loader-tim").hide();
  //   $(".loader, .loader-tim-wrap").css({ display: "none" });
  // }
  // endLoaderAnimation();

  // function pageLoad() {
  //   let customEase =
  //     "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";
  //   let customEaseTwo = CustomEase.create("custom", "M0,0 C0.7,0 0.3,1 1,1");
  //   let counter = { value: 0 };

  //   let isReload =
  //     performance.navigation.type === 1 ||
  //     performance.getEntriesByType("navigation")[0].type === "reload";

  //   if (!isReload && sessionStorage.getItem("visited") !== null) {
  //     $(".loader, .loader-tim").hide();
  //     return;
  //   }

  //   $(".loader, .loader-tim").show();
  //   sessionStorage.setItem("visited", "true");

  //   function updateLoaderText() {
  //     let progress = Math.round(counter.value);
  //     $(".loader_number").text(progress);
  //   }

  //   endLoaderAnimation();

  //   $(window).on("resize", function () {
  //     if (!$(".loader").is(":hidden")) {
  //       $(".loader, .loader-tim").hide();
  //     }
  //   });

  //   let tl = gsap.timeline({ onComplete: endLoaderAnimation });

  //   tl.to(".loader-tim-wrap", {
  //     opacity: 1,
  //     duration: 1,
  //     ease: "linear",
  //   });

  //   tl.to(counter, {
  //     value: 100,
  //     onUpdate: updateLoaderText,
  //     duration: 2.2,
  //     ease: CustomEase.create("custom", customEase),
  //   });

  //   let images = $("[preloader-img]").slice(0, 15);

  //   tl.to(
  //     images,
  //     {
  //       opacity: 0,
  //       duration: 0.05,
  //       stagger: 0.16,
  //       ease: "linear",
  //     },
  //     "<+=0.1"
  //   );

  //   tl.to(
  //     ".loader-tim",
  //     {
  //       clipPath: "inset(0% 0% 100% 0%)",
  //       duration: 1.6,
  //       // ease: "expo.out",
  //       ease: customEaseTwo,
  //     },
  //     "+=0.2"
  //   );

  //   tl.to(
  //     "[preloader-land]",
  //     {
  //       yPercent: -20,
  //       duration: 2,
  //       // ease: "expo.out",
  //       ease: customEaseTwo,
  //     },
  //     "<"
  //   );
  // }

  pageLoad();

  function pageLoad() {
    let customEase =
      "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";
    let customEaseTwo = CustomEase.create("custom", "M0,0 C0.7,0 0.3,1 1,1");
    let counter = { value: 0 };

    let isReload =
      performance.navigation.type === 1 ||
      performance.getEntriesByType("navigation")[0].type === "reload";

    if (!isReload && sessionStorage.getItem("visited") !== null) {
      $(".loader, .loader-tim").hide();
      return;
    }

    $(".loader, .loader-tim").show();
    sessionStorage.setItem("visited", "true");

    function updateLoaderText() {
      let progress = Math.round(counter.value);
      $(".loader_number").text(progress);
    }

    function endLoaderAnimation() {
      $(".loader, .loader-tim").hide();
      $(".loader, .loader-tim-wrap").css({ display: "none" });
    }

    $(window).on("resize", function () {
      if (!$(".loader").is(":hidden")) {
        $(".loader, .loader-tim").hide();
      }
    });

    counter.value = 0;
    updateLoaderText();

    let tl = gsap.timeline({ onComplete: endLoaderAnimation });

    let images = $("[preloader-img]");
    let lander = $("[preloader-land]");
    let moveWrap = $(".preloader-move");

    // Force first image to show immediately, no white flash
    images.css({
      opacity: 0,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    });

    images.eq(0).css("opacity", 1); // show first image instantly
    moveWrap[0].style.setProperty("z-index", "1000", "important");
    console.log("z-index:", window.getComputedStyle(moveWrap[0]).zIndex);

    // Layer all images and lander
    images.each(function (i) {
      $(this).css("z-index", i + 1);
    });
    lander.css({
      zIndex: images.length + 2,
      opacity: 0,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    });

    // Start preloader wrapper fade in
    tl.to(".loader-tim-wrap", {
      opacity: 1,
      duration: 1,
      ease: "linear",
    });

    // Animate counter
    tl.to(counter, {
      value: 100,
      onUpdate: updateLoaderText,
      duration: 2.2,
      ease: CustomEase.create("custom", customEase),
    });

    // Flash images 2ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ15 (0 already shown)
    tl.to(
      images.slice(1),
      {
        opacity: 1,
        duration: 0.1,
        stagger: 2.2 / images.length,
        ease: "none",
      },
      "<"
    );

    // Final lander image
    tl.to(
      lander,
      {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out",
      },
      "-=0.1"
    );

    // Exit animation
    tl.to(
      ".loader-tim",
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.6,
        ease: customEaseTwo,
      },
      "+=0.2"
    );

    tl.to(
      "[preloader-land]",
      {
        yPercent: -20,
        duration: 2,
        ease: customEaseTwo,
      },
      "<"
    );
  }

  // ~~~~~ home hero scroll functions
  function heroLanderScroll() {
    const heroScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "[hero-scrolltrigger]",
        start: "clamp(top bottom)",
        end: "top top",
        scrub: true,
      },
    });

    heroScrollTimeline.fromTo(
      "[hero-scroll]",
      { opacity: 0.5 },
      { opacity: 0, ease: "none" }
    );

    heroScrollTimeline.fromTo(
      "[hero-mobile-scroll]",
      { opacity: 1 },
      { opacity: 0 },
      "<"
    );

    heroScrollTimeline.fromTo(
      ".hero_grid_item-bottom",
      { clipPath: "polygon(-5% 100%, 105% 100%, 105% 100%, -5% 100%)" },
      {
        clipPath: "polygon(-5% 0%, 105% 0%, 105% 100%, -5% 100%)",
        stagger: 0.1,
      },
      0
    );
  }
  heroLanderScroll();

  $(document).ready(function () {
    if ($(".hero_section-desktop").length) {
      const bodyHeight = $("body").outerHeight();
      $(".nav_wrap").css("height", bodyHeight + "px");
    }
  });

  // ~~~~~ home we paralax
  function heroWeScroll() {
    const weRightHeight = document.querySelector(".we_right").offsetHeight;
    const weTextHeight = document.querySelector(".we_text").offsetHeight;
    const movementHeight = weRightHeight - weTextHeight;

    const heroWeScrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".we_layout-top",
        start: "center bottom",
        end: "center top",
        scrub: true,
        // markers: true,
      },
    });

    heroWeScrollTimeline.fromTo(
      ".we_scroll",
      { yPercent: 0 },
      { y: movementHeight, ease: "linear" },
      0
    );
  }
  heroWeScroll();
}

function enableNavLinkOnScroll() {
  gsap.utils.toArray("[nav-home-hover]").forEach((navLink) => {
    ScrollTrigger.create({
      trigger: navLink,
      start: `clamp(top+=${window.innerHeight / 1.74}px top)`,
      // end: "top top",
      // markers: true,
      onEnter: () => navLink.classList.remove("disable-pointer"),
      onLeaveBack: () => navLink.classList.add("disable-pointer"),
    });
  });
}

// Initialize the function

// ~~~~~~~~~~~~~~~~~~~~JOURNAL-CMS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (document.querySelector(".journal_lander")) {
  mm.add("(min-width: 992px)", () => {});

  mm.add("(max-width: 991px)", () => {});

  journalCmsPage();

  // Simulate a window resize event after page load
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
    refreshOnJournalRichEnter();
    ScrollTrigger.refresh();
  }, 400); // Adjust the timeout if needed
}

function refreshOnJournalRichEnter() {
  $(".journal-rich").each(function () {
    let journalRich = $(this);

    ScrollTrigger.create({
      trigger: journalRich,
      start: "50% top",
      end: "bottom bottom",
      scrub: true,

      onEnter: () => {
        waitForImagesToLoad(journalRich, () => {
          ScrollTrigger.refresh();
          if (typeof lenis !== "undefined") lenis.resize();
          window.dispatchEvent(new Event("resize"));
        });
      },
    });
  });
}

// Function to wait for images inside .journal-rich to load
function waitForImagesToLoad(container, callback) {
  let images = container.find("img");
  let totalImages = images.length;
  let loadedImages = 0;

  if (totalImages === 0) {
    callback();
    return;
  }

  images.each(function () {
    if (this.complete) {
      loadedImages++;
    } else {
      $(this).on("load", function () {
        loadedImages++;
        if (loadedImages === totalImages) {
          callback();
        }
      });
    }
  });

  // Fallback in case some images donÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢t fire the load event
  setTimeout(() => {
    callback();
  }, 1000);
}

// **Call the function after page load**
if (document.querySelector(".journal_lander")) {
  mm.add("(min-width: 992px)", () => {});
  mm.add("(max-width: 991px)", () => {});

  journalCmsPage();

  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
    refreshOnJournalRichEnter();
    ScrollTrigger.refresh();
  }, 400);
}

// Call the function

function journalCmsPage() {
  // ~~~~~ journal cms page next item
  function displayNextJournal() {
    const invisItem = document.querySelector(".invis-cms .invis-cms-item");
    if (!invisItem) return;

    const currentSlug = invisItem.getAttribute("journal-slug");
    if (!currentSlug) return;

    let foundCurrent = false;

    const journalItems = document.querySelectorAll(
      ".journal-next-wrap .journal-next"
    );

    journalItems.forEach((item) => {
      const itemSlug = item.getAttribute("journal-slug");

      if (foundCurrent) {
        item.style.display = "block";
        foundCurrent = false; // Show only the immediate next journal
      } else {
        item.style.display = "none";
      }

      if (itemSlug === currentSlug) {
        foundCurrent = true; // Mark when the current journal is found
      }
    });
  }

  displayNextJournal();
}

// ~~~~~~~~~~~~~~~~~~~~JOURNAL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".article_section")) {
  mm.add("(min-width: 992px)", () => {
    journalFilterSystem();
  });

  mm.add("(max-width: 991px)", () => {
    journalFilterSystem();
  });
}

function journalFilterSystem() {
  const items = $("[mfilter-item]");
  const loadMoreItems = $("[load-more-item]");
  const filterButtons = $("[mfilter-btn]");
  const filterContainer = $("[mfilter-container]");
  const loadMoreButton = $("[load-more]");
  let itemsToShow = 6;
  let currentFilter = "all";
  let currentTopItem = $(".p-filter-all");
  let isExpanded = false;

  function applyFilter(filterText) {
    currentFilter = filterText;
    const isAllFilter = filterText === "all";
    const filteredItems = isAllFilter
      ? loadMoreItems
      : loadMoreItems.filter(function () {
          const itemText = $(this).find("[mfilter-item-text]").text().trim();
          return itemText === filterText;
        });

    // Hide all items first
    loadMoreItems.css({ display: "none", opacity: 0 });

    // Show only the first `itemsToShow`
    const visibleItems = filteredItems.slice(0, itemsToShow);
    visibleItems.css({ display: "block", opacity: 0 });

    // Animate them in
    gsap.to(visibleItems, {
      opacity: 1,
      duration: 0.3,
      stagger: 0.1,
    });

    updateFilterButtons(filterText);
    updateFilterText(filterText);
    updateLoadMoreButton(filteredItems);
  }

  function updateFilterButtons(selectedFilter) {
    const selectedButton = filterButtons.filter(function () {
      const btnText = $(this).is("[mfilter-btn-all]")
        ? "all"
        : $(this).find("[mfilter-btn-text]").text().trim();
      return btnText === selectedFilter;
    });

    filterButtons.css({
      opacity: 0,
      visibility: "hidden",
      position: "relative",
    });

    selectedButton.css({
      opacity: 1,
      visibility: "visible",
      position: "relative",
    });

    filterContainer.prepend(selectedButton);
  }

  function updateFilterText(selectedText) {
    const newText =
      selectedText.toLowerCase() === "all" ? "all articles" : selectedText;
    $("[text-after-filter]").text(newText);
  }

  function rotateArrow() {
    const arrow = $(".p-arrow");
    const currentRotation = arrow.data("rotation") || 0;
    const newRotation = currentRotation === 0 ? 180 : 0;

    arrow.css("transform", `rotateX(${newRotation}deg)`);
    arrow.data("rotation", newRotation);
  }

  $(".p-filter-click").on("click", function () {
    if (isExpanded) {
      $(".p-filter-item, .p-filter-all").not(currentTopItem).css({
        display: "none",
        opacity: "1",
        visibility: "hidden",
      });
      currentTopItem.css({ opacity: "1", visibility: "visible" });
      isExpanded = false;
    } else {
      $(".p-filter-item, .p-filter-all").css({
        display: "block",
        visibility: "visible",
      });
      $(".p-filter-item, .p-filter-all")
        .not(currentTopItem)
        .css("opacity", "1");
      currentTopItem.css({ opacity: "1", visibility: "visible" });
      isExpanded = true;
    }

    rotateArrow();
  });

  filterButtons.on("click", function () {
    const clickedItem = $(this);
    const filterText = $(this).is("[mfilter-btn-all]")
      ? "all"
      : $(this).find("[mfilter-btn-text]").text().trim();

    currentFilter = filterText;
    currentTopItem = clickedItem;

    $(".p-filter-list").prepend(clickedItem);

    clickedItem.css({
      opacity: "1",
      visibility: "visible",
      position: "relative",
    });

    $(".p-filter-item, .p-filter-all").not(clickedItem).css({
      display: "none",
      opacity: "0",
      visibility: "hidden",
    });

    isExpanded = false;
    rotateArrow();

    applyFilter(filterText);
  });

  function updateLoadMoreButton(filteredItems) {
    const hiddenItems = filteredItems.filter(":hidden"); // Count hidden items
    if (hiddenItems.length > 0) {
      loadMoreButton.show();
    } else {
      loadMoreButton.hide();
    }
  }

  function initializeItems() {
    loadMoreItems.css({ display: "none", opacity: 0 });
    const initialItems = loadMoreItems.slice(0, itemsToShow);
    initialItems.css({ display: "block", opacity: 0 });

    gsap.to(initialItems, {
      opacity: 1,
      duration: 0.3,
      stagger: 0.1,
    });

    updateLoadMoreButton(loadMoreItems);
    applyFilter("all");
  }

  // ~~~~~ Fixed Load More Functionality ~~~~~
  loadMoreButton.on("click", function () {
    const filteredItems =
      currentFilter === "all"
        ? loadMoreItems
        : loadMoreItems.filter(function () {
            return (
              $(this).find("[mfilter-item-text]").text().trim() ===
              currentFilter
            );
          });

    const currentlyVisible = filteredItems.filter(":visible").length; // Count visible items
    const nextItems = filteredItems.slice(
      currentlyVisible,
      currentlyVisible + itemsToShow
    );

    if (nextItems.length > 0) {
      nextItems.css({ display: "block", opacity: 0 });

      gsap.to(nextItems, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        onComplete: () => {
          // setTimeout(() => {
          lenis.resize(); // Ensure Lenis recalculates after content is added
          // }, 10);
        },
      });
    }

    updateLoadMoreButton(filteredItems);
  });

  initializeItems();
}

// ~~~~~~~~~~~~~~~~~~~~PROJECT-CMS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".project-info-wrap")) {
  mm.add("(min-width: 992px)", () => {
    projectCms();
    textCursorFollow();
  });

  mm.add("(max-width: 991px)", () => {
    function mobileProjectInfo() {
      $(".scroll_horizontal_wrap").css("display", "block");
      $(".project-info-left").css("display", "none");

      $(".project-info").on("click", function () {
        let isInfoVisible = $(".project-info-left").css("display") === "block";

        if (isInfoVisible) {
          $(".scroll_horizontal_wrap").css("display", "block");
          $(".project-info-left").css("display", "none");
        } else {
          $(".scroll_horizontal_wrap").css("display", "none");
          $(".project-info-left").css("display", "block");
        }
      });
    }

    // Call the function
    mobileProjectInfo();

    $(document).ready(function () {
      $(".project-info").on("click", function () {
        $(".horizontal-section").toggleClass("hidden");
        lenis.scrollTo(0);
        $(".project-info-container").scrollTop(0);
      });

      mobileNextProject();
    });
  });
}

function mobileNextProject() {
  const currentProjectSlug = document.body.getAttribute("data-project-slug");
  const projectItems = document.querySelectorAll(".next-project .project-item");

  if (!currentProjectSlug || projectItems.length === 0) return;

  let foundCurrent = false;

  projectItems.forEach((item) => {
    const projectSlug = item.getAttribute("data-project-slug");

    if (foundCurrent) {
      item.removeAttribute("style"); // Show next project
      foundCurrent = false; // Only show the immediate next project
    } else {
      item.style.display = "none";
    }

    if (projectSlug === currentProjectSlug) {
      foundCurrent = true; // Mark current project, so the next one is displayed
    }
  });
}

// Call the function separately

// ~~~~~ project cms page
function projectCms() {
  function setupSlideAnimations() {
    const slideItems = document.querySelectorAll(".p-slide-item");
    const largeViewItems = document.querySelectorAll(".large-view-item");
    const horizontalSection = document.querySelector(".scroll_horizontal_wrap");
    const largeViewWrap = document.querySelector(".large-view-wrap");
    const projectWrap = document.querySelector(".project-info-wrap");
    const navWrap = document.querySelector(".nav_wrap");

    if (
      !slideItems.length ||
      !largeViewItems.length ||
      !horizontalSection ||
      !largeViewWrap
    )
      return;

    gsap.set(horizontalSection, { opacity: 1, display: "block" });
    gsap.set(largeViewWrap, { opacity: 0, display: "none" });

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        const contentHeight = largeViewWrap.offsetHeight;
        document.body.style.height = `${contentHeight}px`;
        lenis.resize();
      },
      onReverseComplete: () => {
        document.body.style.height = "";
        lenis.resize();
      },
    });
    timeline
      .set(projectWrap, { display: "none" })
      .fromTo(
        horizontalSection,
        { opacity: 1 },
        { opacity: 0, duration: 0.2, ease: "linear" }
      )

      .fromTo(
        navWrap,
        { opacity: 1 },
        { opacity: 0, duration: 0.2, ease: "linear" },
        "<"
      )

      .set(horizontalSection, { display: "none" })
      .set(navWrap, { display: "none" })

      .set(largeViewWrap, { display: "block" })

      .call(() => {
        lenis.scrollTo(0, { duration: 0.01, ease: "linear" });
      })
      .fromTo(
        largeViewWrap,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "linear" },
        ">0.2"
      );

    slideItems.forEach((item) => {
      item.addEventListener("click", () => {
        timeline.play();
      });
    });

    largeViewItems.forEach((item) => {
      item.addEventListener("click", () => {
        timeline.reverse();
      });
    });
  }
  setupSlideAnimations();

  function projectInfoBtn() {
    const projectInfoButton = document.querySelector(".project-info");
    const stickySection = document.querySelector(".scroll_horizontal_contain");
    const horizontalSection = document.querySelector(".scroll_horizontal_wrap");
    const projectInfoWrap = document.querySelector(".project-info-wrap");

    if (!projectInfoButton || !stickySection || !projectInfoWrap) return;

    stickySection.addEventListener("wheel", (event) => {
      event.preventDefault();
    });

    const timeline = gsap.timeline({ paused: true, reversed: true });

    timeline
      .to(stickySection, {
        y: "85vh",
        duration: 0.5,
        ease: "power3.inOut",
      })
      .fromTo(
        projectInfoWrap,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.4,
        },
        "<50%"
      );

    projectInfoButton.addEventListener("click", () => {
      if (timeline.reversed()) {
        timeline.play();
        horizontalSection.style.pointerEvents = "none";
        document.body.style.overflow = "hidden";
        window.dispatchEvent(new Event("resize")); // Simulate a resize
      } else {
        timeline.reverse();
        horizontalSection.style.pointerEvents = "auto";
        document.body.style.overflow = "";
        window.dispatchEvent(new Event("resize")); // Simulate a resize
      }
    });
  }
  projectInfoBtn();

  function callNextProject() {
    const currentProjectSlug = document.body.getAttribute("data-project-slug");
    const projectItems = document.querySelectorAll(
      ".next-project .project-item"
    );

    if (!currentProjectSlug || projectItems.length === 0) return;

    let foundCurrent = false;
    let firstProject = projectItems[0]; // Store the first project item

    projectItems.forEach((item, index) => {
      const projectSlug = item.getAttribute("data-project-slug");

      if (foundCurrent) {
        item.removeAttribute("style");
        foundCurrent = false;
      } else {
        item.style.display = "none";
      }

      if (projectSlug === currentProjectSlug) {
        foundCurrent = true;

        // If this is the last item, show the first project as the next one
        if (index === projectItems.length - 1) {
          firstProject.removeAttribute("style");
        }
      }
    });
  }

  callNextProject();

  $(".scroll_horizontal_wrap").each(function (index) {
    let wrap = $(this);
    let inner = $(this).find(".scroll_horizontal_inner");
    let track = $(this).find(".scroll_horizontal_track");

    function setScrollDistance() {
      window.dispatchEvent(new Event("resize"));

      // Wait for all images within the track to load
      const images = track.find("img");
      const imagePromises = [];

      images.each(function () {
        const img = $(this);
        if (img[0].complete) {
          return;
        }

        const promise = new Promise((resolve) => {
          img.on("load", resolve);
          img.on("error", resolve); // Handle failed image loads too
        });
        imagePromises.push(promise);
      });

      Promise.all(imagePromises).then(() => {
        // Now all images are loaded, set the height
        setTimeout(() => {
          wrap.css("height", "calc(" + track.outerWidth() + "px + 100vh)");
          ScrollTrigger.refresh();
          lenis.resize();
        }, 250);
      });
    }

    setScrollDistance();

    $(window).on("resize", function () {
      wrap.css("height", "calc(" + track.outerWidth() + "px + 100vh)");
      ScrollTrigger.refresh();
      lenis.resize();
    });

    ScrollTrigger.refresh();
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "clamp(top top)",
        end: "bottom bottom",
        scrub: true,
      },
      defaults: { ease: "none" },
    });
    tl.to(track, { xPercent: -100 });
  });

  //REMOVE PROJECT INFO BTN
  ScrollTrigger.create({
    start: "bottom 120%",
    onEnter: () => {
      gsap.to(".project-info", {
        opacity: 0,
        pointerEvents: "none",
        duration: 0,
      });
    },
    onLeaveBack: () => {
      gsap.to(".project-info", {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0,
      });
    },
  });
}

// ~~~~~~~~~~~~~~~~~~~~PROJECT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".project_section")) {
  mm.add("(min-width: 992px)", () => {
    projectFilter();
    initializeProjectGrid();
    textCursorFollow();
  });

  mm.add("(max-width: 991px)", () => {
    projectFilter();
    // initializeMobileFilter();
    initializeProjectGrid();
  });
}

// ~~~~~ project page grid list

function initializeMobileFilter() {
  const scrollWrap = $(".scroll_wrap");
  const items = scrollWrap.find("[filter-item]");

  function updateProjectNumbers() {
    $(".project_list").each(function () {
      let counter = 1;

      $(this)
        .find(".project_list_item:visible")
        .each(function () {
          const formattedNumber = counter < 10 ? `0${counter}` : counter;
          $(this).find(".project-num").text(formattedNumber);
          counter++;
        });
    });
  }
  const filterButtons = $("[filter-btn-item], [filter-btn-all]");
  const filterContainer = $(".p-filter-list");
  let currentTopItem = $("[filter-btn-all]"); // Default to "All"
  let isExpanded = false;

  function updateFilterButtons(selectedFilter) {
    const selectedButton = filterButtons.filter(function () {
      const btnText = $(this).is("[filter-btn-all]")
        ? "all"
        : $(this).find("[filter-btn-text]").text().trim();
      return btnText === selectedFilter;
    });

    filterButtons.css({
      opacity: 0,
      visibility: "hidden",
      display: "none",
    });

    selectedButton.css({
      opacity: 1,
      visibility: "visible",
      display: "block",
    });

    filterContainer.prepend(selectedButton);
  }

  $(".p-filter-click").on("click", function () {
    if (isExpanded) {
      $(".p-filter-item, .p-filter-all").not(currentTopItem).css({
        display: "none",
        opacity: "0",
        visibility: "hidden",
      });

      currentTopItem.css({
        display: "block",
        opacity: "1",
        visibility: "visible",
      });

      isExpanded = false;
    } else {
      $(".p-filter-item, .p-filter-all").css({
        display: "block",
        opacity: "1",
        visibility: "visible",
      });

      $(".p-filter-item, .p-filter-all")
        .not(currentTopItem)
        .css("opacity", "1");
      currentTopItem.css({ opacity: "1", visibility: "visible" });

      isExpanded = true;
    }
  });

  $("[filter-btn-all]").on("click", function () {
    currentTopItem = $(this);
    updateFilterButtons("all");

    $(".p-filter-list").prepend($(this));

    $(".p-filter-item, .p-filter-all").css({
      display: "none",
      opacity: "0",
      visibility: "hidden",
    });

    $(this).css({
      opacity: "1",
      visibility: "visible",
      display: "block",
    });

    $("[filter-item]").css({
      display: "block",
      opacity: "1",
      visibility: "visible",
    });

    isExpanded = false;

    setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 50);
  });

  $("[filter-btn-item]").on("click", function () {
    const filterText = $(this).find("[filter-btn-text]").text().trim();
    currentTopItem = $(this);

    updateFilterButtons(filterText);

    $("[filter-item]").hide().css({
      opacity: "0",
      visibility: "hidden",
    });

    const isGridViewActive = $(".grid-view").is(":visible");
    const isListViewActive = $(".list-view").is(":visible");

    const $matchingGridItems = isGridViewActive
      ? $(".grid-view [filter-item]").filter(function () {
          return $(this).find("[filter-text]").text().trim() === filterText;
        })
      : $();

    const $matchingListItems = isListViewActive
      ? $(".list-view [filter-item]").filter(function () {
          return $(this).find("[filter-text]").text().trim() === filterText;
        })
      : $();

    if (isListViewActive) {
      setTimeout(() => {
        $(".list-view").css("display", "block");
        $(".grid-view").css("display", "none");

        // Ensure list-view items that are display: flex become fully visible
        $(".list-view [filter-item]")
          .filter(function () {
            return $(this).css("display") === "flex";
          })
          .css({
            opacity: "1 !important",
            visibility: "visible !important",
          });

        lenis.resize();
        ScrollTrigger.refresh();
      }, 50);
    } else {
      $(".grid-view").css("display", "block");
      $(".list-view").css("display", "none");
    }

    $matchingGridItems.add($matchingListItems).each(function () {
      $(this).removeAttr("style").css({
        display: "flex !important",
        opacity: "1 !important",
        visibility: "visible !important",
      });
    });

    $(".grid-view [filter-item], .list-view [filter-item]")
      .not($matchingGridItems.add($matchingListItems))
      .each(function () {
        $(this).css({
          display: "none",
          visibility: "hidden",
          opacity: "0",
        });
      });

    isExpanded = false;

    setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 50);
  });

  $(".project_btn_link, .project_btn_link-left").on("click", function () {
    if ($(this).hasClass("project_btn_link")) {
      $(".page_main").removeClass("grid-view").addClass("list-view");
      const currentFilteredItems = $(".scroll_wrap [filter-item]:visible");
      currentFilteredItems.show();

      lenis.resize();
      lenis.scrollTo(0, { immediate: true });
    } else if ($(this).hasClass("project_btn_link-left")) {
      lenis.scrollTo(0, { immediate: true });
      $(".page_main").removeClass("list-view").addClass("grid-view");
      const currentFilteredItems = $(".scroll_wrap [filter-item]:visible");
      currentFilteredItems.show();
      lenis.resize();
      ScrollTrigger.refresh();
    }
  });
}

$(".project_list_item").on("mouseenter mouseleave", function () {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    lenis.resize();
  });
});

function initializeProjectGrid() {
  function updateFilterText(selectedText) {
    $("[text-after-filter]").text(selectedText);
  }

  $("[filter-btn]").on("click", function () {
    const selectedText = $(this).text().trim();
    updateFilterText(selectedText);
  });

  // Ensure "All" updates the text as well
  $("[filter-btn-all]").on("click", function () {
    updateFilterText($(this).text().trim());
  });

  $(".scroll_wrap").each(function () {
    const scrollWrap = $(this);
    const items = scrollWrap.find("[filter-item]");
    const filterButtons = $("[filter-btn-item], [filter-btn-all]");
    const filterContainer = $(".p-filter-list"); // Adjust if needed
    let currentTopItem = $("[filter-btn-all]"); // Default to "All"
    let isExpanded = false; // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ Fix: Define isExpanded before using it
    const tl = gsap.timeline({ paused: true });

    function updateTimeline() {
      if (window.innerWidth >= 992) {
        tl.clear();
        const visibleItems = items.filter(":visible");

        tl.fromTo(
          visibleItems.eq(0),
          { height: "20vh" },
          {
            height: "auto",
            duration: 0.25,
            ease: "linear",
          }
        );

        tl.fromTo(
          visibleItems.not(":first"),
          { height: (i) => (i === 0 ? "5vh" : "0px") },
          {
            height: "auto",
            stagger: 0.19,
            ease: "customEase",
          },
          "<"
        );

        tl.pause();
      }
    }

    function updateScrollWrapHeight() {
      if (window.innerWidth >= 992) {
        const visibleItems = items.filter(":visible");
        const numItems = visibleItems.length;

        const firstProjectImg = visibleItems.find(".project_img")[0];
        const projectImgHeight = firstProjectImg
          ? firstProjectImg.offsetHeight
          : 750;

        const totalHeight = 100 + numItems * projectImgHeight;
        scrollWrap.css("height", `${totalHeight}px`);
      }
    }

    $(".project_btn_link, .project_btn_link-left").on("click", function () {
      if ($(this).hasClass("project_btn_link")) {
        $(".page_main").removeClass("grid-view").addClass("list-view");

        lenis.resize();
        if (window.matchMedia("(pointer: coarse)").matches) {
          mobileListScroll();
        }
        lenis.scrollTo(0, {
          immediate: true,
        });
      } else if ($(this).hasClass("project_btn_link-left")) {
        lenis.scrollTo(0, { immediate: true });
        $(".page_main").removeClass("list-view").addClass("grid-view");

        updateTimeline();
        updateProjectNumbers();
        lenis.resize();

        $(".scroll_wrap").each(function () {
          const scrollWrap = $(this);
          const items = scrollWrap.find("[filter-item]");
          const visibleItems = items.filter(":visible");

          scrollWrap.css("height", "auto"); // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ Let natural flow take over for mobile
          if (window.innerWidth >= 992) {
            const firstProjectImg = visibleItems.find(".project_img")[0];
            const projectImgHeight = firstProjectImg
              ? firstProjectImg.offsetHeight
              : 750;
            const totalHeight = 100 + visibleItems.length * projectImgHeight;
            scrollWrap.css("height", `${totalHeight}px`);
          }

          ScrollTrigger.refresh();
        });
      }
    });

    CustomEase.create("customEase", "M0,0 C0.55,0.055 0.524,0.23 1,1 ");

    function updateProjectNumbers() {
      $(".project_list").each(function () {
        let counter = 1;

        $(this)
          .find(".project_list_item:visible")
          .each(function () {
            const formattedNumber = counter < 10 ? `0${counter}` : counter;
            $(this).find(".project-num").text(formattedNumber);
            counter++;
          });
      });
    }

    function updateFilterButtons(selectedFilter) {
      const selectedButton = filterButtons.filter(function () {
        const btnText = $(this).is("[filter-btn-all]")
          ? "all"
          : $(this).find("[filter-btn-text]").text().trim();
        return btnText === selectedFilter;
      });

      // Hide all buttons except the selected one
      filterButtons.css({
        opacity: 0,
        visibility: "hidden",
        display: "none",
      });

      // Make the selected button visible & move it to the top
      selectedButton.css({
        opacity: 1,
        visibility: "visible",
        display: "block",
      });

      filterContainer.prepend(selectedButton);
    }

    function rotateArrow(expanded) {
      const arrow = $(".p-arrow");
      const rotation = expanded ? 180 : 0;

      arrow.css("transform", `rotateX(${rotation}deg)`);
      arrow.data("rotation", rotation);
    }

    $(".p-filter-click").on("click", function () {
      if (isExpanded) {
        // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¹ Ensure "All" remains visible if it's the current top filter
        $(".p-filter-item").not(currentTopItem).css({
          display: "none",
          opacity: "0",
          visibility: "hidden",
        });

        if (currentTopItem.is("[filter-btn-all]")) {
          currentTopItem.css({
            display: "block",
            opacity: "1",
            visibility: "visible",
          });
          rotateArrow(isExpanded);
        }

        isExpanded = false;
      } else {
        // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¹ Show all filters when opening the filter list
        $(".p-filter-item, .p-filter-all").css({
          display: "block",
          opacity: "1",
          visibility: "visible",
        });

        $(".p-filter-item, .p-filter-all")
          .not(currentTopItem)
          .css("opacity", "1");
        currentTopItem.css({ opacity: "1", visibility: "visible" });

        isExpanded = true;
      }
    });

    updateTimeline();
    updateScrollWrapHeight();

    gsap.timeline({
      scrollTrigger: {
        trigger: ".page_main",
        start: "clamp(top top)",
        end: "clamp(bottom bottom)",
        scrub: true,
        onUpdate: (self) => {
          tl.progress(self.progress);
        },
      },
    });

    // ScrollTrigger.addEventListener("refresh", () => {
    //   updateTimeline();
    //   updateScrollWrapHeight();
    //   updateProjectNumbers();
    // });

    $("[filter-btn-all]").on("click", function () {
      const clickedItem = $(this);
      currentTopItem = clickedItem;

      // Move "All" to the top of the list
      $(".p-filter-list").prepend(clickedItem);

      // Ensure "All" is the only visible filter button
      $(".p-filter-item, .p-filter-all").css({
        display: "none",
        opacity: "0",
        visibility: "hidden",
      });

      clickedItem.css({
        opacity: "1",
        visibility: "visible",
        display: "block",
      });

      isExpanded = false;
      rotateArrow();

      // Create GSAP timeline for animations
      const filterTimeline = gsap.timeline();

      // Fade out all items before filtering
      filterTimeline.fromTo(
        "[filter-fade-all]",
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0,
        }
      );

      filterTimeline.fromTo(
        "[filter-item]",
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.1,
          display: "none",
        },
        ">"
      );

      // Filter logic inside GSAP timeline
      filterTimeline.add(() => {
        $("[filter-item]").css({
          display: "flex",
          opacity: "0",
          visibility: "visible",
        });

        updateProjectNumbers();
        updateTimeline();
        updateScrollWrapHeight();
        lenis.resize();
        ScrollTrigger.refresh();
      });

      // Fade items back in
      filterTimeline.fromTo(
        "[filter-item]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
        }
      );

      // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¹ Ensure scroll-to-top happens **after** filtering, with a delay
      filterTimeline.add(() => {
        lenis.scrollTo(0, {
          immediate: true,
        });
      }, "+=0.15");

      // Fade back in `[filter-fade-all]`
      filterTimeline.fromTo(
        "[filter-fade-all]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
        },
        "+=0.1"
      );
    });

    $("[filter-btn-item]").on("click", function () {
      const filterText = $(this).find("[filter-btn-text]").text().trim();
      currentTopItem = $(this);

      updateFilterButtons(filterText);

      const filterTimeline = gsap.timeline();

      filterTimeline.fromTo(
        "[filter-fade-all]",
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0,
        }
      );

      filterTimeline.fromTo(
        "[filter-item]",
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.1,
          display: "none",
        },
        ">"
      );
      filterTimeline.add(() => {
        $("[filter-item]").each(function () {
          let matchFound = false;

          $(this)
            .find("[filter-text]")
            .each(function () {
              if (
                $(this).text().trim() === filterText ||
                filterText === "all"
              ) {
                matchFound = true;
              }
            });

          if (matchFound) {
            $(this).css("display", "flex");
          } else {
            $(this).css("display", "none");
          }
        });

        // ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¹ Hide "All" when clicking any other filter button
        $("[filter-btn-all]").css({
          display: "none",
          opacity: "0",
          visibility: "hidden",
        });

        updateProjectNumbers();
        updateTimeline();
        updateScrollWrapHeight();
        lenis.resize();
        ScrollTrigger.refresh();
      });
      filterTimeline.fromTo(
        "[filter-item]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
        }
      );

      filterTimeline.add(() => {
        lenis.scrollTo(0, {
          immediate: true,
        });
      }, "+=0.15");

      filterTimeline.fromTo(
        "[filter-fade-all]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
        },
        "+=0.1"
      );
    });
  });
}

function autoNumberVisibleCollection(
  wrapperSelector = "[autonum-wrap]",
  itemSelector = "[autonum-item]",
  textSelector = "[autonum-text]"
) {
  $(wrapperSelector).each(function () {
    const visibleItems = $(this)
      .find(itemSelector)
      .filter(function () {
        return $(this).css("display") === "flex";
      });

    visibleItems.each(function (index) {
      const number = (index + 1).toString().padStart(2, "0"); // Convert to "01", "02", etc.
      $(this).find(textSelector).text(number); // Update the text inside [autonum-text]
    });
  });
}

function syncProjectItems() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const projectItem = $(mutation.target);
        const identifier = projectItem.attr("project-item");

        if (identifier) {
          const listItem = $(
            `.project_list_item[project-item="${identifier}"]`
          );

          if (projectItem.css("display") === "none") {
            listItem.css("display", "none");
          } else if (projectItem.css("display") === "flex") {
            listItem.css("display", "flex");
          }

          // Re-number visible items after changes
          autoNumberVisibleCollection();
        }
      }
    });
  });

  $(".project_item").each(function () {
    observer.observe(this, { attributes: true, attributeFilter: ["style"] });
  });
}
syncProjectItems();
autoNumberVisibleCollection();

// ~~~~~ add 0 infront of a number
function addLeadingZero(selector = "[zero-num]") {
  $(selector).each(function () {
    const currentText = $(this).text().trim();
    const number = parseInt(currentText, 10);

    if (!isNaN(number) && number < 10) {
      $(this).text(`0${number}`);
    }
  });
}

addLeadingZero();

// ~~~~~ scroll to top
$(".scroll-top-wrap").on("click", function () {
  lenis.scrollTo(0, { duration: 1 });
});

// ~~~~~~~~~~~~~~~~~~~~STUDIO~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".wedo_section")) {
  mm.add("(min-width: 992px)", () => {
    initializeAwardsImageMovement();
    initializeAwardsLoadMore();
    studioPage();
    // Call the function only if a cursor is detected
    if (window.matchMedia("(pointer: fine)").matches) {
      studioScrollProject();
    }
    whyworkParalax();
    whatWeDo();
    // animateTeamGalleryGrid();
    // initializeTeamGalleryOverlay();
  });

  mm.add("(max-width: 991px)", () => {
    studioPage();
    awardsMobile();
    initializeAwardsLoadMore();
    // mobileSwiper();

    // mobileListScroll();

    mobileListScroll();

    $(".wedo_grid_item").on("click", function () {
      let $this = $(this);

      if ($this.hasClass("is-active")) {
        $this.removeClass("is-active");
      } else {
        $(".wedo_grid_item.is-active").removeClass("is-active");
        $this.addClass("is-active");
      }
    });
  });

  function enableMobileClickFilter() {
    $(".swiper-slide").on("click", function () {
      $(".gallery_img").css("filter", ""); // remove from all
      $(this).find(".gallery_img").css("filter", "none"); // apply to clicked one
    });
  }

  enableMobileClickFilter();
}

// function initializeTeamGalleryOverlay() {
//   $(".team_gallery_item").on("click", function () {
//     lenis.stop();
//     const overlay = $(this).find(".member-overlay");
//     overlay.css({ opacity: 1, "pointer-events": "auto" });
//   });

//   $(".member-close").on("click", function (e) {
//     e.stopPropagation(); // Prevent click from bubbling to the parent
//     const overlay = $(this).closest(".member-overlay");
//     overlay.css({ opacity: 0, "pointer-events": "none" });
//     lenis.start();
//   });
// }

// Call the function to activate the interactions

function studioPage() {
  //   // ~~~~~ team member popup (studio)
  //   function teamMemberPopup() {
  //     document.addEventListener("DOMContentLoaded", () => {
  //       let teamMembers = document.querySelectorAll("[team-member]");

  //       function lockBodyScroll(lock) {
  //         document.body.style.overflow = lock ? "hidden" : "";
  //       }

  //       teamMembers.forEach((item) => {
  //         let memberOverlay = item.querySelector(".member-overlay");
  //         let memberContent = item.querySelector(".member-overlay-layout");

  //         let closeButton = item.querySelector(".member-close");

  //         if (!memberOverlay || !closeButton) return;

  //         let memberOverlayTimeline = gsap.timeline({
  //           paused: true,
  //           onComplete: () => {
  //             lenis.stop();
  //             lockBodyScroll(true);
  //           },
  //           onReverseComplete: () => {
  //             lenis.start();
  //             lockBodyScroll(false);
  //           },
  //         });

  //         memberOverlayTimeline.fromTo(
  //           memberOverlay,
  //           { display: "none", pointerEvents: "none", opacity: 0 },
  //           {
  //             opacity: 1,
  //             display: "block",
  //             pointerEvents: "auto",
  //             duration: 0.3,
  //             ease: "linear",
  //           }
  //         );
  //         memberOverlayTimeline.fromTo(
  //           memberContent,
  //           { opacity: 0 },
  //           {
  //             opacity: 1,
  //             duration: 0.3,
  //             ease: "linear",
  //           }
  //         );
  //         //

  //         // Open overlay for team members
  //         item.addEventListener("click", () => {
  //           if (memberOverlayTimeline.progress() < 1) {
  //             memberOverlayTimeline.play();
  //           }
  //         });

  //         // Close overlay
  //         closeButton.addEventListener("click", () => {
  //           memberOverlayTimeline.reverse();
  //         });
  //       });
  //     });
  //   }

  //   function galleryMemberPopup() {
  //     document.addEventListener("DOMContentLoaded", () => {
  //       let galleryMembers = document.querySelectorAll("[gallery-member]");
  //       let galleryOverlay = document.querySelector(".member-overlay-items"); // The second overlay

  //       if (!galleryOverlay) return;

  //       let closeButton = galleryOverlay.querySelector(".member-close");

  //       function lockBodyScroll(lock) {
  //         document.body.style.overflow = lock ? "hidden" : "";
  //       }

  //       let galleryOverlayTimeline = gsap.timeline({
  //         paused: true,
  //         onComplete: () => {
  //           lenis.stop();
  //           lockBodyScroll(true);
  //         },
  //         onReverseComplete: () => {
  //           lenis.start();
  //           lockBodyScroll(false);
  //         },
  //       });

  //       galleryOverlayTimeline.fromTo(
  //         galleryOverlay,
  //         { opacity: 0, pointerEvents: "none" },
  //         { opacity: 1, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }
  //       );

  //       // Open overlay when clicking a gallery member
  //       galleryMembers.forEach((item) => {
  //         item.addEventListener("click", () => {
  //           if (galleryOverlayTimeline.progress() < 1) {
  //             galleryOverlayTimeline.play();
  //           }
  //         });
  //       });

  //       // Close overlay
  //       closeButton.addEventListener("click", () => {
  //         galleryOverlayTimeline.reverse();
  //       });
  //     });
  //   }

  //   teamMemberPopup();
  //   galleryMemberPopup();

  // ~~~~~ studio parralax
  function animateStudioScroll() {
    gsap.to("[studio-scroll]", {
      y: "48vh",
      ease: "none",
      scrollTrigger: {
        trigger: "[studio-trigger]",
        start: "top top",
        end: "bottom top",
        scrub: true,
        // markers: true,
      },
    });
  }
  animateStudioScroll();
}

// ~~~~~ studio features project paralax
function studioScrollProject() {
  if (window.matchMedia("(pointer: fine)").matches) {
    const gridLeftHeight =
      document.querySelector(".studio_project_img-large").offsetHeight * 0.5;

    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".studio_project_img-large",
          start: "15% bottom",
          end: "bottom top",
          scrub: true,
          // markers: true,
        },
      })
      .to(
        ".studio_project_content",
        {
          y: gridLeftHeight,
          ease: "none",
        },
        0
      )
      .to(
        ".studio_project_grid-left",
        {
          yPercent: -50,
          ease: "none",
        },
        0
      );
  }
}

// ~~~~~ studio why work paralax
function whyworkParalax() {
  if (window.matchMedia("(pointer: fine)").matches) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "[parallax-trigger]",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          // markers: true,
        },
      })
      .to(
        "[parallax-item]",
        {
          yPercent: -25,
          ease: "none",
        },
        0
      );
  }
}

// ~~~~~ studio we do interactions
function whatWeDo() {
  const hoverMove = document.querySelector(".wedo_hover_move");
  const cmsWrap = document.querySelector(".wedo_cms_wrap");

  document.querySelectorAll(".wedo_grid_item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const itemImage = item.querySelector(".wedo_item_img .g_visual_img");
      const itemText = item.querySelector(".wedo_item_text");

      const hoverImage = hoverMove.querySelector(
        ".wedo_grid_img .g_visual_img"
      );
      const hoverText = hoverMove.querySelector(
        ".wedo_grid_description .wedo_grid_text"
      );

      // Handle yellow color hover
      if (item.getAttribute("data-color") === "yellow") {
        itemText.style.color = "#ffc125";
        hoverText.style.color = "#ffc125";
      } else {
        itemText.style.color = "";
        hoverText.style.color = "";
      }

      if (itemImage && hoverImage) {
        hoverImage.src = itemImage.getAttribute("src");
        hoverImage.alt = itemImage.getAttribute("alt");
      }

      if (itemText && hoverText) {
        hoverText.textContent = itemText.textContent;
      }

      const itemRect = item.getBoundingClientRect();
      const containRect = document
        .querySelector(".wedo_contain")
        .getBoundingClientRect();
      const topOffset = itemRect.top - containRect.top;

      gsap.to(hoverMove, {
        top: topOffset,
        duration: 0.3,
        ease: "power2.out",
      });

      hoverMove.style.display = "block";
    });
  });

  cmsWrap.addEventListener("mouseleave", () => {
    hoverMove.style.display = "none";

    // Reset text colors on mouse leave
    document
      .querySelectorAll(".wedo_grid_item .wedo_item_text")
      .forEach((text) => {
        text.style.color = "";
      });

    const hoverText = hoverMove.querySelector(
      ".wedo_grid_description .wedo_grid_text"
    );
    if (hoverText) {
      hoverText.style.color = "";
    }
  });
}

// /// ~~~~~ studio gallery
// function animateTeamGalleryGrid() {
//   const teamGalleryGrids = document.querySelectorAll(".team_gallery_holder");
//   const gallerySticky = document.querySelector(".gallery_sticky");
//   const items = document.querySelectorAll(".team_gallery_grid > *");

//   function setGalleryStickyHeight() {
//     let totalScrollWidth = 0;

//     teamGalleryGrids.forEach((grid) => {
//       totalScrollWidth += grid.scrollWidth; // Sum widths of both collections
//     });
//     const adjustedWidth = totalScrollWidth - window.innerWidth / 2;
//     gallerySticky.style.height = `${adjustedWidth}px`;

//     return totalScrollWidth; // Return value for use in GSAP
//   }

//   function updateHorizontalScroll() {
//     const adjustedScrollWidth = setGalleryStickyHeight() - window.innerWidth;

//     // Kill existing horizontal scroll triggers
//     ScrollTrigger.getAll()
//       .filter((t) => t.trigger === gallerySticky)
//       .forEach((t) => t.kill());

//     gsap
//       .timeline({
//         scrollTrigger: {
//           trigger: ".gallery_sticky",
//           start: "top top",
//           end: "bottom bottom",
//           scrub: true,
//           invalidateOnRefresh: true,
//         },
//       })
//       .to(teamGalleryGrids, {
//         x: -adjustedScrollWidth,
//         ease: "none",
//       });

//     ScrollTrigger.refresh();
//   }

//   function setupOpacityAnimation() {
//     const opacityTimeline = gsap.timeline({
//       scrollTrigger: {
//         trigger: ".gallery_sticky",
//         start: "top top",
//         toggleActions: "play none none none", // Only plays once
//       },
//     });

//     items.forEach((item, index) => {
//       opacityTimeline.fromTo(
//         item,
//         { opacity: 0 },
//         {
//           opacity: 1,
//           ease: "power1.in",
//           duration: 0.6,
//         },
//         index * 0.02
//       );
//     });
//   }

//   // Run animations
//   updateHorizontalScroll();
//   setupOpacityAnimation(); // Opacity animation runs once

//   // Recalculate horizontal scroll on resize (without triggering opacity again)
//   window.addEventListener("resize", updateHorizontalScroll);
// }

function mobileListScroll() {
  let activeCount = 0;

  // Hide all images on load
  $("[m-scroll-img]").css("display", "none");

  $("[m-scroll-item]:visible").each(function () {
    let $item = $(this);
    let uniqueName = $item.find("[m-item-img]").attr("m-item-img");
    let $targetImg = $(`[m-scroll-img='${uniqueName}']`);

    let $itemOpacity = $item.find("[m-item-opacity]");
    let $itemDisplay = $item.find("[m-item-display]");

    // Set initial states
    $itemOpacity.css("opacity", "0.2");
    $itemDisplay.css("display", "none");

    ScrollTrigger.create({
      trigger: $item,
      start: "top 50%",
      end: "bottom 50%",
      scrub: true,
      onEnter: () => {
        activeCount++;
        gsap.to($itemOpacity, { opacity: 1, duration: 0.3 });
        gsap.to($itemDisplay, { display: "block", duration: 0 });

        showOnlyTargetImg($targetImg);
      },
      onEnterBack: () => {
        activeCount++;
        gsap.to($itemOpacity, { opacity: 1, duration: 0.3 });
        gsap.to($itemDisplay, { display: "block", duration: 0 });

        showOnlyTargetImg($targetImg);
      },
      onLeave: () => {
        activeCount--;
        gsap.to($itemOpacity, { opacity: 0.2, duration: 0.3 });
        gsap.to($itemDisplay, { display: "none", duration: 0 });
        checkIfNoActiveItems();
      },
      onLeaveBack: () => {
        activeCount--;
        gsap.to($itemOpacity, { opacity: 0.2, duration: 0.3 });
        gsap.to($itemDisplay, { display: "none", duration: 0 });
        checkIfNoActiveItems();
      },
    });
  });

  function showOnlyTargetImg($targetImg) {
    $("[m-scroll-img]").css("display", "none");
    if ($targetImg.length) {
      $targetImg.css("display", "block");
    }
  }

  function checkIfNoActiveItems() {
    if (activeCount <= 0) {
      $("[m-scroll-img]").css("display", "none");
    }
  }
}

// ~~~~~~~~~~~~~~~~~~~~CONTACT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (document.querySelector(".contact-section")) {
  mm.add("(min-width: 992px)", () => {});

  mm.add("(max-width: 991px)", () => {
    // mobileSwiper();
  });
}

function setFullHeight() {
  const fullHeightElements = document.querySelectorAll(".full-height-fix");
  const height = window.innerHeight;
  fullHeightElements.forEach((el) => {
    el.style.height = `${height}px`;
  });
}

// Run on page load and resize
setFullHeight();
window.addEventListener("resize", setFullHeight);

$("[share-article]").on("click", function () {
  var $button = $(this);
  var $textElement = $button.find("[share-text]");
  var originalText = $textElement.text();

  // Copy current page URL to clipboard
  var tempInput = $("<input>");
  $("body").append(tempInput);
  tempInput.val(window.location.href).select();
  document.execCommand("copy");
  tempInput.remove();

  // Change text to confirmation message
  $textElement.text("Article link copied");
  $(this).addClass("sharing");
  // Revert text after 3 seconds
  setTimeout(function () {
    $textElement.text(originalText);
    $button.removeClass("sharing");
  }, 3000);
});

$("[copy-el]").each(function () {
  $(this).on("click", function () {
    const $el = $(this);
    const originalText = $el.text();
    const textToCopy = $el.attr("copy-el");

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy).then(() => {
      $el.text("copied");
      setTimeout(() => {
        $el.text(originalText);
      }, 2000);
    });
  });
});

$("[btn-scroll-instant]").on("click", function (e) {
  e.preventDefault();

  const targetId = $(this).attr("href");
  const targetEl = $(targetId)[0]; // convert jQuery object to DOM element

  if (targetEl) {
    lenis.scrollTo(targetEl, {
      immediate: true,
    });
  }
});

//

$(".team-section").each(function () {
  let teamSection = $(this);

  let prevBtn = teamSection.find(".is-prev");
  let nextBtn = teamSection.find(".is-next");
  let teamScrollWrap = teamSection.find(".team-gallery_scrollable");
  let teamGalleryWrap = teamSection.find(".team-gallery_wrap");
  let teamGalleryLists = teamSection.find(".team-gallery_list");
  let teamFilters = teamSection.find(".team-filters_item");

  // Store all team members initially with their data
  let allTeamMembers = [];
  teamGalleryLists.each(function () {
    $(this)
      .find(".team-gallery_item")
      .each(function () {
        allTeamMembers.push({
          element: $(this).clone(true),
          category: $(this).attr("item-category"),
        });
      });
  });

  // Function to set up popup functionality for a team member
  function setupTeamMemberPopup(teamMemberCurrent) {
    let teamPopup = teamMemberCurrent.find(".member-overlay");
    let teamBg = teamMemberCurrent.find(".member-bg");
    let teamContent = teamMemberCurrent.find(".member-contain");
    let teamClose = teamMemberCurrent.find(".member-close");
    let teamTrigger = teamMemberCurrent.find("[team-trigger]");

    let teamPopupTl = gsap.timeline({
      paused: true,
      //   onComplete: () => {

      //   },
      //   onReverseComplete: () => {
      //     lenis.start();
      //   },
    });

    teamPopupTl.set(teamPopup, {
      display: "block",
      pointerEvents: "auto",
    });
    teamPopupTl.fromTo(
      teamBg,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power3.out",
      }
    );
    teamPopupTl.fromTo(
      teamContent,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power3.out",
      }
    );
    teamPopupTl.fromTo(
      teamClose,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power3.out",
      },
      "50%"
    );

    teamTrigger.on("click", function () {
      teamPopupTl.play();
      lenis.stop();
    });

    teamClose.on("click", function () {
      teamPopupTl.reverse();
      lenis.start();
    });

    teamBg.on("click", function () {
      lenis.start();
      teamPopupTl.reverse();
    });
  }

  // Set up popups for initial team members
  teamSection.find(".team-gallery_item").each(function () {
    setupTeamMemberPopup($(this));
  });

  // Function to update button states
  function updateButtonStates() {
    let scrollLeft = teamScrollWrap[0].scrollLeft;
    let maxScroll =
      teamScrollWrap[0].scrollWidth - teamScrollWrap[0].clientWidth;

    // Update prev button
    if (scrollLeft <= 0) {
      prevBtn.removeClass("is-clickable");
    } else {
      prevBtn.addClass("is-clickable");
    }

    // Update next button
    if (scrollLeft >= maxScroll - 1) {
      nextBtn.removeClass("is-clickable");
    } else {
      nextBtn.addClass("is-clickable");
    }
  }

  // Function to scroll the gallery
  // Function to scroll the gallery
  function scrollGallery(direction) {
    let itemWidth = teamSection
      .find(".team-gallery_item")
      .first()
      .outerWidth(true);
    let scrollAmount = itemWidth * 3 + 30;
    let currentScroll = teamScrollWrap[0].scrollLeft;
    let maxScroll =
      teamScrollWrap[0].scrollWidth - teamScrollWrap[0].clientWidth;
    let newScroll;

    if (direction === "next") {
      newScroll = currentScroll + scrollAmount;
      // If we'd go past the max, just go to the max
      if (newScroll > maxScroll) {
        newScroll = maxScroll;
      }
    } else {
      newScroll = currentScroll - scrollAmount;
      // If we'd go below 0, just go to 0
      if (newScroll < 0) {
        newScroll = 0;
      }
    }

    // Use GSAP to animate the scroll
    gsap.to(teamScrollWrap[0], {
      scrollLeft: newScroll,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: updateButtonStates,
      onComplete: updateButtonStates,
    });
  }
  // Function to reset scroll position
  function resetScrollPosition() {
    teamScrollWrap[0].scrollLeft = 0;
    updateButtonStates();
  }

  mm.add("(min-width: 992px)", () => {
    updateButtonStates();

    // Next button click
    nextBtn.on("click", function () {
      if ($(this).hasClass("is-clickable")) {
        scrollGallery("next");
      }
    });

    // Prev button click
    prevBtn.on("click", function () {
      if ($(this).hasClass("is-clickable")) {
        scrollGallery("prev");
      }
    });

    // Update button states on scroll
    teamScrollWrap.on("scroll", updateButtonStates);

    return () => {
      // Cleanup
      teamScrollWrap.removeAttr("data-lenis-prevent");
      nextBtn.off("click");
      prevBtn.off("click");
      teamScrollWrap.off("scroll");
    };
  });

  // Filter functionality
  teamFilters.on("click", function () {
    let clickedFilter = $(this);
    let filterCategory = clickedFilter.attr("filter-trigger");

    if (clickedFilter.hasClass("is-active")) {
      return;
    }

    teamFilters.removeClass("is-active");
    clickedFilter.addClass("is-active");

    let currentItems = teamSection.find(".team-gallery_item");

    gsap.to(currentItems, {
      opacity: 0,
      duration: 0.3,
      ease: "power3.out",
      onComplete: () => {
        let filteredMembers;
        if (filterCategory === "all") {
          filteredMembers = allTeamMembers;
        } else {
          filteredMembers = allTeamMembers.filter(
            (member) => member.category === filterCategory
          );
        }

        teamGalleryLists.each(function () {
          $(this).empty();
        });

        let firstList = teamGalleryLists.eq(0);
        let secondList = teamGalleryLists.eq(1);

        filteredMembers.forEach((member, index) => {
          let newElement = member.element.clone(true);
          gsap.set(newElement, { opacity: 0 });

          if (index < 100) {
            firstList.append(newElement);
          } else {
            secondList.append(newElement);
          }

          setupTeamMemberPopup(newElement);
        });

        // Hide empty gallery wraps to prevent extra space from flex gap
        teamGalleryLists.each(function () {
          let list = $(this);
          let wrap = list.closest(".team-gallery_wrap");

          if (list.children().length === 0) {
            wrap.hide();
          } else {
            wrap.show();
          }
        });

        resetScrollPosition();

        let newItems = teamSection.find(".team-gallery_item");
        gsap.to(newItems, {
          opacity: 1,
          duration: 0.3,
          ease: "power3.out",
        });
      },
    });
  });
});

$("[data-check-text]").each(function () {
  const html = $(this).html();
  const target = "interior design";

  if (html.toLowerCase().includes(target)) {
    const replaced = html.replace(
      /interior design/gi,
      '<span style="color:#ffc125;">interior design</span>'
    );
    $(this).html(replaced);
  }
});

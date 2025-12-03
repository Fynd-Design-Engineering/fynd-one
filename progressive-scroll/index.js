// Ensure GSAP and ScrollTrigger are loaded
gsap.registerPlugin(ScrollTrigger);

function moveElements(sourceSelector, targetSelector, warningMessage) {
  const target = document.querySelector(targetSelector);
  if (!target) {
    console.warn(warningMessage);
    return;
  }

  const sources = document.querySelectorAll(sourceSelector);
  if (sources.length === 0) {
    console.warn(`Warning: No elements found with attribute ${sourceSelector}`);
    return;
  }

  sources.forEach((source) => target.appendChild(source));
}

function initScrollBlocks() {
  moveElements(
    "[fynd-sticky-source]",
    "[fynd-sticky-target]",
    "Warning: No element found with attribute fynd-sticky-target"
  );
  moveElements(
    "[fynd-scroll-source]",
    "[fynd-scroll-target]",
    "Warning: No element found with attribute fynd-scroll-target"
  );
}

function initProgressiveScroll() {
  gsap.registerPlugin(ScrollTrigger);

  // Add debounce to handle rapid scrolling
  let timeout;
  let lastVisitedSection;
  let currentSection;
  localStorage.setItem("lastVisitedSection", null);

  function debouncedScrollTrigger(attributeValue) {
    clearTimeout(timeout);

    const scrollSections = document.querySelectorAll("[fynd-scroll-source]");
    const sectionCount = scrollSections.length;
    const startSection = scrollSections[0].getAttribute("fynd-scroll-source");
    const endSection =
      scrollSections[sectionCount - 1].getAttribute("fynd-scroll-source");
    let currentSection = document
      .querySelector(`[fynd-scroll-source="${attributeValue}"]`)
      .getAttribute("fynd-scroll-source");
    lastVisitedSection = localStorage.getItem("lastVisitedSection");
    // console.log(attributeValue);

    if (
      parseInt(currentSection) === parseInt(endSection) &&
      parseInt(lastVisitedSection) === parseInt(endSection)
    ) {
      // console.log("End of the scroll");
      return;
    } else if (
      parseInt(currentSection) === parseInt(startSection) &&
      parseInt(lastVisitedSection) === parseInt(startSection)
    ) {
      // console.log("Start of the scroll");
      return;
    } else {
      // console.log("Middle of the page");
      timeout = setTimeout(() => {
        updateStickyImage(attributeValue);
        // store attribute value as lastVisitedSection in local storage
        localStorage.setItem("lastVisitedSection", attributeValue);
      }, 50); // 50ms debounce delay
    }
  }

  const sections = document.querySelectorAll("[fynd-scroll-source]");
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%", // Add an end position
      // markers: true,
      onEnter: () => {
        // console.log("Enter:", section.getAttribute("fynd-scroll-source"));
        debouncedScrollTrigger(section.getAttribute("fynd-scroll-source"));
      },
      onEnterBack: () => {
        // console.log("Enter Back:", section.getAttribute("fynd-scroll-source"));
        debouncedScrollTrigger(section.getAttribute("fynd-scroll-source"));
      },
      onLeave: () => {
        // console.log("Leave:", section.getAttribute("fynd-scroll-source"));
        debouncedScrollTrigger(section.getAttribute("fynd-scroll-source"));
      },
      onLeaveBack: () => {
        // console.log("Leave Back:", section.getAttribute("fynd-scroll-source"));
        debouncedScrollTrigger(section.getAttribute("fynd-scroll-source"));
      },
    });
  });
}

function updateStickyImage(identifier) {
  const stickyImages = document.querySelectorAll("[fynd-sticky-source]");

  // Kill any existing animations
  gsap.killTweensOf(stickyImages);

  gsap.set(stickyImages, { opacity: 0 });

  // Get the active image
  const activeImage = document.querySelector(
    `[fynd-sticky-source="${identifier}"]`
  );

  if (activeImage) {
    gsap.to(activeImage, {
      opacity: 1,
      duration: 0.5, // Smooth transition for the active image
      ease: "power1.out",
    });
  }
}

function getScrollContainer() {
  const scrollContainer = document.querySelectorAll("[fynd-scroll-container]");
  gsap.to(scrollContainer, {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out",
    delay: 0.5,
  });
}

function dynamiColorDesktop() {
  document.querySelectorAll("[fynd-sticky-bg]").forEach((element) => {
    let bgColor = element.getAttribute("fynd-sticky-bg");
    if (/^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
      element.style.backgroundColor = bgColor;
    } else {
      console.warn(`Invalid hex color: ${bgColor} for element`, element);
    }
  });
}
function dynamicColorMobile() {
  const bgColor = document
    .querySelector("[fynd-sticky-bg]")
    .getAttribute("fynd-sticky-bg");
  // console.log(
  //   "%cprogressive-scroll/index.js:151 bgColor",
  //   "color: #007acc;",
  //   bgColor
  // );
  document.querySelectorAll("[fynd-card-bg-mobile]").forEach((element) => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
      element.style.backgroundColor = bgColor;
    } else {
      console.warn(`Invalid hex color: ${bgColor} for element`, element);
    }
  });
}
// fynd-card-bg-mobile

function handleResize() {
  // window.location.reload();
  if (window.innerWidth > 991) {
    dynamiColorDesktop();
    initScrollBlocks(); // Scroll blocks moved
    initProgressiveScroll(); // Initiating scroll triggers
    getScrollContainer(); // Showing container after initialization to avoid glitch
  } else {
    dynamicColorMobile();
  }
}

document.addEventListener("DOMContentLoaded", handleResize);

//dynamic color
// document.addEventListener("DOMContentLoaded", function () {
//   document.querySelectorAll("[fynd-sticky-bg]").forEach((element) => {
//     let bgColor = element.getAttribute("fynd-sticky-bg");
//     if (/^#([0-9A-F]{3}){1,2}$/i.test(bgColor)) {
//       element.style.backgroundColor = bgColor;
//     } else {
//       console.warn(`Invalid hex color: ${bgColor} for element`, element);
//     }
//   });
// });

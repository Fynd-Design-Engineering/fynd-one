//Onclick Open Chatboat Script
document.querySelector(".btn_prompt").addEventListener("click", function () {
  const textarea = this.parentElement.querySelector("textarea");
  if (textarea) {
    const userMessage = textarea.value.trim();
    if (userMessage) {
      window.copilot("event", "open");
      setTimeout(() => {
        window.copilot("event", "sendUserMessage", { message: userMessage });
      }, 1000);
    } else {
      console.warn("Textarea is empty. Please enter a message.");
    }
  }
});

//Text Typing Animation Script
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector("*[data-typing]");
  if (!textarea) return;
  const texts = textarea.getAttribute("data-typing").split("|"); // Get placeholder values
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingActive = true;
  let restartTimeout;
  let typingInterval;
  let userHasTyped = false; // Track if the user has entered text
  function typeEffect() {
    if (!typingActive || userHasTyped) return; // Stop animation if user has typed manually
    const currentText = texts[textIndex];
    if (!isDeleting) {
      textarea.value = currentText.substring(0, charIndex) + "|";
      charIndex++;
      if (charIndex > currentText.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1000); // Pause before deleting
        return;
      }
    } else {
      textarea.value = currentText.substring(0, charIndex) + "|";
      charIndex--;
      if (charIndex < 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length; // Loop through texts
      }
    }
    typingInterval = setTimeout(typeEffect, isDeleting ? 50 : 100); // Typing and deleting speed
  }
  typeEffect();
  // Stop auto-typing when a badge is clicked
  document
    .querySelectorAll(".prompt_tags .badge_style_three")
    .forEach((badge) => {
      badge.addEventListener("click", (event) => {
        event.preventDefault();
        typingActive = false; // Stop typing animation
        clearTimeout(typingInterval);
        textarea.value = badge.textContent.trim(); // Set text instantly
        userHasTyped = true; // Mark as manually typed
        clearTimeout(restartTimeout);
      });
    });
  // Stop typing animation when the user manually types
  textarea.addEventListener("input", () => {
    typingActive = false; // Stop auto-typing
    clearTimeout(typingInterval);
    clearTimeout(restartTimeout);
    userHasTyped = textarea.value.trim() !== ""; // Mark as manually typed only if user enters something
  });
  // **Fix: Remove placeholder text immediately on focus**
  textarea.addEventListener("focus", () => {
    typingActive = false; // Stop auto-typing
    clearTimeout(typingInterval);
    if (!userHasTyped) {
      textarea.value = ""; // Clear the placeholder immediately
    }
  });
  // Restore placeholder text only if empty when blurring
  textarea.addEventListener("blur", () => {
    if (textarea.value.trim() === "") {
      userHasTyped = false; // Reset manual typing flag
      restartTimeout = setTimeout(() => {
        typingActive = true; // Restart typing animation after blur
        textIndex = 0; // Reset to first text
        charIndex = 0;
        isDeleting = false;
        typeEffect();
      }, 500); // Delay before restarting
    }
  });
});

//Keep Scrolling In The Middle Of Window Script
document.addEventListener("DOMContentLoaded", () => {
  const mediaContainer = document.querySelector(".media_carousal");
  const cards = document.querySelectorAll(".media_carousal .media_card");
  if (mediaContainer && cards.length > 1) {
    // Ensure at least 2 cards exist
    const mediaStyles = window.getComputedStyle(mediaContainer);
    const paddingLeft = parseFloat(mediaStyles.paddingLeft);
    const paddingRight = parseFloat(mediaStyles.paddingRight);
    // Get the second card
    const secondCard = cards[1];
    const secondCardOffset = secondCard.offsetLeft; // Distance from the start of container
    const secondCardWidth = secondCard.offsetWidth;
    // Center the second card by calculating scroll position
    const scrollPosition =
      secondCardOffset - mediaContainer.clientWidth / 2 + secondCardWidth / 2;
    // Apply the calculated scroll position
    mediaContainer.scrollLeft = scrollPosition;
  }
});

//Set The Height From Custom Attributes And Apply Them Through Inline CSS Script
const mediaCards = document.querySelectorAll(".media_card");
const updateVideoHeights = () => {
  const viewportWidth = window.innerWidth;
  mediaCards.forEach((card) => {
    // Get custom height attributes
    const mobileHeight = card.getAttribute("mobile-height");
    const desktopHeight = card.getAttribute("desktop-height");
    const tabletHeight = card.getAttribute("tablet-height");
    const mobileLandHeight = card.getAttribute("mobile-land-height");
    let heightToApply = null; // Default to no height
    // Determine the height based on viewport width
    if (viewportWidth >= 1200) {
      heightToApply = desktopHeight || null; // Use null if no custom attribute
    } else if (viewportWidth >= 768 && viewportWidth <= 1023) {
      heightToApply = tabletHeight || null;
    } else if (viewportWidth >= 576 && viewportWidth <= 767) {
      heightToApply = mobileLandHeight || null;
    } else {
      heightToApply = mobileHeight || null;
    }
    // Find the video tag within the current media card
    const video = card.querySelector("video");
    if (video) {
      if (heightToApply) {
        video.style.height = heightToApply; // Apply custom height
      } else {
        video.style.height = ""; // Reset height if no custom attribute
      }
    }
  });
};
// Update video heights on page load
updateVideoHeights();
// Update video heights on window resize
window.addEventListener("resize", updateVideoHeights);

//Custom Video Script
const videoWrappers = document.querySelectorAll("div[src-webm][src-mp4]");
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let windowHasLoaded = false;
let currentIsMobileViewport = window.innerWidth <= 767;
// Step 1: Set poster immediately
videoWrappers.forEach((wrapper) => {
  const video = wrapper.querySelector("video");
  const isMobileViewport = window.innerWidth <= 767;
  const poster = isMobileViewport
    ? wrapper.getAttribute("mobile-video-poster") ||
      wrapper.getAttribute("video-poster")
    : wrapper.getAttribute("video-poster");
  if (video && poster) {
    video.setAttribute("poster", poster);
  }
});
// Step 2: After window fully loaded
window.addEventListener("load", () => {
  windowHasLoaded = true;
  videoWrappers.forEach((wrapper) => {
    const video = wrapper.querySelector("video");
    if (
      !video ||
      video.dataset.loaded === "true" ||
      video.dataset.observing === "true"
    )
      return;
    const isMobileViewport = window.innerWidth <= 767;
    const mp4Src = isMobileViewport
      ? wrapper.getAttribute("mobile-src-mp4") ||
        wrapper.getAttribute("src-mp4")
      : wrapper.getAttribute("src-mp4");
    const webmSrc = isMobileViewport
      ? wrapper.getAttribute("mobile-src-webm") ||
        wrapper.getAttribute("src-webm")
      : wrapper.getAttribute("src-webm");
    const playBehavior = wrapper.getAttribute("data-play");
    const threshold = parseFloat(wrapper.getAttribute("threshold") || "0");
    const shouldAutoPlay =
      isMobileDevice ||
      playBehavior === "autoplay" ||
      video.hasAttribute("autoplay");
    const loadVideo = () => {
      if (video.dataset.loaded === "true") return;
      video.dataset.loaded = "true";
      if (mp4Src) {
        const mp4Source = document.createElement("source");
        mp4Source.src = mp4Src;
        mp4Source.type = 'video/mp4; codecs="hvc1"';
        video.appendChild(mp4Source);
      }
      if (webmSrc) {
        const webmSource = document.createElement("source");
        webmSource.src = webmSrc;
        webmSource.type = "video/webm";
        video.appendChild(webmSource);
      }
      video.load();
      video.oncanplay = () => {
        if (shouldAutoPlay) {
          video.muted = true;
          video.play().catch(() => {});
        }
      };
    };
    // Special case for videos inside .media_card: delay
    if (video.closest(".media_card")) {
      setTimeout(() => {
        loadVideo();
      }, 1000);
    } else {
      // Lazy load on intersection
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && windowHasLoaded) {
              loadVideo();
              obs.unobserve(wrapper);
            }
          });
        },
        { threshold, rootMargin: "1000px" }
      );
      observer.observe(wrapper);
      video.dataset.observing = "true";
    }
    // Optional: hover-based play for desktop
    if (playBehavior === "on-hover" && !isMobileDevice) {
      wrapper.addEventListener("mouseenter", () => {
        if (video.dataset.loaded === "true") video.play();
      });
      wrapper.addEventListener("mouseleave", () => {
        if (video.dataset.loaded === "true") video.pause();
      });
    }
  });
});
// Step 3: Watch for resize and update sources & poster dynamically
window.addEventListener("resize", () => {
  const newIsMobile = window.innerWidth <= 767;
  if (newIsMobile !== currentIsMobileViewport) {
    currentIsMobileViewport = newIsMobile;
    videoWrappers.forEach((wrapper) => {
      const video = wrapper.querySelector("video");
      if (!video) return;
      // Update poster
      const newPoster = newIsMobile
        ? wrapper.getAttribute("mobile-video-poster") ||
          wrapper.getAttribute("video-poster")
        : wrapper.getAttribute("video-poster");
      if (newPoster) {
        video.setAttribute("poster", newPoster);
      }
      // Clear existing sources
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }
      // Add new sources
      const newMp4Src = newIsMobile
        ? wrapper.getAttribute("mobile-src-mp4") ||
          wrapper.getAttribute("src-mp4")
        : wrapper.getAttribute("src-mp4");
      const newWebmSrc = newIsMobile
        ? wrapper.getAttribute("mobile-src-webm") ||
          wrapper.getAttribute("src-webm")
        : wrapper.getAttribute("src-webm");
      if (newMp4Src) {
        const mp4Source = document.createElement("source");
        mp4Source.src = newMp4Src;
        mp4Source.type = 'video/mp4; codecs="hvc1"';
        video.appendChild(mp4Source);
      }
      if (newWebmSrc) {
        const webmSource = document.createElement("source");
        webmSource.src = newWebmSrc;
        webmSource.type = "video/webm";
        video.appendChild(webmSource);
      }
      video.load();
    });
  }
});

//Custom Cursor Script
document.addEventListener("DOMContentLoaded", () => {
  // Create custom cursor element
  const cursor = document.createElement("div");
  cursor.classList.add("custom_cursor");
  document.body.appendChild(cursor);
  let currentParent = null;
  let mouseX = 0,
    mouseY = 0;
  let isCursorActive = false;
  // Function to update cursor position smoothly
  const updateCursorPosition = () => {
    requestAnimationFrame(() => {
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${
        isCursorActive ? 1 : 0.8
      })`;
    });
  };
  // Function to check if cursor is inside a `data-cursor` element
  const checkCursorHover = () => {
    const elementUnderCursor = document.elementFromPoint(mouseX, mouseY);
    const parent = elementUnderCursor?.closest("[data-cursor]");
    if (parent) {
      if (parent !== currentParent) {
        if (currentParent) currentParent.style.cursor = "";
        parent.style.cursor = "none";
        cursor.textContent = parent.getAttribute("data-cursor");
        cursor.style.opacity = "1";
        cursor.style.visibility = "visible";
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
        isCursorActive = true;
        currentParent = parent;
      }
    } else if (currentParent) {
      currentParent.style.cursor = "";
      cursor.style.opacity = "0";
      cursor.style.visibility = "hidden";
      isCursorActive = false;
      currentParent = null;
    }
  };
  // Initial positioning of the cursor at the current mouse position
  document.addEventListener("mouseover", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorPosition();
  });
  // Mouse move event (Tracks actual cursor position)
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorPosition();
    checkCursorHover();
  });
  // Scroll event to ensure cursor updates when scrolling into `data-cursor` section
  document.addEventListener("scroll", () => {
    checkCursorHover();
    updateCursorPosition(); // Ensures the cursor moves properly after scrolling
  });
  // Hide cursor when leaving the page
  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
    cursor.style.visibility = "hidden";
    isCursorActive = false;
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   const navContainer = document.querySelector(".floating_navs");
//   const navList = document.querySelector(".floating_nav_unorder"); // UL containing items
//   const navItems = Array.from(navList.querySelectorAll(".floating_nav_item"));
//   const sections = document.querySelectorAll("section");
//   const targetSection = document.querySelector(".fynd_ai_platform");
//   const hideNavSections = document.querySelectorAll('[data-hide-nav-section="true"]');
//   const navArrows = Array.from(document.querySelectorAll(".floating_nav_arrow"));
//   const leftArrow = document.querySelector(".floating_direction_link.left");
//   const rightArrow = document.querySelector(".floating_direction_link.right");
//   const visibleItems = parseInt(navList.dataset.displayItems) || 4;
//   /** Set Width for Floating Navs **/
//   function updateNavWidth() {
//     requestAnimationFrame(() => {
//       let totalWidth = 0;
//       for (let i = 0; i < visibleItems && i < navItems.length; i++) {
//         totalWidth += navItems[i].getBoundingClientRect().width;
//         if (navItems[i].classList.contains("active")) {
//           totalWidth += 16;
//         }
//       }
//       navArrows.forEach(arrow => {
//         totalWidth += arrow.getBoundingClientRect().width;
//       });
//       if (totalWidth > 0) {
//         navList.style.width = totalWidth + "px";
//       }
//     });
//   }
//   /** Smooth Scroll to Sections **/
//   function scrollToSection(event) {
//     event.preventDefault();
//     const targetId = this.getAttribute("href").substring(1);
//     const targetSection = document.getElementById(targetId);
//     if (targetSection) {
//       window.scrollTo({ top: targetSection.offsetTop - 50, behavior: "smooth" });
//     }
//   }
//   /** Auto Scroll Floating Nav to Active Item **/
//   function scrollToActiveNavItem() {
//     const activeItem = document.querySelector(".floating_nav_item.active");
//     if (activeItem) {
//       navList.scrollTo({
//         left: activeItem.offsetLeft - (navList.clientWidth / 2) + (activeItem.clientWidth / 2),
//         behavior: "smooth"
//       });
//     }
//   }
//   /** Highlight Active Nav Item on Scroll **/
//   function updateActiveNav() {
//     let activeSection = null;
//     let minDistance = Infinity;
//     sections.forEach(section => {
//       const distance = Math.abs(section.getBoundingClientRect().top);
//       if (distance < minDistance) {
//         minDistance = distance;
//         activeSection = section;
//       }
//     });
//     if (activeSection) {
//       navItems.forEach(item => {
//         const link = item.querySelector("a");
//         const img = item.querySelector(".floating_nav_image");
//         const variant = item.getAttribute("data-wf--floating-nav-item--variant");
//         const isArrow = variant === "direction-arrow-left" || variant === "direction-arrow-right";
//         if (link.getAttribute("href").substring(1) === activeSection.id) {
//           item.classList.add("active");
//           link.style.opacity = "1";
//           if (img && !isArrow) {
//             img.style.minWidth = "16px";
//             img.style.opacity = "1";
//           }
//         } else {
//           item.classList.remove("active");
//           link.style.opacity = "0.78";
//           if (img && !isArrow) {
//             img.style.minWidth = "0px";
//             img.style.opacity = "0";
//           }
//         }
//       });
//       scrollToActiveNavItem();
//     }
//   }
//   /** Show/Hide Floating Nav Based on Scroll Position **/
//   function handleFloatingNavVisibility() {
//     if (!targetSection || !navContainer) return;
//     const rect = targetSection.getBoundingClientRect();
//     if (rect.bottom - 1 <= 0) {  // Added +1 pixel adjustment
//       navContainer.style.opacity = "1";
//       navContainer.style.pointerEvents = "auto";
//     } else {
//       navContainer.style.opacity = "0";
//       navContainer.style.pointerEvents = "none";
//       return;
//     }
//     let shouldHideNav = false;
//     hideNavSections.forEach((section, index) => {
//       const sectionRect = section.getBoundingClientRect();
//       const nextSection = hideNavSections[index + 1];
//       if (sectionRect.top <= 0 && (!nextSection || nextSection.getBoundingClientRect().top > 0)) {
//         shouldHideNav = true;
//       }
//     });
//     if (shouldHideNav) {
//       navContainer.style.opacity = "0";
//       navContainer.style.pointerEvents = "none";
//     }
//   }
//   /** Scroll Left and Right **/
//   function updateArrowVisibility() {
//     leftArrow.style.display = navList.scrollLeft > 0 ? "block" : "none";
//     rightArrow.style.display = "block";
//     rightArrow.style.display = navList.scrollLeft + navList.clientWidth < navList.scrollWidth ? "block" : "none";
//   }
//   function scrollNavLeft() {
//     const itemWidth = navItems[0]?.getBoundingClientRect().width || 50;
//     navList.scrollBy({ left: -itemWidth, behavior: "smooth" });
//     setTimeout(updateArrowVisibility, 300);
//   }
//   function scrollNavRight() {
//     const itemWidth = navItems[0]?.getBoundingClientRect().width || 50;
//     navList.scrollBy({ left: itemWidth, behavior: "smooth" });
//     setTimeout(updateArrowVisibility, 300);
//   }
//   if (leftArrow && rightArrow) {
//     leftArrow.addEventListener("click", scrollNavLeft);
//     rightArrow.addEventListener("click", scrollNavRight);
//   }
//   navList.addEventListener("scroll", updateArrowVisibility);
//   updateArrowVisibility();
//   window.addEventListener("scroll", updateActiveNav);
//   window.addEventListener("scroll", handleFloatingNavVisibility);
//   updateNavWidth();
//   handleFloatingNavVisibility();
// });

//Logos Destroyed Slider Script
document.querySelectorAll("[data-swiper-enable]").forEach((element) => {
  let swiperInstance = null;
  const manageSwiper = () => {
    const viewport = parseInt(element.getAttribute("data-swiper-enable"), 10);
    const shouldEnable = window.innerWidth <= viewport; // Enable for screens less than or equal to the viewport
    if (shouldEnable) {
      if (!swiperInstance) {
        // Ensure swiper-slide elements are set for "auto"
        element.querySelectorAll(".swiper-slide").forEach((slide) => {
          slide.style.width = "auto"; // Allow Swiper to handle width dynamically
        });
        // Initialize Swiper with continuous marquee-like settings
        swiperInstance = new Swiper(element, {
          slidesPerView: "auto",
          loop: true, // Enable infinite loop
          speed: 1000, // Smooth and slow speed for continuous motion
          autoplay: {
            delay: 1,
            disableOnInteraction: false,
          },
        });
      }
    } else {
      // Destroy Swiper if already initialized
      if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
      }
    }
  };
  // Initial check on page load
  manageSwiper();
  // Add event listener for screen resize
  window.addEventListener("resize", manageSwiper);
});

//Support Swiper Slider Script
var swiper = new Swiper("#supportSwiper", {
  breakpoints: {
    0: {
      slidesPerView: 2.5,
      spaceBetween: 16,
    },
    1100: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
  },
});

//Productivity Swiper Slider Script
var swiper = new Swiper("#productivitySwiper", {
  breakpoints: {
    0: {
      slidesPerView: 1.35,
      spaceBetween: 16,
    },
    480: {
      slidesPerView: 1.35,
      spaceBetween: 16,
    },
    768: {
      slidesPerView: 2.5,
      spaceBetween: 16,
    },
    1100: {
      slidesPerView: 2.5,
      spaceBetween: 24,
    },
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  mousewheel: {
    forceToAxis: true,
    sensitivity: 2,
    releaseOnEdges: true,
  },
  freeMode: true,
});

//Testimonial Swiper Slider Script
var swiper = new Swiper("#testimonialSwiper", {
  slidesPerView: 1,
  spaceBetween: 16,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

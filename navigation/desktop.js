let isDropdownOpen = false;
let isFirstTime = true;
let isAnimating = false;
let isStartAgain = true;
let currentAnimationTimeline = null;

const dropdownDimensions = [
  {
    name: "solutions",
    width: 1026,
    height: 618,
    isCurrent: false,
  },
  {
    name: "resources",
    width: 546,
    height: 354,
    isCurrent: false,
  },
  {
    name: "company",
    width: 262,
    height: 420,
    isCurrent: false,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 991) {
    // Elements for dropdown
    const dropdownOverlay = document.querySelector(
      '[data-nav-element="overlay"]'
    );
    const navItems = document.querySelectorAll('[data-nav-item="link"]');
    const navItemsWrapper = document.querySelectorAll(
      '[data-nav-animation="links"]'
    );
    const dropdownMover = document.querySelector(
      '[data-nav-item="dropdown-mover"]'
    );

    const dropdownItems = document.querySelector(
      '[data-nav-item="dropdown-mover"]'
    );

    // Elements for tabs
    const tabLinks = document.querySelectorAll("[data-tab-link]");
    const tabContents = document.querySelectorAll("[data-tab-content]");

    // Initialize functions
    initTabs(tabLinks, tabContents);
    updateDropdownState(navItemsWrapper);
    initNavlinksHover(navItems);
  }
});

function initTabs(tabLinks, tabContents) {
  if (tabLinks.length > 0) {
    const initialValue = tabLinks[0].getAttribute("data-tab-link");
    tabLinks[0].setAttribute("data-tab-link-active", "true");

    tabContents.forEach((content) => {
      content.setAttribute(
        "data-tab-content-active",
        content.getAttribute("data-tab-content") === initialValue
          ? "true"
          : "false"
      );
    });

    tabLinks.forEach((tab) => {
      tab.addEventListener("mouseover", function () {
        const activeValue = this.getAttribute("data-tab-link");
        tabLinks.forEach((t) =>
          t.setAttribute("data-tab-link-active", "false")
        );
        this.setAttribute("data-tab-link-active", "true");
        tabContents.forEach((content) => {
          content.setAttribute(
            "data-tab-content-active",
            content.getAttribute("data-tab-content") === activeValue
              ? "true"
              : "false"
          );
        });
      });
    });
  }
}

function updateDropdownState(navItemsWrapper) {
  navItemsWrapper.forEach((element) => {
    element.addEventListener("mouseleave", () => {
      isDropdownOpen = false;
      console.log("close dropdown");
      closeDropdownWrapper();
    });
  });
}

function initNavlinksHover(navLinks) {
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      const index = parseInt(this.getAttribute("data-nav-link"), 10);
      if (!isDropdownOpen) {
        triggerDropdownOpen(this, index);
        isDropdownOpen = true;
      } else {
        triggerDropdownOpen(this, index);
      }
    });
  });
}

function triggerDropdownOpen(currentLink, index) {
  // Kill any ongoing animations to prevent conflicts
  if (currentAnimationTimeline) {
    currentAnimationTimeline.kill();
  }

  if (!isDropdownOpen) {
    console.log(
      "performing dropdown open animation because it was closed before 💀 🔥"
    );
    updateNavHover(index);
    initDropdownContent(index);
    initMover(currentLink, index);
    openDropdownWrapper(index);
  } else {
    console.log("no need to open again just move 😤");
    updateNavHover(index);
    updateDropdownContent(index);
    animateMover(currentLink, index);
  }
}

function openDropdownWrapper(index) {
  const mover = document.querySelector('[data-nav-element="mover"]');
  const overlay = document.querySelector('[data-nav-element="overlay"]');
  const wrapper = document.querySelector('[data-nav-element="wrapper"]');

  const calculatedHeight = dropdownDimensions[index].height;

  wrapper.style.display = "block";
  overlay.style.display = "block";

  // Kill any ongoing animations
  gsap.killTweensOf([mover, overlay]);

  // Create a new timeline
  currentAnimationTimeline = gsap.timeline();

  // Add animations to the timeline
  currentAnimationTimeline.to(overlay, {
    opacity: 1,
    duration: 0.3,
    ease: "power2.out",
  });
  currentAnimationTimeline.to(
    mover,
    {
      height: `${calculatedHeight}px`,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.2"
  ); // Start slightly before the overlay animation completes
}

function closeDropdownWrapper() {
  const mover = document.querySelector('[data-nav-element="mover"]');
  const overlay = document.querySelector('[data-nav-element="overlay"]');
  const wrapper = document.querySelector('[data-nav-element="wrapper"]');
  const dropdownContents = document.querySelectorAll("[data-desktop-content]");
  const navlinks = document.querySelectorAll("[data-desktop-navlink]");

  // Kill any ongoing animations
  if (currentAnimationTimeline) {
    currentAnimationTimeline.kill();
  }

  // Create a new timeline
  currentAnimationTimeline = gsap.timeline();

  // Add animations to the timeline
  currentAnimationTimeline.to(mover, {
    height: 0,
    duration: 0.3,
    ease: "power2.in",
  });

  currentAnimationTimeline.to(
    overlay,
    {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    },
    "-=0.1"
  );

  currentAnimationTimeline.to(
    navlinks,
    {
      opacity: 1,
      duration: 0.2,
    },
    "-=0.2"
  );

  currentAnimationTimeline.call(() => {
    wrapper.style.display = "none";
    overlay.style.display = "none";
    dropdownContents.forEach((content) => {
      content.style.display = "none";
      content.style.opacity = 0;
    });
  });
}

function animateMover(currentLink, index) {
  const calculatedHeight = dropdownDimensions[index].height;
  const calculatedWidth = dropdownDimensions[index].width;

  const mover = document.querySelector('[data-nav-element="mover"]');

  const itemRect = currentLink.getBoundingClientRect();
  const navRect = currentLink.parentElement.getBoundingClientRect();
  const offsetX = itemRect.left - navRect.left;

  // Kill any ongoing animations
  gsap.killTweensOf(mover);

  // Create a new timeline
  currentAnimationTimeline = gsap.timeline();

  // Add animations to the timeline (run in parallel with less duration)
  currentAnimationTimeline.to(mover, {
    x: offsetX,
    width: `${calculatedWidth}px`,
    height: `${calculatedHeight}px`,
    duration: 0.2,
    ease: "power2.out",
  });
}

function initMover(currentLink, index) {
  const calculatedHeight = dropdownDimensions[index].height;
  const calculatedWidth = dropdownDimensions[index].width;

  const mover = document.querySelector('[data-nav-element="mover"]');

  const itemRect = currentLink.getBoundingClientRect();
  const navRect = currentLink.parentElement.getBoundingClientRect();
  const offsetX = itemRect.left - navRect.left;

  gsap.set(mover, {
    x: offsetX,
    height: "0px",
    width: `${calculatedWidth}px`,
  });
}

function updateDropdownContent(currentIndex) {
  const dropdownContents = document.querySelectorAll("[data-desktop-content]");

  // Kill any ongoing content animations
  gsap.killTweensOf(dropdownContents);

  // Create a timeline for content transition
  const contentTimeline = gsap.timeline();

  contentTimeline.to(dropdownContents, {
    opacity: 0,
    duration: 0.15,
    onComplete: () => {
      dropdownContents.forEach((content) => (content.style.display = "none"));
      // Show the selected one and animate opacity
      const currentContent = dropdownContents[currentIndex];
      if (currentContent) {
        if (currentIndex == 0 || currentIndex == 1) {
          currentContent.style.display = "grid";
        } else {
          currentContent.style.display = "block";
        }
        gsap.to(currentContent, { opacity: 1, duration: 0.15 });
      }
    },
  });
}

function initDropdownContent(currentIndex) {
  const dropdownContents = document.querySelectorAll("[data-desktop-content]");

  // Reset all content visibility immediately
  dropdownContents.forEach((content) => {
    content.style.opacity = 0;
    content.style.display = "none";
  });

  // Show only current content
  const currentContent = dropdownContents[currentIndex];
  if (currentContent) {
    if (currentIndex == 0 || currentIndex == 1) {
      currentContent.style.display = "grid";
    } else {
      currentContent.style.display = "block";
    }
    gsap.to(currentContent, { opacity: 1, duration: 0.2, delay: 0.1 });
  }
}

function updateNavHover(currentIndex) {
  const navlinks = document.querySelectorAll("[data-desktop-navlink]");
  const currentContent = navlinks[currentIndex];

  // Kill any ongoing nav link animations
  gsap.killTweensOf(navlinks);

  gsap.to(navlinks, {
    opacity: 0.5,
    duration: 0.15,
  });

  gsap.to(currentContent, {
    opacity: 1,
    duration: 0.15,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Get all FAQ wrappers
  const faqWrappers = document.querySelectorAll('[fynd-faq-element="wrapper"]');

  // Initialize all FAQ items
  faqWrappers.forEach((wrapper) => {
    const toggle = wrapper.querySelector('[fynd-faq-element="toggle"]');
    const content = wrapper.querySelector('[fynd-faq-element="content"]');
    const contentInner = wrapper.querySelector(
      '[fynd-faq-element="content-inner"]'
    );
    const xLine = toggle.querySelector('[fynd-faq-element="x-line"]');
    const yLine = toggle.querySelector('[fynd-faq-element="y-line"]');

    // Set initial state with proper styling for smooth transitions
    if (wrapper.getAttribute("fynd-faq-initialopen") === "true") {
      // Open it initially
      gsap.set(content, { height: "auto", overflow: "hidden" });
      gsap.set(contentInner, { opacity: 1 });
      gsap.set(xLine, { rotation: 180 });
      gsap.set(yLine, { rotation: 270 });
      toggle.setAttribute("data-state", "open");
    } else {
      // Initialize as closed
      gsap.set(content, { height: 0 });
      gsap.set(contentInner, { opacity: 0 });
      gsap.set(xLine, { rotation: 0 });
      gsap.set(yLine, { rotation: 0 });
      toggle.setAttribute("data-state", "closed");
    }

    // Add click event to toggle with debounce to prevent rapid clicking
    let isAnimating = false;
    toggle.addEventListener("click", () => {
      if (isAnimating) return;

      isAnimating = true;
      const isOpen = toggle.getAttribute("data-state") === "open";

      if (isOpen) {
        closeAccordion(wrapper, () => {
          isAnimating = false;
        });
      } else {
        openAccordion(wrapper, () => {
          isAnimating = false;
        });
      }
    });
  });
});

function openAccordion(wrapper, callback) {
  const toggle = wrapper.querySelector('[fynd-faq-element="toggle"]');
  const content = wrapper.querySelector('[fynd-faq-element="content"]');
  const contentInner = wrapper.querySelector(
    '[fynd-faq-element="content-inner"]'
  );
  const xLine = toggle.querySelector('[fynd-faq-element="x-line"]');
  const yLine = toggle.querySelector('[fynd-faq-element="y-line"]');

  // Clear any existing animations
  if (content.gsapAnimation) {
    content.gsapAnimation.kill();
  }

  // Create animation timeline with smoother easing
  const timeline = gsap.timeline({
    onComplete: () => {
      if (callback) callback();
    },
  });

  // Measure content height for smooth animation
  gsap.set(content, { height: "auto", visibility: "hidden", opacity: 0 });
  const height = content.offsetHeight;
  gsap.set(content, { height: 0, visibility: "visible", opacity: 1 });

  // Animate the x and y lines
  timeline.to(
    xLine,
    {
      rotation: 180,
      duration: 0.4,
      ease: "power2.inOut",
    },
    0
  );

  timeline.to(
    yLine,
    {
      rotation: 270,
      duration: 0.4,
      ease: "power2.inOut",
    },
    0
  );

  // Animate height with elastic ease for a slight bounce effect
  timeline.to(
    content,
    {
      height: height,
      duration: 0.5,
      ease: "power3.inOut",
      clearProps: "height",
      onComplete: () => {
        // Set to 'auto' after animation to handle content changes
        content.style.height = "auto";
      },
    },
    0
  );

  // Fade and slide in the content
  timeline.to(
    contentInner,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.35"
  ); // Start before height animation completes

  // Store the animation in the element
  content.gsapAnimation = timeline;

  // Update state
  toggle.setAttribute("data-state", "open");

  const icon = toggle.querySelector('[fynd-faq-element="chevron"]');
  if (icon) {
    gsap.to(icon, {
      rotation: 180,
      duration: 0.4,
      ease: "back.out(1.7)",
    });
  }
}

function closeAccordion(wrapper, callback) {
  const toggle = wrapper.querySelector('[fynd-faq-element="toggle"]');
  const content = wrapper.querySelector('[fynd-faq-element="content"]');
  const contentInner = wrapper.querySelector(
    '[fynd-faq-element="content-inner"]'
  );
  const xLine = toggle.querySelector('[fynd-faq-element="x-line"]');
  const yLine = toggle.querySelector('[fynd-faq-element="y-line"]');

  // Clear any existing animations
  if (content.gsapAnimation) {
    content.gsapAnimation.kill();
  }

  // First, ensure height is set to the current value for animation
  const height = content.offsetHeight;
  content.style.height = `${height}px`;

  // Create animation timeline with smoother easing
  const timeline = gsap.timeline({
    onComplete: () => {
      if (callback) callback();
    },
  });

  // Animate the x and y lines back to 0
  timeline.to(
    xLine,
    {
      rotation: 0,
      duration: 0.4,
      ease: "power2.inOut",
    },
    0
  );

  timeline.to(
    yLine,
    {
      rotation: 0,
      duration: 0.4,
      ease: "power2.inOut",
    },
    0
  );

  // Fade and slide out the content slightly upward
  timeline.to(
    contentInner,
    {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    },
    0
  );

  // Shrink the height with a subtle ease
  timeline.to(
    content,
    {
      height: 0,
      duration: 0.4,
      ease: "power3.inOut",
    },
    "-=0.25"
  ); // Start before opacity animation completes

  // Store the animation in the element
  content.gsapAnimation = timeline;

  // Update state
  toggle.setAttribute("data-state", "closed");

  // Optional: subtle rotation for any icon in the toggle
  const icon = toggle.querySelector('[fynd-faq-element="chevron"]');
  if (icon) {
    gsap.to(icon, {
      rotation: 0,
      duration: 0.4,
      ease: "back.out(1.7)",
    });
  }
}

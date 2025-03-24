document.addEventListener("DOMContentLoaded", () => {
  const faqWrappers = document.querySelectorAll('[fynd-faq-element="wrapper"]');

  faqWrappers.forEach((wrapper) => {
    const toggle = wrapper.querySelector('[fynd-faq-element="toggle"]');
    const content = wrapper.querySelector('[fynd-faq-element="content"]');
    const contentInner = wrapper.querySelector(
      '[fynd-faq-element="content-inner"]'
    );
    const xLine = toggle.querySelector('[fynd-faq-element="x-line"]');
    const yLine = toggle.querySelector('[fynd-faq-element="y-line"]');

    const groupContainer = wrapper.closest("[fynd-faq-group]");
    const groupName = groupContainer
      ? groupContainer.getAttribute("fynd-faq-group")
      : null;

    // Set initial state
    if (wrapper.getAttribute("fynd-faq-initialopen") === "true") {
      gsap.set(content, { height: "auto", overflow: "hidden" });
      gsap.set(contentInner, { opacity: 1 });
      gsap.set(xLine, { rotation: 180 });
      gsap.set(yLine, { rotation: 270 });
      toggle.setAttribute("data-state", "open");
    } else {
      gsap.set(content, { height: 0 });
      gsap.set(contentInner, { opacity: 0 });
      gsap.set(xLine, { rotation: 0 });
      gsap.set(yLine, { rotation: 0 });
      toggle.setAttribute("data-state", "closed");
    }

    let isAnimating = false;
    toggle.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;
      const isOpen = toggle.getAttribute("data-state") === "open";

      // Get all open FAQs in the same group
      const openFAQs = groupContainer.querySelectorAll(
        '[fynd-faq-element="wrapper"] [data-state="open"]'
      );

      if (isOpen && openFAQs.length === 1) {
        // Prevent closing if it's the only open FAQ in the group
        isAnimating = false;
        return;
      }

      if (isOpen) {
        closeAccordion(wrapper, () => {
          isAnimating = false;
        });
      } else {
        closeOtherAccordions(groupContainer);
        openAccordion(wrapper, () => {
          isAnimating = false;
        });
      }
    });
  });
});

// Function to close all other open accordions in the same group
function closeOtherAccordions(groupContainer) {
  const openFAQs = groupContainer.querySelectorAll(
    '[fynd-faq-element="wrapper"] [data-state="open"]'
  );

  openFAQs.forEach((openToggle) => {
    const wrapper = openToggle.closest('[fynd-faq-element="wrapper"]');
    closeAccordion(wrapper);
  });
}

function openAccordion(wrapper, callback) {
  const toggle = wrapper.querySelector('[fynd-faq-element="toggle"]');
  const content = wrapper.querySelector('[fynd-faq-element="content"]');
  const contentInner = wrapper.querySelector(
    '[fynd-faq-element="content-inner"]'
  );
  const xLine = toggle.querySelector('[fynd-faq-element="x-line"]');
  const yLine = toggle.querySelector('[fynd-faq-element="y-line"]');

  if (content.gsapAnimation) {
    content.gsapAnimation.kill();
  }

  const timeline = gsap.timeline({
    onComplete: () => callback && callback(),
  });

  gsap.set(content, { height: "auto", visibility: "hidden", opacity: 0 });
  const height = content.offsetHeight;
  gsap.set(content, { height: 0, visibility: "visible", opacity: 1 });

  timeline.to(xLine, { rotation: 180, duration: 0.4, ease: "power2.inOut" }, 0);
  timeline.to(yLine, { rotation: 270, duration: 0.4, ease: "power2.inOut" }, 0);
  timeline.to(
    content,
    {
      height: height,
      duration: 0.5,
      ease: "power3.inOut",
      clearProps: "height",
      onComplete: () => (content.style.height = "auto"),
    },
    0
  );
  timeline.to(
    contentInner,
    { opacity: 1, duration: 0.4, ease: "power2.out" },
    "-=0.35"
  );

  content.gsapAnimation = timeline;
  toggle.setAttribute("data-state", "open");

  const icon = toggle.querySelector('[fynd-faq-element="chevron"]');
  if (icon) {
    gsap.to(icon, { rotation: 180, duration: 0.4, ease: "back.out(1.7)" });
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

  if (content.gsapAnimation) {
    content.gsapAnimation.kill();
  }

  const height = content.offsetHeight;
  content.style.height = `${height}px`;

  const timeline = gsap.timeline({
    onComplete: () => callback && callback(),
  });

  timeline.to(xLine, { rotation: 0, duration: 0.4, ease: "power2.inOut" }, 0);
  timeline.to(yLine, { rotation: 0, duration: 0.4, ease: "power2.inOut" }, 0);
  timeline.to(
    contentInner,
    { opacity: 0, duration: 0.3, ease: "power2.in" },
    0
  );
  timeline.to(
    content,
    { height: 0, duration: 0.4, ease: "power3.inOut" },
    "-=0.25"
  );

  content.gsapAnimation = timeline;
  toggle.setAttribute("data-state", "closed");

  const icon = toggle.querySelector('[fynd-faq-element="chevron"]');
  if (icon) {
    gsap.to(icon, { rotation: 0, duration: 0.4, ease: "back.out(1.7)" });
  }
}

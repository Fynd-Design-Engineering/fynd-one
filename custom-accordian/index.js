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

    // Get the FAQ type - either "one-at-a-time" or "multiple-at-a-time"
    const faqType = groupContainer
      ? groupContainer.getAttribute("fynd-faq-type") || "one-at-a-time"
      : "one-at-a-time";

    if (wrapper.getAttribute("fynd-faq-initialopen") === "true") {
      gsap.set(content, { height: "auto", overflow: "hidden" });
      gsap.set(contentInner, { opacity: 1 });
      gsap.set(xLine, { rotation: 180 });
      gsap.set(yLine, { rotation: 270 });
      toggle.setAttribute("data-state", "open");

      updateFaqGroupImage(wrapper, groupName); // Update image on load for initial open FAQ
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

      // For "one-at-a-time" type, check if this is the last open FAQ
      if (faqType === "one-at-a-time") {
        const openFAQs = groupContainer.querySelectorAll(
          '[fynd-faq-element="wrapper"] [data-state="open"]'
        );

        if (isOpen && openFAQs.length === 1) {
          // Don't allow closing the last open FAQ in "one-at-a-time" mode
          isAnimating = false;
          return;
        }
      }

      // For "multiple-at-a-time" type, we can always toggle the current FAQ
      // For "one-at-a-time" type, we close all others when opening a new one

      if (isOpen) {
        // Always allow closing if it's open, regardless of mode
        closeAccordion(wrapper, () => {
          isAnimating = false;
        });
      } else {
        // If "one-at-a-time", close others before opening this one
        if (faqType === "one-at-a-time") {
          closeOtherAccordions(groupContainer);
        }

        openAccordion(wrapper, groupName, () => {
          isAnimating = false;
        });
      }
    });
  });
});

function openAccordion(wrapper, groupName, callback) {
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

  // Update image for the group
  updateFaqGroupImage(wrapper, groupName);
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

// Function to close all other accordions in the same group
function closeOtherAccordions(groupContainer) {
  const openFAQs = groupContainer.querySelectorAll(
    '[fynd-faq-element="wrapper"] [data-state="open"]'
  );
  openFAQs.forEach((openToggle) => {
    const wrapper = openToggle.closest('[fynd-faq-element="wrapper"]');
    closeAccordion(wrapper);
  });
}

// Function to update the group image
function updateFaqGroupImage(wrapper, groupName) {
  if (!groupName) return;

  // Find the group-level image element
  const groupImage = document.querySelector(
    `[fynd-faq-image-target="${groupName}"]`
  );
  if (!groupImage) return;

  // Find the image source inside the opened accordion
  const imageSource = wrapper.querySelector("[fynd-faq-image-source]");
  if (!imageSource) return;

  // Update the group image with the new source
  const newSrc = imageSource.getAttribute("src");
  const newSrcset = imageSource.getAttribute("srcset");

  if (newSrc) groupImage.setAttribute("src", newSrc);
  if (newSrcset) groupImage.setAttribute("srcset", "");
  //removing srcset for now
}

// Function to ensure at least one FAQ is open in "one-at-a-time" mode
function ensureOneFaqOpen(groupContainer) {
  if (!groupContainer) return;

  const faqType =
    groupContainer.getAttribute("fynd-faq-type") || "one-at-a-time";

  // Only apply this to "one-at-a-time" type
  if (faqType !== "one-at-a-time") return;

  const openFAQs = groupContainer.querySelectorAll(
    '[fynd-faq-element="wrapper"] [data-state="open"]'
  );

  // If no FAQs are open, open the first one
  if (openFAQs.length === 0) {
    const firstFaq = groupContainer.querySelector(
      '[fynd-faq-element="wrapper"]'
    );
    if (firstFaq) {
      const firstToggle = firstFaq.querySelector('[fynd-faq-element="toggle"]');
      if (firstToggle) {
        const groupName = groupContainer.getAttribute("fynd-faq-group");
        openAccordion(firstFaq, groupName);
      }
    }
  }
}

// Make sure GSAP is included in your project
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
console.log("script is loaded");
// Function to open the drawer
function openDrawer() {
  // Get all drawer elements
  const drawer = document.querySelector("[fynd-drawer]");
  const overlay = document.querySelector("[fynd-drawer-overlay]");
  const content = document.querySelector("[fynd-drawer-content]");

  // Disable scrolling on body
  document.body.style.overflow = "hidden";

  // Set initial state
  drawer.style.display = "flex";

  // Create timeline for smooth sequencing
  const tl = gsap.timeline();
  // Animate overlay first
  tl.to(overlay, {
    opacity: 1,
    duration: 0.6,
    ease: "power2.out",
  });

  // Then animate content with 0.1sec delay
  tl.to(
    content,
    {
      y: "0%",
      duration: 0.4,
      delay: 0.1,
      ease: "power3.out",
    },
    "-=0.5"
  ); // Overlap slightly with previous animation
}

// Function to close the drawer
function closeDrawer() {
  // Get all drawer elements
  const drawer = document.querySelector("[fynd-drawer]");
  const overlay = document.querySelector("[fynd-drawer-overlay]");
  const content = document.querySelector("[fynd-drawer-content]");

  // Create timeline for smooth sequencing
  const tl = gsap.timeline({
    onComplete: () => {
      // Set display to none only after all animations complete
      drawer.style.display = "none";

      // Re-enable scrolling on body
      document.body.style.overflow = "";
    },
  });

  // Animate content first
  tl.to(content, {
    y: "100%",
    duration: 0.4,
    ease: "power3.inOut",
  });

  // Then animate overlay with delay
  tl.to(
    overlay,
    {
      opacity: 0,
      duration: 0.3,
      delay: 0.3,
      ease: "power2.in",
    },
    "-=0.39"
  );
}
function updateDrawerContent(ele) {
  // Find the image source and target within the given element
  const dynamicImage = ele.querySelector("[fynd-drawer-image-source]");
  const dynamicText = ele.querySelector("[fynd-drawer-text-source]");
  const drawerImage = document.querySelector("[fynd-drawer-image-target]");
  const drawerText = document.querySelector("[fynd-drawer-text-target]");

  // Ensure both images exist before updating
  if (dynamicImage && drawerImage) {
    drawerImage.src = dynamicImage.src;
    drawerImage.srcset = dynamicImage.srcset;
    console.log(drawerImage.src);
  }
  if (dynamicText && drawerText) {
    drawerText.innerHTML = dynamicText.innerHTML;
  }
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
  closeDrawer();
  // Add click event to close button
  const closeButtons = document.querySelectorAll("[fynd-drawer-close]");
  if (closeButtons) {
    closeButtons.forEach((button) => {
      button.addEventListener("click", closeDrawer);
    });
  }
  // Add click event to open button (optional)
  const openButtons = document.querySelectorAll("[fynd-drawer-open]");
  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateDrawerContent(button);
      openDrawer();
    });
  });

  // Optional: Close drawer when clicking on overlay
  const overlay = document.querySelector("[fynd-drawer-overlay]");
  if (overlay) {
    overlay.addEventListener("click", closeDrawer);
  }
});

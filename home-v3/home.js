document.addEventListener("DOMContentLoaded", () => {
  //Onclick Open Chatboat Script
  document.querySelector('.btn_prompt').addEventListener('click', function () {
    const textarea = this.parentElement.querySelector("textarea");
    if (textarea) {
      const userMessage = textarea.value.trim();
      if (userMessage) {
        window.copilot('event', 'open');
        setTimeout(() => {
          window.copilot('event', 'sendUserMessage', { "message": userMessage });
        }, 1000)
      } else {
        console.warn("Textarea is empty. Please enter a message.");
      }
    }
  });



  //Text Typing Animation Script
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
  document.querySelectorAll(".prompt_tags .badge_style_three").forEach(badge => {
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



  //Clone Items Script
  function duplicateCarouselItems() {
    document.querySelectorAll('.brands_carousal-2, .trusted_businesses').forEach(track => {
      const duplicationBreakpointAttr = track.getAttribute('data-duplication');
      // If no attribute exists — skip this track entirely
      if (duplicationBreakpointAttr === null) return;
      const duplicationBreakpoint = parseInt(duplicationBreakpointAttr);
      // If the viewport is greater than or equal to the breakpoint — remove clones and skip
      if (window.innerWidth >= duplicationBreakpoint) {
        track.querySelectorAll('.clone').forEach(clone => clone.remove());
        return;
      }
      // Check if it already has clones — prevent stacking duplicates
      if (track.querySelector('.clone')) return;
      // Duplicate original items only
      const items = Array.from(track.children).filter(item => !item.classList.contains('clone'));
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('clone');
        track.appendChild(clone);
      });
    });
  }
  // Run on load
  duplicateCarouselItems();
  // Run on resize
  window.addEventListener("resize", () => {
    duplicateCarouselItems();
  });
});
// copilot chat section
document.addEventListener("DOMContentLoaded", function () {
  triggerCopilot();
});

function triggerCopilot() {
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
}

/**
 * Text Typing Animation Script
 * Optimized version with improved performance, error handling, and maintainability
 */

class TypingAnimation {
  constructor(selector, options = {}) {
    this.textarea = document.querySelector(selector);
    if (!this.textarea) {
      console.warn(
        `TypingAnimation: Element with selector "${selector}" not found`
      );
      return;
    }

    // Configuration
    this.config = {
      typingSpeed: options.typingSpeed || 50,
      deletingSpeed: options.deletingSpeed || 50,
      pauseAfterComplete: options.pauseAfterComplete || 1000,
      restartDelay: options.restartDelay || 500,
      cursor: options.cursor || "|",
      badgeSelector: options.badgeSelector || ".prompt_tags .badge_style_three",
      ...options,
    };

    // Parse texts from data attribute
    this.texts = this.textarea.getAttribute("data-typing")?.split("|") || [];
    if (this.texts.length === 0) {
      console.warn("TypingAnimation: No texts found in data-typing attribute");
      return;
    }

    // State management
    this.state = {
      textIndex: 0,
      charIndex: 0,
      isDeleting: false,
      isActive: true,
      userHasTyped: false,
    };

    // Timeout references for cleanup
    this.timeouts = new Set();

    this.init();
  }

  init() {
    this.bindEvents();
    this.startAnimation();
  }

  bindEvents() {
    // Handle badge clicks
    this.handleBadgeClicks();

    // Handle user input
    this.textarea.addEventListener("input", this.handleInput.bind(this));
    this.textarea.addEventListener("focus", this.handleFocus.bind(this));
    this.textarea.addEventListener("blur", this.handleBlur.bind(this));
  }

  handleBadgeClicks() {
    const badges = document.querySelectorAll(this.config.badgeSelector);
    badges.forEach((badge) => {
      badge.addEventListener("click", (event) => {
        event.preventDefault();
        this.stopAnimation();
        this.textarea.value = badge.textContent.trim();
        this.state.userHasTyped = true;
      });
    });
  }

  handleInput() {
    this.stopAnimation();
    this.state.userHasTyped = this.textarea.value.trim() !== "";
  }

  handleFocus() {
    this.stopAnimation();
    if (!this.state.userHasTyped) {
      this.textarea.value = "";
    }
  }

  handleBlur() {
    if (this.textarea.value.trim() === "") {
      this.state.userHasTyped = false;
      this.scheduleRestart();
    }
  }

  scheduleRestart() {
    const timeout = setTimeout(() => {
      this.resetState();
      this.startAnimation();
    }, this.config.restartDelay);

    this.timeouts.add(timeout);
  }

  startAnimation() {
    if (!this.state.isActive || this.state.userHasTyped) return;

    this.animate();
  }

  animate() {
    if (!this.state.isActive || this.state.userHasTyped) return;

    const currentText = this.texts[this.state.textIndex];

    if (!this.state.isDeleting) {
      this.typeCharacter(currentText);
    } else {
      this.deleteCharacter(currentText);
    }
  }

  typeCharacter(text) {
    const displayText =
      text.substring(0, this.state.charIndex) + this.config.cursor;
    this.textarea.value = displayText;
    this.state.charIndex++;

    if (this.state.charIndex > text.length) {
      this.state.isDeleting = true;
      this.scheduleNextFrame(this.config.pauseAfterComplete);
    } else {
      this.scheduleNextFrame(this.config.typingSpeed);
    }
  }

  deleteCharacter(text) {
    const displayText =
      text.substring(0, this.state.charIndex) + this.config.cursor;
    this.textarea.value = displayText;
    this.state.charIndex--;

    if (this.state.charIndex < 0) {
      this.state.isDeleting = false;
      this.state.textIndex = (this.state.textIndex + 1) % this.texts.length;
    }

    this.scheduleNextFrame(this.config.deletingSpeed);
  }

  scheduleNextFrame(delay) {
    const timeout = setTimeout(() => this.animate(), delay);
    this.timeouts.add(timeout);
  }

  stopAnimation() {
    this.state.isActive = false;
    this.clearAllTimeouts();
  }

  resetState() {
    this.state = {
      textIndex: 0,
      charIndex: 0,
      isDeleting: false,
      isActive: true,
      userHasTyped: false,
    };
  }

  clearAllTimeouts() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  // Public methods for external control
  pause() {
    this.stopAnimation();
  }

  resume() {
    if (!this.state.userHasTyped) {
      this.state.isActive = true;
      this.startAnimation();
    }
  }

  destroy() {
    this.stopAnimation();
    // Remove event listeners would require storing references
    // For now, just clear timeouts
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with default selector
  const typingAnimation = new TypingAnimation("*[data-typing]");

  // Optional: Store reference globally for external control
  window.typingAnimation = typingAnimation;
});

// Alternative direct function approach (for backward compatibility)
function initTypingAnimation(selector = "*[data-typing]", options = {}) {
  return new TypingAnimation(selector, options);
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TypingAnimation, initTypingAnimation };
}

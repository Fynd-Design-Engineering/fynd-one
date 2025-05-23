/**
 * PopupManager - A lightweight utility for managing animated popups with GSAP
 * Version: 1.0.0
 * Author: PopupManager Utility
 * License: MIT
 */

(function (global) {
  "use strict";

  // Check if GSAP is available
  if (typeof gsap === "undefined") {
    console.error(
      "PopupManager: GSAP is required. Please include GSAP before this script."
    );
    return;
  }

  class PopupManager {
    constructor() {
      this.popups = new Map();
      this.currentPopup = null;
      this.isAnimating = false;

      this.init();
    }

    init() {
      this.bindEvents();
      this.discoverPopups();
    }

    discoverPopups() {
      // Find all popup wrappers and register them
      const wrappers = document.querySelectorAll("[data-popup-wrapper]");

      if (wrappers.length === 0) {
        console.warn(
          'PopupManager: No popup wrappers found. Add [data-popup-wrapper="popup-name"] elements.'
        );
        return;
      }

      wrappers.forEach((wrapper) => {
        const popupName = wrapper.getAttribute("data-popup-wrapper");

        // Validate attribute value
        if (!popupName || popupName.trim() === "") {
          console.error(
            "PopupManager: [data-popup-wrapper] element found with empty or missing value",
            wrapper
          );
          return;
        }

        const cleanName = popupName.trim();

        if (!this.popups.has(cleanName)) {
          this.registerPopup(cleanName);
        }
      });
    }

    registerPopup(popupName) {
      // Validate popup name
      if (
        !popupName ||
        typeof popupName !== "string" ||
        popupName.trim() === ""
      ) {
        console.error("PopupManager: Invalid popup name provided");
        return;
      }

      const cleanName = popupName.trim();

      const elements = {
        triggers: document.querySelectorAll(
          `[data-popup-trigger="${cleanName}"]`
        ),
        wrapper: document.querySelector(`[data-popup-wrapper="${cleanName}"]`),
        contents: document.querySelector(
          `[data-popup-contents="${cleanName}"]`
        ),
        overlay: document.querySelector(`[data-popup-overlay="${cleanName}"]`),
        closers: document.querySelectorAll(`[data-popup-close="${cleanName}"]`),
      };

      // Comprehensive validation of required elements
      const errors = [];

      if (!elements.wrapper) {
        errors.push(`[data-popup-wrapper="${cleanName}"]`);
      }

      if (!elements.contents) {
        errors.push(`[data-popup-contents="${cleanName}"]`);
      }

      if (!elements.overlay) {
        errors.push(`[data-popup-overlay="${cleanName}"]`);
      }

      if (errors.length > 0) {
        console.error(
          `PopupManager: Missing required elements for popup "${cleanName}": ${errors.join(
            ", "
          )}`
        );
        return;
      }

      // Validate element structure
      if (!elements.wrapper.contains(elements.overlay)) {
        console.warn(
          `PopupManager: [data-popup-overlay="${cleanName}"] should be inside [data-popup-wrapper="${cleanName}"]`
        );
      }

      if (!elements.wrapper.contains(elements.contents)) {
        console.warn(
          `PopupManager: [data-popup-contents="${cleanName}"] should be inside [data-popup-wrapper="${cleanName}"]`
        );
      }

      // Check for triggers (optional but warn if none found)
      if (elements.triggers.length === 0) {
        console.warn(
          `PopupManager: No triggers found for popup "${cleanName}". Add [data-popup-trigger="${cleanName}"] elements.`
        );
      }

      // Initialize popup state
      this.initializePopupState(elements);

      // Store popup configuration
      this.popups.set(cleanName, elements);

      // Bind popup-specific events
      this.bindPopupEvents(cleanName, elements);
    }

    initializePopupState(elements) {
      try {
        // Hide wrapper initially
        gsap.set(elements.wrapper, { display: "none" });

        // Set initial animation states
        gsap.set(elements.overlay, { opacity: 0 });
        gsap.set(elements.contents, { opacity: 0, scale: 0.95 });

        if (elements.closers.length > 0) {
          gsap.set(elements.closers, { opacity: 0 });
        }
      } catch (error) {
        console.error(
          "PopupManager: Error initializing popup state:",
          error,
          elements
        );
        throw error;
      }
    }

    bindEvents() {
      // Global ESC key handler
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.currentPopup) {
          this.closePopup(this.currentPopup);
        }
      });

      // Use delegation for dynamically added triggers
      document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-popup-trigger]");
        if (trigger) {
          const popupName = trigger.getAttribute("data-popup-trigger");

          // Validate trigger attribute
          if (!popupName || popupName.trim() === "") {
            console.error(
              "PopupManager: [data-popup-trigger] element found with empty or missing value",
              trigger
            );
            return;
          }

          e.preventDefault();
          const cleanName = popupName.trim();

          // Check if popup exists before trying to open
          if (!this.popups.has(cleanName)) {
            console.error(
              `PopupManager: Popup "${cleanName}" not registered. Ensure required elements exist.`
            );
            // Try to auto-discover in case popup was added dynamically
            this.discoverPopups();

            // Check again after discovery
            if (!this.popups.has(cleanName)) {
              return;
            }
          }

          this.openPopup(cleanName);
        }
      });
    }

    bindPopupEvents(popupName, elements) {
      // Close button handlers
      elements.closers.forEach((closer) => {
        // Validate closer element has correct attribute value
        const closerValue = closer.getAttribute("data-popup-close");
        if (closerValue !== popupName) {
          console.warn(
            `PopupManager: Close button has mismatched popup name. Expected "${popupName}", got "${closerValue}"`,
            closer
          );
        }

        closer.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.closePopup(popupName);
        });
      });

      // Overlay click handler
      elements.overlay.addEventListener("click", (e) => {
        if (e.target === elements.overlay) {
          this.closePopup(popupName);
        }
      });

      // Prevent clicks on content from closing popup
      elements.contents.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    openPopup(popupName) {
      // Validate input
      if (
        !popupName ||
        typeof popupName !== "string" ||
        popupName.trim() === ""
      ) {
        console.error(
          "PopupManager: Invalid popup name provided to openPopup()"
        );
        return;
      }

      if (this.isAnimating) {
        console.warn(
          "PopupManager: Animation in progress, ignoring open request"
        );
        return;
      }

      const cleanName = popupName.trim();
      const popup = this.popups.get(cleanName);

      if (!popup) {
        console.error(
          `PopupManager: Popup "${cleanName}" not found or not properly registered`
        );
        return;
      }

      // Validate popup elements still exist in DOM
      if (!document.contains(popup.wrapper)) {
        console.error(
          `PopupManager: Popup wrapper for "${cleanName}" no longer exists in DOM`
        );
        this.popups.delete(cleanName);
        return;
      }

      // Close current popup if one is open
      if (this.currentPopup && this.currentPopup !== cleanName) {
        this.closePopup(this.currentPopup, true);
      }

      this.isAnimating = true;
      this.currentPopup = cleanName;

      try {
        // Show wrapper
        gsap.set(popup.wrapper, { display: "block" });

        // Create animation timeline
        const tl = gsap.timeline({
          onComplete: () => {
            this.isAnimating = false;
            this.dispatchEvent("popupOpened", cleanName);
          },
          onError: (error) => {
            console.error(
              `PopupManager: Animation error for popup "${cleanName}":`,
              error
            );
            this.isAnimating = false;
          },
        });

        // Animate overlay
        tl.to(popup.overlay, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        // Animate contents (slightly overlapping)
        tl.to(
          popup.contents,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
          },
          "-=0.1"
        );

        // Animate close buttons if they exist
        if (popup.closers.length > 0) {
          tl.to(
            popup.closers,
            {
              opacity: 1,
              duration: 0.2,
              ease: "power2.out",
            },
            "-=0.2"
          );
        }

        // Add body class for potential styling
        document.body.classList.add("popup-open", `popup-${cleanName}-open`);
      } catch (error) {
        console.error(
          `PopupManager: Error opening popup "${cleanName}":`,
          error
        );
        this.isAnimating = false;
        // Cleanup on error
        gsap.set(popup.wrapper, { display: "none" });
      }
    }

    closePopup(popupName, immediate = false) {
      // Validate input
      if (
        !popupName ||
        typeof popupName !== "string" ||
        popupName.trim() === ""
      ) {
        console.error(
          "PopupManager: Invalid popup name provided to closePopup()"
        );
        return;
      }

      if (!immediate && this.isAnimating) {
        console.warn(
          "PopupManager: Animation in progress, ignoring close request"
        );
        return;
      }

      const cleanName = popupName.trim();
      const popup = this.popups.get(cleanName);

      if (!popup) {
        console.warn(
          `PopupManager: Cannot close popup "${cleanName}" - not found`
        );
        return;
      }

      // Validate popup elements still exist in DOM
      if (!document.contains(popup.wrapper)) {
        console.warn(
          `PopupManager: Popup wrapper for "${cleanName}" no longer exists in DOM`
        );
        this.popups.delete(cleanName);
        return;
      }

      this.isAnimating = true;

      try {
        // Create reverse animation timeline
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(popup.wrapper, { display: "none" });
            this.isAnimating = false;
            this.currentPopup = null;
            this.dispatchEvent("popupClosed", cleanName);
          },
          onError: (error) => {
            console.error(
              `PopupManager: Animation error while closing popup "${cleanName}":`,
              error
            );
            this.isAnimating = false;
            this.currentPopup = null;
          },
        });

        // Animate close buttons first
        if (popup.closers.length > 0) {
          tl.to(popup.closers, {
            opacity: 0,
            duration: 0.15,
            ease: "power2.in",
          });
        }

        // Animate contents
        tl.to(
          popup.contents,
          {
            opacity: 0,
            scale: 0.95,
            duration: 0.25,
            ease: "power2.in",
          },
          immediate ? 0 : "-=0.05"
        );

        // Animate overlay last
        tl.to(
          popup.overlay,
          {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          },
          immediate ? 0 : "-=0.1"
        );

        // Remove body classes
        document.body.classList.remove("popup-open", `popup-${cleanName}-open`);
      } catch (error) {
        console.error(
          `PopupManager: Error closing popup "${cleanName}":`,
          error
        );
        this.isAnimating = false;
        this.currentPopup = null;
        // Ensure popup is hidden on error
        gsap.set(popup.wrapper, { display: "none" });
      }
    }

    closeAllPopups() {
      if (this.currentPopup) {
        this.closePopup(this.currentPopup);
      }
    }

    dispatchEvent(eventName, popupName) {
      const event = new CustomEvent(eventName, {
        detail: { popupName },
      });
      document.dispatchEvent(event);
    }

    // Public API methods
    open(popupName) {
      if (!popupName) {
        console.error("PopupManager.open(): Popup name is required");
        return;
      }
      this.openPopup(popupName);
    }

    close(popupName) {
      if (popupName) {
        this.closePopup(popupName);
      } else {
        this.closeAllPopups();
      }
    }

    refresh() {
      try {
        this.discoverPopups();
      } catch (error) {
        console.error("PopupManager.refresh(): Error during refresh:", error);
      }
    }

    destroy() {
      try {
        // Kill any running animations
        gsap.killTweensOf("*");

        // Clean up event listeners and timelines
        this.popups.clear();
        this.currentPopup = null;
        this.isAnimating = false;

        // Remove body classes
        document.body.classList.remove("popup-open");
        const popupClasses = Array.from(document.body.classList).filter(
          (cls) => cls.startsWith("popup-") && cls.endsWith("-open")
        );
        popupClasses.forEach((cls) => document.body.classList.remove(cls));
      } catch (error) {
        console.error("PopupManager.destroy(): Error during cleanup:", error);
      }
    }

    // Utility method to check if a popup exists
    exists(popupName) {
      if (!popupName || typeof popupName !== "string") {
        return false;
      }
      return this.popups.has(popupName.trim());
    }

    // Get list of registered popup names
    getRegisteredPopups() {
      return Array.from(this.popups.keys());
    }
  }

  // Auto-initialize when DOM is ready
  function initializePopupManager() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        global.PopupManager = new PopupManager();
      });
    } else {
      global.PopupManager = new PopupManager();
    }
  }

  // Initialize immediately
  initializePopupManager();

  // Expose PopupManager constructor for manual instantiation if needed
  global.PopupManagerClass = PopupManager;
})(window);

/**
 * Usage Examples:
 *
 * 1. Basic HTML Structure:
 * <button data-popup-trigger="example">Open Popup</button>
 *
 * <div data-popup-wrapper="example">
 *   <div data-popup-overlay="example"></div>
 *   <div data-popup-contents="example">
 *     <h2>Popup Title</h2>
 *     <p>Popup content goes here...</p>
 *     <button data-popup-close="example">Close</button>
 *   </div>
 * </div>
 *
 * 2. JavaScript API:
 * PopupManager.open('example');        // Open popup
 * PopupManager.close('example');       // Close specific popup
 * PopupManager.close();                // Close current popup
 * PopupManager.refresh();              // Re-scan for new popups
 *
 * 3. Events:
 * document.addEventListener('popupOpened', (e) => {
 *   console.log('Popup opened:', e.detail.popupName);
 * });
 *
 * document.addEventListener('popupClosed', (e) => {
 *   console.log('Popup closed:', e.detail.popupName);
 * });
 *
 * 4. Include via CDN:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
 * <script src="path/to/popup-manager.js"></script>
 */

// Page Loading Progress System
class PageLoader {
  constructor() {
    this.progressBar = null;
    this.progressText = null;
    this.loadingOverlay = null;
    this.currentProgress = 0;
    this.init();
  }

  init() {
    this.createLoader();
    this.interceptLinks();
    this.monitorPageLoad();
  }

  createLoader() {
    // Find existing loader or create overlay
    this.loaderFill = document.querySelector(".loader-fill[loader-fill]");
    this.clickLoader = document.querySelector(".click-loader");

    if (!this.loaderFill) {
      console.warn(
        "⚠️ Loader element not found. Make sure your HTML includes the .click-loader structure"
      );
      return;
    }

    // Create overlay if click-loader isn't already positioned fixed
    if (
      !this.clickLoader.style.position &&
      getComputedStyle(this.clickLoader).position !== "fixed"
    ) {
      this.loadingOverlay = document.createElement("div");
      this.loadingOverlay.id = "page-loading-overlay";
      this.loadingOverlay.innerHTML = this.clickLoader.outerHTML;

      // Add overlay styles
      const styles = `
                <style>
                    #page-loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.95);
                        z-index: 9999;
                        display: none;
                        backdrop-filter: blur(5px);
                    }

                    #page-loading-overlay .click-loader {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 300px;
                        height: 5px;
                    }

                    .click-loader .loader-fill {
                        height: 100%;
                        width: 0%;
                        border-radius: 4px;
                    }
                        
                </style>
            `;

      document.head.insertAdjacentHTML("beforeend", styles);
      document.body.appendChild(this.loadingOverlay);

      // Update reference to the new loader in overlay
      this.loaderFill = this.loadingOverlay.querySelector(
        ".loader-fill[loader-fill]"
      );
    } else {
      // Use existing loader, just hide it initially
      this.clickLoader.style.display = "none";
    }

    // Initialize loader fill width
    this.loaderFill.style.width = "0%";
  }

  interceptLinks() {
    // Intercept all link clicks
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (link && !link.hasAttribute("data-no-loader")) {
        const href = link.getAttribute("href");

        // Skip external links, anchors, and javascript: links
        if (
          href.startsWith("http") ||
          href.startsWith("#") ||
          href.startsWith("javascript:")
        ) {
          return;
        }

        e.preventDefault();
        this.navigateWithProgress(href);
      }
    });
  }

  navigateWithProgress(url) {
    console.log(`🚀 Starting navigation to: ${url}`);
    this.showLoader();
    this.simulateProgress(url);
  }

  showLoader() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = "block";
    } else {
      this.clickLoader.style.display = "block";
    }
    this.currentProgress = 0;
    this.updateProgress(0, "Initializing...");
    console.log("📊 Loading overlay displayed");
  }

  hideLoader() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = "none";
    } else {
      this.clickLoader.style.display = "none";
    }
    console.log("✅ Loading overlay hidden");
  }

  updateProgress(percent, message = "") {
    this.currentProgress = Math.min(percent, 100);

    // Update your loader-fill div width
    if (this.loaderFill) {
      this.loaderFill.style.width = this.currentProgress + "%";
    }

    const displayMessage =
      message || `Loading... ${Math.round(this.currentProgress)}%`;
    console.log(
      `📈 Progress: ${Math.round(this.currentProgress)}% - ${displayMessage}`
    );
  }

  simulateProgress(url) {
    const stages = [
      { progress: 10, message: "Preparing request...", delay: 100 },
      { progress: 25, message: "Connecting to server...", delay: 150 },
      { progress: 40, message: "Sending request...", delay: 100 },
      { progress: 60, message: "Receiving response...", delay: 150 },
      { progress: 80, message: "Processing content...", delay: 50 },
      { progress: 95, message: "Finalizing...", delay: 50 },
      { progress: 100, message: "Complete!", delay: 100 },
    ];

    let currentStage = 0;

    const processStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        this.updateProgress(stage.progress, stage.message);

        setTimeout(() => {
          currentStage++;
          processStage();
        }, stage.delay);
      } else {
        // Navigation complete
        setTimeout(() => {
          console.log(`🎯 Navigation completed, redirecting to: ${url}`);
          window.location.href = url;
        }, 200);
      }
    };

    processStage();
  }

  // Monitor actual page loading events
  monitorPageLoad() {
    // Track when page starts loading
    window.addEventListener("beforeunload", () => {
      console.log("🔄 Page unloading...");
    });

    // Track when new page loads
    window.addEventListener("load", () => {
      console.log("✨ New page fully loaded");
      this.hideLoader();
    });

    // Track DOM content loaded
    document.addEventListener("DOMContentLoaded", () => {
      console.log("📄 DOM content loaded");
    });

    // Track navigation timing (if supported)
    if ("performance" in window) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const timing = performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          console.log(`⏱️ Total page load time: ${loadTime}ms`);

          // Log detailed timing breakdown
          console.log("📊 Detailed timing breakdown:");
          console.log(
            `  - DNS lookup: ${
              timing.domainLookupEnd - timing.domainLookupStart
            }ms`
          );
          console.log(
            `  - TCP connection: ${timing.connectEnd - timing.connectStart}ms`
          );
          console.log(
            `  - Request: ${timing.responseStart - timing.requestStart}ms`
          );
          console.log(
            `  - Response: ${timing.responseEnd - timing.responseStart}ms`
          );
          console.log(
            `  - DOM processing: ${timing.domComplete - timing.domLoading}ms`
          );
        }, 100);
      });
    }
  }
}

// Initialize the page loader when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new PageLoader();
    console.log("🔧 PageLoader initialized");
  });
} else {
  new PageLoader();
  console.log("🔧 PageLoader initialized");
}

// Optional: Add method to manually trigger loading for programmatic navigation
window.showPageLoader = function (url) {
  if (window.pageLoaderInstance) {
    window.pageLoaderInstance.navigateWithProgress(url);
  }
};

// Store instance globally for manual control
window.addEventListener("load", () => {
  if (!window.pageLoaderInstance) {
    window.pageLoaderInstance = new PageLoader();
  }
});

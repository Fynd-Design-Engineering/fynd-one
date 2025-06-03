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
    // Create loading overlay
    this.loadingOverlay = document.createElement("div");
    this.loadingOverlay.id = "page-loading-overlay";
    this.loadingOverlay.innerHTML = `
            <div class="loader-container">
                <div class="loader-content">
                    <div class="spinner"></div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <div class="progress-text" id="progress-text">Loading... 0%</div>
                    </div>
                </div>
            </div>
        `;

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

                .loader-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                }

                .loader-content {
                    text-align: center;
                    padding: 20px;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .progress-container {
                    width: 300px;
                    margin: 0 auto;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background-color: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3498db, #2ecc71);
                    width: 0%;
                    transition: width 0.3s ease;
                    border-radius: 4px;
                }

                .progress-text {
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    color: #666;
                    font-weight: 500;
                }
            </style>
        `;

    document.head.insertAdjacentHTML("beforeend", styles);
    document.body.appendChild(this.loadingOverlay);

    this.progressBar = document.getElementById("progress-fill");
    this.progressText = document.getElementById("progress-text");
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
    this.loadingOverlay.style.display = "block";
    this.currentProgress = 0;
    this.updateProgress(0, "Initializing...");
    console.log("📊 Loading overlay displayed");
  }

  hideLoader() {
    this.loadingOverlay.style.display = "none";
    console.log("✅ Loading overlay hidden");
  }

  updateProgress(percent, message = "") {
    this.currentProgress = Math.min(percent, 100);
    this.progressBar.style.width = this.currentProgress + "%";

    const displayMessage =
      message || `Loading... ${Math.round(this.currentProgress)}%`;
    this.progressText.textContent = displayMessage;

    console.log(
      `📈 Progress: ${Math.round(this.currentProgress)}% - ${displayMessage}`
    );
  }

  simulateProgress(url) {
    const stages = [
      { progress: 10, message: "Preparing request...", delay: 100 },
      { progress: 25, message: "Connecting to server...", delay: 200 },
      { progress: 40, message: "Sending request...", delay: 150 },
      { progress: 60, message: "Receiving response...", delay: 300 },
      { progress: 80, message: "Processing content...", delay: 200 },
      { progress: 95, message: "Finalizing...", delay: 150 },
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

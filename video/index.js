function ensureVideoAttributes(videoElement) {
  // Add autoplay attribute if not present
  if (!videoElement.hasAttribute("autoplay")) {
    videoElement.setAttribute("autoplay", "");
    videoElement.autoplay = true; // Set property as well
  }

  // Add loop attribute if not present
  if (!videoElement.hasAttribute("loop")) {
    videoElement.setAttribute("loop", "");
    videoElement.loop = true; // Set property as well
  }

  // Add muted attribute if not present
  if (!videoElement.hasAttribute("muted")) {
    videoElement.setAttribute("muted", "");
    videoElement.muted = true; // Set property as well
  }

  // Add playsinline attribute if not present (important for iOS)
  if (!videoElement.hasAttribute("playsinline")) {
    videoElement.setAttribute("playsinline", "");
    videoElement.playsInline = true; // Set property as well
  }
}

function loadResponsiveVideo(videoElement) {
  // Ensure required attributes are present
  ensureVideoAttributes(videoElement);

  const screenWidth = window.innerWidth;

  // Store current time and playing state
  const currentTime = videoElement.currentTime || 0;
  const wasPlaying = !videoElement.paused;

  // Clear existing sources
  videoElement.innerHTML = "";

  if (screenWidth >= 991) {
    // Desktop video sources
    const desktopMp4 = videoElement.getAttribute("desktop-mp4");
    const desktopWebm = videoElement.getAttribute("desktop-webm");

    if (desktopWebm) {
      const webmSource = document.createElement("source");
      webmSource.src = desktopWebm;
      webmSource.type = "video/webm";
      videoElement.appendChild(webmSource);
    }

    if (desktopMp4) {
      const mp4Source = document.createElement("source");
      mp4Source.src = desktopMp4;
      mp4Source.type = "video/mp4";
      videoElement.appendChild(mp4Source);
    }
  } else {
    // Mobile video sources
    const mobileMp4 = videoElement.getAttribute("mobile-mp4");
    const mobileWebm = videoElement.getAttribute("mobile-webm");

    if (mobileWebm) {
      const webmSource = document.createElement("source");
      webmSource.src = mobileWebm;
      webmSource.type = "video/webm";
      videoElement.appendChild(webmSource);
    }

    if (mobileMp4) {
      const mp4Source = document.createElement("source");
      mp4Source.src = mobileMp4;
      mp4Source.type = "video/mp4";
      videoElement.appendChild(mp4Source);
    }
  }

  // Add fallback text
  const fallbackText = document.createTextNode(
    "Your browser does not support the video tag."
  );
  videoElement.appendChild(fallbackText);

  // Reload the video
  videoElement.load();

  // Restore playback state and ensure autoplay works
  videoElement.addEventListener(
    "loadeddata",
    function () {
      videoElement.currentTime = currentTime;

      // Force play attempt for autoplay
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video autoplay successful");
          })
          .catch((e) => {
            console.log("Autoplay prevented:", e);
            // Try to play again after user interaction
            document.addEventListener(
              "click",
              function tryPlayAgain() {
                videoElement
                  .play()
                  .then(() => {
                    document.removeEventListener("click", tryPlayAgain);
                  })
                  .catch(() => {});
              },
              { once: true }
            );
          });
      }
    },
    { once: true }
  );
}

function loadAllResponsiveVideos() {
  const videos = document.querySelectorAll("[loop-video]");
  videos.forEach((video) => {
    // Ensure attributes are set before loading
    ensureVideoAttributes(video);
    loadResponsiveVideo(video);
  });
}

// Function to force play all videos (useful for testing)
function forcePlayAllVideos() {
  const videos = document.querySelectorAll("[loop-video]");
  videos.forEach((video) => {
    if (video.paused) {
      video.play().catch((e) => console.log("Play failed for video:", e));
    }
  });
}

// Function to initialize all loop-video elements with required attributes
function initializeLoopVideos() {
  const videos = document.querySelectorAll("[loop-video]");
  videos.forEach((video) => {
    ensureVideoAttributes(video);

    // Add event listeners for better autoplay handling
    video.addEventListener("canplay", function () {
      if (video.autoplay && video.paused) {
        video.play().catch((e) => console.log("Canplay autoplay failed:", e));
      }
    });

    // Ensure loop works even if attribute doesn't
    video.addEventListener("ended", function () {
      if (video.loop) {
        video.currentTime = 0;
        video.play().catch((e) => console.log("Loop play failed:", e));
      }
    });
  });
}

// Initialize attributes as soon as possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initializeLoopVideos();
    loadAllResponsiveVideos();
  });
} else {
  // DOM is already loaded
  initializeLoopVideos();
  loadAllResponsiveVideos();
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener("resize", function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    const videos = document.querySelectorAll("[loop-video]");
    const screenWidth = window.innerWidth;

    videos.forEach((video) => {
      const currentSrc = video.querySelector("source")?.src || "";

      // Only reload if we need to switch between desktop/mobile
      const shouldShowDesktop = screenWidth >= 991;
      const isShowingDesktop =
        currentSrc.includes(video.getAttribute("desktop-mp4")) ||
        currentSrc.includes(video.getAttribute("desktop-webm"));

      if (shouldShowDesktop !== isShowingDesktop) {
        loadResponsiveVideo(video);
      }
    });
  }, 250);
});

// Handle orientation change for mobile devices
window.addEventListener("orientationchange", function () {
  setTimeout(loadAllResponsiveVideos, 100);
});

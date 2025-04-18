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




  // Custom Video Script (Optimized)
  const videoWrappers = document.querySelectorAll('div[src-webm][src-mp4]');
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  let windowHasLoaded = false;
  let isMobileViewport = window.innerWidth <= 767;

  // Function to set poster for each video
  function setVideoPosters() {
    videoWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video');
      if (!video) return;
      const poster = isMobileViewport
        ? wrapper.getAttribute('mobile-video-poster') || wrapper.getAttribute('video-poster')
        : wrapper.getAttribute('video-poster');
      if (poster) video.setAttribute('poster', poster);
    });
  }

  // Function to load video sources dynamically
  function loadVideo(wrapper, video, playBehavior, threshold, observer) {
    if (video.dataset.loaded === 'true') return;
    video.dataset.loaded = 'true';

    const mp4Src = isMobileViewport
      ? wrapper.getAttribute('mobile-src-mp4') || wrapper.getAttribute('src-mp4')
      : wrapper.getAttribute('src-mp4');

    const webmSrc = isMobileViewport
      ? wrapper.getAttribute('mobile-src-webm') || wrapper.getAttribute('src-webm')
      : wrapper.getAttribute('src-webm');

    if (mp4Src) {
      const mp4Source = document.createElement('source');
      mp4Source.setAttribute('src', mp4Src);
      mp4Source.setAttribute('type', 'video/mp4; codecs="hvc1"');
      video.appendChild(mp4Source);
    }

    if (webmSrc) {
      const webmSource = document.createElement('source');
      webmSource.setAttribute('src', webmSrc);
      webmSource.setAttribute('type', 'video/webm');
      video.appendChild(webmSource);
    }

    video.load();

    video.oncanplay = () => {
      const shouldAutoPlay = isMobileDevice || playBehavior === 'autoplay' || video.hasAttribute('autoplay');
      if (shouldAutoPlay) {
        video.muted = true;
        video.play().catch(() => { });
      }
    };

    if (observer) observer.unobserve(wrapper);
  }

  // Set posters immediately
  setVideoPosters();

  // On full window load
  window.addEventListener('load', () => {
    windowHasLoaded = true;

    videoWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video');
      if (!video || video.dataset.loaded === 'true') return;

      const playBehavior = wrapper.getAttribute('data-play');
      const threshold = parseFloat(wrapper.getAttribute('threshold') || '0');

      // Delay for media_card videos
      if (video.closest('.media_card')) {
        setTimeout(() => {
          loadVideo(wrapper, video, playBehavior);
        }, 1000);
      } else {
        // Lazy load with IntersectionObserver
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && windowHasLoaded) {
              loadVideo(wrapper, video, playBehavior, threshold, obs);
            }
          });
        }, { threshold });
        observer.observe(wrapper);
      }

      // Optional: hover-based play on desktop
      if (playBehavior === 'on-hover' && !isMobileDevice) {
        wrapper.addEventListener('mouseenter', () => {
          if (video.dataset.loaded === 'true') video.play();
        });
        wrapper.addEventListener('mouseleave', () => {
          if (video.dataset.loaded === 'true') video.pause();
        });
      }
    });
  });

  // Handle viewport resize: update posters and reload videos
  window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 767;
    if (newIsMobile === isMobileViewport) return; // No viewport change — skip
    isMobileViewport = newIsMobile;

    setVideoPosters();

    videoWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video');
      if (!video) return;

      // Clear existing sources
      while (video.firstChild) {
        video.removeChild(video.firstChild);
      }

      // Add new sources
      const mp4Src = isMobileViewport
        ? wrapper.getAttribute('mobile-src-mp4') || wrapper.getAttribute('src-mp4')
        : wrapper.getAttribute('src-mp4');

      const webmSrc = isMobileViewport
        ? wrapper.getAttribute('mobile-src-webm') || wrapper.getAttribute('src-webm')
        : wrapper.getAttribute('src-webm');

      if (mp4Src) {
        const mp4Source = document.createElement('source');
        mp4Source.setAttribute('src', mp4Src);
        mp4Source.setAttribute('type', 'video/mp4; codecs="hvc1"');
        video.appendChild(mp4Source);
      }

      if (webmSrc) {
        const webmSource = document.createElement('source');
        webmSource.setAttribute('src', webmSrc);
        webmSource.setAttribute('type', 'video/webm');
        video.appendChild(webmSource);
      }

      video.load();
    });
  });



  //Clone Items Script
  document.addEventListener("DOMContentLoaded", () => {
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
});
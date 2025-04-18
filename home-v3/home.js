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




  //Custom Video Script
  const videoWrappers = document.querySelectorAll('div[src-webm][src-mp4]');
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  let windowHasLoaded = false;
  let currentIsMobileViewport = window.innerWidth <= 767;
  // Step 1: Set poster immediately
  videoWrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const isMobileViewport = window.innerWidth <= 767;
    const poster = isMobileViewport
      ? wrapper.getAttribute('mobile-video-poster') || wrapper.getAttribute('video-poster')
      : wrapper.getAttribute('video-poster');
    if (video && poster) {
      video.setAttribute('poster', poster);
    }
  });
  // Step 2: After window fully loaded
  window.addEventListener('load', () => {
    windowHasLoaded = true;
    videoWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video');
      if (!video || video.dataset.loaded === 'true' || video.dataset.observing === 'true') return;
      const isMobileViewport = window.innerWidth <= 767;
      const mp4Src = isMobileViewport
        ? wrapper.getAttribute('mobile-src-mp4') || wrapper.getAttribute('src-mp4')
        : wrapper.getAttribute('src-mp4');
      const webmSrc = isMobileViewport
        ? wrapper.getAttribute('mobile-src-webm') || wrapper.getAttribute('src-webm')
        : wrapper.getAttribute('src-webm');
      const playBehavior = wrapper.getAttribute('data-play');
      const threshold = parseFloat(wrapper.getAttribute('threshold') || '0');
      const shouldAutoPlay =
        isMobileDevice || playBehavior === 'autoplay' || video.hasAttribute('autoplay');
      const loadVideo = () => {
        if (video.dataset.loaded === 'true') return;
        video.dataset.loaded = 'true';
        if (mp4Src) {
          const mp4Source = document.createElement('source');
          mp4Source.src = mp4Src;
          mp4Source.type = 'video/mp4; codecs="hvc1"';
          video.appendChild(mp4Source);
        }
        if (webmSrc) {
          const webmSource = document.createElement('source');
          webmSource.src = webmSrc;
          webmSource.type = 'video/webm';
          video.appendChild(webmSource);
        }
        video.load();
        video.oncanplay = () => {
          if (shouldAutoPlay) {
            video.muted = true;
            video.play().catch(() => { });
          }
        };
      };
      // Special case for videos inside .media_card: delay
      if (video.closest('.media_card')) {
        setTimeout(() => {
          loadVideo();
        }, 1000);
      } else {
        // Lazy load on intersection
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && windowHasLoaded) {
              loadVideo();
              obs.unobserve(wrapper);
            }
          });
        }, { threshold });
        observer.observe(wrapper);
        video.dataset.observing = 'true';
      }
      // Optional: hover-based play for desktop
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
  // Step 3: Watch for resize and update sources & poster dynamically
  window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 767;
    if (newIsMobile !== currentIsMobileViewport) {
      currentIsMobileViewport = newIsMobile;
      videoWrappers.forEach(wrapper => {
        const video = wrapper.querySelector('video');
        if (!video) return;
        // Update poster
        const newPoster = newIsMobile
          ? wrapper.getAttribute('mobile-video-poster') || wrapper.getAttribute('video-poster')
          : wrapper.getAttribute('video-poster');
        if (newPoster) {
          video.setAttribute('poster', newPoster);
        }
        // Clear existing sources
        while (video.firstChild) {
          video.removeChild(video.firstChild);
        }
        // Add new sources
        const newMp4Src = newIsMobile
          ? wrapper.getAttribute('mobile-src-mp4') || wrapper.getAttribute('src-mp4')
          : wrapper.getAttribute('src-mp4');
        const newWebmSrc = newIsMobile
          ? wrapper.getAttribute('mobile-src-webm') || wrapper.getAttribute('src-webm')
          : wrapper.getAttribute('src-webm');
        if (newMp4Src) {
          const mp4Source = document.createElement('source');
          mp4Source.src = newMp4Src;
          mp4Source.type = 'video/mp4; codecs="hvc1"';
          video.appendChild(mp4Source);
        }
        if (newWebmSrc) {
          const webmSource = document.createElement('source');
          webmSource.src = newWebmSrc;
          webmSource.type = 'video/webm';
          video.appendChild(webmSource);
        }
        video.load();
      });
    }
  });
});
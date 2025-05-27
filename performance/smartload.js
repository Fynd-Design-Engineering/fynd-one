(function () {
  "use strict";

  const preloadedPages = new Set();

  // Preload function that handles cross-origin
  function preloadPage(url) {
    // Skip if already preloaded
    if (preloadedPages.has(url)) return;

    try {
      // For same-origin pages, use prefetch
      if (isSameOrigin(url)) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        document.head.appendChild(link);
        preloadedPages.add(url);
      } else {
        // For cross-origin, use dns-prefetch and preconnect
        preloadCrossOrigin(url);
      }
    } catch (e) {
      console.log("Preload failed for:", url);
    }
  }

  // Check if URL is same origin
  function isSameOrigin(url) {
    try {
      const link = document.createElement("a");
      link.href = url;
      return link.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  // Handle cross-origin preloading
  function preloadCrossOrigin(url) {
    try {
      const link = document.createElement("a");
      link.href = url;
      const origin = link.origin;

      if (!preloadedPages.has(origin)) {
        // DNS prefetch for faster connection
        const dnsLink = document.createElement("link");
        dnsLink.rel = "dns-prefetch";
        dnsLink.href = origin;
        document.head.appendChild(dnsLink);

        // Preconnect for even faster loading
        const preconnectLink = document.createElement("link");
        preconnectLink.rel = "preconnect";
        preconnectLink.href = origin;
        document.head.appendChild(preconnectLink);

        preloadedPages.add(origin);
      }
    } catch (e) {
      console.log("Cross-origin preload failed for:", url);
    }
  }

  // Setup hover preloading
  function setupHoverPreloading() {
    document.addEventListener("mouseover", function (e) {
      if (e.target.tagName === "A" && e.target.href) {
        const url = e.target.href;

        // Add small delay to avoid unnecessary preloads
        setTimeout(function () {
          preloadPage(url);
        }, 50);
      }
    });
  }

  // Preload pages when they come into viewport
  function setupViewportPreloading() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.target.tagName === "A") {
            setTimeout(function () {
              preloadPage(entry.target.href);
            }, 200);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all links
    document.querySelectorAll("a[href]").forEach(function (link) {
      observer.observe(link);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    setupHoverPreloading();
    setupViewportPreloading();

    // Preload important pages after a delay
    setTimeout(function () {
      const importantLinks = document.querySelectorAll(
        "nav a, .menu a, .main-nav a"
      );
      importantLinks.forEach(function (link) {
        if (link.href) {
          preloadPage(link.href);
        }
      });
    }, 1000);
  }
})();

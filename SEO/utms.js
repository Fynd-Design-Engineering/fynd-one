/**
 * Optimized UTM Tracker
 * Handles device detection and link updating with improved performance
 */

// Configuration constants
const UTM_CONFIG = {
  OPTIONAL_PROPERTIES: [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_source_platform",
    "utm_term",
  ],
  EXCLUDED_PROTOCOLS: ["#", "mailto:", "tel:", "javascript:", "data:"],
  TABLET_MIN_WIDTH: 768,
  MOBILE_MAX_WIDTH: 768,
  DETAILED_MOBILE_MAX: 480,
  DETAILED_TABLET_MAX: 1024,
  RESIZE_DEBOUNCE: 250,
  DOM_UPDATE_DEBOUNCE: 100,
  INIT_DELAY: 100,
};

// Environment detection based on domain
const isProduction = () => window.location.hostname.includes(".com");

// Device detection patterns
const DEVICE_PATTERNS = {
  mobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i,
  tablet: /ipad|android(?!.*mobile)|tablet/i,
  ipad: /ipad/i,
  mobileSpecific: /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i,
};

// Cache for performance
const cache = {
  utmQuery: null,
  lastParams: null,
  selectors: {
    links: 'a[href]:not([fynd-utm-exception="true"])',
    buttons: 'button:not([fynd-utm-exception="true"])',
  },
};

/**
 * Optimized UTM object validation - now treats all properties as optional
 */
function checkUTMObject() {
  if (!window.utmParams || typeof window.utmParams !== "object") {
    console.warn("🚨 UTM WARNING: window.utmParams object not found!");
    return false;
  }

  // Check if at least the object structure exists (properties can be empty)
  const hasValidStructure = UTM_CONFIG.OPTIONAL_PROPERTIES.some(
    (prop) => prop in window.utmParams
  );

  if (!hasValidStructure) {
    console.warn(
      "UTM Warning: utmParams object exists but has no UTM properties"
    );
    return false;
  }

  return true;
}

/**
 * Optimized device detection with caching
 */
function detectAndSetPlatform() {
  if (!checkUTMObject()) return null;

  const { width: screenWidth, height: screenHeight } = window.screen;
  const userAgent = navigator.userAgent.toLowerCase();

  // Cache user agent checks
  const deviceChecks = {
    isMobile: DEVICE_PATTERNS.mobile.test(userAgent),
    isTablet: DEVICE_PATTERNS.tablet.test(userAgent),
  };

  deviceChecks.isTabletBySize =
    deviceChecks.isMobile &&
    Math.min(screenWidth, screenHeight) >= UTM_CONFIG.TABLET_MIN_WIDTH;

  const platform =
    deviceChecks.isTablet || deviceChecks.isTabletBySize
      ? "tab"
      : deviceChecks.isMobile ||
        Math.max(screenWidth, screenHeight) <= UTM_CONFIG.MOBILE_MAX_WIDTH
      ? "mweb"
      : "web";

  window.utmParams.utm_source_platform = platform;

  if (!isProduction()) {
    console.log(
      `Resolution: ${screenWidth}x${screenHeight}, Platform: ${platform}`
    );
  }

  return platform;
}

/**
 * Detailed device detection (alternative)
 */
function detectAndSetPlatformDetailed() {
  if (!checkUTMObject()) return null;

  const { width: screenWidth } = window.screen;
  const userAgent = navigator.userAgent.toLowerCase();

  const isIPad = DEVICE_PATTERNS.ipad.test(userAgent);
  const isTablet = DEVICE_PATTERNS.tablet.test(userAgent);
  const isMobile = DEVICE_PATTERNS.mobileSpecific.test(userAgent);

  const platform =
    isIPad || isTablet
      ? "tab"
      : isMobile
      ? "mweb"
      : screenWidth <= UTM_CONFIG.DETAILED_MOBILE_MAX
      ? "mweb"
      : screenWidth <= UTM_CONFIG.DETAILED_TABLET_MAX
      ? "tab"
      : "web";

  window.utmParams.utm_source_platform = platform;
  return platform;
}

/**
 * Optimized UTM query string builder - only includes parameters with values
 */
function buildUTMQueryString() {
  const currentParams = JSON.stringify(window.utmParams);

  // Return cached version if params haven't changed
  if (cache.lastParams === currentParams && cache.utmQuery !== null) {
    return cache.utmQuery;
  }

  const params = new URLSearchParams();

  // Only add UTM parameters that exist in the object AND have non-empty values
  for (const [key, value] of Object.entries(window.utmParams)) {
    // Check if it's a UTM parameter and has a meaningful value
    if (
      UTM_CONFIG.OPTIONAL_PROPERTIES.includes(key) &&
      value &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      params.append(key, value.trim());
    }
  }

  cache.utmQuery = params.toString();
  cache.lastParams = currentParams;

  return cache.utmQuery;
}

/**
 * Optimized link validation
 */
function isValidLink(href) {
  if (!href) return false;

  return !UTM_CONFIG.EXCLUDED_PROTOCOLS.some(
    (protocol) => href === protocol || href.startsWith(protocol)
  );
}

/**
 * Optimized single link update
 */
function updateSingleLink(element) {
  const href = element.getAttribute("href");

  if (!isValidLink(href)) return false;

  try {
    const utmQuery = buildUTMQueryString();
    if (!utmQuery) return false;

    let updatedHref;

    if (href.includes("?")) {
      const url = new URL(href, window.location.origin);

      // Remove existing UTM parameters (only the ones we manage)
      UTM_CONFIG.OPTIONAL_PROPERTIES.forEach((param) =>
        url.searchParams.delete(param)
      );

      // Add new UTM parameters (only those with values)
      const newParams = new URLSearchParams(utmQuery);
      for (const [key, value] of newParams) {
        url.searchParams.set(key, value);
      }

      updatedHref = url.toString();
    } else {
      updatedHref = `${href}?${utmQuery}`;
    }

    // Batch attribute updates
    element.setAttribute("href", updatedHref);
    element.setAttribute("data-utm-updated", "true");
    element.setAttribute("data-utm-timestamp", Date.now());

    return true;
  } catch (error) {
    console.error("Error updating link:", href, error);
    return false;
  }
}

/**
 * Optimized button update with better handling
 */
function updateSingleButton(button) {
  if (button.hasAttribute("data-utm-updated")) return false;

  const dataHref = button.getAttribute("data-href");

  if (dataHref && isValidLink(dataHref)) {
    const utmQuery = buildUTMQueryString();
    if (utmQuery) {
      const separator = dataHref.includes("?") ? "&" : "?";
      button.setAttribute("data-href", `${dataHref}${separator}${utmQuery}`);
    }
  }

  // Batch attribute updates
  button.setAttribute("data-utm-updated", "true");
  button.setAttribute("data-utm-timestamp", Date.now());

  return true;
}

/**
 * Main optimized updateLinks function
 */
function updateLinks() {
  if (!checkUTMObject()) {
    console.error("Cannot update links: UTM object not found");
    return false;
  }

  // Check for empty parameters (informational only, not blocking)
  const emptyParams = Object.entries(window.utmParams)
    .filter(
      ([key, value]) =>
        UTM_CONFIG.OPTIONAL_PROPERTIES.includes(key) &&
        (!value || !value.trim())
    )
    .map(([key]) => key);

  if (emptyParams.length > 0 && !isProduction()) {
    console.info("UTM parameters without values:", emptyParams);
  }

  // Use cached selectors and get elements in one go
  const links = document.querySelectorAll(cache.selectors.links);
  const buttons = document.querySelectorAll(cache.selectors.buttons);

  let stats = { updated: 0, skipped: 0 };

  // Process links with optimized loop
  for (const link of links) {
    updateSingleLink(link) ? stats.updated++ : stats.skipped++;
  }

  // Process buttons with optimized loop
  for (const button of buttons) {
    updateSingleButton(button) ? stats.updated++ : stats.skipped++;
  }

  // Optimized logging (only in development)
  if (!isProduction()) {
    console.log("UTM Update:", {
      links: links.length,
      buttons: buttons.length,
      ...stats,
      params: window.utmParams,
    });
  }

  return {
    linksFound: links.length,
    buttonsFound: buttons.length,
    ...stats,
    utmParams: window.utmParams,
  };
}

/**
 * Optimized auto-update with better proxy handling
 */
function autoUpdateLinks() {
  if (!window.utmParams || typeof window.utmParams !== "object") return false;

  // Avoid double-proxying
  if (window.utmParams.constructor.name === "Object") {
    const originalParams = { ...window.utmParams };

    window.utmParams = new Proxy(originalParams, {
      set(target, property, value) {
        if (target[property] !== value) {
          target[property] = value;

          // Clear cache when params change
          cache.utmQuery = null;
          cache.lastParams = null;

          // Debounced update
          clearTimeout(window.utmUpdateTimeout);
          window.utmUpdateTimeout = setTimeout(
            updateLinks,
            UTM_CONFIG.DOM_UPDATE_DEBOUNCE
          );
        }
        return true;
      },
    });
  }

  return true;
}

/**
 * Optimized DOM observer with better performance
 */
function initializeAutoUpdate() {
  let updateTimeout;

  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    // Optimized check for relevant changes
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (
          node.nodeType === 1 &&
          (node.matches?.("a, button") || node.querySelector?.("a, button"))
        ) {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) break;
    }

    if (shouldUpdate) {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateLinks, UTM_CONFIG.DOM_UPDATE_DEBOUNCE);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Optimized initialization with better timing
 */
function initializePlatformDetection() {
  const init = () => {
    detectAndSetPlatform();

    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (checkUTMObject()) {
            detectAndSetPlatform();
            // Clear cache on resize
            cache.utmQuery = null;
            cache.lastParams = null;
          }
        }, UTM_CONFIG.RESIZE_DEBOUNCE);
      },
      { passive: true }
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    setTimeout(init, UTM_CONFIG.INIT_DELAY);
  }
}

/**
 * Initialize all UTM functionality
 */
function initializeUTMTracker() {
  initializePlatformDetection();

  // Wait for platform detection then update links
  setTimeout(() => {
    updateLinks();
    autoUpdateLinks();
    initializeAutoUpdate();
  }, UTM_CONFIG.INIT_DELAY + 50);
}

// Auto-initialize
initializeUTMTracker();

// Expose main functions globally for manual use
window.UTMTracker = {
  updateLinks,
  detectAndSetPlatform,
  checkUTMObject,
  autoUpdateLinks,
  initializeAutoUpdate,
};

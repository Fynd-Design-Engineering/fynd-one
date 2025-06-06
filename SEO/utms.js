/**
 * Optimized UTM Tracker - Fixed to prevent continuous updates
 * Handles device detection and link updating with single execution
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
  DOM_UPDATE_DEBOUNCE: 500, // Increased debounce time
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

// Cache for performance with initialization flag
const cache = {
  utmQuery: null,
  lastParams: null,
  lastRedirectionOptions: null,
  initialized: false,
  linksProcessed: false,
  selectors: {
    links: 'a[href]:not([fynd-utm-exception="true"])',
    buttons: 'button:not([fynd-utm-exception="true"])',
  },
};

/**
 * Create default UTM parameters object if not found
 */
function createDefaultUTMParams() {
  // Global UTM Parameters Object - accessible throughout the document
  window.utmParams = {
    utm_source: document.location.hostname || "Unknown",
    utm_medium: document.location.pathname || "Unknown",
    utm_campaign: "",
    utm_source_platform: "",
    utm_term: "",
  };

  if (!isProduction()) {
    console.log("Created default UTM parameters:", window.utmParams);
  }

  return true;
}

/**
 * Optimized UTM object validation - creates default if not found
 */
function checkUTMObject() {
  // If utmParams doesn't exist or is not an object, create default
  if (!window.utmParams || typeof window.utmParams !== "object") {
    console.warn(
      "🚨 UTM WARNING: window.utmParams object not found! Creating default..."
    );
    createDefaultUTMParams();
    return true;
  }

  // Check if at least the object structure exists (properties can be empty)
  const hasValidStructure = UTM_CONFIG.OPTIONAL_PROPERTIES.some(
    (prop) => prop in window.utmParams
  );

  if (!hasValidStructure) {
    console.warn(
      "UTM Warning: utmParams object exists but has no UTM properties. Creating default..."
    );
    createDefaultUTMParams();
    return true;
  }

  return true;
}

/**
 * Optimized device detection with caching
 */
function detectAndSetPlatform() {
  // Ensure UTM object exists (will create default if needed)
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

  // Only update if platform has actually changed
  if (window.utmParams.utm_source_platform !== platform) {
    window.utmParams.utm_source_platform = platform;

    if (!isProduction()) {
      console.log(
        `Resolution: ${screenWidth}x${screenHeight}, Platform: ${platform}`
      );
    }
  }

  return platform;
}

/**
 * Optimized UTM query string builder - only includes parameters with values
 */
function buildUTMQueryString() {
  // Create a stable hash of current params for comparison
  const currentParamsHash = JSON.stringify(
    Object.entries(window.utmParams)
      .filter(
        ([key, value]) =>
          UTM_CONFIG.OPTIONAL_PROPERTIES.includes(key) &&
          value &&
          typeof value === "string" &&
          value.trim() !== ""
      )
      .sort()
  );

  // Return cached version if params haven't changed
  if (cache.lastParams === currentParamsHash && cache.utmQuery !== null) {
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
  cache.lastParams = currentParamsHash;

  return cache.utmQuery;
}

/**
 * Add UTM parameters to a single URL
 */
function addUTMToURL(url) {
  if (!url || typeof url !== "string") return url;

  const utmQuery = buildUTMQueryString();
  if (!utmQuery) return url;

  try {
    // Handle relative URLs
    const baseURL = url.startsWith("/") ? window.location.origin : "";
    const fullURL = new URL(url, baseURL || window.location.origin);

    // Remove existing UTM parameters (only the ones we manage)
    UTM_CONFIG.OPTIONAL_PROPERTIES.forEach((param) =>
      fullURL.searchParams.delete(param)
    );

    // Add new UTM parameters
    const newParams = new URLSearchParams(utmQuery);
    for (const [key, value] of newParams) {
      fullURL.searchParams.set(key, value);
    }

    // Return relative URL if it was originally relative
    if (url.startsWith("/")) {
      return fullURL.pathname + fullURL.search + fullURL.hash;
    }

    return fullURL.toString();
  } catch (error) {
    console.error("Error adding UTM to URL:", url, error);
    return url;
  }
}

/**
 * Check and update redirection options with UTM parameters - only once
 */
function checkAndUpdateRedirectionOptions() {
  if (
    !window.redirectionOptions ||
    typeof window.redirectionOptions !== "object"
  ) {
    return false;
  }

  // Ensure UTM object exists (will create default if needed)
  if (!checkUTMObject()) {
    return false;
  }

  const currentRedirectionStr = JSON.stringify(window.redirectionOptions);

  // Return if redirection options haven't changed and we've already processed them
  if (cache.lastRedirectionOptions === currentRedirectionStr) {
    return true;
  }

  let updated = false;

  // Update newTab URL if it exists
  if (
    window.redirectionOptions.newTab &&
    typeof window.redirectionOptions.newTab === "string"
  ) {
    const originalNewTab = window.redirectionOptions.newTab;
    const updatedNewTab = addUTMToURL(originalNewTab);

    if (updatedNewTab !== originalNewTab) {
      window.redirectionOptions.newTab = updatedNewTab;
      updated = true;
    }
  }

  // Update currentTab URL if it exists
  if (
    window.redirectionOptions.currentTab &&
    typeof window.redirectionOptions.currentTab === "string"
  ) {
    const originalCurrentTab = window.redirectionOptions.currentTab;
    const updatedCurrentTab = addUTMToURL(originalCurrentTab);

    if (updatedCurrentTab !== originalCurrentTab) {
      window.redirectionOptions.currentTab = updatedCurrentTab;
      updated = true;
    }
  }

  // Cache the current state
  cache.lastRedirectionOptions = currentRedirectionStr;

  if (updated && !isProduction()) {
    console.log("Redirection options updated with UTM parameters:", {
      type: window.redirectionOptions.type,
      newTab: window.redirectionOptions.newTab,
      currentTab: window.redirectionOptions.currentTab,
    });
  }

  return updated;
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
 * Check if link already has UTM parameters
 */
function hasUTMParameters(href) {
  try {
    const url = new URL(href, window.location.origin);
    return UTM_CONFIG.OPTIONAL_PROPERTIES.some((param) =>
      url.searchParams.has(param)
    );
  } catch {
    return href.includes("utm_");
  }
}

/**
 * Optimized single link update
 */
function updateSingleLink(element) {
  // Skip if already processed
  if (element.hasAttribute("data-utm-updated")) return false;

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
 * Main optimized updateLinks function - only runs once unless forced
 */
function updateLinks(force = false) {
  // Prevent multiple executions unless forced
  if (cache.linksProcessed && !force) {
    if (!isProduction()) {
      console.log("UTM links already processed, skipping update");
    }
    return {
      linksFound: 0,
      buttonsFound: 0,
      updated: 0,
      skipped: 0,
      utmParams: window.utmParams,
      alreadyProcessed: true,
    };
  }

  // Ensure UTM object exists (will create default if needed)
  if (!checkUTMObject()) {
    console.error(
      "Cannot update links: Failed to create or validate UTM object"
    );
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

  // Check and update redirection options
  checkAndUpdateRedirectionOptions();

  // Mark as processed
  cache.linksProcessed = true;

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
 * Simplified auto-update - only monitors for actual parameter changes
 */
function autoUpdateLinks() {
  if (!window.utmParams || typeof window.utmParams !== "object") return false;

  // Only setup proxy if not already done
  if (window.utmParams.constructor.name === "Object") {
    const originalParams = { ...window.utmParams };

    window.utmParams = new Proxy(originalParams, {
      set(target, property, value) {
        const oldValue = target[property];

        // Only trigger update if value actually changed and it's a UTM property
        if (
          oldValue !== value &&
          UTM_CONFIG.OPTIONAL_PROPERTIES.includes(property)
        ) {
          target[property] = value;

          // Clear cache when params change
          cache.utmQuery = null;
          cache.lastParams = null;
          cache.lastRedirectionOptions = null;
          cache.linksProcessed = false; // Allow re-processing

          // Debounced update - only for significant changes
          clearTimeout(window.utmUpdateTimeout);
          window.utmUpdateTimeout = setTimeout(() => {
            updateLinks(true); // Force update
            checkAndUpdateRedirectionOptions();
          }, UTM_CONFIG.DOM_UPDATE_DEBOUNCE);

          if (!isProduction()) {
            console.log(`UTM parameter changed: ${property} = ${value}`);
          }
        } else {
          target[property] = value;
        }
        return true;
      },
    });
  }

  return true;
}

/**
 * Simplified DOM observer - only for new elements
 */
function initializeAutoUpdate() {
  let updateTimeout;
  let pendingUpdate = false;

  const observer = new MutationObserver((mutations) => {
    if (pendingUpdate) return; // Prevent multiple pending updates

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
      pendingUpdate = true;
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        // Only update new elements, not all elements
        const newLinks = document.querySelectorAll(
          'a[href]:not([data-utm-updated]):not([fynd-utm-exception="true"])'
        );
        const newButtons = document.querySelectorAll(
          'button:not([data-utm-updated]):not([fynd-utm-exception="true"])'
        );

        if (newLinks.length > 0 || newButtons.length > 0) {
          // Process only new elements
          let updated = 0;
          for (const link of newLinks) {
            if (updateSingleLink(link)) updated++;
          }
          for (const button of newButtons) {
            if (updateSingleButton(button)) updated++;
          }

          if (!isProduction() && updated > 0) {
            console.log(`Updated ${updated} new elements with UTM parameters`);
          }
        }

        pendingUpdate = false;
      }, UTM_CONFIG.DOM_UPDATE_DEBOUNCE);
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
    if (cache.initialized) return; // Prevent double initialization

    detectAndSetPlatform();
    cache.initialized = true;

    // Simplified resize handler - only update platform, not all links
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (checkUTMObject()) {
            const oldPlatform = window.utmParams.utm_source_platform;
            detectAndSetPlatform();

            // Only clear cache and update if platform actually changed
            if (oldPlatform !== window.utmParams.utm_source_platform) {
              cache.utmQuery = null;
              cache.lastParams = null;
              cache.linksProcessed = false;
              updateLinks(true); // Force update due to platform change
            }
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
 * Initialize all UTM functionality - simplified
 */
function initializeUTMTracker() {
  initializePlatformDetection();

  // Wait for platform detection then update links ONCE
  setTimeout(() => {
    updateLinks(); // Initial update
    autoUpdateLinks(); // Setup monitoring for parameter changes
    initializeAutoUpdate(); // Setup monitoring for new DOM elements

    // Initial check for redirection options
    checkAndUpdateRedirectionOptions();
  }, UTM_CONFIG.INIT_DELAY + 50);
}

// Auto-initialize only once
if (!window.UTMTrackerInitialized) {
  initializeUTMTracker();
  window.UTMTrackerInitialized = true;
}

// Expose main functions globally for manual use
window.UTMTracker = {
  updateLinks: (force = false) => updateLinks(force),
  detectAndSetPlatform,
  checkUTMObject,
  createDefaultUTMParams,
  autoUpdateLinks,
  initializeAutoUpdate,
  checkAndUpdateRedirectionOptions,
  addUTMToURL,
  forceUpdate: () => {
    cache.linksProcessed = false;
    cache.utmQuery = null;
    cache.lastParams = null;
    return updateLinks(true);
  },
};

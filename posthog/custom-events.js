function getTrackingProperties() {
  return {
    source_page: window.location.pathname,
    fynd_product: getFyndProduct(), // You'll need to implement this based on your logic
    interface: "Webflow",
    device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      ? "Mobile"
      : "Web",
    utm_source:
      new URLSearchParams(window.location.search).get("utm_source") || "",
    utm_medium:
      new URLSearchParams(window.location.search).get("utm_medium") || "",
    utm_campaign:
      new URLSearchParams(window.location.search).get("utm_campaign") || "",
    referrer: document.referrer,
  };
}

// Helper function to determine fynd_product - customize based on your needs
function getFyndProduct() {
  const pathname = window.location.pathname;
  if (pathname.includes("hero")) return "hero_section";
  if (pathname.includes("footer")) return "footer";
  return "unknown";
}

document.addEventListener("DOMContentLoaded", function () {
  posthog.capture("$pageview", getTrackingProperties());
});

window.addEventListener("load", function () {
  posthog.capture("page_loaded", getTrackingProperties());
});

document.addEventListener("DOMContentLoaded", function () {
  const signUpButtons = document.querySelectorAll('[data-ph="sign-up"]');
  const signInButtons = document.querySelectorAll('[data-ph="sign-in"]');

  signUpButtons.forEach((button) => {
    button.addEventListener("click", function () {
      posthog.capture("clicked_sign_up", getTrackingProperties());
    });
  });

  signInButtons.forEach((button) => {
    button.addEventListener("click", function () {
      posthog.capture("clicked_sign_in", getTrackingProperties());
    });
  });
});

function getTrackingProperties() {
  return {
    source_page: window.location.pathname,
    fynd_product: "fynd.com website",
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

document.addEventListener("DOMContentLoaded", function () {
  posthog.capture("$pageview", getTrackingProperties());
});

window.addEventListener("load", function () {
  posthog.capture("page_loaded", getTrackingProperties());
});

document.addEventListener("DOMContentLoaded", function () {
  const signUpButtons = document.querySelectorAll('[data-ph="sign-up"]');
  const signInButtons = document.querySelectorAll('[data-ph="sign-in"]');
  const scrollToFormButtons = document.querySelectorAll(
    '[href="#footer-form"]'
  );

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

  scrollToFormButtons.forEach((button) => {
    button.addEventListener("click", function () {
      posthog.capture("clicked_scroll_to_form", getTrackingProperties());
    });
  });
});

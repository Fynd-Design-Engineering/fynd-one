//default tracking properties
window.getTrackingProperties = function () {
  const pathname = window.location.pathname;

  return {
    source_page: pathname === "/" ? pathname + " Home" : pathname,
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
};

window.interactedForm = "";

// Function to get tracking properties with form name
window.getTrackingPropertiesWithForm = function (formName) {
  return {
    ...window.getTrackingProperties(),
    form_name: formName,
  };
};

//getting parent form name by passing field element
function getParentFormName(fieldElement) {
  const parentForm = fieldElement.closest("form");
  if (parentForm) {
    const formName = parentForm.getAttribute("data-name");
    return formName || null;
  }
  return null;
}

// Initialize PostHog pageview
document.addEventListener("DOMContentLoaded", function () {
  posthog.capture("$pageview", getTrackingProperties());
});

// Track page load event
window.addEventListener("load", function () {
  posthog.capture("page_loaded", getTrackingProperties());
});

//sign in and sign up tracking
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

// Track form interactions
document.addEventListener("DOMContentLoaded", function () {
  // Select all form fields with data-posthog-trigger attribute
  const formFields = document.querySelectorAll("[data-posthog-trigger]");
  console.log(
    "%cposthog/custom-events.js:58 formFields",
    "color: #007acc;",
    formFields
  );

  // Keep track of forms that have already been processed
  const processedForms = new Set();

  formFields.forEach((field) => {
    field.addEventListener("change", function () {
      // Find the parent form element
      const parentForm = this.closest("form");

      if (parentForm) {
        // Check if this form has already been processed
        if (processedForms.has(parentForm)) {
          console.log("Form already processed, skipping...");
          return;
        }

        // Mark this form as processed
        processedForms.add(parentForm);

        // Get the data-name attribute value from the parent form
        const formName = parentForm.getAttribute("data-name");
        window.interactedForm = formName || "";

        if (formName) {
          console.log("Form name (first time):", formName);
          console.log(getTrackingPropertiesWithForm(formName));
          posthog.capture(
            "form_started",
            getTrackingPropertiesWithForm(formName)
          );
          return formName;
        } else {
          console.log("No data-name attribute found on parent form");
          return null;
        }
      } else {
        console.log("No parent form found");
        return null;
      }
    });
  });
});

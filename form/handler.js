/**
 * Form Validation and Submission Script for Webflow
 * Handles phone validation, form submission prevention, and redirection logic
 */

/**
 * Updates a hidden input with the country code from an initialized intl-tel-input element
 *
 * @param {string|HTMLElement} phoneInputSelector - Phone input element or its selector
 * @param {string} countryCodeInputId - ID of the hidden input to update with country code
 */
function updateCountryCode(
  phoneInputSelector = "#phone-number",
  countryCodeInputId = "#country-code"
) {
  const phoneInput =
    typeof phoneInputSelector === "string"
      ? document.querySelector(phoneInputSelector)
      : phoneInputSelector;
  const countryCodeInput = document.querySelector(countryCodeInputId);

  if (!phoneInput) {
    console.error("Phone input not found");
    return;
  }

  if (!countryCodeInput) {
    console.error("Country code input not found");
    return;
  }

  try {
    // Try to get country data directly - this will fail gracefully if not possible
    if (
      phoneInput.iti &&
      typeof phoneInput.iti.getSelectedCountryData === "function"
    ) {
      const countryData = phoneInput.iti.getSelectedCountryData();
      countryCodeInput.value = "+" + countryData.dialCode;
      return countryData.dialCode;
    } else if (
      window.intlTelInputGlobals &&
      typeof window.intlTelInputGlobals.getInstance === "function"
    ) {
      // Try using the global instance
      const iti = window.intlTelInputGlobals.getInstance(phoneInput);
      if (iti) {
        const countryData = iti.getSelectedCountryData();
        countryCodeInput.value = "+" + countryData.dialCode;
        return countryData.dialCode;
      }
    }

    // Default to India's country code (+91)
    countryCodeInput.value = "+91";
    return "91";
  } catch (error) {
    console.error("Error retrieving country code:", error);
    // Default to India in case of error
    countryCodeInput.value = "+91";
    return "91";
  }
}

/**
 * Updates hidden inputs with page data like URL and page title
 */
function updatePageData() {
  const productInput = document.getElementById("product");
  const PageUrlInput = document.getElementById("page-url");

  if (PageUrlInput) {
    PageUrlInput.value = window.location.href;
  }

  if (productInput) {
    productInput.value = document.title;
  }
}

/**
 * Generates a Calendly URL with user's information
 * @returns {string|null} The Calendly URL or null if required fields are missing
 */
function generateCalendlyURL() {
  if (!window.redirectionOptions || !window.redirectionOptions.newTab) {
    console.error(
      "window.redirectionOptions not found or missing newTab property"
    );
    return null;
  }

  const baseURL = window.redirectionOptions.newTab;
  const nameField = document.getElementById("first-name");
  const lastNameField = document.getElementById("last-name");
  const emailField = document.getElementById("work-email");

  if (
    !nameField ||
    !nameField.value.trim() ||
    !lastNameField ||
    !lastNameField.value.trim() ||
    !emailField ||
    !emailField.value.trim()
  ) {
    console.error("Required fields missing or empty");
    return null;
  }

  const fullName = `${nameField.value} ${lastNameField.value}`.trim();
  const email = emailField.value;
  const updatedURL = `${baseURL}?email=${encodeURIComponent(
    email
  )}&name=${encodeURIComponent(fullName)}`;
  return updatedURL;
}

/**
 * Generates a Hubspot URL with user's information
 * @returns {string|null} The Hubspot URL or null if required fields are missing
 */
function generateHubspotURL() {
  if (!window.redirectionOptions || !window.redirectionOptions.newTab) {
    console.error("window.redirectionOptions not found or missing newTab property");
    return null;
  }
  
  const baseURL = window.redirectionOptions.newTab;
  const nameField = document.getElementById("first-name");
  const lastNameField = document.getElementById("last-name");
  const emailField = document.getElementById("work-email");
  
  if (
    !nameField || !nameField.value.trim() ||
    !lastNameField || !lastNameField.value.trim() ||
    !emailField || !emailField.value.trim()
  ) {
    console.error("Required fields missing or empty");
    return null;
  }
  
  try {
    const url = new URL(baseURL);
    
    // Remove any existing email, firstname, lastname params to avoid conflicts
    // This is crucial to prevent interference from the UTM tracker script
    url.searchParams.delete('email');
    url.searchParams.delete('firstname');
    url.searchParams.delete('lastname');
    
    // Also remove any malformed versions that might exist
    url.searchParams.delete('Email');
    url.searchParams.delete('FirstName');
    url.searchParams.delete('LastName');
    
    // Add fresh, properly encoded parameters
    url.searchParams.set('email', emailField.value.trim());
    url.searchParams.set('firstname', nameField.value.trim());
    url.searchParams.set('lastname', lastNameField.value.trim());
    
    return url.toString();
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

/**
 * Validates the entire form, with focus on phone validation
 * Uses custom validation as primary method since it's more reliable
 * @returns {boolean} Whether the form is valid
 */
function validateForm() {
  const phoneField = document.querySelector("#phone-number");
  const phoneError = document.querySelector("#phone-error"); // Define phoneError element

  if (!phoneField) {
    console.error("Phone field not found");
    return false;
  }

  const phoneValue = phoneField.value;

  // Use validatePhoneCustom as primary method (more reliable)
  let validation;
  if (typeof window.validatePhoneCustom === "function") {
    validation = window.validatePhoneCustom("phone-number", phoneValue);
  } else if (typeof window.validatePhone === "function") {
    validation = window.validatePhone("phone-number", phoneValue);
  } else {
    console.error("No phone validation function available");
    return false;
  }

  if (!validation.isValid) {
    console.error(`Phone validation failed: ${validation.message}`);

    if (phoneError) {
      phoneError.style.display = "block";
      phoneError.textContent =
        validation.message || "Please enter a valid phone number";
    }

    phoneField.focus();

    return false;
  } else {
    if (phoneError) {
      phoneError.style.display = "none";
    }
  }

  return true;
}

/**
 * Handles the form submission process and redirection
 */
function handleFormSubmission() {
  try {
    if (typeof handleRedirection === "function") {
      handleRedirection();
    } else {
      window.location.href = "/thank-you";
    }
  } catch (error) {
    console.error("Error during form submission:", error);
  }
}

/**
 * Determines which type of redirection to perform
 */
function handleRedirection() {
  if (!window.redirectionOptions || !window.redirectionOptions.type) {
    console.error(
      "window.redirectionOptions not found or missing type property"
    );
    return;
  }

  switch (window.redirectionOptions.type) {
    case "calendly":
      handleCalendlyRedirection();
      break;
    case "hubspot":
      handleHubspotRedirection();
      break;
    case "webflow":
      handleWebflowRedirection();
      break;
    default:
      console.error(
        "Invalid redirection type:",
        window.redirectionOptions.type
      );
      return;
  }
}

/**
 * Handles Calendly-specific redirection
 */
function handleCalendlyRedirection() {
  const newTabUrl = generateCalendlyURL();
  const currentTabUrl = window.redirectionOptions.currentTab;

  if (newTabUrl) {
    window.open(newTabUrl, "_blank");
  }

  if (currentTabUrl) {
    window.location.href = currentTabUrl;
  }
}

/**
 * Handles HubSpot-specific redirection
 */
function handleHubspotRedirection() {
  const newTabUrl = generateHubspotURL();
  const currentTabUrl = window.redirectionOptions.currentTab;

  if (newTabUrl) {
    window.open(newTabUrl, "_blank");
  }

  if (currentTabUrl) {
    window.location.href = currentTabUrl;
  }
}

/**
 * Handles Webflow-specific redirection
 */
function handleWebflowRedirection() {
  const newTabUrl = window.redirectionOptions.newTab;
  const currentTabUrl = window.redirectionOptions.currentTab;

  if (newTabUrl) {
    window.open(newTabUrl, "_blank");
  }

  if (currentTabUrl) {
    window.location.href = currentTabUrl;
  }
}

/**
 * Converts the first option in select fields to actual placeholders with styling
 */
function setupSelectPlaceholders() {
  // Find all select elements
  const selectFields = document.querySelectorAll("select");

  selectFields.forEach(function (select) {
    // Get the first option
    const firstOption = select.querySelector("option:first-child");

    if (firstOption) {
      // Make it a true placeholder by adding these attributes
      firstOption.setAttribute("value", "");
      firstOption.setAttribute("disabled", "disabled");
      firstOption.setAttribute("selected", "selected");

      // Set the select's initial selectedIndex to 0 (the placeholder)
      select.selectedIndex = 0;

      // Add a class to the select element to style it when showing placeholder
      select.classList.add("placeholder-active");

      // Style the select element when showing the placeholder
      if (select.value === "") {
        select.style.color = "#999999"; // Placeholder color (gray)
      }

      // Change color when user selects a real option
      select.addEventListener("change", function () {
        if (select.value) {
          select.style.color = ""; // Reset to default text color
          select.classList.remove("placeholder-active");
        } else {
          select.style.color = "#999999"; // Back to placeholder color
          select.classList.add("placeholder-active");
        }
      });
    }
  });

  console.log("Select placeholders initialized");
}

/**
 * Override Webflow's form submission functionality
 */
function overrideWebflowFormSubmission() {
  const form = document.querySelector("[data-form-handler]");
  const phoneField = document.querySelector("#phone-number");

  if (!form || !phoneField) {
    console.error("Form or phone field not found");
    return;
  }

  // Add validation using setCustomValidity
  phoneField.addEventListener("invalid", function (event) {
    const validation = window.validatePhone("phone-number", phoneField.value);
    if (!validation.isValid) {
      phoneField.setCustomValidity(
        validation.message || "Please enter a valid phone number"
      );
    }
  });

  phoneField.addEventListener("input", function () {
    phoneField.setCustomValidity("");
  });

  phoneField.addEventListener("blur", function () {
    const validation = window.validatePhone("phone-number", phoneField.value);
    if (!validation.isValid && phoneField.value.trim() !== "") {
      phoneField.setCustomValidity(
        validation.message || "Please enter a valid phone number"
      );
    } else {
      phoneField.setCustomValidity("");
    }
  });

  // Handle form submission with redirection
  form.addEventListener(
    "submit",
    function (event) {
      // Use validatePhoneCustom as primary method (more reliable)
      let validation;
      if (typeof window.validatePhoneCustom === "function") {
        validation = window.validatePhoneCustom(
          "phone-number",
          phoneField.value
        );
      } else {
        validation = window.validatePhone("phone-number", phoneField.value);
      }

      if (!validation.isValid) {
        phoneField.setCustomValidity(
          validation.message || "Please enter a valid phone number"
        );
        event.preventDefault();
        phoneField.focus();
        return false;
      } else {
        phoneField.setCustomValidity("");

        console.log("Validation passed, allowing form submission");

        // Restore redirection logic - but use a more reliable approach
        // Track form submission time to set up delayed redirection
        window._formSubmissionTime = Date.now();
        posthog.capture(
          "form_submitted",
          window.getTrackingPropertiesWithForm(
            window.interactedForm || "unknown_form"
          )
        );

        // Set up a delayed redirection that gives Webflow time to process
        setTimeout(function () {
          console.log("Executing delayed redirection");
          handleFormSubmission();
        }, 3000);

        // Let the form submit normally
        return true;
      }
    },
    true
  );

  // Additional Webflow success detection
  if (window.jQuery || window.$) {
    const $ = window.jQuery || window.$;

    // Listen for Webflow's success event
    $(document).on("webflow-form-success", function (e) {
      if (e.target === form) {
        console.log("Webflow success event detected");
        posthog.capture(
          "form_success",
          window.getTrackingPropertiesWithForm(
            window.interactedForm || "unknown_form"
          )
        );

        handleFormSubmission();
      } else {
        // event for error in future
      }
    });
  }

  console.log("Form validation and redirection setup complete");
}

/**
 * Initialize everything when the DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  // Detect phone input
  const phoneField = document.querySelector("#phone-number");
  if (phoneField) {
    // Add validation on blur - using only browser validation
    phoneField.addEventListener("blur", function () {
      if (typeof window.validatePhone === "function") {
        const validation = window.validatePhone(
          "phone-number",
          phoneField.value
        );
        if (!validation.isValid && phoneField.value.trim() !== "") {
          phoneField.setCustomValidity(
            validation.message || "Please enter a valid phone number"
          );
        } else {
          phoneField.setCustomValidity("");
        }
      }
    });
  }

  // Select placeholders
  setupSelectPlaceholders();

  // Initialize country code and page data
  updateCountryCode();
  updatePageData();

  // Override Webflow form submission
  overrideWebflowFormSubmission();
});

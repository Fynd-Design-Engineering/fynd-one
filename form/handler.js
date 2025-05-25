/**
 * Form Validation and Submission Script for Webflow
 * Handles phone validation, form submission prevention, and redirection logic
 * Works with separate phone validator script
 */

/**
 * Wait for phone validator to be ready before executing validation
 */
function waitForPhoneValidator() {
  return new Promise((resolve) => {
    // Check if phone validator is available
    if (typeof window.validatePhone === 'function') {
      // Also check if there's an initialized phone input
      const phoneInput = document.querySelector("#phone-number");
      if (phoneInput && phoneInput.iti) {
        resolve(true);
        return;
      }
    }

    // If not ready, wait and check again
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (typeof window.validatePhone === 'function') {
        const phoneInput = document.querySelector("#phone-number");
        if (phoneInput && phoneInput.iti) {
          clearInterval(checkInterval);
          resolve(true);
          return;
        }
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn("Phone validator not ready after 5 seconds");
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Safe phone validation that waits for validator to be ready
 */
async function safeValidatePhone(phoneInput, phoneNumber) {
  const isReady = await waitForPhoneValidator();
  
  if (!isReady) {
    return {
      isValid: false,
      message: "Phone validator not initialized"
    };
  }
  
  try {
    return window.validatePhone(phoneInput, phoneNumber);
  } catch (error) {
    console.error("Phone validation error:", error);
    return {
      isValid: false,
      message: "Validation failed"
    };
  }
}

/**
 * Updates a hidden input with the country code from an initialized intl-tel-input element
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

  const email = emailField.value;
  const updatedURL = `${baseURL}?email=${encodeURIComponent(
    email
  )}&firstname=${encodeURIComponent(
    nameField.value.trim()
  )}&lastname=${encodeURIComponent(lastNameField.value.trim())}`;
  return updatedURL;
}

/**
 * Validates the entire form, with focus on phone validation
 * @returns {Promise<boolean>} Whether the form is valid
 */
async function validateForm() {
  const phoneField = document.querySelector("#phone-number");

  if (!phoneField) {
    console.error("Phone field not found");
    return false;
  }

  const phoneValue = phoneField.value;

  // Use safe validation that waits for validator to be ready
  const validation = await safeValidatePhone("phone-number", phoneValue);

  if (!validation.isValid) {
    console.error(`Phone validation failed: ${validation.message}`);

    // Use browser's built-in validation instead of undefined phoneError
    phoneField.setCustomValidity(validation.message || "Please enter a valid phone number");
    phoneField.reportValidity();
    
    return false;
  } else {
    // Clear any previous validation errors
    phoneField.setCustomValidity("");
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
      window.location.href = "/tms";
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

  // Add real-time validation clearing
  phoneField.addEventListener("input", function () {
    phoneField.setCustomValidity("");
  });

  // Add validation on blur with proper timing
  phoneField.addEventListener("blur", async function () {
    if (phoneField.value.trim() !== "") {
      const validation = await safeValidatePhone("phone-number", phoneField.value);
      if (!validation.isValid) {
        phoneField.setCustomValidity(
          validation.message || "Please enter a valid phone number"
        );
      } else {
        phoneField.setCustomValidity("");
        // Update country code when validation passes
        updateCountryCode();
      }
    }
  });

  // Handle form submission with async validation
  form.addEventListener(
    "submit",
    async function (event) {
      console.log("Form submission intercepted");
      
      // Prevent default submission temporarily
      event.preventDefault();
      
      const validation = await safeValidatePhone("phone-number", phoneField.value);

      if (!validation.isValid) {
        phoneField.setCustomValidity(
          validation.message || "Please enter a valid phone number"
        );
        phoneField.reportValidity();
        return false;
      } else {
        phoneField.setCustomValidity("");
        console.log("Validation passed, allowing form submission");

        // Update country code before final submission
        updateCountryCode();

        // Store submission time for delayed redirection
        window._formSubmissionTime = Date.now();

        // Set up a delayed redirection that gives Webflow time to process
        setTimeout(function () {
          console.log("Executing delayed redirection");
          handleFormSubmission();
        }, 3000);

        // Now allow the form to submit by creating a new submit event
        // Remove this event listener to avoid infinite loop
        form.removeEventListener("submit", arguments.callee);
        
        // Trigger the original form submission
        form.submit();
        
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
        handleFormSubmission();
      }
    });
  }

  console.log("Form validation and redirection setup complete");
}

/**
 * Initialize everything when the DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing form handler...");

  // Wait a bit for phone validator to initialize
  setTimeout(async () => {
    // Check if phone validator is ready
    const phoneValidatorReady = await waitForPhoneValidator();
    
    if (phoneValidatorReady) {
      console.log("✅ Phone validator detected and ready");
    } else {
      console.warn("⚠️ Phone validator not ready - validation may not work properly");
    }

    // Detect phone input and add listeners
    const phoneField = document.querySelector("#phone-number");
    if (phoneField) {
      // Add validation on blur - using safe validation
      phoneField.addEventListener("blur", async function () {
        if (phoneField.value.trim() !== "") {
          const validation = await safeValidatePhone("phone-number", phoneField.value);
          if (!validation.isValid) {
            phoneField.setCustomValidity(
              validation.message || "Please enter a valid phone number"
            );
          } else {
            phoneField.setCustomValidity("");
            updateCountryCode();
          }
        }
      });

      console.log("✅ Phone field listeners added");
    }

    // Initialize other components
    setupSelectPlaceholders();
    updatePageData();
    overrideWebflowFormSubmission();

    // Update country code after everything is ready
    setTimeout(() => {
      updateCountryCode();
    }, 1000);

    console.log("✅ Form handler initialization complete");
  }, 500); // Give phone validator time to initialize
});

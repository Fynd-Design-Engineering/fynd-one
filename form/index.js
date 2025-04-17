/**
 * Simple function to update a hidden input with the country code
 * from any initialized intl-tel-input element
 *
 * @param {string|HTMLElement} phoneInputSelector - Phone input element or its selector
 * @param {string} countryCodeInputId - ID of the hidden input to update with country code
 *
 * updateCountryCode("input[type='tel']", "country-code");
 */

let redirectionURL;

function updateCountryCode(
  phoneInputSelector = "input[type='tel']",
  countryCodeInputId = "country-code"
) {
  const phoneInput =
    typeof phoneInputSelector === "string"
      ? document.querySelector(phoneInputSelector)
      : phoneInputSelector;
  const countryCodeInput = document.getElementById(countryCodeInputId);
  if (!phoneInput) {
    console.error("Phone input not found");
    return;
  }

  if (!countryCodeInput) {
    console.error("Country code input not found");
    return;
  }
  if (!phoneInput.iti) {
    console.error(
      "International telephone input not initialized on this element"
    );
    return;
  }
  const countryData = phoneInput.iti.getSelectedCountryData();
  countryCodeInput.value = "+" + countryData.dialCode;
  return countryData.dialCode;
}

function updatePageData() {
  const productInput = document.getElementById("product");
  const PageUrlInput = document.getElementById("page-url");
  PageUrlInput.value = window.location.href;
  productInput.value = document.title;
}

function generateCalendlyURL() {
  const baseURL = redirectionOptions.URL;
  const nameField = document.getElementById("first-name");
  const lastNameField = document.getElementById("last-name");
  const emailField = document.getElementById("work-email");
  if (!nameField || !lastNameField || !emailField) {
    console.error("Required fields missing in formData");
    return;
  }
  const fullName = `${nameField.value} ${lastNameField.value}`.trim();
  const email = emailField.value;
  const updatedURL = `${baseURL}?email=${encodeURIComponent(
    email
  )}&name=${encodeURIComponent(fullName)}`;
  return updatedURL;
}

function performRedirection(pageUrl) {
  if (pageUrl) {
    window.open(pageUrl, "_blank");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateCountryCode();
  updatePageData();
  document
    .getElementById("submit-action")
    .addEventListener("click", function () {
      handleFormSubmission();
    });
});

function handleFormSubmission() {
  setTimeout(() => {
    if (document.getElementById("success-message")) {
      handleRedirection();
    } else {
      console.error("Form submission failed or success message not found");
    }
  }, 500);
}

function handleRedirection() {
  switch (redirectionOptions.type) {
    case "calendly":
      redirectionURL = generateCalendlyURL();
      break;
    case "hubspot":
      redirectionURL = redirectionOptions.URL;
      break;
    case "webflow":
      redirectionURL = redirectionOptions.URL;
      break;
    default:
      console.error("Invalid redirection type");
      return;
  }
  if (redirectionURL) {
    window.open(redirectionURL, "_blank");
  }
}

/**
 * Phone Validator Library
 * Depends on intl-tel-input library
 */

// Global namespace for the phone validator
window.PhoneValidator = (function () {
  // Store validator instances
  const instances = {};

  /**
   * Initialize a phone validator for an input element
   * @param {string} elementId - The ID of the input element
   * @param {object} options - Options for intl-tel-input
   * @returns {object} - The intl-tel-input instance
   */
  function init(elementId, options = {}) {
    const inputElement = document.getElementById(elementId);
    if (!inputElement) {
      console.error(`Element with ID '${elementId}' not found`);
      return null;
    }

    // Default options
    const defaultOptions = {
      initialCountry: "us",
      separateDialCode: true,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
    };

    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };

    // Initialize the phone validator
    const iti = window.intlTelInput(inputElement, mergedOptions);

    // Store the instance
    instances[elementId] = iti;

    return iti;
  }

  /**
   * Validate a phone number and return detailed information
   * @param {string} elementId - The ID of the input element
   * @returns {object} - Validation result object
   */
  function validate(elementId) {
    const iti = instances[elementId];
    if (!iti) {
      console.error(
        `No validator instance found for '${elementId}'. Initialize first with PhoneValidator.init().`
      );
      return {
        isValid: false,
        message: "Validator not initialized",
      };
    }

    const inputElement = document.getElementById(elementId);

    const result = {
      isValid: false,
      message: "Invalid number",
      fullNumber: "",
      countryCode: "",
      phoneNumber: "",
      countryIso: "",
      countryName: "",
      formatInternational: "",
      formatNational: "",
    };

    // Check if input is empty
    if (!inputElement.value.trim()) {
      result.message = "Required";
      return result;
    }

    // Validate the number
    if (iti.isValidNumber()) {
      const countryData = iti.getSelectedCountryData();

      result.isValid = true;
      result.message = "Valid number";
      result.fullNumber = iti.getNumber();
      result.countryCode = countryData.dialCode;
      result.phoneNumber = iti
        .getNumber()
        .replace(`+${countryData.dialCode}`, "");
      result.countryIso = countryData.iso2;
      result.countryName = countryData.name;

      // Check if utils are available before using format methods
      if (window.intlTelInputUtils) {
        result.formatInternational = iti.getNumber(
          intlTelInputUtils.numberFormat.INTERNATIONAL
        );
        result.formatNational = iti.getNumber(
          intlTelInputUtils.numberFormat.NATIONAL
        );
      } else {
        result.formatInternational = result.fullNumber;
        result.formatNational = result.phoneNumber;
      }
    } else {
      // Get specific error message
      const errorMap = [
        "Invalid number",
        "Invalid country code",
        "Too short",
        "Too long",
        "Invalid number",
      ];
      const errorCode = iti.getValidationError();
      result.message = errorMap[errorCode] || "Invalid number";
    }

    return result;
  }

  /**
   * Destroy a validator instance
   * @param {string} elementId - The ID of the input element
   * @returns {boolean} - Success of the operation
   */
  function destroy(elementId) {
    const iti = instances[elementId];
    if (iti) {
      iti.destroy();
      delete instances[elementId];
      return true;
    }
    return false;
  }

  /**
   * Get a validator instance
   * @param {string} elementId - The ID of the input element
   * @returns {object|null} - The intl-tel-input instance or null
   */
  function getInstance(elementId) {
    return instances[elementId] || null;
  }

  // Public API
  return {
    init: init,
    validate: validate,
    destroy: destroy,
    getInstance: getInstance,
  };
})();

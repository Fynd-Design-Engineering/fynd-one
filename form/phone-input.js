// Phone Number Validator - Global Version
// This will be accessible globally as window.phoneValidator

// Self-executing function to avoid polluting the global scope
(function (window) {
  // Define the phone validator function
  window.phoneValidator = function (inputElement) {
    // Initialize the phone validator
    const iti = window.intlTelInput(inputElement, {
      initialCountry: "us",
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
      separateDialCode: true,
    });

    // Return an object with validation methods
    return {
      // Validate the phone number and return detailed information
      validate: function () {
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
          result.formatInternational = iti.getNumber(
            intlTelInputUtils.numberFormat.INTERNATIONAL
          );
          result.formatNational = iti.getNumber(
            intlTelInputUtils.numberFormat.NATIONAL
          );
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
      },

      // Get the intlTelInput instance
      getInstance: function () {
        return iti;
      },

      // Destroy the instance
      destroy: function () {
        return iti.destroy();
      },
    };
  };
})(window);

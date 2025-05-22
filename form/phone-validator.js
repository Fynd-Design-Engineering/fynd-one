/**
 * Phone Validator Library
 * A simplified version of the International Telephone Input with India as default
 */

// Initialize the phone validator when the script loads
(function () {
  // Create global phoneValidator object to be accessible from anywhere
  window.phoneValidator = {};

  // Initialize phone input when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    // Find all phone inputs with the class 'phone-input'
    const phoneInputs = document.querySelectorAll(
      "input[type='tel'], .phone-input"
    );

    // Error messages for different error codes
    const errorMap = [
      "Invalid number",
      "Invalid country code",
      "Too short",
      "Too long",
      "Invalid number",
    ];

    // Initialize for each found phone input
    phoneInputs.forEach(function (input) {
      if (!input.id) {
        input.id = "phone-input-" + Math.floor(Math.random() * 10000);
      }

      // Initialize intl-tel-input with India as default
      const iti = window.intlTelInput(input, {
        loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js"),
        separateDialCode: true,
        initialCountry: "auto", // India as default
        geoIpLookup: callback => {
          fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(data => callback(data.country_code))
            .catch(() => callback("us"));
        },
        nationalMode: false,
        validationNumberTypes: ["FIXED_LINE_OR_MOBILE", "MOBILE", "FIXED_LINE"], // Accept all phone types
        allowDropdown: true, // Allow users to select country from dropdown
        autoPlaceholder: "polite", // Show placeholder based on country
        formatOnDisplay: true, // Format number on display
      });

      // Store iti instance in input's data
      input.iti = iti;

      // Add event listener for country change to update placeholder
      input.addEventListener("countrychange", function () {
        // Optional: Add specific logic when country changes
        // For example, update any country-specific validation rules
      });
    });

    // Global validation function for any phone input
    window.validatePhone = (phoneInput, phoneNumber) => {
      // Get the input element
      let input;
      if (typeof phoneInput === "string") {
        // If phoneInput is a string, assume it's an ID
        input = document.getElementById(phoneInput);
      } else if (phoneInput instanceof HTMLElement) {
        // If phoneInput is an element, use it directly
        input = phoneInput;
      } else {
        // Default to the first phone input on the page
        input =
          document.querySelector("input[type='tel']") ||
          document.querySelector(".phone-input");
      }

      if (!input) {
        console.error("No phone input found");
        return {
          isValid: false,
          message: "No phone input found",
        };
      }

      const iti = input.iti;
      if (!iti) {
        console.error(
          "International telephone input not initialized for this element"
        );
        return {
          isValid: false,
          message: "Phone validator not initialized",
        };
      }

      // If a phone number is provided, use it; otherwise, use the input value
      if (phoneNumber !== undefined) {
        input.value = phoneNumber;
        iti.setNumber(phoneNumber);
      }

      const number = input.value.trim();

      if (number) {
        if (iti.isValidNumber()) {
          // Get the raw number without country code
          const fullNumber = iti.getNumber();
          const countryCode = iti.getSelectedCountryData().dialCode;
          // Remove the "+" and country code from the full number to get just the phone number
          const phoneNumberOnly = fullNumber.substring(1 + countryCode.length);

          return {
            isValid: true,
            message: "Valid number",
            fullNumber: fullNumber,
            countryCode: countryCode,
            phoneNumber: phoneNumberOnly,
            countryIso: iti.getSelectedCountryData().iso2,
            countryName: iti.getSelectedCountryData().name,
            formatInternational: iti.getNumber(
              intlTelInputUtils.numberFormat.INTERNATIONAL
            ),
            formatNational: iti.getNumber(
              intlTelInputUtils.numberFormat.NATIONAL
            ),
          };
        } else {
          const errorCode = iti.getValidationError();
          const errorText = errorMap[errorCode] || "Invalid number";
          return {
            isValid: false,
            message: errorText,
            errorCode: errorCode,
          };
        }
      } else {
        return {
          isValid: false,
          message: "No phone number provided",
        };
      }
    };

    // Custom validation function with more lenient rules for specific countries
    window.validatePhoneCustom = (phoneInput, phoneNumber, options = {}) => {
      // Get standard validation first
      const standardValidation = window.validatePhone(phoneInput, phoneNumber);

      // If already valid, just return
      if (standardValidation.isValid) {
        return standardValidation;
      }

      // Get the input element and its iti instance
      let input;
      if (typeof phoneInput === "string") {
        input = document.getElementById(phoneInput);
      } else if (phoneInput instanceof HTMLElement) {
        input = phoneInput;
      } else {
        input =
          document.querySelector("input[type='tel']") ||
          document.querySelector(".phone-input");
      }

      if (!input || !input.iti) return standardValidation;
      const iti = input.iti;

      // Get current country
      const countryCode = iti.getSelectedCountryData().iso2?.toUpperCase();

      // Custom validation rules for specific countries
      if (countryCode === "US") {
        // For US numbers, accept if length is 10 digits (after removing non-digits)
        const digitsOnly = (phoneNumber || input.value).replace(/\D/g, "");

        // Check if it's 10 digits (excluding country code)
        if (digitsOnly.length === 10) {
          // Format the number properly
          const formattedNumber = `+1${digitsOnly}`;

          return {
            isValid: true,
            message: "Valid number (custom rule)",
            fullNumber: formattedNumber,
            countryCode: "1",
            phoneNumber: digitsOnly,
            countryIso: "US",
            countryName: "United States",
            formatInternational: `+1 ${digitsOnly.slice(
              0,
              3
            )} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`,
            formatNational: `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(
              3,
              6
            )}-${digitsOnly.slice(6)}`,
            customValidation: true,
          };
        }
      }

      // Add other country-specific rules as needed

      // If no custom rules matched, return the standard validation result
      return standardValidation;
    };

    // For backward compatibility and alternative naming
    window.validatePhoneNumber = window.validatePhone;
    window.testPhoneNumber = window.validatePhone;

    // Log success message
    console.log(
      "%c Phone Validator Ready!",
      "color: green; font-weight: bold;"
    );
    console.log(
      '%c Test with: window.validatePhone("phone-input-id", "+91 123 456 7890")',
      "color: blue;"
    );
    console.log(
      '%c For custom validation rules: window.validatePhoneCustom("phone-input-id", "+1 555 123 4567")',
      "color: purple;"
    );
  });
})();

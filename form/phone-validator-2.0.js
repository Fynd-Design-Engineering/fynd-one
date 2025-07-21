/**
 * Reliable Phone Validator Library
 * Uses custom validation rules as primary method with utils as fallback
 */

(function () {
  window.phoneValidator = {};

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      initializePhoneInputs();
    }, 100);
  });

  function initializePhoneInputs() {
    const phoneInputs = document.querySelectorAll(
      "input[type='tel'], .phone-input"
    );

    phoneInputs.forEach(function (input) {
      if (!input.id) {
        input.id = "phone-input-" + Math.floor(Math.random() * 10000);
      }

      try {
        const iti = window.intlTelInput(input, {
          utilsScript:
            "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
          separateDialCode: true,
          initialCountry: "auto",
          geoIpLookup: function (callback) {
            fetch("https://ipapi.co/json")
              .then((res) => res.json())
              .then((data) => callback(data.country_code))
              .catch(() => callback("in"));
          },
          nationalMode: false,
          allowDropdown: true,
          autoPlaceholder: "polite",
          formatOnDisplay: true,
        });

        input.iti = iti;

        input.addEventListener("countrychange", function () {
          console.log("Country changed to:", iti.getSelectedCountryData());
        });

        console.log("Phone input initialized:", input.id);
      } catch (error) {
        console.error("Failed to initialize phone input:", error);
      }
    });

    // Primary validation function - uses custom rules first, then falls back to utils
    window.validatePhone = (phoneInput, phoneNumber) => {
      let input = getPhoneInput(phoneInput);
      if (!input) {
        return { isValid: false, message: "No phone input found" };
      }

      const iti = input.iti;
      if (!iti) {
        return { isValid: false, message: "Phone validator not initialized" };
      }

      // Set the number if provided
      if (phoneNumber !== undefined) {
        input.value = phoneNumber;
        iti.setNumber(phoneNumber);
      }

      const number = input.value.trim();
      if (!number) {
        return { isValid: false, message: "No phone number provided" };
      }

      // Try custom validation first (most reliable)
      const customResult = validateWithCustomRules(input, number, iti);
      if (customResult.isValid) {
        return customResult;
      }

      // Fallback to standard validation if custom rules don't match
      try {
        if (iti.isValidNumber && iti.isValidNumber()) {
          const fullNumber = iti.getNumber();
          const countryData = iti.getSelectedCountryData();
          const countryCode = countryData.dialCode;

          return {
            isValid: true,
            message: "Valid number (standard validation)",
            fullNumber: fullNumber,
            countryCode: countryCode,
            phoneNumber: fullNumber.substring(1 + countryCode.length),
            countryIso: countryData.iso2,
            countryName: countryData.name,
            validationMethod: "standard",
          };
        }
      } catch (error) {
        console.warn("Standard validation failed:", error);
      }

      // If both methods fail, return the custom validation result (which explains why it failed)
      return customResult;
    };

    // Custom validation rules for different countries
    function validateWithCustomRules(input, number, iti) {
      const countryData = iti.getSelectedCountryData();
      const countryCode = countryData.iso2?.toUpperCase();
      const digitsOnly = number.replace(/\D/g, "");

      // United States validation
      if (countryCode === "US") {
        if (digitsOnly.length === 10 && /^[2-9]/.test(digitsOnly)) {
          return {
            isValid: true,
            message: "Valid US number",
            fullNumber: `+1${digitsOnly}`,
            countryCode: "1",
            phoneNumber: digitsOnly,
            countryIso: "us",
            countryName: "United States",
            formatInternational: `+1 ${digitsOnly.slice(
              0,
              3
            )} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`,
            formatNational: `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(
              3,
              6
            )}-${digitsOnly.slice(6)}`,
            validationMethod: "custom",
          };
        } else {
          return {
            isValid: false,
            message:
              digitsOnly.length !== 10
                ? `US numbers must be 10 digits (got ${digitsOnly.length})`
                : "US numbers cannot start with 0 or 1",
          };
        }
      }

      // India validation
      if (countryCode === "IN") {
        if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
          return {
            isValid: true,
            message: "Valid Indian mobile number",
            fullNumber: `+91${digitsOnly}`,
            countryCode: "91",
            phoneNumber: digitsOnly,
            countryIso: "in",
            countryName: "India",
            formatInternational: `+91 ${digitsOnly.slice(
              0,
              5
            )} ${digitsOnly.slice(5)}`,
            formatNational: `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`,
            validationMethod: "custom",
          };
        } else {
          return {
            isValid: false,
            message:
              digitsOnly.length !== 10
                ? `Indian mobile numbers must be 10 digits (got ${digitsOnly.length})`
                : "Indian mobile numbers must start with 6, 7, 8, or 9",
          };
        }
      }

      // United Kingdom validation
      if (countryCode === "GB") {
        // UK mobile numbers (07xxx xxxxxx)
        if (digitsOnly.length === 11 && digitsOnly.startsWith("07")) {
          return {
            isValid: true,
            message: "Valid UK mobile number",
            fullNumber: `+44${digitsOnly.slice(1)}`,
            countryCode: "44",
            phoneNumber: digitsOnly.slice(1),
            countryIso: "gb",
            countryName: "United Kingdom",
            validationMethod: "custom",
          };
        }
        // UK landline numbers (01xxx or 02xxx)
        if (
          digitsOnly.length >= 10 &&
          digitsOnly.length <= 11 &&
          /^0[12]/.test(digitsOnly)
        ) {
          return {
            isValid: true,
            message: "Valid UK landline number",
            fullNumber: `+44${digitsOnly.slice(1)}`,
            countryCode: "44",
            phoneNumber: digitsOnly.slice(1),
            countryIso: "gb",
            countryName: "United Kingdom",
            validationMethod: "custom",
          };
        }
      }

      // Australia validation
      if (countryCode === "AU") {
        // Australian mobile numbers (04xx xxx xxx)
        if (digitsOnly.length === 10 && digitsOnly.startsWith("04")) {
          return {
            isValid: true,
            message: "Valid Australian mobile number",
            fullNumber: `+61${digitsOnly.slice(1)}`,
            countryCode: "61",
            phoneNumber: digitsOnly.slice(1),
            countryIso: "au",
            countryName: "Australia",
            validationMethod: "custom",
          };
        }
      }

      // Canada validation (same as US)
      if (countryCode === "CA") {
        if (digitsOnly.length === 10 && /^[2-9]/.test(digitsOnly)) {
          return {
            isValid: true,
            message: "Valid Canadian number",
            fullNumber: `+1${digitsOnly}`,
            countryCode: "1",
            phoneNumber: digitsOnly,
            countryIso: "ca",
            countryName: "Canada",
            validationMethod: "custom",
          };
        }
      }

      // If no custom rules match, return invalid
      return {
        isValid: false,
        message: `No validation rules for ${
          countryData.name || "this country"
        }`,
      };
    }

    // Helper function to get phone input
    function getPhoneInput(phoneInput) {
      if (typeof phoneInput === "string") {
        return (
          document.getElementById(phoneInput) ||
          document.querySelector(phoneInput)
        );
      } else if (phoneInput instanceof HTMLElement) {
        return phoneInput;
      } else {
        return (
          document.querySelector("#phone-number") ||
          document.querySelector("input[type='tel']")
        );
      }
    }

    // Async version that waits for utils (but still uses custom rules first)
    window.validatePhoneAsync = async (phoneInput, phoneNumber) => {
      // Wait a bit for utils to load
      let attempts = 0;
      while (!window.intlTelInputUtils && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      return window.validatePhone(phoneInput, phoneNumber);
    };

    // Keep the old custom validation function for backward compatibility
    window.validatePhoneCustom = window.validatePhone;

    // Country code update function
    window.updateCountryCode = () => {
      const phoneInput = document.querySelector("#phone-number");
      const countryCodeInput = document.querySelector("#country-code");

      if (!phoneInput || !countryCodeInput) return;

      try {
        if (phoneInput.iti) {
          const countryData = phoneInput.iti.getSelectedCountryData();
          countryCodeInput.value = "+" + countryData.dialCode;
          return countryData.dialCode;
        }
      } catch (error) {
        console.error("Error updating country code:", error);
      }

      countryCodeInput.value = "+91";
      return "91";
    };

    // For backward compatibility
    window.validatePhoneNumber = window.validatePhone;
    window.testPhoneNumber = window.validatePhone;

    // console.log(
    //   "%c Reliable Phone Validator Ready! 🚀",
    //   "color: green; font-weight: bold;"
    // );
    // console.log("✅ Uses custom validation rules as primary method");
    // console.log("✅ Falls back to standard validation when available");
    // console.log("✅ Supports: US, India, UK, Australia, Canada");
  }
})();

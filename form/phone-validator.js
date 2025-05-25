/**
 * Phone Validator Library
 * A simplified version of the International Telephone Input with India as default
 * Uses intl-tel-input v25.3.1 with country search functionality
 */

// Initialize the phone validator when the script loads
(function () {
  // Create global phoneValidator object to be accessible from anywhere
  window.phoneValidator = {};
  
  // Store utils reference globally once loaded
  let intlTelInputUtils = null;
  let utilsLoadPromise = null;

  // Function to load utils properly for v25.3.1
  function loadUtils() {
    if (utilsLoadPromise) {
      return utilsLoadPromise;
    }

    utilsLoadPromise = new Promise(async (resolve) => {
      try {
        // For intl-tel-input v25.3.1, we need to use the UMD version for script tags
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.umd.js";
        script.type = "text/javascript";
        
        script.onload = () => {
          // The UMD version should expose intlTelInputUtils globally
          if (window.intlTelInputUtils) {
            intlTelInputUtils = window.intlTelInputUtils;
            console.log("Utils loaded successfully via UMD");
            resolve(intlTelInputUtils);
          } else {
            console.warn("UMD utils loaded but not found globally, trying alternative");
            // Fallback to loading via fetch and eval (not ideal but works)
            loadUtilsViaFetch().then(resolve);
          }
        };
        
        script.onerror = () => {
          console.warn("UMD script loading failed, trying fetch method");
          loadUtilsViaFetch().then(resolve);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.warn("Script loading failed:", error);
        loadUtilsViaFetch().then(resolve);
      }
    });

    return utilsLoadPromise;
  }

  // Alternative method to load utils via fetch
  async function loadUtilsViaFetch() {
    try {
      const response = await fetch("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.umd.js");
      const code = await response.text();
      
      // Create a safe evaluation context
      const script = document.createElement('script');
      script.textContent = code;
      document.head.appendChild(script);
      
      // Check if utils are now available
      if (window.intlTelInputUtils) {
        intlTelInputUtils = window.intlTelInputUtils;
        console.log("Utils loaded via fetch method");
        return intlTelInputUtils;
      }
    } catch (error) {
      console.warn("Fetch method also failed:", error);
    }
    
    console.warn("All utils loading methods failed - validation will work with basic formatting");
    return null;
  }

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

      // Initialize intl-tel-input with all modern features including search
      const iti = window.intlTelInput(input, {
        // Load utils properly
        loadUtils: () => loadUtils(),
        
        // Core settings
        separateDialCode: true,
        initialCountry: "auto",
        
        // Geo IP lookup with India as fallback
        geoIpLookup: callback => {
          fetch("https://ipapi.co/json")
            .then(res => res.json())
            .then(data => callback(data.country_code))
            .catch(() => callback("in"));
        },
        
        // Validation settings
        nationalMode: false,
        validationNumberTypes: ["FIXED_LINE_OR_MOBILE", "MOBILE", "FIXED_LINE"],
        
        // UI settings for modern experience
        allowDropdown: true,
        countrySearch: true, // Enable country search - key feature!
        autoPlaceholder: "aggressive",
        formatOnDisplay: true,
        
        // Additional modern features
        showFlags: true,
        containerClass: "iti",
        dropdownContainer: null, // Use default positioning
        
        // Exclude countries if needed (optional)
        // excludeCountries: ["us", "ca"], // Example: exclude US and Canada
        
        // Only include specific countries if needed (optional)
        // onlyCountries: ["in", "us", "gb", "au"], // Example: only these countries
        
        // Custom placeholder text (optional)
        customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
          return "e.g. " + selectedCountryPlaceholder;
        },
      });

      // Store iti instance in input's data
      input.iti = iti;

      // Add event listeners
      input.addEventListener("countrychange", function () {
        console.log("Country changed to:", iti.getSelectedCountryData());
        // Optional: Add specific logic when country changes
        // You can trigger validation here if needed
      });

      // Optional: Add real-time validation on input
      input.addEventListener("input blur", function () {
        // Remove any existing error styling
        input.classList.remove("error");
        
        // Optional: Add real-time validation feedback
        if (input.value.trim()) {
          const validation = window.validatePhone(input);
          if (!validation.isValid) {
            input.classList.add("error");
            console.log("Validation error:", validation.message);
          }
        }
      });
    });

    // Helper function to safely format numbers
    function safeFormatNumber(iti, format) {
      try {
        if (intlTelInputUtils && format && intlTelInputUtils.numberFormat) {
          return iti.getNumber(format);
        }
        return iti.getNumber(); // Default E164 format
      } catch (e) {
        console.warn("Formatting failed, using default:", e);
        return iti.getNumber();
      }
    }

    // Main validation function
    window.validatePhone = (phoneInput, phoneNumber) => {
      // Get the input element
      let input;
      if (typeof phoneInput === "string") {
        input = document.getElementById(phoneInput);
      } else if (phoneInput instanceof HTMLElement) {
        input = phoneInput;
      } else {
        input = document.querySelector("input[type='tel']") || document.querySelector(".phone-input");
      }

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

      if (iti.isValidNumber()) {
        const fullNumber = iti.getNumber();
        const countryData = iti.getSelectedCountryData();
        const countryCode = countryData.dialCode;
        const phoneNumberOnly = fullNumber.substring(1 + countryCode.length);

        // Format numbers safely
        const formatInternational = safeFormatNumber(iti, intlTelInputUtils?.numberFormat?.INTERNATIONAL);
        const formatNational = safeFormatNumber(iti, intlTelInputUtils?.numberFormat?.NATIONAL);

        return {
          isValid: true,
          message: "Valid number",
          fullNumber: fullNumber,
          countryCode: countryCode,
          phoneNumber: phoneNumberOnly,
          countryIso: countryData.iso2,
          countryName: countryData.name,
          formatInternational: formatInternational,
          formatNational: formatNational,
          numberType: iti.getNumberType?.() || "unknown",
        };
      } else {
        const errorCode = iti.getValidationError();
        return {
          isValid: false,
          message: errorMap[errorCode] || "Invalid number",
          errorCode: errorCode,
        };
      }
    };

    // Async validation that ensures utils are loaded
    window.validatePhoneAsync = async (phoneInput, phoneNumber) => {
      if (!intlTelInputUtils) {
        await loadUtils();
      }
      return window.validatePhone(phoneInput, phoneNumber);
    };

    // Enhanced custom validation with more countries
    window.validatePhoneCustom = (phoneInput, phoneNumber, options = {}) => {
      const standardValidation = window.validatePhone(phoneInput, phoneNumber);

      if (standardValidation.isValid) {
        return standardValidation;
      }

      // Get input and iti instance
      let input;
      if (typeof phoneInput === "string") {
        input = document.getElementById(phoneInput);
      } else if (phoneInput instanceof HTMLElement) {
        input = phoneInput;
      } else {
        input = document.querySelector("input[type='tel']") || document.querySelector(".phone-input");
      }

      if (!input?.iti) return standardValidation;
      
      const iti = input.iti;
      const countryCode = iti.getSelectedCountryData().iso2?.toUpperCase();
      const phoneNum = phoneNumber || input.value;
      const digitsOnly = phoneNum.replace(/\D/g, "");

      // Custom rules for different countries
      switch (countryCode) {
        case "US":
          if (digitsOnly.length === 10 && /^[2-9]/.test(digitsOnly)) {
            return {
              isValid: true,
              message: "Valid US number (custom rule)",
              fullNumber: `+1${digitsOnly}`,
              countryCode: "1",
              phoneNumber: digitsOnly,
              countryIso: "us",
              countryName: "United States",
              formatInternational: `+1 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`,
              formatNational: `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`,
              customValidation: true,
            };
          }
          break;

        case "IN":
          if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
            return {
              isValid: true,
              message: "Valid Indian mobile number (custom rule)",
              fullNumber: `+91${digitsOnly}`,
              countryCode: "91",
              phoneNumber: digitsOnly,
              countryIso: "in",
              countryName: "India",
              formatInternational: `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`,
              formatNational: `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`,
              customValidation: true,
            };
          }
          break;

        case "GB":
          if (digitsOnly.length === 11 && digitsOnly.startsWith("07")) {
            return {
              isValid: true,
              message: "Valid UK mobile number (custom rule)",
              fullNumber: `+44${digitsOnly.slice(1)}`,
              countryCode: "44",
              phoneNumber: digitsOnly.slice(1),
              countryIso: "gb",
              countryName: "United Kingdom",
              customValidation: true,
            };
          }
          break;
      }

      return standardValidation;
    };

    // Utility function to get all country data
    window.getPhoneCountries = () => {
      const firstInput = document.querySelector("input[type='tel']") || document.querySelector(".phone-input");
      if (firstInput?.iti) {
        return firstInput.iti.getCountryData();
      }
      return [];
    };

    // For backward compatibility
    window.validatePhoneNumber = window.validatePhone;
    window.testPhoneNumber = window.validatePhone;

    // Pre-load utils
    setTimeout(() => {
      loadUtils().then((utils) => {
        if (utils) {
          console.log("%c Phone Validator Utils Loaded Successfully! 🎉", "color: green; font-weight: bold;");
          console.log("Available features: validation, formatting, country search");
        } else {
          console.log("%c Phone Validator Ready (basic mode) ⚡", "color: orange; font-weight: bold;");
          console.log("Note: Advanced formatting unavailable, but validation works");
        }
      });
    }, 500);

    console.log("%c Phone Validator v25.3.1 Initialized! 📞", "color: blue; font-weight: bold;");
    console.log("✅ Country search enabled");
    console.log("✅ Modern UI with flags");
    console.log("✅ Auto geo-location");
    console.log('🧪 Test: window.validatePhone("input-id", "+91 98765 43210")');
  });
})();

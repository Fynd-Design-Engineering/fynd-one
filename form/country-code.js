// $(document).ready(function () {
//   $("input[ms-code-phone-number]").each(function () {
//     var input = this;
//     var preferredCountries = $(input).attr("ms-code-phone-number").split(",");

//     var iti = window.intlTelInput(input, {
//       preferredCountries: preferredCountries,
//       utilsScript:
//         "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
//     });

//     function updateCountryCode() {
//       var selectedCountry = iti.getSelectedCountryData();
//       var formattedCountryCode = `+${
//         selectedCountry.dialCode
//       }(${selectedCountry.iso2.toUpperCase()})`;
//       $("#country-code").val(formattedCountryCode);
//       console.log("Updated Country Code:", formattedCountryCode);
//     }

//     // Set the country code field on load (using IP lookup)
//     $.get(
//       "https://ipinfo.io",
//       function (response) {
//         var countryCode = response.country;
//         iti.setCountry(countryCode);
//         updateCountryCode(); // Update after setting country
//       },
//       "jsonp"
//     );

//     // Update the country code field when the user selects a different country
//     input.addEventListener("countrychange", function () {
//       updateCountryCode();
//     });

//     // Format phone number on input change or keyup
//     input.addEventListener("change", formatPhoneNumber);
//     input.addEventListener("keyup", formatPhoneNumber);

//     function formatPhoneNumber() {
//       var formattedNumber = iti.getNumber(
//         intlTelInputUtils.numberFormat.NATIONAL
//       );
//       input.value = formattedNumber;
//     }

//     var form = $(input).closest("form");
//     form.submit(function () {
//       var formattedNumber = iti.getNumber(
//         intlTelInputUtils.numberFormat.INTERNATIONAL
//       );
//       input.value = formattedNumber;
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the plugin
  var input = document.querySelector("#phone");
  var countryCodeInput = document.querySelector("#country-code");

  // Initialize the intlTelInput with geolocation
  var iti = window.intlTelInput(input, {
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
    separateDialCode: true,
    initialCountry: "auto",
    geoIpLookup: function (callback) {
      // Use ipinfo.io to get the user's country code
      fetch("https://ipinfo.io/json")
        .then((response) => response.json())
        .then((data) => {
          callback(data.country.toLowerCase());
        })
        .catch(() => {
          // Default to US if geolocation fails
          callback("us");
        });
    },
  });

  // Update the hidden country code input when country changes
  input.addEventListener("countrychange", function () {
    var countryData = iti.getSelectedCountryData();
    countryCodeInput.value = countryData.dialCode;
  });

  // Trigger country change once on initialization to set initial values
  setTimeout(function () {
    var countryData = iti.getSelectedCountryData();
    countryCodeInput.value = countryData.dialCode;
  }, 100);
});

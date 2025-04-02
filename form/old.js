$(document).ready(function () {
  var input = document.querySelector("#phone"),
    dialCode = document.querySelector(".dialCode"),
    errorMsg = document.querySelector("#error-msg"),
    validMsg = document.querySelector("#valid-msg");

  var iti = intlTelInput(input, {
    initialCountry: "auto",
    strictMode: true,
    geoIpLookup: (callback) => {
      fetch("https://ipapi.co/json")
        .then((res) => res.json())
        .then((data) => callback(data.country_code))
        .catch(() => callback("in"));
    },
  });

  var updateInputValue = function (event) {
    dialCode.value = "+" + iti.getSelectedCountryData().dialCode;
  };
  input.addEventListener("input", updateInputValue, false);
  input.addEventListener("countrychange", updateInputValue, false);

  var errorMap = [
    "Please enter the valid phone number",
    "Invalid country code",
    "Too short",
    "Too long",
    "Invalid number",
  ];

  var reset = function () {
    input.classList.remove("error");
    errorMsg.innerHTML = "";
    errorMsg.classList.add("errorhide");
    validMsg.classList.add("errorhide");
  };

  // Regular expression for validating phone numbers
  var phoneRegex = /^(?:[0-9]●?){6,14}[0-9]$/;

  // Function to validate phone number
  function isValidPhoneNumber(phoneNumber) {
    return phoneRegex.test(phoneNumber);
  }

  input.addEventListener("blur", function () {
    reset();
    var phoneNumber = $(this).val();
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      $(this).addClass("invalid");
    } else {
      $(this).removeClass("invalid");
    }
    if (input.value.trim()) {
      if (iti.isValidNumber()) {
        validMsg.classList.remove("errorhide");
      } else {
        input.classList.add("error");
        var errorCode = iti.getValidationError();
        errorMsg.innerHTML = errorMap[errorCode];
        errorMsg.classList.remove("errorhide");
      }
    }
  });

  input.addEventListener("change", reset);
  input.addEventListener("keyup", reset);

  $(":input[required]").blur(function () {
    if ($(this).val() === "") {
      $(this).addClass("invalid");
    } else {
      $(this).removeClass("invalid");
    }
  });

  // form validation
  $("[data-validate-form='true']").each(function () {
    $(this).validate({
      errorPlacement: function (error, element) {
        error.appendTo(element.closest("[data-errorplace='true']"));
      },
    });
  });

  // Form validation when the form has data-validate-form="true"
  $("[data-validate-form='true']").on("submit", function (e) {
    var requiredFields = $(":input[required]");
    var isValid = true;
    requiredFields.each(function () {
      if ($(this).val() === "") {
        $(this).addClass("invalid");
        isValid = false;
      } else {
        $(this).removeClass("invalid");
      }
    });

    // Combine phone parts into the #fullPhone input
    $("#fullPhone").val(`${$("#dialCode").val()} ${$("#phone").val()}`);

    if (!isValid) {
      e.preventDefault();
    }
  });

  // Redirect to thank you page and Calendly for forms with data-form="speak-expert"
  $("[data-form='speak-expert']").on("submit", function (event) {
    const form = $(this).get(0);
    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("name");
    const formBtn = document.getElementById("form-btn");
    let originalText = formBtn.value;

    if (form.checkValidity() === false) {
      event.preventDefault(); // Prevent form submission
    } else {
      event.preventDefault(); // Prevent form submission
      let URL = "https://calendly.com/d/ckd3-yjg-zkt/speak-to-a-fynd-expert"; // Change the URL

      // 🔥
      formBtn.value = "Redirecting...";

      setTimeout(() => {
        window.open(emailURL);
        formBtn.value = originalText;
      }, 1000);

      // Redirect to the thank you page after 5 seconds
      setTimeout(function () {
        window.location.href = "/thank-you";
      }, 3000);
    }
  });

  // For forms with both attributes (validation and redirection)
  $("[data-validate-form='true'][data-form='speak-expert']").on(
    "submit",
    function (event) {
      var requiredFields = $(":input[required]");
      var isValid = true;
      requiredFields.each(function () {
        if ($(this).val() === "") {
          $(this).addClass("invalid");
          isValid = false;
        } else {
          $(this).removeClass("invalid");
        }
      });

      if (!isValid) {
        event.preventDefault(); // Prevent form submission if validation fails
        return;
      }

      // Proceed with redirection if validation passes
      const form = $(this).get(0);
      const emailInput = document.getElementById("email");
      const nameInput = document.getElementById("name");
      const formBtn = document.getElementById("form-btn");
      let originalText = formBtn.value;

      event.preventDefault(); // Prevent form submission
      let URL = "https://calendly.com/d/ckd3-yjg-zkt/speak-to-a-fynd-expert"; // Change the URL

      let emailURL = `${URL}?email=${encodeURIComponent(
        emailInput.value
      )}&name=${encodeURIComponent(nameInput.value)}`;

      formBtn.value = "Redirecting...";

      setTimeout(() => {
        window.open(emailURL);
        formBtn.value = originalText;
      }, 2000);

      // Redirect to the thank you page after 5 seconds
      setTimeout(function () {
        window.location.href = "/thank-you";
      }, 5000);
    }
  );
});

// Combined event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Capture date only for forms with the attribute data-form="speak-expert"
  const form = document.querySelector('[data-form="speak-expert"]');
  if (form) {
    form.addEventListener("submit", function (event) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const dateInput = document.getElementById("current-date");
      if (dateInput) {
        dateInput.value = formattedDate;
      }
    });
  }

  // Capture page title
  const pageName = document.title;
  const pageNameInput = document.getElementById("pageName");
  if (pageNameInput) {
    pageNameInput.value = pageName;
  }
});

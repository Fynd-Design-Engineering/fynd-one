let currentStep = 1; // Global variable to track current slide
let stepperForm; // Store Swiper instance globally
let formData = [];
let isValid = false;
let isButtonClicked = false;

document.addEventListener("DOMContentLoaded", function () {
  removeSelectFieldDivs();
  updatePageInfoField();
  initStepperSlides();
  initFormData();
  checkDuplicateIds();

  document.querySelectorAll("[fynd-form='field']").forEach((input) => {
    input.addEventListener("change", function () {
      if (isButtonClicked) {
        updateFormData();
        stepFormValidation(currentStep);
      }
    });
  });

  document
    .querySelector("[fynd-form='button']")
    .addEventListener("click", function () {
      updateFormData();
      isValid = stepFormValidation(currentStep);

      if (!isValid) {
        // If invalid, show error message
        console.log(
          "%cform/main.js:12 Validation failed. Please check your inputs.",
          "color: red; font-size: 16px; font-weight: bold;"
        );
        isButtonClicked = true;
      } else {
        console.log(
          "%cform/main.js:12 Validation passed. Proceeding to next step.",
          "color: green; font-size: 16px; font-weight: bold;"
        );
        // If valid, proceed to the next step
        checkStepper(currentStep);
        isButtonClicked = false;
      }
    });
});

function checkStepper(step) {
  // Move to the next slide if possible
  if (stepperForm && stepperForm.activeIndex < stepperForm.slides.length - 1) {
    stepperForm.slideNext();
  }
  console.log("%cform/main.js:13 currentStep", "color: #007acc;", currentStep);
}

function initStepperSlides() {
  stepperForm = new Swiper("[fynd-form='slider']", {
    loop: false,
    navigation: {
      nextEl: "[fynd-form='next']",
      prevEl: "[fynd-form='prev']",
    },
    effect: "fade", // Enables fade effect
    fadeEffect: {
      crossFade: true, // Smooth fade transition
    },
    keyboard: {
      enabled: true, // Enable keyboard navigation
      onlyInViewport: true, // Navigation works only if Swiper is in viewport
    },
    pagination: {
      el: "[fynd-form='pagination']",
      type: "progressbar",
      clickable: false,
    },
    slidesPerView: 1,
    spaceBetween: 10,
    allowTouchMove: false, // Disable touch/swipe movements
    on: {
      slideChange: function () {
        currentStep = this.realIndex + 1; // Update global variable
      },
    },
  });
  console.log("%cform/main.js:37 currenstStep", "color: #007acc;", currentStep);
}

function initFormData() {
  document.querySelectorAll('[fynd-form="field"]').forEach((field) => {
    let item = {
      name: field.getAttribute("name") || "",
      id: field.getAttribute("id") || "",
      type: field.getAttribute("type") || "",
      step: field.getAttribute("form-step") || "",
      required: field.getAttribute("isRequired") || "",
      value: field.value || "",
    };
    formData.push(item);
  });

  console.log(formData); // Output the JSON data
  return formData;
}

function updateFormData() {
  document.querySelectorAll('[fynd-form="field"]').forEach((field) => {
    let id = field.getAttribute("id");
    let item = formData.find((f) => f.id === id);
    if (item) {
      item.value = field.value;
    }
  });
  console.log("Updated Form Data:", formData);
}

function checkDuplicateIds() {
  let idMap = new Map();
  let duplicateIds = [];

  formData.forEach((item) => {
    if (idMap.has(item.id)) {
      duplicateIds.push(item.id);
    } else {
      idMap.set(item.id, true);
    }
  });

  if (duplicateIds.length > 0) {
    console.log(
      "%c WARNING: Duplicate IDs found 💀. nothing will work. 🥲",
      "color: red; font-size: 16px; font-weight: bold; background: white; padding: 5px;"
    );
    console.log(
      "%c Duplicate IDs:",
      "color: red; font-size: 14px; font-weight: bold;"
    );
    duplicateIds.forEach((id) => {
      console.log(
        `%c ${id}`,
        "color: white; background: red; padding: 2px 5px; border-radius: 3px;"
      );
    });
  }
}

function updatePageInfoField() {
  const inputField = document.querySelector(
    'input[fynd-field-type="page-info"]'
  );
  if (!inputField) return;

  inputField.name = "Page Info";
  inputField.type = "hidden";
  inputField.id = window.location.pathname;
  inputField.value = window.location.href;
}

function removeSelectFieldDivs() {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('select[fynd-form="field"]').forEach((select) => {
      // Find and remove any <div> inside the <select>
      select.querySelectorAll("div").forEach((div) => div.remove());
    });
  });
}
function showError(field, message) {
  const inputField = document.getElementById(field.id);
  if (inputField) {
    // Remove previous error message if it exists
    removeError(field);

    console.log(message);
    inputField.setAttribute("aria-invalid", "true");

    // Create and append error message
    const errorMessage = document.createElement("span");
    errorMessage.className = "fynd-form-error";
    errorMessage.textContent = message;

    inputField.parentElement.appendChild(errorMessage);
  }
}

function removeError(field) {
  const inputField = document.getElementById(field.id);
  if (inputField) {
    inputField.setAttribute("aria-invalid", "false");

    // Remove existing error message if present
    let errorElement =
      inputField.parentElement.querySelector(".fynd-form-error");
    if (errorElement) {
      errorElement.remove();
    }
  }
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function stepFormValidation(stepNumber) {
  const fieldsToValidate = formData.filter(
    (field) => field.step === String(stepNumber)
  );
  const requiredFields = fieldsToValidate.filter(
    (field) => field.required === "true"
  );

  let isValid = true; // Assume form is valid initially

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showError(field, `${field.name} cannot be empty.`);
      isValid = false; // Mark form as invalid
    } else {
      removeError(field);
    }
  });

  // Validate email fields
  const emailFields = fieldsToValidate.filter(
    (field) => field.type === "email"
  );
  emailFields.forEach((field) => {
    if (field.value.trim() && !isValidEmail(field.value.trim())) {
      showError(field, `Please enter a valid email address.`);
      isValid = false;
    }
  });

  return isValid; // Return true if no errors, false otherwise
}

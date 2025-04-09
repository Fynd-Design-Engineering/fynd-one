let currentStep = 1; // Global variable to track current slide
let stepperForm; // Store Swiper instance globally
let formData = [];
let isValid = false;
let isButtonClicked = false;
let totalSteps = 0;
let prevStep = 0;
let formConfigs = [];

document.addEventListener("DOMContentLoaded", function () {
  getTotalSteps();
  removeSelectFieldDivs();
  updateButtonText();
  updatePageInfoField();
  initStepperSlides();
  initFormData();
  checkDuplicateIds();
  updateStepTitle();
  checkMissingClones();
  getFormType();

  document.querySelectorAll("[fynd-form='field']").forEach((input) => {
    input.addEventListener("change", function () {
      if (isButtonClicked) {
        updateFormData();
        stepFormValidation(currentStep);
      }
    });
  });

  const button = document.querySelector("[fynd-form='button']");
  if (button) {
    button.addEventListener("click", function () {
      updateFormData();
      isValid = stepFormValidation(currentStep);

      if (!isValid) {
        console.log(
          "%cform/main.js:12 Validation failed. Please check your inputs.",
          "color: red; font-size: 16px; font-weight: bold;"
        );
        isButtonClicked = true;
        handleFormSubmit();
      } else {
        console.log(
          "%cform/main.js:12 Validation passed. Proceeding to next step.",
          "color: green; font-size: 16px; font-weight: bold;"
        );
        handleFormSubmit();
        checkStepper(currentStep);
        isButtonClicked = false;
      }
    });
  } else {
    console.warn("Element with [fynd-form='button'] not found.");
  }
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
      enabled: false, // Enable keyboard navigation
      onlyInViewport: false, // Navigation works only if Swiper is in viewport
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
        updateButtonText();
        updateStepTitle();
      },
    },
  });
  // console.log("%cform/main.js:37 currenstStep", "color: #007acc;", currentStep);
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
  // console.log("Updated Form Data:", formData);
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

function getTotalSteps() {
  totalSteps = document.querySelectorAll("[fynd-form-step]").length;
  console.log(`totalSteps: ${totalSteps}`);
}

function updateButtonText() {
  const buttonTextElement = document.querySelector("[fynd-form='button-text']");

  if (buttonTextElement) {
    // Check if the element exists
    buttonTextElement.innerHTML =
      currentStep === totalSteps ? "Submit" : "Next";
  } else {
    console.warn("Element with [fynd-form='button-text'] not found.");
  }
}
function updateStepTitle() {
  const titleElement = document.querySelector('[fynd-form-field="title"]');
  if (titleElement && totalSteps > 1) {
    titleElement.textContent = `Step ${currentStep}/${totalSteps}`;
  } else {
    console.warn('Element with fynd-form-field="title" not found');
  }
}

function handleFormSubmit() {
  if (validateFormData(formData)) {
    if (currentStep == totalSteps) {
      console.log(
        "%cform/main.js:12 Looking good. initiating form submission",
        "color: yellow; font-size: 16px; font-weight: bold;"
      );
      submitForm();
      let isSubmitted = true;
      if (isSubmitted) {
        document.querySelector('[fynd-form-state="normal"]').style.display =
          "none";
        document.querySelector('[fynd-form-state="success"]').style.display =
          "flex";
        console.log(
          "%cform/main.js:286 isSubmitted",
          "color: #007acc;",
          isSubmitted
        );
      }
    } else {
      console.log("dont submit");
    }
  } else {
    console.log(
      "%cform/main.js:272 only valid forms will be submitted",
      "color:rgb(204, 0, 0);",
      isValid
    );
  }
}

function validateFormData(formData) {
  return formData.every((field) => {
    if (field.required === "true") {
      return field.value.trim() !== "";
    }
    return true;
  });
}

//give form submission data here
function submitForm() {
  fillWebflowForm();
  document.getElementById("real-submit").click(); //submitting webflow form
  console.log(
    "%cform/main.js:284 Form Submitted",
    "color:rgb(0, 255, 115);",
    formData
  );

  setTimeout(() => {
    handlePostSubmit();
    setTimeout(() => {
      clearFormData(formData);
    }, 1000);
  }, 500);

  return true;
}
function clearFormData(formData) {
  return formData.map((field) => {
    if (field.type !== "hidden") {
      // Clear value in the object
      field.value = "";

      // Clear value in the actual input field if it exists
      const inputElement = document.getElementById(field.id);
      if (inputElement) {
        inputElement.value = "";
      }
    }
    return field;
  });
}

function checkMissingClones() {
  formData.forEach((field) => {
    const cloneId = `${field.id}-clone`;
    if (!document.getElementById(cloneId)) {
      console.log(
        `%cClone for '${field.id}' is missing!`,
        "background: yellow; color: black; font-weight: bold; padding: 4px;"
      );
      field["webflow-id"] = "webflow id is unavailable";
    } else {
      console.log(`found input clone ${cloneId}`);
      field["webflow-id"] = cloneId;
    }
  });
}

function fillWebflowForm() {
  formData.forEach((field) => {
    if (
      field["webflow-id"] &&
      field["webflow-id"] !== "webflow id is unavailable"
    ) {
      const element = document.getElementById(field["webflow-id"]);
      if (element) {
        element.value = field.value || "";
      }
    }
  });
}

function generateCalendlyURL() {
  const baseURL = "https://calendly.com/d/ckd3-yjg-zkt/speak-to-a-fynd-expert";

  // Extract name and email from formData
  const nameField = formData.find((field) => field.id === "first-name");
  const lastNameField = formData.find((field) => field.id === "last-name");
  const emailField = formData.find((field) => field.id === "email");

  if (!nameField || !lastNameField || !emailField) {
    console.error("Required fields missing in formData");
    return;
  }

  const fullName = `${nameField.value} ${lastNameField.value}`.trim();
  const email = emailField.value;

  // Construct the Calendly URL with parameters
  const updatedURL = `${baseURL}?email=${encodeURIComponent(
    email
  )}&name=${encodeURIComponent(fullName)}`;

  console.log("Updated Calendly URL:", updatedURL);
  return updatedURL;
}

function getRedirectionURL() {
  const redirectionURL = document
    .querySelector("[fynd-form-redirect]")
    .getAttribute("href");
  if (redirectionURL && redirectionURL != "") {
    console.log(redirectionURL);
    return redirectionURL;
  } else {
    console.log("No redirection URLs found");
  }
}

//this funciton will be called based on the form type
function footerFormRedirection() {
  const calendlyURL = generateCalendlyURL();
  if (calendlyURL) {
    window.open(calendlyURL, "_blank");
  }
  const redirectionURL = getRedirectionURL();
  if (redirectionURL) {
    window.location.href = redirectionURL;
  }
}
function redirectPage() {
  const redirectURL = getRedirectionURL();
  if (redirectURL) {
    window.location.href = redirectURL;
  } else {
    console.log("%cform/main.js:422 redirect not found", "color: #007acc;");
  }
}

function getFormType() {
  document.querySelectorAll("[fynd-form-name]").forEach((formInfo) => {
    const formName = formInfo.getAttribute("fynd-form-name");
    const formFunction = formInfo.getAttribute("fynd-form-function");
    const WebflowID = formInfo.getAttribute("fynd-form-id");

    if (formName && formFunction) {
      formConfigs.push({ formName, formFunction, WebflowID });
    }
  });
  console.log(formConfigs);
}

function handlePostSubmit() {
  const formConfig = formConfigs[0]; // Take the first object
  if (typeof window !== "undefined" && formConfig.formFunction) {
    try {
      eval(formConfig.formFunction);
    } catch (error) {
      console.error("Error executing form function:", error);
    }
  }
}

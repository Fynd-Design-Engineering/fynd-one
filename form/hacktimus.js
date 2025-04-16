/**
 * Toggles visibility of occupation-specific form fields
 * based on the selected occupation value
 */
function toggleOccupationFields() {
  // Get the occupation select element
  const occupationSelect = document.getElementById("occupation");

  // Safety check - exit if element doesn't exist
  if (!occupationSelect) {
    console.error("Error: Element with ID 'occupation' not found!");
    return;
  }

  const occupation = occupationSelect.value;
  const studentFields = document.getElementById("student-fields");
  const professionalFields = document.getElementById("professional-fields");

  // Safety check - handle missing field containers
  if (!studentFields) {
    console.error("Error: Element with ID 'student-fields' not found!");
  }

  if (!professionalFields) {
    console.error("Error: Element with ID 'professional-fields' not found!");
  }

  // Update display based on occupation value
  if (occupation === "student") {
    if (studentFields) studentFields.style.display = "block";
    if (professionalFields) professionalFields.style.display = "none";
  } else if (
    occupation === "working_professional" ||
    occupation === "freelancer" ||
    occupation === "other"
  ) {
    if (studentFields) studentFields.style.display = "none";
    if (professionalFields) professionalFields.style.display = "block";
  } else {
    // Default state (no selection)
    if (studentFields) studentFields.style.display = "none";
    if (professionalFields) professionalFields.style.display = "none";
  }
}

/**
 * Toggles visibility of team-related form fields
 * based on the selected mode value
 */
function toggleTeamFields() {
  // Get the mode select element
  const modeSelect = document.getElementById("mode");

  // Safety check - exit if element doesn't exist
  if (!modeSelect) {
    console.error("Error: Element with ID 'mode' not found!");
    return;
  }

  const mode = modeSelect.value;
  const teamFields = document.getElementById("team-fields");

  // Safety check - handle missing field container
  if (!teamFields) {
    console.error("Error: Element with ID 'team-fields' not found!");
    return;
  }

  // Update display based on mode value
  if (mode === "team") {
    teamFields.style.display = "flex";
  } else {
    teamFields.style.display = "none";
  }
}

/**
 * Set up event listeners and initialize the form display
 */
function initializeForm() {
  console.log("Initializing form...");

  // Get the form elements
  const occupationSelect = document.getElementById("occupation");
  const modeSelect = document.getElementById("mode");

  // Set up event listeners if elements exist
  if (occupationSelect) {
    occupationSelect.addEventListener("change", toggleOccupationFields);
    console.log("Added change listener to occupation select");
  } else {
    console.error(
      "Cannot set up occupation change listener - element not found"
    );
  }

  if (modeSelect) {
    modeSelect.addEventListener("change", toggleTeamFields);
    console.log("Added change listener to mode select");
  } else {
    console.error("Cannot set up mode change listener - element not found");
  }

  // Set initial display state
  console.log("Setting initial field states");
  toggleOccupationFields();
  toggleTeamFields();
}

// Try both ways to ensure the code runs
if (document.readyState === "loading") {
  // Document still loading, use DOMContentLoaded
  document.addEventListener("DOMContentLoaded", initializeForm);
  console.log("Waiting for DOMContentLoaded event");
} else {
  // Document already loaded, run immediately
  initializeForm();
  console.log("Document already loaded, running initialization");
}

document.addEventListener("DOMContentLoaded", function () {
  // Wait a moment for the plugin to initialize
  setTimeout(() => {
    // Find all inputs with the data-intl-tel-input-id attribute
    const intlInputs = document.querySelectorAll(
      "input[data-intl-tel-input-id]"
    );

    // Process each one
    intlInputs.forEach((input) => {
      // Get the parent .iti container
      const container = input.closest(".iti");

      if (container) {
        // Move the input outside the container
        container.parentNode.insertBefore(input, container);

        // Remove the container
        container.parentNode.removeChild(container);

        // Reset any styling and attributes that were added by the plugin
        input.style.paddingLeft = "";
        input.removeAttribute("data-intl-tel-input-id");
        input.className = input.className.replace(/iti__/, "");
      }
    });
  }, 200);
});

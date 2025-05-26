function getFormName() {
  const urlParams = new URLSearchParams(window.location.search);
  const formName = urlParams.get("form_name");
  return formName ? decodeURIComponent(formName) : null;
}

document.addEventListener("DOMContentLoaded", function () {
  const currentFormName = getFormName();
  posthog.capture(
    "form_success",
    window.getTrackingPropertiesWithForm(currentFormName || "unknown_form")
  );
});

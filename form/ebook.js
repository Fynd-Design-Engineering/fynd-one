// document.getElementById("ebook-submit").addEventListener("click", function () {
//   setTimeout(function () {
//     if (document.getElementById("ebook-success")) {
//       console.log("download");
//       if (document.getElementById("ebook-download")) {
//         document.getElementById("ebook-download").click();
//       }
//     }
//   }, 100);
// });


document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("wf-form-Ebook-Download");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default submission initially

    // If the form is valid, submit it programmatically
    if (form.checkValidity()) {
      form.submit(); // Let Webflow handle actual submission

      // Wait for Webflow to show success message
      const observer = new MutationObserver(() => {
        const successEl = document.getElementById("ebook-success");
        if (successEl && successEl.style.display !== "none") {
          const downloadLink = document.getElementById("ebook-download");
          if (downloadLink) {
            downloadLink.click();
            observer.disconnect();
          }
        }
      });

      // Watch for DOM changes to detect success message
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      form.reportValidity(); // Trigger browser's native validation UI
    }
  });
});
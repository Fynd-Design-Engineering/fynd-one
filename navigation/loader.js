let isLoading = false;

function showLoader() {
  if (isLoading) return;
  isLoading = true;

  const loaderPath = document.querySelector("[loader-path]");
  const loaderFill = document.querySelector("[loader-fill]");

  // Show loader path
  loaderPath.style.opacity = "1";

  // Reset fill width
  loaderFill.style.width = "0%";
  loaderFill.style.transition = "none";

  // Force reflow
  loaderFill.offsetHeight;

  // First animation: 0% to 90% in 1 second
  setTimeout(() => {
    loaderFill.style.transition = "width 1s ease-out";
    loaderFill.style.width = "90%";
  }, 50);

  // Second animation: 90% to 100% in 2 seconds
  setTimeout(() => {
    loaderFill.style.transition = "width 2s ease-out";
    loaderFill.style.width = "100%";
  }, 1100);

  // Hide loader after complete
  setTimeout(() => {
    loaderPath.style.opacity = "0";
    isLoading = false;

    // Reset for next use
    setTimeout(() => {
      loaderFill.style.width = "0%";
      loaderFill.style.transition = "none";
    }, 300);
  }, 3200);
}

// Apply to all anchor tags with navigation delay
document.addEventListener("DOMContentLoaded", function () {
  const allLinks = document.querySelectorAll("a");

  allLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Skip if it's a hash link, mailto, tel, or javascript
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href === "" ||
        this.target === "_blank"
      ) {
        return;
      }

      // Prevent immediate navigation
      e.preventDefault();

      // Show loader
      showLoader();

      // Navigate after animation completes (3.5 seconds total)
      setTimeout(() => {
        window.location.href = href;
      }, 3500);
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const jumpLinks = document.querySelectorAll('[data-scroll-type="jump"]');
  console.log("Found jump links:", jumpLinks.length);

  jumpLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Link clicked:", this.getAttribute("href"));

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      console.log("Target element found:", !!targetElement);

      if (targetElement) {
        console.log("Scrolling to position:", targetElement.offsetTop);
        // Use the simpler method
        window.scrollTo(0, targetElement.offsetTop);
      }
    });
  });
});

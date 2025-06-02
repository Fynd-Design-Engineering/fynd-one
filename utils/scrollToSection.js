function updateScrollToParams() {
  const scrollLinks = document.querySelectorAll("[scroll-section]");
  scrollLinks.forEach((link) => {
    const target = link.getAttribute("scroll-section");
    if (!target) return;

    const url = new URL(link.href);
    url.searchParams.set("scrollto", target);
    link.href = url.toString();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // for adding params in page links with scroll-section attribute
  setTimeout(updateScrollToParams, 200);

  // Check if the URL has a scrollto parameter and scroll to the element
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("scrollto");

  if (targetId) {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn(`Element with ID '${targetId}' not found.`);
    }
  }
});

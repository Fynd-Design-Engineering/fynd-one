# JavaScript Functionality Breakdown

## 1. Disable Scroll on Navigation Open

**Description:** This script prevents scrolling when the navigation menu is opened.

```html
<script
  src="https://cdn.jsdelivr.net/npm/fyndflow@latest/Disable_scroll_nav_open.js"
  defer
></script>
```

## 2. Execute Page Functions

**Description:** This script executes predefined functions stored in `pageFunctions`.

```html
<script>
  pageFunctions.executeFunctions();
</script>
```

## 3. Segment Analytics Events

**Description:** Tracks user interactions based on `data-analytics` attributes and sends them to Google Tag Manager (GTM).

```html
<script>
  if (typeof jQuery !== "undefined") {
    $(document).ready(function () {
      try {
        $("[data-analytics]").on("click", function (e) {
          var properties;
          var eventName = $(this).attr("data-analytics");

          $.each(this.attributes, function (_, attribute) {
            if (attribute.name.startsWith("data-property-")) {
              if (!properties) properties = {};
              var property = attribute.name.split("data-property-")[1];
              properties[property] = attribute.value;
            }
          });

          var eventData = { event: eventName };

          for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
              eventData[key] = properties[key];
            }
          }

          if (window.dataLayer) {
            window.dataLayer.push(eventData);
          }
        });
      } catch (err) {
        console.error("Error in Segment analytics script:", err);
      }
    });
  } else {
    console.error("jQuery is required for this script.");
  }
</script>
```

## 4. Google Tag Manager (noscript)

**Description:** Loads GTM using an iframe when JavaScript is disabled.

```html
<iframe
  type="fs-cc"
  fs-cc-categories="analytics"
  src="https://www.googletagmanager.com/ns.html?id=GTM-P7T3P95V"
  height="0"
  width="0"
  style="display:none;visibility:hidden"
></iframe>
```

## 5. Capture Page Title

**Description:** Retrieves the current page title and assigns it to a hidden input field.

```html
<script>
  document.addEventListener("DOMContentLoaded", function () {
    const pageName = document.title;
    document.getElementById("pageName").value = pageName;
  });
</script>
```

## 6. Capture Current Date on Form Submit

**Description:** Captures the current date when a form is submitted and stores it in a hidden input field.

```html
<script>
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", function (event) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        document.getElementById("current-date").value = formattedDate;
      });
    }
  });
</script>
```

## 7. Co-Pilot Chat Window Trigger

**Description:** Opens the Copilot chat window when the user clicks a button with the ID `chat`.

```html
<script>
  document.getElementById("chat").addEventListener("click", function () {
    window.copilot("event", "open");
  });
</script>
```

## 8. Tooltip (Tippy.js) Implementation

**Description:** Enables tooltips using the Tippy.js library.

```html
<script src="https://unpkg.com/popper.js@1"></script>
<script src="https://unpkg.com/tippy.js@4"></script>
<script>
  tippy(".nav_search", {
    animation: "fade",
    duration: 200,
    arrow: true,
    delay: [0, 50],
    arrowType: "round",
    theme: "search",
    maxWidth: 230,
    interactive: true,
    zIndex: 50,
    allowHTML: true,
  });
</script>
```

## 9. Lottie Animation for Navigation Hover

**Description:** Plays a Lottie animation on hover over navigation links.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.6/lottie.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    const lottieElement = document.querySelector(".nav_platforms_lottie");
    const lottieInstance = lottie.loadAnimation({
      container: lottieElement,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "https://cdn.prod.website-files.com/5f2bd20de11b965424e6cb83/672876e28461e91ffa69380d_Pixelbin%20suite%20v2.json",
    });

    const links = document.querySelectorAll("[data-frame]");
    links.forEach((link) => {
      const frame = parseInt(link.getAttribute("data-frame"), 10);
      link.addEventListener("mouseenter", () => {
        lottieInstance.goToAndStop(frame, true);
      });
      link.addEventListener("mouseleave", () => {
        lottieInstance.stop();
      });
    });
  });
</script>
```

## 10. Fetch Location Data (Geolocation API)

**Description:** Retrieves the user's country, state, and city based on IP and populates form fields.

```html
<script>
  document.addEventListener("DOMContentLoaded", function () {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("country").value =
          data.country_name || "Unknown";
        document.getElementById("state").value = data.region || "Unknown";
        document.getElementById("city").value = data.city || "Unknown";
      })
      .catch((error) => {
        console.error("Error fetching location from IP:", error);
      });
  });
</script>
```

## 11. Capture Page URL

**Description:** Stores the current page URL into a visible and hidden input field.

```html
<script>
  document.addEventListener("DOMContentLoaded", function () {
    const pageUrlInput = document.querySelector(
      "[fs-hacks-element='page-url-input']"
    );
    const pageUrl = document.querySelector(
      "[fs-hacks-element='show-page-url']"
    );
    if (pageUrl && pageUrlInput) {
      const url = location.href;
      pageUrlInput.value = url;
      pageUrl.innerText = url;
    }
  });
</script>
```

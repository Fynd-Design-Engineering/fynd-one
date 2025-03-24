# FAQ Accordion Script

This script implements a FAQ accordion with animations using GSAP. It allows multiple FAQ sections to be grouped together and ensures only one is open at a time. It also supports dynamic image updates when switching between FAQs.

## Features

- Expands and collapses FAQ sections smoothly.
- Ensures only one FAQ is open per group.
- Updates group images dynamically when a FAQ opens.
- Uses GSAP for smooth animations.

## How It Works

1. **Initialization**

   - The script waits for the DOM to load before executing.
   - It selects all FAQ wrappers using `[fynd-faq-element="wrapper"]`.
   - For each wrapper, it identifies related elements (toggle button, content area, animation elements, etc.).
   - It checks if the FAQ should be initially open (`fynd-faq-initialopen="true"`).
   - If initially open, it sets the content height to `auto`, and updates the associated group image.

2. **Accordion Toggle**

   - When a user clicks the toggle button, the script checks if it is already animating to prevent rapid clicks.
   - If the clicked FAQ is the only open one in the group, it remains open.
   - If the clicked FAQ is closed, the script:
     - Closes all other FAQs in the same group.
     - Opens the selected FAQ with a smooth animation.
     - Updates the group image (if applicable).

3. **Animation**

   - Uses GSAP to animate the height and opacity of the content.
   - Rotates the toggle icon lines (`x-line` and `y-line`) for a smooth transition.
   - Ensures animations complete before another action can take place.

4. **Updating Group Images**
   - If a FAQ has an associated image (`fynd-faq-image-source`), it updates the corresponding group image (`fynd-faq-image-target`).
   - This ensures the image reflects the active FAQ.

## HTML/Webflow Structure

```html
<div fynd-faq-group="example-group">
  <div fynd-faq-element="wrapper" fynd-faq-initialopen="true">
    <div fynd-faq-element="toggle">
      <div fynd-faq-element="x-line"></div>
      <div fynd-faq-element="y-line"></div>
    </div>
    <div fynd-faq-element="content">
      <div fynd-faq-element="content-inner">
        <p>FAQ answer goes here.</p>
        <img fynd-faq-image-source src="example.jpg" alt="Example Image" />
      </div>
    </div>
  </div>
</div>
<img
  fynd-faq-image-target="example-group"
  src="default.jpg"
  alt="Group Image"
/>
```

## Customization

- **Modify GSAP animations**: Adjust animation duration, easing, and effects.
- **Change the HTML structure**: Ensure elements have the correct attributes for proper functionality.
- **Update image logic**: Modify `updateFaqGroupImage()` to suit custom requirements.

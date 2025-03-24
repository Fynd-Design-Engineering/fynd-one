# FAQ Accordion Script

This script is a JavaScript implementation for an interactive FAQ accordion system using GSAP for animations. It allows for two types of behavior:

- **One-at-a-time:** Only one FAQ item remains open at a time, and at least one must always stay open.
- **Multiple-at-a-time:** Any number of FAQ items can be opened or closed independently.

## How It Works

### 1. **Event Listener for DOMContentLoaded**

When the DOM content loads, the script:

- Selects all FAQ wrappers (`[fynd-faq-element="wrapper"]`).
- Loops through each FAQ wrapper and identifies its elements:
  - The toggle button (`[fynd-faq-element="toggle"]`)
  - The content sections (`[fynd-faq-element="content"]` and `[fynd-faq-element="content-inner"]`)
  - The animated icon lines (`[fynd-faq-element="x-line"]` and `[fynd-faq-element="y-line"]`)
- Determines if the FAQ belongs to a group (`[fynd-faq-group]`).
- Determines whether the FAQ should start in an open or closed state.

### 2. **Initial State Setup**

- If the FAQ has `fynd-faq-initialopen="true"`, it starts open:
  - The height is set to `auto`.
  - Opacity of the content is set to `1`.
  - Toggle icon is rotated.
- Otherwise, it starts closed:
  - Height is set to `0`.
  - Opacity is `0`.
  - Toggle icon is in the default position.

### 3. **Click Event Listener for Toggle**

- Prevents multiple animations from conflicting by setting an `isAnimating` flag.
- Determines if the FAQ is currently open.
- If in **"one-at-a-time"** mode:
  - Ensures at least one FAQ remains open.
  - Closes other open FAQs before opening a new one.
- Calls `openAccordion` or `closeAccordion` based on the current state.

### 4. **Opening an Accordion (`openAccordion`)**

- Animates:
  - Expanding height of content.
  - Fading in content text.
  - Rotating toggle icon.
- Updates FAQ's state to "open".
- If the FAQ group has an associated image, updates it.

### 5. **Closing an Accordion (`closeAccordion`)**

- Animates:
  - Collapsing height of content.
  - Fading out content text.
  - Resetting toggle icon rotation.
- Updates FAQ's state to "closed".

### 6. **Closing Other Accordions in the Same Group (`closeOtherAccordions`)**

- Loops through all open accordions in the same group and closes them.

### 7. **Updating Group Image (`updateFaqGroupImage`)**

- Finds a group-level image (`[fynd-faq-image-target]`).
- Finds an image inside the opened FAQ (`[fynd-faq-image-source]`).
- Updates the group image source accordingly.

### 8. **Ensuring One FAQ Remains Open (`ensureOneFaqOpen`)**

- In "one-at-a-time" mode, checks if any FAQ is open.
- If none are open, opens the first FAQ in the group.

## How to Use

1. Add the required HTML structure with attributes like `fynd-faq-element`, `fynd-faq-group`, and `fynd-faq-type`.
2. Include GSAP for animations.
3. Include this JavaScript file in your project.
4. Ensure each FAQ has a toggle button, content section, and optional group settings.

## Dependencies

- [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/)

This script makes FAQ sections more interactive and user-friendly while maintaining a clean and organized structure.

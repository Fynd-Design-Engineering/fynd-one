# Fynd Drawer Component

A lightweight, GSAP-powered drawer component that provides smooth animations and dynamic content updates.

## Features

- Smooth opening and closing animations achieved via GSAP.
- Prevents background scrolling when the drawer is open.
- Dynamically updates drawer content based on the clicked element.
- Closes when clicking on an overlay or close button.

## Prerequisites

Include GSAP in the project:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
```

## Installation

Include the script in the project:

```html
<script src="path-to-script.js"></script>
```

## Usage

### HTML Structure

```html
<!-- Open Button -->
<button fynd-drawer-open>
  <img fynd-drawer-image-source src="image.jpg" alt="Dynamic Image" />
  <span fynd-drawer-text-source>Dynamic Text</span>
</button>

<!-- Drawer -->
<div fynd-drawer style="display: none;">
  <div fynd-drawer-overlay></div>
  <div fynd-drawer-content>
    <button fynd-drawer-close>Close</button>
    <img fynd-drawer-image-target src="" alt="Drawer Image" />
    <p fynd-drawer-text-target></p>
  </div>
</div>
```

### JavaScript Functionality

- `openDrawer()`: Opens the drawer with animations achieved via GSAP.
- `closeDrawer()`: Closes the drawer and restores scrolling.
- `updateDrawerContent(ele)`: Updates the drawer content dynamically based on the clicked element.

## Event Listeners

- Clicking elements with `[fynd-drawer-open]` will open the drawer and update content.
- Clicking elements with `[fynd-drawer-close]` will close the drawer.
- Clicking the overlay (`[fynd-drawer-overlay]`) will close the drawer.

## Example

```html
<button fynd-drawer-open>
  <img fynd-drawer-image-source src="example.jpg" alt="Example" />
  <span fynd-drawer-text-source>Click to open drawer</span>
</button>
```

## License

This project is licensed under the MIT License.

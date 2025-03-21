# Progressive Scroll and Sticky Elements with GSAP

This code implements progressive scrolling and sticky elements using GSAP and ScrollTrigger. It dynamically moves elements, updates sticky images, and applies smooth animations based on scroll position.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Attributes Used](#attributes-used)
- [Installation](#installation)
- [Customization](#customization)
- [Debugging](#debugging)

## Overview

This script enhances scrolling behavior on a webpage by:

- Moving elements dynamically from source to target containers.
- Using GSAP's ScrollTrigger to detect section visibility and trigger animations.
- Storing the last visited section in `localStorage` for state tracking.
- Updating sticky images based on the section in view.
- Handling smooth fade-ins and transitions to avoid glitches.

## How It Works

1. **Element Movement**: `moveElements()` function moves elements marked with `[fynd-sticky-source]` and `[fynd-scroll-source]` to their respective target containers.
2. **ScrollTrigger Initialization**: `initProgressiveScroll()` sets up GSAP's ScrollTrigger to detect when sections enter and leave the viewport.
3. **State Tracking**: The script stores the last visited section in `localStorage` to avoid redundant updates.
4. **Sticky Image Update**: `updateStickyImage()` ensures that the appropriate image fades in based on the currently active section.
5. **Smooth Transitions**: `getScrollContainer()` applies a fade-in effect to the scroll container for a seamless appearance.
6. **Dynamic Background Color**: Elements with `[fynd-sticky-bg]` get their background color dynamically set from their attribute value.

## Attributes Used

The script uses custom attributes on `<div>` elements:

- **`[fynd-sticky-source]`**: Defines elements that should be moved into the sticky container.
- **`[fynd-sticky-target]`**: Target container where sticky elements should be placed.
- **`[fynd-scroll-source]`**: Defines scroll sections that trigger updates.
- **`[fynd-scroll-target]`**: Target container where scroll elements should be moved.
- **`[fynd-sticky-bg]`**: Defines a hex color for dynamic background updates.
- **`[fynd-scroll-container]`**: Defines the container that will fade in after initialization.

## Installation

1. Include GSAP and ScrollTrigger in project:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
   ```
2. Add the JavaScript code to your project.
3. Add HTML elements with the appropriate attributes.

## Customization

- Modify animation duration by changing the `duration` value in `gsap.to()`.
- Enable/disable ScrollTrigger markers for debugging.
- Customize fade effects by adjusting `opacity` values.

## Debugging

- Enable `markers: true` in `ScrollTrigger.create()` to visualize trigger points.
- Check the console for warnings related to missing elements.
- Ensure elements have the correct attributes applied.

This script provides a smooth and dynamic scrolling experience while keeping elements interactive and visually appealing.

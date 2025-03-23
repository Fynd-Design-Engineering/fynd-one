# Dropdown Navigation System

This JavaScript code manages an animated dropdown navigation system that opens and closes dynamically based on user interactions. It uses the GSAP (GreenSock Animation Platform) library for smooth animations.

## How It Works

### Initialization

When the DOM is fully loaded, the script checks if the screen width is greater than 991px. If true, it initializes the dropdown navigation system by:

- Selecting various navigation elements such as overlay, nav items, and dropdown containers.
- Initializing tab functionality (`initTabs`).
- Setting up event listeners for navigation links (`initNavlinksHover`).
- Handling dropdown state updates (`updateDropdownState`).

### Tab System

The dropdown includes a tab system that allows switching between different content sections when hovering over tab links.

- The first tab is set as active initially.
- When hovering over a tab, the content updates to display the associated section.

### Dropdown Behavior

The dropdown opens, moves, and closes based on user interactions:

1. **Opening the Dropdown:**

   - When a user hovers over a nav link, `triggerDropdownOpen` is called.
   - If the dropdown is closed, it initializes and animates the dropdown content.
   - If the dropdown is already open, it simply moves to the correct position.

2. **Closing the Dropdown:**

   - When the user moves the cursor away, `closeDropdownWrapper` is triggered.
   - The dropdown smoothly collapses using GSAP animations.

3. **Animating the Mover:**
   - The `animateMover` function updates the dropdown mover's position and size dynamically based on the hovered navigation link.
   - `initMover` ensures the mover is positioned correctly when opening the dropdown for the first time.

### GSAP Animations

- The script uses `gsap.timeline()` to manage animations efficiently.
- Dropdown animations include fading in/out the overlay, adjusting the height of the dropdown container, and transitioning content opacity.
- The navigation links also have hover effects to indicate the active state.

## Key Functions

- `initTabs(tabLinks, tabContents)`: Manages the tab switching behavior inside the dropdown.
- `updateDropdownState(navItemsWrapper)`: Listens for `mouseleave` events to close the dropdown.
- `initNavlinksHover(navLinks)`: Handles hover events on nav items and triggers the dropdown to open or move.
- `triggerDropdownOpen(currentLink, index)`: Determines whether to open or update an existing dropdown.
- `openDropdownWrapper(index)`: Animates and displays the dropdown.
- `closeDropdownWrapper()`: Closes the dropdown smoothly.
- `animateMover(currentLink, index)`: Moves the dropdown dynamically.
- `updateDropdownContent(currentIndex)`: Updates the displayed content inside the dropdown.
- `updateNavHover(currentIndex)`: Adjusts the opacity of navigation links to highlight the active one.

## Usage

This script is intended for desktop navigation menus with animated dropdowns. It requires:

- GSAP for animations.
- Proper HTML structure with elements matching the data attributes (e.g., `[data-nav-item]`, `[data-tab-link]`).

## Customization

- Modify `dropdownDimensions` to change the size of each dropdown category.
- Adjust GSAP animation durations and easing for smoother or faster effects.
- Ensure correct CSS styles for proper positioning and visibility.

This script provides a dynamic and visually appealing dropdown experience that enhances navigation usability on large screens.

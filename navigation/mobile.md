# Mobile Navigation System

This JavaScript code manages a mobile navigation system with a main menu and a nested submenu. The menus slide in and out smoothly based on user interactions.

## How It Works

### Initialization

When the DOM is fully loaded, the script:

- Selects elements for the main and nested menus.
- Selects buttons that toggle the main and nested menus.
- Selects menu links that trigger content changes.
- Hides the nested menu initially and sets up transition effects.
- Sets the main menu's height to `0dvh`, making it hidden initially.

### Menu Behavior

1. **Toggling the Main Menu:**

   - Clicking a toggle button (`[data-nav-toggle="main-menu"]`) calls `toggleMainMenu()`.
   - If the menu is closed, `openMobileMainMenu()` expands it to `100dvh`.
   - If the menu is open, `closeMobileMainMenu()` shrinks it back to `0dvh`.

2. **Toggling the Nested Menu:**

   - Clicking a toggle button (`[data-nav-toggle="nested-menu"]`) calls `toggleNestedMenu()`.
   - If the nested menu is closed, `openMobileNestedMenu()` slides it in from the right.
   - If the nested menu is open, `closeMobileNestedMenu()` slides it back out.

3. **Handling Content Replacement:**
   - Clicking a menu link (`[data-mobile-link]`) triggers `replaceContent(attrValue)`.
   - This function hides all menu content sections (`[data-mobile-menu]`) and displays only the selected one.
   - The nested menu opens automatically when content is switched.

### Transition Effects

- The nested menu uses `transform: translateX(100%)` to slide in and out.
- The main menu uses `height: 0dvh` and `100dvh` to smoothly expand and collapse.
- The overlay (`[data-nav-element="overlay"]`) fades in and out when the nested menu is toggled.

## Key Functions

- `openMobileMainMenu(menu)`: Expands the main menu to full screen.
- `closeMobileMainMenu(menu)`: Collapses the main menu.
- `toggleMainMenu(menu)`: Opens or closes the main menu based on its state.
- `openMobileNestedMenu(menu)`: Slides the nested menu into view.
- `closeMobileNestedMenu(menu)`: Slides the nested menu out of view.
- `toggleNestedMenu(menu)`: Opens or closes the nested menu based on its state.
- `replaceContent(attrValue)`: Switches displayed content inside the menu.

## Usage

This script is intended for mobile navigation menus that require smooth animations and hierarchical menu structures. It requires:

- Proper HTML elements with matching data attributes (`[data-mobile-nav]`, `[data-mobile-link]`, `[data-mobile-menu]`).
- CSS styles for positioning and animations.
- A basic overlay (`[data-nav-element="overlay"]`) for better visual feedback.

let isMainMenuOpen = false;
let isNestedMenuOpen = false;

document.addEventListener("DOMContentLoaded", function () {
  const NestedMenu = document.querySelector('[data-mobile-nav="nested-menu"]');
  const MainMenu = document.querySelector('[data-mobile-nav="main-menu"]');
  const toggleMainMenuButtons = document.querySelectorAll(
    '[data-nav-toggle="main-menu"]'
  );
  const toggleNestedMenuButtons = document.querySelectorAll(
    '[data-nav-toggle="nested-menu"]'
  );
  const mainMenuLinks = document.querySelectorAll("[data-mobile-link]");

  // Initially hide the menu
  NestedMenu.style.display = "none";
  NestedMenu.style.transform = "translateX(100%)";
  NestedMenu.style.transition = "transform 0.5s ease";

  MainMenu.style.display = "block";
  MainMenu.style.height = "0dvh";
  MainMenu.style.transition = "height 0.3s ease-in-out";

  toggleMainMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Main menu button clicked");
      toggleMainMenu(MainMenu);
    });
  });

  toggleNestedMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Nested menu button clicked");
      toggleNestedMenu(NestedMenu);
    });
  });

  mainMenuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      let attrValue = this.getAttribute("data-mobile-link");
      console.log(`Menu link clicked: ${attrValue}`);
      replaceContent(attrValue);
      toggleNestedMenu(NestedMenu);
    });
  });
});

function openMobileMainMenu(menu) {
  if (!menu || isMainMenuOpen) return;

  menu.style.overflow = "hidden";
  menu.style.display = "block";
  menu.style.height = "0dvh";

  requestAnimationFrame(() => {
    menu.style.height = "100dvh";
  });

  isMainMenuOpen = true;
  console.log("🍔 Main menu OPENED");
  document.querySelector("[data-menu-icon='open']").style.opacity = 0;
  document.querySelector("[data-menu-icon='close']").style.opacity = 1;
}

function closeMobileMainMenu(menu) {
  if (!menu || !isMainMenuOpen) return;

  menu.style.height = "0dvh";

  menu.addEventListener(
    "transitionend",
    () => {
      menu.style.display = "none";
      console.log("🍔 Main menu CLOSED (animation complete)");
      document.querySelector("[data-menu-icon='open']").style.opacity = 1;
      document.querySelector("[data-menu-icon='close']").style.opacity = 0;
    },
    { once: true }
  );

  isMainMenuOpen = false;
  console.log("🍔 Main menu closing...");
}

function toggleMainMenu(menu) {
  if (isMainMenuOpen) {
    closeMobileMainMenu(menu);
    if (isNestedMenuOpen) {
      closeMobileNestedMenu(
        document.querySelector('[data-mobile-nav="nested-menu"]')
      );
    }
  } else {
    openMobileMainMenu(menu);
  }
}

function openMobileNestedMenu(menu) {
  const navOverlay = document.querySelector('[data-nav-element="overlay"]');
  menu.style.display = "block";
  navOverlay.style.opacity = 1;
  setTimeout(() => (menu.style.transform = "translateX(0%)"), 10);
  isNestedMenuOpen = true;
  console.log("📂 Nested menu OPENED");
}

function closeMobileNestedMenu(menu) {
  const navOverlay = document.querySelector('[data-nav-element="overlay"]');
  menu.style.transform = "translateX(100%)";
  setTimeout(() => {
    menu.style.display = "none";
    console.log("📂 Nested menu CLOSED (animation complete)");
  }, 500);
  navOverlay.style.opacity = 0;
  isNestedMenuOpen = false;
  console.log("📂 Nested menu closing...");
}

function toggleNestedMenu(menu) {
  if (isNestedMenuOpen) {
    closeMobileNestedMenu(menu);
  } else {
    openMobileNestedMenu(menu);
  }
}

function replaceContent(attrValue) {
  document.querySelectorAll("[data-mobile-menu]").forEach((div) => {
    div.style.display = "none";
  });

  let targetDiv = document.querySelector(`[data-mobile-menu="${attrValue}"]`);
  if (targetDiv) {
    targetDiv.style.display = "block";
    console.log(`📄 Content switched to: ${attrValue}`);
  }
}

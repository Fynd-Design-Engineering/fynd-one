document.addEventListener("DOMContentLoaded", () => {
  //Sticky Header Script
  const header = document.querySelector(".navigation");
  let lastScrollTop = 0;
  const handleScroll = () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScrollTop > lastScrollTop) {
      header.style.transform = "translateY(-100%)";
    } else {
      header.style.transform = "translateY(0)";
    }
    lastScrollTop = Math.max(0, currentScrollTop);
  };
  window.addEventListener("scroll", handleScroll);



  //Custom Cursor Script
  const cursor = document.createElement("div");
  cursor.classList.add("custom_cursor");
  document.body.appendChild(cursor);
  let currentParent = null;
  let mouseX = 0, mouseY = 0;
  let isCursorActive = false;
  const updateCursorPosition = () => {
    requestAnimationFrame(() => {
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${isCursorActive ? 1 : 0.8})`;
    });
  };
  const checkCursorHover = () => {
    const elementUnderCursor = document.elementFromPoint(mouseX, mouseY);
    const parent = elementUnderCursor?.closest("[data-cursor]");
    if (parent) {
      if (parent !== currentParent) {
        if (currentParent) currentParent.style.cursor = "";
        parent.style.cursor = "none";
        cursor.textContent = parent.getAttribute("data-cursor");
        cursor.style.opacity = "1";
        cursor.style.visibility = "visible";
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
        isCursorActive = true;
        currentParent = parent;
      }
    } else if (currentParent) {
      currentParent.style.cursor = "";
      cursor.style.opacity = "0";
      cursor.style.visibility = "hidden";
      isCursorActive = false;
      currentParent = null;
    }
  };
  document.addEventListener("mouseover", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorPosition();
  });
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorPosition();
    checkCursorHover();
  });
  document.addEventListener("scroll", () => {
    checkCursorHover();
    updateCursorPosition();
  });
  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
    cursor.style.visibility = "hidden";
    isCursorActive = false;
  });



  //Generate Inline CSS By Variable Names Script
  document.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.endsWith('-class-variable')) {
        // Extract the variable names (split by space)
        const variables = attr.value.trim().split(/\s+/);
        // Classes that should have background color applied
        const bgClasses = ['section_badge_circle', 'platform_card'];
        const hasBgClass = bgClasses.some((className) => element.classList.contains(className));
        // **Function to check if a string is a valid HEX or RGBA color**
        const isColorValue = (val) => /^#([A-Fa-f0-9]{3,6})$/.test(val) || /^rgba?\((\d+,\s*\d+,\s*\d+(,\s*\d+(\.\d+)?)?)\)$/.test(val);
        // **Apply HEX & RGBA Colors Only for .badge**
        if (element.matches('[class*="badge"]')) {
          //if (element.classList.contains('[class*="badge"]')) {
          variables.forEach((variable) => {
            if (isColorValue(variable)) {
              element.style.backgroundColor = variable;
            }
          });
        }
        // **Handle Hover Behavior for .platform_card**
        if (element.classList.contains('platform_card')) {
          element.addEventListener('mouseenter', () => {
            variables.forEach((variable) => {
              element.style.backgroundColor = `var(${variable})`;
              element.style.borderColor = `var(${variable})`;
            });
          });
          element.addEventListener('mouseleave', () => {
            element.style.backgroundColor = '';
            element.style.borderColor = '';
          });
        }
        // **Existing Functionality (Untouched)**
        variables.forEach((variable) => {
          let cssProperty;
          if (hasBgClass) {
            cssProperty = 'background-color';
          } else if (variable.includes('---background--background-') || variable.includes('--primary-bg')) {
            cssProperty = 'background-color';
          } else if (variable.includes('--_color-palette---border--')) {
            cssProperty = 'border-color';
          } else if (variable.includes('--_typography---font-family')) {
            cssProperty = 'font-family';
          } else if (variable.includes('--_typography---font-size')) {
            cssProperty = 'font-size';
          } else if (variable.includes('--_spacing---padding')) {
            cssProperty = 'padding';
          } else if (variable.includes('--_spacing---margin')) {
            cssProperty = 'margin';
          } else if (variable.includes('--_border-radius---radius-')) {
            cssProperty = 'border-radius';
          } else if (variable.includes('--sizes--width')) {
            cssProperty = 'width';
          } else if (variable.includes('--sizes--height')) {
            cssProperty = 'height';
          } else {
            cssProperty = 'color';
          }
          if (cssProperty && !element.classList.contains('platform_card')) {
            element.style[cssProperty] = `var(${variable})`;
          }
        });
      }
    });
  });



  //Add Classes Through A Custom Attribute Script
  document.querySelectorAll('[data-class]').forEach((element) => {
    // Get the value of the custom data-class attribute
    const dataClass = element.getAttribute('data-class');
    if (dataClass) {
      // Get the existing class attribute value
      const existingClass = element.getAttribute('class') || '';
      // Merge the data-class values with existing class values
      const updatedClass = `${existingClass} ${dataClass}`.trim();
      // Update the class attribute
      element.setAttribute('class', updatedClass);
      // Optionally, remove the data-class attribute if no longer needed
      element.removeAttribute('data-class');
    }
  });



  //Footer Navigation Accordion Script
  const togglers = document.querySelectorAll(".footer_nav_toggler");
  const resetStylesOnResize = () => {
    const isDesktop = window.innerWidth >= 1024; // Adjust breakpoint as needed
    const footerNavWraps = document.querySelectorAll(".footer_nav_wrap");
    if (isDesktop) {
      footerNavWraps.forEach((wrap) => {
        wrap.style.display = ""; // Reset display property
        wrap.style.maxHeight = ""; // Reset height
        wrap.style.opacity = ""; // Reset opacity
        wrap.style.visibility = ""; // Reset visibility
        wrap.style.transition = ""; // Reset transitions
      });
      togglers.forEach((toggler) => {
        const icon = toggler.querySelector(".footer_nav_toggler_icon");
        if (icon) icon.style.transform = ""; // Reset icon rotation
      });
    }
  };
  togglers.forEach((toggler) => {
    toggler.addEventListener("click", (event) => {
      event.preventDefault();
      const currentWrap = toggler.nextElementSibling; // The associated .footer_nav_wrap
      const icon = toggler.querySelector(".footer_nav_toggler_icon");
      if (!currentWrap) return; // Safety check
      // Check current visibility state
      const isOpen = currentWrap.style.display === "grid";
      if (isOpen) {
        // Close the dropdown
        currentWrap.style.maxHeight = `${currentWrap.offsetHeight}px`; // Set current height, including padding
        requestAnimationFrame(() => {
          currentWrap.style.maxHeight = "0"; // Animate to close
          currentWrap.style.opacity = "0";
          currentWrap.style.visibility = "hidden";
          currentWrap.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
        });
        // Set timeout to hide with display: none after animation
        setTimeout(() => {
          currentWrap.style.display = "none"; // Hide after animation
        }, 300); // Match the transition duration
        if (icon) icon.style.transform = "rotate(0deg)"; // Reset rotation
      } else {
        // Open the dropdown
        currentWrap.style.display = "grid"; // Make it visible first
        currentWrap.style.maxHeight = "0"; // Start from 0 for animation
        currentWrap.style.opacity = "0";
        currentWrap.style.visibility = "hidden";
        // Trigger a reflow to apply the new styles
        currentWrap.offsetHeight; // Access any property to force reflow
        requestAnimationFrame(() => {
          const totalHeight = currentWrap.scrollHeight + parseFloat(getComputedStyle(currentWrap).paddingTop) + parseFloat(getComputedStyle(currentWrap).paddingBottom);
          currentWrap.style.maxHeight = `${totalHeight}px`; // Animate open
          currentWrap.style.opacity = "1";
          currentWrap.style.visibility = "visible";
          currentWrap.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
        });
        if (icon) icon.style.transform = "rotate(180deg)"; // Rotate icon
      }
    });
  });



  document.querySelectorAll('[fynd-accordian-open="true"]').forEach((div, index) => {
    setTimeout(() => {
      div.click();
    }, index * 100);
  });
  // Reset styles on desktop view
  window.addEventListener("resize", resetStylesOnResize);



  //Remove Has From Anchor Script
  document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default anchor behavior
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: "smooth"
        });
        // Remove hash after navigation (Webflow workaround)
        setTimeout(() => {
          history.replaceState(null, null, " ");
        }, 10);
      }
    });
  });
});
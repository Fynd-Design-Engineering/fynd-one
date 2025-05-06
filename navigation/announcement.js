document.addEventListener("DOMContentLoaded", function () {
  const announcementSwiper = new Swiper(".announcement-slider", {
    slidesPerView: 1,
    spaceBetween: 0,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    loop: true,
    speed: 1000,
    pagination: {
      el: ".announcement-pagination",
      clickable: true,
    },
    on: {
      init: function () {
        if (this.slides.length <= 1) {
          const paginationEl = document.querySelector(
            ".announcement-pagination"
          );
          if (paginationEl) {
            paginationEl.style.display = "none";
          }
          this.autoplay.stop();
        }
      },
    },
  });
});

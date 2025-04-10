document.addEventListener("DOMContentLoaded", function () {
  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("keypress", function (e) {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault();
    }
  });
  phoneInput.addEventListener("paste", function (e) {
    let pastedData = (e.clipboardData || window.clipboardData).getData("text");
    if (/[^0-9]/g.test(pastedData)) {
      e.preventDefault();
    }
  });
  phoneInput.addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, "");
  });
});

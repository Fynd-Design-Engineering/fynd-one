document.getElementById("ebook-submit").addEventListener("click", function () {
  setTimeout(function () {
    if (document.getElementById("ebook-success")) {
      console.log("download");
      if (document.getElementById("ebook-download")) {
        document.getElementById("ebook-download").click();
      }
    }
  }, 100);
});

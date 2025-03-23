function logUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);

  // Extract geography as an array
  const geography =
    urlParams.get("geography")?.split(",").filter(Boolean) || [];

  // Extract tags as an array
  const tags = urlParams.get("tag")?.split(",").filter(Boolean) || [];

  // Check for verified toggle (should be "true" in URL)
  const verified = urlParams.get("verified") === "true";

  // Calculate total count
  let totalCount = geography.length + tags.length + (verified ? 1 : 0);

  // Create JSON object
  const filters = {
    geography,
    tags,
    verified,
  };

  // Log JSON object to console
  console.log(JSON.stringify(filters, null, 2));

  // Log counts separately
  //   console.log(`Geography Count: ${geography.length}`);
  //   console.log(`Tags Count: ${tags.length}`);
  //   console.log(`Verified: ${verified}`);
  //   console.log(`Total Count: ${totalCount}`);

  return totalCount;
}

function updateCountText(totalCount) {
  const totalCountText = document.querySelector("[fynd-filters-count]");
  if (!totalCountText) return;

  if (totalCount > 0) {
    totalCountText.innerHTML = totalCount;
    totalCountText.style.display = "flex";
  } else {
    totalCountText.innerHTML = "0";
    totalCountText.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const totalCountText = document.querySelector("[fynd-filters-count]");
  totalCountText.style.display = "none";

  setTimeout(() => {
    let totalCount = logUrlParams();
    updateCountText(totalCount);
  }, 200);

  document.querySelectorAll("[fynd-filter-box]").forEach((div) => {
    div.addEventListener("click", () => {
      setTimeout(() => {
        let totalCount = logUrlParams();
        updateCountText(totalCount);
      }, 200);
    });
  });
});

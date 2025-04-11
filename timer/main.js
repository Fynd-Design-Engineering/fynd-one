document.addEventListener("DOMContentLoaded", function () {
  const targetDate = new Date("2025-04-20T23:59:00+05:30").getTime();

  // Check if all required elements exist
  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");
  const countdownElement = document.querySelector(".countdown");
  const expiredElement = document.getElementById("expired");

  // Validate required elements
  if (!daysElement)
    console.warn("Element with ID 'days' not found in the document");
  if (!hoursElement)
    console.warn("Element with ID 'hours' not found in the document");
  if (!minutesElement)
    console.warn("Element with ID 'minutes' not found in the document");
  if (!secondsElement)
    console.warn("Element with ID 'seconds' not found in the document");
  if (!countdownElement)
    console.warn("Element with class 'countdown' not found in the document");
  if (!expiredElement)
    console.warn("Element with ID 'expired' not found in the document");

  // Only start the timer if at least some of the elements exist
  if (daysElement || hoursElement || minutesElement || secondsElement) {
    // Update the countdown every second
    const countdownTimer = setInterval(function () {
      // Get the current date and time
      const now = new Date().getTime();

      // Calculate the time remaining
      const timeRemaining = targetDate - now;

      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      // Display the results (only update elements that exist)
      if (daysElement) daysElement.innerHTML = days;
      if (hoursElement) hoursElement.innerHTML = hours;
      if (minutesElement) minutesElement.innerHTML = minutes;
      if (secondsElement) secondsElement.innerHTML = seconds;

      // If the countdown is over, display expiration message
      if (timeRemaining < 0) {
        clearInterval(countdownTimer);
        if (countdownElement) countdownElement.style.display = "none";
        if (expiredElement) expiredElement.style.display = "block";
      }
    }, 1000);
  } else {
    console.warn("No countdown elements found. Timer not started.");
  }
});

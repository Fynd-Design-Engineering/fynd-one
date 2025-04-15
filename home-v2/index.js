// Call the function when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  triggerCopilot();
});

function triggerCopilot() {
  document.querySelector(".btn_prompt").addEventListener("click", function () {
    const textarea = this.parentElement.querySelector("textarea");
    if (textarea) {
      const userMessage = textarea.value.trim();
      if (userMessage) {
        window.copilot("event", "open");
        setTimeout(() => {
          window.copilot("event", "sendUserMessage", { message: userMessage });
        }, 1000);
      } else {
        console.warn("Textarea is empty. Please enter a message.");
      }
    }
  });
}

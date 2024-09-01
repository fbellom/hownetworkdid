import { updateHeader } from "./updateHeader.js";
import { updateFooter } from "./updateFooter.js";
import { handleFeedback } from "./handleFeedback.js";
import { submitFeedback } from "./submitFeedback.js";
import { initializeCharacterCounter } from "./domUtils.js";

export function init() {
  // EXTRACT EVENT FROM data-event in bdy tag
  const mainContainer = document.querySelector("body");
  let currentEvent = mainContainer.dataset.event;

  // Dynamically update the header and footer based on currentEvent
  updateHeader(currentEvent);
  updateFooter(currentEvent);
  initializeCharacterCounter(140);

  // Attach event listeners to feedback buttons
  document.querySelectorAll(".feedback-button").forEach((button) => {
    button.addEventListener("click", () => handleFeedback(button));
  });

  // Attach event listener to the submit button
  document.getElementById("submit-button").addEventListener("click", () => {
    submitFeedback(currentEvent);
  });
}

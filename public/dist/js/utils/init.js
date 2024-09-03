import { updateHeader } from "./updateHeader.js";
import { updateFooter } from "./updateFooter.js";
import { handleFeedback } from "./handleFeedback.js";
import { submitFeedback } from "./submitFeedback.js";
import { initializeCharacterCounter } from "./domUtils.js";
import { updateEventLabel } from "./updateEventLabel.js";

// Declare variables globally
let orgId, eventCode;

export function init() {
  // EXTRACT EVENT FROM data-event in bdy tag
  const mainContainer = document.querySelector("body");
  let currentEvent = mainContainer.dataset.event;

  // Collect query string parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  orgId = urlParams.get("orgId"); // "9999991"
  eventCode = urlParams.get("eventCode"); // "cloud-security-pod"

  // console.log(orgId); // Output: "9999991"
  // console.log(eventCode); // Output: "cloud-security-pod"

  // Dynamically update the header and footer based on currentEvent
  updateEventLabel(eventCode);
  updateHeader(currentEvent);
  updateFooter(currentEvent);
  initializeCharacterCounter(140);

  // Attach event listeners to feedback buttons
  document.querySelectorAll(".feedback-button").forEach((button) => {
    button.addEventListener("click", () => handleFeedback(button));
  });

  // Attach event listener to the submit button
  document.getElementById("submit-button").addEventListener("click", () => {
    submitFeedback(currentEvent, orgId, eventCode);
  });
}

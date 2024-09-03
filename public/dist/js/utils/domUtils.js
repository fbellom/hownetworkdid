import { showMessage } from "./showMessage.js";
import { hideLoadingIndicator } from "./loadingIndicator.js";
import { submitFeedback } from "./submitFeedback.js";

export function toggleReasonContainer(feedback) {
  console.log("TOGGLE: Feedback received:", feedback);
  const reasonContainer = document.getElementById("reason-container");
  const reasonText = document.getElementById("reason-text");

  let orgId, eventCode;

  // Collect query string parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  orgId = urlParams.get("orgId"); // "9999991"
  eventCode = urlParams.get("eventCode"); // "cloud-security-pod"

  if (feedback === "Neutral" || feedback === "Bad") {
    // Reset the textarea content
    reasonText.value = "";
    reasonContainer.classList.remove("hidden");

    // Hide FeedbackButtons
    hideFeedbackOptions();
  } else {
    reasonContainer.classList.add("hidden");
    // Fetch the currentEvent from the body data attribute
    const currentEvent = document.body.dataset.event;
    // Call submitFeedback directly for Good feedback
    submitFeedback(currentEvent, orgId, eventCode);
  }
}

export function handleSuccess(data) {
  console.log("handleSuccess: Feedback received:", data);
  hideLoadingIndicator();
  showMessage(data.message, false);
  resetForm();
  hideFeedbackSection();
}

export function handleError(error) {
  console.log("handleError: Feedback received:", error);
  hideLoadingIndicator();
  hideFeedbackSection();

  let errorMessage = error.message;
  if (error.message.includes("429")) {
    errorMessage =
      "You have already submitted feedback today. Please try again tomorrow.";
  } else if (error.message.includes("400")) {
    errorMessage = "Invalid input. Please check your submission and try again.";
  }

  showMessage(errorMessage, true);
  console.error("Error:", error);
}

export function hideFeedbackSection() {
  document.querySelector(".pool--section").classList.add("hidden");
}

export function hideFeedbackOptions() {
  document.getElementById("feedback-options").classList.add("hidden");
}

export function resetForm() {
  document.getElementById("reason-text").value = "";
  document.getElementById("reason-container").classList.add("hidden");
}

export function initializeCharacterCounter(maxLength) {
  const reasonText = document.getElementById("reason-text");
  const characterCounter = document.getElementById("character-counter");

  reasonText.addEventListener("input", () => {
    const currentLength = reasonText.value.length;
    characterCounter.innerText = `${currentLength} / ${maxLength}`;
  });
}

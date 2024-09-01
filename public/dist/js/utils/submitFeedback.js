import { sanitizeInput, validateInput } from "./inputValidation.js";
import { showLoadingIndicator } from "./loadingIndicator.js";
import { handleSuccess, handleError } from "./domUtils.js";
import { selectedFeedback } from "./handleFeedback.js";

export function submitFeedback(currentEvent) {
  const reasonText = sanitizeInput(
    document.getElementById("reason-text").value
  ); // Sanitize input

  if (!validateInput(reasonText)) {
    handleError(
      new Error("Invalid input. Please check your submission and try again.")
    );
    return;
  }

  showLoadingIndicator();

  fetch("/submit-feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: currentEvent,
      response: selectedFeedback,
      reason: reasonText,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(errorData.error || "An unknown error occurred");
        });
      }
      return response.json();
    })
    .then((data) => handleSuccess(data))
    .catch((error) => handleError(error));
}

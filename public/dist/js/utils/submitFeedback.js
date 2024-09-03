import { sanitizeInput, validateInput } from "./inputValidation.js";
import { showLoadingIndicator } from "./loadingIndicator.js";
import { handleSuccess, handleError } from "./domUtils.js";
import { selectedFeedback } from "./handleFeedback.js";

export function submitFeedback(currentEvent, orgId, eventCode) {
  const reasonText = sanitizeInput(
    document.getElementById("reason-text").value
  ); // Sanitize input

  if (!validateInput(reasonText)) {
    handleError(
      new Error("Invalid input. Please check your submission and try again.")
    );
    return;
  }

  // Validate OrgId and eventCode
  console.log("OrgId: ", orgId);
  console.log("EventCode: ", eventCode);

  if (!orgId || !eventCode) {
    handleError(
      new Error("No OrgId or Event Code, Scan the QR Code at POD and try again")
    );
    return;
  }

  showLoadingIndicator();
  //fetch("/submit-feedback", {
  fetch(`/submit-feedback/o/${orgId}/${eventCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //event: currentEvent,
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

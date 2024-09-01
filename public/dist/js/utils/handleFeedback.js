import { sanitizeInput } from "./inputValidation.js";
import { toggleReasonContainer } from "./domUtils.js";

// Declare selectedFeedback in a shared scope
let selectedFeedback = "";

export function handleFeedback(button) {
  console.log("Button element received:", button);
  console.log("Button classes:", button.classList);

  if (!button || !button.classList) {
    console.error("Button element is undefined or does not have a classList.");
    return;
  }

  // Extract the feedback type from the button's class
  const feedbackType = button.classList.contains("good")
    ? "Good"
    : button.classList.contains("neutral")
    ? "Neutral"
    : "Bad";

  console.log("Current feedBack:", feedbackType);

  if (feedbackType === "") {
    console.error("Invalid feedback type: No matching class found.");
    return;
  }

  selectedFeedback = sanitizeInput(feedbackType); // Sanitize user input
  toggleReasonContainer(selectedFeedback);

  // Update the text to display the selected feedback type
  const selectedFeedbackDisplay = document.getElementById("selected-feedback");
  selectedFeedbackDisplay.innerText = `Your experience is ${selectedFeedback}, because:`;
  selectedFeedbackDisplay.classList.remove("hidden"); // Show the selected feedback text
}

export { selectedFeedback };

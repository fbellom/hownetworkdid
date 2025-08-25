let selectedFeedback = "";
let currentEvent = "";

function showReason(feedback) {
  selectedFeedback = feedback;
  currentEvent = "GSXFY26";
  const reasonContainer = document.getElementById("reason-container");
  if (feedback === "Neutral" || feedback === "Bad") {
    reasonContainer.classList.remove("hidden");
  } else {
    reasonContainer.classList.add("hidden");
    submitReason();
  }
}

function submitReason() {
  const reasonText = document.getElementById("reason-text").value;

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
    .then((data) => {
      hideLoadingIndicator();

      document.getElementById("response-container").classList.remove("hidden");
      document
        .getElementById("response-message")
        .classList.remove("pico-color-red-500");
      document.getElementById("response-message").innerText = data.message;
      document.getElementById("reason-text").value = "";
      document.getElementById("reason-container").classList.add("hidden");

      // Hide feedback buttons using CSS class
      document.querySelector(".pool--section").classList.add("hidden");
    })
    .catch((error) => {
      hideLoadingIndicator();
      // Hide feedback buttons using CSS class
      document.querySelector(".pool--section").classList.add("hidden");

      // Handle errors gracefully with specific messages
      document.getElementById("response-container").classList.remove("hidden");
      let errorMessage = error.message;

      // Set Error Message
      document
        .getElementById("response-message")
        .classList.add("pico-color-red-500");

      // Specific Message
      if (error.message.includes("429")) {
        errorMessage =
          "You have already submitted feedback today. Please try again tomorrow.";
      } else if (error.message.includes("400")) {
        errorMessage =
          "Invalid input. Please check your submission and try again.";
      }

      //Set the Message
      document.getElementById("response-message").innerText = error.message;
      console.error("Error:", error);
    });
}

function showLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.classList.remove("hidden");
}

function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById("loading-indicator");
  loadingIndicator.classList.add("hidden");
}

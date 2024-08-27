let selectedFeedback = "";
let currentEvent = "";

function showReason(feedback) {
  selectedFeedback = feedback;
  currentEvent = "gsxfy25";
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
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("response-container").classList.remove("hidden");
      document.getElementById("response-message").innerText = data.message;
      document.getElementById("reason-text").value = "";
      document.getElementById("reason-container").classList.add("hidden");

      // Hide feedback buttons using CSS class
      document.querySelector(".pool--section").classList.add("hidden");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

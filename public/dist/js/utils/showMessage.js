export function showMessage(message, isError) {
  const responseContainer = document.getElementById("response-container");
  const responseMessage = document.getElementById("response-message");

  responseContainer.classList.remove("hidden");
  responseMessage.classList.toggle("pico-color-red-500", isError);
  responseMessage.innerText = message;
}

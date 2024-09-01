export function showLoadingIndicator() {
  document.getElementById("loading-indicator").classList.remove("hidden");
}

export function hideLoadingIndicator() {
  document.getElementById("loading-indicator").classList.add("hidden");
}

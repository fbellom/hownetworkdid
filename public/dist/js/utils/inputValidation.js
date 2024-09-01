export function sanitizeInput(input) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

export function validateInput(input) {
  return input.length <= 140; // Example validation logic
}

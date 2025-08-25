export function updateFooter(event) {
  const footerElement = document.getElementById("dynamic-footer");
  let footerContent = `hownetworkdid.com &copy;2025 #${event.toLowerCase()}`;
  footerElement.innerHTML = footerContent;
}

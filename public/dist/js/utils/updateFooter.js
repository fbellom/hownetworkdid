export function updateFooter(event) {
  const footerElement = document.getElementById("dynamic-footer");
  let footerContent = `howURateIT.com &copy;2024 #${event.toLowerCase()}`;
  footerElement.innerHTML = footerContent;
}

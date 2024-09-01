export function updateHeader(event) {
  const headerElement = document.getElementById("dynamic-header");
  let headerContent = `<nav>
      <ul>
        <li>.</li>
      </ul>
    </nav>`;
  headerElement.innerHTML = headerContent;
}

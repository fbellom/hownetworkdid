export function updateHeader(event) {
  const headerElement = document.getElementById("dynamic-header");
  let headerContent = `<nav>
      <ul>
        <li><img src="dist/img/cisco-connect-latam-2024-logo.png" alt="Good" /></li>
      </ul>
    </nav>`;
  headerElement.innerHTML = headerContent;
}

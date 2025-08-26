export function updateHeader(event) {
  const headerElement = document.getElementById("dynamic-header");
  let headerContent = `<nav>
      <ul>
        <li><img src="dist/img/GSX26_Cisco_GSX_RGB_White_Lockup.png" alt="Good" /></li>
      </ul>
    </nav>`;
  headerElement.innerHTML = headerContent;
}

export function updateHeader(event) {
  const headerElement = document.getElementById("dynamic-header");
  let headerContent = `<nav>
      <ul>
        <li><img src="dist/img/GSX26_Logo_Reg_Desktop-2x.png" alt="Good" /></li>
      </ul>
    </nav>`;
  headerElement.innerHTML = headerContent;
}

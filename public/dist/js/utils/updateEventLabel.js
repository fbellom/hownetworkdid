export function updateEventLabel(eventCode) {
  if (!eventCode) {
    console.error("No eventCode");
    return;
  }

  const eventLabelElement = document.getElementById("dynamic-event-code");
  let labelContent = `POD: ${eventCode.toLowerCase()}`;
  eventLabelElement.innerHTML = labelContent;
}

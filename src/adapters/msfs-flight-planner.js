// This adapter is the only place that depends on the Flight Planner UI structure.
// If Microsoft changes the Route panel markup, update the selectors here.
(() => {
  const SELECTORS = {
    routeNavIcon: 'img[alt="Route"]',
    // Box above the waypoint table: "Enter route as text" when empty, the colored route string otherwise.
    routeTextBox: "button.cursor-text",
    routeTextArea: "textarea",
    routeEntry: ".route-entry"
  };
  const EMPTY_ROUTE_LABEL = "Enter route as text";
  const PARSE_ERROR_PATTERN = /error while parsing/i;
  const TIMEOUT_MS = 5000;
  const WARNING_SETTLE_MS = 300;

  const isVisible = (element) => Boolean(element?.offsetParent);

  function waitFor(find, timeout = TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      (function poll() {
        const result = find();
        if (result) return resolve(result);
        if (Date.now() - started > timeout) return reject(new Error("Flight Planner did not respond in time. Refresh the page and try again."));
        setTimeout(poll, 100);
      })();
    });
  }

  function findRouteTextBox() {
    const box = [...document.querySelectorAll(SELECTORS.routeTextBox)].find(isVisible);
    if (box) return box;
    return [...document.querySelectorAll("button")].find((button) => isVisible(button) && button.textContent.trim() === EMPTY_ROUTE_LABEL);
  }

  const findTextArea = () => [...document.querySelectorAll(SELECTORS.routeTextArea)].find(isVisible);

  async function openRouteEditor() {
    if (!findRouteTextBox()) {
      const navButton = document.querySelector(SELECTORS.routeNavIcon)?.closest("button");
      if (!navButton) throw new Error("Route panel not found. Open the Route panel in Flight Planner and try again.");
      navButton.click();
    }
    const box = await waitFor(findRouteTextBox);
    box.click();
    return waitFor(findTextArea);
  }

  function setNativeValue(element, value) {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(element, value);
    element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
  }

  // The Planner drops tokens it cannot resolve and explains it in a banner over the route box.
  const findParseWarning = () => [...document.querySelectorAll(`${SELECTORS.routeEntry} > div`)]
    .find((element) => isVisible(element) && PARSE_ERROR_PATTERN.test(element.textContent));

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function importPlan(plan) {
    const routeText = [plan.originIcao, plan.route, plan.destinationIcao].join(" ");
    const textArea = await openRouteEditor();
    setNativeValue(textArea, routeText);

    const saveButton = [...textArea.parentElement.querySelectorAll("button")].find((button) => button.textContent.trim() === "Save");
    if (!saveButton) throw new Error("Save button of the route editor not found.");
    saveButton.click();
    await waitFor(() => findParseWarning() || (!findTextArea() && findRouteTextBox()?.textContent.includes(plan.originIcao)));
    await delay(WARNING_SETTLE_MS);

    const warning = findParseWarning()?.innerText.replace(/\s+/g, " ").trim();
    return { routeImported: true, ...(warning && { warning }) };
  }

  globalThis.MsfsFlightPlannerAdapter = { importPlan };
})();

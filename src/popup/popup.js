const form = document.querySelector("#identity-form");
const identityInput = document.querySelector("#identity");
const status = document.querySelector("#status");
const preview = document.querySelector("#preview");
const details = document.querySelector("#plan-details");
const importButton = document.querySelector("#import");
let currentPlan;

const setStatus = (message = "", error = false) => { status.textContent = message; status.classList.toggle("error", error); };
const send = (message) => new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));

chrome.storage.sync.get({ simbriefIdentity: "" }, ({ simbriefIdentity }) => {
  // Older versions stored the identity as a { type, value } object.
  identityInput.value = typeof simbriefIdentity === "string" ? simbriefIdentity : simbriefIdentity.value;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault(); preview.hidden = true;
  const identity = identityInput.value.trim();
  if (!identity) return setStatus("Enter a username or Pilot ID.", true);
  await chrome.storage.sync.set({ simbriefIdentity: identity });
  setStatus("Loading the latest briefing…");
  const result = await send({ type: "FETCH_FLIGHT_PLAN", identity });
  if (!result?.ok) return setStatus(result?.error || "The extension did not respond.", true);
  currentPlan = result.plan;
  const rows = [["Departure", currentPlan.originIcao], ["Arrival", currentPlan.destinationIcao], ["Callsign", currentPlan.callsign], ["Altitude", currentPlan.cruiseAltitude], ["Route", currentPlan.route]].filter(([, value]) => value);
  details.replaceChildren(...rows.flatMap(([key, value]) => { const dt = document.createElement("dt"); dt.textContent = key; const dd = document.createElement("dd"); dd.textContent = value; return [dt, dd]; }));
  preview.hidden = false; setStatus("Review the flight plan and confirm the import.");
});

importButton.addEventListener("click", async () => {
  if (!currentPlan) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://planner.flightsimulator.com/")) return setStatus("Open Microsoft Flight Simulator Flight Planner in the active tab.", true);
  setStatus("Importing route…");
  const result = await chrome.tabs.sendMessage(tab.id, { type: "IMPORT_FLIGHT_PLAN", plan: currentPlan }).catch(() => null);
  if (!result?.ok) return setStatus(result?.error || "Flight Planner is not ready; refresh the page and try again.", true);
  if (result.warning) return setStatus(`Route imported with a warning from Flight Planner: ${result.warning}`, true);
  setStatus("Flight plan imported. Review and save your changes in the application.");
});

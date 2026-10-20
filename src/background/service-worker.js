import { fetchLatestFlightPlan } from "../adapters/simbrief.js";

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message?.type !== "FETCH_FLIGHT_PLAN") return;
  fetchLatestFlightPlan(message.identity)
    .then((plan) => respond({ ok: true, plan }))
    .catch((error) => respond({ ok: false, error: error.message || "Unable to load the flight plan." }));
  return true;
});

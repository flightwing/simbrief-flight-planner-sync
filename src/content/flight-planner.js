chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message?.type !== "IMPORT_FLIGHT_PLAN") return;
  globalThis.MsfsFlightPlannerAdapter.importPlan(message.plan)
    .then((result) => respond({ ok: true, ...result }))
    .catch((error) => respond({ ok: false, error: error.message || "Import into Flight Planner failed." }));
  return true;
});

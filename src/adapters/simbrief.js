import { normalizeFlightPlan } from "../shared/flight-plan.js";

const PILOT_ID_PATTERN = /^\d+$/;

/**
 * Loads the latest SimBrief briefing for an account given either as a username or a numeric Pilot ID.
 * @param {string} account SimBrief username or Pilot ID entered by the user.
 * @returns {Promise<object>} Normalized flight plan.
 */
export async function fetchLatestFlightPlan(account) {
  const value = account?.trim();
  if (!value) throw new Error("Enter a SimBrief username or Pilot ID first.");
  // A numeric value is most likely a Pilot ID, but usernames may be numeric as well.
  const lookupKeys = PILOT_ID_PATTERN.test(value) ? ["userid", "username"] : ["username"];
  let response;
  for (const key of lookupKeys) {
    response = await requestBriefing(key, value);
    if (response.status !== 400) break;
  }
  if (!response.ok) {
    if (response.status === 400) throw new Error("SimBrief could not find the user or no briefing is available.");
    throw new Error(`SimBrief responded with error ${response.status}.`);
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error("SimBrief returned an unexpected response."); }
  return normalizeFlightPlan(data);
}

/**
 * Requests the latest briefing from the SimBrief API.
 * @param {string} key Query parameter identifying the account ("userid" or "username").
 * @param {string} value Account identifier.
 * @returns {Promise<Response>} Raw API response.
 */
async function requestBriefing(key, value) {
  const url = new URL("https://www.simbrief.com/api/xml.fetcher.php");
  url.search = new URLSearchParams({ [key]: value, json: "1" });
  try { return await fetch(url); }
  catch { throw new Error("Unable to connect to SimBrief. Check your connection and try again."); }
}

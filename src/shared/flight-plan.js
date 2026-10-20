export function cleanIcao(value) {
  const icao = String(value ?? "").trim().toUpperCase();
  return /^[A-Z0-9]{3,4}$/.test(icao) ? icao : "";
}

export function normalizeFlightPlan(raw) {
  const at = (object, ...paths) => {
    for (const path of paths) {
      const value = path.split(".").reduce((current, key) => current?.[key], object);
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return "";
  };

  const originIcao = cleanIcao(at(raw, "origin.icao_code", "origin.icao", "origin"));
  const destinationIcao = cleanIcao(at(raw, "destination.icao_code", "destination.icao", "destination"));
  const route = at(raw, "general.route", "atc.route", "route").replace(/\s+/g, " ").trim();

  if (!originIcao || !destinationIcao || !route) {
    throw new Error("The SimBrief briefing does not contain a valid departure airport, arrival airport, or route.");
  }

  const alternateIcao = cleanIcao(at(raw, "alternate.icao_code", "alternate.icao"));
  return {
    originIcao,
    destinationIcao,
    ...(alternateIcao && { alternateIcao }),
    route,
    ...(at(raw, "atc.callsign", "general.callsign") && { callsign: at(raw, "atc.callsign", "general.callsign") }),
    ...(at(raw, "general.initial_altitude", "general.cruise_altitude") && { cruiseAltitude: at(raw, "general.initial_altitude", "general.cruise_altitude") })
  };
}

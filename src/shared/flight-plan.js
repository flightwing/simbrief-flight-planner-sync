// SimBrief coordinate waypoint with seconds precision, e.g. 504734N0153043E (DDMMSS N DDDMMSS E).
const SECONDS_COORDINATE_PATTERN = /^(\d{2})(\d{2})(\d{2})([NS])(\d{3})(\d{2})(\d{2})([EW])$/;

/**
 * Converts coordinate waypoints with seconds precision (e.g. 504734N0153043E) to the ICAO degrees-and-minutes
 * format (e.g. 5048N01531E), because the MSFS Flight Planner cannot parse the seconds format.
 * Other route tokens, including invalid coordinates, are returned unchanged.
 * @param {string} route Route with tokens separated by single spaces.
 * @returns {string} Route with converted coordinate waypoints.
 */
export function convertCoordinateWaypoints(route) {
  return route.split(" ").map((token) => {
    const match = SECONDS_COORDINATE_PATTERN.exec(token);
    if (!match) return token;
    const [, latitudeDegrees, latitudeMinutes, latitudeSeconds, latitudeHemisphere,
      longitudeDegrees, longitudeMinutes, longitudeSeconds, longitudeHemisphere] = match;
    const valid = Number(latitudeDegrees) <= 90 && Number(longitudeDegrees) <= 180
      && [latitudeMinutes, latitudeSeconds, longitudeMinutes, longitudeSeconds].every((value) => Number(value) < 60);
    if (!valid) return token;
    return formatDegreesMinutes(latitudeDegrees, latitudeMinutes, latitudeSeconds, 2) + latitudeHemisphere
      + formatDegreesMinutes(longitudeDegrees, longitudeMinutes, longitudeSeconds, 3) + longitudeHemisphere;
  }).join(" ");
}

/**
 * Rounds an angle to whole minutes and formats it as zero-padded degrees followed by two-digit minutes.
 * @param {string} degrees Whole degrees as digits.
 * @param {string} minutes Whole minutes as digits.
 * @param {string} seconds Whole seconds as digits.
 * @param {number} degreeDigits Number of digits for degrees (2 for latitude, 3 for longitude).
 * @returns {string} Angle formatted as DDMM or DDDMM.
 */
function formatDegreesMinutes(degrees, minutes, seconds, degreeDigits) {
  const totalMinutes = Math.round(Number(degrees) * 60 + Number(minutes) + Number(seconds) / 60);
  return String(Math.floor(totalMinutes / 60)).padStart(degreeDigits, "0") + String(totalMinutes % 60).padStart(2, "0");
}

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
  const route = convertCoordinateWaypoints(at(raw, "general.route", "atc.route", "route").replace(/\s+/g, " ").trim());

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

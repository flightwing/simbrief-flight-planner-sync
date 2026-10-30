import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { convertCoordinateWaypoints, normalizeFlightPlan } from "../../src/shared/flight-plan.js";

describe("convertCoordinateWaypoints", () => {
  it("rounds seconds down to the nearest minute", () => {
    assert.equal(convertCoordinateWaypoints("504410N0154424E"), "5044N01544E");
  });

  it("rounds seconds up to the nearest minute", () => {
    assert.equal(convertCoordinateWaypoints("504734N0153043E"), "5048N01531E");
  });

  it("rounds exactly 30 seconds up", () => {
    assert.equal(convertCoordinateWaypoints("502530N0164030E"), "5026N01641E");
  });

  it("carries rounded minutes over to the next degree", () => {
    assert.equal(convertCoordinateWaypoints("495945N0145950E"), "5000N01500E");
  });

  it("keeps the southern and western hemispheres", () => {
    assert.equal(convertCoordinateWaypoints("334512S0702015W"), "3345S07020W");
  });

  it("handles the boundary values of latitude and longitude", () => {
    assert.equal(convertCoordinateWaypoints("900000N1800000W"), "9000N18000W");
    assert.equal(convertCoordinateWaypoints("000000N0000000E"), "0000N00000E");
  });

  it("leaves coordinates already in the ICAO format unchanged", () => {
    assert.equal(convertCoordinateWaypoints("5047N01530E 50N015E"), "5047N01530E 50N015E");
  });

  it("leaves invalid coordinates unchanged", () => {
    assert.equal(convertCoordinateWaypoints("506034N0153043E"), "506034N0153043E");
    assert.equal(convertCoordinateWaypoints("504760N0153043E"), "504760N0153043E");
    assert.equal(convertCoordinateWaypoints("914734N0153043E"), "914734N0153043E");
    assert.equal(convertCoordinateWaypoints("504734N1813043E"), "504734N1813043E");
  });

  it("leaves other route tokens unchanged", () => {
    assert.equal(convertCoordinateWaypoints("DCT OKG L984 ARTUP UL984 DCT"), "DCT OKG L984 ARTUP UL984 DCT");
  });

  it("converts only the coordinate tokens of a mixed route", () => {
    assert.equal(convertCoordinateWaypoints("OKG DCT 504734N0153043E DCT VLM"), "OKG DCT 5048N01531E DCT VLM");
  });
});

describe("normalizeFlightPlan", () => {
  it("converts the coordinate waypoints of the SimBrief route", () => {
    const plan = normalizeFlightPlan({
      origin: { icao_code: "LKPR" },
      destination: { icao_code: "LKMT" },
      general: {
        route: "504734N0153043E 504410N0154424E 504634N0161213E 504425N0161442E 504323N0162108E "
          + "504149N0162646E 503716N0162845E 503504N0163120E 502530N0164045E"
      }
    });
    assert.equal(plan.route, "5048N01531E 5044N01544E 5047N01612E 5044N01615E 5043N01621E "
      + "5042N01627E 5037N01629E 5035N01631E 5026N01641E");
  });

  it("collapses whitespace in the route before converting it", () => {
    const plan = normalizeFlightPlan({ origin: "LKPR", destination: "LKMT", route: " OKG \n 504734N0153043E  VLM " });
    assert.equal(plan.route, "OKG 5048N01531E VLM");
  });

  it("rejects a briefing without a route", () => {
    assert.throws(() => normalizeFlightPlan({ origin: "LKPR", destination: "LKMT" }), /valid departure airport, arrival airport, or route/);
  });
});

import { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabaseServer";

function makeHospitalSlug(hospital: string | null, cityState: string | null) {
  return `${hospital || "unknown-hospital"}-${cityState || "unknown-location"}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const stateMap: Record<string, string> = {
  AL: "alabama",
  AK: "alaska",
  AZ: "arizona",
  AR: "arkansas",
  CA: "california",
  CO: "colorado",
  CT: "connecticut",
  DE: "delaware",
  FL: "florida",
  GA: "georgia",
  HI: "hawaii",
  ID: "idaho",
  IL: "illinois",
  IN: "indiana",
  IA: "iowa",
  KS: "kansas",
  KY: "kentucky",
  LA: "louisiana",
  ME: "maine",
  MD: "maryland",
  MA: "massachusetts",
  MI: "michigan",
  MN: "minnesota",
  MS: "mississippi",
  MO: "missouri",
  MT: "montana",
  NE: "nebraska",
  NV: "nevada",
  NH: "new-hampshire",
  NJ: "new-jersey",
  NM: "new-mexico",
  NY: "new-york",
  NC: "north-carolina",
  ND: "north-dakota",
  OH: "ohio",
  OK: "oklahoma",
  OR: "oregon",
  PA: "pennsylvania",
  RI: "rhode-island",
  SC: "south-carolina",
  SD: "south-dakota",
  TN: "tennessee",
  TX: "texas",
  UT: "utah",
  VT: "vermont",
  VA: "virginia",
  WA: "washington",
  WV: "west-virginia",
  WI: "wisconsin",
  WY: "wyoming",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.ratemycontract.co";

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select("id,hospital,city_state,created_at")
    .eq("status", "approved");

  const reviews = data ?? [];

  const uniqueHospitalUrls = Array.from(
    new Map(
      reviews.map((review) => {
        const slug = makeHospitalSlug(review.hospital, review.city_state);

        return [
          slug,
          {
            url: `${baseUrl}/hospitals/${slug}`,
            lastModified: review.created_at
              ? new Date(review.created_at)
              : new Date(),
          },
        ];
      })
    ).values()
  );

  const reviewUrls = reviews.map((review) => ({
    url: `${baseUrl}/reviews/${review.id}`,
    lastModified: review.created_at
      ? new Date(review.created_at)
      : new Date(),
  }));

  const uniqueStates = Array.from(
    new Set(
      reviews
        .map((review) => {
          const state = review.city_state?.split(",")[1]?.trim().toUpperCase();

          return state && stateMap[state] ? stateMap[state] : null;
        })
        .filter(Boolean)
    )
  );

  const stateUrls = uniqueStates.map((state) => ({
    url: `${baseUrl}/states/${state}`,
    lastModified: new Date(),
  }));

  const unitUrls = [
    "icu",
    "er",
    "or",
    "pacu",
    "telemetry",
    "med-surg",
    "nicu",
    "oncology",
    "stepdown",
    "cvicu",
    "psych",
    "rehab",
    "labor-delivery",
  ].map((unit) => ({
    url: `${baseUrl}/units/${unit}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
    },
    ...uniqueHospitalUrls,
    ...reviewUrls,
    ...stateUrls,
    ...unitUrls,
  ];
}
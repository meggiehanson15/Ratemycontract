import { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabaseServer";

function makeHospitalSlug(hospital: string | null, cityState: string | null) {
  return `${hospital || "unknown-hospital"}-${cityState || "unknown-location"}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.ratemycontract.co";

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select("id,hospital,city_state,created_at");

  const reviews = data ?? [];

  const hospitalUrls = reviews.map((review) => ({
    url: `${baseUrl}/hospitals/${makeHospitalSlug(
      review.hospital,
      review.city_state
    )}`,
    lastModified: review.created_at
      ? new Date(review.created_at)
      : new Date(),
  }));

  const reviewUrls = reviews.map((review) => ({
    url: `${baseUrl}/reviews/${review.id}`,
    lastModified: review.created_at
      ? new Date(review.created_at)
      : new Date(),
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
    ...hospitalUrls,
    ...reviewUrls,
  ];
}
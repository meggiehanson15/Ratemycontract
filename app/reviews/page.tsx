import { createClient } from "@supabase/supabase-js";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export type ReviewRow = {
  id: number;
  created_at: string | null;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  review: string | null;
  rating: number | null;
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();

  const supabase = getSupabase();

  let query = supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,review,rating"
    )
    .order("id", { ascending: false });

  if (q) {
    // Search across fields
    query = query.or(
      [
        `hospital.ilike.%${q}%`,
        `city_state.ilike.%${q}%`,
        `unit.ilike.%${q}%`,
        `agency.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data, error } = await query;

  // Always pass an array to the client to prevent "undefined.length" errors
  const reviews: ReviewRow[] = Array.isArray(data) ? (data as ReviewRow[]) : [];

  return (
    <main className="container">
      <div className="pageHeader">
        <h1 className="pageTitle">Reviews</h1>
        <p className="pageSubtitle">
          Browse honest travel nurse reviews. Search by hospital, city/state, or unit.
        </p>
      </div>

      {error ? (
        <div className="alert alertError">
          <div className="alertTitle">Supabase error</div>
          <div className="alertText">{error.message}</div>
        </div>
      ) : null}

      <ReviewsClient initialReviews={reviews} initialQuery={q} />
    </main>
  );
}

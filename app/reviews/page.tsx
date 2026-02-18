// app/reviews/page.tsx
import HospitalAverages from "./HospitalAverages";
import ReviewsClient from "./ReviewsClient";
import { supabaseServer } from "@/lib/supabaseServer";

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

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();

  const supabase = supabaseServer();

  let query = supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,review,rating"
    )
    .order("created_at", { ascending: false });

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

  if (error) {
    console.error("getReviews error:", error.message);
    return (
      <main className="container">
        <div className="pageHeader">
          <h1 className="pageTitle">Reviews</h1>
          <p className="pageSubtitle">Could not load reviews.</p>
        </div>
      </main>
    );
  }

  const reviews: ReviewRow[] = Array.isArray(data) ? (data as ReviewRow[]) : [];

  return (
    <main className="container">
      <div className="pageHeader">
        <h1 className="pageTitle">Reviews</h1>
        <p className="pageSubtitle">
          Browse honest travel nurse reviews. Search by hospital, city/state, or
          unit.
        </p>
      </div>

      {/* ✅ Averages always render here */}
      <HospitalAverages />

      <ReviewsClient initialReviews={reviews} initialQuery={q} />
    </main>
  );
}

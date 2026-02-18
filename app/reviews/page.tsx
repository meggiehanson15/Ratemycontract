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

        {/* Still render averages so we know the page is live */}
        <HospitalAverages />
      </main>
    );
  }

  const reviews: ReviewRow[] = Array.isArray(data) ? (data as ReviewRow[]) : [];

  // ✅ Normalize null → undefined for client component typing (TypeScript)
  const reviewsForClient = reviews.map((r) => ({
    ...r,
    created_at: r.created_at ?? undefined,
  }));

  return (
    <main className="container">
      <div className="pageHeader">
        <h1 className="pageTitle">Reviews</h1>
        <p className="pageSubtitle">
          Browse honest travel nurse reviews. Search by hospital, city/state, or unit.
        </p>
      </div>

      <HospitalAverages />

      {/* ReviewsClient expects `reviews` prop */}
      <ReviewsClient reviews={reviewsForClient as any} />
    </main>
  );
}



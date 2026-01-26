// app/reviews/page.tsx
import ReviewsClient from "./ReviewsClient";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, created_at, city_state, hospital, unit, rating, assignment_length, review")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReviews error:", error.message);
    return (
      <div style={{ padding: 24 }}>
        <h1>Reviews</h1>
        <p>Could not load reviews.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Reviews</h1>
        <p>No reviews yet.</p>
      </div>
    );
  }

  return <ReviewsClient reviews={data} />;
}

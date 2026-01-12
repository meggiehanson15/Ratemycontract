import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Review = {
  id: number;
  hospital: string;
  city: string | null;
  state: string | null;
  unit: string | null;
  assignment_length: string | null;
  review: string | null;
  rating: number | null;
  created_at: string;
};

export default async function ReviewsPage() {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Error loading reviews</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
        Reviews
      </h1>

      {reviews?.length === 0 && (
        <p style={{ color: "#666" }}>No reviews yet.</p>
      )}

      {reviews?.map((review: Review) => (
        <div
          key={review.id}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            background: "#fff",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {review.hospital}
          </h2>

          <p style={{ color: "#666", marginBottom: 8 }}>
            {[review.city, review.state].filter(Boolean).join(", ")}{" "}
            {review.unit && `• ${review.unit}`}
          </p>

          {review.rating && (
            <p style={{ marginBottom: 8 }}>
              ⭐ {review.rating}/5
            </p>
          )}

          {review.review && <p>{review.review}</p>}
        </div>
      ))}
    </main>
  );
}

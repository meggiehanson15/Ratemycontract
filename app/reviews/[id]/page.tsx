// app/reviews/[id]/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type ParamsMaybePromise = { id: string } | Promise<{ id: string }>;

export default async function ReviewDetailPage({
  params,
}: {
  params: ParamsMaybePromise;
}) {
  // ✅ Works whether params is an object OR a Promise (Next/Turbopack differences)
  const resolvedParams = await Promise.resolve(params as any);
  const rawId = String(resolvedParams?.id ?? "").trim();

  if (!rawId || !/^\d+$/.test(rawId)) {
    return (
      <div style={{ padding: 24 }}>
        <p>
          <Link href="/reviews">← Back to reviews</Link>
        </p>
        <h1>Review not found</h1>
        <p>Invalid review id: {rawId || "(empty)"}</p>

        {/* Helpful debug line (safe to keep) */}
        <p style={{ opacity: 0.7 }}>
          Debug: URL param received = <code>{String(resolvedParams?.id ?? "")}</code>
        </p>
      </div>
    );
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, created_at, city_state, hospital, unit, rating, assignment_length, review"
    )
    .eq("id", rawId) // Postgres will cast string -> int8
    .single();

  if (error || !data) {
    return (
      <div style={{ padding: 24 }}>
        <p>
          <Link href="/reviews">← Back to reviews</Link>
        </p>
        <h1>Review not found</h1>
        <p>{error?.message ?? "No data returned"}</p>
      </div>
    );
  }

  const ratingDisplay =
    typeof data.rating === "number" ? `⭐ ${data.rating}` : "—";

  return (
    <div style={{ padding: 24 }}>
      <p>
        <Link href="/reviews">← Back to reviews</Link>
      </p>

      <h1 style={{ marginBottom: 6 }}>{data.hospital ?? "Hospital"}</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        {data.city_state ?? "City"} · {data.unit ?? "Unit"}
      </p>

      <div style={{ marginTop: 14 }}>
        <strong>Rating:</strong> {ratingDisplay}
      </div>

      {data.assignment_length ? (
        <div style={{ marginTop: 10 }}>
          <strong>Assignment length:</strong> {data.assignment_length}
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <strong>Review:</strong>
        <p style={{ marginTop: 6 }}>
          {data.review?.trim() ? data.review : "No written review provided."}
        </p>
      </div>

      <div style={{ marginTop: 16, opacity: 0.75 }}>
        <small>
          Posted:{" "}
          {data.created_at ? new Date(data.created_at).toLocaleString() : "—"}
        </small>
      </div>
    </div>
  );
}

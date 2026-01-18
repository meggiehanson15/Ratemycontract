import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Review = {
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

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <div className="stars" aria-label={`${r} out of 5 stars`}>
      {"★★★★★".slice(0, r)}
      <span className="starsEmpty">{"★★★★★".slice(r)}</span>
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function InvalidReviewId() {
  return (
    <main className="container">
      <div className="alert alertError">
        <div className="alertTitle">Invalid review id</div>
        <div className="alertText">
          This link doesn’t look right. Go back to reviews and try again.
        </div>
        <Link className="btn btnPrimary" href="/reviews">
          ← Back to Reviews
        </Link>
      </div>
    </main>
  );
}

export default async function ReviewDetailsPage(props: any) {
  // Works whether Next passes params as an object OR something async-ish
  const paramsResolved = await Promise.resolve(props?.params);
  const rawId = paramsResolved?.id;

  const idNum = Number.parseInt(String(rawId ?? ""), 10);
  if (!Number.isFinite(idNum)) return <InvalidReviewId />;

  const supabase = getSupabase();

  // IMPORTANT: pass id as a STRING to be safe with int8 handling
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,review,rating"
    )
    .eq("id", String(idNum))
    .maybeSingle();

  if (error || !data) return <InvalidReviewId />;

  const r = data as Review;
  const rating = typeof r.rating === "number" ? r.rating : 0;

  return (
    <main className="container">
      <Link className="linkSoft" href="/reviews">
        ← Back to Reviews
      </Link>

      <div className="detailCard">
        <div className="detailTop">
          <h1 className="detailTitle">{r.hospital || "Unknown hospital"}</h1>
          <Stars rating={rating} />
        </div>

        <div className="detailMeta">
          {r.city_state ? (
            <div>
              <span className="label">City/State</span> {r.city_state}
            </div>
          ) : null}
          {r.unit ? (
            <div>
              <span className="label">Unit</span> {r.unit}
            </div>
          ) : null}
          {r.agency ? (
            <div>
              <span className="label">Agency</span> {r.agency}
            </div>
          ) : null}
          {r.pay ? (
            <div>
              <span className="label">Pay</span> {r.pay}
            </div>
          ) : null}
          {r.assignment_length ? (
            <div>
              <span className="label">Assignment</span> {r.assignment_length}
            </div>
          ) : null}
          {r.created_at ? (
            <div>
              <span className="label">Posted</span> {formatDate(r.created_at)}
            </div>
          ) : null}
        </div>

        <div className="divider" />

        <h2 className="sectionTitle">Review</h2>
        <p className="reviewText">{r.review || "No written review provided."}</p>
      </div>
    </main>
  );
}

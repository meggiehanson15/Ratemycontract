import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Review = {
  id: number;
  agency: string | null;
  agency_experience: string | null;
  rating: number | null;
  created_at: string | null;
};

function slugify(value: string | null) {
  return (value || "unknown")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: string | null) {
  if (!date) return "Recently reviewed";

  const now = new Date();
  const reviewDate = new Date(date);
  const diffMs = now.getTime() - reviewDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 1) return "Reviewed today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export const metadata = {
  title: "Travel Nurse Agency Reviews | RateMyContract",
  description:
    "Browse short agency experience reviews from travel nurses about recruiter communication, payroll, credentialing, and support.",
};

export default async function AgenciesPage() {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select("id,agency,agency_experience,rating,created_at")
    .eq("status", "approved")
    .not("agency", "is", null)
    .not("agency_experience", "is", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  const reviews = ((data ?? []) as Review[]).filter(
    (review) =>
      review.agency?.trim() &&
      review.agency_experience?.trim()
  );

  const agencyCount = new Set(
    reviews.map((review) => slugify(review.agency))
  ).size;

  return (
    <section>
      <div className="pageHeader">
        <div className="pageHeaderTop">
          <div>
            <p className="heroEyebrow">Agency Experiences</p>

            <h1 className="pageTitle">Travel Nurse Agency Reviews</h1>

            <p className="pageSubtitle">
              Short agency-specific feedback from travel nurses about recruiter
              communication, payroll, credentialing, responsiveness, and support.
            </p>
          </div>

          <Link className="pill pillPrimary" href="/submit">
            Share Your Experience
          </Link>
        </div>
      </div>

      <section
        className="card cardPad"
        style={{
          marginTop: 18,
          marginBottom: 24,
        }}
      >
        <div className="heroStats" style={{ marginTop: 0 }}>
          <div className="statCard">
            <strong>{reviews.length}</strong>
            <span>agency experience review{reviews.length === 1 ? "" : "s"}</span>
          </div>

          <div className="statCard">
            <strong>{agencyCount}</strong>
            <span>agencies mentioned</span>
          </div>

          <div className="statCard">
            <strong>Optional</strong>
            <span>from contract reviews</span>
          </div>
        </div>
      </section>

      {reviews.length === 0 ? (
        <div className="card cardPad">
          <p className="sub">
            No agency experience reviews have been submitted yet.
          </p>

          <Link className="pill pillPrimary" href="/submit">
            Submit a Review
          </Link>
        </div>
      ) : (
        <div className="reviewsGrid">
          {reviews.map((review) => (
            <article key={review.id} className="reviewCard">
              <div className="reviewTop">
                <div>
                  <Link
                    href={`/agencies/${slugify(review.agency)}`}
                    className="reviewHospital"
                    style={{ color: "inherit" }}
                  >
                    {review.agency || "Unknown Agency"}
                  </Link>

                  <div className="reviewMeta">
                    Agency experience
                    {review.created_at ? ` • ${formatDate(review.created_at)}` : ""}
                  </div>
                </div>

                <div className="reviewRight">⭐ {review.rating ?? "N/A"}</div>
              </div>

              <div className="reviewBadges">
                <span className="badge">Recruiter / agency feedback</span>
              </div>

              <p className="reviewText">
                {review.agency_experience || "No agency experience provided."}
              </p>

              <div className="reviewBottom">
                <Link className="reviewLink" href={`/reviews/${review.id}`}>
                  Read full contract review →
                </Link>

                <Link
                  className="pill"
                  href={`/agencies/${slugify(review.agency)}`}
                >
                  View agency →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
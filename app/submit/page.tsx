// app/submit/page.tsx
import SubmitForm from "./SubmitForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  return (
    <section>
      <div className="pageHeader">
        <div className="pageHeaderTop">
          <div>
            <h1 className="pageTitle">Submit a Review</h1>
            <p className="pageSubtitle">
              Share an honest travel nurse contract experience to help others
              negotiate smarter.
            </p>
          </div>

          <Link className="pill" href="/reviews">
            Browse Reviews
          </Link>
        </div>
      </div>

      {/* Trust / safety notice */}
      <div className="card cardPad submitNotice">
        <strong>Anonymous submission</strong>
        <p className="kicker" style={{ marginTop: 6 }}>
          Do not include patient information (PHI), coworker names,
          or confidential hospital details.
        </p>
      </div>

      <div style={{ marginTop: 14 }}>
        <SubmitForm />
      </div>
    </section>
  );
}
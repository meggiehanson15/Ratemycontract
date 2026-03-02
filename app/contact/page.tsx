// app/contact/page.tsx

import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="card cardPad">
      <h1 className="pageTitle">Contact</h1>

      <p className="sub">
        Have feedback, questions, or concerns about a review? We’re happy to help.
      </p>

      <div style={{ marginTop: 18 }}>
        <h3>Email</h3>

        <p>
          The fastest way to reach us is by email:
        </p>

        <a
          href="mailto:ratemycontractsite@gmail.com"
          className="pill pillPrimary"
          style={{ display: "inline-block", marginTop: 10 }}
        >
          Email RateMyContract
        </a>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3>Report a Review</h3>

        <p>
          If you believe a review violates our policies, please include:
        </p>

        <ul>
          <li>The review link</li>
          <li>The reason for the request</li>
          <li>Any relevant clarification</li>
        </ul>

        <p className="kicker" style={{ marginTop: 10 }}>
          Requests are reviewed as quickly as possible.
        </p>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3>General Feedback</h3>

        <p>
          RateMyContract is actively improving. Suggestions from travel nurses
          help shape future features.
        </p>
      </div>

      <div className="hr" />

      <div className="rowWrap">
        <Link className="pill" href="/reviews">
          Browse Reviews
        </Link>

        <Link className="pill" href="/submit">
          Submit a Review
        </Link>
      </div>
    </section>
  );
}
// app/submit/page.tsx
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Submit a Review</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Share an honest review. Please don’t include patient info.
      </p>

      <div style={{ marginTop: 16 }}>
        <SubmitForm />
      </div>
    </div>
  );
}

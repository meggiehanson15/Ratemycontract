// app/submit/page.tsx
"use client";

import SubmitForm from "./SubmitForm";

export default function SubmitPage() {
  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
      }}
    >
      <h1 style={{ fontSize: 28, margin: 0 }}>Submit a Contract Review</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Keep it honest, helpful, and nurse-focused. Don’t include patient info.
      </p>

      <div style={{ marginTop: 16 }}>
        <SubmitForm />
      </div>
    </div>
  );
}


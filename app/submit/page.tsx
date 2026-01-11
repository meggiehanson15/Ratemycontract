export default function SubmitPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Submit a Contract Review</h1>

      <form>
        <label>
          Hospital Name
          <input type="text" style={{ display: "block", width: "100%", marginBottom: 12 }} />
        </label>

        <label>
          City / State
          <input type="text" style={{ display: "block", width: "100%", marginBottom: 12 }} />
        </label>

        <label>
          Pay (Hourly or Weekly)
          <input type="text" style={{ display: "block", width: "100%", marginBottom: 12 }} />
        </label>

        <label>
          Comments
          <textarea style={{ display: "block", width: "100%", marginBottom: 12 }} />
        </label>

        <button type="submit">Submit Review</button>
      </form>
    </main>
  );
}

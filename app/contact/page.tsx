export default function ContactPage() {
  return (
    <section className="card cardPad">
      <h1 className="pageTitle">Contact</h1>

      <p>Questions, feedback, or review concerns can be sent to:</p>

      <p style={{ fontSize: 18, marginTop: 12 }}>
        <strong>ratemycontractsite@gmail.com</strong>
      </p>

      <p className="kicker" style={{ marginTop: 20 }}>
        For review removal requests, please include the review link and reason
        for your request.
      </p>
    </section>
  );
}
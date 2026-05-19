export async function GET() {
  return new Response(
    "google-site-verification: google119a00694f7233ff.html",
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
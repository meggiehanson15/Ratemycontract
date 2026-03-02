import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

export const metadata = {
  title: "RateMyContract | Travel Nurse Contract Reviews",
  description:
    "Transparent travel nurse contract reviews — real experiences, real pay, real units.",
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="headerInner">
            <Link href="/" className="brand">
              <div className="logoMark">RM</div>
              <div className="brandText">
                <strong>RateMyContract</strong>
                <span>Honest travel nurse reviews</span>
              </div>
            </Link>

            <nav className="nav">
              <Link className="pill" href="/">Home</Link>
              <Link className="pill" href="/reviews">Reviews</Link>
              <Link className="pill pillPrimary" href="/submit">
                Submit a Review
              </Link>
            </nav>
          </div>
        </header>

        {/* Global notice */}
        <div className="siteNotice">
          Reviews are anonymous user-submitted opinions and are not verified by
          RateMyContract. Do not include patient information (PHI).
        </div>

        <main className="container">{children}</main>

        <footer className="footer">
          <div className="footerInner">
            <div>
              © {new Date().getFullYear()} RateMyContract
            </div>

            <div className="footerLinks">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
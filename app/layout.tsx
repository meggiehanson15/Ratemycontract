import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "RateMyContract",
  description: "Honest travel nurse reviews",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="headerInner">
            <div className="brand">
              <div className="logoMark">RM</div>
              <div className="brandText">
                <strong>RateMyContract</strong>
                <span>Honest travel nurse reviews</span>
              </div>
            </div>

            <nav className="nav" aria-label="Primary navigation">
              <Link className="pill" href="/">Home</Link>
              <Link className="pill" href="/reviews">Reviews</Link>
              <Link className="pill pillPrimary" href="/submit">Submit a Review</Link>
            </nav>
          </div>
        </header>

        <main className="container">{children}</main>

        <footer className="footer">© {new Date().getFullYear()} RateMyContract</footer>
      </body>
    </html>
  );
}

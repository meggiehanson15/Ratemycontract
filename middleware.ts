import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return new NextResponse("Admin password is not configured.", {
      status: 500,
    });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const basicAuth = authHeader.split(" ")[1];
    const decoded = atob(basicAuth || "");
    const [username, password] = decoded.split(":");

    if (username === "admin" && password === adminPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RateMyContract Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
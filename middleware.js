import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Owner-only routes
    if (pathname.startsWith("/owner")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      if (token.role !== "owner") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Checkout requires any logged-in user
    if (pathname.startsWith("/checkout")) {
      if (!token) {
        return NextResponse.redirect(
          new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to run middleware, false to skip it
      // Only protect specific routes — everything else is public
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/owner"))   return true; // let middleware handle it
        if (pathname.startsWith("/checkout")) return true; // let middleware handle it
        return true; // all other routes are public
      },
    },
  }
);

export const config = {
  // Only run middleware on these paths — NOT on API routes or static files
  matcher: [
    "/owner/:path*",
    "/checkout",
  ],
};
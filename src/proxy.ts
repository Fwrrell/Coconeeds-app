import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

// list route yang gaboleh di akses kalo udah login
const authRoutes = ["/login", "register"];

// default route
const DEFAULT_REDIRECT = "/app";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  const isProtectedRoute = nextUrl.pathname.startsWith("/app");
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

// regex untuk akses ke suatu file (gambar) yang gaperlu protection
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

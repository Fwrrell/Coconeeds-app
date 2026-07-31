import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";
import { Role, ApprovalStatus } from "@prisma/client";

// list route yang gaboleh di akses kalo udah login
const authRoutes = ["/login", "/register"];

// default route setelah login (jika dari authRoutes)
const DEFAULT_REDIRECT = "/";

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const userStatus = req.auth?.user?.status;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminLoginRoute = nextUrl.pathname === "/admin/login";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Allow all API routes to be accessed
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Handle redirection for logged-in users trying to access login/register pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // Handle admin routes
  if (isAdminRoute) {
    let juriAccess = false;
    try {
      // The proxy runs in Node.js runtime in Next 16, so DB access is safe.
      const setting = await prisma.systemSetting.findUnique({
        where: { id: "global_config" },
        select: { juriAccess: true },
      });
      juriAccess = setting?.juriAccess ?? false;
    } catch (e) {
      // Failsafe: if DB is down, default to secure mode.
      console.error("Proxy failed to read juriAccess setting:", e);
      juriAccess = false;
    }

    const isApprovedAdmin = userRole === Role.ADMIN && userStatus === ApprovalStatus.APPROVED;
    const canAccessAdmin = isApprovedAdmin || (juriAccess && isLoggedIn);

    // Special handling for the admin login page
    if (isAdminLoginRoute) {
      if (canAccessAdmin) {
        // If an authorized user is already logged in, redirect them to the dashboard
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      // Otherwise, allow access to the login page
      return NextResponse.next();
    }

    // For all other admin routes, enforce access rules
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (!canAccessAdmin) {
      // If logged in but not authorized, reject access by redirecting to home
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // If all checks pass, allow access
    return NextResponse.next();
  }

  // Fallback for other protected routes.
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

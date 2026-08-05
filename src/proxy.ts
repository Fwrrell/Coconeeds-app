import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// decode jwt pake gettoken aja biar edge runtime ga bengkak muat prisma
const authRoutes = ["/login", "/register"];
const DEFAULT_REDIRECT = "/";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role;
  const userStatus = token?.approvalStatus;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminLoginRoute = nextUrl.pathname === "/admin/login";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPerusahaanRoute = nextUrl.pathname.startsWith("/perusahaan");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    const isApprovedAdmin = userRole === "ADMIN" && userStatus === "APPROVED";

    if (isAdminLoginRoute) {
      if (isApprovedAdmin) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (!isApprovedAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    return NextResponse.next();
  }

  // guard route perusahaan: hrus login & role PERUSAHAAN + APPROVED
  if (isPerusahaanRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    // jika sudah login tapi bukan perusahaan, redirect sesuai role
    if (userRole === "PETANI") {
      return NextResponse.redirect(new URL("/app", nextUrl));
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }

    const isApprovedCompany =
      userRole === "PERUSAHAAN" && userStatus === "APPROVED";
    if (!isApprovedCompany) {
      return NextResponse.redirect(
        new URL("/login?error=PendingApproval", nextUrl),
      );
    }
    return NextResponse.next();
  }

  const isProtectedRoute = nextUrl.pathname.startsWith("/app");
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    // jika sudah login tapi bukan petani, redirect sesuai role
    if (userRole === "PERUSAHAAN") {
      return NextResponse.redirect(new URL("/perusahaan", nextUrl));
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authRoutes = ["/login", "/register"];
const DEFAULT_REDIRECT = "/";

// Helper function to decode JWT in Edge Middleware for NextAuth v5 / Auth.js
// correctly handling production secure cookies (__Secure-authjs.session-token, __Secure-next-auth.session-token)
async function getAuthToken(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  // 1. Try standard auto-detection
  let token = await getToken({ req: request, secret });
  if (token) return token;

  const isSecure =
    process.env.NODE_ENV === "production" ||
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  // 2. Explicit check for __Secure-authjs.session-token (NextAuth v5 default on HTTPS)
  if (request.cookies.has("__Secure-authjs.session-token") || isSecure) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: true,
      cookieName: "__Secure-authjs.session-token",
      salt: "__Secure-authjs.session-token",
    });
    if (token) return token;
  }

  // 3. Explicit check for authjs.session-token (NextAuth v5 default on HTTP)
  if (request.cookies.has("authjs.session-token")) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: false,
      cookieName: "authjs.session-token",
      salt: "authjs.session-token",
    });
    if (token) return token;
  }

  // 4. Explicit check for __Secure-next-auth.session-token (Legacy NextAuth default on HTTPS)
  if (request.cookies.has("__Secure-next-auth.session-token")) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: true,
      cookieName: "__Secure-next-auth.session-token",
      salt: "__Secure-next-auth.session-token",
    });
    if (token) return token;
  }

  // 5. Explicit check for next-auth.session-token (Legacy NextAuth default on HTTP)
  if (request.cookies.has("next-auth.session-token")) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: false,
      cookieName: "next-auth.session-token",
      salt: "next-auth.session-token",
    });
    if (token) return token;
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const token = await getAuthToken(request);

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


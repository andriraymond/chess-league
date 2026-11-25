import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;
  const userStatus = (req.auth?.user as any)?.status;

  // Proteksi halaman admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (userStatus !== "APPROVED") {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }
    if (pathname.startsWith("/super-admin") && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Redirect ke admin jika sudah login tapi buka halaman auth
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (isLoggedIn && userStatus === "APPROVED") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/auth/login", "/auth/register"],
};

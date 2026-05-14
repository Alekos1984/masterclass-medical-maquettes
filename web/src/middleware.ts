import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ROUTES_FORMATEUR = /^\/formateur/;
const ROUTES_PARTICIPANT = /^\/participant/;
const ROUTES_ADMIN = /^\/admin/;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (ROUTES_FORMATEUR.test(pathname)) {
    if (!session) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "FORMATEUR" && role !== "ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
  }

  if (ROUTES_PARTICIPANT.test(pathname)) {
    if (!session) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "PARTICIPANT" && role !== "ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
  }

  if (ROUTES_ADMIN.test(pathname)) {
    if (!session) return NextResponse.redirect(new URL("/auth/login", req.url));
    if (role !== "ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/formateur/:path*",
    "/participant/:path*",
    "/admin/:path*",
  ],
};

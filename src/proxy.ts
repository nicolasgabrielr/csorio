import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const isLoginPath = req.nextUrl.pathname === "/admin/login";
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");

  // Auth.js v5 guarda la sesión JWT en estas cookies
  const sessionCookie =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionCookie;

  // Ruta admin sin login → redirigir al login
  if (isAdminPath && !isLoginPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Ya está logueado y va al login → redirigir al panel
  if (isLoginPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/invitados", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

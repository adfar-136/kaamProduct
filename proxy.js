import { NextResponse } from "next/server";

export default function proxy(request) {
  const sessionToken = request.cookies.get("better-auth.session_token") || 
                       request.cookies.get("__Secure-better-auth.session_token");
  
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = path.startsWith("/dashboard") || 
                           path.startsWith("/brainstorm") || 
                           path.startsWith("/team") || 
                           path.startsWith("/settings");
  
  const isAuthRoute = path.startsWith("/auth");

  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/brainstorm/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/auth/:path*",
  ],
};

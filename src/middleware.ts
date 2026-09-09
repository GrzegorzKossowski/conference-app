import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/organizer/login";
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && !isLoginPage) {
    const loginUrl = new URL("/organizer/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/organizer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/organizer/:path*"],
};

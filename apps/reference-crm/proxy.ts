import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { demoSessionCookie, demoSessionValue } from "@/lib/demo-session";

export function proxy(request: NextRequest) {
  if (request.cookies.get(demoSessionCookie)?.value === demoSessionValue) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/clients/:path*", "/settings/:path*"],
};

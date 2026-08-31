import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DATAROOM_ACCESS_COOKIE } from "@/lib/dataroom-auth";

function isProtected(pathname: string) {
  if (pathname.startsWith("/legal/")) return true;
  if (pathname.startsWith("/decks/")) return true;
  if (pathname.startsWith("/evidence/")) return true;
  if (pathname.startsWith("/media/")) return true;
  if (/^\/bound-[a-z0-9-]+\.html$/i.test(pathname)) return true;
  return false;
}

/** Confidential static assets — require a valid Data Room session cookie. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  if (request.cookies.get(DATAROOM_ACCESS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/dataroom";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/bound-:path*", "/legal/:path*", "/decks/:path*", "/evidence/:path*", "/media/:path*"],
};

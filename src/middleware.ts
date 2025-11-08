import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // For localhost, allow all routes without redirects
  if (host.includes("localhost")) {
    return NextResponse.next();
  }

  // Only apply production redirects if on production domains
  if (pathname === "/" && host.includes("hellojia.ai")) {
    url.pathname = "/job-portal";
    return NextResponse.rewrite(url);
  }

  if (
    host.includes("hirejia.ai") &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/job-openings") || pathname.startsWith("/login"))
  ) {
    const newUrl = new URL(request.url);
    newUrl.hostname = "hellojia.ai";
    return NextResponse.redirect(newUrl);
  }

  if (host.startsWith("admin.hirejia.ai") && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/admin-portal`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/recruiter-dashboard/:path*',
    '/applicant/:path*',
    '/dashboard/:path*',
    '/job-openings/:path*',
    '/whitecloak/:path*',
    '/admin-portal/:path*',
    '/'
  ],
};
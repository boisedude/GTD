// Middleware disabled - using client-side auth only to avoid SSR issues
// All authentication logic is handled in client components and ProtectedRoute

import { NextResponse } from "next/server";

export async function middleware() {
  // Simply pass through all requests - auth is handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

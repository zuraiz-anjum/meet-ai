import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

const authRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = ["/dashboard"];

export default async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.some((route) => pathName.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathName.startsWith(route)
  );

  const session = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: process.env.BETTER_AUTH_URL,
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

  if (!session.data) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
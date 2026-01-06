import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // if (!session) {
  //   const signInUrl = new URL("/auth/sign-in", request.url);
  //   signInUrl.searchParams.set(
  //     "redirectTo",
  //     request.nextUrl.pathname + request.nextUrl.search
  //   );
  //   return NextResponse.redirect(signInUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isStudioAccessAllowed, isStudioAuthConfigured } from "@/lib/studio-auth";

/**
 * Keep the embedded Sanity Studio off the public web. Set STUDIO_USER and
 * STUDIO_PASSWORD to require HTTP Basic auth; without them the route returns
 * 404 in production (dev stays open for local editing).
 */
export function proxy(request: NextRequest) {
  const config = {
    user: process.env.STUDIO_USER,
    password: process.env.STUDIO_PASSWORD,
    isProduction: process.env.NODE_ENV === "production",
  };

  if (!isStudioAccessAllowed(config, request.headers.get("authorization"))) {
    const headers = { "X-Robots-Tag": "noindex, nofollow" };
    if (isStudioAuthConfigured(config)) {
      return new NextResponse("Authentication required.", {
        status: 401,
        headers: {
          ...headers,
          "WWW-Authenticate": 'Basic realm="Aromire Studio", charset="UTF-8"',
        },
      });
    }
    return new NextResponse("Not Found", { status: 404, headers });
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/studio", "/studio/:path*"],
};

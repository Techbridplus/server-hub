import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/socket") {
    console.log("WebSocket upgrade attempt or API hit detected.");

    const upgrade = request.headers.get("upgrade");

    // Handle WebSocket upgrade request
    if (upgrade?.toLowerCase() === "websocket") {
      return new NextResponse(null, {
        status: 101,
        headers: {
          Upgrade: "websocket",
          Connection: "Upgrade", // fix typo: should be "Upgrade"
        },
      });
    }
  }

  return NextResponse.next();
}

console.log("helllo");

export const config = {
  matcher: "/api/socket",
};

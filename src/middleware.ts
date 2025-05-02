import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/api/socket") {
    const upgradeHeader = request.headers.get("upgrade")?.toLowerCase();

    if (upgradeHeader === "websocket") {
      console.log("[Middleware] WebSocket upgrade request detected for /api/socket.");

      return new NextResponse(null, {
        status: 101,
        headers: {
          Upgrade: "websocket",
          Connection: "Upgrade", // Correct header
        },
      });
    }

    console.log("[Middleware] Non-websocket request to /api/socket.");
  }

  return NextResponse.next();
}

// Apply only to /api/socket
export const config = {
  matcher: "/api/socket",
};

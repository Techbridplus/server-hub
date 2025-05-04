import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Handle WebSocket upgrade requests
  if (request.nextUrl.pathname === "/api/socket") {
    const upgrade = request.headers.get("upgrade")
    
    if (upgrade?.toLowerCase() === "websocket") {
      return new NextResponse(null, {
        status: 101,
        headers: {
          "Upgrade": "websocket",
          "Connection": "Upgrade"
        }
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/socket"
} 
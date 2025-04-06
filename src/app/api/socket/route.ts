import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const upgrade = req.headers.get("upgrade")
    
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
      return NextResponse.json(
        { error: "WebSocket upgrade required" },
        { status: 426 }
      )
    }
    
    return new NextResponse(null, {
      status: 101,
      headers: {
        "Upgrade": "websocket",
        "Connection": "Upgrade"
      }
    })
  } catch (error) {
    console.error("Socket route error:", error)
    return NextResponse.json(
      { error: "Failed to handle socket connection" },
      { status: 500 }
    )
  }
} 
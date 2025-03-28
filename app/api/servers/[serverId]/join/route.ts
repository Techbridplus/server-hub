import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"

// POST /api/servers/[serverId]/join - Join a server
export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId } = params
      const { accessKey } = await req.json()

      // Check if server exists
      const server = await prisma.server.findUnique({
        where: {
          id: serverId,
        },
        select: {
          isPrivate: true,
          accessKey: true,
        },
      })

      if (!server) {
        return NextResponse.json({ error: "Server not found" }, { status: 404 })
      }

      // Check if user is already a member
      const existingMembership = await prisma.serverMember.findUnique({
        where: {
          userId_serverId: {
            userId: session.user.id,
            serverId,
          },
        },
      })

      if (existingMembership) {
        return NextResponse.json({ error: "You are already a member of this server" }, { status: 400 })
      }

      // Check access key for private servers
      if (server.isPrivate && server.accessKey !== accessKey) {
        return NextResponse.json({ error: "Invalid access key" }, { status: 403 })
      }

      // Join server
      const membership = await prisma.serverMember.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          server: {
            connect: {
              id: serverId,
            },
          },
          role: "member",
        },
      })

      return NextResponse.json(membership)
    } catch (error) {
      console.error("Error joining server:", error)
      return NextResponse.json({ error: "Failed to join server" }, { status: 500 })
    }
  })
}


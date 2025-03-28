import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"

// GET /api/users/me/servers - Get current user's servers
export async function GET(req: NextRequest) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      // Get owned servers
      const ownedServers = await prisma.server.findMany({
        where: {
          ownerId: session.user.id,
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // Get joined servers
      const joinedServers = await prisma.serverMember.findMany({
        where: {
          userId: session.user.id,
          server: {
            ownerId: {
              not: session.user.id,
            },
          },
        },
        include: {
          server: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
        orderBy: {
          joinedAt: "desc",
        },
      })

      return NextResponse.json({
        owned: ownedServers,
        joined: joinedServers.map((membership) => membership.server),
      })
    } catch (error) {
      console.error("Error fetching user servers:", error)
      return NextResponse.json({ error: "Failed to fetch user servers" }, { status: 500 })
    }
  })
}


import { NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/users/me/servers - Get current user's servers
export async function GET(req: NextRequest) {
  return authMiddlewareAppRouter(req, async (req, session) => {
    try {
      const { searchParams } = new URL(req.url)
      const owned = searchParams.get("owned") === "true"
      const joined = searchParams.get("joined") === "true"

      // Build the where clause based on query parameters
      const where: any = {}

      if (owned) {
        where.ownerId = session.user.id
      } else if (joined) {
        where.members = {
          some: {
            userId: session.user.id,
          },
        }
      } else {
        // If no specific query, return both owned and joined servers
        where.OR = [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ]
      }

      const servers = await prisma.server.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
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

      return NextResponse.json(servers)
    } catch (error) {
      console.error("Error fetching user servers:", error)
      return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 })
    }
  })
}


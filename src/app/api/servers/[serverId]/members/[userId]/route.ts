import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"

// PUT /api/servers/[serverId]/members/[userId] - Update member role
export async function PUT(req: NextRequest, { params }: { params: { serverId: string; userId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, userId } = params
      const { role } = await req.json()

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Check if target user is server owner
      const server = await prisma.server.findUnique({
        where: {
          id: serverId,
        },
        select: {
          ownerId: true,
        },
      })

      if (server?.ownerId === userId) {
        return NextResponse.json({ error: "Cannot change role of server owner" }, { status: 400 })
      }

      // Update member role
      const member = await prisma.serverMember.update({
        where: {
          userId_serverId: {
            userId,
            serverId,
          },
        },
        data: {
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      return NextResponse.json(member)
    } catch (error) {
      console.error("Error updating member role:", error)
      return NextResponse.json({ error: "Failed to update member role" }, { status: 500 })
    }
  })
}

// DELETE /api/servers/[serverId]/members/[userId] - Remove member from server
export async function DELETE(req: NextRequest, { params }: { params: { serverId: string; userId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, userId } = params

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Check if target user is server owner
      const server = await prisma.server.findUnique({
        where: {
          id: serverId,
        },
        select: {
          ownerId: true,
        },
      })

      if (server?.ownerId === userId) {
        return NextResponse.json({ error: "Cannot remove server owner" }, { status: 400 })
      }

      // Remove member
      await prisma.serverMember.delete({
        where: {
          userId_serverId: {
            userId,
            serverId,
          },
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error removing member:", error)
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
    }
  })
}


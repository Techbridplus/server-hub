import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"


// GET /api/servers/[serverId] - Get server details
export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {

      try {
        // Ensure params is properly awaited
        const { serverId } = await Promise.resolve(params)
        const userId = session.user.id
        const server = await prisma.server.findUnique({
          where: {
            id: serverId,
          },
          include: {
            members: {
                where: {
                  userId: userId, // Fetch only the specific user's role in the server
                },
                select: {
                  role: true, // Include only the role field
                },
            },
            _count: {
                select: {
                  members: true, // Fetch the total number of members
                },
            },
            events: true,
            groups: true,
            announcements: true,
          },
        });

        if (!server) {
          return NextResponse.json({ error: "Server not found" }, { status: 404 })
        }

        return NextResponse.json(server)
      } catch (error) {
        console.error("Error fetching server:", error)
        return NextResponse.json({ error: "Failed to fetch server" }, { status: 500 })
      }
    })
}

// PUT /api/servers/[serverId] - Update server
export async function PUT(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      // Ensure params is properly awaited
      const { serverId } = await Promise.resolve(params)
      const { name, description, category, isPrivate, isExclusive, accessKey, imageUrl, bannerUrl, tags } =
        await req.json()

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Update server
      const server = await prisma.server.update({
        where: {
          id: serverId,
        },
        data: {
          name,
          description,
          category,
          isPrivate,
          isExclusive,
          accessKey: isPrivate ? accessKey : null,
          imageUrl,
          bannerUrl,
        },
      })

      // Update tags if provided
      if (tags) {
        // Delete existing tags
        await prisma.serverTag.deleteMany({
          where: {
            serverId,
          },
        })

        // Create new tags
        await prisma.serverTag.createMany({
          data: tags.map((tag: string) => ({
            name: tag,
            serverId,
          })),
        })
      }

      return NextResponse.json(server)
    } catch (error) {
      console.error("Error updating server:", error)
      return NextResponse.json({ error: "Failed to update server" }, { status: 500 })
    }
  })
}

// DELETE /api/servers/[serverId] - Delete server
export async function DELETE(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      // Ensure params is properly awaited
      const { serverId } = await Promise.resolve(params)

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Delete server
      await prisma.server.delete({
        where: {
          id: serverId,
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting server:", error)
      return NextResponse.json({ error: "Failed to delete server" }, { status: 500 })
    }
  })
}


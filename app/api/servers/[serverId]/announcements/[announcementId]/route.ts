import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"
//import { prisma } from "@/lib/db"

// GET /api/servers/[serverId]/announcements/[announcementId] - Get announcement details
export async function GET(req: NextRequest, { params }: { params: { serverId: string; announcementId: string } }) {
const prisma = {};
  try {
    const { serverId, announcementId } = params

    // Get announcement details
    const announcement = await prisma.announcement.findUnique({
      where: {
        id: announcementId,
        serverId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("Error fetching announcement:", error)
    return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 })
  }
}

// PUT /api/servers/[serverId]/announcements/[announcementId] - Update announcement
export async function PUT(req: NextRequest, { params }: { params: { serverId: string; announcementId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, announcementId } = params
      const { title, content, isImportant } = await req.json()

      // Check if announcement exists
      const announcement = await prisma.announcement.findUnique({
        where: {
          id: announcementId,
          serverId,
        },
        select: {
          authorId: true,
        },
      })

      if (!announcement) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
      }

      // Check if user is announcement author
      if (announcement.authorId !== session.user.id) {
        // Check if user is server admin
        const isAdmin = await isServerAdmin(session.user.id, serverId)
        if (!isAdmin) {
          return NextResponse.json(
            { error: "Only the announcement author or server admin can update the announcement" },
            { status: 403 },
          )
        }
      }

      // Update announcement
      const updatedAnnouncement = await prisma.announcement.update({
        where: {
          id: announcementId,
        },
        data: {
          title,
          content,
          isImportant,
        },
      })

      return NextResponse.json(updatedAnnouncement)
    } catch (error) {
      console.error("Error updating announcement:", error)
      return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
    }
  })
}

// DELETE /api/servers/[serverId]/announcements/[announcementId] - Delete announcement
export async function DELETE(req: NextRequest, { params }: { params: { serverId: string; announcementId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, announcementId } = params

      // Check if announcement exists
      const announcement = await prisma.announcement.findUnique({
        where: {
          id: announcementId,
          serverId,
        },
        select: {
          authorId: true,
        },
      })

      if (!announcement) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
      }

      // Check if user is announcement author
      if (announcement.authorId !== session.user.id) {
        // Check if user is server admin
        const isAdmin = await isServerAdmin(session.user.id, serverId)
        if (!isAdmin) {
          return NextResponse.json(
            { error: "Only the announcement author or server admin can delete the announcement" },
            { status: 403 },
          )
        }
      }

      // Delete announcement
      await prisma.announcement.delete({
        where: {
          id: announcementId,
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting announcement:", error)
      return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
    }
  })
}


import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma" // Import prisma

// GET /api/servers/[serverId]/announcements - Get server announcements
export async function GET(req: NextRequest, context: { params: { serverId: string } }) {
  try {
    // Ensure params is properly awaited
    const { serverId } = context.params
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get announcements with pagination
    const announcements = await prisma.announcement.findMany({
      where: {
        serverId,
      },
      include: {
        // author: {
        //   select: {
        //     id: true,
        //     name: true,
        //     image: true,
        //   },
        // },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: [
        { createdAt: "desc" }, // Newest first
      ],
    })

    // Get total count for pagination
    const total = await prisma.announcement.count({
      where: {
        serverId,
      },
    })

    return NextResponse.json({
      announcements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/announcements - Create a new announcement
export async function POST(req: NextRequest, context: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      // Ensure params is properly awaited
      const { serverId } = context.params
      const { title, content, isImportant } = await req.json()

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Only server admins can create announcements" }, { status: 403 })
      }

      // Validate required fields
      if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
      }

      // Create announcement
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          userId: session.user.id,
          serverId,
        },
      })

      return NextResponse.json(announcement)
    } catch (error) {
      console.error("Error creating announcement:", error)
      return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
    }
  })
}


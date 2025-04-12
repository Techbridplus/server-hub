import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/servers/[serverId]/events/[eventId]/comments - Get event comments
export async function GET(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  try {
    const { serverId, eventId } = params
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get comments with pagination
    const comments = await prisma.eventComment.findMany({
      where: {
        eventId,
        event: {
          serverId,
        },
      },
      include: {
        event: {
          select: {
            serverId: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get total count for pagination
    const total = await prisma.eventComment.count({
      where: {
        eventId,
        event: {
          serverId,
        },
      },
    })

    // Get user information for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await prisma.user.findUnique({
          where: { id: comment.userId },
          select: {
            id: true,
            name: true,
            image: true,
          },
        })
        return {
          ...comment,
          author: user,
        }
      })
    )

    return NextResponse.json({
      comments: commentsWithUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/events/[eventId]/comments - Create a comment
export async function POST(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params
      const { content } = await req.json()

      // Check if user is server member
      const serverMember = await prisma.serverMember.findFirst({
        where: {
          userId: session.user.id,
          serverId,
        },
      })

      if (!serverMember) {
        return NextResponse.json({ error: "You must be a member to comment" }, { status: 403 })
      }

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          serverId,
        },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Create comment
      const comment = await prisma.eventComment.create({
        data: {
          content,
          userId: session.user.id,
          eventId,
        },
      })

      // Get user information for the comment
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          image: true,
        },
      })

      return NextResponse.json({
        ...comment,
        author: user,
      })
    } catch (error) {
      console.error("Error creating comment:", error)
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }
  })
}


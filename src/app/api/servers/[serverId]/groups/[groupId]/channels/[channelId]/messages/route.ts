import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/servers/[serverId]/groups/[groupId]/channels/[channelId]/messages - Get channel messages
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; groupId: string; channelId: string } },
) {
  try {
    // Access params directly without awaiting
    const { serverId, groupId, channelId } = await params
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Build query
    const query: any = {
      where: {
        channelId,
        channel: {
          groupId,
          group: {
            serverId,
          },
        },
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    }

    // Add cursor for pagination
    if (cursor) {
      query.cursor = {
        id: cursor,
      }
      query.skip = 1 // Skip the cursor
    }

    // Get messages
    const messages = await prisma.message.findMany(query)

    // Get next cursor
    const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to get oldest first
      nextCursor,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/groups/[groupId]/channels/[channelId]/messages - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string; groupId: string; channelId: string } },
) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      // Access params directly without awaiting
      const { serverId, groupId, channelId } = await params
      const { content } = await req.json()

      // Check if user is group member
      const groupMember = await prisma.groupMember.findFirst({
        where: {
          userId: session.user.id,
          groupId,
        },
      })

      if (!groupMember) {
        return NextResponse.json({ error: "You must be a group member to send messages" }, { status: 403 })
      }

      // Check if channel exists
      const channel = await prisma.channel.findUnique({
        where: {
          id: channelId,
          groupId,
          group: {
            serverId,
          },
        },
      })

      if (!channel) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 })
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          content,
          user: {
            connect: {
              id: session.user.id,
            },
          },
          channel: {
            connect: {
              id: channelId,
            },
          },
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

      return NextResponse.json(message)
    } catch (error) {
      console.error("Error sending message:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
  })
}


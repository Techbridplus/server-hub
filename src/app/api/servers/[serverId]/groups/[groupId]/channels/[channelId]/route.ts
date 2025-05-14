import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isGroupAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/servers/[serverId]/groups/[groupId]/channels/[channelId] - Get channel details
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; groupId: string; channelId: string } },
) {

  try {
    const { serverId, groupId, channelId } = params

    // Get channel details
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

    return NextResponse.json(channel)
  } catch (error) {
    console.error("Error fetching channel:", error)
    return NextResponse.json({ error: "Failed to fetch channel" }, { status: 500 })
  }
}

// PUT /api/servers/[serverId]/groups/[groupId]/channels/[channelId] - Update channel
export async function PUT(
  req: NextRequest,
  { params }: { params: { serverId: string; groupId: string; channelId: string } },
) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId, channelId } = params
      const { name, isPrivate } = await req.json()

      // Check if user is group admin
      const isAdmin = await isGroupAdmin(session.user.id, groupId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Only group admins can update channels" }, { status: 403 })
      }

      // Update channel
      const channel = await prisma.channel.update({
        where: {
          id: channelId,
          groupId,
          group: {
            serverId,
          },
        },
        data: {
          name,
  
        },
      })

      return NextResponse.json(channel)
    } catch (error) {
      console.error("Error updating channel:", error)
      return NextResponse.json({ error: "Failed to update channel" }, { status: 500 })
    }
  })
}

// DELETE /api/servers/[serverId]/groups/[groupId]/channels/[channelId] - Delete channel
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; groupId: string; channelId: string } },
) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId, channelId } = params

      // Check if user is group admin
      const isAdmin = await isGroupAdmin(session.user.id, groupId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Only group admins can delete channels" }, { status: 403 })
      }

      // Delete channel
      await prisma.channel.delete({
        where: {
          id: channelId,
          groupId,
          group: {
            serverId,
          },
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting channel:", error)
      return NextResponse.json({ error: "Failed to delete channel" }, { status: 500 })
    }
  })
}


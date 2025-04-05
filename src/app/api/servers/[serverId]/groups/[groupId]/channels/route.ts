import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isGroupAdmin } from "@/lib/auth"
//import { prisma } from "@/lib/db"

// GET /api/servers/[serverId]/groups/[groupId]/channels - Get group channels
export async function GET(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
const prisma = {};
  try {
    const { serverId, groupId } = params

    // Get channels
    const channels = await prisma.channel.findMany({
      where: {
        groupId,
        group: {
          serverId,
        },
      },
      orderBy: [
        { type: "asc" }, // Text channels first, then voice
        { name: "asc" }, // Alphabetical by name
      ],
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/groups/[groupId]/channels - Create a new channel
export async function POST(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId } = params
      const { name, type, isPrivate } = await req.json()

      // Check if user is group admin
      const isAdmin = await isGroupAdmin(session.user.id, groupId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Only group admins can create channels" }, { status: 403 })
      }

      // Validate required fields
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
      }

      // Create channel
      const channel = await prisma.channel.create({
        data: {
          name,
          type: type || "text",
          isPrivate: isPrivate || false,
          group: {
            connect: {
              id: groupId,
            },
          },
        },
      })

      return NextResponse.json(channel)
    } catch (error) {
      console.error("Error creating channel:", error)
      return NextResponse.json({ error: "Failed to create channel" }, { status: 500 })
    }
  })
}


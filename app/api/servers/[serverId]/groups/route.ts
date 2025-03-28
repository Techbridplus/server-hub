import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerMember } from "@/lib/auth"
//import { prisma } from "@/lib/db"

// GET /api/servers/[serverId]/groups - Get server groups
export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
const prisma = {};
  try {
    const { serverId } = params
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get groups with pagination
    const groups = await prisma.group.findMany({
      where: {
        serverId,
      },
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
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get total count for pagination
    const total = await prisma.group.count({
      where: {
        serverId,
      },
    })

    return NextResponse.json({
      groups,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/groups - Create a new group
export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId } = params
      const { name, description, imageUrl, isPrivate } = await req.json()

      // Check if user is server member
      const isMember = await isServerMember(session.user.id, serverId)
      if (!isMember) {
        return NextResponse.json({ error: "You must be a member to create groups" }, { status: 403 })
      }

      // Validate required fields
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
      }

      // Create group
      const group = await prisma.group.create({
        data: {
          name,
          description,
          imageUrl,
          isPrivate: isPrivate || false,
          owner: {
            connect: {
              id: session.user.id,
            },
          },
          server: {
            connect: {
              id: serverId,
            },
          },
          // Add the creator as an admin member
          members: {
            create: {
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              role: "admin",
            },
          },
          // Create default channels
          channels: {
            createMany: {
              data: [
                {
                  name: "general",
                  type: "text",
                  isPrivate: false,
                },
                {
                  name: "voice-chat",
                  type: "voice",
                  isPrivate: false,
                },
              ],
            },
          },
        },
      })

      return NextResponse.json(group)
    } catch (error) {
      console.error("Error creating group:", error)
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
    }
  })
}


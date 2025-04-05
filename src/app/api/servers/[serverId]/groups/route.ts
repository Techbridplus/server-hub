import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/servers/[serverId]/groups - Get server groups
export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
  try {
    // Ensure params is properly awaited
    const { serverId } = await Promise.resolve(params)
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
        totalPages: Math.ceil(total / limit),
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
      // Ensure params is properly awaited
      const { serverId } = await Promise.resolve(params)
      const userId = session.user.id

      // Check if user has permission to create groups
      const serverMember = await prisma.serverMember.findFirst({
        where: {
          userId,
          serverId,
        },
        select: {
          role: true,
        },
      })

      if (!serverMember || (serverMember.role !== "admin" && serverMember.role !== "moderator")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      const { name, description, imageUrl } = await req.json()

      // Create group
      const group = await prisma.group.create({
        data: {
          name,
          description,
          imageUrl,
          serverId,
        },
      })

      return NextResponse.json(group)
    } catch (error) {
      console.error("Error creating group:", error)
      return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
    }
  })
}


import { type NextRequest, NextResponse } from "next/server"
//import prisma from "@/lib/prisma"

// GET /api/servers/[serverId]/members - Get server members
export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
const prisma = {};
  try {
    const { serverId } = params
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {
      serverId,
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.user = {
        OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }],
      }
    }

    // Get members with pagination
    const members = await prisma.serverMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: [
        { role: "asc" }, // Admin first, then moderator, then member
        { joinedAt: "asc" }, // Oldest members first
      ],
    })

    // Get total count for pagination
    const total = await prisma.serverMember.count({ where })

    return NextResponse.json({
      members,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching server members:", error)
    return NextResponse.json({ error: "Failed to fetch server members" }, { status: 500 })
  }
}


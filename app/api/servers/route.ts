import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/servers - Get all servers
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  try {
    // Build filter conditions
    const where: any = {}

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    // Get servers with pagination
    const servers = await prisma.server.findMany({
      where,
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
        tags: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get total count for pagination
    const total = await prisma.server.count({ where })

    return NextResponse.json({
      servers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching servers:", error)
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 })
  }
}

// POST /api/servers - Create a new server
export async function POST(req: NextRequest) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { name, description, category, isPrivate, isExclusive, accessKey, imageUrl, bannerUrl, tags } =
        await req.json()

      // Validate required fields
      if (!name || !category) {
        return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
      }

      // Create server
      const server = await prisma.server.create({
        data: {
          name,
          description,
          category,
          isPrivate: isPrivate || false,
          isExclusive: isExclusive || false,
          accessKey: isPrivate ? accessKey : null,
          imageUrl,
          bannerUrl,
          owner: {
            connect: {
              id: session.user.id,
            },
          },
          // Add the owner as an admin member
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
          // Add tags if provided
          tags: tags
            ? {
                create: tags.map((tag: string) => ({
                  name: tag,
                })),
              }
            : undefined,
        },
      })

      return NextResponse.json(server)
    } catch (error) {
      console.error("Error creating server:", error)
      return NextResponse.json({ error: "Failed to create server" }, { status: 500 })
    }
  })
}


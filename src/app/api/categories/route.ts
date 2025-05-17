import { NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface ServerCategory {
  category: string
  _count: {
    members: number
  }
}

interface CategoryInfo {
  name: string
  count: number
}

// GET /api/categories - Get all unique categories with their server counts
export async function GET() {
  try {
    // Get all servers to extract unique categories
    const servers = await prisma.server.findMany({
      select: {
        category: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    }) as ServerCategory[]

    // Create a map to store unique categories and their counts
    const categoryMap = new Map<string, CategoryInfo>()

    // Process each server to count categories
    servers.forEach((server: ServerCategory) => {
      const currentCount = categoryMap.get(server.category)?.count || 0
      categoryMap.set(server.category, {
        name: server.category,
        count: currentCount + 1,
      })
    })

    // Convert map to array and sort by name
    const categories = Array.from(categoryMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    )

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// GET /api/categories/[category]/servers - Get servers for a specific category (protected route)
export async function GET_SERVERS(req: NextRequest) {
  return authMiddlewareAppRouter(async (session) => {
    try {

      const category = req.url.split("/").pop()?.split("?")[0]
      
      if (!category) {
        return NextResponse.json({ error: "Category is required" }, { status: 400 })
      }

      const { searchParams } = new URL(req.url)
      const page = Number(searchParams.get("page") || "1")
      const limit = Number(searchParams.get("limit") || "10")
      const skip = (page - 1) * limit

      // Get servers for the category with pagination
      const servers = await prisma.server.findMany({
        where: {
          category: {
            equals: category,
            mode: "insensitive",
          },
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
      const total = await prisma.server.count({
        where: {
          category: {
            equals: category,
            mode: "insensitive",
          },
        },
      })

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
      console.error("Error fetching category servers:", error)
      return NextResponse.json({ error: "Failed to fetch category servers" }, { status: 500 })
    }
  })
} 
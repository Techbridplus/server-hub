import { type NextRequest, NextResponse } from "next/server"
//import { PrismaClient } from "@prisma/client"

//const prisma = new PrismaClient()

const prisma = {};

// GET /api/search - Search for servers, events, groups, etc.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all" // all, servers, events, groups, users
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results: any = {}
    let total = 0

    // Search servers
    if (type === "all" || type === "servers") {
      const servers = await prisma.server.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
          ],
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
          tags: true,
        },
        skip: type === "servers" ? skip : 0,
        take: type === "servers" ? limit : 3,
        orderBy: {
          createdAt: "desc",
        },
      })

      const serversCount = await prisma.server.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
          ],
        },
      })

      results.servers = servers
      if (type === "servers") {
        total = serversCount
      }
    }

    // Search events
    if (type === "all" || type === "events") {
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          server: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        skip: type === "events" ? skip : 0,
        take: type === "events" ? limit : 3,
        orderBy: {
          startTime: "asc",
        },
      })

      const eventsCount = await prisma.event.count({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
      })

      results.events = events
      if (type === "events") {
        total = eventsCount
      }
    }

    // Search groups
    if (type === "all" || type === "groups") {
      const groups = await prisma.group.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          server: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        skip: type === "groups" ? skip : 0,
        take: type === "groups" ? limit : 3,
        orderBy: {
          createdAt: "desc",
        },
      })

      const groupsCount = await prisma.group.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      })

      results.groups = groups
      if (type === "groups") {
        total = groupsCount
      }
    }

    // Search users
    if (type === "all" || type === "users") {
      const users = await prisma.user.findMany({
        where: {
          OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
        },
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          _count: {
            select: {
              ownedServers: true,
              serverMemberships: true,
            },
          },
        },
        skip: type === "users" ? skip : 0,
        take: type === "users" ? limit : 3,
        orderBy: {
          name: "asc",
        },
      })

      const usersCount = await prisma.user.count({
        where: {
          OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
        },
      })

      results.users = users
      if (type === "users") {
        total = usersCount
      }
    }

    // Calculate total for 'all' type
    if (type === "all") {
      total =
        (results.servers?.length || 0) +
        (results.events?.length || 0) +
        (results.groups?.length || 0) +
        (results.users?.length || 0)
    }

    return NextResponse.json({
      results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}


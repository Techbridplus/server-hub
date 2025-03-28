import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerMember } from "@/lib/auth"
//import { prisma } from "@/lib/prisma"


// GET /api/servers/[serverId]/announcements/[announcementId]/comments - Get announcement comments
export async function GET(req: NextRequest, { params }: { params: { 
serverId: string; announcementId: string } }) {
  const prisma = {};
  try {
    const { serverId, announcementId } = params
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get comments with pagination
    const comments = await prisma.comment.findMany({
      where: {
        announcementId,
        announcement: {
          serverId,
        },
        parentId: null, // Only get top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
        replies: {
          take: 3, // Get first 3 replies
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
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
    const total = await prisma.comment.count({
      where: {
        announcementId,
        announcement: {
          serverId,
        },
        parentId: null,
      },
    })

    return NextResponse.json({
      comments,
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

// POST /api/servers/[serverId]/announcements/[announcementId]/comments - Create a comment
export async function POST(req: NextRequest, { params }: { params: { serverId: string; announcementId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, announcementId } = params
      const { content, parentId } = await req.json()

      // Check if user is server member
      const isMember = await isServerMember(session.user.id, serverId)
      if (!isMember) {
        return NextResponse.json({ error: "You must be a member to comment" }, { status: 403 })
      }

      // Check if announcement exists
      const announcement = await prisma.announcement.findUnique({
        where: {
          id: announcementId,
          serverId,
        },
      })

      if (!announcement) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
      }

      // If this is a reply, check if parent comment exists
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: {
            id: parentId,
            announcementId,
          },
        })

        if (!parentComment) {
          return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
        }
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          content,
          author: {
            connect: {
              id: session.user.id,
            },
          },
          announcement: {
            connect: {
              id: announcementId,
            },
          },
          parent: parentId
            ? {
                connect: {
                  id: parentId,
                },
              }
            : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      return NextResponse.json(comment)
    } catch (error) {
      console.error("Error creating comment:", error)
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }
  })
}


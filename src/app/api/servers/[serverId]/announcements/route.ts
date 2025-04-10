import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Define types for our response
interface AnnouncementWithAuthor {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
  serverId: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  _count: {
    comments: number;
    likes: number;
  };
}

// GET /api/servers/[serverId]/announcements - Get server announcements
export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const serverId  = params.serverId
      const { searchParams } = new URL(req.url)
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")
      const skip = (page - 1) * limit

      // Get all announcements for the server
      const allAnnouncements = await prisma.announcement.findMany({
        where: {
          serverId,
        },
        orderBy: [
          { isImportant: "desc" }, // Important announcements first
          { createdAt: "desc" }, // Then newest first
        ],
      })

      // Filter out announcements with null authorId
      const validAnnouncements = allAnnouncements.filter(a => a.authorId)
      
      // Apply pagination after filtering
      const paginatedAnnouncements = validAnnouncements.slice(skip, skip + limit)
      
      // Get author information for valid announcements
      let announcements: AnnouncementWithAuthor[] = []
      if (paginatedAnnouncements.length > 0) {
        const authorIds = paginatedAnnouncements.map(a => a.authorId)
        const authors = await prisma.user.findMany({
          where: {
            id: {
              in: authorIds
            }
          },
          select: {
            id: true,
            name: true,
            image: true
          }
        })
        
        // Create a map of author IDs to author objects
        const authorMap = new Map(authors.map(a => [a.id, a]))
        
        // Get counts for each announcement
        const announcementIds = paginatedAnnouncements.map(a => a.id)
        const [commentsCounts, likesCounts] = await Promise.all([
          prisma.comment.groupBy({
            by: ['announcementId'],
            where: {
              announcementId: {
                in: announcementIds
              }
            },
            _count: true
          }),
          prisma.like.groupBy({
            by: ['announcementId'],
            where: {
              announcementId: {
                in: announcementIds
              }
            },
            _count: true
          })
        ])
        
        // Create maps for counts
        const commentsMap = new Map(commentsCounts.map(c => [c.announcementId, c._count]))
        const likesMap = new Map(likesCounts.map(l => [l.announcementId, l._count]))
        
        // Combine announcements with author information and counts
        announcements = paginatedAnnouncements.map(a => ({
          ...a,
          author: authorMap.get(a.authorId) || null,
          _count: {
            comments: commentsMap.get(a.id) || 0,
            likes: likesMap.get(a.id) || 0
          }
        })) as AnnouncementWithAuthor[]
      }

      return NextResponse.json({
        announcements,
        pagination: {
          total: validAnnouncements.length,
          page,
          limit,
          totalPages: Math.ceil(validAnnouncements.length / limit),
        },
      })
    } catch (error) {
      console.error("Error fetching announcements:", error)
      return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
    }
  })
}

// POST /api/servers/[serverId]/announcements - Create a new announcement
export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId } = params
      const userId = session.user.id
      const { title, content, isImportant } = await req.json()

      // Validate input
      if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
      }

      // Check if user has permission to create announcements
      const member = await prisma.serverMember.findFirst({
        where: {
          serverId,
          userId,
        },
        select: {
          role: true,
        },
      })

      if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Create the announcement
      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          isImportant: isImportant || false,
          serverId,
          authorId: userId,
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

      return NextResponse.json(announcement)
    } catch (error) {
      console.error("Error creating announcement:", error)
      return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
    }
  })
}



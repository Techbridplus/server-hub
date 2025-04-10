import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Get comments for an announcement
export async function GET(
  req: NextRequest,
  { params }: { params: { announcementId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const announcementId = params.announcementId

    if (!announcementId) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 })
    }

    // Get all comments for the announcement
    const comments = await prisma.comment.findMany({
      where: { announcementId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error getting comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a comment to an announcement
export async function POST(
  req: NextRequest,
  { params }: { params: { announcementId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const announcementId = params.announcementId
    const { content } = await req.json()

    if (!announcementId) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 })
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Check if the announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        announcementId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Toggle like on an announcement
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

    if (!announcementId) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 })
    }

    // Check if the announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    // Check if the user has already liked the announcement
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        announcementId,
      },
    })

    if (existingLike) {
      // Unlike: Remove the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like: Create a new like
      await prisma.like.create({
        data: {
          userId,
          announcementId,
        },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get likes for an announcement
export async function GET(
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

    if (!announcementId) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 })
    }

    // Get all likes for the announcement
    const likes = await prisma.like.findMany({
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
    })

    // Check if the current user has liked the announcement
    const userLike = await prisma.like.findFirst({
      where: {
        userId,
        announcementId,
      },
    })

    return NextResponse.json({
      likes,
      userLiked: !!userLike,
      count: likes.length,
    })
  } catch (error) {
    console.error("Error getting likes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
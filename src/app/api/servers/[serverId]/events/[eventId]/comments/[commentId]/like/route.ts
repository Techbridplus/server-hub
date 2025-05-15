import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/servers/[serverId]/events/[eventId]/comments/[commentId]/like - Toggle like on a comment
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string; eventId: string; commentId: string } }
) {
  return authMiddlewareAppRouter(async (session) => {
    try {
      console.log(req)
      const { serverId, eventId, commentId } = params

      // Check if user is server member
      const serverMember = await prisma.serverMember.findFirst({
        where: {
          userId: session.user.id,
          serverId,
        },
      })

      if (!serverMember) {
        return NextResponse.json({ error: "You must be a member to like comments" }, { status: 403 })
      }

      // Check if comment exists
      const comment = await prisma.eventComment.findUnique({
        where: {
          id: commentId,
          eventId,
          event: {
            serverId,
          },
        },
      })

      if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 })
      }

      // Toggle like
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
      })

      if (existingLike) {
        await prisma.commentLike.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        })
      } else {
        await prisma.commentLike.create({
          data: {
            userId: session.user.id,
            commentId,
          },
        })
      }

      // Get updated like count
      const likeCount = await prisma.commentLike.count({
        where: { commentId },
      })

      return NextResponse.json({
        liked: !existingLike,
        likes: likeCount,
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
    }
  })
} 
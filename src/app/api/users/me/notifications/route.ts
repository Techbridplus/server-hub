import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/users/me/notifications - Get current user's notifications
export async function GET(req: NextRequest) {
  return authMiddlewareAppRouter(async (session) => {
    try {
      const { searchParams } = new URL(req.url)
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "20")
      const skip = (page - 1) * limit
      const unreadOnly = searchParams.get("unread") === "true"

      // Build filter conditions
      const where: any = {
        recipientId: session.user.id,
      }

      if (unreadOnly) {
        where.isRead = false
      }

      // Get notifications with pagination
      const notifications = await prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
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
      const total = await prisma.notification.count({ where })

      // Get unread count
      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: session.user.id,
          isRead: false,
        },
      })

      return NextResponse.json({
        notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }
  })
}

// PUT /api/users/me/notifications - Mark notifications as read
export async function PUT(req: NextRequest) {
  return authMiddlewareAppRouter(async (session) => {
    try {
      const { ids, all } = await req.json()

      if (all) {
        // Mark all notifications as read
        await prisma.notification.updateMany({
          where: {
            recipientId: session.user.id,
            isRead: false,
          },
          data: {
            isRead: true,
          },
        })

        return NextResponse.json({ success: true })
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No notification IDs provided" }, { status: 400 })
      }

      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: ids,
          },
          recipientId: session.user.id,
        },
        data: {
          isRead: true,
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
    }
  })
}


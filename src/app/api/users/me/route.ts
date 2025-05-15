import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/users/me - Get current user profile
export async function GET(req: NextRequest) {
  return authMiddlewareAppRouter(async (session) => {
    try {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              ownedServers: true,
              serverMemberships: true,
              ownedGroups: true,
              groupMemberships: true,
              events: true,
              eventAttendees: true,
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json(user)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }
  })
}

// PUT /api/users/me - Update current user profile
export async function PUT(req: NextRequest) {
  return authMiddlewareAppRouter(async (session) => {
    try {
      const { name, bio, image } = await req.json()

      // Update user profile
      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name,
          bio,
          image,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          createdAt: true,
        },
      })

      return NextResponse.json(user)
    } catch (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }
  })
}


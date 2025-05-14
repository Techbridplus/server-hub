import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerMember } from "@/lib/auth"

// POST /api/servers/[serverId]/groups/[groupId]/join - Join a group
export async function POST(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId } = params

      // Check if user is server member
      const isMember = await isServerMember(session.user.id, serverId)
      if (!isMember) {
        return NextResponse.json({ error: "You must be a server member to join groups" }, { status: 403 })
      }

      // Check if group exists
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
          serverId,
        },
        select: {
          isPrivate: true,
        },
      })

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 })
      }

      // Check if user is already a member
      const existingMembership = await prisma.groupMember.findFirst({
        where: {
            userId: session.user.id,
            groupId,
        },
      })

      if (existingMembership) {
        return NextResponse.json({ error: "You are already a member of this group" }, { status: 400 })
      }

      // For private groups, only admins can add members
      if (group.isPrivate) {
        return NextResponse.json({ error: "This group is private. Contact an admin to join." }, { status: 403 })
      }

      // Join group
      const membership = await prisma.groupMember.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          group: {
            connect: {
              id: groupId,
            },
          },
          role: "MEMBER",
        },
      })

      return NextResponse.json(membership)
    } catch (error) {
      console.error("Error joining group:", error)
      return NextResponse.json({ error: "Failed to join group" }, { status: 500 })
    }
  })
}


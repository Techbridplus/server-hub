import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"

// POST /api/servers/[serverId]/groups/[groupId]/leave - Leave a group
export async function POST(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId } = params

      // Check if group exists
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
          serverId,
        },
        select: {
          ownerId: true,
        },
      })

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 })
      }

      // Check if user is the group owner
      if (group.ownerId === session.user.id) {
        return NextResponse.json({ error: "Group owner cannot leave the group" }, { status: 400 })
      }

      // Check if user is a member
      const membership = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId,
          },
        },
      })

      if (!membership) {
        return NextResponse.json({ error: "You are not a member of this group" }, { status: 400 })
      }

      // Leave group
      await prisma.groupMember.delete({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId,
          },
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error leaving group:", error)
      return NextResponse.json({ error: "Failed to leave group" }, { status: 500 })
    }
  })
}


import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isGroupAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

import { isServerAdmin } from "@/lib/auth"





// GET /api/servers/[serverId]/groups/[groupId] - Get group details
export async function GET(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
  try {
    const { serverId, groupId } = params

    // Get group details
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
        serverId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        channels: {
          orderBy: [
            { type: "asc" }, // Text channels first, then voice
            { name: "asc" }, // Alphabetical by name
          ],
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}

// PUT /api/servers/[serverId]/groups/[groupId] - Update group
export async function PUT(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId } = params
      const { name, description, imageUrl, isPrivate } = await req.json()

      // Check if user is group admin
      const isAdmin = await isGroupAdmin(session.user.id, groupId)
      if (!isAdmin) {
        return NextResponse.json({ error: "Only group admins can update the group" }, { status: 403 })
      }

      // Update group
      const group = await prisma.group.update({
        where: {
          id: groupId,
          serverId,
        },
        data: {
          name,
          description,
          imageUrl,
          isPrivate,
        },
      })

      return NextResponse.json(group)
    } catch (error) {
      console.error("Error updating group:", error)
      return NextResponse.json({ error: "Failed to update group" }, { status: 500 })
    }
  })
}

// DELETE /api/servers/[serverId]/groups/[groupId] - Delete group
export async function DELETE(req: NextRequest, { params }: { params: { serverId: string; groupId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, groupId } = params

      // Check if group exists
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
          serverId,
        },

      })

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 })
      }

      // Check if user is group owner
   
        // Check if user is server admin
        const isAdmin = await isServerAdmin(session.user.id, serverId)
        if (!isAdmin) {
          return NextResponse.json(
            { error: "Only the group owner or server admin can delete the group" },
            { status: 403 },
          )
        }
      

      // Delete group
      await prisma.group.delete({
        where: {
          id: groupId,
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting group:", error)
      return NextResponse.json({ error: "Failed to delete group" }, { status: 500 })
    }
  })
}


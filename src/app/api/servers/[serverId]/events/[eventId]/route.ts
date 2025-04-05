import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
//import prisma from "@/lib/prisma"

// GET /api/servers/[serverId]/events/[eventId] - Get event details
export async function GET(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
const prisma = {};
  try {
    const { serverId, eventId } = params
    const session = await getServerSession(authOptions)

    // Get event details
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        serverId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attendees: {
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
        photos: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            uploadedAt: "desc",
          },
          take: 6,
        },
        videos: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            uploadedAt: "desc",
          },
          take: 4,
        },
        _count: {
          select: {
            attendees: true,
            photos: true,
            videos: true,
            comments: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is attending
    let userAttendance = null
    if (session?.user?.id) {
      userAttendance = await prisma.eventAttendee.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId,
          },
        },
      })
    }

    return NextResponse.json({
      ...event,
      userAttendance: userAttendance ? userAttendance.status : null,
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT /api/servers/[serverId]/events/[eventId] - Update event
export async function PUT(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params
      const { title, description, location, startTime, endTime, maxAttendees, imageUrl, isExclusive } = await req.json()

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          serverId,
        },
        select: {
          organizerId: true,
        },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Check if user is event organizer
      if (event.organizerId !== session.user.id) {
        // Check if user is server admin
        const isAdmin = await isServerAdmin(session.user.id, serverId)
        if (!isAdmin) {
          return NextResponse.json(
            { error: "Only the event organizer or server admin can update the event" },
            { status: 403 },
          )
        }
      }

      // Update event
      const updatedEvent = await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          title,
          description,
          location,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          maxAttendees,
          imageUrl,
          isExclusive,
        },
      })

      return NextResponse.json(updatedEvent)
    } catch (error) {
      console.error("Error updating event:", error)
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
    }
  })
}

// DELETE /api/servers/[serverId]/events/[eventId] - Delete event
export async function DELETE(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          serverId,
        },
        select: {
          organizerId: true,
        },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Check if user is event organizer
      if (event.organizerId !== session.user.id) {
        // Check if user is server admin
        const isAdmin = await isServerAdmin(session.user.id, serverId)
        if (!isAdmin) {
          return NextResponse.json(
            { error: "Only the event organizer or server admin can delete the event" },
            { status: 403 },
          )
        }
      }

      // Delete event
      await prisma.event.delete({
        where: {
          id: eventId,
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error deleting event:", error)
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
    }
  })
}


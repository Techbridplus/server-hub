import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerMember } from "@/lib/auth"

// POST /api/servers/[serverId]/events/[eventId]/attend - RSVP to an event
export async function POST(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params
      const { status } = await req.json()

      // Check if user is server member
      const isMember = await isServerMember(session.user.id, serverId)
      if (!isMember) {
        return NextResponse.json({ error: "You must be a member to RSVP to events" }, { status: 403 })
      }

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          serverId,
        },
        select: {
          id: true,
          maxAttendees: true,
          _count: {
            select: {
              attendees: {
                where: {
                  status: "going",
                },
              },
            },
          },
        },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Check if event is full
      if (status === "going" && event.maxAttendees && event._count.attendees >= event.maxAttendees) {
        return NextResponse.json({ error: "Event is full" }, { status: 400 })
      }

      // Check if user is already attending
      const existingAttendance = await prisma.eventAttendee.findUnique({
        where: {
          userId_eventId: {
            userId: session.user.id,
            eventId,
          },
        },
      })

      if (existingAttendance) {
        // Update attendance status
        const attendance = await prisma.eventAttendee.update({
          where: {
            userId_eventId: {
              userId: session.user.id,
              eventId,
            },
          },
          data: {
            status,
          },
        })

        return NextResponse.json(attendance)
      } else {
        // Create new attendance
        const attendance = await prisma.eventAttendee.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            event: {
              connect: {
                id: eventId,
              },
            },
            status,
          },
        })

        return NextResponse.json(attendance)
      }
    } catch (error) {
      console.error("Error RSVPing to event:", error)
      return NextResponse.json({ error: "Failed to RSVP to event" }, { status: 500 })
    }
  })
}


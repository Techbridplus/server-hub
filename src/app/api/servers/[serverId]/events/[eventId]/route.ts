import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isServerAdmin, authMiddlewareAppRouter } from "@/lib/auth"

// GET /api/servers/[serverId]/events/[eventId] - Get event details
export async function GET(
  request: NextRequest,
  { params }: { params: { serverId: string; eventId: string } }
) {
  return authMiddlewareAppRouter(request, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params;

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          serverId: serverId,
        },
        include: {
          server: true,
          attendees: {
            include: {
              user: true
            }
          },
          photos: true,
          videos: true,
          comments: {
            include: {
              user: true
            }
          }
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Event not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      return NextResponse.json(
        { error: "Failed to fetch event" },
        { status: 500 }
      );
    }
  });
}

// PUT /api/servers/[serverId]/events/[eventId] - Update event
export async function PUT(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params
      const { title, description, location, startDate, endDate, imageUrl, isExclusive } = await req.json()

      // Check if event exists
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
          serverId,
        },
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId)
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Only server admin can update the event" },
          { status: 403 },
        )
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
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { serverId: string; eventId: string } }
) {
  return authMiddlewareAppRouter(request, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params;

      // Check if user is server admin
      const isAdmin = await isServerAdmin(session.user.id, serverId);
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      await prisma.event.delete({
        where: {
          id: eventId,
          serverId: serverId,
        },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json(
        { error: "Failed to delete event" },
        { status: 500 }
      );
    }
  });
}


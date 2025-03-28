import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerMember } from "@/lib/auth"
//import prisma from "@/lib/prisma" // Import prisma

// GET /api/servers/[serverId]/events - Get server events
export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
const prisma = {};
  try {
    const { serverId } = params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "upcoming" // upcoming, past, all
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const now = new Date()

    // Build filter conditions
    const where: any = {
      serverId,
    }

    if (type === "upcoming") {
      where.startTime = {
        gte: now,
      }
    } else if (type === "past") {
      where.endTime = {
        lt: now,
      }
    }

    // Get events with pagination
    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            attendees: true,
            photos: true,
            videos: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy:
        type === "past"
          ? { endTime: "desc" } // Most recent past events first
          : { startTime: "asc" }, // Soonest upcoming events first
    })

    // Get total count for pagination
    const total = await prisma.event.count({ where })

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/events - Create a new event
export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId } = params
      const { title, description, location, startTime, endTime, maxAttendees, imageUrl, isExclusive } = await req.json()

      // Check if user is server member
      const isMember = await isServerMember(session.user.id, serverId)
      if (!isMember) {
        return NextResponse.json({ error: "You must be a member to create events" }, { status: 403 })
      }

      // Validate required fields
      if (!title || !startTime || !endTime) {
        return NextResponse.json({ error: "Title, start time, and end time are required" }, { status: 400 })
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          title,
          description,
          location,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          maxAttendees,
          imageUrl,
          isExclusive: isExclusive || false,
          organizer: {
            connect: {
              id: session.user.id,
            },
          },
          server: {
            connect: {
              id: serverId,
            },
          },
          // Add the creator as an attendee
          attendees: {
            create: {
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              status: "going",
            },
          },
        },
      })

      return NextResponse.json(event)
    } catch (error) {
      console.error("Error creating event:", error)
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }
  })
}


import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerMember } from "@/lib/auth"
//import { prisma } from "@/lib/prisma"

// GET /api/servers/[serverId]/events/[eventId]/photos - Get event photos
export async function GET(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
const prisma = {};
  try {
    const { serverId, eventId } = params
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Get photos with pagination
    const photos = await prisma.photo.findMany({
      where: {
        eventId,
        event: {
          serverId,
        },
      },
      include: {
        uploader: {
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
        uploadedAt: "desc",
      },
    })

    // Get total count for pagination
    const total = await prisma.photo.count({
      where: {
        eventId,
        event: {
          serverId,
        },
      },
    })

    return NextResponse.json({
      photos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

// POST /api/servers/[serverId]/events/[eventId]/photos - Upload a photo
export async function POST(req: NextRequest, { params }: { params: { serverId: string; eventId: string } }) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const { serverId, eventId } = params
      const { url, description } = await req.json()

      // Check if user is server member
      const isMember = await isServerMember(session.user.id, serverId)
      if (!isMember) {
        return NextResponse.json({ error: "You must be a member to upload photos" }, { status: 403 })
      }

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

      // Create photo
      const photo = await prisma.photo.create({
        data: {
          url,
          description,
          uploader: {
            connect: {
              id: session.user.id,
            },
          },
          event: {
            connect: {
              id: eventId,
            },
          },
        },
      })

      return NextResponse.json(photo)
    } catch (error) {
      console.error("Error uploading photo:", error)
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
    }
  })
}


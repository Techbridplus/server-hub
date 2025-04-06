import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/servers/[serverId]/members - Get server members
export async function GET(
  req: NextRequest,
  context: { params: { serverId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const serverId = context.params.serverId
    
    // Check if user is a member of the server
    const serverMember = await prisma.serverMember.findFirst({
      where: {
        serverId,
        userId: session.user.id
      }
    })
    
    if (!serverMember) {
      return NextResponse.json({ error: "Not a member of this server" }, { status: 403 })
    }
    
    // Get all members with their user data
    const members = await prisma.serverMember.findMany({
      where: {
        serverId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
    
    // Add status information (in a real app, this would come from a presence system)
    // For now, we'll simulate online status for demonstration
    const membersWithStatus = members.map(member => ({
      ...member,
      status: Math.random() > 0.3 ? "online" : "offline" // Simulate some users being offline
    }))
    
    return NextResponse.json(membersWithStatus)
  } catch (error) {
    console.error("Error fetching server members:", error)
    return NextResponse.json(
      { error: "Failed to fetch server members" },
      { status: 500 }
    )
  }
}


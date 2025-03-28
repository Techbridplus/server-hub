import { Server } from "socket.io"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  // @ts-ignore
  const res = new Response(null)
  const io = new Server(res.socket, {
    path: "/api/socket",
    addTrailingSlash: false,
  })

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    // Join a channel room
    socket.on("join-channel", async (channelId) => {
      socket.join(`channel:${channelId}`)
      console.log(`Socket ${socket.id} joined channel ${channelId}`)

      // Notify others that user is online
      socket.to(`channel:${channelId}`).emit("user-online", {
        userId: session.user.id,
        username: session.user.name,
      })
    })

    // Leave a channel room
    socket.on("leave-channel", (channelId) => {
      socket.leave(`channel:${channelId}`)
      console.log(`Socket ${socket.id} left channel ${channelId}`)
    })

    // Handle new messages
    socket.on("send-message", async (data) => {
      try {
        const { channelId, content, attachments } = data

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content,
            attachments: attachments
              ? {
                  createMany: {
                    data: attachments.map((url: string) => ({ url })),
                  },
                }
              : undefined,
            author: {
              connect: {
                id: session.user.id,
              },
            },
            channel: {
              connect: {
                id: channelId,
              },
            },
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            attachments: true,
          },
        })

        // Broadcast message to channel
        io.to(`channel:${channelId}`).emit("new-message", message)
      } catch (error) {
        console.error("Error sending message:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Handle typing indicators
    socket.on("typing-start", (channelId) => {
      socket.to(`channel:${channelId}`).emit("user-typing", {
        userId: session.user.id,
        username: session.user.name,
      })
    })

    socket.on("typing-stop", (channelId) => {
      socket.to(`channel:${channelId}`).emit("user-stopped-typing", {
        userId: session.user.id,
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id)
    })
  })

  return res
}


import type { Server as NetServer } from "http"
import type { NextApiRequest } from "next"
import { Server as ServerIO } from "socket.io"
import type { NextApiResponseServerIO } from "@/types/next"

export const config = {
  api: {
    bodyParser: false,
  },
}

export const initializeSocket = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket"
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    })

    // Socket.IO server-side event handlers
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)

      // Join a group channel room
      socket.on("join-channel", (channelId: string) => {
        socket.join(channelId)
        console.log(`Socket ${socket.id} joined channel: ${channelId}`)
      })

      // Leave a group channel room
      socket.on("leave-channel", (channelId: string) => {
        socket.leave(channelId)
        console.log(`Socket ${socket.id} left channel: ${channelId}`)
      })

      // Handle new message
      socket.on("send-message", (message) => {
        io.to(message.channelId).emit("new-message", message)
      })

      // Handle channel creation
      socket.on("channel-created", (channel) => {
        io.to(channel.groupId).emit("new-channel", channel)
      })

      // Handle user typing
      socket.on("typing", ({ channelId, user, isTyping }) => {
        socket.to(channelId).emit("user-typing", { user, isTyping })
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`)
      })
    })

    res.socket.server.io = io
  }

  return res.socket.server.io
}


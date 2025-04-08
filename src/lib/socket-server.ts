import { Server } from "socket.io"
import { Server as HttpServer } from "http"

interface Participant {
  id: string
  username: string
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
}

interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: number
}

interface VideoCallRoom {
  channelId: string
  participants: Map<string, Participant>
}

export function setupSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  // Store active video call rooms
  const videoCallRooms = new Map<string, VideoCallRoom>()

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Join video call room
    socket.on("join-video-call", ({ channelId, userId, username }) => {
      console.log(`User ${username} (${userId}) joining video call in channel ${channelId}`)
      
      // Join socket room for this channel
      socket.join(`video-call:${channelId}`)
      
      // Create or get room
      if (!videoCallRooms.has(channelId)) {
        videoCallRooms.set(channelId, {
          channelId,
          participants: new Map(),
        })
      }
      
      const room = videoCallRooms.get(channelId)!
      
      // Add participant
      const participant: Participant = {
        id: userId,
        username,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
      }
      
      room.participants.set(userId, participant)
      
      // Notify others in the room
      socket.to(`video-call:${channelId}`).emit("participant-joined", participant)
      
      // Send current participants to the new participant
      const participants = Array.from(room.participants.values())
      socket.emit("current-participants", participants)
    })

    // Leave video call room
    socket.on("leave-video-call", ({ channelId, userId }) => {
      console.log(`User ${userId} leaving video call in channel ${channelId}`)
      
      // Leave socket room
      socket.leave(`video-call:${channelId}`)
      
      // Remove participant from room
      const room = videoCallRooms.get(channelId)
      if (room) {
        room.participants.delete(userId)
        
        // Notify others
        socket.to(`video-call:${channelId}`).emit("participant-left", userId)
        
        // Clean up empty rooms
        if (room.participants.size === 0) {
          videoCallRooms.delete(channelId)
        }
      }
    })

    // Toggle mute
    socket.on("toggle-mute", ({ channelId, userId, isMuted }) => {
      const room = videoCallRooms.get(channelId)
      if (room && room.participants.has(userId)) {
        const participant = room.participants.get(userId)!
        participant.isMuted = isMuted
        
        // Notify others
        socket.to(`video-call:${channelId}`).emit("participant-updated", participant)
      }
    })

    // Toggle video
    socket.on("toggle-video", ({ channelId, userId, isVideoOff }) => {
      const room = videoCallRooms.get(channelId)
      if (room && room.participants.has(userId)) {
        const participant = room.participants.get(userId)!
        participant.isVideoOff = isVideoOff
        
        // Notify others
        socket.to(`video-call:${channelId}`).emit("participant-updated", participant)
      }
    })

    // Toggle screen sharing
    socket.on("toggle-screen-share", ({ channelId, userId, isScreenSharing }) => {
      const room = videoCallRooms.get(channelId)
      if (room && room.participants.has(userId)) {
        const participant = room.participants.get(userId)!
        participant.isScreenSharing = isScreenSharing
        
        // Notify others
        socket.to(`video-call:${channelId}`).emit("participant-updated", participant)
      }
    })

    // Send chat message
    socket.on("send-message", ({ channelId, message }) => {
      // Broadcast to all in the room
      io.to(`video-call:${channelId}`).emit("chat-message", message)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
      
      // Find and remove this user from any rooms they're in
      for (const [channelId, room] of videoCallRooms.entries()) {
        for (const [userId, participant] of room.participants.entries()) {
          // This is a simplified check - in a real app, you'd need to track socket IDs
          if (participant.id === socket.id) {
            room.participants.delete(userId)
            io.to(`video-call:${channelId}`).emit("participant-left", userId)
            
            // Clean up empty rooms
            if (room.participants.size === 0) {
              videoCallRooms.delete(channelId)
            }
            break
          }
        }
      }
    })
  })

  return io
} 
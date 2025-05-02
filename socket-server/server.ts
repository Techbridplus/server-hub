import { createServer } from "http"
import { Server, Socket } from "socket.io"
import dotenv from "dotenv"

dotenv.config()

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})
console.log(io);
const PORT = process.env.SOCKET_PORT || 3001

// Enums for better type safety
enum MemberStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  IDLE = "idle",
  DND = "dnd"
}

enum MemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER"
}

// Interfaces
interface MemberStatusUpdate {
  userId: string
  status: MemberStatus
  serverId: string
}

interface MemberRoleUpdate {
  memberId: string
  role: MemberRole
  serverId: string
}

interface MemberKicked {
  memberId: string
  serverId: string
}

interface DirectMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
}

interface CallSignal {
  type: "offer" | "answer" | "candidate"
  offer?: any
  answer?: any
  candidate?: any
  to: string
  from?: string
}

interface CallEnded {
  to: string
}

// Event Handlers
const handleConnection = (socket: Socket) => {
  const userId = socket.handshake.query.userId as string
  const serverId = socket.handshake.query.serverId as string

  if (userId) socket.join(`user:${userId}`)
  if (serverId) socket.join(`server:${serverId}`)

  socket.on("memberStatusUpdate", (data: MemberStatusUpdate) => {
    io.to(`server:${data.serverId}`).emit("memberStatusUpdate", {
      userId: data.userId,
      status: data.status
    })
  })

  socket.on("memberRoleUpdate", (data: MemberRoleUpdate) => {
    io.to(`server:${data.serverId}`).emit("memberRoleUpdate", data)
  })

  socket.on("memberKicked", (data: MemberKicked) => {
    io.to(`server:${data.serverId}`).emit("memberKicked", data)
  })

  socket.on("directMessage", (message: DirectMessage) => {
    io.to(`user:${message.receiverId}`).emit("directMessage", message)
  })

  socket.on("callSignal", (data: CallSignal) => {
    io.to(`user:${data.to}`).emit("callSignal", {
      ...data,
      from: userId
    })
  })

  socket.on("callEnded", (data: CallEnded) => {
    io.to(`user:${data.to}`).emit("callEnded")
  })

  socket.on("disconnect", () => {
    if (userId && serverId) {
      io.to(`server:${serverId}`).emit("memberStatusUpdate", {
        userId,
        status: MemberStatus.OFFLINE
      })
    }
  })
}

io.on("connection", handleConnection)

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})

<<<<<<< HEAD
import { createServer } from "http"
import { Server, Socket } from "socket.io"
import dotenv from "dotenv"
=======
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435

dotenv.config();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
<<<<<<< HEAD
})
console.log(io);
const PORT = process.env.SOCKET_PORT || 3001
=======
});

const getUserRoom = (userId: string) => `user:${userId}`;
const getServerRoom = (serverId: string) => `server:${serverId}`;
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435

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
<<<<<<< HEAD
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
}rId: string
serverId: string
}rId: string
serverId: string
}rId: string
serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
serverId: string
}rId: string
  serverId: string
}rId: string
serverId: string
}rId: string
serverId: string
}rId: string
serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
}rId: string
  serverId: string
=======
  userId: string;
  status: "online" | "offline" | "idle" | "dnd";
  serverId: string;
}

interface MemberRoleUpdate {
  memberId: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  serverId: string;
}

interface MemberKicked {
  memberId: string;
  serverId: string;
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435
}

interface DirectMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

interface CallSignal {
  type: "offer" | "answer" | "candidate";
  offer?: any;
  answer?: any;
  candidate?: any;
  to: string;
  from?: string;
}

interface CallEnded {
  to: string;
}

<<<<<<< HEAD
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

=======
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string | undefined;
  const serverId = socket.handshake.query.serverId as string | undefined;

  if (userId) {
    socket.join(getUserRoom(userId));
    console.log(`User ${userId} connected and joined room ${getUserRoom(userId)}`);
  }

  if (serverId) {
    socket.join(getServerRoom(serverId));
    console.log(`User joined server room ${getServerRoom(serverId)}`);
  }

  // Status update
  socket.on("memberStatusUpdate", ({ userId, status, serverId }: MemberStatusUpdate) => {
    io.to(getServerRoom(serverId)).emit("memberStatusUpdate", { userId, status });
  });

  // Role update
  socket.on("memberRoleUpdate", ({ memberId, role, serverId }: MemberRoleUpdate) => {
    io.to(getServerRoom(serverId)).emit("memberRoleUpdate", { memberId, role });
  });

  // Member kicked
  socket.on("memberKicked", ({ memberId, serverId }: MemberKicked) => {
    io.to(getServerRoom(serverId)).emit("memberKicked", { memberId });
  });

  // Direct messages
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435
  socket.on("directMessage", (message: DirectMessage) => {
    io.to(getUserRoom(message.receiverId)).emit("directMessage", message);
  });

<<<<<<< HEAD
=======
  // Call signaling
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435
  socket.on("callSignal", (data: CallSignal) => {
    io.to(getUserRoom(data.to)).emit("callSignal", {
      ...data,
      from: userId
    });
  });

<<<<<<< HEAD
  socket.on("callEnded", (data: CallEnded) => {
    io.to(`user:${data.to}`).emit("callEnded")
  })
=======
  // Call ended
  socket.on("callEnded", ({ to }: CallEnded) => {
    io.to(getUserRoom(to)).emit("callEnded");
  });
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435

  // Handle disconnect
  socket.on("disconnect", () => {
    if (userId && serverId) {
<<<<<<< HEAD
      io.to(`server:${serverId}`).emit("memberStatusUpdate", {
        userId,
        status: MemberStatus.OFFLINE
      })
    }
  })
}

io.on("connection", handleConnection)
=======
      io.to(getServerRoom(serverId)).emit("memberStatusUpdate", {
        userId,
        status: "offline"
      });
      console.log(`User ${userId} disconnected`);
    }
  });
});
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Socket.io server running on port ${PORT}`)
})
=======
  console.log(`✅ Socket.io server running on port ${PORT}`);
});
>>>>>>> 217e61d72efb3639adf73036e03cfcae520c4435

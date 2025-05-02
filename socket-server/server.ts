import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const getUserRoom = (userId: string) => `user:${userId}`;
const getServerRoom = (serverId: string) => `server:${serverId}`;

interface MemberStatusUpdate {
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
  socket.on("directMessage", (message: DirectMessage) => {
    io.to(getUserRoom(message.receiverId)).emit("directMessage", message);
  });

  // Call signaling
  socket.on("callSignal", (data: CallSignal) => {
    io.to(getUserRoom(data.to)).emit("callSignal", {
      ...data,
      from: userId
    });
  });

  // Call ended
  socket.on("callEnded", ({ to }: CallEnded) => {
    io.to(getUserRoom(to)).emit("callEnded");
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (userId && serverId) {
      io.to(getServerRoom(serverId)).emit("memberStatusUpdate", {
        userId,
        status: "offline"
      });
      console.log(`User ${userId} disconnected`);
    }
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.io server running on port ${PORT}`);
});

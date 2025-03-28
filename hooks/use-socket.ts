"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const useSocket = (channelId?: string) => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection if it doesn't exist
    if (!socket) {
      socket = io({
        path: "/api/socket",
        addTrailingSlash: false,
      })
    }

    // Set up event listeners
    const onConnect = () => {
      setIsConnected(true)
      console.log("Socket connected")

      // Join channel room if channelId is provided
      if (channelId) {
        socket?.emit("join-channel", channelId)
      }
    }

    const onDisconnect = () => {
      setIsConnected(false)
      console.log("Socket disconnected")
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    // Clean up event listeners on unmount
    return () => {
      if (channelId) {
        socket?.emit("leave-channel", channelId)
      }

      socket?.off("connect", onConnect)
      socket?.off("disconnect", onDisconnect)
    }
  }, [channelId])

  return { socket, isConnected }
}


"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSocket } from "@/hooks/use-socket"
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, X } from "lucide-react"

interface VideoCallDialogProps {
  isOpen: boolean
  onClose: () => void
  channelId: string
  userId: string
  username: string
}

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

export function VideoCallDialog({
  isOpen,
  onClose,
  channelId,
  userId,
  username,
}: VideoCallDialogProps) {
  const socket = useSocket()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!socket) return

    // Join video call room
    socket.emit("join-video-call", { channelId, userId, username })

    // Handle participant updates
    socket.on("participant-joined", (participant: Participant) => {
      setParticipants((prev) => [...prev, participant])
    })

    socket.on("participant-left", (participantId: string) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId))
    })

    socket.on("participant-updated", (updatedParticipant: Participant) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === updatedParticipant.id ? updatedParticipant : p))
      )
    })

    // Handle chat messages
    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message])
    })

    // Cleanup
    return () => {
      socket.emit("leave-video-call", { channelId, userId })
      socket.off("participant-joined")
      socket.off("participant-left")
      socket.off("participant-updated")
      socket.off("chat-message")
    }
  }, [socket, channelId, userId, username])

  const toggleMute = () => {
    if (!socket) return
    setIsMuted(!isMuted)
    socket.emit("toggle-mute", { channelId, userId, isMuted: !isMuted })
  }

  const toggleVideo = () => {
    if (!socket) return
    setIsVideoOff(!isVideoOff)
    socket.emit("toggle-video", { channelId, userId, isVideoOff: !isVideoOff })
  }

  const toggleScreenShare = async () => {
    if (!socket) return
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        screenStreamRef.current = stream
        setIsScreenSharing(true)
        socket.emit("toggle-screen-share", {
          channelId,
          userId,
          isScreenSharing: true,
        })
      } catch (error) {
        console.error("Error sharing screen:", error)
      }
    } else {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)
      socket.emit("toggle-screen-share", {
        channelId,
        userId,
        isScreenSharing: false,
      })
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !messageInput.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId,
      username,
      message: messageInput.trim(),
      timestamp: Date.now(),
    }

    socket.emit("send-message", { channelId, message })
    setMessageInput("")
  }

  const endCall = () => {
    if (!socket) return
    socket.emit("leave-video-call", { channelId, userId })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-4">
            {/* Local Video */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-white text-sm">
                {username} (You)
              </div>
            </div>

            {/* Remote Videos */}
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
              >
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-white text-sm">
                  {participant.username}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 border-l">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Chat</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${
                        message.userId === userId ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="text-sm text-gray-500">
                        {message.username}
                      </div>
                      <div className="bg-gray-100 rounded-lg p-2 inline-block">
                        {message.message}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <Button type="submit">Send</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoOff ? (
                <VideoOff className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isScreenSharing ? "destructive" : "secondary"}
              size="icon"
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={endCall}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
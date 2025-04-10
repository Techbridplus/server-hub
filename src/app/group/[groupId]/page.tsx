"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useSocket } from "@/hooks/use-socket"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Users, 
  Hash, 
  Volume2, 
  Video, 
  Phone, 
  Settings, 
  Menu, 
  PlusCircle, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Shield, 
  User, 
  X, 
  UserPlus, 
  ArrowLeft,
  Bell,
  BellOff,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInterface } from "@/components/chat-interface"
import { AddChannelDialog } from "@/components/add-channel-dialog"
import { ManageGroupMembersDialog } from "@/components/manage-group-members-dialog"
import Link from "next/link"
import Image from "next/image"
import { VideoCallDialog } from "@/components/video-call-dialog"

interface GroupPageProps {
  params: {
    groupId: string
  }
}

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const searchParams = useSearchParams()
  const channelId = searchParams.get("channel")
  const { data: session } = useSession()
  const socket = useSocket()
  const { toast } = useToast()
  
  const [group, setGroup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  
  // Fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`)
        if (!response.ok) throw new Error("Failed to fetch group data")
        
        const data = await response.json()
        setGroup(data)
        
        // If no channel is selected, select the first text channel
        if (!channelId && data.channels && data.channels.length > 0) {
          const firstTextChannel = data.channels.find((channel: any) => channel.type === "text")
          if (firstTextChannel) {
            window.history.pushState(
              {}, 
              "", 
              `/group/${groupId}?channel=${firstTextChannel.id}`
            )
          }
        }
      } catch (error) {
        console.error("Error fetching group data:", error)
        toast({
          title: "Error",
          description: "Failed to load group data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchGroupData()
  }, [groupId, channelId, toast])
  
  // Handle voice channel join
  const handleJoinVoiceChannel = (channelId: string) => {
    setIsInCall(true)
    toast({
      title: "Joined Voice Channel",
      description: "You are now connected to the voice channel.",
    })
    
    // In a real app, you would connect to a WebRTC service here
  }
  
  // Handle video call
  const handleStartVideoCall = () => {
    setIsVideoCallOpen(true)
  }
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "Your microphone is now active." : "Your microphone is now muted.",
    })
  }
  
  // Toggle deafen
  const toggleDeafen = () => {
    setIsDeafened(!isDeafened)
    toast({
      title: isDeafened ? "Undeafened" : "Deafened",
      description: isDeafened ? "You can now hear audio." : "You are now deafened.",
    })
  }
  
  // Toggle notifications
  const toggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled)
    toast({
      title: isNotificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: isNotificationsEnabled 
        ? "You will no longer receive notifications for this group." 
        : "You will now receive notifications for this group.",
    })
  }
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
  
  if (!group) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Group not found</h1>
          <p className="text-muted-foreground">The group you're looking for doesn't exist or you don't have access.</p>
          <Button className="mt-4" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  // Group channels by type
  const textChannels = group.channels?.filter((channel: any) => channel.type === "text") || []
  const voiceChannels = group.channels?.filter((channel: any) => channel.type === "voice") || []
  
  // Check if user is admin or moderator
  const isAdmin = group.members?.some((member: any) => 
    member.userId === session?.user?.id && (member.role === "admin" || member.role === "moderator")
  )
  
  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Mobile navigation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute left-4 top-4 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <div className="flex h-full flex-col">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href={`/server/${group.serverId}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h2 className="text-lg font-semibold">{group.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="p-2">
                <div className="mb-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Text Channels</h3>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => document.getElementById("add-channel-trigger")?.click()}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {textChannels.map((channel: any) => (
                    <button
                      key={channel.id}
                      className={cn(
                        "flex w-full items-center gap-x-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent",
                        channelId === channel.id && "bg-accent",
                      )}
                      onClick={() => {
                        window.history.pushState(
                          {}, 
                          "", 
                          `/group/${groupId}?channel=${channel.id}`
                        )
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Hash className="h-4 w-4" />
                      <span>{channel.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Voice Channels</h3>
                  </div>
                  {voiceChannels.map((channel: any) => (
                    <button
                      key={channel.id}
                      className={cn(
                        "flex w-full items-center gap-x-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent",
                        isInCall && "bg-accent",
                      )}
                      onClick={() => handleJoinVoiceChannel(channel.id)}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isMuted ? "Muted" : isDeafened ? "Deafened" : "Online"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-x-1">
                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleDeafen}>
                    {isDeafened ? <HeadphoneOff className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <div className="hidden w-60 flex-col border-r bg-muted/40 md:flex">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/server/${group.serverId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="relative h-10 w-10 overflow-hidden rounded-md">
              <Image src={group.imageUrl || "/placeholder.svg"} alt={group.name} fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <h2 className="font-semibold">{group.name}</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{group.members?.length || 0} members</span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="mb-2">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Text Channels</h3>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => document.getElementById("add-channel-trigger")?.click()}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {textChannels.map((channel: any) => (
                <button
                  key={channel.id}
                  className={cn(
                    "flex w-full items-center gap-x-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent",
                    channelId === channel.id && "bg-accent",
                  )}
                  onClick={() => {
                    window.history.pushState(
                      {}, 
                      "", 
                      `/group/${groupId}?channel=${channel.id}`
                    )
                  }}
                >
                  <Hash className="h-4 w-4" />
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Voice Channels</h3>
              </div>
              {voiceChannels.map((channel: any) => (
                <button
                  key={channel.id}
                  className={cn(
                    "flex w-full items-center gap-x-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent",
                    isInCall && "bg-accent",
                  )}
                  onClick={() => handleJoinVoiceChannel(channel.id)}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{channel.name}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isMuted ? "Muted" : isDeafened ? "Deafened" : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-x-1">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleDeafen}>
                {isDeafened ? <HeadphoneOff className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-x-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {channelId 
                ? textChannels.find((c: any) => c.id === channelId)?.name || "Channel" 
                : "Select a channel"}
            </h2>
          </div>
          <div className="flex items-center gap-x-2">
            <Button variant="ghost" size="icon" onClick={toggleNotifications}>
              {isNotificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => document.getElementById("manage-members-trigger")?.click()}>
                <Users className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => document.getElementById("add-channel-trigger")?.click()}>
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleStartVideoCall}>
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {channelId ? (
            <ChatInterface 
              group={group} 
              currentUserId={session?.user?.id || ""} 
              isAdmin={isAdmin} 
              defaultChannelId={channelId} 
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Welcome to {group.name}</h3>
                <p className="text-muted-foreground">Select a channel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogs */}
      <AddChannelDialog groupId={groupId} serverId={group.serverId} />
      <ManageGroupMembersDialog 
        groupId={groupId} 
        serverId={group.serverId} 
        members={group.members || []} 
        isOwner={isAdmin} 
      />
      
      {/* Video Call Dialog */}
      {channelId && (
        <VideoCallDialog
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          channelId={channelId}
          userId={session?.user?.id || ""}
          username={session?.user?.name || "User"}
        />
      )}
    </div>
  )
} 
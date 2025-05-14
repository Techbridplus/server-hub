"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Loader2,
  CheckCircle,
  Phone,
  Video,
  Smile,
  Trash2,
  Volume2,
  VideoIcon,
  Search,
  Plus,
  Menu,
  Settings,
  LogOut,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

// Common emoji reactions
const commonReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨"]

// More emoji options for the picker
const emojiCategories = {
  Smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "😘"],
  Gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "🤛", "🤜", "👏", "🙌", "👐", "🤲"],
  Animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐮", "🐷", "🐸"],
  Food: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍"],
  Activities: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥅", "🏒"],
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: Date
  reactions?: Record<string, number>
}

type CallType = "audio" | "video" | null

// Sample conversation data
const sampleConversations = [
  {
    id: "1",
    name: "AI Assistant",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I'm here to help you with anything you need!",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unread: 0,
    online: true,
    isAI: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Let's meet tomorrow at 2pm",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unread: 2,
    online: true,
    isAI: false,
  },
  {
    id: "3",
    name: "Tech Team",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "The new update is ready for testing",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: 5,
    online: false,
    isGroup: true,
    isAI: false,
  },
  {
    id: "4",
    name: "David Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for your help!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: 0,
    online: false,
    isAI: false,
  },
  {
    id: "5",
    name: "Marketing Group",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Campaign results are in!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    unread: 0,
    online: false,
    isGroup: true,
    isAI: false,
  },
  {
    id: "6",
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can you send me the files?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    unread: 0,
    online: true,
    isAI: false,
  },
  {
    id: "7",
    name: "Project X Team",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Meeting scheduled for Friday",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    unread: 0,
    online: false,
    isGroup: true,
    isAI: false,
  },
]

export default function ChatPage() {
  const { messages: chatMessages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [activeCall, setActiveCall] = useState<CallType>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [reactionMessage, setReactionMessage] = useState<string | null>(null)
  const [conversations, setConversations] = useState(sampleConversations)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversation, setActiveConversation] = useState(sampleConversations[0])
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Convert chat messages to our extended message format
  useEffect(() => {
    setMessages(
      chatMessages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: msg.createdAt,
          reactions: {}
        })),
    )
  }, [chatMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate typing indicator for demo purposes
  useEffect(() => {
    if (isLoading) {
      setTyping(true)
    } else {
      const timer = setTimeout(() => setTyping(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Handle sidebar visibility on mobile/desktop
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  // Format conversation timestamp
  const formatConversationTime = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return formatTime(date)
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  // Handle emoji selection for messages
  const handleEmojiSelect = (emoji: string) => {
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0
      const newValue = input.slice(0, cursorPosition) + emoji + input.slice(cursorPosition)
      handleInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>)
      setShowEmojiPicker(false)
      // Focus back on input after selecting emoji
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.selectionStart = cursorPosition + emoji.length
          inputRef.current.selectionEnd = cursorPosition + emoji.length
        }
      }, 0)
    }
  }

  // Handle message reaction
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions }
          reactions[emoji] = (reactions[emoji] || 0) + 1
          return { ...msg, reactions }
        }
        return msg
      }),
    )
    setReactionMessage(null)
  }

  // Handle message deletion
  const deleteMessage = (messageId: string) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId))
    setMessageToDelete(null)
  }

  // Start a call
  const startCall = (type: CallType) => {
    setActiveCall(type)
  }

  // End a call
  const endCall = () => {
    setActiveCall(null)
  }

  // Switch to a different conversation
  const switchConversation = (conversation: (typeof sampleConversations)[0]) => {
    setActiveConversation(conversation)
    // Mark conversation as read
    setConversations(conversations.map((conv) => (conv.id === conversation.id ? { ...conv, unread: 0 } : conv)))
    // Close sidebar on mobile after selecting a conversation
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Create a new conversation (placeholder)
  const createNewConversation = (name: string) => {
    const newConversation = {
      id: `new-${Date.now()}`,
      name,
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "New conversation started",
      timestamp: new Date(),
      unread: 0,
      online: false,
      isAI: false,
    }

    setConversations([newConversation, ...conversations])
    setActiveConversation(newConversation)
    setShowNewChatDialog(false)

    // Close sidebar on mobile after creating a conversation
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Left Panel - Conversations List */}
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[300px] sm:w-[350px]">
            <ConversationsSidebar
              conversations={filteredConversations}
              activeConversation={activeConversation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              switchConversation={switchConversation}
              setShowNewChatDialog={setShowNewChatDialog}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className={`w-[300px] border-r bg-white dark:bg-slate-950 flex-shrink-0 ${sidebarOpen ? "block" : "hidden"}`}
        >
          <ConversationsSidebar
            conversations={filteredConversations}
            activeConversation={activeConversation}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            switchConversation={switchConversation}
            setShowNewChatDialog={setShowNewChatDialog}
          />
        </div>
      )}

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-950 shadow-sm">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
              <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <h2 className="font-semibold">{activeConversation.name}</h2>
                {activeConversation.online && <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {typing ? "Typing..." : activeConversation.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              onClick={() => startCall("audio")}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              onClick={() => startCall("video")}
            >
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                <DropdownMenuItem>Search in Conversation</DropdownMenuItem>
                <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Block Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Send className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm">Start a conversation with {activeConversation.name}</p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user"
              const timestamp = message.createdAt || new Date()

              return (
                <div key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  {!isUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                      <AvatarImage
                        src={activeConversation.avatar || "/placeholder.svg"}
                        alt={activeConversation.name}
                      />
                      <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex flex-col">
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm group relative",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-white dark:bg-slate-800 rounded-tl-none",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <div
                        className={cn(
                          "flex items-center text-xs mt-1 space-x-1",
                          isUser ? "text-primary-foreground/70 justify-end" : "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        <span>{formatTime(timestamp)}</span>
                        {isUser && <CheckCircle className="h-3 w-3" />}
                      </div>

                      {/* Message actions */}
                      <div
                        className={cn(
                          "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity",
                          isUser ? "left-0 -translate-x-full pl-2" : "right-0 translate-x-full pr-2",
                        )}
                      >
                        <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 rounded-full shadow-md p-1">
                          <Popover
                            open={reactionMessage === message.id}
                            onOpenChange={(open) => !open && setReactionMessage(null)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => setReactionMessage(message.id)}
                              >
                                <Smile className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2" side={isUser ? "left" : "right"}>
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {commonReactions.map((emoji) => (
                                    <button
                                      key={emoji}
                                      className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full transition-colors"
                                      onClick={() => handleReaction(message.id, emoji)}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                                <div className="border-t pt-2">
                                  <div className="grid grid-cols-7 gap-1">
                                    {emojiCategories.Smileys.slice(0, 14).map((emoji) => (
                                      <button
                                        key={emoji}
                                        className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full transition-colors"
                                        onClick={() => handleReaction(message.id, emoji)}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>

                          {isUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                              onClick={() => setMessageToDelete(message.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message reactions */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className={cn("flex mt-1", isUser ? "justify-end" : "justify-start")}>
                        <div className="flex flex-wrap gap-1 bg-white/80 dark:bg-slate-800/80 rounded-full px-2 py-1 shadow-sm">
                          {Object.entries(message.reactions).map(([emoji, count]) => (
                            <div key={emoji} className="flex items-center space-x-1">
                              <span>{emoji}</span>
                              {count > 1 && <span className="text-xs text-slate-500 dark:text-slate-400">{count}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )
            })
          )}

          {typing && (
            <div className="flex justify-start">
              <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                <AvatarImage src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
                <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t">
          <form onSubmit={onSubmit} className="flex space-x-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {commonReactions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full transition-colors"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-2">
                    <div className="grid grid-cols-7 gap-1">
                      {emojiCategories.Smileys.slice(0, 14).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full transition-colors"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 focus-visible:ring-2"
              disabled={isLoading}
            />

            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </div>

      {/* Delete message confirmation */}
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && deleteMessage(messageToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New chat dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Start a new conversation with a contact or create a group chat.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="contact" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="group">Group</TabsTrigger>
            </TabsList>
            <TabsContent value="contact" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium">
                  Contact Name
                </label>
                <Input id="contact-name" placeholder="Enter contact name" />
              </div>
              <Button className="w-full" onClick={() => createNewConversation("New Contact")}>
                Start Conversation
              </Button>
            </TabsContent>
            <TabsContent value="group" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="group-name" className="text-sm font-medium">
                  Group Name
                </label>
                <Input id="group-name" placeholder="Enter group name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Participants</label>
                <div className="border rounded-md p-2 h-32 overflow-y-auto">
                  {sampleConversations
                    .filter((c) => !c.isGroup && !c.isAI)
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <input type="checkbox" id={`contact-${contact.id}`} className="rounded" />
                        <label
                          htmlFor={`contact-${contact.id}`}
                          className="flex items-center space-x-2 cursor-pointer flex-1"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{contact.name}</span>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => createNewConversation("New Group")}>
                Create Group
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Audio call dialog */}
      <Dialog open={activeCall === "audio"} onOpenChange={(open) => !open && endCall()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center">
              <span className="mr-2">Audio Call</span>
              <span className="animate-pulse text-green-500">●</span>
            </DialogTitle>
            <DialogDescription className="text-center">Connected with {activeConversation.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={activeConversation.avatar || "/placeholder.svg"} alt={activeConversation.name} />
              <AvatarFallback className="text-2xl">{activeConversation.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium text-lg">{activeConversation.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">00:12</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-slate-100 dark:bg-slate-800">
                <Volume2 className="h-6 w-6" />
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endCall}>
                <Phone className="h-6 w-6 rotate-135" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video call dialog */}
      <Dialog open={activeCall === "video"} onOpenChange={(open) => !open && endCall()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center">
              <span className="mr-2">Video Call</span>
              <span className="animate-pulse text-green-500">●</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-slate-400">
                <VideoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-center text-sm">{activeConversation.name}'s video</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-1/3 aspect-video bg-slate-700 rounded-lg overflow-hidden border-2 border-white dark:border-slate-950 shadow-lg flex items-center justify-center">
              <div className="text-slate-400 text-xs">
                <VideoIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <p className="text-center">Your video</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4 pt-4">
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-slate-100 dark:bg-slate-800">
              <Volume2 className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-slate-100 dark:bg-slate-800">
              <VideoIcon className="h-6 w-6" />
            </Button>
            <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endCall}>
              <Phone className="h-6 w-6 rotate-135" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Conversations Sidebar Component
function ConversationsSidebar({
  conversations,
  activeConversation,
  searchQuery,
  setSearchQuery,
  switchConversation,
  setShowNewChatDialog,
}: {
  conversations: typeof sampleConversations
  activeConversation: (typeof sampleConversations)[0]
  searchQuery: string
  setSearchQuery: (query: string) => void
  switchConversation: (conversation: (typeof sampleConversations)[0]) => void
  setShowNewChatDialog: (show: boolean) => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="font-bold text-xl">Messages</h1>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Privacy</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 bg-slate-100 dark:bg-slate-800 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-2">
        <Button
          className="w-full flex items-center justify-center space-x-2"
          onClick={() => setShowNewChatDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span>New Conversation</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent</h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              See all
            </Button>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">No conversations found</div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isActive = activeConversation.id === conversation.id

                return (
                  <button
                    key={conversation.id}
                    className={cn(
                      "w-full flex items-center p-2 rounded-lg transition-colors",
                      isActive ? "bg-slate-200 dark:bg-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-900",
                    )}
                    onClick={() => switchConversation(conversation)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <span className="absolute bottom-0 right-2 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-950"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                          {formatConversationTime(conversation.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full"
                          >
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your Avatar" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">Your Name</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

// Format conversation timestamp helper
function formatConversationTime(date: Date) {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  } else if (diffInDays === 1) {
    return "Yesterday"
  } else if (diffInDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

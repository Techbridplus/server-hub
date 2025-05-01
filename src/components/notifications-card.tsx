"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Clock, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function NotificationsCard() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users/me/notifications")
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/users/me/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
      })

      setNotifications(
        notifications.map((notification) => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      )
      setUnreadCount(prev => prev - 1)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/users/me/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      })

      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const filteredNotifications =
    activeTab === "unread" ? notifications.filter((notification) => !notification.isRead) : notifications

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>You have {unreadCount} unread notifications</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={markAllAsRead}>Mark all as read</DropdownMenuItem>
            <DropdownMenuItem>Notification settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <NotificationList notifications={filteredNotifications} markAsRead={markAsRead} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            <NotificationList notifications={filteredNotifications} markAsRead={markAsRead} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={fetchNotifications}>
          Refresh
        </Button>
        <Button variant="default" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </CardFooter>
    </Card>
  )
}

interface NotificationListProps {
  notifications: Notification[]
  markAsRead: (id: string) => void
  isLoading: boolean
}

function NotificationList({ notifications, markAsRead, isLoading }: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 p-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No notifications</h3>
        <p className="text-sm text-muted-foreground">You're all caught up! Check back later for new notifications.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative flex items-start space-x-4 rounded-lg p-3 transition-colors ${
            notification.isRead ? "bg-background" : "bg-muted"
          }`}
          onClick={() => !notification.isRead && markAsRead(notification.id)}
        >
          {!notification.isRead && <span className="absolute top-3 left-0 h-2 w-2 rounded-full bg-blue-500"></span>}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              notification.isRead ? "bg-muted" : "bg-blue-100 dark:bg-blue-900"
            }`}
          >
            {notification.isRead ? <CheckCheck className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div className="flex-1 space-y-1">
            <p className={`text-sm font-medium leading-none ${!notification.isRead && "font-semibold"}`}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <div className="flex items-center pt-1">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                markAsRead(notification.id)
              }}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

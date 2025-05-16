"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { Home, DollarSign, Clock, CheckCheck} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Sample notification data
const notifications = [
  {
    id: 1,
    type: "maintenance",
    title: "Maintenance request update",
    content:
      "The maintenance request for Tenant A in Apartment 301 has been Completed. The issue was a leaking faucet in the kitchen.",
    time: "5h ago",
    read: false,
    icon: Home,
    highlight: "Completed",
    highlightColor: "text-emerald-600",
    bgColor: "bg-white",
  },
  {
    id: 2,
    type: "payment",
    title: "Rent Payment Confirmation",
    content:
      "We have received the rent payment of $1,200 for Tenant B in Apartment 102. The payment was processed successfully.",
    time: "7h ago",
    read: false,
    icon: DollarSign,
    highlight: "successfully",
    highlightColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: 3,
    type: "lease",
    title: "Lease Renewal Reminder",
    content:
      "The lease for Tenant C in Apartment 308 is set to expire on October 15, 2023. Please take appropriate action to initiate lease renewal discussions.",
    time: "7h ago",
    read: false,
    icon: Clock,
    highlight: "expire on October 15, 2023",
    highlightColor: "text-red-600",
    bgColor: "bg-white",
  },
  // Add more notifications to demonstrate the 100+ feature
  ...Array.from({ length: 98 }, (_, i) => ({
    id: i + 4,
    type: i % 3 === 0 ? "maintenance" : i % 3 === 1 ? "payment" : "lease",
    title:
      i % 3 === 0 ? "Maintenance request update" : i % 3 === 1 ? "Rent Payment Confirmation" : "Lease Renewal Reminder",
    content: `Sample notification content ${i + 4}`,
    time: `${Math.floor(Math.random() * 24)}h ago`,
    read: false,
    icon: i % 3 === 0 ? Home : i % 3 === 1 ? DollarSign : Clock,
    highlight: i % 3 === 0 ? "Completed" : i % 3 === 1 ? "successfully" : "expire",
    highlightColor: i % 3 === 0 ? "text-emerald-600" : i % 3 === 1 ? "text-emerald-600" : "text-red-600",
    bgColor: i % 3 === 1 ? "bg-emerald-50" : "bg-white",
  })),
]

// Format notification content with highlighted text
const formatContent = (content: string, highlight: string, highlightColor: string) => {
  if (!highlight) return content

  const parts = content.split(highlight)
  return (
    <>
      {parts[0]}
      <span className={`font-medium ${highlightColor}`}>{highlight}</span>
      {parts[1]}
    </>
  )
}

export default function NotificationSystem() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showFullModal, setShowFullModal] = useState(false)
  const [notificationData, setNotificationData] = useState(notifications)
  const notificationRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  const unreadCount = notificationData.filter((n) => !n.read).length

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        bellRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleMarkAllAsRead = () => {
    setNotificationData((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev)
    setShowFullModal(false)
  }

  const openFullModal = () => {
    setShowFullModal(true)
    setShowNotifications(false)
  }

  return (
    <>
      {/* Bell Icon with notification indicator */}
      <div className="relative" ref={bellRef}>
        <Button onClick={toggleNotifications} className="p-2 rounded-full hover:bg-accent transition-colors  " variant="sobs" >
          <Bell className="h-4 w-4 text-gray-700" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 z-50" ref={notificationRef}>
          <Card className="w-80 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Button
                variant="ghost"
                className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700 hover:bg-emerald-50 p-1 h-auto"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
                <span className="text-sm">Mark all as read</span>
              </Button>
            </CardHeader>

            <div className="py-2 px-4 bg-blue-50/50 border-b">
              <h3 className="text-gray-500 font-medium text-sm">Today</h3>
            </div>

            <CardContent className="p-0 max-h-[350px] overflow-y-auto">
              {notificationData.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`border-b ${notification.bgColor}`}>
                  <div className="flex gap-3 p-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <notification.icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <h4 className="font-medium text-gray-800 text-sm">{notification.title}</h4>
                        <span className="ml-auto text-gray-500 text-xs">{notification.time}</span>
                      </div>
                      <p className="text-gray-600 text-xs">
                        {formatContent(notification.content, notification.highlight, notification.highlightColor)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="border-t py-2 px-4">
              <Button
                variant="ghost"
                className="w-full text-gray-700 hover:bg-gray-100 text-sm h-8"
                onClick={openFullModal}
              >
                View all notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Replace Card Modal with Dialog */}
      <Dialog open={showFullModal} onOpenChange={setShowFullModal}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>All Notifications</DialogTitle>
          </DialogHeader>

          <div className="py-2 px-4 bg-blue-50/50 border-b">
            <h3 className="text-gray-500 font-medium">Today</h3>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {notificationData.map((notification) => (
              <div key={notification.id} className={`border-b ${notification.bgColor}`}>
                <div className="flex gap-4 p-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <notification.icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.read && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                      <h4 className="font-medium text-gray-800">{notification.title}</h4>
                      <span className="ml-auto text-gray-500 text-sm">{notification.time}</span>
                    </div>
                    <p className="text-gray-600">
                      {notification.type === "maintenance" ? (
                        <>
                          The maintenance request for <span className="font-medium">Tenant A</span> in{" "}
                          <span className="font-medium">Apartment 301</span> has been{" "}
                          <span className="text-emerald-600 font-medium">Completed</span>. The issue was a{" "}
                          <span className="font-medium">leaking faucet in the kitchen</span>.
                        </>
                      ) : notification.type === "payment" ? (
                        <>
                          We have received the rent payment of <span className="font-medium">$1,200</span> for{" "}
                          <span className="font-medium">Tenant B</span> in{" "}
                          <span className="font-medium">Apartment 102</span>. The payment was processed{" "}
                          <span className="text-emerald-600 font-medium">successfully</span>.
                        </>
                      ) : notification.type === "lease" ? (
                        <>
                          The lease for <span className="font-medium">Tenant C</span> in{" "}
                          <span className="font-medium">Apartment 308</span> is set to{" "}
                          <span className="text-red-600 font-medium">expire on October 15, 2023</span>. Please take
                          appropriate action to initiate lease renewal discussions.
                        </>
                      ) : (
                        formatContent(notification.content, notification.highlight, notification.highlightColor)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

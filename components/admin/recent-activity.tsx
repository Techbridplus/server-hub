"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    user: {
      name: "John Doe",
      image: "/placeholder.svg?height=32&width=32",
    },
    action: "created a new event",
    target: "Weekly Game Night",
    time: "2 minutes ago",
  },
  {
    user: {
      name: "Jane Smith",
      image: "/placeholder.svg?height=32&width=32",
    },
    action: "joined server",
    target: "Tech Enthusiasts",
    time: "5 minutes ago",
  },
  {
    user: {
      name: "Mike Johnson",
      image: "/placeholder.svg?height=32&width=32",
    },
    action: "made an announcement in",
    target: "Design Masters",
    time: "10 minutes ago",
  },
  {
    user: {
      name: "Sarah Wilson",
      image: "/placeholder.svg?height=32&width=32",
    },
    action: "created a new group in",
    target: "Gaming Hub",
    time: "15 minutes ago",
  },
  {
    user: {
      name: "Alex Brown",
      image: "/placeholder.svg?height=32&width=32",
    },
    action: "RSVP'd to event in",
    target: "Music Lovers",
    time: "20 minutes ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.image} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name} <span className="text-muted-foreground">{activity.action}</span>{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-sm text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}


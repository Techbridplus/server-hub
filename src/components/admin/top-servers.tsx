"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const topServers = [
  {
    name: "Gaming Hub",
    members: 1240,
    growth: "+12%",
    status: "active",
    imageUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Tech Enthusiasts",
    members: 980,
    growth: "+8%",
    status: "active",
    imageUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Design Masters",
    members: 850,
    growth: "+15%",
    status: "moderate",
    imageUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Music Lovers",
    members: 720,
    growth: "+5%",
    status: "quiet",
    imageUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Book Club",
    members: 680,
    growth: "+3%",
    status: "moderate",
    imageUrl: "/placeholder.svg?height=32&width=32",
  },
]

export function TopServers() {
  return (
    <div className="space-y-8">
      {topServers.map((server) => (
        <div key={server.name} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={server.imageUrl} alt={server.name} />
            <AvatarFallback>{server.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{server.name}</p>
            <p className="text-sm text-muted-foreground">{server.members.toLocaleString()} members</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant={server.status === "active" ? "default" : server.status === "moderate" ? "secondary" : "outline"}
            >
              {server.status}
            </Badge>
            <span className="text-sm text-green-500">{server.growth}</span>
          </div>
        </div>
      ))}
    </div>
  )
}


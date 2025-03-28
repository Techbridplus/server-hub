"use client"

import { useState, useEffect } from "react"
import { ArrowUp, Users, MessageSquare, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ServerCard } from "@/components/server-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Mock data for trending servers
const trendingServers = [
  {
    id: "4",
    name: "Gaming Legends",
    members: 2345,
    category: "Gaming",
    isExclusive: true,
    isPrivate: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "Discuss gaming strategies and connect with other gamers",
    tags: ["gaming", "strategy", "multiplayer"],
    status: "active",
    stats: {
      growth: 32,
      messages: 1245,
      newMembers: 87,
      events: 5,
    },
  },
  {
    id: "7",
    name: "Fitness Fanatics",
    members: 1023,
    category: "Fitness",
    isExclusive: true,
    isPrivate: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "Share your fitness journey and workout routines",
    tags: ["fitness", "workout", "health"],
    status: "active",
    stats: {
      growth: 28,
      messages: 987,
      newMembers: 65,
      events: 8,
    },
  },
  {
    id: "10",
    name: "Melody Makers",
    members: 1122,
    category: "Music",
    isExclusive: true,
    isPrivate: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "Share your favorite music and discuss musical instruments",
    tags: ["music", "instruments", "songs"],
    status: "active",
    stats: {
      growth: 25,
      messages: 876,
      newMembers: 54,
      events: 3,
    },
  },
  {
    id: "1",
    name: "Tech Enthusiasts",
    members: 1245,
    category: "Technology",
    isExclusive: true,
    isPrivate: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "A community for tech lovers and enthusiasts",
    tags: ["tech", "programming", "gadgets"],
    status: "active",
    stats: {
      growth: 22,
      messages: 1543,
      newMembers: 76,
      events: 4,
    },
  },
  {
    id: "11",
    name: "Lifestyle Gurus",
    members: 3344,
    category: "Lifestyle",
    isExclusive: false,
    isPrivate: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "Share your lifestyle tips and discuss personal development",
    tags: ["lifestyle", "tips", "personal development"],
    status: "moderate",
    stats: {
      growth: 18,
      messages: 654,
      newMembers: 43,
      events: 2,
    },
  },
  {
    id: "12",
    name: "Finance Forward",
    members: 5566,
    category: "Finance",
    isExclusive: false,
    isPrivate: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "Share your financial insights and discuss investment strategies",
    tags: ["finance", "investment", "money"],
    status: "quiet",
    stats: {
      growth: 15,
      messages: 432,
      newMembers: 32,
      events: 1,
    },
  },
]

export default function TrendingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("week")
  const [layoutType, setLayoutType] = useState<"modern" | "grid" | "list">("modern")

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Trending Servers</h1>
        <p className="text-muted-foreground">Discover the most popular and fastest growing communities on Server Hub</p>
      </div>

      <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex gap-2 sm:mt-0">
            <Button
              variant={layoutType === "modern" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutType("modern")}
            >
              Modern
            </Button>
            <Button
              variant={layoutType === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutType("grid")}
            >
              Grid
            </Button>
            <Button
              variant={layoutType === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutType("list")}
            >
              List
            </Button>
          </div>
        </div>

        <TabsContent value="day" className="mt-6 animate-fade-in">
          {isLoading ? (
            <TrendingServersSkeleton layoutType={layoutType} />
          ) : (
            <TrendingServersContent servers={trendingServers.slice(0, 4)} layoutType={layoutType} />
          )}
        </TabsContent>

        <TabsContent value="week" className="mt-6 animate-fade-in">
          {isLoading ? (
            <TrendingServersSkeleton layoutType={layoutType} />
          ) : (
            <TrendingServersContent servers={trendingServers} layoutType={layoutType} />
          )}
        </TabsContent>

        <TabsContent value="month" className="mt-6 animate-fade-in">
          {isLoading ? (
            <TrendingServersSkeleton layoutType={layoutType} />
          ) : (
            <TrendingServersContent
              servers={[...trendingServers].sort((a, b) => b.members - a.members)}
              layoutType={layoutType}
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Trending Categories</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-2 h-10 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))
            : [
                {
                  name: "Gaming",
                  servers: 1245,
                  growth: 32,
                  color: "bg-red-500",
                },
                {
                  name: "Technology",
                  servers: 987,
                  growth: 28,
                  color: "bg-blue-500",
                },
                {
                  name: "Music",
                  servers: 765,
                  growth: 25,
                  color: "bg-purple-500",
                },
                {
                  name: "Fitness",
                  servers: 654,
                  growth: 22,
                  color: "bg-green-500",
                },
              ].map((category) => (
                <Card key={category.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <div className={`mr-2 h-3 w-3 rounded-full ${category.color}`} />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{category.servers}</p>
                        <p className="text-sm text-muted-foreground">Active Servers</p>
                      </div>
                      <div className="flex items-center text-green-500">
                        <ArrowUp className="mr-1 h-4 w-4" />
                        <span className="font-medium">{category.growth}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </div>
  )
}

function TrendingServersContent({
  servers,
  layoutType,
}: {
  servers: typeof trendingServers
  layoutType: "modern" | "grid" | "list"
}) {
  return (
    <>
      <div
        className={cn(
          "grid gap-6",
          layoutType === "modern"
            ? "grid-cols-1"
            : layoutType === "grid"
              ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1",
        )}
      >
        {servers.map((server, index) => (
          <div key={server.id} className="relative">
            {index < 3 && (
              <Badge className="absolute left-2 top-2 z-10 bg-primary text-primary-foreground" variant="default">
                #{index + 1} Trending
              </Badge>
            )}
            <ServerCard server={server} isAdmin={false} layout={layoutType} />
            <div className="mt-2 grid grid-cols-4 gap-2">
              <Card className="bg-muted/50">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center justify-center text-green-500">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    <span className="text-xs font-medium">{server.stats.growth}%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Growth</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center justify-center">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    <span className="text-xs font-medium">{server.stats.messages}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Messages</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center justify-center">
                    <Users className="mr-1 h-3 w-3" />
                    <span className="text-xs font-medium">{server.stats.newMembers}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">New Users</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-2 text-center">
                  <div className="flex items-center justify-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="text-xs font-medium">{server.stats.events}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Events</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function TrendingServersSkeleton({ layoutType }: { layoutType: "modern" | "grid" | "list" }) {
  return (
    <div
      className={cn(
        "grid gap-6",
        layoutType === "modern"
          ? "grid-cols-1"
          : layoutType === "grid"
            ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1",
      )}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="overflow-hidden rounded-lg border">
            <Skeleton className="aspect-video w-full sm:aspect-square" />
            <div className="p-4">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


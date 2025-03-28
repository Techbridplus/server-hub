"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerCard } from "@/components/server-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Mock data for featured servers
const featuredServers = [
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
    featured: {
      reason: "Community Pick",
      description: "One of our most active and helpful communities for tech discussions",
    },
  },
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
    featured: {
      reason: "Staff Pick",
      description: "Our team loves this vibrant gaming community with regular events",
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
    featured: {
      reason: "Rising Star",
      description: "A rapidly growing community with supportive members and great content",
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
    featured: {
      reason: "Community Pick",
      description: "A place where music lovers come together to share their passion",
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
    featured: {
      reason: "Staff Pick",
      description: "Curated content and insightful discussions about modern lifestyle",
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
    featured: {
      reason: "Rising Star",
      description: "Growing community with valuable financial advice and discussions",
    },
  },
]

export default function FeaturedPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredType, setFeaturedType] = useState("all")
  const [layoutType, setLayoutType] = useState<"modern" | "grid" | "list">("modern")

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter servers based on featured type
  const filteredServers =
    featuredType === "all"
      ? featuredServers
      : featuredServers.filter((server) => server.featured.reason.toLowerCase().includes(featuredType.toLowerCase()))

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Featured Servers</h1>
        <p className="text-muted-foreground">
          Discover hand-picked communities that stand out for their quality and engagement
        </p>
      </div>

      <Tabs value={featuredType} onValueChange={setFeaturedType} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All Featured</TabsTrigger>
            <TabsTrigger value="staff">Staff Picks</TabsTrigger>
            <TabsTrigger value="community">Community Picks</TabsTrigger>
            <TabsTrigger value="rising">Rising Stars</TabsTrigger>
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

        <TabsContent value="all" className="mt-6 animate-fade-in">
          {isLoading ? (
            <FeaturedServersSkeleton layoutType={layoutType} />
          ) : (
            <FeaturedServersContent servers={featuredServers} layoutType={layoutType} />
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-6 animate-fade-in">
          {isLoading ? (
            <FeaturedServersSkeleton layoutType={layoutType} />
          ) : (
            <FeaturedServersContent
              servers={featuredServers.filter((s) => s.featured.reason === "Staff Pick")}
              layoutType={layoutType}
            />
          )}
        </TabsContent>

        <TabsContent value="community" className="mt-6 animate-fade-in">
          {isLoading ? (
            <FeaturedServersSkeleton layoutType={layoutType} />
          ) : (
            <FeaturedServersContent
              servers={featuredServers.filter((s) => s.featured.reason === "Community Pick")}
              layoutType={layoutType}
            />
          )}
        </TabsContent>

        <TabsContent value="rising" className="mt-6 animate-fade-in">
          {isLoading ? (
            <FeaturedServersSkeleton layoutType={layoutType} />
          ) : (
            <FeaturedServersContent
              servers={featuredServers.filter((s) => s.featured.reason === "Rising Star")}
              layoutType={layoutType}
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Why We Feature Servers</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="mt-2 h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            : [
                {
                  title: "Staff Picks",
                  description:
                    "Our team handpicks servers that demonstrate exceptional quality, unique content, and positive community engagement.",
                  icon: "🏆",
                },
                {
                  title: "Community Picks",
                  description:
                    "These servers are chosen based on user nominations and votes, representing what our community values most.",
                  icon: "👥",
                },
                {
                  title: "Rising Stars",
                  description:
                    "New or growing servers that show great potential with innovative ideas and rapidly increasing engagement.",
                  icon: "⭐",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <div className="text-3xl">{item.icon}</div>
                    <CardTitle className="mt-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </div>
  )
}

function FeaturedServersContent({
  servers,
  layoutType,
}: {
  servers: typeof featuredServers
  layoutType: "modern" | "grid" | "list"
}) {
  return (
    <>
      {servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">No featured servers found</h3>
          <p className="mb-4 text-sm text-muted-foreground">Check back later for new featured servers</p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            layoutType === "modern"
              ? "grid-cols-1"
              : layoutType === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1",
          )}
        >
          {servers.map((server) => (
            <div key={server.id} className="relative">
              <div className="absolute left-0 top-0 z-10 flex items-center rounded-tl-lg rounded-br-lg bg-primary px-3 py-1 text-primary-foreground">
                <Star className="mr-1 h-3 w-3" />
                <span className="text-xs font-medium">{server.featured.reason}</span>
              </div>
              <ServerCard server={server} isAdmin={false} layout={layoutType} featured={true} />
              <Card className="mt-2 border-primary/20 bg-primary/5">
                <CardContent className="p-3">
                  <p className="text-sm">{server.featured.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function FeaturedServersSkeleton({ layoutType }: { layoutType: "modern" | "grid" | "list" }) {
  return (
    <div
      className={cn(
        "grid gap-6",
        layoutType === "modern"
          ? "grid-cols-1"
          : layoutType === "grid"
            ? "sm:grid-cols-2 lg:grid-cols-3"
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
          <Skeleton className="mt-2 h-16 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}


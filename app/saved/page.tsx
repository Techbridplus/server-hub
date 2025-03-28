"use client"

import { useState, useEffect } from "react"
import { Bookmark, Search, Filter, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ServerCard } from "@/components/server-card"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Mock data for saved servers
const savedServersData = [
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
    savedAt: "2023-05-15T10:30:00Z",
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
    savedAt: "2023-06-22T14:45:00Z",
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
    savedAt: "2023-07-10T09:15:00Z",
  },
]

export default function SavedServersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [savedServers, setSavedServers] = useState(savedServersData)
  const [filteredServers, setFilteredServers] = useState(savedServersData)
  const [layoutType, setLayoutType] = useState<"modern" | "grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("recent")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/saved")
    }
  }, [status, router])

  // Simulate loading
  useEffect(() => {
    if (status === "authenticated") {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [status])

  // Search and filter functionality
  useEffect(() => {
    let results = savedServers

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter((server) => {
        const nameMatch = server.name.toLowerCase().includes(query)
        const descMatch = server.description?.toLowerCase().includes(query) || false
        const categoryMatch = server.category.toLowerCase().includes(query)
        const tagMatch = server.tags.some((tag) => tag.toLowerCase().includes(query))

        return nameMatch || descMatch || categoryMatch || tagMatch
      })
    }

    // Sort results
    switch (sortBy) {
      case "recent":
        results.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        break
      case "oldest":
        results.sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime())
        break
      case "alphabetical":
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "members-high":
        results.sort((a, b) => b.members - a.members)
        break
      case "members-low":
        results.sort((a, b) => a.members - b.members)
        break
      default:
        break
    }

    setFilteredServers(results)
  }, [searchQuery, savedServers, sortBy])

  // Remove server from saved list
  const removeServer = (serverId: string) => {
    setSavedServers((prev) => prev.filter((server) => server.id !== serverId))
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-32" />
        </div>

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
            <div key={i} className="overflow-hidden rounded-lg border">
              <Skeleton className="aspect-video w-full sm:aspect-square" />
              <div className="p-4">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Saved Servers</h1>
        <p className="text-muted-foreground">
          Access your bookmarked servers quickly and stay connected to your favorite communities
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search saved servers..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>Most Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>Alphabetical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("members-high")}>Most Members</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("members-low")}>Least Members</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLayoutType("modern")}>Modern View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayoutType("grid")}>Grid View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayoutType("list")}>List View</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredServers.length === 0 ? (
        searchQuery ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No matching servers found</h3>
            <p className="mb-4 text-sm text-muted-foreground">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Bookmark className="mb-2 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No saved servers yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Save your favorite servers to access them quickly</p>
            <Button variant="default" onClick={() => router.push("/browse")}>
              Browse Servers
            </Button>
          </div>
        )
      ) : (
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
            {filteredServers.map((server) => (
              <div key={server.id} className="group relative">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeServer(server.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
                <ServerCard server={server} isAdmin={false} layout={layoutType} />
                <div className="mt-1 text-xs text-muted-foreground">
                  Saved on {new Date(server.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


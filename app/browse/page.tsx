"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ServerCard } from "@/components/server-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Mock data for demonstration
const allServersData = [
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
  },
  {
    id: "2",
    name: "Design Masters",
    members: 876,
    category: "Design",
    isExclusive: false,
    isPrivate: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
    description: "Share and discuss design concepts and techniques",
    tags: ["design", "ui", "ux"],
    status: "moderate",
  },
  // ... more servers
]

const categories = [
  { id: "all", name: "All" },
  { id: "technology", name: "Technology" },
  { id: "design", name: "Design" },
  { id: "business", name: "Business" },
  { id: "gaming", name: "Gaming" },
  { id: "books", name: "Books" },
  { id: "photography", name: "Photography" },
  { id: "fitness", name: "Fitness" },
  { id: "travel", name: "Travel" },
  { id: "food", name: "Food" },
  { id: "music", name: "Music" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "finance", name: "Finance" },
]

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "all"
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filteredServers, setFilteredServers] = useState(allServersData)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [layoutType, setLayoutType] = useState<"modern" | "grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [filters, setFilters] = useState({
    showPrivate: true,
    showExclusive: true,
    minMembers: 0,
    maxMembers: 10000,
    status: ["active", "moderate", "quiet"],
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Search and filter functionality
  useEffect(() => {
    let results = allServersData

    // Filter by category
    if (activeCategory !== "all") {
      results = results.filter((server) => server.category.toLowerCase() === activeCategory.toLowerCase())
    }

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

    // Apply additional filters
    results = results.filter((server) => {
      if (!filters.showPrivate && server.isPrivate) return false
      if (!filters.showExclusive && server.isExclusive) return false
      if (server.members < filters.minMembers || server.members > filters.maxMembers) return false
      if (server.status && !filters.status.includes(server.status)) return false
      return true
    })

    // Sort results
    switch (sortBy) {
      case "newest":
        // In a real app, you would sort by creation date
        break
      case "oldest":
        // In a real app, you would sort by creation date in reverse
        break
      case "members-high":
        results.sort((a, b) => b.members - a.members)
        break
      case "members-low":
        results.sort((a, b) => a.members - b.members)
        break
      case "alphabetical":
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    setFilteredServers(results)
  }, [searchQuery, activeCategory, sortBy, filters])

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Servers</h1>
        <p className="text-muted-foreground">
          Discover communities based on your interests and connect with like-minded people
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search servers..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="members-high">Most Members</SelectItem>
              <SelectItem value="members-low">Least Members</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Servers</SheetTitle>
                <SheetDescription>Customize your server browsing experience with these filters</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Server Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-private"
                        checked={filters.showPrivate}
                        onCheckedChange={(checked) => setFilters({ ...filters, showPrivate: checked as boolean })}
                      />
                      <Label htmlFor="show-private">Show Private Servers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-exclusive"
                        checked={filters.showExclusive}
                        onCheckedChange={(checked) => setFilters({ ...filters, showExclusive: checked as boolean })}
                      />
                      <Label htmlFor="show-exclusive">Show Exclusive Servers</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Server Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-active"
                        checked={filters.status.includes("active")}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            status: checked
                              ? [...filters.status, "active"]
                              : filters.status.filter((s) => s !== "active"),
                          })
                        }
                      />
                      <Label htmlFor="status-active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-moderate"
                        checked={filters.status.includes("moderate")}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            status: checked
                              ? [...filters.status, "moderate"]
                              : filters.status.filter((s) => s !== "moderate"),
                          })
                        }
                      />
                      <Label htmlFor="status-moderate">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-quiet"
                        checked={filters.status.includes("quiet")}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            status: checked
                              ? [...filters.status, "quiet"]
                              : filters.status.filter((s) => s !== "quiet"),
                          })
                        }
                      />
                      <Label htmlFor="status-quiet">Quiet</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Layout</h3>
                  <div className="grid grid-cols-3 gap-2">
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

                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      showPrivate: true,
                      showExclusive: true,
                      minMembers: 0,
                      maxMembers: 10000,
                      status: ["active", "moderate", "quiet"],
                    })
                  }
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category pills */}
      <ScrollArea className="mb-6 whitespace-nowrap pb-2">
        <div className="flex gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </ScrollArea>

      {/* Results */}
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : activeCategory !== "all"
              ? `${categories.find((c) => c.id === activeCategory)?.name} Servers`
              : "All Servers"}
        </h2>
        <p className="text-sm text-muted-foreground">Found {filteredServers.length} servers</p>
      </div>

      {isLoading ? (
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
          {Array.from({ length: 8 }).map((_, i) => (
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
              <ServerCard key={server.id} server={server} isAdmin={false} layout={layoutType} />
            ))}

            {filteredServers.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">No servers found</h3>
                <p className="mb-4 text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory("all")
                    setFilters({
                      showPrivate: true,
                      showExclusive: true,
                      minMembers: 0,
                      maxMembers: 10000,
                      status: ["active", "moderate", "quiet"],
                    })
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {filteredServers.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


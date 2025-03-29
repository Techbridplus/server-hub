"use client"

import React, { useState, useEffect } from "react"
import { Search, Filter, Compass, TrendingUp, Star, History, Settings, Sparkles, Bookmark, Palette, LogOut, Bell, ChevronDown, LayoutGrid, Layout } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle, ColorSchemeSelector } from "@/components/theme-customizer"
import { CreateServerModal } from "@/components/create-server-modal"
import { ServerCard } from "@/components/server-card"
import { MobileNav } from "@/components/mobile-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { useInView } from "react-intersection-observer"
import axios from "axios"
import ServerSidebar from "@/components/server-sidebar"

interface Server {
  id: string
  name: string
  _count: {
    members: number
  }
  category: string
  isExclusive: boolean
  isPrivate: boolean
  imageUrl: string
  description?: string
  status?: "active" | "moderate" | "quiet"
  tags?: string[]
}

interface Category {
  id: string
  name: string
  count: number
}

interface PaginatedResponse {
  servers: Server[]
  categories: { name: string; count: number }[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function HomePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [layoutType, setLayoutType] = useState<"modern" | "grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("discover")
  const [allServers, setAllServers] = useState<Server[]>([])
  const [filteredServers, setFilteredServers] = useState<Server[]>([])
  const [myServers, setMyServers] = useState<Server[]>([])
  const [joinedServers, setJoinedServers] = useState<Server[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { ref, inView } = useInView()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories")
        setCategories([{ id: "all", name: "All", count: 0 }, ...response.data])
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [toast])

  // Fetch my servers
  useEffect(() => {
    const fetchMyServers = async () => {
      try {
        const response = await axios.get("/api/users/me/servers?owned=true")
        setMyServers(response.data || [])
      } catch (error) {
        console.error("Error fetching my servers:", error)
        toast({
          title: "Error", 
          description: "Failed to load your servers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchMyServers()
    }
  }, [session, toast])

  // Fetch joined servers
  useEffect(() => {
    const fetchJoinedServers = async () => {
      try {
        const response = await axios.get("/api/users/me/servers?joined=true")
        setJoinedServers(response.data || [])
      } catch (error) {
        console.error("Error fetching joined servers:", error)
        toast({
          title: "Error",
          description: "Failed to load joined servers. Please try again.", 
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchJoinedServers() 
    }
  }, [session, toast])

  // Fetch all servers for discover tab
  useEffect(() => {
    const fetchAllServers = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get("/api/servers?page=1&limit=10&includePrivate=true&showAll=true")
        setAllServers(response.data.servers || [])
        setFilteredServers(response.data.servers || [])
      } catch (error) {
        console.error("Error fetching servers:", error)
        toast({
          title: "Error",
          description: "Failed to load servers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllServers()
  }, [toast])

  // Filter servers based on category and search query
  useEffect(() => {
    let filtered = [...allServers]
    console.log("Active Category:", activeCategory)
    console.log("All Servers:", allServers)

    // Apply category filter
    if (activeCategory !== "All") {
      filtered = filtered.filter(server => {
        console.log("Server Category:", server.category)
        return server.category === activeCategory
      })
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(server => 
        server.name.toLowerCase().includes(query) ||
        server.description?.toLowerCase().includes(query) ||
        server.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    console.log("Filtered Servers:", filtered)
    setFilteredServers(filtered)
  }, [allServers, activeCategory, searchQuery])

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category)
    setIsLoading(true)
    try {
      const url = category === "All" 
        ? "/api/servers?page=1&limit=10&includePrivate=true&showAll=true"
        : `/api/servers?page=1&limit=10&includePrivate=true&category=${category}`
      
      const response = await axios.get(url)
      setAllServers(response.data.servers || [])
    } catch (error) {
      console.error("Error fetching servers for category:", error)
      toast({
        title: "Error",
        description: "Failed to load servers for this category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  console.log("joinedServers", joinedServers)
  console.log("myServers", myServers)

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <ServerSidebar />
      

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <MobileNav />

            <div className="flex-1">
              <div className="relative ml-auto flex w-full max-w-sm items-center md:ml-0">
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search servers..."
                  className="w-full rounded-full bg-muted pl-8 md:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <ColorSchemeSelector />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <CreateServerModal
                className="hidden md:flex justify-start gap-2 h-9"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto p-4 md:p-6">
          <section className="mb-8">
            <div className="rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Discover Communities</h1>
                <p className="text-muted-foreground max-w-2xl mb-4">
                  Find and join communities based on your interests, or create your own server to bring people
                  together.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline">
                    <Compass className="mr-2 h-4 w-4" />
                    Explore Trending
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Category pills */}
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id || category.name}
                  variant={activeCategory === category.name ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleCategoryChange(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="discover" className="mb-8" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="my-servers">My Servers</TabsTrigger>
              <TabsTrigger value="joined">Joined Servers</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="mt-6 animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <>
                  {searchQuery && (
                    <div className="mb-4">
                      <h2 className="text-lg font-medium">Search results for "{searchQuery}"</h2>
                      <p className="text-sm text-muted-foreground">Found {filteredServers.length} servers</p>
                    </div>
                  )}

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
                      <ServerCard
                        key={server.id}
                        server={server}
                        isAdmin={myServers.some((s) => s.id === server.id)}
                        layout={layoutType}
                        onJoin={() => {}}
                        isJoined={joinedServers.some((s) => s.id === server.id)}
                      />
                    ))}

                    {filteredServers.length === 0 && !isLoading && (
                      <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <h3 className="mb-2 text-lg font-semibold">No servers found</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            setActiveCategory("All")
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="my-servers" className="mt-6 animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : myServers.length > 0 ? (
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
                  {myServers.map((server) => (
                    <ServerCard key={server.id} server={server} isAdmin={true} layout={layoutType} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">No servers created yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Create your first server to get started</p>
                  <CreateServerModal
                    // buttonText="Create Server"
                    // onServerCreated={() => {
                    //   // Refresh my servers after creation
                    //   apiClient<Server[]>("/api/users/me/servers?owned=true")
                    //     .then((data) => setMyServers(data))
                    //     .catch((err) => console.error("Error refreshing servers:", err))
                    // }}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="joined" className="mt-6 animate-fade-in">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : joinedServers.length > 0 ? (
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
                  {joinedServers.map((server) => (
                    <ServerCard
                      key={server.id}
                      server={server}
                      isAdmin={myServers.some((s) => s.id === server.id)}
                      layout={layoutType}
                      isJoined={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">You haven't joined any servers</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Discover and join servers to connect with others</p>
                  <Button variant="outline" asChild>
                    <Link href="/browse">Browse Servers</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}


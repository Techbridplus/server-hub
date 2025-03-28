"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Compass, TrendingUp, Star, History, Settings, Sparkles, Bookmark, Palette, LogOut, Bell } from "lucide-react"
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
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"

interface Server {
  id: string
  name: string
  members: number
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
}

export default function HomePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [allServers, setAllServers] = useState<Server[]>([])
  const [filteredServers, setFilteredServers] = useState<Server[]>([])
  const [myServers, setMyServers] = useState<Server[]>([])
  const [joinedServers, setJoinedServers] = useState<Server[]>([])
  const [featuredServers, setFeaturedServers] = useState<Server[]>([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [layoutType, setLayoutType] = useState<"modern" | "grid" | "list">("modern")
  const [showAllFeatured, setShowAllFeatured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([{ id: "all", name: "All" }])

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch categories
        const categoriesData = await apiClient<Category[]>("/api/categories")
        setCategories([{ id: "all", name: "All" }, ...categoriesData])

        // Fetch all servers
        const allServersData = await apiClient<Server[]>("/api/servers")
        setAllServers(allServersData)
        setFilteredServers(allServersData)

        // Fetch my servers (owned by current user)
        const myServersData = await apiClient<Server[]>("/api/users/me/servers?owned=true")
        setMyServers(myServersData)

        // Fetch joined servers
        const joinedServersData = await apiClient<Server[]>("/api/users/me/servers?joined=true")
        setJoinedServers(joinedServersData)

        // Fetch featured servers
        const featuredServersData = await apiClient<Server[]>("/api/servers?featured=true")
        setFeaturedServers(featuredServersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load servers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Search and filter functionality
  useEffect(() => {
    if (allServers.length === 0) return

    let results = [...allServers]

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
        const tagMatch = server.tags?.some((tag) => tag.toLowerCase().includes(query)) || false

        // Calculate match score for sorting
        let score = 0
        if (nameMatch) score += 3
        if (categoryMatch) score += 2
        if (tagMatch) score += 2
        if (descMatch)
          score += 1

          // Add score property
        ;(server as any).score = score

        return nameMatch || descMatch || categoryMatch || tagMatch
      })

      // Sort by relevance score
      results.sort((a, b) => (b as any).score - (a as any).score)
    }

    setFilteredServers(results)
  }, [searchQuery, activeCategory, allServers])

  // Join server handler
  const handleJoinServer = async (serverId: string, isPrivate: boolean) => {
    try {
      if (isPrivate) {
        // For private servers, redirect to access request page
        window.location.href = `/server/${serverId}/request-access`
        return
      }

      // Join public server
      await apiClient("/api/servers/" + serverId + "/join", {
        method: "POST",
      })

      toast({
        title: "Success",
        description: "You have joined the server",
      })

      // Refresh joined servers
      const joinedServersData = await apiClient<Server[]>("/api/users/me/servers?joined=true")
      setJoinedServers(joinedServersData)
    } catch (error) {
      console.error("Error joining server:", error)
      toast({
        title: "Error",
        description: "Failed to join server. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary-foreground"
              >
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
              </svg>
            </div>
            <span className="font-bold">Server Hub</span>
          </Link>
        </div>
        <div className="p-4">
            <CreateServerModal
              className="w-full justify-start gap-2"
              // onServerCreated={() => {
              //   // Refresh my servers after creation
              //   apiClient<Server[]>("/api/users/me/servers?owned=true")
              //     .then((data) => setMyServers(data))
              //     .catch((err) => console.error("Error refreshing servers:", err))
              // }}
            />
          </div>
        <ScrollArea className="flex-1 px-3">
          

          <div className="space-y-4">
            <div className="py-2">
              <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Discover</h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                  <Link href="/browse">
                    <Compass className="h-4 w-4" />
                    Browse Servers
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                  <Link href="/trending">
                  <Sparkles className="h-4 w-4" />
                    Trending
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                  <Link href="/featured">
                    <Star className="h-4 w-4" />
                    Featured
                  </Link>
                </Button>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="py-2">
              <div className="mb-2 px-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">My Servers</h2>
                <Badge variant="secondary" className="text-xs">
                  {myServers.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : myServers.length > 0 ? (
                  myServers.map((server) => (
                    <Button key={server.id} variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href={`/server/${server.id}`}>
                        <div className="relative mr-2 h-4 w-4 overflow-hidden rounded">
                          <img
                            src={server.imageUrl || "/placeholder.svg"}
                            alt={server.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {server.name}
                      </Link>
                    </Button>
                  ))
                ) : (
                  <p className="text-xs px-4 text-muted-foreground py-1">No servers created yet</p>
                )}
              </div>
            </div>

            <Separator className="mx-4" />

            <div className="px-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">Joined Servers</h2>
                <Badge variant="secondary" className="text-xs">
                  {joinedServers.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : joinedServers.length > 0 ? (
                  joinedServers.map((server) => (
                    <Button key={server.id} variant="ghost" className="w-full justify-start" asChild>
                      <Link href={`/server/${server.id}`}>
                        <div className="relative mr-2 h-4 w-4 overflow-hidden rounded">
                          <img
                            src={server.imageUrl || "/placeholder.svg"}
                            alt={server.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {server.name}
                      </Link>
                    </Button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-1">No servers joined yet</p>
                )}
              </div>
            </div>

            <Separator className="mx-4" />

            <div className="px-4">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Recent Activity</h2>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/recent">
                    <History className="mr-2 h-4 w-4" />
                    Recently Visited
                  </Link>
                </Button>
              </div>
              <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/savedServers">
                    <Bookmark className="h-4 w-4" />
                    Saved Servers
                  </Link>
              </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={session.user?.image || "/default-logo.png"} alt={session.user?.name || "User"} />
                    <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{session.user?.name || "User Name"}</span>
                    <span className="text-xs text-muted-foreground">{session.user?.email || "user@example.com"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/auth/signup">Create account</Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
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
                className=" hidden md:flex justify-start gap-2 h-9"
                // onServerCreated={() => {
                //   // Refresh my servers after creation
                //   apiClient<Server[]>("/api/users/me/servers?owned=true")
                //     .then((data) => setMyServers(data))
                //     .catch((err) => console.error("Error refreshing servers:", err))
                // }}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className=" container mx-auto p-4 md:p-6">
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
                    <CreateServerModal />
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
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

          <Tabs defaultValue="discover" className="mb-8">
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
                        onJoin={() => handleJoinServer(server.id, server.isPrivate)}
                        isJoined={joinedServers.some((s) => s.id === server.id)}
                      />
                    ))}

                    {filteredServers.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <h3 className="mb-2 text-lg font-semibold">No servers found</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("")
                            setActiveCategory("all")
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


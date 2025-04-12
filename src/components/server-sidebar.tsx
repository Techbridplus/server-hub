"use client"


import { Server } from '@prisma/client'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { CreateServerModal } from "@/components/create-server-modal"
import { Search, Filter, Compass, TrendingUp, Star, History, Settings, Sparkles, Bookmark, Palette, LogOut, Bell, ChevronDown, LayoutGrid, Layout } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { signOut, useSession } from "next-auth/react"

function ServerSidebar() {
    const { data: session } = useSession()
    const [myServers, setMyServers] = useState<Server[]>([])
    const [joinedServers, setJoinedServers] = useState<Server[]>([])
    const [isLoading, setIsLoading] = useState(true)
    console.log("image:", session?.user?.image)
    useEffect(() => {
        if (session) {
            axios.get("/api/users/me/servers?owned=true")
                .then((data) => setMyServers(data.data.servers || []))
                .catch((err) => console.error("Error fetching my servers:", err))
                .finally(() => setIsLoading(false))
        }else{
            setIsLoading(false)
        }
    }, [session])

    useEffect(() => {
        if (session) {
            axios.get("/api/users/me/servers?joined=true")
                .then((data) => setJoinedServers(data.data.servers || []))
                .catch((err) => console.error("Error fetching joined servers:", err))
                .finally(() => setIsLoading(false))
        }else{
            setIsLoading(false)
        }
    }, [session])
    console.log("joinedServers",joinedServers)
    console.log("myServers",myServers)

    return (
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
                                myServers.map((server: Server) => (
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
    )
}

export default ServerSidebar

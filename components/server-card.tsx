"use client"

import { Crown, Users, Lock, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ServerCardProps {
  server: {
    id: string
    name: string
    members: number
    category: string
    isExclusive: boolean
    isPrivate: boolean
    imageUrl: string
    description?: string
    status?: "active" | "moderate" | "quiet"
  }
  isAdmin: boolean
  isJoined?: boolean
  featured?: boolean
  layout?: "modern" | "grid" | "list"
  onJoin?: () => void
}

export function ServerCard({
  server,
  isAdmin,
  isJoined = false,
  featured = false,
  layout = "modern",
  onJoin,
}: ServerCardProps) {
  // Modern layout
  if (layout === "modern") {
    return (
      <Card className={cn("overflow-hidden transition-all hover:shadow-md", featured && "border-primary/50")}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-video w-full sm:aspect-square sm:w-64">
            <Image src={server.imageUrl || "/placeholder.svg"} alt={server.name} fill className="object-cover" />
            {server.status && (
              <Badge variant="secondary" className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm">
                {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
              </Badge>
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="line-clamp-1">{server.name}</CardTitle>
                  {isAdmin && <Crown className="h-4 w-4 text-amber-500" />}
                  {server.isExclusive && (
                    <Badge variant="secondary" size="sm">
                      <Star className="mr-1 h-3 w-3 text-amber-500" />
                      Exclusive
                    </Badge>
                  )}
                  {server.isPrivate && (
                    <Badge variant="secondary" size="sm">
                      <Lock className="mr-1 h-3 w-3 text-amber-500" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{server.members.toLocaleString()} members</span>
                <span className="mx-1">•</span>
                <Badge variant="outline" className="text-xs">
                  {server.category}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {server.description && <p className="line-clamp-2 text-sm text-muted-foreground">{server.description}</p>}
            </CardContent>
            <CardFooter className="mt-auto">
              {isAdmin ? (
                <Link href={`/server/${server.id}`} className="w-full">
                  <Button variant="default" className="w-full">
                    Manage Server
                  </Button>
                </Link>
              ) : (
                <div className="flex w-full gap-2">
                  {!isJoined ? (
                    <Button variant="outline" className="w-full" onClick={onJoin}>
                      {server.isPrivate ? "Request Access" : "Join"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Joined
                    </Button>
                  )}
                  <Link href={`/server/${server.id}`} className="w-full">
                    <Button variant="secondary" className="w-full">
                      View
                    </Button>
                  </Link>
                </div>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    )
  }

  // Grid layout
  if (layout === "grid") {
    return (
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-md",
          featured ? "border-primary/50 bg-primary/5" : "",
          server.isPrivate ? "border-amber-500/20" : "",
        )}
      >
        <div className="relative h-32 w-full">
          <Image src={server.imageUrl || "/placeholder.svg"} alt={server.name} fill className="object-cover" />
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {server.isExclusive && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Star className="mr-1 h-3 w-3 text-amber-500" />
                Exclusive
              </Badge>
            )}
            {server.isPrivate && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Lock className="mr-1 h-3 w-3 text-amber-500" />
                Private
              </Badge>
            )}
          </div>
          {server.status && (
            <Badge variant="secondary" className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm">
              {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{server.name}</CardTitle>
            {isAdmin && <Crown className="h-4 w-4 text-amber-500" />}
          </div>
          <CardDescription className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{server.members.toLocaleString()} members</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <Badge variant="outline">{server.category}</Badge>
          {server.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{server.description}</p>
          )}
        </CardContent>
        <CardFooter>
          {isAdmin ? (
            <Link href={`/server/${server.id}`} className="w-full">
              <Button variant="default" className="w-full">
                Manage Server
              </Button>
            </Link>
          ) : (
            <div className="flex w-full gap-2">
              {!isJoined ? (
                <Button variant="outline" className="w-full" onClick={onJoin}>
                  {server.isPrivate ? "Request Access" : "Join"}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Joined
                </Button>
              )}
              <Link href={`/server/${server.id}`} className="w-full">
                <Button variant="secondary" className="w-full">
                  View
                </Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    )
  }

  // List layout
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        featured ? "border-primary/50 bg-primary/5" : "",
        server.isPrivate ? "border-amber-500/20" : "",
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-32 w-full sm:h-auto sm:w-48">
          <Image src={server.imageUrl || "/placeholder.svg"} alt={server.name} fill className="object-cover" />
          {server.status && (
            <Badge variant="secondary" className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm">
              {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="line-clamp-1">{server.name}</CardTitle>
                {isAdmin && <Crown className="h-4 w-4 text-amber-500" />}
                {server.isExclusive && (
                  <Badge variant="secondary" size="sm">
                    <Star className="mr-1 h-3 w-3 text-amber-500" />
                    Exclusive
                  </Badge>
                )}
                {server.isPrivate && (
                  <Badge variant="secondary" size="sm">
                    <Lock className="mr-1 h-3 w-3 text-amber-500" />
                    Private
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{server.members.toLocaleString()} members</span>
              <span className="mx-1">•</span>
              <Badge variant="outline" className="text-xs">
                {server.category}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {server.description && <p className="line-clamp-2 text-sm text-muted-foreground">{server.description}</p>}
          </CardContent>
          <CardFooter className="mt-auto">
            {isAdmin ? (
              <Link href={`/server/${server.id}`} className="w-full">
                <Button variant="default" className="w-full">
                  Manage Server
                </Button>
              </Link>
            ) : (
              <div className="flex w-full gap-2">
                {!isJoined ? (
                  <Button variant="outline" className="w-full" onClick={onJoin}>
                    {server.isPrivate ? "Request Access" : "Join"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Joined
                  </Button>
                )}
                <Link href={`/server/${server.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">
                    View
                  </Button>
                </Link>
              </div>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}


"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, Star, Camera, Video, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CommentSection } from "@/components/comment-section"
import { ShareDialog } from "@/components/share-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function EventPage({ params }: { params: { serverId: string; eventId: string } }) {
  // State for RSVP
  const [rsvpStatus, setRsvpStatus] = useState<"going" | "maybe" | "not-going" | null>(null)
  const [showAllAttendees, setShowAllAttendees] = useState(false)

  // State for countdown timer
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPast: false,
  })

  // Mock data for demonstration
  const event = {
    id: params.eventId,
    title: "Weekly Game Night",
    description:
      "Join us for our weekly game night where we'll be playing a variety of games including Among Us, Valorant, and Minecraft. All skill levels are welcome!",
    date: "Friday, March 15, 2025",
    time: "8:00 PM - 11:00 PM",
    location: "Discord Voice Channel: Game Night",
    organizer: "GameMaster",
    attendees: 24,
    maxAttendees: 30,
    imageUrl: "/placeholder.svg?height=400&width=800",
    isExclusive: params.eventId === "2",
    isPast: false,
    startTime: "2025-03-15T20:00:00",
    endTime: "2025-03-15T23:00:00",
  }

  const attendees = [
    { id: "1", name: "JohnDoe", imageUrl: "/placeholder.svg?height=40&width=40", status: "going" },
    { id: "2", name: "JaneSmith", imageUrl: "/placeholder.svg?height=40&width=40", status: "going" },
    { id: "3", name: "BobJohnson", imageUrl: "/placeholder.svg?height=40&width=40", status: "going" },
    { id: "4", name: "AliceWilliams", imageUrl: "/placeholder.svg?height=40&width=40", status: "going" },
    { id: "5", name: "CharlieBrown", imageUrl: "/placeholder.svg?height=40&width=40", status: "going" },
    { id: "6", name: "DavidMiller", imageUrl: "/placeholder.svg?height=40&width=40", status: "maybe" },
    { id: "7", name: "EvaGreen", imageUrl: "/placeholder.svg?height=40&width=40", status: "maybe" },
    { id: "8", name: "FrankWhite", imageUrl: "/placeholder.svg?height=40&width=40", status: "not-going" },
  ]

  // Mock data for photos and videos (for past events)
  const photos = [
    { id: "1", url: "/placeholder.svg?height=300&width=400", type: "photo" },
    { id: "2", url: "/placeholder.svg?height=300&width=400", type: "photo" },
    { id: "3", url: "/placeholder.svg?height=300&width=400", type: "photo" },
    { id: "4", url: "/placeholder.svg?height=300&width=400", type: "photo" },
    { id: "5", url: "/placeholder.svg?height=300&width=400", type: "photo" },
    { id: "6", url: "/placeholder.svg?height=300&width=400", type: "photo" },
  ]

  const videos = [
    {
      id: "1",
      url: "/placeholder.svg?height=300&width=400",
      type: "video",
      thumbnail: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "2",
      url: "/placeholder.svg?height=300&width=400",
      type: "video",
      thumbnail: "/placeholder.svg?height=300&width=400",
    },
  ]

  // Calculate time remaining for the event
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const startTime = new Date(event.startTime)
      const endTime = new Date(event.endTime)

      // Check if event is past
      if (now > endTime) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: false,
          isPast: true,
        })
        return
      }

      // Check if event is live
      if (now >= startTime && now <= endTime) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
          isPast: false,
        })
        return
      }

      // Calculate time remaining until event starts
      const totalSeconds = Math.floor((startTime.getTime() - now.getTime()) / 1000)

      const days = Math.floor(totalSeconds / (60 * 60 * 24))
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = Math.floor(totalSeconds % 60)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
        isPast: false,
      })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [event.startTime, event.endTime])

  // Handle RSVP
  const handleRSVP = (status: "going" | "maybe" | "not-going") => {
    setRsvpStatus(status)
    // In a real app, you would call an API to update the RSVP status
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/server/${params.serverId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to server
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="relative h-[200px] w-full sm:h-[300px]">
                <Image
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
                {event.isExclusive && (
                  <div className="absolute right-4 top-4">
                    <Badge className="flex items-center gap-1 bg-background/80 text-primary backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-primary" />
                      Exclusive
                    </Badge>
                  </div>
                )}

                {/* Event status badge */}
                <div className="absolute left-4 top-4">
                  {timeRemaining.isLive && <Badge className="bg-green-500 text-white">Live Now</Badge>}
                  {timeRemaining.isPast && <Badge variant="secondary">Event Ended</Badge>}
                </div>
              </div>

              <div className="p-6">
                <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{event.title}</h1>
                <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Countdown timer */}
                {!timeRemaining.isPast && !timeRemaining.isLive && (
                  <div className="mb-6 rounded-lg bg-muted p-4">
                    <h2 className="mb-2 text-sm font-medium">Event starts in</h2>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-md bg-background p-2">
                        <div className="text-2xl font-bold">{timeRemaining.days}</div>
                        <div className="text-xs text-muted-foreground">Days</div>
                      </div>
                      <div className="rounded-md bg-background p-2">
                        <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                        <div className="text-xs text-muted-foreground">Hours</div>
                      </div>
                      <div className="rounded-md bg-background p-2">
                        <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                      </div>
                      <div className="rounded-md bg-background p-2">
                        <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                        <div className="text-xs text-muted-foreground">Seconds</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live now indicator */}
                {timeRemaining.isLive && (
                  <div className="mb-6 rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                      <h2 className="font-medium text-green-600 dark:text-green-400">This event is happening now!</h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Join the event using the location details above.
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold">About this event</h2>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>

                <div className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold">Organized by</h2>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>{event.organizer.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{event.organizer}</span>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* RSVP section */}
                {!timeRemaining.isPast ? (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <Button
                        size="lg"
                        className={cn(rsvpStatus === "going" && "bg-green-600 hover:bg-green-700")}
                        onClick={() => handleRSVP("going")}
                      >
                        {rsvpStatus === "going" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Going
                          </>
                        ) : (
                          "I'll be there!"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className={cn(rsvpStatus === "maybe" && "border-primary text-primary")}
                        onClick={() => handleRSVP("maybe")}
                      >
                        Maybe
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className={cn(rsvpStatus === "not-going" && "border-destructive text-destructive")}
                        onClick={() => handleRSVP("not-going")}
                      >
                        Can't go
                      </Button>
                    </div>
                    <ShareDialog
                      title={event.title}
                      url={`/server/${params.serverId}/event/${event.id}`}
                      type="event"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Button size="lg" variant="outline" disabled>
                      Event has ended
                    </Button>
                    <ShareDialog
                      title={event.title}
                      url={`/server/${params.serverId}/event/${event.id}`}
                      type="event"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Photos and videos section (only for past events) */}
            {timeRemaining.isPast && (
              <div className="mt-6 rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Event Memories</h2>

                  <Tabs defaultValue="photos">
                    <TabsList className="mb-4">
                      <TabsTrigger value="photos" className="flex items-center gap-1">
                        <Camera className="h-4 w-4" />
                        Photos ({photos.length})
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        Videos ({videos.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="photos">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {photos.map((photo) => (
                          <Dialog key={photo.id}>
                            <DialogTrigger asChild>
                              <div className="relative aspect-square cursor-pointer overflow-hidden rounded-md">
                                <Image
                                  src={photo.url || "/placeholder.svg"}
                                  alt="Event photo"
                                  fill
                                  className="object-cover transition-transform hover:scale-105"
                                />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl">
                              <div className="relative aspect-video w-full">
                                <Image
                                  src={photo.url || "/placeholder.svg"}
                                  alt="Event photo"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="videos">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {videos.map((video) => (
                          <Dialog key={video.id}>
                            <DialogTrigger asChild>
                              <div className="relative aspect-video cursor-pointer overflow-hidden rounded-md">
                                <Image
                                  src={video.thumbnail || "/placeholder.svg"}
                                  alt="Video thumbnail"
                                  fill
                                  className="object-cover transition-transform hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="rounded-full bg-white/80 p-3">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="h-6 w-6 text-primary"
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl">
                              <div className="relative aspect-video w-full">
                                <Image
                                  src={video.thumbnail || "/placeholder.svg"}
                                  alt="Video thumbnail"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="rounded-full bg-white/80 p-3">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="h-6 w-6 text-primary"
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}

            <div className="mt-6">
              <CommentSection resourceId={event.id} resourceType="event" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Attendees ({event.attendees}/{event.maxAttendees})
              </h2>
              <div className="space-y-3">
                {(showAllAttendees ? attendees : attendees.slice(0, 5)).map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={attendee.imageUrl} />
                      <AvatarFallback>{attendee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{attendee.name}</span>
                    {attendee.status === "going" && (
                      <Badge variant="outline" className="ml-auto border-green-500 text-green-500">
                        Going
                      </Badge>
                    )}
                    {attendee.status === "maybe" && (
                      <Badge variant="outline" className="ml-auto">
                        Maybe
                      </Badge>
                    )}
                  </div>
                ))}
                {attendees.length > 5 && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full text-sm"
                    onClick={() => setShowAllAttendees(!showAllAttendees)}
                  >
                    {showAllAttendees ? "Show Less" : `View all ${event.attendees} attendees`}
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Event Details</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground">
                    {timeRemaining.isPast ? "Completed" : timeRemaining.isLive ? "Live Now" : "Upcoming"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Visibility</p>
                  <p className="text-muted-foreground">{event.isExclusive ? "Exclusive (Members Only)" : "Public"}</p>
                </div>
                <div>
                  <p className="font-medium">RSVP Deadline</p>
                  <p className="text-muted-foreground">1 hour before event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


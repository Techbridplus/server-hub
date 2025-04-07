import Link from "next/link"
import { ArrowLeft, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PastEventCard } from "@/components/past-event-card"

export default function PastEventsPage({ params }: { params: { serverId: string } }) {
  // Mock data for demonstration
  const pastEvents = [
    {
      id: "4",
      title: "Fortnite Custom Matches",
      date: "March 10, 2025",
      attendees: 50,
      imageUrl: "/placeholder.svg?height=200&width=300",
      isExclusive: false,
    },
    {
      id: "5",
      title: "Among Us Game Night",
      date: "March 8, 2025",
      attendees: 15,
      imageUrl: "/placeholder.svg?height=200&width=300",
      isExclusive: false,
    },
    {
      id: "6",
      title: "Minecraft Building Contest",
      date: "March 5, 2025",
      attendees: 28,
      imageUrl: "/placeholder.svg?height=200&width=300",
      isExclusive: true,
    },
    {
      id: "7",
      title: "League of Legends Tournament",
      date: "March 1, 2025",
      attendees: 40,
      imageUrl: "/placeholder.svg?height=200&width=300",
      isExclusive: false,
    },
    {
      id: "8",
      title: "Valorant Practice Session",
      date: "February 25, 2025",
      attendees: 12,
      imageUrl: "/placeholder.svg?height=200&width=300",
      isExclusive: false,
    },
    {
      id: "9",
      title: "Game Development Workshop",
      date: "February 20, 2025",
      attendees: 35,
      imageUrl: "/placeholder.svg?height=200&width=300",
      isExclusive: true,
    },
  ]

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

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Past Events</h1>
          <Button asChild>
            <Link href={`/server/${params.serverId}#events`}>View Upcoming Events</Link>
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search past events..." className="pl-9" />
          </div>
          <Select defaultValue="date-desc">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest first)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
              <SelectItem value="attendees-desc">Attendees (Most first)</SelectItem>
              <SelectItem value="attendees-asc">Attendees (Least first)</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="exclusive">Exclusive only</SelectItem>
              <SelectItem value="public">Public only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="mb-6" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pastEvents.map((event) => (
            <Link key={event.id} href={`/server/${params.serverId}/event/${event.id}`}>
              <PastEventCard key={event.id} event={event} serverId={params.serverId} />
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="gap-1">
            Load More <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


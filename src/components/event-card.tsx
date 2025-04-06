import { CalendarDays, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Event } from "@prisma/client"

interface EventCardProps {
  event: Event
  isPast?: boolean
  serverId?: string
}

export function EventCard({ event, isPast = false, serverId }: EventCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${event.isExclusive ? "border-primary/50" : ""}`}>
      <div className="relative h-40 w-full">
        <Image src={event.imageUrl || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
        {event.isExclusive && (
          <div className="absolute right-2 top-2">
            <Badge className="flex items-center gap-1 bg-background/80 text-primary backdrop-blur-sm">
              <Star className="h-3 w-3 fill-primary" />
              Exclusive
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <h3 className="font-semibold">{event.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{event.date}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-1 text-sm">
          <Users className="h-3.5 w-3.5" />
          <span>{event.attendees} attendees</span>
        </div>
      </CardContent>
      <CardFooter>
        {serverId ? (
          <Link href={`/server/${serverId}/event/${event.id}`} className="w-full">
            <Button variant={isPast ? "outline" : "default"} className="w-full">
              {isPast ? "View Recap" : "RSVP"}
            </Button>
          </Link>
        ) : (
          <Button variant={isPast ? "outline" : "default"} className="w-full">
            {isPast ? "View Recap" : "RSVP"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}


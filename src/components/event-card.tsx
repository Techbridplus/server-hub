import { CalendarDays, Star, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Event } from "@prisma/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: Event
  isPast?: boolean
  serverId?: string
}

export function EventCard({ event, isPast = false, serverId }: EventCardProps) {
  console.log("serverId", serverId)
  console.log("eventId", event.id)
  const router = useRouter()
  return (
    <Card 
    className={`overflow-hidden transition-all hover:shadow-md h-full ${event.isExclusive ? "border-primary/50" : ""}`}
    >
      <div className="relative h-full w-full ">
        <Image 
          src={event.imageUrl || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover" 
        />
        {event.isExclusive && (
          <div className="absolute right-2 top-2">
            <Badge className="flex items-center gap-1 bg-background/80 text-primary backdrop-blur-sm">
              <Star className="h-3 w-3 fill-primary" />
              Exclusive
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-[250px] bg-background/80 backdrop-blur-sm flex flex-col justify-between border border-muted p-2 rounded-md">
          <CardHeader className="pb-2">
            <h3 className="font-semibold">{event.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{new Date(event.startDate).toLocaleDateString('en-GB')} {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </CardHeader>
          {/* <CardContent className="pb-2">
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-3.5 w-3.5" />
              <span>{event.} attendees</span>
            </div>
          </CardContent> */}
          <CardFooter>
            {serverId && (
              <Link 
                href={`/server/${serverId}/event/${event.id}`} 
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isPast 
                    ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2",
                  "w-[60px]"
                )}
              >
                {isPast ? "View Recap" : "RSVP"}
              </Link>
            ) 
            // : (
            //   <Button variant={isPast ? "outline" : "default"} className="w-full">
            //     {isPast ? "View Recap" : "RSVP"}
            //   </Button>
            // )
            }
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}


import { CalendarDays, Star } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { Event } from "@prisma/client"
import { useRouter } from "next/navigation"

interface EventCardProps {
  event: Event
  isPast?: boolean
  serverId?: string
  onClick?: (e: React.MouseEvent) => void
}

export function EventCard({ event, isPast = false, serverId, onClick }: EventCardProps) {
  console.log("serverId", serverId)
  console.log("eventId", event.id)
  const router = useRouter()
  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md h-full ${event.isExclusive ? "border-primary/50" : ""}`}
      onClick={onClick}
    >
      <div className="relative flex h-full w-full flex-col items-start justify-start">
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
        </div>
      </div>
    </Card>
  )
}


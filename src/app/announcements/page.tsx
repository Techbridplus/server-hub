import { AnnouncementCard } from "@/components/announcement-card"
import { Announcement } from "@prisma/client";
import axios from "axios"

interface AnnouncementWithAuthor extends Announcement {
  author: {
    id: string
    name: string
    image: string
  }
  _count: {
    likes: number
    comments: number
  }
}


export default async function AnnouncementsPage() {
  const { data: announcements } = await axios.get("/api/announcements");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Announcements</h1>
      <div className="space-y-6">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((announcement:AnnouncementWithAuthor) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>
    </div>
  )
} 
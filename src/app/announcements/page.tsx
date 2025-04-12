import { Suspense } from "react"
import { AnnouncementCard } from "@/components/announcement-card"
import { prisma } from "@/lib/prisma"

async function getAnnouncements() {
  const announcements = await prisma.announcement.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return announcements
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Announcements</h1>
      <div className="space-y-6">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>
    </div>
  )
} 
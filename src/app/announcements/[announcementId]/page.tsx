import { notFound } from "next/navigation"
import { AnnouncementCard } from "@/components/announcement-card"
import { prisma } from "@/lib/prisma"

interface AnnouncementPageProps {
  params: {
    announcementId: string
  }
}

async function getAnnouncement(announcementId: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  if (!announcement) {
    notFound()
  }

  return announcement
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const announcement = await getAnnouncement(params.announcementId)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <AnnouncementCard announcement={announcement} />
      </div>
    </div>
  )
}
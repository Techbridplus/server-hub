import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { AddChannelDialog } from "@/components/add-channel-dialog"
import { ManageGroupMembersDialog } from "@/components/manage-group-members-dialog"
import { ChatInterface } from "@/components/chat-interface"

interface GroupPageProps {
  params: {
    groupId: string
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return notFound()
  }

  // Fetch group data
  const group = await prisma.group.findUnique({
    where: {
      id: params.groupId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      channels: {
        orderBy: [
          { type: "asc" }, // Text channels first, then voice
          { name: "asc" }, // Alphabetical by name
        ],
      },
      server: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!group) {
    return notFound()
  }

  // Check if user is a member of the group
  const isMember = group.members.some((member) => member.user.id === userId)

  if (!isMember && group.isPrivate) {
    return notFound()
  }

  // Check if user is an admin
  const isAdmin = group.members.some(
    (member) => member.user.id === userId && (member.role === "admin" || member.role === "moderator"),
  )

  // Get the default channel (usually "general")
  const defaultChannel = group.channels.find((channel) => channel.name === "general") || group.channels[0]

  return (
    <div className="flex h-full flex-col md:flex-row">
      <ChatInterface group={group} currentUserId={userId} isAdmin={isAdmin} defaultChannelId={defaultChannel?.id} />

      {isAdmin && (
        <>
          <AddChannelDialog groupId={group.id} serverId={group.server.id} />
          <ManageGroupMembersDialog
            groupId={group.id}
            serverId={group.server.id}
            members={group.members}
            isOwner={group.owner.id === userId}
          />
        </>
      )}
    </div>
  )
}


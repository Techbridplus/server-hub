"use client"

import { useState } from "react"
import { Users, Search, Shield, UserMinus, UserCheck, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ServerMember } from "@prisma/client"

interface MembersDialogProps {
  serverId: string
}

export function MembersDialog({ serverId }: MembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for demonstration
  const members = [
    { id: "1", name: "JohnDoe", status: "online", role: "admin", joinedDate: "3 months ago" },
    { id: "2", name: "JaneSmith", status: "online", role: "moderator", joinedDate: "2 months ago" },
    { id: "3", name: "BobJohnson", status: "offline", role: "member", joinedDate: "1 month ago" },
    { id: "4", name: "AliceWilliams", status: "online", role: "member", joinedDate: "3 weeks ago" },
    { id: "5", name: "CharlieBrown", status: "idle", role: "member", joinedDate: "2 weeks ago" },
    { id: "6", name: "DavidMiller", status: "online", role: "member", joinedDate: "1 week ago" },
    { id: "7", name: "EvaGreen", status: "offline", role: "member", joinedDate: "5 days ago" },
    { id: "8", name: "FrankWhite", status: "online", role: "member", joinedDate: "3 days ago" },
  ]

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handlePromoteToModerator = (memberId: string) => {
    // In a real app, you would call an API to promote the member
    alert(`Promoted member ${memberId} to moderator`)
  }

  const handleRemoveModerator = (memberId: string) => {
    // In a real app, you would call an API to remove moderator status
    alert(`Removed moderator status from member ${memberId}`)
  }

  const handleKickMember = (memberId: string) => {
    // In a real app, you would call an API to kick the member
    alert(`Kicked member ${memberId} from the server`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Server Members</DialogTitle>
          <DialogDescription>
            View and manage members of your server. Promote members to moderators or remove them from the server.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="moderators">Moderators</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      onPromote={handlePromoteToModerator}
                      onRemoveModerator={handleRemoveModerator}
                      onKick={handleKickMember}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="moderators">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredMembers
                    .filter((member) => member.role === "moderator")
                    .map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        onPromote={handlePromoteToModerator}
                        onRemoveModerator={handleRemoveModerator}
                        onKick={handleKickMember}
                      />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="online">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredMembers
                    .filter((member) => member.status === "online" || member.status === "idle")
                    .map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        onPromote={handlePromoteToModerator}
                        onRemoveModerator={handleRemoveModerator}
                        onKick={handleKickMember}
                      />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface MemberRowProps {
  member: {
    id: string
    name: string
    status: string
    role: string
    joinedDate: string
  }
  onPromote: (memberId: string) => void
  onRemoveModerator: (memberId: string) => void
  onKick: (memberId: string) => void
}

function MemberRow({ member, onPromote, onRemoveModerator, onKick }: MemberRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
          <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{member.name}</span>
            {member.role === "admin" && (
              <Badge variant="outline" className="border-amber-500 text-amber-500">
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            )}
            {member.role === "moderator" && (
              <Badge variant="outline" className="border-primary text-primary">
                <Shield className="mr-1 h-3 w-3" />
                Moderator
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Joined {member.joinedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  member.status === "online" ? "bg-green-500" : member.status === "idle" ? "bg-yellow-500" : "bg-muted"
                }`}
              />
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {member.role !== "admin" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role === "member" ? (
              <DropdownMenuItem onClick={() => onPromote(member.id)}>
                <Shield className="mr-2 h-4 w-4" />
                Make Moderator
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onRemoveModerator(member.id)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Remove Moderator
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onKick(member.id)} className="text-destructive focus:text-destructive">
              <UserMinus className="mr-2 h-4 w-4" />
              Kick from Server
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}


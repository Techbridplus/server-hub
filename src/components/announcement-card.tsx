"use client"

import { useState } from "react"
import { Heart, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CommentSection } from "@/components/comment-section"
import { ShareDialog } from "@/components/share-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface AnnouncementCardProps {
  announcement: {
    id: string
    title: string
    content: string
    author: string
    date: string
    comments: number
    reactions: number
    isImportant: boolean
  }
  canEdit?: boolean
  serverId?: string
}

export function AnnouncementCard({ announcement, canEdit = false, serverId }: AnnouncementCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(announcement.reactions)
  const [showComments, setShowComments] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(announcement.title)
  const [editContent, setEditContent] = useState(announcement.content)
  const [editIsImportant, setEditIsImportant] = useState(announcement.isImportant)
  const [isEditing, setIsEditing] = useState(false)

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const handleEdit = () => {
    setIsEditing(true)

    // Simulate API call
    setTimeout(() => {
      setIsEditing(false)
      setShowEditDialog(false)

      // In a real app, you would update the announcement in the database
      // For now, we'll just update the local state
      announcement.title = editTitle
      announcement.content = editContent
      announcement.isImportant = editIsImportant

      // Show success message
      alert("Announcement updated successfully!")
    }, 1000)
  }

  const handleDelete = () => {
    // In a real app, you would delete the announcement from the database
    // For now, we'll just show a success message
    alert("Announcement deleted successfully!")
    setShowDeleteDialog(false)
  }

  return (
    <Card className={announcement.isImportant ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={announcement.author} />
              <AvatarFallback>{announcement.author.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{announcement.title}</h3>
                {announcement.isImportant && (
                  <Badge variant="outline" className="border-destructive text-destructive">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Important
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{announcement.author}</span>
                <span>•</span>
                <span>{announcement.date}</span>
              </div>
            </div>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild onClick={() => setShowEditDialog(true)}>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                <AlertDialogTrigger asChild onClick={() => setShowDeleteDialog(true)}>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p>{announcement.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex w-full justify-between">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${liked ? "text-red-500" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={toggleComments}>
              <MessageSquare className="h-4 w-4" />
              <span>{announcement.comments}</span>
              {showComments ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
            </Button>
          </div>
          <ShareDialog
            title={announcement.title}
            url={serverId ? `/server/${serverId}/announcement/${announcement.id}` : `/announcement/${announcement.id}`}
            type="announcement"
          />
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <CommentSection resourceId={announcement.id} resourceType="announcement" />
          </div>
        )}
      </CardFooter>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Make changes to your announcement.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Announcement Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your announcement"
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="edit-important" checked={editIsImportant} onCheckedChange={setEditIsImportant} />
              <Label htmlFor="edit-important">Mark as important</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isEditing}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement and remove it from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}


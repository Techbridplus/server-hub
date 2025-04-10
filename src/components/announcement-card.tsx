"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, MoreHorizontal, Edit, Trash, MessageCircle, Send } from "lucide-react"
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
import { Announcement } from "@prisma/client"
import { formatDistanceToNow, isValid } from "date-fns"
import { useSession } from "next-auth/react"

// Extend the Announcement type with additional fields


interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
}

interface Author {
  id: string
  name: string
  image: string | null
}

interface AnnouncementCardProps {
  id: string
  title: string
  content: string
  isImportant: boolean
  createdAt: string
  author: Author | string | null
  canEdit?: boolean
  serverId?: string
}

export function AnnouncementCard({
  id,
  title,
  content,
  isImportant,
  createdAt,
  author,
  canEdit = false,
  serverId,
}: AnnouncementCardProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [editIsImportant, setEditIsImportant] = useState(isImportant)
  const [isEditing, setIsEditing] = useState(false)

  // Handle author information safely
  const authorName = typeof author === 'string' 
    ? author 
    : author?.name || 'Unknown User'
  const authorImage = typeof author === 'string' 
    ? null 
    : author?.image || null

  // Safely format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isValid(date) 
      ? formatDistanceToNow(date, { addSuffix: true }) 
      : 'Unknown date'
  }

  useEffect(() => {
    if (id) {
      fetchLikes()
      fetchComments()
    }
  }, [id])

  const fetchLikes = async () => {
    if (!id) return;
    
    try {
      console.log(`Fetching likes for announcement: ${id}`);
      const response = await fetch(`/api/announcements/${id}/likes`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching likes:", errorData);
        return;
      }
      
      const data = await response.json();
      console.log("Likes data:", data);
      setLiked(data.userLiked);
      setLikeCount(data.count);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }

  const fetchComments = async () => {
    if (!id) return;
    
    try {
      console.log(`Fetching comments for announcement: ${id}`);
      const response = await fetch(`/api/announcements/${id}/comments`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching comments:", errorData);
        return;
      }
      
      const data = await response.json();
      console.log("Comments data:", data);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  }

  const handleLike = async () => {
    if (!session?.user || !id) {
      console.log("Cannot like: No session or ID", { session, id });
      return;
    }

    // Optimistic update
    setIsLiking(true);
    const previousLiked = liked;
    const previousCount = likeCount;
    
    // Update UI immediately
    setLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      console.log(`Toggling like for announcement: ${id}`);
      const response = await fetch(`/api/announcements/${id}/likes`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error toggling like:", errorData);
        // Revert optimistic update on error
        setLiked(previousLiked);
        setLikeCount(previousCount);
        return;
      }
      
      const data = await response.json();
      console.log("Like toggle response:", data);
      
      // Only update if the server response differs from our optimistic update
      if (data.liked !== !previousLiked) {
        setLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newComment.trim() || !id) {
      console.log("Cannot comment: No session, empty comment, or no ID", { 
        session, 
        commentLength: newComment.length, 
        id 
      });
      return;
    }

    // Optimistic update
    setIsSubmittingComment(true);
    const commentText = newComment;
    setNewComment("");
    
    // Create a temporary comment object
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content: commentText,
      createdAt: new Date().toISOString(),
      user: {
        id: session.user.id,
        name: session.user.name || "User",
        image: session.user.image || null,
      }
    };
    
    // Add the temporary comment to the UI
    setComments([tempComment, ...comments]);

    try {
      console.log(`Adding comment to announcement: ${id}`);
      const response = await fetch(`/api/announcements/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding comment:", errorData);
        // Remove the temporary comment on error
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== tempComment.id)
        );
        // Restore the comment text
        setNewComment(commentText);
        return;
      }
      
      const data = await response.json();
      console.log("Comment response:", data);
      
      if (data.comment) {
        // Replace the temporary comment with the real one
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === tempComment.id ? data.comment : comment
          )
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Remove the temporary comment on error
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== tempComment.id)
      );
      // Restore the comment text
      setNewComment(commentText);
    } finally {
      setIsSubmittingComment(false);
    }
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
      // Assuming you have a way to update the announcement in the database
      // This is a placeholder and should be replaced with actual database update logic
    }, 1000)
  }

  const handleDelete = () => {
    // In a real app, you would delete the announcement from the database
    // For now, we'll just show a success message
    alert("Announcement deleted successfully!")
    setShowDeleteDialog(false)
  }

  return (
    <Card className={`mb-4 ${isImportant ? "border-red-500" : ""}`}>
      <CardHeader className="flex flex-row items-center space-x-4">
        <Avatar>
          <AvatarImage src={authorImage || undefined} />
          <AvatarFallback>{authorName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            {authorName} • {formatDate(createdAt)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{content}</p>
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-2 ${liked ? "text-red-500" : ""}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
            {isLiking && <span className="ml-1 text-xs">...</span>}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
          </Button>
        </div>
        <div className="space-y-4">
          <form onSubmit={handleComment} className="flex space-x-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmittingComment}
            />
            <Button type="submit" size="icon" disabled={isSubmittingComment || !newComment.trim()}>
              {isSubmittingComment ? (
                <span className="h-4 w-4 animate-spin">...</span>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{comment.user.name}</p>
                  <p className="text-sm text-gray-500">{comment.content}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex w-full justify-between">
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={toggleComments}>
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length}</span>
              {showComments ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
            </Button>
          </div>
          <ShareDialog
            title={title}
            url={serverId ? `/server/${serverId}/announcement/${id}` : `/announcement/${id}`}
            type="announcement"
          />
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <CommentSection resourceId={id} resourceType="announcement" />
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


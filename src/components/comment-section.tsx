"use client"

import { useState, useEffect } from "react"
import { Send, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

interface CommentSectionProps {
  resourceId: string
  resourceType: "event" | "announcement" | "post"
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  likes: number
  isLiked: boolean
  author: {
    id: string
    name: string
    image: string
  }
  replies?: Comment[]
}

export function CommentSection({ resourceId, resourceType }: CommentSectionProps) {
  const { data: session } = useSession()
  const [newComment, setNewComment] = useState("")
  const [showAllComments, setShowAllComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch comments from the server
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/${resourceType}s/${resourceId}/comments`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments')
        }
        
        const data = await response.json()
        setComments(data.comments || [])
      } catch (error) {
        console.error('Error fetching comments:', error)
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [resourceId, resourceType])

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user) return
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/${resourceType}s/${resourceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add comment')
      }
      
      const newCommentData = await response.json()
      
      // Add the new comment to the state
      setComments(prevComments => [newCommentData, ...prevComments])
      setNewComment("")
      
      toast({
        title: "Success",
        description: "Your comment has been added.",
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments.",
        variant: "destructive",
      })
      return
    }
    
    try {
      const response = await fetch(`/api/${resourceType}s/${resourceId}/comments/${commentId}/like`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to like comment')
      }
      
      const updatedComment = await response.json()
      
      // Update the comment in the state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likes: updatedComment.likes, 
                isLiked: updatedComment.isLiked 
              } 
            : comment
        )
      )
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        title: "Error",
        description: "Failed to like the comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get visible comments based on showAllComments state
  const visibleComments = showAllComments ? comments : comments.slice(0, 5)

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Comments ({comments.length})</h2>

        {session?.user ? (
          <div className="mb-6 flex gap-3">
            <Avatar>
              <AvatarImage src={session.user.image || "/placeholder.svg"} />
              <AvatarFallback>{session.user.name?.substring(0, 2).toUpperCase() || "YO"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-md bg-muted p-4 text-center text-sm">
            Please sign in to leave a comment.
          </div>
        )}

        <Separator className="my-6" />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.author.image || "/placeholder.svg"} />
                    <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.content}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("flex h-auto items-center gap-1 p-0 text-xs", comment.isLiked && "text-primary")}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp className={cn("h-3.5 w-3.5", comment.isLiked && "fill-primary")} />
                        <span>{comment.likes}</span>
                      </Button>
                      {session?.user && (
                        <Button variant="ghost" size="sm" className="flex h-auto items-center gap-1 p-0 text-xs">
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={reply.author.image || "/placeholder.svg"} />
                          <AvatarFallback>{reply.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{reply.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{reply.content}</p>
                          <div className="mt-2 flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "flex h-auto items-center gap-1 p-0 text-xs",
                                reply.isLiked && "text-primary",
                              )}
                              onClick={() => handleLikeComment(reply.id)}
                            >
                              <ThumbsUp className={cn("h-3.5 w-3.5", reply.isLiked && "fill-primary")} />
                              <span>{reply.likes}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {comments.length > 5 && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllComments(!showAllComments)}
                >
                  {showAllComments ? "Show Less" : `Load More (${comments.length - 5} more)`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


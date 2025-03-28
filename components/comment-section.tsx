"use client"

import { useState } from "react"
import { Send, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface CommentSectionProps {
  resourceId: string
  resourceType: "event" | "announcement" | "post"
}

interface Comment {
  id: string
  author: {
    id: string
    name: string
    imageUrl: string
  }
  content: string
  timestamp: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

export function CommentSection({ resourceId, resourceType }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        id: "1",
        name: "JohnDoe",
        imageUrl: "/placeholder.svg?height=40&width=40",
      },
      content: "Looking forward to this event! Who else is joining?",
      timestamp: "2 hours ago",
      likes: 5,
      isLiked: false,
    },
    {
      id: "2",
      author: {
        id: "2",
        name: "JaneSmith",
        imageUrl: "/placeholder.svg?height=40&width=40",
      },
      content: "I'll be there! Can't wait to meet everyone.",
      timestamp: "1 hour ago",
      likes: 3,
      isLiked: true,
      replies: [
        {
          id: "3",
          author: {
            id: "1",
            name: "JohnDoe",
            imageUrl: "/placeholder.svg?height=40&width=40",
          },
          content: "Awesome! See you there!",
          timestamp: "45 minutes ago",
          likes: 1,
          isLiked: false,
        },
      ],
    },
  ])

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        author: {
          id: "current-user",
          name: "You",
          imageUrl: "/placeholder.svg?height=40&width=40",
        },
        content: newComment,
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          }
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked,
                }
              }
              return reply
            }),
          }
        }
        return comment
      }),
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Comments ({comments.length})</h2>

        <div className="mb-6 flex gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>YO</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Comment
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={comment.author.imageUrl} />
                  <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
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
                    <Button variant="ghost" size="sm" className="flex h-auto items-center gap-1 p-0 text-xs">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={reply.author.imageUrl} />
                        <AvatarFallback>{reply.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
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
        </div>
      </div>
    </div>
  )
}


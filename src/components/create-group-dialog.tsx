"use client"

import type React from "react"

import { useState } from "react"
import { Users, Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
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

interface CreateGroupDialogProps {
  serverId: string
  buttonSize?: "default" | "sm"
}

export function CreateGroupDialog({ serverId, buttonSize = "default" }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setOpen(false)

      // Reset form
      setName("")
      setDescription("")
      setIsPrivate(false)
      setImagePreview(null)

      // Show success message
      alert("Group created successfully!")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={buttonSize}>
          <Users className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
            <DialogDescription>Create a new group for members with similar interests.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this group"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Group Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                  {imagePreview ? (
                    <div className="group relative h-full w-full">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Group image preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setImagePreview(null)}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Group Image</p>
                  <p className="text-xs text-muted-foreground">Upload an image to represent your group.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label htmlFor="private">Make this group private (invitation only)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


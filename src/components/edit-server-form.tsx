"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Loader2, Save, Trash, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface EditServerFormProps {
  serverId: string
  onSave: () => void
}

export function EditServerForm({ serverId, onSave }: EditServerFormProps) {
  // Mock data for demonstration
  const [server, setServer] = useState({
    id: serverId,
    name: "Gaming Hub",
    description:
      "A community for gamers to connect, share tips, and organize gaming events. Join us for tournaments, game nights, and discussions about the latest releases.",
    category: "gaming",
    isExclusive: true,
    bannerUrl: "/placeholder.svg?height=300&width=1200",
    logoUrl: "/placeholder.svg?height=100&width=100",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Server updated",
        description: "Your server has been updated successfully.",
      })
      onSave()
    }, 1000)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setServer({
      ...server,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Server Information</CardTitle>
          <CardDescription>Update your server's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Server Name</Label>
            <Input id="name" value={server.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={server.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={server.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="exclusive"
              checked={server.isExclusive}
              onCheckedChange={(checked) => handleChange("isExclusive", checked)}
            />
            <Label htmlFor="exclusive">Make this server exclusive</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server Media</CardTitle>
          <CardDescription>Update your server's banner and logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Server Banner</Label>
            <div className="relative h-[200px] w-full overflow-hidden rounded-lg border">
              <Image src={server.bannerUrl || "/placeholder.svg"} alt="Server banner" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Server Logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                <Image src={server.logoUrl || "/placeholder.svg"} alt="Server logo" fill className="object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Server Logo</p>
                <p className="text-xs text-muted-foreground">Recommended size: 100x100px</p>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4">
            <h3 className="text-sm font-medium text-destructive">Delete Server</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Once you delete a server, there is no going back. This action is permanent and will remove all content,
              members, and settings.
            </p>
            <Button variant="destructive" size="sm" className="mt-4">
              Delete Server
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onSave}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


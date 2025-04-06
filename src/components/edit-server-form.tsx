"use client"

import { useEffect, useState } from "react"
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
import axios from "axios"
import { Server } from "@prisma/client"

interface EditServerFormProps {
  serverId: string
  onSave: () => void
}

export function EditServerForm({ serverId, onSave }: EditServerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [ServerData, setServerData] = useState<Server | null>(null)
  const [originalServerData, setOriginalServerData] = useState<Server | null>(null)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const isDataEdited = JSON.stringify(ServerData) !== JSON.stringify(originalServerData)

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<Server>(`/api/servers/${serverId}`)
        const serverData = response.data
        setServerData(serverData)
        setOriginalServerData(serverData)
      } catch (error) {
        console.error("Error fetching server data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServerData()
  }, [serverId])

  const handleSave = () => {
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Server updated",
        description: "Your server has been updated successfully.",
      })
      onSave()
    }, 1000)
  }

  const handleChange = (field: keyof Server, value: string | boolean) => {
    setServerData((prev) => ({
      ...prev!,
      [field]: value,
    }))
  }

  const removeFileFromCloud = async (url: string) => {
    try {
      await axios.delete("/api/upload", { data: { url } });
    } catch (error) {
      console.error("Error removing file from cloud:", error);
      toast({
        title: "File removal failed",
        description: "There was an error removing the existing file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File, type: "banner" | "logo") => {
    if (type === "banner") {
      setIsUploadingBanner(true);
    } else {
      setIsUploadingLogo(true);
    }

    try {
      // Remove existing file from cloud
      const existingUrl = type === "banner" ? ServerData?.bannerUrl : ServerData?.imageUrl;
      if (existingUrl) {
        await removeFileFromCloud(existingUrl);
      }

      // Upload new file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type === "banner" ? "image" : "image");

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.url) {
        setServerData((prev) => ({
          ...prev!,
          [type === "banner" ? "bannerUrl" : "imageUrl"]: response.data.url,
        }));
        toast({
          title: "Upload successful",
          description: `The ${type} has been updated successfully.`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (type === "banner") {
        setIsUploadingBanner(false);
      } else {
        setIsUploadingLogo(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!ServerData) {
    return null
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
            <Label htmlFor="name">{ServerData?.name}</Label>
            <Input id="name" value={ServerData?.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{ServerData?.description}</Label>
            <Textarea
              id="description"
              value={ServerData?.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={ServerData.category} onValueChange={(value) => handleChange("category", value)}>
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
              checked={ServerData.isExclusive}
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
              <Image src={ServerData.bannerUrl || "/placeholder.svg"} alt="Server banner" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isUploadingBanner}
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleFileUpload(file, "banner")
                      }
                      input.click()
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    { isUploadingBanner ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Server Logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                <Image src={ServerData.imageUrl || "/placeholder.svg"} alt="Server logo" fill className="object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, "logo")
                    }
                    input.click()
                  }}
                >
                  <Camera className="h-6 w-6 text-white" />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Server Logo</p>
                <p className="text-xs text-muted-foreground">Recommended size: 100x100px</p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploadingLogo}
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = "image/*"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleFileUpload(file, "logo")
                    }
                    input.click()
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  { isUploadingLogo? "Uploading..." : "Upload"}
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
        <Button onClick={handleSave} disabled={isLoading || !isDataEdited}>
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


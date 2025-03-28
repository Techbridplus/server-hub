"use client"

import { useState } from "react"
import { Check, Copy, Facebook, Link, Share, Twitter } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ShareDialogProps {
  title: string
  url: string
  type: "server" | "event" | "announcement" | "group"
}

export function ShareDialog({ title, url, type }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const fullUrl = `https://server-hub.vercel.app${url}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const socialShareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=Check out this ${type}: ${title}&url=${encodeURIComponent(fullUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {type}</DialogTitle>
          <DialogDescription>Share this {type} with your friends and community</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={fullUrl} readOnly className="flex-1" />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-2 text-sm font-medium">Preview</div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10">
                  <div className="flex h-full w-full items-center justify-center">
                    <Link className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground">server-hub.vercel.app</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href={socialShareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <Twitter className="mb-2 h-6 w-6 text-[#1DA1F2]" />
                <span className="text-sm font-medium">Twitter</span>
              </a>
              <a
                href={socialShareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <Facebook className="mb-2 h-6 w-6 text-[#1877F2]" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>

            <Separator className="my-4" />

            <div className="text-center text-sm text-muted-foreground">Or copy the link and share it anywhere</div>

            <div className="mt-2 flex items-center space-x-2">
              <Input value={fullUrl} readOnly className="flex-1" />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


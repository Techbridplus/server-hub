"use client"

import type React from "react"

import { useState } from "react"
import { Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface PrivateServerAccessDialogProps {
  serverName: string
  onSubmit: (accessKey: string) => void
  onCancel: () => void
}

export function PrivateServerAccessDialog({ serverName, onSubmit, onCancel }: PrivateServerAccessDialogProps) {
  const [accessKey, setAccessKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (accessKey.trim() === "") {
        setError("Please enter an access key")
        return
      }
      onSubmit(accessKey)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault()
              onCancel()
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to servers
          </Link>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Private Server</h1>
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">{serverName}</span> is a private server. You need an access
            key to join.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-2">
            <Label htmlFor="accessKey">Access Key</Label>
            <Input
              id="accessKey"
              type="text"
              placeholder="Enter your access key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Access Server"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Don't have an access key? Contact the server administrator to request access.
        </p>
      </div>
    </div>
  )
}


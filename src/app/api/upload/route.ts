import { NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import { put } from "@vercel/blob"

// POST /api/upload - Upload a file
export async function POST(req: NextRequest) {
  return authMiddlewareAppRouter(req, async (req) => {
    try {
      const formData = await req.formData()
      const file = formData.get("file") as File
      const type = formData.get("type") as string

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // Validate file type
      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"]
      const allowedTypes = type === "image" ? allowedImageTypes : allowedVideoTypes

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` },
          { status: 400 }
        )
      }

      // Validate file size (5MB for images, 50MB for videos)
      const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large. Maximum size: ${type === "image" ? "5MB" : "50MB"}` },
          { status: 400 }
        )
      }

      // Generate a unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      })

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
      })
    } catch (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }
  })
}


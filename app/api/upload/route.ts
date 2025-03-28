import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter } from "@/lib/auth"
import { put } from "@vercel/blob"

// POST /api/upload - Upload a file
export async function POST(req: NextRequest) {
  return authMiddlewareAppRouter(req, async (req, session, prisma) => {
    try {
      const formData = await req.formData()
      const file = formData.get("file") as File
      const type = formData.get("type") as string // image, video, etc.

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // Validate file type
      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"]

      if (type === "image" && !allowedImageTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid image type. Allowed types: JPEG, PNG, GIF, WebP" }, { status: 400 })
      }

      if (type === "video" && !allowedVideoTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid video type. Allowed types: MP4, WebM, OGG" }, { status: 400 })
      }

      // Validate file size
      const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB for images, 50MB for videos
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
          },
          { status: 400 },
        )
      }

      // Generate a unique filename
      const filename = `${session.user.id}-${Date.now()}-${file.name}`
      const pathname = `${type}s/${filename}` // images/user-id-timestamp-filename.jpg

      // Upload to Vercel Blob
      const blob = await put(pathname, file, {
        access: "public",
        contentType: file.type,
      })

      return NextResponse.json({
        url: blob.url,
        size: blob.size,
        contentType: blob.contentType,
        pathname: blob.pathname,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }
  })
}


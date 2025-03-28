import { toast } from "@/components/ui/use-toast"

// API request timeout (in milliseconds)
const API_TIMEOUT = 30000

// CSRF token from meta tag
const getCsrfToken = (): string | null => {
  if (typeof document !== "undefined") {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    return metaTag ? metaTag.getAttribute("content") : null
  }
  return null
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 100 // Max requests per minute

const checkRateLimit = (endpoint: string): boolean => {
  const now = Date.now()
  const key = endpoint

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, timestamp: now })
    return true
  }

  const limit = rateLimitMap.get(key)!

  // Reset counter if window has passed
  if (now - limit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now })
    return true
  }

  // Check if rate limit exceeded
  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }

  // Increment counter
  limit.count++
  rateLimitMap.set(key, limit)
  return true
}

// Sanitize input data to prevent XSS
const sanitizeData = (data: any): any => {
  if (typeof data !== "object" || data === null) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item))
  }

  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      // Basic sanitization - remove script tags and other potentially harmful content
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "")
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Main API client function
export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Check rate limit
  if (!checkRateLimit(endpoint)) {
    toast({
      title: "Too many requests",
      description: "Please try again later",
      variant: "destructive",
    })
    throw new Error("Rate limit exceeded")
  }

  // Set up request options with security headers
  const csrfToken = getCsrfToken()
  const headers = new Headers(options.headers)

  // Add CSRF token if available
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken)
  }

  // Add content type if not set
  if (!headers.has("Content-Type") && options.method !== "GET" && options.body) {
    headers.set("Content-Type", "application/json")
  }

  // Add security headers
  headers.set("X-Requested-With", "XMLHttpRequest")

  // Create request with timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    // Sanitize request body if it exists
    let body = options.body
    if (body && typeof body === "string" && headers.get("Content-Type") === "application/json") {
      try {
        const parsedBody = JSON.parse(body)
        const sanitizedBody = sanitizeData(parsedBody)
        body = JSON.stringify(sanitizedBody)
      } catch (e) {
        // If parsing fails, use the original body
      }
    }

    // Make the request
    const response = await fetch(endpoint, {
      ...options,
      headers,
      body,
      credentials: "include", // Include cookies for authentication
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Handle common HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login if unauthorized
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin"
        }
        throw new Error("Unauthorized")
      }

      if (response.status === 403) {
        toast({
          title: "Access denied",
          description: "You don't have permission to perform this action",
          variant: "destructive",
        })
        throw new Error("Forbidden")
      }

      if (response.status === 429) {
        toast({
          title: "Too many requests",
          description: "Please try again later",
          variant: "destructive",
        })
        throw new Error("Rate limit exceeded")
      }

      // Try to parse error message from response
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Request failed with status ${response.status}`)
    }

    // Parse and sanitize response data
    const data = await response.json().catch(() => ({}))
    return sanitizeData(data) as T
  } catch (error: any) {
    clearTimeout(timeoutId)

    // Handle abort error (timeout)
    if (error.name === "AbortError") {
      toast({
        title: "Request timeout",
        description: "The server took too long to respond",
        variant: "destructive",
      })
      throw new Error("Request timeout")
    }

    // Re-throw other errors
    throw error
  }
}


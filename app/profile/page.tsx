"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Shield, Server, Group, Bell, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile")
    }
  }, [status, router])

  // Simulate loading
  useEffect(() => {
    if (status === "authenticated") {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [status])

  if (status === "loading" || isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-64 sm:mx-0" />
            <div className="mt-2 flex justify-center gap-2 sm:justify-start">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>

        <Skeleton className="mb-6 h-10 w-full" />

        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
          <AvatarFallback className="text-2xl">
            {session?.user?.name
              ? session.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
          <p className="text-muted-foreground">{session?.user?.email}</p>
          <div className="mt-2 flex justify-center gap-2 sm:justify-start">
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="servers">My Servers</TabsTrigger>
          <TabsTrigger value="groups">My Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={session?.user?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" defaultValue={session?.user?.name?.split(" ")[0] || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={session?.user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={session?.user?.name?.toLowerCase().replace(/\s/g, "") || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  rows={4}
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">January 1, 2023</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <Badge variant="outline" className="mt-1">
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <Badge variant="outline" className="mt-1">
                    Standard
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <Badge
                    variant="outline"
                    className="mt-1 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                  >
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Update Password</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Enhance your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch id="2fa" defaultChecked />
              </div>
              <Separator />
              <div>
                <p className="mb-2 font-medium">Backup Codes</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Save these backup codes in a secure place to use if you lose access to your authentication app
                </p>
                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <code key={i} className="rounded bg-muted p-1 text-center font-mono text-xs">
                      {Math.random().toString(36).substring(2, 8)}
                    </code>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  Download Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>Manage your connected accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Twitter</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Server Invites</p>
                    <p className="text-sm text-muted-foreground">Receive notifications for server invitations</p>
                  </div>
                  <Switch id="server-invites" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Event Reminders</p>
                    <p className="text-sm text-muted-foreground">Receive reminders for upcoming events</p>
                  </div>
                  <Switch id="event-reminders" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
                  </div>
                  <Switch id="marketing-emails" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                My Servers
              </CardTitle>
              <CardDescription>Manage servers you've created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Tech Enthusiasts"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Tech Enthusiasts</p>
                        <p className="text-xs text-muted-foreground">1,245 members</p>
                      </div>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Create New Server
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Group className="mr-2 h-5 w-5" />
                My Groups
              </CardTitle>
              <CardDescription>Manage groups you're a member of</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Web Development"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Web Development</p>
                        <p className="text-xs text-muted-foreground">Tech Enthusiasts Server</p>
                      </div>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        Leave
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src="/placeholder.svg?height=40&width=40"
                          alt="Mobile Development"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Mobile Development</p>
                        <p className="text-xs text-muted-foreground">Tech Enthusiasts Server</p>
                      </div>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        Leave
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


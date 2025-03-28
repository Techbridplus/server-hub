"use client"

import { useState } from "react"
import { Check, Lock, Moon, Bell, User, Shield, Sliders, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ThemeCustomizer } from "@/components/theme-customizer"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
              <TabsTrigger
                value="general"
                className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:font-medium"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:font-medium"
              >
                <Lock className="h-4 w-4 mr-2" />
                Privacy & Security
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:font-medium"
              >
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:font-medium"
              >
                <Sliders className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 space-y-4">
            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information visible to other users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="johndoe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      defaultValue="Software developer and gaming enthusiast."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Manage your email address and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="email-verified" defaultChecked />
                    <Label htmlFor="email-verified" className="flex items-center gap-2">
                      Email verified <Check className="h-4 w-4 text-green-500" />
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>Set your preferred language and regional settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc-8">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-12">UTC-12:00</SelectItem>
                        <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                        <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                        <SelectItem value="utc">UTC+00:00 (GMT)</SelectItem>
                        <SelectItem value="utc+1">UTC+01:00 (Central European Time)</SelectItem>
                        <SelectItem value="utc+8">UTC+08:00 (China Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how and when you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-events" className="flex-1">
                          Event invitations and updates
                        </Label>
                        <Switch id="email-events" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-announcements" className="flex-1">
                          Server announcements
                        </Label>
                        <Switch id="email-announcements" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-messages" className="flex-1">
                          Direct messages
                        </Label>
                        <Switch id="email-messages" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-marketing" className="flex-1">
                          Marketing and newsletters
                        </Label>
                        <Switch id="email-marketing" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Push Notifications</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-events" className="flex-1">
                          Event reminders
                        </Label>
                        <Switch id="push-events" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-announcements" className="flex-1">
                          Server announcements
                        </Label>
                        <Switch id="push-announcements" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-messages" className="flex-1">
                          Direct messages
                        </Label>
                        <Switch id="push-messages" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-mentions" className="flex-1">
                          Mentions and replies
                        </Label>
                        <Switch id="push-mentions" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Schedule</h3>
                    <div className="space-y-2">
                      <Label htmlFor="quiet-hours">Quiet Hours</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiet-start" className="text-xs">
                            Start Time
                          </Label>
                          <Select defaultValue="22">
                            <SelectTrigger id="quiet-start">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiet-end" className="text-xs">
                            End Time
                          </Label>
                          <Select defaultValue="7">
                            <SelectTrigger id="quiet-end">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy & Security Settings */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your profile and activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Profile Visibility</h3>
                    <RadioGroup defaultValue="friends">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="visibility-public" />
                        <Label htmlFor="visibility-public">Public - Anyone can view your profile</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="friends" id="visibility-friends" />
                        <Label htmlFor="visibility-friends">Friends - Only people you're connected with</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="visibility-private" />
                        <Label htmlFor="visibility-private">Private - Only you can view your profile</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Activity Status</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-online" className="flex-1">
                          Show when you're online
                        </Label>
                        <Switch id="show-online" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-activity" className="flex-1">
                          Show current activity
                        </Label>
                        <Switch id="show-activity" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Data Usage</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="data-analytics" className="flex-1">
                          Allow analytics collection
                        </Label>
                        <Switch id="data-analytics" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="data-personalization" className="flex-1">
                          Personalized recommendations
                        </Label>
                        <Switch id="data-personalization" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and authentication methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Password</h3>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                      </div>
                      <Switch id="enable-2fa" defaultChecked />
                    </div>
                    <Button variant="outline" size="sm">
                      Manage 2FA Settings
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Login Sessions</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">Windows • Chrome • New York, USA</p>
                          <p className="text-xs text-muted-foreground mt-1">Started 2 hours ago</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                          Active
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View All Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Customize the look and feel of your interface.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Color Theme</h3>
                    <RadioGroup defaultValue="system">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light" className="flex items-center gap-2">
                          Light
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark" className="flex items-center gap-2">
                          Dark <Moon className="h-4 w-4" />
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="theme-system" />
                        <Label htmlFor="theme-system">System preference</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Custom Theme</h3>
                    <ThemeCustomizer />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Font Size</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Small</span>
                        <span className="text-sm">Large</span>
                      </div>
                      <Slider defaultValue={[2]} max={4} step={1} className="w-full" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Interface Density</h3>
                    <RadioGroup defaultValue="comfortable">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compact" id="density-compact" />
                        <Label htmlFor="density-compact">Compact</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="density-comfortable" />
                        <Label htmlFor="density-comfortable">Comfortable</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                  <CardDescription>Adjust settings to improve your experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-motion" className="flex-1">
                      Reduce motion
                    </Label>
                    <Switch id="reduce-motion" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast" className="flex-1">
                      High contrast mode
                    </Label>
                    <Switch id="high-contrast" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Configure advanced options for your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Data Management</h3>
                    <div className="grid gap-3">
                      <Button variant="outline" className="justify-start">
                        Export Your Data
                      </Button>
                      <Button variant="outline" className="justify-start text-destructive hover:text-destructive">
                        Delete Search History
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">API Access</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="api-access" className="flex-1">
                          Enable API Access
                        </Label>
                        <Switch id="api-access" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Allow third-party applications to access your account data.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Manage API Keys
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Developer Options</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="debug-mode" className="flex-1">
                        Debug Mode
                      </Label>
                      <Switch id="debug-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="beta-features" className="flex-1">
                        Beta Features
                      </Label>
                      <Switch id="beta-features" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      Danger Zone <Shield className="h-4 w-4 text-destructive" />
                    </h3>
                    <div className="rounded-md border border-destructive/20 p-4">
                      <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}


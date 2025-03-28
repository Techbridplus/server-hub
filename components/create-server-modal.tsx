"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Upload, X } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(2, "Server name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.enum(["gaming", "technology", "creative", "education", "business", "other"]),
  isPrivate: z.boolean().default(false),
  banner: z.any().optional(),
  logo: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateServerModalProps {
  buttonText?: string
  className?: string
}

export function CreateServerModal({ buttonText = "Create Server", className = "" }: CreateServerModalProps) {
  const [open, setOpen] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "gaming",
      isPrivate: false,
    },
  })

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
        form.setValue("banner", file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        form.setValue("logo", file)
      }
      reader.readAsDataURL(file)
    }
  }

  function onSubmit(values: FormValues) {
    console.log("Form values:", values)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`${className}`}>
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create a new server</DialogTitle>
              <DialogDescription>
                Fill in the details below to create your server. You can customize it further after creation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label>Server Banner</Label>
              <div className="relative w-full overflow-hidden rounded-lg border" style={{ aspectRatio: '16/9' }}>
                {bannerPreview ? (
                  <div className="group relative h-full w-full">
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setBannerPreview(null)}>
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload banner image</span>
                      <span className="text-xs text-muted-foreground">Recommended: 2560x1440px (16:9)</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Server Logo (Optional)  <span className="text-xs text-muted-foreground">Recommended: 128x128px</span></Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border">
                  {logoPreview ? (
                    <div className="group relative h-full w-full">
                      <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setLogoPreview(null)}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-full w-full  cursor-pointer items-center justify-center hover:bg-muted/50 transition-colors">

                        <div className="rounded-full  bg-muted p-2">
                          <Upload className="h-full w-full text-muted-foreground" />
                        </div>

                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter server name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your server" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gaming" id="gaming" />
                        <Label htmlFor="gaming">Gaming</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="technology" id="technology" />
                        <Label htmlFor="technology">Technology</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="creative" id="creative" />
                        <Label htmlFor="creative">Creative</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="education" id="education" />
                        <Label htmlFor="education">Education</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business" id="business" />
                        <Label htmlFor="business">Business</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Make this server private</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit">Create Server</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


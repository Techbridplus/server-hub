import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditServerForm } from "@/components/edit-server-form"

export default function EditServerPage({ params }: { params: { serverId: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/server/${params.serverId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to server
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Edit Server</h1>
          <p className="text-muted-foreground">Customize your server's appearance and settings</p>
        </div>

        <EditServerForm
          serverId={params.serverId}
          onSave={() => (window.location.href = `/server/${params.serverId}`)}
        />
      </div>
    </div>
  )
}


"use client"

import { Home, DollarSign, Clock, CheckCheck } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotificationCard() {
  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <Button
          variant="ghost"
          className="text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Mark all as read</span>
        </Button>
      </CardHeader>

      <div className="py-3 px-6 bg-gray-50 border-b">
        <h3 className="text-gray-500 font-medium">Today</h3>
      </div>

      <CardContent className="p-0">
        <div className="border-b">
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Home className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h4 className="font-medium text-gray-800">Maintenance request update</h4>
                <span className="ml-auto text-gray-500 text-sm">5h ago</span>
              </div>
              <p className="text-gray-600">
                The maintenance request for <span className="font-medium">Tenant A</span> in{" "}
                <span className="font-medium">Apartment 301</span> has been{" "}
                <span className="text-emerald-600 font-medium">Completed</span>. The issue was a{" "}
                <span className="font-medium">leaking faucet in the kitchen</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="border-b bg-emerald-50">
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h4 className="font-medium text-gray-800">Rent Payment Confirmation</h4>
                <span className="ml-auto text-gray-500 text-sm">7h ago</span>
              </div>
              <p className="text-gray-600">
                We have received the rent payment of <span className="font-medium">$1,200</span> for{" "}
                <span className="font-medium">Tenant B</span> in <span className="font-medium">Apartment 102</span>. The
                payment was processed <span className="text-emerald-600 font-medium">successfully</span>.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h4 className="font-medium text-gray-800">Lease Renewal Reminder</h4>
                <span className="ml-auto text-gray-500 text-sm">7h ago</span>
              </div>
              <p className="text-gray-600">
                The lease for <span className="font-medium">Tenant C</span> in{" "}
                <span className="font-medium">Apartment 308</span> is set to{" "}
                <span className="text-red-600 font-medium">expire on October 15, 2023</span>. Please take appropriate
                action to initiate lease renewal discussions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t py-4 px-6">
        <Button variant="ghost" className="w-full text-gray-700 hover:bg-gray-100">
          View all notifications
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import type { UIPanelItem } from "@/hooks/use-dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Heart, Mail } from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"

interface DashboardProps {
  summary?: string
  items: UIPanelItem[]
}

export function Dashboard({ summary, items }: DashboardProps) {
  const { dashboard } = useDashboard()

  if (dashboard.workflowMode === "coverage-workspace") {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg text-[#999] mb-2">Coverage Workspace</div>
          <div className="text-sm text-[#999]">Loading candidate employees...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-8 p-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-normal text-[#333] mb-1">Welcome Back, Hunter!</h1>
      </div>

      {/* Employee Tasks Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-[#555]" />
          <h2 className="text-lg font-medium text-[#333]">Employee Tasks</h2>
          <span className="text-sm text-[#999]">(5)</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Happy Monday Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium text-[#333]">Happy Monday</h3>
                <p className="text-sm text-[#999] mt-1">Today</p>
              </div>
              <span className="px-2 py-1 bg-[#FEF3C7] text-[#F59E0B] text-xs font-medium rounded">New</span>
            </div>

            <div className="aspect-video rounded-md overflow-hidden bg-[#F3F4F6]">
              <img
                src="/placeholder.svg?height=200&width=350"
                alt="Team meeting"
                className="w-full h-full object-cover"
              />
            </div>

            <Button
              variant="outline"
              className="w-full rounded-full border-[#DADCE0] text-[#555] hover:bg-[#F9FAFB] font-normal bg-transparent"
            >
              Chat with Olivia
            </Button>
          </div>

          {/* Menu Update Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium text-[#333]">Menu Update</h3>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-sm text-[#999]">Today</p>
                  <Mail className="w-3 h-3 text-[#999]" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-1">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Olivia" />
                <AvatarFallback className="bg-[#0EA5E9] text-white">O</AvatarFallback>
              </Avatar>
              <p className="text-sm text-[#555] leading-relaxed">
                Hi Hunter! We are excited to announce a new menu item, just in time for fall festivities.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-full border-[#DADCE0] text-[#555] hover:bg-[#F9FAFB] font-normal bg-transparent"
            >
              Chat with Olivia
            </Button>
          </div>

          {/* Q4 2022 Check-In Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium text-[#333]">Q4 2022 Check-In</h3>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-sm text-[#999]">Today</p>
                  <Mail className="w-3 h-3 text-[#999]" />
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#333]">A Simple PDF File</p>
                <p className="text-xs text-[#999] mt-1">This is a small demonstration .pdf file...</p>
              </div>
              <div className="text-[#999]">›</div>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-full border-[#DADCE0] text-[#555] hover:bg-[#F9FAFB] font-normal bg-transparent"
            >
              Chat with Olivia
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Care Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#555]" />
          <h2 className="text-lg font-medium text-[#333]">Employee Care</h2>
          <span className="text-sm text-[#999]">(5)</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Andy Anderson Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                <span className="text-lg text-[#999]">?</span>
              </div>
              <h3 className="text-base font-medium text-[#333]">Unknown Topic</h3>
            </div>
            <p className="text-sm text-[#555]">Andy Anderson</p>
          </div>

          {/* Bryan Lowe Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                <span className="text-lg text-[#999]">?</span>
              </div>
              <h3 className="text-base font-medium text-[#333]">Unknown Topic</h3>
            </div>
            <p className="text-sm text-[#555]">Bryan Lowe</p>
          </div>

          {/* Lily Wesley Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                <span className="text-lg text-[#999]">?</span>
              </div>
              <h3 className="text-base font-medium text-[#333]">Unknown Topic</h3>
            </div>
            <p className="text-sm text-[#555]">Lily Wesley</p>
          </div>
        </div>
      </div>
    </div>
  )
}

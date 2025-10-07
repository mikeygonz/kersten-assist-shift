"use client"

import { Calendar, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ShiftTask {
  id: string
  date: string
  startTime: string
  endTime: string
  location: string
  role: string
  employeeName: string
  employeeRole: string
  reason: string
  status?: "pending" | "accepted" | "declined" | "finding_coverage"
}

interface ShiftTaskCardProps {
  task: ShiftTask
  onAction?: (action: "accept" | "decline" | "find_coverage", taskId: string) => void
  isInteractive?: boolean
  onYes?: () => void
  onNo?: () => void
}

export function ShiftTaskCard({ task, onAction, isInteractive = true, onYes, onNo }: ShiftTaskCardProps) {
  const handleYes = () => {
    onYes?.()
  }

  const handleNo = () => {
    onNo?.()
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wide">SHIFT SWAP</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-[#9CA3AF] mt-0.5 flex-shrink-0" />
            <span className="text-2xl font-normal text-[#374151]">{task.date}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#FEF3C7] px-3 py-1 rounded-md">
            <svg className="h-4 w-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-[#D97706]">Coverage Needed</span>
          </div>
        </div>

        <div className="mt-2 ml-7">
          <span className="text-xl text-[#6B7280]">
            {task.startTime} - {task.endTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-[#F3F4F6] px-3 py-2 rounded-lg">
          <MapPin className="h-4 w-4 text-[#9CA3AF]" />
          <span className="text-sm text-[#6B7280]">{task.location}</span>
        </div>
        <div className="bg-[#F3F4F6] px-3 py-2 rounded-lg">
          <span className="text-sm text-[#6B7280]">{task.role}</span>
        </div>
      </div>

      <div className="border-t border-[#E5E7EB] my-4" />

      <div>
        <h4 className="text-lg text-[#374151] mb-4">Coverage needed for:</h4>

        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#5EEAD4] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-white">
              {task.employeeName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-[#111827]">{task.employeeName}</div>
            <div className="text-sm text-[#9CA3AF] mt-0.5">{task.employeeRole}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 ml-[52px]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-[#9CA3AF] rounded-full" />
            <span className="text-sm text-[#6B7280]">{task.reason}</span>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <span>View</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isInteractive && (
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleNo}
            className="flex-1 rounded-full border-[#DADCE0] text-[#555] hover:bg-[#F9FAFB] font-normal bg-white h-12"
          >
            No
          </Button>
          <Button
            onClick={handleYes}
            className="flex-1 rounded-full bg-[#25C9D0] hover:bg-[#1FB5BD] text-white font-normal h-12"
          >
            Yes
          </Button>
        </div>
      )}
    </div>
  )
}

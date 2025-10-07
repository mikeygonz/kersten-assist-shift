"use client"

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShiftScheduleDashboardProps {
  shiftId?: string
}

export function ShiftScheduleDashboard({ shiftId }: ShiftScheduleDashboardProps) {
  // Mock data for the schedule view
  const shifts = [
    { id: 1, name: "RB", color: "bg-[#5EEAD4]", time: "8:30am - 12:30pm", type: "Morning", needsCoverage: true },
    { id: 2, name: "JC", color: "bg-[#5EEAD4]", time: "8:30am - 12:30pm", type: "Morning" },
    { id: 3, name: "HM", color: "bg-[#5EEAD4]", time: "8:30am - 12:30pm", type: "Morning" },
    { id: 4, name: "DJ", color: "bg-[#F9A8D4]", time: "8:30am - 4:30pm", type: "All-Day" },
    { id: 5, name: "SH", color: "bg-[#F9A8D4]", time: "8:30am - 4:30pm", type: "All-Day" },
    { id: 6, name: "NK", color: "bg-[#F9A8D4]", time: "8:30am - 4:30pm", type: "All-Day" },
    { id: 7, name: "LP", color: "bg-[#C4B5FD]", time: "12:30pm - 5:30pm", type: "Afternoon" },
  ]

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-[#1F2937]">Shift Schedule</h1>
          <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#374151]">
            <MapPin className="h-4 w-4 mr-2" />
            1234 East Street Rd.
          </Button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="text-xs text-[#6B7280] uppercase tracking-wide">Tuesday</div>
            <div className="text-sm font-medium text-[#1F2937]">November 4, 2025</div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Shift List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {/* Morning Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-[#6B7280] uppercase tracking-wide px-2">Morning</h3>
          {shifts.filter(s => s.type === "Morning").map((shift) => (
            <div
              key={shift.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                shift.needsCoverage
                  ? "border-[#FCD34D] bg-[#FFFBEB]"
                  : "border-[#25C9D0] bg-[#F0FDFD]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${shift.color} flex items-center justify-center`}>
                  <span className="text-sm font-semibold text-white">{shift.name}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#1F2937]">{shift.type}</div>
                  <div className="text-xs text-[#6B7280]">{shift.time}</div>
                </div>
              </div>
              {shift.needsCoverage && (
                <div className="flex items-center gap-1 text-xs font-medium text-[#F59E0B]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* All-Day Section */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-medium text-[#6B7280] uppercase tracking-wide px-2">All-Day</h3>
          {shifts.filter(s => s.type === "All-Day").map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between p-3 rounded-lg border border-transparent bg-[#FCE7F3]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${shift.color} flex items-center justify-center`}>
                  <span className="text-sm font-semibold text-white">{shift.name}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#1F2937]">{shift.type}</div>
                  <div className="text-xs text-[#6B7280]">{shift.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Afternoon Section */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-medium text-[#6B7280] uppercase tracking-wide px-2">Afternoon</h3>
          {shifts.filter(s => s.type === "Afternoon").map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between p-3 rounded-lg border border-transparent bg-[#EDE9FE]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${shift.color} flex items-center justify-center`}>
                  <span className="text-sm font-semibold text-white">{shift.name}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#1F2937]">{shift.type}</div>
                  <div className="text-xs text-[#6B7280]">{shift.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Swap Detail Card (Right Side) */}
      <div className="border-t border-[#E5E7EB] p-4 bg-[#F9FAFB]">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Shift Swap</h3>
            <span className="flex items-center gap-1 px-2 py-1 bg-[#FEF3C7] text-[#F59E0B] text-xs font-medium rounded">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Coverage Needed
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Date</span>
              <span className="text-[#1F2937] font-medium">Tuesday, November 4, 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Time</span>
              <span className="text-[#1F2937] font-medium">8:30am - 12:30pm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Location</span>
              <span className="text-[#1F2937] font-medium">1234 East Street Rd.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Role</span>
              <span className="text-[#1F2937] font-medium">Drive-Thru</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <h4 className="text-sm font-medium text-[#374151] mb-2">Coverage needed for:</h4>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#5EEAD4] flex items-center justify-center">
                <span className="text-xs font-semibold text-white">RB</span>
              </div>
              <div>
                <div className="text-sm font-medium text-[#1F2937]">Reyna Benson</div>
                <div className="text-xs text-[#6B7280]">Crew Member</div>
              </div>
            </div>
            <p className="text-xs text-[#6B7280] mt-2">• Daughter's doctor appointment conflict</p>
          </div>
        </div>
      </div>
    </div>
  )
}

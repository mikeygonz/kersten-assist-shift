"use client"

import { ParadoxLogo } from "./ui/logo"
import { GripIcon, LogOutIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { DropdownMenu } from "./ui/dropdown-menu"
import { useDashboard } from "@/hooks/use-dashboard"
import { useCallback } from "react"
import { useChatHistory } from "@/hooks/use-chat-history"

export function Header() {
  const { setDashboard } = useDashboard()
  const { isLoaded, createChat, selectChat, currentChat } = useChatHistory()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "DELETE",
      })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleNewChat = useCallback(() => {
    console.log("[v0] handleNewChat called from header")

    // Reset dashboard state
    setDashboard((dashboard) => ({
      ...dashboard,
      isVisible: false,
    }))

    if (!isLoaded) {
      console.log("[v0] Chat history not loaded yet")
      return
    }

    const newId = createChat({
      title: "New chat",
      modelId: currentChat?.modelId,
      initialMessages: [],
    })

    if (newId) {
      console.log("[v0] Created new chat with ID:", newId)
      selectChat(newId)
    }
  }, [createChat, currentChat?.modelId, isLoaded, selectChat, setDashboard])

  return (
    <header className="w-full bg-white border-b border-[#DADCE0]">
      <div className="flex justify-between items-center px-3 pr-4 py-3">
        {/* Left section with logo and nav */}
        <div className="flex items-center gap-6">
          <Button variant="outline">
            <GripIcon className="w-4 h-4 text-earl-grey" />
            <span className="text-button font-semibold">All Apps</span>
          </Button>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-6 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Start new chat"
            type="button"
          >
            <ParadoxLogo />
          </button>
        </div>

        {/* Right section with user profile */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              <span className="text-sm font-semibold">Demo User</span>
              <Avatar className="!size-8">
                <AvatarFallback className="bg-[#3BCEAC] text-white text-[12px] leading-[18px] font-bold font-sans">
                  D
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

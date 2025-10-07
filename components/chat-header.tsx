"use client"

import { Button } from "./ui/button"
import { INITIAL_DASHBOARD, useDashboard } from "@/hooks/use-dashboard"
import { cn } from "@/lib/utils"
import { Edit, Clock } from "lucide-react"
import { useChatHistory } from "@/hooks/use-chat-history"

interface ChatHeaderProps {
  id?: string
  showBorder?: boolean
  showTitle?: boolean
  onToggleHistory?: () => void
  onNewChat?: () => void
  variant?: "sidebar" | "full"
}

export function ChatHeader({
  id,
  showBorder = true,
  showTitle = true,
  onToggleHistory,
  onNewChat,
  variant = "full",
}: ChatHeaderProps) {
  const { setDashboard } = useDashboard()
  const { sessions, isLoaded, createChat, selectChat, currentChat } = useChatHistory()
  const currentTitle: string = (() => {
    if (!id) {
      return currentChat?.title ?? ""
    }
    const chat = sessions.find((session) => session.id === id)
    return chat?.title ?? ""
  })()

  return (
    <div
      className={cn(
        "relative flex items-center justify-between flex-shrink-0",
        // Match chat history header in sidebar (48px, lighter border, tighter padding)
        variant === "sidebar" ? "min-h-[48px] h-[48px] px-2" : "min-h-[50px] h-[50px] px-3 py-2",
        showBorder && (variant === "sidebar" ? "border-b border-[#EDEDED]" : "border-b border-[#DADCE0]"),
      )}
    >
      {/* Left: Chat history toggle when header is visible (dashboard card view) */}
      <div className="flex items-center justify-start w-10">
        {showBorder && (
          <Button
            variant="ghost"
            size="icon"
            className="text-[#999] hover:text-[#666] hover:bg-gray-50 h-8 w-8 rounded-md"
            aria-label="Chat history"
            onClick={() => onToggleHistory?.()}
          >
            <Clock className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Center: Title */}
      {showTitle && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 truncate max-w-[70%] text-center",
            "text-[15px] font-medium text-[#555] leading-5",
          )}
          title={currentTitle}
        >
          {currentTitle || "New chat"}
        </div>
      )}

      {/* Right: New Chat (visible when header is visible) */}
      <div className="flex items-center gap-1 justify-end w-10">
        {showBorder && (
          <Button
            variant="ghost"
            size="icon"
            className="text-[#999] hover:text-[#666] hover:bg-gray-50 h-8 w-8 rounded-md"
            aria-label="New chat"
            onClick={() => {
              try {
                setDashboard(INITIAL_DASHBOARD)
              } catch {
                // Dashboard reset failed, continue anyway
              }
              if (onNewChat) {
                onNewChat()
              } else if (isLoaded) {
                const newId = createChat({
                  title: "New chat",
                  modelId: currentChat?.modelId,
                  initialMessages: [],
                })
                if (newId) {
                  selectChat(newId)
                }
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

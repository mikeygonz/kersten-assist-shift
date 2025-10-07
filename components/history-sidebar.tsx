"use client"

import { cn, formatTimeAgo } from "@/lib/utils"
import { Edit, Search, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { useDashboardSelector } from "@/hooks/use-dashboard"
import { useChatHistory } from "@/hooks/use-chat-history"

interface HistorySidebarProps {
  currentChatId?: string
}

export function HistorySidebar({ currentChatId }: HistorySidebarProps) {
  const isDashboardVisible = useDashboardSelector((d) => d.isVisible)
  // SWR cache acts as a simple shared state bus; no fetcher needed
  const { data: isRightOverlayOpen } = useSWR<boolean>("history-overlay-open", {
    fallbackData: false,
  })
  // Hydration-safe: default collapsed on SSR, then read localStorage on mount
  const [expanded, setExpanded] = useState<boolean>(false)
  useEffect(() => {
    try {
      const v = window.localStorage.getItem("history-expanded")
      if (v === "true") setExpanded(true)
    } catch {
      // ignore
    }
  }, [])
  const { sessions, currentChatId: activeChatId, createChat, selectChat, isLoaded, currentChat } = useChatHistory()
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () => (sessions ?? []).filter((c) => (c.title || "").toLowerCase().includes(query.toLowerCase())),
    [sessions, query],
  )

  if (isDashboardVisible || isRightOverlayOpen) {
    // When dashboard is visible, hide the left sidebar entirely
    return null
  }

  return (
    <div
      className={cn("h-full flex flex-col bg-white shrink-0", expanded ? "w-60 border-r border-[#DADCE0]" : "w-10")}
      style={{ transition: "width 180ms ease" }}
    >
      {/* Header (mirrors right-side pattern but anchored left) */}
      <div className={cn("relative h-[48px] flex items-center", expanded ? "px-2 border-b border-[#EDEDED]" : "px-1")}>
        {/* Left: collapse/expand */}
        <div className="flex-1 flex items-center">
          <button
            type="button"
            onClick={() => {
              const next = !expanded
              setExpanded(next)
              try {
                window.localStorage.setItem("history-expanded", String(next))
              } catch {}
            }}
            aria-label={expanded ? "Collapse history" : "Expand history"}
            className={cn(
              "h-8 w-8 grid place-items-center rounded-md text-[#777] mx-1 relative top-[-2px]",
              "hover:bg-gray-50 hover:text-[#444] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-olivia-blue",
            )}
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>
        {/* Center: title when expanded */}
        {expanded && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="text-[15px] font-medium text-[#555]">Chat History</div>
          </div>
        )}
        {/* Right: New chat persistent button (matches widget header position) */}
        <div className="flex items-center justify-end w-10">
          {expanded && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-[#999] hover:text-[#666] hover:bg-gray-50 h-8 w-8 rounded-md mr-1 relative top-[-2px]"
              aria-label="New chat"
              onClick={() => {
                console.log("[v0] New chat clicked from history sidebar")
                if (!isLoaded) {
                  return
                }
                const newId = createChat({
                  title: "New chat",
                  modelId: currentChat?.modelId,
                  initialMessages: [],
                })
                if (newId) {
                  selectChat(newId)
                }
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search under header when expanded */}
      {expanded && (
        <div className="px-2 pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your chats..."
              className="w-full h-9 pl-9 pr-2 rounded-md border border-[#DADCE0] text-[16px] md:text-[16px] leading-[22px] font-[400] text-[#A9A9A9] focus:outline-none focus:ring-2 focus:ring-olivia-blue placeholder:text-[#A9A9A9] overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ fontFamily: 'var(--Font-Base, "Open Sans")' }}
            />
          </div>
        </div>
      )}

      {/* Collapsed: show New chat icon just under header so it's clickable within width */}
      {!expanded && (
        <div className="px-1 pt-2 pb-1">
          <button
            type="button"
            onClick={() => {
              console.log("[v0] New chat clicked from collapsed sidebar")
              if (!isLoaded) {
                return
              }
              const newId = createChat({
                title: "New conversation",
                modelId: currentChat?.modelId,
                initialMessages: [],
              })
              if (newId) {
                selectChat(newId)
              }
            }}
            aria-label="New chat"
            title="New chat"
            className={cn(
              "h-8 w-8 grid place-items-center rounded-md text-[#777]",
              "hover:bg-gray-50 hover:text-[#444] transition-colors",
            )}
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )}

      {expanded && (
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-2">
          {filtered.map((c) => (
            <button
              type="button"
              key={c.id}
              className={cn(
                "w-full text-left px-3 py-2 rounded-[12px] hover:rounded-[12px] border transition-colors cursor-pointer",
                (currentChatId ?? activeChatId) === c.id
                  ? "bg-[#F0FDFD] border-[#25C9D0]"
                  : "border-transparent hover:bg-[#F7FFFF] hover:border-[#25C9D0]",
              )}
              onClick={() => {
                console.log("[v0] Selecting chat from sidebar:", c.id)
                selectChat(c.id)
              }}
              title={c.title}
            >
              <div className="flex flex-col items-start gap-1">
                <span
                  className="text-[16px] text-[#555] font-[600] truncate w-full leading-normal"
                  style={{ fontFamily: '"Open Sans"' }}
                >
                  {c.title || "Untitled chat"}
                </span>
                <span
                  className="text-[16px] text-[#A9A9A9] font-[400] leading-normal flex items-center gap-2"
                  style={{ fontFamily: '"Open Sans"' }}
                >
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(c.createdAt as unknown as string)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

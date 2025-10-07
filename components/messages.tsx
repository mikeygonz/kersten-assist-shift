"use client"

import { memo, useMemo } from "react"
import type { Message } from "@ai-sdk/react"
import equal from "fast-deep-equal"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import { Message as MessageComponent, ThinkingMessage } from "./message"
import { Overview } from "./overview"

interface MessagesProps {
  status: string
  messages: Message[]
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void
  reload: () => Promise<void> | void
  showWelcome?: boolean
  onImageClick?: () => void // Added onImageClick prop to pass through to Overview
  append?: (message: { role: "user"; content: string }) => Promise<void>
}

function PureMessages({ messages, status, setMessages, reload, showWelcome, onImageClick, append }: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()

  const safeMessages = useMemo(() => messages ?? [], [messages])
  const showOverview = Boolean(showWelcome) && safeMessages.length === 0

  const lastMessage = safeMessages[safeMessages.length - 1]

  const shouldShowThinking = useMemo(() => {
    // If status is not ready, we're processing something
    if (status !== "ready") {
      // Show thinking if last message is from user (waiting for assistant)
      if (lastMessage?.role === "user") {
        return true
      }
      // Show thinking if last message is from assistant but empty or very short (still loading)
      if (lastMessage?.role === "assistant") {
        const content = typeof lastMessage.content === "string" ? lastMessage.content : ""
        return content.trim().length < 10 // Show thinking if content is less than 10 chars
      }
    }
    return false
  }, [status, lastMessage?.role, lastMessage?.content])

  const displayMessages = useMemo(() => {
    if (shouldShowThinking && lastMessage?.role === "assistant") {
      const content = typeof lastMessage.content === "string" ? lastMessage.content : ""
      // If the last assistant message is empty/very short and we're showing thinking, don't render it
      if (content.trim().length < 10) {
        return safeMessages.slice(0, -1)
      }
    }
    return safeMessages
  }, [safeMessages, shouldShowThinking, lastMessage?.role, lastMessage?.content])

  return (
    <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll w-full mb-0 mt-0 pt-6"
      >
        {showOverview && <Overview showWelcome onImageClick={onImageClick} />}

        {displayMessages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            isLoading={status === "streaming" && safeMessages[safeMessages.length - 1]?.id === message.id}
            setMessages={setMessages}
            reload={reload}
            append={append}
          />
        ))}

        {shouldShowThinking && <ThinkingMessage />}

        <div ref={messagesEndRef} className="shrink-0 min-w-[8px] min-h-[8px]" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-10 bg-gradient-to-t from-white via-white/85 to-transparent" />
    </div>
  )
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false
  if (prevProps.showWelcome !== nextProps.showWelcome) return false
  if (prevProps.messages?.length !== nextProps.messages?.length) return false
  if (!equal(prevProps.messages ?? [], nextProps.messages ?? [])) return false
  return true
})

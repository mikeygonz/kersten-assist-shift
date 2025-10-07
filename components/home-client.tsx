"use client"

import { useEffect, useMemo, useState } from "react"
import { Chat } from "@/components/chat"
import { Header } from "@/components/header"
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models"
import { cn, generateUUID } from "@/lib/utils"
import { DataStreamHandler } from "@/components/data-stream-handler"
import { ChatHistoryProvider, useChatHistory } from "@/hooks/use-chat-history"

interface HomeClientProps {
  initialChatModel: string
}

export function HomeClient({ initialChatModel }: HomeClientProps) {
  return (
    <ChatHistoryProvider>
      <HomeClientContent initialChatModel={initialChatModel} />
    </ChatHistoryProvider>
  )
}

function HomeClientContent({ initialChatModel }: HomeClientProps) {
  const { currentChat, currentChatId, createChat, selectChat } = useChatHistory()

  const fallbackModel = useMemo(() => initialChatModel || DEFAULT_CHAT_MODEL, [initialChatModel])

  // Simple local state - no complex loading logic
  const [localChatId, setLocalChatId] = useState<string | null>(null)

  useEffect(() => {
    if (!localChatId) {
      const newId = generateUUID()
      createChat({
        id: newId,
        title: "New chat",
        modelId: fallbackModel,
        initialMessages: [],
      })
      selectChat(newId)
      setLocalChatId(newId)
    }
  }, [localChatId, fallbackModel, createChat, selectChat])

  const effectiveModel = currentChat?.modelId ?? fallbackModel
  const messages = currentChat?.messages ?? []
  const activeChatId = localChatId || currentChatId || generateUUID()

  return (
    <div className={cn("flex flex-col h-screen bg-transparent")}>
      <Header />
      <div className="flex flex-1 overflow-y-hidden overflow-x-visible">
        <Chat id={activeChatId} selectedChatModel={effectiveModel} initialMessages={messages} isHome />
      </div>
      <DataStreamHandler id={activeChatId} />
    </div>
  )
}

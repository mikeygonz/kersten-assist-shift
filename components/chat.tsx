"use client"

import { useChat, type Message } from "@ai-sdk/react"
import { useEffect, useState, useCallback, useRef, type FormEvent } from "react"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import { Messages } from "./messages"
import { ChatInput } from "./chat-input"
import { SamplePrompts } from "./sample-prompts"
import { suggestedActions } from "./overview"
import { ChatHeader } from "./chat-header"
import { DashboardLayout } from "./dashboard-layout"
import { useDashboardSelector } from "@/hooks/use-dashboard"
import { useChatHistory } from "@/hooks/use-chat-history"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Edit, Clock, PanelRightClose, ArrowLeft, Search } from "lucide-react"
import { Input } from "./ui/input"
import { formatTimeAgo } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { generateTitleFromUserMessage } from "@/app/(chat)/actions"
import { useRouter } from "next/navigation"

interface ChatProps {
  id: string
  selectedChatModel: string
  initialMessages: Message[]
  isHome?: boolean
}

export function Chat({ id, selectedChatModel, initialMessages, isHome = false }: ChatProps) {
  const isDashboardVisible = useDashboardSelector((d) => d.isVisible)
  const [showHistory, setShowHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { mutate } = useSWRConfig()
  const router = useRouter()

  const {
    sessions,
    currentChat,
    selectChat,
    createChat: createChatSession,
    updateMessages: persistMessages,
    updateDraftInput,
    updateModelId,
    updateTitle,
  } = useChatHistory()

  const [input, setInput] = useState(currentChat?.draftInput ?? "")

  const activeChatId = currentChat?.id ?? id
  const activeMessages = currentChat?.messages ?? initialMessages
  const activeModelId = currentChat?.modelId ?? selectedChatModel

  const titleGeneratedRef = useRef(false)
  const lastSyncedChatIdRef = useRef<string | null>(null)

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    reload: chatReload,
    append,
  } = useChat({
    api: "/api/chat",
    id: activeChatId,
    body: { id: activeChatId, selectedChatModel: activeModelId },
    initialMessages: activeMessages,
    onError: (error) => {
      console.error("Chat error:", error)
      toast.error("Failed to send message")
    },
  })

  useEffect(() => {
    // Skip if we've already synced this chat
    if (lastSyncedChatIdRef.current === activeChatId) {
      return
    }

    console.log("[v0] Chat ID changed:", activeChatId)
    console.log("[v0] Active messages:", activeMessages)
    console.log("[v0] Current messages:", messages)

    // Mark this chat as synced
    lastSyncedChatIdRef.current = activeChatId

    // When switching chats, update the messages to match the selected chat
    if (activeMessages.length > 0 && messages.length === 0) {
      console.log("[v0] Loading messages for chat:", activeChatId)
      setMessages(activeMessages)
    } else if (activeMessages.length === 0 && messages.length > 0) {
      // If we switched to a new empty chat, clear messages
      console.log("[v0] Clearing messages for new chat:", activeChatId)
      setMessages([])
    }
  }, [activeChatId]) // Only depend on activeChatId, not activeMessages or messages

  // Update model ID if not set
  useEffect(() => {
    if (currentChat && !currentChat.modelId) {
      updateModelId(currentChat.id, selectedChatModel)
    }
  }, [currentChat, selectedChatModel, updateModelId])

  // Persist messages
  useEffect(() => {
    if (currentChat?.id && messages.length > 0) {
      persistMessages(currentChat.id, messages)
    }
  }, [messages, currentChat?.id, persistMessages])

  // Sync local input state with persisted draft
  useEffect(() => {
    setInput(currentChat?.draftInput ?? "")
  }, [currentChat?.draftInput, currentChat?.id])

  // Persist draft input
  useEffect(() => {
    if (currentChat?.id) {
      updateDraftInput(currentChat.id, input)
    }
  }, [currentChat?.id, input, updateDraftInput])

  useEffect(() => {
    titleGeneratedRef.current = false
  }, [currentChat?.id])

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault?.()

      const trimmed = input.trim()
      if (!trimmed) {
        return
      }

      console.log("[v0] handleSubmit called")
      console.log("[v0] messages.length:", messages.length)
      console.log("[v0] currentChat:", currentChat)
      console.log("[v0] currentChat?.title:", currentChat?.title)
      console.log("[v0] titleGeneratedRef.current:", titleGeneratedRef.current)

      const isFirstMessage = messages.length === 0
      const shouldGenerateTitle =
        isFirstMessage && (!currentChat?.title || currentChat?.title === "New chat") && !titleGeneratedRef.current

      console.log("[v0] isFirstMessage:", isFirstMessage)
      console.log("[v0] shouldGenerateTitle:", shouldGenerateTitle)

      if (shouldGenerateTitle && currentChat?.id) {
        titleGeneratedRef.current = true
        console.log("[v0] Starting parallel title generation for first message")

        // Generate title in parallel (don't await)
        generateTitleFromUserMessage({
          message: {
            role: "user",
            content: trimmed,
          } as Message,
        })
          .then((generatedTitle) => {
            console.log("[v0] Title generated:", generatedTitle)
            updateTitle(currentChat.id, generatedTitle)
            console.log("[v0] Title updated in state")
          })
          .catch((error) => {
            console.error("[v0] Title generation failed:", error)
            titleGeneratedRef.current = false // Reset on error to allow retry
          })
      } else {
        console.log("[v0] Skipping title generation - conditions not met")
      }

      // Clear input immediately for better UX
      const previousInput = input
      setInput("")
      if (currentChat?.id) {
        updateDraftInput(currentChat.id, "")
      }

      try {
        // Send message using AI SDK's sendMessage
        await sendMessage({ text: trimmed })
      } catch (error) {
        console.error("Failed to send message", error)
        toast.error("Failed to send message")
        // Restore input on error
        setInput(previousInput)
        if (currentChat?.id) {
          updateDraftInput(currentChat.id, previousInput)
        }
      }
    },
    [sendMessage, currentChat, input, messages.length, updateDraftInput, updateTitle],
  )

  const reload = useCallback(async () => {
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage) {
      return
    }

    try {
      if (lastMessage.role === "assistant") {
        await chatReload()
        return
      }

      const textContent =
        lastMessage.parts
          ?.filter((part) => part.type === "text")
          .map((part) => part.text ?? "")
          .join("\n")
          .trim() ?? ""

      if (!textContent) {
        return
      }

      // Set input and trigger submit
      setInput(textContent)
      setTimeout(() => {
        handleSubmit()
      }, 100)
    } catch (error) {
      console.error("Failed to regenerate message", error)
      toast.error("Failed to regenerate message")
    }
  }, [messages, chatReload, handleSubmit])

  const handleNewChat = useCallback(() => {
    console.log("[v0] handleNewChat called - closing history and navigating to new chat")
    setShowHistory(false)

    router.push("/")
  }, [router])

  const handleActionSelect = useCallback(
    (action: string) => {
      setInput(action)
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder="Write a message..."]') as HTMLTextAreaElement
        textarea?.focus()
      }, 50)
    },
    [setInput],
  )

  const handleImageClick = useCallback(() => {
    const managerName = "Hunter"
    const assistantMessage = `Hi ${managerName}, I found a shift on your schedule that needs coverage.`

    // Create an assistant message with the shift task tool call
    const newAssistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: assistantMessage,
      parts: [
        {
          type: "text",
          text: assistantMessage,
        },
        {
          type: "tool-presentShiftTask",
          state: "output-available",
          toolCallId: `tool-${Date.now()}`,
          toolName: "presentShiftTask",
          input: {
            taskId: "shift-001",
            date: "Tuesday, November 4, 2025",
            startTime: "8:30am",
            endTime: "12:30pm",
            location: "1234 East Street Rd.",
            role: "Drive-Thru",
            employeeName: "Reyna Benson",
            employeeRole: "Crew Member",
            reason: "Daughter's doctor appointment conflict",
          },
          output: {
            taskId: "shift-001",
            date: "Tuesday, November 4, 2025",
            startTime: "8:30am",
            endTime: "12:30pm",
            location: "1234 East Street Rd.",
            role: "Drive-Thru",
            employeeName: "Reyna Benson",
            employeeRole: "Crew Member",
            reason: "Daughter's doctor appointment conflict",
          },
        },
      ],
    }

    // Add the assistant message to the chat
    setMessages([...messages, newAssistantMessage])

    // Generate title if this is the first message
    if (messages.length === 0 && currentChat?.id && !titleGeneratedRef.current) {
      titleGeneratedRef.current = true
      generateTitleFromUserMessage({
        message: {
          role: "user",
          content: "Show me shift coverage issues",
        } as Message,
      })
        .then((generatedTitle) => {
          updateTitle(currentChat.id, generatedTitle)
        })
        .catch((error) => {
          console.error("[v0] Title generation failed:", error)
          titleGeneratedRef.current = false
        })
    }
  }, [messages, setMessages, currentChat, updateTitle])

  const chatMessages = messages ?? []
  const showSuggestions = chatMessages.length === 0
  const showWelcome = isHome && chatMessages.length === 0
  const promptVariant = isDashboardVisible ? "sidebar" : "full"

  // Broadcast history overlay state
  useEffect(() => {
    try {
      mutate("history-overlay-open", showHistory, { revalidate: false })
    } catch (error) {
      console.error("Failed to broadcast history overlay state", error)
    }
  }, [showHistory, mutate])

  return (
    <div className="flex-1 flex px-3 py-3 overflow-y-hidden overflow-x-visible">
      <div className="flex flex-1 gap-4 min-w-0 overflow-visible">
        <DashboardLayout />

        <motion.div
          animate={{
            width: isDashboardVisible ? 375 : showHistory ? "calc(100% - 375px)" : "100%",
          }}
          transition={{
            type: "tween",
            ease: [0.22, 1, 0.36, 1],
            duration: 0.24,
          }}
          className={cn(
            "h-full min-h-0 flex-1 min-w-sm relative flex flex-col overflow-hidden",
            isDashboardVisible
              ? "bg-white border border-[#DADCE0] rounded-lg w-[375px] min-w-[375px] max-w-[375px]"
              : "bg-transparent border-0",
          )}
        >
          {!isDashboardVisible && (
            <div className="absolute right-2 top-2 z-30 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-[#999] hover:text-[#666] hover:bg-gray-50 h-8 w-8 rounded-md",
                  showHistory && "invisible pointer-events-none",
                )}
                onClick={() => setShowHistory(true)}
              >
                <Clock className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#999] hover:text-[#666] hover:bg-gray-50 h-8 w-8 rounded-md"
                onClick={handleNewChat}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}

          <ChatHeader
            id={id}
            showBorder={isDashboardVisible && !showHistory}
            showTitle={isDashboardVisible && !showHistory}
            variant={isDashboardVisible ? "sidebar" : "full"}
            onToggleHistory={() => setShowHistory(true)}
            onNewChat={handleNewChat}
          />

          <div
            className={cn(
              "flex flex-col flex-1 max-w-[800px] mx-auto w-full min-w-0 overflow-hidden pt-0",
              isDashboardVisible ? "px-2 pb-[8px]" : "px-3 pb-4",
            )}
          >
            {isDashboardVisible ? (
              <>
                {/* Sidebar view: Messages -> SamplePrompts -> ChatInput */}
                <Messages
                  status={status}
                  messages={chatMessages}
                  setMessages={setMessages}
                  reload={reload}
                  showWelcome={showWelcome}
                  onImageClick={handleImageClick}
                  append={append}
                />

                {showSuggestions ? (
                  <SamplePrompts
                    items={suggestedActions}
                    onSelect={handleActionSelect}
                    variant={promptVariant}
                    className="mt-1"
                  />
                ) : null}

                <ChatInput
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  status={status}
                  stop={stop}
                  variant={promptVariant}
                  showDisclaimer
                  className={cn(showSuggestions ? "mt-1" : "mt-4")}
                />
              </>
            ) : (
              <>
                <Messages
                  status={status}
                  messages={chatMessages}
                  setMessages={setMessages}
                  reload={reload}
                  showWelcome={showWelcome}
                  onImageClick={handleImageClick}
                  append={append}
                />

                <ChatInput
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  status={status}
                  stop={stop}
                  variant={promptVariant}
                  showDisclaimer={false}
                  className="mt-6"
                />

                {showSuggestions ? (
                  <SamplePrompts
                    items={suggestedActions}
                    onSelect={handleActionSelect}
                    variant={promptVariant}
                    className="mt-6"
                  />
                ) : null}
              </>
            )}
          </div>

          {/* History overlay */}
          <AnimatePresence>
            {showHistory && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {isDashboardVisible ? (
                  <div className="absolute inset-0 bg-white overflow-hidden pointer-events-auto flex flex-col rounded-lg">
                    <div className="relative h-[48px] border-b border-[#EDEDED] flex items-center px-2">
                      <div className="flex-1">
                        <button onClick={() => setShowHistory(false)} className="text-[#999] hover:text-[#666] p-2">
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2">
                        <div className="text-[15px] font-medium">Chat History</div>
                      </div>
                      <div className="w-10">
                        <Button variant="ghost" size="icon" onClick={handleNewChat}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="px-4 pt-4 pb-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search your chats..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto px-4 py-2 space-y-2">
                      {(sessions ?? [])
                        .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((c) => (
                          <button
                            key={c.id}
                            className={cn(
                              "w-full text-left px-4 py-4 rounded-[12px] border transition-colors",
                              activeChatId === c.id
                                ? "bg-[#F0FDFD] border-[#25C9D0]"
                                : "border-transparent hover:bg-[#F7FFFF] hover:border-[#25C9D0]",
                            )}
                            onClick={() => {
                              console.log("[v0] Selecting chat from history:", c.id)
                              setShowHistory(false)
                              if (c.id !== activeChatId) {
                                selectChat(c.id)
                              }
                            }}
                          >
                            <div className="flex flex-col gap-2">
                              <span className="text-[14px] font-[600] text-[#555]">{c.title}</span>
                              <span className="text-[14px] text-[#A9A9A9]">
                                <Clock className="h-3 w-3 inline mr-2" />
                                {formatTimeAgo(c.createdAt as unknown as string)}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    className="absolute top-0 right-0 h-full w-[375px] pointer-events-auto"
                  >
                    <div className="h-full bg-white rounded-lg border overflow-hidden flex flex-col">
                      <div className="h-[48px] border-b flex items-center px-2">
                        <button onClick={() => setShowHistory(false)} className="p-2">
                          <PanelRightClose className="h-4 w-4" />
                        </button>
                        <div className="flex-1 text-center text-[15px] font-medium">Chat History</div>
                      </div>

                      <div className="px-4 pt-4 pb-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
                        {(sessions ?? [])
                          .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((c) => (
                            <button
                              key={c.id}
                              className={cn(
                                "w-full text-left px-3 py-3 rounded-[12px] border transition-colors",
                                activeChatId === c.id
                                  ? "bg-[#F0FDFD] border-[#25C9D0]"
                                  : "border-transparent hover:bg-[#F7FFFF]",
                              )}
                              onClick={() => {
                                console.log("[v0] Selecting chat from history overlay:", c.id)
                                setShowHistory(false)
                                if (c.id !== activeChatId) {
                                  selectChat(c.id)
                                }
                              }}
                            >
                              <div className="flex flex-col gap-2">
                                <span className="text-[14px] font-[600]">{c.title}</span>
                                <span className="text-[14px] text-gray-400">
                                  <Clock className="h-3 w-3 inline mr-2" />
                                  {formatTimeAgo(c.createdAt as unknown as string)}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

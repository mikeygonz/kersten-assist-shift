"use client"

import { Button } from "./ui/button"
import type { Message } from "@ai-sdk/react"
import Image from "next/image"
import { Fragment, memo, useState } from "react"
import equal from "fast-deep-equal"
import { AnimatePresence, motion } from "framer-motion"
import { EditIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"
import { MessageActions } from "./message-actions"
import { MessageEditor } from "./message-editor"
import { ShiftTaskCard, type ShiftTask } from "./shift-task-card"
import { useDashboard } from "@/hooks/use-dashboard"

interface MessageProps {
  message: Message
  isLoading: boolean
  setMessages?: (messages: Message[] | ((messages: Message[]) => Message[])) => void
  reload?: () => Promise<void> | void
  isReadOnly?: boolean
  append?: (message: { role: "user"; content: string }) => Promise<void>
}

function formatAsJSON(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    console.error("Failed to stringify tool payload", error)
    return "Unable to display payload"
  }
}

function ToolInvocationBlock({
  toolName,
  state,
  payload,
  append,
}: {
  toolName: string
  state: string
  payload: unknown
  append?: (message: { role: "user"; content: string }) => Promise<void>
}) {
  const { setDashboard } = useDashboard()

  const json = formatAsJSON(payload)

  if (toolName === "presentShiftTask" && state === "result") {
    const result = payload as { type?: string; task?: ShiftTask }
    if (result?.type === "shift_task" && result?.task) {
      const handleYes = () => {
        // Directly transition to shift schedule view
        setDashboard((current) => ({
          ...current,
          workflowMode: "shift-schedule",
          activeShiftId: result.task?.id,
        }))

        // Add a simple breadcrumb message to chat (optional - can be implemented later)
      }

      const handleNo = () => {
        // User declined, keep dashboard in default mode
      }

      return <ShiftTaskCard task={result.task} isInteractive={true} onYes={handleYes} onNo={handleNo} />
    }
  }

  if (toolName === "startShiftCoverageWorkflow" && state === "result") {
    const result = payload as { type?: string; shiftId?: string; message?: string }

    if (result?.type === "workflow_started") {
      setDashboard((current) => ({
        ...current,
        workflowMode: "coverage-workspace",
        activeShiftId: result.shiftId,
      }))

      return (
        <div className="rounded-lg border border-[#25C9D0] bg-[#F0FDFD] p-4 text-left">
          <div className="text-sm text-[#555]">{result.message}</div>
        </div>
      )
    }

    if (result?.type === "workflow_declined") {
      return (
        <div className="rounded-lg border border-[#E6E8EC] bg-[#F9FAFB] p-4 text-left">
          <div className="text-sm text-[#555]">{result.message}</div>
        </div>
      )
    }
  }

  return (
    <div className="rounded-lg border border-[#E6E8EC] bg-[#F9FAFB] p-4 text-left">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#888] mb-2">
        {toolName} · {state}
      </div>
      <pre className="text-xs leading-5 text-[#555] whitespace-pre-wrap break-words">{json}</pre>
    </div>
  )
}

function PureMessage({ message, setMessages, reload, isLoading, isReadOnly, append }: MessageProps) {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const parts = message.parts?.filter(Boolean) ?? []

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message min-w-0"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex items-start gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl min-w-0",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <Image
                  src="/olivia-avatar.png"
                  alt="Assistant avatar"
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            {parts.map((part, index) => {
              const key = `message-${message.id}-part-${index}`

              if (part.type === "reasoning") {
                return null
              }

              if (part.type === "text") {
                if (mode === "view") {
                  if (!part.text) {
                    return null
                  }

                  const showInlineCopy = message.role === "assistant" && !isReadOnly && index === 0

                  return (
                    <Fragment key={key}>
                      <div className="flex flex-row items-start">
                        {message.role === "user" && !isReadOnly && (
                          <Button
                            data-testid="message-edit-button"
                            variant="ghost"
                            className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100 mr-2"
                            onClick={() => {
                              setMode("edit")
                            }}
                            title="Edit message"
                          >
                            <EditIcon />
                          </Button>
                        )}

                        <div
                          data-testid="message-content"
                          className={cn("flex flex-col gap-3 rounded-sm", {
                            "border border-[#DADCE0] bg-[#F8F8F8] text-[#555] rounded-md py-2 px-3":
                              message.role === "user",
                            "text-[#555] -mt-0.5": message.role === "assistant",
                          })}
                        >
                          <Markdown>{part.text}</Markdown>
                        </div>
                      </div>

                      {showInlineCopy && (
                        <div className="mt-0">
                          <MessageActions message={message} isLoading={isLoading} className="text-[#A9A9A9]" />
                        </div>
                      )}
                    </Fragment>
                  )
                }

                if (mode === "edit" && setMessages && reload && !isReadOnly) {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  )
                }

                return null
              }

              if (part.type === "tool-invocation") {
                const toolInvocation = part.toolInvocation
                if (!toolInvocation) {
                  return null
                }
                const toolName = toolInvocation.toolName ?? "tool"
                const state = toolInvocation.state ?? "unknown"
                const payload =
                  state === "result" ? (toolInvocation as { result?: unknown }).result : toolInvocation.args

                return <ToolInvocationBlock key={key} toolName={toolName} state={state} payload={payload} append={append} />
              }

              return null
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export const MemoizedMessage = memo(PureMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) {
    return false
  }

  if (prevProps.message.id !== nextProps.message.id) {
    return false
  }

  if (!equal(prevProps.message.parts, nextProps.message.parts)) {
    return false
  }

  return true
})

export { MemoizedMessage as Message }

export const ThinkingMessage = () => {
  const role = "assistant"

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div className={cn("flex gap-4 w-full items-center")}>
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background overflow-hidden">
          <div>
            <Image
              src="/olivia-avatar.png"
              alt="Assistant avatar"
              className="w-full h-full object-cover"
              width={32}
              height={32}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center text-sm leading-5 h-[20px]">
            <span className="thinking-shimmer">Thinking</span>
            <div className="relative ml-1 inline-flex">
              <span className="inline-block text-[#A9A9A9] animate-pulse">...</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

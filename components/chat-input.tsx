"use client"

import type React from "react"

import { useRef, useEffect, memo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { SendIcon } from "./ui/send-icon"

type ChatSubmitEvent = React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>

interface ChatInputProps {
  input?: string
  setInput?: (value: string) => void
  handleSubmit?: (event?: ChatSubmitEvent) => void | Promise<void>
  status?: string
  stop?: () => void
  className?: string
  variant?: "sidebar" | "full"
  showDisclaimer?: boolean
}

function PureChatInput({
  input = "",
  setInput = () => {},
  handleSubmit = () => {},
  status = "ready",
  stop = () => {},
  className,
  variant = "full",
  showDisclaimer = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 24), 320)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [input])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input || !input.trim()) {
      return
    }

    if (status === "streaming") {
      toast.error("Please wait for the current response to finish")
      return
    }

    handleSubmit(e)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()

      if (!input || !input.trim()) {
        return
      }

      if (status === "streaming") {
        toast.error("Please wait for the current response to finish")
        return
      }

      handleSubmit(e)
    }
  }

  const isDisabled = !input || !input.trim() || status === "streaming"
  const sendButtonColor = input && input.trim() ? "var(--chat-send-active)" : "var(--chat-send-inactive)"

  return (
    <div className={cn("pt-3 bg-white", variant === "sidebar" ? "px-2 pb-0" : "px-4 pb-2", className)}>
      <div className="flex flex-col w-full">
        <div
          className={cn(
            "w-full rounded-[24px] bg-white transition-shadow duration-200",
            "shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.03),0px_3px_8px_-3px_rgba(0,0,0,0.05),0px_2px_4px_-2px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_1px_1px_-1px_rgba(0,0,0,0.08),0px_0px_0px_1px_rgba(0,0,0,0.05)]",
          )}
          style={{ minHeight: "92px" }}
        >
          <form onSubmit={onSubmit} className="flex flex-col w-full">
            <div className="px-[12px] pt-[16px]">
              <textarea
                ref={textareaRef}
                value={input || ""}
                onChange={(e) => {
                  setInput(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={onKeyDown}
                placeholder="Write a message..."
                className={cn(
                  "w-full bg-transparent text-[#555] placeholder:text-[#A9A9A9]",
                  "border-none focus:outline-none focus:ring-0 text-sm resize-none min-h-[24px] max-h-[320px] overflow-auto leading-5 px-[8px]",
                )}
                rows={1}
                style={{
                  scrollbarWidth: "none",
                  outline: "none",
                  lineHeight: "20px",
                }}
              />
            </div>

            <div className="h-[16px]" />

            <div className="px-[12px] pb-[12px] flex justify-end">
              {status === "streaming" ? (
                <Button
                  type="button"
                  className="w-[32px] h-[32px] flex items-center justify-center rounded-full border"
                  onClick={(e) => {
                    e.preventDefault()
                    stop()
                  }}
                >
                  <svg height={14} viewBox="0 0 16 16" width={14} style={{ color: "currentcolor" }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M3 3H13V13H3V3Z" fill="currentColor" />
                  </svg>
                </Button>
              ) : (
                <button
                  type="submit"
                  disabled={isDisabled}
                  className="w-[32px] h-[32px] flex items-center justify-center focus:outline-none disabled:opacity-50"
                  aria-label="Send message"
                >
                  <SendIcon color={sendButtonColor} />
                </button>
              )}
            </div>
          </form>
        </div>
        {showDisclaimer && variant === "sidebar" && (
          <div
            className={cn("mt-[10px] w-full text-center")}
            style={{
              color: "var(--Earl-Grey, #A9A9A9)",
              fontFamily: "Open Sans",
              fontSize: 12,
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "20px",
            }}
          >
            Olivia can make mistakes. Check important info.
          </div>
        )}
      </div>
    </div>
  )
}

export const ChatInput = memo(PureChatInput)

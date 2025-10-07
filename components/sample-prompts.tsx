"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface SamplePromptItem {
  title: string
  label: string
  action: string
}

interface SamplePromptsProps {
  items: SamplePromptItem[]
  onSelect: (action: string) => void
  className?: string
  variant?: "sidebar" | "full"
}

export function SamplePrompts({ items, onSelect, className, variant = "full" }: SamplePromptsProps) {
  const cards = useMemo(() => items.filter(Boolean), [items])

  const handleSelect = useCallback(
    (action: string) => {
      if (typeof onSelect === "function") {
        onSelect(action)
      }
    },
    [onSelect],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncScrollState = useCallback(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) {
      setHasOverflow(false)
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const { scrollWidth, clientWidth, scrollLeft } = scrollEl
    const overflow = scrollWidth > clientWidth + 1

    setHasOverflow(overflow)
    setCanScrollLeft(scrollLeft > 8)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8)
  }, []) // Empty dependency array since it only uses refs and setState

  const handleWheel = useCallback((event: WheelEvent) => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    // Prevent default scrolling behavior
    event.preventDefault()

    // Scroll the element by the amount scrolled in the event
    scrollEl.scrollLeft += event.deltaY
  }, [])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    // Use requestAnimationFrame to ensure DOM has painted before checking
    const checkScrollState = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncScrollState()
        })
      })
    }

    // Initial check with delay to ensure content is rendered
    checkScrollState()

    const handleScroll = () => syncScrollState()

    // Watch for content size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollState()
    })

    resizeObserver.observe(scrollEl)

    scrollEl.addEventListener("scroll", handleScroll)
    scrollEl.addEventListener("wheel", handleWheel as EventListener, {
      passive: false,
    })
    window.addEventListener("resize", syncScrollState)

    return () => {
      resizeObserver.disconnect()
      scrollEl.removeEventListener("scroll", handleScroll)
      scrollEl.removeEventListener("wheel", handleWheel as EventListener)
      window.removeEventListener("resize", syncScrollState)
    }
  }, [handleWheel, syncScrollState]) // Removed cards.length dependency to prevent re-initialization

  useEffect(() => {
    // Double requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        syncScrollState()
      })
    })
  }, [cards.length, syncScrollState])

  const gradientBase = "from-white dark:from-[#1F1F20]"
  const containerPadding = "px-2"

  return (
    <div className={cn("w-full pb-0", containerPadding, className)} ref={containerRef}>
      <div className="relative">
        {hasOverflow && canScrollLeft ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent transition-opacity duration-150",
              gradientBase,
            )}
          />
        ) : null}
        {hasOverflow && canScrollRight ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent transition-opacity duration-150 pointer-events-none",
              gradientBase,
            )}
          />
        ) : null}

        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto overflow-y-visible py-1 pl-1 pr-6",
            "[-ms-overflow-style:none] [scrollbar-width:none]",
            "[&::-webkit-scrollbar]:hidden",
          )}
          style={{ scrollPaddingLeft: 16, scrollPaddingRight: 16 }}
        >
          {cards.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSelect(item.action)
              }}
              type="button"
              className={cn(
                "flex min-w-[182px] max-w-[200px] flex-shrink-0 flex-col items-start rounded-[8px] bg-white px-4 py-[6px] text-left transition-colors duration-200",
                "shadow-[0_10px_15px_-3px_rgba(0,0,0,0.03),0_1px_1px_-1px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)] border border-transparent",
                "hover:border-[#25C9D0] hover:bg-[#F7FFFF]",
                "dark:bg-[#1F1F20] dark:text-[#F3F4F6] dark:hover:bg-[#1A2A2A]",
              )}
              aria-label={`Suggestion: ${item.title}`}
            >
              <span
                className="text-[14px] font-semibold text-[#555] dark:text-white leading-[20px] break-words"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontFamily: 'var(--Font-Base, "Open Sans")',
                }}
              >
                {item.title}
              </span>
              <span
                className="text-[14px] font-normal text-[#A9A9A9] dark:text-[#A9ABB6] leading-[20px] break-words"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontFamily: 'var(--Font-Base, "Open Sans")',
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

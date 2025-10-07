"use client"

import { motion } from "framer-motion"
import { memo } from "react"
import Image from "next/image"
import type { SamplePromptItem } from "./sample-prompts"

interface OverviewProps {
  showWelcome?: boolean
  onImageClick?: () => void
}

export const suggestedActions: SamplePromptItem[] = [
  {
    title: "Shift coverage",
    label: "Find available staff",
    action: "Show me available staff for tomorrow's morning shift.",
  },
  {
    title: "Schedule overview",
    label: "Weekly summary",
    action: "Give me a summary of this week's schedule and any gaps.",
  },
  {
    title: "Team availability",
    label: "Check availability",
    action: "Who is available to work this weekend?",
  },
  {
    title: "Swap requests",
    label: "Pending requests",
    action: "Show me all pending shift swap requests.",
  },
]

function PureOverview({ showWelcome = true, onImageClick }: OverviewProps) {
  if (!showWelcome) return null

  return (
    <motion.div
      key="overview"
      className="flex-1 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.4 }}
    >
      {/* Centered avatar + greeting */}
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={onImageClick}
          className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            boxShadow: "0 2px 24px 0 rgba(0, 0, 0, 0.10)",
          }}
          aria-label="Start conversation with Olivia"
        >
          <Image
            src="/olivia-avatar.png"
            alt="Assistant"
            className="w-full h-full object-cover object-center"
            width={80}
            height={80}
            priority
          />
        </button>
        <p className="text-center text-[#555] dark:text-gray-200 text-base font-semibold font-[family-name:var(--font-figtree)]">
          Hi! How can I help you today?
        </p>
      </div>
    </motion.div>
  )
}

export const Overview = memo(PureOverview)

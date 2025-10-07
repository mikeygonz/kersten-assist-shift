"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { AnimatePresence, motion } from "framer-motion"
import { memo } from "react"
import { Dashboard } from "./dashboard"

function PureDashboardLayout() {
  const { dashboard } = useDashboard()

  return (
    <AnimatePresence mode="wait">
      {dashboard.isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{
            type: "tween",
            ease: [0.22, 1, 0.36, 1],
            duration: 0.24,
          }}
          className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-visible"
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            alignItems: "flex-start",
            gap: "8px",
            flex: "1 0 0",
            alignSelf: "stretch",
            borderRadius: "12px",
            border: "1px solid var(--steel-grey-darkest-border, #DADCE0)",
            background: "var(--White, #FFF)",
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div
              className="truncate"
              style={{
                color: "var(--Charcoal, #555)",
                fontFamily: '"Open Sans"',
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 600,
                lineHeight: "28px",
              }}
            >
              {dashboard.title || "Dashboard"}
            </div>
          </div>

          <Dashboard summary={dashboard.summary} items={dashboard.items} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const DashboardLayout = memo(PureDashboardLayout)

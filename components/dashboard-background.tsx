"use client"

import { useEffect } from "react"
import { useDashboardSelector } from "@/hooks/use-dashboard"

export function DashboardBackground() {
  const isDashboardVisible = useDashboardSelector((d) => d.isVisible)

  useEffect(() => {
    const previous = document.body.style.backgroundColor
    // Use Fog Grey only when the dashboard is visible; otherwise default background
    if (isDashboardVisible) {
      document.body.style.backgroundColor = "var(--Color-Fog-Grey, #F8F8F8)"
    } else {
      document.body.style.backgroundColor = ""
    }
    return () => {
      document.body.style.backgroundColor = previous
    }
  }, [isDashboardVisible])

  return null
}

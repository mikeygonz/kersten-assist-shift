"use client"

import { useCallback, useMemo } from "react"
import useSWR from "swr"

export interface UIPanelItem {
  id: string
  title: string
  description?: string
}

export interface UIPanelState {
  id: string
  title: string
  summary?: string
  isVisible: boolean
  status: "streaming" | "idle"
  items: UIPanelItem[]
  workflowMode?: "default" | "coverage-workspace" | "shift-schedule"
  activeShiftId?: string
}

export const INITIAL_DASHBOARD: UIPanelState = {
  id: "init",
  title: "",
  summary: "",
  isVisible: true,
  status: "idle",
  items: [],
  workflowMode: "default",
}

type Selector<T> = (dashboard: UIPanelState) => T

export function useDashboardSelector<T>(selector: Selector<T>): T {
  const { data: dashboard } = useSWR<UIPanelState>("dashboard", null, {
    fallbackData: INITIAL_DASHBOARD,
  })

  return useMemo(() => selector(dashboard ?? INITIAL_DASHBOARD), [dashboard, selector])
}

export function useDashboard() {
  const { data: dashboard, mutate: setDashboardState } = useSWR<UIPanelState>("dashboard", null, {
    fallbackData: INITIAL_DASHBOARD,
  })

  const setDashboard = useCallback(
    (updater: UIPanelState | ((currentDashboard: UIPanelState) => UIPanelState)) => {
      setDashboardState(
        (currentDashboard) => {
          const nextDashboard = currentDashboard ?? INITIAL_DASHBOARD

          if (typeof updater === "function") {
            return (updater as (dash: UIPanelState) => UIPanelState)(nextDashboard)
          }

          return updater
        },
        { revalidate: false },
      )
    },
    [setDashboardState],
  )

  return {
    dashboard: dashboard ?? INITIAL_DASHBOARD,
    setDashboard,
  }
}

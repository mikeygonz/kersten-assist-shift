"use client"

import { useChat } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { INITIAL_DASHBOARD, useDashboard, type UIPanelItem } from "@/hooks/use-dashboard"

export type PanelStreamDelta =
  | { type: "panel-open"; content?: string }
  | { type: "panel-close"; content?: string }
  | { type: "panel-title"; content: string }
  | { type: "panel-summary"; content: string }
  | { type: "panel-items"; content: string }
  | { type: "panel-reset"; content?: string }
  | { type: "panel-status"; content: "streaming" | "idle" }

export function DataStreamHandler({ id }: { id: string }) {
  const { data } = useChat({ id })
  const { setDashboard } = useDashboard()
  const lastProcessedIndex = useRef(-1)

  // Reset lastProcessedIndex when chat ID changes
  useEffect(() => {
    lastProcessedIndex.current = -1
  }, [id])

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return
    }

    const nextIndex = lastProcessedIndex.current + 1
    const newDeltas = data.slice(nextIndex)
    lastProcessedIndex.current = data.length - 1
    ;(newDeltas as PanelStreamDelta[]).forEach((delta) => {
      switch (delta.type) {
        case "panel-open":
          setDashboard((draft) => ({
            ...draft,
            isVisible: true,
            status: "streaming",
          }))
          break
        case "panel-close":
          setDashboard((draft) => ({
            ...draft,
            isVisible: false,
            status: "idle",
          }))
          break
        case "panel-reset":
          setDashboard(INITIAL_DASHBOARD)
          break
        case "panel-title":
          setDashboard((draft) => ({
            ...draft,
            title: delta.content,
          }))
          break
        case "panel-summary":
          setDashboard((draft) => ({
            ...draft,
            summary: delta.content,
          }))
          break
        case "panel-items":
          setDashboard((draft) => {
            try {
              const items = JSON.parse(delta.content) as UIPanelItem[]
              return {
                ...draft,
                items,
                isVisible: true,
              }
            } catch (error) {
              console.error("Failed to parse panel items", error)
              return draft
            }
          })
          break
        case "panel-status":
          setDashboard((draft) => ({
            ...draft,
            status: delta.content,
          }))
          break
        default: {
          const text = delta as { content?: string } | string | undefined
          if (typeof text === "string" && text.toLowerCase().includes("[dashboard]")) {
            setDashboard((draft) => ({
              ...draft,
              isVisible: true,
            }))
          } else if (text && typeof (text as { content?: string }).content === "string") {
            const content = (text as { content?: string }).content as string
            if (content.toLowerCase().includes("[dashboard]")) {
              setDashboard((draft) => ({
                ...draft,
                isVisible: true,
              }))
            }
          }
          break
        }
      }
    })
  }, [data, setDashboard])

  return null
}

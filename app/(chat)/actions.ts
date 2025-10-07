"use server"

import { generateText, type Message } from "ai"
import { cookies } from "next/headers"

import { deleteMessagesByChatIdAfterTimestamp, getMessageById } from "@/lib/db/queries"
import { getModel } from "@/lib/ai/models"

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies()
  cookieStore.set("chat-model", model)
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message
}) {
  console.log("[v0] generateTitleFromUserMessage called with message:", message)

  try {
    const { text: title } = await generateText({
      model: getModel("google/gemini-2.5-flash"),
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 30 characters long
      - the title should be a brief summary of the user's message
      - use sentence case (only capitalize the first word and proper nouns)
      - make it natural and conversational, like "Write team update" or "Job relevance analysis"
      - prioritize brevity and clarity
      - do not use quotes or colons`,
      prompt: JSON.stringify(message),
      maxRetries: 0, // Don't retry on rate limits
    })

    console.log("[v0] Title generated successfully:", title)
    return title.length > 30 ? title.slice(0, 27) + "..." : title
  } catch (error) {
    console.error("[v0] Title Generation - AI generation failed", error)
    console.log("[v0] Title Generation - Falling back to message content")
    const content = typeof message.content === "string" ? message.content : message.content?.[0]?.text || "New Chat"

    const simpleTitle = content.slice(0, 27).trim()
    const fallbackTitle = simpleTitle.length < content.length ? `${simpleTitle}...` : simpleTitle

    console.log("[v0] Title Generation - Fallback title:", fallbackTitle)
    return fallbackTitle
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const message = await getMessageById({ id })

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  })
}

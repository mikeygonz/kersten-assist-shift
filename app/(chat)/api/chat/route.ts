import { streamText, convertToModelMessages, stepCountIs } from "ai"
import { SYSTEM_PROMPT } from "@/lib/ai/prompts"
import { getRegisteredTools } from "@/lib/ai/tools"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, selectedChatModel } = await req.json()

    if (!messages?.length) {
      return new Response("No messages provided", { status: 400 })
    }

    const model = selectedChatModel || "anthropic/claude-sonnet-4.5"
    const tools = getRegisteredTools()

    const result = await streamText({
      model, // Pass model string directly, not gateway(model)
      messages: convertToModelMessages(messages),
      system: SYSTEM_PROMPT,
      temperature: 0.5,
      maxTokens: 2048,
      tools,
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    // Handle specific AI errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return new Response(JSON.stringify({ error: "Invalid API key. Please check your configuration." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (error.message.includes("rate limit")) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    return new Response(JSON.stringify({ error: "Failed to process request. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

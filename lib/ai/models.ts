import { createGateway } from "@ai-sdk/gateway"

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
})

export function getModel(modelId = "openai/gpt-4o") {
  const apiKey = process.env.AI_GATEWAY_API_KEY

  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is not configured")
  }

  return gateway(modelId)
}

export const DEFAULT_CHAT_MODEL = "openai/gpt-5"

// Additional updates can be made here if necessary

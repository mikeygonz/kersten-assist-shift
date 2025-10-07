import { tool, generateText } from "ai"
import { z } from "zod"

export type RegisteredTools = Record<string, unknown>

/**
 * Register your AI tools here.
 *
 * Example usage in your app:
 * 1. Define the tool with inputSchema using Zod schemas (AI SDK v5)
 * 2. Implement the execute function as a generator (async *execute)
 * 3. Use yield to stream progress updates to the UI
 * 4. AI Gateway will automatically call it when needed
 *
 * The example tools below show how to create tools with the AI SDK v5.
 * Remove them and add your own tools for your use case.
 */
export function getRegisteredTools(): RegisteredTools {
  return {
    webSearch: tool({
      description:
        "Search the web for current information, news, research, or any topic that requires up-to-date knowledge. Use this when the user asks about recent events, current data, or information not in your training data.",
      inputSchema: z.object({
        query: z.string().describe("The search query to look up on the web"),
      }),
      async *execute({ query }) {
        try {
          // Yield loading state to UI
          yield {
            state: "searching" as const,
            query,
          }

          // Use Perplexity Sonar for web search via AI Gateway
          const { text, response } = await generateText({
            model: "perplexity/sonar",
            prompt: `Search the web and provide accurate, well-sourced information about: ${query}
            
Include relevant citations and sources in your response.`,
            temperature: 0.2,
            maxTokens: 1024,
          })

          // Extract citations from response metadata if available
          const citations = (response as any)?.citations || []

          // Yield final results to UI
          yield {
            state: "complete" as const,
            query,
            content: text,
            citations,
            citationCount: citations.length,
          }
        } catch (error) {
          console.error("[Web Search Error]", error)

          // Yield error state to UI
          yield {
            state: "error" as const,
            query,
            error: error instanceof Error ? error.message : "Web search failed",
          }
        }
      },
    }),

    // Example: Simple calculator tool
    calculate: tool({
      description:
        "Perform basic mathematical calculations. Supports addition, subtraction, multiplication, and division.",
      inputSchema: z.object({
        operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The mathematical operation to perform"),
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
      execute: async ({ operation, a, b }) => {
        let result: number
        switch (operation) {
          case "add":
            result = a + b
            break
          case "subtract":
            result = a - b
            break
          case "multiply":
            result = a * b
            break
          case "divide":
            if (b === 0) {
              return { error: "Cannot divide by zero" }
            }
            result = a / b
            break
        }
        return { result, operation, a, b }
      },
    }),
  }
}

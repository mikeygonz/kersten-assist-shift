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
    presentShiftTask: tool({
      description:
        "Present a shift coverage task to the manager. Use this when notifying about shifts that need coverage. This displays an interactive card with shift details and action buttons.",
      inputSchema: z.object({
        taskId: z.string().describe("Unique identifier for this shift task"),
        date: z.string().describe("Date of the shift (e.g., 'Tuesday, November 4, 2025')"),
        startTime: z.string().describe("Start time of the shift (e.g., '8:30am')"),
        endTime: z.string().describe("End time of the shift (e.g., '12:30pm')"),
        location: z.string().describe("Location of the shift (e.g., '1234 East Street Rd.')"),
        role: z.string().describe("Role needed for the shift (e.g., 'Drive-Thru')"),
        employeeName: z.string().describe("Name of the employee who needs coverage (e.g., 'Reyna Benson')"),
        employeeRole: z.string().describe("Role/title of the employee (e.g., 'Crew Member')"),
        reason: z.string().describe("Reason for needing coverage (e.g., 'Daughter's doctor appointment conflict')"),
      }),
      execute: async ({ taskId, date, startTime, endTime, location, role, employeeName, employeeRole, reason }) => {
        return {
          type: "shift_task",
          task: {
            id: taskId,
            date,
            startTime,
            endTime,
            location,
            role,
            employeeName,
            employeeRole,
            reason,
            status: "pending",
          },
        }
      },
    }),

    startShiftCoverageWorkflow: tool({
      description:
        "Start the shift coverage workflow when the manager confirms they want help finding coverage. This transitions the UI to show candidate employees for the shift.",
      inputSchema: z.object({
        userConfirmed: z.boolean().describe("Whether the user confirmed they want help (true for Yes, false for No)"),
        shiftId: z.string().describe("The ID of the shift that needs coverage"),
      }),
      execute: async ({ userConfirmed, shiftId }) => {
        if (!userConfirmed) {
          return {
            type: "workflow_declined",
            message: "No problem! Let me know if you need anything else.",
          }
        }

        return {
          type: "workflow_started",
          shiftId,
          message: "Great! Let me find available employees who can cover this shift.",
        }
      },
    }),

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

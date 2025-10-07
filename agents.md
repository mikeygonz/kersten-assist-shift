# AI Agents with Vercel AI SDK v5

This guide covers how to build AI agents with tools using the Vercel AI SDK v5.

## Core Concepts

### Tools

Tools allow AI models to perform actions like web searches, calculations, database queries, and more. In AI SDK v5, tools are defined using the `tool()` function with:

- **inputSchema**: Zod schema defining the tool's input parameters
- **execute**: Function that performs the tool's action
- **description**: Clear description of what the tool does (helps the model decide when to use it)

### Multi-Step Execution

AI agents can execute multiple steps in a conversation:
1. Model generates a tool call
2. Tool executes and returns results
3. Model receives tool results and generates a response
4. Process repeats if model calls more tools

Use `stopWhen: stepCountIs(N)` to limit the number of steps.

## Tool Patterns

### Basic Tool (Synchronous)

\`\`\`typescript
import { tool } from "ai"
import { z } from "zod"

const calculateTool = tool({
  description: "Perform basic mathematical calculations",
  inputSchema: z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ operation, a, b }) => {
    let result: number
    switch (operation) {
      case "add": result = a + b; break
      case "subtract": result = a - b; break
      case "multiply": result = a * b; break
      case "divide": 
        if (b === 0) return { error: "Cannot divide by zero" }
        result = a / b
        break
    }
    return { result, operation, a, b }
  },
})
\`\`\`

### Streaming Tool (Generator Function)

Use generator functions (`async *execute`) to stream progress updates to the UI:

\`\`\`typescript
const webSearchTool = tool({
  description: "Search the web for current information",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  async *execute({ query }) {
    // Yield loading state
    yield { state: "searching" as const, query }
    
    try {
      // Perform search
      const { text } = await generateText({
        model: "perplexity/sonar",
        prompt: `Search: ${query}`,
      })
      
      // Yield final results
      yield { 
        state: "complete" as const, 
        query, 
        content: text 
      }
    } catch (error) {
      // Yield error state
      yield { 
        state: "error" as const, 
        query, 
        error: error.message 
      }
    }
  },
})
\`\`\`

### Tool with Nested AI Calls

Tools can call other AI models internally:

\`\`\`typescript
const researchTool = tool({
  description: "Research a topic in depth",
  inputSchema: z.object({
    topic: z.string(),
  }),
  async *execute({ topic }) {
    yield { state: "researching" as const }
    
    // Use another AI model for research
    const { text } = await generateText({
      model: "perplexity/sonar",
      prompt: `Research: ${topic}`,
      temperature: 0.2,
    })
    
    yield { state: "complete" as const, content: text }
  },
})
\`\`\`

## Chat Route Setup

### Basic Setup (v0/Next.js)

**Important**: In v0's Next.js runtime, the AI Gateway is handled automatically. Do NOT use `createGateway()`.

\`\`\`typescript
import { streamText, convertToModelMessages, stepCountIs } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const result = await streamText({
    model: "anthropic/claude-sonnet-4.5",
    messages: convertToModelMessages(messages),
    tools: {
      webSearch: webSearchTool,
      calculate: calculateTool,
    },
    stopWhen: stepCountIs(5), // Allow up to 5 steps
  })
  
  return result.toUIMessageStreamResponse()
}
\`\`\`

### Basic Setup (Standard Node.js)

If you're NOT using v0/Next.js runtime, you need to manually create a gateway:

\`\`\`typescript
import { streamText, convertToModelMessages, stepCountIs } from "ai"
import { createGateway } from "@ai-sdk/gateway"

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  const result = await streamText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    messages: convertToModelMessages(messages),
    tools: {
      webSearch: webSearchTool,
      calculate: calculateTool,
    },
    stopWhen: stepCountIs(5),
  })
  
  return result.toUIMessageStreamResponse()
}
\`\`\`

### With System Prompt

\`\`\`typescript
const SYSTEM_PROMPT = `You are a helpful AI assistant with access to tools.
Use the webSearch tool for current information.
Use the calculate tool for math operations.`

const result = await streamText({
  model: "anthropic/claude-sonnet-4.5",
  messages: convertToModelMessages(messages),
  system: SYSTEM_PROMPT,
  tools: { webSearch, calculate },
  stopWhen: stepCountIs(5),
})
\`\`\`

### With Model Selection

\`\`\`typescript
const { messages, selectedModel } = await req.json()

const result = await streamText({
  model: selectedModel || "anthropic/claude-sonnet-4.5",
  messages: convertToModelMessages(messages),
  tools: getRegisteredTools(),
  stopWhen: stepCountIs(5),
})
\`\`\`

## Best Practices

### 1. Clear Tool Descriptions

Write clear, specific descriptions that help the model understand when to use each tool:

\`\`\`typescript
// ❌ Bad
description: "Search tool"

// ✅ Good
description: "Search the web for current information, news, research, or any topic that requires up-to-date knowledge. Use this when the user asks about recent events, current data, or information not in your training data."
\`\`\`

### 2. Descriptive Input Schemas

Use `.describe()` on Zod schemas to provide context:

\`\`\`typescript
inputSchema: z.object({
  query: z.string().describe("The search query to look up on the web"),
  depth: z.enum(["basic", "advanced"]).describe("Search depth: basic for quick answers, advanced for comprehensive research"),
})
\`\`\`

### 3. Error Handling

Always handle errors gracefully in tools:

\`\`\`typescript
async *execute({ query }) {
  try {
    yield { state: "loading" as const }
    const result = await performSearch(query)
    yield { state: "complete" as const, result }
  } catch (error) {
    console.error("[Tool Error]", error)
    yield { 
      state: "error" as const, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
\`\`\`

### 4. Progress Updates

Use generator functions to provide real-time feedback:

\`\`\`typescript
async *execute({ task }) {
  yield { state: "starting" as const }
  
  // Step 1
  yield { state: "processing" as const, step: 1, total: 3 }
  await doStep1()
  
  // Step 2
  yield { state: "processing" as const, step: 2, total: 3 }
  await doStep2()
  
  // Step 3
  yield { state: "processing" as const, step: 3, total: 3 }
  await doStep3()
  
  yield { state: "complete" as const, result }
}
\`\`\`

### 5. Step Limits

Set appropriate step limits based on your use case:

\`\`\`typescript
// Simple Q&A: 2-3 steps
stopWhen: stepCountIs(3)

// Complex agents: 5-10 steps
stopWhen: stepCountIs(10)

// Research agents: 10-20 steps
stopWhen: stepCountIs(20)
\`\`\`

## Common Patterns

### Web Search Agent

\`\`\`typescript
const tools = {
  webSearch: tool({
    description: "Search the web for current information",
    inputSchema: z.object({ query: z.string() }),
    async *execute({ query }) {
      yield { state: "searching" as const }
      const { text } = await generateText({
        model: "perplexity/sonar",
        prompt: `Search: ${query}`,
      })
      yield { state: "complete" as const, content: text }
    },
  }),
}
\`\`\`

### Database Agent

\`\`\`typescript
const tools = {
  queryDatabase: tool({
    description: "Query the database for information",
    inputSchema: z.object({ 
      query: z.string().describe("SQL query to execute") 
    }),
    async execute({ query }) {
      const results = await db.query(query)
      return { results, count: results.length }
    },
  }),
}
\`\`\`

### Multi-Tool Agent

\`\`\`typescript
const tools = {
  webSearch: webSearchTool,
  calculate: calculateTool,
  getWeather: weatherTool,
  sendEmail: emailTool,
}

const result = await streamText({
  model: "anthropic/claude-sonnet-4.5",
  messages: convertToModelMessages(messages),
  system: "You are a helpful assistant with access to multiple tools. Use them wisely to help the user.",
  tools,
  stopWhen: stepCountIs(10),
})
\`\`\`

## Debugging

### Enable Logging

\`\`\`typescript
const result = await streamText({
  model: "anthropic/claude-sonnet-4.5",
  messages: convertToModelMessages(messages),
  tools,
  stopWhen: stepCountIs(5),
  onFinish: (options) => {
    console.log("[AI] Finished:", {
      steps: options.steps,
      usage: options.usage,
      finishReason: options.finishReason,
    })
  },
})
\`\`\`

### Tool Callbacks

\`\`\`typescript
const tool = tool({
  description: "Example tool",
  inputSchema: z.object({ input: z.string() }),
  execute: async ({ input }) => {
    return { result: input }
  },
  onInputStart: () => console.log("Tool input started"),
  onInputDelta: ({ inputTextDelta }) => console.log("Input delta:", inputTextDelta),
  onInputAvailable: ({ input }) => console.log("Input available:", input),
})
\`\`\`

## Resources

- [AI SDK Documentation](https://sdk.vercel.ai)
- [AI SDK Core Reference](https://sdk.vercel.ai/docs/reference/ai-sdk-core)
- [Tool API Reference](https://sdk.vercel.ai/docs/reference/ai-sdk-core/tool)
- [stepCountIs Reference](https://sdk.vercel.ai/docs/reference/ai-sdk-core/step-count-is)

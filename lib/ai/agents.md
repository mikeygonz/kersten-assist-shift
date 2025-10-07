# Agent & Tool Design Guide

Quick reference for implementing AI tools with Vercel AI SDK 5.0+.

### AI Tools

**IMPORTANT:** All AI tools MUST be added to `lib/ai/tools.ts` in the `getRegisteredTools()` function. 

- DO NOT create a `lib/ai/tools/` folder or `lib/ai/tools/index.ts`
- ALWAYS add new tools to the existing `lib/ai/tools.ts` file
- Follow the existing pattern: define tools using `tool()` from the AI SDK with inputSchema and execute function

## Core Principles

### Single Responsibility
Each tool does one thing well.

\`\`\`typescript
// ✅ Good
getWeather: tool({ ... })
searchFlights: tool({ ... })

// ❌ Bad - too many responsibilities
travelHelper: tool({ /* handles weather, flights, hotels */ })
\`\`\`

### Clear Descriptions
The AI model uses your description to decide when to call the tool.

\`\`\`typescript
// ✅ Good
description: 'Search for available flights between two cities on a specific date'

// ❌ Bad
description: 'Flight tool'
\`\`\`

### Consistent Returns
Always return predictable structures.

\`\`\`typescript
// Always return this pattern
return { success: true, data: { ... } }
// or
return { success: false, error: 'Error message' }
\`\`\`

## Tool Anatomy

Every tool uses the `tool` helper from Vercel AI SDK:

\`\`\`typescript
import { tool } from 'ai';
import { z } from 'zod';

const myTool = tool({
  description: 'What the tool does (for AI model)',
  parameters: z.object({
    param: z.string().describe('Parameter description'),
  }),
  execute: async ({ param }) => {
    return { success: true, data: result };
  },
})
\`\`\`

## Parameter Design

Use Zod schemas with `.describe()` for each parameter:

\`\`\`typescript
parameters: z.object({
  query: z.string().describe('Search query'),
  limit: z.number().describe('Max results'),
  sortBy: z.enum(['date', 'relevance']).describe('Sort order'),
  
  // Use .nullable() for optional params (not .optional())
  category: z.string().nullable().describe('Optional filter'),
})
\`\`\`

### Important: Nullable vs Optional

Use `.nullable()` instead of `.optional()` for strict schema validation:

\`\`\`typescript
// ❌ May fail with strict validation
workdir: z.string().optional()

// ✅ Works with strict validation  
workdir: z.string().nullable()
\`\`\`

## Execute Function Patterns

### Basic Pattern

\`\`\`typescript
execute: async ({ param1, param2 }) => {
  try {
    const result = await performOperation(param1, param2);
    return { success: true, data: result };
  } catch (error) {
    console.error('[Tool Error]', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Operation failed'
    };
  }
}
\`\`\`

### With Validation

\`\`\`typescript
execute: async ({ email, age }) => {
  if (age < 18) {
    return { success: false, error: 'Must be 18+' };
  }
  
  // Continue with operation
  const result = await processUser(email, age);
  return { success: true, data: result };
}
\`\`\`

## Streaming Patterns

### Route Handler with Streaming

\`\`\`typescript
import { streamText } from 'ai';
import { createDataStreamResponse } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: { myTool },
    maxSteps: 5,
  });

  return createDataStreamResponse({
    async execute(dataStream) {
      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => `Error: ${error}`,
  });
}
\`\`\`

### Progress Updates in Tools

\`\`\`typescript
const processFile = tool({
  description: 'Process file with progress updates',
  parameters: z.object({
    fileId: z.string(),
  }),
  execute: async ({ fileId }) => {
    dataStream.writeData({ status: 'starting' });
    
    for (let i = 0; i <= 100; i += 20) {
      await processChunk();
      dataStream.writeData({ progress: i });
    }
    
    dataStream.writeData({ status: 'complete' });
    return { success: true, fileId };
  },
})
\`\`\`

### Multi-Step Operations

\`\`\`typescript
execute: async ({ appId }) => {
  try {
    dataStream.writeData({ step: 'build', status: 'starting' });
    await buildApp(appId);
    dataStream.writeData({ step: 'build', status: 'complete' });
    
    dataStream.writeData({ step: 'deploy', status: 'starting' });
    const url = await deploy(appId);
    dataStream.writeData({ step: 'deploy', status: 'complete', url });
    
    return { success: true, url };
  } catch (error) {
    dataStream.writeData({ step: 'error', message: error.message });
    return { success: false, error: error.message };
  }
}
\`\`\`

## Error Handling

Always return consistent error structures:

\`\`\`typescript
// Success
return { success: true, data: result }

// Error
return { success: false, error: 'Human-readable message' }
\`\`\`

### Graceful Degradation

\`\`\`typescript
execute: async ({ query }) => {
  try {
    const results = await primaryAPI(query);
    return { success: true, data: results };
  } catch (primaryError) {
    try {
      const results = await fallbackAPI(query);
      return { success: true, data: results, source: 'fallback' };
    } catch (fallbackError) {
      return { success: false, error: 'All sources unavailable' };
    }
  }
}
\`\`\`

### Stream Error Handling

\`\`\`typescript
return createDataStreamResponse({
  async execute(dataStream) {
    try {
      const result = await riskyOperation();
      dataStream.writeData(result);
    } catch (error) {
      dataStream.writeData({ 
        type: 'error',
        message: error.message 
      });
    }
  },
  onError: (error) => `Operation failed: ${error}`,
});
\`\`\`

## Type Safety

### Infer Types from Zod

\`\`\`typescript
const paramsSchema = z.object({
  query: z.string(),
  limit: z.number().default(10),
});

type Params = z.infer<typeof paramsSchema>;

const myTool = tool({
  description: 'Search with type-safe params',
  parameters: paramsSchema,
  execute: async (params: Params) => {
    // params is fully typed
    const { query, limit } = params;
    return { success: true, data: [] };
  },
})
\`\`\`

## Complete Example

\`\`\`typescript
import { tool } from 'ai';
import { z } from 'zod';

const searchUsers = tool({
  description: 'Search users by name or email',
  inputSchema: z.object({
    query: z.string().min(2).describe('Search query'),
    limit: z.number().min(1).max(100).default(10),
  }),
  execute: async ({ query, limit }) => {
    try {
      dataStream.writeData({ type: 'search-started', query });
      
      const results = await db.users.search(query, limit);
      
      results.forEach((user, index) => {
        dataStream.writeData({
          type: 'result',
          index: index + 1,
          user,
        });
      });
      
      return {
        success: true,
        data: { results, count: results.length },
      };
    } catch (error) {
      console.error('[Search Error]', error);
      return { 
        success: false, 
        error: 'Search failed' 
      };
    }
  },
})
\`\`\`

## Web Search Tool Example

Here's a complete implementation of a web search tool using Perplexity's Sonar-Pro API **through Vercel AI Gateway**:

\`\`\`typescript
import { tool, generateText } from 'ai';
import { z } from 'zod';

const webSearch = tool({
  description: 'Search the web for current information, news, research, or any topic that requires up-to-date knowledge. Use this when the user asks about recent events, current data, or information not in your training data.',
  parameters: z.object({
    query: z.string().describe('The search query to look up on the web'),
    searchDepth: z.enum(['basic', 'advanced']).default('basic').describe('Search depth: basic for quick results, advanced for comprehensive research'),
  }),
  execute: async ({ query, searchDepth }) => {
    try {
      // Notify UI that search has started
      dataStream.writeData({ 
        type: 'search-started', 
        query,
        timestamp: new Date().toISOString()
      });

      const model = searchDepth === 'advanced' ? 'perplexity/sonar-pro' : 'perplexity/sonar';

      const { text, response } = await generateText({
        model,
        prompt: `Search the web and provide accurate, well-sourced information about: ${query}
        
Include relevant citations and sources in your response.`,
        temperature: 0.2,
        maxTokens: 1024,
      });

      // Extract citations from response metadata if available
      const citations = (response as any)?.citations || [];

      // Notify UI of completion
      dataStream.writeData({ 
        type: 'search-complete', 
        query,
        resultCount: citations.length,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        data: {
          query,
          content: text,
          citations,
          searchDepth,
          timestamp: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error('[Web Search Error]', error);
      
      dataStream.writeData({ 
        type: 'search-error', 
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Web search failed' 
      };
    }
  },
});
\`\`\`

### Key Features of the Web Search Tool:

1. **AI Gateway Integration**: Uses Vercel AI Gateway for unified access - no separate API key needed
2. **Progress Updates**: Uses `dataStream.writeData()` to notify the UI when search starts, completes, or errors
3. **Error Handling**: Gracefully handles API errors with user-friendly messages
4. **Flexible Search Depth**: Supports both basic (sonar) and advanced (sonar-pro) search modes
5. **Citations**: Returns source citations for transparency and verification
6. **Type Safety**: Uses Zod schemas for parameter validation

### Setup Requirements:

1. Add `AI_GATEWAY_API_KEY` to your environment variables
2. Get your API key from: https://vercel.com/dashboard/ai-gateway
3. The AI model will automatically detect when to use web search based on the query
4. **No separate Perplexity API key needed** - AI Gateway handles authentication

### Why Use AI Gateway for Web Search?

- **Unified Authentication**: One API key for all providers including Perplexity
- **Better Rate Limiting**: AI Gateway manages rate limits across providers
- **Automatic Failover**: If one provider is down, AI Gateway can route to alternatives
- **Cost Optimization**: AI Gateway can route to the most cost-effective provider
- **Monitoring**: Built-in analytics and monitoring for all API calls

## Common Pitfalls

### ❌ Vague Descriptions

\`\`\`typescript
// Bad
description: 'Does stuff'

// Good
description: 'Searches products by name/SKU and returns prices and availability'
\`\`\`

### ❌ Using .optional() Instead of .nullable()

\`\`\`typescript
// Bad - may fail with strict validation
workdir: z.string().optional()

// Good
workdir: z.string().nullable()
\`\`\`

### ❌ Inconsistent Returns

\`\`\`typescript
// Bad
if (error) return "Error";
if (notFound) return null;
return { data };

// Good
if (error) return { success: false, error: "Error" };
if (notFound) return { success: false, error: "Not found" };
return { success: true, data };
\`\`\`

### ❌ No Progress for Long Operations

\`\`\`typescript
// Bad
await processLargeFile(); // 30 seconds, no feedback

// Good
dataStream.writeData({ status: 'starting' });
await processLargeFile();
dataStream.writeData({ status: 'complete' });
\`\`\`

## Quick Reference

### AI SDK 5.0+ Key Changes
- `parameters` → `inputSchema`
- Use `createDataStreamResponse` for streaming
- Prefer `.nullable()` over `.optional()`
- Import `tool` from `'ai'` package

### External API Integration Best Practices
- Use AI Gateway when possible for unified access to multiple providers
- Always validate API keys before making requests (AI Gateway handles this automatically)
- Implement proper error handling for common HTTP status codes (401, 429, 500)
- Use `dataStream.writeData()` to provide real-time feedback for long-running operations
- Include timestamps in progress updates for better UX
- Return citations/sources when fetching external data

### Resources
- [AI SDK Docs](https://sdk.vercel.ai/docs)
- [Tool Reference](https://sdk.vercel.ai/docs/reference/ai-sdk-core/tool)
- [Streaming Guide](https://sdk.vercel.ai/docs/ai-sdk-core/streaming)
- [AI Gateway Docs](https://vercel.com/docs/ai-gateway)
- [Perplexity via AI Gateway](https://vercel.com/docs/ai-gateway/providers/perplexity)

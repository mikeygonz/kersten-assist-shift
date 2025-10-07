# v0 Assist Template

A production-ready AI chat template built with Next.js 15 and Vercel AI SDK. Designed for teams to fork and quickly build AI-powered applications using Vercel AI Gateway.

## 🎯 Purpose

This template provides a **clean, minimal foundation** for the team to:

- Fork and start building AI features immediately
- Use Vercel AI Gateway to access multiple AI providers (OpenAI, Anthropic, Google, etc.)
- Prototype and develop AI applications in v0.dev or locally
- Scale from prototype to production without major refactoring

## ✨ Features

- 🤖 **Vercel AI Gateway** - Pre-configured for multi-provider AI access
- 🧠 **Claude Sonnet 4.5** - Default AI model (switchable to GPT-4o, Gemini, and others)
- 🔍 **Web Search Tool** - Integrated Perplexity Sonar via AI Gateway for real-time web information
- 🚀 **Zero Setup** - Works in v0.dev WebContainers out of the box
- 🎨 **Modern Design** - Beautiful UI with Tailwind CSS and Radix UI
- 📱 **Fully Responsive** - Works on desktop and mobile
- 💾 **No Database** - In-memory storage (easy to replace with your DB)
- 🔧 **Tool Calling Ready** - Example tools included with web search
- 📝 **Chat History** - Built-in conversation management
- 🏷️ **Chat Title Generation** - Automatic title generation for conversations
- ⚡ **Fast** - Native AI SDK usage, no unnecessary abstractions

## 🚀 Quick Start

### Option 1: Fork in v0.dev (Recommended)

1. **Import this template** into v0.dev
2. **Add your AI Gateway key** in environment settings:
   - Go to Settings → Environment Variables
   - Add `AI_GATEWAY_API_KEY=your-key-here`
   - Get your key from [Vercel AI Gateway Dashboard](https://vercel.com/dashboard/ai-gateway)
3. **Start building!** The app runs immediately in v0's WebContainer

### Option 2: Local Development

\`\`\`bash
# Clone your fork
git clone <your-fork-url>
cd v0-assist-template

# Install dependencies
pnpm install

# Set up environment
cp env.example .env.local

# Add your API keys
# Edit .env.local and add:
# AI_GATEWAY_API_KEY=vck_...

# Run development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Getting Your API Keys

### AI Gateway API Key (Required)

1. Go to [Vercel AI Gateway Dashboard](https://vercel.com/dashboard/ai-gateway)
2. Create a new key or copy an existing one
3. The key will look like: `vck_xxxxxxxxxxxxx`
4. Add it to your environment variables

**Note:** The AI Gateway key provides access to:
- **Claude Sonnet 4.5** (default model)
- **GPT-4o, GPT-5** and other OpenAI models
- **Gemini Pro** and other Google models
- **Perplexity Sonar** for web search (no separate API key needed)
- View the full list of available models at [vercel.com/ai-gateway/models](https://vercel.com/ai-gateway/models)

## 🏗️ Architecture

This template uses the **native Vercel AI SDK** with no custom wrappers:

\`\`\`typescript
// Client: src/components/chat.tsx
const chat = useChat({
  api: "/api/chat",
  id: chatId,
  onFinish: () => {
    /* persist messages */
  },
});

// Server: src/app/(chat)/api/chat/route.ts
const result = streamText({
  model: "anthropic/claude-sonnet-4.5",
  messages: convertToModelMessages(messages),
  system: SYSTEM_PROMPT,
  tools: getRegisteredTools(),
});

return result.toUIMessageStreamResponse();
\`\`\`

### Tool Architecture

The template includes a **zero-configuration tool system** built on the AI SDK's native function calling:

**📖 For comprehensive tool design patterns and best practices, see [Agent & Tool Design Guide](./src/lib/ai/agents.md)**

**Core Components:**

1. **Tool Registry** (`src/lib/ai/tools/index.ts`)
   - Central location where all tools are defined and exported
   - Uses `getRegisteredTools()` function that returns a record of tool definitions
   - Receives `ToolContext` containing `dataStream` for real-time UI updates

2. **Tool Definition Structure**
   \`\`\`typescript
   tool({
     description: 'What the tool does (AI reads this)',
     inputSchema: z.object({
       param: z.string().describe('Parameter description'),
     }),
     execute: async ({ param }) => {
       // Your business logic here
       return { success: true, data: 'data' };
     },
   })
   \`\`\`

3. **Tool Integration** (`src/app/(chat)/api/chat/route.ts`)
   - Tools are passed to `streamText()` via the `tools` parameter
   - Uses `maxSteps` to allow multi-step tool usage
   - Currently commented out by default (uncomment to enable)

**Key Features:**

- **Type Safety**: TypeScript + Zod for runtime validation
- **Streaming Support**: Tools work seamlessly with AI streaming
- **Data Stream**: Send real-time updates via `dataStream.writeData()`
- **Zero Config**: No separate registry or complex setup needed
- **Native SDK**: Uses AI SDK's built-in tool system without wrappers

**Tool Lifecycle:**

1. AI model decides to call a tool based on user input and tool descriptions
2. AI SDK validates parameters using Zod schema
3. `execute()` function runs with validated parameters
4. Results are automatically sent back to the AI model
5. AI model can call additional tools (up to `maxSteps`) or generate final response

## 🔍 Web Search Tool

The template includes a production-ready web search tool that integrates Perplexity Sonar via AI Gateway:

### Features

- **Automatic Detection**: AI automatically detects when queries need current information
- **No Separate API Key**: Uses AI Gateway for unified authentication
- **Real-time Updates**: Progress notifications sent to UI during search
- **Citations Included**: Returns source citations for transparency
- **Error Handling**: Graceful handling of API errors with user-friendly messages

### How It Works

\`\`\`typescript
// The AI automatically calls this tool when needed
webSearch: tool({
  description: 'Search the web for current information, news, research...',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }) => {
    // Calls Perplexity Sonar via AI Gateway
    const { text } = await generateText({
      model: 'perplexity/sonar',
      prompt: `Search: ${query}`,
    });
    return { success: true, data: text };
  },
})
\`\`\`

### Example Queries That Trigger Web Search

- "What are the latest AI developments in 2025?"
- "Current stock price of Tesla"
- "Recent news about climate change"
- "What's trending on social media today?"

**For detailed implementation guide, see [Agent & Tool Design Guide](./src/lib/ai/agents.md#web-search-tool-example)**

### Example Tools

The template includes an example **calculator tool** in `src/lib/ai/tools/index.ts` to demonstrate tool patterns. This is meant to be removed and replaced with your own custom tools.

## 🎛️ Customization Guide

### 1. Change the AI Model

Edit `src/app/(chat)/api/chat/route.ts`:

\`\`\`typescript
// Change from Claude Sonnet 4.5 to any supported model:
const result = streamText({
  model: "anthropic/claude-sonnet-4.5",           // Claude Sonnet 4.5 (default)
  // model: "openai/gpt-4o",                      // GPT-4o
  // model: "openai/gpt-5",                       // GPT-5
  // model: "google/gemini-2.5-flash",            // Gemini Flash
  messages: convertToModelMessages(messages),
  system: SYSTEM_PROMPT,
  tools: getRegisteredTools(),
});
\`\`\`

**Available models via AI Gateway:**

- Anthropic: `anthropic/claude-sonnet-4.5`, `anthropic/claude-opus-4`, `anthropic/claude-haiku-4`
- OpenAI: `openai/gpt-5`, `openai/gpt-4o`, `openai/gpt-5-mini`
- Google: `google/gemini-pro`, `google/gemini-2.5-flash`
- Perplexity: `perplexity/sonar`, `perplexity/sonar-pro` (for web search)
- View the full list at [vercel.com/ai-gateway/models](https://vercel.com/ai-gateway/models)

### 2. Customize the System Prompt

Edit `src/lib/ai/prompts.ts`:

\`\`\`typescript
export const SYSTEM_PROMPT = `You are a helpful assistant specialized in [YOUR DOMAIN].

Key behaviors:
- [Behavior 1]
- [Behavior 2]
- [Behavior 3]

Always maintain a [TONE] tone.`;
\`\`\`

### 3. Add Custom Tools (Function Calling)

The tool system is designed for simplicity - just add your tool to the registry and it works.

**💡 For detailed tool design patterns, examples, and best practices, see the [Agent & Tool Design Guide](./src/lib/ai/agents.md)**

**Step 1: Define Your Tool** in `src/lib/ai/tools/index.ts`:

\`\`\`typescript
import { tool } from "ai";
import { z } from "zod";

export function getRegisteredTools({
  dataStream,
}: ToolContext): RegisteredTools {
  return {
    // Your custom tool
    yourCustomTool: tool({
      description: "What your tool does (AI reads this to decide when to use it)",
      inputSchema: z.object({
        param1: z.string().describe("Parameter description for the AI"),
        param2: z.number().describe("Another parameter"),
      }),
      execute: async ({ param1, param2 }) => {
        // Your tool logic here
        // Call APIs, query databases, etc.
        const result = await yourBusinessLogic(param1, param2);
        
        // Optional: Send real-time updates to the UI
        dataStream.writeData({
          type: 'custom-event',
          data: { status: 'processing' }
        });
        
        return { success: true, data: result };
      },
    }),
  };
}
\`\`\`

**Tool Best Practices:**

- **Clear descriptions**: The AI reads these to decide when to use the tool
- **Descriptive parameters**: Add `.describe()` to each Zod field
- **Error handling**: Return error objects instead of throwing
- **Type safety**: Use Zod schemas for all parameters
- **Real-time updates**: Use `dataStream.writeData()` for progress updates

**📚 See the [Agent & Tool Design Guide](./src/lib/ai/agents.md) for complete examples, common pitfalls, and advanced patterns**

### 4. Replace In-Memory Storage with a Database

The template uses in-memory storage by default. To add persistence:

**Option A: Vercel Postgres**

\`\`\`typescript
// src/lib/db/queries.ts
import { sql } from "@vercel/postgres";

export async function saveChat({ id, title }: { id: string; title: string }) {
  await sql`
    INSERT INTO chats (id, title, created_at)
    VALUES (${id}, ${title}, NOW())
    ON CONFLICT (id) DO UPDATE SET title = ${title}
  `;
}
\`\`\`

**Option B: Keep it simple with local storage only** (current implementation - works great for prototypes!)

### 5. Add Authentication

This template has no auth by default. To add it:

**Option A: Clerk**

\`\`\`bash
pnpm add @clerk/nextjs
\`\`\`

\`\`\`typescript
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
\`\`\`

**Option B: Next-Auth**

\`\`\`bash
pnpm add next-auth
\`\`\`

Then follow [Next-Auth setup guide](https://next-auth.js.org/getting-started/example).

### 6. Customize the UI

The template uses Tailwind CSS and Radix UI. All components are in `src/components/`.

**Change colors:**

Edit `tailwind.config.ts` or update component styles directly.

**Add new UI components:**

\`\`\`bash
# Use shadcn/ui to add pre-built components
npx shadcn@latest add [component-name]
\`\`\`

## 📚 Key Files to Customize

| File                               | Purpose             | When to Edit              |
| ---------------------------------- | ------------------- | ------------------------- |
| `src/lib/ai/prompts.ts`            | System prompt       | Customize AI behavior     |
| `src/lib/ai/models.ts`             | Model configuration | Change AI provider/model  |
| `src/lib/ai/tools/index.ts`        | Tool definitions    | Add/modify tools          |
| `src/lib/ai/agents.md`             | Tool design guide   | Learn tool best practices |
| `src/app/(chat)/api/chat/route.ts` | Chat API endpoint   | Advanced AI configuration |
| `src/components/chat.tsx`          | Main chat UI        | Change chat interface     |
| `src/lib/db/queries.ts`            | Data storage        | Add database integration  |

## 🔧 Advanced Configuration

### Enable Tool Calling

Tools are defined in `src/lib/ai/tools/index.ts` and enabled in the chat route:

1. **Tools are already enabled** - The web search tool and calculator are ready to use

2. **Add your own tools** in `src/lib/ai/tools/index.ts`:

\`\`\`typescript
export function getRegisteredTools({ dataStream }: ToolContext): RegisteredTools {
  return {
    webSearch: tool({ /* ... */ }), // Already included
    calculate: tool({ /* ... */ }),  // Already included
    
    // Add your custom tool here
    myTool: tool({
      description: 'Tool description',
      inputSchema: z.object({
        input: z.string().describe('Input description'),
      }),
      execute: async ({ input }) => {
        // Tool logic
        return { success: true, data: 'data' };
      },
    }),
  };
}
\`\`\`

**Tool Context:**

- `dataStream`: Send real-time updates to the UI during tool execution
- Use `dataStream.writeData()` to push custom events to the client

**Tool Execution:**

- Tools run automatically when the AI decides they're needed
- Results are sent back to the AI model for processing
- The AI can call multiple tools in sequence (up to `maxSteps`)
- All tool calls are streamed to the UI in real-time

**📚 For comprehensive tool examples and patterns, see [Agent & Tool Design Guide](./src/lib/ai/agents.md)**

## 🤔 Common Questions

**Q: Can I use this without v0.dev?**
A: Yes! Clone the repo and run it locally or deploy it anywhere.

**Q: Do I need Vercel to use this?**
A: No, but you do need a Vercel AI Gateway API key (free to get).

**Q: Can I use OpenAI directly instead of AI Gateway?**
A: Yes, but AI Gateway gives you unified access to multiple providers and better rate limiting.

**Q: How do I add streaming support for tools?**
A: Tools already stream! The AI SDK handles it automatically.

**Q: Do I need a separate Perplexity API key for web search?**
A: No! The web search tool uses Perplexity Sonar through AI Gateway, so your `AI_GATEWAY_API_KEY` is all you need.

**Q: What AI model is used by default?**
A: Claude Sonnet 4.5 via AI Gateway. You can easily switch to GPT-4o, Gemini, or other models in the chat route.

**Q: Can I use this in production?**
A: Yes, but add:

- Real database (replace in-memory storage)
- Authentication
- Rate limiting
- Error monitoring
- Proper logging

## 📝 License

MIT - feel free to use this for any project!

## 🙏 Credits

Built with:

- [Vercel AI SDK](https://ai-sdk.dev) - AI streaming and tool calling
- [Next.js 15](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://radix-ui.com) - UI primitives
- [Framer Motion](https://framer.com/motion) - Animations

---

**Ready to build?** Fork this template and start shipping AI features! 🚀

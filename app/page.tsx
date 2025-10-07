import { cookies } from "next/headers"
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models"
import { HomeClient } from "@/components/home-client"

export const dynamic = "force-dynamic"

export default async function Home() {
  const cookieStore = await cookies()
  const modelIdFromCookie = cookieStore.get("chat-model")

  // Additional logic can be added here if needed

  return <HomeClient initialChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL} />
}

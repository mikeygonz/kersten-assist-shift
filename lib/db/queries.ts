import "server-only"
import type { Chat, Message as MessageRow } from "./schema"

// In-memory storage implementation
// No database dependencies required

type InMemoryStore = {
  chats: Map<string, Chat>
  messages: Map<string, MessageRow>
}

type GlobalWithMemory = typeof globalThis & {
  __inMemoryStore?: InMemoryStore
}

function getInMemoryStore(): InMemoryStore {
  const globalWithMemory = globalThis as GlobalWithMemory
  if (!globalWithMemory.__inMemoryStore) {
    globalWithMemory.__inMemoryStore = {
      chats: new Map(),
      messages: new Map(),
    }
  }
  return globalWithMemory.__inMemoryStore
}

// Chat operations
export async function saveChat({ id, title }: { id: string; title: string }) {
  const store = getInMemoryStore()
  const existing = store.chats.get(id)
  const chatRecord: Chat = existing ?? {
    id,
    title,
    createdAt: new Date(),
  }
  const updatedChat: Chat = { ...chatRecord, title }
  store.chats.set(id, updatedChat)
  return updatedChat
}

export async function updateChatTitle({ id, title }: { id: string; title: string }) {
  const store = getInMemoryStore()
  const existing = store.chats.get(id)
  if (existing) {
    store.chats.set(id, { ...existing, title })
  }
}

export async function deleteChatById({ id }: { id: string }) {
  const store = getInMemoryStore()
  store.chats.delete(id)
  // Delete associated messages
  for (const [messageId, row] of store.messages) {
    if (row.chatId === id) {
      store.messages.delete(messageId)
    }
  }
}

export async function getAllChats() {
  const store = getInMemoryStore()
  return [...store.chats.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getChatById({ id }: { id: string }) {
  const store = getInMemoryStore()
  return store.chats.get(id) ?? null
}

// Message operations
type MessageInput = {
  id: string
  chatId: string
  role: string
  parts: unknown
  attachments: unknown
  createdAt: Date
}

export async function saveMessages({ messages }: { messages: MessageInput[] }) {
  const store = getInMemoryStore()
  const chatTimestamps = new Map<string, Date>()

  for (const message of messages) {
    const messageRecord: MessageRow = {
      id: message.id,
      chatId: message.chatId,
      role: message.role,
      parts: message.parts,
      attachments: message.attachments,
      createdAt: message.createdAt,
    }
    store.messages.set(message.id, messageRecord)

    const existingTimestamp = chatTimestamps.get(message.chatId)
    if (!existingTimestamp || existingTimestamp.getTime() < message.createdAt.getTime()) {
      chatTimestamps.set(message.chatId, message.createdAt)
    }
  }

  for (const [chatId, timestamp] of chatTimestamps) {
    const chatRecord = store.chats.get(chatId)
    if (chatRecord) {
      store.chats.set(chatId, {
        ...chatRecord,
        createdAt: timestamp,
      })
    }
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const store = getInMemoryStore()
  const messages = [...store.messages.values()]
    .filter((msg) => msg.chatId === id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  return messages
}

export async function getMessageById({ id }: { id: string }): Promise<MessageRow> {
  const store = getInMemoryStore()
  const message = store.messages.get(id)
  if (!message) {
    throw new Error(`Message with id ${id} not found`)
  }
  return message
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string
  timestamp: Date
}) {
  const store = getInMemoryStore()
  for (const [messageId, row] of store.messages) {
    if (row.chatId === chatId && row.createdAt > timestamp) {
      store.messages.delete(messageId)
    }
  }
}

// Additional updates can be added here if needed

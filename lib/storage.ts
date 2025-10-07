"use client";

import type { Message } from "@ai-sdk/react";

const CHAT_STORAGE_KEY = "v0-chat-history";
const CHAT_STORAGE_VERSION = 1 as const;

type ChatStorageVersion = typeof CHAT_STORAGE_VERSION;

export interface StoredChatMessage extends Message {
  createdAt?: string;
}

export interface StoredChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredChatMessage[];
  modelId?: string;
  draftInput?: string;
}

export interface ChatStorageSnapshot {
  version: ChatStorageVersion;
  currentChatId: string | null;
  sessions: StoredChatSession[];
}

const EMPTY_SNAPSHOT: ChatStorageSnapshot = {
  version: CHAT_STORAGE_VERSION,
  currentChatId: null,
  sessions: [],
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function validateSnapshot(candidate: unknown): candidate is ChatStorageSnapshot {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const snapshot = candidate as Partial<ChatStorageSnapshot>;
  if (snapshot.version !== CHAT_STORAGE_VERSION) {
    return false;
  }

  if (!Array.isArray(snapshot.sessions)) {
    return false;
  }

  for (const session of snapshot.sessions) {
    if (!session || typeof session !== "object") {
      return false;
    }

    if (typeof session.id !== "string") {
      return false;
    }

    if (typeof session.title !== "string") {
      return false;
    }

    if (typeof session.createdAt !== "string") {
      return false;
    }

    if (typeof session.updatedAt !== "string") {
      return false;
    }

    if (!Array.isArray(session.messages)) {
      return false;
    }
  }

  return true;
}

export function readChatStorage(): ChatStorageSnapshot {
  if (!isBrowser()) {
    return EMPTY_SNAPSHOT;
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return EMPTY_SNAPSHOT;
    }

    const parsed = JSON.parse(raw);
    if (validateSnapshot(parsed)) {
      return parsed;
    }

    return EMPTY_SNAPSHOT;
  } catch (error) {
    console.warn("[chat-storage] Failed to read chat history from localStorage", error);
    return EMPTY_SNAPSHOT;
  }
}

export function writeChatStorage(snapshot: ChatStorageSnapshot) {
  if (!isBrowser()) {
    return;
  }

  try {
    const payload: ChatStorageSnapshot = {
      version: CHAT_STORAGE_VERSION,
      currentChatId: snapshot.currentChatId,
      sessions: snapshot.sessions,
    };
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("[chat-storage] Failed to persist chat history", error);
  }
}

export function clearChatStorage() {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.warn("[chat-storage] Failed to clear chat history", error);
  }
}

export function getEmptySnapshot(): ChatStorageSnapshot {
  return {
    ...EMPTY_SNAPSHOT,
    sessions: [],
  };
}

export { CHAT_STORAGE_VERSION };

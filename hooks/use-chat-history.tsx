"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Message } from "@ai-sdk/react";
import { generateUUID } from "@/lib/utils";
import {
  type ChatStorageSnapshot,
  type StoredChatMessage,
  type StoredChatSession,
  getEmptySnapshot,
  readChatStorage,
  writeChatStorage,
} from "@/lib/storage";

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  modelId?: string;
  draftInput?: string;
}

interface ChatHistoryState {
  sessions: ChatSession[];
  currentChatId: string | null;
  isLoaded: boolean;
}

type CreateChatOptions = {
  id?: string;
  title?: string;
  select?: boolean;
  initialMessages?: Message[];
  modelId?: string;
  draftInput?: string;
};

type UpdateMessagesOptions = {
  updatedAt?: Date;
  persistDraftInput?: string | null;
};

export interface ChatHistoryContextValue {
  isLoaded: boolean;
  currentChatId: string | null;
  currentChat: ChatSession | null;
  sessions: ChatSession[];
  createChat: (options?: CreateChatOptions) => string | null;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  updateMessages: (
    id: string,
    messages: Message[],
    options?: UpdateMessagesOptions
  ) => void;
  updateTitle: (id: string, title: string) => void;
  updateModelId: (id: string, modelId: string) => void;
  updateDraftInput: (id: string, draft: string) => void;
  clearAll: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(null);

function toDate(value: string | Date | undefined): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed;
    }
  }
  return new Date();
}

function deserializeSession(session: StoredChatSession): ChatSession {
  return {
    id: session.id,
    title: session.title,
    createdAt: toDate(session.createdAt),
    updatedAt: toDate(session.updatedAt),
    modelId: session.modelId,
    draftInput: session.draftInput,
    messages: Array.isArray(session.messages)
      ? session.messages.map((message) => deserializeMessage(message))
      : [],
  };
}

function deserializeMessage(message: StoredChatMessage): Message {
  const createdAt = message.createdAt ? toDate(message.createdAt) : undefined;
  if (createdAt) {
    return { ...message, createdAt };
  }
  return { ...message };
}

function serializeSession(session: ChatSession): StoredChatSession {
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    modelId: session.modelId,
    draftInput: session.draftInput,
    messages: session.messages.map((message) => serializeMessage(message)),
  };
}

function serializeMessage(message: Message): StoredChatMessage {
  const createdAtValue = (() => {
    if (message.createdAt instanceof Date) {
      return message.createdAt.toISOString();
    }
    if (typeof message.createdAt === "string") {
      return message.createdAt;
    }
    return new Date().toISOString();
  })();

  return {
    ...message,
    createdAt: createdAtValue,
  };
}

function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

function getInitialState(): ChatHistoryState {
  return { sessions: [], currentChatId: null, isLoaded: false };
}

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const value = useChatHistoryInternal();
  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

function useChatHistoryInternal(): ChatHistoryContextValue {
  const [state, setState] = useState<ChatHistoryState>(() => {
    // Initialize immediately on client-side
    if (typeof window === "undefined") {
      return getInitialState();
    }

    try {
      const snapshot = readChatStorage();
      return {
        sessions: snapshot.sessions.map(deserializeSession),
        currentChatId: snapshot.currentChatId,
        isLoaded: true,
      };
    } catch (error) {
      console.error("[ChatHistory] Failed to load from storage:", error);
      return {
        sessions: [],
        currentChatId: null,
        isLoaded: true, // Mark as loaded even if error
      };
    }
  });

  useEffect(() => {
    if (!state.isLoaded) {
      return;
    }

    // Only persist chats that have messages
    const sessionsWithMessages = state.sessions.filter(
      (session) => session.messages.length > 0
    );

    const snapshot: ChatStorageSnapshot = {
      ...getEmptySnapshot(),
      currentChatId: state.currentChatId,
      sessions: sessionsWithMessages.map(serializeSession),
    };
    writeChatStorage(snapshot);
  }, [state.currentChatId, state.sessions, state.isLoaded]);

  const selectChat = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.isLoaded || prev.currentChatId === id) {
        return prev;
      }

      const hasChat = prev.sessions.some((session) => session.id === id);
      if (!hasChat) {
        return prev;
      }

      return {
        ...prev,
        currentChatId: id,
      };
    });
  }, []);

  const createChat = useCallback((options?: CreateChatOptions) => {
    const id = options?.id ?? generateUUID();
    const now = new Date();
    let didCreate = false;

    setState((prev) => {
      if (!prev.isLoaded) {
        return prev;
      }

      const initialMessages = (options?.initialMessages ?? []).map(
        (message) => ({
          ...message,
          createdAt: message.createdAt ? toDate(message.createdAt) : now,
        })
      );

      const session: ChatSession = {
        id,
        title: options?.title ?? "Untitled chat",
        createdAt: now,
        updatedAt: now,
        modelId: options?.modelId,
        draftInput: options?.draftInput,
        messages: initialMessages,
      };

      const nextSessions = sortSessions([
        session,
        ...prev.sessions.filter((s) => s.id !== id),
      ]);
      didCreate = true;

      return {
        ...prev,
        sessions: nextSessions,
        currentChatId:
          options?.select === false ? prev.currentChatId ?? null : id,
      };
    });

    return didCreate ? id : null;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.isLoaded) {
        return prev;
      }

      const nextSessions = prev.sessions.filter((session) => session.id !== id);
      if (nextSessions.length === prev.sessions.length) {
        return prev;
      }

      const nextCurrentId = (() => {
        if (prev.currentChatId !== id) {
          return prev.currentChatId;
        }
        return nextSessions.at(0)?.id ?? null;
      })();

      return {
        ...prev,
        sessions: nextSessions,
        currentChatId: nextCurrentId,
      };
    });
  }, []);

  const updateMessages = useCallback(
    (id: string, messages: Message[], options?: UpdateMessagesOptions) => {
      setState((prev) => {
        if (!prev.isLoaded) {
          return prev;
        }

        const index = prev.sessions.findIndex((session) => session.id === id);
        if (index === -1) {
          return prev;
        }

        const now = options?.updatedAt ?? new Date();
        const nextSessions = [...prev.sessions];
        const targetSession = nextSessions[index];

        const nextSession: ChatSession = {
          ...targetSession,
          updatedAt: now,
          messages: messages.map((message) => ({
            ...message,
            createdAt: message.createdAt ? toDate(message.createdAt) : now,
          })),
          draftInput:
            options?.persistDraftInput !== undefined
              ? options.persistDraftInput ?? undefined
              : targetSession.draftInput,
        };

        nextSessions[index] = nextSession;

        return {
          ...prev,
          sessions: sortSessions(nextSessions),
        };
      });
    },
    []
  );

  const updateTitle = useCallback((id: string, title: string) => {
    setState((prev) => {
      if (!prev.isLoaded) {
        return prev;
      }

      const index = prev.sessions.findIndex((session) => session.id === id);
      if (index === -1) {
        return prev;
      }

      const nextSessions = [...prev.sessions];
      nextSessions[index] = {
        ...nextSessions[index],
        title,
      };

      return {
        ...prev,
        sessions: nextSessions,
      };
    });
  }, []);

  const updateModelId = useCallback((id: string, modelId: string) => {
    setState((prev) => {
      if (!prev.isLoaded) {
        return prev;
      }

      const index = prev.sessions.findIndex((session) => session.id === id);
      if (index === -1) {
        return prev;
      }

      const nextSessions = [...prev.sessions];
      nextSessions[index] = {
        ...nextSessions[index],
        modelId,
      };

      return {
        ...prev,
        sessions: nextSessions,
      };
    });
  }, []);

  const updateDraftInput = useCallback((id: string, draft: string) => {
    setState((prev) => {
      if (!prev.isLoaded) {
        return prev;
      }

      const index = prev.sessions.findIndex((session) => session.id === id);
      if (index === -1) {
        return prev;
      }

      const nextSessions = [...prev.sessions];
      nextSessions[index] = {
        ...nextSessions[index],
        draftInput: draft,
      };

      return {
        ...prev,
        sessions: nextSessions,
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState((prev) => {
      if (!prev.isLoaded) {
        return prev;
      }
      return {
        sessions: [],
        currentChatId: null,
        isLoaded: true,
      };
    });
  }, []);

  const currentChat = useMemo(() => {
    if (!state.currentChatId) {
      return null;
    }
    return (
      state.sessions.find((session) => session.id === state.currentChatId) ??
      null
    );
  }, [state.currentChatId, state.sessions]);

  const value = useMemo<ChatHistoryContextValue>(
    () => ({
      isLoaded: state.isLoaded,
      currentChatId: state.currentChatId,
      currentChat,
      sessions: state.sessions,
      createChat,
      selectChat,
      deleteChat,
      updateMessages,
      updateTitle,
      updateModelId,
      updateDraftInput,
      clearAll,
    }),
    [
      clearAll,
      createChat,
      currentChat,
      deleteChat,
      selectChat,
      state.currentChatId,
      state.isLoaded,
      state.sessions,
      updateDraftInput,
      updateMessages,
      updateModelId,
      updateTitle,
    ]
  );

  return value;
}

export function useChatHistory(): ChatHistoryContextValue {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
}

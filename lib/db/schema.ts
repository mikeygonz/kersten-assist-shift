// Pure TypeScript interfaces - no database dependencies
export interface Chat {
  id: string;
  createdAt: Date;
  title: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: string;
  parts: unknown;
  attachments: unknown;
  createdAt: Date;
}

// Dummy exports for compatibility
export const chat = {};
export const message = {};

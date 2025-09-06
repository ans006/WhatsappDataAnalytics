export interface Message {
  id: string;
  timestamp: Date;
  sender: string;
  content: string;
  type: 'text' | 'media' | 'system';
}

export interface ChatData {
  messages: Message[];
  participants: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  totalMessages: number;
  mediaMessages: number;
  textMessages: number;
}

export interface Analytics {
  messagesByUser: Record<string, number>;
  messagesByDay: Record<string, number>;
  messagesByHour: Record<number, number>;
  wordFrequency: Record<string, number>;
  averageMessageLength: number;
  mostActiveDay: string;
  mostActiveHour: number;
  sentimentScores: Record<string, { positive: number; negative: number; neutral: number }>;
}
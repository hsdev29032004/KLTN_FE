export interface Sender {
  id: string;
  fullName: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
}

export interface Conversation {
  id: string;
  title: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

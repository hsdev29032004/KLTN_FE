export interface Sender {
  id: string;
  fullName: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  conversationId?: string;
  sender: Sender;
}

export interface ConversationCourse {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  user: Sender;
}

export interface ConversationMember {
  userId: string;
  isHost: boolean;
  user: Sender;
}

export interface Conversation {
  id: string;
  name: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  isHost: boolean;
  lastMessage: Message | null;
  course: ConversationCourse;
  _count: { messages: number; members: number };
}

export interface ConversationDetail {
  id: string;
  name: string;
  courseId: string;
  createdAt: string;
  course: ConversationCourse;
  members: ConversationMember[];
  messages: Message[];
}

export interface ConversationDetailResponse {
  message: string;
  data: ConversationDetail;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConversationListResponse {
  message: string;
  data: Conversation[];
}

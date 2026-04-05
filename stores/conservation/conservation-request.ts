import {
  Conversation,
  ConversationDetail,
  ConversationDetailResponse,
  ConversationListResponse,
  Message,
} from '@/types/conversation.type';
import { Base } from '../base';

export class ConversationRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getMyConversations(): Promise<ConversationListResponse> {
    return this.request('/api/conversation/my', {
      method: 'GET',
    });
  }

  async getConversationDetails(
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<ConversationDetailResponse> {
    return this.request(
      `/api/conversation/${conversationId}?page=${page}&limit=${limit}`,
      { method: 'GET' },
    );
  }

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<{ message: string; data: Message }> {
    return this.request(`/api/conversation/${conversationId}/messages`, {
      method: 'POST',
      data: { content },
    });
  }
}

export const conversationRequest = new ConversationRequest();

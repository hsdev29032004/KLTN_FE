import { Conversation } from '@/types/conversation.type';
import { Base } from '../base';

export class ConversationRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getInstructorConversations(
    instructorId: string,
  ): Promise<{ data: Conversation[] }> {
    return this.request(`/api/conversation/instructor/${instructorId}`, {
      method: 'GET',
    });
  }
}

export const conversationRequest = new ConversationRequest();

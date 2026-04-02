'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SDK from '@/stores/sdk';
import { ConversationDetail } from '@/types/conversation.type';
import { ConversationDetailView } from '@/components/conversation/conversation-detail-view';
import { Card } from '@/components/ui/card';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    SDK.getInstance()
      .getConversationDetails(conversationId)
      .then((res) => {
        setConversation(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load conversation');
        console.error('Error fetching conversation:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Đang tải đoạn chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6">
          <p className="text-lg text-red-500">Lỗi: {error}</p>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Không tìm thấy đoạn chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ConversationDetailView conversation={conversation} />
    </div>
  );
}

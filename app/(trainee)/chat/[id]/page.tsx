'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConversationStore } from '@/stores/conservation/conservation-store';
import { useAuthStore } from '@/stores/auth/auth-store';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2, Users } from 'lucide-react';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hôm nay';
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const { user } = useAuthStore();
  const {
    current: conversation,
    currentLoading,
    messageMeta,
    fetchConversationDetail,
    fetchOlderMessages,
    sendMessageREST,
    clearCurrent,
  } = useConversationStore();
  const { joinRoom, leaveRoom, sendMessage: socketSendMessage } = useChatSocket();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Fetch conversation and join room
  useEffect(() => {
    if (!conversationId) return;
    fetchConversationDetail(conversationId);
    joinRoom(conversationId);

    return () => {
      leaveRoom(conversationId);
      clearCurrent();
    };
  }, [conversationId]);

  // Auto-scroll to bottom on first load and new messages
  useEffect(() => {
    if (conversation?.messages && isFirstLoad.current) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
      isFirstLoad.current = false;
    }
  }, [conversation?.messages]);

  // Scroll to bottom on new message (if already near bottom)
  useEffect(() => {
    if (!conversation?.messages || isFirstLoad.current) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation?.messages?.length]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setNewMessage('');

    try {
      socketSendMessage(conversationId, content);
    } catch {
      // Fallback to REST
      await sendMessageREST(conversationId, content);
    }

    setIsSending(false);
    setTimeout(() => {
      const container = messagesContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoadOlder = async () => {
    if (!messageMeta || messageMeta.page >= messageMeta.totalPages || loadingOlder) return;
    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    setLoadingOlder(true);
    await fetchOlderMessages(conversationId, messageMeta.page + 1);
    setLoadingOlder(false);

    // Maintain scroll position
    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - prevScrollHeight;
      }
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: NonNullable<typeof conversation>['messages'] }[] = [];
  if (conversation?.messages) {
    let currentDate = '';
    for (const msg of conversation.messages) {
      const dateLabel = formatDateLabel(msg.createdAt);
      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groupedMessages.push({ date: dateLabel, messages: [] });
      }
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  if (currentLoading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy cuộc trò chuyện</p>
      </div>
    );
  }

  const canLoadMore = messageMeta && messageMeta.page < messageMeta.totalPages;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.course?.thumbnail} />
          <AvatarFallback>{conversation.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm line-clamp-1">{conversation.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {conversation.members?.length || 0} thành viên
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Load more */}
        {canLoadMore && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadOlder}
              disabled={loadingOlder}
            >
              {loadingOlder ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Tải tin nhắn cũ hơn
            </Button>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{group.date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-3">
              {group.messages.map((message) => {
                const isMine = message.sender.id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>
                        {message.sender.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col gap-0.5 max-w-xs lg:max-w-md ${isMine ? 'items-end' : ''}`}>
                      <div className={`flex items-baseline gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <p className="text-xs font-medium">{message.sender.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                      <Card
                        className={`w-fit px-3 py-2 ${
                          isMine
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm wrap-break-word">{message.content}</p>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4 shrink-0">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

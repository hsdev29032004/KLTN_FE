'use client';

import { ConversationDetail, Message } from '@/types/conversation.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConversationDetailViewProps {
  conversation: ConversationDetail;
}

export function ConversationDetailView({
  conversation,
}: ConversationDetailViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      // TODO: Call API to send message
      // const response = await SDK.getInstance().sendMessage(conversationId, newMessage);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For now, just add it to the local state
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 'current-user-id', // TODO: Get from auth store
          fullName: 'Current User', // TODO: Get from auth store
          avatar: '/avatars/01.png', // TODO: Get from auth store
        },
      };

      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{conversation.title}</h1>
            <p className="text-sm text-muted-foreground">
              {messages.length} tin nhắn
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-background p-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>
                    {message.sender.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold">
                      {message.sender.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                  <Card className="w-fit max-w-xs bg-muted p-3 lg:max-w-md">
                    <p className="break-words text-sm">{message.content}</p>
                  </Card>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-background">
        <div className="max-w-full p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-3">
            <Input
              placeholder="Nhập tin nhắn của bạn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1 rounded-lg border-input bg-muted/50 focus-visible:bg-background"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="h-10 w-10 sm:h-full"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {newMessage.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {newMessage.length} ký tự
            </p>
          )}
        </div>
      </div>
    </>
  );
}

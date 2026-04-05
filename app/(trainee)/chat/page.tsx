'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConversationStore } from '@/stores/conservation/conservation-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export default function ChatListPage() {
  const router = useRouter();
  const { list: conversations, listLoading, fetchMyConversations } = useConversationStore();

  useEffect(() => {
    fetchMyConversations();
  }, []);

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Tin nhắn
          </h1>
          <p className="text-muted-foreground mt-1">
            Trao đổi với giảng viên và học viên trong khóa học
          </p>
        </div>

        {listLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Bạn chưa tham gia cuộc trò chuyện nào.
              <br />
              Mua khóa học để bắt đầu trao đổi với giảng viên!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/chat/${conv.id}`)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={conv.course?.thumbnail} />
                    <AvatarFallback>
                      {conv.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-1">{conv.name}</p>
                      {conv.lastMessage && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatRelativeTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {conv.course?.name} · {conv._count?.members || 0} thành viên
                    </p>
                    {conv.lastMessage ? (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        <span className="font-medium text-foreground">
                          {conv.lastMessage.sender.fullName}:
                        </span>{' '}
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">Chưa có tin nhắn</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

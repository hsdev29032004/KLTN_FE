'use client';

import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Moon, Sun, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth/auth-store';
import { useCartStore } from '@/stores/cart/cart-store';
import { useConversationStore } from '@/stores/conservation/conservation-store';
import { useChatSocket } from '@/hooks/use-chat-socket';

export function LandingHeader() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const { list: conversations, fetchMyConversations } = useConversationStore();
  useChatSocket();

  const user = authStore.user;

  const isTrainee = user?.role?.name === 'User';

  // Initialize cart
  useEffect(() => {
    if (user) {
      if (isTrainee) {
        cartStore.fetchCart();
      }
      fetchMyConversations();
    } else {
      cartStore.initLocalCart();
    }
  }, [user]);

  const cartCount = isTrainee ? (cartStore.count || 0) : !user ? (cartStore.localCartIds?.length || 0) : 0;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await authStore.logout();
      cartStore.initLocalCart();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-2 md:px-4 lg:px-8">
      <div className="flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">ONLEARN</span>
        </Link>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-9"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Cart - visible to guests and trainees only */}
          {(!user || isTrainee) && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                <span className="sr-only">Giỏ hàng</span>
              </Link>
            </Button>
          )}

          {user ? (
            <>
              {/* Messages */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {conversations && conversations.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                        {conversations.length > 9 ? '9+' : conversations.length}
                      </span>
                    )}
                    <span className="sr-only">Tin nhắn</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Tin nhắn</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!conversations || conversations.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Chưa có cuộc trò chuyện nào
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {conversations.slice(0, 10).map((conv) => (
                        <DropdownMenuItem
                          key={conv.id}
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() => router.push(`/chat/${conv.id}`)}
                        >
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={conv.course?.thumbnail} />
                            <AvatarFallback>
                              {conv.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{conv.name}</p>
                            {conv.lastMessage ? (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {conv.lastMessage.sender.fullName}: {conv.lastMessage.content}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Chưa có tin nhắn</p>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-primary font-medium"
                    onClick={() => router.push('/chat')}
                  >
                    Xem tất cả tin nhắn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || '/avatars/01.png'}
                        alt={user.fullName}
                      />
                      <AvatarFallback>
                        {user.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.fullName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-courses">Khóa học của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/transactions/history">Lịch sử mua hàng</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Cài đặt tài khoản</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/conversation.type';
import { useConversationStore } from '@/stores/conservation/conservation-store';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

let globalSocket: Socket | null = null;

export function useChatSocket() {
  const { addNewMessage } = useConversationStore();
  const joinedRooms = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (globalSocket?.connected) return;

    globalSocket = io(`${SOCKET_URL}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    globalSocket.on('connected', (data: { userId: string; message: string }) => {
      console.log('[Chat Socket] Connected:', data.message);
    });

    globalSocket.on('error', (data: { message: string }) => {
      console.error('[Chat Socket] Error:', data.message);
    });

    return () => {
      // Don't disconnect on unmount — keep alive across page navigations
    };
  }, []);

  // Listen for new messages and dispatch to redux
  useEffect(() => {
    if (!globalSocket) return;

    const handler = (message: Message) => {
      addNewMessage(message);
    };

    globalSocket.on('newMessage', handler);
    return () => {
      globalSocket?.off('newMessage', handler);
    };
  }, []);

  const joinRoom = useCallback((conversationId: string) => {
    if (!globalSocket || joinedRooms.current.has(conversationId)) return;
    globalSocket.emit('joinRoom', { conversationId });
    joinedRooms.current.add(conversationId);
  }, []);

  const leaveRoom = useCallback((conversationId: string) => {
    if (!globalSocket || !joinedRooms.current.has(conversationId)) return;
    globalSocket.emit('leaveRoom', { conversationId });
    joinedRooms.current.delete(conversationId);
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (!globalSocket) return;
      globalSocket.emit('sendMessage', { conversationId, content });
    },
    [],
  );

  const disconnect = useCallback(() => {
    if (globalSocket) {
      joinedRooms.current.clear();
      globalSocket.disconnect();
      globalSocket = null;
    }
  }, []);

  return {
    socket: globalSocket,
    joinRoom,
    leaveRoom,
    sendMessage,
    disconnect,
    isConnected: globalSocket?.connected ?? false,
  };
}

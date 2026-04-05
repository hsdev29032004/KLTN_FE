import { useSelector } from 'react-redux';
import {
  fetchMyConversations,
  fetchConversationDetail,
  fetchOlderMessages,
  sendMessageREST,
  addNewMessage,
  clearCurrent,
} from './conservation-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import type { Message } from '@/types/conversation.type';

export function useConversationStore() {
  const dispatch = useAppDispatch();
  const list = useSelector((state: RootState) => state.conversation?.list);
  const listLoading = useSelector((state: RootState) => state.conversation?.listLoading);
  const current = useSelector((state: RootState) => state.conversation?.current);
  const currentLoading = useSelector((state: RootState) => state.conversation?.currentLoading);
  const messageMeta = useSelector((state: RootState) => state.conversation?.messageMeta);
  const error = useSelector((state: RootState) => state.conversation?.error);

  return {
    list,
    listLoading,
    current,
    currentLoading,
    messageMeta,
    error,
    fetchMyConversations: () => dispatch(fetchMyConversations()),
    fetchConversationDetail: (conversationId: string, page?: number, limit?: number) =>
      dispatch(fetchConversationDetail({ conversationId, page, limit })),
    fetchOlderMessages: (conversationId: string, page: number, limit?: number) =>
      dispatch(fetchOlderMessages({ conversationId, page, limit })),
    sendMessageREST: (conversationId: string, content: string) =>
      dispatch(sendMessageREST({ conversationId, content })),
    addNewMessage: (message: Message) => dispatch(addNewMessage(message)),
    clearCurrent: () => dispatch(clearCurrent()),
  };
}

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { conversationRequest } from './conservation-request';
import {
  Conversation,
  ConversationDetail,
  Message,
} from '@/types/conversation.type';

interface ConversationState {
  list: Conversation[];
  listLoading: boolean;
  current: ConversationDetail | null;
  currentLoading: boolean;
  messageMeta: { total: number; page: number; limit: number; totalPages: number } | null;
  error: string | null;
}

const initialState: ConversationState = {
  list: [],
  listLoading: false,
  current: null,
  currentLoading: false,
  messageMeta: null,
  error: null,
};

export const fetchMyConversations = createAsyncThunk(
  'conversation/fetchMyConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await conversationRequest.getMyConversations();
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi tải danh sách hội thoại');
    }
  },
);

export const fetchConversationDetail = createAsyncThunk(
  'conversation/fetchConversationDetail',
  async (
    { conversationId, page, limit }: { conversationId: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await conversationRequest.getConversationDetails(conversationId, page, limit);
      return { data: res.data, meta: res.meta };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi tải chi tiết hội thoại');
    }
  },
);

export const fetchOlderMessages = createAsyncThunk(
  'conversation/fetchOlderMessages',
  async (
    { conversationId, page, limit }: { conversationId: string; page: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await conversationRequest.getConversationDetails(conversationId, page, limit);
      return { messages: res.data.messages, meta: res.meta };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi tải tin nhắn cũ');
    }
  },
);

export const sendMessageREST = createAsyncThunk(
  'conversation/sendMessageREST',
  async (
    { conversationId, content }: { conversationId: string; content: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await conversationRequest.sendMessage(conversationId, content);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi gửi tin nhắn');
    }
  },
);

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    addNewMessage: (state, action: PayloadAction<Message>) => {
      if (state.current && action.payload.conversationId === state.current.id) {
        const exists = state.current.messages.some((m) => m.id === action.payload.id);
        if (!exists) {
          state.current.messages.push(action.payload);
        }
      }
      // Update lastMessage in list
      const idx = state.list.findIndex(
        (c) => c.id === action.payload.conversationId,
      );
      if (idx !== -1) {
        state.list[idx].lastMessage = action.payload;
        state.list[idx].updatedAt = action.payload.createdAt;
        // Move to top
        const [conv] = state.list.splice(idx, 1);
        state.list.unshift(conv);
      }
    },
    clearCurrent: (state) => {
      state.current = null;
      state.messageMeta = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyConversations.pending, (state) => {
        state.listLoading = true;
      })
      .addCase(fetchMyConversations.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchMyConversations.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConversationDetail.pending, (state) => {
        state.currentLoading = true;
      })
      .addCase(fetchConversationDetail.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload.data;
        state.messageMeta = action.payload.meta;
      })
      .addCase(fetchConversationDetail.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOlderMessages.fulfilled, (state, action) => {
        if (state.current) {
          state.current.messages = [...action.payload.messages, ...state.current.messages];
          state.messageMeta = action.payload.meta;
        }
      })
      .addCase(sendMessageREST.fulfilled, (state, action) => {
        if (state.current) {
          const exists = state.current.messages.some((m) => m.id === action.payload.id);
          if (!exists) {
            state.current.messages.push(action.payload);
          }
        }
      });
  },
});

export const { addNewMessage, clearCurrent } = conversationSlice.actions;
export default conversationSlice.reducer;

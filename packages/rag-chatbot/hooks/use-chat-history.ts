import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  visibility: "public" | "private";
}

export interface ChatHistoryResponse {
  chats: Chat[];
  hasMore: boolean;
}

// Query Key
export const chatHistoryKeys = {
  all: ["chat-history"] as const,
  lists: () => [...chatHistoryKeys.all, "list"] as const,
  list: (filters: { limit?: number }) =>
    [...chatHistoryKeys.lists(), filters] as const,
  details: () => [...chatHistoryKeys.all, "detail"] as const,
  detail: (id: string) => [...chatHistoryKeys.details(), id] as const,
};

/**
 * 获取聊天历史记录
 */
export function useChatHistory(limit: number = 100) {
  return useQuery({
    queryKey: chatHistoryKeys.list({ limit }),
    queryFn: async (): Promise<ChatHistoryResponse> => {
      const response = await fetch(`/api/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 分钟
  });
}

/**
 * 删除聊天记录
 */
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch(`/api/history?id=${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      return response.json();
    },
    onSuccess: () => {
      // 删除成功后，立即刷新聊天历史列表
      queryClient.invalidateQueries({
        queryKey: chatHistoryKeys.lists(),
      });
    },
  });
}

/**
 * 手动刷新聊天历史
 */
export function useRefreshChatHistory() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: chatHistoryKeys.lists(),
    });
  };
}
